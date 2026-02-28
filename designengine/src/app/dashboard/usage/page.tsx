'use client';

import { useEffect, useState, useCallback } from 'react';

interface DailyCall {
  date: string;
  count: number;
}

interface ToolBreakdown {
  tool: string;
  calls: number;
  avgLatency: number;
  errorRate: number;
  costCents: number;
}

interface UsageData {
  dailyCalls: DailyCall[];
  toolBreakdown: ToolBreakdown[];
  totalCalls: number;
  totalCostCents: number;
}

const TOOL_NAMES = [
  'ingest_design',
  'search_design_patterns',
  'generate_font',
  'pair_typography',
  'convert_design_to_code',
];

const selectStyle: React.CSSProperties = {
  background: 'var(--color-green-dark)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 'var(--radius-md)',
  padding: '0.5rem 0.75rem',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-on-green)',
  outline: 'none',
  fontFamily: 'inherit',
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

export default function UsagePage() {
  const [days, setDays] = useState(30);
  const [toolFilter, setToolFilter] = useState('');
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ days: String(days) });
      if (toolFilter) params.set('tool', toolFilter);
      const res = await fetch(`/api/dashboard/usage?${params}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [days, toolFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const maxCount = data?.dailyCalls
    ? Math.max(...data.dailyCalls.map((d) => d.count), 1)
    : 1;

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
            Usage
          </h2>
          <p style={{ marginTop: '0.25rem', fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.5)' }}>
            Monitor your API call volume, latency, and costs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select value={toolFilter} onChange={(e) => setToolFilter(e.target.value)} style={selectStyle}>
            <option value="">All Tools</option>
            {TOOL_NAMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={selectStyle}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ ...cardStyle, padding: '1.5rem' }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1rem' }}>
          Calls per day
          {data && (
            <span style={{ marginLeft: '0.5rem', color: 'var(--color-text-on-green)' }}>
              — {data.totalCalls.toLocaleString()} total
            </span>
          )}
        </h3>
        {loading ? (
          <div style={{ height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.4)', fontSize: 'var(--text-sm)' }}>
            Loading…
          </div>
        ) : !data?.dailyCalls?.length ? (
          <div style={{ height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.4)', fontSize: 'var(--text-sm)' }}>
            No data for this period.
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '12rem' }}>
            {data.dailyCalls.map((d) => {
              const pct = (d.count / maxCount) * 100;
              return (
                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <div
                    style={{
                      width: '100%',
                      borderRadius: '2px 2px 0 0',
                      background: 'var(--color-orange)',
                      minHeight: '2px',
                      height: `${Math.max(pct, 1)}%`,
                      transition: 'height 0.3s ease',
                    }}
                    title={`${d.date}: ${d.count} calls`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown table */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: 'var(--text-sm)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', color: 'rgba(255, 255, 255, 0.5)' }}>
              <th style={thStyle}>Tool</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Calls</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Avg Latency</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Error Rate</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {(!data?.toolBreakdown || data.toolBreakdown.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
                  No usage data for this period.
                </td>
              </tr>
            )}
            {data?.toolBreakdown.map((t) => (
              <tr key={t.tool} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.85)' }}>
                <td style={{ ...tdStyle, fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)', fontSize: 'var(--text-xs)' }}>{t.tool}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{t.calls.toLocaleString()}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'rgba(255, 255, 255, 0.5)' }}>{t.avgLatency}ms</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ color: t.errorRate > 5 ? 'var(--color-error)' : t.errorRate > 0 ? 'var(--color-amber)' : 'var(--color-success)' }}>
                    {t.errorRate}%
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${(t.costCents / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          {data && data.toolBreakdown.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)', color: 'var(--color-text-on-green)', fontWeight: 500 }}>
                <td style={tdStyle}>Total</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{data.totalCalls.toLocaleString()}</td>
                <td style={tdStyle} />
                <td style={tdStyle} />
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${(data.totalCostCents / 100).toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
