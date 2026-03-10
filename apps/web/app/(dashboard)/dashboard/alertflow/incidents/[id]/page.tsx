'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface TimelineEvent {
  id: string;
  event_type: string;
  actor: string;
  content: string;
  created_at: string;
}

interface Incident {
  id: string;
  incident_number: number;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'triggered' | 'acknowledged' | 'resolved';
  source: string;
  source_url: string | null;
  assigned_to: string | null;
  acknowledged_by: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  time_to_ack_seconds: number | null;
  time_to_resolve_seconds: number | null;
  timeline: TimelineEvent[];
}

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  const loadIncident = async () => {
    try {
      const res = await fetch(`/api/alertflow/incidents?include_timeline=true`);
      const data = await res.json();
      const found = data.incidents?.find((i: Incident) => i.id === incidentId);
      if (found) {
        setIncident(found);
      } else {
        router.push('/dashboard/alertflow/incidents');
      }
    } catch (error) {
      console.error('Failed to load incident:', error);
    }
    setIsLoading(false);
  };

  const acknowledgeIncident = async () => {
    try {
      await fetch('/api/alertflow/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: incidentId, action: 'acknowledge' }),
      });
      loadIncident();
    } catch (error) {
      console.error('Failed to acknowledge:', error);
    }
  };

  const resolveIncident = async () => {
    try {
      await fetch('/api/alertflow/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: incidentId, 
          action: 'resolve',
          resolution_notes: resolutionNotes || null,
        }),
      });
      setShowResolveModal(false);
      setResolutionNotes('');
      loadIncident();
    } catch (error) {
      console.error('Failed to resolve:', error);
    }
  };

  const reopenIncident = async () => {
    try {
      await fetch('/api/alertflow/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: incidentId, action: 'reopen' }),
      });
      loadIncident();
    } catch (error) {
      console.error('Failed to reopen:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setIsSavingNote(true);
    
    try {
      await fetch('/api/alertflow/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: incidentId, action: 'note', note: newNote }),
      });
      setNewNote('');
      loadIncident();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
    setIsSavingNote(false);
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
      case 'triggered': return 'bg-red-500 text-white';
      case 'acknowledged': return 'bg-yellow-500 text-black';
      case 'resolved': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTimelineIcon = (eventType: string) => {
    switch (eventType) {
      case 'triggered':
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        );
      case 'acknowledged':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        );
      case 'resolved':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        );
      case 'note':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
          </div>
        );
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds} seconds`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} minutes`;
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

  if (!incident) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/alertflow/incidents" className="text-[#6b6b80] hover:text-white text-sm mb-2 inline-flex items-center gap-1">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Incidents
        </Link>
        
        <div className="flex items-start justify-between mt-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusBadge(incident.status)}`}>
                {incident.status.toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                {incident.severity}
              </span>
              <span className="text-[#6b6b80] text-sm">#{incident.incident_number}</span>
            </div>
            <h1 className="text-3xl font-bold text-white">{incident.title}</h1>
            {incident.description && (
              <p className="text-[#a1a1b5] mt-2">{incident.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            {incident.status === 'triggered' && (
              <button
                onClick={acknowledgeIncident}
                className="px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-500 font-medium hover:bg-yellow-500/20 transition-colors"
              >
                Acknowledge
              </button>
            )}
            {incident.status !== 'resolved' && (
              <button
                onClick={() => setShowResolveModal(true)}
                className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 font-medium hover:bg-green-500/20 transition-colors"
              >
                Resolve
              </button>
            )}
            {incident.status === 'resolved' && (
              <button
                onClick={reopenIncident}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors"
              >
                Reopen
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
            <h2 className="text-lg font-bold text-white mb-6">Timeline</h2>
            
            <div className="space-y-4">
              {(incident.timeline || []).map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  {getTimelineIcon(event.event_type)}
                  <div className="flex-1 pb-4 border-b border-[#1e1e2e] last:border-0">
                    <p className="text-white">{event.content}</p>
                    <p className="text-xs text-[#6b6b80] mt-1">
                      {event.actor} · {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Note */}
            {incident.status !== 'resolved' && (
              <div className="mt-6 pt-6 border-t border-[#1e1e2e]">
                <div className="flex gap-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    rows={2}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none resize-none"
                  />
                  <button
                    onClick={addNote}
                    disabled={isSavingNote || !newNote.trim()}
                    className="px-4 py-2 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#5558e3] transition-colors disabled:opacity-50 self-end"
                  >
                    {isSavingNote ? '...' : 'Add'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="space-y-6">
          {/* Metrics */}
          <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
            <h2 className="text-lg font-bold text-white mb-4">Metrics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#6b6b80]">Time to Acknowledge</p>
                <p className="text-xl font-bold text-white">{formatDuration(incident.time_to_ack_seconds)}</p>
              </div>
              <div>
                <p className="text-sm text-[#6b6b80]">Time to Resolve</p>
                <p className="text-xl font-bold text-white">{formatDuration(incident.time_to_resolve_seconds)}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
            <h2 className="text-lg font-bold text-white mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[#6b6b80]">Created</p>
                <p className="text-white">{new Date(incident.created_at).toLocaleString()}</p>
              </div>
              {incident.acknowledged_at && (
                <div>
                  <p className="text-[#6b6b80]">Acknowledged</p>
                  <p className="text-white">{new Date(incident.acknowledged_at).toLocaleString()}</p>
                  <p className="text-[#6b6b80] text-xs">by {incident.acknowledged_by}</p>
                </div>
              )}
              {incident.resolved_at && (
                <div>
                  <p className="text-[#6b6b80]">Resolved</p>
                  <p className="text-white">{new Date(incident.resolved_at).toLocaleString()}</p>
                  <p className="text-[#6b6b80] text-xs">by {incident.resolved_by}</p>
                </div>
              )}
              {incident.assigned_to && (
                <div>
                  <p className="text-[#6b6b80]">Assigned To</p>
                  <p className="text-white">{incident.assigned_to}</p>
                </div>
              )}
              {incident.source && (
                <div>
                  <p className="text-[#6b6b80]">Source</p>
                  <p className="text-white capitalize">{incident.source}</p>
                </div>
              )}
              {incident.resolution_notes && (
                <div>
                  <p className="text-[#6b6b80]">Resolution Notes</p>
                  <p className="text-white">{incident.resolution_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12121a] border border-[#27272a] rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Resolve Incident</h2>
            
            <div>
              <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Resolution Notes (optional)</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="What was the fix?"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-[#27272a] text-[#a1a1b5] font-medium hover:bg-[#1a1a25] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resolveIncident}
                className="flex-1 px-4 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
