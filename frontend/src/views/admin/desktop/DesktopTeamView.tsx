import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Shield,
  FileText,
  Building,
  GraduationCap,
  Award,
  X,
  Mail,
  Phone,
  Trash2,
  MapPin,
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  Send,
  UserCheck,
} from 'lucide-react';
import {
  FacultyAdvisorItem,
  SuperAdminUserItem,
  OnlineSessionUser,
  UnifiedMemberItem,
} from '../types';

interface DesktopTeamViewProps {
  faculty: FacultyAdvisorItem[];
  students: SuperAdminUserItem[];
  onlineUsers: OnlineSessionUser[];
  onOpenAddMember: () => void;
  onDeleteMember: (id: string, kind: 'student' | 'faculty') => Promise<void>;
  onToggleSuspendMember: (id: string, kind: 'student' | 'faculty') => Promise<void>;
  onAssignMemberPost: (id: string, post: string, role?: string, squad?: string) => Promise<void>;
  showToast: (message: string) => void;
}

type FilterStatus = 'all' | 'online' | 'away' | 'students' | 'faculty' | 'suspended';

const MEMBER_AVATARS: Record<string, string> = {
  'alex rivera': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'elena rostova': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'aarav patel': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'ananya iyer': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'david chen': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'liam vance': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'maya patel': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'sivanagu e': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'abinandhan k': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'siva gokul': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  'dr. sarah jenkins': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'prof. ramanathan k': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  'dr. meenakshi s': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'prof. arunkumar v': 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
};

