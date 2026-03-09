'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface VaultProject {
  id: string;
  name: string;
  environment: string;
  created_at: string;
  secret_count: number;
}

export default function VaultPage() {
  const [projects, setProjects] = useState<VaultProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectEnv, setNewProjectEnv] = useState('production');
  const [isCreating, setIsCreating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const res = await fetch('/api/vault/projects');
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
    setIsLoading(false);
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    setIsCreating(true);

    const res = await fetch('/api/vault/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName, environment: newProjectEnv }),
    });

    if (res.ok) {
      setNewProjectName('');
      setNewProjectEnv('production');
      setShowCreateModal(false);
      loadProjects();
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to create project');
    }
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            VaultKit
          </h1>
          <p className="text-zinc-400">Secure secrets and environment variables</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          + New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/vault/${project.id}`}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  project.environment === 'production' 
                    ? 'bg-red-500/20 text-red-400' 
                    : project.environment === 'staging'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {project.environment}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-1">{project.name}</h3>
              <p className="text-sm text-zinc-500">{project.secret_count} secrets</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No vault projects yet</h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Create a vault project to securely store your API keys, database credentials, and other secrets.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Create Your First Vault
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create Vault Project</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="my-app-secrets"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Environment</label>
                <select
                  value={newProjectEnv}
                  onChange={(e) => setNewProjectEnv(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={isCreating || !newProjectName.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Vault'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
