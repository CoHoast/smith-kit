import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// GET /api/commitbot/keys - List user's API keys
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: keys, error } = await supabase
    .from('commitbot_api_keys')
    .select('id, name, key_prefix, created_at, last_used_at, is_active')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ keys });
}

// POST /api/commitbot/keys - Create a new API key
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // Check limit (max 5 keys per user)
  const { count } = await supabase
    .from('commitbot_api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if ((count || 0) >= 5) {
    return NextResponse.json({ error: 'Maximum 5 active API keys allowed' }, { status: 403 });
  }

  // Generate API key: sk_live_xxxxxxxxxxxx (32 chars random)
  const keyValue = `sk_live_${randomBytes(24).toString('hex')}`;
  const keyPrefix = keyValue.substring(0, 12);

  // In production, we'd hash the key before storing
  // For demo, we store it directly (NOT SECURE)
  const { data: key, error } = await supabase
    .from('commitbot_api_keys')
    .insert({
      user_id: user.id,
      name,
      key_prefix: keyPrefix,
      key_hash: keyValue, // In production: hash this
      is_active: true,
    })
    .select('id, name, key_prefix, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the full key ONLY on creation (never again)
  return NextResponse.json({ 
    key: {
      ...key,
      secret: keyValue, // Only shown once!
    }
  }, { status: 201 });
}
