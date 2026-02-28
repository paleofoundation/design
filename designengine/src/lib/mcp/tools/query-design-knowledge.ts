import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { searchKnowledge, formatKnowledgeContext } from '@/lib/knowledge/retrieval';

export function registerQueryDesignKnowledgeTool(server: McpServer): void {
  server.tool(
    'query-design-knowledge',
    'Search the user\'s uploaded design knowledge base (textbooks, style guides, reference docs). Returns relevant design principles and excerpts with source citations. Use this to ground your design decisions in established theory.',
    {
      query: z.string().describe('Natural language question about design (e.g. "what makes good color contrast?", "button sizing best practices")'),
      projectName: z.string().optional().describe('Project name to identify the user\'s knowledge base'),
      limit: z.number().min(1).max(15).optional().describe('Number of results to return (default 8)'),
    },
    async ({ query, projectName, limit }) => {
      try {
        let userId: string | null = null;

        if (projectName) {
          const { data } = await supabaseAdmin
            .from('design_profiles')
            .select('user_id')
            .eq('project_name', projectName)
            .limit(1)
            .single() as { data: { user_id: string } | null; error: unknown };

          userId = data?.user_id ?? null;
        }

        if (!userId) {
          const { data } = await supabaseAdmin
            .from('design_profiles')
            .select('user_id')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single() as { data: { user_id: string } | null; error: unknown };

          userId = data?.user_id ?? null;
        }

        if (!userId) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                error: 'No design profile found. Create a design profile first, then upload knowledge documents at /dashboard/knowledge.',
              }, null, 2),
            }],
          };
        }

        const chunks = await searchKnowledge(userId, query, limit ?? 8, 0.4);

        if (chunks.length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                query,
                results: [],
                message: 'No relevant knowledge found. Upload design textbooks or reference docs at /dashboard/knowledge to build your knowledge base.',
              }, null, 2),
            }],
          };
        }

        const formattedContext = formatKnowledgeContext(chunks);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              query,
              resultCount: chunks.length,
              results: chunks.map((c) => ({
                source: c.sourceName,
                section: c.sectionTitle,
                content: c.chunkText,
                relevance: c.similarity,
              })),
              formattedContext,
              instructions: 'Apply these design principles to your current task. Cite the source when making design decisions based on this knowledge.',
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
