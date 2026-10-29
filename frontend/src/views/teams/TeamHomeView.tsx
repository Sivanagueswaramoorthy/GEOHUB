import React from 'react';
import {
  CheckSquare,
  Users2,
  Award,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  HeroCard,
  StatTile,
  PillButton,
  StatusChip,
  Avatar,
  Mascot,
} from '../../components/shared';

export const TeamHomeView: React.FC = () => {
  const {
    currentUser,
    teams,
    users,
    tasks,
    setActiveTab,
  } = useApp();

  const currentTeamName = currentUser.team || 'Management';
  const team = teams.find((t) => t.name.toLowerCase() === currentTeamName.toLowerCase()) || teams[0];

  const teamMembers = users.filter((u) => u.team?.toLowerCase() === team.name.toLowerCase());
  const teamTasks = tasks.filter((t) => t.team.toLowerCase() === team.name.toLowerCase());
  const completedTasks = teamTasks.filter((t) => t.status === 'done');
  const progressPercent = teamTasks.length > 0 ? Math.round((completedTasks.length / teamTasks.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      {/* Hero Card */}
      <HeroCard
        variant="pine"
        title={`${team.name} Squad`}
        subtitle="Operational command and tasks"
        mascot="clipboard"
        mascotSize="lg"
        ctaLabel="New task"
        onCtaClick={() => setActiveTab('tasks')}
        chip={<StatusChip status="live" label={`${teamMembers.length} Members`} />}
      />

      {/* 3 StatTiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <StatTile
          icon={<CheckSquare size={18} strokeWidth={2} />}
          value={teamTasks.length.toString()}
          label="Tasks"
          tint="mint"
        />
        <StatTile
          icon={<Users2 size={18} strokeWidth={2} />}
          value={teamMembers.length.toString()}
          label="Scholars"
          tint="sage"
        />
        <StatTile
          icon={<Award size={18} strokeWidth={2} />}
          value={`${progressPercent}%`}
          label="Progress"
          tint="white"
        />
      </div>

      {/* Members Row */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #DAF1DE',
          padding: '20px',
          boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
            Squad Roster
          </h3>
          <PillButton
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('members')}
          >
            See all
          </PillButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {teamMembers.slice(0, 5).map((m) => (
            <div
              key={m.uid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '16px',
                backgroundColor: '#F6FBF7',
                border: '1px solid #DAF1DE',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar name={m.name} size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#235347' }}>
                    {m.department || 'Geoinformatics'}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                {m.post || 'Member'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamHomeView;
