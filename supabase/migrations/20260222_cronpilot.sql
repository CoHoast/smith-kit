-- CronPilot Migration
-- Scheduled jobs made easy

-- Cron jobs
CREATE TABLE IF NOT EXISTS cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  method VARCHAR(10) DEFAULT 'GET',
  headers JSONB DEFAULT '{}',
  body TEXT,
  schedule VARCHAR(100) NOT NULL, -- cron expression
  timezone VARCHAR(50) DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  retry_count INT DEFAULT 3,
  retry_delay_seconds INT DEFAULT 60,
  timeout_seconds INT DEFAULT 30,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job executions (run history)
CREATE TABLE IF NOT EXISTS cron_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES cron_jobs(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL, -- success, failed, running, timeout
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INT,
  response_status INT,
  response_body TEXT,
  error_message TEXT,
  attempt INT DEFAULT 1
);

-- Alert configurations
CREATE TABLE IF NOT EXISTS cron_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES cron_jobs(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL, -- email, slack, webhook
  config JSONB NOT NULL DEFAULT '{}',
  on_failure BOOLEAN DEFAULT true,
  on_success BOOLEAN DEFAULT false,
  on_recovery BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cron_jobs_user_id ON cron_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_is_active ON cron_jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run_at ON cron_jobs(next_run_at);
CREATE INDEX IF NOT EXISTS idx_cron_executions_job_id ON cron_executions(job_id);
CREATE INDEX IF NOT EXISTS idx_cron_executions_started_at ON cron_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_executions_status ON cron_executions(status);

-- RLS
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_alerts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own jobs" ON cron_jobs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own executions" ON cron_executions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cron_jobs WHERE id = job_id AND user_id = auth.uid())
  );

CREATE POLICY "System can insert executions" ON cron_executions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cron_jobs WHERE id = job_id)
  );

CREATE POLICY "Users can manage alerts via job" ON cron_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cron_jobs WHERE id = job_id AND user_id = auth.uid())
  );
