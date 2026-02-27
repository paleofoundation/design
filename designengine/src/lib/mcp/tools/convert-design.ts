import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerConvertDesignTool(server: McpServer): void {
  server.tool(
    'convert-design',
    'Convert design tokens or a design pattern into production-ready code (HTML/CSS, React, Tailwind, etc.).',
    {
      patternId: z
        .string()
        .optional()
        .describe('ID of an ingested design pattern to convert'),
      tokens: z
        .string()
        .optional()
        .describe('Raw JSON design tokens to convert'),
      outputFormat: z
        .enum(['html-css', 'react', 'tailwind', 'vue', 'svelte'])
        .default('html-css')
        .describe('Target output format'),
      responsive: z
        .boolean()
        .optional()
        .default(true)
        .describe('Include responsive breakpoints'),
    },
    async ({ patternId, tokens, outputFormat, responsive }) => {
      // TODO: implement with openai
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                status: 'placeholder',
                message: `convert-design called`,
                patternId: patternId ?? 'none',
                hasTokens: !!tokens,
                outputFormat,
                responsive,
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
