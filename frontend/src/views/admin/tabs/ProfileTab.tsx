import React, { useState } from 'react';
import {
  ShieldAlert,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Mail,
  Building,
  Calendar,
  Smartphone,
  Cpu,
} from 'lucide-react';
import { DiagnosticsData } from '../types';

export interface ProfileTabProps {
  diagnostics: DiagnosticsData;
  showToast: (msg: string) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  diagnostics,
  showToast,
}) => {
  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      setErrorMsg('New password must contain both letters and numbers.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    // Success
    setSuccessMsg('SuperAdmin password updated successfully.');
    showToast('SuperAdmin password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ShieldAlert size={13} className="text-indigo-600" />
              Root Master Dossier
            </span>
            <span className="text-xs font-semibold text-slate-500">Security Clearance Level 5</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            SuperAdmin Profile & Security
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Manage your master credentials, account details, and security keys.
          </p>
        </div>
      </div>

      {/* Main Dossier Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-slate-100 shrink-0">
            SA
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-slate-900">System SuperAdmin</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Superadmin
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Root Active
              </span>
            </div>
            <p className="text-sm font-mono font-bold text-slate-600">Roll No: SA01</p>
            <p className="text-xs font-medium text-slate-500">
              Primary System Governor & Campus Module Overseer
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Mail size={12} /> Email ID
            </span>
            <p className="font-bold text-slate-900 text-sm">superadmin@college.edu</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Building size={12} /> Department
            </span>
            <p className="font-bold text-slate-900 text-sm">Geoinformatics Engineering</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Key size={12} /> Master Role
            </span>
            <p className="font-bold text-slate-900 text-sm">Root Superadministrator</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Calendar size={12} /> Account Created
            </span>
            <p className="font-bold text-slate-900 text-sm">Aug 2024 (Platform Genesis)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Smartphone size={12} /> Primary Device
            </span>
            <p className="font-bold text-slate-900 text-sm">Web Dashboard / Chrome</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Cpu size={12} /> App Build
            </span>
            <p className="font-bold text-slate-900 text-sm">v1.6.30 Production</p>
          </div>
        </div>

        {/* Protection Notice */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-amber-900 block font-bold mb-0.5">
              Root Authority Protection Enabled
            </strong>
            <p className="text-amber-800 font-medium">
              Superadmin is the main admin of the GeoHub platform. As per system governance rules,
              this profile is completely excluded from deletable member lists and cannot be removed
              or suspended by any faculty advisor or user.
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Lock size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Change Account Password</h2>
            <p className="text-xs font-medium text-slate-500">
              Ensure your master account uses a strong, unique alphanumeric password.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-700 text-xs font-bold animate-fadeIn">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-xs font-bold animate-fadeIn">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-semibold text-slate-900 outline-none transition-all pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Minimum 8 characters with letters & numbers"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-semibold text-slate-900 outline-none transition-all pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-semibold text-slate-900 outline-none transition-all pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Lock size={15} />
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileTab;
