import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/openai/embeddings';

// =============================================
// TYPES
// =============================================

export interface SearchPatternsInput {
  query: string;
  category?: string;
  tags?: string[];
  limit?: number;
  threshold?: number;
}

export interface SearchPatternsResult {
  patterns: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    sourceUrl: string;
    tokens: object;
    screenshotUrl?: string;
    similarity: number;
  }>;
  query: string;
  totalResults: number;
}

// =============================================
// CORE SEARCH FUNCTION
// =============================================

export async function searchDesignPatterns(
  input: SearchPatternsInput
): Promise<SearchPatternsResult> {
  const {
    query,
    category,
    tags,
    limit = 10,
    threshold = 0.5,
  } = input;

  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabaseAdmin.rpc(
    'match_design_patterns',
    {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_category: category || null,
      filter_tags: tags || null,
    }
  );

  if (error) {
    throw new Error(
      `Design pattern search failed: ${error.message}`
    );
  }

  const patterns = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    category: row.category as string,
    tags: row.tags as string[],
    sourceUrl: row.source_url as string,
    tokens: row.tokens as object,
    screenshotUrl: (row.screenshot_url as string) || undefined,
    similarity:
      Math.round((row.similarity as number) * 1000) / 1000,
  }));

  return {
    patterns,
    query,
    totalResults: patterns.length,
  };
}

// =============================================
// MCP TOOL REGISTRATION
// =============================================

export function registerSearchPatternsTool(server: McpServer): void {
  server.tool(
    'search-patterns',
    'Semantic search across ingested design patterns. Returns matching patterns ranked by vector similarity with full design tokens.',
    {
      query: z.string().describe('Natural language search query (e.g. "dark fintech landing page with gradient mesh")'),
      category: z
        .enum([
          'landing-page', 'dashboard', 'e-commerce',
          'portfolio', 'blog', 'saas', 'marketing',
          'mobile-app', 'documentation', 'social-media',
          'news', 'corporate',
        ])
        .optional()
        .describe('Filter results to a specific design category'),
      tags: z
        .array(z.string())
        .optional()
        .describe('Filter results to patterns matching any of these tags'),
      limit: z
        .number()
        .min(1)
        .max(50)
        .optional()
        .default(10)
        .describe('Maximum number of results to return (1-50)'),
      threshold: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .default(0.5)
        .describe('Minimum similarity score threshold (0-1)'),
    },
    async ({ query, category, tags, limit, threshold }) => {
      try {
        const result = await searchDesignPatterns({
          query,
          category,
          tags,
          limit,
          threshold,
        });

        if (result.totalResults === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    query,
                    totalResults: 0,
                    patterns: [],
                    message: 'No design patterns matched your query. Try broadening your search or lowering the similarity threshold.',
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

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
          err instanceof Error ? err.message : 'Unknown search error';
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
