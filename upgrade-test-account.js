// Quick script to upgrade test@testing.com to Premium
// Run with: node upgrade-test-account.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with actual values
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function upgradeTestAccount() {
  console.log('🔍 Finding test@testing.com account...');
  
  // Find the test user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'test@testing.com')
    .single();

  if (profileError || !profile) {
    console.error('❌ Test user not found:', profileError);
    return;
  }

  console.log('✅ Found user:', profile.email, 'ID:', profile.id);

  // Check current subscription
  const { data: currentSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', profile.id)
    .single();

  if (currentSub) {
    console.log('📋 Current plan:', currentSub.plan);
  } else {
    console.log('📋 No existing subscription found');
  }

  // Update or create Premium subscription
  const { data: updatedSub, error: updateError } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: profile.id,
      plan: 'premium',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      grandfathered_at: new Date().toISOString() // Lock in current pricing forever
    })
    .select()
    .single();

  if (updateError) {
    console.error('❌ Failed to upgrade subscription:', updateError);
    return;
  }

  console.log('🎉 Successfully upgraded test@testing.com to Premium!');
  console.log('📊 New subscription:', {
    plan: updatedSub.plan,
    status: updatedSub.status,
    grandfathered: updatedSub.grandfathered_at ? 'Yes' : 'No'
  });
}

// Run the upgrade
upgradeTestAccount().catch(console.error);