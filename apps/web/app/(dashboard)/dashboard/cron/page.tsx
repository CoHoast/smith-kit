'use client';

import { useState, useEffect } from 'react';

interface CronJob {
  id: string;
  name: string;
  description: string | null;
  url: string;
  method: string;
  schedule: string;
  timezone: string;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  success_count: number;
  failure_count: number;
  recent_executions: {
    id: string;
    status: string;
    started_at: string;
    duration_ms: number;
  }[];
}

export default function CronPilotPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newJob, setNewJob] = useState({
    name: '',
    url: '',
    method: 'GET',
    schedule: '* * * * *',
    description: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/cron/jobs');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/cron/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewJob({ name: '', url: '', method: 'GET', schedule: '* * * * *', description: '' });
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    } finally {
      setCreating(false);
    }
  };

  const toggleJob = async (job: CronJob) => {
    try {
      await fetch(`/api/cron/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !job.is_active }),
      });
      fetchJobs();
    } catch (error) {
      console.error('Failed to toggle job:', error);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job?')) return;
    try {
      await fetch(`/api/cron/jobs/${id}`, { method: 'DELETE' });
      fetchJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const formatSchedule = (schedule: string) => {
    // Common cron patterns
    const patterns: Record<string, string> = {
      '* * * * *': 'Every minute',
      '*/5 * * * *': 'Every 5 minutes',
      '*/15 * * * *': 'Every 15 minutes',
      '*/30 * * * *': 'Every 30 minutes',
      '0 * * * *': 'Every hour',
      '0 */2 * * *': 'Every 2 hours',
      '0 0 * * *': 'Daily at midnight',
      '0 0 * * 0': 'Weekly on Sunday',
      '0 0 1 * *': 'Monthly on the 1st',
    };
    return patterns[schedule] || schedule;
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString();
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
          <h1 className="text-2xl font-bold mb-1">CronPilot</h1>
          <p className="text-[#71717a]">Scheduled jobs made easy</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg font-medium transition-colors"
        >
          Create Job
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12121a] rounded-2xl p-6 w-full max-w-lg border border-[#27272a]">
            <h2 className="text-xl font-bold mb-4">Create Cron Job</h2>
            <form onSubmit={createJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Name</label>
                <input
                  type="text"
                  value={newJob.name}
                  onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                  placeholder="Daily backup"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL to call</label>
                <input
                  type="url"
                  value={newJob.url}
                  onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                  placeholder="https://api.example.com/task"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Method</label>
                  <select
                    value={newJob.method}
                    onChange={(e) => setNewJob({ ...newJob, method: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Schedule</label>
                  <select
                    value={newJob.schedule}
                    onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#27272a] rounded-lg focus:border-[#6366f1] outline-none"
                  >
                    <option value="* * * * *">Every minute</option>
                    <option value="*/5 * * * *">Every 5 minutes</option>
                    <option value="*/15 * * * *">Every 15 minutes</option>
                    <option value="*/30 * * * *">Every 30 minutes</option>
                    <option value="0 * * * *">Every hour</option>
                    <option value="0 */2 * * *">Every 2 hours</option>
                    <option value="0 0 * * *">Daily at midnight</option>
                    <option value="0 0 * * 0">Weekly on Sunday</option>
                    <option value="0 0 1 * *">Monthly on the 1st</option>
                  </select>
                </div>
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

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-[#12121a] rounded-2xl border border-[#27272a]">
          <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#6366f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No cron jobs yet</h3>
          <p className="text-[#71717a] mb-6">Schedule your first automated task</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg font-medium transition-colors"
          >
            Create Your First Job
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 bg-[#12121a] rounded-2xl border border-[#27272a] hover:border-[#3f3f50] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleJob(job)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      job.is_active ? 'bg-green-500' : 'bg-[#27272a]'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      job.is_active ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                  <div>
                    <h3 className="font-semibold text-lg">{job.name}</h3>
                    <p className="text-sm text-[#71717a]">{job.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    job.is_active ? 'bg-green-500/10 text-green-500' : 'bg-[#27272a] text-[#71717a]'
                  }`}>
                    {job.is_active ? 'Active' : 'Paused'}
                  </span>
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-[#71717a] mb-1">Schedule</p>
                  <p className="text-sm font-medium">{formatSchedule(job.schedule)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] mb-1">Method</p>
                  <p className="text-sm font-medium">{job.method}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] mb-1">Last Run</p>
                  <p className="text-sm font-medium">{formatTime(job.last_run_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717a] mb-1">Success Rate</p>
                  <p className="text-sm font-medium">
                    {job.success_count + job.failure_count > 0
                      ? `${Math.round((job.success_count / (job.success_count + job.failure_count)) * 100)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Recent executions */}
              <div className="flex gap-1">
                {job.recent_executions.map((exec) => (
                  <div
                    key={exec.id}
                    className={`flex-1 h-2 rounded ${
                      exec.status === 'success' ? 'bg-green-500' :
                      exec.status === 'failed' ? 'bg-red-500' :
                      exec.status === 'timeout' ? 'bg-yellow-500' :
                      'bg-[#27272a]'
                    }`}
                    title={`${exec.status} - ${exec.duration_ms}ms`}
                  />
                ))}
                {Array.from({ length: Math.max(0, 5 - job.recent_executions.length) }).map((_, i) => (
                  <div key={i} className="flex-1 h-2 rounded bg-[#1e1e2e]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
