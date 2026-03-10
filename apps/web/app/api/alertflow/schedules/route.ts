import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/alertflow/schedules - List schedules
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: schedules, error } = await supabase
    .from('alertflow_schedules')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add current on-call person to each schedule
  const schedulesWithOnCall = (schedules || []).map(schedule => {
    const members = schedule.members as Array<{ name: string; email: string; order: number }>;
    const currentIndex = schedule.current_index || 0;
    
    // Check for override
    let currentOnCall = null;
    let isOverride = false;
    
    if (schedule.override_until && new Date(schedule.override_until) > new Date()) {
      // Find override person
      const overrideMember = members.find(m => m.email === schedule.override_user_id);
      if (overrideMember) {
        currentOnCall = overrideMember;
        isOverride = true;
      }
    }
    
    if (!currentOnCall && members.length > 0) {
      currentOnCall = members[currentIndex % members.length];
    }

    return {
      ...schedule,
      current_oncall: currentOnCall,
      is_override: isOverride,
    };
  });

  return NextResponse.json({ schedules: schedulesWithOnCall });
}

// POST /api/alertflow/schedules - Create schedule
export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    name,
    rotation_type = 'weekly',
    rotation_time = '09:00:00',
    rotation_day = 1,
    timezone = 'UTC',
    members = [],
    notification_channels = [],
  } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // Check usage limits
  const { count } = await supabase
    .from('alertflow_schedules')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  const limits: Record<string, number> = { free: 1, pro: 5, premium: 20 };
  const plan = subscription?.plan || 'free';
  const limit = limits[plan] || 1;

  if ((count || 0) >= limit) {
    return NextResponse.json({ 
      error: `You've reached the ${plan} plan limit of ${limit} schedules. Upgrade to add more.` 
    }, { status: 403 });
  }

  const { data: schedule, error } = await supabase
    .from('alertflow_schedules')
    .insert({
      user_id: user.id,
      name,
      rotation_type,
      rotation_time,
      rotation_day,
      timezone,
      members,
      notification_channels,
      current_index: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ schedule }, { status: 201 });
}

// PUT /api/alertflow/schedules - Update schedule
export async function PUT(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
  }

  // Filter allowed updates
  const allowedFields = ['name', 'rotation_type', 'rotation_time', 'rotation_day', 'timezone', 'members', 'notification_channels', 'current_index'];
  const filteredUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  }

  const { data: schedule, error } = await supabase
    .from('alertflow_schedules')
    .update(filteredUpdates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ schedule });
}

// DELETE /api/alertflow/schedules - Delete schedule
export async function DELETE(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('alertflow_schedules')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
