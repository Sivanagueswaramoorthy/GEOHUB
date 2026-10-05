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
            border: '2px solid #A7F3D0',
            color: '#065F46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
          }}
        >
          <Compass size={40} className="animate-spin-slow" />
        </div>

        {/* 404 Badge */}
        <span
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '999px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          404 Destination Uncharted
        </span>

        {/* Title */}
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
          Coordinates Not Found
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: '13.5px',
            color: '#64748B',
            lineHeight: 1.55,
            marginBottom: '24px',
          }}
        >
          The module or coordinates <code style={{ backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '6px', color: '#0F172A', fontWeight: 600 }}>{routeName || '#unknown'}</code> are not part of the active GeoHub chapter manifest.
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleReturnHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '999px',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
            transition: 'all 150ms ease',
          }}
        >
          <Home size={16} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
