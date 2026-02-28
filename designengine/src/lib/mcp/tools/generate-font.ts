import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { loadDesignProfile, profileToContextPrompt } from './shared/load-profile';

export interface GenerateFontInput {
  description: string;
  style?: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  weight?: 'light' | 'regular' | 'medium' | 'bold' | 'black';
  useCase?: 'heading' | 'body' | 'code' | 'display' | 'ui';
  projectName?: string;
}

export async function generateFont(input: GenerateFontInput) {
  const { description, style, weight, useCase, projectName } = input;

  const profile = await loadDesignProfile(projectName);
  const profileContext = profile ? profileToContextPrompt(profile) : '';

  const prompt = `You are an expert typographer. Recommend a Google Font matching this description:

Description: "${description}"
${style ? `Style: ${style}` : ''}
${weight ? `Weight: ${weight}` : ''}
${useCase ? `Use case: ${useCase}` : ''}

${profileContext ? `${profileContext}\n\nIMPORTANT: Your recommendation MUST complement the existing design system above. The font should work harmoniously with the existing typography and visual style. Do NOT recommend a font that clashes.` : ''}

Return ONLY valid JSON:
{
  "primaryFont": "Font Name",
  "fallbackStack": "'Font Name', Arial, sans-serif",
  "googleFontsUrl": "https://fonts.googleapis.com/css2?family=Font+Name:wght@300;400;500;600;700&display=swap",
  "weights": [300, 400, 500, 600, 700],
  "category": "sans-serif",
  "alternatives": [
    { "font": "Alt 1", "reason": "Why", "googleFontsUrl": "..." },
    { "font": "Alt 2", "reason": "Why", "googleFontsUrl": "..." }
  ],
  "designRationale": "Why this font matches."
}

Only recommend fonts on Google Fonts. Include all recommended weights in the URL.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const raw = JSON.parse(response.choices[0].message.content || '{}');
  if (!raw.primaryFont) throw new Error('OpenAI response missing font recommendation');

  const font = raw.primaryFont as string;
  const fallback = raw.fallbackStack as string;
  const url = raw.googleFontsUrl as string;
  const weights = (raw.weights || [400, 700]) as number[];
  const category = (raw.category || 'sans-serif') as string;
  const fontSlug = font.toLowerCase().replace(/\s+/g, '-');

  const htmlLink = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${url}" rel="stylesheet">`;

  const cssVariables = `:root {
  --font-${fontSlug}: ${fallback};
  --font-${fontSlug}-family: '${font}';
  --font-${fontSlug}-fallback: ${category === 'serif' ? 'Georgia, "Times New Roman", serif' : category === 'monospace' ? '"Courier New", Courier, monospace' : 'system-ui, -apple-system, sans-serif'};
}`;

  const tailwindConfig = `// Add to tailwind.config.ts → theme.extend.fontFamily
fontFamily: {
  '${fontSlug}': ['${font}', ${category === 'serif' ? "'Georgia', 'Times New Roman', serif" : category === 'monospace' ? "'Courier New', 'Courier', monospace" : "'system-ui', '-apple-system', 'sans-serif'"}],
}`;

  const utilityClasses = weights.map((w) =>
    `.font-${fontSlug}-${w} { font-family: ${fallback}; font-weight: ${w}; }`
  ).join('\n');

  const htmlPreview = `<!DOCTYPE html>
<html>
<head>
  ${htmlLink}
  <style>
    body { font-family: ${fallback}; padding: 2rem; }
    h1 { font-weight: 700; font-size: 3rem; margin-bottom: 0.5rem; }
    h2 { font-weight: 500; font-size: 1.5rem; color: #666; margin-bottom: 2rem; }
    p { font-weight: 400; font-size: 1rem; line-height: 1.7; max-width: 65ch; }
    .weights { display: flex; gap: 2rem; margin-top: 2rem; }
    .weight-label { font-size: 0.75rem; color: #999; margin-bottom: 0.25rem; }
  </style>
</head>
<body>
  <h1>${font}</h1>
  <h2>${category} — ${description}</h2>
  <p>The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
  <div class="weights">
${weights.map((w) => `    <div><div class="weight-label">${w}</div><div style="font-weight:${w};font-size:1.25rem;">Aa Bb Cc 123</div></div>`).join('\n')}
  </div>
</body>
</html>`;

  return {
    recommendation: { primaryFont: font, fallbackStack: fallback, googleFontsUrl: url, weights, category },
    alternatives: raw.alternatives || [],
    designRationale: raw.designRationale || '',
    designProfileUsed: profile?.project_name || null,
    codeArtifacts: { htmlLink, cssVariables, tailwindConfig, utilityClasses, htmlPreview },
  };
}

export function registerGenerateFontTool(server: McpServer): void {
  server.tool(
    'generate-font',
    'Generate font recommendations with ready-to-use code artifacts. When a project name is provided, constrains recommendations to complement the stored design system.',
    {
      description: z.string().describe('Description of the project, brand, or design context'),
      style: z.enum(['serif', 'sans-serif', 'monospace', 'display', 'handwriting']).optional().describe('Preferred font style category'),
      weight: z.enum(['light', 'regular', 'medium', 'bold', 'black']).optional().describe('Preferred weight emphasis'),
      useCase: z.enum(['heading', 'body', 'code', 'display', 'ui']).optional().describe('Primary use case for the font'),
      projectName: z.string().optional().describe('Project name to load design profile for consistency'),
    },
    async ({ description, style, weight, useCase, projectName }) => {
      try {
        const result = await generateFont({ description, style, weight, useCase, projectName });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown font generation error';
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }], isError: true };
      }
    }
  );
}
