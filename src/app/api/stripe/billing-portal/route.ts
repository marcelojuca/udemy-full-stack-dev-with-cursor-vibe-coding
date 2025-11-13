import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Stripe from 'stripe';
import { validateStripeEnv } from '@/lib/env-validation';

// Use placeholder during build time, but validate at runtime
const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_build_time_only';
const stripe = new Stripe(stripeSecretKey);

export async function POST(req: NextRequest) {
  // Validate environment variables at runtime before use
  validateStripeEnv();
  
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find customer by email in Stripe
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customerId = customers.data[0].id;

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboards`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 });
  }
}
