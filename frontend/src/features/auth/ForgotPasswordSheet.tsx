import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { forgotPasswordSchema } from './auth.schema';

interface ForgotPasswordSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export const ForgotPasswordSheet: React.FC<ForgotPasswordSheetProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setError(null);
      setIsSent(false);
      setCooldown(0);
      // Autofocus email input after animation starts
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialEmail]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle ESC key to close & trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please enter a valid institutional email');
      emailInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      // In production calls POST /auth/forgot-password, in mock delays 600ms
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsSent(true);
      setCooldown(60);
    } catch {
      setError('Unable to send password reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCooldown(60);
    } catch {
      setError('Failed to resend. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div className="sheet-panel" ref={panelRef}>
        <div className="sheet-drag-handle" aria-hidden="true" />

        <div className="sheet-header">
          <div>
            <h2 id="forgot-password-title" className="sheet-title">
              Reset Password
            </h2>
            <p className="sheet-subtitle">
              Enter your registered institutional email to receive recovery instructions.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="sheet-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {isSent ? (
          <div className="flex flex-col items-center text-center py-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                backgroundColor: 'var(--mint-tint, #E7F9F1)',
                border: '1px solid var(--mint-border, #A7F3D0)',
                color: 'var(--brand-green, #10B981)',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">Check your inbox</h3>
            <p className="text-sm text-slate-600 mb-6 max-w-sm">
              If <strong>{email}</strong> is registered, a password reset link is on its way.
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                type="button"
                className="login-submit-btn"
                onClick={onClose}
              >
                Return to Sign In
              </button>

              <button
                type="button"
                disabled={cooldown > 0 || isSubmitting}
                onClick={handleResend}
                className="text-xs font-semibold text-slate-500 hover:text-emerald-700 py-2 transition-colors disabled:opacity-50"
              >
                {cooldown > 0 ? (
                  `Resend link in ${cooldown}s`
                ) : (
                  <span className="inline-flex items-center gap-1.5 justify-center">
                    <RefreshCw size={12} className={isSubmitting ? 'animate-spin' : ''} />
                    Resend reset email
                  </span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="login-form">
            <div className="login-field-group">
              <label htmlFor="forgot-email" className="login-label">
                Institutional Email
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <input
                  ref={emailInputRef}
                  id="forgot-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isSubmitting}
                  placeholder="name@college.edu"
                  className={`login-input ${error ? 'has-error' : ''}`}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'forgot-email-error' : undefined}
                />
              </div>
              {error && (
                <div id="forgot-email-error" className="field-error-text" role="alert">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="login-submit-btn"
              style={{ marginTop: '8px' }}
            >
              {isSubmitting ? (
                <span>Sending link...</span>
              ) : (
                <>
                  <span>Send reset link</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
