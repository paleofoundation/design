import { createHash, randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

export function generateApiKey(): {
  key: string;
  hash: string;
  prefix: string;
} {
  const key =
    `de_live_${randomBytes(32).toString('hex')}`;
  const hash = createHash('sha256')
    .update(key).digest('hex');
  const prefix = key.substring(0, 12);
  return { key, hash, prefix };
}

export async function validateApiKey(
  apiKey: string
): Promise<{
  valid: boolean;
  keyId?: string;
  userId?: string;
  permissions?: string[];
  rateLimit?: number;
  error?: string;
}> {
  if (!apiKey || !apiKey.startsWith('de_live_')) {
    return {
      valid: false,
      error: 'Invalid API key format',
    };
  }

  const hash = createHash('sha256')
    .update(apiKey).digest('hex');

  interface ApiKeyRow {
    id: string;
    user_id: string;
    permissions: string[];
    rate_limit: number;
    is_active: boolean;
    expires_at: string | null;
  }

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select(
      'id, user_id, permissions, rate_limit, ' +
      'is_active, expires_at'
    )
    .eq('key_hash', hash)
    .single() as unknown as { data: ApiKeyRow | null; error: { message: string } | null };

  if (error || !data) {
    return {
      valid: false,
      error: 'API key not found',
    };
  }

  if (!data.is_active) {
    return {
      valid: false,
      error: 'API key is deactivated',
    };
  }

  if (
    data.expires_at &&
    new Date(data.expires_at) < new Date()
  ) {
    return {
      valid: false,
      error: 'API key has expired',
    };
  }

  const oneMinuteAgo = new Date(
    Date.now() - 60_000
  ).toISOString();

  const { count } = await supabaseAdmin
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', data.id)
    .gte('created_at', oneMinuteAgo);

  if ((count ?? 0) >= data.rate_limit) {
    return {
      valid: false,
      error: 'Rate limit exceeded',
    };
  }

  await supabaseAdmin
    .from('api_keys')
    .update({
      last_used_at: new Date().toISOString(),
    })
    .eq('id', data.id);

  return {
    valid: true,
    keyId: data.id,
    userId: data.user_id,
    permissions: data.permissions,
    rateLimit: data.rate_limit,
  };
}
