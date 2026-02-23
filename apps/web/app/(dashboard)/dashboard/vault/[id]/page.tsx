'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Secret {
  id: string;
  key: string;
  value?: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
  environment: string;
}

export default function VaultProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load project details
    const projectsRes = await fetch('/api/vault/projects');
    if (projectsRes.ok) {
      const projects = await projectsRes.json();
      const proj = projects.find((p: Project) => p.id === projectId);
      setProject(proj || null);
    }

    // Load secrets (keys only, not decrypted)
    const secretsRes = await fetch(`/api/vault/secrets?project_id=${projectId}`);
    if (secretsRes.ok) {
      const data = await secretsRes.json();
      setSecrets(data);
    }
    
    setIsLoading(false);
  };

  const addSecret = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    setIsAdding(true);

    const res = await fetch('/api/vault/secrets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, key: newKey, value: newValue }),
    });

    if (res.ok) {
      setNewKey('');
      setNewValue('');
      setShowAddModal(false);
      loadData();
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to add secret');
    }
    setIsAdding(false);
  };

  const deleteSecret = async (secretId: string) => {
    if (!confirm('Are you sure you want to delete this secret?')) return;

    const res = await fetch(`/api/vault/secrets?id=${secretId}`, { method: 'DELETE' });
    if (res.ok) {
      loadData();
    }
  };

  const revealSecret = async (secretId: string) => {
    if (revealedSecrets.has(secretId)) {
      // Hide it
      const newRevealed = new Set(revealedSecrets);
      newRevealed.delete(secretId);
      setRevealedSecrets(newRevealed);
      return;
    }

    // Fetch decrypted value
    const res = await fetch(`/api/vault/secrets?project_id=${projectId}&decrypt=true`);
    if (res.ok) {
      const data = await res.json();
      const values: Record<string, string> = {};
      data.forEach((s: { id: string; value: string }) => {
        values[s.id] = s.value;
      });
      setDecryptedValues(values);
      setRevealedSecrets(new Set([...revealedSecrets, secretId]));
    }
  };

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
    // Could add a toast here
  };

  const exportAsEnv = async () => {
    const res = await fetch(`/api/vault/secrets?project_id=${projectId}&decrypt=true`);
    if (res.ok) {
      const data = await res.json();
      const envContent = data.map((s: { key: string; value: string }) => `${s.key}=${s.value}`).join('\n');
      const blob = new Blob([envContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `.env.${project?.environment || 'production'}`;
      a.click();
      URL.revokeObjectURL(url);
    }
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
        <Link href="/dashboard/vault" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
          ← Back to VaultKit
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/vault" className="text-sm text-zinc-500 hover:text-zinc-300 mb-4 inline-block">
          ← Back to VaultKit
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
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
            <p className="text-zinc-400">{secrets.length} secrets</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportAsEnv}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors text-sm"
            >
              Export .env
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              + Add Secret
            </button>
          </div>
        </div>
      </div>

      {/* Secrets List */}
      {secrets.length > 0 ? (
        <div className="space-y-3">
          {secrets.map((secret) => (
            <div
              key={secret.id}
              className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-purple-400 mb-1">{secret.key}</p>
                  <p className="font-mono text-sm text-zinc-300">
                    {revealedSecrets.has(secret.id) 
                      ? decryptedValues[secret.id] || '••••••••'
                      : '••••••••••••••••'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => revealSecret(secret.id)}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title={revealedSecrets.has(secret.id) ? 'Hide' : 'Reveal'}
                  >
                    {revealedSecrets.has(secret.id) ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  {revealedSecrets.has(secret.id) && (
                    <button
                      onClick={() => copyToClipboard(decryptedValues[secret.id] || '')}
                      className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title="Copy"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => deleteSecret(secret.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No secrets yet</h3>
          <p className="text-zinc-400 mb-4">Add your first secret to this vault project.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            + Add Secret
          </button>
        </div>
      )}

      {/* Add Secret Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add Secret</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Key</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                  placeholder="DATABASE_URL"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-mono placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Value</label>
                <textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="postgres://..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-mono placeholder-zinc-500 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addSecret}
                disabled={isAdding || !newKey.trim() || !newValue.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isAdding ? 'Adding...' : 'Add Secret'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
