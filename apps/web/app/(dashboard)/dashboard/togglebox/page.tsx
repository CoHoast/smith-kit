'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

// Code Examples Component
function CodeExamples({ apiKey }: { apiKey: string }) {
  const [activeTab, setActiveTab] = useState<'javascript' | 'react' | 'python' | 'curl'>('javascript');
  const [copied, setCopied] = useState(false);
  
  const baseUrl = 'https://smith-kit-production.up.railway.app';
  
  const examples = {
    javascript: `// Check if a feature is enabled
async function isFeatureEnabled(flagKey) {
  const response = await fetch('${baseUrl}/api/flags/' + flagKey, {
    headers: {
      'Authorization': 'Bearer ${apiKey}'
    }
  });
  const data = await response.json();
  return data.enabled;
}

// Usage
if (await isFeatureEnabled('dark_mode')) {
  enableDarkMode();
}`,
    react: `import { useState, useEffect } from 'react';

// Custom hook for feature flags
function useFeatureFlag(flagKey) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('${baseUrl}/api/flags/' + flagKey, {
      headers: {
        'Authorization': 'Bearer ${apiKey}'
      }
    })
      .then(res => res.json())
      .then(data => {
        setEnabled(data.enabled);
        setLoading(false);
      });
  }, [flagKey]);

  return { enabled, loading };
}

// Usage in component
function MyComponent() {
  const { enabled: darkMode } = useFeatureFlag('dark_mode');
  
  return darkMode ? <DarkTheme /> : <LightTheme />;
}`,
    python: `import requests

API_KEY = "${apiKey}"
BASE_URL = "${baseUrl}"

def is_feature_enabled(flag_key):
    response = requests.get(
        f"{BASE_URL}/api/flags/{flag_key}",
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    return response.json().get("enabled", False)

# Usage
if is_feature_enabled("dark_mode"):
    enable_dark_mode()`,
    curl: `# Check a single flag
curl ${baseUrl}/api/flags/dark_mode \\
  -H "Authorization: Bearer ${apiKey}"

# Response: {"key":"dark_mode","enabled":true}`
  };

  const copyCode = () => {
    navigator.clipboard.writeText(examples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[#6b6b80]">Code Examples</p>
        <div className="flex gap-1">
          {(['javascript', 'react', 'python', 'curl'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-[#6366f1] text-white'
                  : 'text-[#6b6b80] hover:text-white hover:bg-[#1a1a25]'
              }`}
            >
              {tab === 'javascript' ? 'JS' : tab === 'react' ? 'React' : tab === 'python' ? 'Python' : 'cURL'}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <pre className="p-4 rounded-xl bg-[#0a0a0f] border border-[#27272a] overflow-x-auto">
          <code className="text-xs text-[#a1a1b5] font-mono whitespace-pre">
            {examples[activeTab]}
          </code>
        </pre>
        <button
          onClick={copyCode}
          className="absolute top-3 right-3 px-2 py-1 text-xs rounded-lg bg-[#27272a] text-[#a1a1b5] hover:text-white transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

interface Project {
  id: string;
  name: string;
  slug: string;
  api_key: string;
  created_at: string;
}

interface Flag {
  id: string;
  project_id: string;
  name: string;
  key: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
}

export default function ToggleBoxPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newFlag, setNewFlag] = useState({ name: '', key: '', description: '' });
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
  const [showApiKey, setShowApiKey] = useState(false);
  const supabase = createClient();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const res = await fetch('/api/togglebox/projects');
    const data = await res.json();
    setProjects(data.projects || []);
    if (data.projects?.length > 0 && !selectedProject) {
      setSelectedProject(data.projects[0]);
      loadFlags(data.projects[0].id);
    }
    setIsLoading(false);
  };

  const loadFlags = async (projectId: string) => {
    const res = await fetch(`/api/togglebox/flags?project_id=${projectId}`);
    const data = await res.json();
    setFlags(data.flags || []);
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    
    const res = await fetch('/api/togglebox/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName }),
    });
    
    if (res.ok) {
      const data = await res.json();
      setProjects([data.project, ...projects]);
      setSelectedProject(data.project);
      setFlags([]);
      setShowProjectModal(false);
      setNewProjectName('');
      showToast('success', 'Project created!');
    } else {
      const error = await res.json();
      showToast('error', error.error);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Delete this project and all its flags?')) return;
    
    const res = await fetch(`/api/togglebox/projects/${projectId}`, {
      method: 'DELETE',
    });
    
    if (res.ok) {
      const newProjects = projects.filter(p => p.id !== projectId);
      setProjects(newProjects);
      if (selectedProject?.id === projectId) {
        setSelectedProject(newProjects[0] || null);
        if (newProjects[0]) loadFlags(newProjects[0].id);
        else setFlags([]);
      }
      showToast('success', 'Project deleted');
    }
  };

  const createFlag = async () => {
    if (!selectedProject || !newFlag.name.trim() || !newFlag.key.trim()) return;
    
    const res = await fetch('/api/togglebox/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: selectedProject.id,
        name: newFlag.name,
        key: newFlag.key.toLowerCase().replace(/\s+/g, '_'),
        description: newFlag.description || null,
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      setFlags([data.flag, ...flags]);
      setShowFlagModal(false);
      setNewFlag({ name: '', key: '', description: '' });
      showToast('success', 'Flag created!');
    } else {
      const error = await res.json();
      showToast('error', error.error);
    }
  };

  const toggleFlag = async (flagId: string, enabled: boolean) => {
    const res = await fetch(`/api/togglebox/flags/${flagId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    
    if (res.ok) {
      setFlags(flags.map(f => f.id === flagId ? { ...f, enabled } : f));
    }
  };

  const deleteFlag = async (flagId: string) => {
    if (!confirm('Delete this flag?')) return;
    
    const res = await fetch(`/api/togglebox/flags/${flagId}`, {
      method: 'DELETE',
    });
    
    if (res.ok) {
      setFlags(flags.filter(f => f.id !== flagId));
      showToast('success', 'Flag deleted');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">ToggleBox</h1>
          <p className="text-[#a1a1b5]">Feature flags for your applications</p>
        </div>
        <button
          onClick={() => setShowProjectModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a25] flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#6b6b80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No projects yet</h2>
          <p className="text-[#6b6b80] text-center max-w-md mb-6">
            Create a project to start managing feature flags for your application.
          </p>
          <button
            onClick={() => setShowProjectModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium transition-colors"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Projects */}
          <div className="lg:col-span-1">
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-[#6b6b80] uppercase tracking-wider mb-4">Projects</h3>
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`group relative w-full text-left px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                      selectedProject?.id === project.id
                        ? 'bg-[#6366f1]/10 border border-[#6366f1]/30'
                        : 'hover:bg-[#1a1a25]'
                    }`}
                    onClick={() => {
                      setSelectedProject(project);
                      loadFlags(project.id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{project.name}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#6b6b80] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main - Flags */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="space-y-6">
                {/* API Key Card */}
                <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{selectedProject.name}</h3>
                    <button
                      onClick={() => setShowFlagModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      New Flag
                    </button>
                  </div>

                  {/* API Key Display */}
                  <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#27272a]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#6b6b80] mb-1">API Key</p>
                        <code className="text-sm text-[#a1a1b5] font-mono">
                          {showApiKey ? selectedProject.api_key : `${selectedProject.api_key.substring(0, 10)}${'•'.repeat(30)}`}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="p-2 text-[#6b6b80] hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {showApiKey ? (
                              <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                            ) : (
                              <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => copyToClipboard(selectedProject.api_key)}
                          className="p-2 text-[#6b6b80] hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Code Examples */}
                  <CodeExamples apiKey={selectedProject.api_key} />
                </div>

                {/* Flags List */}
                <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-[#6b6b80] uppercase tracking-wider mb-4">
                    Flags ({flags.length})
                  </h3>

                  {flags.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#6b6b80]">No flags yet. Create one to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {flags.map((flag) => (
                        <div
                          key={flag.id}
                          className="group flex items-center justify-between p-4 rounded-xl bg-[#0a0a0f] border border-[#27272a] hover:border-[#3f3f50] transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className="font-medium text-white">{flag.name}</p>
                              <code className="text-xs px-2 py-1 rounded bg-[#27272a] text-[#a1a1b5] font-mono">
                                {flag.key}
                              </code>
                            </div>
                            {flag.description && (
                              <p className="text-sm text-[#6b6b80] mt-1">{flag.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {/* Toggle Switch */}
                            <button
                              onClick={() => toggleFlag(flag.id, !flag.enabled)}
                              className={`relative w-12 h-6 rounded-full transition-colors ${
                                flag.enabled ? 'bg-[#6366f1]' : 'bg-[#27272a]'
                              }`}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                  flag.enabled ? 'left-7' : 'left-1'
                                }`}
                              />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => deleteFlag(flag.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-[#6b6b80] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-12 text-center">
                <p className="text-[#6b6b80]">Select a project to manage flags</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-[#27272a] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Create Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowProjectModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-[#27272a] text-[#a1a1b5] hover:bg-[#1a1a25] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-[#27272a] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Create Flag</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a1a1b5] mb-2">Name</label>
                <input
                  type="text"
                  value={newFlag.name}
                  onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                  placeholder="Dark Mode"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-[#a1a1b5] mb-2">Key</label>
                <input
                  type="text"
                  value={newFlag.key}
                  onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="dark_mode"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none font-mono"
                />
                <p className="text-xs text-[#6b6b80] mt-1">Lowercase letters, numbers, and underscores only</p>
              </div>
              <div>
                <label className="block text-sm text-[#a1a1b5] mb-2">Description (optional)</label>
                <input
                  type="text"
                  value={newFlag.description}
                  onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                  placeholder="Enable dark mode for users"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowFlagModal(false); setNewFlag({ name: '', key: '', description: '' }); }}
                className="flex-1 px-4 py-2 rounded-xl border border-[#27272a] text-[#a1a1b5] hover:bg-[#1a1a25] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createFlag}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-xl shadow-lg border ${
            toast.type === 'success' 
              ? 'bg-[#12121a] border-green-500/30 text-green-400' 
              : 'bg-[#12121a] border-red-500/30 text-red-400'
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
