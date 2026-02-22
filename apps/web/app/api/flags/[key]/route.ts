import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Public API - GET /api/flags/[key] - Check flag status
// Requires Authorization: Bearer tb_xxx header
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  
  // Get API key from Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ 
      error: 'Missing or invalid Authorization header. Use: Bearer <api_key>' 
    }, { status: 401 });
  }

  const apiKey = authHeader.replace('Bearer ', '');

  // Validate API key format
  if (!apiKey.startsWith('tb_')) {
    return NextResponse.json({ error: 'Invalid API key format' }, { status: 401 });
  }

  // Use service role client for public API
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find project by API key
  const { data: project, error: projectError } = await supabase
    .from('togglebox_projects')
    .select('id')
    .eq('api_key', apiKey)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // Find flag by key in this project
  const { data: flag, error: flagError } = await supabase
    .from('togglebox_flags')
    .select('key, enabled')
    .eq('project_id', project.id)
    .eq('key', key)
    .single();

  if (flagError || !flag) {
    return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
  }

  // Return flag status
  return NextResponse.json({
    key: flag.key,
    enabled: flag.enabled,
  });
}

// Also support getting all flags for a project
export async function POST(request: Request) {
  // Get API key from Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ 
      error: 'Missing or invalid Authorization header. Use: Bearer <api_key>' 
    }, { status: 401 });
  }

  const apiKey = authHeader.replace('Bearer ', '');

  if (!apiKey.startsWith('tb_')) {
    return NextResponse.json({ error: 'Invalid API key format' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find project by API key
  const { data: project, error: projectError } = await supabase
    .from('togglebox_projects')
    .select('id')
    .eq('api_key', apiKey)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // Get all flags for this project
  const { data: flags, error: flagsError } = await supabase
    .from('togglebox_flags')
    .select('key, enabled')
    .eq('project_id', project.id);

  if (flagsError) {
    return NextResponse.json({ error: flagsError.message }, { status: 500 });
  }

  // Return as object for easy lookup
  const flagsObject = (flags || []).reduce((acc, flag) => {
    acc[flag.key] = flag.enabled;
    return acc;
  }, {} as Record<string, boolean>);

  return NextResponse.json({ flags: flagsObject });
}
