import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/github/commits?repo=owner/repo&since=sha
export async function GET(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  const since = searchParams.get('since'); // SHA or tag to get commits since
  const until = searchParams.get('until'); // SHA or tag to get commits until

  if (!repo) {
    return NextResponse.json({ error: 'Missing repo parameter' }, { status: 400 });
  }

  // Get GitHub token from session or stored profile
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
      error: 'GitHub token not found. Please re-authenticate.',
      needsReauth: true 
    }, { status: 401 });
  }

  try {
    let url = `https://api.github.com/repos/${repo}/commits?per_page=100`;
    if (since) url += `&sha=${since}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch commits');
    }

    const commits = await response.json();

    // Format commits
    const formattedCommits = commits.map((c: {
      sha: string;
      commit: { message: string; author: { name: string; date: string } };
      author?: { login: string };
    }) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.author?.login || c.commit.author.name,
      date: c.commit.author.date,
    }));

    // If we have an 'until' parameter, filter commits
    let filteredCommits = formattedCommits;
    if (until) {
      const untilIndex = filteredCommits.findIndex((c: { sha: string }) => c.sha.startsWith(until));
      if (untilIndex !== -1) {
        filteredCommits = filteredCommits.slice(0, untilIndex);
      }
    }

    return NextResponse.json({ commits: filteredCommits });
  } catch (error) {
    console.error('GitHub commits error:', error);
    return NextResponse.json({ error: 'Failed to fetch commits' }, { status: 500 });
  }
}
