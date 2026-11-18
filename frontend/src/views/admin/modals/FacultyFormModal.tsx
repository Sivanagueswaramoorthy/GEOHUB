import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { FacultyAdvisorItem } from '../types';

export interface FacultyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FacultyAdvisorItem>) => void;
  facultyToEdit?: FacultyAdvisorItem | null;
}

const DEPARTMENTS = [
  'Geoinformatics Engineering',
  'Civil Engineering',
  'Computer Science',
  'Electronics & Communication',
  'Mechanical Engineering',
];

export const FacultyFormModal: React.FC<FacultyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  facultyToEdit,
}) => {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNo, setRollNo] = useState('');

  useEffect(() => {
    if (facultyToEdit) {
      setName(facultyToEdit.name || '');
      setDesignation(facultyToEdit.designation || 'Faculty Advisor');
      setDepartment(facultyToEdit.department || DEPARTMENTS[0]);
      setEmail(facultyToEdit.email || '');
      setPhone(facultyToEdit.phone || '');
      setRollNo(facultyToEdit.roll_no || '');
    } else {
      setName('');
      setDesignation('Faculty Advisor');
      setDepartment(DEPARTMENTS[0]);
      setEmail('');
      setPhone('+91 94420 18820');
      setRollNo('');
    }
  }, [facultyToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: facultyToEdit?.id,
      name: name.trim(),
      designation: designation.trim() || 'Faculty Advisor',
      department,
      email: email.trim(),
      phone: phone.trim(),
      roll_no: rollNo.trim() || 'FAC0' + Math.floor(Math.random() * 90 + 10),
      status: facultyToEdit?.status || 'active',
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={facultyToEdit ? 'Edit Faculty Advisor' : 'Provision Faculty Advisor'}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
        <div>
          <label className="block text-xs font-semibold text-[#051F20] mb-1">
            Full Name & Title
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Sarah Jenkins"
            className="w-full h-11 px-3.5 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl text-sm font-medium text-[#051F20] focus:outline-none focus:border-[#163832]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[#051F20] mb-1">
              Designation
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior Advisor"
              className="w-full h-11 px-3 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl text-xs font-medium text-[#051F20] focus:outline-none focus:border-[#163832]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#051F20] mb-1">
              Staff ID / Roll No
            </label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="e.g. FAC01"
              className="w-full h-11 px-3 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl text-xs font-mono font-medium text-[#051F20] focus:outline-none focus:border-[#163832]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#051F20] mb-1">
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full h-11 px-3 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl text-xs font-medium text-[#051F20] focus:outline-none focus:border-[#163832]"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[#051F20] mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="advisor@college.edu"
              className="w-full h-11 px-3 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl text-xs font-medium text-[#051F20] focus:outline-none focus:border-[#163832]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#051F20] mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 94420 18820"
              className="w-full h-11 px-3 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl text-xs font-medium text-[#051F20] focus:outline-none focus:border-[#163832]"
            />
          </div>
        </div>

        {/* Sticky Save Button above keyboard */}
        <div className="pt-3 sticky bottom-0 bg-white">
          <button
            type="submit"
            className="w-full min-h-[44px] h-11 rounded-xl bg-[#163832] hover:bg-[#163832] text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            {facultyToEdit ? 'Save Changes' : 'Confirm Advisor Provisioning'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};

export default FacultyFormModal;
