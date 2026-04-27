// Plan limits and feature access control for SmithKit
export type Plan = 'free' | 'pro' | 'premium';

export interface PlanLimits {
  // Global limits
  projects_per_tool: number;
  data_retention_days: number;
  team_members: number;
  custom_domains: number;
  
  // Tool-specific limits
  changelog: {
    repos: number;
    changelogs_per_month: number;
  };
  
  uptime: {
    monitors: number;
    check_interval_seconds: number;
    incidents_history_days: number;
  };
  
  commitbot: {
    commits_per_month: number;
    api_keys: number;
  };
  
  togglebox: {
    projects: number;
    flags_per_project: number;
    environments: number;
  };
  
  statuskit: {
    status_pages: number;
    incidents_per_month: number;
    custom_domain: boolean;
  };
  
  eventlog: {
    projects: number;
    events_per_month: number;
    channels_per_project: number;
    retention_days: number;
  };
  
  alertflow: {
    incidents_per_month: number;
    on_call_schedules: number;
    escalation_policies: number;
    integrations: number;
  };
  
  speedkit: {
    urls: number;
    tests_per_month: number;
    lighthouse_scans: number;
  };
  
  webhooklab: {
    endpoints: number;
    requests_per_month: number;
    request_retention_days: number;
  };
  
  llm: {
    projects: number;
    requests_per_month: number;
    providers: number;
  };
  
  errorwatch: {
    projects: number;
    errors_per_month: number;
    issue_retention_days: number;
  };
  
  vault: {
    projects: number;
    secrets_per_project: number;
    environments: number;
  };
  
  // Feature flags
  features: {
    priority_support: boolean;
    sso: boolean;
    audit_logs: boolean;
    api_access: boolean;
    webhooks: boolean;
    integrations: boolean;
    whitelabel: boolean;
  };
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    projects_per_tool: 1,
    data_retention_days: 7,
    team_members: 1,
    custom_domains: 0,
    
    changelog: {
      repos: 2,
      changelogs_per_month: 10,
    },
    
    uptime: {
      monitors: 5,
      check_interval_seconds: 300, // 5 minutes
      incidents_history_days: 7,
    },
    
    commitbot: {
      commits_per_month: 30,
      api_keys: 1,
    },
    
    togglebox: {
      projects: 1,
      flags_per_project: 10,
      environments: 2,
    },
    
    statuskit: {
      status_pages: 1,
      incidents_per_month: 10,
      custom_domain: false,
    },
    
    eventlog: {
      projects: 1,
      events_per_month: 1000,
      channels_per_project: 3,
      retention_days: 7,
    },
    
    alertflow: {
      incidents_per_month: 10,
      on_call_schedules: 1,
      escalation_policies: 2,
      integrations: 1,
    },
    
    speedkit: {
      urls: 3,
      tests_per_month: 50,
      lighthouse_scans: 10,
    },
    
    webhooklab: {
      endpoints: 3,
      requests_per_month: 500,
      request_retention_days: 7,
    },
    
    llm: {
      projects: 1,
      requests_per_month: 1000,
      providers: 2,
    },
    
    errorwatch: {
      projects: 1,
      errors_per_month: 1000,
      issue_retention_days: 7,
    },
    
    vault: {
      projects: 1,
      secrets_per_project: 20,
      environments: 2,
    },
    
    features: {
      priority_support: false,
      sso: false,
      audit_logs: false,
      api_access: true,
      webhooks: false,
      integrations: false,
      whitelabel: false,
    },
  },
  
  pro: {
    projects_per_tool: 10,
    data_retention_days: 30,
    team_members: 1,
    custom_domains: 1,
    
    changelog: {
      repos: 10,
      changelogs_per_month: 100,
    },
    
    uptime: {
      monitors: 50,
      check_interval_seconds: 60, // 1 minute
      incidents_history_days: 30,
    },
    
    commitbot: {
      commits_per_month: 500,
      api_keys: 5,
    },
    
    togglebox: {
      projects: 10,
      flags_per_project: 50,
      environments: 5,
    },
    
    statuskit: {
      status_pages: 5,
      incidents_per_month: 50,
      custom_domain: true,
    },
    
    eventlog: {
      projects: 10,
      events_per_month: 50000,
      channels_per_project: 10,
      retention_days: 30,
    },
    
    alertflow: {
      incidents_per_month: 100,
      on_call_schedules: 5,
      escalation_policies: 10,
      integrations: 5,
    },
    
    speedkit: {
      urls: 25,
      tests_per_month: 1000,
      lighthouse_scans: 100,
    },
    
    webhooklab: {
      endpoints: 25,
      requests_per_month: 50000,
      request_retention_days: 30,
    },
    
    llm: {
      projects: 10,
      requests_per_month: 100000,
      providers: 5,
    },
    
    errorwatch: {
      projects: 10,
      errors_per_month: 50000,
      issue_retention_days: 30,
    },
    
    vault: {
      projects: 10,
      secrets_per_project: 100,
      environments: 5,
    },
    
    features: {
      priority_support: true,
      sso: false,
      audit_logs: false,
      api_access: true,
      webhooks: true,
      integrations: true,
      whitelabel: false,
    },
  },
  
  premium: {
    projects_per_tool: 50,
    data_retention_days: 90,
    team_members: 10,
    custom_domains: 10,
    
    changelog: {
      repos: 50,
      changelogs_per_month: 500,
    },
    
    uptime: {
      monitors: 200,
      check_interval_seconds: 30, // 30 seconds
      incidents_history_days: 90,
    },
    
    commitbot: {
      commits_per_month: 2000,
      api_keys: 20,
    },
    
    togglebox: {
      projects: 50,
      flags_per_project: 200,
      environments: 10,
    },
    
    statuskit: {
      status_pages: 25,
      incidents_per_month: 200,
      custom_domain: true,
    },
    
    eventlog: {
      projects: 50,
      events_per_month: 1000000,
      channels_per_project: 50,
      retention_days: 90,
    },
    
    alertflow: {
      incidents_per_month: 500,
      on_call_schedules: 20,
      escalation_policies: 50,
      integrations: 20,
    },
    
    speedkit: {
      urls: 100,
      tests_per_month: 10000,
      lighthouse_scans: 1000,
    },
    
    webhooklab: {
      endpoints: 100,
      requests_per_month: 1000000,
      request_retention_days: 90,
    },
    
    llm: {
      projects: 50,
      requests_per_month: 1000000,
      providers: 10,
    },
    
    errorwatch: {
      projects: 50,
      errors_per_month: 1000000,
      issue_retention_days: 90,
    },
    
    vault: {
      projects: 50,
      secrets_per_project: 500,
      environments: 10,
    },
    
    features: {
      priority_support: true,
      sso: true,
      audit_logs: true,
      api_access: true,
      webhooks: true,
      integrations: true,
      whitelabel: true,
    },
  },
};

// Helper functions for plan checking
export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function checkLimit(plan: Plan, tool: string, metric: string, current: number): boolean {
  const limits = PLAN_LIMITS[plan];
  // Type-safe limit checking would require more complex typing
  // For now, return true (implement specific checks in each tool)
  return true;
}

export function canAccessFeature(plan: Plan, feature: keyof PlanLimits['features']): boolean {
  return PLAN_LIMITS[plan].features[feature];
}

export function getUsagePercentage(plan: Plan, tool: string, metric: string, current: number): number {
  // Implement specific usage percentage calculation
  // This would need tool-specific logic
  return 0;
}