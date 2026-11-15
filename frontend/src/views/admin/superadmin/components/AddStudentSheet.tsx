import React, { useState } from 'react';
import { UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { CockpitBottomSheet } from './CockpitBottomSheet';
import { botanicalTheme } from '../theme';

export interface AddStudentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    roll_no: string;
    email: string;
    role: string;
    department?: string;
    year_of_study?: string;
    post?: string;
    team?: string;
    phone?: string;
    password?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export const AddStudentSheet: React.FC<AddStudentSheetProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Geoinformatics Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('1st Year');
  const [post, setPost] = useState('Student Member');
  const [team, setTeam] = useState('General');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('geohub');
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter Student Scholar name');
      return;
    }
    if (!rollNo.trim()) {
      setError('Please enter Register Number (e.g. 24GEO002)');
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
        role,
        department: department.trim(),
        year_of_study: yearOfStudy.trim(),
        post: post.trim(),
        team: team.trim(),
        phone: phone.trim(),
        password: password.trim() || 'geohub',
      });
      // Reset form
      setName('');
      setRollNo('');
      setEmail('');
      setRole('student');
      setDepartment('Geoinformatics Engineering');
      setYearOfStudy('1st Year');
      setPost('Student Member');
      setTeam('General');
      setPhone('');
      setPassword('geohub');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to onboard student');
    }
  };

  return (
    <CockpitBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard Student or Officer"
      subtitle="Register student credentials with immediate TiDB Cloud persistence"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-1 select-none">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#051F20]">
            Full Name <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            placeholder="e.g. Priya Sharma"
            className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] outline-none focus:border-[#163832]"
          />
        </div>

        {/* Register Number & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#051F20]">
              Register Number (Roll No) <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={rollNo}
              onChange={(e) => { setRollNo(e.target.value.toUpperCase()); setError(null); }}
              placeholder="e.g. 24GEO002"
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
              placeholder="e.g. priya.sharma@college.edu"
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] outline-none focus:border-[#163832]"
            />
          </div>
        </div>

        {/* Role & Squad Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#051F20]">Platform Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-bold text-[#051F20] outline-none focus:border-[#163832]"
            >
              <option value="student">Student Scholar</option>
              <option value="volunteer">Event Volunteer</option>
              <option value="coordinator">Club President / Coordinator</option>
              <option value="management">Management Lead</option>
              <option value="treasurer">Treasurer Lead</option>
              <option value="documentation">Documentation Lead</option>
              <option value="promotion">Promotion Lead</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#051F20]">Duty Squad</label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-bold text-[#051F20] outline-none focus:border-[#163832]"
            >
              <option value="General">General Members</option>
              <option value="Management">Management Squad</option>
              <option value="Promotion">Promotion & Media</option>
              <option value="Documentation">Documentation Squad</option>
              <option value="Treasury">Treasury & Finance</option>
              <option value="Entertainment">Volunteer Operations</option>
            </select>
          </div>
        </div>

        {/* Year of Study & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#051F20]">Year of Study</label>
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-bold text-[#051F20] outline-none focus:border-[#163832]"
            >
              <option value="1st Year">1st Year (Freshman)</option>
              <option value="2nd Year">2nd Year (Sophomore)</option>
              <option value="3rd Year">3rd Year (Junior)</option>
              <option value="4th Year">4th Year (Senior)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#051F20]">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] outline-none focus:border-[#163832]"
            />
          </div>
        </div>

        {/* Initial Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#051F20]">
              Initial Password <span className="text-[11px] font-normal text-[#235347]">(Default: geohub)</span>
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
            <span>{isSubmitting ? 'Onboarding Student...' : 'Save & Onboard Student Scholar'}</span>
          </button>
        </div>
      </form>
    </CockpitBottomSheet>
  );
};

export default AddStudentSheet;
