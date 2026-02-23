import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get stats
  const { data: users } = await supabase
    .from('profiles')
    .select('id, created_at')
    .order('created_at', { ascending: false });

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('plan, user_id');

  const { count: monitorCount } = await supabase
    .from('uptime_monitors')
    .select('*', { count: 'exact', head: true });

  const { count: flagCount } = await supabase
    .from('togglebox_flags')
    .select('*', { count: 'exact', head: true });

  const { count: errorCount } = await supabase
    .from('errorwatch_errors')
    .select('*', { count: 'exact', head: true });

  const { count: cronCount } = await supabase
    .from('cron_jobs')
    .select('*', { count: 'exact', head: true });

  // Calculate stats
  const totalUsers = users?.length || 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const usersToday = users?.filter(u => new Date(u.created_at) >= today).length || 0;
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const usersThisWeek = users?.filter(u => new Date(u.created_at) >= weekAgo).length || 0;

  const subMap = new Map(subscriptions?.map(s => [s.user_id, s.plan]) || []);
  const freeUsers = totalUsers - (subscriptions?.length || 0);
  const proUsers = subscriptions?.filter(s => s.plan === 'pro').length || 0;
  const premiumUsers = subscriptions?.filter(s => s.plan === 'team').length || 0;

  // Recent activity
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, name, email, github_username, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-zinc-400">Monitor and manage SmithKit customers</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {/* Users */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-900/10 border border-purple-500/20">
          <p className="text-sm text-purple-300 mb-1">Total Users</p>
          <p className="text-4xl font-bold text-white">{totalUsers}</p>
          <p className="text-sm text-zinc-500 mt-2">+{usersToday} today</p>
        </div>

        {/* Paid Users */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20">
          <p className="text-sm text-emerald-300 mb-1">Paid Users</p>
          <p className="text-4xl font-bold text-white">{proUsers + premiumUsers}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs text-zinc-500">{proUsers} Pro</span>
            <span className="text-xs text-zinc-500">·</span>
            <span className="text-xs text-zinc-500">{premiumUsers} Premium</span>
          </div>
        </div>

        {/* MRR Estimate */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-cyan-900/10 border border-cyan-500/20">
          <p className="text-sm text-cyan-300 mb-1">Est. MRR</p>
          <p className="text-4xl font-bold text-white">
            ${(proUsers * 39) + (premiumUsers * 99)}
          </p>
          <p className="text-sm text-zinc-500 mt-2">Monthly recurring</p>
        </div>

        {/* Free Users */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-600/20 to-zinc-900/10 border border-zinc-500/20">
          <p className="text-sm text-zinc-300 mb-1">Free Users</p>
          <p className="text-4xl font-bold text-white">{freeUsers}</p>
          <p className="text-sm text-zinc-500 mt-2">
            {totalUsers > 0 ? Math.round((freeUsers / totalUsers) * 100) : 0}% of total
          </p>
        </div>
      </div>

      {/* Tool Usage */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Tool Usage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <p className="text-sm text-zinc-500">Uptime Monitors</p>
            <p className="text-2xl font-bold text-white">{monitorCount || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <p className="text-sm text-zinc-500">Feature Flags</p>
            <p className="text-2xl font-bold text-white">{flagCount || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <p className="text-sm text-zinc-500">Errors Tracked</p>
            <p className="text-2xl font-bold text-white">{errorCount || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <p className="text-sm text-zinc-500">Cron Jobs</p>
            <p className="text-2xl font-bold text-white">{cronCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Signups</h2>
            <Link href="/dashboard/admin/users" className="text-sm text-purple-400 hover:text-purple-300">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white font-semibold">
                    {user.name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name || user.github_username || 'Unknown'}</p>
                    <p className="text-sm text-zinc-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    subMap.get(user.id) === 'team' ? 'bg-purple-500/20 text-purple-400' :
                    subMap.get(user.id) === 'pro' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-zinc-700/50 text-zinc-400'
                  }`}>
                    {subMap.get(user.id) === 'team' ? 'Premium' : 
                     subMap.get(user.id) === 'pro' ? 'Pro' : 'Free'}
                  </span>
                </div>
              </div>
            ))}
            {(!recentUsers || recentUsers.length === 0) && (
              <p className="text-zinc-500 text-center py-8">No users yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              href="/dashboard/admin/users" 
              className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Manage Users</p>
                  <p className="text-sm text-zinc-500">View and manage customer accounts</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link 
              href="/dashboard/admin/analytics" 
              className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21H3V3" />
                    <path d="M21 9l-6 6-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">View Analytics</p>
                  <p className="text-sm text-zinc-500">Detailed usage statistics</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link 
              href="/dashboard/admin/support" 
              className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Support Tools</p>
                  <p className="text-sm text-zinc-500">Help customers resolve issues</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
