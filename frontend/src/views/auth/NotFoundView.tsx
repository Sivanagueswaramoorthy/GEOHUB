import React from 'react';
import { Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Mascot } from '../../components/shared/Mascot';
import { PillButton } from '../../components/shared/PillButton';

export interface NotFoundViewProps {
  attemptedRoute?: string;
  onGoHome?: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onGoHome,
}) => {
  const { setActiveTab } = useApp();

  const handleReturnHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      setActiveTab('home');
      window.location.hash = '';
    }
  };

  return (
    <div
      className="min-h-[75vh] w-full flex items-center justify-center p-5 select-none"
      style={{
        background: 'radial-gradient(circle at 50% 30%, rgba(218, 241, 222, 0.6) 0%, rgba(246, 251, 247, 0) 70%), #F6FBF7',
      }}
    >
      <div
        className="w-full max-w-sm bg-white p-7 text-center flex flex-col items-center border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.08)]"
        style={{
          borderRadius: '24px',
        }}
      >
        {/* Lock Mascot with halo */}
        <div className="relative mb-5 flex items-center justify-center">
          <div
            className="absolute w-28 h-28 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #DAF1DE 0%, rgba(218, 241, 222, 0) 70%)',
              filter: 'blur(8px)',
            }}
          />
          <Mascot name="lock" size={88} floating />
        </div>

        {/* 1 Headline (2-4 words): "No access" */}
        <h1
          className="font-bold text-[#051F20] tracking-tight mb-1"
          style={{ fontSize: '28px', lineHeight: '32px' }}
        >
          No access
        </h1>

        {/* 1 Subtitle (<6 words): "Clearance required" */}
        <p className="text-xs font-semibold text-[#235347] mb-6">
          Clearance required
        </p>

        {/* Single "Go home" pill button routing to authorized role home */}
        <div className="w-full">
          <PillButton
            variant="primary"
            fullWidth
            onClick={handleReturnHome}
            icon={<Home size={16} strokeWidth={2} />}
          >
            Go home
          </PillButton>
        </div>
      </div>
    </div>
  );
};

export default NotFoundView;
