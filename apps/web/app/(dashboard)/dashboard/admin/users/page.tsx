'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  github_username: string | null;
  created_at: string;
  subscription?: {
    plan: string;
    status: string;
  };
  stats?: {
    monitors: number;
    flags: number;
    errors: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'pro' | 'premium'>('all');
  const supabase = createClient();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    
    // Get all users with subscriptions
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email, github_username, created_at')
      .order('created_at', { ascending: false });

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('user_id, plan, status');

    // Get stats for each user
    const { data: monitors } = await supabase
      .from('uptime_monitors')
      .select('user_id');

    const { data: flagProjects } = await supabase
      .from('togglebox_projects')
      .select('id, user_id');

    const { data: errorProjects } = await supabase
      .from('errorwatch_projects')
      .select('id, user_id');

    // Build user objects
    const userList: User[] = (profiles || []).map(profile => {
      const sub = subscriptions?.find(s => s.user_id === profile.id);
      const userMonitors = monitors?.filter(m => m.user_id === profile.id).length || 0;
      
      return {
        ...profile,
        subscription: sub ? { plan: sub.plan, status: sub.status } : undefined,
        stats: {
          monitors: userMonitors,
          flags: 0, // Would need to join through projects
          errors: 0,
        },
      };
    });

    setUsers(userList);
    setLoading(false);
  };

  const filteredUsers = users.filter(user => {
    // Search filter
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchLower)) ||
      (user.email?.toLowerCase().includes(searchLower)) ||
      (user.github_username?.toLowerCase().includes(searchLower));

    if (search && !matchesSearch) return false;

    // Plan filter
    if (filter === 'free' && user.subscription) return false;
    if (filter === 'pro' && user.subscription?.plan !== 'pro') return false;
    if (filter === 'premium' && user.subscription?.plan !== 'team') return false;

    return true;
  });

  const getPlanBadge = (user: User) => {
    if (!user.subscription) {
      return <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400 text-xs">Free</span>;
    }
    if (user.subscription.plan === 'team') {
      return <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">Premium</span>;
    }
    if (user.subscription.plan === 'pro') {
      return <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">Pro</span>;
    }
    return <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400 text-xs">Free</span>;
  };

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <p className="text-zinc-400">{users.length} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'free', 'pro', 'premium'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-900/80">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">User</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Plan</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Monitors</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Joined</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white font-semibold">
                        {user.name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {user.name || user.github_username || 'Unknown'}
                        </p>
                        <p className="text-sm text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getPlanBadge(user)}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {user.stats?.monitors || 0}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/admin/support?user=${user.id}`}
                      className="text-sm text-purple-400 hover:text-purple-300"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
