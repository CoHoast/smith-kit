import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChangelogContent } from '@/components/ChangelogContent';

interface PageProps {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function PublicChangelogPage({ params }: PageProps) {
  const { owner, repo } = await params;
  const fullRepoName = `${owner}/${repo}`;

  // Use anon client for public access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Find the repo
  const { data: repoData } = await supabase
    .from('changelog_repos')
    .select('id, github_repo_name')
    .eq('github_repo_name', fullRepoName)
    .single();

  if (!repoData) {
    notFound();
  }

  // Get published changelogs
  const { data: changelogs } = await supabase
    .from('changelogs')
    .select('*')
    .eq('repo_id', repoData.id)
    .eq('is_published', true)
    .order('release_date', { ascending: false });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e1e2e]">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
                  <path d="M19 17V5a2 2 0 0 0-2-2H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{fullRepoName}</h1>
                <p className="text-sm text-[#6b6b80]">Changelog</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/changelog/${owner}/${repo}/rss`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#6b6b80] hover:text-white hover:bg-[#1a1a25] transition-colors"
                title="RSS Feed"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="6.18" cy="17.82" r="2.18"/>
                  <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
                </svg>
                <span className="text-sm">RSS</span>
              </a>
              <a
                href={`https://github.com/${fullRepoName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#6b6b80] hover:text-white hover:bg-[#1a1a25] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {!changelogs || changelogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a25] flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#6b6b80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
                <path d="M19 17V5a2 2 0 0 0-2-2H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No releases yet</h2>
            <p className="text-[#6b6b80]">Check back soon for updates!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {changelogs.map((log) => (
              <article key={log.id} id={log.version} className="group">
                {/* Version header */}
                <div className="flex items-center gap-4 mb-4">
                  <a
                    href={`#${log.version}`}
                    className="flex items-center gap-2 text-[#6366f1] hover:underline"
                  >
                    <span className="font-mono font-bold text-lg">{log.version}</span>
                  </a>
                  <span className="text-sm text-[#6b6b80]">
                    {new Date(log.release_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href.split('#')[0] + '#' + log.version);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[#6b6b80] hover:text-white transition-all"
                    title="Copy link"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </button>
                </div>

                {/* Title */}
                {log.title && (
                  <h2 className="text-2xl font-bold text-white mb-4">{log.title}</h2>
                )}

                {/* Content */}
                <ChangelogContent content={log.content} />

                {/* Divider */}
                <div className="mt-12 border-b border-[#1e1e2e]" />
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2e] py-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6b6b80]">
              Powered by{' '}
              <Link href="https://smithkit.ai" className="text-[#6366f1] hover:underline">
                SmithKit
              </Link>
            </p>
            <a
              href={`/changelog/${owner}/${repo}/rss`}
              className="text-sm text-[#6b6b80] hover:text-white transition-colors"
            >
              Subscribe via RSS
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Generate metadata
export async function generateMetadata({ params }: PageProps) {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} Changelog — SmithKit`,
    description: `Latest updates and releases for ${owner}/${repo}`,
  };
}
