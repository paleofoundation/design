import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { buildFullContextPrompt, loadDesignProfile, profileToContextPrompt } from './shared/load-profile';
import type { ChatCompletionContentPart } from 'openai/resources/chat/completions';

export interface ConvertDesignInput {
  imageUrl?: string;
  base64Image?: string;
  outputFormat?: 'html-css' | 'html-tailwind' | 'react-tailwind';
  responsive?: boolean;
  includeAnimations?: boolean;
  accessibilityLevel?: 'basic' | 'wcag-aa' | 'wcag-aaa';
  projectName?: string;
}

const ACCESSIBILITY_INSTRUCTIONS: Record<string, string> = {
  basic: 'Include alt text and semantic HTML.',
  'wcag-aa': 'Include ARIA labels, heading hierarchy, focus states, contrast >= 4.5:1, keyboard navigation.',
  'wcag-aaa': 'Full WCAG AAA: contrast >= 7:1, all ARIA, skip navigation, landmark regions.',
};

export async function convertDesignToCode(input: ConvertDesignInput) {
  const {
    imageUrl, base64Image,
    outputFormat = 'react-tailwind',
    responsive = true,
    includeAnimations = false,
    accessibilityLevel = 'wcag-aa',
    projectName,
  } = input;

  if (!imageUrl && !base64Image) throw new Error('Either imageUrl or base64Image must be provided');

  const profile = await loadDesignProfile(projectName);
  const profileContext = profile ? await buildFullContextPrompt(profile, 'converting design screenshot to code') : '';

  const imageContent: ChatCompletionContentPart = {
    type: 'image_url',
    image_url: {
      url: imageUrl || `data:image/png;base64,${base64Image}`,
      detail: 'high',
    },
  };

  const prompt = `You are an expert front-end developer. Convert this screenshot into production-ready code.

Generate BOTH formats:
1. A React functional component with TypeScript using Tailwind CSS classes
2. A standalone HTML page with embedded CSS (no external dependencies)

${profileContext ? `${profileContext}\n\nCRITICAL: You MUST use the design system tokens above for ALL styling. Use the exact colors, fonts, spacing, border-radius, and shadows from the design profile. Use CSS variables (var(--color-primary), etc.) or the equivalent Tailwind classes. Do NOT use arbitrary Tailwind values that deviate from the design system.` : ''}

REQUIREMENTS:
${responsive ? '- MUST be fully responsive (mobile-first)' : '- Fixed-width is acceptable'}
${includeAnimations ? '- Include subtle CSS animations/transitions' : '- No animations'}
- Accessibility: ${accessibilityLevel} — ${ACCESSIBILITY_INSTRUCTIONS[accessibilityLevel]}
- Extract all colors, fonts, and spacing as CSS custom properties
- Match the design as closely as possible
- Use placeholder image URLs with correct aspect ratios

Return ONLY valid JSON:
{
  "codeArtifacts": {
    "reactComponent": "Complete React+TypeScript component using Tailwind. Export default. Self-contained.",
    "htmlCssPage": "Complete standalone HTML page with embedded <style> block. No external deps except fonts.",
    "extractedTokens": {
      "colors": { "primary": "#hex", "secondary": "#hex", "background": "#hex", "text": "#hex", "accent": "#hex" },
      "fonts": { "heading": "Font Name", "body": "Font Name" },
      "spacing": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px" },
      "borderRadius": "8px"
    },
    "cssVariables": ":root { --color-primary: #hex; ... all tokens as CSS custom properties }"
  },
  "metadata": {
    "outputFormat": "${outputFormat}",
    "responsive": ${responsive},
    "accessibility": "${accessibilityLevel}",
    "estimatedFidelity": "high|medium|low",
    "notes": ["Array of notes about the conversion"]
  }
}

The reactComponent must be a COMPLETE, working component. The htmlCssPage must be a COMPLETE HTML document.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, imageContent] }],
    max_tokens: 16000,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error('OpenAI returned an empty response');

  const result = JSON.parse(raw);

  return {
    codeArtifacts: {
      reactComponent: result.codeArtifacts?.reactComponent || '',
      htmlCssPage: result.codeArtifacts?.htmlCssPage || '',
      extractedTokens: result.codeArtifacts?.extractedTokens || {},
      cssVariables: result.codeArtifacts?.cssVariables || '',
    },
    designProfileUsed: profile?.project_name || null,
    metadata: {
      outputFormat,
      responsive,
      accessibility: accessibilityLevel,
      estimatedFidelity: (['high', 'medium', 'low'].includes(result.metadata?.estimatedFidelity) ? result.metadata.estimatedFidelity : 'medium') as 'high' | 'medium' | 'low',
      notes: Array.isArray(result.metadata?.notes) ? result.metadata.notes : [],
    },
  };
}

export function registerConvertDesignTool(server: McpServer): void {
  server.tool(
    'convert-design',
    'Convert a design screenshot into production code. When a project name is provided, uses the stored design system tokens for all styling.',
    {
      imageUrl: z.string().optional().describe('URL of the design screenshot'),
      base64Image: z.string().optional().describe('Base64-encoded image'),
      outputFormat: z.enum(['html-css', 'html-tailwind', 'react-tailwind']).optional().default('react-tailwind').describe('Primary output format'),
      responsive: z.boolean().optional().default(true).describe('Mobile-first responsive'),
      includeAnimations: z.boolean().optional().default(false).describe('Include CSS animations'),
      accessibilityLevel: z.enum(['basic', 'wcag-aa', 'wcag-aaa']).optional().default('wcag-aa').describe('Accessibility level'),
      projectName: z.string().optional().describe('Project name to load design profile for consistency'),
    },
    async ({ imageUrl, base64Image, outputFormat, responsive, includeAnimations, accessibilityLevel, projectName }) => {
      try {
        if (!imageUrl && !base64Image) {
          return {
            content: [{ type: 'text' as const, text: JSON.stringify({ error: 'Either imageUrl or base64Image must be provided' }) }],
            isError: true,
          };
        }
        const result = await convertDesignToCode({ imageUrl, base64Image, outputFormat, responsive, includeAnimations, accessibilityLevel, projectName });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown conversion error';
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }], isError: true };
      }
    }
  );
}
