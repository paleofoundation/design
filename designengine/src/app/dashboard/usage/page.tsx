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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Usage</h2>
          <p className="mt-1 text-sm text-gray-400">
            Monitor your API call volume, latency, and costs.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={toolFilter}
            onChange={(e) => setToolFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">All Tools</option>
            {TOOL_NAMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">
          Calls per day
          {data && (
            <span className="ml-2 text-white">
              — {data.totalCalls.toLocaleString()} total
            </span>
          )}
        </h3>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            Loading…
          </div>
        ) : !data?.dailyCalls?.length ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            No data for this period.
          </div>
        ) : (
          <div className="flex items-end gap-1 h-48">
            {data.dailyCalls.map((d) => {
              const pct = (d.count / maxCount) * 100;
              return (
                <div
                  key={d.date}
                  className="flex-1 group relative flex flex-col items-center justify-end"
                >
                  <div className="absolute -top-7 hidden group-hover:block bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                    {d.date}: {d.count} calls
                  </div>
                  <div
                    className="w-full rounded-t bg-indigo-600 hover:bg-indigo-500 transition-colors min-h-[2px]"
                    style={{ height: `${Math.max(pct, 1)}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-6 py-3 font-medium">Tool</th>
              <th className="px-6 py-3 font-medium text-right">Calls</th>
              <th className="px-6 py-3 font-medium text-right">Avg Latency</th>
              <th className="px-6 py-3 font-medium text-right">Error Rate</th>
              <th className="px-6 py-3 font-medium text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(!data?.toolBreakdown || data.toolBreakdown.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No usage data for this period.
                </td>
              </tr>
            )}
            {data?.toolBreakdown.map((t) => (
              <tr key={t.tool} className="text-gray-300">
                <td className="px-6 py-4 font-mono text-xs">{t.tool}</td>
                <td className="px-6 py-4 text-right tabular-nums">
                  {t.calls.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-gray-400">
                  {t.avgLatency}ms
                </td>
                <td className="px-6 py-4 text-right tabular-nums">
                  <span
                    className={
                      t.errorRate > 5
                        ? 'text-red-400'
                        : t.errorRate > 0
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                    }
                  >
                    {t.errorRate}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right tabular-nums">
                  ${(t.costCents / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          {data && data.toolBreakdown.length > 0 && (
            <tfoot>
              <tr className="border-t border-gray-700 text-white font-medium">
                <td className="px-6 py-3">Total</td>
                <td className="px-6 py-3 text-right tabular-nums">
                  {data.totalCalls.toLocaleString()}
                </td>
                <td className="px-6 py-3" />
                <td className="px-6 py-3" />
                <td className="px-6 py-3 text-right tabular-nums">
                  ${(data.totalCostCents / 100).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
