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
import { APP_VERSION } from '../../../config/version';

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
    <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-16 font-sans">
      {/* Page Header (Clean Mint Design Tokens) */}
      <div
        style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
        className="cockpit-card rounded-2xl p-4 sm:p-5 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              style={{ backgroundColor: '#DAF1DE', borderColor: '#8EB69B', color: '#163832' }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border"
            >
              <ShieldAlert size={13} className="text-emerald-700" />
              Root Master Dossier
            </span>
            <span style={{ color: '#235347' }} className="text-xs font-semibold">Security Clearance Level 5</span>
          </div>
          <h1 style={{ color: '#051F20' }} className="text-xl sm:text-2xl font-black tracking-tight">
            SuperAdmin Profile & Security
          </h1>
          <p style={{ color: '#235347' }} className="text-xs sm:text-sm font-medium mt-1">
            Manage your master credentials, account details, and system security keys.
          </p>
        </div>
      </div>

      {/* Main Dossier Card (Light Peach Theme) */}
      <div
        style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
        className="cockpit-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div
            style={{ backgroundColor: '#051F20', color: '#F6FBF7' }}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-2xl shadow-md shrink-0"
          >
            SA
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 style={{ color: '#051F20' }} className="text-lg sm:text-xl font-black">System SuperAdmin</h2>
              <span
                style={{ backgroundColor: '#DAF1DE', borderColor: '#DAF1DE', color: '#235347' }}
                className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
              >
                Superadmin
              </span>
              <span
                style={{ backgroundColor: '#DAF1DE', borderColor: '#8EB69B', color: '#163832' }}
                className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
              >
                Root Active
              </span>
            </div>
            <p style={{ color: '#235347' }} className="text-xs sm:text-sm font-mono font-bold">Roll No: SA01</p>
            <p style={{ color: '#235347' }} className="text-xs font-medium">
              Primary System Governor & Campus Module Overseer
            </p>
          </div>
        </div>

        {/* Details Grid (White Inset Pills on Mint) */}
        <div
          style={{ borderColor: '#DAF1DE' }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t text-xs font-sans"
        >
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
            className="p-3.5 rounded-xl border space-y-1 shadow-xs"
          >
            <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs flex items-center gap-1">
              <Mail size={12} /> Email ID
            </span>
            <p style={{ color: '#051F20' }} className="font-black text-sm">superadmin@college.edu</p>
          </div>

          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
            className="p-3.5 rounded-xl border space-y-1 shadow-xs"
          >
            <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs flex items-center gap-1">
              <Building size={12} /> Department
            </span>
            <p style={{ color: '#051F20' }} className="font-black text-sm">Geoinformatics Engineering</p>
          </div>

          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
            className="p-3.5 rounded-xl border space-y-1 shadow-xs"
          >
            <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs flex items-center gap-1">
              <Key size={12} /> Master Role
            </span>
            <p style={{ color: '#051F20' }} className="font-black text-sm">Root Superadministrator</p>
          </div>

          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
            className="p-3.5 rounded-xl border space-y-1 shadow-xs"
          >
            <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs flex items-center gap-1">
              <Calendar size={12} /> Account Created
            </span>
            <p style={{ color: '#051F20' }} className="font-black text-sm">Aug 2024 (Platform Genesis)</p>
          </div>

          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
            className="p-3.5 rounded-xl border space-y-1 shadow-xs"
          >
            <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs flex items-center gap-1">
              <Smartphone size={12} /> Primary Device
            </span>
            <p style={{ color: '#051F20' }} className="font-black text-sm">Android APK / Web</p>
          </div>

          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
            className="p-3.5 rounded-xl border space-y-1 shadow-xs"
          >
            <span style={{ color: '#235347' }} className="font-bold uppercase tracking-wider text-xs flex items-center gap-1">
              <Cpu size={12} /> App Build
            </span>
            <p style={{ color: '#163832' }} className="font-black text-sm">v{APP_VERSION} TiDB Cloud</p>
          </div>
        </div>

        {/* Protection Notice */}
        <div
          style={{ backgroundColor: '#DAF1DE', borderColor: '#F2B84B' }}
          className="rounded-2xl p-4 border flex items-start gap-3 shadow-xs"
        >
          <ShieldAlert size={20} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong style={{ color: '#051F20' }} className="block font-black mb-0.5">
              Root Authority Protection Enabled
            </strong>
            <p style={{ color: '#051F20' }} className="font-medium">
              Superadmin is the root governor of the GeoHub platform. As per system governance rules,
              this profile is completely excluded from deletable member lists and cannot be removed
              or suspended by any faculty advisor or user.
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Card (Light Peach Theme) */}
      <div
        style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
        className="cockpit-card rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4"
      >
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
            className="w-10 h-10 rounded-xl border flex items-center justify-center shadow-xs shrink-0"
          >
            <Lock size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h2 style={{ color: '#051F20' }} className="text-base font-black">Change Account Password</h2>
            <p style={{ color: '#235347' }} className="text-xs font-medium">
              Ensure your master root account uses a strong, unique alphanumeric password.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{ backgroundColor: '#F6FBF7', borderColor: '#D9534F', color: '#D9534F' }}
            className="rounded-xl p-3 border flex items-center gap-2 text-xs font-bold animate-fadeIn"
          >
            <AlertCircle size={15} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{ backgroundColor: '#DAF1DE', borderColor: '#8EB69B', color: '#163832' }}
            className="rounded-xl p-3 border flex items-center gap-2 text-xs font-bold animate-fadeIn"
          >
            <CheckCircle2 size={15} className="shrink-0 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <div>
            <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none focus:border-emerald-600 transition-all pr-10 shadow-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Minimum 8 characters with letters & numbers"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none focus:border-emerald-600 transition-all pr-10 shadow-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none focus:border-emerald-600 transition-all pr-10 shadow-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{ backgroundColor: '#051F20', color: '#FFFFFF' }}
            className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95"
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
