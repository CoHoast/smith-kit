import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// POST /api/billing/checkout - Create Stripe checkout session
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, plan, interval } = await request.json();

    if (!priceId || !plan || !interval) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate plan and price ID
    const validPlans = {
      pro: {
        monthly: process.env.STRIPE_PRO_PRICE_ID,
        annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
      },
      premium: {
        monthly: process.env.STRIPE_PREMIUM_PRICE_ID,
        annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
      }
    };

    if (!validPlans[plan as keyof typeof validPlans]?.[interval as 'monthly' | 'annual']) {
      return NextResponse.json({ error: 'Invalid plan or interval' }, { status: 400 });
    }

    if (priceId !== validPlans[plan as keyof typeof validPlans][interval as 'monthly' | 'annual']) {
      return NextResponse.json({ error: 'Price ID mismatch' }, { status: 400 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let customerId: string;

    // Create or retrieve Stripe customer
    if (currentSub?.stripe_customer_id) {
      customerId = currentSub.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.name || '',
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update subscription record with customer ID
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.smithkit.io'}/dashboard/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.smithkit.io'}/dashboard/settings?canceled=true`,
      metadata: {
        user_id: user.id,
        plan: plan,
        interval: interval,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: plan,
          interval: interval,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}