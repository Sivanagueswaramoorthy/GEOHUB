import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckSquare,
  Sparkles,
  Leaf,
  X,
} from 'lucide-react';
import { orgConfig } from '../../config/org';
import { LoginForm } from './LoginForm';
import { ForgotPasswordSheet } from './ForgotPasswordSheet';
import { useLogin } from './useLogin';
import './login.css';

export const LoginPage: React.FC = () => {
  const {
    authenticate,
    isLoading,
    isSuccess,
    errorState,
    rateLimitSeconds,
    isSessionExpired,
    clearError,
  } = useLogin();

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Set document title
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `Sign in | ${orgConfig.orgName}`;
    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <main className="mascot-login-screen">
      {/* 4 Floating Rounded Square Icon Cards in the upper corners */}
      <div className="floating-corner-card top-left-high" aria-hidden="true">
        <Leaf size={19} color="#235347" strokeWidth={2.2} />
      </div>

      <div className="floating-corner-card top-left-low" aria-hidden="true">
        <Calendar size={18} color="#235347" strokeWidth={2.2} />
      </div>

      <div className="floating-corner-card top-right-high" aria-hidden="true">
        <CheckSquare size={19} color="#235347" strokeWidth={2.2} />
      </div>

      <div className="floating-corner-card top-right-low" aria-hidden="true">
        <Sparkles size={18} color="#235347" strokeWidth={2.2} />
      </div>

      {/* Main Column */}
      <div className="mascot-column">
        {/* Center Mascot Image floating directly on page */}
        <div className="mascot-hero-wrap">
          <div className="mascot-glow-disc" />
          <img
            src="/eco-mascot.png"
            alt="Eco Mascot"
            className="mascot-illustration"
          />
        </div>

        {/* Organization Brand Pill Badge */}
        <div className="mascot-pill-badge">
          <img
            src="/geo-hub-logo.png"
            alt="Logo"
          />
          <span>Green Eco Organization</span>
        </div>

        {/* Session Expired Banner if present */}
        {isSessionExpired && (
          <div
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '16px',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              color: '#92400E',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '12px',
              textAlign: 'left',
            }}
          >
            Your previous session expired. Please sign in with your Register Number to continue.
          </div>
        )}

        {/* Direct Register Number & Password Form Card */}
        <div className="mascot-form-card">
          <LoginForm
            onSubmit={authenticate}
            isLoading={isLoading}
            isSuccess={isSuccess}
            errorState={errorState}
            rateLimitSeconds={rateLimitSeconds}
            onForgotPasswordClick={() => setIsForgotOpen(true)}
            onClearError={clearError}
          />
        </div>

        {/* Legal & Governance Notice */}
        <p className="mascot-legal-notice">
          By continuing, you agree to our{' '}
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="mascot-legal-btn"
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="mascot-legal-btn"
          >
            Privacy Policy
          </button>
        </p>
      </div>

      {/* Forgot Password Bottom Sheet */}
      <ForgotPasswordSheet
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />

      {/* Privacy Policy Dialog */}
      {isPrivacyOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsPrivacyOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-extrabold text-sm text-slate-900">Institutional Governance & Privacy</span>
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              GeoHub is governed by the College Department of Geography & Geoinformatics.
              Your college Register Number / Roll Number is strictly utilized for verifying membership, recording event gate attendance via dynamic QR, and approving team task submissions.
            </p>
          </div>
        </div>
      )}
    </main>
  );
};
