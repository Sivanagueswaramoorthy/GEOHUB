import React, { useState, useEffect } from 'react';
import { orgConfig } from '../../config/org';
import { MascotLogo } from '../../components/shared/MascotLogo';
import { LoginForm } from './LoginForm';
import { ForgotPasswordSheet } from './ForgotPasswordSheet';
import { DemoCredentialsCard } from './DemoCredentialsCard';
import { useLogin } from './useLogin';
import { UserModel } from '../../types';
import appLogoClean from '../../assets/app-logo-clean.png';
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
  const [fillCredentials, setFillCredentials] = useState<{ rollNo: string; password?: string } | null>(null);

  // Set document title
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `Sign in | ${orgConfig.orgName}`;
    return () => {
      document.title = originalTitle;
    };
  }, []);

  const handleAutoFill = (rollNo: string, password: string) => {
    setFillCredentials({ rollNo, password });
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      // ignore
    }
  };

  const handleDirectLogin = (user: UserModel) => {
    loginDemoPersona(user);
  };

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 select-none"
      style={{
        background: 'radial-gradient(circle at 50% 20%, rgba(218, 241, 222, 0.65) 0%, rgba(246, 251, 247, 0) 70%), #F6FBF7',
      }}
    >
      <div
        className="w-full max-w-lg flex flex-col items-center gap-5"
        style={{
          boxSizing: 'border-box',
        }}
      >
        {/* Top Hero Logo: app-logo-clean.png with unique eco-leaf badge background */}
        <div className="relative flex items-center justify-center mb-1">
          <div
            className="flex items-center justify-center p-2.5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #DAF1DE 100%)',
              borderRadius: '20px 8px 20px 8px',
              border: '1.5px solid #8EB69B',
              boxShadow: '0 6px 20px rgba(5, 31, 32, 0.08), inset 0 1px 0 #FFFFFF',
            }}
          >
            <img
              src={appLogoClean}
              alt="Green Eco Organization logo"
              className="w-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
              style={{
                height: '48px',
                maxWidth: '110px',
              }}
            />
          </div>
        </div>

        {/* Minimal Headline and subtitle: headline "Welcome back", subtitle "Sign in to GeoHub" */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DAF1DE] border border-[#8EB69B] text-xs font-semibold text-[#163832] mb-2 select-none">
            <span>Green Eco Organization</span>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            Welcome back
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Sign in to GeoHub
          </p>
        </div>

        {/* Session Expired Banner if present */}
        {isSessionExpired && (
          <div
            className="w-full p-3 rounded-2xl text-xs font-semibold"
            style={{
              backgroundColor: 'rgba(242, 184, 75, 0.16)',
              border: '1px solid rgba(242, 184, 75, 0.35)',
              color: '#051F20',
            }}
          >
            Session expired. Please sign in again.
          </div>
        )}

        {/* Rounded Card: 2 inputs, Sign in pill button, ghost Forgot link */}
        <div
          className="w-full bg-white p-5 sm:p-6 shadow-[0_10px_30px_rgba(5,31,32,0.08)] border border-[#DAF1DE]"
          style={{
            borderRadius: '24px',
          }}
        >
          <LoginForm
            onSubmit={authenticate}
            isLoading={isLoading}
            isSuccess={isSuccess}
            errorState={errorState}
            rateLimitSeconds={rateLimitSeconds}
            onForgotPasswordClick={() => setIsForgotOpen(true)}
            onClearError={clearError}
            fillCredentials={fillCredentials}
          />
        </div>

        {/* Demo Credentials Card: All page logins, usernames, and passwords */}
        <DemoCredentialsCard
          onAutoFill={handleAutoFill}
          onDirectLogin={handleDirectLogin}
          isLoading={isLoading || isSuccess}
        />
      </div>

      {/* Forgot Password Bottom Sheet */}
      <ForgotPasswordSheet
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </main>
  );
};

export default LoginPage;
