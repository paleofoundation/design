import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPairTypographyTool(server: McpServer): void {
  server.tool(
    'pair-typography',
    'Generate harmonious heading + body typography pairings with size scale, CSS variables, and design rationale.',
    {
      primaryFont: z
        .string()
        .optional()
        .describe('Starting font to pair against'),
      mood: z
        .string()
        .optional()
        .describe('Desired mood for the pairing'),
      useCase: z
        .enum(['website', 'app', 'documentation', 'marketing', 'editorial'])
        .optional()
        .describe('Intended use case'),
    },
    async ({ primaryFont, mood, useCase }) => {
      // TODO: implement with openai
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                status: 'placeholder',
                message: `pair-typography called`,
                primaryFont: primaryFont ?? 'auto',
                mood: mood ?? 'neutral',
                useCase: useCase ?? 'website',
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
