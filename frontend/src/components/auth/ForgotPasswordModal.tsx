import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import { BottomSheet } from '../BottomSheet';

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Reset College Password"
      subtitle="Institutional Identity Verification"
    >
      {isSubmitted ? (
        <div style={{ textAlign: 'center', padding: '16px 8px 8px 8px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#E7F9F1',
              border: '2px solid #A7F3D0',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <CheckCircle2 size={48} strokeWidth={1.75} />
          </div>

          <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Recovery Link Dispatched
          </h4>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            We have transmitted an authorized password reset token to <strong style={{ color: '#0F172A' }}>{email}</strong>. Please inspect your college inbox.
          </p>

          <button
            type="button"
            onClick={handleClose}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '999px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Return to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '4px 0' }}>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '14px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #EEF1F5',
              fontSize: '12px',
              color: '#475569',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <KeyRound size={20} color="#0F766E" className="shrink-0" />
            <span>Enter your registered university domain address (e.g. <code>@college.edu</code>).</span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              College Workspace Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.jenkins@college.edu"
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '999px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            }}
          >
            <span>{isLoading ? 'Dispatching...' : 'Dispatch Reset Link'}</span>
            <ArrowRight size={16} strokeWidth={1.75} />
          </button>
        </form>
      )}
    </BottomSheet>
  );
};
