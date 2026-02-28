import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { ingestDesignFromUrl } from '@/lib/firecrawl/ingest';
import { loadDesignProfile, buildFullContextPrompt } from './shared/load-profile';

const FOCUS_AREAS = [
  'accessibility', 'whitespace', 'hierarchy', 'contrast',
  'responsive', 'animation', 'consistency', 'all',
] as const;

export function registerSuggestImprovementsTool(server: McpServer): void {
  server.tool(
    'suggest-improvements',
    'Analyze a URL or component code and suggest specific design improvements with scores, fixes, and corrected code. Covers accessibility, visual hierarchy, whitespace, contrast, and responsiveness.',
    {
      url: z.string().url().optional().describe('URL to analyze'),
      componentCode: z.string().optional().describe('Component code to analyze'),
      projectName: z.string().optional().describe('Project name to load design profile for context'),
      focusAreas: z.array(z.enum(FOCUS_AREAS)).optional().default(['all']).describe('Areas to focus the analysis on'),
    },
    async ({ url, componentCode, projectName, focusAreas }) => {
      try {
        if (!url && !componentCode) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({ error: 'Either url or componentCode is required.' }),
            }],
            isError: true,
          };
        }

        let contentToAnalyze = componentCode || '';

        if (url) {
          const ingestion = await ingestDesignFromUrl(url, { includeHtml: true, includeMarkdown: true });
          if (!ingestion.success) {
            return {
              content: [{
                type: 'text' as const,
                text: JSON.stringify({ error: `Failed to scrape URL: ${ingestion.error}` }),
              }],
              isError: true,
            };
          }
          contentToAnalyze = ingestion.html || ingestion.markdown || '';
        }

        const profile = await loadDesignProfile(projectName);
        const profileContext = profile ? await buildFullContextPrompt(profile, 'suggesting design improvements') : '';

        const focusInstructions = focusAreas.includes('all')
          ? 'Analyze ALL areas: accessibility, whitespace, visual hierarchy, contrast, responsive behavior, animation opportunities, and design consistency.'
          : `Focus on: ${focusAreas.join(', ')}`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert UI/UX design auditor and accessibility consultant.

${profileContext ? `${profileContext}\n\n` : ''}${focusInstructions}

Analyze the provided content and return specific, actionable improvements.

For accessibility: check WCAG contrast ratios (AA requires 4.5:1 for normal text, 3:1 for large text), ARIA attributes, keyboard navigation, screen reader support.
For visual hierarchy: check heading sizes, font weights, color emphasis, spacing between sections.
For whitespace: check padding, margins, breathing room between elements.
For contrast: check color combinations against WCAG standards.
For responsive: check if layout adapts properly to mobile/tablet.
For animation: suggest subtle micro-interactions that improve UX.
For consistency: check if the design matches the design profile tokens (if provided).

Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "improvements": [
    {
      "category": "accessibility|whitespace|hierarchy|contrast|responsive|animation|consistency",
      "severity": "high|medium|low",
      "issue": "specific description of the problem",
      "suggestion": "specific fix",
      "impact": "why this matters",
      "codeFix": "exact CSS/class/code change to make"
    }
  ],
  "quickWins": ["top 3 changes with the biggest visual impact"],
  "correctedCode": "the full corrected code (only if source was component_code)"
}

Order improvements by severity (high first). Be specific — reference exact colors, sizes, elements.`,
            },
            {
              role: 'user',
              content: `Analyze this ${url ? `page (${url})` : 'component'}:\n\n\`\`\`\n${contentToAnalyze.slice(0, 30000)}\n\`\`\``,
            },
          ],
          temperature: 0.3,
          max_tokens: 12000,
          response_format: { type: 'json_object' },
        });

        const raw = response.choices[0].message.content;
        if (!raw) throw new Error('OpenAI returned empty response');
        const result = JSON.parse(raw);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              projectName: profile?.project_name || null,
              sourceUrl: url || null,
              overallScore: result.overallScore ?? 0,
              improvements: result.improvements || [],
              quickWins: result.quickWins || [],
              correctedCode: result.correctedCode || null,
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    }
  );
}
