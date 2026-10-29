import React, { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { forgotPasswordSchema } from './auth.schema';
import { BottomSheet } from '../../components/shared/BottomSheet';
import { PillButton } from '../../components/shared/PillButton';

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

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setError(null);
      setIsSent(false);
      setCooldown(0);
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

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
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Password"
      subtitle="Enter your institutional email for recovery instructions"
    >
      {isSent ? (
        <div className="flex flex-col items-center text-center py-4 select-none">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              backgroundColor: '#DAF1DE',
              border: '1px solid #8EB69B',
              color: '#163832',
            }}
          >
            <CheckCircle2 size={32} strokeWidth={2} />
          </div>

          <h3 className="text-base font-bold text-[#051F20] mb-1">Check your inbox</h3>
          <p className="text-xs font-medium text-[#235347] mb-6 max-w-sm">
            If <strong>{email}</strong> is registered, a password reset link is on its way.
          </p>

          <div className="w-full flex flex-col gap-3">
            <PillButton
              variant="primary"
              fullWidth
              onClick={onClose}
            >
              Return to Sign In
            </PillButton>

            <button
              type="button"
              disabled={cooldown > 0 || isSubmitting}
              onClick={handleResend}
              className="text-xs font-semibold text-[#235347] hover:text-[#051F20] py-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cooldown > 0 ? (
                `Resend link in ${cooldown}s`
              ) : (
                <span className="inline-flex items-center gap-2 justify-center">
                  <RefreshCw size={14} strokeWidth={2} className={isSubmitting ? 'animate-spin' : ''} />
                  <span>Resend reset email</span>
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 py-2 select-none">
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="forgot-email" className="text-xs font-bold text-[#051F20] pl-1">
              Institutional Email
            </label>
            <div
              className={`relative flex items-center bg-white border ${
                error ? 'border-[#D9534F] ring-1 ring-[#D9534F]/30' : 'border-[#DAF1DE] focus-within:border-[#8EB69B]'
              } shadow-[0_2px_8px_rgba(5,31,32,0.04)] px-3.5 transition-all`}
              style={{
                borderRadius: '16px',
                height: '48px',
              }}
            >
              <Mail size={18} strokeWidth={2} className="text-[#235347] shrink-0 mr-2.5" />
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
                aria-label="Institutional Email"
                className="w-full bg-transparent text-sm text-[#051F20] placeholder-[#8EB69B] outline-none font-medium"
              />
            </div>
            {error && (
              <div id="forgot-email-error" className="flex items-center gap-1.5 text-xs font-semibold text-[#D9534F] pl-1" role="alert">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="mt-2">
            <PillButton
              type="submit"
              disabled={isSubmitting || !email.trim()}
              variant="primary"
              fullWidth
              loading={isSubmitting}
              icon={<ArrowRight size={18} strokeWidth={2} />}
              iconPosition="right"
            >
              <span>Send reset link</span>
            </PillButton>
          </div>
        </form>
      )}
    </BottomSheet>
  );
};

export default ForgotPasswordSheet;
