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
  acknowledged_by: string | null;
  resolved_by: string | null;
  created_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  time_to_ack_seconds: number | null;
  time_to_resolve_seconds: number | null;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  useEffect(() => {
    loadIncidents();
  }, [statusFilter, severityFilter]);

  const loadIncidents = async () => {
    try {
      let url = '/api/alertflow/incidents?limit=100';
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (severityFilter !== 'all') url += `&severity=${severityFilter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setIncidents(data.incidents || []);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    }
    setIsLoading(false);
  };

  const acknowledgeIncident = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch('/api/alertflow/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'acknowledge' }),
      });
      loadIncidents();
    } catch (error) {
      console.error('Failed to acknowledge:', error);
    }
  };

  const resolveIncident = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch('/api/alertflow/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'resolve' }),
      });
      loadIncidents();
    } catch (error) {
      console.error('Failed to resolve:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'triggered': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'acknowledged': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/10 text-green-500 border-green-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
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
          <Link href="/dashboard/alertflow" className="text-[#6b6b80] hover:text-white text-sm mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to AlertFlow
          </Link>
          <h1 className="text-3xl font-bold text-white">All Incidents</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6b6b80]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#12121a] border border-[#27272a] text-white text-sm focus:border-[#6366f1] focus:outline-none"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="triggered">Triggered</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6b6b80]">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#12121a] border border-[#27272a] text-white text-sm focus:border-[#6366f1] focus:outline-none"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-2xl bg-[#12121a] border border-[#1e1e2e] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b80]">#</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b80]">Incident</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b80]">Severity</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b80]">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b80]">Created</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b80]">TTR</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-[#6b6b80]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#6b6b80]">
                  No incidents found
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident.id} className="border-b border-[#1e1e2e] hover:bg-[#0a0a0f]">
                  <td className="px-6 py-4 text-sm text-[#6b6b80]">
                    {incident.incident_number}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/alertflow/incidents/${incident.id}`} className="hover:underline">
                      <p className="text-sm font-medium text-white">{incident.title}</p>
                    </Link>
                    {incident.source && (
                      <p className="text-xs text-[#6b6b80]">Source: {incident.source}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(incident.status)}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#a1a1b5]">
                    {new Date(incident.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#a1a1b5]">
                    {formatDuration(incident.time_to_resolve_seconds)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {incident.status === 'triggered' && (
                        <button
                          onClick={(e) => acknowledgeIncident(incident.id, e)}
                          className="px-2 py-1 rounded text-xs bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                        >
                          Ack
                        </button>
                      )}
                      {incident.status !== 'resolved' && (
                        <button
                          onClick={(e) => resolveIncident(incident.id, e)}
                          className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        >
                          Resolve
                        </button>
                      )}
                      <Link
                        href={`/dashboard/alertflow/incidents/${incident.id}`}
                        className="px-2 py-1 rounded text-xs bg-[#1a1a25] text-[#a1a1b5] hover:text-white"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
