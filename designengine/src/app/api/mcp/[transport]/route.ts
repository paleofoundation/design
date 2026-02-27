import { createDesignEngineMcpServer } from '@/lib/mcp/server';
import { createMcpHandler } from 'mcp-handler';

const handler = createMcpHandler(createDesignEngineMcpServer);

export { handler as GET, handler as POST, handler as DELETE };
