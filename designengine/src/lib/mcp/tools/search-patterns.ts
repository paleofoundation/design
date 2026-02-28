import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/openai/embeddings';
import { openai } from '@/lib/openai/client';
import { buildFullContextPrompt, loadDesignProfile, profileToContextPrompt } from './shared/load-profile';

export interface SearchPatternsInput {
  query: string;
  category?: string;
  tags?: string[];
  limit?: number;
  threshold?: number;
}

export async function searchDesignPatterns(input: SearchPatternsInput) {
  const { query, category, tags, limit = 10, threshold = 0.5 } = input;

  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabaseAdmin.rpc('match_design_patterns', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
    filter_category: category || null,
    filter_tags: tags || null,
  });

  if (error) throw new Error(`Design pattern search failed: ${error.message}`);

  const patterns = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    category: row.category as string,
    tags: row.tags as string[],
    sourceUrl: row.source_url as string,
    tokens: row.tokens as object,
    screenshotUrl: (row.screenshot_url as string) || undefined,
    similarity: Math.round((row.similarity as number) * 1000) / 1000,
  }));

  return { patterns, query, totalResults: patterns.length };
}

async function generateComponentFromPattern(
  pattern: { name: string; description: string; category: string; tokens: object },
  query: string,
  profileContext: string,
): Promise<{ componentCode: string; variants: string[] }> {
  const prompt = `You are an expert React developer. Given this design pattern, generate implementation-ready code.

Pattern: "${pattern.name}"
Description: "${pattern.description}"
Category: "${pattern.category}"
Design tokens: ${JSON.stringify(pattern.tokens)}
User query: "${query}"

${profileContext ? `${profileContext}\n\nIMPORTANT: The generated component MUST use the design system tokens above for all colors, fonts, spacing, and border-radius. Do NOT use arbitrary Tailwind values.` : ''}

Return ONLY valid JSON:
{
  "componentCode": "A complete React functional component using Tailwind CSS that implements this design pattern. Export as default. Use TypeScript. Include all styling inline with Tailwind classes. The component should be self-contained and ready to drop into a Next.js project.",
  "variants": [
    "Variant 1: Same component with a dark theme",
    "Variant 2: Same component with a compact/minimal layout",
    "Variant 3: Same component with a different color scheme from the tokens"
  ]
}

The componentCode must be a COMPLETE, working React component. The variants must also be complete components. Use the design tokens for colors, spacing, and typography where possible.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 8000,
    response_format: { type: 'json_object' },
  });

  const raw = JSON.parse(response.choices[0].message.content || '{}');
  return {
    componentCode: raw.componentCode || '',
    variants: Array.isArray(raw.variants) ? raw.variants : [],
  };
}

export function registerSearchPatternsTool(server: McpServer): void {
  server.tool(
    'search-patterns',
    'Semantic search across design patterns. When a project name is provided, constrains generated components to use the stored design system tokens.',
    {
      query: z.string().describe('Natural language search query (e.g. "dark fintech landing page with gradient mesh")'),
      category: z.enum([
        'landing-page', 'dashboard', 'e-commerce', 'portfolio', 'blog', 'saas',
        'marketing', 'mobile-app', 'documentation', 'social-media', 'news', 'corporate',
      ]).optional().describe('Filter by design category'),
      tags: z.array(z.string()).optional().describe('Filter by tags'),
      limit: z.number().min(1).max(50).optional().default(10).describe('Max results (1-50)'),
      threshold: z.number().min(0).max(1).optional().default(0.5).describe('Min similarity (0-1)'),
      projectName: z.string().optional().describe('Project name to load design profile for consistency'),
    },
    async ({ query, category, tags, limit, threshold, projectName }) => {
      try {
        const result = await searchDesignPatterns({ query, category, tags, limit, threshold });

        if (result.totalResults === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                query, totalResults: 0, patterns: [],
                message: 'No design patterns matched. Try broadening your search.',
              }, null, 2),
            }],
          };
        }

        const profile = await loadDesignProfile(projectName);
        const profileContext = profile ? await buildFullContextPrompt(profile, 'searching design patterns') : '';

        const topPattern = result.patterns[0];
        const codeArtifacts = await generateComponentFromPattern(topPattern, query, profileContext);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              ...result,
              designProfileUsed: profile?.project_name || null,
              codeArtifacts: {
                basedOn: topPattern.name,
                componentCode: codeArtifacts.componentCode,
                variants: codeArtifacts.variants,
              },
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown search error';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    }
  );
}
