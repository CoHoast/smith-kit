-- StatusKit Migration
-- Adds status page customization, enhanced incidents, and subscribers

-- Status page configuration
CREATE TABLE IF NOT EXISTS status_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#6366f1',
  custom_domain VARCHAR(255),
  is_public BOOLEAN DEFAULT true,
  show_uptime_chart BOOLEAN DEFAULT true,
  show_response_times BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link monitors to status pages (many-to-many)
CREATE TABLE IF NOT EXISTS status_page_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_page_id UUID NOT NULL REFERENCES status_pages(id) ON DELETE CASCADE,
  monitor_id UUID NOT NULL REFERENCES uptime_monitors(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(status_page_id, monitor_id)
);

-- Enhanced incidents (extends uptime_incidents)
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status_page_id UUID REFERENCES status_pages(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'investigating', -- investigating, identified, monitoring, resolved
  severity VARCHAR(20) NOT NULL DEFAULT 'minor', -- minor, major, critical
  started_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident updates (timeline)
CREATE TABLE IF NOT EXISTS incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link incidents to affected monitors
CREATE TABLE IF NOT EXISTS incident_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  monitor_id UUID NOT NULL REFERENCES uptime_monitors(id) ON DELETE CASCADE,
  UNIQUE(incident_id, monitor_id)
);

-- Subscribers for status updates
CREATE TABLE IF NOT EXISTS status_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_page_id UUID NOT NULL REFERENCES status_pages(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(64),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  UNIQUE(status_page_id, email)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_status_pages_user_id ON status_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_status_pages_slug ON status_pages(slug);
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status_page_id ON incidents(status_page_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incident_updates_incident_id ON incident_updates(incident_id);
CREATE INDEX IF NOT EXISTS idx_status_subscribers_status_page_id ON status_subscribers(status_page_id);

-- RLS Policies
ALTER TABLE status_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_page_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_subscribers ENABLE ROW LEVEL SECURITY;

-- Status pages: users can manage their own
CREATE POLICY "Users can view own status pages" ON status_pages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own status pages" ON status_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own status pages" ON status_pages
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own status pages" ON status_pages
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view public status pages" ON status_pages
  FOR SELECT USING (is_public = true);

-- Status page monitors: users can manage via status page ownership
CREATE POLICY "Users can manage status page monitors" ON status_page_monitors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM status_pages WHERE id = status_page_id AND user_id = auth.uid())
  );

-- Incidents: users can manage their own
CREATE POLICY "Users can manage own incidents" ON incidents
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view incidents on public status pages" ON incidents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM status_pages WHERE id = status_page_id AND is_public = true)
  );

-- Incident updates: accessible via incident
CREATE POLICY "Users can manage incident updates" ON incident_updates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM incidents WHERE id = incident_id AND user_id = auth.uid())
  );
CREATE POLICY "Public can view updates on public incidents" ON incident_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM incidents i
      JOIN status_pages sp ON i.status_page_id = sp.id
      WHERE i.id = incident_id AND sp.is_public = true
    )
  );

-- Incident monitors: accessible via incident
CREATE POLICY "Users can manage incident monitors" ON incident_monitors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM incidents WHERE id = incident_id AND user_id = auth.uid())
  );

-- Subscribers: status page owners can view, anyone can subscribe
CREATE POLICY "Status page owners can view subscribers" ON status_subscribers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM status_pages WHERE id = status_page_id AND user_id = auth.uid())
  );
CREATE POLICY "Anyone can subscribe to public status pages" ON status_subscribers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM status_pages WHERE id = status_page_id AND is_public = true)
  );
