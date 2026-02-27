import { createClient } from '@/lib/supabase/server';
import { getUsageSummary, TOOL_PRICING } from '@/lib/stripe/billing';

const TOOL_LABELS: Record<string, string> = {
  ingest_design: 'Ingest Design',
  search_design_patterns: 'Search Design Patterns',
  generate_font: 'Generate Font',
  pair_typography: 'Pair Typography',
  convert_design_to_code: 'Convert Design to Code',
};

export default async function BillingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? '';

  const usage = await getUsageSummary(userId);

  const periodStartDate = new Date(usage.periodStart);
  const now = new Date();
  const daysElapsed = Math.max(
    1,
    Math.ceil((now.getTime() - periodStartDate.getTime()) / 86_400_000)
  );
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedCents = Math.round(
    (usage.totalCostCents / daysElapsed) * daysInMonth
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Billing</h2>
        <p className="mt-1 text-sm text-gray-400">
          Monitor costs and manage your payment method.
        </p>
      </div>

      {/* Plan & summary */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400">Current Plan</p>
          <p className="mt-2 text-2xl font-bold">Pay-as-you-go</p>
          <p className="mt-1 text-sm text-gray-500">Billed monthly per API call</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400">Current Period Spend</p>
          <p className="mt-2 text-2xl font-bold">
            ${(usage.totalCostCents / 100).toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {usage.totalCalls.toLocaleString()} calls this month
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400">Projected Monthly Cost</p>
          <p className="mt-2 text-2xl font-bold">
            ${(projectedCents / 100).toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Based on {daysElapsed} days of usage
          </p>
        </div>
      </div>

      {/* Pricing table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="font-semibold">Per-Tool Pricing</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-6 py-3 font-medium">Tool</th>
              <th className="px-6 py-3 font-medium text-right">Price per call</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {Object.entries(TOOL_PRICING).map(([tool, cents]) => (
              <tr key={tool} className="text-gray-300">
                <td className="px-6 py-3">{TOOL_LABELS[tool] ?? tool}</td>
                <td className="px-6 py-3 text-right tabular-nums font-mono">
                  ${(cents / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Period breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="font-semibold">Current Period Breakdown</h3>
          <p className="text-xs text-gray-500 mt-1">
            {periodStartDate.toLocaleDateString()} —{' '}
            {now.toLocaleDateString()}
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-6 py-3 font-medium">Tool</th>
              <th className="px-6 py-3 font-medium text-right">Calls</th>
              <th className="px-6 py-3 font-medium text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {Object.keys(usage.breakdown).length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No usage this period.
                </td>
              </tr>
            )}
            {Object.entries(usage.breakdown).map(([tool, stats]) => (
              <tr key={tool} className="text-gray-300">
                <td className="px-6 py-3">{TOOL_LABELS[tool] ?? tool}</td>
                <td className="px-6 py-3 text-right tabular-nums">
                  {stats.calls.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right tabular-nums">
                  ${(stats.costCents / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          {Object.keys(usage.breakdown).length > 0 && (
            <tfoot>
              <tr className="border-t border-gray-700 text-white font-medium">
                <td className="px-6 py-3">Total</td>
                <td className="px-6 py-3 text-right tabular-nums">
                  {usage.totalCalls.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right tabular-nums">
                  ${(usage.totalCostCents / 100).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Payment management */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Payment Method</h3>
          <p className="text-sm text-gray-400 mt-1">
            Manage your payment method and billing details via Stripe.
          </p>
        </div>
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/portal`}
          className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-4 py-2 text-sm font-medium transition shrink-0"
        >
          Manage Payment Method
        </a>
      </div>
    </div>
  );
}
