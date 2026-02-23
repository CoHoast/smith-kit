import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// Icons for stats
function TrendUpIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// Tool data
const tools = [
  { id: 'changelog', name: 'Changelog', desc: 'AI-powered release notes', href: '/dashboard/changelog', color: 'from-purple-600 to-violet-600' },
  { id: 'uptime', name: 'Uptime', desc: 'Site monitoring', href: '/dashboard/uptime', color: 'from-emerald-600 to-teal-600' },
  { id: 'commitbot', name: 'CommitBot', desc: 'AI commit messages', href: '/dashboard/commitbot', color: 'from-orange-600 to-amber-600' },
  { id: 'togglebox', name: 'ToggleBox', desc: 'Feature flags', href: '/dashboard/togglebox', color: 'from-blue-600 to-cyan-600' },
  { id: 'statuskit', name: 'StatusKit', desc: 'Status pages', href: '/dashboard/statuskit', color: 'from-yellow-600 to-orange-600' },
  { id: 'eventlog', name: 'EventLog', desc: 'Event tracking', href: '/dashboard/eventlog', color: 'from-pink-600 to-rose-600' },
  { id: 'cron', name: 'CronPilot', desc: 'Scheduled jobs', href: '/dashboard/cron', color: 'from-teal-600 to-emerald-600' },
  { id: 'webhooks', name: 'WebhookLab', desc: 'Webhook debugging', href: '/dashboard/webhooks', color: 'from-violet-600 to-purple-600' },
  { id: 'llm', name: 'LLM Analytics', desc: 'AI usage tracking', href: '/dashboard/llm', color: 'from-indigo-600 to-blue-600' },
  { id: 'errorwatch', name: 'ErrorWatch', desc: 'Error tracking', href: '/dashboard/errorwatch', color: 'from-red-600 to-rose-600' },
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

  // Get real stats
  const { data: repos } = await supabase
    .from('changelog_repos')
    .select('id')
    .eq('user_id', user?.id);

  const { data: monitors } = await supabase
    .from('uptime_monitors')
    .select('id')
    .eq('user_id', user?.id);

  const { data: usage } = await supabase
    .from('usage')
    .select('commitbot_count')
    .eq('user_id', user?.id)
    .single();

  const { data: flags } = await supabase
    .from('togglebox_flags')
    .select('id, togglebox_projects!inner(user_id)')
    .eq('togglebox_projects.user_id', user?.id);

  // Get recent activity
  const { data: recentChangelogs } = await supabase
    .from('changelogs')
    .select('id, version, title, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = {
    repos: repos?.length || 0,
    monitors: monitors?.length || 0,
    commits: usage?.commitbot_count || 0,
    flags: flags?.length || 0,
    events: 0,
    errors: 0,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome back. Here's what's happening with your tools.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Active Monitors</span>
            <span className="text-emerald-400 text-xs flex items-center gap-1">
              <TrendUpIcon className="w-3 h-3" />
              Live
            </span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.monitors}</p>
        </div>
        
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Repos Connected</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.repos}</p>
        </div>
        
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">AI Commits</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.commits}</p>
        </div>
        
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm">Feature Flags</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.flags}</p>
        </div>
      </div>

      {/* Plan Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-600/10 via-fuchsia-600/10 to-cyan-600/10 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Current Plan</p>
            <p className="text-2xl font-bold text-white capitalize">{subscription?.plan || 'Free'}</p>
            <p className="text-sm text-zinc-500 mt-1">All 10 tools included</p>
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

      {/* Tools Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Your Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                <span className="text-white text-lg font-bold">{tool.name[0]}</span>
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{tool.name}</h3>
              <p className="text-xs text-zinc-500">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="p-5 border-b border-zinc-800">
            <h2 className="font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="p-5">
            {recentChangelogs && recentChangelogs.length > 0 ? (
              <div className="space-y-4">
                {recentChangelogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-400 text-xs">📝</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{log.title || `Version ${log.version}`}</p>
                      <p className="text-xs text-zinc-500">{new Date(log.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm">No recent activity</p>
                <p className="text-zinc-600 text-xs mt-1">Start using tools to see activity here</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="p-5 border-b border-zinc-800">
            <h2 className="font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="p-5 space-y-3">
            <Link href="/dashboard/changelog" className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <span className="text-purple-400">📝</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Connect a repo</p>
                  <p className="text-xs text-zinc-500">Generate AI changelogs</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
            
            <Link href="/dashboard/uptime" className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                  <span className="text-emerald-400">📊</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Add a monitor</p>
                  <p className="text-xs text-zinc-500">Track uptime & latency</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
            
            <Link href="/dashboard/togglebox" className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <span className="text-blue-400">🚀</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Create a feature flag</p>
                  <p className="text-xs text-zinc-500">Ship with confidence</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
            
            <Link href="/dashboard/errorwatch" className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                  <span className="text-red-400">🐛</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Set up error tracking</p>
                  <p className="text-xs text-zinc-500">Catch bugs before users</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
