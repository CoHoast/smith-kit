import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Use the request origin to redirect back to the same domain
  const { origin } = new URL(request.url);
  
  return NextResponse.redirect(new URL('/login', origin), {
    status: 302,
  });
}
