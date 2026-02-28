import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { buildFullContextPrompt, loadDesignProfile, profileToContextPrompt } from './shared/load-profile';

const SCALE_RATIOS: Record<string, number> = {
  'minor-third': 1.2,
  'major-third': 1.25,
  'perfect-fourth': 1.333,
  'golden-ratio': 1.618,
};

interface TypeScale {
  xs: string; sm: string; base: string; lg: string;
  xl: string; '2xl': string; '3xl': string; '4xl': string; '5xl': string;
}

function buildTypeScale(base: number, ratio: number): TypeScale {
  return {
    xs: `${(base / (ratio * ratio)).toFixed(3)}rem`,
    sm: `${(base / ratio).toFixed(3)}rem`,
    base: `${base.toFixed(3)}rem`,
    lg: `${(base * ratio).toFixed(3)}rem`,
    xl: `${(base * ratio * ratio).toFixed(3)}rem`,
    '2xl': `${(base * Math.pow(ratio, 3)).toFixed(3)}rem`,
    '3xl': `${(base * Math.pow(ratio, 4)).toFixed(3)}rem`,
    '4xl': `${(base * Math.pow(ratio, 5)).toFixed(3)}rem`,
    '5xl': `${(base * Math.pow(ratio, 6)).toFixed(3)}rem`,
  };
}

const LINE_HEIGHTS: Record<string, string> = {
  xs: '1.4', sm: '1.5', base: '1.6', lg: '1.5',
  xl: '1.4', '2xl': '1.3', '3xl': '1.2', '4xl': '1.15', '5xl': '1.1',
};

const LETTER_SPACING: Record<string, string> = {
  xs: '0.02em', sm: '0.01em', base: '0em', lg: '-0.01em',
  xl: '-0.015em', '2xl': '-0.02em', '3xl': '-0.025em', '4xl': '-0.03em', '5xl': '-0.035em',
};

