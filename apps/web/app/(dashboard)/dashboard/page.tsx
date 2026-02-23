import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// On-brand gradient icon wrapper
function GradientIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-purple-500/20 flex items-center justify-center">
      {children}
    </div>
  );
}

// Tool icons with gradient stroke
function ChangelogIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
    </svg>
  );
}

function UptimeIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  );
}

function CommitIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <circle cx="12" cy="12" r="4" />
      <line x1="1.05" y1="12" x2="7" y2="12" />
      <line x1="17.01" y1="12" x2="22.96" y2="12" />
    </svg>
  );
}

function ToggleIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
      <circle cx="16" cy="12" r="3" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function EventIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function CronIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function WebhookIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
      <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
      <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
    </svg>
  );
}

function LLMIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function VaultIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function DepWatchIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

const toolIcons: Record<string, () => React.ReactElement> = {
  changelog: ChangelogIcon,
  uptime: UptimeIcon,
  commitbot: CommitIcon,
  togglebox: ToggleIcon,
  statuskit: StatusIcon,
  eventlog: EventIcon,
  cron: CronIcon,
  webhooks: WebhookIcon,
  llm: LLMIcon,
  errorwatch: ErrorIcon,
  vault: VaultIcon,
  depwatch: DepWatchIcon,
};

const tools = [
  { id: 'changelog', name: 'Changelog', desc: 'AI release notes', href: '/dashboard/changelog' },
  { id: 'uptime', name: 'Uptime', desc: 'Site monitoring', href: '/dashboard/uptime' },
  { id: 'commitbot', name: 'CommitBot', desc: 'AI commits', href: '/dashboard/commitbot' },
  { id: 'togglebox', name: 'ToggleBox', desc: 'Feature flags', href: '/dashboard/togglebox' },
  { id: 'statuskit', name: 'StatusKit', desc: 'Status pages', href: '/dashboard/statuskit' },
  { id: 'eventlog', name: 'EventLog', desc: 'Event tracking', href: '/dashboard/eventlog' },
  { id: 'cron', name: 'CronPilot', desc: 'Scheduled jobs', href: '/dashboard/cron' },
  { id: 'webhooks', name: 'WebhookLab', desc: 'Webhook debug', href: '/dashboard/webhooks' },
  { id: 'llm', name: 'LLM Analytics', desc: 'AI usage', href: '/dashboard/llm' },
  { id: 'errorwatch', name: 'ErrorWatch', desc: 'Error tracking', href: '/dashboard/errorwatch' },
  { id: 'vault', name: 'VaultKit', desc: 'Secrets manager', href: '/dashboard/vault' },
  { id: 'depwatch', name: 'DepWatch', desc: 'Dependency security', href: '/dashboard/depwatch' },
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
    .select('id, name, url, status, last_checked_at')
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
  let recentErrors: { id: string; title: string; count: number; last_seen_at: string }[] = [];
  if (errorwatchProjects && errorwatchProjects.length > 0) {
    const { count } = await supabase
      .from('errorwatch_issues')
      .select('*', { count: 'exact', head: true })
      .in('project_id', errorwatchProjects.map(p => p.id))
      .eq('status', 'unresolved');
    unresolvedErrors = count || 0;
    
    const { data: errors } = await supabase
      .from('errorwatch_issues')
      .select('id, title, count, last_seen_at')
      .in('project_id', errorwatchProjects.map(p => p.id))
      .eq('status', 'unresolved')
      .order('last_seen_at', { ascending: false })
      .limit(5);
    recentErrors = errors || [];
  }

  // CronPilot stats
  const { data: cronProjects } = await supabase
    .from('cron_projects')
    .select('id')
    .eq('user_id', user?.id);
  
  let activeJobs = 0;
  if (cronProjects && cronProjects.length > 0) {
    const { count } = await supabase
      .from('cron_jobs')
      .select('*', { count: 'exact', head: true })
      .in('project_id', cronProjects.map(p => p.id))
      .eq('is_active', true);
    activeJobs = count || 0;
  }

  const monitorsUp = monitors?.filter(m => m.status === 'up').length || 0;
  const monitorsDown = monitors?.filter(m => m.status === 'down').length || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome back. Here&apos;s what&apos;s happening across your tools.</p>
      </div>

      {/* Plan Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-600/40 via-fuchsia-500/30 to-cyan-500/40 border border-purple-400/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Current Plan</p>
            <p className="text-2xl font-bold text-white">
              {subscription?.plan === 'team' ? 'Premium' : subscription?.plan === 'pro' ? 'Pro' : 'Free'}
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              {subscription?.plan === 'team' ? 'All 12 tools included' : subscription?.plan === 'pro' ? 'All 12 tools included' : 'Limited access'}
            </p>
          </div>
          {(!subscription || subscription?.plan === 'free') && (
            <Link
              href="/dashboard/settings#billing"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* Live Stats from Tools */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse"></span>
          Live Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-emerald-500 border-t border-r border-b border-zinc-800">
            <p className="text-zinc-500 text-xs mb-1">Monitors</p>
            <p className="text-2xl font-bold text-white">{monitors?.length || 0}</p>
            {monitorsUp > 0 && <p className="text-xs text-emerald-400 mt-1">{monitorsUp} up</p>}
            {monitorsDown > 0 && <p className="text-xs text-red-400">{monitorsDown} down</p>}
          </div>
          
          <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-purple-500 border-t border-r border-b border-zinc-800">
            <p className="text-zinc-500 text-xs mb-1">Repos</p>
            <p className="text-2xl font-bold text-white">{repos?.length || 0}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-orange-500 border-t border-r border-b border-zinc-800">
            <p className="text-zinc-500 text-xs mb-1">AI Commits</p>
            <p className="text-2xl font-bold text-white">{usage?.commitbot_count || 0}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-cyan-500 border-t border-r border-b border-zinc-800">
            <p className="text-zinc-500 text-xs mb-1">Feature Flags</p>
            <p className="text-2xl font-bold text-white">{flagCount}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-fuchsia-500 border-t border-r border-b border-zinc-800">
            <p className="text-zinc-500 text-xs mb-1">Events Tracked</p>
            <p className="text-2xl font-bold text-white">{eventCount}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-red-500 border-t border-r border-b border-zinc-800">
            <p className="text-zinc-500 text-xs mb-1">Unresolved Errors</p>
            <p className={`text-2xl font-bold ${unresolvedErrors > 0 ? 'text-red-400' : 'text-white'}`}>{unresolvedErrors}</p>
          </div>
        </div>
      </div>

      {/* Live Data Cards */}
      <div className="mb-8 grid md:grid-cols-3 gap-6">
        {/* Uptime Monitors */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 via-zinc-900/80 to-cyan-900/30 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                </svg>
              </span>
              Uptime Monitors
            </h3>
            <Link href="/dashboard/uptime" className="text-xs text-purple-400 hover:text-purple-300">View all →</Link>
          </div>
          {monitors && monitors.length > 0 ? (
            <div className="space-y-2">
              {monitors.slice(0, 4).map((monitor: { id: string; name: string; url: string; status: string; last_checked_at: string }) => (
                <div key={monitor.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${monitor.status === 'up' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="text-sm text-white truncate">{monitor.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${monitor.status === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {monitor.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-zinc-500 text-sm">No monitors yet</p>
              <Link href="/dashboard/uptime" className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block">Add your first monitor →</Link>
            </div>
          )}
        </div>

        {/* Feature Flags */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-900/40 via-zinc-900/80 to-purple-900/30 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
                  <circle cx="16" cy="12" r="3" />
                </svg>
              </span>
              Feature Flags
            </h3>
            <Link href="/dashboard/togglebox" className="text-xs text-purple-400 hover:text-purple-300">View all →</Link>
          </div>
          {recentFlags && recentFlags.length > 0 ? (
            <div className="space-y-2">
              {recentFlags.slice(0, 4).map((flag) => (
                <div key={flag.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50">
                  <span className="text-sm text-white truncate">{flag.name || flag.key}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${flag.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-600/50 text-zinc-400'}`}>
                    {flag.enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-zinc-500 text-sm">No flags yet</p>
              <Link href="/dashboard/togglebox" className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block">Create your first flag →</Link>
            </div>
          )}
        </div>

        {/* Recent Errors */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-fuchsia-900/40 via-zinc-900/80 to-rose-900/30 border border-fuchsia-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              Recent Errors
            </h3>
            <Link href="/dashboard/errorwatch" className="text-xs text-purple-400 hover:text-purple-300">View all →</Link>
          </div>
          {recentErrors && recentErrors.length > 0 ? (
            <div className="space-y-2">
              {recentErrors.slice(0, 4).map((error) => (
                <div key={error.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50">
                  <span className="text-sm text-white truncate flex-1 mr-2">{error.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 flex-shrink-0">
                    {error.count}×
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-zinc-500 text-sm">No errors — looking good! 🎉</p>
              <Link href="/dashboard/errorwatch" className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block">Set up error tracking →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {tools.map((tool) => {
            const IconComponent = toolIcons[tool.id];
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group relative p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 overflow-hidden"
              >
                {/* Gradient glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-cyan-600/0 group-hover:from-purple-600/5 group-hover:to-cyan-600/5 transition-all" />
                <div className="relative">
                  <GradientIcon>
                    <IconComponent />
                  </GradientIcon>
                  <h3 className="font-semibold text-white text-sm mt-4 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all">{tool.name}</h3>
                  <p className="text-xs text-zinc-500">{tool.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
