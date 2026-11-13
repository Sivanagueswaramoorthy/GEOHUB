import React, { useState, useRef, useEffect } from 'react';
import { User, ArrowRight, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { PasswordField } from './PasswordField';
import { BottomSheet } from '../shared/BottomSheet';
import { PillButton } from '../shared/PillButton';

export interface DemoRoleCredential {
  role: string;
  rollNo: string;
  password: string;
  description: string;
}

export const ALL_DEMO_CREDENTIALS: DemoRoleCredential[] = [
  { role: 'Faculty', rollNo: 'FAC01', password: 'admin123', description: 'Faculty Advisor · Full Oversight' },
  { role: 'President', rollNo: '21GEO001', password: 'admin123', description: 'Club President / Coordinator' },
  { role: 'Management', rollNo: '21GEO010', password: 'admin123', description: 'Management Lead · Logistics' },
  { role: 'Treasurer', rollNo: '22GEO019', password: 'admin123', description: 'Treasury & Expense Ledger' },
  { role: 'Promotion', rollNo: '22GEO014', password: 'admin123', description: 'Social, Media & Campaigns' },
  { role: 'Documentation', rollNo: '22GEO018', password: 'admin123', description: 'Meetings, Minutes & MOM' },
  { role: 'Volunteer', rollNo: '23GEO042', password: 'admin123', description: 'Gate Check-In & Attendance' },
  { role: 'Member', rollNo: '23GEO088', password: 'admin123', description: 'Student Scholar & Pass' },
];

export interface LoginCardProps {
  onSubmit: (credentials: { rollNo: string; password?: string; rememberMe?: boolean }) => Promise<boolean>;
  isLoading: boolean;
  isSuccess: boolean;
  errorState?: { code: string | null; message: string | null; retryable?: boolean };
  rateLimitSeconds?: number;
  onForgotPasswordClick?: () => void;
  className?: string;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onSubmit,
  isLoading,
  isSuccess,
  errorState,
  rateLimitSeconds: propRateLimitSeconds = 0,
  onForgotPasswordClick,
  className = '',
}) => {
  // Load saved roll number if "Remember my Reg No" was used
  const [rollNo, setRollNo] = useState(() => {
    try {
      return localStorage.getItem('geohub_saved_roll_no') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Field focus states
  const [isRollNoFocused, setIsRollNoFocused] = useState(false);

  // Field & form error states
  const [rollNoError, setRollNoError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Failed attempts tracking & 60s lockout
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(propRateLimitSeconds);

  // Card shake animation
  const [isShaking, setIsShaking] = useState(false);

  // Forgot password BottomSheet
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  // All Roles Credentials Sheet
  const [isCredentialsSheetOpen, setIsCredentialsSheetOpen] = useState(false);

  const rollNoInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Sync propRateLimitSeconds
  useEffect(() => {
    if (propRateLimitSeconds > 0) {
      setLockoutSeconds(propRateLimitSeconds);
    }
  }, [propRateLimitSeconds]);

  // Sync external errorState
  useEffect(() => {
    if (errorState?.message) {
      setAuthError(errorState.message);
      triggerShake();
    }
  }, [errorState]);

  // Countdown timer when locked out
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = window.setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleRollNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Alphanumeric only, uppercase transformation
    const rawVal = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const trimmedVal = rawVal.slice(0, 20);
    setRollNo(trimmedVal);
    if (rollNoError) setRollNoError(null);
    if (authError) setAuthError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(null);
    if (authError) setAuthError(null);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 360);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess || lockoutSeconds > 0) return;

    let hasClientError = false;

    if (!rollNo.trim()) {
      setRollNoError('Enter your roll number');
      hasClientError = true;
    } else if (rollNo.trim().length < 4) {
      setRollNoError('Enter your roll number');
      hasClientError = true;
    }

    if (!password) {
      setPasswordError('Enter your password');
      hasClientError = true;
    }

    if (hasClientError) {
      triggerShake();
      if (!rollNo.trim()) {
        rollNoInputRef.current?.focus();
      } else {
        passwordInputRef.current?.focus();
      }
      return;
    }

    setRollNoError(null);
    setPasswordError(null);
    setAuthError(null);

    // Save or clear remember me preference
    try {
      if (rememberMe) {
        localStorage.setItem('geohub_saved_roll_no', rollNo.trim());
      } else {
        localStorage.removeItem('geohub_saved_roll_no');
      }
    } catch {
      // Storage unavailable
    }

    try {
      const success = await onSubmit({
        rollNo: rollNo.trim(),
        password,
        rememberMe,
      });

      if (!success) {
        const nextFailures = failedAttempts + 1;
        setFailedAttempts(nextFailures);

        if (nextFailures >= 5) {
          setLockoutSeconds(60);
          setAuthError('Too many attempts. Try again in 60s.');
        } else {
          setAuthError('Roll number or password is incorrect. Try again.');
        }
        triggerShake();
      } else {
        setFailedAttempts(0);
      }
    } catch {
      setAuthError('Roll number or password is incorrect. Try again.');
      triggerShake();
    }
  };

  // Quick fill helper for dev/demo roles
  const handleQuickDemoFill = (demoRoll: string, demoPass: string) => {
    setRollNo(demoRoll);
    setPassword(demoPass);
    setRollNoError(null);
    setPasswordError(null);
    setAuthError(null);
  };

  const isFormLocked = lockoutSeconds > 0;
  const isSubmitDisabled = isLoading || isSuccess || isFormLocked;

  return (
    <>
      <div
        className={`auth-panel ${
          isShaking ? 'card-shake-active' : ''
        } ${className}`}
      >
        {/* Roll numbers & passwords quick preset row */}
        <div className="pb-3 border-b border-[#DAF1DE]/70 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#8EB69B] uppercase tracking-wider shrink-0 bg-white">
              ROLL NOS & PASSWORDS:
            </span>
            <button
              type="button"
              onClick={() => setIsCredentialsSheetOpen(true)}
              className="text-xs font-bold text-[#163832] hover:text-[#235347] underline cursor-pointer shrink-0 flex items-center gap-1"
            >
              <KeyRound size={13} strokeWidth={2.4} />
              <span>All 8 Roles</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {ALL_DEMO_CREDENTIALS.map((item) => (
              <button
                key={item.rollNo}
                type="button"
                onClick={() => handleQuickDemoFill(item.rollNo, item.password)}
                className="px-3 py-1.5 rounded-full bg-[#DAF1DE]/75 hover:bg-[#DAF1DE] active:scale-95 text-[#051F20] text-xs font-semibold border border-[#8EB69B]/40 shrink-0 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs"
                title={`Click to fill: Roll No: ${item.rollNo}, Password: ${item.password}`}
              >
                <strong>{item.rollNo}</strong> ({item.role})
                <span className="text-[12px] text-[#235347] font-mono bg-white/80 px-1.5 py-0.5 rounded-md border border-[#8EB69B]/30 font-medium">
                  {item.password}
                </span>
              </button>
            ))}
          </div>

          {/* Subtle accent bar matching screenshot */}
          <div className="h-1 w-20 bg-[#163832]/25 rounded-full" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Field 1: Register Number (Reg No) */}
          <div className="auth-field-group">
            <label htmlFor="login-roll-no" className="auth-field-label">
              Register Number (Reg No)
            </label>

            <div
              className={`auth-input-box ${
                rollNoError || authError
                  ? 'has-error'
                  : isRollNoFocused
                  ? 'is-focused'
                  : ''
              }`}
            >
              <User size={19} className="text-[#8EB69B] shrink-0" strokeWidth={1.8} aria-hidden="true" />

              <input
                ref={rollNoInputRef}
                id="login-roll-no"
                name="username"
                type="text"
                inputMode="text"
                autoComplete="username"
                autoCapitalize="characters"
                spellCheck={false}
                value={rollNo}
                onChange={handleRollNoChange}
                onFocus={() => setIsRollNoFocused(true)}
                onBlur={() => setIsRollNoFocused(false)}
                disabled={isLoading || isSuccess || isFormLocked}
                placeholder="Enter your Reg No (e.g. 21GEO001)"
                aria-label="Roll number"
                aria-invalid={Boolean(rollNoError || authError)}
                aria-describedby={
                  rollNoError ? 'roll-no-error' : authError ? 'auth-generic-error' : undefined
                }
              />
            </div>

            {rollNoError && (
              <div
                id="roll-no-error"
                role="alert"
                aria-live="polite"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#D9534F] mt-0.5 pl-1"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{rollNoError}</span>
              </div>
            )}
          </div>

          {/* Field 2: Password */}
          <div>
            <PasswordField
              ref={passwordInputRef}
              id="login-password"
              value={password}
              onChange={handlePasswordChange}
              error={passwordError}
              disabled={isLoading || isSuccess || isFormLocked}
              placeholder="Enter your password"
              label="Password"
            />
          </div>

          {/* Options Row: Remember my Reg No & Forgot password link */}
          <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
            <label className="inline-flex items-center gap-2 text-[#051F20] font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading || isSuccess || isFormLocked}
                className="w-4 h-4 rounded border-[#DAF1DE] text-[#163832] accent-[#163832] cursor-pointer"
              />
              <span className="whitespace-nowrap">Remember my Reg No</span>
            </label>

            <button
              type="button"
              onClick={() => {
                if (onForgotPasswordClick) {
                  onForgotPasswordClick();
                } else {
                  setIsForgotOpen(true);
                }
              }}
              disabled={isLoading || isSuccess}
              className="text-xs font-bold text-[#163832] hover:text-[#051F20] underline cursor-pointer p-0.5 shrink-0 whitespace-nowrap text-right"
            >
              Forgot password?
            </button>
          </div>

          {/* Inline Error Banner */}
          {authError && (
            <div
              id="auth-generic-error"
              role="alert"
              aria-live="polite"
              className="p-3 rounded-2xl flex items-start gap-2 bg-[#D9534F]/10 border border-[#D9534F]/30 text-xs font-semibold text-[#D9534F] transition-opacity duration-200"
            >
              <AlertCircle size={16} className="shrink-0 text-[#D9534F] mt-0.5" />
              <span>
                {isFormLocked
                  ? `Too many attempts. Try again in ${lockoutSeconds}s.`
                  : authError}
              </span>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              aria-busy={isLoading}
              aria-label={isFormLocked ? `Locked (${lockoutSeconds}s)` : 'Sign in with Reg No'}
              className="btn-luxury-submit touch-target-44"
            >
              {isFormLocked ? (
                <span>{`Locked (${lockoutSeconds}s)`}</span>
              ) : isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="luxury-spinner-circle" />
                  <span>Signing in...</span>
                </span>
              ) : isSuccess ? (
                <span className="inline-flex items-center gap-2">
                  <span>Authenticated!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span>Sign in with Reg No</span>
                  <ArrowRight size={18} strokeWidth={2.2} />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password BottomSheet */}
      <BottomSheet
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        title="Reset Password"
      >
        <div className="flex flex-col items-center text-center p-4 gap-4 select-none">
          <div className="w-12 h-12 rounded-full bg-[#DAF1DE] border border-[#8EB69B] flex items-center justify-center text-[#163832]">
            <ShieldCheck size={24} />
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-bold text-[#051F20]">
              Chapter Security Notice
            </h3>
            <p className="text-xs text-[#235347] font-medium leading-relaxed max-w-xs">
              Ask your faculty advisor or club president to reset it.
            </p>
          </div>

          <PillButton
            variant="primary"
            onClick={() => setIsForgotOpen(false)}
            className="w-full mt-2"
          >
            Understood
          </PillButton>
        </div>
      </BottomSheet>

      {/* All Roles & Credentials Sheet */}
      <BottomSheet
        isOpen={isCredentialsSheetOpen}
        onClose={() => setIsCredentialsSheetOpen(false)}
        title="All Roles & Passwords"
      >
        <div className="flex flex-col gap-3 p-4 select-none max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-[#235347] font-medium leading-relaxed">
            Select any role below to auto-fill its Roll Number and Password into the login form.
          </p>

          <div className="flex flex-col gap-2">
            {ALL_DEMO_CREDENTIALS.map((cred) => (
              <div
                key={cred.rollNo}
                className="p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.03)] flex items-center justify-between gap-3 hover:border-[#8EB69B] transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#051F20]">{cred.role}</span>
                    <span className="text-[12px] font-mono font-bold bg-[#DAF1DE] text-[#051F20] px-2 py-0.5 rounded-full border border-[#8EB69B]/30">
                      {cred.rollNo}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#235347] mt-0.5 truncate">
                    {cred.description}
                  </div>
                  <div className="text-[12px] text-[#163832] font-mono mt-1 font-semibold flex items-center gap-1.5">
                    <span>Password:</span>
                    <span className="bg-[#F6FBF7] border border-[#DAF1DE] px-2 py-0.5 rounded-md text-[#051F20]">
                      {cred.password}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleQuickDemoFill(cred.rollNo, cred.password);
                    setIsCredentialsSheetOpen(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#163832] hover:bg-[#0B2B26] text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  Use Role
                </button>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>
    </>
  );
};

export default LoginCard;
