import { NextResponse } from 'next/server';

// GET /api/billing/price-ids - Get Stripe price IDs
export async function GET() {
  return NextResponse.json({
    priceIds: {
      pro: {
        monthly: process.env.STRIPE_PRO_PRICE_ID,
        annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
      },
      premium: {
        monthly: process.env.STRIPE_PREMIUM_PRICE_ID,
        annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
      }
    }
  });
}