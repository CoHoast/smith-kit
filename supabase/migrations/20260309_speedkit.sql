-- SpeedKit: Performance Monitoring
-- Created: 2026-03-09

-- ===========================================
-- SPEEDKIT TABLES
-- ===========================================

-- Monitored URLs
CREATE TABLE public.speedkit_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name VARCHAR(255),
  scan_frequency VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  alert_threshold INTEGER DEFAULT 80,
  is_active BOOLEAN DEFAULT true,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.speedkit_urls ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own speedkit URLs" ON public.speedkit_urls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own speedkit URLs" ON public.speedkit_urls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own speedkit URLs" ON public.speedkit_urls
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own speedkit URLs" ON public.speedkit_urls
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_speedkit_urls_user ON public.speedkit_urls(user_id);
CREATE INDEX idx_speedkit_urls_active ON public.speedkit_urls(is_active);

-- ===========================================
-- SCAN RESULTS
-- ===========================================

CREATE TABLE public.speedkit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES public.speedkit_urls(id) ON DELETE CASCADE,
  device VARCHAR(10) NOT NULL, -- 'mobile' or 'desktop'
  
  -- Lighthouse scores (0-100)
  performance_score INTEGER,
  accessibility_score INTEGER,
  best_practices_score INTEGER,
  seo_score INTEGER,
  
  -- Core Web Vitals
  lcp_ms INTEGER,           -- Largest Contentful Paint (milliseconds)
  fid_ms INTEGER,           -- First Input Delay (milliseconds)
  cls DECIMAL(5,3),         -- Cumulative Layout Shift (decimal)
  fcp_ms INTEGER,           -- First Contentful Paint (milliseconds)
  ttfb_ms INTEGER,          -- Time to First Byte (milliseconds)
  
  -- Raw data
  raw_response JSONB,       -- Full PageSpeed API response
  
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.speedkit_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from url ownership)
CREATE POLICY "Users can view results for their URLs" ON public.speedkit_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.speedkit_urls 
      WHERE speedkit_urls.id = speedkit_results.url_id 
      AND speedkit_urls.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert results for their URLs" ON public.speedkit_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.speedkit_urls 
      WHERE speedkit_urls.id = speedkit_results.url_id 
      AND speedkit_urls.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_speedkit_results_url ON public.speedkit_results(url_id);
CREATE INDEX idx_speedkit_results_scanned ON public.speedkit_results(scanned_at DESC);
CREATE INDEX idx_speedkit_results_device ON public.speedkit_results(device);

-- ===========================================
-- ALERTS CONFIG
-- ===========================================

CREATE TABLE public.speedkit_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES public.speedkit_urls(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'score_below', 'score_drop', 'cwv_fail'
  threshold INTEGER,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.speedkit_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view alerts for their URLs" ON public.speedkit_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.speedkit_urls 
      WHERE speedkit_urls.id = speedkit_alerts.url_id 
      AND speedkit_urls.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert alerts for their URLs" ON public.speedkit_alerts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.speedkit_urls 
      WHERE speedkit_urls.id = speedkit_alerts.url_id 
      AND speedkit_urls.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update alerts for their URLs" ON public.speedkit_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.speedkit_urls 
      WHERE speedkit_urls.id = speedkit_alerts.url_id 
      AND speedkit_urls.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete alerts for their URLs" ON public.speedkit_alerts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.speedkit_urls 
      WHERE speedkit_urls.id = speedkit_alerts.url_id 
      AND speedkit_urls.user_id = auth.uid()
    )
  );

-- Index
CREATE INDEX idx_speedkit_alerts_url ON public.speedkit_alerts(url_id);

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to get latest scores for a URL
CREATE OR REPLACE FUNCTION get_speedkit_latest_scores(p_url_id UUID)
RETURNS TABLE (
  device VARCHAR,
  performance_score INTEGER,
  accessibility_score INTEGER,
  best_practices_score INTEGER,
  seo_score INTEGER,
  lcp_ms INTEGER,
  fid_ms INTEGER,
  cls DECIMAL,
  scanned_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (r.device)
    r.device,
    r.performance_score,
    r.accessibility_score,
    r.best_practices_score,
    r.seo_score,
    r.lcp_ms,
    r.fid_ms,
    r.cls,
    r.scanned_at
  FROM public.speedkit_results r
  WHERE r.url_id = p_url_id
  ORDER BY r.device, r.scanned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
