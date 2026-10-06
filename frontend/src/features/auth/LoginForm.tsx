import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
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
  onRequestJoinClick: () => void;
  onClearError?: () => void;
  initialEmail?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  isSuccess,
  errorState,
  rateLimitSeconds,
  onForgotPasswordClick,
  onRequestJoinClick,
  onClearError,
  initialEmail = '',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Field-level error messages
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [domainHint, setDomainHint] = useState<string | null>(null);

  // Shake trigger on error
  const [shouldShake, setShouldShake] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const allowedDomain = import.meta.env?.VITE_ALLOWED_EMAIL_DOMAIN || '';
  const loginSchema = createLoginSchema(allowedDomain);

  // Trigger shake animation when a server error occurs
  useEffect(() => {
    if (errorState.message) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 350);
      return () => clearTimeout(timer);
    }
  }, [errorState.message]);

  // Check institutional domain hint on email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) setEmailError(null);
    onClearError?.();

    if (allowedDomain && val.includes('@')) {
      const parts = val.split('@');
      if (parts[1] && !parts[1].toLowerCase().includes(allowedDomain.toLowerCase())) {
        setDomainHint(`Institutional accounts typically end with @${allowedDomain}`);
      } else {
        setDomainHint(null);
      }
    } else {
      setDomainHint(null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(null);
    onClearError?.();
  };

  // Field validation on blur
  const handleEmailBlur = () => {
    const result = loginSchema.shape.email.safeParse(email.trim());
    if (!result.success) {
      setEmailError(result.error.issues[0]?.message || 'Enter a valid institutional email');
    } else {
      setEmailError(null);
    }
  };

  const handlePasswordBlur = () => {
    const result = loginSchema.shape.password.safeParse(password);
    if (!result.success) {
      setPasswordError(result.error.issues[0]?.message || 'Password must be at least 8 characters');
    } else {
      setPasswordError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess || rateLimitSeconds > 0) return;

    // Full schema validation
    const validationResult = loginSchema.safeParse({
      email: email.trim(),
      password,
      rememberMe,
    });

    if (!validationResult.success) {
      let firstInvalid: 'email' | 'password' | null = null;
      let emailErr: string | null = null;
      let passErr: string | null = null;

      for (const issue of validationResult.error.issues) {
        if (issue.path[0] === 'email' && !emailErr) {
          emailErr = issue.message;
          if (!firstInvalid) firstInvalid = 'email';
        }
        if (issue.path[0] === 'password' && !passErr) {
          passErr = issue.message;
          if (!firstInvalid) firstInvalid = 'password';
        }
      }

      setEmailError(emailErr);
      setPasswordError(passErr);
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 350);

      // Shift focus to the first invalid field
      if (firstInvalid === 'email') {
        emailRef.current?.focus();
      } else if (firstInvalid === 'password') {
        passwordRef.current?.focus();
      }
      return;
    }

    setEmailError(null);
    setPasswordError(null);

    await onSubmit({
      email: email.trim(),
      password,
      rememberMe,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`login-form ${shouldShake ? 'shake-animation' : ''}`}
    >
      {/* Quick Role Fill Chips */}
      <div className="login-quick-roles fade-up-item stagger-1 mb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
            Quick roles:
          </span>
          {[
            { label: 'superadmin', user: 'superadmin', pass: 'admin123', tag: 'Faculty' },
            { label: 'admin', user: 'admin', pass: 'admin123', tag: 'President' },
            { label: 'doc', user: 'doc', pass: 'admin123', tag: 'Documentation' },
            { label: 'tres', user: 'tres', pass: 'admin123', tag: 'Treasurer' },
            { label: 'promo', user: 'promo', pass: 'admin123', tag: 'Promotion' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={isLoading || isSuccess}
              onClick={() => {
                setEmail(item.user);
                setPassword(item.pass);
                setEmailError(null);
                setPasswordError(null);
                onClearError?.();
              }}
              className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <span className="font-extrabold">{item.label}</span>
              <span className="text-[10px] text-emerald-600/80">({item.tag})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Email / Username Input */}
      <div className="login-field-group fade-up-item stagger-1">
        <label htmlFor="login-email" className="login-label">
          Institutional Email or Role Username
        </label>
        <div className="login-input-wrapper">
          <span className="login-input-icon" aria-hidden="true">
            <Mail size={18} />
          </span>
          <input
            ref={emailRef}
            id="login-email"
            type="text"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            disabled={isLoading || isSuccess}
            placeholder="superadmin, admin, doc, tres, promo or name@college.edu"
            className={`login-input ${emailError ? 'has-error' : ''}`}
            aria-invalid={Boolean(emailError)}
            aria-describedby={[
              emailError ? 'login-email-error' : null,
              domainHint ? 'login-email-hint' : null,
            ].filter(Boolean).join(' ') || undefined}
          />
        </div>

        {emailError && (
          <div id="login-email-error" className="field-error-text" role="alert">
            <AlertCircle size={14} className="shrink-0" />
            <span>{emailError}</span>
          </div>
        )}

        {domainHint && !emailError && (
          <div id="login-email-hint" className="field-hint-text">
            {domainHint}
          </div>
        )}
      </div>

      {/* Password Input */}
      <div className="fade-up-item stagger-2">
        <PasswordField
          ref={passwordRef}
          id="login-password"
          value={password}
          onChange={handlePasswordChange}
          onBlur={handlePasswordBlur}
          error={passwordError || undefined}
          disabled={isLoading || isSuccess}
          placeholder="••••••••••••"
        />
      </div>

      {/* Options Row: Keep me signed in & Forgot password link */}
      <div className="login-options-row fade-up-item stagger-3">
        <label className="remember-me-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading || isSuccess}
            className="remember-me-input"
          />
          <span className="custom-checkbox" aria-hidden="true">
            {rememberMe && <CheckCircle2 size={13} strokeWidth={3} />}
          </span>
          <span>Keep me signed in</span>
        </label>

        <button
          type="button"
          onClick={onForgotPasswordClick}
          disabled={isLoading || isSuccess}
          className="forgot-password-link"
        >
          Forgot password?
        </button>
      </div>

      {/* Error Banner (Visible when sign-in fails) */}
      {errorState.message && (
        <div
          className="login-error-banner"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p>{errorState.message}</p>
            {errorState.requestId && (
              <p className="text-[11px] text-red-500 mt-1 font-mono">
                Ref ID: {errorState.requestId}
              </p>
            )}
            {errorState.retryable && (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1 text-xs font-bold underline mt-1 text-red-700 hover:text-red-900"
              >
                <RefreshCw size={11} /> Retry connection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary Submit Button */}
      <div className="fade-up-item stagger-4" style={{ width: '100%' }}>
        <button
          type="submit"
          disabled={isLoading || isSuccess || rateLimitSeconds > 0}
          className={`login-submit-btn ${isSuccess ? 'is-success' : ''}`}
          aria-busy={isLoading}
        >
          {isSuccess ? (
            <>
              <CheckCircle2 size={20} className="animate-scale-in" />
              <span>Verified & Redirecting</span>
            </>
          ) : isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing in...</span>
            </>
          ) : rateLimitSeconds > 0 ? (
            <span>Locked ({rateLimitSeconds}s)</span>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="login-divider fade-up-item stagger-4">
        <div className="login-divider-line" />
        <span className="login-divider-text">or</span>
        <div className="login-divider-line" />
      </div>

      {/* Secondary Action: Request to join */}
      <div className="fade-up-item stagger-5" style={{ width: '100%' }}>
        <button
          type="button"
          onClick={onRequestJoinClick}
          disabled={isLoading || isSuccess}
          className="login-join-btn"
        >
          Request to join the club
        </button>
      </div>
    </form>
  );
};
