import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/commitbot/preferences - Get user's commit message preferences
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: preferences } = await supabase
    .from('commitbot_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Return defaults if no preferences exist
  return NextResponse.json({ 
    preferences: preferences || {
      style: 'conventional',
      include_scope: true,
      include_body: false,
      max_subject_length: 72,
      custom_instructions: null,
    }
  });
}

// PUT /api/commitbot/preferences - Update preferences
export async function PUT(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { style, include_scope, include_body, max_subject_length, custom_instructions } = body;

  // Validate style
  const validStyles = ['conventional', 'simple', 'detailed', 'emoji'];
  if (style && !validStyles.includes(style)) {
    return NextResponse.json({ error: 'Invalid style' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { user_id: user.id };
  if (style !== undefined) updates.style = style;
  if (include_scope !== undefined) updates.include_scope = include_scope;
  if (include_body !== undefined) updates.include_body = include_body;
  if (max_subject_length !== undefined) updates.max_subject_length = max_subject_length;
  if (custom_instructions !== undefined) updates.custom_instructions = custom_instructions;

  const { data: preferences, error } = await supabase
    .from('commitbot_preferences')
    .upsert(updates, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ preferences });
}
