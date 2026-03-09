-- ToggleBox Feature Flags Tables
-- Migration: 002_togglebox.sql

-- Projects (group flags together)
CREATE TABLE public.togglebox_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- Feature Flags
CREATE TABLE public.togglebox_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.togglebox_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, key)
);

-- Enable RLS
ALTER TABLE public.togglebox_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.togglebox_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON public.togglebox_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON public.togglebox_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.togglebox_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.togglebox_projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for flags (via project ownership)
CREATE POLICY "Users can view flags in own projects" ON public.togglebox_flags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.togglebox_projects 
      WHERE id = togglebox_flags.project_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create flags in own projects" ON public.togglebox_flags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.togglebox_projects 
      WHERE id = togglebox_flags.project_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update flags in own projects" ON public.togglebox_flags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.togglebox_projects 
      WHERE id = togglebox_flags.project_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete flags in own projects" ON public.togglebox_flags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.togglebox_projects 
      WHERE id = togglebox_flags.project_id 
      AND user_id = auth.uid()
    )
  );

-- Index for API key lookups
CREATE INDEX idx_togglebox_projects_api_key ON public.togglebox_projects(api_key);

-- Index for flag lookups by project
CREATE INDEX idx_togglebox_flags_project_id ON public.togglebox_flags(project_id);
CREATE INDEX idx_togglebox_flags_key ON public.togglebox_flags(project_id, key);
