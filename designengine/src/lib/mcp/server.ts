import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerIngestDesignTool } from './tools/ingest-design';
import { registerSearchPatternsTool } from './tools/search-patterns';
import { registerGenerateFontTool } from './tools/generate-font';
import { registerPairTypographyTool } from './tools/pair-typography';
import { registerConvertDesignTool } from './tools/convert-design';

export function initializeDesignEngine(server: McpServer): void {
  registerIngestDesignTool(server);
  registerSearchPatternsTool(server);
  registerGenerateFontTool(server);
  registerPairTypographyTool(server);
  registerConvertDesignTool(server);
}
