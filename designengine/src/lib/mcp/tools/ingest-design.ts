import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ingestDesignFromUrl } from '@/lib/firecrawl/ingest';
import {
  extractDesignTokens,
  tokensToCssVariables,
  tokensToTailwindConfig,
} from '@/lib/utils/design-tokens';

function buildTailwindConfigFile(tokens: ReturnType<typeof extractDesignTokens>): string {
  const tw = tokensToTailwindConfig(tokens);
  return `import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: ${JSON.stringify(tw, null, 6).replace(/"([^"]+)":/g, '$1:').replace(/"/g, "'")},
  },
  plugins: [],
};

export default config;`;
}

function buildGlobalsCss(cssVars: string): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  ${cssVars}

  body {
    font-family: var(--font-primary, system-ui, sans-serif);
    color: var(--color-text-primary, #111);
    background-color: var(--color-background, #fff);
  }

  h1, h2, h3, h4 {
    font-family: var(--font-heading, var(--font-primary, system-ui, sans-serif));
  }

  a {
    color: var(--color-link, var(--color-primary));
  }
}`;
}

export function registerIngestDesignTool(server: McpServer): void {
  server.tool(
    'ingest_design',
    'Scrape a URL and extract structured design tokens with code artifacts: design tokens JSON, CSS custom properties, a complete tailwind.config.ts, and globals.css ready to drop into a project.',
    {
      url: z.string().url().describe('The URL of the website to analyze'),
      includeScreenshot: z.boolean().optional().default(true).describe('Capture a screenshot'),
      includeCss: z.boolean().optional().default(true).describe('Generate CSS custom properties'),
      includeTailwind: z.boolean().optional().default(true).describe('Generate Tailwind config'),
    },
    async ({ url, includeScreenshot, includeCss, includeTailwind }) => {
      try {
        const ingestion = await ingestDesignFromUrl(url, { includeScreenshot });

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
        const cssVariables = tokensToCssVariables(tokens);
        const tailwindTheme = tokensToTailwindConfig(tokens);

        const result: Record<string, unknown> = {
          success: true,
          url,
          tokens,
          screenshot: ingestion.screenshot,
        };

        if (includeCss) {
          result.cssVariables = cssVariables;
        }

        if (includeTailwind) {
          result.tailwindConfig = tailwindTheme;
        }

        result.codeArtifacts = {
          designTokens: tokens,
          cssVariables,
          tailwindConfigFile: buildTailwindConfigFile(tokens),
          globalsCss: buildGlobalsCss(cssVariables),
          tailwindThemeExtend: tailwindTheme,
        };

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown ingestion error';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    }
  );
}
