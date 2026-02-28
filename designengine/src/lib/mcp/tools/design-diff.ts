import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { ingestDesignFromUrl } from '@/lib/firecrawl/ingest';
import { loadDesignProfile, buildFullContextPrompt } from './shared/load-profile';

function isUrl(s: string): boolean {
  try { new URL(s); return true; } catch { return false; }
}

async function resolveContent(input: string): Promise<string> {
  if (isUrl(input)) {
    const result = await ingestDesignFromUrl(input, { includeHtml: true, includeMarkdown: true });
    if (!result.success) throw new Error(`Failed to scrape ${input}: ${result.error}`);
    return result.html || result.markdown || '';
  }
  return input;
}

export function registerDesignDiffTool(server: McpServer): void {
  server.tool(
    'design-diff',
    'Compare two designs (URLs or code) and produce a structured diff categorized by colors, typography, spacing, layout, and components. Rates severity and provides a fix patch.',
    {
      source: z.string().describe('The "expected" design — a URL or component code'),
      target: z.string().describe('The "actual" implementation — a URL or component code'),
      projectName: z.string().optional().describe('Project name for additional design profile context'),
    },
    async ({ source, target, projectName }) => {
      try {
        const [sourceContent, targetContent] = await Promise.all([
          resolveContent(source),
          resolveContent(target),
        ]);

        const profile = await loadDesignProfile(projectName);
        const profileContext = profile ? await buildFullContextPrompt(profile, 'comparing design implementations for drift') : '';

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a design QA engineer comparing two implementations for visual differences.

${profileContext ? `${profileContext}\n\n` : ''}Compare the SOURCE (expected/reference design) against the TARGET (actual implementation). Find every visual difference.

Categorize each difference: colors, typography, spacing, layout, components, borders, shadows.

Severity guide:
- high: brand colors wrong, fonts wrong, layout structure different
- medium: spacing off, border-radius different, shadow intensity
- low: minor spacing tweaks, subtle color shade differences

Return ONLY valid JSON:
{
  "identical": false,
  "overallDrift": "none|minimal|moderate|significant|major",
  "differences": [
    {
      "category": "colors|typography|spacing|layout|components|borders|shadows",
      "element": "which element (button, heading, card, nav, etc.)",
      "source": "what the source has",
      "target": "what the target has",
      "severity": "high|medium|low"
    }
  ],
  "summary": "One-paragraph summary of the overall drift",
  "fixPatch": "Complete list of changes (as code/class changes) needed to make target match source"
}`,
            },
            {
              role: 'user',
              content: `Compare these two designs:\n\n--- SOURCE (expected) ---\n${sourceContent.slice(0, 15000)}\n\n--- TARGET (actual) ---\n${targetContent.slice(0, 15000)}`,
            },
          ],
          temperature: 0.2,
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
              sourceIsUrl: isUrl(source),
              targetIsUrl: isUrl(target),
              identical: result.identical ?? false,
              overallDrift: result.overallDrift || 'unknown',
              differenceCount: result.differences?.length || 0,
              differences: result.differences || [],
              summary: result.summary || '',
              fixPatch: result.fixPatch || '',
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
