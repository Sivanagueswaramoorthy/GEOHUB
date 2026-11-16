import React from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Shield,
  Pencil,
  Trash2,
  CheckSquare,
  Square,
  Repeat,
  Key,
  X,
} from 'lucide-react';

interface Props {
  studentList: any[];
  filteredStudents: any[];
  studentSearch: string;
  setStudentSearch: (q: string) => void;
  studentRoleFilter: string;
  setStudentRoleFilter: (role: string) => void;
  squadDistribution: Record<string, number>;
  selectedStudentIds: string[];
  onToggleSelectStudent: (id: string) => void;
  onSelectAllStudents: () => void;
  onOpenAddStudent: () => void;
  onOpenEditStudent: (st: any) => void;
  onDeleteStudent: (id: string, name: string) => void;
  onOpenBatchSquad: () => void;
  onBatchToggleStatus: () => Promise<void>;
  onBatchResetPassword: () => Promise<void>;
  onBatchDelete: () => Promise<void>;
  onClearSelection: () => void;
  batchSubmitting: boolean;
}

export const StudentDeck: React.FC<Props> = ({
  studentList,
  filteredStudents,
  studentSearch,
  setStudentSearch,
  studentRoleFilter,
  setStudentRoleFilter,
  squadDistribution,
  selectedStudentIds,
  onToggleSelectStudent,
  onSelectAllStudents,
  onOpenAddStudent,
  onOpenEditStudent,
  onDeleteStudent,
  onOpenBatchSquad,
  onBatchToggleStatus,
  onBatchResetPassword,
  onBatchDelete,
  onClearSelection,
  batchSubmitting,
}) => {
  return (
    <div className="mb-5 bg-white border border-[#DAF1DE] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#DAF1DE] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
            <Users size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#051F20] leading-tight">
                Student & Member Governance
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347]">
                {studentList.length} Registered
              </span>
            </div>
            <p className="text-xs text-[#235347]">
              Student members, squad officers & access
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddStudent}
          className="px-3 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 shadow-xs self-start sm:self-auto"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Add Student / Member</span>
        </button>
      </div>

      {/* Squad Distribution Telemetry */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <span className="text-[10px] font-bold text-[#8EB69B] uppercase tracking-wider">Squads:</span>
        {Object.entries(squadDistribution).map(([sq, count]) => (
          <span
            key={sq}
            className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] whitespace-nowrap"
          >
            {sq} ({count})
          </span>
        ))}
        {filteredStudents.length > 0 && (
          <button
            type="button"
            onClick={onSelectAllStudents}
            className="ml-auto text-[11px] font-bold text-[#163832] hover:underline cursor-pointer whitespace-nowrap"
          >
            {selectedStudentIds.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
          <input
            type="text"
            placeholder="Search by name, roll number, or role..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-medium text-[#051F20] placeholder-[#8EB69B] focus:outline-none focus:border-[#235347] transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {['all', 'student', 'volunteer', 'coordinator', 'management', 'treasurer', 'documentation', 'promotion'].map(
            (rKey) => (
              <button
                key={rKey}
                type="button"
                onClick={() => setStudentRoleFilter(rKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition capitalize shrink-0 cursor-pointer ${
                  studentRoleFilter === rKey
                    ? 'bg-[#163832] text-white shadow-2xs'
                    : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:border-[#8EB69B]'
                }`}
              >
                {rKey}
              </button>
            )
          )}
        </div>
      </div>

      {/* Student Roster Cards */}
      {filteredStudents.length === 0 ? (
        <div className="p-4 rounded-xl bg-[#F6FBF7] border border-dashed border-[#DAF1DE] text-center flex flex-col items-center justify-center gap-1.5 py-6">
          <Users size={28} className="text-[#8EB69B]" />
          <span className="text-xs font-bold text-[#051F20]">No Students Matching Criteria</span>
          <p className="text-xs text-[#235347] max-w-sm">
            Click &quot;Add Student / Member&quot; above to onboard student scholars or officers into the club directory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredStudents.map((st) => (
            <div
              key={st.id || st.uid}
              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 shadow-2xs transition ${
                selectedStudentIds.includes(st.id || st.uid)
                  ? 'border-[#163832] bg-[#DAF1DE]/30 ring-1 ring-[#163832]'
                  : 'border-[#DAF1DE] bg-[#F6FBF7] hover:border-[#8EB69B]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleSelectStudent(st.id || st.uid)}
                      className="text-[#163832] hover:text-[#235347] transition cursor-pointer p-0.5 shrink-0"
                      aria-label={`Select student ${st.name}`}
                    >
                      {selectedStudentIds.includes(st.id || st.uid) ? (
                        <CheckSquare size={16} className="text-[#163832]" />
                      ) : (
                        <Square size={16} className="text-[#8EB69B]" />
                      )}
                    </button>
                    <div className="w-8 h-8 rounded-full bg-[#163832] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-[#051F20] truncate">{st.name}</h3>
                      <span className="font-mono text-xs text-[#235347] font-semibold">
                        {st.roll_no || st.rollNo}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DAF1DE] text-[#163832] uppercase shrink-0">
                    {st.role || 'Student'}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1 text-xs text-[#235347]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail size={12} className="text-[#8EB69B] shrink-0" />
                    <span className="truncate">{st.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Shield size={12} className="text-[#8EB69B] shrink-0" />
                    <span className="truncate">
                      {st.post || 'Student Member'} • {st.team || 'General'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DAF1DE] flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold capitalize ${
                    st.status === 'disabled' ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {st.status || 'Active'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onOpenEditStudent(st)}
                    className="p-1 rounded-lg text-[#235347] hover:bg-[#DAF1DE] transition cursor-pointer"
                    title="Edit student details & role"
                    aria-label={`Edit details for ${st.name}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteStudent(st.id || st.uid, st.name)}
                    className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove student account"
                    aria-label={`Remove account for ${st.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky Batch Control Bar */}
      {selectedStudentIds.length > 0 && (
        <div className="sticky bottom-2 z-30 p-2.5 sm:p-3 rounded-2xl bg-[#051F20] text-white border border-[#163832] shadow-2xl flex items-center justify-between gap-2 animate-fadeIn flex-wrap sm:flex-nowrap">
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#DAF1DE] text-[#051F20] shrink-0">
            {selectedStudentIds.length} Selected
          </span>

          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              disabled={batchSubmitting}
              onClick={onOpenBatchSquad}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 touch-target-44"
            >
              <Shield size={13} />
              <span>Assign Squad</span>
            </button>

            <button
              type="button"
              disabled={batchSubmitting}
              onClick={onBatchToggleStatus}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 touch-target-44"
            >
              <Repeat size={13} />
              <span>Toggle Status</span>
            </button>

            <button
              type="button"
              disabled={batchSubmitting}
              onClick={onBatchResetPassword}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 touch-target-44"
            >
              <Key size={13} />
              <span>Reset Pass</span>
            </button>

            <button
              type="button"
              disabled={batchSubmitting}
              onClick={onBatchDelete}
              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 touch-target-44"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>

            <button
              type="button"
              onClick={onClearSelection}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition cursor-pointer"
              title="Deselect all"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
