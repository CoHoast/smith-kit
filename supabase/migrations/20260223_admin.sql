-- Super Admin Dashboard Migration
-- Adds admin capabilities to SmithKit

-- Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Admin activity log for audit trail
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'view_user', 'impersonate', 'update_plan', etc.
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created ON admin_activity_log(created_at DESC);

-- Enable RLS
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity log
CREATE POLICY "Admins can view activity log" ON admin_activity_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Only admins can insert activity log
CREATE POLICY "Admins can insert activity log" ON admin_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'users_today', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE),
    'users_this_week', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'users_this_month', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'free_users', (SELECT COUNT(*) FROM profiles p LEFT JOIN subscriptions s ON p.id = s.user_id WHERE s.plan IS NULL OR s.plan = 'free'),
    'pro_users', (SELECT COUNT(*) FROM subscriptions WHERE plan = 'pro'),
    'premium_users', (SELECT COUNT(*) FROM subscriptions WHERE plan = 'team'),
    'total_monitors', (SELECT COUNT(*) FROM uptime_monitors),
    'total_flags', (SELECT COUNT(*) FROM togglebox_flags),
    'total_cron_jobs', (SELECT COUNT(*) FROM cron_jobs),
    'total_errors_tracked', (SELECT COUNT(*) FROM errorwatch_errors)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (will be checked in app layer)
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;
