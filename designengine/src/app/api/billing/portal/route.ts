import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { createStripeCustomer } from '@/lib/stripe/billing';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'https://www.dzyne.app'),
      );
    }

    let customerId: string | undefined;

    const customers = await stripe.customers.search({
      query: `metadata["supabase_user_id"]:"${user.id}"`,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    if (!customerId) {
      const byEmail = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      if (byEmail.data.length > 0) {
        customerId = byEmail.data[0].id;
      }
    }

    if (!customerId) {
      customerId = await createStripeCustomer({
        userId: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name,
      });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.dzyne.app'}/dashboard/billing`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.redirect(session.url);
  } catch (err) {
    console.error('Billing portal error:', err);
    return NextResponse.redirect(
      new URL('/dashboard/billing', process.env.NEXT_PUBLIC_APP_URL || 'https://www.dzyne.app'),
    );
  }
}
