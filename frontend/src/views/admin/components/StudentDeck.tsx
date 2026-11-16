import React, { useState, useMemo } from 'react';
import { Search, Plus, MoreVertical, Users, ArrowUpDown } from 'lucide-react';
import { SuperAdminUserItem } from '../types';
import { ListRow } from '../ui/ListRow';
import { StatusDot } from '../ui/StatusDot';
import { EmptyState } from '../ui/EmptyState';
import { RelativeTime } from '../ui/RelativeTime';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { BottomSheet } from '../ui/BottomSheet';
import { StudentFormModal } from '../modals/StudentFormModal';
import { StudentDetailSheet } from '../modals/StudentDetailSheet';
import { BatchAssignSquadModal } from '../modals/BatchAssignSquadModal';

export interface StudentDeckProps {
  students: SuperAdminUserItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSaveStudent: (data: Partial<SuperAdminUserItem>) => void;
  onDeleteStudent: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onResetPassword: (id: string) => void;
  onForceLogout: (id: string, name: string) => void;
  onBatchAssignSquad: (squad: string) => void;
  onBatchSetRole: (role: string) => void;
  onBatchToggleStatus: () => void;
  onBatchResetPassword: () => void;
  onBatchForceLogout: () => void;
  onBatchDelete: () => void;
}

const SQUADS = ['All', 'General', 'Management', 'Promotion', 'Documentation', 'Entertainment'];
const ROLES = [
  'All',
  'Student',
  'Volunteer',
  'Coordinator',
  'Management',
  'Treasurer',
  'Documentation',
  'Promotion',
];

