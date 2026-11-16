import React from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Mail,
  Shield,
  Pencil,
  Trash2,
  Download,
  Key,
} from 'lucide-react';

interface Props {
  facultyList: any[];
  filteredFaculty: any[];
  facultyDepartments: string[];
  selectedFacultyDept: string;
  setSelectedFacultyDept: (dept: string) => void;
  facultySearch: string;
  setFacultySearch: (q: string) => void;
  onOpenAddFaculty: () => void;
  onOpenEditFaculty: (fac: any) => void;
  onDeleteFaculty: (id: string, name: string) => void;
  onExportCsv: () => void;
  onGeneratePin: (fac: any) => void;
}

export const FacultyDeck: React.FC<Props> = ({
  facultyList,
  filteredFaculty,
  facultyDepartments,
  selectedFacultyDept,
  setSelectedFacultyDept,
  facultySearch,
  setFacultySearch,
  onOpenAddFaculty,
  onOpenEditFaculty,
  onDeleteFaculty,
  onExportCsv,
  onGeneratePin,
}) => {
  return (
    <div className="mb-5 bg-white border border-[#DAF1DE] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#DAF1DE] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
            <GraduationCap size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#051F20] leading-tight">
                Faculty Governance & Provisioning
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347]">
                {facultyList.length} Active
              </span>
            </div>
            <p className="text-xs text-[#235347]">
              Institutional faculty advisory board & credentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={onExportCsv}
            className="px-3 py-2 rounded-xl bg-[#F6FBF7] hover:bg-[#DAF1DE] text-[#235347] border border-[#DAF1DE] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 shadow-2xs"
            title="Export faculty directory as CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddFaculty}
            className="px-3 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 shadow-xs"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add Faculty Advisor</span>
          </button>
        </div>
      </div>

      {/* Department Quick Filter Chips */}
      {facultyDepartments.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {facultyDepartments.map((dept) => {
            const count =
              dept === 'all'
                ? facultyList.length
                : facultyList.filter(
                    (f) => (f.department || '').trim().toLowerCase() === dept.toLowerCase()
                  ).length;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedFacultyDept(dept)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer touch-target-44 ${
                  selectedFacultyDept === dept
                    ? 'bg-[#163832] text-white shadow-2xs'
                    : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:border-[#8EB69B]'
                }`}
              >
                {dept === 'all' ? 'All Departments' : dept} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Search Bar for Faculty */}
      {facultyList.length > 0 && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
          <input
            type="text"
            placeholder="Search faculty by name, ID, email, or department..."
            value={facultySearch}
            onChange={(e) => setFacultySearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-medium text-[#051F20] placeholder-[#8EB69B] focus:outline-none focus:border-[#235347] transition"
          />
        </div>
      )}

      {/* Faculty Roster List */}
      {facultyList.length === 0 ? (
        <div className="p-4 rounded-xl bg-[#F6FBF7] border border-dashed border-[#DAF1DE] text-center flex flex-col items-center justify-center gap-1 py-5">
          <GraduationCap size={24} className="text-[#8EB69B]" />
          <span className="text-xs font-bold text-[#051F20]">No Faculty Advisors</span>
          <p className="text-xs text-[#235347]">
            Tap &quot;Add Faculty Advisor&quot; to provision verified advisors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFaculty.map((fac) => (
            <div
              key={fac.id}
              className="p-3.5 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] flex flex-col justify-between gap-3 shadow-2xs hover:border-[#8EB69B] transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#163832] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {fac.name ? fac.name.charAt(0).toUpperCase() : 'F'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-[#051F20] truncate">{fac.name}</h3>
                      <span className="font-mono text-xs text-[#235347] font-semibold">{fac.roll_no}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
                <div className="mt-2.5 space-y-1 text-xs text-[#235347]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail size={12} className="text-[#8EB69B] shrink-0" />
                    <span className="truncate">{fac.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Shield size={12} className="text-[#8EB69B] shrink-0" />
                    <span className="truncate">
                      {fac.post || 'Faculty Advisor'} • {fac.department}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DAF1DE] flex items-center justify-between">
                <span className="text-[11px] text-[#52665C] capitalize">{fac.status || 'Active'}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onGeneratePin(fac)}
                    className="p-1 rounded-lg text-[#235347] hover:bg-[#DAF1DE] transition cursor-pointer"
                    title="Generate Temporary Access PIN"
                    aria-label={`Generate PIN for ${fac.name}`}
                  >
                    <Key size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenEditFaculty(fac)}
                    className="p-1 rounded-lg text-[#235347] hover:bg-[#DAF1DE] transition cursor-pointer"
                    title="Edit faculty details & password"
                    aria-label={`Edit faculty details for ${fac.name}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteFaculty(fac.id, fac.name)}
                    className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove faculty account"
                    aria-label={`Remove faculty account for ${fac.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
