import React, { useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from '../../components/common/TaskCard';
import {
  Mascot,
  MascotName,
  PillButton,
  StatusChip,
  Avatar,
  BottomSheet,
  EmptyState,
} from '../../components/shared';

export const TeamsListView: React.FC = () => {
  const {
    teams,
    users,
    tasks,
    currentUser,
    selectedTeamId,
    setSelectedTeamId,
    setSelectedTaskId,
    updateTaskStatus,
    updateUserRoleAndTeam,
    setActiveTab,
  } = useApp();

  const [isAssignLeadModalOpen, setIsAssignLeadModalOpen] = useState(false);
  const [newLeadId, setNewLeadId] = useState('');
  const [requestedSquads, setRequestedSquads] = useState<Record<string, boolean>>({});

  const isStudent =
    currentUser.role === 'student' ||
    currentUser.role === 'member' ||
    currentUser.role === 'volunteer';

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const squadMascots: Record<string, MascotName> = {
    Management: 'clipboard',
    Documentation: 'notebook',
    Promotion: 'megaphone',
    Entertainment: 'trophy',
  };

  // If viewing a single squad detail
  if (selectedTeam) {
    const teamMembers = users.filter(
      (u) => u.team?.toLowerCase() === selectedTeam.name.toLowerCase()
    );
    const teamTasks = tasks.filter(
      (t) => t.team.toLowerCase() === selectedTeam.name.toLowerCase()
    );
    const completedTasks = teamTasks.filter((t) => t.status === 'done');
    const taskProgress =
      teamTasks.length > 0
        ? Math.round((completedTasks.length / teamTasks.length) * 100)
        : 0;

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="select-none">
        <PillButton
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={14} strokeWidth={2} />}
          onClick={() => setSelectedTeamId(null)}
        >
          Back
        </PillButton>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #DAF1DE',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#235347',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Squad
            </span>
            <StatusChip status="live" label={`${teamMembers.length} Members`} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Mascot name={squadMascots[selectedTeam.name] || 'clipboard'} size="md" />
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                {selectedTeam.name}
              </h1>
              <p style={{ fontSize: '13px', color: '#235347', margin: '4px 0 0 0' }}>
                {selectedTeam.description}
              </p>
            </div>
          </div>

          {/* Lead Card */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#F6FBF7',
              borderRadius: '16px',
              border: '1px solid #DAF1DE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar name={selectedTeam.leadName} size={40} />
              <div>
                <div style={{ fontSize: '12px', color: '#235347', fontWeight: 600 }}>Squad Lead</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#051F20' }}>
                  {selectedTeam.leadName}
                </div>
              </div>
            </div>

            {currentUser.role === 'coordinator' && (
              <PillButton
                variant="secondary"
                size="sm"
                onClick={() => setIsAssignLeadModalOpen(true)}
              >
                Change Lead
              </PillButton>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#235347',
                marginBottom: '6px',
              }}
            >
              <span style={{ fontWeight: 700 }}>Tasks</span>
              <span style={{ fontWeight: 700, color: '#051F20' }}>
                {completedTasks.length} / {teamTasks.length} ({taskProgress}%)
              </span>
            </div>
            <div
              style={{
                height: '8px',
                width: '100%',
                backgroundColor: '#DAF1DE',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${taskProgress}%`,
                  backgroundColor: '#163832',
                  borderRadius: '9999px',
                  transition: 'width 250ms ease-out',
                }}
              />
            </div>
          </div>

          {/* Tasks List */}
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', marginBottom: '12px' }}>
            Tasks
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {teamTasks.length === 0 ? (
              <EmptyState
                mascot="clipboard"
                title="No tasks"
                description="Squad tasks will appear here"
              />
            ) : (
              teamTasks.map((task) => (
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
              ))
            )}
          </div>
        </div>

        {/* Change Lead BottomSheet */}
        <BottomSheet
          isOpen={isAssignLeadModalOpen}
          onClose={() => setIsAssignLeadModalOpen(false)}
          title="Assign Lead"
          subtitle={`Promote a scholar for ${selectedTeam.name}`}
        >
          <form onSubmit={handleAssignLead} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '6px' }}>
                Select Member
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  border: '1px solid #DAF1DE',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#FFFFFF',
                  color: '#051F20',
                  outline: 'none',
                }}
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

            <PillButton type="submit" variant="primary" fullWidth>
              Confirm
            </PillButton>
          </form>
        </BottomSheet>
      </div>
    );
  }

  // Ensure 4 standard squads exist for bento tiles
  const standardSquads = ['Management', 'Documentation', 'Promotion', 'Entertainment'];
  const squadTiles = standardSquads.map((name) => {
    const existing = teams.find((t) => t.name.toLowerCase() === name.toLowerCase());
    return (
      existing || {
        id: `squad_${name.toLowerCase()}`,
        name,
        leadName: 'Lead Appointee',
        description: `${name} squad operations & field assignments`,
        leadEmail: `${name.toLowerCase()}@club.edu`,
      }
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      {/* Micro-copy: 1 headline (2-4 words), 1 subtitle (< 6 words) */}
      <div>
        <h1
          style={{
            fontSize: '28px',
            lineHeight: '32px',
            fontWeight: 800,
            color: '#051F20',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Operational Squads
        </h1>
        <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
          Choose your chapter track
        </p>
      </div>

      {/* 4 Bento Tiles for Squads */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {squadTiles.map((tm) => {
          const members = users.filter((u) => u.team?.toLowerCase() === tm.name.toLowerCase());
          const isPending = requestedSquads[tm.name];
          const mascotKey = squadMascots[tm.name] || 'clipboard';

          return (
            <div
              key={tm.id}
              onClick={() => setSelectedTeamId(tm.id)}
              style={{
                borderRadius: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DAF1DE',
                padding: '20px',
                boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'all 200ms ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mascot name={mascotKey} size="md" />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                      {tm.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <Avatar name={tm.leadName} size={32} />
                      <span style={{ fontSize: '12px', color: '#235347', fontWeight: 600 }}>
                        {tm.leadName}
                      </span>
                    </div>
                  </div>
                </div>

                {isStudent ? (
                  isPending ? (
                    <StatusChip status="pending" label="Pending" />
                  ) : (
                    <PillButton
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRequestedSquads((prev) => ({ ...prev, [tm.name]: true }));
                      }}
                    >
                      Request
                    </PillButton>
                  )
                ) : (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#0B2B26',
                      backgroundColor: '#DAF1DE',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      border: '1px solid #8EB69B',
                    }}
                  >
                    {members.length} Members
                  </span>
                )}
              </div>

              <p style={{ fontSize: '13px', color: '#235347', lineHeight: 1.45, margin: 0 }}>
                {tm.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid #DAF1DE',
                  fontSize: '12px',
                }}
              >
                <span style={{ fontWeight: 600, color: '#235347', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} color="#235347" />
                  {members.length} enrolled
                </span>
                <span style={{ fontWeight: 700, color: '#163832' }}>
                  View Squad →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamsListView;
