import { createClient } from '@/lib/supabase/server';

export async function trackUsage(
  userId: string, 
  tool: string, 
  metric: string, 
  count: number = 1
) {
  const supabase = await createClient();
  
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const monthStart = startOfMonth.toISOString().split('T')[0];

  // Check if usage record exists for this month
  const { data: existing } = await supabase
    .from('usage')
    .select('id, count')
    .eq('user_id', userId)
    .eq('tool', tool)
    .eq('metric', metric)
    .eq('period_start', monthStart)
    .single();

  if (existing) {
    // Update existing record
    await supabase
      .from('usage')
      .update({ 
        count: existing.count + count,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
  } else {
    // Create new record
    await supabase
      .from('usage')
      .insert({
        user_id: userId,
        tool,
        metric,
        count,
        period_start: monthStart,
        period_end: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).toISOString().split('T')[0],
      });
  }
}

export async function checkUsageLimit(
  userId: string,
  tool: string, 
  metric: string,
  limit: number
): Promise<{ allowed: boolean; current: number; remaining: number }> {
  const supabase = await createClient();
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const monthStart = startOfMonth.toISOString().split('T')[0];

  const { data: usage } = await supabase
    .from('usage')
    .select('count')
    .eq('user_id', userId)
    .eq('tool', tool)
    .eq('metric', metric)
    .eq('period_start', monthStart)
    .single();

  const current = usage?.count || 0;
  const remaining = Math.max(0, limit - current);
  
  return {
    allowed: current < limit,
    current,
    remaining
  };
}