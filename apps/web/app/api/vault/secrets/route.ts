import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { decryptProjectKey, encryptSecret, decryptSecret } from '@/lib/encryption';

// GET /api/vault/secrets?project_id=xxx - List secrets for a project
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const decrypt = searchParams.get('decrypt') === 'true';

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  // Verify user owns this project
  const { data: project } = await supabase
    .from('vault_projects')
    .select('id, encrypted_key')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { data: secrets, error } = await supabase
    .from('vault_secrets')
    .select('id, key, encrypted_value, created_at, updated_at')
    .eq('project_id', projectId)
    .order('key', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If decrypt requested, decrypt all values
  if (decrypt && secrets) {
    const projectKey = decryptProjectKey(project.encrypted_key);
    const decryptedSecrets = secrets.map((secret) => ({
      ...secret,
      value: decryptSecret(secret.encrypted_value, projectKey),
      encrypted_value: undefined,
    }));

    // Log access
    await supabase.from('vault_access_logs').insert({
      project_id: projectId,
      user_id: user.id,
      action: 'secrets_read',
      details: { count: secrets.length },
    });

    return NextResponse.json(decryptedSecrets);
  }

  // Return without values (just keys)
  const secretKeys = (secrets || []).map((s) => ({
    id: s.id,
    key: s.key,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));

  return NextResponse.json(secretKeys);
}

// POST /api/vault/secrets - Create or update a secret
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { project_id, key, value } = await request.json();

  if (!project_id || !key || value === undefined) {
    return NextResponse.json({ error: 'project_id, key, and value are required' }, { status: 400 });
  }

  // Verify user owns this project and get encryption key
  const { data: project } = await supabase
    .from('vault_projects')
    .select('id, encrypted_key, user_id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Check secret limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  const plan = subscription?.plan || 'free';
  const limits: Record<string, number> = { free: 50, pro: 500, premium: -1 };
  const limit = limits[plan];

  if (limit !== -1) {
    const { count } = await supabase
      .from('vault_secrets')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project_id);

    if ((count || 0) >= limit) {
      return NextResponse.json({ 
        error: `You've reached the ${plan} plan limit of ${limit} secrets. Upgrade to add more.` 
      }, { status: 403 });
    }
  }

  // Encrypt the secret value
  const projectKey = decryptProjectKey(project.encrypted_key);
  const encryptedValue = encryptSecret(value, projectKey);

  // Upsert the secret (update if exists, insert if not)
  const { data: existingSecret } = await supabase
    .from('vault_secrets')
    .select('id')
    .eq('project_id', project_id)
    .eq('key', key)
    .single();

  let secret;
  let action;

  if (existingSecret) {
    // Update existing
    const { data, error } = await supabase
      .from('vault_secrets')
      .update({ encrypted_value: encryptedValue, updated_at: new Date().toISOString() })
      .eq('id', existingSecret.id)
      .select('id, key, created_at, updated_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    secret = data;
    action = 'secret_updated';
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('vault_secrets')
      .insert({
        project_id,
        key,
        encrypted_value: encryptedValue,
      })
      .select('id, key, created_at, updated_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    secret = data;
    action = 'secret_created';
  }

  // Log the action
  await supabase.from('vault_access_logs').insert({
    project_id,
    user_id: user.id,
    action,
    details: { key },
  });

  return NextResponse.json(secret);
}

// DELETE /api/vault/secrets?id=xxx - Delete a secret
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const secretId = searchParams.get('id');

  if (!secretId) {
    return NextResponse.json({ error: 'Secret id is required' }, { status: 400 });
  }

  // Get secret and verify ownership
  const { data: secret } = await supabase
    .from('vault_secrets')
    .select('id, key, project_id, vault_projects!inner(user_id)')
    .eq('id', secretId)
    .single();

  if (!secret || (secret as any).vault_projects.user_id !== user.id) {
    return NextResponse.json({ error: 'Secret not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('vault_secrets')
    .delete()
    .eq('id', secretId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from('vault_access_logs').insert({
    project_id: secret.project_id,
    user_id: user.id,
    action: 'secret_deleted',
    details: { key: secret.key },
  });

  return NextResponse.json({ success: true });
}
