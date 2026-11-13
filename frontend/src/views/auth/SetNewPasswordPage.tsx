import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MascotLogo } from '../../components/shared/MascotLogo';
import { PasswordField } from '../../components/auth/PasswordField';
import { PillButton } from '../../components/shared/PillButton';
import useLoginMood from '../../features/auth/useLoginMood';

export interface SetNewPasswordPageProps {
  onSuccess?: () => void;
}

export const SetNewPasswordPage: React.FC<SetNewPasswordPageProps> = ({ onSuccess }) => {
  const { currentUser, setCurrentUser, showToast, setActiveTab } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    mood,
    isNodding,
    setFocusedField,
    setIsPasswordVisible,
    triggerTypingNod,
    triggerErrorReaction,
  } = useLoginMood({ isLoading: isSubmitting });

  const rollNo = currentUser?.rollNo || currentUser?.email || '';

  // Password strength calculation
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
    if (hasLetters && hasNumbers) {
      return { label: 'Fair', score: 2, color: '#F2B84B' };
    }
    return { label: 'Weak', score: 1, color: '#D9534F' };
  };

  const strength = getStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation rules
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      triggerErrorReaction();
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      setError('Password must contain both letters and numbers');
      triggerErrorReaction();
      return;
    }

    if (rollNo && newPassword.toLowerCase() === rollNo.toLowerCase()) {
      setError('Password cannot be the same as your roll number');
      triggerErrorReaction();
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      triggerErrorReaction();
      return;
    }

    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          mustChangePassword: false,
        });
      }
      showToast('Password updated successfully. Welcome to your chapter!', 'success');
      onSuccess?.();
      setActiveTab('home');
    }, 600);
  };

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 select-none"
      style={{
        background: 'linear-gradient(180deg, #F6FBF7 0%, #DAF1DE 100%)',
      }}
    >
      <div className="w-full max-w-[420px] flex flex-col items-center">
        {/* Animated Mascot */}
        <div className="mb-4">
          <MascotLogo
            size="xl"
            mood={mood}
            isNodding={isNodding}
            animated={true}
          />
        </div>

        {/* Card */}
        <div className="frosted-login-card w-full rounded-[32px] p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-[#051F20] tracking-tight">
              Set a new password
            </h1>
            <p className="text-xs font-semibold text-[#235347]">
              First login mandate for {rollNo}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <PasswordField
              id="new-password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                triggerTypingNod();
                if (error) setError(null);
              }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onVisibilityChange={setIsPasswordVisible}
              label="New password"
              placeholder="At least 8 characters..."
            />

            {/* Strength Meter */}
            {newPassword.length > 0 && (
              <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#235347]">Strength:</span>
                  <span className="font-bold" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#DAF1DE] overflow-hidden flex">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(strength.score / 3) * 100}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <PasswordField
              id="confirm-password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                triggerTypingNod();
                if (error) setError(null);
              }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onVisibilityChange={setIsPasswordVisible}
              label="Confirm password"
              placeholder="Re-enter your new password..."
            />

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3 rounded-2xl flex items-start gap-2 bg-[#D9534F]/10 border border-[#D9534F]/30 text-xs font-semibold text-[#D9534F]"
              >
                <AlertCircle size={16} className="shrink-0 text-[#D9534F] mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <PillButton
                type="submit"
                variant="primary"
                disabled={isSubmitting || !newPassword || !confirmPassword}
                className="w-full h-[52px]"
              >
                {isSubmitting ? 'Updating password...' : 'Save new password'}
              </PillButton>
            </div>
          </form>

          {/* Footnote */}
          <div className="pt-2 border-t border-[#DAF1DE] flex items-center justify-center gap-1.5 text-xs font-medium text-[#235347]">
            <ShieldCheck size={14} className="text-[#163832] shrink-0" />
            <span>Must be $\ge 8$ chars, contain a letter & number</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SetNewPasswordPage;

