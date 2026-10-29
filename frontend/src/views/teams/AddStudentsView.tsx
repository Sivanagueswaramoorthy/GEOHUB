import React, { useState } from 'react';
import { UserPlus, ArrowLeft, Mail, Building } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Avatar,
  BottomSheet,
  EmptyState,
} from '../../components/shared';

export const AddStudentsView: React.FC = () => {
  const {
    currentUser,
    users,
    approvals,
    approveItem,
    rejectItem,
    addStudentToTeam,
    setActiveTab,
  } = useApp();

  const currentTeamName = currentUser.team || 'Promotion';
  const teamMembers = users.filter((u) => u.team?.toLowerCase() === currentTeamName.toLowerCase());

  const pendingRequests = approvals.filter(
    (a) =>
      a.type === 'join_request' &&
      a.status === 'pending' &&
      (!a.requestedTeam || a.requestedTeam.toLowerCase() === currentTeamName.toLowerCase())
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [teamRole, setTeamRole] = useState('Contributor');
  const [dept, setDept] = useState('Geosciences');
  const [year, setYear] = useState('1st Year');

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    addStudentToTeam({
      name,
      email,
      team: currentTeamName,
      teamRole,
      department: dept,
      yearOfStudy: year,
      role: 'member',
      isVolunteer: false,
      status: 'active',
    });
    setIsAddModalOpen(false);
    setName('');
    setEmail('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      <PillButton
        variant="secondary"
        size="sm"
        icon={<ArrowLeft size={14} strokeWidth={2} />}
        onClick={() => setActiveTab('team_home')}
      >
        Back
      </PillButton>

      {/* Micro-copy: 1 headline (2-4 words), 1 subtitle (< 6 words) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
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
            Enroll Scholars
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Squad admissions & invitations
          </p>
        </div>

        <PillButton
          variant="primary"
          icon={<UserPlus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Enroll
        </PillButton>
      </div>

      {/* Pending Applications Section */}
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
            Join Requests ({pendingRequests.length})
          </h3>
          <StatusChip status={pendingRequests.length > 0 ? 'live' : 'done'} label={pendingRequests.length > 0 ? 'Action Needed' : 'Cleared'} />
        </div>

        {pendingRequests.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
            No pending scholar applications for {currentTeamName} Squad.
          </p>
        ) : (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '16px',
                backgroundColor: '#F6FBF7',
                border: '1px solid #DAF1DE',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar name={req.applicantName || 'Applicant'} size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
                    {req.applicantName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#235347' }}>
                    {req.subtitle || 'Wants to join squad'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <PillButton variant="primary" size="sm" onClick={() => approveItem(req.id)}>
                  Approve
                </PillButton>
                <PillButton variant="destructive" size="sm" onClick={() => rejectItem(req.id, 'Declined')}>
                  Reject
                </PillButton>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Active Team Members */}
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
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
          Enrolled Scholars ({teamMembers.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {teamMembers.map((m) => (
            <div
              key={m.uid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
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
                    {m.email}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                {m.teamRole || m.post || 'Scholar'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      <BottomSheet
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll Scholar"
        subtitle={`Add member to ${currentTeamName} Squad`}
      >
        <form onSubmit={handleManualAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Chen"
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              College Email
            </label>
            <input
              type="email"
              required
              placeholder="e.g. maya@college.edu"
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Department
            </label>
            <input
              type="text"
              placeholder="e.g. Geoinformatics"
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            />
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Enroll
          </PillButton>
        </form>
      </BottomSheet>
    </div>
  );
};

export default AddStudentsView;
