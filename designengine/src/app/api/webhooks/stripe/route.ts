import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        // TODO: provision API key / upgrade tier
        break;
      case 'customer.subscription.updated':
        // TODO: update subscription tier
        break;
      case 'customer.subscription.deleted':
        // TODO: downgrade to free tier
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown webhook error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
