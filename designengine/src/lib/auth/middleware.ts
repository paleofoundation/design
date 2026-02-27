import { validateApiKey } from './api-key';
import { logToolUsage } from './usage-logger';

export function withAuthAndLogging(
  toolHandler: (params: Record<string, unknown>, context: Record<string, unknown>) => Promise<{
    content: Array<{ type: string; text?: string }>;
    isError?: boolean;
  }>,
  toolName: string
) {
  return async (
    params: Record<string, unknown>,
    context: Record<string, unknown>
  ) => {
    const startTime = Date.now();
    const authInfo = context?.authInfo as
      | { token?: string }
      | undefined;
    const apiKey = authInfo?.token;

    if (!apiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[${toolName}] No API key — running unauthenticated (dev mode)`
        );
        return toolHandler(params, context);
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            error: 'Missing API key',
            code: 'UNAUTHORIZED',
          }),
        }],
        isError: true,
      };
    }

    const auth = await validateApiKey(apiKey);

    if (!auth.valid) {
      await logToolUsage({
        apiKeyId: 'unknown',
        toolName,
        latencyMs: Date.now() - startTime,
        status: auth.error === 'Rate limit exceeded'
          ? 'rate_limited'
          : 'error',
        errorMessage: auth.error,
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            error: auth.error,
            code: auth.error === 'Rate limit exceeded'
              ? 'RATE_LIMITED'
              : 'UNAUTHORIZED',
          }),
        }],
        isError: true,
      };
    }

    try {
      const result =
        await toolHandler(params, context);
      const responseSize =
        JSON.stringify(result).length;

      await logToolUsage({
        apiKeyId: auth.keyId!,
        toolName,
        inputParams: params,
        responseSize,
        latencyMs: Date.now() - startTime,
        status: 'success',
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unknown error';

      await logToolUsage({
        apiKeyId: auth.keyId!,
        toolName,
        inputParams: params,
        latencyMs: Date.now() - startTime,
        status: 'error',
        errorMessage,
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            error: errorMessage,
            code: 'TOOL_ERROR',
          }),
        }],
        isError: true,
      };
    }
  };
}