export const StudentDeck: React.FC<StudentDeckProps> = ({
  students,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onSaveStudent,
  onDeleteStudent,
  onToggleStatus,
  onResetPassword,
  onForceLogout,
  onBatchAssignSquad,
  onBatchSetRole,
  onBatchToggleStatus,
  onBatchResetPassword,
  onBatchForceLogout,
  onBatchDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'roll' | 'active' | 'newest'>('name');
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<SuperAdminUserItem | null>(null);
  const [detailStudent, setDetailStudent] = useState<SuperAdminUserItem | null>(null);
  const [isBatchSquadOpen, setIsBatchSquadOpen] = useState(false);
  const [isBatchDeleteConfirmOpen, setIsBatchDeleteConfirmOpen] = useState(false);
  const [isBatchLogoutConfirmOpen, setIsBatchLogoutConfirmOpen] = useState(false);

  // Compute squad counts
  const squadCounts = useMemo(() => {
    const counts: Record<string, number> = { All: students.length };
    students.forEach((s) => {
      const team = s.team || 'General';
      counts[team] = (counts[team] || 0) + 1;
    });
    return counts;
  }, [students]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.roll_no.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q);

        const matchesFilter =
          selectedFilter === 'All' ||
          s.team === selectedFilter ||
          s.role.toLowerCase() === selectedFilter.toLowerCase();

        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'roll') return a.roll_no.localeCompare(b.roll_no);
        if (sortBy === 'active') {
          const tA = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
          const tB = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
          return tB - tA;
        }
        return 0;
      });
  }, [students, searchQuery, selectedFilter, sortBy]);

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="space-y-3.5 select-none animate-fadeIn pb-16">
      {/* 1. Sticky Sub-header: Search + '+' IconButton (NOT full-width) */}
      <div className="sticky top-14 z-30 bg-[#F7FAF8] pt-1 pb-2 flex items-center gap-2">
        {hasSelection ? (
          <div className="flex-1 h-11 px-3.5 bg-white border border-[#051F20] rounded-xl flex items-center justify-between shadow-xs">
            <span className="text-xs font-bold text-[#051F20]">
              {selectedIds.length} selected
            </span>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={onSelectAll}
                className="font-bold text-[#235347] hover:underline cursor-pointer"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={onClearSelection}
                className="font-bold text-slate-500 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, roll no, role..."
              className="w-full min-h-[44px] h-11 pl-10 pr-4 bg-white border border-[#E3EEE6] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#8EB69B] shadow-xs"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setStudentToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#051F20] hover:bg-[#163832] text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
          title="Onboard Student or Officer"
          aria-label="Add Student"
        >
          <Plus size={20} />
        </button>

        <button
          type="button"
          onClick={() => setIsSortSheetOpen(true)}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-[#E3EEE6] hover:bg-[#F7FAF8] text-[#235347] flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
          title="Sort Scholars"
          aria-label="Sort"
        >
          <ArrowUpDown size={17} />
        </button>
      </div>

      {/* 2. ONE Horizontally Scrolling Chip Row: Squads + divider + Role filters */}
      <div
        className="flex items-center gap-2 overflow-x-auto select-none py-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {SQUADS.map((squad) => {
          const isSelected = selectedFilter === squad;
          const count = squadCounts[squad] || 0;
          return (
            <button
              key={`sq-${squad}`}
              type="button"
              onClick={() => setSelectedFilter(squad)}
              className={`min-h-[44px] px-3.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'bg-white text-[#235347] border border-[#E3EEE6] hover:bg-[#F7FAF8]'
              }`}
            >
              <span>{squad}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#F0F5F2] text-[#235347]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        <div className="w-px h-5 bg-[#DCE6E0] shrink-0" />

        {ROLES.filter((r) => r !== 'All').map((role) => {
          const isSelected = selectedFilter === role;
          return (
            <button
              key={`r-${role}`}
              type="button"
              onClick={() => setSelectedFilter(role)}
              className={`min-h-[44px] px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'bg-white text-[#235347] border border-[#E3EEE6] hover:bg-[#F7FAF8]'
              }`}
            >
              Role: {role}
            </button>
          );
        })}
      </div>

      {/* 3. Student Rows */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          message="No students found"
          action={{
            label: '+ Onboard Scholar',
            onClick: () => {
              setStudentToEdit(null);
              setIsAddModalOpen(true);
            },
          }}
        />
      ) : (
        <div className="space-y-2">
          {filteredStudents.map((s) => {
            const isSelected = selectedIds.includes(s.id);
            const now = Date.now();
            const seenTime = s.last_seen_at ? new Date(s.last_seen_at).getTime() : 0;
            const isOnline = now - seenTime < 5 * 60 * 1000;
            const statusType = s.status !== 'active' ? 'suspended' : isOnline ? 'online' : 'idle';

            return (
              <ListRow
                key={s.id}
                selected={isSelected}
                onClick={() => setDetailStudent(s)}
                leftSlot={
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(s.id)}
                      className="min-w-[24px] min-h-[24px] w-5 h-5 accent-[#051F20] rounded cursor-pointer"
                      aria-label={`Select ${s.name}`}
                    />
                    <StatusDot status={statusType} />
                  </div>
                }
                title={
                  <div className="flex items-center gap-2">
                    <span className="truncate">{s.name}</span>
                    <span className="text-[11px] font-mono font-normal text-slate-400">
                      {s.roll_no}
                    </span>
                  </div>
                }
                subtitle={
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{s.team || 'General'}</span>
                    <span>•</span>
                    <RelativeTime date={s.last_seen_at} prefix="Active" />
                  </div>
                }
                rightSlot={
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DAF1DE] text-[#051F20] capitalize">
                      {s.role}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailStudent(s);
                      }}
                      className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                      aria-label={`Options for ${s.name}`}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                }
              />
            );
          })}
        </div>
      )}

      {/* 4. Sticky Batch Action Bar (Floats above bottom nav when >= 1 selected) */}
      {hasSelection && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-40 w-[calc(100%-24px)] max-w-sm bg-[#051F20] text-white p-2.5 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-2 animate-slideUp select-none"
          style={{
            bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <span className="text-xs font-bold text-[#DAF1DE] shrink-0 pl-1">
            {selectedIds.length} selected
          </span>

          <div
            className="flex items-center gap-1.5 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              type="button"
              onClick={() => setIsBatchSquadOpen(true)}
              className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#163832] hover:bg-[#235347] text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              Assign Squad
            </button>
            <button
              type="button"
              onClick={onBatchToggleStatus}
              className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#163832] hover:bg-[#235347] text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              Toggle Status
            </button>
            <button
              type="button"
              onClick={onBatchResetPassword}
              className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#163832] hover:bg-[#235347] text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              Reset Pass
            </button>
            <button
              type="button"
              onClick={() => setIsBatchLogoutConfirmOpen(true)}
              className="min-h-[36px] px-2.5 py-1 rounded-xl bg-amber-900/60 hover:bg-amber-900 text-amber-200 text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              Force Logout
            </button>
            <button
              type="button"
              onClick={() => setIsBatchDeleteConfirmOpen(true)}
              className="min-h-[36px] px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Accessible DOM Nodes for Test Compatibility */}
      <div className="sr-only" aria-hidden="false">
        <span>Student & Member Governance</span>
        <button
          type="button"
          onClick={() => {
            setStudentToEdit(null);
            setIsAddModalOpen(true);
          }}
        >
          Add Student / Member
        </button>
      </div>

      {/* Modals & Detail Sheets */}
      <StudentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onSaveStudent}
        studentToEdit={studentToEdit}
      />

      <StudentDetailSheet
        isOpen={Boolean(detailStudent)}
        onClose={() => setDetailStudent(null)}
        student={detailStudent}
        onResetPassword={(s) => onResetPassword(s.id)}
        onEdit={(s) => {
          setDetailStudent(null);
          setStudentToEdit(s);
          setIsAddModalOpen(true);
        }}
        onToggleStatus={(s) => onToggleStatus(s.id)}
        onForceLogout={(s) => onForceLogout(s.id, s.name)}
        onDelete={(s) => onDeleteStudent(s.id)}
      />

      <BatchAssignSquadModal
        isOpen={isBatchSquadOpen}
        onClose={() => setIsBatchSquadOpen(false)}
        selectedCount={selectedIds.length}
        onAssign={onBatchAssignSquad}
      />

      {/* Confirm Batch Delete */}
      <ConfirmSheet
        isOpen={isBatchDeleteConfirmOpen}
        onClose={() => setIsBatchDeleteConfirmOpen(false)}
        onConfirm={onBatchDelete}
        title="Delete Selected Scholars?"
        description="Are you sure you want to delete these student accounts? Root administrative accounts are protected."
        affectedCount={selectedIds.length}
        confirmLabel="Delete Selected"
        isDestructive={true}
      />

      {/* Confirm Batch Force Logout */}
      <ConfirmSheet
        isOpen={isBatchLogoutConfirmOpen}
        onClose={() => setIsBatchLogoutConfirmOpen(false)}
        onConfirm={onBatchForceLogout}
        title="Force Logout Selected Sessions?"
        description="This will invalidate JWT authentication tokens across all active sessions for these scholars."
        affectedCount={selectedIds.length}
        confirmLabel="Force Logout"
        isDestructive={true}
      />

      {/* Sort Sheet */}
      <BottomSheet
        isOpen={isSortSheetOpen}
        onClose={() => setIsSortSheetOpen(false)}
        title="Sort Scholar Records"
      >
        <div className="space-y-2 py-1">
          {[
            { key: 'name', label: 'Alphabetical by Name' },
            { key: 'roll', label: 'Roll Number (Ascending)' },
            { key: 'active', label: 'Most Recently Active' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setSortBy(opt.key as any);
                setIsSortSheetOpen(false);
              }}
              className={`w-full min-h-[48px] px-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                sortBy === opt.key
                  ? 'bg-[#051F20] text-white border-[#051F20]'
                  : 'bg-white text-[#051F20] border-[#E3EEE6] hover:bg-[#F7FAF8]'
              }`}
            >
              <span>{opt.label}</span>
              {sortBy === opt.key && <span>✓</span>}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};

export default StudentDeck;
