import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import type { TypographyPairing } from '@/types/design';

// =============================================
// TYPES
// =============================================

export interface PairTypographyInput {
  headingFont: string;
  mood: string;
  context: string;
  bodyFontPreference?:
    'serif' | 'sans-serif' | 'match-heading';
  scaleRatio?:
    'minor-third' | 'major-third'
    | 'perfect-fourth' | 'golden-ratio';
}

export interface PairTypographyResult {
  pairings: TypographyPairing[];
  typeScaleCss: string;
  googleFontsImport: string;
  tailwindConfig: object;
}

// =============================================
// TYPE SCALE GENERATION
// =============================================

const SCALE_RATIOS: Record<string, number> = {
  'minor-third': 1.2,
  'major-third': 1.25,
  'perfect-fourth': 1.333,
  'golden-ratio': 1.618,
};

function generateTypeScale(
  baseSize: number,
  ratio: number
): TypographyPairing['sizeScale'] {
  return {
    caption: `${Math.round(baseSize / ratio)}px`,
    small: `${Math.round(
      baseSize / Math.sqrt(ratio)
    )}px`,
    body: `${baseSize}px`,
    h4: `${Math.round(baseSize * ratio)}px`,
    h3: `${Math.round(
      baseSize * ratio * ratio
    )}px`,
    h2: `${Math.round(
      baseSize * ratio * ratio * ratio
    )}px`,
    h1: `${Math.round(
      baseSize * ratio * ratio * ratio * ratio
    )}px`,
  };
}

// =============================================
// CORE PAIRING FUNCTION
// =============================================

