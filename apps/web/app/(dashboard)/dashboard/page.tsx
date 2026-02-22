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
    stat: { label: 'Repos connected', value: 0 },
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
    stat: { label: 'Monitors active', value: 0 },
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
    stat: { label: 'Commits this month', value: 0 },
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get usage stats
  const { data: usage } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', user?.id);

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-[#a1a1b5]">Welcome to SmithKit. Your AI-powered dev toolkit.</p>
      </div>

      {/* Plan Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10 border border-[#6366f1]/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#a1a1b5] mb-1">Current Plan</p>
            <p className="text-xl font-bold text-white capitalize">{subscription?.plan || 'Free'}</p>
          </div>
          {subscription?.plan === 'free' && (
            <Link
              href="/dashboard/settings#billing"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e] hover:border-[#3e3e5e] transition-all"
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {tool.icon}
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-white mb-1">{tool.name}</h3>
            <p className="text-sm text-[#71717a] mb-4">{tool.description}</p>

            {/* Stat */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1e1e2e]">
              <span className="text-xs text-[#6b6b80]">{tool.stat.label}</span>
              <span className="text-lg font-bold text-white">{tool.stat.value}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/changelog"
            className="px-4 py-2 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] text-sm text-[#a1a1b5] hover:text-white hover:border-[#3a3a4a] transition-colors"
          >
            + Connect GitHub repo
          </Link>
          <Link
            href="/dashboard/uptime"
            className="px-4 py-2 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] text-sm text-[#a1a1b5] hover:text-white hover:border-[#3a3a4a] transition-colors"
          >
            + Add monitor
          </Link>
          <Link
            href="/dashboard/commitbot"
            className="px-4 py-2 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] text-sm text-[#a1a1b5] hover:text-white hover:border-[#3a3a4a] transition-colors"
          >
            + Generate API key
          </Link>
        </div>
      </div>
    </div>
  );
}
