'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

interface Repo {
  id: string;
  github_repo_name: string;
  github_repo_id: number;
  is_active: boolean;
  created_at: string;
}

interface Changelog {
  id: string;
  version: string;
  title: string;
  content: string;
  release_date: string;
}

export default function ChangelogPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    const { data } = await supabase
      .from('changelog_repos')
      .select('*')
      .order('created_at', { ascending: false });
    
    setRepos(data || []);
    setIsLoading(false);
  };

  const connectGitHub = async () => {
    // For now, redirect to GitHub OAuth
    // In production, this would use a GitHub App installation flow
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

  if (isLoading) {
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
          onClick={connectGitHub}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Connect GitHub
        </button>
      </div>

      {repos.length === 0 ? (
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
            onClick={connectGitHub}
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
                {repos.map((repo) => (
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

                {changelogs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#6b6b80]">No changelogs generated yet.</p>
                    <p className="text-sm text-[#52525b] mt-1">
                      Changelogs are generated automatically when you create a release.
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
    </div>
  );
}
