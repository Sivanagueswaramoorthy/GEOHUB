import React, { useState } from 'react';
import { UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { CockpitBottomSheet } from './CockpitBottomSheet';
import { botanicalTheme } from '../theme';

export interface AddFacultySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    roll_no: string;
    email: string;
    department: string;
    post: string;
    phone: string;
    password?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export const AddFacultySheet: React.FC<AddFacultySheetProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Geography & Geomatics');
  const [post, setPost] = useState('Faculty Advisor');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter the Faculty Advisor full name');
      return;
    }
    if (!rollNo.trim()) {
      setError('Please enter a Faculty ID / Roll No (e.g. FAC01)');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid institutional email address');
      return;
    }

    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        roll_no: rollNo.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        department: department.trim(),
        post: post.trim(),
        phone: phone.trim(),
        password: password.trim() || undefined,
      });
      // Reset form
      setName('');
      setRollNo('');
      setEmail('');
      setDepartment('Geography & Geomatics');
      setPost('Faculty Advisor');
      setPhone('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to onboard faculty advisor');
    }
  };

  return (
    <CockpitBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Provision Faculty Advisor"
      subtitle="Sanction institutional advisor credentials directly to TiDB Cloud"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-1 select-none">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#051F20]">
            Full Name <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            placeholder="e.g. Dr. Sarah Jenkins"
            className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] outline-none focus:border-[#163832]"
          />
        </div>

        {/* Faculty ID & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#051F20]">
              Faculty ID / Username <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={rollNo}
              onChange={(e) => { setRollNo(e.target.value.toUpperCase()); setError(null); }}
              placeholder="e.g. FAC01"
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#051F20] uppercase outline-none focus:border-[#163832]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#051F20]">
              Institutional Email <span className="text-rose-600">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="e.g. sarah.jenkins@college.edu"
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] outline-none focus:border-[#163832]"
            />
          </div>
        </div>

        {/* Department & Designation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#051F20]">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Geography & Geomatics"
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] outline-none focus:border-[#163832]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#051F20]">Designation / Title</label>
            <input
              type="text"
              value={post}
              onChange={(e) => setPost(e.target.value)}
              placeholder="e.g. Faculty Advisor"
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] outline-none focus:border-[#163832]"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#051F20]">Contact Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +1 (555) 019-2831"
            className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] outline-none focus:border-[#163832]"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#051F20]">
              Initial Password <span className="text-[11px] font-normal text-[#235347]">(Default: admin123)</span>
            </label>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-[11px] font-bold text-[#163832] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={11} /> Generate
            </button>
          </div>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank for default (admin123)"
            className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#051F20] outline-none focus:border-[#163832]"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer touch-target-44 shadow-md active:scale-98"
            style={{
              backgroundColor: botanicalTheme.colors.emeraldSlate,
            }}
          >
            <UserPlus size={16} />
            <span>{isSubmitting ? 'Provisioning Advisor...' : 'Save & Provision Faculty Advisor'}</span>
          </button>
        </div>
      </form>
    </CockpitBottomSheet>
  );
};

export default AddFacultySheet;
