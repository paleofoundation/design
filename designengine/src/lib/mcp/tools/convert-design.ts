import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import type { ConvertDesignResult } from '@/types/design';
import type {
  ChatCompletionContentPart,
} from 'openai/resources/chat/completions';

// =============================================
// TYPES
// =============================================

export interface ConvertDesignInput {
  imageUrl?: string;
  base64Image?: string;
  outputFormat?:
    'html-css' | 'html-tailwind' | 'react-tailwind';
  responsive?: boolean;
  includeAnimations?: boolean;
  accessibilityLevel?:
    'basic' | 'wcag-aa' | 'wcag-aaa';
}

// =============================================
// CORE CONVERSION FUNCTION
// =============================================

const FORMAT_INSTRUCTIONS: Record<string, string> = {
  'html-css':
    'Generate semantic HTML5 with a separate <style> block using modern CSS ' +
    '(CSS Grid, Flexbox, custom properties). Use BEM naming convention for classes.',
  'html-tailwind':
    'Generate semantic HTML5 using Tailwind CSS utility classes (v3). ' +
    'Include a CDN link for Tailwind in the <head>.',
  'react-tailwind':
    'Generate a React functional component using Tailwind CSS and TypeScript syntax. ' +
    'Export the component as default.',
};

const ACCESSIBILITY_INSTRUCTIONS: Record<string, string> = {
  basic:
    'Include alt text and semantic HTML.',
  'wcag-aa':
    'Include ARIA labels, proper heading hierarchy, focus states, ' +
    'color contrast >= 4.5:1, keyboard navigation.',
  'wcag-aaa':
    'Full WCAG AAA: enhanced contrast >= 7:1, all ARIA attributes, ' +
    'skip navigation, landmark regions.',
};

export async function convertDesignToCode(
  input: ConvertDesignInput
): Promise<ConvertDesignResult> {
  const {
    imageUrl,
    base64Image,
    outputFormat = 'html-css',
    responsive = true,
    includeAnimations = false,
    accessibilityLevel = 'wcag-aa',
  } = input;

  if (!imageUrl && !base64Image) {
    throw new Error(
      'Either imageUrl or base64Image must be provided'
    );
  }

  const imageContent: ChatCompletionContentPart = {
    type: 'image_url',
    image_url: {
      url: imageUrl
        ? imageUrl
        : `data:image/png;base64,${base64Image}`,
      detail: 'high',
    },
  };

  const prompt = `You are an expert front-end developer. Convert this screenshot into clean, production-ready code.

OUTPUT FORMAT: ${outputFormat}
${FORMAT_INSTRUCTIONS[outputFormat]}

REQUIREMENTS:
${responsive ? '- MUST be fully responsive (mobile-first)' : '- Fixed-width layout is acceptable'}
${includeAnimations ? '- Include subtle CSS animations/transitions' : '- No animations needed'}
- Accessibility: ${accessibilityLevel}
  ${ACCESSIBILITY_INSTRUCTIONS[accessibilityLevel]}
- Use modern CSS features (container queries, :has(), nesting where appropriate)
- Match colors, spacing, typography as closely as possible from the screenshot
- Use CSS custom properties for all colors and spacing values
- Include appropriate meta viewport tag
- Images: use placeholder URLs with correct aspect ratios

Respond with ONLY valid JSON (no markdown):
{
  "html": "<!DOCTYPE html>...",
  "css": "/* styles */",
  "javascript": "// optional JS if needed",
  "componentCode": "// React component (only for react-tailwind)",
  "metadata": {
    "outputFormat": "${outputFormat}",
    "responsive": ${responsive},
    "accessibility": "${accessibilityLevel}",
    "estimatedFidelity": "high|medium|low",
    "notes": ["Array of notes about the conversion"]
  }
}

IMPORTANT: For html-css format, put ALL HTML in "html" (including style tag in head) and ALSO put just the CSS in the "css" field separately. For react-tailwind, put the component in "componentCode".`;

  const response =
    await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            imageContent,
          ],
        },
      ],
      max_tokens: 16000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

  const raw = response.choices[0].message.content;
  if (!raw) {
    throw new Error('OpenAI returned an empty response');
  }

  const result = JSON.parse(raw);

  const fidelity = result.metadata?.estimatedFidelity;
  const validFidelity: ConvertDesignResult['metadata']['estimatedFidelity'] =
    fidelity === 'high' || fidelity === 'low' ? fidelity : 'medium';

  return {
    html: result.html || '',
    css: result.css || '',
    javascript: result.javascript || undefined,
    componentCode: result.componentCode || undefined,
    metadata: {
      outputFormat,
      responsive,
      accessibility: accessibilityLevel,
      estimatedFidelity: validFidelity,
      notes: Array.isArray(result.metadata?.notes)
        ? result.metadata.notes
        : [],
    },
  };
}

// =============================================
// MCP TOOL REGISTRATION
// =============================================

export function registerConvertDesignTool(server: McpServer): void {
  server.tool(
    'convert-design',
    'Convert a design screenshot into production-ready code (HTML/CSS, HTML+Tailwind, or React+Tailwind). Supports URL or base64 images with responsive, animation, and accessibility options.',
    {
      imageUrl: z
        .string()
        .url()
        .optional()
        .describe('Public URL of the design screenshot to convert'),
      base64Image: z
        .string()
        .optional()
        .describe('Base64-encoded PNG/JPEG of the design screenshot'),
      outputFormat: z
        .enum(['html-css', 'html-tailwind', 'react-tailwind'])
        .optional()
        .default('html-css')
        .describe('Target code output format'),
      responsive: z
        .boolean()
        .optional()
        .default(true)
        .describe('Generate mobile-first responsive code'),
      includeAnimations: z
        .boolean()
        .optional()
        .default(false)
        .describe('Include subtle CSS animations and transitions'),
      accessibilityLevel: z
        .enum(['basic', 'wcag-aa', 'wcag-aaa'])
        .optional()
        .default('wcag-aa')
        .describe('Target accessibility compliance level'),
    },
    async ({
      imageUrl,
      base64Image,
      outputFormat,
      responsive,
      includeAnimations,
      accessibilityLevel,
    }) => {
      try {
        if (!imageUrl && !base64Image) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  { error: 'Either imageUrl or base64Image must be provided' },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        const result = await convertDesignToCode({
          imageUrl,
          base64Image,
          outputFormat,
          responsive,
          includeAnimations,
          accessibilityLevel,
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
          err instanceof Error ? err.message : 'Unknown conversion error';
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
