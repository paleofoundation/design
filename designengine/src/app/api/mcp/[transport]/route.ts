import { createMcpHandler } from 'mcp-handler';
import { initializeDesignEngine } from '@/lib/mcp/server';

const handler = createMcpHandler(
  initializeDesignEngine,
  {
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: 'designengine',
      version: '0.1.0',
    },
  },
  {
    basePath: '/api/mcp',
    maxDuration: 120,
    verboseLogs: process.env.NODE_ENV === 'development',
  }
);

export { handler as GET, handler as POST, handler as DELETE };
