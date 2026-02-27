import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import Stripe from 'stripe';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature =
    req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error
      ? err.message
      : 'Unknown error';
    console.error(
      'Webhook verification failed:', message
    );
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub =
        event.data.object as Stripe.Subscription;
      console.log(
        `Subscription ${event.type}: ${sub.id}`
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const sub =
        event.data.object as Stripe.Subscription;
      console.log(
        `Subscription cancelled: ${sub.id}`
      );
      break;
    }

    case 'invoice.paid': {
      const invoice =
        event.data.object as Stripe.Invoice;
      console.log(
        `Invoice paid: ${invoice.id}, ` +
        `amount: ${invoice.amount_paid}`
      );
      break;
    }

    case 'invoice.payment_failed': {
      const invoice =
        event.data.object as Stripe.Invoice;
      console.log(
        `Payment failed: ${invoice.id}`
      );
      break;
    }

    default:
      console.log(
        `Unhandled event: ${event.type}`
      );
  }

  return NextResponse.json({ received: true });
}