export async function pairTypography(
  input: PairTypographyInput
): Promise<PairTypographyResult> {
  const {
    headingFont,
    mood,
    context,
    bodyFontPreference,
    scaleRatio = 'major-third',
  } = input;

  const ratio = SCALE_RATIOS[scaleRatio] || 1.25;

  const prompt = `You are a world-class typographer. Given these inputs, suggest 3 optimal font pairings:

Heading font: "${headingFont}"
Mood: "${mood}"
Context/website type: "${context}"
${bodyFontPreference ? `Body font preference: ${bodyFontPreference}` : ''}
Type scale ratio: ${scaleRatio} (${ratio})

For each pairing, return ONLY valid JSON (no markdown):
{
  "pairings": [
    {
      "heading": {
        "fontFamily": "Heading Font Name",
        "weight": 700,
        "letterSpacing": "-0.02em",
        "textTransform": "none"
      },
      "body": {
        "fontFamily": "Body Font Name",
        "weight": 400,
        "letterSpacing": "0em",
        "textTransform": "none"
      },
      "mood": "${mood}",
      "reasoning": "2-3 sentences on why this pairing works, covering contrast, readability, and visual harmony."
    }
  ]
}

Rules:
- All fonts must be on Google Fonts
- First pairing = best match
- Each pairing uses a different body font
- Consider x-height compatibility and contrast
- Factor in the website context for readability`;

  const response =
    await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

  const rawResult = JSON.parse(
    response.choices[0].message.content
      || '{"pairings":[]}'
  );

  if (!rawResult.pairings?.length) {
    throw new Error(
      'OpenAI response missing typography pairings'
    );
  }

  const sizeScale = generateTypeScale(16, ratio);

  const pairings: TypographyPairing[] =
    (rawResult.pairings as Record<string, any>[]).map((p) => ({
      heading: {
        fontFamily: p.heading.fontFamily,
        weight: p.heading.weight,
        letterSpacing:
          p.heading.letterSpacing || '-0.02em',
      },
      body: {
        fontFamily: p.body.fontFamily,
        weight: p.body.weight,
        letterSpacing:
          p.body.letterSpacing || '0em',
      },
      sizeScale,
      mood: p.mood || mood,
      reasoning: p.reasoning || '',
      cssVariables: {
        '--font-heading':
          `'${p.heading.fontFamily}', sans-serif`,
        '--font-body':
          `'${p.body.fontFamily}', sans-serif`,
        '--font-heading-weight':
          String(p.heading.weight),
        '--font-body-weight':
          String(p.body.weight),
        '--heading-letter-spacing':
          p.heading.letterSpacing || '-0.02em',
        '--body-letter-spacing':
          p.body.letterSpacing || '0em',
        ...Object.fromEntries(
          Object.entries(sizeScale).map(
            ([k, v]) => [`--font-size-${k}`, v]
          )
        ),
      },
    }));

  // --- Google Fonts import ---
  const allFonts = new Set<string>();
  pairings.forEach((p) => {
    allFonts.add(p.heading.fontFamily);
    allFonts.add(p.body.fontFamily);
  });
  const fontParams = Array.from(allFonts)
    .map(
      (f) =>
        `family=${f.replace(/\s+/g, '+')}` +
        `:wght@300;400;500;600;700`
    )
    .join('&');
  const googleFontsImport =
    `@import url('https://fonts.googleapis.com/css2?${fontParams}&display=swap');`;

  // --- Full CSS for recommended pairing ---
  const primary = pairings[0];
  const typeScaleCss = [
    googleFontsImport,
    '',
    ':root {',
    ...Object.entries(primary.cssVariables).map(
      ([k, v]) => `  ${k}: ${v};`
    ),
    '}',
    '',
    'h1, .h1 {',
    '  font-family: var(--font-heading);',
    '  font-weight: var(--font-heading-weight);',
    '  font-size: var(--font-size-h1);',
    '  letter-spacing: var(--heading-letter-spacing);',
    '}',
    'h2, .h2 {',
    '  font-family: var(--font-heading);',
    '  font-weight: var(--font-heading-weight);',
    '  font-size: var(--font-size-h2);',
    '  letter-spacing: var(--heading-letter-spacing);',
    '}',
    'h3, .h3 {',
    '  font-family: var(--font-heading);',
    '  font-weight: 600;',
    '  font-size: var(--font-size-h3);',
    '}',
    'h4, .h4 {',
    '  font-family: var(--font-heading);',
    '  font-weight: 600;',
    '  font-size: var(--font-size-h4);',
    '}',
    'body, .body {',
    '  font-family: var(--font-body);',
    '  font-weight: var(--font-body-weight);',
    '  font-size: var(--font-size-body);',
    '  letter-spacing: var(--body-letter-spacing);',
    '  line-height: 1.6;',
    '}',
    '.text-small { font-size: var(--font-size-small); }',
    '.text-caption { font-size: var(--font-size-caption); }',
  ].join('\n');

  // --- Tailwind config ---
  const tailwindConfig = {
    theme: {
      extend: {
        fontFamily: {
          heading: [
            primary.heading.fontFamily,
            'sans-serif',
          ],
          body: [
            primary.body.fontFamily,
            'sans-serif',
          ],
        },
        fontSize: sizeScale,
      },
    },
  };

  return {
    pairings,
    typeScaleCss,
    googleFontsImport,
    tailwindConfig,
  };
}

// =============================================
// MCP TOOL REGISTRATION
// =============================================

export function registerPairTypographyTool(server: McpServer): void {
  server.tool(
    'pair-typography',
    'Generate harmonious heading + body typography pairings with a modular type scale, production-ready CSS, Google Fonts import, and Tailwind config.',
    {
      headingFont: z
        .string()
        .describe('The heading font to pair a body font against (e.g. "Playfair Display", "Space Grotesk")'),
      mood: z
        .string()
        .describe('Desired mood or aesthetic (e.g. "elegant editorial", "technical modern", "playful startup")'),
      context: z
        .string()
        .describe('Website type or project context (e.g. "luxury fashion brand", "developer documentation")'),
      bodyFontPreference: z
        .enum(['serif', 'sans-serif', 'match-heading'])
        .optional()
        .describe('Preferred body font style category'),
      scaleRatio: z
        .enum(['minor-third', 'major-third', 'perfect-fourth', 'golden-ratio'])
        .optional()
        .default('major-third')
        .describe('Modular type scale ratio (minor-third=1.2, major-third=1.25, perfect-fourth=1.333, golden-ratio=1.618)'),
    },
    async ({ headingFont, mood, context, bodyFontPreference, scaleRatio }) => {
      try {
        const result = await pairTypography({
          headingFont,
          mood,
          context,
          bodyFontPreference,
          scaleRatio,
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown typography pairing error';
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: message }, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );
}
