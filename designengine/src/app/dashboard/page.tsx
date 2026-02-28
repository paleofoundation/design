import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUsageSummary } from '@/lib/stripe/billing';
import Link from 'next/link';

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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-400">{user?.email}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Total API Calls"
          value={usage.totalCalls.toLocaleString()}
          sub="This month"
        />
        <StatCard
          label="Active API Keys"
          value={String(activeKeyCount)}
          sub="Currently active"
        />
        <StatCard
          label="Current Spend"
          value={`$${(usage.totalCostCents / 100).toFixed(2)}`}
          sub="This billing period"
        />
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard/keys"
          className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-4 py-2 text-sm font-medium transition"
        >
          Create API Key
        </Link>
        <Link
          href="/dashboard/playground"
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition"
        >
          Open Playground
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {!recentLogs || recentLogs.length === 0 ? (
          <p className="text-sm text-gray-500">No activity yet.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.status === 'success'
                        ? 'bg-emerald-500'
                        : log.status === 'rate_limited'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <span className="font-mono text-gray-300">{log.tool_name}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
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

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{sub}</p>
    </div>
  );
}
