'use client';

import { useState, useEffect } from 'react';

interface Endpoint {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  forward_url: string | null;
  request_count: number;
  last_request_at: string | null;
  created_at: string;
}

interface WebhookRequest {
  id: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body: string | null;
  body_json: unknown;
  source_ip: string;
  received_at: string;
}

export default function WebhookLabPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [requests, setRequests] = useState<WebhookRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WebhookRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({ name: '', description: '', forward_url: '' });

  useEffect(() => {
    fetchEndpoints();
  }, []);

  useEffect(() => {
    if (selectedEndpoint) {
      fetchRequests(selectedEndpoint.id);
    }
  }, [selectedEndpoint]);

  const fetchEndpoints = async () => {
    try {
      const res = await fetch('/api/webhooks/endpoints');
      const data = await res.json();
      setEndpoints(data.endpoints || []);
      if (data.endpoints?.length > 0 && !selectedEndpoint) {
        setSelectedEndpoint(data.endpoints[0]);
      }
    } catch (error) {
      console.error('Failed to fetch endpoints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async (endpointId: string) => {
    try {
      const res = await fetch(`/api/webhooks/endpoints/${endpointId}`);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const createEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/webhooks/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEndpoint),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewEndpoint({ name: '', description: '', forward_url: '' });
        fetchEndpoints();
      }
    } catch (error) {
      console.error('Failed to create endpoint:', error);
    } finally {
      setCreating(false);
    }
  };

  const deleteEndpoint = async (id: string) => {
    if (!confirm('Delete this endpoint? All captured requests will be lost.')) return;
    try {
      await fetch(`/api/webhooks/endpoints/${id}`, { method: 'DELETE' });
      setSelectedEndpoint(null);
      fetchEndpoints();
    } catch (error) {
      console.error('Failed to delete endpoint:', error);
    }
  };

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/hook/${slug}`;
    navigator.clipboard.writeText(url);
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-green-500/20 text-green-500',
      POST: 'bg-blue-500/20 text-blue-500',
      PUT: 'bg-yellow-500/20 text-yellow-500',
      PATCH: 'bg-orange-500/20 text-orange-500',
      DELETE: 'bg-red-500/20 text-red-500',
    };
    return colors[method] || 'bg-[#27272a] text-[#a1a1aa]';
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
          <h1 className="text-2xl font-bold mb-1">WebhookLab</h1>
          <p className="text-[#71717a]">Inspect, debug, and replay webhooks</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg font-medium transition-colors"
        >
          Create Endpoint
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12121a] rounded-2xl p-6 w-full max-w-md border border-[#27272a]">
            <h2 className="text-xl font-bold mb-4">Create Webhook Endpoint</h2>
            <form onSubmit={createEndpoint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newEndpoint.name}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                  placeholder="Stripe Webhooks"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Forward URL (optional)</label>
                <input
                  type="url"
                  value={newEndpoint.forward_url}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, forward_url: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                  placeholder="http://localhost:3000/webhooks"
                />
                <p className="text-xs text-[#71717a] mt-1">Forward captured webhooks to this URL</p>
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

      {endpoints.length === 0 ? (
        <div className="text-center py-20 bg-[#12121a] rounded-2xl border border-[#27272a]">
          <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#6366f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No webhook endpoints yet</h3>
          <p className="text-[#71717a] mb-6">Create an endpoint to start capturing webhooks</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg font-medium transition-colors"
          >
            Create Your First Endpoint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Endpoints Sidebar */}
          <div className="col-span-3 space-y-2">
            {endpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => setSelectedEndpoint(endpoint)}
                className={`w-full text-left p-4 rounded-xl transition-colors ${
                  selectedEndpoint?.id === endpoint.id
                    ? 'bg-[#6366f1]/10 border border-[#6366f1]/30'
                    : 'bg-[#12121a] border border-[#27272a] hover:border-[#3f3f50]'
                }`}
              >
                <h3 className="font-medium truncate">{endpoint.name}</h3>
                <p className="text-sm text-[#71717a]">{endpoint.request_count} requests</p>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {selectedEndpoint && (
              <>
                {/* Endpoint Header */}
                <div className="bg-[#12121a] rounded-2xl border border-[#27272a] p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{selectedEndpoint.name}</h2>
                    <button
                      onClick={() => deleteEndpoint(selectedEndpoint.id)}
                      className="text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="bg-[#0a0a0f] rounded-lg p-3 flex items-center justify-between">
                    <code className="text-sm text-[#a1a1aa] font-mono">
                      {window.location.origin}/hook/{selectedEndpoint.slug}
                    </code>
                    <button
                      onClick={() => copyUrl(selectedEndpoint.slug)}
                      className="text-[#6366f1] hover:text-[#8b5cf6] text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Requests List */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#12121a] rounded-2xl border border-[#27272a]">
                    <div className="p-4 border-b border-[#27272a]">
                      <h3 className="font-semibold">Requests</h3>
                    </div>
                    
                    {requests.length === 0 ? (
                      <div className="p-8 text-center text-[#71717a]">
                        No requests yet. Send a webhook to your endpoint URL.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#27272a] max-h-[500px] overflow-y-auto">
                        {requests.map((req) => (
                          <button
                            key={req.id}
                            onClick={() => setSelectedRequest(req)}
                            className={`w-full text-left p-4 hover:bg-[#1a1a25] transition-colors ${
                              selectedRequest?.id === req.id ? 'bg-[#1a1a25]' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 text-xs rounded font-medium ${getMethodColor(req.method)}`}>
                                {req.method}
                              </span>
                              <span className="text-xs text-[#71717a]">{formatTime(req.received_at)}</span>
                            </div>
                            <p className="text-sm text-[#a1a1aa] truncate">{req.source_ip}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Request Details */}
                  <div className="bg-[#12121a] rounded-2xl border border-[#27272a]">
                    <div className="p-4 border-b border-[#27272a]">
                      <h3 className="font-semibold">Request Details</h3>
                    </div>
                    
                    {!selectedRequest ? (
                      <div className="p-8 text-center text-[#71717a]">
                        Select a request to view details
                      </div>
                    ) : (
                      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                        <div>
                          <p className="text-xs text-[#71717a] mb-1">Method</p>
                          <span className={`px-2 py-0.5 text-xs rounded font-medium ${getMethodColor(selectedRequest.method)}`}>
                            {selectedRequest.method}
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-xs text-[#71717a] mb-1">Headers</p>
                          <pre className="text-xs bg-[#0a0a0f] rounded p-3 overflow-x-auto">
                            {JSON.stringify(selectedRequest.headers, null, 2)}
                          </pre>
                        </div>
                        
                        {selectedRequest.body && (
                          <div>
                            <p className="text-xs text-[#71717a] mb-1">Body</p>
                            <pre className="text-xs bg-[#0a0a0f] rounded p-3 overflow-x-auto">
                              {selectedRequest.body_json 
                                ? JSON.stringify(selectedRequest.body_json, null, 2)
                                : selectedRequest.body}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
