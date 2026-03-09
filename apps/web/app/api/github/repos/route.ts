import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/github/repos - List user's GitHub repos
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the user's GitHub access token from the session
  const { data: { session } } = await supabase.auth.getSession();
  let providerToken = session?.provider_token;

  // If not in session, try to get from stored profile
  if (!providerToken) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('github_access_token')
      .eq('id', user.id)
      .single();
    
    providerToken = profile?.github_access_token;
  }

  if (!providerToken) {
    return NextResponse.json({ 
      error: 'GitHub token not found. Please re-authenticate with GitHub.',
      needsReauth: true 
    }, { status: 401 });
  }

  try {
    // Fetch repos from GitHub API
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ 
          error: 'GitHub token expired. Please re-authenticate.',
          needsReauth: true 
        }, { status: 401 });
      }
      throw new Error('Failed to fetch repos');
    }

    const repos = await response.json();

    // Get already connected repos
    const { data: connectedRepos } = await supabase
      .from('changelog_repos')
      .select('github_repo_id')
      .eq('user_id', user.id);

    const connectedIds = new Set(connectedRepos?.map(r => r.github_repo_id) || []);

    // Format response
    const formattedRepos = repos.map((repo: {
      id: number;
      full_name: string;
      name: string;
      private: boolean;
      default_branch: string;
      description: string | null;
      updated_at: string;
    }) => ({
      id: repo.id,
      full_name: repo.full_name,
      name: repo.name,
      private: repo.private,
      default_branch: repo.default_branch,
      description: repo.description,
      updated_at: repo.updated_at,
      connected: connectedIds.has(repo.id),
    }));

    return NextResponse.json({ repos: formattedRepos });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub repos' }, { status: 500 });
  }
}
