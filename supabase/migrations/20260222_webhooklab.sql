-- WebhookLab Migration
-- Debug, inspect, and replay webhooks

-- Webhook endpoints (unique URLs for receiving webhooks)
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(32) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  forward_url TEXT,
  response_status INT DEFAULT 200,
  response_body TEXT DEFAULT '{"success": true}',
  response_headers JSONB DEFAULT '{"Content-Type": "application/json"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Captured webhook requests
CREATE TABLE IF NOT EXISTS webhook_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  method VARCHAR(10) NOT NULL,
  path TEXT,
  query_params JSONB DEFAULT '{}',
  headers JSONB DEFAULT '{}',
  body TEXT,
  body_json JSONB,
  source_ip VARCHAR(45),
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forwarded request logs
CREATE TABLE IF NOT EXISTS webhook_forwards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES webhook_requests(id) ON DELETE CASCADE,
  forward_url TEXT NOT NULL,
  status VARCHAR(20) NOT NULL, -- success, failed, timeout
  response_status INT,
  response_body TEXT,
  duration_ms INT,
  error_message TEXT,
  forwarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Replay history
CREATE TABLE IF NOT EXISTS webhook_replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES webhook_requests(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  method VARCHAR(10) NOT NULL,
  headers JSONB DEFAULT '{}',
  body TEXT,
  response_status INT,
  response_body TEXT,
  duration_ms INT,
  replayed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_user_id ON webhook_endpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_slug ON webhook_endpoints(slug);
CREATE INDEX IF NOT EXISTS idx_webhook_requests_endpoint_id ON webhook_requests(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_requests_received_at ON webhook_requests(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_forwards_request_id ON webhook_forwards(request_id);
CREATE INDEX IF NOT EXISTS idx_webhook_replays_request_id ON webhook_replays(request_id);

-- RLS
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_forwards ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_replays ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own endpoints" ON webhook_endpoints
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own requests" ON webhook_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM webhook_endpoints WHERE id = endpoint_id AND user_id = auth.uid())
  );

CREATE POLICY "Anyone can create requests" ON webhook_requests
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM webhook_endpoints WHERE id = endpoint_id AND is_active = true)
  );

CREATE POLICY "Users can view own forwards" ON webhook_forwards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM webhook_requests wr
      JOIN webhook_endpoints we ON wr.endpoint_id = we.id
      WHERE wr.id = request_id AND we.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own replays" ON webhook_replays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM webhook_requests wr
      JOIN webhook_endpoints we ON wr.endpoint_id = we.id
      WHERE wr.id = request_id AND we.user_id = auth.uid()
    )
  );
