'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StatusPage {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  primary_color: string;
  created_at: string;
  status_page_monitors: {
    monitor: {
      id: string;
      name: string;
      current_status: string;
    };
  }[];
}

export default function StatusKitPage() {
  const [pages, setPages] = useState<StatusPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPage, setNewPage] = useState({ name: '', slug: '', description: '' });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/statuskit/pages');
      const data = await res.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error('Failed to fetch status pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/statuskit/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewPage({ name: '', slug: '', description: '' });
        fetchPages();
      }
    } catch (error) {
      console.error('Failed to create page:', error);
    } finally {
      setCreating(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Delete this status page?')) return;
    try {
      await fetch(`/api/statuskit/pages/${id}`, { method: 'DELETE' });
      fetchPages();
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const getOverallStatus = (page: StatusPage) => {
    const monitors = page.status_page_monitors || [];
    if (monitors.length === 0) return 'unknown';
    const anyDown = monitors.some(m => m.monitor?.current_status === 'down');
    const allUp = monitors.every(m => m.monitor?.current_status === 'up');
    return anyDown ? 'down' : allUp ? 'up' : 'degraded';
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
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">StatusKit</h1>
          <p className="text-[#71717a]">Public status pages & incident management</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg font-medium transition-colors"
        >
          Create Status Page
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12121a] rounded-2xl p-6 w-full max-w-md border border-[#27272a]">
            <h2 className="text-xl font-bold mb-4">Create Status Page</h2>
            <form onSubmit={createPage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newPage.name}
                  onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                  placeholder="My App Status"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-[#71717a]">status.smithkit.ai/</span>
                  <input
                    type="text"
                    value={newPage.slug}
                    onChange={(e) => setNewPage({ ...newPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                    placeholder="my-app"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  value={newPage.description}
                  onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none resize-none"
                  rows={2}
                  placeholder="Current system status"
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

      {/* Status Pages List */}
      {pages.length === 0 ? (
        <div className="text-center py-20 bg-[#12121a] rounded-2xl border border-[#27272a]">
          <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#6366f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No status pages yet</h3>
          <p className="text-[#71717a] mb-6">Create a public status page to share your uptime with users</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg font-medium transition-colors"
          >
            Create Your First Status Page
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => {
            const status = getOverallStatus(page);
            return (
              <div
                key={page.id}
                className="p-6 bg-[#12121a] rounded-2xl border border-[#27272a] hover:border-[#3f3f50] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'up' ? 'bg-green-500' :
                      status === 'down' ? 'bg-red-500' :
                      status === 'degraded' ? 'bg-yellow-500' :
                      'bg-[#71717a]'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-lg">{page.name}</h3>
                      <p className="text-[#71717a] text-sm">
                        status.smithkit.ai/{page.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/s/${page.slug}`}
                      target="_blank"
                      className="px-3 py-1.5 text-sm border border-[#27272a] rounded-lg hover:bg-[#1a1a25] transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/statuskit/${page.id}`}
                      className="px-3 py-1.5 text-sm bg-[#1e1e2e] rounded-lg hover:bg-[#27272a] transition-colors"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => deletePage(page.id)}
                      className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {page.description && (
                  <p className="text-[#a1a1aa] mt-3 ml-7">{page.description}</p>
                )}

                <div className="flex items-center gap-4 mt-4 ml-7">
                  <span className="text-sm text-[#71717a]">
                    {page.status_page_monitors?.length || 0} monitors
                  </span>
                  <span className={`text-sm px-2 py-0.5 rounded ${
                    page.is_public ? 'bg-green-500/10 text-green-500' : 'bg-[#27272a] text-[#71717a]'
                  }`}>
                    {page.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Incidents Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recent Incidents</h2>
          <Link
            href="/dashboard/statuskit/incidents"
            className="text-[#6366f1] hover:underline text-sm"
          >
            View all →
          </Link>
        </div>
        <div className="text-center py-12 bg-[#12121a] rounded-2xl border border-[#27272a]">
          <p className="text-[#71717a]">No incidents reported</p>
        </div>
      </div>
    </div>
  );
}
