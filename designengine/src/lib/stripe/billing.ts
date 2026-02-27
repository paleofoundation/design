import { stripe } from './client';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const TOOL_PRICING: Record<string, number> = {
  ingest_design: 10,
  search_design_patterns: 2,
  generate_font: 5,
  pair_typography: 5,
  convert_design_to_code: 25,
};

export async function createStripeCustomer(params: {
  userId: string;
  email: string;
  name?: string;
}): Promise<string> {
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      supabase_user_id: params.userId,
    },
  });
  return customer.id;
}

export async function createMeteredSubscription(
  params: {
    customerId: string;
    priceId: string;
  }
): Promise<string> {
  const subscription =
    await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method:
          'on_subscription',
      },
    });
  return subscription.id;
}

export async function reportUsage(params: {
  subscriptionItemId: string;
  toolName: string;
  quantity?: number;
  timestamp?: number;
}): Promise<void> {
  await stripe.billing.meterEvents.create({
    event_name: 'designengine_api_call',
    payload: {
      value: String(params.quantity || 1),
      stripe_customer_id:
        params.subscriptionItemId,
    },
    timestamp: params.timestamp
      || Math.floor(Date.now() / 1000),
  });
}

export async function getUsageSummary(
  userId: string
): Promise<{
  totalCalls: number;
  totalCostCents: number;
  breakdown: Record<string, {
    calls: number;
    costCents: number;
  }>;
  periodStart: string;
  periodEnd: string;
}> {
  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);

  const { data: apiKeys } = await supabaseAdmin
    .from('api_keys')
    .select('id')
    .eq('user_id', userId) as {
      data: Array<{ id: string }> | null;
      error: unknown;
    };

  const keyIds =
    (apiKeys || []).map((k) => k.id);

  if (keyIds.length === 0) {
    return {
      totalCalls: 0,
      totalCostCents: 0,
      breakdown: {},
      periodStart: periodStart.toISOString(),
      periodEnd: new Date().toISOString(),
    };
  }

  const { data: logs } = await supabaseAdmin
    .from('usage_logs')
    .select('tool_name, status')
    .in('api_key_id', keyIds)
    .eq('status', 'success')
    .gte('created_at', periodStart.toISOString()) as {
      data: Array<{ tool_name: string; status: string }> | null;
      error: unknown;
    };

  const breakdown: Record<string, {
    calls: number;
    costCents: number;
  }> = {};
  let totalCalls = 0;
  let totalCostCents = 0;

  for (const log of logs || []) {
    const tool = log.tool_name;
    const cost = TOOL_PRICING[tool] || 0;

    if (!breakdown[tool]) {
      breakdown[tool] = { calls: 0, costCents: 0 };
    }

    breakdown[tool].calls++;
    breakdown[tool].costCents += cost;
    totalCalls++;
    totalCostCents += cost;
  }

  return {
    totalCalls,
    totalCostCents,
    breakdown,
    periodStart: periodStart.toISOString(),
    periodEnd: new Date().toISOString(),
  };
}
