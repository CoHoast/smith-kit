import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// Compact icon for tool list items
function ToolIcon({ children, color = 'purple' }: { children: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  };
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} border flex items-center justify-center flex-shrink-0`}>
      {children}
    </div>
  );
}

// Tool category sections
const toolCategories = [
  {
    name: 'Monitoring',
    color: 'emerald',
    tools: [
      { id: 'uptime', name: 'Uptime', desc: 'Monitor sites & APIs', href: '/dashboard/uptime', icon: (
        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
        </svg>
      )},
      { id: 'statuskit', name: 'StatusKit', desc: 'Public status pages', href: '/dashboard/statuskit', icon: (
        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )},
      { id: 'errorwatch', name: 'ErrorWatch', desc: 'Track & resolve errors', href: '/dashboard/errorwatch', icon: (
        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )},
    ],
  },
  {
    name: 'Developer',
    color: 'purple',
    tools: [
      { id: 'changelog', name: 'Changelog', desc: 'AI-powered release notes', href: '/dashboard/changelog', icon: (
        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
          <path d="M19 17V5a2 2 0 0 0-2-2H4" />
        </svg>
      )},
      { id: 'commitbot', name: 'CommitBot', desc: 'AI commit messages', href: '/dashboard/commitbot', icon: (
        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <line x1="1.05" y1="12" x2="7" y2="12" />
          <line x1="17.01" y1="12" x2="22.96" y2="12" />
        </svg>
      )},
      { id: 'togglebox', name: 'ToggleBox', desc: 'Feature flags & rollouts', href: '/dashboard/togglebox', icon: (
        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
          <circle cx="16" cy="12" r="3" />
        </svg>
      )},
    ],
  },
  {
    name: 'Automation',
    color: 'cyan',
    tools: [
      { id: 'cron', name: 'CronPilot', desc: 'Scheduled jobs & tasks', href: '/dashboard/cron', icon: (
        <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )},
      { id: 'webhooks', name: 'WebhookLab', desc: 'Test & debug webhooks', href: '/dashboard/webhooks', icon: (
        <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
          <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
          <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
        </svg>
      )},
      { id: 'eventlog', name: 'EventLog', desc: 'Track user events', href: '/dashboard/eventlog', icon: (
        <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )},
    ],
  },
  {
    name: 'AI & Security',
    color: 'orange',
    tools: [
      { id: 'llm', name: 'LLM Analytics', desc: 'Monitor AI costs & usage', href: '/dashboard/llm', icon: (
        <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>
      )},
      { id: 'vault', name: 'VaultKit', desc: 'Secrets & env manager', href: '/dashboard/vault', icon: (
        <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )},
      { id: 'depwatch', name: 'DepWatch', desc: 'Dependency security', href: '/dashboard/depwatch', icon: (
        <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )},
    ],
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  // Fetch stats from all tools
  const { data: repos } = await supabase
    .from('changelog_repos')
    .select('id')
    .eq('user_id', user?.id);

  const { data: monitors } = await supabase
    .from('uptime_monitors')
    .select('id, name, url, current_status, last_checked_at')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: usage } = await supabase
    .from('usage')
    .select('commitbot_count')
    .eq('user_id', user?.id)
    .single();

  const { data: flagProjects } = await supabase
    .from('togglebox_projects')
    .select('id')
    .eq('user_id', user?.id);

  let flagCount = 0;
  let recentFlags: { id: string; name: string; key: string; enabled: boolean }[] = [];
  if (flagProjects && flagProjects.length > 0) {
    const { count } = await supabase
      .from('togglebox_flags')
      .select('*', { count: 'exact', head: true })
      .in('project_id', flagProjects.map(p => p.id));
    flagCount = count || 0;
    
    const { data: flags } = await supabase
      .from('togglebox_flags')
      .select('id, name, key, enabled')
      .in('project_id', flagProjects.map(p => p.id))
      .order('updated_at', { ascending: false })
      .limit(5);
    recentFlags = flags || [];
  }

  // EventLog stats
  const { data: eventlogProjects } = await supabase
    .from('eventlog_projects')
    .select('id')
    .eq('user_id', user?.id);
  
  let eventCount = 0;
  if (eventlogProjects && eventlogProjects.length > 0) {
    const { count } = await supabase
      .from('eventlog_events')
      .select('*', { count: 'exact', head: true })
      .in('project_id', eventlogProjects.map(p => p.id));
    eventCount = count || 0;
  }

  // ErrorWatch stats
  const { data: errorwatchProjects } = await supabase
    .from('errorwatch_projects')
    .select('id')
    .eq('user_id', user?.id);
  
  let unresolvedErrors = 0;
  if (errorwatchProjects && errorwatchProjects.length > 0) {
    const { count } = await supabase
      .from('errorwatch_issues')
      .select('*', { count: 'exact', head: true })
      .in('project_id', errorwatchProjects.map(p => p.id))
      .eq('status', 'unresolved');
    unresolvedErrors = count || 0;
  }

  const monitorsUp = monitors?.filter(m => m.current_status === 'up').length || 0;
  const monitorsDown = monitors?.filter(m => m.current_status === 'down').length || 0;

  return (
    <div className="p-10 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
          Welcome back
        </h1>
        <p className="text-lg text-zinc-400">
          Here&apos;s an overview of your developer toolkit.
        </p>
      </div>

      {/* Plan + Stats Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        {/* Plan Card */}
        <div className="lg:col-span-1 p-8 rounded-3xl bg-gradient-to-br from-purple-600/30 via-fuchsia-600/20 to-cyan-600/30 border border-purple-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <p className="text-sm font-medium text-purple-300 mb-2">Current Plan</p>
            <p className="text-3xl font-bold text-white mb-1">
              {subscription?.plan === 'team' ? 'Premium' : subscription?.plan === 'pro' ? 'Pro' : 'Free'}
            </p>
            <p className="text-sm text-zinc-400">
              {subscription?.plan === 'team' || subscription?.plan === 'pro' ? 'All 12 tools unlocked' : 'Upgrade for full access'}
            </p>
            {(!subscription || subscription?.plan === 'free') && (
              <Link
                href="/dashboard/settings#billing"
                className="inline-flex mt-4 px-5 py-2.5 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors"
              >
                Upgrade →
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/30 transition-colors group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Monitors</span>
            </div>
            <p className="text-3xl font-bold text-white">{monitors?.length || 0}</p>
            {monitorsUp > 0 && <p className="text-sm text-emerald-400 mt-1">{monitorsUp} operational</p>}
            {monitorsDown > 0 && <p className="text-sm text-red-400 mt-1">{monitorsDown} down</p>}
            {!monitors?.length && <p className="text-sm text-zinc-600 mt-1">Not configured</p>}
          </div>
          
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/30 transition-colors group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Flags</span>
            </div>
            <p className="text-3xl font-bold text-white">{flagCount}</p>
            <p className="text-sm text-zinc-600 mt-1">{flagCount === 1 ? 'Feature flag' : 'Feature flags'}</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/30 transition-colors group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Events</span>
            </div>
            <p className="text-3xl font-bold text-white">{eventCount.toLocaleString()}</p>
            <p className="text-sm text-zinc-600 mt-1">Tracked events</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-red-500/30 transition-colors group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Errors</span>
            </div>
            <p className={`text-3xl font-bold ${unresolvedErrors > 0 ? 'text-red-400' : 'text-white'}`}>{unresolvedErrors}</p>
            <p className="text-sm text-zinc-600 mt-1">{unresolvedErrors === 0 ? 'All clear!' : 'Unresolved'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - Recent Activity Cards */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Uptime Card */}
          <Link 
            href="/dashboard/uptime"
            className="group p-6 rounded-2xl bg-gradient-to-br from-emerald-950/50 to-zinc-900/80 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                </svg>
              </div>
              <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
            </div>
            <h3 className="font-semibold text-white mb-1">Uptime Monitors</h3>
            <p className="text-sm text-zinc-500">
              {monitors?.length ? `${monitorsUp} of ${monitors.length} operational` : 'Add your first monitor'}
            </p>
          </Link>

          {/* Feature Flags Card */}
          <Link 
            href="/dashboard/togglebox"
            className="group p-6 rounded-2xl bg-gradient-to-br from-purple-950/50 to-zinc-900/80 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
                  <circle cx="16" cy="12" r="3" />
                </svg>
              </div>
              <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
            </div>
            <h3 className="font-semibold text-white mb-1">Feature Flags</h3>
            <p className="text-sm text-zinc-500">
              {flagCount > 0 ? `${flagCount} flags configured` : 'Control feature rollouts'}
            </p>
          </Link>

          {/* Error Tracking Card */}
          <Link 
            href="/dashboard/errorwatch"
            className="group p-6 rounded-2xl bg-gradient-to-br from-rose-950/50 to-zinc-900/80 border border-rose-500/20 hover:border-rose-500/40 transition-all hover:shadow-lg hover:shadow-rose-500/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <span className="text-xs text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
            </div>
            <h3 className="font-semibold text-white mb-1">Error Tracking</h3>
            <p className="text-sm text-zinc-500">
              {unresolvedErrors > 0 ? `${unresolvedErrors} unresolved errors` : 'No errors — looking good!'}
            </p>
          </Link>
        </div>
      </div>

      {/* Tools by Category */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Your Toolkit</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {toolCategories.map((category) => (
            <div key={category.name} className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">{category.name}</h3>
              <div className="space-y-2">
                {category.tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-zinc-800/50 transition-all group"
                  >
                    <ToolIcon color={category.color}>
                      {tool.icon}
                    </ToolIcon>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all">
                        {tool.name}
                      </p>
                      <p className="text-sm text-zinc-500 truncate">{tool.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
