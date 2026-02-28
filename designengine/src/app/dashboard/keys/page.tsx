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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="mt-1 text-sm text-gray-400">
            Manage your API keys for accessing DesignEngine tools.
          </p>
        </div>
        <KeyActions userId={userId} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Prefix</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium">Last Used</th>
              <th className="px-6 py-3 font-medium text-right">Calls</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(!keys || keys.length === 0) && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No API keys yet. Create one to get started.
                </td>
              </tr>
            )}
            {keys?.map((k) => (
              <KeyRow
                key={k.id}
                apiKey={k}
                calls={callCounts[k.id] ?? 0}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeyRow({ apiKey, calls }: { apiKey: ApiKeyRow; calls: number }) {
  return (
    <tr className="text-gray-300">
      <td className="px-6 py-4 font-medium text-white">{apiKey.name}</td>
      <td className="px-6 py-4 font-mono text-xs text-gray-400">
        {apiKey.key_prefix}••••••••
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            apiKey.is_active
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              apiKey.is_active ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          />
          {apiKey.is_active ? 'Active' : 'Revoked'}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-400">
        {new Date(apiKey.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-gray-400">
        {apiKey.last_used_at
          ? new Date(apiKey.last_used_at).toLocaleDateString()
          : '—'}
      </td>
      <td className="px-6 py-4 text-right tabular-nums">{calls.toLocaleString()}</td>
      <td className="px-6 py-4 text-right">
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
        await admin
          .from('api_keys')
          .update({ is_active: false })
          .eq('id', keyId);
      }}
    >
      <button
        type="submit"
        className="text-red-400 hover:text-red-300 text-xs font-medium transition"
      >
        Revoke
      </button>
    </form>
  );
}
