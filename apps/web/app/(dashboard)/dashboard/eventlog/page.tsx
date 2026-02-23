'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  api_key: string;
  is_active: boolean;
  event_count: number;
  created_at: string;
  eventlog_channels: {
    id: string;
    name: string;
    emoji: string | null;
    color: string;
  }[];
}

interface Event {
  id: string;
  channel_name: string;
  event: string;
  description: string | null;
  icon: string | null;
  tags: Record<string, string>;
  user_id_ext: string | null;
  created_at: string;
}

export default function EventLogPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', slug: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchEvents(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/eventlog/projects');
      const data = await res.json();
      setProjects(data.projects || []);
      if (data.projects?.length > 0 && !selectedProject) {
        setSelectedProject(data.projects[0]);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (projectId: string) => {
    try {
      const res = await fetch(`/api/eventlog/events?project_id=${projectId}&limit=100`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/eventlog/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewProject({ name: '', slug: '', description: '' });
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
    }
  };

  const copyApiKey = () => {
    if (selectedProject) {
      navigator.clipboard.writeText(selectedProject.api_key);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#1e1e2e] rounded w-48"></div>
          <div className="h-32 bg-[#1e1e2e] rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">EventLog</h1>
          <p className="text-[#71717a]">Real-time event tracking for your apps</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg font-medium transition-colors"
        >
          New Project
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12121a] rounded-2xl p-6 w-full max-w-md border border-[#27272a]">
            <h2 className="text-xl font-bold mb-4">Create Project</h2>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                  placeholder="My App"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={newProject.slug}
                  onChange={(e) => setNewProject({ ...newProject, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                  placeholder="my-app"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#1a1a25] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-[#12121a] rounded-2xl border border-[#27272a]">
          <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#6366f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-[#71717a] mb-6">Create a project to start tracking events</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg font-medium transition-colors"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Projects Sidebar */}
          <div className="col-span-3 space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full text-left p-4 rounded-xl transition-colors ${
                  selectedProject?.id === project.id
                    ? 'bg-[#6366f1]/10 border border-[#6366f1]/30'
                    : 'bg-[#12121a] border border-[#27272a] hover:border-[#3f3f50]'
                }`}
              >
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-[#71717a]">{project.event_count} events</p>
              </button>
            ))}
          </div>

          {/* Events Feed */}
          <div className="col-span-9">
            {selectedProject && (
              <>
                {/* Project Header */}
                <div className="bg-[#12121a] rounded-2xl border border-[#27272a] p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-sm text-[#6366f1] hover:underline"
                    >
                      {showApiKey ? 'Hide' : 'Show'} API Key
                    </button>
                  </div>
                  
                  {showApiKey && (
                    <div className="bg-[#0a0a0f] rounded-lg p-3 flex items-center justify-between mb-4">
                      <code className="text-sm text-[#a1a1aa] font-mono">{selectedProject.api_key}</code>
                      <button
                        onClick={copyApiKey}
                        className="text-[#6366f1] hover:text-[#8b5cf6] text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  )}

                  <div className="bg-[#0a0a0f] rounded-lg p-4">
                    <p className="text-sm text-[#71717a] mb-2">Quick Start:</p>
                    <pre className="text-sm text-[#a1a1aa] overflow-x-auto">
{`curl -X POST https://smith-kit-production.up.railway.app/api/eventlog/track \\
  -H "Authorization: Bearer ${selectedProject.api_key}" \\
  -H "Content-Type: application/json" \\
  -d '{"channel": "signups", "event": "User Signed Up", "icon": "🎉"}'`}
                    </pre>
                  </div>
                </div>

                {/* Events List */}
                <div className="bg-[#12121a] rounded-2xl border border-[#27272a]">
                  <div className="p-4 border-b border-[#27272a]">
                    <h3 className="font-semibold">Recent Events</h3>
                  </div>
                  
                  {events.length === 0 ? (
                    <div className="p-8 text-center text-[#71717a]">
                      No events yet. Send your first event using the API above.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#27272a]">
                      {events.map((event) => (
                        <div key={event.id} className="p-4 hover:bg-[#1a1a25] transition-colors">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{event.icon || '📌'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 text-xs rounded bg-[#27272a] text-[#a1a1aa]">
                                  {event.channel_name}
                                </span>
                                <span className="text-xs text-[#71717a]">{formatTime(event.created_at)}</span>
                              </div>
                              <p className="font-medium">{event.event}</p>
                              {event.description && (
                                <p className="text-sm text-[#a1a1aa] mt-1">{event.description}</p>
                              )}
                              {event.user_id_ext && (
                                <p className="text-xs text-[#71717a] mt-1">User: {event.user_id_ext}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
