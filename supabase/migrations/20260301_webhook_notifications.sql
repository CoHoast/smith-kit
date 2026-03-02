-- Add webhook notification columns to profiles table
-- Supports Discord and Slack webhook integrations for uptime alerts

-- Add Discord webhook URL
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS discord_webhook_url TEXT;

-- Add Slack webhook URL  
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT;

-- Add SSL alert tracking (to avoid duplicate alerts)
-- Stores array of threshold days that have been alerted (e.g., [30, 14, 7])
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ssl_alert_sent_days INTEGER[] DEFAULT '{}';

-- Add ssl_days_left column to uptime_monitors to cache SSL expiry
ALTER TABLE uptime_monitors
ADD COLUMN IF NOT EXISTS ssl_days_left INTEGER;

-- Add ssl_days_left column to uptime_checks to track SSL over time
ALTER TABLE uptime_checks
ADD COLUMN IF NOT EXISTS ssl_days_left INTEGER;

-- Create index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_discord_webhook 
ON profiles(discord_webhook_url) 
WHERE discord_webhook_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_slack_webhook 
ON profiles(slack_webhook_url) 
WHERE slack_webhook_url IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN profiles.discord_webhook_url IS 'Discord webhook URL for uptime notifications';
COMMENT ON COLUMN profiles.slack_webhook_url IS 'Slack webhook URL for uptime notifications';
COMMENT ON COLUMN profiles.ssl_alert_sent_days IS 'Array of SSL expiry thresholds already alerted (to prevent duplicates)';
COMMENT ON COLUMN uptime_monitors.ssl_days_left IS 'Cached SSL certificate days until expiry';
COMMENT ON COLUMN uptime_checks.ssl_days_left IS 'SSL certificate days until expiry at time of check';
