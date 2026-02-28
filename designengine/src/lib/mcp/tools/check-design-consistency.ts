import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { loadDesignProfile, profileToContextPrompt } from './shared/load-profile';

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

        const contextPrompt = profileToContextPrompt(profile);

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a design system auditor. You compare code against a design system and find inconsistencies.

${contextPrompt}

Analyze the provided component code and compare it against these design tokens. For EVERY deviation, report it with severity, the element, the problem, and the exact fix. Then provide corrected code.

Return ONLY valid JSON:
{
  "consistent": boolean,
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "element": "what element (button, card, text, etc)",
      "problem": "specific description of the mismatch",
      "fix": "exact change to make"
    }
  ],
  "correctedCode": "the full component code with ALL fixes applied",
  "summary": "one-line summary of consistency status"
}

Severity guide:
- high: wrong colors, wrong fonts, wrong primary brand values
- medium: wrong border-radius, wrong shadows, wrong spacing scale
- low: minor spacing differences, optional enhancements

IMPORTANT: The correctedCode must be the COMPLETE code with every fix applied — not a diff.`,
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
