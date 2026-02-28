import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { KeyActions } from './key-actions';

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export default async function KeysPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? '';

  const { data: keys } = (await supabaseAdmin
    .from('api_keys')
    .select('id, name, key_prefix, is_active, created_at, last_used_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })) as {
    data: ApiKeyRow[] | null;
    error: unknown;
  };

  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);

  const callCounts: Record<string, number> = {};
  if (keys && keys.length > 0) {
    const keyIds = keys.map((k) => k.id);
    const { data: logs } = (await supabaseAdmin
      .from('usage_logs')
      .select('api_key_id')
      .in('api_key_id', keyIds)
      .eq('status', 'success')
      .gte('created_at', periodStart.toISOString())) as {
      data: Array<{ api_key_id: string }> | null;
      error: unknown;
    };
    for (const log of logs ?? []) {
      callCounts[log.api_key_id] = (callCounts[log.api_key_id] || 0) + 1;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 400,
            color: 'var(--color-text-on-green)',
            letterSpacing: '-0.02em',
          }}>
            API Keys
          </h2>
          <p style={{ marginTop: '0.25rem', fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.5)' }}>
            Manage your API keys for accessing DesignEngine tools.
          </p>
        </div>
        <KeyActions userId={userId} />
      </div>

      <div style={{
        background: 'var(--color-green-dark)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', fontSize: 'var(--text-sm)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', color: 'rgba(255, 255, 255, 0.5)' }}>
              <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Prefix</th>
              <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Created</th>
              <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Last Used</th>
              <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500, textAlign: 'right' }}>Calls</th>
              <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!keys || keys.length === 0) && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
                  No API keys yet. Create one to get started.
                </td>
              </tr>
            )}
            {keys?.map((k) => (
              <KeyRow key={k.id} apiKey={k} calls={callCounts[k.id] ?? 0} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeyRow({ apiKey, calls }: { apiKey: ApiKeyRow; calls: number }) {
  return (
    <tr style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.85)' }}>
      <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--color-text-on-green)' }}>{apiKey.name}</td>
      <td style={{ padding: '1rem 1.5rem', fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)', fontSize: 'var(--text-xs)', color: 'rgba(255, 255, 255, 0.5)' }}>
        {apiKey.key_prefix}••••••••
      </td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          borderRadius: '9999px',
          padding: '0.125rem 0.625rem',
          fontSize: 'var(--text-xs)',
          fontWeight: 500,
          background: apiKey.is_active ? 'color-mix(in srgb, var(--color-success) 10%, transparent)' : 'color-mix(in srgb, var(--color-error) 10%, transparent)',
          color: apiKey.is_active ? 'var(--color-success)' : 'var(--color-error)',
        }}>
          <span style={{
            width: '0.375rem',
            height: '0.375rem',
            borderRadius: '9999px',
            background: apiKey.is_active ? 'var(--color-success)' : 'var(--color-error)',
          }} />
          {apiKey.is_active ? 'Active' : 'Revoked'}
        </span>
      </td>
      <td style={{ padding: '1rem 1.5rem', color: 'rgba(255, 255, 255, 0.5)' }}>
        {new Date(apiKey.created_at).toLocaleDateString()}
      </td>
      <td style={{ padding: '1rem 1.5rem', color: 'rgba(255, 255, 255, 0.5)' }}>
        {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : '—'}
      </td>
      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{calls.toLocaleString()}</td>
      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
        {apiKey.is_active && <RevokeButton keyId={apiKey.id} />}
      </td>
    </tr>
  );
}

function RevokeButton({ keyId }: { keyId: string }) {
  return (
    <form
      action={async () => {
        'use server';
        const { supabaseAdmin: admin } = await import('@/lib/supabase/admin');
        await admin.from('api_keys').update({ is_active: false }).eq('id', keyId);
      }}
    >
      <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--color-error)', fontSize: 'var(--text-xs)', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
        Revoke
      </button>
    </form>
  );
}
