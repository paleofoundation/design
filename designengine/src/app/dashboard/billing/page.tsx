import { createClient } from '@/lib/supabase/server';
import { getUsageSummary, TOOL_PRICING } from '@/lib/stripe/billing';

const TOOL_LABELS: Record<string, string> = {
  ingest_design: 'Ingest Design',
  search_design_patterns: 'Search Design Patterns',
  generate_font: 'Generate Font',
  pair_typography: 'Pair Typography',
  convert_design_to_code: 'Convert Design to Code',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-green-dark)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 'var(--radius-md)',
};

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  fontWeight: 500,
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
};

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? '';

  const usage = await getUsageSummary(userId);

  const periodStartDate = new Date(usage.periodStart);
  const now = new Date();
  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - periodStartDate.getTime()) / 86_400_000));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedCents = Math.round((usage.totalCostCents / daysElapsed) * daysInMonth);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 400,
          color: 'var(--color-text-on-green)',
          letterSpacing: '-0.02em',
        }}>
          Billing
        </h2>
        <p style={{ marginTop: '0.25rem', fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.5)' }}>
          Monitor costs and manage your payment method.
        </p>
      </div>

      {/* Plan & summary */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))' }}>
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.6)' }}>Current Plan</p>
          <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-on-green)' }}>Pay-as-you-go</p>
          <p style={{ marginTop: '0.25rem', fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.4)' }}>Billed monthly per API call</p>
        </div>
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.6)' }}>Current Period Spend</p>
          <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-on-green)' }}>
            ${(usage.totalCostCents / 100).toFixed(2)}
          </p>
          <p style={{ marginTop: '0.25rem', fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.4)' }}>
            {usage.totalCalls.toLocaleString()} calls this month
          </p>
        </div>
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.6)' }}>Projected Monthly Cost</p>
          <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-on-green)' }}>
            ${(projectedCents / 100).toFixed(2)}
          </p>
          <p style={{ marginTop: '0.25rem', fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.4)' }}>
            Based on {daysElapsed} days of usage
          </p>
        </div>
      </div>

      {/* Pricing table */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 style={{ fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)', fontWeight: 500, color: 'var(--color-text-on-green)' }}>Per-Tool Pricing</h3>
        </div>
        <table style={{ width: '100%', fontSize: 'var(--text-sm)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', color: 'rgba(255, 255, 255, 0.5)' }}>
              <th style={thStyle}>Tool</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Price per call</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(TOOL_PRICING).map(([tool, cents]) => (
              <tr key={tool} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.85)' }}>
                <td style={tdStyle}>{TOOL_LABELS[tool] ?? tool}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)' }}>
                  ${(cents / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Period breakdown */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 style={{ fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)', fontWeight: 500, color: 'var(--color-text-on-green)' }}>Current Period Breakdown</h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255, 255, 255, 0.4)', marginTop: '0.25rem' }}>
            {periodStartDate.toLocaleDateString()} — {now.toLocaleDateString()}
          </p>
        </div>
        <table style={{ width: '100%', fontSize: 'var(--text-sm)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', color: 'rgba(255, 255, 255, 0.5)' }}>
              <th style={thStyle}>Tool</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Calls</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(usage.breakdown).length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
                  No usage this period.
                </td>
              </tr>
            )}
            {Object.entries(usage.breakdown).map(([tool, stats]) => (
              <tr key={tool} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.85)' }}>
                <td style={tdStyle}>{TOOL_LABELS[tool] ?? tool}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{stats.calls.toLocaleString()}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${(stats.costCents / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          {Object.keys(usage.breakdown).length > 0 && (
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)', color: 'var(--color-text-on-green)', fontWeight: 500 }}>
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
          <h3 style={{ fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)', fontWeight: 500, color: 'var(--color-text-on-green)' }}>Payment Method</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
            Manage your payment method and billing details via Stripe.
          </p>
        </div>
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/portal`}
          style={{
            background: 'var(--color-orange)',
            color: 'var(--color-text-on-dark)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem',
            fontSize: 'var(--text-sm)',
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