export async function pairTypography(input: {
  headingFont: string;
  mood: string;
  context: string;
  bodyFontPreference?: string;
  scaleRatio?: string;
  projectName?: string;
}) {
  const { headingFont, mood, context, bodyFontPreference, scaleRatio = 'major-third', projectName } = input;
  const ratio = SCALE_RATIOS[scaleRatio] || 1.25;
  const scale = buildTypeScale(1, ratio);

  const profile = await loadDesignProfile(projectName);
  const profileContext = profile ? await buildFullContextPrompt(profile, 'pairing typography fonts') : '';

  const prompt = `You are a world-class typographer. Suggest 3 optimal font pairings:

Heading font: "${headingFont}"
Mood: "${mood}"
Context: "${context}"
${bodyFontPreference ? `Body preference: ${bodyFontPreference}` : ''}

${profileContext ? `${profileContext}\n\nIMPORTANT: Your pairings MUST be consistent with the design system above. Use fonts that work with the existing color palette and visual style.` : ''}

Return ONLY valid JSON:
{
  "pairings": [
    {
      "heading": { "fontFamily": "Heading Font", "weight": 700, "letterSpacing": "-0.02em" },
      "body": { "fontFamily": "Body Font", "weight": 400, "letterSpacing": "0em" },
      "reasoning": "Why this pairing works."
    }
  ]
}

Rules: All fonts on Google Fonts. First = best match. Each uses different body font.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const raw = JSON.parse(response.choices[0].message.content || '{"pairings":[]}');
  if (!raw.pairings?.length) throw new Error('No typography pairings returned');

  const pairings = (raw.pairings as Array<Record<string, Record<string, unknown>>>).map((p) => ({
    heading: { fontFamily: p.heading.fontFamily as string, weight: p.heading.weight as number, letterSpacing: (p.heading.letterSpacing as string) || '-0.02em' },
    body: { fontFamily: p.body.fontFamily as string, weight: p.body.weight as number, letterSpacing: (p.body.letterSpacing as string) || '0em' },
    mood,
    reasoning: (p as Record<string, unknown>).reasoning as string || '',
  }));

  const primary = pairings[0];

  const allFonts = new Set<string>();
  pairings.forEach((p) => { allFonts.add(p.heading.fontFamily); allFonts.add(p.body.fontFamily); });
  const fontParams = Array.from(allFonts).map((f) => `family=${f.replace(/\s+/g, '+')}:wght@300;400;500;600;700`).join('&');
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;

  const cssScale = [
    `@import url('${googleFontsUrl}');`,
    '',
    ':root {',
    `  --font-heading: '${primary.heading.fontFamily}', sans-serif;`,
    `  --font-body: '${primary.body.fontFamily}', sans-serif;`,
    '',
    ...Object.entries(scale).map(([k, v]) =>
      `  --text-${k}: ${v};\n  --text-${k}-line-height: ${LINE_HEIGHTS[k]};\n  --text-${k}-letter-spacing: ${LETTER_SPACING[k]};`
    ),
    '}',
    '',
    'h1, .h1 { font-family: var(--font-heading); font-size: var(--text-5xl); font-weight: 700; line-height: var(--text-5xl-line-height); letter-spacing: var(--text-5xl-letter-spacing); }',
    'h2, .h2 { font-family: var(--font-heading); font-size: var(--text-4xl); font-weight: 700; line-height: var(--text-4xl-line-height); letter-spacing: var(--text-4xl-letter-spacing); }',
    'h3, .h3 { font-family: var(--font-heading); font-size: var(--text-3xl); font-weight: 600; line-height: var(--text-3xl-line-height); letter-spacing: var(--text-3xl-letter-spacing); }',
    'h4, .h4 { font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 600; line-height: var(--text-2xl-line-height); letter-spacing: var(--text-2xl-letter-spacing); }',
    'body, p { font-family: var(--font-body); font-size: var(--text-base); font-weight: 400; line-height: var(--text-base-line-height); letter-spacing: var(--text-base-letter-spacing); }',
    '.text-sm { font-family: var(--font-body); font-size: var(--text-sm); line-height: var(--text-sm-line-height); }',
    '.text-xs { font-family: var(--font-body); font-size: var(--text-xs); line-height: var(--text-xs-line-height); }',
  ].join('\n');

  const tailwindConfig = `// Add to tailwind.config.ts → theme.extend
fontFamily: {
  heading: ['${primary.heading.fontFamily}', 'sans-serif'],
  body: ['${primary.body.fontFamily}', 'sans-serif'],
},
fontSize: {
${Object.entries(scale).map(([k, v]) => `  '${k}': ['${v}', { lineHeight: '${LINE_HEIGHTS[k]}', letterSpacing: '${LETTER_SPACING[k]}' }],`).join('\n')}
}`;

  const sampleComponent = `import React from 'react';

export function TypographySample() {
  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-5xl)", fontWeight: 700, lineHeight: "var(--text-5xl-line-height)", letterSpacing: "var(--text-5xl-letter-spacing)" }}>
        ${primary.heading.fontFamily}
      </h1>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-3xl)", fontWeight: 600, lineHeight: "var(--text-3xl-line-height)", letterSpacing: "var(--text-3xl-letter-spacing)", color: "#6b7280" }}>
        paired with ${primary.body.fontFamily}
      </h2>
      <p style={{ fontSize: "var(--text-base)", lineHeight: "var(--text-base-line-height)", maxWidth: "65ch", marginTop: "1.5rem" }}>
        The quick brown fox jumps over the lazy dog.
      </p>
    </div>
  );
}`;

  return {
    pairings,
    googleFontsImport: `@import url('${googleFontsUrl}');`,
    designProfileUsed: profile?.project_name || null,
    codeArtifacts: { cssScale, tailwindConfig, sampleComponent },
  };
}

export function registerPairTypographyTool(server: McpServer): void {
  server.tool(
    'pair-typography',
    'Generate harmonious heading + body typography pairings. When a project name is provided, constrains pairings to complement the stored design system.',
    {
      headingFont: z.string().describe('The heading font to pair against (e.g. "Playfair Display")'),
      mood: z.string().describe('Desired mood (e.g. "elegant editorial", "technical modern")'),
      context: z.string().describe('Website type (e.g. "luxury fashion brand", "developer docs")'),
      bodyFontPreference: z.enum(['serif', 'sans-serif', 'match-heading']).optional().describe('Preferred body font style'),
      scaleRatio: z.enum(['minor-third', 'major-third', 'perfect-fourth', 'golden-ratio']).optional().default('major-third').describe('Modular type scale ratio'),
      projectName: z.string().optional().describe('Project name to load design profile for consistency'),
    },
    async ({ headingFont, mood, context, bodyFontPreference, scaleRatio, projectName }) => {
      try {
        const result = await pairTypography({ headingFont, mood, context, bodyFontPreference, scaleRatio, projectName });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown typography pairing error';
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }], isError: true };
      }
    }
  );
}
