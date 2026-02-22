'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

interface Preferences {
  style: 'conventional' | 'simple' | 'detailed' | 'emoji';
  include_scope: boolean;
  include_body: boolean;
  max_subject_length: number;
}

export default function CommitBotPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    style: 'conventional',
    include_scope: true,
    include_body: false,
    max_subject_length: 72,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [usageThisMonth, setUsageThisMonth] = useState(0);
  const [commitHistory, setCommitHistory] = useState<Array<{
    id: string;
    repo_name: string | null;
    generated_message: string;
    created_at: string;
  }>>([]);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load API keys
    const { data: keys } = await supabase
      .from('commitbot_api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setApiKeys(keys || []);

    // Load preferences
    const { data: prefs } = await supabase
      .from('commitbot_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (prefs) {
      setPreferences(prefs);
    }

    // Load usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data: usageData } = await supabase
      .from('usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('tool', 'commitbot')
      .eq('metric', 'commits')
      .gte('period_start', startOfMonth.toISOString().split('T')[0])
      .single();
    setUsageThisMonth(usageData?.count || 0);

    // Load commit history
    const { data: commits } = await supabase
      .from('commitbot_commits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setCommitHistory(commits || []);

    setIsLoading(false);
  };

  const generateApiKey = async () => {
    if (!newKeyName) return;
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Generate a random API key
    const key = `sk_${crypto.randomUUID().replace(/-/g, '')}`;
    const keyPrefix = key.substring(0, 12);
    
    // In production, hash the key before storing
    const { error } = await supabase.from('commitbot_api_keys').insert({
      user_id: user.id,
      name: newKeyName,
      key_hash: key, // In production: hash this
      key_prefix: keyPrefix,
    });

    if (!error) {
      setGeneratedKey(key);
      loadData();
    }
    setIsSaving(false);
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    await supabase.from('commitbot_api_keys').delete().eq('id', id);
    loadData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">CommitBot</h1>
        <p className="text-[#a1a1b5]">AI generates perfect commit messages from your code diffs</p>
      </div>

      {/* Usage Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <p className="text-sm text-[#6b6b80]">Commits this month</p>
          <p className="text-2xl font-bold text-white">{usageThisMonth}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <p className="text-sm text-[#6b6b80]">Monthly limit</p>
          <p className="text-2xl font-bold text-white">30</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <p className="text-sm text-[#6b6b80]">API Keys</p>
          <p className="text-2xl font-bold text-white">{apiKeys.length}</p>
        </div>
      </div>

      {/* Installation */}
      <div className="mb-8 p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
        <h2 className="text-lg font-bold text-white mb-4">Installation</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-[#a1a1b5] mb-2">CLI (recommended)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 rounded-xl bg-[#0a0a0f] font-mono text-sm text-[#a1a1b5]">
                npx commitbot
              </code>
              <button
                onClick={() => copyToClipboard('npx commitbot')}
                className="px-4 py-3 rounded-xl bg-[#1a1a25] text-[#a1a1b5] hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-[#a1a1b5] mb-2">Or install globally</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 rounded-xl bg-[#0a0a0f] font-mono text-sm text-[#a1a1b5]">
                npm install -g @smithkit/commitbot
              </code>
              <button
                onClick={() => copyToClipboard('npm install -g @smithkit/commitbot')}
                className="px-4 py-3 rounded-xl bg-[#1a1a25] text-[#a1a1b5] hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="mb-8 p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">API Keys</h2>
          <button
            onClick={() => {
              setShowKeyModal(true);
              setNewKeyName('');
              setGeneratedKey(null);
            }}
            className="px-4 py-2 rounded-xl bg-[#6366f1] text-white text-sm font-medium hover:bg-[#5558e3] transition-colors"
          >
            Generate Key
          </button>
        </div>

        {apiKeys.length === 0 ? (
          <p className="text-[#6b6b80] text-center py-8">No API keys yet. Generate one to get started.</p>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0f]">
                <div>
                  <p className="font-medium text-white">{key.name}</p>
                  <p className="text-sm text-[#6b6b80] font-mono">{key.key_prefix}...</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#6b6b80]">
                    {key.last_used_at
                      ? `Last used ${new Date(key.last_used_at).toLocaleDateString()}`
                      : 'Never used'}
                  </span>
                  <button
                    onClick={() => deleteKey(key.id)}
                    className="text-[#6b6b80] hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
        <h2 className="text-lg font-bold text-white mb-4">Preferences</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Commit Style</label>
            <select
              value={preferences.style}
              onChange={(e) => setPreferences({ ...preferences, style: e.target.value as Preferences['style'] })}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white focus:border-[#6366f1] focus:outline-none"
            >
              <option value="conventional">Conventional Commits (feat:, fix:, etc.)</option>
              <option value="simple">Simple (plain language)</option>
              <option value="detailed">Detailed (with body)</option>
              <option value="emoji">Emoji (✨ feat, 🐛 fix, etc.)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Include scope</p>
              <p className="text-sm text-[#6b6b80]">Add scope like feat(auth): or fix(api):</p>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, include_scope: !preferences.include_scope })}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences.include_scope ? 'bg-[#6366f1]' : 'bg-[#27272a]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                preferences.include_scope ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Include body</p>
              <p className="text-sm text-[#6b6b80]">Add detailed description below subject</p>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, include_body: !preferences.include_body })}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences.include_body ? 'bg-[#6366f1]' : 'bg-[#27272a]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                preferences.include_body ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Commit History */}
      <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
        <h2 className="text-lg font-bold text-white mb-4">Recent Commits</h2>
        
        {commitHistory.length === 0 ? (
          <p className="text-[#6b6b80] text-center py-8">
            No commits generated yet. Use the CLI or API to generate commit messages.
          </p>
        ) : (
          <div className="space-y-3">
            {commitHistory.map((commit) => (
              <div key={commit.id} className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-white break-words">{commit.generated_message}</p>
                    {commit.repo_name && (
                      <p className="text-xs text-[#6b6b80] mt-1">{commit.repo_name}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[#6b6b80]">
                      {new Date(commit.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-[#52525b]">
                      {new Date(commit.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12121a] border border-[#27272a] rounded-2xl p-6 w-full max-w-md mx-4">
            {generatedKey ? (
              <>
                <h2 className="text-xl font-bold text-white mb-4">Your API Key</h2>
                <p className="text-sm text-[#a1a1b5] mb-4">
                  Copy this key now. You won&apos;t be able to see it again.
                </p>
                <div className="p-4 rounded-xl bg-[#0a0a0f] font-mono text-sm text-[#a1a1b5] break-all mb-4">
                  {generatedKey}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(generatedKey)}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#5558e3] transition-colors"
                  >
                    Copy Key
                  </button>
                  <button
                    onClick={() => {
                      setShowKeyModal(false);
                      setGeneratedKey(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl border border-[#27272a] text-[#a1a1b5] font-medium hover:bg-[#1a1a25] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-4">Generate API Key</h2>
                <div>
                  <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="My Laptop"
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowKeyModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-[#27272a] text-[#a1a1b5] font-medium hover:bg-[#1a1a25] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateApiKey}
                    disabled={isSaving || !newKeyName}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#5558e3] transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
