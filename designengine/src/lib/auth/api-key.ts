import { supabaseAdmin } from '@/lib/supabase/admin';
import type { APIKeyValidation } from '@/types/mcp';

export async function validateApiKey(
  apiKey: string
): Promise<APIKeyValidation> {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('user_id, tier, rate_limit, is_active')
    .eq('key', apiKey)
    .single();

  if (error || !data || !data.is_active) {
    return { valid: false };
  }

  return {
    valid: true,
    userId: data.user_id,
    tier: data.tier,
    rateLimit: data.rate_limit,
  };
}
