'use client';

import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  slug: string;
  api_key: string;
  is_active: boolean;
  total_requests: number;
  today_tokens: number;
  today_cost_cents: number;
  created_at: string;
}

interface LLMRequest {
  id: string;
  provider: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_cents: number;
  latency_ms: number;
  status: string;
  created_at: string;
}

export default function LLMAnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [requests, setRequests] = useState<LLMRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', slug: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchRequests(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/llm/projects');
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

  const fetchRequests = async (projectId: string) => {
    try {
      const res = await fetch(`/api/llm/projects/${projectId}/requests`);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      setRequests([]);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/llm/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewProject({ name: '', slug: '' });
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

  const formatCost = (cents: number) => {
    return `$${(cents / 100).toFixed(4)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
          <h1 className="text-2xl font-bold mb-1">LLM Analytics</h1>
          <p className="text-[#71717a]">Track AI/LLM usage, costs, and performance</p>
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
            <h2 className="text-xl font-bold mb-4">Create LLM Project</h2>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                  placeholder="My AI App"
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
                  placeholder="my-ai-app"
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No LLM projects yet</h3>
          <p className="text-[#71717a] mb-6">Track your AI/LLM API usage and costs</p>
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
                <p className="text-sm text-[#71717a]">{formatNumber(project.total_requests)} requests</p>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {selectedProject && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#12121a] rounded-2xl border border-[#27272a] p-6">
                    <p className="text-sm text-[#71717a] mb-1">Today's Requests</p>
                    <p className="text-3xl font-bold">{formatNumber(selectedProject.total_requests)}</p>
                  </div>
                  <div className="bg-[#12121a] rounded-2xl border border-[#27272a] p-6">
                    <p className="text-sm text-[#71717a] mb-1">Today's Tokens</p>
                    <p className="text-3xl font-bold">{formatNumber(selectedProject.today_tokens)}</p>
                  </div>
                  <div className="bg-[#12121a] rounded-2xl border border-[#27272a] p-6">
                    <p className="text-sm text-[#71717a] mb-1">Today's Cost</p>
                    <p className="text-3xl font-bold">{formatCost(selectedProject.today_cost_cents)}</p>
                  </div>
                </div>

                {/* API Key */}
                <div className="bg-[#12121a] rounded-2xl border border-[#27272a] p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Integration</h2>
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
                      <button onClick={copyApiKey} className="text-[#6366f1] hover:text-[#8b5cf6] text-sm">
                        Copy
                      </button>
                    </div>
                  )}

                  <div className="bg-[#0a0a0f] rounded-lg p-4">
                    <p className="text-sm text-[#71717a] mb-2">Track a request:</p>
                    <pre className="text-xs text-[#a1a1aa] overflow-x-auto">
{`fetch('https://smith-kit-production.up.railway.app/api/llm/track', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${selectedProject.api_key}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'openai',
    model: 'gpt-4',
    prompt_tokens: 150,
    completion_tokens: 50,
    latency_ms: 1200
  })
})`}
                    </pre>
                  </div>
                </div>

                {/* Recent Requests */}
                <div className="bg-[#12121a] rounded-2xl border border-[#27272a]">
                  <div className="p-4 border-b border-[#27272a]">
                    <h3 className="font-semibold">Recent Requests</h3>
                  </div>
                  
                  {requests.length === 0 ? (
                    <div className="p-8 text-center text-[#71717a]">
                      No requests yet. Use the API above to start tracking.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#27272a]">
                      {requests.slice(0, 20).map((req) => (
                        <div key={req.id} className="p-4 hover:bg-[#1a1a25] transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-xs rounded bg-[#27272a] text-[#a1a1aa]">
                                {req.provider}
                              </span>
                              <span className="font-medium">{req.model}</span>
                            </div>
                            <span className={`text-sm ${req.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                              {req.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#71717a]">
                            <span>{formatNumber(req.total_tokens || 0)} tokens</span>
                            <span>{formatCost(req.cost_cents || 0)}</span>
                            <span>{req.latency_ms}ms</span>
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
