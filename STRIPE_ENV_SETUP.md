# Stripe Environment Setup

## Required Environment Variables

Add these to your Railway project environment:

```bash
STRIPE_SECRET_KEY=sk_live_51Suz...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51Suz...

# Product Price IDs (already created)
STRIPE_PRO_PRICE_ID=price_1TQqRuHIQeD4K0rw067OwHLN
STRIPE_PRO_ANNUAL_PRICE_ID=price_1TQqRuHIQeD4K0rwWHcSZqkB
STRIPE_PREMIUM_PRICE_ID=price_1TQqRuHIQeD4K0rwGESBecvq
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_1TQqRvHIQeD4K0rwPLA6XqRL

# Webhook (set after creating endpoint)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://smith-kit-production.up.railway.app/api/billing/webhook`
3. Listen for these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret and add as `STRIPE_WEBHOOK_SECRET`

## Products Created ✅

- **Pro Monthly**: $39.99/month
- **Pro Annual**: $29.99/month (billed annually)
- **Premium Monthly**: $99.99/month  
- **Premium Annual**: $74.99/month (billed annually)

All products are already created in your Stripe account!