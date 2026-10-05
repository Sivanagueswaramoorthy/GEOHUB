import React, { useState } from 'react';
import { Hourglass, RefreshCw, LogOut, Mail, Sparkles, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
      setStatusMessage('Registration status: Pending executive review by Faculty Advisor & Squad Lead.');
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
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Amber Circular Hourglass Icon */}
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            border: '2px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706',
            boxShadow: '0 8px 24px rgba(217, 119, 6, 0.16)',
            marginBottom: '24px',
          }}
        >
          <Hourglass size={42} className="animate-pulse" />
        </div>

        {/* Overline Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: '#FFF8E6',
            border: '1px solid #FDE68A',
            color: '#92400E',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          <Sparkles size={12} color="#D97706" />
          <span>Induction Status: Under Review</span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
            marginBottom: '8px',
            fontFamily: 'var(--font-family)',
          }}
        >
          Approval in Progress
        </h1>

        {/* Explanation Copy */}
        <p
          style={{
            fontSize: '13.5px',
            color: '#64748B',
            lineHeight: 1.6,
            marginBottom: '20px',
            maxWidth: '380px',
          }}
        >
          Hello <strong style={{ color: '#0F172A' }}>{currentUser.name || 'Scholar'}</strong>! Your induction registration for the <span style={{ color: '#065F46', fontWeight: 700 }}>{currentUser.team || 'Geo Club'} Squad</span> has been recorded. Club administrators are verifying your college credentials.
        </p>

        {/* User Email Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #EEF1F5',
            color: '#334155',
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '28px',
          }}
        >
          <Mail size={15} color="#64748B" />
          <span>{currentUser.email || 'scholar@college.edu'}</span>
        </div>

        {/* Status Toast Notice if refreshed */}
        {statusMessage && (
          <div
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '14px',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              color: '#92400E',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: 1.45,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left',
            }}
          >
            <ShieldAlert size={16} className="shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '999px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
              transition: 'all 150ms ease',
            }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Checking Status...' : 'Check Status / Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '999px',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 700,
              border: '1px solid #EEF1F5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 150ms ease',
            }}
          >
            <LogOut size={16} />
            <span>Sign Out & Return</span>
          </button>
        </div>
      </div>
    </div>
  );
};
