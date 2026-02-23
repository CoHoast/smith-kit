'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  github_username: string | null;
}

interface Subscription {
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: string | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setProfile(profileData);
    setSubscription(subData);
    setName(profileData?.name || '');
    setIsLoading(false);
  };

  const updateProfile = async () => {
    if (!profile) return;
    setIsSaving(true);

    await supabase
      .from('profiles')
      .update({ name })
      .eq('id', profile.id);

    setIsSaving(false);
    alert('Profile updated!');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-[#a1a1b5]">Manage your account and subscription</p>
      </div>

      {/* Profile */}
      <div className="mb-8 p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
        <h2 className="text-lg font-bold text-white mb-4">Profile</h2>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-2xl font-bold">
            {name?.[0] || profile?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-white">{profile?.email}</p>
            {profile?.github_username && (
              <p className="text-sm text-[#6b6b80]">@{profile.github_username}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
            />
          </div>

          <button
            onClick={updateProfile}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-[#6366f1] text-white text-sm font-medium hover:bg-[#5558e3] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div id="billing" className="mb-8 p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
        <h2 className="text-lg font-bold text-white mb-4">Subscription</h2>
        
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0f] mb-4">
          <div>
            <p className="font-medium text-white capitalize">{subscription?.plan || 'Free'} Plan</p>
            <p className="text-sm text-[#6b6b80]">
              {subscription?.plan === 'free'
                ? 'Limited features'
                : `Renews ${subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}`}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            subscription?.status === 'active' ? 'bg-green-500/10 text-green-500' :
            subscription?.status === 'past_due' ? 'bg-yellow-500/10 text-yellow-500' :
            'bg-gray-500/10 text-gray-500'
          }`}>
            {subscription?.status || 'Active'}
          </span>
        </div>

        {subscription?.plan === 'free' ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
              <h3 className="font-bold text-white mb-2">Upgrade to Pro</h3>
              <p className="text-sm text-[#a1a1b5] mb-4">
                Get 10 repos, 50 monitors, 500 commits/month, and more.
              </p>
              <div className="flex items-center gap-4">
                <a 
                  href="mailto:support@smithkit.dev?subject=Upgrade%20to%20Pro%20Plan"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Upgrade for $39/mo
                </a>
                <a 
                  href="mailto:support@smithkit.dev?subject=Upgrade%20to%20Premium%20Plan"
                  className="px-4 py-2 rounded-xl border border-purple-500/30 text-purple-400 font-medium text-sm hover:bg-purple-500/10 transition-colors"
                >
                  Premium $99/mo
                </a>
              </div>
              <p className="text-xs text-[#6b6b80] mt-3">Contact us to upgrade — Stripe checkout coming soon!</p>
            </div>
          </div>
        ) : (
          <button className="text-sm text-[#6b6b80] hover:text-white transition-colors">
            Manage subscription →
          </button>
        )}
      </div>

      {/* Usage */}
      <div className="mb-8 p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
        <h2 className="text-lg font-bold text-white mb-4">Usage This Month</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#a1a1b5]">Repos</span>
              <span className="text-white">0 / 1</span>
            </div>
            <div className="h-2 rounded-full bg-[#1a1a25]">
              <div className="h-2 rounded-full bg-[#6366f1]" style={{ width: '0%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#a1a1b5]">Monitors</span>
              <span className="text-white">0 / 3</span>
            </div>
            <div className="h-2 rounded-full bg-[#1a1a25]">
              <div className="h-2 rounded-full bg-green-500" style={{ width: '0%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#a1a1b5]">Commits</span>
              <span className="text-white">0 / 30</span>
            </div>
            <div className="h-2 rounded-full bg-[#1a1a25]">
              <div className="h-2 rounded-full bg-orange-500" style={{ width: '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-8 p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
        <h2 className="text-lg font-bold text-white mb-4">Notifications</h2>
        
        <div className="space-y-4">
          {/* Uptime Alerts */}
          <div className="p-4 rounded-xl bg-[#0a0a0f]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Uptime Alerts</p>
                  <p className="text-xs text-[#6b6b80]">Get notified when sites go down or SSL expires</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 pl-11">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-[#1a1a25] border-[#27272a] text-[#6366f1] focus:ring-[#6366f1]" />
                <span className="text-sm text-[#a1a1b5]">Email alerts for downtime</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-[#1a1a25] border-[#27272a] text-[#6366f1] focus:ring-[#6366f1]" />
                <span className="text-sm text-[#a1a1b5]">Email alerts for SSL expiry (14 days before)</span>
              </label>
              <div className="pt-2">
                <label className="block text-xs text-[#6b6b80] mb-1">Slack Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-[#27272a] text-white placeholder-[#6b6b80] text-sm focus:border-[#6366f1] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Changelog Notifications */}
          <div className="p-4 rounded-xl bg-[#0a0a0f]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
                    <path d="M19 17V5a2 2 0 0 0-2-2H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Changelog Notifications</p>
                  <p className="text-xs text-[#6b6b80]">Notify users when you publish new releases</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 pl-11">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-[#1a1a25] border-[#27272a] text-[#6366f1] focus:ring-[#6366f1]" />
                <span className="text-sm text-[#a1a1b5]">Email subscribers on new release</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-[#1a1a25] border-[#27272a] text-[#6366f1] focus:ring-[#6366f1]" />
                <span className="text-sm text-[#a1a1b5]">Post to Slack on new release</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-[#1a1a25] border-[#27272a] text-[#6366f1] focus:ring-[#6366f1]" />
                <span className="text-sm text-[#a1a1b5]">Post to Discord on new release</span>
              </label>
            </div>
          </div>
        </div>

        <button className="mt-4 px-4 py-2 rounded-xl bg-[#6366f1] text-white text-sm font-medium hover:bg-[#5558e3] transition-colors">
          Save Notification Settings
        </button>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-[#12121a] border border-red-500/20">
        <h2 className="text-lg font-bold text-red-500 mb-4">Danger Zone</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white">Sign out</p>
            <p className="text-sm text-[#6b6b80]">Sign out of your account on this device</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
