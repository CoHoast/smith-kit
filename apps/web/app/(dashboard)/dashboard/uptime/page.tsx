'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

interface Monitor {
  id: string;
  name: string;
  url: string;
  current_status: 'up' | 'down' | 'degraded' | 'unknown';
  last_checked_at: string | null;
  interval_seconds: number;
  is_active: boolean;
  response_time_ms?: number;
  uptime_percentage?: number;
  checks_up?: number;
  checks_total?: number;
}

export default function UptimePage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMonitor, setNewMonitor] = useState({ name: '', url: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const supabase = createClient();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    loadMonitors();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMonitors, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitors = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get username for status page
    const { data: profile } = await supabase
      .from('profiles')
      .select('github_username')
      .eq('id', user.id)
      .single();
    
    if (profile?.github_username) {
      setUsername(profile.github_username);
    }

    const { data: monitorsData } = await supabase
      .from('uptime_monitors')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Fetch uptime stats for each monitor
    if (monitorsData) {
      const monitorsWithStats = await Promise.all(
        monitorsData.map(async (monitor) => {
          // Get checks from last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: checks } = await supabase
            .from('uptime_checks')
            .select('status, response_time_ms')
            .eq('monitor_id', monitor.id)
            .gte('checked_at', thirtyDaysAgo.toISOString())
            .order('checked_at', { ascending: false });
          
          const checksUp = checks?.filter(c => c.status === 'up').length || 0;
          const checksTotal = checks?.length || 0;
          const uptimePercentage = checksTotal > 0 ? (checksUp / checksTotal) * 100 : 100;
          
          // Get latest response time
          const latestCheck = checks?.find(c => c.response_time_ms);
          const avgResponseTime = checks?.length 
            ? Math.round(checks.filter(c => c.response_time_ms).reduce((sum, c) => sum + (c.response_time_ms || 0), 0) / checks.filter(c => c.response_time_ms).length)
            : null;
          
          return {
            ...monitor,
            response_time_ms: latestCheck?.response_time_ms || avgResponseTime,
            uptime_percentage: uptimePercentage,
            checks_up: checksUp,
            checks_total: checksTotal,
          };
        })
      );
      setMonitors(monitorsWithStats);
    } else {
      setMonitors([]);
    }
    setIsLoading(false);
  };

  const addMonitor = async () => {
    if (!newMonitor.name || !newMonitor.url) return;
    
    setIsSaving(true);

    try {
      const res = await fetch('/api/uptime/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMonitor.name,
          url: newMonitor.url,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewMonitor({ name: '', url: '' });
        // Wait a moment for the first check to complete
        setTimeout(() => loadMonitors(), 1000);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add monitor');
      }
    } catch (error) {
      console.error('Failed to add monitor:', error);
      alert('Failed to add monitor');
    }
    setIsSaving(false);
  };

  const deleteMonitor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this monitor?')) return;
    
    await supabase.from('uptime_monitors').delete().eq('id', id);
    loadMonitors();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'bg-green-500';
      case 'down': return 'bg-red-500';
      case 'degraded': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'up': return 'Operational';
      case 'down': return 'Down';
      case 'degraded': return 'Degraded';
      default: return 'Checking...';
    }
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
          <h1 className="text-3xl font-bold text-white mb-2">Uptime Monitoring</h1>
          <p className="text-[#a1a1b5]">Monitor your sites and APIs with beautiful status pages</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Monitor
        </button>
      </div>

      {monitors.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a25] flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#6b6b80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No monitors yet</h2>
          <p className="text-[#6b6b80] text-center max-w-md mb-6">
            Add a monitor to start tracking uptime for your websites and APIs.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-white font-medium transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Your First Monitor
          </button>
        </div>
      ) : (
        <>
        {/* Status Page & Badge Section */}
        {username && monitors.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Public Status Page */}
              <div>
                <p className="text-sm text-[#6b6b80] mb-2">Public Status Page</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0f] text-sm text-[#a1a1b5] truncate">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/status/{username}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/status/${username}`, 'status')}
                    className="px-3 py-2 rounded-lg bg-[#1a1a25] text-[#6b6b80] hover:text-white text-sm transition-colors"
                  >
                    {copied === 'status' ? '✓' : 'Copy'}
                  </button>
                  <a
                    href={`/status/${username}`}
                    target="_blank"
                    className="px-3 py-2 rounded-lg bg-[#6366f1] text-white text-sm hover:bg-[#5558e3] transition-colors"
                  >
                    View
                  </a>
                </div>
              </div>
              
              {/* Badge Embed */}
              <div>
                <p className="text-sm text-[#6b6b80] mb-2">Uptime Badge</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0f] text-sm text-[#a1a1b5] truncate">
                    ![Uptime]({typeof window !== 'undefined' ? window.location.origin : ''}/api/badge/{username})
                  </code>
                  <button
                    onClick={() => copyToClipboard(`![Uptime](${window.location.origin}/api/badge/${username})`, 'badge')}
                    className="px-3 py-2 rounded-lg bg-[#1a1a25] text-[#6b6b80] hover:text-white text-sm transition-colors"
                  >
                    {copied === 'badge' ? '✓' : 'Copy'}
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-[#6b6b80]">Preview:</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`/api/badge/${username}`} 
                    alt="Uptime badge" 
                    className="h-5"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monitors Grid */}
        <div className="space-y-4">
          {monitors.map((monitor) => (
            <div
              key={monitor.id}
              className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e] hover:border-[#2e2e3e] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Status indicator */}
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(monitor.current_status)}`} />
                  
                  <div>
                    <h3 className="font-bold text-white">{monitor.name}</h3>
                    <p className="text-sm text-[#6b6b80]">{monitor.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Uptime % */}
                  <div className="text-center px-3">
                    <p className="text-lg font-bold text-white">
                      {monitor.uptime_percentage?.toFixed(1) || '100.0'}%
                    </p>
                    <p className="text-xs text-[#6b6b80]">uptime</p>
                  </div>

                  {/* Response Time */}
                  {monitor.response_time_ms && (
                    <div className="text-center px-3 border-l border-[#1e1e2e]">
                      <p className="text-lg font-bold text-white">
                        {monitor.response_time_ms}ms
                      </p>
                      <p className="text-xs text-[#6b6b80]">response</p>
                    </div>
                  )}

                  {/* Status */}
                  <div className="text-right border-l border-[#1e1e2e] pl-4">
                    <p className={`font-medium ${
                      monitor.current_status === 'up' ? 'text-green-500' :
                      monitor.current_status === 'down' ? 'text-red-500' :
                      monitor.current_status === 'degraded' ? 'text-yellow-500' :
                      'text-gray-500'
                    }`}>
                      {getStatusText(monitor.current_status)}
                    </p>
                    <p className="text-xs text-[#6b6b80]">
                      {monitor.last_checked_at
                        ? `${new Date(monitor.last_checked_at).toLocaleTimeString()}`
                        : 'Checking...'}
                    </p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => deleteMonitor(monitor.id)}
                    className="p-2 text-[#6b6b80] hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Uptime bar */}
              <div className="mt-4 pt-4 border-t border-[#1e1e2e]">
                <div className="flex items-center justify-between text-xs text-[#6b6b80] mb-2">
                  <span>Last 30 days</span>
                  <span>{monitor.uptime_percentage?.toFixed(2) || '100.00'}% uptime</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-6 rounded-sm ${
                        monitor.current_status === 'up' ? 'bg-green-500/30 hover:bg-green-500/50' :
                        monitor.current_status === 'down' ? 'bg-red-500/30 hover:bg-red-500/50' :
                        'bg-yellow-500/30 hover:bg-yellow-500/50'
                      } transition-colors cursor-default`}
                      title={`Day ${30 - i}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {/* Add Monitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12121a] border border-[#27272a] rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Add Monitor</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Name</label>
                <input
                  type="text"
                  value={newMonitor.name}
                  onChange={(e) => setNewMonitor({ ...newMonitor, name: e.target.value })}
                  placeholder="My Website"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#a1a1b5] mb-2">URL</label>
                <input
                  type="url"
                  value={newMonitor.url}
                  onChange={(e) => setNewMonitor({ ...newMonitor, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-[#27272a] text-[#a1a1b5] font-medium hover:bg-[#1a1a25] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addMonitor}
                disabled={isSaving || !newMonitor.name || !newMonitor.url}
                className="flex-1 px-4 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#5558e3] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Adding...' : 'Add Monitor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
