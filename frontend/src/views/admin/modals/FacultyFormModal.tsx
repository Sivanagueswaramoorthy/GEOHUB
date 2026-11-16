import React from 'react';
import { GraduationCap, X, CheckCircle2 } from 'lucide-react';

interface Props {
  isAddOpen: boolean;
  onAddClose: () => void;
  facultyForm: {
    name: string;
    roll_no: string;
    email: string;
    department: string;
    post: string;
    phone: string;
    password: string;
  };
  setFacultyForm: (form: any) => void;
  facultySubmitting: boolean;
  onCreateFaculty: (e: React.FormEvent) => Promise<void>;

  isEditOpen: boolean;
  onEditClose: () => void;
  editFacultyForm: {
    id: string;
    name: string;
    roll_no: string;
    email: string;
    department: string;
    post: string;
    phone: string;
    status: string;
    password: string;
  };
  setEditFacultyForm: (form: any) => void;
  editFacultySubmitting: boolean;
  onUpdateFaculty: (e: React.FormEvent) => Promise<void>;
}

export const FacultyFormModal: React.FC<Props> = ({
  isAddOpen,
  onAddClose,
  facultyForm,
  setFacultyForm,
  facultySubmitting,
  onCreateFaculty,
  isEditOpen,
  onEditClose,
  editFacultyForm,
  setEditFacultyForm,
  editFacultySubmitting,
  onUpdateFaculty,
}) => {
  if (isAddOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl w-full max-w-lg p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
                <GraduationCap size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#051F20]">Provision Faculty Advisor</h3>
                <p className="text-xs text-[#235347]">Grant official faculty credentials & sanction authority</p>
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

          <form onSubmit={onCreateFaculty} className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
            <div>
              <label className="block text-xs font-bold text-[#163832] mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={facultyForm.name}
                onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                placeholder="e.g. Dr. Sarah Jenkins"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">
                  Faculty ID / Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={facultyForm.roll_no}
                  onChange={(e) => setFacultyForm({ ...facultyForm, roll_no: e.target.value.toUpperCase() })}
                  placeholder="e.g. FAC01"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={facultyForm.email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                  placeholder="e.g. sarah.jenkins@college.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Department</label>
                <input
                  type="text"
                  value={facultyForm.department}
                  onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })}
                  placeholder="e.g. Geoinformatics Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Designation / Post</label>
                <input
                  type="text"
                  value={facultyForm.post}
                  onChange={(e) => setFacultyForm({ ...facultyForm, post: e.target.value })}
                  placeholder="e.g. Faculty Advisor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={facultyForm.phone}
                  onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Default Password</label>
                <input
                  type="text"
                  value={facultyForm.password}
                  onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                  placeholder="e.g. GeoHub2026!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
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
                disabled={facultySubmitting}
                className="px-5 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <GraduationCap size={15} />
                <span>{facultySubmitting ? 'Provisioning...' : 'Provision Advisor'}</span>
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
                <GraduationCap size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#051F20]">Edit Faculty Advisor</h3>
                <p className="text-xs text-[#235347]">Update credentials and institutional department</p>
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

          <form onSubmit={onUpdateFaculty} className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
            <div>
              <label className="block text-xs font-bold text-[#163832] mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editFacultyForm.name}
                onChange={(e) => setEditFacultyForm({ ...editFacultyForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">
                  Faculty ID / Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFacultyForm.roll_no}
                  onChange={(e) => setEditFacultyForm({ ...editFacultyForm, roll_no: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-mono font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editFacultyForm.email}
                  onChange={(e) => setEditFacultyForm({ ...editFacultyForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Department</label>
                <input
                  type="text"
                  value={editFacultyForm.department}
                  onChange={(e) => setEditFacultyForm({ ...editFacultyForm, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Designation / Post</label>
                <input
                  type="text"
                  value={editFacultyForm.post}
                  onChange={(e) => setEditFacultyForm({ ...editFacultyForm, post: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Status</label>
                <select
                  value={editFacultyForm.status}
                  onChange={(e) => setEditFacultyForm({ ...editFacultyForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">Reset Password (Optional)</label>
                <input
                  type="password"
                  value={editFacultyForm.password}
                  onChange={(e) => setEditFacultyForm({ ...editFacultyForm, password: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs font-mono text-[#051F20] font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#DAF1DE] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onEditClose}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editFacultySubmitting}
                className="px-5 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 size={15} />
                <span>{editFacultySubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};
