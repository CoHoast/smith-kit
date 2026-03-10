'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Member {
  name: string;
  email: string;
  order: number;
}

interface Schedule {
  id: string;
  name: string;
  rotation_type: 'daily' | 'weekly';
  rotation_time: string;
  rotation_day: number;
  timezone: string;
  members: Member[];
  current_index: number;
  current_oncall: Member | null;
  is_override: boolean;
  created_at: string;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    rotation_type: 'weekly',
    rotation_day: 1,
    members: [{ name: '', email: '', order: 0 }] as Member[],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const res = await fetch('/api/alertflow/schedules');
      const data = await res.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
    setIsLoading(false);
  };

  const createSchedule = async () => {
    if (!newSchedule.name || newSchedule.members.every(m => !m.email)) return;
    setIsSaving(true);
    
    // Filter out empty members
    const members = newSchedule.members
      .filter(m => m.name && m.email)
      .map((m, i) => ({ ...m, order: i }));

    try {
      const res = await fetch('/api/alertflow/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSchedule,
          members,
        }),
      });
      
      if (res.ok) {
        setShowCreateModal(false);
        setNewSchedule({
          name: '',
          rotation_type: 'weekly',
          rotation_day: 1,
          members: [{ name: '', email: '', order: 0 }],
        });
        loadSchedules();
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
    setIsSaving(false);
  };

  const updateSchedule = async () => {
    if (!editingSchedule) return;
    setIsSaving(true);
    
    const members = editingSchedule.members
      .filter(m => m.name && m.email)
      .map((m, i) => ({ ...m, order: i }));

    try {
      const res = await fetch('/api/alertflow/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSchedule.id,
          name: editingSchedule.name,
          rotation_type: editingSchedule.rotation_type,
          rotation_day: editingSchedule.rotation_day,
          members,
        }),
      });
      
      if (res.ok) {
        setEditingSchedule(null);
        loadSchedules();
      }
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
    setIsSaving(false);
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await fetch(`/api/alertflow/schedules?id=${id}`, { method: 'DELETE' });
      loadSchedules();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const rotateNow = async (schedule: Schedule) => {
    const newIndex = (schedule.current_index + 1) % schedule.members.length;
    try {
      await fetch('/api/alertflow/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: schedule.id,
          current_index: newIndex,
        }),
      });
      loadSchedules();
    } catch (error) {
      console.error('Failed to rotate:', error);
    }
  };

  const addMember = () => {
    if (editingSchedule) {
      setEditingSchedule({
        ...editingSchedule,
        members: [...editingSchedule.members, { name: '', email: '', order: editingSchedule.members.length }],
      });
    } else {
      setNewSchedule({
        ...newSchedule,
        members: [...newSchedule.members, { name: '', email: '', order: newSchedule.members.length }],
      });
    }
  };

  const removeMember = (index: number) => {
    if (editingSchedule) {
      setEditingSchedule({
        ...editingSchedule,
        members: editingSchedule.members.filter((_, i) => i !== index),
      });
    } else {
      setNewSchedule({
        ...newSchedule,
        members: newSchedule.members.filter((_, i) => i !== index),
      });
    }
  };

  const updateMember = (index: number, field: 'name' | 'email', value: string) => {
    if (editingSchedule) {
      const members = [...editingSchedule.members];
      members[index] = { ...members[index], [field]: value };
      setEditingSchedule({ ...editingSchedule, members });
    } else {
      const members = [...newSchedule.members];
      members[index] = { ...members[index], [field]: value };
      setNewSchedule({ ...newSchedule, members });
    }
  };

  const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  const currentScheduleData = editingSchedule || newSchedule;
  const isEditing = !!editingSchedule;

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
          <h1 className="text-3xl font-bold text-white">On-Call Schedules</h1>
          <p className="text-[#a1a1b5]">Manage who gets notified when incidents occur</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Schedule
        </button>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a25] flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#6b6b80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No schedules yet</h2>
          <p className="text-[#6b6b80] text-center max-w-md mb-6">
            Create an on-call schedule to define who gets notified when incidents occur.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-white font-medium transition-colors"
          >
            Create Your First Schedule
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{schedule.name}</h3>
                  <p className="text-sm text-[#6b6b80]">
                    {schedule.rotation_type === 'weekly' 
                      ? `Rotates every ${dayNames[schedule.rotation_day]}`
                      : 'Rotates daily'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingSchedule(schedule)}
                    className="p-2 text-[#6b6b80] hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="p-2 text-[#6b6b80] hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Current On-Call */}
              <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] mb-4">
                <p className="text-xs text-[#6b6b80] mb-2">Currently On-Call</p>
                {schedule.current_oncall ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white font-semibold">
                        {schedule.current_oncall.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{schedule.current_oncall.name}</p>
                        <p className="text-xs text-[#6b6b80]">{schedule.current_oncall.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => rotateNow(schedule)}
                      className="px-3 py-1.5 rounded-lg bg-[#1a1a25] text-[#a1a1b5] text-xs hover:text-white transition-colors"
                    >
                      Rotate Now
                    </button>
                  </div>
                ) : (
                  <p className="text-[#6b6b80]">No members in schedule</p>
                )}
              </div>

              {/* Members */}
              <div>
                <p className="text-xs text-[#6b6b80] mb-2">Rotation Order ({schedule.members.length} members)</p>
                <div className="flex flex-wrap gap-2">
                  {schedule.members.map((member, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        index === schedule.current_index
                          ? 'bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30'
                          : 'bg-[#0a0a0f] text-[#a1a1b5]'
                      }`}
                    >
                      {index + 1}. {member.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingSchedule) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12121a] border border-[#27272a] rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {isEditing ? 'Edit Schedule' : 'Create Schedule'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Schedule Name</label>
                <input
                  type="text"
                  value={currentScheduleData.name}
                  onChange={(e) => isEditing 
                    ? setEditingSchedule({ ...editingSchedule!, name: e.target.value })
                    : setNewSchedule({ ...newSchedule, name: e.target.value })
                  }
                  placeholder="Production On-Call"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Rotation</label>
                  <select
                    value={currentScheduleData.rotation_type}
                    onChange={(e) => isEditing
                      ? setEditingSchedule({ ...editingSchedule!, rotation_type: e.target.value as 'daily' | 'weekly' })
                      : setNewSchedule({ ...newSchedule, rotation_type: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white focus:border-[#6366f1] focus:outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                {currentScheduleData.rotation_type === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Rotate On</label>
                    <select
                      value={currentScheduleData.rotation_day}
                      onChange={(e) => isEditing
                        ? setEditingSchedule({ ...editingSchedule!, rotation_day: parseInt(e.target.value) })
                        : setNewSchedule({ ...newSchedule, rotation_day: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white focus:border-[#6366f1] focus:outline-none"
                    >
                      {dayNames.slice(1).map((day, i) => (
                        <option key={i + 1} value={i + 1}>{day}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#a1a1b5]">Team Members</label>
                  <button
                    onClick={addMember}
                    className="text-sm text-[#6366f1] hover:underline"
                  >
                    + Add Member
                  </button>
                </div>
                <div className="space-y-2">
                  {currentScheduleData.members.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                        placeholder="Name"
                        className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none text-sm"
                      />
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMember(index, 'email', e.target.value)}
                        placeholder="Email"
                        className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none text-sm"
                      />
                      {currentScheduleData.members.length > 1 && (
                        <button
                          onClick={() => removeMember(index)}
                          className="p-2 text-[#6b6b80] hover:text-red-500"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingSchedule(null);
                  setNewSchedule({
                    name: '',
                    rotation_type: 'weekly',
                    rotation_day: 1,
                    members: [{ name: '', email: '', order: 0 }],
                  });
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-[#27272a] text-[#a1a1b5] font-medium hover:bg-[#1a1a25] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={isEditing ? updateSchedule : createSchedule}
                disabled={isSaving || !currentScheduleData.name}
                className="flex-1 px-4 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#5558e3] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
