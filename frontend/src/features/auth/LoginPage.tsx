import React, { useState, useEffect } from 'react';
import { Shield, Info, HelpCircle, FileCheck, CheckCircle2, X } from 'lucide-react';
import { orgConfig } from '../../config/org';
import { AuthBrandPanel } from './AuthBrandPanel';
import { LoginForm } from './LoginForm';
import { ForgotPasswordSheet } from './ForgotPasswordSheet';
import { DemoRolesSheet, DemoPersona } from './DemoRolesSheet';
import { useLogin } from './useLogin';
import './login.css';

export const LoginPage: React.FC = () => {
  const {
    authenticate,
    loginDemoPersona,
    isLoading,
    isSuccess,
    errorState,
    rateLimitSeconds,
    isSessionExpired,
    clearError,
  } = useLogin();

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isDemoSheetOpen, setIsDemoSheetOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Join form state
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinSquad, setJoinSquad] = useState('Promotion');
  const [joinSubmitted, setJoinSubmitted] = useState(false);

  // Set document title and theme-color meta tag
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `Sign in | ${orgConfig.orgName}`;

    let metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    let created = false;
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
      created = true;
    }
    const originalTheme = metaTheme.content;
    metaTheme.content = '#FFFFFF';

    return () => {
      document.title = originalTitle;
      if (metaTheme) {
        if (created) {
          metaTheme.remove();
        } else {
          metaTheme.content = originalTheme;
        }
      }
    };
  }, []);

  // Demo mode check: VITE_DEMO === 'true' or url query param ?demo=true
  const isDemoEnabled =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO === 'true') ||
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true');

  const handleSelectDemoPersona = async (persona: DemoPersona) => {
    setIsDemoSheetOpen(false);
    await loginDemoPersona(persona.user);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim() || !joinEmail.trim()) return;
    setJoinSubmitted(true);
  };

  return (
    <main className="login-page-root">
      {/* Background Topographic Contour Accent (Mobile Top-Right) */}
      <svg
        className="login-bg-topography"
        viewBox="0 0 420 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M100 -20 C 180 80, 240 120, 440 100"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M140 -40 C 220 70, 300 160, 450 170"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M190 -20 C 280 120, 340 220, 460 230"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M240 10 C 320 180, 380 270, 480 300"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle cx="380" cy="80" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="380" cy="80" r="60" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Soft Radial Mint Glow behind the logo */}
      <div className="login-bg-glow" aria-hidden="true" />

      {/* Main Responsive Container */}
      <div className="login-container">
        {/* Desktop Brand Column (~52%) */}
        <AuthBrandPanel />

        {/* Right Form Column */}
        <div className="auth-form-column">
          <div className="auth-form-card">
            {/* Top Centered Brand Block */}
            <div className="login-header-block fade-up-item stagger-1">
              {/* 72px Rounded Card Logo */}
              <div className="login-logo-card">
                <img
                  src={orgConfig.logoUrl}
                  alt={`${orgConfig.orgName} Logo`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>

              {/* Two-Tone Wordmark */}
              <div className="login-wordmark">
                <span className="wordmark-dark">{orgConfig.wordmarkPart1}</span>
                <span className="wordmark-brand">{orgConfig.wordmarkPart2}</span>
              </div>

              {/* Tagline */}
              <div className="login-tagline">{orgConfig.tagline}</div>

              {/* Heading Group */}
              <div className="login-heading-group">
                <h2 className="login-heading">Welcome back</h2>
                <p className="login-subtext">
                  Sign in with your institutional email to continue.
                </p>
              </div>
            </div>

            {/* Session Expired Alert Banner */}
            {isSessionExpired && (
              <div className="session-expired-banner fade-up-item stagger-1" role="status">
                <Info size={16} className="shrink-0" />
                <span>Your session expired. Please sign in again.</span>
              </div>
            )}

            {/* Interactive Login Form */}
            <LoginForm
              onSubmit={authenticate}
              isLoading={isLoading}
              isSuccess={isSuccess}
              errorState={errorState}
              rateLimitSeconds={rateLimitSeconds}
              onForgotPasswordClick={() => setIsForgotOpen(true)}
              onRequestJoinClick={() => setIsJoinOpen(true)}
              onClearError={clearError}
            />

            {/* Footer Information */}
            <footer className="login-footer fade-up-item stagger-5">
              <div className="login-footer-caption">
                {orgConfig.department}
              </div>

              <div className="login-footer-links">
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  className="login-footer-link"
                >
                  Privacy
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="login-footer-link"
                >
                  Help
                </button>
                <span className="text-slate-300">•</span>
                <span className="login-version-tag">{orgConfig.version}</span>
              </div>

              {/* Demo Roles Action Trigger (Strictly when VITE_DEMO === 'true') */}
              {isDemoEnabled && (
                <button
                  type="button"
                  onClick={() => setIsDemoSheetOpen(true)}
                  className="demo-roles-trigger-btn"
                  id="demo-roles-trigger"
                >
                  <Shield size={16} strokeWidth={1.75} className="text-emerald-600" />
                  <span>Demo roles</span>
                </button>
              )}
            </footer>
          </div>
        </div>
      </div>

      {/* Forgot Password Bottom Sheet */}
      <ForgotPasswordSheet
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />

      {/* Demo Roles Persona Sheet */}
      {isDemoEnabled && (
        <DemoRolesSheet
          isOpen={isDemoSheetOpen}
          onClose={() => setIsDemoSheetOpen(false)}
          onSelectPersona={handleSelectDemoPersona}
          isAuthenticating={isLoading}
        />
      )}

      {/* Simple Help Dialog */}
      {isHelpOpen && (
        <div
          className="sheet-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsHelpOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="sheet-panel" style={{ maxWidth: '440px' }}>
            <div className="sheet-header">
              <div className="flex items-center gap-2">
                <HelpCircle size={20} className="text-emerald-600" />
                <h3 className="sheet-title">Sign In Assistance</h3>
              </div>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setIsHelpOpen(false)}
                aria-label="Close dialog"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div className="text-sm text-slate-600 space-y-3 mb-6">
              <p>
                <strong>Institutional Account:</strong> Use the college email assigned by your academic registry (ending with @college.edu).
              </p>
              <p>
                <strong>Account Activation:</strong> New club volunteers and leads are activated by the Faculty Advisor or Club Coordinator.
              </p>
              <p>
                <strong>Contact Support:</strong> If you cannot access your account, reach out to the Department of Geography coordinator office.
              </p>
            </div>
            <button
              type="button"
              className="login-submit-btn"
              onClick={() => setIsHelpOpen(false)}
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Simple Privacy Dialog */}
      {isPrivacyOpen && (
        <div
          className="sheet-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPrivacyOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="sheet-panel" style={{ maxWidth: '440px' }}>
            <div className="sheet-header">
              <div className="flex items-center gap-2">
                <FileCheck size={20} className="text-emerald-600" />
                <h3 className="sheet-title">Privacy Policy</h3>
              </div>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setIsPrivacyOpen(false)}
                aria-label="Close dialog"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div className="text-sm text-slate-600 space-y-3 mb-6">
              <p>
                GeoHub respects scholar privacy. Your institutional identity is utilized strictly for event attendance, squad rosters, and academic certification.
              </p>
              <p>
                Authentication credentials and gate-pass QR codes are encrypted and never stored in plain text or shared externally.
              </p>
            </div>
            <button
              type="button"
              className="login-submit-btn"
              onClick={() => setIsPrivacyOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Join Request Dialog */}
      {isJoinOpen && (
        <div
          className="sheet-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsJoinOpen(false);
              setJoinSubmitted(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="sheet-panel" style={{ maxWidth: '440px' }}>
            <div className="sheet-header">
              <h3 className="sheet-title">Request to Join GeoHub</h3>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => {
                  setIsJoinOpen(false);
                  setJoinSubmitted(false);
                }}
                aria-label="Close dialog"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            {joinSubmitted ? (
              <div className="flex flex-col items-center text-center py-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'var(--mint-tint, #E7F9F1)',
                    border: '1px solid var(--mint-border, #A7F3D0)',
                    color: 'var(--brand-green, #10B981)',
                  }}
                >
                  <CheckCircle2 size={48} strokeWidth={1.75} />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  Application Submitted
                </h4>
                <p className="text-sm text-slate-600 mb-6 max-w-xs">
                  Your application for the <strong>{joinSquad} Squad</strong> has been dispatched to the Club President for review.
                </p>
                <button
                  type="button"
                  className="login-submit-btn"
                  onClick={() => {
                    setIsJoinOpen(false);
                    setJoinSubmitted(false);
                  }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="login-form">
                <div className="login-field-group">
                  <label htmlFor="join-name" className="login-label">
                    Full Name
                  </label>
                  <input
                    id="join-name"
                    required
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    className="login-input"
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                <div className="login-field-group">
                  <label htmlFor="join-email" className="login-label">
                    Institutional Email
                  </label>
                  <input
                    id="join-email"
                    type="email"
                    required
                    value={joinEmail}
                    onChange={(e) => setJoinEmail(e.target.value)}
                    placeholder="jordan@college.edu"
                    className="login-input"
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                <div className="login-field-group">
                  <label htmlFor="join-squad" className="login-label">
                    Preferred Squad
                  </label>
                  <select
                    id="join-squad"
                    value={joinSquad}
                    onChange={(e) => setJoinSquad(e.target.value)}
                    className="login-input"
                    style={{ paddingLeft: '16px' }}
                  >
                    <option value="Promotion">Promotion & Media Squad</option>
                    <option value="Documentation">Documentation & Records Squad</option>
                    <option value="Finance">Finance & Requisitions Squad</option>
                    <option value="Operations">Events & Operations Squad</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="login-submit-btn"
                  style={{ marginTop: '8px' }}
                >
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
