import { supabaseAdmin } from '@/lib/supabase/admin';
import type { UsageRecord } from '@/types/mcp';

export async function logUsage(record: UsageRecord): Promise<void> {
  await supabaseAdmin.from('usage_logs').insert({
    user_id: record.userId,
    tool_name: record.toolName,
    timestamp: record.timestamp,
    input_tokens: record.inputTokens,
    output_tokens: record.outputTokens,
    success: record.success,
    error_message: record.errorMessage,
  });
}
