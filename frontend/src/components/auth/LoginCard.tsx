import React, { useState, useRef, useEffect } from 'react';
import { User, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
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
  { role: 'Super Admin', rollNo: 'SA01', password: 'GeoHub2026!', description: 'System Administrator · Master Operations' },
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
        {/* SuperAdmin quick preset row */}
        <div className="pb-3 border-b border-[#DAF1DE]/70 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#8EB69B] uppercase tracking-wider shrink-0 bg-white">
              SUPERADMIN CREDENTIALS:
            </span>
            <span className="text-[11px] font-semibold text-[#163832]/70">
              Master Access
            </span>
          </div>

          <div className="flex items-center gap-2 py-0.5">
            {ALL_DEMO_CREDENTIALS.map((item) => (
              <button
                key={item.rollNo}
                type="button"
                onClick={() => handleQuickDemoFill(item.rollNo, item.password)}
                className="px-3.5 py-1.5 rounded-full bg-[#DAF1DE]/80 hover:bg-[#DAF1DE] active:scale-95 text-[#051F20] text-xs font-semibold border border-[#8EB69B]/40 shrink-0 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-2xs"
                title={`Click to fill: Roll No: ${item.rollNo}, Password: ${item.password}`}
              >
                <ShieldCheck size={14} className="text-[#163832]" />
                <strong>{item.rollNo}</strong> ({item.role})
                <span className="text-[12px] text-[#235347] font-mono bg-white/90 px-2 py-0.5 rounded-md border border-[#8EB69B]/30 font-medium">
                  {item.password}
                </span>
              </button>
            ))}
          </div>

          {/* Subtle accent bar */}
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
    </>
  );
};

export default LoginCard;
