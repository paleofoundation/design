export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface MCPServerConfig {
  name: string;
  version: string;
  description: string;
}

export interface APIKeyValidation {
  valid: boolean;
  userId?: string;
  tier?: 'free' | 'pro' | 'enterprise';
  rateLimit?: number;
}

export interface UsageRecord {
  userId: string;
  toolName: string;
  timestamp: string;
  inputTokens?: number;
  outputTokens?: number;
  success: boolean;
  errorMessage?: string;
}
