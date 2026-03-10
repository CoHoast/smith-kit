'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Incident {
  id: string;
  incident_number: number;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'triggered' | 'acknowledged' | 'resolved';
  source: string;
  assigned_to: string | null;
  created_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
}

interface Schedule {
  id: string;
  name: string;
  current_oncall: { name: string; email: string } | null;
  is_override: boolean;
  member_count: number;
}

interface Stats {
  total_incidents: number;
  active_incidents: number;
  avg_time_to_ack_minutes: number | null;
  avg_time_to_resolve_minutes: number | null;
  incidents_by_severity: { critical: number; warning: number; info: number };
}

export default function AlertFlowPage() {
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [recentResolved, setRecentResolved] = useState<Incident[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [counts, setCounts] = useState({ triggered: 0, acknowledged: 0, total_active: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: '', description: '', severity: 'warning' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/alertflow/summary');
      const data = await res.json();
      
      setActiveIncidents(data.active_incidents || []);
      setRecentResolved(data.recent_resolved || []);
      setSchedules(data.schedules || []);
      setStats(data.stats);
      setCounts(data.counts || { triggered: 0, acknowledged: 0, total_active: 0 });
    } catch (error) {
      console.error('Failed to load AlertFlow data:', error);
    }
    setIsLoading(false);
  };

  const acknowledgeIncident = async (id: string) => {
    try {
      await fetch('/api/alertflow/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'acknowledge' }),
      });
      loadData();
    } catch (error) {
      console.error('Failed to acknowledge:', error);
    }
  };

  const resolveIncident = async (id: string) => {
    try {
      await fetch('/api/alertflow/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'resolve' }),
      });
      loadData();
    } catch (error) {
      console.error('Failed to resolve:', error);
    }
  };

  const createIncident = async () => {
    if (!newIncident.title) return;
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/alertflow/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident),
      });
      
      if (res.ok) {
        setShowCreateModal(false);
        setNewIncident({ title: '', description: '', severity: 'warning' });
        loadData();
      }
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
    setIsSaving(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'triggered': return 'text-red-500';
      case 'acknowledged': return 'text-yellow-500';
      case 'resolved': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const formatDuration = (start: string, end?: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours < 24) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
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
          <h1 className="text-3xl font-bold text-white mb-2">AlertFlow</h1>
          <p className="text-[#a1a1b5]">Incident management and on-call scheduling</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/alertflow/schedules"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#27272a] text-[#a1a1b5] font-medium text-sm hover:bg-[#1a1a25] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Schedules
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Incident
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <p className="text-[#6b6b80] text-sm mb-1">Active Incidents</p>
          <p className={`text-3xl font-bold ${counts.total_active > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {counts.total_active}
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <p className="text-[#6b6b80] text-sm mb-1">Triggered</p>
          <p className={`text-3xl font-bold ${counts.triggered > 0 ? 'text-red-500' : 'text-white'}`}>
            {counts.triggered}
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <p className="text-[#6b6b80] text-sm mb-1">Avg Time to Ack</p>
          <p className="text-3xl font-bold text-white">
            {stats?.avg_time_to_ack_minutes ? `${stats.avg_time_to_ack_minutes}m` : '—'}
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <p className="text-[#6b6b80] text-sm mb-1">Avg Time to Resolve</p>
          <p className="text-3xl font-bold text-white">
            {stats?.avg_time_to_resolve_minutes ? `${stats.avg_time_to_resolve_minutes}m` : '—'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Incidents */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Active Incidents</h2>
              <Link href="/dashboard/alertflow/incidents" className="text-sm text-[#6366f1] hover:underline">
                View all
              </Link>
            </div>

            {activeIncidents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="text-[#6b6b80]">All clear! No active incidents.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] hover:border-[#2e2e3e] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                            {incident.severity.toUpperCase()}
                          </span>
                          <span className={`text-xs ${getStatusColor(incident.status)}`}>
                            {incident.status}
                          </span>
                          <span className="text-xs text-[#6b6b80]">
                            #{incident.incident_number}
                          </span>
                        </div>
                        <Link href={`/dashboard/alertflow/incidents/${incident.id}`} className="hover:underline">
                          <h3 className="font-medium text-white">{incident.title}</h3>
                        </Link>
                        <p className="text-sm text-[#6b6b80] mt-1">
                          {formatDuration(incident.created_at)} ago
                          {incident.assigned_to && ` · Assigned to ${incident.assigned_to}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {incident.status === 'triggered' && (
                          <button
                            onClick={() => acknowledgeIncident(incident.id)}
                            className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 text-sm font-medium hover:bg-yellow-500/20 transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => resolveIncident(incident.id)}
                          className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium hover:bg-green-500/20 transition-colors"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* On-Call Now */}
          <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">On-Call Now</h2>
              <Link href="/dashboard/alertflow/schedules" className="text-sm text-[#6366f1] hover:underline">
                Manage
              </Link>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[#6b6b80] text-sm mb-3">No schedules configured</p>
                <Link
                  href="/dashboard/alertflow/schedules"
                  className="text-sm text-[#6366f1] hover:underline"
                >
                  Create a schedule
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="p-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                    <p className="text-sm text-[#6b6b80] mb-1">{schedule.name}</p>
                    {schedule.current_oncall ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-xs font-semibold">
                          {schedule.current_oncall.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{schedule.current_oncall.name}</p>
                          <p className="text-xs text-[#6b6b80]">{schedule.current_oncall.email}</p>
                        </div>
                        {schedule.is_override && (
                          <span className="ml-auto px-2 py-0.5 rounded text-xs bg-yellow-500/10 text-yellow-500">
                            Override
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6b6b80]">No members</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Resolved */}
          <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
            <h2 className="text-lg font-bold text-white mb-4">Recently Resolved</h2>
            
            {recentResolved.length === 0 ? (
              <p className="text-[#6b6b80] text-sm text-center py-4">No recent incidents</p>
            ) : (
              <div className="space-y-2">
                {recentResolved.slice(0, 5).map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/dashboard/alertflow/incidents/${incident.id}`}
                    className="block p-3 rounded-xl bg-[#0a0a0f] hover:bg-[#1a1a25] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white truncate">{incident.title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[#6b6b80] mt-1">
                      Resolved {formatDuration(incident.resolved_at || incident.created_at)} ago
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12121a] border border-[#27272a] rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Create Incident</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Title</label>
                <input
                  type="text"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  placeholder="Production API is down"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Description</label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="Describe the incident..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Severity</label>
                <div className="flex gap-2">
                  {['critical', 'warning', 'info'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setNewIncident({ ...newIncident, severity: sev })}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        newIncident.severity === sev
                          ? getSeverityColor(sev)
                          : 'border-[#27272a] text-[#6b6b80] hover:border-[#3e3e4e]'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-[#27272a] text-[#a1a1b5] font-medium hover:bg-[#1a1a25] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createIncident}
                disabled={isSaving || !newIncident.title}
                className="flex-1 px-4 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#5558e3] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
