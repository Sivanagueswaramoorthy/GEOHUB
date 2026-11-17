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
  UserCheck,
} from 'lucide-react';
import { UnifiedMemberItem, ModuleConfig } from '../types';

export interface LogsTabProps {
  members: UnifiedMemberItem[];
  modules: ModuleConfig[];
  onToggleSuspend: (id: string, kind: 'student' | 'faculty') => void;
  onDeleteMember: (id: string, kind: 'student' | 'faculty') => void;
  onUpdateMemberModules: (id: string, modulesList: string[]) => void;
}

export const LogsTab: React.FC<LogsTabProps> = ({
  members,
  modules,
  onToggleSuspend,
  onDeleteMember,
  onUpdateMemberModules,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'student' | 'faculty' | 'suspended'>('all');
  const [selectedMember, setSelectedMember] = useState<UnifiedMemberItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isManagingAccess, setIsManagingAccess] = useState(false);

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
      if (activeFilter === 'suspended' && m.status !== 'suspended' && m.status !== 'disabled') return false;

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
  }, [members, activeFilter, searchQuery]);

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

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <UserCheck size={13} className="text-amber-600" />
              Member Directory & Logs
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {filteredMembers.length} records shown
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Campus Directory & Member Logs
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Click any student or faculty record to inspect details, suspend, delete, or give access.
          </p>
        </div>
      </div>

      {/* Search Bar & Filter Chips */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll number, department, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-sm font-medium text-slate-900 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Members ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('student')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'student'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <GraduationCap size={14} />
            Students ({counts.student})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('faculty')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'faculty'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Briefcase size={14} />
            Faculty ({counts.faculty})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('suspended')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'suspended'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertOctagon size={14} />
            Suspended ({counts.suspended})
          </button>
        </div>
      </div>

      {/* Member Cards List */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
          <p className="text-sm font-bold text-slate-700">No members match your criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try searching with a different keyword or reset filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredMembers.map((member) => {
            const isSuspended = member.status === 'suspended' || member.status === 'disabled';
            const isStudent = member.kind === 'student';

            return (
              <div
                key={member.id}
                onClick={() => {
                  setSelectedMember(member);
                  setShowDeleteConfirm(false);
                  setIsManagingAccess(false);
                }}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 group ${
                  isSuspended
                    ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Initials Badge */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border shadow-sm transition-transform group-hover:scale-105 ${
                      isSuspended
                        ? 'bg-rose-100 text-rose-700 border-rose-200'
                        : isStudent
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}
                  >
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-sm font-bold text-slate-900 truncate">
                        {member.name}
                      </h2>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isStudent
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {member.kind}
                      </span>
                    </div>

                    <p className="text-xs font-mono font-semibold text-slate-600 truncate">
                      {member.roll_no} &bull; {member.department}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-medium text-slate-500">
                        {member.year_of_study || member.designation || member.role}
                      </span>
                      {isSuspended ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          Suspended
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-400 group-hover:text-slate-700 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Page / Modal Dossier Inspector for Selected Member */}
      {currentMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md ${
                    currentMember.status === 'suspended'
                      ? 'bg-rose-600'
                      : currentMember.kind === 'student'
                      ? 'bg-emerald-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {currentMember.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      {currentMember.name}
                    </h2>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                        currentMember.kind === 'student'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {currentMember.kind}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">
                    Roll No: {currentMember.roll_no}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedMember(null);
                  setShowDeleteConfirm(false);
                  setIsManagingAccess(false);
                }}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Member Data Details */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Account Status Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  currentMember.status === 'suspended'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {currentMember.status === 'suspended' ? (
                    <ShieldAlert size={16} className="text-rose-600" />
                  ) : (
                    <ShieldCheck size={16} className="text-emerald-600" />
                  )}
                  <span>
                    Status:{' '}
                    {currentMember.status === 'suspended' ? 'Suspended (Access Revoked)' : 'Active (Full Access)'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">ID: {currentMember.id}</span>
              </div>

              {/* Data Grid: Name, Roll No, Email, Department, Year/Designation, Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Full Legal Name
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{currentMember.name}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Roll Number / UID
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {currentMember.roll_no}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Mail size={11} /> Email ID
                  </span>
                  <p className="font-medium text-slate-800 break-all">{currentMember.email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Building size={11} /> Department
                  </span>
                  <p className="font-medium text-slate-800">{currentMember.department}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Calendar size={11} />{' '}
                    {currentMember.kind === 'student' ? 'Year of Study' : 'Designation'}
                  </span>
                  <p className="font-semibold text-slate-800">
                    {currentMember.year_of_study || currentMember.designation || 'N/A'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Clock size={11} /> Assigned Role
                  </span>
                  <p className="font-bold text-slate-900">{currentMember.role}</p>
                </div>
              </div>

              {/* Module Access Clearance Section (Give Access feature) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Key size={15} className="text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Custom Module Hub Access
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManagingAccess(!isManagingAccess)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {isManagingAccess ? 'Done' : 'Give / Edit Access &rarr;'}
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-3">
                  Authorized to access {(currentMember.allowedModules || []).length} of {modules.length} campus modules.
                </p>

                {isManagingAccess ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 animate-fadeIn">
                    {modules.map((mod) => {
                      const isAllowed = (currentMember.allowedModules || []).includes(mod.key);
                      return (
                        <button
                          key={mod.key}
                          type="button"
                          onClick={() => handleToggleModuleAccess(mod.key)}
                          className={`p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
                            isAllowed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                          <span className="truncate mr-2">{mod.label}</span>
                          {isAllowed ? (
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle size={14} className="text-slate-400 shrink-0" />
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
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
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
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs animate-fadeIn space-y-3">
                  <p className="font-bold text-rose-900 text-sm">
                    Confirm Permanent Deletion
                  </p>
                  <p className="text-rose-700">
                    Are you sure you want to permanently delete {currentMember.name} ({currentMember.roll_no})? This action cannot be undone.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteMember(currentMember.id, currentMember.kind);
                        setSelectedMember(null);
                        setShowDeleteConfirm(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                    >
                      Yes, Delete Record
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer: Suspend, Delete, Give Access */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* 1. Suspend Button */}
                <button
                  type="button"
                  onClick={() => onToggleSuspend(currentMember.id, currentMember.kind)}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border ${
                    currentMember.status === 'suspended'
                      ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                  }`}
                >
                  <AlertOctagon size={15} />
                  {currentMember.status === 'suspended' ? 'Lift Suspension' : 'Suspend Member'}
                </button>

                {/* 2. Delete Button */}
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Trash2 size={15} />
                  Delete Member
                </button>
              </div>

              {/* 3. Give Access Button */}
              <button
                type="button"
                onClick={() => setIsManagingAccess(!isManagingAccess)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs transition-colors cursor-pointer shadow-sm"
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
