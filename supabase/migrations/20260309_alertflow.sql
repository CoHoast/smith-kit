-- AlertFlow: Incident Management
-- Created: 2026-03-09

-- ===========================================
-- ON-CALL SCHEDULES
-- ===========================================

CREATE TABLE public.alertflow_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID,
  name TEXT NOT NULL,
  rotation_type TEXT NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'custom'
  rotation_time TIME DEFAULT '09:00:00',
  rotation_day INTEGER DEFAULT 1, -- 1=Monday for weekly
  timezone TEXT DEFAULT 'UTC',
  members JSONB NOT NULL DEFAULT '[]', -- [{name, email, slack_id?, discord_id?, order}]
  current_index INTEGER DEFAULT 0,
  last_rotated_at TIMESTAMPTZ,
  override_user_id UUID,
  override_until TIMESTAMPTZ,
  notification_channels JSONB DEFAULT '[]', -- [{type: 'slack'|'discord'|'email', webhook_url?, enabled}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alertflow_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedules" ON public.alertflow_schedules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedules" ON public.alertflow_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedules" ON public.alertflow_schedules
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedules" ON public.alertflow_schedules
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_alertflow_schedules_user ON public.alertflow_schedules(user_id);

-- ===========================================
-- ESCALATION POLICIES
-- ===========================================

CREATE TABLE public.alertflow_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  steps JSONB NOT NULL DEFAULT '[]', -- [{delay_minutes, target: 'oncall'|'email'|'all', emails?, notify_channels}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alertflow_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own policies" ON public.alertflow_policies
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own policies" ON public.alertflow_policies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own policies" ON public.alertflow_policies
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own policies" ON public.alertflow_policies
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_alertflow_policies_user ON public.alertflow_policies(user_id);

-- ===========================================
-- INCIDENTS
-- ===========================================

CREATE TABLE public.alertflow_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID,
  incident_number SERIAL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'warning', -- 'critical', 'warning', 'info'
  status TEXT NOT NULL DEFAULT 'triggered', -- 'triggered', 'acknowledged', 'resolved'
  source TEXT, -- 'uptime', 'errorwatch', 'manual', 'api'
  source_id UUID,
  source_url TEXT,
  schedule_id UUID REFERENCES public.alertflow_schedules(id) ON DELETE SET NULL,
  policy_id UUID REFERENCES public.alertflow_policies(id) ON DELETE SET NULL,
  assigned_to TEXT, -- Email of assigned person
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  time_to_ack_seconds INTEGER,
  time_to_resolve_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alertflow_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own incidents" ON public.alertflow_incidents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own incidents" ON public.alertflow_incidents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own incidents" ON public.alertflow_incidents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own incidents" ON public.alertflow_incidents
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_alertflow_incidents_user ON public.alertflow_incidents(user_id);
CREATE INDEX idx_alertflow_incidents_status ON public.alertflow_incidents(status);
CREATE INDEX idx_alertflow_incidents_created ON public.alertflow_incidents(created_at DESC);
CREATE INDEX idx_alertflow_incidents_severity ON public.alertflow_incidents(severity);

-- ===========================================
-- INCIDENT TIMELINE / NOTES
-- ===========================================

CREATE TABLE public.alertflow_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.alertflow_incidents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'triggered', 'acknowledged', 'escalated', 'note', 'resolved', 'notification_sent'
  actor TEXT, -- Email or system identifier
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alertflow_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view timeline for their incidents" ON public.alertflow_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.alertflow_incidents 
      WHERE alertflow_incidents.id = alertflow_timeline.incident_id 
      AND alertflow_incidents.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert timeline for their incidents" ON public.alertflow_timeline
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.alertflow_incidents 
      WHERE alertflow_incidents.id = alertflow_timeline.incident_id 
      AND alertflow_incidents.user_id = auth.uid()
    )
  );

CREATE INDEX idx_alertflow_timeline_incident ON public.alertflow_timeline(incident_id);
CREATE INDEX idx_alertflow_timeline_created ON public.alertflow_timeline(created_at);

-- ===========================================
-- NOTIFICATION LOG
-- ===========================================

CREATE TABLE public.alertflow_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.alertflow_incidents(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL, -- Email or webhook URL
  channel TEXT NOT NULL, -- 'slack', 'discord', 'email'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  response_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alertflow_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications for their incidents" ON public.alertflow_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.alertflow_incidents 
      WHERE alertflow_incidents.id = alertflow_notifications.incident_id 
      AND alertflow_incidents.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert notifications for their incidents" ON public.alertflow_notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.alertflow_incidents 
      WHERE alertflow_incidents.id = alertflow_notifications.incident_id 
      AND alertflow_incidents.user_id = auth.uid()
    )
  );

CREATE INDEX idx_alertflow_notifications_incident ON public.alertflow_notifications(incident_id);
CREATE INDEX idx_alertflow_notifications_status ON public.alertflow_notifications(status);

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Get current on-call person for a schedule
CREATE OR REPLACE FUNCTION get_oncall_person(p_schedule_id UUID)
RETURNS TABLE (
  name TEXT,
  email TEXT,
  is_override BOOLEAN
) AS $$
DECLARE
  v_schedule RECORD;
  v_member JSONB;
BEGIN
  SELECT * INTO v_schedule FROM public.alertflow_schedules WHERE id = p_schedule_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check for active override
  IF v_schedule.override_user_id IS NOT NULL 
     AND v_schedule.override_until IS NOT NULL 
     AND v_schedule.override_until > NOW() THEN
    -- Return override person from members
    FOR v_member IN SELECT * FROM jsonb_array_elements(v_schedule.members)
    LOOP
      IF v_member->>'email' = (
        SELECT email FROM public.profiles WHERE id = v_schedule.override_user_id
      ) THEN
        RETURN QUERY SELECT 
          (v_member->>'name')::TEXT,
          (v_member->>'email')::TEXT,
          TRUE;
        RETURN;
      END IF;
    END LOOP;
  END IF;
  
  -- Return current rotation person
  v_member := v_schedule.members->v_schedule.current_index;
  IF v_member IS NOT NULL THEN
    RETURN QUERY SELECT 
      (v_member->>'name')::TEXT,
      (v_member->>'email')::TEXT,
      FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get incident stats for dashboard
CREATE OR REPLACE FUNCTION get_alertflow_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_incidents BIGINT,
  active_incidents BIGINT,
  avg_time_to_ack_minutes NUMERIC,
  avg_time_to_resolve_minutes NUMERIC,
  incidents_by_severity JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_incidents,
    COUNT(*) FILTER (WHERE status != 'resolved')::BIGINT as active_incidents,
    ROUND(AVG(time_to_ack_seconds) / 60.0, 1) as avg_time_to_ack_minutes,
    ROUND(AVG(time_to_resolve_seconds) / 60.0, 1) as avg_time_to_resolve_minutes,
    jsonb_build_object(
      'critical', COUNT(*) FILTER (WHERE severity = 'critical'),
      'warning', COUNT(*) FILTER (WHERE severity = 'warning'),
      'info', COUNT(*) FILTER (WHERE severity = 'info')
    ) as incidents_by_severity
  FROM public.alertflow_incidents
  WHERE user_id = p_user_id
    AND created_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
