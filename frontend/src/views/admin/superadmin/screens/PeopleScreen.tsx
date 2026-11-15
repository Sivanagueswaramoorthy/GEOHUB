import React, { useState, useMemo } from 'react';
import { Search, Plus, GraduationCap, Users, UserPlus } from 'lucide-react';
import { PersonCard, PersonItem } from '../components/PersonCard';
import { AddFacultySheet } from '../components/AddFacultySheet';
import { AddStudentSheet } from '../components/AddStudentSheet';
import { PersonActionSheet } from '../components/PersonActionSheet';
import { botanicalTheme } from '../theme';

export interface PeopleScreenProps {
  facultyList: PersonItem[];
  studentList: PersonItem[];
  onAddFaculty: (data: any) => Promise<void>;
  onAddStudent: (data: any) => Promise<void>;
  onEditDetails: (person: PersonItem) => void;
  onResetPassword: (person: PersonItem, newPass: string) => Promise<void>;
  onRevokeAccess: (person: PersonItem) => Promise<void>;
  isAddFacultyOpen?: boolean;
  setIsAddFacultyOpen?: (isOpen: boolean) => void;
  isAddStudentOpen?: boolean;
  setIsAddStudentOpen?: (isOpen: boolean) => void;
}

export const PeopleScreen: React.FC<PeopleScreenProps> = ({
  facultyList,
  studentList,
  onAddFaculty,
  onAddStudent,
  onEditDetails,
  onResetPassword,
  onRevokeAccess,
  isAddFacultyOpen: propIsAddFacultyOpen,
  setIsAddFacultyOpen: propSetIsAddFacultyOpen,
  isAddStudentOpen: propIsAddStudentOpen,
  setIsAddStudentOpen: propSetIsAddStudentOpen,
}) => {
  const [activeSegment, setActiveSegment] = useState<'faculty' | 'students'>('faculty');
  const [searchQuery, setSearchQuery] = useState('');
  const [studentRoleFilter, setStudentRoleFilter] = useState('all');

  // Internal bottom sheet states
  const [internalAddFacultyOpen, setInternalAddFacultyOpen] = useState(false);
  const [internalAddStudentOpen, setInternalAddStudentOpen] = useState(false);
  const [selectedPersonForAction, setSelectedPersonForAction] = useState<PersonItem | null>(null);

  const isAddFacultyOpen = propIsAddFacultyOpen ?? internalAddFacultyOpen;
  const setIsAddFacultyOpen = propSetIsAddFacultyOpen ?? setInternalAddFacultyOpen;

  const isAddStudentOpen = propIsAddStudentOpen ?? internalAddStudentOpen;
  const setIsAddStudentOpen = propSetIsAddStudentOpen ?? setInternalAddStudentOpen;

  const studentRoleFilters = [
    'all',
    'student',
    'volunteer',
    'coordinator',
    'management',
    'treasurer',
    'documentation',
    'promotion',
  ];

  // Filtered Faculty List
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.roll_no.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        (f.department && f.department.toLowerCase().includes(q))
      );
    });
  }, [facultyList, searchQuery]);

  // Filtered Student List
  const filteredStudents = useMemo(() => {
    return studentList.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.roll_no.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.department && s.department.toLowerCase().includes(q));

      const matchRole =
        studentRoleFilter === 'all' ||
        (s.role && s.role.toLowerCase() === studentRoleFilter.toLowerCase());

      return matchSearch && matchRole;
    });
  }, [studentList, searchQuery, studentRoleFilter]);

  return (
    <div className="flex flex-col gap-3.5 animate-fadeIn select-none relative">
      {/* 1. Top Segmented Control (Faculty | Students) + Action Button */}
      <div className="flex flex-col gap-2">
        <div className="p-1 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveSegment('faculty')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer touch-target-44 ${
              activeSegment === 'faculty'
                ? 'bg-[#163832] text-white shadow-sm'
                : 'text-[#235347] hover:bg-[#DAF1DE]'
            }`}
          >
            <GraduationCap size={16} />
            <span>Faculty Advisors ({facultyList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSegment('students')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer touch-target-44 ${
              activeSegment === 'students'
                ? 'bg-[#163832] text-white shadow-sm'
                : 'text-[#235347] hover:bg-[#DAF1DE]'
            }`}
          >
            <Users size={16} />
            <span>Student Scholars ({studentList.length})</span>
          </button>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#235347]">
            {activeSegment === 'faculty' ? 'Faculty Governance & Provisioning' : 'Student & Member Governance'}
          </span>
          <button
            type="button"
            onClick={() => {
              if (activeSegment === 'faculty') {
                setIsAddFacultyOpen(true);
              } else {
                setIsAddStudentOpen(true);
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer touch-target-44 shadow-2xs"
            style={{ backgroundColor: botanicalTheme.colors.emeraldSlate }}
          >
            <Plus size={14} />
            <span>{activeSegment === 'faculty' ? 'Add Faculty Advisor' : 'Add Student / Member'}</span>
          </button>
        </div>
      </div>

      {/* 2. Sticky Search Bar */}
      <div className="sticky top-2 z-20 flex flex-col gap-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSegment === 'faculty'
                ? 'Search faculty by name, ID (e.g. FAC01), or email...'
                : 'Search students by name, roll no, or role...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#DAF1DE] shadow-[0_2px_10px_rgba(5,31,32,0.04)] text-xs font-semibold text-[#051F20] placeholder-[#8EB69B] outline-none focus:border-[#163832] touch-target-44"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#235347] hover:text-[#051F20]"
            >
              Clear
            </button>
          )}
        </div>

        {/* 3. Students Role Filter Chips (Only shown on Students segment) */}
        {activeSegment === 'students' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {studentRoleFilters.map((r) => {
              const isSelected = studentRoleFilter === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setStudentRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition capitalize shrink-0 cursor-pointer touch-target-44 flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#163832] text-white shadow-2xs'
                      : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:border-[#8EB69B]'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Active List: Faculty or Students */}
      {activeSegment === 'faculty' ? (
        filteredFaculty.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#F6FBF7] border border-dashed border-[#DAF1DE] text-center flex flex-col items-center justify-center gap-2">
            <GraduationCap size={32} className="text-[#8EB69B]" />
            <h4 className="text-sm font-bold text-[#051F20]">No Faculty Advisors Found</h4>
            <p className="text-xs text-[#235347] max-w-xs leading-relaxed">
              Tap the &quot;+&quot; button below to onboard institutional faculty advisors with verified credentials.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredFaculty.map((fac) => (
              <PersonCard
                key={fac.id}
                person={fac}
                type="faculty"
                onActionClick={(person) => setSelectedPersonForAction(person)}
              />
            ))}
          </div>
        )
      ) : filteredStudents.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#F6FBF7] border border-dashed border-[#DAF1DE] text-center flex flex-col items-center justify-center gap-2">
          <Users size={32} className="text-[#8EB69B]" />
          <h4 className="text-sm font-bold text-[#051F20]">No Student Scholars Found</h4>
          <p className="text-xs text-[#235347] max-w-xs leading-relaxed">
            Tap the &quot;+&quot; button below to register scholars and squad officers into the club directory.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredStudents.map((st) => (
            <PersonCard
              key={st.id}
              person={st}
              type="student"
              onActionClick={(person) => setSelectedPersonForAction(person)}
            />
          ))}
        </div>
      )}

      {/* 5. Floating "+" Button pinned above bottom nav */}
      <button
        type="button"
        aria-label={activeSegment === 'faculty' ? 'Add Faculty Advisor' : 'Add Student / Member'}
        onClick={() => {
          if (activeSegment === 'faculty') {
            setIsAddFacultyOpen(true);
          } else {
            setIsAddStudentOpen(true);
          }
        }}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all touch-target-44"
        style={{
          backgroundColor: botanicalTheme.colors.emeraldSlate,
          boxShadow: '0 8px 24px rgba(22, 56, 50, 0.35)',
        }}
        title={activeSegment === 'faculty' ? 'Add Faculty Advisor' : 'Add Student Scholar'}
      >
        <Plus size={24} strokeWidth={2.6} />
      </button>

      {/* 6. Action Bottom Sheet */}
      <PersonActionSheet
        isOpen={Boolean(selectedPersonForAction)}
        onClose={() => setSelectedPersonForAction(null)}
        person={selectedPersonForAction}
        type={activeSegment === 'faculty' ? 'faculty' : 'student'}
        onEditDetails={onEditDetails}
        onResetPassword={onResetPassword}
        onRevokeAccess={onRevokeAccess}
      />
    </div>
  );
};

export default PeopleScreen;
