'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DepWatchProject {
  id: string;
  name: string;
  github_url: string;
  package_manager: string;
  last_scanned_at: string | null;
  created_at: string;
  dependency_count: number;
  vulnerability_count: number;
  outdated_count: number;
}

export default function DepWatchPage() {
  const [projects, setProjects] = useState<DepWatchProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGithubUrl, setNewGithubUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const res = await fetch('/api/depwatch/projects');
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
    setIsLoading(false);
  };

  const createProject = async () => {
    if (!newName.trim() || !newGithubUrl.trim()) return;
    setIsCreating(true);

    const res = await fetch('/api/depwatch/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, github_url: newGithubUrl }),
    });

    if (res.ok) {
      const project = await res.json();
      setNewName('');
      setNewGithubUrl('');
      setShowCreateModal(false);
      
      // Auto-scan the new project
      await fetch('/api/depwatch/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.id }),
      });
      
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
            DepWatch
          </h1>
          <p className="text-zinc-400">Monitor dependencies for vulnerabilities and updates</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          + Add Repository
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/depwatch/${project.id}`}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                {project.vulnerability_count > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                    {project.vulnerability_count} issues
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-white mb-1">{project.name}</h3>
              <p className="text-xs text-zinc-500 truncate mb-3">{project.github_url}</p>
              
              <div className="flex items-center gap-4 text-xs">
                <span className="text-zinc-400">{project.dependency_count} deps</span>
                {project.outdated_count > 0 && (
                  <span className="text-yellow-400">{project.outdated_count} outdated</span>
                )}
                {project.vulnerability_count > 0 && (
                  <span className="text-red-400">{project.vulnerability_count} vulnerable</span>
                )}
              </div>
              
              {project.last_scanned_at && (
                <p className="text-xs text-zinc-600 mt-3">
                  Last scanned {new Date(project.last_scanned_at).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No repositories yet</h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Connect a GitHub repository to scan for outdated and vulnerable dependencies.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Add Your First Repository
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add Repository</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="my-project"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-2">GitHub URL</label>
                <input
                  type="text"
                  value={newGithubUrl}
                  onChange={(e) => setNewGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                />
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
                disabled={isCreating || !newName.trim() || !newGithubUrl.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isCreating ? 'Scanning...' : 'Add & Scan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
