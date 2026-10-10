import React, { useState } from 'react';
import {
  Search,
  Users2,
  Award,
  ShieldCheck,
  UserCheck,
  Edit3,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  ChevronRight,
  ChevronDown,
  Filter,
  Check,
  Sparkles,
  Layers,
  GraduationCap,
  CheckCircle2,
  X,
  Crown,
  Briefcase,
  Megaphone,
  FileText,
  DollarSign,
  Share2,
  QrCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppAvatar } from '../../components/common/AppAvatar';
import { Modal } from '../../components/common/Modal';
import { SearchBar } from '../../components/SearchBar';
import { UserRole } from '../../types';

export const MembersListView: React.FC = () => {
  const {
    users,
    teams,
    selectedUserId,
    setSelectedUserId,
    updateUserRoleAndTeam,
    changeStudentPost,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSquadDropdownOpen, setIsSquadDropdownOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<UserRole>('member');
  const [editTeam, setEditTeam] = useState('Management');
  const [editPost, setEditPost] = useState('Student Volunteer');
  const [editIsVolunteer, setEditIsVolunteer] = useState(false);

  const selectedUser = users.find((u) => u.uid === selectedUserId);

  // Key Metrics
  const totalActive = users.filter((u) => u.status === 'active').length;
  const teamLeads = users.filter(
    (u) => u.role === 'team_admin' || (u.teamRole && u.teamRole.toLowerCase().includes('lead'))
  ).length;
  const facultyAndAdmins = users.filter(
    (u) => u.role === 'super_admin' || u.role === 'admin'
  ).length;
  const volunteers = users.filter(
    (u) => u.isVolunteer || u.role === 'volunteer'
  ).length;
  const standardMembers = users.filter((u) => u.role === 'member').length;

  // Academic Year Counts
  const firstYearCount = users.filter((u) => u.yearOfStudy && u.yearOfStudy.toLowerCase().includes('1st')).length;
  const secondYearCount = users.filter((u) => u.yearOfStudy && u.yearOfStudy.toLowerCase().includes('2nd')).length;
  const thirdYearCount = users.filter((u) => u.yearOfStudy && u.yearOfStudy.toLowerCase().includes('3rd')).length;
  const fourthYearCount = users.filter(
    (u) => u.yearOfStudy && (u.yearOfStudy.toLowerCase().includes('4th') || u.yearOfStudy.toLowerCase().includes('final'))
  ).length;

  // Dropdown Options
  const roleDropdownOptions = [
    // General & Leads
    {
      key: 'All',
      label: 'All Students',
      shortLabel: 'All Students',
      section: 'Overview',
      count: users.length,
      icon: <Users2 size={16} strokeWidth={1.75} />,
      color: '#475569',
      bg: '#F1F5F9',
    },
    {
      key: 'team_admin',
      label: 'Squad Team Leads',
      shortLabel: 'Team Leads',
      section: 'Overview',
      count: teamLeads,
      icon: <Award size={16} strokeWidth={1.75} />,
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
    // Academic Years
    {
      key: '1st_year',
      label: '1st Year Students',
      shortLabel: '1st Year',
      section: 'Filter by Student Year',
      count: firstYearCount,
      icon: <GraduationCap size={16} strokeWidth={1.75} />,
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      key: '2nd_year',
      label: '2nd Year Students',
      shortLabel: '2nd Year',
      section: 'Filter by Student Year',
      count: secondYearCount,
      icon: <GraduationCap size={16} strokeWidth={1.75} />,
      color: '#0284C7',
      bg: '#ECFEFF',
    },
    {
      key: '3rd_year',
      label: '3rd Year Students',
      shortLabel: '3rd Year',
      section: 'Filter by Student Year',
      count: thirdYearCount,
      icon: <GraduationCap size={16} strokeWidth={1.75} />,
      color: '#6366F1',
      bg: '#EEF2FF',
    },
    {
      key: '4th_year',
      label: '4th Year Students',
      shortLabel: '4th Year',
      section: 'Filter by Student Year',
      count: fourthYearCount,
      icon: <GraduationCap size={16} strokeWidth={1.75} />,
      color: '#D97706',
      bg: '#FFFBEB',
    },
    // Governance & Status
    {
      key: 'active',
      label: 'Active Club Members',
      shortLabel: 'Active',
      section: 'Status & Governance',
      count: totalActive,
      icon: <CheckCircle2 size={16} strokeWidth={1.75} />,
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      key: 'executive',
      label: 'Faculty & Admins',
      shortLabel: 'Admins',
      section: 'Status & Governance',
      count: facultyAndAdmins,
      icon: <ShieldCheck size={16} strokeWidth={1.75} />,
      color: '#B45309',
      bg: '#FEF3C7',
    },
  ];

  const squadDropdownOptions = [
    { key: 'All', label: 'All Squads', shortLabel: 'All Squads', count: users.length },
    { key: 'Management', label: 'Management Squad', shortLabel: 'Management', count: users.filter((u) => u.team === 'Management').length },
    { key: 'Promotion', label: 'Promotion Squad', shortLabel: 'Promotion', count: users.filter((u) => u.team === 'Promotion').length },
    { key: 'Documentation', label: 'Documentation Squad', shortLabel: 'Docs', count: users.filter((u) => u.team === 'Documentation').length },
    { key: 'Entertainment', label: 'Entertainment Squad', shortLabel: 'Events', count: users.filter((u) => u.team === 'Entertainment').length },
  ];

  const activeRoleOption = roleDropdownOptions.find((o) => o.key === roleFilter) || roleDropdownOptions[0];
  const activeSquadOption = squadDropdownOptions.find((o) => o.key === teamFilter) || squadDropdownOptions[0];

  const filteredUsers = users.filter((u) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchDept = u.department && u.department.toLowerCase().includes(q);
      const matchTeam = u.team && u.team.toLowerCase().includes(q);
      const matchRole = u.teamRole && u.teamRole.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchDept && !matchTeam && !matchRole) {
        return false;
      }
    }

    // Role / Year / Status Filter
    if (roleFilter !== 'All') {
      if (roleFilter === 'active' && u.status !== 'active') return false;
      if (roleFilter === 'volunteer' && !u.isVolunteer && u.role !== 'volunteer') return false;
      if (roleFilter === 'team_admin' && u.role !== 'team_admin' && !(u.teamRole && u.teamRole.toLowerCase().includes('lead'))) return false;
      if (roleFilter === 'executive' && u.role !== 'super_admin' && u.role !== 'admin') return false;
      if (roleFilter === 'member' && u.role !== 'member') return false;
      if (roleFilter === '1st_year' && (!u.yearOfStudy || !u.yearOfStudy.toLowerCase().includes('1st'))) return false;
      if (roleFilter === '2nd_year' && (!u.yearOfStudy || !u.yearOfStudy.toLowerCase().includes('2nd'))) return false;
      if (roleFilter === '3rd_year' && (!u.yearOfStudy || !u.yearOfStudy.toLowerCase().includes('3rd'))) return false;
      if (
        roleFilter === '4th_year' &&
        (!u.yearOfStudy || (!u.yearOfStudy.toLowerCase().includes('4th') && !u.yearOfStudy.toLowerCase().includes('final')))
      ) {
        return false;
      }
      if (
        roleFilter !== 'active' &&
        roleFilter !== 'volunteer' &&
        roleFilter !== 'team_admin' &&
        roleFilter !== 'executive' &&
        roleFilter !== 'member' &&
        roleFilter !== '1st_year' &&
        roleFilter !== '2nd_year' &&
        roleFilter !== '3rd_year' &&
        roleFilter !== '4th_year' &&
        u.role !== roleFilter
      ) {
        return false;
      }
    }

    // Team Filter
    if (teamFilter !== 'All' && u.team !== teamFilter) {
      return false;
    }

    return true;
  });

  const handleOpenEdit = () => {
    if (!selectedUser) return;
    setEditRole(selectedUser.role);
    setEditTeam(selectedUser.team || 'Management');
    setEditPost(selectedUser.post || (selectedUser.role === 'faculty' ? 'Faculty Advisor' : selectedUser.role === 'coordinator' ? 'President' : selectedUser.role === 'treasurer' ? 'Treasurer' : selectedUser.role === 'documentation' ? 'Documentation Lead' : selectedUser.role === 'social_media' ? 'Social Media Lead' : 'Student Volunteer'));
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    changeStudentPost(selectedUser.uid, editPost, editRole);
    const isSquadRole = editRole === 'team_admin' || editRole === 'member';
    const assignedTeam = isSquadRole ? editTeam : undefined;
    updateUserRoleAndTeam(selectedUser.uid, editRole, assignedTeam);
    setIsEditModalOpen(false);
  };

  // Helper for Role Tag Styling
  const getRoleBadgeStyle = (user: typeof users[0]) => {
    if (user.post) {
      if (user.post.includes('President') || user.post.includes('Coordinator')) {
        return { label: user.post, color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' };
      }
      if (user.post.includes('Faculty') || user.post.includes('Advisor')) {
        return { label: user.post, color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' };
      }
      if (user.post.includes('Treasurer')) {
        return { label: user.post, color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' };
      }
      if (user.post.includes('Documentation')) {
        return { label: user.post, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
      }
      if (user.post.includes('Social Media')) {
        return { label: user.post, color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3' };
      }
      if (user.post.includes('Volunteer')) {
        return { label: user.post, color: '#BE185D', bg: '#FCE7F3', border: '#FBCFE8' };
      }
    }

    if (user.role === 'faculty' || user.role === 'super_admin') {
      return {
        label: user.post || 'Faculty Advisor',
        color: '#B45309',
        bg: '#FEF3C7',
        border: '#FDE68A',
      };
    }
    if (user.role === 'coordinator' || user.role === 'admin') {
      return {
        label: user.post || 'Coordinator / Lead',
        color: '#4338CA',
        bg: '#EEF2FF',
        border: '#C7D2FE',
      };
    }
    if (user.role === 'treasurer') {
      return {
        label: user.post || 'Treasurer Lead',
        color: '#047857',
        bg: '#ECFDF5',
        border: '#A7F3D0',
      };
    }
    if (user.role === 'documentation') {
      return {
        label: user.post || 'Documentation Lead',
        color: '#D97706',
        bg: '#FFFBEB',
        border: '#FDE68A',
      };
    }
    if (user.role === 'social_media') {
      return {
        label: user.post || 'Social Media Lead',
        color: '#E11D48',
        bg: '#FFF1F2',
        border: '#FECDD3',
      };
    }
    if (user.role === 'team_admin' || (user.teamRole && user.teamRole.toLowerCase().includes('lead'))) {
      return {
        label: user.teamRole || `${user.team || 'Squad'} Lead`,
        color: '#6D28D9',
        bg: '#F5F3FF',
        border: '#DDD6FE',
      };
    }
    if (user.isVolunteer || user.role === 'volunteer') {
      return {
        label: user.post || 'Student Volunteer',
        color: '#BE185D',
        bg: '#FCE7F3',
        border: '#FBCFE8',
      };
    }
    return {
      label: user.team ? `${user.team} Member` : 'Student Member',
      color: '#047857',
      bg: '#ECFDF5',
      border: '#A7F3D0',
    };
  };

  // Single User Dossier View
  if (selectedUser) {
    const badge = getRoleBadgeStyle(selectedUser);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '100px' }}>
        {/* Top Institutional App Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2px 0 6px 0',
          }}
        >
          <button
            onClick={() => setSelectedUserId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              color: '#0F172A',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
            title="Return to Directory"
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#059669',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Institutional Registry
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Scholar Dossier
            </h2>
          </div>

          <div
            style={{
              padding: '5px 12px',
              borderRadius: '999px',
              backgroundColor: '#ECFDF5',
              border: '1.5px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#065F46' }}>Active</span>
          </div>
        </div>

        {/* Hero Scholar Profile Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid #E8ECF2',
            padding: '18px 18px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            position: 'relative',
          }}
        >
          {/* Top Row with ID Badge */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748B',
                backgroundColor: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                padding: '4px 11px',
                borderRadius: '999px',
                letterSpacing: '0.04em',
              }}
            >
              ID #{selectedUser.uid}
            </span>
          </div>

          {/* Profile Core & Body */}
          <div style={{ textAlign: 'center' }}>
            {/* Centered Large Avatar */}
            <div
              style={{
                display: 'inline-block',
                position: 'relative',
              }}
            >
              <AppAvatar name={selectedUser.name} avatarUrl={selectedUser.avatarUrl} size={16} strokeWidth={1.75} />
              <div
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '2.5px solid #FFFFFF',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                }}
                title="Active Scholar"
              />
            </div>

            {/* Scholar Name */}
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0F172A',
                marginTop: '12px',
                marginBottom: '6px',
                letterSpacing: '-0.02em',
              }}
            >
              {selectedUser.name}
            </h2>

            {/* Role & Squad Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '16px',
              }}
            >
              {selectedUser.post && (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#065F46',
                    backgroundColor: '#D1FAE5',
                    border: '1.5px solid #6EE7B7',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Crown size={16} strokeWidth={1.75} color="#059669" />
                  Post: {selectedUser.post}
                </span>
              )}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: badge.color,
                  backgroundColor: badge.bg,
                  border: `1.5px solid ${badge.border}`,
                  padding: '4px 12px',
                  borderRadius: '999px',
                }}
              >
                {badge.label}
              </span>
              {selectedUser.team && (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#1E293B',
                    backgroundColor: '#F1F5F9',
                    border: '1.5px solid #E2E8F0',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Sparkles size={16} strokeWidth={1.75} color="#059669" />
                  {selectedUser.team} Squad
                </span>
              )}
              {selectedUser.yearOfStudy && (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#64748B',
                    backgroundColor: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    padding: '4px 10px',
                    borderRadius: '999px',
                  }}
                >
                  {selectedUser.yearOfStudy}
                </span>
              )}
            </div>

            {/* 3-Column Quick Metrics Glance */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                padding: '12px 6px',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Squad
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  {selectedUser.team || 'Unassigned'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderLeft: '1px solid #E2E8F0',
                  borderRight: '1px solid #E2E8F0',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Standing
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  {selectedUser.yearOfStudy || 'Enrolled'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Access Pass
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                  Verified
                </span>
              </div>
            </div>

            {/* Structured Credentials List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
              {/* Email Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #F1F5F9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#ECFDF5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#059669',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={20} strokeWidth={1.75} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Institutional Email</div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0F172A',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {selectedUser.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Card if present */}
              {selectedUser.phone && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #F1F5F9',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB',
                        flexShrink: 0,
                      }}
                    >
                      <Phone size={20} strokeWidth={1.75} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Emergency Contact</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                        {selectedUser.phone}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Department Card */}
              {selectedUser.department && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #F1F5F9',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#F5F3FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7C3AED',
                      flexShrink: 0,
                    }}
                  >
                    <GraduationCap size={20} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Academic Faculty & Standing</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {selectedUser.department} • {selectedUser.yearOfStudy || 'Undergraduate'}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Glowing Action Button */}
            <button
              onClick={handleOpenEdit}
              style={{
                width: '100%',
                marginTop: '20px',
                height: '48px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(16, 185, 129, 0.28)',
                transition: 'all 0.15s ease',
              }}
            >
              <Edit3 size={20} strokeWidth={1.75} /> Edit Role & Permissions
            </button>
          </div>
        </div>

        {/* Edit Role Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Update Member Credentials"
          subtitle={`Assign role permissions for ${selectedUser.name}`}
        >
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Leadership Post Assignment (Handwritten Notebook Requirement) */}
            <div className="input-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Leadership Post Designation
                </label>
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, backgroundColor: '#ECFDF5', padding: '2px 7px', borderRadius: '4px' }}>
                  Post Assignment
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {[
                  { title: 'President', role: 'coordinator' as UserRole },
                  { title: 'Vice President', role: 'coordinator' as UserRole },
                  { title: 'Faculty Advisor', role: 'faculty' as UserRole },
                  { title: 'Treasurer', role: 'treasurer' as UserRole },
                  { title: 'Documentation Lead', role: 'documentation' as UserRole },
                  { title: 'Social Media Lead', role: 'social_media' as UserRole },
                  { title: 'Student Volunteer', role: 'volunteer' as UserRole },
                ].map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => {
                      setEditPost(p.title);
                      setEditRole(p.role);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: editPost === p.title ? 800 : 600,
                      backgroundColor: editPost === p.title ? '#10B981' : '#F1F5F9',
                      color: editPost === p.title ? '#FFFFFF' : '#334155',
                      border: editPost === p.title ? '1px solid #059669' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Designation title (e.g. Student Volunteer, President, Documentation Lead)..."
                value={editPost}
                onChange={(e) => setEditPost(e.target.value)}
              />
            </div>

            {/* Role Selection */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Institutional Permission Role
                </label>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Tap to select</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '7px' }}>
                {[
                  {
                    role: 'faculty' as UserRole,
                    title: 'Faculty Advisor',
                    icon: Crown,
                    color: '#B45309',
                    bg: '#FEF3C7',
                    border: '#FDE68A',
                    badge: 'Faculty',
                  },
                  {
                    role: 'coordinator' as UserRole,
                    title: 'Coordinator / President',
                    icon: ShieldCheck,
                    color: '#4338CA',
                    bg: '#EEF2FF',
                    border: '#C7D2FE',
                    badge: 'Leadership',
                  },
                  {
                    role: 'treasurer' as UserRole,
                    title: 'Treasurer',
                    icon: DollarSign,
                    color: '#047857',
                    bg: '#ECFDF5',
                    border: '#A7F3D0',
                    badge: 'Finance',
                  },
                  {
                    role: 'documentation' as UserRole,
                    title: 'Documentation Lead',
                    icon: FileText,
                    color: '#D97706',
                    bg: '#FFFBEB',
                    border: '#FDE68A',
                    badge: 'Records',
                  },
                  {
                    role: 'social_media' as UserRole,
                    title: 'Social Media Lead',
                    icon: Share2,
                    color: '#E11D48',
                    bg: '#FFF1F2',
                    border: '#FECDD3',
                    badge: 'Outreach',
                  },
                  {
                    role: 'volunteer' as UserRole,
                    title: 'Student Volunteer',
                    icon: QrCode,
                    color: '#BE185D',
                    bg: '#FCE7F3',
                    border: '#FBCFE8',
                    badge: 'Volunteer',
                  },
                  {
                    role: 'team_admin' as UserRole,
                    title: 'Squad Team Lead',
                    icon: Users2,
                    color: '#059669',
                    bg: '#ECFDF5',
                    border: '#A7F3D0',
                    badge: 'Squad Role',
                  },
                  {
                    role: 'member' as UserRole,
                    title: 'Squad Team Member',
                    icon: UserCheck,
                    color: '#0284C7',
                    bg: '#F0F9FF',
                    border: '#BAE6FD',
                    badge: 'Squad Role',
                  },
                ].map((item) => {
                  const isSelected = editRole === item.role;
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setEditRole(item.role)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '11px 12px',
                        borderRadius: '13px',
                        border: isSelected ? `2px solid ${item.color}` : '1.5px solid #E2E8F0',
                        backgroundColor: isSelected ? item.bg : '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.14s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                        width: '100%',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            backgroundColor: isSelected ? '#FFFFFF' : item.bg,
                            border: `1px solid ${item.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: item.color,
                            flexShrink: 0,
                          }}
                        >
                          <IconComponent size={20} strokeWidth={1.75} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#0F172A' : '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {item.title}
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '1.5px 6px', borderRadius: '5px', backgroundColor: isSelected ? '#FFFFFF' : '#F1F5F9', color: isSelected ? item.color : '#64748B', border: `1px solid ${item.border}` }}>
                              {item.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? `2px solid ${item.color}` : '2px solid #CBD5E1',
                          backgroundColor: isSelected ? item.color : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: '8px',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && <Check size={16} color="#FFFFFF" strokeWidth={1.75} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditionally rendered Assigned Squad (Only for Squad Team Lead or Squad Team Member) */}
            {(editRole === 'team_admin' || editRole === 'member') && (
              <div
                style={{
                  padding: '11px',
                  borderRadius: '14px',
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Assigned Squad
                  </label>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#D1FAE5', padding: '1.5px 7px', borderRadius: '999px' }}>
                    Required for Squad Roles
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '7px' }}>
                  {[
                    { name: 'Management', icon: Briefcase, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
                    { name: 'Promotion', icon: Megaphone, color: '#EC4899', bg: '#FDF2F8', border: '#FBCFE8' },
                    { name: 'Documentation', icon: FileText, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
                    { name: 'Entertainment', icon: Sparkles, color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
                  ].map((squad) => {
                    const isSquadSelected = editTeam === squad.name;
                    const SquadIcon = squad.icon;
                    return (
                      <button
                        key={squad.name}
                        type="button"
                        onClick={() => setEditTeam(squad.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          padding: '8px 10px',
                          borderRadius: '11px',
                          border: isSquadSelected ? `2px solid ${squad.color}` : '1.5px solid #E2E8F0',
                          backgroundColor: isSquadSelected ? squad.bg : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.14s ease',
                          textAlign: 'left',
                        }}
                      >
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '7px',
                            backgroundColor: isSquadSelected ? '#FFFFFF' : squad.bg,
                            border: `1px solid ${squad.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: squad.color,
                            flexShrink: 0,
                          }}
                        >
                          <SquadIcon size={16} strokeWidth={1.75} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: isSquadSelected ? '#0F172A' : '#334155' }}>
                            {squad.name}
                          </div>
                        </div>
                        {isSquadSelected && (
                          <Check size={16} color={squad.color} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{
                borderRadius: '999px',
                height: '44px',
                fontWeight: 800,
                fontSize: '13px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.28)',
                marginTop: '4px',
              }}
            >
              Save Member Permissions
            </button>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
      {/* Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#065F46',
              backgroundColor: '#D1FAE5',
              padding: '3px 9px',
              borderRadius: '999px',
              letterSpacing: '0.04em',
              border: '1px solid #A7F3D0',
              textTransform: 'uppercase',
            }}
          >
            ● Institutional Registry
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748B',
            }}
          >
            {users.length} Enrolled Scholars
          </span>
        </div>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 4px 0',
          }}
        >
          Members Directory
        </h1>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search scholars, email, or department..."
        resultsCount={filteredUsers.length}
        suggestions={[
          'Geomatics',
          'Management Squad',
          'Promotion Squad',
          'Documentation Squad',
          'Entertainment Squad',
        ]}
      />

      {/* Dropdown Filter Buttons: Role/Status & Squad */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '8px',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Dropdown Button 1: Filter Students by Role & Status */}
        <div style={{ position: 'relative', minWidth: 0, width: '100%' }}>
          <button
            type="button"
            onClick={() => {
              setIsRoleDropdownOpen(!isRoleDropdownOpen);
              setIsSquadDropdownOpen(false);
            }}
            style={{
              width: '100%',
              minWidth: 0,
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              backgroundColor: roleFilter !== 'All' ? '#F0FDF4' : '#FFFFFF',
              border: roleFilter !== 'All' ? '1.5px solid #10B981' : '1.5px solid #E2E8F0',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
              transition: 'all 140ms ease',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
              <Filter size={16} strokeWidth={1.75} color={roleFilter !== 'All' ? '#059669' : '#64748B'} style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: roleFilter !== 'All' ? '#047857' : '#1E293B',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeRoleOption.shortLabel}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '1.5px 5px',
                  borderRadius: '999px',
                  backgroundColor: roleFilter !== 'All' ? '#D1FAE5' : '#F1F5F9',
                  color: roleFilter !== 'All' ? '#047857' : '#64748B',
                  lineHeight: 1.2,
                }}
              >
                {activeRoleOption.count}
              </span>
              <ChevronDown
                size={16} strokeWidth={1.75}
                color="#64748B"
                style={{
                  transform: isRoleDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 150ms ease',
                  flexShrink: 0,
                }}
              />
            </div>
          </button>

          {/* Role Dropdown Menu */}
          {isRoleDropdownOpen && (
            <>
              <div
                onClick={() => setIsRoleDropdownOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: 'min(270px, calc(100vw - 32px))',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.14)',
                  zIndex: 50,
                  padding: '6px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {roleDropdownOptions.map((opt, idx) => {
                  const showHeader = idx === 0 || opt.section !== roleDropdownOptions[idx - 1].section;
                  return (
                    <React.Fragment key={opt.key}>
                      {showHeader && (
                        <div
                          style={{
                            padding: idx === 0 ? '4px 10px 4px' : '8px 10px 4px',
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#94A3B8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            borderTop: idx !== 0 ? '1px solid #F1F5F9' : 'none',
                            marginTop: idx !== 0 ? '4px' : '0',
                          }}
                        >
                          {opt.section}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setRoleFilter(opt.key);
                          setIsRoleDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          backgroundColor: roleFilter === opt.key ? '#ECFDF5' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 120ms ease',
                          marginBottom: '2px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              backgroundColor: opt.bg,
                              color: opt.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {opt.icon}
                          </div>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: roleFilter === opt.key ? 800 : 600,
                              color: roleFilter === opt.key ? '#047857' : '#1E293B',
                            }}
                          >
                            {opt.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#64748B',
                              backgroundColor: '#F1F5F9',
                              padding: '1.5px 6px',
                              borderRadius: '999px',
                            }}
                          >
                            {opt.count}
                          </span>
                          {roleFilter === opt.key && <Check size={16} strokeWidth={1.75} color="#059669" />}
                        </div>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Dropdown Button 2: Filter by Squad */}
        <div style={{ position: 'relative', minWidth: 0, width: '100%' }}>
          <button
            type="button"
            onClick={() => {
              setIsSquadDropdownOpen(!isSquadDropdownOpen);
              setIsRoleDropdownOpen(false);
            }}
            style={{
              width: '100%',
              minWidth: 0,
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              backgroundColor: teamFilter !== 'All' ? '#EFF6FF' : '#FFFFFF',
              border: teamFilter !== 'All' ? '1.5px solid #3B82F6' : '1.5px solid #E2E8F0',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
              transition: 'all 140ms ease',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
              <Layers size={16} strokeWidth={1.75} color={teamFilter !== 'All' ? '#2563EB' : '#64748B'} style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: teamFilter !== 'All' ? '#1D4ED8' : '#1E293B',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeSquadOption.shortLabel}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '1.5px 5px',
                  borderRadius: '999px',
                  backgroundColor: teamFilter !== 'All' ? '#DBEAFE' : '#F1F5F9',
                  color: teamFilter !== 'All' ? '#1D4ED8' : '#64748B',
                  lineHeight: 1.2,
                }}
              >
                {activeSquadOption.count}
              </span>
              <ChevronDown
                size={16} strokeWidth={1.75}
                color="#64748B"
                style={{
                  transform: isSquadDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 150ms ease',
                  flexShrink: 0,
                }}
              />
            </div>
          </button>

          {/* Squad Dropdown Menu */}
          {isSquadDropdownOpen && (
            <>
              <div
                onClick={() => setIsSquadDropdownOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: 'min(240px, calc(100vw - 32px))',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.14)',
                  zIndex: 50,
                  padding: '6px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                <div style={{ padding: '6px 10px 4px', fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Filter by Squad
                </div>
                {squadDropdownOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setTeamFilter(opt.key);
                      setIsSquadDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      backgroundColor: teamFilter === opt.key ? '#EFF6FF' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 120ms ease',
                      marginBottom: '2px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: teamFilter === opt.key ? 800 : 600,
                        color: teamFilter === opt.key ? '#1D4ED8' : '#1E293B',
                      }}
                    >
                      {opt.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#64748B',
                          backgroundColor: '#F1F5F9',
                          padding: '1.5px 6px',
                          borderRadius: '999px',
                        }}
                      >
                        {opt.count}
                      </span>
                      {teamFilter === opt.key && <Check size={16} strokeWidth={1.75} color="#2563EB" />}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scholars List: Elevated Professional Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Roster • {filteredUsers.length} Students
          </span>
          {(roleFilter !== 'All' || teamFilter !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setRoleFilter('All');
                setTeamFilter('All');
                setSearchQuery('');
              }}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#EF4444',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredUsers.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E8ECF2',
              padding: '32px 16px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
              }}
            >
              <Users2 size={24} strokeWidth={1.75} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
              No Scholars Found
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
              Try refining your search query or clear the active role and squad filters.
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const badge = getRoleBadgeStyle(user);
            return (
              <div
                key={user.uid}
                onClick={() => setSelectedUserId(user.uid)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1.5px solid #F1F5F9',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#A7F3D0';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(16, 185, 129, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#F1F5F9';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
                }}
              >
                {/* Left: Avatar + Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <AppAvatar name={user.name} avatarUrl={user.avatarUrl} size={48} strokeWidth={1.75} />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0px',
                        right: '0px',
                        width: '11px',
                        height: '11px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        border: '2px solid #FFFFFF',
                      }}
                      title="Enrolled Scholar"
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '14px',
                          color: '#0F172A',
                          letterSpacing: '-0.01em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user.name}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: badge.color,
                          backgroundColor: badge.bg,
                          border: `1px solid ${badge.border}`,
                          padding: '1.5px 7px',
                          borderRadius: '999px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748B',
                        marginTop: '2px',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.email}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {user.team && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#047857',
                            backgroundColor: '#ECFDF5',
                            padding: '1.5px 6px',
                            borderRadius: '6px',
                            border: '1px solid #A7F3D0',
                          }}
                        >
                          {user.team} Squad
                        </span>
                      )}
                      {user.yearOfStudy && user.yearOfStudy !== 'Faculty Staff' && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#4338CA',
                            backgroundColor: '#EEF2FF',
                            padding: '1.5px 6px',
                            borderRadius: '6px',
                            border: '1px solid #C7D2FE',
                          }}
                        >
                          {user.yearOfStudy}
                        </span>
                      )}
                      {user.department && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#64748B',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {user.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Chevron Arrow */}
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94A3B8',
                    flexShrink: 0,
                    marginLeft: '8px',
                  }}
                >
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
