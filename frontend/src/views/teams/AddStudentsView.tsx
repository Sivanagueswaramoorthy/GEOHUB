import React, { useState } from 'react';
import { UserPlus, Check, X, ShieldCheck, ArrowLeft, Mail, Building } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserTile } from '../../components/common/UserTile';
import { Modal } from '../../components/common/Modal';
import { AppAvatar } from '../../components/common/AppAvatar';

export const AddStudentsView: React.FC = () => {
  const {
    currentUser,
    users,
    approvals,
    teams,
    approveItem,
    rejectItem,
    addStudentToTeam,
    setActiveTab,
  } = useApp();

  const currentTeamName = currentUser.team || 'Promotion';
  const teamMembers = users.filter((u) => u.team?.toLowerCase() === currentTeamName.toLowerCase());

  // Pending join requests matching this team
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <button
        onClick={() => setActiveTab('team_home')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#0F766E',
        }}
      >
        <ArrowLeft size={16} /> Back to Team Home
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
            Roster & Induction
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            Review applicants & onboard students into the {currentTeamName} Team
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      {/* Pending Join Requests Section */}
      <div className="app-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
            Pending Membership Applications ({pendingRequests.length})
          </h3>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#D97706',
              backgroundColor: 'rgba(217, 119, 6, 0.1)',
              padding: '2px 8px',
              borderRadius: '999px',
            }}
          >
            Requires Action
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#94A3B8', fontSize: '13px' }}>
            No pending join requests for this team.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E8ECF2',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AppAvatar name={req.applicantName} size={38} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                        {req.applicantName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        {req.applicantEmail} • {req.requestedRole || 'Applicant'}
                      </div>
                    </div>
                  </div>
                </div>

                {req.details && (
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px', lineHeight: 1.4 }}>
                    "{req.details}"
                  </p>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      approveItem(req.id);
                      addStudentToTeam({
                        name: req.applicantName,
                        email: req.applicantEmail || `${req.applicantName.toLowerCase().replace(' ', '.')}@college.edu`,
                        team: currentTeamName,
                        teamRole: req.requestedRole || 'Team Member',
                        role: 'member',
                        isVolunteer: false,
                        status: 'active',
                      });
                    }}
                  >
                    <Check size={14} /> Approve & Onboard
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#DC2626' }}
                    onClick={() => rejectItem(req.id, 'Capacity reached for this semester')}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Team Roster */}
      <div className="app-card">
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
          Current Active Members ({teamMembers.length})
        </h3>
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

      {/* Manual Student Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Student to Team"
        subtitle={`Assign college student to ${currentTeamName}`}
      >
        <form onSubmit={handleManualAdd}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Liam Foster"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">College Email</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Team Designation / Role</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Media Strategist, Drone Operator"
              value={teamRole}
              onChange={(e) => setTeamRole(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="input-group">
              <label className="input-label">Department</label>
              <input
                type="text"
                className="input-field"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Year of Study</label>
              <select
                className="input-field"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Confirm & Onboard Member
          </button>
        </form>
      </Modal>
    </div>
  );
};
