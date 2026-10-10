import React, { useState } from 'react';
import { Users2, ArrowLeft, Shield, UserPlus, CheckSquare, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserTile } from '../../components/common/UserTile';
import { TaskCard } from '../../components/common/TaskCard';
import { AppAvatar } from '../../components/common/AppAvatar';
import { Modal } from '../../components/common/Modal';

export const TeamsListView: React.FC = () => {
  const {
    teams,
    users,
    tasks,
    selectedTeamId,
    setSelectedTeamId,
    setSelectedTaskId,
    updateTaskStatus,
    updateUserRoleAndTeam,
    setActiveTab,
  } = useApp();

  const [isAssignLeadModalOpen, setIsAssignLeadModalOpen] = useState(false);
  const [newLeadId, setNewLeadId] = useState('');

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  // If viewing a single team detail
  if (selectedTeam) {
    const teamMembers = users.filter((u) => u.team?.toLowerCase() === selectedTeam.name.toLowerCase());
    const teamTasks = tasks.filter((t) => t.team.toLowerCase() === selectedTeam.name.toLowerCase());
    const completedTasks = teamTasks.filter((t) => t.status === 'done');
    const taskProgress = teamTasks.length > 0 ? Math.round((completedTasks.length / teamTasks.length) * 100) : 0;

    const handleAssignLead = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newLeadId) return;
      const targetUser = users.find((u) => u.uid === newLeadId);
      if (targetUser) {
        updateUserRoleAndTeam(targetUser.uid, 'team_admin', selectedTeam.name);
      }
      setIsAssignLeadModalOpen(false);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          onClick={() => setSelectedTeamId(null)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#0F766E',
          }}
        >
          <ArrowLeft size={16} /> Back to Teams List
        </button>

        <div className="app-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>
              Team Overview
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#16A34A',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              {teamMembers.length} Members
            </span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
            {selectedTeam.name} Team
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '16px' }}>
            {selectedTeam.description}
          </p>

          {/* Lead Card */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E8ECF2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AppAvatar name={selectedTeam.leadName} size={48} strokeWidth={1.75} />
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>TEAM LEAD</div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                  {selectedTeam.leadName}
                </div>
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAssignLeadModalOpen(true)}
            >
              Change Lead
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Task Execution</span>
              <span style={{ color: '#64748B' }}>
                {completedTasks.length} / {teamTasks.length} Completed ({taskProgress}%)
              </span>
            </div>
            <div style={{ height: '6px', width: '100%', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${taskProgress}%`, backgroundColor: '#0F766E' }} />
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="app-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              Team Members ({teamMembers.length})
            </h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('members')}
            >
              <UserPlus size={16} strokeWidth={1.75} /> Add from Directory
            </button>
          </div>
          <div>
            {teamMembers.map((member) => (
              <UserTile
                key={member.uid}
                user={member}
                action={
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F766E' }}>
                    {member.teamRole || 'Member'}
                  </span>
                }
              />
            ))}
          </div>
        </div>

        {/* Team Tasks */}
        <div className="app-card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
            Team Deliverables ({teamTasks.length})
          </h3>
          <div>
            {teamTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => {
                  setSelectedTaskId(task.id);
                  setActiveTab('tasks');
                }}
                onToggleDone={() =>
                  updateTaskStatus(task.id, task.status === 'done' ? 'in_progress' : 'done')
                }
              />
            ))}
          </div>
        </div>

        {/* Change Lead Modal */}
        <Modal
          isOpen={isAssignLeadModalOpen}
          onClose={() => setIsAssignLeadModalOpen(false)}
          title="Assign Team Lead"
          subtitle={`Promote a member to lead the ${selectedTeam.name} Team`}
        >
          <form onSubmit={handleAssignLead}>
            <div className="input-group">
              <label className="input-label">Select Student</label>
              <select
                className="input-field"
                value={newLeadId}
                onChange={(e) => setNewLeadId(e.target.value)}
                required
              >
                <option value="">-- Choose Member --</option>
                {teamMembers.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.name} ({m.department || 'Student'})
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Confirm & Assign Leadership Role
            </button>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>Club Teams</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {teams.map((tm) => {
          const members = users.filter((u) => u.team?.toLowerCase() === tm.name.toLowerCase());
          const teamTasks = tasks.filter((t) => t.team.toLowerCase() === tm.name.toLowerCase());
          const completedTasks = teamTasks.filter((t) => t.status === 'done');
          const progress = teamTasks.length > 0 ? Math.round((completedTasks.length / teamTasks.length) * 100) : 0;

          return (
            <div
              key={tm.id}
              className="app-card interactive"
              onClick={() => setSelectedTeamId(tm.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {tm.name} Team
                  </h3>
                  <div style={{ fontSize: '12px', color: '#0F766E', fontWeight: 600, marginTop: '2px' }}>
                    Lead: {tm.leadName}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0F766E',
                    backgroundColor: '#F0FDFA',
                    padding: '3px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {members.length} Members
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.4, marginBottom: '14px' }}>
                {tm.description}
              </p>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                  <span>Tasks Completed</span>
                  <span style={{ fontWeight: 600 }}>
                    {completedTasks.length} / {teamTasks.length} ({progress}%)
                  </span>
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#0F766E' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
