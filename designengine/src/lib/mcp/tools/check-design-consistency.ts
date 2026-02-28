import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { loadDesignProfile, buildFullContextPrompt } from './shared/load-profile';

export function registerCheckDesignConsistencyTool(server: McpServer): void {
  server.tool(
    'check-design-consistency',
    'Compare component code against a stored design profile. Returns a list of inconsistencies with severity, specific fix suggestions, and the fully corrected code.',
    {
      componentCode: z.string().describe('The component code (JSX/TSX, HTML, CSS) to check'),
      projectName: z.string().optional().describe('Project name to load the design profile for'),
    },
    async ({ componentCode, projectName }) => {
      try {
        const profile = await loadDesignProfile(projectName);

        if (!profile) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                error: 'No design profile found. Run ingest-design first to create one.',
                hint: 'Example: ingest-design({ url: "https://your-site.com", projectName: "my-project" })',
              }, null, 2),
            }],
          };
        }

        const contextPrompt = await buildFullContextPrompt(profile, 'checking design consistency of component code');

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a design system auditor. You compare code against a design system and find inconsistencies.

${contextPrompt}

Analyze the provided component code and compare it against these design tokens. For EVERY deviation, report it with severity, the element, the problem, and the exact fix. Then provide corrected code.

=== CRITICAL: HARDCODED VALUE DETECTION ===
1. Flag ANY hardcoded hex color (#xxx, #xxxxxx, #xxxxxxxx) as severity "high". Colors MUST use CSS custom properties (var(--color-*)).
2. Flag ANY hardcoded rgba() value that encodes a palette color as severity "high". Use color-mix(in srgb, var(--color-*) N%, transparent) instead.
3. Flag ANY generic Tailwind color utility class (bg-gray-*, text-slate-*, text-indigo-*, bg-blue-*, border-zinc-*, etc.) that does not map to a token in the design profile as severity "high".
4. Flag ANY inline font-family string that is not wrapped in a CSS variable as severity "medium".
5. Flag ANY hardcoded pixel spacing value that does not align with the 8px grid as severity "medium".
6. In correctedCode, ALL hardcoded hex/rgba values MUST be replaced with the corresponding CSS variable from the design profile. Do not leave any hardcoded color values.

=== WRONG vs RIGHT EXAMPLES ===
WRONG: color: '#28A745'        RIGHT: color: 'var(--color-success)'
WRONG: color: '#DC3545'        RIGHT: color: 'var(--color-error)'
WRONG: color: '#fff'           RIGHT: color: 'var(--color-text-on-dark)'
WRONG: bg-gray-900             RIGHT: Use var(--color-*) from the profile
WRONG: rgba(220, 53, 69, 0.1)  RIGHT: color-mix(in srgb, var(--color-error) 10%, transparent)

Return ONLY valid JSON:
{
  "consistent": boolean,
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "element": "what element (button, card, text, etc)",
      "problem": "specific description of the mismatch",
      "fix": "exact change to make, including the CSS variable name to use"
    }
  ],
  "correctedCode": "the full component code with ALL fixes applied — zero hardcoded hex values remaining",
  "summary": "one-line summary of consistency status"
}

Severity guide:
- high: hardcoded hex colors, wrong colors, wrong fonts, wrong primary brand values, off-palette Tailwind classes
- medium: wrong border-radius, wrong shadows, wrong spacing scale, hardcoded font-family strings
- low: minor spacing differences, optional enhancements

IMPORTANT: The correctedCode must be the COMPLETE code with every fix applied — not a diff. There must be ZERO hardcoded hex color values in the corrected output.`,
            },
            {
              role: 'user',
              content: `Check this code for design consistency:\n\n\`\`\`\n${componentCode}\n\`\`\``,
            },
          ],
          temperature: 0.2,
          max_tokens: 8000,
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
              consistent: result.consistent ?? false,
              issueCount: result.issues?.length ?? 0,
              issues: result.issues || [],
              correctedCode: result.correctedCode || componentCode,
              summary: result.summary || '',
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
