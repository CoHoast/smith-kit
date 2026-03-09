-- LLM Analytics Migration
-- Track AI/LLM API usage, costs, and performance

-- Projects for organizing LLM tracking
CREATE TABLE IF NOT EXISTS llm_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  api_key VARCHAR(64) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- LLM requests/completions
CREATE TABLE IF NOT EXISTS llm_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES llm_projects(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- openai, anthropic, google, mistral, etc.
  model VARCHAR(100) NOT NULL,
  request_type VARCHAR(50) DEFAULT 'completion', -- completion, chat, embedding, etc.
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  cost_cents DECIMAL(10, 4), -- cost in cents for precision
  latency_ms INT,
  status VARCHAR(20) DEFAULT 'success', -- success, error, timeout
  error_message TEXT,
  user_id_ext VARCHAR(255), -- external user ID
  session_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily aggregates for faster dashboard queries
CREATE TABLE IF NOT EXISTS llm_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES llm_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  request_count INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  total_cost_cents DECIMAL(10, 2) DEFAULT 0,
  avg_latency_ms INT DEFAULT 0,
  error_count INT DEFAULT 0,
  UNIQUE(project_id, date, provider, model)
);

-- Model pricing configuration
CREATE TABLE IF NOT EXISTS llm_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  input_cost_per_1k DECIMAL(10, 6) NOT NULL, -- cost per 1000 tokens
  output_cost_per_1k DECIMAL(10, 6) NOT NULL,
  effective_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(provider, model, effective_date)
);

-- Insert common model pricing
INSERT INTO llm_pricing (provider, model, input_cost_per_1k, output_cost_per_1k) VALUES
  ('openai', 'gpt-4', 0.03, 0.06),
  ('openai', 'gpt-4-turbo', 0.01, 0.03),
  ('openai', 'gpt-4o', 0.005, 0.015),
  ('openai', 'gpt-4o-mini', 0.00015, 0.0006),
  ('openai', 'gpt-3.5-turbo', 0.0005, 0.0015),
  ('anthropic', 'claude-3-opus', 0.015, 0.075),
  ('anthropic', 'claude-3-sonnet', 0.003, 0.015),
  ('anthropic', 'claude-3-haiku', 0.00025, 0.00125),
  ('anthropic', 'claude-3.5-sonnet', 0.003, 0.015),
  ('google', 'gemini-pro', 0.00025, 0.0005),
  ('google', 'gemini-1.5-pro', 0.00125, 0.005),
  ('mistral', 'mistral-large', 0.004, 0.012),
  ('mistral', 'mistral-medium', 0.0027, 0.0081)
ON CONFLICT (provider, model, effective_date) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_llm_projects_user_id ON llm_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_projects_api_key ON llm_projects(api_key);
CREATE INDEX IF NOT EXISTS idx_llm_requests_project_id ON llm_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_llm_requests_created_at ON llm_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_llm_requests_provider ON llm_requests(provider);
CREATE INDEX IF NOT EXISTS idx_llm_requests_model ON llm_requests(model);
CREATE INDEX IF NOT EXISTS idx_llm_daily_stats_project_id ON llm_daily_stats(project_id);
CREATE INDEX IF NOT EXISTS idx_llm_daily_stats_date ON llm_daily_stats(date DESC);

-- RLS
ALTER TABLE llm_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_pricing ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own projects" ON llm_projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own requests" ON llm_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM llm_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "API can insert requests" ON llm_requests
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM llm_projects WHERE id = project_id)
  );

CREATE POLICY "Users can view own daily stats" ON llm_daily_stats
  FOR ALL USING (
    EXISTS (SELECT 1 FROM llm_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Anyone can view pricing" ON llm_pricing
  FOR SELECT USING (true);
