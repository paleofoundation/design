import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { crawlFullPage } from '@/lib/firecrawl/ingest';
import { loadDesignProfile, buildFullContextPrompt } from './shared/load-profile';
import { DESIGN_KNOWLEDGE_PROMPT } from './shared/design-knowledge';
import { getKnowledgeContext } from '@/lib/knowledge/retrieval';

export function registerRedesignPageTool(server: McpServer): void {
  server.tool(
    'redesign-page',
    'Crawl a full homepage, analyze its design foundations, and generate a surgical CSS-only redesign. Preserves all content, images, and layout — only improves typography, spacing, hierarchy, and contrast based on design theory.',
    {
      url: z.string().describe('The homepage URL to redesign'),
      projectName: z.string().optional().describe('Load a saved design profile for additional context'),
      preserveColors: z.boolean().optional().default(true).describe('Keep the brand color palette, only fix contrast issues'),
      focusAreas: z.array(z.enum(['typography', 'spacing', 'hierarchy', 'contrast', 'whitespace'])).optional().describe('Specific areas to focus on. Defaults to all.'),
    },
    async ({ url, projectName, preserveColors, focusAreas }) => {
      const crawl = await crawlFullPage(url);

      if (!crawl.success || !crawl.html) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ error: `Failed to crawl ${url}: ${crawl.error || 'No HTML returned'}` }),
          }],
        };
      }

      let profileContext = '';
      if (projectName) {
        const profile = await loadDesignProfile(projectName);
        if (profile) {
          profileContext = await buildFullContextPrompt(profile, 'redesigning an existing website');
        }
      }

      const knowledgeContext = await getKnowledgeContext(undefined, 'typography hierarchy spacing whitespace font pairing weight contrast accessibility');

      const htmlTruncated = crawl.html.substring(0, 60000);

      const brandingSummary = crawl.branding
        ? `CURRENT BRAND ANALYSIS (from Firecrawl):
Colors: primary=${crawl.branding.colors.primary}, secondary=${crawl.branding.colors.secondary}, accent=${crawl.branding.colors.accent}, bg=${crawl.branding.colors.background}, text=${crawl.branding.colors.textPrimary}
Fonts: heading="${crawl.branding.typography.fontFamilies.heading}", body="${crawl.branding.typography.fontFamilies.primary}"
Font sizes: h1=${crawl.branding.typography.fontSizes.h1}, h2=${crawl.branding.typography.fontSizes.h2}, body=${crawl.branding.typography.fontSizes.body}
Weights: regular=${crawl.branding.typography.fontWeights.regular}, medium=${crawl.branding.typography.fontWeights.medium}, bold=${crawl.branding.typography.fontWeights.bold}
Border radius: ${crawl.branding.spacing.borderRadius}
Personality: ${crawl.branding.personality?.tone || 'unknown'} / ${crawl.branding.personality?.energy || 'unknown'}`
        : 'No branding data extracted.';

      const focusInstruction = focusAreas?.length
        ? `Focus ONLY on these areas: ${focusAreas.join(', ')}.`
        : 'Address all areas: typography, spacing, hierarchy, contrast, and whitespace.';

      const colorInstruction = preserveColors
        ? 'PRESERVE the existing brand colors. Do NOT change hues. Only fix contrast ratios that fail WCAG AA (4.5:1 body, 3:1 large text). Adjust opacity or lightness if needed, but keep the brand palette recognizable.'
        : 'You may suggest refined colors if the current palette has issues, but explain the rationale.';

      const systemPrompt = `You are a senior design consultant performing a surgical redesign of an existing website.

YOUR CORE RULE: Do NOT change the HTML structure, content, images, or layout. You are ONLY generating a CSS override stylesheet that makes the existing page look better by fixing foundational design issues.

Think of yourself as a designer who has been hired to take an existing site and make it "feel" more professional — same brand, same content, just better typography, spacing, and visual hierarchy.

${DESIGN_KNOWLEDGE_PROMPT}

${knowledgeContext || ''}

${profileContext ? `\nADDITIONAL DESIGN PROFILE CONTEXT:\n${profileContext}` : ''}

${brandingSummary}

${focusInstruction}

${colorInstruction}

ANALYSIS PROCESS:
1. Identify every semantic section (nav, hero, product grid, testimonials, CTA, footer, etc.)
2. For each section, note what fonts, sizes, weights, spacing, and colors are currently used
3. Identify specific violations of design principles (bad hierarchy, inconsistent spacing, poor font pairing, weak contrast)
4. Generate a COMPLETE replacement CSS stylesheet that fixes all issues
5. Recommend specific Google Fonts replacements with weights and rationale

CSS STYLESHEET REQUIREMENTS:
- Use CSS selectors that match the existing HTML structure
- Override font-family, font-size, font-weight, line-height, letter-spacing, padding, margin
- Use an 8px spacing grid (multiples of 0.5rem)
- Set proper typographic scale (1.25 or 1.333 ratio)
- Ensure heading weights decrease as size decreases (h1 bold, h2 semibold, h3 medium)
- Body text: 16-18px, line-height 1.5-1.7, max-width ~65ch for readability
- Add subtle transitions for hover states
- Include @import for Google Fonts at the top

RESPOND WITH VALID JSON matching this exact structure:
{
  "critique": {
    "summary": "2-3 sentence overview of the main design issues",
    "issues": [
      { "section": "string", "problem": "string", "severity": "high|medium|low", "principle": "which design principle this violates" }
    ]
  },
  "recommendations": {
    "typography": {
      "heading": { "family": "Google Font name", "weights": [400, 700], "rationale": "why this font" },
      "body": { "family": "Google Font name", "weights": [400, 500, 600], "rationale": "why this font" }
    },
    "spacingBaseUnit": "8px",
    "keyChanges": ["concise list of the most impactful changes"]
  },
  "redesignedCss": "the full CSS stylesheet as a single string with @import at top",
  "googleFontsLink": "<link> tag for the recommended fonts",
  "sectionBreakdown": [
    { "section": "Section Name", "changes": ["what was changed and why"] }
  ]
}`;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          temperature: 0.3,
          max_tokens: 16000,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Redesign this homepage: ${url}

Here is the full HTML of the page:

${htmlTruncated}

Generate the surgical CSS redesign now.`,
            },
          ],
        });

        const raw = response.choices[0]?.message?.content || '{}';
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = { error: 'Failed to parse AI response', raw: raw.substring(0, 500) };
        }

        const output = {
          url,
          preserveColors,
          focusAreas: focusAreas || ['typography', 'spacing', 'hierarchy', 'contrast', 'whitespace'],
          originalImages: crawl.images.slice(0, 50),
          fullPageScreenshot: crawl.screenshot ? `data:image/png;base64,${crawl.screenshot}` : null,
          currentBranding: crawl.branding ? {
            colors: crawl.branding.colors,
            fonts: crawl.branding.typography.fontFamilies,
            fontSizes: crawl.branding.typography.fontSizes,
          } : null,
          ...parsed,
        };

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(output, null, 2),
          }],
        };
      } catch (err) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              error: err instanceof Error ? err.message : 'Redesign analysis failed',
              url,
            }),
          }],
        };
      }
    }
  );
}
