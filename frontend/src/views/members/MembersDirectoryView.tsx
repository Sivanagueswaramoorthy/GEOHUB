import React, { useState, useMemo } from 'react';
import {
  Search,
  Lock,
  Shield,
  UserCheck,
  Building,
  GraduationCap,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserModel, UserRole } from '../../types';
import {
  Avatar,
  PillButton,
  StatusChip,
  BottomSheet,
  EmptyState,
  SearchField,
} from '../../components/shared';

export const MembersDirectoryView: React.FC = () => {
  const {
    users,
    currentUser,
    changeStudentPost,
    updateUserRoleAndTeam,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSquad, setSelectedSquad] = useState('All');

  // Post Assign BottomSheet
  const [selectedUserForPost, setSelectedUserForPost] = useState<UserModel | null>(null);
  const [targetPost, setTargetPost] = useState('Promotion Lead');
  const [targetRole, setTargetRole] = useState<UserRole>('team_admin');
  const [targetSquad, setTargetSquad] = useState('Promotion');

  const facultyUsers = users.filter((u) => u.role === 'faculty' || u.role === 'super_admin');
  const isOnlyOneFaculty = facultyUsers.length <= 1;

  const departments = ['All', 'Geoinformatics', 'Computer Science', 'Civil Engineering', 'Environmental'];
  const squads = ['All', 'Management', 'Documentation', 'Promotion', 'Entertainment'];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedDept !== 'All' && !(u.department || '').toLowerCase().includes(selectedDept.toLowerCase())) {
        return false;
      }
      if (selectedSquad !== 'All' && !(u.team || '').toLowerCase().includes(selectedSquad.toLowerCase())) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchPost = (u.post || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPost) return false;
      }
      return true;
    });
  }, [users, selectedDept, selectedSquad, searchQuery]);

  const handleOpenAssignPost = (user: UserModel) => {
    setSelectedUserForPost(user);
    setTargetPost(user.post || 'Promotion Lead');
    setTargetRole(user.role);
    setTargetSquad(user.team || 'Promotion');
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPost) return;

    // Check last faculty constraint
    if (
      isOnlyOneFaculty &&
      selectedUserForPost.uid === currentUser.uid &&
      targetRole !== 'faculty' &&
      targetRole !== 'super_admin'
    ) {
      alert('The last active faculty account cannot be demoted or deactivated.');
      return;
    }

    // Check self-escalation constraint
    if (
      currentUser.role !== 'faculty' &&
      currentUser.role !== 'super_admin' &&
      (targetRole === 'faculty' || targetRole === 'super_admin')
    ) {
      alert('Self-escalation to Faculty or Super Admin is locked.');
      return;
    }

    if (changeStudentPost) {
      changeStudentPost(selectedUserForPost.uid, targetPost, targetRole);
    }
    if (updateUserRoleAndTeam) {
      updateUserRoleAndTeam(selectedUserForPost.uid, targetRole, targetSquad);
    }
    setSelectedUserForPost(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
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
            Members Directory
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Chapter roster & assignments
          </p>
        </div>

        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '9999px',
            backgroundColor: '#DAF1DE',
            color: '#0B2B26',
            border: '1px solid #8EB69B',
          }}
        >
          {users.length} Scholars
        </span>
      </div>

      {/* Filter Chips & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search scholars by name, roll, or squad..."
        />

        {/* Squad Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
          {squads.map((sq) => {
            const isActive = selectedSquad === sq;
            return (
              <button
                type="button"
                key={sq}
                onClick={() => setSelectedSquad(sq)}
                className="transition-all duration-150 active:scale-95"
                style={{
                  height: '32px',
                  padding: '0 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: isActive ? '#163832' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#235347',
                  border: isActive ? '1px solid #163832' : '1px solid #DAF1DE',
                  boxShadow: isActive ? '0 2px 8px rgba(22, 56, 50, 0.2)' : '0 2px 6px rgba(5, 31, 32, 0.04)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {sq === 'All' ? 'All Squads' : `${sq} Squad`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Members Roster List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredUsers.length === 0 ? (
          <EmptyState
            mascot="magnifier"
            title="No scholars"
            description="No members found matching filter"
          />
        ) : (
          filteredUsers.map((u) => {
            const isLastFaculty = isOnlyOneFaculty && (u.role === 'faculty' || u.role === 'super_admin');
            const canManage =
              currentUser.role === 'faculty' ||
              currentUser.role === 'super_admin' ||
              currentUser.role === 'coordinator';

            return (
              <div
                key={u.uid}
                className="transition-all duration-150"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #DAF1DE',
                  padding: '16px',
                  boxShadow: '0 4px 16px rgba(5, 31, 32, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Top Row: Avatar + Scholar Info + Action Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <Avatar name={u.name} size={44} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '15px',
                            lineHeight: '20px',
                            fontWeight: 800,
                            color: '#051F20',
                            fontFamily: 'var(--font-family)',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {u.name}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            lineHeight: '16px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor:
                              u.role === 'student' || u.role === 'member'
                                ? '#F6FBF7'
                                : '#DAF1DE',
                            color: '#051F20',
                            border:
                              u.role === 'student' || u.role === 'member'
                                ? '1px solid #DAF1DE'
                                : '1px solid #8EB69B',
                            textTransform: 'capitalize',
                          }}
                        >
                          {u.role.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Academic Department & Optional Roll */}
                      <p
                        style={{
                          fontSize: '12px',
                          lineHeight: '16px',
                          color: '#235347',
                          margin: '2px 0 0 0',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={u.department || 'Geoinformatics'}
                      >
                        {u.department || 'Geoinformatics'}
                        {u.rollNo && (
                          <span style={{ opacity: 0.75 }}>
                            {' '}• {u.rollNo}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Action: Assign post / Protected */}
                  <div style={{ flexShrink: 0 }}>
                    {isLastFaculty ? (
                      <div
                        title="Last faculty account cannot be demoted"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          backgroundColor: '#F6FBF7',
                          border: '1px solid #DAF1DE',
                          fontSize: '12px',
                          color: '#235347',
                          fontWeight: 600,
                        }}
                      >
                        <Lock size={12} color="#163832" />
                        <span>Protected</span>
                      </div>
                    ) : canManage ? (
                      <PillButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenAssignPost(u)}
                      >
                        Assign post
                      </PillButton>
                    ) : null}
                  </div>
                </div>

                {/* Badges Row: Squad & Post */}
                {(u.team || u.post) && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      paddingTop: '10px',
                      borderTop: '1px solid #F6FBF7',
                    }}
                  >
                    {u.team && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#235347',
                          backgroundColor: '#F6FBF7',
                          border: '1px solid #DAF1DE',
                          borderRadius: '8px',
                          padding: '3px 9px',
                        }}
                      >
                        <Users size={12} color="#235347" />
                        <span>{u.team} Squad</span>
                      </span>
                    )}
                    {u.post && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#051F20',
                          backgroundColor: '#DAF1DE',
                          border: '1px solid #8EB69B',
                          borderRadius: '8px',
                          padding: '3px 9px',
                        }}
                      >
                        <Shield size={12} color="#163832" />
                        <span>{u.post}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Post Assign BottomSheet */}
      <BottomSheet
        isOpen={selectedUserForPost !== null}
        onClose={() => setSelectedUserForPost(null)}
        title="Assign Post"
        subtitle={selectedUserForPost?.name || 'Scholar'}
      >
        <form onSubmit={handleSavePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          {/* Lock hints if last faculty */}
          {selectedUserForPost && isOnlyOneFaculty && (selectedUserForPost.role === 'faculty' || selectedUserForPost.role === 'super_admin') && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '16px',
                backgroundColor: '#DAF1DE',
                border: '1px solid #8EB69B',
                fontSize: '12px',
                color: '#051F20',
                fontWeight: 600,
              }}
            >
              <Lock size={16} color="#163832" />
              <span>This is the primary Faculty account. Demotion is disabled.</span>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Designation Post
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Promotion Lead, Documentation Lead"
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
              value={targetPost}
              onChange={(e) => setTargetPost(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Operational Squad
            </label>
            <select
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={targetSquad}
              onChange={(e) => setTargetSquad(e.target.value)}
            >
              <option value="Management">Management</option>
              <option value="Documentation">Documentation</option>
              <option value="Promotion">Promotion</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Security Role
            </label>
            <select
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as any)}
            >
              <option value="member">General Member</option>
              <option value="team_admin">Squad Lead (Admin)</option>
              <option value="coordinator">Chapter Coordinator</option>
              <option value="faculty">Faculty Advisor</option>
            </select>
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Save
          </PillButton>
        </form>
      </BottomSheet>
    </div>
  );
};

export default MembersDirectoryView;
