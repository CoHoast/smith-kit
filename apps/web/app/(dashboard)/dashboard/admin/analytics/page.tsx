import { createClient } from '@/lib/supabase/server';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  // Get user signups by date (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: users } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // Get all subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('plan, created_at, user_id');

  // Get tool usage
  const { count: monitorCount } = await supabase.from('uptime_monitors').select('*', { count: 'exact', head: true });
  const { count: flagCount } = await supabase.from('togglebox_flags').select('*', { count: 'exact', head: true });
  const { count: errorCount } = await supabase.from('errorwatch_errors').select('*', { count: 'exact', head: true });
  const { count: cronCount } = await supabase.from('cron_jobs').select('*', { count: 'exact', head: true });
  const { count: webhookCount } = await supabase.from('webhook_endpoints').select('*', { count: 'exact', head: true });
  const { count: llmCount } = await supabase.from('llm_requests').select('*', { count: 'exact', head: true });
  const { count: eventCount } = await supabase.from('eventlog_events').select('*', { count: 'exact', head: true });
  const { count: changelogCount } = await supabase.from('changelogs').select('*', { count: 'exact', head: true });

  // Calculate MRR
  const proUsers = subscriptions?.filter(s => s.plan === 'pro').length || 0;
  const premiumUsers = subscriptions?.filter(s => s.plan === 'team').length || 0;
  const mrr = (proUsers * 39) + (premiumUsers * 99);

  // Group signups by date
  const signupsByDate: Record<string, number> = {};
  users?.forEach(u => {
    const date = new Date(u.created_at).toLocaleDateString();
    signupsByDate[date] = (signupsByDate[date] || 0) + 1;
  });

  const toolUsage = [
    { name: 'Uptime Monitors', count: monitorCount || 0, color: 'emerald' },
    { name: 'Feature Flags', count: flagCount || 0, color: 'purple' },
    { name: 'Errors Tracked', count: errorCount || 0, color: 'red' },
    { name: 'Cron Jobs', count: cronCount || 0, color: 'cyan' },
    { name: 'Webhook Endpoints', count: webhookCount || 0, color: 'orange' },
    { name: 'LLM Requests', count: llmCount || 0, color: 'pink' },
    { name: 'Events Logged', count: eventCount || 0, color: 'yellow' },
    { name: 'Changelogs', count: changelogCount || 0, color: 'indigo' },
  ];

  const maxUsage = Math.max(...toolUsage.map(t => t.count), 1);

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-zinc-400">Platform usage and growth metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20">
          <p className="text-sm text-emerald-300 mb-1">Monthly Revenue</p>
          <p className="text-4xl font-bold text-white">${mrr}</p>
          <p className="text-sm text-zinc-500 mt-2">MRR</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-900/10 border border-purple-500/20">
          <p className="text-sm text-purple-300 mb-1">Paid Users</p>
          <p className="text-4xl font-bold text-white">{proUsers + premiumUsers}</p>
          <p className="text-sm text-zinc-500 mt-2">{proUsers} Pro · {premiumUsers} Premium</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-cyan-900/10 border border-cyan-500/20">
          <p className="text-sm text-cyan-300 mb-1">Signups (30d)</p>
          <p className="text-4xl font-bold text-white">{users?.length || 0}</p>
          <p className="text-sm text-zinc-500 mt-2">New users</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-900/10 border border-orange-500/20">
          <p className="text-sm text-orange-300 mb-1">Conversion Rate</p>
          <p className="text-4xl font-bold text-white">
            {users?.length ? Math.round(((proUsers + premiumUsers) / users.length) * 100) : 0}%
          </p>
          <p className="text-sm text-zinc-500 mt-2">Free → Paid</p>
        </div>
      </div>

      {/* Tool Usage */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-6">Tool Usage</h2>
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="space-y-4">
            {toolUsage.map((tool) => (
              <div key={tool.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">{tool.name}</span>
                  <span className="text-sm font-medium text-white">{tool.count.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-${tool.color}-500`}
                    style={{ width: `${(tool.count / maxUsage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Signups Chart (Simplified) */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Daily Signups (Last 30 Days)</h2>
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-end gap-1 h-40">
            {Object.entries(signupsByDate).slice(-30).map(([date, count]) => (
              <div 
                key={date} 
                className="flex-1 bg-gradient-to-t from-purple-600 to-cyan-500 rounded-t-sm hover:opacity-80 transition-opacity group relative"
                style={{ height: `${Math.max((count / Math.max(...Object.values(signupsByDate))) * 100, 5)}%` }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 rounded text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                  {date}: {count} signup{count !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
          {Object.keys(signupsByDate).length === 0 && (
            <p className="text-zinc-500 text-center py-8">No signups in the last 30 days</p>
          )}
        </div>
      </div>
    </div>
  );
}
