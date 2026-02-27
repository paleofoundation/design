import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerIngestDesignTool } from './tools/ingest-design';
import { registerSearchPatternsTool } from './tools/search-patterns';
import { registerGenerateFontTool } from './tools/generate-font';
import { registerPairTypographyTool } from './tools/pair-typography';
import { registerConvertDesignTool } from './tools/convert-design';

export function createDesignEngineMcpServer(): McpServer {
  const server = new McpServer({
    name: 'designengine',
    version: '0.1.0',
  });

  registerIngestDesignTool(server);
  registerSearchPatternsTool(server);
  registerGenerateFontTool(server);
  registerPairTypographyTool(server);
  registerConvertDesignTool(server);

  return server;
}
