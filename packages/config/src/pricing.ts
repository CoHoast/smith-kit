/**
 * SMITHKIT PRICING CONFIGURATION
 * 
 * Bundle-only pricing. All tools included in every plan.
 * Early adopters are grandfathered in forever.
 */

export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  stripePriceId?: string;
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'For side projects',
    cta: 'Get Started',
    features: [
      'All 3 tools included',
      '1 repo (Changelog)',
      '3 monitors (Uptime)',
      '30 commits/mo (CommitBot)',
      '7-day history',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 39,
    description: 'For serious builders',
    cta: 'Start Free Trial',
    popular: true,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'All current + future tools',
      '10 repos (Changelog)',
      '50 monitors (Uptime)',
      '500 commits/mo (CommitBot)',
      '30-day history',
      '1 custom domain',
    ],
  },
  team: {
    id: 'team',
    name: 'Team',
    price: 99,
    description: 'For growing teams',
    cta: 'Start Free Trial',
    stripePriceId: process.env.STRIPE_TEAM_PRICE_ID,
    features: [
      'All current + future tools',
      '50 repos (Changelog)',
      '200 monitors (Uptime)',
      '2,000 commits/mo (CommitBot)',
      'Up to 5 team members',
      '90-day history',
      '10 custom domains',
    ],
  },
};

// Usage limits by plan
export const LIMITS = {
  free: {
    repos: 1,
    monitors: 3,
    commits_per_month: 30,
    team_members: 1,
    history_days: 7,
    custom_domains: 0,
  },
  pro: {
    repos: 10,
    monitors: 50,
    commits_per_month: 500,
    team_members: 1,
    history_days: 30,
    custom_domains: 1,
  },
  team: {
    repos: 50,
    monitors: 200,
    commits_per_month: 2000,
    team_members: 5,
    history_days: 90,
    custom_domains: 10,
  },
};

// Helper functions
export const getPlan = (planId: string) => PLANS[planId] || PLANS.free;
export const getPlanLimits = (planId: string) => LIMITS[planId as keyof typeof LIMITS] || LIMITS.free;
export const getAllPlans = () => Object.values(PLANS);

// Check if usage is within limits
export const isWithinLimit = (
  planId: string,
  metric: keyof typeof LIMITS.free,
  currentUsage: number
): boolean => {
  const limits = getPlanLimits(planId);
  const limit = limits[metric];
  if (limit === -1) return true; // Unlimited
  return currentUsage < limit;
};

// Get remaining usage
export const getRemainingUsage = (
  planId: string,
  metric: keyof typeof LIMITS.free,
  currentUsage: number
): number => {
  const limits = getPlanLimits(planId);
  const limit = limits[metric];
  if (limit === -1) return Infinity;
  return Math.max(0, limit - currentUsage);
};
