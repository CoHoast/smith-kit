'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface UserDetails {
  id: string;
  name: string | null;
  email: string | null;
  github_username: string | null;
  created_at: string;
  subscription?: {
    plan: string;
    status: string;
    current_period_end: string;
  };
  monitors: { id: string; name: string; url: string; current_status: string }[];
  projects: {
    togglebox: { id: string; name: string }[];
    errorwatch: { id: string; name: string }[];
    llm: { id: string; name: string }[];
  };
}

export default function AdminSupportPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user');
  
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string | null }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserDetails(selectedUserId);
    }
  }, [selectedUserId]);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email')
      .order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const loadUserDetails = async (id: string) => {
    setLoading(true);
    
    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', id)
      .single();

    // Get monitors
    const { data: monitors } = await supabase
      .from('uptime_monitors')
      .select('id, name, url, current_status')
      .eq('user_id', id);

    // Get togglebox projects
    const { data: toggleboxProjects } = await supabase
      .from('togglebox_projects')
      .select('id, name')
      .eq('user_id', id);

    // Get errorwatch projects
    const { data: errorwatchProjects } = await supabase
      .from('errorwatch_projects')
      .select('id, name')
      .eq('user_id', id);

    // Get LLM projects
    const { data: llmProjects } = await supabase
      .from('llm_projects')
      .select('id, name')
      .eq('user_id', id);

    setUserDetails({
      ...profile,
      subscription: subscription || undefined,
      monitors: monitors || [],
      projects: {
        togglebox: toggleboxProjects || [],
        errorwatch: errorwatchProjects || [],
        llm: llmProjects || [],
      },
    });
    
    setLoading(false);
  };

  const updateSubscription = async (plan: string) => {
    if (!selectedUserId) return;
    
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: selectedUserId,
        plan,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (!error) {
      loadUserDetails(selectedUserId);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase().includes(search.toLowerCase())) ||
    (u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Support Tools</h1>
        <p className="text-zinc-400">View user details and provide support</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* User List */}
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 focus:border-purple-500/50 focus:outline-none mb-4"
            />
            
            <div className="rounded-2xl border border-zinc-800 overflow-hidden max-h-[600px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors ${
                    selectedUserId === user.id ? 'bg-purple-600/20 border-l-2 border-l-purple-500' : ''
                  }`}
                >
                  <p className="font-medium text-white truncate">{user.name || 'Unknown'}</p>
                  <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-zinc-500 text-center py-8">No users found</p>
              )}
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="md:col-span-2">
          {!selectedUserId ? (
            <div className="rounded-2xl border border-zinc-800 p-12 text-center">
              <svg className="w-12 h-12 text-zinc-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              <p className="text-zinc-500">Select a user to view their details</p>
            </div>
          ) : loading ? (
            <div className="rounded-2xl border border-zinc-800 p-12 text-center">
              <p className="text-zinc-500">Loading user details...</p>
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="rounded-2xl border border-zinc-800 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
                      {userDetails.name?.[0] || userDetails.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {userDetails.name || userDetails.github_username || 'Unknown'}
                      </h2>
                      <p className="text-zinc-400">{userDetails.email}</p>
                      {userDetails.github_username && (
                        <p className="text-sm text-zinc-500">@{userDetails.github_username}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userDetails.subscription?.plan === 'team' ? 'bg-purple-500/20 text-purple-400' :
                    userDetails.subscription?.plan === 'pro' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-zinc-700/50 text-zinc-400'
                  }`}>
                    {userDetails.subscription?.plan === 'team' ? 'Premium' :
                     userDetails.subscription?.plan === 'pro' ? 'Pro' : 'Free'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-zinc-900/50">
                    <p className="text-sm text-zinc-500">Member Since</p>
                    <p className="text-lg font-semibold text-white">
                      {new Date(userDetails.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/50">
                    <p className="text-sm text-zinc-500">User ID</p>
                    <p className="text-sm font-mono text-zinc-400 truncate">{userDetails.id}</p>
                  </div>
                </div>

                {/* Plan Management */}
                <div className="border-t border-zinc-800 pt-6">
                  <p className="text-sm font-semibold text-zinc-400 mb-3">Change Plan</p>
                  <div className="flex gap-2">
                    {['free', 'pro', 'team'].map((plan) => (
                      <button
                        key={plan}
                        onClick={() => updateSubscription(plan)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          (userDetails.subscription?.plan || 'free') === plan
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {plan === 'team' ? 'Premium' : plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Resources */}
              <div className="rounded-2xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">User Resources</h3>
                
                <div className="space-y-4">
                  {/* Monitors */}
                  <div>
                    <p className="text-sm font-medium text-zinc-400 mb-2">
                      Uptime Monitors ({userDetails.monitors.length})
                    </p>
                    {userDetails.monitors.length > 0 ? (
                      <div className="space-y-2">
                        {userDetails.monitors.map((m) => (
                          <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${m.current_status === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span className="text-sm text-white">{m.name}</span>
                            </div>
                            <span className="text-xs text-zinc-500 truncate max-w-48">{m.url}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">No monitors</p>
                    )}
                  </div>

                  {/* Projects */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                    <div>
                      <p className="text-sm font-medium text-zinc-400 mb-2">ToggleBox</p>
                      <p className="text-2xl font-bold text-white">{userDetails.projects.togglebox.length}</p>
                      <p className="text-xs text-zinc-500">projects</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-400 mb-2">ErrorWatch</p>
                      <p className="text-2xl font-bold text-white">{userDetails.projects.errorwatch.length}</p>
                      <p className="text-xs text-zinc-500">projects</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-400 mb-2">LLM Analytics</p>
                      <p className="text-2xl font-bold text-white">{userDetails.projects.llm.length}</p>
                      <p className="text-xs text-zinc-500">projects</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
