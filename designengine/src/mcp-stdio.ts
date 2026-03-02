#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
// TODO: Rename to "Refine Design" after transition period
import { initializeDesignEngine } from './lib/mcp/server.js';

const server = new McpServer({
  // TODO: Rename to "Refine Design" after transition period
  name: 'designengine',
  version: '1.0.0',
});

initializeDesignEngine(server);

const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.error('DesignEngine MCP Server running on stdio');
});
