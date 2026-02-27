import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerIngestDesignTool(server: McpServer): void {
  server.tool(
    'ingest-design',
    'Crawl a website URL and extract design tokens (colors, typography, spacing, shadows) into a structured format.',
    {
      url: z.string().url().describe('The URL of the website to analyze'),
      name: z.string().optional().describe('Optional name for the design pattern'),
      tags: z.array(z.string()).optional().describe('Optional tags for categorization'),
    },
    async ({ url, name, tags }) => {
      // TODO: implement with firecrawl + openai extraction
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                status: 'placeholder',
                message: `ingest-design tool called for ${url}`,
                name: name ?? 'Unnamed',
                tags: tags ?? [],
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
