import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { loadDesignProfile, profileToContextPrompt } from './shared/load-profile';

const VARIANT_TYPES = ['dark', 'light', 'high_contrast', 'muted', 'vibrant'] as const;

export function registerGenerateThemeVariantsTool(server: McpServer): void {
  server.tool(
    'generate-theme-variants',
    'Generate proper theme variants (dark mode, high contrast, muted, vibrant) from a stored design profile. Each variant gets a complete token set, CSS variables, Tailwind config, and a theme toggle component.',
    {
      projectName: z.string().describe('Project name — loads the design profile as the base theme'),
      variants: z.array(z.enum(VARIANT_TYPES)).describe('Which theme variants to generate'),
    },
    async ({ projectName, variants }) => {
      try {
        const profile = await loadDesignProfile(projectName);
        if (!profile) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                error: 'No design profile found. Run ingest-design first.',
                hint: 'Example: ingest-design({ url: "https://your-site.com", projectName: "my-project" })',
              }, null, 2),
            }],
          };
        }

        const contextPrompt = profileToContextPrompt(profile);

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a design-system theme engineer.

${contextPrompt}

Generate theme variants for: ${variants.join(', ')}

RULES for each variant:
- "dark": Create a proper dark theme — do NOT just invert colors. Use dark surface hierarchy (e.g. #0a0a0f → #111118 → #1a1a24). Adapt brand colors to work on dark backgrounds. Ensure text contrast meets WCAG AA.
- "light": The base/default light theme with the original tokens, properly structured with CSS variables.
- "high_contrast": Meet WCAG AAA (7:1 contrast ratio for all text). Increase border widths. Remove subtle shadows. Make focus indicators very visible.
- "muted": Desaturate all colors by ~40%. Use softer shadows. Reduce contrast slightly (still meeting WCAG AA). Creates a calm, understated feel.
- "vibrant": Increase saturation by ~30%. Use bolder shadows. Slightly increase font weight for headings. Creates an energetic feel.

For EACH variant return:
- tokens: complete token set matching the design_profiles.tokens structure
- cssVariables: complete :root or [data-theme="name"] CSS custom properties
- tailwindConfig: darkMode config additions for tailwind.config.ts

Also generate:
- A React toggle component for switching themes
- A complete globals.css with all theme variants using data-theme attributes and prefers-color-scheme media query for dark mode

Return ONLY valid JSON:
{
  "baseTheme": "light",
  "variants": {
    "dark": {
      "tokens": { ... },
      "cssVariables": ":root[data-theme='dark'] { ... }",
      "tailwindConfig": "..."
    },
    ...for each requested variant
  },
  "toggleCode": "complete React ThemeToggle component with TypeScript",
  "globalsCss": "complete globals.css with all theme CSS variables and media query"
}`,
            },
            {
              role: 'user',
              content: `Generate these theme variants for "${profile.project_name}": ${variants.join(', ')}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 16000,
          response_format: { type: 'json_object' },
        });

        const raw = response.choices[0].message.content;
        if (!raw) throw new Error('OpenAI returned empty response');
        const result = JSON.parse(raw);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              projectName: profile.project_name,
              baseTheme: result.baseTheme || 'light',
              variants: result.variants || {},
              toggleCode: result.toggleCode || '',
              globalsCss: result.globalsCss || '',
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
