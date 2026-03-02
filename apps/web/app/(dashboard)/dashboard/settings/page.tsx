'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  github_username: string | null;
  discord_webhook_url: string | null;
  slack_webhook_url: string | null;
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
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [name, setName] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [emailDowntime, setEmailDowntime] = useState(true);
  const [emailSSL, setEmailSSL] = useState(false);
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
    setDiscordWebhook(profileData?.discord_webhook_url || '');
    setSlackWebhook(profileData?.slack_webhook_url || '');
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

  const updateNotificationSettings = async () => {
    if (!profile) return;
    setIsSavingNotifications(true);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        discord_webhook_url: discordWebhook || null,
        slack_webhook_url: slackWebhook || null,
      })
      .eq('id', profile.id);

    setIsSavingNotifications(false);
    
    if (error) {
      alert('Error saving settings: ' + error.message);
    } else {
      alert('Notification settings saved!');
    }
  };

  const testDiscordWebhook = async () => {
    if (!discordWebhook) {
      alert('Please enter a Discord webhook URL first');
      return;
    }

    try {
      const response = await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'SmithKit',
          embeds: [{
            title: '✅ Webhook Test Successful!',
            description: 'Your Discord webhook is working correctly.',
            color: 0x22c55e,
            timestamp: new Date().toISOString(),
            footer: { text: 'SmithKit Uptime' },
          }],
        }),
      });

      if (response.ok) {
        alert('Test message sent! Check your Discord channel.');
      } else {
        alert('Failed to send test message. Check your webhook URL.');
      }
    } catch {
      alert('Error: Could not connect to Discord. Check your webhook URL.');
    }
  };

  const testSlackWebhook = async () => {
    if (!slackWebhook) {
      alert('Please enter a Slack webhook URL first');
      return;
    }

    try {
      const response = await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '✅ SmithKit Webhook Test Successful!',
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: '✅ Webhook Test Successful!', emoji: true },
            },
            {
              type: 'section',
              text: { type: 'mrkdwn', text: 'Your Slack webhook is working correctly.' },
            },
          ],
        }),
      });

      if (response.ok) {
        alert('Test message sent! Check your Slack channel.');
      } else {
        alert('Failed to send test message. Check your webhook URL.');
      }
    } catch {
      alert('Error: Could not connect to Slack. Check your webhook URL.');
    }
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
        
        <div className="space-y-6">
          {/* Uptime Alerts */}
          <div className="p-4 rounded-xl bg-[#0a0a0f]">
            <div className="flex items-center justify-between mb-4">
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
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailDowntime}
                    onChange={(e) => setEmailDowntime(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#1a1a25] border-[#27272a] text-[#6366f1] focus:ring-[#6366f1]" 
                  />
                  <span className="text-sm text-[#a1a1b5]">Email alerts for downtime</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailSSL}
                    onChange={(e) => setEmailSSL(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#1a1a25] border-[#27272a] text-[#6366f1] focus:ring-[#6366f1]" 
                  />
                  <span className="text-sm text-[#a1a1b5]">Email alerts for SSL expiry (30/14/7 days)</span>
                </label>
              </div>

              {/* Discord Webhook */}
              <div className="pt-2 border-t border-[#27272a]">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <label className="text-sm font-medium text-[#a1a1b5]">Discord Webhook URL</label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={discordWebhook}
                    onChange={(e) => setDiscordWebhook(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="flex-1 px-3 py-2 rounded-lg bg-[#12121a] border border-[#27272a] text-white placeholder-[#6b6b80] text-sm focus:border-[#5865F2] focus:outline-none"
                  />
                  <button
                    onClick={testDiscordWebhook}
                    className="px-3 py-2 rounded-lg bg-[#5865F2]/20 text-[#5865F2] text-sm font-medium hover:bg-[#5865F2]/30 transition-colors"
                  >
                    Test
                  </button>
                </div>
              </div>

              {/* Slack Webhook */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-[#E01E5A]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                  </svg>
                  <label className="text-sm font-medium text-[#a1a1b5]">Slack Webhook URL</label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="flex-1 px-3 py-2 rounded-lg bg-[#12121a] border border-[#27272a] text-white placeholder-[#6b6b80] text-sm focus:border-[#E01E5A] focus:outline-none"
                  />
                  <button
                    onClick={testSlackWebhook}
                    className="px-3 py-2 rounded-lg bg-[#E01E5A]/20 text-[#E01E5A] text-sm font-medium hover:bg-[#E01E5A]/30 transition-colors"
                  >
                    Test
                  </button>
                </div>
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

        <button 
          onClick={updateNotificationSettings}
          disabled={isSavingNotifications}
          className="mt-6 px-4 py-2 rounded-xl bg-[#6366f1] text-white text-sm font-medium hover:bg-[#5558e3] transition-colors disabled:opacity-50"
        >
          {isSavingNotifications ? 'Saving...' : 'Save Notification Settings'}
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
