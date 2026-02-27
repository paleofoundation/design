import { supabaseAdmin } from '@/lib/supabase/admin';

export async function logToolUsage(params: {
  apiKeyId: string;
  toolName: string;
  inputParams?: object;
  responseSize?: number;
  latencyMs: number;
  status: 'success' | 'error' | 'rate_limited';
  errorMessage?: string;
}): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('usage_logs')
    .insert({
      api_key_id: params.apiKeyId,
      tool_name: params.toolName,
      input_params: params.inputParams || null,
      response_size: params.responseSize || null,
      latency_ms: params.latencyMs,
      status: params.status,
      error_message: params.errorMessage || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error(
      'Failed to log usage:', error.message
    );
    return null;
  }

  return data?.id || null;
}
