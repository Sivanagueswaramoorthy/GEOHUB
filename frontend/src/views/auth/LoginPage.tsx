import React, { useEffect, useState } from 'react';
import { Leaf, Calendar, FileEdit, Sparkles } from 'lucide-react';
import { orgConfig } from '../../config/org';
import { LoginScene } from '../../components/auth/LoginScene';
import { LoginCard } from '../../components/auth/LoginCard';
import { ForgotPasswordSheet } from '../../features/auth/ForgotPasswordSheet';
import { useLogin } from '../../features/auth/useLogin';
import '../../features/auth/login.css';

export const LoginPage: React.FC = () => {
  const { authenticate, isLoading, isSuccess, errorState, rateLimitSeconds, isSessionExpired } = useLogin();
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // Set document title
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `Sign in | ${orgConfig.orgName}`;
    return () => {
      document.title = originalTitle;
    };
  }, []);

  const handleSubmitCredentials = async (credentials: {
    rollNo: string;
    password?: string;
    rememberMe?: boolean;
  }): Promise<boolean> => {
    return await authenticate({
      rollNo: credentials.rollNo,
      email: credentials.rollNo,
      password: credentials.password || '',
      rememberMe: credentials.rememberMe,
    });
  };

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 select-none relative overflow-x-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 18%, rgba(218, 241, 222, 0.9) 0%, rgba(246, 251, 247, 0.6) 55%, #F6FBF7 100%), #F6FBF7',
      }}
    >
      {/* Soft Ambient Background Orbs */}
      <div className="ambient-orb-top absolute -top-16 -left-16 w-72 h-72 bg-[#DAF1DE] rounded-full blur-3xl opacity-75 pointer-events-none" />
      <div className="ambient-orb-bottom absolute -bottom-16 -right-16 w-72 h-72 bg-[#8EB69B] rounded-full blur-3xl opacity-35 pointer-events-none" />

      {/* Top Floating Action & Status Badges Matching Reference Screenshot */}
      <div className="w-full max-w-[420px] flex items-start justify-between relative z-10 pt-1 pointer-events-none">
        {/* Left Badges: Leaf & Calendar */}
        <div className="flex flex-col gap-2.5 pointer-events-auto">
          <div className="w-11 h-11 rounded-2xl bg-white/85 backdrop-blur-md border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.04)] flex items-center justify-center text-[#163832]">
            <Leaf size={20} strokeWidth={2.2} />
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/85 backdrop-blur-md border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.04)] flex items-center justify-center text-[#163832]">
            <Calendar size={20} strokeWidth={2.2} />
          </div>
        </div>

        {/* Right Badges: FileEdit & Sparkles */}
        <div className="flex flex-col gap-2.5 pointer-events-auto">
          <div className="w-11 h-11 rounded-2xl bg-white/85 backdrop-blur-md border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.04)] flex items-center justify-center text-[#163832]">
            <FileEdit size={20} strokeWidth={2.2} />
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/85 backdrop-blur-md border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.04)] flex items-center justify-center text-[#163832]">
            <Sparkles size={20} strokeWidth={2.2} />
          </div>
        </div>
      </div>

      {/* Center Column: Mascot & Form Card */}
      <div className="w-full max-w-[420px] flex flex-col items-center relative z-10 my-auto gap-3.5">
        {/* Hero: 3D Sprout Cloud Mascot & Official Badge */}
        <LoginScene />

        {/* Session Expired Notice if applicable */}
        {isSessionExpired && (
          <div
            className="w-full p-3 rounded-2xl text-xs font-semibold text-center select-none"
            style={{
              backgroundColor: 'rgba(242, 184, 75, 0.16)',
              border: '1px solid rgba(242, 184, 75, 0.35)',
              color: '#051F20',
            }}
          >
            Session expired. Please sign in again.
          </div>
        )}

        {/* White Auth Card Matching Reference */}
        <LoginCard
          onSubmit={handleSubmitCredentials}
          isLoading={isLoading}
          isSuccess={isSuccess}
          errorState={errorState}
          rateLimitSeconds={rateLimitSeconds}
          onForgotPasswordClick={() => setIsForgotOpen(true)}
        />
      </div>

      {/* Footer Legal Terms Notice matching reference image */}
      <div className="w-full max-w-[420px] text-center relative z-10 pt-3 pb-2 select-none px-2">
        <p className="text-xs text-[#235347] leading-relaxed">
          By continuing, you agree to our{' '}
          <a
            href="#terms"
            onClick={(e) => e.preventDefault()}
            className="underline font-semibold text-[#051F20] hover:text-[#163832]"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="underline font-semibold text-[#051F20] hover:text-[#163832]"
          >
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Forgot Password Sheet */}
      <ForgotPasswordSheet
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </main>
  );
};

export default LoginPage;
