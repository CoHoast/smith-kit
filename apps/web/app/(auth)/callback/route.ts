import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  
  // Use production URL to avoid Railway internal localhost:8080 redirect
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smith-kit-production.up.railway.app';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      // Store the GitHub provider token if available
      const providerToken = data.session.provider_token;
      if (providerToken && data.session.user) {
        // Save the GitHub token to the user's profile
        await supabase
          .from('profiles')
          .update({ github_access_token: providerToken })
          .eq('id', data.session.user.id);
      }
      
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${baseUrl}/login?error=auth`);
}
