import React, { useState, useEffect } from 'react';
import { orgConfig } from '../../config/org';
import { Mascot } from '../../components/shared/Mascot';
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

  // Set document title
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `Sign in | ${orgConfig.orgName}`;
    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center p-5 select-none"
      style={{
        background: 'radial-gradient(circle at 50% 20%, rgba(218, 241, 222, 0.65) 0%, rgba(246, 251, 247, 0) 70%), #F6FBF7',
      }}
    >
      <div
        className="w-full max-w-sm flex flex-col items-center"
        style={{
          boxSizing: 'border-box',
        }}
      >
        {/* Top Hero Mascot: Globe on soft mint halo */}
        <div className="relative mb-3 flex items-center justify-center">
          <div
            className="absolute w-28 h-28 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #DAF1DE 0%, rgba(218, 241, 222, 0) 70%)',
              filter: 'blur(8px)',
            }}
          />
          <Mascot name="globe" size={84} floating />
        </div>

        {/* Minimal Headline and subtitle: headline "Welcome back", subtitle "Sign in to GeoHub" */}
        <div className="text-center mb-6">
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
            className="w-full p-3 rounded-2xl mb-4 text-xs font-semibold"
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
          className="w-full bg-white p-6 shadow-[0_10px_30px_rgba(5,31,32,0.08)] border border-[#DAF1DE]"
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
          />
        </div>
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
