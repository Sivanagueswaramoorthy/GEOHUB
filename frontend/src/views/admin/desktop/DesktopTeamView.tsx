import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  UserCheck,
  Shield,
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  Building,
  GraduationCap,
  Sparkles,
  Award,
  X,
  Mail,
  Phone,
  Trash2,
  AlertTriangle,
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

type FilterStatus = 'all' | 'online' | 'students' | 'faculty' | 'suspended';

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
  const [newPostInput, setNewPostInput] = useState('');
  const [newSquadInput, setNewSquadInput] = useState('Management');

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
        phone: f.phone,
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

      // Filter by status tab
      if (filterStatus === 'online' && !isOnline) return false;
      if (filterStatus === 'students' && m.kind !== 'student') return false;
      if (filterStatus === 'faculty' && m.kind !== 'faculty') return false;
      if (filterStatus === 'suspended' && m.status !== 'suspended') return false;

      // Filter by department
      if (departmentFilter !== 'All' && m.department !== departmentFilter) return false;

      // Filter by year
      if (yearFilter !== 'All' && m.year_of_study !== yearFilter) return false;

      // Search query (name, roll, email, post)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesRoll = m.roll_no.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesPost = (m.post || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesEmail && !matchesPost) return false;
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

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* 1. Header matching Code XR reference Image 1 */}
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

        {/* Top-Right Controls: Segmented Status Pills + Invite Button */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Segmented Status Filter Bar */}
          <div
            className="flex items-center p-1 rounded-full border border-[#DAF1DE] bg-white/80 shadow-2xs"
            role="tablist"
            aria-label="Filter roster by status"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filterStatus === 'all'}
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'online'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-[#DAF1DE]/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#8EB69B]" />
              <span>Online</span>
              <span className="text-xs font-semibold opacity-75">({onlineCount})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filterStatus === 'students'}
              onClick={() => setFilterStatus('students')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'suspended'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-[#DAF1DE]/50'
              }`}
            >
              Suspended
            </button>
          </div>

          {/* + Invite Button */}
          <button
            type="button"
            onClick={onOpenAddMember}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#051F20] hover:bg-[#163832] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
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
            placeholder="Search team by name, roll number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DAF1DE] bg-white text-xs font-medium text-[#051F20] placeholder-[#235347]/60 focus:outline-hidden focus:border-[#235347] transition-all"
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

      {/* 3. Team Member Cards Multi-Column Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
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

            return (
              <div
                key={member.id}
                className="group rounded-[24px] border border-[#DAF1DE] bg-white/75 backdrop-blur-md overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:border-[#8EB69B]/60 hover:-translate-y-0.5"
                style={{
                  boxShadow: '0 4px 16px rgba(5, 31, 32, 0.04)',
                }}
              >
                {/* Upper Half: Frosted Luxury Botanical Gradient Banner */}
                <div
                  className="h-24 w-full relative flex items-start justify-end p-3"
                  style={{
                    background:
                      member.kind === 'faculty'
                        ? 'linear-gradient(135deg, #051F20 0%, #163832 60%, #235347 100%)'
                        : 'linear-gradient(135deg, #0B2B26 0%, #235347 60%, #8EB69B 100%)',
                  }}
                >
                  {/* Subtle inner radial glow */}
                  <div
                    className="absolute inset-0 opacity-25 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 70% 30%, #DAF1DE 0%, transparent 60%)',
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
                </div>

                {/* Overlapping Circular Avatar + Info Section */}
                <div className="flex flex-col items-center px-4 pb-4 -mt-10 relative z-10 flex-1">
                  {/* Avatar Container with Online Indicator */}
                  <div className="relative mb-3">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center font-black text-sm text-[#051F20] shadow-md border-3 border-white"
                      style={{
                        background:
                          member.kind === 'faculty'
                            ? 'linear-gradient(135deg, #DAF1DE 0%, #8EB69B 100%)'
                            : 'linear-gradient(135deg, #FFFFFF 0%, #DAF1DE 100%)',
                      }}
                    >
                      {initials}
                    </div>

                    {/* Online / Away Status Dot matching Image 1 */}
                    <div
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                        isOnline ? 'bg-[#235347]' : 'bg-[#DAF1DE]'
                      }`}
                      title={isOnline ? 'Online now' : 'Offline / Away'}
                    />
                  </div>

                  {/* Member Name */}
                  <h3 className="text-sm font-bold text-[#051F20] text-center tracking-tight truncate w-full">
                    {member.name}
                  </h3>

                  {/* Role / Leadership Post */}
                  <p className="text-xs font-semibold text-[#235347] text-center truncate w-full mt-0.5">
                    {member.post || member.designation || 'Club Member'}
                  </p>

                  {/* Department & Academic Details */}
                  <p className="text-xs font-medium text-[#235347]/70 text-center truncate w-full mt-1">
                    {member.department}
                    {member.year_of_study ? ` · ${member.year_of_study}` : ''}
                  </p>

                  <p className="text-xs font-mono font-medium text-[#163832]/60 mt-0.5">
                    {member.roll_no}
                  </p>

                  {/* Spacer to push buttons to bottom */}
                  <div className="flex-1 my-3 w-full border-t border-[#DAF1DE]/70" />

                  {/* Action Buttons: [ Dossier ] & [ Assign ] matching image 1's [ Message ] [ Call ] */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setSelectedDossierMember(member)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#DAF1DE] bg-white hover:bg-[#DAF1DE]/60 text-[#051F20] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      title="Inspect member dossier"
                    >
                      <FileText size={14} className="text-[#235347]" strokeWidth={2.2} />
                      <span>Dossier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal(member)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#DAF1DE] bg-white hover:bg-[#DAF1DE]/60 text-[#051F20] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      title="Assign leadership post"
                    >
                      <Shield size={14} className="text-[#235347]" strokeWidth={2.2} />
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
            No campus scholars match &ldquo;{searchQuery}&rdquo;. Try clearing filters or searching by another roll number.
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
                <div className="w-14 h-14 rounded-full bg-[#DAF1DE] text-[#051F20] flex items-center justify-center font-black text-base shadow-xs">
                  {selectedDossierMember.name.slice(0, 2).toUpperCase()}
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

            <div className="flex items-center justify-between pt-4 border-t border-[#DAF1DE]">
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
      {/* MODAL 2: Assign Leadership Post                                           */}
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
