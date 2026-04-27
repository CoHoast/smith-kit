import { createClient } from '@/lib/supabase/server';
import { PLAN_LIMITS, type Plan } from '@/lib/plan-limits';

export interface PlanCheck {
  allowed: boolean;
  current: number;
  limit: number;
  plan: Plan;
  upgradeRequired?: boolean;
}

export class PlanEnforcement {
  private supabase;
  
  constructor() {
    this.supabase = createClient();
  }

  async getUserPlan(userId: string): Promise<Plan> {
    const { data: subscription } = await this.supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .single();

    if (!subscription || subscription.status !== 'active') {
      return 'free';
    }

    return subscription.plan as Plan;
  }

  async checkCommitBotLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: usage } = await this.supabase
      .from('usage')
      .select('count')
      .eq('user_id', userId)
      .eq('tool', 'commitbot')
      .eq('metric', 'commits')
      .gte('period_start', startOfMonth.toISOString().split('T')[0])
      .single();

    const current = usage?.count || 0;
    const limit = limits.commitbot.commits_per_month;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan === 'free'
    };
  }

  async checkUptimeMonitorLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const { count } = await this.supabase
      .from('uptime_monitors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    const current = count || 0;
    const limit = limits.uptime.monitors;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan !== 'premium'
    };
  }

  async checkToggleBoxProjectLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const { count } = await this.supabase
      .from('togglebox_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const current = count || 0;
    const limit = limits.togglebox.projects;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan !== 'premium'
    };
  }

  async checkChangelogRepoLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const { count } = await this.supabase
      .from('changelog_repos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const current = count || 0;
    const limit = limits.changelog.repos;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan !== 'premium'
    };
  }

  async checkEventLogProjectLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const { count } = await this.supabase
      .from('eventlog_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const current = count || 0;
    const limit = limits.eventlog.projects;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan !== 'premium'
    };
  }

  async checkErrorWatchProjectLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const { count } = await this.supabase
      .from('errorwatch_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const current = count || 0;
    const limit = limits.errorwatch.projects;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan !== 'premium'
    };
  }

  async checkLLMProjectLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const { count } = await this.supabase
      .from('llm_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const current = count || 0;
    const limit = limits.llm.projects;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan !== 'premium'
    };
  }

  async checkVaultProjectLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const { count } = await this.supabase
      .from('vault_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const current = count || 0;
    const limit = limits.vault.projects;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan !== 'premium'
    };
  }

  async checkWebhookEndpointLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const { count } = await this.supabase
      .from('webhook_endpoints')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    const current = count || 0;
    const limit = limits.webhooklab.endpoints;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan !== 'premium'
    };
  }

  async checkStatusKitPageLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const { count } = await this.supabase
      .from('status_pages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const current = count || 0;
    const limit = limits.statuskit.status_pages;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan !== 'premium'
    };
  }

  async checkSpeedKitUrlLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const { count } = await this.supabase
      .from('speedkit_urls')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const current = count || 0;
    const limit = limits.speedkit.urls;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan !== 'premium'
    };
  }

  async checkCommitBotApiKeyLimit(userId: string): Promise<PlanCheck> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    const { count } = await this.supabase
      .from('commitbot_api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    const current = count || 0;
    const limit = limits.commitbot.api_keys;

    return {
      allowed: current < limit,
      current,
      limit,
      plan,
      upgradeRequired: current >= limit && plan !== 'premium'
    };
  }

  canAccessFeature(plan: Plan, feature: keyof typeof PLAN_LIMITS.free.features): boolean {
    return PLAN_LIMITS[plan].features[feature];
  }

  generateUpgradeMessage(planCheck: PlanCheck): string {
    if (planCheck.plan === 'free') {
      return `You've reached your ${planCheck.limit} ${planCheck.plan} plan limit. Upgrade to Pro for ${PLAN_LIMITS.pro.commitbot?.commits_per_month || 'unlimited'} monthly commits.`;
    } else if (planCheck.plan === 'pro') {
      return `You've reached your ${planCheck.limit} Pro plan limit. Upgrade to Premium for ${PLAN_LIMITS.premium.commitbot?.commits_per_month || 'unlimited'} monthly commits.`;
    }
    return 'Limit reached. Please contact support.';
  }
}

// Export singleton instance
export const planEnforcement = new PlanEnforcement();