import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mascot } from './shared/Mascot';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 1800,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsMounted(false);
      onFinish?.();
    }, 300);
  }, [isClosing, onFinish]);

  // Overall splash auto-fade duration at 1.8s or tap
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, handleDismiss]);

  if (!isMounted) return null;

  return (
    <aside
      onClick={handleDismiss}
      role="status"
      aria-live="polite"
      aria-label="Green Eco Organization Hub"
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none transition-opacity duration-300"
      style={{
        background: 'radial-gradient(circle at 50% 45%, rgba(218, 241, 222, 0.75) 0%, rgba(246, 251, 247, 0.98) 70%), #F6FBF7',
        opacity: isClosing ? 0 : 1,
      }}
    >
      <div className="flex flex-col items-center text-center p-6">
        {/* Centered floating leaf mascot */}
        <div className="relative mb-6 flex items-center justify-center">
          <div
            className="absolute w-40 h-40 rounded-full -z-10"
            style={{
              background: 'radial-gradient(circle, #DAF1DE 0%, rgba(218, 241, 222, 0) 70%)',
              filter: 'blur(16px)',
            }}
          />
          <Mascot name="leaf" size={100} floating />
        </div>

        {/* GEO HUB Wordmark */}
        <div className="flex items-center gap-1 mb-2">
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '32px',
              fontWeight: 800,
              color: '#051F20',
              letterSpacing: '-0.02em',
            }}
          >
            GEO
          </span>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#8EB69B',
              margin: '0 4px',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '32px',
              fontWeight: 800,
              color: '#235347',
              letterSpacing: '-0.02em',
            }}
          >
            HUB
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: '14px',
            fontWeight: 600,
            color: '#235347',
            letterSpacing: '0.02em',
          }}
        >
          Green Eco Organization Hub
        </p>
      </div>
    </aside>
  );
};

export default SplashScreen;
