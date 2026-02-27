import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ingestDesignFromUrl } from '@/lib/firecrawl/ingest';
import {
  extractDesignTokens,
  tokensToCssVariables,
  tokensToTailwindConfig,
} from '@/lib/utils/design-tokens';

export function registerIngestDesignTool(server: McpServer): void {
  server.tool(
    'ingest_design',
    'Crawl a website URL with Firecrawl and extract structured design tokens (colors, typography, spacing, shadows, layout). Returns the complete design system as JSON, CSS variables, and Tailwind config.',
    {
      url: z.string().url().describe(
        'The URL of the website to analyze'
      ),
      includeScreenshot: z.boolean()
        .optional().default(true)
        .describe('Capture a screenshot of the page'),
      includeCss: z.boolean()
        .optional().default(true)
        .describe('Generate CSS custom properties output'),
      includeTailwind: z.boolean()
        .optional().default(true)
        .describe('Generate Tailwind theme config output'),
    },
    async ({ url, includeScreenshot, includeCss, includeTailwind }) => {
      try {
        const ingestion = await ingestDesignFromUrl(url, {
          includeScreenshot,
        });

        if (!ingestion.success || !ingestion.branding) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: ingestion.error || 'Failed to extract branding data',
                url,
              }, null, 2),
            }],
          };
        }

        const tokens = extractDesignTokens(ingestion.branding, url);

        const result: Record<string, unknown> = {
          success: true,
          url,
          tokens,
          screenshot: ingestion.screenshot,
        };

        if (includeCss) {
          result.cssVariables = tokensToCssVariables(tokens);
        }

        if (includeTailwind) {
          result.tailwindConfig = tokensToTailwindConfig(tokens);
        }

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown ingestion error';
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ error: message }, null, 2),
          }],
          isError: true,
        };
      }
    }
  );
}
