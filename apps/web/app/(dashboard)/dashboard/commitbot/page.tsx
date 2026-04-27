'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
  secret?: string; // Only present when just created
}

interface Commit {
  id: string;
  repo_name: string;
  generated_message: string;
  was_accepted: boolean | null;
  was_edited: boolean | null;
  created_at: string;
}

interface Preferences {
  style: 'conventional' | 'simple' | 'detailed' | 'emoji';
  include_scope: boolean;
  include_body: boolean;
  max_subject_length: number;
  custom_instructions: string | null;
}

interface Usage {
  current: number;
  limit: number;
}

export default function CommitBotPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'history' | 'preferences' | 'guide'>('overview');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    style: 'conventional',
    include_scope: true,
    include_body: false,
    max_subject_length: 72,
    custom_instructions: null
  });
  const [usage, setUsage] = useState<Usage>({ current: 0, limit: 30 });
  const [loading, setLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadApiKeys(),
      loadCommits(),
      loadPreferences(),
      loadUsage()
    ]);
    setLoading(false);
  };

  const loadApiKeys = async () => {
    const response = await fetch('/api/commitbot/keys');
    if (response.ok) {
      const data = await response.json();
      setApiKeys(data.keys || []);
    }
  };

  const loadCommits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('commitbot_commits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setCommits(data || []);
    }
  };

  const loadPreferences = async () => {
    const response = await fetch('/api/commitbot/preferences');
    if (response.ok) {
      const data = await response.json();
      setPreferences(data.preferences);
    }
  };

  const loadUsage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      
      const { data: usageData } = await supabase
        .from('usage')
        .select('count')
        .eq('user_id', user.id)
        .eq('tool', 'commitbot')
        .eq('metric', 'commits')
        .gte('period_start', startOfMonth.toISOString().split('T')[0])
        .single();

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single();

      const limits: Record<string, number> = { free: 30, pro: 500, premium: 2000 };
      const plan = subscription?.plan || 'free';
      setUsage({
        current: usageData?.count || 0,
        limit: limits[plan] || 30
      });
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;
    
    setSaving(true);
    const response = await fetch('/api/commitbot/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName.trim() })
    });

    if (response.ok) {
      const data = await response.json();
      setNewKeySecret(data.key.secret);
      setNewKeyName('');
      await loadApiKeys();
    }
    setSaving(false);
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    
    const { error } = await supabase
      .from('commitbot_api_keys')
      .update({ is_active: false })
      .eq('id', keyId);
      
    if (!error) {
      await loadApiKeys();
    }
  };

  const updatePreferences = async (updates: Partial<Preferences>) => {
    setSaving(true);
    const response = await fetch('/api/commitbot/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...preferences, ...updates })
    });

    if (response.ok) {
      setPreferences({ ...preferences, ...updates });
    }
    setSaving(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">CommitBot</h1>
          <p className="text-zinc-400">AI-powered commit messages for better git history</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="text-sm text-zinc-400">This month:</div>
          <div className="font-semibold text-white">{usage.current}/{usage.limit}</div>
          <div className="text-xs text-zinc-500">commits</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-zinc-900/50 p-1 rounded-xl w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'keys', label: 'API Keys' },
          { id: 'history', label: 'History' },
          { id: 'preferences', label: 'Preferences' },
          { id: 'guide', label: 'Setup Guide' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <line x1="1.05" y1="12" x2="7" y2="12" />
                  <line x1="17.01" y1="12" x2="22.96" y2="12" />
                </svg>
                <h3 className="text-lg font-semibold text-white">Generated</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{commits.length}</div>
              <div className="text-sm text-zinc-500">Total commits</div>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <h3 className="text-lg font-semibold text-white">API Keys</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{apiKeys.filter(k => k.is_active).length}</div>
              <div className="text-sm text-zinc-500">Active keys</div>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                </svg>
                <h3 className="text-lg font-semibold text-white">Usage</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{((usage.current / usage.limit) * 100).toFixed(0)}%</div>
              <div className="text-sm text-zinc-500">Monthly limit</div>
              <div className="w-full bg-zinc-800 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((usage.current / usage.limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recent Commits */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Commits</h3>
            {commits.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <line x1="1.05" y1="12" x2="7" y2="12" />
                  <line x1="17.01" y1="12" x2="22.96" y2="12" />
                </svg>
                <p>No commits generated yet</p>
                <p className="text-sm mt-1">Set up the CLI to start generating commits</p>
              </div>
            ) : (
              <div className="space-y-3">
                {commits.slice(0, 5).map(commit => (
                  <div key={commit.id} className="flex items-start gap-3 p-4 bg-zinc-950/50 rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-zinc-300 mb-1">{commit.generated_message}</div>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        {commit.repo_name && <span>{commit.repo_name}</span>}
                        <span>{formatDate(commit.created_at)}</span>
                        {commit.was_accepted === true && <span className="text-green-500">✓ Used</span>}
                        {commit.was_accepted === false && <span className="text-zinc-500">○ Not used</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {commits.length > 5 && (
                  <button
                    onClick={() => setActiveTab('history')}
                    className="w-full py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View all {commits.length} commits →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">API Keys</h3>
              <p className="text-zinc-400 text-sm">Manage your CommitBot API keys for CLI integration</p>
            </div>
            <button
              onClick={() => setShowNewKeyModal(true)}
              disabled={apiKeys.filter(k => k.is_active).length >= 5}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New API Key
            </button>
          </div>

          {apiKeys.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <svg className="w-12 h-12 mx-auto mb-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <p className="text-zinc-500 mb-4">No API keys yet</p>
              <button
                onClick={() => setShowNewKeyModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                Create your first API key
              </button>
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-950/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Key</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Last Used</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Created</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {apiKeys.map(key => (
                    <tr key={key.id} className={key.is_active ? '' : 'opacity-50'}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{key.name}</div>
                        {!key.is_active && <div className="text-xs text-red-500">Deleted</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm text-zinc-400">{key.key_prefix}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500">
                        {key.last_used_at ? formatDate(key.last_used_at) : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500">
                        {formatDate(key.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {key.is_active && (
                          <button
                            onClick={() => deleteApiKey(key.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4">
            {newKeySecret ? (
              <>
                <h2 className="text-xl font-bold text-white mb-4">API Key Created</h2>
                <div className="mb-6">
                  <p className="text-sm text-zinc-400 mb-3">Copy this key now. You won't be able to see it again.</p>
                  <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                    <div className="font-mono text-sm text-zinc-300 break-all">{newKeySecret}</div>
                    <button
                      onClick={() => copyToClipboard(newKeySecret)}
                      className="mt-3 text-sm text-purple-400 hover:text-purple-300"
                    >
                      Copy to clipboard
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setNewKeySecret(null);
                    }}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-4">Create API Key</h2>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="My Development Key"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewKeyModal(false)}
                    className="flex-1 py-2 px-4 border border-zinc-700 text-zinc-400 rounded-xl hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createApiKey}
                    disabled={!newKeyName.trim() || saving}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Commit History</h3>
            <p className="text-zinc-400 text-sm">All commits generated by CommitBot</p>
          </div>

          {commits.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <p className="text-zinc-500">No commits generated yet</p>
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="space-y-4">
                {commits.map(commit => (
                  <div key={commit.id} className="flex items-start gap-4 p-4 bg-zinc-950/50 rounded-xl">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-zinc-300 mb-2">{commit.generated_message}</div>
                      <div className="flex items-center gap-6 text-sm text-zinc-500">
                        <span>{formatDate(commit.created_at)}</span>
                        {commit.repo_name && <span>📁 {commit.repo_name}</span>}
                        {commit.was_accepted === true && <span className="text-green-400">✓ Used</span>}
                        {commit.was_accepted === false && <span className="text-zinc-500">○ Not used</span>}
                        {commit.was_edited && <span className="text-yellow-400">✏️ Edited</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(commit.generated_message)}
                      className="text-zinc-500 hover:text-white p-2"
                      title="Copy commit message"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Commit Message Preferences</h3>
            <p className="text-zinc-400 text-sm">Customize how CommitBot generates your commit messages</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Commit Style</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'conventional', label: 'Conventional', desc: 'feat: add user authentication' },
                  { id: 'simple', label: 'Simple', desc: 'Add user authentication' },
                  { id: 'detailed', label: 'Detailed', desc: 'With body paragraphs' },
                  { id: 'emoji', label: 'Emoji', desc: '✨ Add user authentication' }
                ].map(style => (
                  <button
                    key={style.id}
                    onClick={() => updatePreferences({ style: style.id as any })}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      preferences.style === style.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <div className="font-medium text-white mb-1">{style.label}</div>
                    <div className="text-sm text-zinc-400 font-mono">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Include Scope</div>
                  <div className="text-sm text-zinc-400">Add scope in parentheses: feat(auth): ...</div>
                </div>
                <button
                  onClick={() => updatePreferences({ include_scope: !preferences.include_scope })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    preferences.include_scope ? 'bg-purple-600' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    preferences.include_scope ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Include Body</div>
                  <div className="text-sm text-zinc-400">Add detailed body paragraphs</div>
                </div>
                <button
                  onClick={() => updatePreferences({ include_body: !preferences.include_body })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    preferences.include_body ? 'bg-purple-600' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    preferences.include_body ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Max Length */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Max Subject Length: {preferences.max_subject_length}
              </label>
              <input
                type="range"
                min="50"
                max="120"
                value={preferences.max_subject_length}
                onChange={(e) => updatePreferences({ max_subject_length: parseInt(e.target.value) })}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>50</span>
                <span>120</span>
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Custom Instructions</label>
              <textarea
                value={preferences.custom_instructions || ''}
                onChange={(e) => updatePreferences({ custom_instructions: e.target.value || null })}
                placeholder="Additional style preferences or specific requirements..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Setup Guide Tab */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Setup Guide</h3>
            <p className="text-zinc-400 text-sm">Get started with CommitBot in your development workflow</p>
          </div>

          <div className="space-y-6">
            {/* CLI Installation */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">1</span>
                </div>
                Install the CLI
              </h4>
              <div className="bg-zinc-950 rounded-xl p-4 font-mono text-sm text-zinc-300">
                npm install -g @smithkit/commitbot
              </div>
            </div>

            {/* API Key Setup */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                Configure API Key
              </h4>
              {apiKeys.filter(k => k.is_active).length > 0 ? (
                <div className="bg-zinc-950 rounded-xl p-4 font-mono text-sm text-zinc-300">
                  commitbot config --api-key YOUR_API_KEY
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-zinc-400">You need an API key first.</p>
                  <button
                    onClick={() => setActiveTab('keys')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create API Key →
                  </button>
                </div>
              )}
            </div>

            {/* Usage Examples */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                Usage
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Generate commit message:</p>
                  <div className="bg-zinc-950 rounded-xl p-4 font-mono text-sm text-zinc-300">
                    git add .<br />
                    commitbot
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Quick commit with generated message:</p>
                  <div className="bg-zinc-950 rounded-xl p-4 font-mono text-sm text-zinc-300">
                    git add .<br />
                    commitbot --commit
                  </div>
                </div>
              </div>
            </div>

            {/* VS Code Extension */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">VS Code Extension</h4>
              <p className="text-zinc-400 mb-4">Install the SmithKit extension for integrated commit generation</p>
              <div className="flex gap-3">
                <div className="bg-zinc-950 rounded-xl p-4 font-mono text-sm text-zinc-300 flex-1">
                  ext install smithkit.commitbot
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Install Extension
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}