import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  AlertOctagon,
  Trash2,
  Key,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  Building,
  Calendar,
  Clock,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  UserCheck,
  Award,
  Users,
  Check,
  RotateCcw,
  Shield,
  UserX,
} from 'lucide-react';
import { UnifiedMemberItem, ModuleConfig } from '../types';
import { SearchField, FilterDropdownMenu } from '../../../components/shared';

export interface LogsTabProps {
  members: UnifiedMemberItem[];
  modules: ModuleConfig[];
  onToggleSuspend: (id: string, kind: 'student' | 'faculty') => void;
  onDeleteMember: (id: string, kind: 'student' | 'faculty') => void;
  onUpdateMemberModules: (id: string, modulesList: string[]) => void;
  onAssignPost?: (
    id: string,
    post: string,
    role: string,
    team?: string,
    department?: string,
    year?: string
  ) => Promise<any> | void;
}

export const LogsTab: React.FC<LogsTabProps> = ({
  members,
  modules,
  onToggleSuspend,
  onDeleteMember,
  onUpdateMemberModules,
  onAssignPost,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'student' | 'faculty' | 'suspended'>('all');
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [selectedMember, setSelectedMember] = useState<UnifiedMemberItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isManagingAccess, setIsManagingAccess] = useState(false);

  // Assign Post State
  const [isAssigningPost, setIsAssigningPost] = useState(false);
  const [assignPostTitle, setAssignPostTitle] = useState('Student Member');
  const [assignRole, setAssignRole] = useState('student');
  const [assignSquad, setAssignSquad] = useState('General');
  const [isSavingPost, setIsSavingPost] = useState(false);

  // Dynamic filter options
  const availableDepartments = useMemo(() => {
    const list = Array.from(new Set(members.map((m) => m.department).filter(Boolean)));
    return [
      'All',
      ...Array.from(
        new Set([
          ...list,
          'Geoinformatics',
          'Computer Science',
          'Information Technology',
          'Civil Engineering',
          'AI & Data Science',
        ])
      ),
    ];
  }, [members]);

  const availableRoles = useMemo(() => {
    const list = Array.from(
      new Set(
        members
          .filter((m) => m.kind !== 'faculty' && !m.role?.toLowerCase().includes('faculty'))
          .map((m) => m.role && (m.role.charAt(0).toUpperCase() + m.role.slice(1)))
          .filter(Boolean)
      )
    );
    return [
      'All',
      ...Array.from(
        new Set([
          ...list,
          'Student',
          'Volunteer',
          'Coordinator',
          'Management',
          'Treasurer',
          'Documentation',
          'Promotion',
        ])
      ),
    ];
  }, [members]);

  const availableYears = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

  const isAdvancedFilterActive =
    deptFilter !== 'All' || roleFilter !== 'All' || yearFilter !== 'All';

  const isAnyFilterActive =
    activeFilter !== 'all' ||
    deptFilter !== 'All' ||
    roleFilter !== 'All' ||
    yearFilter !== 'All' ||
    searchQuery.trim().length > 0;

  const handleResetAdvancedFilters = () => {
    setDeptFilter('All');
    setRoleFilter('All');
    setYearFilter('All');
  };

  const handleResetAllFilters = () => {
    setActiveFilter('all');
    setDeptFilter('All');
    setRoleFilter('All');
    setYearFilter('All');
    setSearchQuery('');
  };

  // Filter members (SuperAdmin SA01 is already excluded at hook level)
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Never show superadmin in member list as specified
      if (m.roll_no === 'SA01' || m.role?.toLowerCase().includes('superadmin')) {
        return false;
      }

      // Filter by category
      if (activeFilter === 'student' && m.kind !== 'student') return false;
      if (activeFilter === 'faculty' && m.kind !== 'faculty') return false;
      if (activeFilter === 'suspended' && m.status !== 'suspended' && m.status !== 'disabled')
        return false;

      // Filter by department
      if (deptFilter !== 'All') {
        const d = (m.department || '').toLowerCase();
        const target = deptFilter.toLowerCase();
        if (d !== target && !d.includes(target)) return false;
      }

      // Filter by role
      if (roleFilter !== 'All') {
        if ((m.role || '').toLowerCase() !== roleFilter.toLowerCase()) return false;
      }

      // Filter by year
      if (yearFilter !== 'All') {
        const y = (m.year_of_study || '').toLowerCase();
        const target = yearFilter.toLowerCase();
        if (y !== target && y.charAt(0) !== target.charAt(0)) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesRoll = m.roll_no.toLowerCase().includes(q);
        const matchesDept = m.department.toLowerCase().includes(q);
        const matchesRole = m.role.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        return matchesName || matchesRoll || matchesDept || matchesRole || matchesEmail;
      }

      return true;
    });
  }, [members, activeFilter, deptFilter, roleFilter, yearFilter, searchQuery]);

  // Counts for filter pills
  const counts = useMemo(() => {
    const valid = members.filter((m) => m.roll_no !== 'SA01');
    return {
      all: valid.length,
      student: valid.filter((m) => m.kind === 'student').length,
      faculty: valid.filter((m) => m.kind === 'faculty').length,
      suspended: valid.filter((m) => m.status === 'suspended' || m.status === 'disabled').length,
    };
  }, [members]);

  // Keep selectedMember state synced if modified
  const currentMember = useMemo(() => {
    if (!selectedMember) return null;
    return members.find((m) => m.id === selectedMember.id) || null;
  }, [selectedMember, members]);

  // Handle giving/revoking access to a module for selected member
  const handleToggleModuleAccess = (moduleKey: string) => {
    if (!currentMember) return;
    const currentList = currentMember.allowedModules || modules.map((m) => m.key);
    let updated: string[];
    if (currentList.includes(moduleKey)) {
      updated = currentList.filter((k) => k !== moduleKey);
    } else {
      updated = [...currentList, moduleKey];
    }
    onUpdateMemberModules(currentMember.id, updated);
  };

  const handleOpenMember = (member: UnifiedMemberItem) => {
    setSelectedMember(member);
    setShowDeleteConfirm(false);
    setIsManagingAccess(false);
    setIsAssigningPost(false);
    setAssignPostTitle(member.designation || member.role || 'Student Member');
    setAssignRole(member.role || 'student');
    setAssignSquad((member as any).team || 'General');
  };

  const handleSavePost = async () => {
    if (!currentMember || !onAssignPost) return;
    try {
      setIsSavingPost(true);
      await onAssignPost(
        currentMember.id,
        assignPostTitle,
        assignRole,
        assignSquad,
        currentMember.department,
        currentMember.year_of_study
      );
      setIsAssigningPost(false);
    } catch {
      // handled in parent toast
    } finally {
      setIsSavingPost(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-16 font-sans">
      {/* Page Header: Clean People Typography */}
      <div className="pt-1 px-0.5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 style={{ color: '#051F20' }} className="text-2xl sm:text-3xl font-black tracking-tight">
              People
            </h1>
            <span
              style={{ backgroundColor: '#DAF1DE', color: '#163832', borderColor: '#8EB69B' }}
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs"
            >
              {filteredMembers.length} records shown
            </span>
          </div>
          <p style={{ color: '#235347' }} className="text-xs sm:text-sm font-medium mt-1">
            Click any member to inspect credentials, assign leadership posts, suspend, or configure access.
          </p>
        </div>
      </div>

      {/* 1. Standalone Clean Search Bar */}
      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name, roll number, department, or email..."
        resultsCount={searchQuery ? filteredMembers.length : undefined}
      />

      {/* 2. Dedicated Directory Filter Deck (Horizontal 3-Column Layout without scrollbar) */}
      <div
        style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
        className="cockpit-card rounded-2xl p-3.5 sm:p-4 border shadow-xs space-y-3 select-none"
      >
        {/* Top Header: Title & Live Record Count */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
            >
              <Filter size={15} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <span style={{ color: '#051F20' }} className="text-xs sm:text-sm font-bold tracking-tight block truncate">
                Directory Filters
              </span>
              <p style={{ color: '#235347' }} className="text-xs font-medium truncate">
                Showing {filteredMembers.length} of {counts.all} records
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Filters: 3-Column Grid without horizontal scrollbar */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full pt-2 border-t border-[#DAF1DE]/70">
          {/* Department Dropdown Menu */}
          <FilterDropdownMenu
            label="Department"
            prefix="Dept"
            value={deptFilter}
            options={availableDepartments}
            onChange={setDeptFilter}
            icon={<Building size={12} strokeWidth={2.2} />}
            allLabel="All Depts"
            align="left"
            className="w-full min-w-0"
            buttonClassName="w-full justify-between"
          />

          {/* Role Dropdown Menu */}
          <FilterDropdownMenu
            label="Role"
            prefix="Role"
            value={roleFilter}
            options={availableRoles}
            onChange={setRoleFilter}
            icon={<Shield size={12} strokeWidth={2.2} />}
            allLabel="All Roles"
            align="left"
            className="w-full min-w-0"
            buttonClassName="w-full justify-between"
          />

          {/* Year Dropdown Menu */}
          <FilterDropdownMenu
            label="Year of Study"
            prefix="Year"
            value={yearFilter}
            options={availableYears}
            onChange={setYearFilter}
            icon={<GraduationCap size={12} strokeWidth={2.2} />}
            allLabel="All Years"
            align="right"
            className="w-full min-w-0"
            buttonClassName="w-full justify-between"
          />
        </div>

        {/* Down Right Corner: Reset Filters Action Button */}
        {isAdvancedFilterActive && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleResetAdvancedFilters}
              style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE', color: '#051F20' }}
              className="min-h-[34px] px-3.5 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-all hover:bg-[#DAF1DE] hover:border-[#8EB69B] active:scale-95 cursor-pointer shadow-2xs"
              title="Reset all directory filters"
              aria-label="Reset all directory filters"
            >
              <RotateCcw size={12} strokeWidth={2.2} className="text-[#235347]" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Member Records List (Cards in Clean Mint Grid) */}
      {filteredMembers.length === 0 ? (
        <div
          style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
          className="cockpit-card rounded-3xl p-6 sm:p-8 border text-center shadow-xs space-y-4 select-none animate-fadeIn"
        >
          {/* Dual-halo Icon Emblem */}
          <div className="flex items-center justify-center">
            <div
              style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
              className="w-16 h-16 rounded-2xl border flex items-center justify-center shadow-2xs"
            >
              <div
                style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
                className="w-11 h-11 rounded-xl flex items-center justify-center"
              >
                {searchQuery.trim() ? (
                  <Search size={22} strokeWidth={2.4} />
                ) : isAdvancedFilterActive || activeFilter !== 'all' ? (
                  <SlidersHorizontal size={22} strokeWidth={2.4} />
                ) : (
                  <Users size={22} strokeWidth={2.4} />
                )}
              </div>
            </div>
          </div>

          {/* Heading & Contextual Subtitle */}
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 style={{ color: '#051F20' }} className="text-base sm:text-lg font-black tracking-tight">
              {searchQuery.trim()
                ? 'No Records Found'
                : isAdvancedFilterActive || activeFilter !== 'all'
                ? 'No Matching Members'
                : 'Campus Directory is Empty'}
            </h2>
            <p style={{ color: '#235347' }} className="text-xs sm:text-sm font-medium leading-relaxed">
              {searchQuery.trim() ? (
                <>
                  No scholars match the search criteria{' '}
                  <span className="font-bold text-[#051F20]">&apos;{searchQuery.trim()}&apos;</span>. Check for
                  typos or clear filters.
                </>
              ) : isAdvancedFilterActive || activeFilter !== 'all' ? (
                'No members match the currently selected filter combination. Adjust your filters or reset to view all campus records.'
              ) : (
                'No student scholars or faculty advisors have been enrolled into the directory yet.'
              )}
            </p>
          </div>

          {/* Active Filter Pill Strip */}
          {(activeFilter !== 'all' || deptFilter !== 'All' || roleFilter !== 'All' || yearFilter !== 'All') && (
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
              {activeFilter !== 'all' && (
                <span
                  style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE', color: '#051F20' }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs"
                >
                  <span style={{ color: '#235347' }} className="font-medium">Type:</span> {activeFilter}
                </span>
              )}
              {deptFilter !== 'All' && (
                <span
                  style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE', color: '#051F20' }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs"
                >
                  <span style={{ color: '#235347' }} className="font-medium">Dept:</span> {deptFilter}
                </span>
              )}
              {roleFilter !== 'All' && (
                <span
                  style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE', color: '#051F20' }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs"
                >
                  <span style={{ color: '#235347' }} className="font-medium">Role:</span> {roleFilter}
                </span>
              )}
              {yearFilter !== 'All' && (
                <span
                  style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE', color: '#051F20' }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs"
                >
                  <span style={{ color: '#235347' }} className="font-medium">Year:</span> {yearFilter}
                </span>
              )}
            </div>
          )}

          {/* Interactive Action Buttons */}
          {(searchQuery.trim() || isAdvancedFilterActive || activeFilter !== 'all') && (
            <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE', color: '#051F20' }}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-all hover:bg-[#DAF1DE] active:scale-95 cursor-pointer shadow-2xs"
                  title="Clear search text"
                  aria-label="Clear search"
                >
                  <X size={13} strokeWidth={2.4} className="text-[#235347]" />
                  <span>Clear Search</span>
                </button>
              )}
              {(isAdvancedFilterActive || activeFilter !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  style={{ backgroundColor: '#163832', color: '#FFFFFF' }}
                  className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all hover:bg-[#235347] active:scale-95 cursor-pointer shadow-xs"
                  title="Reset all filters to show all members"
                  aria-label="Reset all filters"
                >
                  <RotateCcw size={13} strokeWidth={2.4} className="text-[#DAF1DE]" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {filteredMembers.map((member) => {
            const isStudent = member.kind === 'student';
            const isSuspended = member.status === 'suspended' || member.status === 'disabled';

            return (
              <div
                key={member.id}
                onClick={() => handleOpenMember(member)}
                style={{
                  backgroundColor: '#F6FBF7',
                  borderColor: isSuspended ? '#D9534F' : '#DAF1DE',
                }}
                className="cockpit-card rounded-2xl p-3.5 sm:p-4 border transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Initials Badge */}
                  <div
                    style={{
                      backgroundColor: isSuspended ? '#F6FBF7' : isStudent ? '#DAF1DE' : '#DAF1DE',
                      color: isSuspended ? '#D9534F' : isStudent ? '#235347' : '#163832',
                      borderColor: isSuspended ? '#D9534F' : isStudent ? '#DAF1DE' : '#8EB69B',
                    }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border shadow-xs transition-transform group-hover:scale-105"
                  >
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h2 style={{ color: '#051F20' }} className="text-sm font-bold truncate">
                        {member.name}
                      </h2>
                      <span
                        style={{
                          backgroundColor: isStudent ? '#DAF1DE' : '#DAF1DE',
                          color: isStudent ? '#235347' : '#163832',
                          borderColor: isStudent ? '#DAF1DE' : '#8EB69B',
                        }}
                        className="text-xs font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider border"
                      >
                        {member.kind}
                      </span>
                    </div>

                    <p style={{ color: '#235347' }} className="text-xs font-mono font-bold truncate">
                      {member.roll_no} &bull; {member.department}
                    </p>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                        className="text-xs font-bold px-2 py-0.5 rounded-md border"
                      >
                        {member.designation || member.year_of_study || member.role}
                      </span>
                      {isSuspended ? (
                        <span
                          style={{ backgroundColor: '#F6FBF7', borderColor: '#D9534F', color: '#D9534F' }}
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full border"
                        >
                          Suspended
                        </span>
                      ) : (
                        <span
                          style={{ backgroundColor: '#DAF1DE', borderColor: '#8EB69B', color: '#163832' }}
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full border"
                        >
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} className="text-stone-400 group-hover:text-stone-700 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            );
          })}
        </div>
      )}

      {/* Member Details Modal (Clean Mint Dialog) */}
      {currentMember && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-modal-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
            className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div
              style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
              className="p-4 sm:p-5 border-b flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    backgroundColor: currentMember.kind === 'student' ? '#051F20' : '#163832',
                    color: '#FFFFFF',
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xs shrink-0"
                >
                  {currentMember.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 id="member-modal-title" style={{ color: '#051F20' }} className="text-base font-black truncate max-w-[240px]">
                    {currentMember.name}
                  </h2>
                  <p style={{ color: '#235347' }} className="text-xs font-mono font-bold">
                    {currentMember.roll_no} &bull; {currentMember.kind.toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#235347' }}
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:brightness-95 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Status Alert Banner */}
              <div
                style={{
                  backgroundColor: currentMember.status === 'suspended' ? '#F6FBF7' : '#DAF1DE',
                  borderColor: currentMember.status === 'suspended' ? '#D9534F' : '#8EB69B',
                  color: currentMember.status === 'suspended' ? '#D9534F' : '#163832',
                }}
                className="p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  {currentMember.status === 'suspended' ? (
                    <ShieldAlert size={16} className="text-rose-600" />
                  ) : (
                    <ShieldCheck size={16} className="text-emerald-700" />
                  )}
                  <span>
                    Status:{' '}
                    {currentMember.status === 'suspended' ? 'Suspended (Access Revoked)' : 'Active (Full Access)'}
                  </span>
                </div>
                <span className="font-mono text-xs opacity-80">ID: {currentMember.id}</span>
              </div>

              {/* Data Grid: Name, Roll No, Email, Department, Year/Designation, Role */}
              <div
                style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs rounded-2xl p-4 border shadow-xs"
              >
                <div className="space-y-0.5">
                  <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs">
                    Full Legal Name
                  </span>
                  <p style={{ color: '#051F20' }} className="font-black text-sm">{currentMember.name}</p>
                </div>

                <div className="space-y-0.5">
                  <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs">
                    Roll Number / UID
                  </span>
                  <p style={{ color: '#051F20' }} className="font-mono font-black text-sm">
                    {currentMember.roll_no}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs flex items-center gap-1">
                    <Mail size={11} /> Email Address
                  </span>
                  <p style={{ color: '#051F20' }} className="font-semibold break-all">{currentMember.email}</p>
                </div>

                <div className="space-y-0.5">
                  <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs flex items-center gap-1">
                    <Building size={11} /> Department
                  </span>
                  <p style={{ color: '#051F20' }} className="font-semibold">{currentMember.department}</p>
                </div>

                <div className="space-y-0.5">
                  <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs flex items-center gap-1">
                    <Calendar size={11} />{' '}
                    {currentMember.kind === 'student' ? 'Year of Study' : 'Designation'}
                  </span>
                  <p style={{ color: '#051F20' }} className="font-bold">
                    {currentMember.year_of_study || currentMember.designation || 'N/A'}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs flex items-center gap-1">
                    <Clock size={11} /> Assigned Role
                  </span>
                  <p style={{ color: '#163832' }} className="font-black uppercase text-xs">
                    {currentMember.role}
                  </p>
                </div>
              </div>

              {/* Assign Post & Squad Section (Core User Requirement) */}
              {currentMember.kind === 'student' && onAssignPost && (
                <div
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
                  className="rounded-2xl border p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-amber-600" />
                      <div>
                        <h3 style={{ color: '#051F20' }} className="text-xs font-black uppercase tracking-wider">
                          Assign Post & Squad
                        </h3>
                        <p style={{ color: '#235347' }} className="text-xs font-medium">
                          Current: <strong style={{ color: '#051F20' }}>{currentMember.designation || 'Student Member'}</strong> &bull; Squad: <strong style={{ color: '#051F20' }}>{(currentMember as any).team || 'General'}</strong>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAssigningPost(!isAssigningPost)}
                      style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE', color: '#051F20' }}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl border shadow-xs cursor-pointer hover:border-emerald-600 active:scale-95 transition-all"
                    >
                      {isAssigningPost ? 'Cancel' : 'Assign Post →'}
                    </button>
                  </div>

                  {isAssigningPost && (
                    <div
                      style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
                      className="p-3.5 rounded-xl border space-y-3 animate-fadeIn"
                    >
                      <div>
                        <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1">
                          Select Official Post / Title
                        </label>
                        <select
                          value={assignPostTitle}
                          onChange={(e) => setAssignPostTitle(e.target.value)}
                          style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                          className="w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none focus:border-emerald-600"
                        >
                          <option value="Student Member">Student Member (Primary)</option>
                          <option value="Club President">Club President</option>
                          <option value="Vice President">Vice President</option>
                          <option value="Documentation Lead">Documentation Lead</option>
                          <option value="Treasurer">Treasurer</option>
                          <option value="Promotion Lead">Promotion Lead</option>
                          <option value="Lead Volunteer">Lead Volunteer</option>
                          <option value="Senior Technical Associate">Senior Technical Associate</option>
                          <option value="Executive Committee Member">Executive Committee Member</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1">
                            Squad / Team
                          </label>
                          <select
                            value={assignSquad}
                            onChange={(e) => setAssignSquad(e.target.value)}
                            style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                            className="w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none focus:border-emerald-600"
                          >
                            <option value="General">General Squad</option>
                            <option value="Management">Management Squad</option>
                            <option value="Documentation">Documentation Squad</option>
                            <option value="Promotion">Promotion Squad</option>
                            <option value="Entertainment">Entertainment Squad</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1">
                            Role Clearance
                          </label>
                          <select
                            value={assignRole}
                            onChange={(e) => setAssignRole(e.target.value)}
                            style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                            className="w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none focus:border-emerald-600"
                          >
                            <option value="student">student (Default Member)</option>
                            <option value="volunteer">volunteer (Squad Volunteer)</option>
                            <option value="coordinator">coordinator (President)</option>
                            <option value="management">management (VP / Operations)</option>
                            <option value="documentation">documentation (Records)</option>
                            <option value="treasurer">treasurer (Finances)</option>
                            <option value="promotion">promotion (Outreach)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isSavingPost}
                        onClick={handleSavePost}
                        style={{ backgroundColor: '#051F20', color: '#FFFFFF' }}
                        className="w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60"
                      >
                        {isSavingPost ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                            <span>Updating TiDB Cloud...</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} strokeWidth={2.4} />
                            <span>Confirm & Assign Post to TiDB</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Module Access Clearance Section (Give Access feature) */}
              <div
                style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
                className="rounded-2xl border p-4 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Key size={15} className="text-emerald-700" />
                    <h3 style={{ color: '#051F20' }} className="text-xs font-black uppercase tracking-wider">
                      Custom Module Hub Access
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManagingAccess(!isManagingAccess)}
                    style={{ color: '#163832' }}
                    className="text-xs font-bold hover:underline cursor-pointer"
                  >
                    {isManagingAccess ? 'Done' : 'Give / Edit Access &rarr;'}
                  </button>
                </div>

                <p style={{ color: '#235347' }} className="text-xs mb-3 font-medium">
                  Authorized to access {(currentMember.allowedModules || []).length} of {modules.length} campus modules.
                </p>

                {isManagingAccess ? (
                  <div style={{ borderColor: '#DAF1DE' }} className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t animate-fadeIn">
                    {modules.map((mod) => {
                      const isAllowed = (currentMember.allowedModules || []).includes(mod.key);
                      return (
                        <button
                          key={mod.key}
                          type="button"
                          onClick={() => handleToggleModuleAccess(mod.key)}
                          style={{
                            backgroundColor: isAllowed ? '#DAF1DE' : '#FFFFFF',
                            borderColor: isAllowed ? '#8EB69B' : '#DAF1DE',
                            color: isAllowed ? '#163832' : '#235347',
                          }}
                          className="p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between border transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <span className="truncate mr-2">{mod.label}</span>
                          {isAllowed ? (
                            <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                          ) : (
                            <XCircle size={14} className="text-stone-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {(currentMember.allowedModules || []).map((modKey) => {
                      const modObj = modules.find((m) => m.key === modKey);
                      return (
                        <span
                          key={modKey}
                          style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE', color: '#051F20' }}
                          className="px-2 py-0.5 rounded-md text-xs font-bold border"
                        >
                          {modObj?.label || modKey}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Delete Confirmation Warning */}
              {showDeleteConfirm && (
                <div
                  style={{ backgroundColor: '#F6FBF7', borderColor: '#D9534F' }}
                  className="rounded-2xl p-4 text-xs animate-fadeIn space-y-3 border"
                >
                  <p style={{ color: '#D9534F' }} className="font-black text-sm">
                    Confirm Permanent Deletion
                  </p>
                  <p style={{ color: '#051F20' }} className="font-medium">
                    Are you sure you want to permanently delete {currentMember.name} ({currentMember.roll_no})? This action will remove the record directly from TiDB Cloud.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteMember(currentMember.id, currentMember.kind);
                        setSelectedMember(null);
                        setShowDeleteConfirm(false);
                      }}
                      style={{ backgroundColor: '#D9534F', color: '#FFFFFF' }}
                      className="px-4 py-2 rounded-xl font-bold cursor-pointer shadow-xs active:scale-95"
                    >
                      Yes, Delete Record
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#D9534F', color: '#051F20' }}
                      className="px-4 py-2 rounded-xl border font-bold cursor-pointer shadow-xs active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer: Suspend, Delete, Give Access */}
            <div
              style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
              className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* 1. Suspend Button */}
                <button
                  type="button"
                  onClick={() => onToggleSuspend(currentMember.id, currentMember.kind)}
                  style={{
                    backgroundColor: currentMember.status === 'suspended' ? '#163832' : '#F2B84B',
                    color: '#FFFFFF',
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <AlertOctagon size={15} />
                  {currentMember.status === 'suspended' ? 'Lift Suspension' : 'Suspend Member'}
                </button>

                {/* 2. Delete Button */}
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ backgroundColor: '#F6FBF7', borderColor: '#D9534F', color: '#D9534F' }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Trash2 size={15} />
                  Delete Member
                </button>
              </div>

              {/* 3. Give Access Button */}
              <button
                type="button"
                onClick={() => setIsManagingAccess(!isManagingAccess)}
                style={{ backgroundColor: '#051F20', color: '#FFFFFF' }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Key size={15} />
                {isManagingAccess ? 'Done Permissions' : 'Give Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsTab;
