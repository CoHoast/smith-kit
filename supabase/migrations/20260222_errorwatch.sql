-- ErrorWatch Migration
-- Error tracking like Sentry lite

-- Projects for organizing error tracking
CREATE TABLE IF NOT EXISTS errorwatch_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  api_key VARCHAR(64) NOT NULL,
  platform VARCHAR(50) DEFAULT 'javascript', -- javascript, node, python, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- Individual error events
CREATE TABLE IF NOT EXISTS errorwatch_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES errorwatch_projects(id) ON DELETE CASCADE,
  issue_id UUID, -- references errorwatch_issues, set after grouping
  error_type VARCHAR(255) NOT NULL, -- TypeError, ReferenceError, custom, etc.
  message TEXT NOT NULL,
  stack_trace TEXT,
  fingerprint VARCHAR(64) NOT NULL, -- hash for grouping similar errors
  level VARCHAR(20) DEFAULT 'error', -- error, warning, info
  url VARCHAR(2048),
  user_id_ext VARCHAR(255), -- external user ID
  user_email VARCHAR(255),
  browser VARCHAR(100),
  os VARCHAR(100),
  device VARCHAR(100),
  release_version VARCHAR(100),
  environment VARCHAR(50) DEFAULT 'production', -- production, staging, development
  tags JSONB DEFAULT '{}',
  extra JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues (grouped errors)
CREATE TABLE IF NOT EXISTS errorwatch_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES errorwatch_projects(id) ON DELETE CASCADE,
  fingerprint VARCHAR(64) NOT NULL,
  error_type VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  level VARCHAR(20) DEFAULT 'error',
  status VARCHAR(20) DEFAULT 'unresolved', -- unresolved, resolved, ignored
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  event_count INT DEFAULT 1,
  user_count INT DEFAULT 0,
  is_regression BOOLEAN DEFAULT false,
  assigned_to VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, fingerprint)
);

-- Daily aggregates
CREATE TABLE IF NOT EXISTS errorwatch_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES errorwatch_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  error_count INT DEFAULT 0,
  unique_issues INT DEFAULT 0,
  affected_users INT DEFAULT 0,
  UNIQUE(project_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_errorwatch_projects_user_id ON errorwatch_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_errorwatch_projects_api_key ON errorwatch_projects(api_key);
CREATE INDEX IF NOT EXISTS idx_errorwatch_errors_project_id ON errorwatch_errors(project_id);
CREATE INDEX IF NOT EXISTS idx_errorwatch_errors_fingerprint ON errorwatch_errors(fingerprint);
CREATE INDEX IF NOT EXISTS idx_errorwatch_errors_created_at ON errorwatch_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_errorwatch_errors_issue_id ON errorwatch_errors(issue_id);
CREATE INDEX IF NOT EXISTS idx_errorwatch_issues_project_id ON errorwatch_issues(project_id);
CREATE INDEX IF NOT EXISTS idx_errorwatch_issues_status ON errorwatch_issues(status);
CREATE INDEX IF NOT EXISTS idx_errorwatch_issues_last_seen ON errorwatch_issues(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_errorwatch_daily_stats_project_id ON errorwatch_daily_stats(project_id);
CREATE INDEX IF NOT EXISTS idx_errorwatch_daily_stats_date ON errorwatch_daily_stats(date DESC);

-- RLS
ALTER TABLE errorwatch_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE errorwatch_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE errorwatch_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE errorwatch_daily_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own projects" ON errorwatch_projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own errors" ON errorwatch_errors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM errorwatch_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "API can insert errors" ON errorwatch_errors
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM errorwatch_projects WHERE id = project_id)
  );

CREATE POLICY "Users can manage own issues" ON errorwatch_issues
  FOR ALL USING (
    EXISTS (SELECT 1 FROM errorwatch_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "API can upsert issues" ON errorwatch_issues
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM errorwatch_projects WHERE id = project_id)
  );

CREATE POLICY "Users can view own daily stats" ON errorwatch_daily_stats
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM errorwatch_projects WHERE id = project_id AND user_id = auth.uid())
  );
