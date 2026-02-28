'use client';

import { useEffect, useState, useCallback } from 'react';
import { PALETTE, DASH, FONT, RADIUS, TEXT_SIZE } from '@/lib/design-tokens';

interface DailyCall { date: string; count: number; }
interface ToolBreakdown { tool: string; calls: number; avgLatency: number; errorRate: number; costCents: number; }
interface UsageData { dailyCalls: DailyCall[]; toolBreakdown: ToolBreakdown[]; totalCalls: number; totalCostCents: number; }

const TOOL_NAMES = ['ingest_design', 'search_design_patterns', 'generate_font', 'pair_typography', 'convert_design_to_code'];

const selectStyle: React.CSSProperties = {
  background: DASH.inputBg,
  border: `1px solid ${DASH.inputBorder}`,
  borderRadius: RADIUS.md,
  padding: '0.5rem 0.75rem',
  fontSize: TEXT_SIZE.sm,
  color: DASH.heading,
  outline: 'none',
  fontFamily: 'inherit',
};

const thStyle: React.CSSProperties = { padding: '0.75rem 1.5rem', fontWeight: 500 };
const tdStyle: React.CSSProperties = { padding: '0.75rem 1.5rem' };

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

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxCount = data?.dailyCalls ? Math.max(...data.dailyCalls.map((d) => d.count), 1) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: FONT.heading, fontSize: TEXT_SIZE['2xl'], fontWeight: 400, color: DASH.heading, letterSpacing: '-0.02em' }}>Usage</h2>
          <p style={{ marginTop: '0.25rem', fontSize: TEXT_SIZE.sm, color: DASH.muted }}>Monitor your API call volume, latency, and costs.</p>
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
      <div style={{ background: DASH.card, border: `1px solid ${DASH.cardBorder}`, borderRadius: RADIUS.lg, padding: '1.5rem' }}>
        <h3 style={{ fontSize: TEXT_SIZE.sm, fontWeight: 500, color: DASH.muted, marginBottom: '1rem' }}>
          Calls per day
          {data && <span style={{ marginLeft: '0.5rem', color: DASH.heading }}>— {data.totalCalls.toLocaleString()} total</span>}
        </h3>
        {loading ? (
          <div style={{ height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DASH.faint, fontSize: TEXT_SIZE.sm }}>Loading…</div>
        ) : !data?.dailyCalls?.length ? (
          <div style={{ height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DASH.faint, fontSize: TEXT_SIZE.sm }}>No data for this period.</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '12rem', background: DASH.tableHeaderBg, borderRadius: RADIUS.sm, padding: '0.5rem' }}>
            {data.dailyCalls.map((d) => {
              const pct = (d.count / maxCount) * 100;
              return (
                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <div
                    style={{ width: '100%', borderRadius: '2px 2px 0 0', background: PALETTE.orange.base, minHeight: '2px', height: `${Math.max(pct, 1)}%`, transition: 'height 0.3s ease' }}
                    title={`${d.date}: ${d.count} calls`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown table */}
      <div style={{ background: DASH.card, border: `1px solid ${DASH.cardBorder}`, borderRadius: RADIUS.lg, overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: TEXT_SIZE.sm, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${DASH.dividerStrong}`, textAlign: 'left', color: DASH.muted, background: DASH.tableHeaderBg }}>
              <th style={thStyle}>Tool</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Calls</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Avg Latency</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Error Rate</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {(!data?.toolBreakdown || data.toolBreakdown.length === 0) && (
              <tr><td colSpan={5} style={{ padding: '2rem 1.5rem', textAlign: 'center', color: DASH.faint }}>No usage data for this period.</td></tr>
            )}
            {data?.toolBreakdown.map((t) => (
              <tr key={t.tool} style={{ borderTop: `1px solid ${DASH.divider}`, color: DASH.body }}>
                <td style={{ ...tdStyle, fontFamily: FONT.mono, fontSize: TEXT_SIZE.xs }}>{t.tool}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{t.calls.toLocaleString()}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: DASH.muted }}>{t.avgLatency}ms</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ color: t.errorRate > 5 ? PALETTE.semantic.error : t.errorRate > 0 ? PALETTE.amber.base : PALETTE.semantic.success }}>{t.errorRate}%</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${(t.costCents / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          {data && data.toolBreakdown.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: `1px solid ${DASH.dividerStrong}`, color: DASH.heading, fontWeight: 500 }}>
                <td style={tdStyle}>Total</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{data.totalCalls.toLocaleString()}</td>
                <td style={tdStyle} /><td style={tdStyle} />
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${(data.totalCostCents / 100).toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
