import React from 'react';
import {
  Building,
  Shield,
  GraduationCap,
  UserX,
  Filter,
  X,
  RotateCcw,
  Check,
} from 'lucide-react';

export interface StudentFilterState {
  department: string;
  role: string;
  year: string;
  status: 'all' | 'active' | 'suspended';
}

export interface StudentFilterBarProps {
  filterState: StudentFilterState;
  onFilterChange: (newState: StudentFilterState) => void;
  departments: string[];
  roles: string[];
  years: string[];
  counts: {
    total: number;
    active: number;
    suspended: number;
    filtered: number;
  };
  onReset: () => void;
  className?: string;
}

export const StudentFilterBar: React.FC<StudentFilterBarProps> = ({
  filterState,
  onFilterChange,
  departments,
  roles,
  years,
  counts,
  onReset,
  className = '',
}) => {
  const isAnyFilterActive =
    filterState.department !== 'All' ||
    filterState.role !== 'All' ||
    filterState.year !== 'All' ||
    filterState.status !== 'all';

  const activeFilterCount = [
    filterState.department !== 'All',
    filterState.role !== 'All',
    filterState.year !== 'All',
    filterState.status !== 'all',
  ].filter(Boolean).length;

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filterState, department: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filterState, role: e.target.value });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filterState, year: e.target.value });
  };

  const handleStatusClick = (status: 'all' | 'active' | 'suspended') => {
    onFilterChange({ ...filterState, status });
  };

  return (
    <div
      className={`bg-white border border-[#DAF1DE] rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-3 ${className}`}
    >
      {/* 1. Header Row: Filter Title + Result Count + Reset Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
            <Filter size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-[#051F20]">
                Scholar Filters
              </span>
              {isAnyFilterActive && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#163832] text-white">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-[#235347]">
              Showing {counts.filtered} of {counts.total} scholars
            </p>
          </div>
        </div>

        {isAnyFilterActive && (
          <button
            type="button"
            onClick={onReset}
            className="min-h-[44px] px-3 rounded-xl bg-[#F6FBF7] hover:bg-[#DAF1DE] text-[#051F20] border border-[#DAF1DE] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 active:scale-95"
            aria-label="Reset all filters"
            title="Reset all filters"
          >
            <RotateCcw size={13} className="text-[#235347]" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* 2. Quick Status Segmented Pills (All, Active, Suspended) */}
      <div className="flex items-center gap-2 overflow-x-auto select-none py-0.5">
        <button
          type="button"
          onClick={() => handleStatusClick('all')}
          className={`min-h-[44px] px-3.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            filterState.status === 'all'
              ? 'bg-[#051F20] text-white shadow-xs'
              : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-white'
          }`}
          aria-pressed={filterState.status === 'all'}
        >
          <span>All Status</span>
          <span
            className={`text-xs font-mono px-1.5 py-0.5 rounded-md font-bold ${
              filterState.status === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {counts.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleStatusClick('active')}
          className={`min-h-[44px] px-3.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            filterState.status === 'active'
              ? 'bg-[#163832] text-white shadow-xs'
              : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-white'
          }`}
          aria-pressed={filterState.status === 'active'}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active</span>
          <span
            className={`text-xs font-mono px-1.5 py-0.5 rounded-md font-bold ${
              filterState.status === 'active'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {counts.active}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleStatusClick('suspended')}
          className={`min-h-[44px] px-3.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            filterState.status === 'suspended'
              ? 'bg-[#D9534F] text-white shadow-xs'
              : counts.suspended > 0
              ? 'bg-[#F6FBF7] text-[#D9534F] border border-[#D9534F] hover:bg-red-50/50'
              : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-white'
          }`}
          aria-pressed={filterState.status === 'suspended'}
          title="Filter suspended or disabled students"
        >
          <UserX size={14} />
          <span>Suspended</span>
          <span
            className={`text-xs font-mono px-1.5 py-0.5 rounded-md font-bold ${
              filterState.status === 'suspended'
                ? 'bg-white/20 text-white'
                : counts.suspended > 0
                ? 'bg-rose-100 text-[#D9534F]'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {counts.suspended}
          </span>
        </button>
      </div>

      {/* 3. Dropdown Controls Grid: Department, Role, Year */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
        {/* Department Dropdown */}
        <div className="relative">
          <label
            htmlFor="student-filter-dept"
            className="block text-xs font-semibold text-[#235347] mb-1 flex items-center gap-1"
          >
            <Building size={12} className="text-[#163832]" />
            <span>Department</span>
          </label>
          <div className="relative">
            <select
              id="student-filter-dept"
              value={filterState.department}
              onChange={handleDeptChange}
              className={`w-full min-h-[44px] h-11 pl-3 pr-8 rounded-xl border text-xs font-bold appearance-none transition focus:outline-none focus:border-[#163832] cursor-pointer shadow-xs ${
                filterState.department !== 'All'
                  ? 'bg-[#F6FBF7] border-[#163832] text-[#051F20]'
                  : 'bg-white border-[#DAF1DE] text-[#051F20]'
              }`}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Role Dropdown */}
        <div className="relative">
          <label
            htmlFor="student-filter-role"
            className="block text-xs font-semibold text-[#235347] mb-1 flex items-center gap-1"
          >
            <Shield size={12} className="text-[#163832]" />
            <span>Role</span>
          </label>
          <div className="relative">
            <select
              id="student-filter-role"
              value={filterState.role}
              onChange={handleRoleChange}
              className={`w-full min-h-[44px] h-11 pl-3 pr-8 rounded-xl border text-xs font-bold appearance-none transition focus:outline-none focus:border-[#163832] cursor-pointer shadow-xs ${
                filterState.role !== 'All'
                  ? 'bg-[#F6FBF7] border-[#163832] text-[#051F20]'
                  : 'bg-white border-[#DAF1DE] text-[#051F20]'
              }`}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r === 'All' ? 'All Roles' : `Role: ${r}`}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Year Dropdown */}
        <div className="relative">
          <label
            htmlFor="student-filter-year"
            className="block text-xs font-semibold text-[#235347] mb-1 flex items-center gap-1"
          >
            <GraduationCap size={12} className="text-[#163832]" />
            <span>Year of Study</span>
          </label>
          <div className="relative">
            <select
              id="student-filter-year"
              value={filterState.year}
              onChange={handleYearChange}
              className={`w-full min-h-[44px] h-11 pl-3 pr-8 rounded-xl border text-xs font-bold appearance-none transition focus:outline-none focus:border-[#163832] cursor-pointer shadow-xs ${
                filterState.year !== 'All'
                  ? 'bg-[#F6FBF7] border-[#163832] text-[#051F20]'
                  : 'bg-white border-[#DAF1DE] text-[#051F20]'
              }`}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === 'All' ? 'All Years' : y}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFilterBar;
