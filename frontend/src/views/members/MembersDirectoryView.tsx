import React, { useState, useMemo } from 'react';
import {
  Check,
  Building,
  GraduationCap,
  Mail,
  Phone,
  UserPlus,
  Calendar,
  CheckSquare,
  History,
  Power,
  Edit3,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Copy,
  QrCode,
  Layers,
  Crown,
  Megaphone,
  FileText,
  DollarSign,
  Music,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { UserModel, UserRole } from '../../types';
import { getRolePermissions } from '../../core/permissions';
import {
  Overline,
  SearchBar,
  FilterPill,
  MemberCard,
  BottomSheet,
  Toast,
  RoleBadge,
  EmptyState,
  ConfirmDialog,
} from '../../components';
import { AppAvatar } from '../../components/common/AppAvatar';

export const MembersDirectoryView: React.FC = () => {
  const {
    users,
    currentUser,
    setSelectedUserId,
    updateUserRoleAndTeam,
    changeStudentPost,
    addStudentToTeam,
  } = useApp();

  const perms = getRolePermissions(currentUser.role);

  // Active Main Tab: Roster vs Join Requests
  const [activeTabMode, setActiveTabMode] = useState<'roster' | 'join_requests'>('roster');

  // Search & Filter State for main directory
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [squadFilter, setSquadFilter] = useState('All');

  const [isRoleSheetOpen, setIsRoleSheetOpen] = useState(false);
  const [isSquadSheetOpen, setIsSquadSheetOpen] = useState(false);

  // Full-page active sub-screens
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserModel | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Post Designation State inside Scholar Dossier
  const [selectedPostCard, setSelectedPostCard] = useState<string>('Promotion Team Lead');
  const [selectedPostRole, setSelectedPostRole] = useState<UserRole>('team_admin');
  const [isConfirmPostOpen, setIsConfirmPostOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [modalSelectedPost, setModalSelectedPost] = useState<string>('Promotion Team Lead');
  const [modalSelectedRole, setModalSelectedRole] = useState<UserRole>('team_admin');
  const [modalSelectedSquad, setModalSelectedSquad] = useState<string>('Promotion');
  const [expandedSquad, setExpandedSquad] = useState<string | null>('Promotion');

  // New Student Enrollment Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentDept, setNewStudentDept] = useState('Geoinformatics Engineering');
  const [newStudentYear, setNewStudentYear] = useState('1st Year');
  const [newStudentSquad, setNewStudentSquad] = useState<'Management' | 'Promotion' | 'Documentation' | 'Entertainment'>('Management');
  const [newStudentVolunteer, setNewStudentVolunteer] = useState(true);

  // Toast Feedback State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Join Requests State
  const [joinRequests, setJoinRequests] = useState([
    {
      id: 'req_1',
      name: 'Anjali R.',
      email: 'anjali.r@college.edu',
      department: 'Cartography & Spatial Media',
      year: '2nd Year',
      requestedSquad: 'Promotion',
      requestedRole: 'Social Media Graphics Designer',
      portfolioNote: 'Proficient in Adobe Illustrator, Blender, and GIS story maps.',
    },
    {
      id: 'req_2',
      name: 'Rohan Verma',
      email: 'rohan.v@college.edu',
      department: 'Remote Sensing & Drone Systems',
      year: '1st Year',
      requestedSquad: 'Management',
      requestedRole: 'Gate Logistics Volunteer',
      portfolioNote: 'Drone pilot license certified, event usher experience.',
    },
    {
      id: 'req_3',
      name: 'Fatima Zahra',
      email: 'fatima.z@college.edu',
      department: 'Environmental Conservation',
      year: '3rd Year',
      requestedSquad: 'Documentation',
      requestedRole: 'Field Report Scribe',
      portfolioNote: 'Authored chapter seminar summaries and MoM transcripts.',
    },
  ]);

  // Available Officer Post Designations
  const availableOfficerPosts = [
    {
      id: 'Club President',
      role: 'admin' as UserRole,
      title: 'Club President',
      squad: 'Management',
      icon: <Crown size={18} className="text-amber-500" />,
      desc: 'Overall student executive leadership, event approvals, and chapter representation.',
      clearance: 'Platform Admin',
    },
    {
      id: 'Promotion Team Lead',
      role: 'team_admin' as UserRole,
      title: 'Promotion Team Lead',
      squad: 'Promotion',
      icon: <Megaphone size={18} className="text-rose-500" />,
      desc: 'Oversees publicity campaigns, social media assets, campus posters, and engagement.',
      clearance: 'Squad Lead',
    },
    {
      id: 'Promotion Team Member',
      role: 'member' as UserRole,
      title: 'Promotion Team Member',
      squad: 'Promotion',
      icon: <Users size={18} className="text-rose-500" />,
      desc: 'Designs visual assets, manages social media channels, and coordinates campaign coverage.',
      clearance: 'Squad Member',
    },
    {
      id: 'Promotion Lead',
      role: 'team_admin' as UserRole,
      title: 'Promotion Lead',
      squad: 'Promotion',
      icon: <Megaphone size={18} className="text-rose-500" />,
      desc: 'Oversees publicity campaigns, social media assets, campus posters, and engagement.',
      clearance: 'Squad Lead',
    },
    {
      id: 'Documentation Team Lead',
      role: 'team_admin' as UserRole,
      title: 'Documentation Team Lead',
      squad: 'Documentation',
      icon: <FileText size={18} className="text-amber-600" />,
      desc: 'Responsible for chapter event photography, drone captures, minutes of meetings, and archives.',
      clearance: 'Squad Lead',
    },
    {
      id: 'Documentation Team Member',
      role: 'member' as UserRole,
      title: 'Documentation Team Member',
      squad: 'Documentation',
      icon: <Users size={18} className="text-amber-500" />,
      desc: 'Captures event photos, drafts meeting notes, and indexes archival records.',
      clearance: 'Squad Member',
    },
    {
      id: 'Documentation Lead',
      role: 'team_admin' as UserRole,
      title: 'Documentation Lead',
      squad: 'Documentation',
      icon: <FileText size={18} className="text-amber-600" />,
      desc: 'Responsible for chapter event photography, drone captures, minutes of meetings, and archives.',
      clearance: 'Squad Lead',
    },
    {
      id: 'Treasurer Lead',
      role: 'team_admin' as UserRole,
      title: 'Treasurer Lead',
      squad: 'Management',
      icon: <DollarSign size={18} className="text-emerald-600" />,
      desc: 'Manages chapter grants, expense vouchers, equipment inventory, and procurement receipts.',
      clearance: 'Squad Lead',
    },
    {
      id: 'Entertainment Team Lead',
      role: 'team_admin' as UserRole,
      title: 'Entertainment Team Lead',
      squad: 'Entertainment',
      icon: <Music size={18} className="text-indigo-500" />,
      desc: 'Orchestrates live stage activities, seminar hosting, quizzes, and icebreaker sessions.',
      clearance: 'Squad Lead',
    },
    {
      id: 'Entertainment Team Member',
      role: 'member' as UserRole,
      title: 'Entertainment Team Member',
      squad: 'Entertainment',
      icon: <Users size={18} className="text-indigo-400" />,
      desc: 'Assists stage cueing, audio-visual operation, and attendee interactive segments.',
      clearance: 'Squad Member',
    },
    {
      id: 'Entertainment Lead',
      role: 'team_admin' as UserRole,
      title: 'Entertainment Lead',
      squad: 'Entertainment',
      icon: <Music size={18} className="text-indigo-500" />,
      desc: 'Orchestrates live stage activities, seminar hosting, quizzes, and icebreaker sessions.',
      clearance: 'Squad Lead',
    },
    {
      id: 'Management Team Lead',
      role: 'team_admin' as UserRole,
      title: 'Management Team Lead',
      squad: 'Management',
      icon: <Layers size={18} className="text-teal-600" />,
      desc: 'Coordinates logistics, venue scheduling, safety protocol compliance, and roster roll calls.',
      clearance: 'Squad Lead',
    },
    {
      id: 'Management Team Member',
      role: 'member' as UserRole,
      title: 'Management Team Member',
      squad: 'Management',
      icon: <Users size={18} className="text-teal-500" />,
      desc: 'Assists gate logistics, venue arrangements, and chapter material handling.',
      clearance: 'Squad Member',
    },
    {
      id: 'Management Lead',
      role: 'team_admin' as UserRole,
      title: 'Management Lead',
      squad: 'Management',
      icon: <Layers size={18} className="text-teal-600" />,
      desc: 'Coordinates logistics, venue scheduling, safety protocol compliance, and roster roll calls.',
      clearance: 'Squad Lead',
    },
    {
      id: 'Student Volunteer',
      role: 'volunteer' as UserRole,
      title: 'Student Volunteer',
      squad: 'Management',
      icon: <QrCode size={18} className="text-cyan-600" />,
      desc: 'Equipped with dynamic scanner pass for attendee check-in and turnstile security verification.',
      clearance: 'Volunteer Pass',
    },
    {
      id: 'Senior Scholar',
      role: 'member' as UserRole,
      title: 'Senior Scholar',
      squad: 'Promotion',
      icon: <User size={18} className="text-slate-600" />,
      desc: 'Active student participant with access to chapter expeditions, research projects, and forums.',
      clearance: 'Member Access',
    },
  ];

  // Structured Squad & Role Options for Popup Modal
  const squadRoleGroups = [
    {
      id: 'single_president',
      isSquadGroup: false as const,
      post: {
        id: 'Club President',
        role: 'admin' as UserRole,
        title: 'Club President',
        squad: 'Management',
        icon: <Crown size={18} className="text-amber-500" />,
        desc: 'Overall student executive leadership, event approvals, and chapter representation.',
        clearance: 'Platform Admin',
      },
    },
    {
      id: 'group_promotion',
      isSquadGroup: true as const,
      squadKey: 'Promotion',
      squadName: 'Promotion Squad',
      icon: <Megaphone size={18} className="text-rose-500" />,
      desc: 'Publicity campaigns, social media assets, posters, and campus outreach.',
      roles: [
        {
          id: 'Promotion Team Lead',
          title: 'Promotion Team Lead',
          role: 'team_admin' as UserRole,
          squad: 'Promotion',
          icon: <Megaphone size={16} className="text-rose-600" />,
          desc: 'Oversees publicity campaigns, social media assets, campus posters, and engagement.',
          clearance: 'Squad Lead',
          tierBadge: 'Lead',
        },
        {
          id: 'Promotion Team Member',
          title: 'Promotion Team Member',
          role: 'member' as UserRole,
          squad: 'Promotion',
          icon: <Users size={16} className="text-rose-500" />,
          desc: 'Designs visual assets, manages social media channels, and coordinates campaign coverage.',
          clearance: 'Squad Member',
          tierBadge: 'Member',
        },
      ],
    },
    {
      id: 'group_documentation',
      isSquadGroup: true as const,
      squadKey: 'Documentation',
      squadName: 'Documentation Squad',
      icon: <FileText size={18} className="text-amber-600" />,
      desc: 'Chapter event photography, drone survey media, meeting minutes, and archives.',
      roles: [
        {
          id: 'Documentation Team Lead',
          title: 'Documentation Team Lead',
          role: 'team_admin' as UserRole,
          squad: 'Documentation',
          icon: <FileText size={16} className="text-amber-600" />,
          desc: 'Responsible for chapter event photography, drone captures, minutes of meetings, and archives.',
          clearance: 'Squad Lead',
          tierBadge: 'Lead',
        },
        {
          id: 'Documentation Team Member',
          title: 'Documentation Team Member',
          role: 'member' as UserRole,
          squad: 'Documentation',
          icon: <Users size={16} className="text-amber-500" />,
          desc: 'Captures event photos, drafts meeting notes, and indexes archival records.',
          clearance: 'Squad Member',
          tierBadge: 'Member',
        },
      ],
    },
    {
      id: 'group_management',
      isSquadGroup: true as const,
      squadKey: 'Management',
      squadName: 'Management Squad',
      icon: <Layers size={18} className="text-teal-600" />,
      desc: 'Coordinates logistics, venue scheduling, compliance, and chapter operations.',
      roles: [
        {
          id: 'Management Team Lead',
          title: 'Management Team Lead',
          role: 'team_admin' as UserRole,
          squad: 'Management',
          icon: <Layers size={16} className="text-teal-600" />,
          desc: 'Coordinates logistics, venue scheduling, safety protocol compliance, and roster roll calls.',
          clearance: 'Squad Lead',
          tierBadge: 'Lead',
        },
        {
          id: 'Management Team Member',
          title: 'Management Team Member',
          role: 'member' as UserRole,
          squad: 'Management',
          icon: <Users size={16} className="text-teal-500" />,
          desc: 'Assists gate logistics, venue arrangements, and chapter material handling.',
          clearance: 'Squad Member',
          tierBadge: 'Member',
        },
      ],
    },
    {
      id: 'group_entertainment',
      isSquadGroup: true as const,
      squadKey: 'Entertainment',
      squadName: 'Entertainment Squad',
      icon: <Music size={18} className="text-indigo-500" />,
      desc: 'Orchestrates live stage activities, seminar hosting, quizzes, and icebreakers.',
      roles: [
        {
          id: 'Entertainment Team Lead',
          title: 'Entertainment Team Lead',
          role: 'team_admin' as UserRole,
          squad: 'Entertainment',
          icon: <Music size={16} className="text-indigo-600" />,
          desc: 'Orchestrates live stage activities, seminar hosting, quizzes, and icebreaker sessions.',
          clearance: 'Squad Lead',
          tierBadge: 'Lead',
        },
        {
          id: 'Entertainment Team Member',
          title: 'Entertainment Team Member',
          role: 'member' as UserRole,
          squad: 'Entertainment',
          icon: <Users size={16} className="text-indigo-500" />,
          desc: 'Assists stage cueing, audio-visual operation, and attendee interactive segments.',
          clearance: 'Squad Member',
          tierBadge: 'Member',
        },
      ],
    },
    {
      id: 'single_treasurer',
      isSquadGroup: false as const,
      post: {
        id: 'Treasurer Lead',
        role: 'team_admin' as UserRole,
        title: 'Treasurer Lead',
        squad: 'Management',
        icon: <DollarSign size={18} className="text-emerald-600" />,
        desc: 'Manages chapter grants, expense vouchers, equipment inventory, and procurement receipts.',
        clearance: 'Squad Lead',
      },
    },
    {
      id: 'single_volunteer',
      isSquadGroup: false as const,
      post: {
        id: 'Student Volunteer',
        role: 'volunteer' as UserRole,
        title: 'Student Volunteer',
        squad: 'Management',
        icon: <QrCode size={18} className="text-cyan-600" />,
        desc: 'Equipped with dynamic scanner pass for attendee check-in and turnstile security verification.',
        clearance: 'Volunteer Pass',
      },
    },
  ];

  // Squad of currently selected member (to exclude whichever squad they are currently enrolled in)
  const currentSelectedSquad = useMemo(() => {
    if (!selectedUserDetail) return '';
    const team = selectedUserDetail.team || '';
    if (team) return team.toLowerCase();
    const postOrRole = (selectedUserDetail.post || selectedUserDetail.teamRole || '').toLowerCase();
    if (postOrRole.includes('promotion')) return 'promotion';
    if (postOrRole.includes('documentation')) return 'documentation';
    if (postOrRole.includes('management')) return 'management';
    if (postOrRole.includes('entertainment')) return 'entertainment';
    return '';
  }, [selectedUserDetail]);

  // Available squad role groups for Change Post modal, excluding member's current squad
  const visibleSquadRoleGroups = useMemo(() => {
    if (!currentSelectedSquad) return squadRoleGroups;
    return squadRoleGroups.filter((group) => {
      if (group.isSquadGroup && group.squadKey.toLowerCase() === currentSelectedSquad) {
        return false;
      }
      return true;
    });
  }, [squadRoleGroups, currentSelectedSquad]);

  // Filtered Roster Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesDept = (u.department || '').toLowerCase().includes(q);
        const matchesTeam = (u.team || '').toLowerCase().includes(q);
        const matchesPost = (u.post || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesDept && !matchesTeam && !matchesPost) {
          return false;
        }
      }

      if (roleFilter !== 'All') {
        if (roleFilter === 'leads') {
          const isLead =
            u.role === 'team_admin' ||
            u.role === 'admin' ||
            u.role === 'super_admin' ||
            u.post?.toLowerCase().includes('lead');
          if (!isLead) return false;
        } else if (roleFilter === '1st_year') {
          if (!u.yearOfStudy?.toLowerCase().includes('1st')) return false;
        } else if (roleFilter === '2nd_year') {
          if (!u.yearOfStudy?.toLowerCase().includes('2nd')) return false;
        } else if (roleFilter === '3rd_year') {
          if (!u.yearOfStudy?.toLowerCase().includes('3rd')) return false;
        } else if (roleFilter === '4th_year') {
          if (
            !u.yearOfStudy?.toLowerCase().includes('4th') &&
            !u.yearOfStudy?.toLowerCase().includes('final')
          )
            return false;
        }
      }

      if (squadFilter !== 'All') {
        if (!u.team || u.team.toLowerCase() !== squadFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, squadFilter]);

  const handleMemberClick = (user: UserModel) => {
    setSelectedUserDetail(user);
    setSelectedUserId(user.uid);
    setSelectedPostCard(user.post || 'Student Volunteer');
    setSelectedPostRole(user.role);
  };

  const handleToggleStatus = () => {
    if (!selectedUserDetail) return;
    const newStatus: UserModel['status'] = selectedUserDetail.status === 'active' ? 'disabled' : 'active';
    const updated: UserModel = { ...selectedUserDetail, status: newStatus };
    setSelectedUserDetail(updated);
    updateUserRoleAndTeam(selectedUserDetail.uid, selectedUserDetail.role, selectedUserDetail.team);
    showToast(
      newStatus === 'active'
        ? `✓ Scholar account restored to Active.`
        : `Scholar membership suspended.`
    );
  };

  const handleOpenChangeRoleModal = () => {
    // Determine the member's current squad
    const memberSquad = (
      selectedUserDetail?.team ||
      (selectedUserDetail?.post || '').toLowerCase().includes('promotion')
        ? 'promotion'
        : (selectedUserDetail?.post || '').toLowerCase().includes('documentation')
        ? 'documentation'
        : (selectedUserDetail?.post || '').toLowerCase().includes('management')
        ? 'management'
        : (selectedUserDetail?.post || '').toLowerCase().includes('entertainment')
        ? 'entertainment'
        : ''
    ).toLowerCase();

    // Available groups excluding whichever squad the member is currently enrolled in
    const availableGroups = squadRoleGroups.filter((group) => {
      if (group.isSquadGroup && group.squadKey.toLowerCase() === memberSquad) {
        return false;
      }
      return true;
    });

    // Default selection: pick first visible squad or standalone post
    const firstSquad = availableGroups.find((g) => g.isSquadGroup);
    if (firstSquad && firstSquad.isSquadGroup) {
      setModalSelectedPost(firstSquad.roles[0].title);
      setModalSelectedRole(firstSquad.roles[0].role);
      setModalSelectedSquad(firstSquad.squadKey);
      setExpandedSquad(firstSquad.squadKey);
    } else if (availableGroups.length > 0) {
      const first = availableGroups[0];
      if (!first.isSquadGroup) {
        setModalSelectedPost(first.post.title);
        setModalSelectedRole(first.post.role);
        setModalSelectedSquad(first.post.squad);
        setExpandedSquad(null);
      }
    }

    setIsChangeRoleModalOpen(true);
  };

  const handleSelectRoleInModal = (title: string, role: UserRole, squad: string) => {
    setModalSelectedPost(title);
    setModalSelectedRole(role);
    setModalSelectedSquad(squad);
  };

  const handleAssignRoleFromPopup = () => {
    if (!selectedUserDetail) return;
    changeStudentPost(selectedUserDetail.uid, modalSelectedPost, modalSelectedRole);
    updateUserRoleAndTeam(selectedUserDetail.uid, modalSelectedRole, modalSelectedSquad);
    showToast(`✓ Confirmed: ${selectedUserDetail.name} designated as ${modalSelectedPost}`);
    setIsChangeRoleModalOpen(false);
    setSelectedUserDetail((prev) =>
      prev
        ? {
            ...prev,
            post: modalSelectedPost,
            role: modalSelectedRole,
            team: modalSelectedSquad,
          }
        : null
    );
  };

  const handleConfirmPostChange = () => {
    if (!selectedUserDetail) return;

    changeStudentPost(selectedUserDetail.uid, selectedPostCard, selectedPostRole);
    updateUserRoleAndTeam(selectedUserDetail.uid, selectedPostRole, selectedUserDetail.team);

    showToast(`✓ Confirmed: ${selectedUserDetail.name} is now ${selectedPostCard}`);
    setIsConfirmPostOpen(false);
    setSelectedUserDetail((prev) =>
      prev
        ? {
            ...prev,
            post: selectedPostCard,
            role: selectedPostRole,
          }
        : null
    );
  };

  const handleApproveJoin = (id: string, name: string, squad: string) => {
    setJoinRequests((prev) => prev.filter((r) => r.id !== id));
    showToast(`✓ Approved & Inducted: ${name} into ${squad} Squad`);
  };

  const handleRejectJoin = (id: string, name: string) => {
    setJoinRequests((prev) => prev.filter((r) => r.id !== id));
    showToast(`Application declined for ${name}`);
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;

    const emailFormatted = newStudentEmail.includes('@')
      ? newStudentEmail.trim().toLowerCase()
      : `${newStudentEmail.trim().toLowerCase()}@college.edu`;

    addStudentToTeam({
      name: newStudentName.trim(),
      email: emailFormatted,
      department: newStudentDept,
      yearOfStudy: newStudentYear,
      team: newStudentSquad,
      role: newStudentVolunteer ? 'volunteer' : 'member',
      teamRole: newStudentVolunteer ? 'Student Volunteer' : 'Active Member',
      isVolunteer: newStudentVolunteer,
      status: 'active',
    });

    showToast(`✓ Successfully enrolled ${newStudentName}!`);
    setIsAddStudentOpen(false);
    setNewStudentName('');
    setNewStudentEmail('');
  };

  const handleCopyEmail = (email: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      showToast(`Copied ${email} to clipboard!`);
    }
  };

  // =========================================================================
  // VIEW MODE 1: FULL-PAGE SCHOLAR INDUCTION STUDIO ("Enroll Scholar")
  // =========================================================================
  if (isAddStudentOpen) {
    const previewEmail = newStudentEmail.trim()
      ? newStudentEmail.includes('@')
        ? newStudentEmail
        : `${newStudentEmail}@college.edu`
      : 'scholar@college.edu';

    const squadThemeColors = {
      Management: { bg: '#E8FBF8', border: '#99F6E4', text: '#0F766E' },
      Promotion: { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C' },
      Documentation: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
      Entertainment: { bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9' },
    };

    return (
      <div className="full-page-subview-root">
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

        {/* Top Navigation & Breadcrumbs */}
        <div className="full-page-breadcrumb-bar">
          <button
            type="button"
            onClick={() => setIsAddStudentOpen(false)}
            className="executive-back-btn touch-target-44"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Back to Members Directory</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Members Directory</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-700">Induction Studio</span>
          </div>
        </div>

        {/* Header Hero */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Overline pill dot>
              SCHOLAR ONBOARDING & COMMISSIONING
            </Overline>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Institutional Roster Ready
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            Enroll Scholar into Chapter
          </h1>
        </div>

        {/* 2-Column Enrollment Studio */}
        <div className="enrollment-studio-grid">
          {/* Left Column: Comprehensive Interactive Form */}
          <form onSubmit={handleAddStudentSubmit} className="studio-form-card">
            {/* Section 1: Academic Identity */}
            <div className="studio-form-section">
              <div className="studio-section-heading">
                <GraduationCap size={16} className="text-emerald-600" />
                <span>1. Academic Identity & Institutional Credentials</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Scholar Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Liam Washington"
                    className="w-full pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all bg-white"
                    style={{ height: '48px' }}
                  />
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  College Institutional Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="e.g. liam.w@college.edu"
                    className="w-full pl-10 pr-24 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all bg-white"
                    style={{ height: '48px' }}
                  />
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md pointer-events-none">
                    @college.edu
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Academic Department
                  </label>
                  <select
                    value={newStudentDept}
                    onChange={(e) => setNewStudentDept(e.target.value)}
                    className="w-full px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none bg-white focus:border-emerald-500"
                    style={{ height: '48px' }}
                  >
                    <option value="Geoinformatics Engineering">Geoinformatics Engineering</option>
                    <option value="Geography & Geomatics">Geography & Geomatics</option>
                    <option value="Remote Sensing & Drone Systems">Remote Sensing & Drone Systems</option>
                    <option value="Environmental Geosciences">Environmental Geosciences</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Year of Study
                  </label>
                  <div className="year-chips-grid">
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setNewStudentYear(yr)}
                        className={`year-chip-button touch-target-44 ${
                          newStudentYear === yr ? 'is-selected' : ''
                        }`}
                      >
                        <span>{yr}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Squad Allocation */}
            <div className="studio-form-section">
              <div className="studio-section-heading">
                <Layers size={16} className="text-teal-600" />
                <span>2. Operational Squad Allocation</span>
              </div>

              <div className="squad-selector-grid">
                {[
                  {
                    name: 'Management' as const,
                    icon: <Building size={18} className="text-teal-600" />,
                    title: 'Management Squad',
                    desc: 'Chapter operations, scheduling, turnstile coordination & executive reporting.',
                  },
                  {
                    name: 'Promotion' as const,
                    icon: <Megaphone size={18} className="text-rose-500" />,
                    title: 'Promotion Squad',
                    desc: 'Public outreach, campus campaigns, posters, digital design & event engagement.',
                  },
                  {
                    name: 'Documentation' as const,
                    icon: <FileText size={18} className="text-amber-600" />,
                    title: 'Documentation Squad',
                    desc: 'Drone surveys, photogrammetry archives, MoMs transcripts & official publications.',
                  },
                  {
                    name: 'Entertainment' as const,
                    icon: <Music size={18} className="text-indigo-500" />,
                    title: 'Entertainment Squad',
                    desc: 'Cultural seminars, live stage hosting, soundcheck, and audience coordination.',
                  },
                ].map((sq) => {
                  const isSelected = newStudentSquad === sq.name;
                  return (
                    <div
                      key={sq.name}
                      onClick={() => setNewStudentSquad(sq.name)}
                      className={`squad-option-card ${isSelected ? 'is-selected' : ''}`}
                    >
                      <div className="p-2 rounded-xl bg-slate-50 shrink-0">
                        {sq.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{sq.title}</span>
                          {isSelected && <Check size={16} className="text-teal-600 stroke-[2.5]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Privileges & Initial Commissioning */}
            <div className="studio-form-section">
              <div className="studio-section-heading">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>3. Initial Role & Privileges</span>
              </div>

              <div
                onClick={() => setNewStudentVolunteer(!newStudentVolunteer)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  newStudentVolunteer
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                    newStudentVolunteer
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {newStudentVolunteer && <Check size={14} strokeWidth={3} />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Commission as Event Volunteer (Enable Dynamic QR Camera Scanner)
                  </span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="px-5 py-2.5 rounded-full font-bold text-xs text-slate-600 hover:bg-slate-100 min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-95 min-h-[44px] cursor-pointer"
              >
                <UserPlus size={16} strokeWidth={2} />
                <span>Confirm & Enroll Scholar</span>
              </button>
            </div>
          </form>

          {/* Right Column: Live Digital ID Card Preview */}
          <div className="live-preview-box">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Live Credential Preview
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Auto-Updating
              </span>
            </div>

            {/* Preview Card */}
            <div className="digital-id-pass-card">
              <div className="digital-id-header">
                <div>
                  <span className="text-[10px] font-extrabold tracking-widest text-emerald-200 uppercase block">
                    Green Eco Organization
                  </span>
                  <span className="text-xs font-bold text-white">Student Chapter Pass</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-bold text-white border border-white/30">
                  {newStudentSquad} Squad
                </div>
              </div>

              <div className="digital-id-body">
                <AppAvatar
                  name={newStudentName.trim() || 'New Scholar'}
                  size={52}
                  className="border-2 border-white/60 shadow-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-white truncate">
                    {newStudentName.trim() || 'Scholar Full Name'}
                  </h3>
                  <span className="text-xs text-emerald-100 truncate font-medium block">
                    {previewEmail}
                  </span>
                  <span className="text-[11px] text-emerald-200/90 font-medium mt-1 truncate block">
                    {newStudentDept} • {newStudentYear}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/20">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-emerald-200 uppercase">Roll Number</span>
                  <span className="text-xs font-mono font-bold text-white">GEO-2026-PENDING</span>
                </div>

                <div className="digital-id-qr-box">
                  <QRCodeSVG
                    value={`GEOHUB:NEW:${previewEmail}`}
                    size={48}
                    bgColor="#FFFFFF"
                    fgColor="#064E3B"
                  />
                </div>
              </div>
            </div>

            {/* Induction Guide Notice */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed font-medium">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <Sparkles size={15} className="text-emerald-600" />
                <span>Instant Account Commissioning</span>
              </div>
              The enrolled scholar will be dispatched an onboarding welcome bulletin. Their credentials will be authenticated automatically through the institutional college portal.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: FULL-PAGE SCHOLAR PROFILE DOSSIER & GOVERNANCE DESK
  // =========================================================================
  if (selectedUserDetail) {
    const isSuspended = selectedUserDetail.status === 'disabled';

    return (
      <div className="full-page-subview-root">
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

        {/* Confirmation Dialog for Post Change */}
        <ConfirmDialog
          isOpen={isConfirmPostOpen}
          onClose={() => setIsConfirmPostOpen(false)}
          onConfirm={handleConfirmPostChange}
          title="Confirm Post Designation"
          message={`Are you sure you want to officially designate ${selectedUserDetail.name} as ${selectedPostCard}? This will update chapter executive records and dispatch an official appointment notification.`}
          confirmLabel="Confirm Designation"
          cancelLabel="Cancel"
        />

        {/* Top Navigation & Breadcrumbs */}
        <div className="full-page-breadcrumb-bar">
          <button
            type="button"
            onClick={() => setSelectedUserDetail(null)}
            className="executive-back-btn touch-target-44"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Back to Members Directory</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Members Directory</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-400">Scholars</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800">{selectedUserDetail.name}</span>
          </div>
        </div>

        {/* Executive Hero Banner Card - Premium Rebuild */}
        <div className="scholar-hero-card">
          {/* Atmospheric Top Banner Cover */}
          <div className="scholar-cover-banner">
            <span className="scholar-cover-tag">
              <Sparkles size={11} className="text-emerald-300" />
              <span>Official Chapter Dossier</span>
            </span>
            <span className="scholar-cover-uid">
              UID #{selectedUserDetail.uid.replace(/^u_?/, '').toUpperCase().padStart(4, '0')}
            </span>
          </div>

          <div className="scholar-card-body">
            {/* Profile Identity Row */}
            <div className="scholar-profile-main">
              <div className="scholar-identity-group">
                <div className="scholar-avatar-frame">
                  <AppAvatar
                    name={selectedUserDetail.name}
                    avatarUrl={selectedUserDetail.avatarUrl}
                    size={72}
                    isOnline={selectedUserDetail.status === 'active'}
                  />
                  <div
                    className={`scholar-status-badge-anchor ${
                      isSuspended ? 'is-suspended' : 'is-active'
                    }`}
                    title={isSuspended ? 'Account Suspended' : 'Active Verified'}
                  >
                    {isSuspended ? (
                      <Power size={11} strokeWidth={3} />
                    ) : (
                      <Check size={12} strokeWidth={3} />
                    )}
                  </div>
                </div>

                <div className="scholar-identity-meta">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="scholar-name-heading">{selectedUserDetail.name}</h1>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs ${
                        isSuspended
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSuspended ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                        }`}
                      />
                      <span>{isSuspended ? 'Suspended Account' : 'Active Verified Scholar'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
                    <span className="text-slate-700 font-bold">
                      {selectedUserDetail.department || 'Geology'}
                    </span>
                    <span>•</span>
                    <span>{selectedUserDetail.yearOfStudy || '4th Year'}</span>
                    <span>•</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {selectedUserDetail.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Quick Actions (Suspend / Restore) */}
              {perms.canManageMembers && (
                <div className="shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={isSuspended ? 'btn-restore-scholar' : 'btn-suspend-scholar'}
                  >
                    <Power size={14} strokeWidth={2.2} />
                    <span>{isSuspended ? 'Restore to Active' : 'Suspend Membership'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dedicated Executive Officer Post Showcase Hub */}
            <div className="scholar-post-hub">
              <div className="scholar-post-main">
                {(() => {
                  const squadName = (selectedUserDetail.team || '').toLowerCase();
                  const postTitle = (
                    selectedUserDetail.post ||
                    selectedUserDetail.teamRole ||
                    ''
                  ).toLowerCase();
                  if (postTitle.includes('president') || selectedUserDetail.role === 'admin') {
                    return (
                      <div className="scholar-squad-avatar-box bg-amber-100 text-amber-700">
                        <Crown size={22} />
                      </div>
                    );
                  }
                  if (squadName.includes('promotion') || postTitle.includes('promotion')) {
                    return (
                      <div className="scholar-squad-avatar-box bg-rose-100 text-rose-600">
                        <Megaphone size={22} />
                      </div>
                    );
                  }
                  if (squadName.includes('documentation') || postTitle.includes('documentation')) {
                    return (
                      <div className="scholar-squad-avatar-box bg-amber-100 text-amber-700">
                        <FileText size={22} />
                      </div>
                    );
                  }
                  if (squadName.includes('entertainment') || postTitle.includes('entertainment')) {
                    return (
                      <div className="scholar-squad-avatar-box bg-indigo-100 text-indigo-600">
                        <Music size={22} />
                      </div>
                    );
                  }
                  return (
                    <div className="scholar-squad-avatar-box bg-teal-100 text-teal-700">
                      <Layers size={22} />
                    </div>
                  );
                })()}

                <div className="scholar-post-details">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Designated Officer Post & Squad
                  </span>
                  <h3 className="scholar-post-title">
                    {selectedUserDetail.post || selectedUserDetail.teamRole || 'Student Volunteer'}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      {selectedUserDetail.team || 'Management'} Squad
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100/90 text-emerald-800">
                      {(() => {
                        const currentPostObj = availableOfficerPosts.find(
                          (p) => p.title === (selectedUserDetail.post || selectedUserDetail.teamRole)
                        );
                        if (currentPostObj?.clearance) return currentPostObj.clearance;
                        if (selectedUserDetail.role === 'admin') return 'Platform Admin';
                        if (selectedUserDetail.role === 'team_admin') return 'Squad Lead';
                        if (selectedUserDetail.role === 'volunteer') return 'Volunteer Pass';
                        return 'Squad Member';
                      })()}
                    </span>
                    {selectedUserDetail.isVolunteer && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-cyan-100/80 text-cyan-800">
                        <QrCode size={11} />
                        <span>Scanner Pass</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button: Change Officer Post */}
              {perms.canAssignPosts && (
                <button
                  type="button"
                  id="btn-hero-change-post"
                  onClick={handleOpenChangeRoleModal}
                  className="btn-hero-change-post touch-target-44"
                  title="Designate or Change Officer Post"
                >
                  <Edit3 size={15} />
                  <span>Change Post</span>
                </button>
              )}
            </div>

            {/* 4-Tile Structured Institutional Dossier Grid */}
            <div className="scholar-info-grid">
              <button
                type="button"
                onClick={() => handleCopyEmail(selectedUserDetail.email)}
                className="scholar-info-tile is-interactive group touch-target-44"
                title="Click to copy institutional email"
              >
                <div className="scholar-tile-label">
                  <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-emerald-700 transition-colors">
                    <Mail size={13} className="text-emerald-600" />
                    <span>EMAIL ADDRESS</span>
                  </div>
                  <Copy size={12} className="text-slate-300 group-hover:text-emerald-700 transition-colors" />
                </div>
                <span className="scholar-tile-val truncate text-left">
                  {selectedUserDetail.email}
                </span>
              </button>

              <div className="scholar-info-tile">
                <div className="scholar-tile-label">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone size={13} className="text-teal-600" />
                    <span>CAMPUS DIRECT</span>
                  </div>
                </div>
                <span className="scholar-tile-val">
                  {selectedUserDetail.phone || '+1 (555) 011-2233'}
                </span>
              </div>

              <div className="scholar-info-tile">
                <div className="scholar-tile-label">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Building size={13} className="text-indigo-600" />
                    <span>DEPARTMENT</span>
                  </div>
                </div>
                <span className="scholar-tile-val truncate">
                  {selectedUserDetail.department || 'Geoinformatics Engineering'}
                </span>
              </div>

              <div className="scholar-info-tile">
                <div className="scholar-tile-label">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <GraduationCap size={13} className="text-amber-600" />
                    <span>ACADEMIC COHORT</span>
                  </div>
                </div>
                <span className="scholar-tile-val">
                  {selectedUserDetail.yearOfStudy || 'Final Year (4th)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Authority & Governance Sanctions */}
        {perms.canAssignPosts && (
          <div className="active-post-showcase-card">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Officer Authority & Governance Clearance
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Institutional Sanction
              </span>
            </div>

            {/* Responsibilities & Governance Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Executive Authority
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedUserDetail.role === 'admin'
                    ? 'Full Chapter & Platform Admin Clearance'
                    : selectedUserDetail.role === 'team_admin'
                    ? 'Squad Lead Administration & Task Approvals'
                    : selectedUserDetail.role === 'volunteer'
                    ? 'Event Scanner Pass & Attendee Check-In'
                    : 'General Member Access & Expedition Entry'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Governance Status
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>Faculty Advisor Sanctioned</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Institutional Records & History Records */}
        <div className="scholar-records-two-col">
          {/* Academic & Registry Dossier Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Institutional Records
            </h3>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Clearance Tier</span>
                <span className="font-bold text-slate-800">
                  {selectedUserDetail.role === 'admin' ? 'Presidential Level 1' : 'Departmental Level 2'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Turnstile Scanning</span>
                <span className="font-bold text-emerald-700">
                  {selectedUserDetail.isVolunteer ? 'Camera Scanner Authorized' : 'Standard Gate Access'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Chapter Induction</span>
                <span className="font-bold text-slate-800">Fall 2024 Cohort</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span
                  className={`font-bold ${
                    isSuspended ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {isSuspended ? 'Suspended' : 'In Good Standing'}
                </span>
              </div>
            </div>
          </div>

          {/* Officer Post History Trail Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={18} className="text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Officer Post History Trail
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Verified Milestones
              </span>
            </div>

            <div className="timeline-trail-container">
              <div className="timeline-node">
                <div className="timeline-node-dot" />
                <span className="text-xs font-bold text-slate-900">
                  2024: Student Volunteer (Gate Entry Roster)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Verified check-ins during GEO Orientation & GIS Seminar 2024.
                </span>
              </div>

              <div className="timeline-node">
                <div className="timeline-node-dot" />
                <span className="text-xs font-bold text-slate-900">
                  2025: Operational Lead ({selectedUserDetail.team || 'Management'} Squad)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Allocated department tasks and organized Western Ghats Drone Survey.
                </span>
              </div>

              <div className="timeline-node is-active">
                <div className="timeline-node-dot" />
                <span className="text-xs font-extrabold text-emerald-800">
                  2026: {selectedUserDetail.post || selectedUserDetail.teamRole || 'Current Active Post'} (Current)
                </span>
                <span className="text-[11px] text-slate-600 font-semibold">
                  Authorized executive post with full chapter sanction and faculty oversight.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Officer Post Popup Menu Modal */}
        {isChangeRoleModalOpen && (
          <div
            className="change-role-modal-overlay"
            onClick={() => setIsChangeRoleModalOpen(false)}
          >
            <div
              className="change-role-modal-card"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="change-role-modal-title"
            >
              {/* Modal Header */}
              <div className="change-role-modal-header">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <Edit3 size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 id="change-role-modal-title" className="text-sm font-extrabold text-slate-900 leading-tight truncate">
                      Designate Officer Post
                    </h3>
                    <span className="text-[11px] text-slate-400 font-semibold truncate block mt-0.5">
                      Assign to <strong className="text-slate-700">{selectedUserDetail.name}</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-close-change-role-modal"
                  onClick={() => setIsChangeRoleModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer touch-target-44 shrink-0"
                  aria-label="Close dialog"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body: Minimal Role Options */}
              <div className="change-role-modal-body">
                {visibleSquadRoleGroups.map((group) => {
                  if (!group.isSquadGroup) {
                    const postItem = group.post;
                    const isSelected = modalSelectedPost === postItem.title;
                    return (
                      <button
                        key={postItem.id}
                        type="button"
                        onClick={() => handleSelectRoleInModal(postItem.title, postItem.role, postItem.squad)}
                        className={`change-role-option-item touch-target-44 ${isSelected ? 'is-selected' : ''}`}
                      >
                        <div className="change-role-option-icon-box">
                          {postItem.icon}
                        </div>

                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                            {postItem.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                              isSelected ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {postItem.clearance}
                          </span>
                        </div>

                        <div className="shrink-0 pl-1">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'border-2 border-slate-300'
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      </button>
                    );
                  }

                  const isExpanded = expandedSquad === group.squadKey;
                  const activeSubrole = group.roles.find(
                    (r) =>
                      modalSelectedPost === r.title ||
                      (modalSelectedPost === 'Promotion Lead' && r.title === 'Promotion Team Lead') ||
                      (modalSelectedPost === 'Documentation Lead' && r.title === 'Documentation Team Lead') ||
                      (modalSelectedPost === 'Management Lead' && r.title === 'Management Team Lead') ||
                      (modalSelectedPost === 'Entertainment Lead' && r.title === 'Entertainment Team Lead')
                  );
                  const isSquadSelected = Boolean(activeSubrole);

                  return (
                    <div
                      key={group.id}
                      className={`change-role-squad-group ${isExpanded ? 'is-expanded' : ''}`}
                    >
                      {/* Squad Accordion Header */}
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedSquad((prev) => (prev === group.squadKey ? null : group.squadKey));
                          if (!isSquadSelected) {
                            handleSelectRoleInModal(group.roles[0].title, group.roles[0].role, group.squadKey);
                          }
                        }}
                        className="change-role-squad-header touch-target-44"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="change-role-option-icon-box shrink-0">
                            {group.icon}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {group.squadName}
                            </span>
                            {isSquadSelected && activeSubrole && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                                {activeSubrole.title}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pl-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center transition-transform">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                      </button>

                      {/* Sub-role options: Team Lead vs Team Member */}
                      {isExpanded && (
                        <div className="change-role-squad-sublist">
                          {group.roles.map((subRole) => {
                            const isSubSelected =
                              modalSelectedPost === subRole.title ||
                              (modalSelectedPost === 'Promotion Lead' && subRole.title === 'Promotion Team Lead') ||
                              (modalSelectedPost === 'Documentation Lead' && subRole.title === 'Documentation Team Lead') ||
                              (modalSelectedPost === 'Management Lead' && subRole.title === 'Management Team Lead') ||
                              (modalSelectedPost === 'Entertainment Lead' && subRole.title === 'Entertainment Team Lead');

                            return (
                              <button
                                key={subRole.id}
                                type="button"
                                onClick={() => handleSelectRoleInModal(subRole.title, subRole.role, group.squadKey)}
                                className={`change-role-subrole-item touch-target-44 ${isSubSelected ? 'is-selected' : ''}`}
                              >
                                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                  {subRole.icon}
                                </div>

                                <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                                    {subRole.title}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                                      isSubSelected
                                        ? 'bg-emerald-200 text-emerald-900 font-extrabold'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {subRole.tierBadge || subRole.clearance}
                                  </span>
                                </div>

                                <div className="shrink-0 pl-1">
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                      isSubSelected
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'border-2 border-slate-300'
                                    }`}
                                  >
                                    {isSubSelected && <Check size={11} strokeWidth={3} />}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="change-role-modal-footer">
                <div className="text-xs text-slate-600 truncate">
                  Desk: <span className="font-extrabold text-emerald-800">{modalSelectedPost}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsChangeRoleModalOpen(false)}
                    className="px-3.5 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors touch-target-44 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    id="btn-confirm-assign-role"
                    onClick={handleAssignRoleFromPopup}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all active:scale-95 touch-target-44 cursor-pointer"
                  >
                    <ShieldCheck size={15} strokeWidth={2.5} />
                    <span>Assign Role</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 3: DEFAULT MEMBERS DIRECTORY ROSTER
  // =========================================================================
  return (
    <div className="flex flex-col gap-5">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header Area */}
      <div className="members-directory-header-row">
        <div className="flex-1 min-w-0">
          {/* Rebuilt Institutional Registry Badge Cluster */}
          <div className="institutional-registry-badge-cluster">
            <div className="institutional-registry-pill">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="institutional-registry-title">
                Institutional Registry
              </span>
              <span className="institutional-registry-divider" aria-hidden="true" />
              <div className="institutional-registry-count">
                <Users size={12} className="text-emerald-700 stroke-[2.5] shrink-0" />
                <span>{users.length} Enrolled Scholars</span>
              </div>
            </div>

            <div className="institutional-registry-status">
              <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
              <span>Verified Chapter</span>
            </div>
          </div>

          <h1
            className="font-display text-slate-900 tracking-tight"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            Members Directory
          </h1>
        </div>

        {/* Add Student Button (Opens Full Page Induction Studio) */}
        {perms.canManageMembers && (
          <button
            type="button"
            onClick={() => setIsAddStudentOpen(true)}
            className="members-directory-header-btn touch-target-44"
          >
            <UserPlus size={16} strokeWidth={2} />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Roster vs Join Requests Tab Pill Switcher */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTabMode('roster')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center min-h-[40px] cursor-pointer ${
            activeTabMode === 'roster'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Enrolled Roster ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTabMode('join_requests')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer ${
            activeTabMode === 'join_requests'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Join Requests</span>
          {joinRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[11px] font-extrabold">
              {joinRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Enrolled Roster */}
      {activeTabMode === 'roster' && (
        <>
          {/* Rebuilt SearchBar */}
          <div>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, roll no, department..."
              resultsCount={filteredUsers.length}
              suggestions={[
                'Geomatics Engineering',
                'Management Squad',
                'Promotion Squad',
                'Documentation Squad',
                'Entertainment Squad',
                'Dr. Sarah Jenkins',
                'Liam Vance',
              ]}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5">
            <FilterPill
              label={
                roleFilter === 'All'
                  ? 'All Students'
                  : roleFilter === 'leads'
                  ? 'Squad Leads'
                  : `${roleFilter.replace('_', ' ')}`
              }
              count={filteredUsers.length}
              isActive={roleFilter !== 'All'}
              onClick={() => setIsRoleSheetOpen(true)}
            />

            <FilterPill
              label={squadFilter === 'All' ? 'All Squads' : `${squadFilter} Squad`}
              isActive={squadFilter !== 'All'}
              onClick={() => setIsSquadSheetOpen(true)}
            />
          </div>

          {/* Members Cards Grid */}
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredUsers.map((u) => (
                <MemberCard
                  key={u.uid}
                  user={u}
                  onClick={() => handleMemberClick(u)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Scholars Match Filter"
              description="Try adjusting your search query, standing filter, or department squad."
              actionLabel="Reset Search"
              onAction={() => {
                setSearchQuery('');
                setRoleFilter('All');
                setSquadFilter('All');
              }}
            />
          )}
        </>
      )}

      {/* Tab 2: Join Requests */}
      {activeTabMode === 'join_requests' && (
        <div className="flex flex-col gap-3">
          {joinRequests.length > 0 ? (
            joinRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <AppAvatar name={req.name} size={42} />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {req.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium block">
                        {req.department} • {req.year}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                    {req.requestedSquad} Squad
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                  <span className="font-bold text-slate-800 block mb-0.5">
                    Desired Role: {req.requestedRole}
                  </span>
                  "{req.portfolioNote}"
                </div>

                {perms.canManageMembers && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleRejectJoin(req.id, req.name)}
                      className="px-3.5 py-1.5 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-100 min-h-[36px]"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveJoin(req.id, req.name, req.requestedSquad)}
                      className="px-4 py-1.5 rounded-full font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm min-h-[36px]"
                    >
                      Approve & Induct
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <EmptyState
              title="No Pending Join Requests"
              description="All prospective scholar induction applications have been reviewed."
            />
          )}
        </div>
      )}

      {/* Role Filter Sheet */}
      <BottomSheet
        isOpen={isRoleSheetOpen}
        onClose={() => setIsRoleSheetOpen(false)}
        title="Filter by Student Year & Standing"
        subtitle="Select an academic tier"
      >
        <div className="flex flex-col gap-2 py-1">
          {[
            { key: 'All', label: 'All Students & Scholars' },
            { key: 'leads', label: 'Squad Leads & Team Admins' },
            { key: '1st_year', label: '1st Year Scholars' },
            { key: '2nd_year', label: '2nd Year Scholars' },
            { key: '3rd_year', label: '3rd Year Scholars' },
            { key: '4th_year', label: '4th Year (Final Year)' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setRoleFilter(opt.key);
                setIsRoleSheetOpen(false);
              }}
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                roleFilter === opt.key
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-extrabold'
                  : 'bg-white border-slate-100 text-slate-700 font-semibold'
              }`}
            >
              <span className="text-xs">{opt.label}</span>
              {roleFilter === opt.key && <Check size={16} className="text-emerald-600" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Squad Filter Sheet */}
      <BottomSheet
        isOpen={isSquadSheetOpen}
        onClose={() => setIsSquadSheetOpen(false)}
        title="Filter by Operational Squad"
        subtitle="Select chapter squad assignment"
      >
        <div className="flex flex-col gap-2 py-1">
          {['All', 'Management', 'Promotion', 'Documentation', 'Entertainment'].map((sq) => (
            <button
              key={sq}
              type="button"
              onClick={() => {
                setSquadFilter(sq);
                setIsSquadSheetOpen(false);
              }}
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                squadFilter === sq
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-extrabold'
                  : 'bg-white border-slate-100 text-slate-700 font-semibold'
              }`}
            >
              <span className="text-xs">{sq === 'All' ? 'All Squads' : `${sq} Squad`}</span>
              {squadFilter === sq && <Check size={16} className="text-emerald-600" />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};
