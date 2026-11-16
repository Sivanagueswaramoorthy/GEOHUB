import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { SuperAdminUserItem } from '../types';

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

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState(SQUADS[0]);
  const [role, setRole] = useState(ROLES[0].key);

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name || '');
      setRollNo(studentToEdit.roll_no || '');
      setEmail(studentToEdit.email || '');
      setTeam(studentToEdit.team || SQUADS[0]);
      setRole(studentToEdit.role || ROLES[0].key);
    } else {
      setName('');
      setRollNo('');
      setEmail('');
      setTeam(SQUADS[0]);
      setRole(ROLES[0].key);
    }
  }, [studentToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: studentToEdit?.id,
      name: name.trim(),
      roll_no: rollNo.trim().toUpperCase() || '24GEO' + Math.floor(Math.random() * 900 + 100),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
      team,
      role,
      department: studentToEdit?.department || 'Geoinformatics',
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
      <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
        <div>
          <label className="block text-xs font-semibold text-[#051F20] mb-1">
            Scholar Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="w-full h-11 px-3.5 bg-[#F7FAF8] border border-[#E3EEE6] rounded-xl text-sm font-medium focus:outline-none focus:border-[#8EB69B]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[#051F20] mb-1">
              Roll / Register No
            </label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="e.g. 23GEO042"
              className="w-full h-11 px-3 bg-[#F7FAF8] border border-[#E3EEE6] rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#8EB69B]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#051F20] mb-1">
              Campus Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@college.edu"
              className="w-full h-11 px-3 bg-[#F7FAF8] border border-[#E3EEE6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8EB69B]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[#051F20] mb-1">
              Duty Squad
            </label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full h-11 px-3 bg-[#F7FAF8] border border-[#E3EEE6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8EB69B]"
            >
              {SQUADS.map((sq) => (
                <option key={sq} value={sq}>
                  {sq} Squad
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#051F20] mb-1">
              Platform Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 px-3 bg-[#F7FAF8] border border-[#E3EEE6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8EB69B]"
            >
              {ROLES.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sticky Save Button above keyboard */}
        <div className="pt-3 sticky bottom-0 bg-white">
          <button
            type="submit"
            className="w-full min-h-[44px] h-11 rounded-xl bg-[#051F20] hover:bg-[#163832] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {studentToEdit ? 'Save Changes' : 'Onboard Scholar'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};

export default StudentFormModal;

