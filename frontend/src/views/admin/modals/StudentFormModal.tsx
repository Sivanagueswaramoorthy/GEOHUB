import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { SuperAdminUserItem } from '../types';
import { Hash, User, Calendar, Building, Key, UserPlus } from 'lucide-react';

export interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SuperAdminUserItem>) => void;
  studentToEdit?: SuperAdminUserItem | null;
}

const SQUADS = ['General', 'Management', 'Promotion', 'Documentation', 'Entertainment'];
const ROLES = [
  { key: 'student', label: 'Student Member' },
  { key: 'volunteer', label: 'Lead Volunteer' },
  { key: 'coordinator', label: 'Coordinator' },
  { key: 'management', label: 'Management Lead' },
  { key: 'documentation', label: 'Documentation Lead' },
  { key: 'treasurer', label: 'Treasurer' },
  { key: 'promotion', label: 'Promotion Lead' },
];

const BATCH_PREFIXES = ['+24GEO', '+23GEO', '+22GEO', '+21GEO'];
const DEPARTMENTS = ['Geoinformatics', 'Civil', 'Computer', 'Environmental'];
const YEARS = ['1st Year (Fresher)', '2nd Year', '3rd Year', '4th Year'];

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Geoinformatics');
  const [yearOfStudy, setYearOfStudy] = useState('1st Year (Fresher)');
  const [team, setTeam] = useState(SQUADS[0]);
  const [role, setRole] = useState(ROLES[0].key);

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name || '');
      setRollNo(studentToEdit.roll_no || '');
      setEmail(studentToEdit.email || '');
      setDepartment(studentToEdit.department || 'Geoinformatics');
      setYearOfStudy(studentToEdit.year_of_study || '1st Year (Fresher)');
      setTeam(studentToEdit.team || SQUADS[0]);
      setRole(studentToEdit.role || ROLES[0].key);
    } else {
      setName('');
      setRollNo('');
      setEmail('');
      setDepartment('Geoinformatics');
      setYearOfStudy('1st Year (Fresher)');
      setTeam(SQUADS[0]);
      setRole(ROLES[0].key);
    }
  }, [studentToEdit, isOpen]);

  const handleApplyPrefix = (prefix: string) => {
    const cleanPrefix = prefix.replace('+', '');
    if (!rollNo.startsWith(cleanPrefix)) {
      setRollNo(`${cleanPrefix}${rollNo.replace(/^[0-9]{2}[A-Z]{3}/, '')}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalRoll = rollNo.trim().toUpperCase() || '24GEO' + Math.floor(Math.random() * 900 + 100);
    onSave({
      id: studentToEdit?.id,
      name: name.trim(),
      roll_no: finalRoll,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
      department: department || 'Geoinformatics',
      year_of_study: yearOfStudy,
      team: team || 'General',
      role,
      post: studentToEdit?.post || (role === 'student' ? 'Student Member' : undefined),
      team_role: studentToEdit?.team_role || (role === 'student' ? 'Member' : undefined),
      status: studentToEdit?.status || 'active',
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'Edit Scholar Profile' : 'Onboard Student or Officer'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <div className="pb-1 border-b border-[#DAF1DE]">
          <h3 className="text-sm font-bold text-[#051F20]">Student Enrollment Form</h3>
          <p className="text-xs font-medium text-[#235347] mt-0.5">
            Required: Roll Number, Full Name, and Year. Scholar joins as a primary Member.
          </p>
        </div>

        {/* 1. ROLL NUMBER */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#235347]">
              ROLL NUMBER *
            </label>
            <span className="text-xs font-semibold text-[#8EB69B]">Primary Unique Key</span>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] focus-within:border-[#163832] focus-within:bg-white shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
              <Hash size={13} strokeWidth={2.4} />
            </div>
            <input
              type="text"
              required
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value.toUpperCase())}
              placeholder="e.g. 24GEO055"
              className="flex-1 bg-transparent border-0 outline-hidden text-xs sm:text-sm font-mono font-bold uppercase text-[#051F20] placeholder:text-[#8EB69B]"
            />
          </div>

          {/* Quick Batch Chips matching Image 3 */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            <span className="text-xs font-semibold text-[#235347]/80">Quick batch:</span>
            {BATCH_PREFIXES.map((prefix) => (
              <button
                key={prefix}
                type="button"
                onClick={() => handleApplyPrefix(prefix)}
                className="px-2 py-0.5 rounded-lg border border-[#DAF1DE] bg-white hover:bg-[#DAF1DE] text-[#051F20] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {prefix}
              </button>
            ))}
          </div>
          <p className="text-xs font-medium text-[#235347]/70">
            Roll number will be used as student login ID.
          </p>
        </div>

        {/* 2. STUDENT FULL NAME */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#235347]">
            STUDENT FULL NAME *
          </label>
          <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] focus-within:border-[#163832] focus-within:bg-white shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
              <User size={13} strokeWidth={2.4} />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="flex-1 bg-transparent border-0 outline-hidden text-xs sm:text-sm font-semibold text-[#051F20] placeholder:text-[#8EB69B]"
            />
          </div>
        </div>

        {/* 3. YEAR OF STUDY */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#235347]">
            YEAR OF STUDY *
          </label>
          <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] focus-within:border-[#163832] focus-within:bg-white shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
              <Calendar size={13} strokeWidth={2.4} />
            </div>
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-hidden text-xs sm:text-sm font-bold text-[#051F20] cursor-pointer"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. DEPARTMENT */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#235347]">
            DEPARTMENT
          </label>
          <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] focus-within:border-[#163832] focus-within:bg-white shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
              <Building size={13} strokeWidth={2.4} />
            </div>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Geoinformatics"
              className="flex-1 bg-transparent border-0 outline-hidden text-xs sm:text-sm font-bold text-[#051F20] placeholder:text-[#8EB69B]"
            />
          </div>

          {/* Department Suggestions matching Image 3 */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            <span className="text-xs font-semibold text-[#235347]/80">Suggestions:</span>
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setDepartment(dept)}
                className="px-2 py-0.5 rounded-lg border border-[#DAF1DE] bg-white hover:bg-[#DAF1DE] text-[#051F20] text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Default Password Banner matching Image 3 */}
        <div className="flex items-center gap-2 py-1">
          <Key size={14} className="text-[#235347]" />
          <span className="text-xs font-medium text-[#235347]">Default password:</span>
          <span className="px-2 py-0.5 rounded-md bg-[#DAF1DE] text-[#051F20] font-mono font-bold text-xs border border-[#8EB69B]/40">
            geohub
          </span>
        </div>

        {/* Submit Button matching Image 3 */}
        <div className="pt-2 sticky bottom-0 bg-white">
          <button
            type="submit"
            className="w-full min-h-[44px] h-12 rounded-2xl bg-[#051F20] hover:bg-[#163832] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
          >
            <UserPlus size={16} strokeWidth={2.4} />
            <span>{studentToEdit ? 'Save Changes' : 'Add Student'}</span>
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};

export default StudentFormModal;
