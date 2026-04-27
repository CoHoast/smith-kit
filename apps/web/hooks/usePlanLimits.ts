'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PlanLimits {
  plan: 'free' | 'pro' | 'premium';
  limits: {
    commitbot: { commits: number; apiKeys: number };
    uptime: { monitors: number };
    togglebox: { projects: number };
    changelog: { repos: number };
    eventlog: { projects: number };
    errorwatch: { projects: number };
    llm: { projects: number };
    vault: { projects: number };
    webhooklab: { endpoints: number };
    statuskit: { pages: number };
    speedkit: { urls: number };
    alertflow: { incidents: number };
  };
}

const PLAN_LIMITS = {
  free: {
    commitbot: { commits: 30, apiKeys: 1 },
    uptime: { monitors: 5 },
    togglebox: { projects: 1 },
    changelog: { repos: 2 },
    eventlog: { projects: 1 },
    errorwatch: { projects: 1 },
    llm: { projects: 1 },
    vault: { projects: 1 },
    webhooklab: { endpoints: 3 },
    statuskit: { pages: 1 },
    speedkit: { urls: 3 },
    alertflow: { incidents: 10 },
  },
  pro: {
    commitbot: { commits: 500, apiKeys: 5 },
    uptime: { monitors: 50 },
    togglebox: { projects: 10 },
    changelog: { repos: 10 },
    eventlog: { projects: 10 },
    errorwatch: { projects: 10 },
    llm: { projects: 10 },
    vault: { projects: 10 },
    webhooklab: { endpoints: 25 },
    statuskit: { pages: 5 },
    speedkit: { urls: 25 },
    alertflow: { incidents: 100 },
  },
  premium: {
    commitbot: { commits: 2000, apiKeys: 20 },
    uptime: { monitors: 200 },
    togglebox: { projects: 50 },
    changelog: { repos: 50 },
    eventlog: { projects: 50 },
    errorwatch: { projects: 50 },
    llm: { projects: 50 },
    vault: { projects: 50 },
    webhooklab: { endpoints: 100 },
    statuskit: { pages: 25 },
    speedkit: { urls: 100 },
    alertflow: { incidents: 500 },
  },
};

export function usePlanLimits() {
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPlanLimits();
  }, []);

  const loadPlanLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPlanLimits({ plan: 'free', limits: PLAN_LIMITS.free });
        setLoading(false);
        return;
      }

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user.id)
        .single();

      const plan = (subscription?.status === 'active' ? subscription.plan : 'free') as 'free' | 'pro' | 'premium';
      
      setPlanLimits({
        plan,
        limits: PLAN_LIMITS[plan]
      });
    } catch (error) {
      console.error('Error loading plan limits:', error);
      setPlanLimits({ plan: 'free', limits: PLAN_LIMITS.free });
    }
    
    setLoading(false);
  };

  const checkLimit = async (tool: string, metric: string): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    plan: 'free' | 'pro' | 'premium';
  }> => {
    if (!planLimits) {
      return { allowed: false, current: 0, limit: 0, plan: 'free' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { allowed: false, current: 0, limit: 0, plan: 'free' };
    }

    let current = 0;
    let limit = 0;

    // Get current usage based on tool and metric
    switch (`${tool}.${metric}`) {
      case 'commitbot.commits':
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const { data: commitUsage } = await supabase
          .from('usage')
          .select('count')
          .eq('user_id', user.id)
          .eq('tool', 'commitbot')
          .eq('metric', 'commits')
          .gte('period_start', startOfMonth.toISOString().split('T')[0])
          .single();
        current = commitUsage?.count || 0;
        limit = planLimits.limits.commitbot.commits;
        break;

      case 'commitbot.apiKeys':
        const { count: keyCount } = await supabase
          .from('commitbot_api_keys')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true);
        current = keyCount || 0;
        limit = planLimits.limits.commitbot.apiKeys;
        break;

      case 'uptime.monitors':
        const { count: monitorCount } = await supabase
          .from('uptime_monitors')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true);
        current = monitorCount || 0;
        limit = planLimits.limits.uptime.monitors;
        break;

      case 'togglebox.projects':
        const { count: toggleCount } = await supabase
          .from('togglebox_projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        current = toggleCount || 0;
        limit = planLimits.limits.togglebox.projects;
        break;

      case 'changelog.repos':
        const { count: repoCount } = await supabase
          .from('changelog_repos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        current = repoCount || 0;
        limit = planLimits.limits.changelog.repos;
        break;

      case 'eventlog.projects':
        const { count: eventlogCount } = await supabase
          .from('eventlog_projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        current = eventlogCount || 0;
        limit = planLimits.limits.eventlog.projects;
        break;

      case 'errorwatch.projects':
        const { count: errorwatchCount } = await supabase
          .from('errorwatch_projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        current = errorwatchCount || 0;
        limit = planLimits.limits.errorwatch.projects;
        break;

      case 'llm.projects':
        const { count: llmCount } = await supabase
          .from('llm_projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        current = llmCount || 0;
        limit = planLimits.limits.llm.projects;
        break;

      case 'vault.projects':
        const { count: vaultCount } = await supabase
          .from('vault_projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        current = vaultCount || 0;
        limit = planLimits.limits.vault.projects;
        break;

      case 'webhooklab.endpoints':
        const { count: webhookCount } = await supabase
          .from('webhook_endpoints')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true);
        current = webhookCount || 0;
        limit = planLimits.limits.webhooklab.endpoints;
        break;

      case 'statuskit.pages':
        const { count: statusCount } = await supabase
          .from('status_pages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        current = statusCount || 0;
        limit = planLimits.limits.statuskit.pages;
        break;

      case 'speedkit.urls':
        const { count: speedCount } = await supabase
          .from('speedkit_urls')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        current = speedCount || 0;
        limit = planLimits.limits.speedkit.urls;
        break;

      default:
        // Return safe defaults for unknown metrics
        return { allowed: true, current: 0, limit: 999, plan: planLimits.plan };
    }

    return {
      allowed: current < limit,
      current,
      limit,
      plan: planLimits.plan
    };
  };

  return {
    planLimits,
    loading,
    checkLimit,
    refreshLimits: loadPlanLimits
  };
}