export const DesktopTeamView: React.FC<DesktopTeamViewProps> = ({
  faculty,
  students,
  onlineUsers,
  onOpenAddMember,
  onDeleteMember,
  onToggleSuspendMember,
  onAssignMemberPost,
  showToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  // Selected member for interactive modals
  const [selectedDossierMember, setSelectedDossierMember] = useState<UnifiedMemberItem | null>(null);
  const [selectedAssignMember, setSelectedAssignMember] = useState<UnifiedMemberItem | null>(null);
  const [selectedMessageMember, setSelectedMessageMember] = useState<UnifiedMemberItem | null>(null);
  const [selectedCallMember, setSelectedCallMember] = useState<UnifiedMemberItem | null>(null);

  // Form states for modals
  const [newPostInput, setNewPostInput] = useState('');
  const [newSquadInput, setNewSquadInput] = useState('Management');
  const [quickMessageText, setQuickMessageText] = useState('');
  const [avatarErrors, setAvatarErrors] = useState<Record<string, boolean>>({});

  // Set of online user identifiers (by roll_no and id)
  const onlineSet = useMemo(() => {
    const set = new Set<string>();
    onlineUsers.forEach((u) => {
      if (u.roll_no) set.add(u.roll_no.toLowerCase());
      if (u.id) set.add(u.id.toLowerCase());
    });
    return set;
  }, [onlineUsers]);

  // Unified roster list
  const unifiedMembers = useMemo<UnifiedMemberItem[]>(() => {
    const list: UnifiedMemberItem[] = [];

    // Faculty members
    faculty.forEach((f) => {
      list.push({
        id: f.id,
        kind: 'faculty',
        roll_no: f.roll_no,
        name: f.name,
        email: f.email,
        department: f.department,
        designation: f.designation,
        role: 'faculty',
        status: (f.status as any) || 'active',
        phone: f.phone || '+91 94420 18820',
        post: f.designation || 'Faculty Advisor',
        last_seen_at: f.last_seen_at,
      });
    });

    // Student members
    students.forEach((s) => {
      list.push({
        id: s.id,
        kind: 'student',
        roll_no: s.roll_no,
        name: s.name,
        email: s.email,
        department: s.department,
        year_of_study: s.year_of_study,
        role: s.role,
        status: (s.status as any) || 'active',
        post: s.post || 'Student Member',
        team: s.team,
        last_seen_at: s.last_seen_at,
      });
    });

    return list;
  }, [faculty, students]);

  // Compute live online count
  const onlineCount = useMemo(() => {
    return unifiedMembers.filter(
      (m) => onlineSet.has(m.roll_no.toLowerCase()) || onlineSet.has(m.id.toLowerCase())
    ).length;
  }, [unifiedMembers, onlineSet]);

  const awayCount = useMemo(() => {
    return Math.max(0, unifiedMembers.length - onlineCount);
  }, [unifiedMembers.length, onlineCount]);

  // Distinct departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    unifiedMembers.forEach((m) => {
      if (m.department) set.add(m.department);
    });
    return Array.from(set);
  }, [unifiedMembers]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return unifiedMembers.filter((m) => {
      const isOnline = onlineSet.has(m.roll_no.toLowerCase()) || onlineSet.has(m.id.toLowerCase());

      // Filter by status tab (Image 4 Code XR: All, Online, Away + Students, Faculty, Suspended)
      if (filterStatus === 'online' && !isOnline) return false;
      if (filterStatus === 'away' && isOnline) return false;
      if (filterStatus === 'students' && m.kind !== 'student') return false;
      if (filterStatus === 'faculty' && m.kind !== 'faculty') return false;
      if (filterStatus === 'suspended' && m.status !== 'suspended') return false;

      // Filter by department
      if (departmentFilter !== 'All' && m.department !== departmentFilter) return false;

      // Filter by year
      if (yearFilter !== 'All' && m.year_of_study !== yearFilter) return false;

      // Search query (name, roll, email, post, department)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesRoll = m.roll_no.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesPost = (m.post || '').toLowerCase().includes(q);
        const matchesDept = (m.department || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesEmail && !matchesPost && !matchesDept) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedMembers, filterStatus, departmentFilter, yearFilter, searchQuery, onlineSet]);

  const handleOpenAssignModal = (member: UnifiedMemberItem) => {
    setSelectedAssignMember(member);
    setNewPostInput(member.post || '');
    setNewSquadInput(member.team || 'Management');
  };

  const handleSavePost = async () => {
    if (!selectedAssignMember) return;
    try {
      await onAssignMemberPost(
        selectedAssignMember.id,
        newPostInput,
        selectedAssignMember.role || 'student',
        newSquadInput
      );
      showToast(`Assigned ${newPostInput} to ${selectedAssignMember.name}`);
      setSelectedAssignMember(null);
    } catch {
      showToast('Failed to update leadership post');
    }
  };

  const handleSendQuickMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessageMember || !quickMessageText.trim()) return;
    showToast(`Dispatched message to ${selectedMessageMember.name}: "${quickMessageText.trim()}"`);
    setQuickMessageText('');
    setSelectedMessageMember(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 select-none">
      {/* 1. Header matching Code XR reference Image 4 */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="flex flex-col">
          <h1
            className="text-2xl md:text-3xl font-black text-[#051F20] tracking-tight"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            Your team
          </h1>
          <p className="text-xs md:text-sm font-medium text-[#235347] mt-1">
            {unifiedMembers.length} people · {onlineCount} online right now
          </p>
        </div>

        {/* Top-Right Controls: Segmented Status Pills + Invite Button matching Image 4 */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Segmented Status Filter Bar: [ All ] [ Online ] [ Away ] */}
          <div
            className="flex items-center p-1 rounded-full border border-[#DAF1DE] bg-white/80 shadow-2xs backdrop-blur-md"
            role="tablist"
            aria-label="Filter roster by status"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filterStatus === 'all'}
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-[#DAF1DE]/50'
              }`}
            >
              All
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filterStatus === 'online'}
              onClick={() => setFilterStatus('online')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'online'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-[#DAF1DE]/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online</span>
              <span className="text-xs font-semibold opacity-75">({onlineCount})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filterStatus === 'away'}
              onClick={() => setFilterStatus('away')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'away'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-[#DAF1DE]/50'
              }`}
            >
              <span>Away</span>
              <span className="text-xs font-semibold opacity-75">({awayCount})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filterStatus === 'students'}
              onClick={() => setFilterStatus('students')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'students'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-[#DAF1DE]/50'
              }`}
            >
              Students
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filterStatus === 'faculty'}
              onClick={() => setFilterStatus('faculty')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'faculty'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-[#DAF1DE]/50'
              }`}
            >
              Faculty
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filterStatus === 'suspended'}
              onClick={() => setFilterStatus('suspended')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'suspended'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-[#DAF1DE]/50'
              }`}
            >
              Suspended
            </button>
          </div>

          {/* + Invite Button matching Image 4 */}
          <button
            type="button"
            onClick={onOpenAddMember}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#051F20] hover:bg-[#163832] text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            style={{ minHeight: '40px' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>+ Invite</span>
          </button>
        </div>
      </header>

      {/* 2. Interactive Search & Secondary Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-white/70 border border-[#DAF1DE] shadow-2xs backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#235347]"
            strokeWidth={2.2}
          />
          <input
            type="text"
            placeholder="Search team by name, roll number, department, or post..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-[#DAF1DE] bg-white text-xs font-medium text-[#051F20] placeholder-[#235347]/60 focus:outline-hidden focus:border-[#235347] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] hover:text-[#051F20]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Department Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building size={14} className="text-[#235347] shrink-0" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            aria-label="Department filter"
            className="px-3 py-2 rounded-xl border border-[#DAF1DE] bg-white text-xs font-bold text-[#163832] focus:outline-hidden focus:border-[#235347] cursor-pointer"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <GraduationCap size={14} className="text-[#235347] shrink-0" />
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            aria-label="Year filter"
            className="px-3 py-2 rounded-xl border border-[#DAF1DE] bg-white text-xs font-bold text-[#163832] focus:outline-hidden focus:border-[#235347] cursor-pointer"
          >
            <option value="All">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>
      </div>

      {/* 3. Team Member Cards Multi-Column Grid matching Code XR Image 4 */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {filteredMembers.map((member) => {
            const isOnline =
              onlineSet.has(member.roll_no.toLowerCase()) ||
              onlineSet.has(member.id.toLowerCase());
            const initials = member.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            const avatarUrl = MEMBER_AVATARS[member.name.toLowerCase().trim()];
            const hasAvatarError = avatarErrors[member.id];

            return (
              <div
                key={member.id}
                className="group rounded-[26px] border border-[#DAF1DE] bg-white/75 backdrop-blur-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-[#8EB69B]/70 hover:-translate-y-1 relative"
                style={{
                  boxShadow: '0 8px 24px rgba(5, 31, 32, 0.05)',
                }}
              >
                {/* Upper Half: Frosted Warm/Botanical Ambient Gradient Banner matching Image 4 */}
                <div
                  className="h-28 w-full relative flex items-start justify-between p-3.5"
                  style={{
                    background:
                      member.kind === 'faculty'
                        ? 'linear-gradient(135deg, #051F20 0%, #163832 50%, #235347 100%)'
                        : 'linear-gradient(135deg, #163832 0%, #235347 50%, #8EB69B 100%)',
                  }}
                >
                  {/* Subtle inner radial glow */}
                  <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 75% 25%, #DAF1DE 0%, transparent 65%)',
                    }}
                  />

                  {/* Status Capsule / Role Tag */}
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider shadow-xs relative z-10 ${
                      member.status === 'suspended'
                        ? 'bg-[#D9534F] text-white'
                        : member.kind === 'faculty'
                        ? 'bg-[#DAF1DE] text-[#051F20]'
                        : 'bg-white/90 text-[#051F20]'
                    }`}
                  >
                    {member.status === 'suspended'
                      ? 'Suspended'
                      : member.kind === 'faculty'
                      ? 'Faculty'
                      : member.role || 'Member'}
                  </span>

                  {/* Top-Right Quick Options Menu */}
                  <button
                    type="button"
                    onClick={() => setSelectedDossierMember(member)}
                    title="Inspect member dossier & credentials"
                    className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>

                {/* Overlapping Circular Avatar + Info Section */}
                <div className="flex flex-col items-center px-4 pb-4 -mt-12 relative z-10 flex-1">
                  {/* Avatar Container with Online Indicator matching Image 4 */}
                  <div className="relative mb-3">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center font-black text-base text-[#051F20] shadow-md border-3 border-white overflow-hidden bg-white"
                      style={{
                        background:
                          member.kind === 'faculty'
                            ? 'linear-gradient(135deg, #DAF1DE 0%, #8EB69B 100%)'
                            : 'linear-gradient(135deg, #FFFFFF 0%, #DAF1DE 100%)',
                      }}
                    >
                      {avatarUrl && !hasAvatarError ? (
                        <img
                          src={avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setAvatarErrors((prev) => ({ ...prev, [member.id]: true }));
                          }}
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>

                    {/* Online / Away Status Dot matching Image 4 */}
                    <div
                      className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                        isOnline ? 'bg-emerald-500' : 'bg-[#DAF1DE]'
                      }`}
                      title={isOnline ? 'Online right now' : 'Away / Inactive'}
                    />
                  </div>

                  {/* Member Name */}
                  <h3 className="text-base font-black text-[#051F20] text-center tracking-tight truncate w-full">
                    {member.name}
                  </h3>

                  {/* Role / Leadership Post */}
                  <p className="text-xs font-semibold text-[#235347] text-center truncate w-full mt-0.5">
                    {member.post || member.designation || 'Club Member'}
                  </p>

                  {/* Location / Presence Badge matching Image 4 ("📍 Lisbon · Online") */}
                  <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#235347]/80 text-center truncate w-full mt-1.5">
                    <MapPin size={12} className="text-[#235347] shrink-0" />
                    <span className="truncate">
                      {member.department || 'Campus'} · {isOnline ? 'Online' : 'Away'}
                    </span>
                  </div>

                  <p className="text-xs font-mono font-medium text-[#163832]/60 mt-0.5">
                    {member.roll_no}
                  </p>

                  {/* Spacer to align action buttons evenly at bottom */}
                  <div className="flex-1 my-3 w-full border-t border-[#DAF1DE]/70" />

                  {/* Action Buttons: Message & Call matching Code XR Image 4 */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setSelectedMessageMember(member)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#DAF1DE] bg-white hover:bg-[#DAF1DE]/60 text-[#051F20] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                      title={`Send message to ${member.name}`}
                    >
                      <MessageSquare size={13} className="text-[#235347]" strokeWidth={2.4} />
                      <span>Message</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCallMember(member)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#DAF1DE] bg-white hover:bg-[#DAF1DE]/60 text-[#051F20] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                      title={`Direct call or phone details for ${member.name}`}
                    >
                      <Phone size={13} className="text-[#235347]" strokeWidth={2.4} />
                      <span>Call</span>
                    </button>
                  </div>

                  {/* Administrative Governance Buttons: Dossier & Assign */}
                  <div className="grid grid-cols-2 gap-2 w-full mt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDossierMember(member)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] hover:bg-[#DAF1DE]/50 text-[#051F20] text-xs font-bold transition-all cursor-pointer"
                      title="Inspect member dossier"
                    >
                      <FileText size={13} className="text-[#235347]" strokeWidth={2.2} />
                      <span>Dossier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal(member)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] hover:bg-[#DAF1DE]/50 text-[#051F20] text-xs font-bold transition-all cursor-pointer"
                      title="Assign leadership post"
                    >
                      <Shield size={13} className="text-[#235347]" strokeWidth={2.2} />
                      <span>Assign</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Search / Filter State with Dual Halo Botanical Card */
        <div className="rounded-[28px] border border-[#DAF1DE] bg-white/80 backdrop-blur-md p-10 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#DAF1DE]/70 flex items-center justify-center text-[#051F20] mb-4">
            <Search size={28} strokeWidth={2.2} />
          </div>
          <h3 className="text-base font-bold text-[#051F20]">No Records Found</h3>
          <p className="text-xs font-medium text-[#235347] max-w-sm mt-1">
            {searchQuery.trim().length > 0 ? (
              <>
                No campus scholars match &ldquo;{searchQuery.trim()}&rdquo;. Try clearing filters or searching by another roll number.
              </>
            ) : (
              'No scholars match the currently active category filters.'
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setDepartmentFilter('All');
              setYearFilter('All');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-[#051F20] text-white text-xs font-bold hover:bg-[#163832] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Member Dossier Inspector                                         */}
      {/* ========================================================================= */}
      {selectedDossierMember && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-xl max-w-lg w-full p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#DAF1DE]">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#235347]" />
                <h3 className="text-base font-bold text-[#051F20]">Campus Member Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDossierMember(null)}
                className="w-8 h-8 rounded-full bg-[#DAF1DE]/60 hover:bg-[#DAF1DE] text-[#051F20] flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#DAF1DE] text-[#051F20] flex items-center justify-center font-black text-base shadow-xs overflow-hidden">
                  {MEMBER_AVATARS[selectedDossierMember.name.toLowerCase().trim()] &&
                  !avatarErrors[selectedDossierMember.id] ? (
                    <img
                      src={MEMBER_AVATARS[selectedDossierMember.name.toLowerCase().trim()]}
                      alt={selectedDossierMember.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{selectedDossierMember.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-[#051F20]">
                    {selectedDossierMember.name}
                  </span>
                  <span className="text-xs font-bold text-[#235347]">
                    {selectedDossierMember.post || selectedDossierMember.role}
                  </span>
                  <span className="text-xs font-mono text-[#163832]/70">
                    {selectedDossierMember.roll_no} · {selectedDossierMember.department}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE]">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#235347]/70">Email Address</span>
                  <span className="text-xs font-bold text-[#051F20] truncate">
                    {selectedDossierMember.email}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#235347]/70">Academic Role</span>
                  <span className="text-xs font-bold text-[#051F20] uppercase">
                    {selectedDossierMember.role}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#235347]/70">Account Status</span>
                  <span
                    className={`text-xs font-bold ${
                      selectedDossierMember.status === 'suspended'
                        ? 'text-[#D9534F]'
                        : 'text-[#235347]'
                    }`}
                  >
                    {selectedDossierMember.status}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#235347]/70">Working Squad</span>
                  <span className="text-xs font-bold text-[#051F20]">
                    {selectedDossierMember.team || 'General'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#DAF1DE] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenAssignModal(selectedDossierMember);
                    setSelectedDossierMember(null);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-[#DAF1DE] bg-white hover:bg-[#DAF1DE]/40 text-[#051F20] text-xs font-bold transition-all cursor-pointer"
                >
                  Assign Post
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await onToggleSuspendMember(selectedDossierMember.id, selectedDossierMember.kind);
                    setSelectedDossierMember(null);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-[#DAF1DE] bg-white hover:bg-[#DAF1DE]/40 text-[#051F20] text-xs font-bold transition-all cursor-pointer"
                >
                  {selectedDossierMember.status === 'suspended' ? 'Re-activate Member' : 'Suspend Access'}
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (confirm(`Remove ${selectedDossierMember.name} from campus records?`)) {
                    await onDeleteMember(selectedDossierMember.id, selectedDossierMember.kind);
                    setSelectedDossierMember(null);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#D9534F] text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Quick Message (Ping Member)                                      */}
      {/* ========================================================================= */}
      {selectedMessageMember && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#DAF1DE]">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-[#235347]" />
                <h3 className="text-base font-bold text-[#051F20]">
                  Direct Message {selectedMessageMember.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessageMember(null)}
                className="w-8 h-8 rounded-full bg-[#DAF1DE]/60 hover:bg-[#DAF1DE] text-[#051F20] flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendQuickMessage} className="flex flex-col gap-4 py-4">
              <p className="text-xs text-[#235347] font-medium">
                Send an instant in-app alert and direct communication to{' '}
                <strong className="text-[#051F20]">{selectedMessageMember.name}</strong> ({selectedMessageMember.roll_no}).
              </p>

              {/* Quick Prompt Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-[#235347]/80">Quick pings:</span>
                {[
                  'Duty briefing at 3 PM',
                  'Please review assigned task',
                  'Attendance check-in needed',
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setQuickMessageText(txt)}
                    className="px-2 py-0.5 rounded-lg border border-[#DAF1DE] bg-[#F6FBF7] hover:bg-[#DAF1DE] text-[#051F20] text-xs font-semibold transition-all cursor-pointer"
                  >
                    {txt}
                  </button>
                ))}
              </div>

              <textarea
                required
                rows={3}
                value={quickMessageText}
                onChange={(e) => setQuickMessageText(e.target.value)}
                placeholder="Type your official direct message..."
                className="w-full p-3 rounded-2xl border border-[#DAF1DE] text-xs font-medium text-[#051F20] focus:outline-hidden focus:border-[#235347] bg-[#F6FBF7]"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMessageMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#235347] hover:bg-[#DAF1DE]/40 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#051F20] hover:bg-[#163832] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Send size={14} />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Direct Call & Campus Extension                                  */}
      {/* ========================================================================= */}
      {selectedCallMember && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#DAF1DE] text-[#051F20] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Phone size={26} strokeWidth={2.2} />
            </div>

            <h3 className="text-base font-black text-[#051F20]">{selectedCallMember.name}</h3>
            <p className="text-xs font-semibold text-[#235347] mt-0.5">
              {selectedCallMember.post || selectedCallMember.role} · {selectedCallMember.department}
            </p>

            <div className="flex flex-col gap-2.5 my-5 p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#235347]/70">Campus Phone:</span>
                <span className="font-mono font-bold text-[#051F20]">
                  {selectedCallMember.phone || '+91 94420 18820'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#235347]/70">Email Address:</span>
                <span className="font-mono font-medium text-[#051F20] truncate max-w-[180px]">
                  {selectedCallMember.email}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#235347]/70">Duty Extension:</span>
                <span className="font-mono font-bold text-[#163832]">Ext. 402</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`tel:${selectedCallMember.phone || '+919442018820'}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#051F20] hover:bg-[#163832] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Phone size={14} />
                <span>Call Phone</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedCallMember(null)}
                className="py-2.5 px-3 rounded-full border border-[#DAF1DE] hover:bg-[#DAF1DE]/40 text-[#051F20] text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Assign Leadership Post                                           */}
      {/* ========================================================================= */}
      {selectedAssignMember && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#DAF1DE]">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#235347]" />
                <h3 className="text-base font-bold text-[#051F20]">Assign Leadership Post</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssignMember(null)}
                className="w-8 h-8 rounded-full bg-[#DAF1DE]/60 hover:bg-[#DAF1DE] text-[#051F20] flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4 py-4">
              <p className="text-xs text-[#235347] font-medium">
                Assign an official leadership designation and duty squad to{' '}
                <strong className="text-[#051F20]">{selectedAssignMember.name}</strong>.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#051F20]">Official Designation / Post</label>
                <input
                  type="text"
                  value={newPostInput}
                  onChange={(e) => setNewPostInput(e.target.value)}
                  placeholder="e.g. Club President, Treasurer, Lead Volunteer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DAF1DE] text-xs font-medium text-[#051F20] focus:outline-hidden focus:border-[#235347]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#051F20]">Assigned Duty Squad</label>
                <select
                  value={newSquadInput}
                  onChange={(e) => setNewSquadInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#163832] focus:outline-hidden focus:border-[#235347] cursor-pointer"
                >
                  <option value="Management">Management</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Treasury">Treasury</option>
                  <option value="No Squad">No Squad</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DAF1DE]">
              <button
                type="button"
                onClick={() => setSelectedAssignMember(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#235347] hover:bg-[#DAF1DE]/40 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePost}
                className="px-4 py-2 rounded-xl bg-[#051F20] hover:bg-[#163832] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Save Designation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopTeamView;
