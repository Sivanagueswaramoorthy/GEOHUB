import React from 'react';
import {
  Users2,
  CheckSquare,
  FileText,
  UserPlus,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenTwoModel } from '../../components/common/ScreenTwoModel';
import { AppAvatar } from '../../components/common/AppAvatar';

export const TeamHomeView: React.FC = () => {
  const {
    currentUser,
    teams,
    users,
    tasks,
    setActiveTab,
    setSelectedTaskId,
    updateTaskStatus,
  } = useApp();

  const currentTeamName = currentUser.team || 'Management';
  const team = teams.find((t) => t.name.toLowerCase() === currentTeamName.toLowerCase()) || teams[0];

  const teamMembers = users.filter((u) => u.team?.toLowerCase() === team.name.toLowerCase());
  const teamTasks = tasks.filter((t) => t.team.toLowerCase() === team.name.toLowerCase());
  const completedTasks = teamTasks.filter((t) => t.status === 'done');
  const progressPercent = teamTasks.length > 0 ? Math.round((completedTasks.length / teamTasks.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ScreenTwoModel
        quickActionTitle={`Assign ${team.name} Task`}
        quickActionSubtitle="Delegate deliverable to a squad member"
        quickActionIcon={<CheckSquare size={22} />}
        onQuickActionClick={() => setActiveTab('tasks')}
        metrics={[
          {
            icon: <CheckSquare size={16} />,
            value: teamTasks.length,
            label: 'Squad Tasks',
            subtext: `${completedTasks.length} Done`,
            bgColor: '#ECFDF5',
          },
          {
            icon: <Users2 size={16} />,
            value: teamMembers.length,
            label: 'Squad Scholars',
            subtext: 'Active',
            bgColor: '#F0FDF4',
          },
          {
            icon: <Award size={16} />,
            value: `${progressPercent}%`,
            label: 'Sprint Velocity',
            subtext: 'On Track',
            bgColor: '#E6FBF2',
          },
        ]}
        briefTitle={`${team.name} Squad Brief`}
        briefItems={[
          {
            title: `${teamTasks.length - completedTasks.length} deliverables in active sprint`,
            subtitle: 'Next: Event logistics brief at 2:00 PM',
            tag: 'Due',
            tagType: 'due',
          },
          {
            title: `Sprint Execution Rate: ${progressPercent}%`,
            subtitle: `${completedTasks.length} of ${teamTasks.length} deliverables signed off`,
            tag: 'Progress',
            tagType: 'active',
          },
          {
            title: '1 pending student induction request',
            subtitle: 'Awaiting faculty advisor seal',
            tag: 'Pending',
            tagType: 'info',
          },
        ]}
        tasksHeader={`${team.name} Squad Deliverables`}
        tasks={teamTasks}
        onTaskToggle={(id) => {
          const t = tasks.find((item) => item.id === id);
          if (t) {
            updateTaskStatus(id, t.status === 'done' ? 'todo' : 'done');
          }
        }}
      >
        {/* Squad Members Roster */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E8ECF2',
            padding: '16px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
              Squad Scholars ({teamMembers.length})
            </span>
            <button
              onClick={() => setActiveTab('add_students')}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#10B981',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '4px 10px',
                borderRadius: '999px',
              }}
            >
              + Add Scholar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {teamMembers.map((m) => (
              <div
                key={m.uid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AppAvatar name={m.name} size={30} avatarUrl={m.avatarUrl} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {m.role.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Active</span>
              </div>
            ))}
          </div>
        </div>
      </ScreenTwoModel>
    </div>
  );
};
