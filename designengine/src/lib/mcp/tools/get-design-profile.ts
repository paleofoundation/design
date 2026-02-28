import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

export function registerGetDesignProfileTool(server: McpServer): void {
  server.tool(
    'get-design-profile',
    'Load a persistent design profile for an AI coding session. Returns stored design tokens, component patterns, tailwind config, and CSS variables so every file you generate stays on-brand.',
    {
      projectName: z.string().optional().describe('Project name to look up. If omitted, returns the most recent profile.'),
    },
    async ({ projectName }) => {
      try {
        let query = supabaseAdmin
          .from('design_profiles')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (projectName) {
          query = query.eq('project_name', projectName);
        }

        const { data, error } = await query as {
          data: Array<Record<string, unknown>> | null;
          error: { message: string } | null;
        };

        if (error) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({ error: `Database error: ${error.message}` }),
            }],
            isError: true,
          };
        }

        if (!data || data.length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                found: false,
                message: projectName
                  ? `No design profile found for project "${projectName}". Run the ingest-design tool first with this project name and a URL to crawl.`
                  : 'No design profiles found. Run the ingest-design tool with a project name and URL to create one.',
                hint: 'Example: ingest-design({ url: "https://example.com", projectName: "my-project" })',
              }, null, 2),
            }],
          };
        }

        const profile = data[0];

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              found: true,
              profileId: profile.id,
              projectName: profile.project_name,
              sourceUrl: profile.source_url,
              updatedAt: profile.updated_at,
              tokens: profile.tokens,
              components: profile.components,
              tailwindConfig: profile.tailwind_config,
              cssVariables: profile.css_variables,
              instructions: 'Use these tokens for ALL styling in this session. Colors must match exactly. Use the CSS variables or Tailwind config — do not hardcode arbitrary values.',
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
