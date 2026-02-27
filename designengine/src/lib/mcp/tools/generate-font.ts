import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';

// =============================================
// TYPES
// =============================================

export interface GenerateFontInput {
  description: string;
  style?: 'serif' | 'sans-serif' | 'monospace'
    | 'display' | 'handwriting';
  weight?: 'light' | 'regular' | 'medium'
    | 'bold' | 'black';
  useCase?: 'heading' | 'body' | 'code'
    | 'display' | 'ui';
}

export interface GenerateFontResult {
  recommendation: {
    primaryFont: string;
    fallbackStack: string;
    googleFontsUrl: string;
    weights: number[];
    italicAvailable: boolean;
    category: string;
  };
  alternatives: Array<{
    font: string;
    reason: string;
    googleFontsUrl: string;
  }>;
  css: {
    importStatement: string;
    fontFaceDeclarations: string;
    cssVariables: string;
    utilityClasses: string;
  };
  htmlPreview: string;
  designRationale: string;
}

// =============================================
// CORE GENERATION FUNCTION
// =============================================

export async function generateFont(
  input: GenerateFontInput
): Promise<GenerateFontResult> {
  const { description, style, weight, useCase } = input;

  const prompt = `You are an expert typographer and font designer. A user wants a font matching this description:

Description: "${description}"
${style ? `Style preference: ${style}` : ''}
${weight ? `Weight preference: ${weight}` : ''}
${useCase ? `Use case: ${useCase}` : ''}

Respond with ONLY valid JSON (no markdown, no code blocks) matching this exact structure:
{
  "recommendation": {
    "primaryFont": "Font Name",
    "fallbackStack": "'Font Name', Arial, sans-serif",
    "googleFontsUrl": "https://fonts.googleapis.com/css2?family=Font+Name:wght@300;400;500;600;700&display=swap",
    "weights": [300, 400, 500, 600, 700],
    "italicAvailable": true,
    "category": "sans-serif"
  },
  "alternatives": [
    {
      "font": "Alternative Font 1",
      "reason": "Why this is a good alternative",
      "googleFontsUrl": "https://fonts.googleapis.com/css2?family=..."
    },
    {
      "font": "Alternative Font 2",
      "reason": "Why this is a good alternative",
      "googleFontsUrl": "https://fonts.googleapis.com/css2?family=..."
    },
    {
      "font": "Alternative Font 3",
      "reason": "Why this is a good alternative",
      "googleFontsUrl": "https://fonts.googleapis.com/css2?family=..."
    }
  ],
  "designRationale": "2-3 sentences explaining why this font matches the description and use case."
}

Only recommend fonts available on Google Fonts. Be specific with weights and include the full Google Fonts CSS URL with all recommended weights.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const rawResult = JSON.parse(
    response.choices[0].message.content || '{}'
  );
  const rec = rawResult.recommendation;

  if (!rec?.primaryFont) {
    throw new Error(
      'OpenAI response missing font recommendation'
    );
  }

  const importStatement =
    `@import url('${rec.googleFontsUrl}');`;

  const fontSlug = rec.primaryFont
    .toLowerCase().replace(/\s+/g, '-');

  const fontFaceDeclarations = (rec.weights as number[])
    .map((w: number) =>
      `/* ${rec.primaryFont} ${w} */\n` +
      `.font-${fontSlug}-${w} {\n` +
      `  font-family: ${rec.fallbackStack};\n` +
      `  font-weight: ${w};\n` +
      `}`
    )
    .join('\n\n');

  const cssVariables = [
    `:root {`,
    `  --font-generated: ${rec.fallbackStack};`,
    `  --font-generated-category: '${rec.category}';`,
    `}`,
  ].join('\n');

  const utilityClasses = [
    `.font-generated {`,
    `  font-family: var(--font-generated);`,
    `}`,
    `.font-generated-light {`,
    `  font-family: var(--font-generated);`,
    `  font-weight: 300;`,
    `}`,
    `.font-generated-regular {`,
    `  font-family: var(--font-generated);`,
    `  font-weight: 400;`,
    `}`,
    `.font-generated-medium {`,
    `  font-family: var(--font-generated);`,
    `  font-weight: 500;`,
    `}`,
    `.font-generated-bold {`,
    `  font-family: var(--font-generated);`,
    `  font-weight: 700;`,
    `}`,
  ].join('\n');

  const weightSamples = (rec.weights as number[])
    .map((w: number) =>
      `    <div class="weight-sample">` +
      `<div class="weight-label">${w}</div>` +
      `<div style="font-weight:${w};` +
      `font-size:1.25rem;">Aa Bb Cc</div></div>`
    )
    .join('\n');

  const htmlPreview = `<!DOCTYPE html>
<html>
<head>
  ${importStatement}
  <style>
    body {
      font-family: ${rec.fallbackStack};
      padding: 2rem;
    }
    h1 {
      font-weight: 700;
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    h2 {
      font-weight: 500;
      font-size: 1.5rem;
      color: #666;
      margin-bottom: 2rem;
    }
    p {
      font-weight: 400;
      font-size: 1rem;
      line-height: 1.7;
      max-width: 65ch;
    }
    .weights {
      display: flex;
      gap: 2rem;
      margin-top: 2rem;
    }
    .weight-label {
      font-size: 0.75rem;
      color: #999;
      margin-bottom: 0.25rem;
    }
  </style>
</head>
<body>
  <h1>${rec.primaryFont}</h1>
  <h2>${rec.category} — ${description}</h2>
  <p>The quick brown fox jumps over the lazy dog.
  Pack my box with five dozen liquor jugs.
  How vexingly quick daft zebras jump.</p>
  <div class="weights">
${weightSamples}
  </div>
</body>
</html>`;

  return {
    recommendation: rec,
    alternatives: rawResult.alternatives || [],
    css: {
      importStatement,
      fontFaceDeclarations,
      cssVariables,
      utilityClasses,
    },
    htmlPreview,
    designRationale: rawResult.designRationale || '',
  };
}

// =============================================
// MCP TOOL REGISTRATION
// =============================================

export function registerGenerateFontTool(server: McpServer): void {
  server.tool(
    'generate-font',
    'Generate font recommendations based on design context, mood, or reference URL. Returns Google Fonts URLs, CSS, and preview HTML.',
    {
      description: z
        .string()
        .describe('Description of the project, brand, or design context (e.g. "modern fintech startup with clean aesthetic")'),
      style: z
        .enum(['serif', 'sans-serif', 'monospace', 'display', 'handwriting'])
        .optional()
        .describe('Preferred font style category'),
      weight: z
        .enum(['light', 'regular', 'medium', 'bold', 'black'])
        .optional()
        .describe('Preferred weight emphasis'),
      useCase: z
        .enum(['heading', 'body', 'code', 'display', 'ui'])
        .optional()
        .describe('Primary use case for the font'),
    },
    async ({ description, style, weight, useCase }) => {
      try {
        const result = await generateFont({
          description,
          style,
          weight,
          useCase,
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
          err instanceof Error ? err.message : 'Unknown font generation error';
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
