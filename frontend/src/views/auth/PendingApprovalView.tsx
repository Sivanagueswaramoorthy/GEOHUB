import React, { useState } from 'react';
import { RefreshCw, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Mascot } from '../../components/shared/Mascot';
import { StatusChip } from '../../components/shared/StatusChip';
import { PillButton } from '../../components/shared/PillButton';

export interface PendingApprovalViewProps {
  onCheckStatus?: () => void;
  onLogout?: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({
  onCheckStatus,
  onLogout,
}) => {
  const { currentUser, logout, setActiveTab } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setStatusMessage(null);
    setTimeout(() => {
      setIsRefreshing(false);
      setStatusMessage('Verification in progress by chapter faculty.');
    }, 800);
    if (onCheckStatus) onCheckStatus();
  };

  const handleSignOut = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      setActiveTab('login');
      window.location.hash = 'login';
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-5 select-none"
      style={{
        background: 'radial-gradient(circle at 50% 25%, rgba(218, 241, 222, 0.7) 0%, rgba(246, 251, 247, 0) 70%), #F6FBF7',
      }}
    >
      <div
        className="w-full max-w-sm bg-white p-7 text-center flex flex-col items-center border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.08)]"
        style={{
          borderRadius: '24px',
        }}
      >
        {/* Shield Mascot on mint halo */}
        <div className="relative mb-5 flex items-center justify-center">
          <div
            className="absolute w-28 h-28 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #DAF1DE 0%, rgba(218, 241, 222, 0) 70%)',
              filter: 'blur(10px)',
            }}
          />
          <Mascot name="shield" size={88} floating />
        </div>

        {/* Pending Review Chip */}
        <div className="mb-3">
          <StatusChip status="pending" label="Pending Review" />
        </div>

        {/* 1 Headline, 1 Subtitle */}
        <h1
          className="font-bold text-[#051F20] tracking-tight mb-1"
          style={{ fontSize: '24px', lineHeight: '28px' }}
        >
          Clearance pending
        </h1>
        <p className="text-xs font-medium text-[#235347] max-w-xs mb-6 leading-relaxed">
          Faculty advisor verification required
        </p>

        {statusMessage && (
          <div
            className="w-full p-3 rounded-2xl mb-4 text-xs font-semibold text-[#051F20] bg-[rgba(242,184,75,0.16)] border border-[#F2B84B]"
            style={{ borderRadius: '16px' }}
          >
            {statusMessage}
          </div>
        )}

        {/* Two CTAs: Primary "Check Status" and Ghost "Sign out" */}
        <div className="w-full flex flex-col gap-2.5">
          <PillButton
            variant="primary"
            fullWidth
            loading={isRefreshing}
            onClick={handleRefresh}
            icon={<RefreshCw size={14} strokeWidth={2.2} />}
          >
            Check Status
          </PillButton>

          <PillButton
            variant="ghost"
            fullWidth
            onClick={handleSignOut}
            icon={<LogOut size={14} strokeWidth={2.2} />}
          >
            Sign out
          </PillButton>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalView;
