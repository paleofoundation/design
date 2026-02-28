import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUsageSummary } from '@/lib/stripe/billing';
import Link from 'next/link';
import { PALETTE, DASH, FONT, RADIUS, TEXT_SIZE } from '@/lib/design-tokens';

export default async function DashboardOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? '';

  const { data: apiKeys } = (await supabaseAdmin
    .from('api_keys')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)) as {
    data: Array<{ id: string }> | null;
    error: unknown;
  };
  const activeKeyCount = apiKeys?.length ?? 0;

  const usage = await getUsageSummary(userId);

  const { data: recentLogs } = (await supabaseAdmin
    .from('usage_logs')
    .select('id, tool_name, status, latency_ms, created_at')
    .order('created_at', { ascending: false })
    .limit(10)) as {
    data: Array<{
      id: string;
      tool_name: string;
      status: string;
      latency_ms: number;
      created_at: string;
    }> | null;
    error: unknown;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <h2 style={{
          fontFamily: FONT.heading,
          fontSize: TEXT_SIZE['2xl'],
          fontWeight: 400,
          color: DASH.heading,
          letterSpacing: '-0.02em',
        }}>
          Welcome back
        </h2>
        <p style={{ marginTop: '0.25rem', fontSize: TEXT_SIZE.sm, color: DASH.muted }}>
          {user?.email}
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))' }}>
        <StatCard label="Total API Calls" value={usage.totalCalls.toLocaleString()} sub="This month" />
        <StatCard label="Active API Keys" value={String(activeKeyCount)} sub="Currently active" />
        <StatCard label="Current Spend" value={`$${(usage.totalCostCents / 100).toFixed(2)}`} sub="This billing period" />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link
          href="/dashboard/keys"
          style={{
            background: PALETTE.orange.base,
            color: PALETTE.text.onDark,
            borderRadius: RADIUS.md,
            padding: '0.5rem 1.25rem',
            fontSize: TEXT_SIZE.sm,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Create API Key
        </Link>
        <Link
          href="/dashboard/playground"
          style={{
            background: 'transparent',
            border: `1px solid ${DASH.cardBorder}`,
            color: PALETTE.green.deep,
            borderRadius: RADIUS.md,
            padding: '0.5rem 1.25rem',
            fontSize: TEXT_SIZE.sm,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Open Playground
        </Link>
      </div>

      <div style={{
        background: DASH.card,
        border: `1px solid ${DASH.cardBorder}`,
        borderRadius: RADIUS.lg,
        padding: '1.5rem',
      }}>
        <h3 style={{
          fontFamily: FONT.heading,
          fontSize: TEXT_SIZE.lg,
          fontWeight: 500,
          color: DASH.heading,
          marginBottom: '1rem',
        }}>
          Recent Activity
        </h3>
        {!recentLogs || recentLogs.length === 0 ? (
          <p style={{ fontSize: TEXT_SIZE.sm, color: DASH.faint }}>No activity yet.</p>
        ) : (
          <div>
            {recentLogs.map((log, i) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  fontSize: TEXT_SIZE.sm,
                  borderTop: i > 0 ? `1px solid ${DASH.divider}` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: RADIUS.full,
                    background: log.status === 'success'
                      ? PALETTE.semantic.success
                      : log.status === 'rate_limited'
                        ? PALETTE.amber.base
                        : PALETTE.semantic.error,
                  }} />
                  <span style={{ fontFamily: FONT.mono, color: DASH.body }}>
                    {log.tool_name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: DASH.muted }}>
                  <span>{log.latency_ms}ms</span>
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{
      background: DASH.card,
      border: `1px solid ${DASH.cardBorder}`,
      borderRadius: RADIUS.lg,
      padding: '1.5rem',
    }}>
      <p style={{ fontSize: TEXT_SIZE.sm, color: DASH.muted }}>{label}</p>
      <p style={{ marginTop: '0.5rem', fontSize: TEXT_SIZE['3xl'], fontWeight: 700, color: PALETTE.green.deep }}>{value}</p>
      <p style={{ marginTop: '0.25rem', fontSize: TEXT_SIZE.sm, color: DASH.faint }}>{sub}</p>
    </div>
  );
}
