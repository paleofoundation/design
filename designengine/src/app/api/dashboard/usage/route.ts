import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { TOOL_PRICING } from '@/lib/stripe/billing';

interface UsageLogRow {
  tool_name: string;
  status: string;
  latency_ms: number;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const days = Number(req.nextUrl.searchParams.get('days') || '30');
  const toolFilter = req.nextUrl.searchParams.get('tool') || '';

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: apiKeys } = (await supabaseAdmin
    .from('api_keys')
    .select('id')
    .eq('user_id', user.id)) as {
    data: Array<{ id: string }> | null;
    error: unknown;
  };

  const keyIds = (apiKeys || []).map((k) => k.id);

  if (keyIds.length === 0) {
    return NextResponse.json({
      dailyCalls: [],
      toolBreakdown: [],
      totalCalls: 0,
      totalCostCents: 0,
    });
  }

  let query = supabaseAdmin
    .from('usage_logs')
    .select('tool_name, status, latency_ms, created_at')
    .in('api_key_id', keyIds)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  if (toolFilter) {
    query = query.eq('tool_name', toolFilter);
  }

  const { data: logs } = (await query) as {
    data: UsageLogRow[] | null;
    error: unknown;
  };

  const dailyMap: Record<string, number> = {};
  const toolMap: Record<
    string,
    { calls: number; errors: number; totalLatency: number; costCents: number }
  > = {};

  for (const log of logs ?? []) {
    const day = log.created_at.substring(0, 10);
    dailyMap[day] = (dailyMap[day] || 0) + 1;

    if (!toolMap[log.tool_name]) {
      toolMap[log.tool_name] = { calls: 0, errors: 0, totalLatency: 0, costCents: 0 };
    }
    const t = toolMap[log.tool_name];
    t.calls++;
    t.totalLatency += log.latency_ms;
    if (log.status === 'error') t.errors++;
    if (log.status === 'success') {
      t.costCents += TOOL_PRICING[log.tool_name] || 0;
    }
  }

  const dailyCalls = Object.entries(dailyMap).map(([date, count]) => ({
    date,
    count,
  }));

  const toolBreakdown = Object.entries(toolMap).map(([tool, stats]) => ({
    tool,
    calls: stats.calls,
    avgLatency: stats.calls > 0 ? Math.round(stats.totalLatency / stats.calls) : 0,
    errorRate: stats.calls > 0 ? Number(((stats.errors / stats.calls) * 100).toFixed(1)) : 0,
    costCents: stats.costCents,
  }));

  const totalCalls = (logs ?? []).length;
  const totalCostCents = toolBreakdown.reduce((sum, t) => sum + t.costCents, 0);

  return NextResponse.json({
    dailyCalls,
    toolBreakdown,
    totalCalls,
    totalCostCents,
  });
}
