import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// Tool cards with their status
const tools = [
  {
    id: 'changelog',
    name: 'Changelog',
    description: 'AI-powered release notes from your GitHub commits',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
        <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      </svg>
    ),
    color: 'from-purple-500 to-indigo-600',
    href: '/dashboard/changelog',
    statKey: 'repos',
    statLabel: 'Repos connected',
  },
  {
    id: 'uptime',
    name: 'Uptime',
    description: 'Monitor your sites and APIs with beautiful status pages',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
    color: 'from-green-500 to-emerald-600',
    href: '/dashboard/uptime',
    statKey: 'monitors',
    statLabel: 'Monitors active',
  },
  {
    id: 'commitbot',
    name: 'CommitBot',
    description: 'AI generates perfect commit messages from your diffs',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4" />
        <line x1="1.05" y1="12" x2="7" y2="12" />
        <line x1="17.01" y1="12" x2="22.96" y2="12" />
      </svg>
    ),
    color: 'from-orange-500 to-amber-600',
    href: '/dashboard/commitbot',
    statKey: 'commits',
    statLabel: 'Commits this month',
  },
];

// Activity icon components
function ChangelogIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
      <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
        <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      </svg>
    </div>
  );
}

function UptimeIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
      <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    </div>
  );
}

function CommitIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
      <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4" />
        <line x1="1.05" y1="12" x2="7" y2="12" />
        <line x1="17.01" y1="12" x2="22.96" y2="12" />
      </svg>
    </div>
  );
}

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

  // Get recent activity
  const { data: recentChangelogs } = await supabase
    .from('changelogs')
    .select('id, version, title, created_at, changelog_repos(github_repo_name)')
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: recentCommits } = await supabase
    .from('commitbot_history')
    .select('id, message, created_at')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const stats = {
    repos: repos?.length || 0,
    monitors: monitors?.length || 0,
    commits: usage?.commitbot_count || 0,
  };

  // Combine and sort recent activity
  type Activity = {
    id: string;
    type: 'changelog' | 'commit' | 'monitor';
    title: string;
    subtitle: string;
    time: Date;
  };

  const activities: Activity[] = [
    ...(recentChangelogs || []).map((c) => ({
      id: c.id,
      type: 'changelog' as const,
      title: `Generated changelog ${c.version || ''}`,
      subtitle: (c.changelog_repos as { github_repo_name: string } | null)?.github_repo_name || 'Unknown repo',
      time: new Date(c.created_at),
    })),
    ...(recentCommits || []).map((c) => ({
      id: c.id,
      type: 'commit' as const,
      title: c.message?.substring(0, 50) + (c.message?.length > 50 ? '...' : '') || 'Generated commit',
      subtitle: 'CommitBot',
      time: new Date(c.created_at),
    })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-[#a1a1b5]">Welcome to SmithKit. Your AI-powered dev toolkit.</p>
      </div>

      {/* Plan Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10 border border-[#6366f1]/20 hover:border-[#6366f1]/40 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#a1a1b5] mb-1">Current Plan</p>
            <p className="text-xl font-bold text-white capitalize">{subscription?.plan || 'Free'}</p>
          </div>
          {(!subscription || subscription?.plan === 'free') && (
            <Link
              href="/dashboard/settings#billing"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 hover:scale-105 transition-all shadow-lg shadow-[#6366f1]/20"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e] hover:border-[#3e3e5e] hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200"
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-200`}>
              {tool.icon}
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#6366f1] transition-colors">{tool.name}</h3>
            <p className="text-sm text-[#71717a] mb-4 line-clamp-2 min-h-[2.5rem]">{tool.description}</p>

            {/* Stat */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1e1e2e]">
              <span className="text-xs text-[#6b6b80]">{tool.statLabel}</span>
              <span className="text-lg font-bold text-white">{stats[tool.statKey as keyof typeof stats]}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#6366f1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
            Recent Activity
          </h2>
          
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] hover:bg-[#15151f] transition-colors"
                >
                  {activity.type === 'changelog' && <ChangelogIcon />}
                  {activity.type === 'commit' && <CommitIcon />}
                  {activity.type === 'monitor' && <UptimeIcon />}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{activity.title}</p>
                    <p className="text-xs text-[#6b6b80]">{activity.subtitle}</p>
                  </div>
                  
                  <span className="text-xs text-[#6b6b80] whitespace-nowrap">
                    {formatTimeAgo(activity.time)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#1a1a25] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#6b6b80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="text-sm text-[#6b6b80]">No recent activity</p>
              <p className="text-xs text-[#4b4b5b] mt-1">Get started by connecting a repo or adding a monitor</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#6366f1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Quick Actions
          </h2>
          
          <div className="space-y-2">
            <Link
              href="/dashboard/changelog"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] hover:bg-[#15151f] border border-transparent hover:border-[#2a2a3a] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Connect GitHub repo</p>
                <p className="text-xs text-[#6b6b80]">Generate AI-powered changelogs</p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/uptime"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] hover:bg-[#15151f] border border-transparent hover:border-[#2a2a3a] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Add uptime monitor</p>
                <p className="text-xs text-[#6b6b80]">Track your site's availability</p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/commitbot"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] hover:bg-[#15151f] border border-transparent hover:border-[#2a2a3a] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Generate API key</p>
                <p className="text-xs text-[#6b6b80]">Use CommitBot in your workflow</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
