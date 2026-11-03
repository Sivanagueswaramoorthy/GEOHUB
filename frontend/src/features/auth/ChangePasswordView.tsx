import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PillButton, Mascot } from '../../components/shared';

export const ChangePasswordView: React.FC = () => {
  const { currentUser, setCurrentUser, showToast } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Strength computation
  const getStrength = (pwd: string): { label: 'Weak' | 'Fair' | 'Strong'; score: number; color: string } => {
    if (!pwd || pwd.length < 8) {
      return { label: 'Weak', score: 1, color: '#D9534F' };
    }
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSymbols = /[^a-zA-Z0-9]/.test(pwd);

    if (hasLetters && hasNumbers && hasSymbols && pwd.length >= 10) {
      return { label: 'Strong', score: 3, color: '#235347' };
    }
    if ((hasLetters && hasNumbers) || (hasLetters && hasSymbols)) {
      return { label: 'Fair', score: 2, color: '#F2B84B' };
    }
    return { label: 'Weak', score: 1, color: '#D9534F' };
  };

  const strength = getStrength(newPassword);
  const isValidLength = newPassword.length >= 8;
  const isMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isValidLength && isMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setCurrentUser({
      ...currentUser,
      mustChangePassword: false,
    });

    showToast('✓ Password updated successfully. Welcome to GeoHub!', 'success');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 select-none bg-[#F6FBF7]">
      <div
        className="w-full max-w-md bg-white border border-[#DAF1DE] p-7 shadow-[0_16px_40px_rgba(5,31,32,0.08)] flex flex-col gap-6"
        style={{ borderRadius: '28px' }}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <Mascot name="shield" size="md" />
          <h1 className="text-2xl font-bold tracking-tight text-[#051F20] mt-1">
            Create New Password
          </h1>
          <p className="text-xs font-semibold text-[#235347]">
            Institutional Security Mandate
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-xs font-medium text-[#051F20] flex items-start gap-2.5">
          <ShieldCheck size={18} strokeWidth={1.75} className="shrink-0 text-[#163832] mt-0.5" />
          <span>
            First login detected for <strong>{currentUser.name}</strong> ({currentUser.rollNo || currentUser.email}). You must establish a secure private password to proceed.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#051F20] pl-1">
              New Password (min 8 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter at least 8 characters..."
                className="w-full h-12 pl-4 pr-11 rounded-2xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-medium text-[#051F20] outline-none focus:border-[#163832]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#235347] hover:text-[#051F20] cursor-pointer touch-target-44 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
              </button>
            </div>

            {/* Strength Meter */}
            {newPassword.length > 0 && (
              <div className="flex flex-col gap-1 mt-1 pl-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#235347]">Password Strength:</span>
                  <span className="font-bold" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#DAF1DE] rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${(strength.score / 3) * 100}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
                <span className="text-xs text-[#235347] mt-0.5">
                  Hint: Use a mix of uppercase letters, numbers, and special symbols.
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#051F20] pl-1">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password..."
              className="w-full h-12 px-4 rounded-2xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-medium text-[#051F20] outline-none focus:border-[#163832]"
            />
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-1.5 pl-1 text-xs font-semibold">
                {isMatch ? (
                  <span className="text-[#235347] flex items-center gap-1">
                    <CheckCircle2 size={14} strokeWidth={1.75} /> Passwords match
                  </span>
                ) : (
                  <span className="text-[#D9534F] flex items-center gap-1">
                    <AlertCircle size={14} strokeWidth={1.75} /> Passwords do not match
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="pt-2">
            <PillButton
              variant="primary"
              fullWidth
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Update Password & Enter
            </PillButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordView;

