'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Dependency {
  id: string;
  name: string;
  current_version: string;
  latest_version: string;
  is_outdated: boolean;
  is_dev_dependency: boolean;
  vulnerability_severity: string | null;
}

interface Project {
  id: string;
  name: string;
  github_url: string;
  last_scanned_at: string | null;
}

export default function DepWatchProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'outdated' | 'vulnerable'>('all');

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load project details
    const projectsRes = await fetch('/api/depwatch/projects');
    if (projectsRes.ok) {
      const projects = await projectsRes.json();
      const proj = projects.find((p: Project) => p.id === projectId);
      setProject(proj || null);
    }

    // Load dependencies
    const depsRes = await fetch(`/api/depwatch/dependencies?project_id=${projectId}`);
    if (depsRes.ok) {
      const data = await depsRes.json();
      setDependencies(data);
    }
    
    setIsLoading(false);
  };

  const rescan = async () => {
    setIsScanning(true);
    await fetch('/api/depwatch/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    });
    await loadData();
    setIsScanning(false);
  };

  const filteredDeps = dependencies.filter(dep => {
    if (filter === 'outdated') return dep.is_outdated;
    if (filter === 'vulnerable') return dep.vulnerability_severity;
    return true;
  });

  const stats = {
    total: dependencies.length,
    outdated: dependencies.filter(d => d.is_outdated).length,
    vulnerable: dependencies.filter(d => d.vulnerability_severity).length,
    upToDate: dependencies.filter(d => !d.is_outdated && !d.vulnerability_severity).length,
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">Project not found</p>
        <Link href="/dashboard/depwatch" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
          ← Back to DepWatch
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/depwatch" className="text-sm text-zinc-500 hover:text-zinc-300 mb-4 inline-block">
          ← Back to DepWatch
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{project.name}</h1>
            <a 
              href={project.github_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 hover:text-purple-400"
            >
              {project.github_url} ↗
            </a>
          </div>
          <button
            onClick={rescan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : '🔄 Rescan'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <p className="text-zinc-500 text-xs mb-1">Total Dependencies</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-emerald-500 border-t border-r border-b border-zinc-800">
          <p className="text-zinc-500 text-xs mb-1">Up to Date</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.upToDate}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-yellow-500 border-t border-r border-b border-zinc-800">
          <p className="text-zinc-500 text-xs mb-1">Outdated</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.outdated}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-red-500 border-t border-r border-b border-zinc-800">
          <p className="text-zinc-500 text-xs mb-1">Vulnerabilities</p>
          <p className="text-2xl font-bold text-red-400">{stats.vulnerable}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('outdated')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'outdated' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Outdated ({stats.outdated})
        </button>
        <button
          onClick={() => setFilter('vulnerable')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'vulnerable' 
              ? 'bg-red-600 text-white' 
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Vulnerable ({stats.vulnerable})
        </button>
      </div>

      {/* Dependencies List */}
      {filteredDeps.length > 0 ? (
        <div className="space-y-2">
          {filteredDeps.map((dep) => (
            <div
              key={dep.id}
              className={`p-4 rounded-xl bg-zinc-900/80 border transition-colors ${
                dep.vulnerability_severity 
                  ? 'border-red-500/30 hover:border-red-500/50' 
                  : dep.is_outdated 
                  ? 'border-yellow-500/30 hover:border-yellow-500/50' 
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <a 
                    href={`https://www.npmjs.com/package/${dep.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-white hover:text-purple-400"
                  >
                    {dep.name}
                  </a>
                  {dep.is_dev_dependency && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400">dev</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono text-sm text-zinc-400">{dep.current_version}</span>
                    {dep.is_outdated && (
                      <>
                        <span className="text-zinc-600 mx-2">→</span>
                        <span className="font-mono text-sm text-emerald-400">{dep.latest_version}</span>
                      </>
                    )}
                  </div>
                  
                  {dep.vulnerability_severity && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dep.vulnerability_severity === 'high' 
                        ? 'bg-red-500/20 text-red-400' 
                        : dep.vulnerability_severity === 'medium'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {dep.vulnerability_severity}
                    </span>
                  )}
                  
                  {!dep.vulnerability_severity && dep.is_outdated && (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                      outdated
                    </span>
                  )}
                  
                  {!dep.vulnerability_severity && !dep.is_outdated && (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                      ✓ current
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-zinc-400">No dependencies found with this filter.</p>
        </div>
      )}

      {project.last_scanned_at && (
        <p className="text-center text-xs text-zinc-600 mt-6">
          Last scanned {new Date(project.last_scanned_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}
