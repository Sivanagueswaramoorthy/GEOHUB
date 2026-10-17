import React, { useState, useRef, useEffect } from 'react';
import { User, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Sparkles } from 'lucide-react';
import { PasswordField } from './PasswordField';
import { createLoginSchema, LoginFormData } from './auth.schema';
import { AuthErrorState } from './useLogin';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<boolean>;
  isLoading: boolean;
  isSuccess: boolean;
  errorState: AuthErrorState;
  rateLimitSeconds: number;
  onForgotPasswordClick: () => void;
  onRequestJoinClick?: () => void;
  onClearError?: () => void;
  initialRollNo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  isSuccess,
  errorState,
  rateLimitSeconds,
  onForgotPasswordClick,
  onClearError,
  initialRollNo = '',
}) => {
  const [rollNo, setRollNo] = useState(initialRollNo);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Field-level error messages
  const [rollNoError, setRollNoError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Shake trigger on error
  const [shouldShake, setShouldShake] = useState(false);

  const rollNoRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const loginSchema = createLoginSchema();

  // Trigger shake animation when a server error occurs
  useEffect(() => {
    if (errorState.message) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 350);
      return () => clearTimeout(timer);
    }
  }, [errorState.message]);

  const handleRollNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRollNo(val);
    if (rollNoError) setRollNoError(null);
    onClearError?.();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(null);
    onClearError?.();
  };

  // Field validation on blur
  const handleRollNoBlur = () => {
    if (!rollNo.trim()) {
      setRollNoError('Roll Number is required');
    } else {
      setRollNoError(null);
    }
  };

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError('Password is required');
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess || rateLimitSeconds > 0) return;

    let hasError = false;
    if (!rollNo.trim()) {
      setRollNoError('Roll Number is required');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) {
      if (!rollNo.trim()) {
        rollNoRef.current?.focus();
      } else {
        passwordRef.current?.focus();
      }
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 350);
      return;
    }

    setRollNoError(null);
    setPasswordError(null);

    await onSubmit({
      rollNo: rollNo.trim(),
      email: rollNo.trim(),
      password,
      rememberMe,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`login-form ${shouldShake ? 'shake-animation' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}
    >
      {/* Quick Roll No Fill Chips */}
      <div className="login-quick-roles" style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
          Roll Nos:
        </span>
        {[
          { roll: 'FAC01', label: 'Faculty', pass: 'admin123' },
          { roll: '21GEO001', label: 'President', pass: 'admin123' },
          { roll: '22GEO019', label: 'Treasurer', pass: 'admin123' },
          { roll: '22GEO014', label: 'Promotion', pass: 'admin123' },
          { roll: '23GEO088', label: 'Member', pass: 'admin123' },
          { roll: '23GEO042', label: 'Volunteer', pass: 'admin123' },
        ].map((item) => (
          <button
            key={item.roll}
            type="button"
            disabled={isLoading || isSuccess}
            onClick={() => {
              setRollNo(item.roll);
              setPassword(item.pass);
              setRollNoError(null);
              setPasswordError(null);
              onClearError?.();
            }}
            style={{
              flexShrink: 0,
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            <strong style={{ fontWeight: 800 }}>{item.roll}</strong>
            <span style={{ opacity: 0.8, fontSize: '10px' }}>({item.label})</span>
          </button>
        ))}
      </div>

      {/* Register Number (Reg No) Input */}
      <div className="login-field-group">
        <label htmlFor="login-roll-no" className="login-label">
          <span>Register Number (Reg No)</span>
        </label>
        <div className="login-input-wrapper">
          <span className="login-input-icon" aria-hidden="true">
            <User size={18} strokeWidth={2} />
          </span>
          <input
            ref={rollNoRef}
            id="login-roll-no"
            type="text"
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
            value={rollNo}
            onChange={handleRollNoChange}
            onBlur={handleRollNoBlur}
            disabled={isLoading || isSuccess}
            placeholder="Enter your Reg No (e.g. 21GEO001)"
            aria-label="Register Number / Roll Number"
            className={`login-input ${rollNoError ? 'has-error' : ''}`}
            aria-invalid={Boolean(rollNoError)}
            aria-describedby={rollNoError ? 'login-roll-no-error' : undefined}
          />
        </div>

        {rollNoError && (
          <div id="login-roll-no-error" className="field-error-text" role="alert">
            <AlertCircle size={14} className="shrink-0" />
            <span>{rollNoError}</span>
          </div>
        )}
      </div>

      {/* Password Input */}
      <PasswordField
        ref={passwordRef}
        id="login-password"
        value={password}
        onChange={handlePasswordChange}
        onBlur={handlePasswordBlur}
        error={passwordError || undefined}
        disabled={isLoading || isSuccess}
        placeholder="Enter your password"
      />

      {/* Options Row: Keep me signed in & Forgot password link */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading || isSuccess}
            style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
          />
          <span>Remember my Reg No</span>
        </label>

        <button
          type="button"
          onClick={onForgotPasswordClick}
          disabled={isLoading || isSuccess}
          style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: 700, color: '#047857', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Forgot password?
        </button>
      </div>

      {/* Error Banner (Visible when sign-in fails) */}
      {errorState.message && (
        <div
          className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-fade-in"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorState.message}</p>
            {errorState.retryable && (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1 text-xs font-bold underline mt-1 text-red-800"
              >
                <RefreshCw size={14} /> Retry connection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || isSuccess || rateLimitSeconds > 0}
        aria-busy={isLoading}
        className="btn-login-submit"
        style={{ marginTop: '4px', width: '100%' }}
      >
        {rateLimitSeconds > 0 ? (
          <span>Locked ({rateLimitSeconds}s)</span>
        ) : isLoading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span>Signing in...</span>
          </span>
        ) : isSuccess ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>Authenticated!</span>
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>Sign in with Reg No</span>
            <ArrowRight size={16} />
          </span>
        )}
      </button>
    </form>
  );
};
