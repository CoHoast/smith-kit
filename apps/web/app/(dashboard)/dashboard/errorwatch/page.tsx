'use client';

import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  slug: string;
  platform: string;
  api_key: string;
  is_active: boolean;
  error_count: number;
  unresolved_count: number;
  created_at: string;
}

interface Issue {
  id: string;
  fingerprint: string;
  error_type: string;
  message: string;
  level: string;
  status: string;
  first_seen: string;
  last_seen: string;
  event_count: number;
  is_regression: boolean;
}

interface ErrorEvent {
  id: string;
  error_type: string;
  message: string;
  stack_trace: string | null;
  level: string;
  url: string | null;
  user_id_ext: string | null;
  browser: string | null;
  os: string | null;
  environment: string;
  created_at: string;
}

export default function ErrorWatchPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('unresolved');
  const [showCreate, setShowCreate] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', slug: '', platform: 'javascript' });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchIssues(selectedProject.id, statusFilter);
      setSelectedIssue(null);
      setErrors([]);
    }
  }, [selectedProject, statusFilter]);

  useEffect(() => {
    if (selectedIssue) {
      fetchErrors(selectedIssue.id);
    }
  }, [selectedIssue]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/errorwatch/projects');
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

  const fetchIssues = async (projectId: string, status: string) => {
    try {
      const res = await fetch(`/api/errorwatch/issues?project_id=${projectId}&status=${status}`);
      const data = await res.json();
      setIssues(data.issues || []);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    }
  };

  const fetchErrors = async (issueId: string) => {
    try {
      const res = await fetch(`/api/errorwatch/errors?issue_id=${issueId}&limit=20`);
      const data = await res.json();
      setErrors(data.errors || []);
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/errorwatch/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewProject({ name: '', slug: '', platform: 'javascript' });
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
    }
  };

  const updateIssueStatus = async (issueId: string, status: string) => {
    try {
      await fetch('/api/errorwatch/issues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: issueId, status }),
      });
      if (selectedProject) {
        fetchIssues(selectedProject.id, statusFilter);
      }
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(null);
        setErrors([]);
      }
    } catch (error) {
      console.error('Failed to update issue:', error);
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
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'info': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-[#27272a] text-[#a1a1aa]';
    }
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
          <h1 className="text-2xl font-bold mb-1">ErrorWatch</h1>
          <p className="text-[#71717a]">Track and resolve errors in your applications</p>
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
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <select
                  value={newProject.platform}
                  onChange={(e) => setNewProject({ ...newProject, platform: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                >
                  <option value="javascript">JavaScript / Browser</option>
                  <option value="node">Node.js</option>
                  <option value="react">React</option>
                  <option value="nextjs">Next.js</option>
                  <option value="python">Python</option>
                  <option value="other">Other</option>
                </select>
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
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-[#71717a] mb-6">Create a project to start tracking errors</p>
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
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#71717a]">{project.error_count} errors</span>
                  {project.unresolved_count > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                      {project.unresolved_count} unresolved
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {selectedProject && (
              <>
                {/* Project Header */}
                <div className="bg-[#12121a] rounded-2xl border border-[#27272a] p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                      <span className="text-sm text-[#71717a]">{selectedProject.platform}</span>
                    </div>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-sm text-[#6366f1] hover:underline"
                    >
                      {showApiKey ? 'Hide' : 'Show'} Setup
                    </button>
                  </div>
                  
                  {showApiKey && (
                    <div className="space-y-4">
                      <div className="bg-[#0a0a0f] rounded-lg p-3 flex items-center justify-between">
                        <code className="text-sm text-[#a1a1aa] font-mono">{selectedProject.api_key}</code>
                        <button
                          onClick={copyApiKey}
                          className="text-[#6366f1] hover:text-[#8b5cf6] text-sm"
                        >
                          Copy
                        </button>
                      </div>

                      <div className="bg-[#0a0a0f] rounded-lg p-4">
                        <p className="text-sm text-[#71717a] mb-2">Quick Start (Browser):</p>
                        <pre className="text-sm text-[#a1a1aa] overflow-x-auto whitespace-pre-wrap">
{`<script>
window.onerror = function(msg, url, line, col, error) {
  fetch('https://smith-kit-production.up.railway.app/api/errorwatch/track', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${selectedProject.api_key}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error_type: error?.name || 'Error',
      message: msg,
      stack_trace: error?.stack,
      url: url,
      browser: navigator.userAgent
    })
  });
};
</script>`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Issues Section */}
                <div className="bg-[#12121a] rounded-2xl border border-[#27272a]">
                  <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
                    <h3 className="font-semibold">Issues</h3>
                    <div className="flex gap-2">
                      {['unresolved', 'resolved', 'ignored', 'all'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            statusFilter === status
                              ? 'bg-[#6366f1] text-white'
                              : 'bg-[#27272a] text-[#a1a1aa] hover:text-white'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {issues.length === 0 ? (
                    <div className="p-8 text-center text-[#71717a]">
                      {statusFilter === 'unresolved' 
                        ? 'No unresolved issues. You\'re all caught up! 🎉' 
                        : 'No issues found with this filter.'}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#27272a]">
                      {issues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => setSelectedIssue(issue)}
                          className={`p-4 hover:bg-[#1a1a25] transition-colors cursor-pointer ${
                            selectedIssue?.id === issue.id ? 'bg-[#1a1a25]' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`px-2 py-0.5 text-xs rounded border ${getLevelColor(issue.level)}`}>
                              {issue.level}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm text-[#a1a1aa]">{issue.error_type}</span>
                                {issue.is_regression && (
                                  <span className="px-1.5 py-0.5 text-xs rounded bg-orange-500/10 text-orange-400">
                                    Regression
                                  </span>
                                )}
                              </div>
                              <p className="text-sm truncate">{issue.message}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-[#71717a]">
                                <span>{issue.event_count} events</span>
                                <span>First seen {formatTime(issue.first_seen)}</span>
                                <span>Last seen {formatTime(issue.last_seen)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {issue.status === 'unresolved' && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateIssueStatus(issue.id, 'resolved'); }}
                                    className="px-2 py-1 text-xs rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                  >
                                    Resolve
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateIssueStatus(issue.id, 'ignored'); }}
                                    className="px-2 py-1 text-xs rounded bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f50]"
                                  >
                                    Ignore
                                  </button>
                                </>
                              )}
                              {issue.status === 'resolved' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateIssueStatus(issue.id, 'unresolved'); }}
                                  className="px-2 py-1 text-xs rounded bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f50]"
                                >
                                  Reopen
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error Details */}
                {selectedIssue && errors.length > 0 && (
                  <div className="mt-6 bg-[#12121a] rounded-2xl border border-[#27272a]">
                    <div className="p-4 border-b border-[#27272a]">
                      <h3 className="font-semibold">Error Events for: {selectedIssue.error_type}</h3>
                    </div>
                    <div className="divide-y divide-[#27272a] max-h-96 overflow-y-auto">
                      {errors.map((error) => (
                        <div key={error.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[#71717a]">{formatTime(error.created_at)}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-[#27272a] text-[#a1a1aa]">
                              {error.environment}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{error.message}</p>
                          {error.stack_trace && (
                            <pre className="text-xs text-[#71717a] bg-[#0a0a0f] rounded p-3 overflow-x-auto max-h-32">
                              {error.stack_trace}
                            </pre>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-[#71717a]">
                            {error.url && <span>URL: {error.url}</span>}
                            {error.browser && <span>Browser: {error.browser.substring(0, 50)}...</span>}
                            {error.user_id_ext && <span>User: {error.user_id_ext}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
