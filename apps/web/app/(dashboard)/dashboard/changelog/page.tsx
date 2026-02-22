'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

interface ConnectedRepo {
  id: string;
  github_repo_name: string;
  github_repo_id: number;
  is_active: boolean;
  created_at: string;
}

interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  private: boolean;
  default_branch: string;
  description: string | null;
  connected: boolean;
}

interface Changelog {
  id: string;
  version: string;
  title: string;
  content: string;
  release_date: string;
}

export default function ChangelogPage() {
  const [connectedRepos, setConnectedRepos] = useState<ConnectedRepo[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<ConnectedRepo | null>(null);
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load connected repos from database
    const { data } = await supabase
      .from('changelog_repos')
      .select('*')
      .order('created_at', { ascending: false });
    
    setConnectedRepos(data || []);
    setIsLoading(false);
  };

  const fetchGitHubRepos = async () => {
    setShowRepoModal(true);
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/github/repos');
      const data = await res.json();
      
      if (data.needsReauth) {
        setNeedsReauth(true);
        setIsLoading(false);
        return;
      }
      
      if (data.repos) {
        setGithubRepos(data.repos);
      }
    } catch (error) {
      console.error('Failed to fetch repos:', error);
    }
    setIsLoading(false);
  };

  const connectRepo = async (repo: GitHubRepo) => {
    setIsConnecting(true);
    
    try {
      const res = await fetch('/api/changelog/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_repo_id: repo.id,
          github_repo_name: repo.full_name,
          default_branch: repo.default_branch,
        }),
      });
      
      if (res.ok) {
        setShowRepoModal(false);
        loadData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to connect repo');
      }
    } catch (error) {
      console.error('Failed to connect repo:', error);
    }
    setIsConnecting(false);
  };

  const reauthorizeGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/callback?next=/dashboard/changelog`,
        scopes: 'read:user user:email repo',
      },
    });
  };

  const loadChangelogs = async (repoId: string) => {
    const { data } = await supabase
      .from('changelogs')
      .select('*')
      .eq('repo_id', repoId)
      .order('release_date', { ascending: false });
    
    setChangelogs(data || []);
  };

  const generateChangelog = async () => {
    if (!selectedRepo) return;
    setIsGenerating(true);

    try {
      // Fetch recent commits from GitHub
      const commitsRes = await fetch(`/api/github/commits?repo=${selectedRepo.github_repo_name}`);
      const commitsData = await commitsRes.json();
      
      if (!commitsData.commits || commitsData.commits.length === 0) {
        alert('No commits found in this repository');
        setIsGenerating(false);
        return;
      }

      // Generate changelog with AI
      const generateRes = await fetch('/api/changelog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_id: selectedRepo.id,
          version: `v${new Date().toISOString().split('T')[0].replace(/-/g, '.')}`,
          commits: commitsData.commits.slice(0, 20), // Last 20 commits
        }),
      });

      const result = await generateRes.json();
      
      if (generateRes.ok) {
        alert(result.ai_generated ? 'Changelog generated with AI!' : 'Changelog generated!');
        loadChangelogs(selectedRepo.id);
      } else {
        alert(result.error || 'Failed to generate changelog');
      }
    } catch (error) {
      console.error('Failed to generate changelog:', error);
      alert('Failed to generate changelog');
    }
    setIsGenerating(false);
  };

  if (isLoading && !showRepoModal) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Changelog</h1>
          <p className="text-[#a1a1b5]">AI-powered release notes from your GitHub commits</p>
        </div>
        <button
          onClick={fetchGitHubRepos}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Connect Repository
        </button>
      </div>

      {connectedRepos.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a25] flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#6b6b80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
              <path d="M19 17V5a2 2 0 0 0-2-2H4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No repositories connected</h2>
          <p className="text-[#6b6b80] text-center max-w-md mb-6">
            Connect your GitHub repositories to automatically generate beautiful changelogs from your commits.
          </p>
          <button
            onClick={fetchGitHubRepos}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#24292e] hover:bg-[#2f363d] text-white font-medium transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Connect GitHub Repository
          </button>

          {/* How it works */}
          <div className="mt-12 max-w-2xl">
            <h3 className="text-sm font-semibold text-[#6b6b80] uppercase tracking-wider mb-4 text-center">How it works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#6366f1] font-bold">1</span>
                </div>
                <p className="text-sm text-[#a1a1b5]">Connect your GitHub repo</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#6366f1] font-bold">2</span>
                </div>
                <p className="text-sm text-[#a1a1b5]">AI analyzes your commits</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#6366f1] font-bold">3</span>
                </div>
                <p className="text-sm text-[#a1a1b5]">Beautiful changelog generated</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Repos List */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Repos */}
          <div className="lg:col-span-1">
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-[#6b6b80] uppercase tracking-wider mb-4">Connected Repos</h3>
              <div className="space-y-2">
                {connectedRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => {
                      setSelectedRepo(repo);
                      loadChangelogs(repo.id);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      selectedRepo?.id === repo.id
                        ? 'bg-[#6366f1]/10 border border-[#6366f1]/30'
                        : 'hover:bg-[#1a1a25]'
                    }`}
                  >
                    <p className="font-medium text-white">{repo.github_repo_name}</p>
                    <p className="text-xs text-[#6b6b80]">
                      {repo.is_active ? '● Active' : '○ Inactive'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main - Changelogs */}
          <div className="lg:col-span-2">
            {selectedRepo ? (
              <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">{selectedRepo.github_repo_name}</h3>
                  <a
                    href={`https://github.com/${selectedRepo.github_repo_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#6366f1] hover:underline"
                  >
                    View on GitHub →
                  </a>
                </div>

                {/* Generate Button */}
                <div className="mb-6">
                  <button
                    onClick={generateChangelog}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 3v18M3 12h18" />
                        </svg>
                        Generate Changelog
                      </>
                    )}
                  </button>
                </div>

                {changelogs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#6b6b80]">No changelogs generated yet.</p>
                    <p className="text-sm text-[#52525b] mt-1">
                      Click &quot;Generate Changelog&quot; to create one from recent commits.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {changelogs.map((log) => (
                      <div key={log.id} className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm text-[#6366f1]">{log.version}</span>
                          <span className="text-xs text-[#6b6b80]">
                            {new Date(log.release_date).toLocaleDateString()}
                          </span>
                        </div>
                        {log.title && <h4 className="font-medium text-white mb-2">{log.title}</h4>}
                        <div className="prose prose-invert prose-sm max-w-none">
                          <p className="text-[#a1a1b5] text-sm whitespace-pre-wrap">{log.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-12 text-center">
                <p className="text-[#6b6b80]">Select a repository to view changelogs</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Repository Selection Modal */}
      {showRepoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-[#27272a] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-[#27272a]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Select Repository</h2>
                <button
                  onClick={() => setShowRepoModal(false)}
                  className="text-[#6b6b80] hover:text-white"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6366f1]"></div>
                </div>
              ) : needsReauth ? (
                <div className="text-center py-8">
                  <p className="text-[#a1a1b5] mb-4">Your GitHub token has expired. Please re-authenticate.</p>
                  <button
                    onClick={reauthorizeGitHub}
                    className="px-4 py-2 rounded-xl bg-[#24292e] text-white font-medium hover:bg-[#2f363d] transition-colors"
                  >
                    Re-authenticate with GitHub
                  </button>
                </div>
              ) : githubRepos.length === 0 ? (
                <p className="text-center text-[#6b6b80] py-8">No repositories found.</p>
              ) : (
                <div className="space-y-2">
                  {githubRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => !repo.connected && connectRepo(repo)}
                      disabled={repo.connected || isConnecting}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${
                        repo.connected
                          ? 'border-green-500/30 bg-green-500/5 cursor-not-allowed'
                          : 'border-[#27272a] hover:border-[#6366f1]/50 hover:bg-[#1a1a25]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{repo.full_name}</p>
                          {repo.description && (
                            <p className="text-sm text-[#6b6b80] mt-1 line-clamp-1">{repo.description}</p>
                          )}
                        </div>
                        {repo.connected ? (
                          <span className="text-xs text-green-500 font-medium">Connected</span>
                        ) : repo.private ? (
                          <span className="text-xs text-[#6b6b80]">Private</span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
