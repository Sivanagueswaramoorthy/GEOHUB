import React from 'react';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface NotFoundViewProps {
  attemptedRoute?: string;
  onGoHome?: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  attemptedRoute,
  onGoHome,
}) => {
  const { setActiveTab } = useApp();

  const handleReturnHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      setActiveTab('home');
      window.location.hash = 'home';
    }
  };

  const routeName = attemptedRoute || (typeof window !== 'undefined' ? window.location.hash : '');

  return (
    <div
      style={{
        minHeight: '80vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Animated Compass Icon in Mint */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: '#E7F9F1',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
          }}
        >
          <Compass size={48} strokeWidth={1.75} className="animate-spin-slow" />
        </div>

        {/* 404 Badge */}
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '11px',
            lineHeight: '14px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}
        >
          404 Destination Uncharted
        </span>

        {/* Title */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: '34px',
            marginBottom: '8px',
            fontFamily: 'var(--font-family)',
          }}
        >
          Coordinates Not Found
        </h1>

        <span
          style={{
            fontSize: '13px',
            color: '#64748B',
            marginBottom: '24px',
            display: 'block',
            fontWeight: 600,
          }}
        >
          Unrecognized route: <code style={{ backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px', color: '#0F172A' }}>{routeName || '#unknown'}</code>
        </span>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleReturnHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            height: '52px',
            minHeight: '52px',
            padding: '0 24px',
            borderRadius: '999px',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            fontSize: '15px',
            lineHeight: '20px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
            transition: 'all 150ms ease',
          }}
        >
          <Home size={16} strokeWidth={1.75} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
