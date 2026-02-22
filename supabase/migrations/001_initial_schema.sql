-- SmithKit Initial Schema
-- Created: 2026-02-22

-- ===========================================
-- CORE TABLES (Shared across all tools)
-- ===========================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  github_access_token TEXT, -- Encrypted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Organizations (for Team tier)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organization Members
CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'team'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  grandfathered_at TIMESTAMPTZ, -- If set, user keeps this price forever
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Usage Tracking
CREATE TABLE public.usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  tool TEXT NOT NULL, -- 'changelog', 'uptime', 'commitbot'
  metric TEXT NOT NULL, -- 'repos', 'monitors', 'commits', 'changelogs_generated'
  count INTEGER DEFAULT 0,
  period_start DATE NOT NULL, -- Monthly reset
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool, metric, period_start)
);

ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.usage
  FOR SELECT USING (auth.uid() = user_id);

-- ===========================================
-- CHANGELOG TABLES
-- ===========================================

-- Connected GitHub Repositories
CREATE TABLE public.changelog_repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  github_repo_id BIGINT NOT NULL,
  github_repo_name TEXT NOT NULL, -- 'owner/repo'
  github_installation_id BIGINT,
  default_branch TEXT DEFAULT 'main',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}', -- custom settings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, github_repo_id)
);

ALTER TABLE public.changelog_repos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own repos" ON public.changelog_repos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own repos" ON public.changelog_repos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own repos" ON public.changelog_repos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own repos" ON public.changelog_repos
  FOR DELETE USING (auth.uid() = user_id);

-- Generated Changelogs
CREATE TABLE public.changelogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES public.changelog_repos(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL, -- Markdown content
  raw_commits JSONB, -- Original commit data
  release_url TEXT, -- Link to GitHub release
  release_date TIMESTAMPTZ DEFAULT NOW(),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.changelogs ENABLE ROW LEVEL SECURITY;

-- Public changelogs can be read by anyone
CREATE POLICY "Public changelogs are viewable" ON public.changelogs
  FOR SELECT USING (is_published = true);

-- Changelog Pages (public-facing)
CREATE TABLE public.changelog_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  repo_id UUID REFERENCES public.changelog_repos(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL, -- subdomain or path
  custom_domain TEXT,
  title TEXT,
  description TEXT,
  logo_url TEXT,
  theme JSONB DEFAULT '{"primaryColor": "#8b5cf6"}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.changelog_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public pages are viewable" ON public.changelog_pages
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own pages" ON public.changelog_pages
  FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- UPTIME TABLES
-- ===========================================

-- Monitors
CREATE TABLE public.uptime_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT DEFAULT 'GET',
  interval_seconds INTEGER DEFAULT 60, -- Check frequency
  timeout_seconds INTEGER DEFAULT 30,
  expected_status INTEGER DEFAULT 200,
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  current_status TEXT DEFAULT 'unknown', -- 'up', 'down', 'degraded', 'unknown'
  last_checked_at TIMESTAMPTZ,
  regions TEXT[] DEFAULT ARRAY['us-east'],
  alert_channels JSONB DEFAULT '[]', -- Email, Slack, webhook URLs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.uptime_monitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own monitors" ON public.uptime_monitors
  FOR ALL USING (auth.uid() = user_id);

-- Check Results (partitioned by time for performance)
CREATE TABLE public.uptime_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID REFERENCES public.uptime_monitors(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'up', 'down', 'degraded'
  response_time_ms INTEGER,
  status_code INTEGER,
  region TEXT,
  error_message TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.uptime_checks ENABLE ROW LEVEL SECURITY;

-- Index for efficient queries
CREATE INDEX idx_uptime_checks_monitor_time ON public.uptime_checks(monitor_id, checked_at DESC);

-- Incidents
CREATE TABLE public.uptime_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID REFERENCES public.uptime_monitors(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'ongoing', 'resolved'
  cause TEXT, -- 'timeout', 'status_code', 'ssl', etc.
  started_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.uptime_incidents ENABLE ROW LEVEL SECURITY;

-- Status Pages
CREATE TABLE public.uptime_status_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT,
  title TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  monitors UUID[] DEFAULT '{}', -- Which monitors to show
  theme JSONB DEFAULT '{"primaryColor": "#22c55e"}',
  show_uptime_percentage BOOLEAN DEFAULT true,
  show_response_time BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.uptime_status_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public status pages are viewable" ON public.uptime_status_pages
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own status pages" ON public.uptime_status_pages
  FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- COMMITBOT TABLES
-- ===========================================

-- API Keys for CLI/Extension
CREATE TABLE public.commitbot_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- Hashed API key (bcrypt)
  key_prefix TEXT NOT NULL, -- First 8 chars for identification (sk_xxxx)
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.commitbot_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own API keys" ON public.commitbot_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Commit History (for learning style + analytics)
CREATE TABLE public.commitbot_commits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  repo_name TEXT,
  original_message TEXT, -- What user had before (if any)
  generated_message TEXT NOT NULL,
  was_accepted BOOLEAN, -- Did user use the generated message?
  was_edited BOOLEAN, -- Did user edit before using?
  diff_hash TEXT, -- Hash of diff for deduplication
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.commitbot_commits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commits" ON public.commitbot_commits
  FOR SELECT USING (auth.uid() = user_id);

-- Index for analytics
CREATE INDEX idx_commitbot_commits_user_time ON public.commitbot_commits(user_id, created_at DESC);

-- User Preferences
CREATE TABLE public.commitbot_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  style TEXT DEFAULT 'conventional', -- 'conventional', 'simple', 'detailed', 'emoji'
  include_scope BOOLEAN DEFAULT true,
  include_body BOOLEAN DEFAULT false,
  include_breaking_change BOOLEAN DEFAULT true,
  max_subject_length INTEGER DEFAULT 72,
  language TEXT DEFAULT 'en', -- For non-English commit messages
  custom_instructions TEXT, -- User's additional style preferences
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.commitbot_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON public.commitbot_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- FUNCTIONS & TRIGGERS
-- ===========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commitbot_preferences_updated_at
  BEFORE UPDATE ON public.commitbot_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create free subscription
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  
  -- Create default CommitBot preferences
  INSERT INTO public.commitbot_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Calculate incident duration on resolve
CREATE OR REPLACE FUNCTION calculate_incident_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND NEW.resolved_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.resolved_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_incident_duration_trigger
  BEFORE UPDATE ON public.uptime_incidents
  FOR EACH ROW EXECUTE FUNCTION calculate_incident_duration();

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_usage_user_tool_period ON public.usage(user_id, tool, period_start);
CREATE INDEX idx_changelog_repos_user ON public.changelog_repos(user_id);
CREATE INDEX idx_changelogs_repo ON public.changelogs(repo_id, release_date DESC);
CREATE INDEX idx_uptime_monitors_user ON public.uptime_monitors(user_id);
CREATE INDEX idx_uptime_incidents_monitor ON public.uptime_incidents(monitor_id, started_at DESC);
