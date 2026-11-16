import React from 'react';
import { UserPlus, X, CheckCircle2 } from 'lucide-react';

interface Props {
  isAddOpen: boolean;
  onAddClose: () => void;
  studentForm: {
    name: string;
    roll_no: string;
    email: string;
    role: string;
    department: string;
    year_of_study: string;
    post: string;
    team: string;
    phone: string;
    password: string;
  };
  setStudentForm: (form: any) => void;
  studentSubmitting: boolean;
  onCreateStudent: (e: React.FormEvent) => Promise<void>;

  isEditOpen: boolean;
  onEditClose: () => void;
  editStudentForm: {
    id: string;
    name: string;
    roll_no: string;
    email: string;
    role: string;
    department: string;
    year_of_study: string;
    post: string;
    team: string;
    status: string;
    phone: string;
    password: string;
  };
  setEditStudentForm: (form: any) => void;
  editStudentSubmitting: boolean;
  onUpdateStudent: (e: React.FormEvent) => Promise<void>;
}

export const StudentFormModal: React.FC<Props> = ({
  isAddOpen,
  onAddClose,
  studentForm,
  setStudentForm,
  studentSubmitting,
  onCreateStudent,
  isEditOpen,
  onEditClose,
  editStudentForm,
  setEditStudentForm,
  editStudentSubmitting,
  onUpdateStudent,
}) => {
  if (isAddOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl w-full max-w-lg p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
                <UserPlus size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#051F20]">Onboard Student or Officer</h3>
                <p className="text-xs text-[#235347]">Create student credentials and assign club squad</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onAddClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={onCreateStudent} className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
            <div>
              <label className="block text-xs font-bold text-[#163832] mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">
                  Register Number (Reg No) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.roll_no}
                  onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value.toUpperCase() })}
                  placeholder="e.g. 24GEO102"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs font-mono text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="e.g. priya.sharma@college.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Role Type</label>
                <select
                  value={studentForm.role}
                  onChange={(e) => setStudentForm({ ...studentForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
                >
                  <option value="student">Student Member</option>
                  <option value="volunteer">Volunteer (Check-In Gate)</option>
                  <option value="coordinator">President / Coordinator</option>
                  <option value="treasurer">Treasurer (Finance)</option>
                  <option value="documentation">Documentation Lead</option>
                  <option value="promotion">Promotion Lead</option>
                  <option value="management">Management Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Squad / Team</label>
                <select
                  value={studentForm.team}
                  onChange={(e) => setStudentForm({ ...studentForm, team: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
                >
                  <option value="General">General Members</option>
                  <option value="Management">Management Squad</option>
                  <option value="Promotion">Promotion Squad</option>
                  <option value="Documentation">Documentation Squad</option>
                  <option value="Entertainment">Entertainment Squad</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Department</label>
                <input
                  type="text"
                  value={studentForm.department}
                  onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                  placeholder="e.g. Geoinformatics Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Year of Study</label>
                <select
                  value={studentForm.year_of_study}
                  onChange={(e) => setStudentForm({ ...studentForm, year_of_study: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="PG / Research">PG / Research</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Post / Title</label>
                <input
                  type="text"
                  value={studentForm.post}
                  onChange={(e) => setStudentForm({ ...studentForm, post: e.target.value })}
                  placeholder="e.g. Squad Lead or Member"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Default Password</label>
                <input
                  type="text"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  placeholder="geohub"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs font-mono text-[#051F20] font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#DAF1DE] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onAddClose}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={studentSubmitting}
                className="px-5 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <UserPlus size={15} />
                <span>{studentSubmitting ? 'Onboarding...' : 'Onboard Scholar'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isEditOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl w-full max-w-lg p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
                <UserPlus size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#051F20]">Edit Student Scholar</h3>
                <p className="text-xs text-[#235347]">Update profile details, squad assignment, and role</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onEditClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={onUpdateStudent} className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
            <div>
              <label className="block text-xs font-semibold text-[#163832] mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editStudentForm.name}
                onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#163832] mb-1">
                  Register Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editStudentForm.roll_no}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, roll_no: e.target.value.toUpperCase() })}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163832] mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editStudentForm.email}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#163832] mb-1">Department</label>
                <input
                  type="text"
                  value={editStudentForm.department}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, department: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163832] mb-1">Role Type</label>
                <select
                  value={editStudentForm.role}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, role: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none bg-white cursor-pointer"
                >
                  <option value="student">Student Member</option>
                  <option value="volunteer">Volunteer (Gate Check-In)</option>
                  <option value="coordinator">President / Coordinator</option>
                  <option value="treasurer">Treasurer (Finance)</option>
                  <option value="documentation">Documentation Lead</option>
                  <option value="promotion">Promotion Lead</option>
                  <option value="management">Management Lead</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#163832] mb-1">Year of Study</label>
                <select
                  value={editStudentForm.year_of_study}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, year_of_study: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none bg-white cursor-pointer"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="PG / Research">PG / Research</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163832] mb-1">Squad / Team</label>
                <input
                  type="text"
                  value={editStudentForm.team}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, team: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#163832] mb-1">Post / Title</label>
                <input
                  type="text"
                  value={editStudentForm.post}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, post: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163832] mb-1">Account Status</label>
                <select
                  value={editStudentForm.status}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, status: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none bg-white cursor-pointer font-semibold"
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#163832] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editStudentForm.phone}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163832] mb-1">Reset Password (Optional)</label>
                <input
                  type="password"
                  value={editStudentForm.password}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, password: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#DAF1DE] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onEditClose}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editStudentSubmitting}
                className="px-5 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                <span>{editStudentSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};
