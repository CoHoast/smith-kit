-- EventLog Migration
-- Real-time event tracking for developers

-- Projects (organize events)
CREATE TABLE IF NOT EXISTS eventlog_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  api_key VARCHAR(64) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- Channels (group events by type)
CREATE TABLE IF NOT EXISTS eventlog_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES eventlog_projects(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Events
CREATE TABLE IF NOT EXISTS eventlog_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES eventlog_projects(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES eventlog_channels(id) ON DELETE SET NULL,
  channel_name VARCHAR(50) NOT NULL,
  event VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  tags JSONB DEFAULT '{}',
  user_id_ext VARCHAR(255), -- external user ID from customer's app
  notify BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights (track metrics over time)
CREATE TABLE IF NOT EXISTS eventlog_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES eventlog_projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  value DECIMAL NOT NULL,
  previous_value DECIMAL,
  icon VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS eventlog_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES eventlog_projects(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL, -- email, slack, webhook
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_eventlog_projects_user_id ON eventlog_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_eventlog_projects_api_key ON eventlog_projects(api_key);
CREATE INDEX IF NOT EXISTS idx_eventlog_events_project_id ON eventlog_events(project_id);
CREATE INDEX IF NOT EXISTS idx_eventlog_events_channel_id ON eventlog_events(channel_id);
CREATE INDEX IF NOT EXISTS idx_eventlog_events_created_at ON eventlog_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eventlog_events_user_id_ext ON eventlog_events(user_id_ext);
CREATE INDEX IF NOT EXISTS idx_eventlog_insights_project_id ON eventlog_insights(project_id);

-- RLS
ALTER TABLE eventlog_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventlog_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventlog_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventlog_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventlog_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Users can manage own projects" ON eventlog_projects
  FOR ALL USING (auth.uid() = user_id);

-- Policies for channels
CREATE POLICY "Users can manage channels via project" ON eventlog_channels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM eventlog_projects WHERE id = project_id AND user_id = auth.uid())
  );

-- Policies for events
CREATE POLICY "Users can view own events" ON eventlog_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM eventlog_projects WHERE id = project_id AND user_id = auth.uid())
  );
CREATE POLICY "API can insert events" ON eventlog_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM eventlog_projects WHERE id = project_id)
  );

-- Policies for insights
CREATE POLICY "Users can manage insights via project" ON eventlog_insights
  FOR ALL USING (
    EXISTS (SELECT 1 FROM eventlog_projects WHERE id = project_id AND user_id = auth.uid())
  );

-- Policies for notifications
CREATE POLICY "Users can manage notifications via project" ON eventlog_notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM eventlog_projects WHERE id = project_id AND user_id = auth.uid())
  );
