import { createClient } from '@/lib/supabase/server';
import { getUsageSummary, TOOL_PRICING } from '@/lib/stripe/billing';
import { PALETTE, DASH, FONT, RADIUS, TEXT_SIZE } from '@/lib/design-tokens';

const TOOL_LABELS: Record<string, string> = {
  ingest_design: 'Ingest Design',
  search_design_patterns: 'Search Design Patterns',
  generate_font: 'Generate Font',
  pair_typography: 'Pair Typography',
  convert_design_to_code: 'Convert Design to Code',
};

const thStyle: React.CSSProperties = { padding: '0.75rem 1.5rem', fontWeight: 500 };
const tdStyle: React.CSSProperties = { padding: '0.75rem 1.5rem' };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? '';
  const usage = await getUsageSummary(userId);

  const periodStartDate = new Date(usage.periodStart);
  const now = new Date();
  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - periodStartDate.getTime()) / 86_400_000));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedCents = Math.round((usage.totalCostCents / daysElapsed) * daysInMonth);

  const cardStyle: React.CSSProperties = {
    background: DASH.card,
    border: `1px solid ${DASH.cardBorder}`,
    borderRadius: RADIUS.lg,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontFamily: FONT.heading, fontSize: TEXT_SIZE['2xl'], fontWeight: 400, color: DASH.heading, letterSpacing: '-0.02em' }}>Billing</h2>
        <p style={{ marginTop: '0.25rem', fontSize: TEXT_SIZE.sm, color: DASH.muted }}>Monitor costs and manage your payment method.</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))' }}>
        {[
          { label: 'Current Plan', value: 'Pay-as-you-go', sub: 'Billed monthly per API call' },
          { label: 'Current Period Spend', value: `$${(usage.totalCostCents / 100).toFixed(2)}`, sub: `${usage.totalCalls.toLocaleString()} calls this month` },
          { label: 'Projected Monthly Cost', value: `$${(projectedCents / 100).toFixed(2)}`, sub: `Based on ${daysElapsed} days of usage` },
        ].map((c) => (
          <div key={c.label} style={{ ...cardStyle, padding: '1.5rem' }}>
            <p style={{ fontSize: TEXT_SIZE.sm, color: DASH.muted }}>{c.label}</p>
            <p style={{ marginTop: '0.5rem', fontSize: TEXT_SIZE['2xl'], fontWeight: 700, color: PALETTE.green.deep }}>{c.value}</p>
            <p style={{ marginTop: '0.25rem', fontSize: TEXT_SIZE.sm, color: DASH.faint }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Pricing table */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${DASH.dividerStrong}` }}>
          <h3 style={{ fontFamily: FONT.heading, fontWeight: 500, color: DASH.heading }}>Per-Tool Pricing</h3>
        </div>
        <table style={{ width: '100%', fontSize: TEXT_SIZE.sm, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${DASH.dividerStrong}`, textAlign: 'left', color: DASH.muted, background: DASH.tableHeaderBg }}>
              <th style={thStyle}>Tool</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Price per call</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(TOOL_PRICING).map(([tool, cents]) => (
              <tr key={tool} style={{ borderTop: `1px solid ${DASH.divider}`, color: DASH.body }}>
                <td style={tdStyle}>{TOOL_LABELS[tool] ?? tool}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: FONT.mono }}>${(cents / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Period breakdown */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${DASH.dividerStrong}` }}>
          <h3 style={{ fontFamily: FONT.heading, fontWeight: 500, color: DASH.heading }}>Current Period Breakdown</h3>
          <p style={{ fontSize: TEXT_SIZE.xs, color: DASH.faint, marginTop: '0.25rem' }}>
            {periodStartDate.toLocaleDateString()} — {now.toLocaleDateString()}
          </p>
        </div>
        <table style={{ width: '100%', fontSize: TEXT_SIZE.sm, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${DASH.dividerStrong}`, textAlign: 'left', color: DASH.muted, background: DASH.tableHeaderBg }}>
              <th style={thStyle}>Tool</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Calls</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(usage.breakdown).length === 0 && (
              <tr><td colSpan={3} style={{ padding: '2rem 1.5rem', textAlign: 'center', color: DASH.faint }}>No usage this period.</td></tr>
            )}
            {Object.entries(usage.breakdown).map(([tool, stats]) => (
              <tr key={tool} style={{ borderTop: `1px solid ${DASH.divider}`, color: DASH.body }}>
                <td style={tdStyle}>{TOOL_LABELS[tool] ?? tool}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{stats.calls.toLocaleString()}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${(stats.costCents / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          {Object.keys(usage.breakdown).length > 0 && (
            <tfoot>
              <tr style={{ borderTop: `1px solid ${DASH.dividerStrong}`, color: DASH.heading, fontWeight: 500 }}>
                <td style={tdStyle}>Total</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{usage.totalCalls.toLocaleString()}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${(usage.totalCostCents / 100).toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Payment management */}
      <div style={{ ...cardStyle, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontFamily: FONT.heading, fontWeight: 500, color: DASH.heading }}>Payment Method</h3>
          <p style={{ fontSize: TEXT_SIZE.sm, color: DASH.muted, marginTop: '0.25rem' }}>Manage your payment method and billing details via Stripe.</p>
        </div>
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/portal`}
          style={{
            background: PALETTE.orange.base,
            color: PALETTE.text.onDark,
            borderRadius: RADIUS.md,
            padding: '0.5rem 1.25rem',
            fontSize: TEXT_SIZE.sm,
            fontWeight: 500,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          Manage Payment Method
        </a>
      </div>
    </div>
  );
}
