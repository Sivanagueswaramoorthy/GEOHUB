import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

const FULL_TEXT = 'Green Eco Organization';

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2700,
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsMounted(false);
      onFinish?.();
    }, 450);
  }, [isClosing, onFinish]);

  // Letter-by-letter typewriter display
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // Start typing smoothly after logo springs in (300ms)
    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        setDisplayedLength((prev) => {
          if (prev >= FULL_TEXT.length) {
            if (intervalId) clearInterval(intervalId);
            return prev;
          }
          return prev + 1;
        });
      }, 55);
    }, 300);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Overall splash auto-dismiss duration
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, handleDismiss]);

  if (!isMounted) return null;

  const isTypingComplete = displayedLength >= FULL_TEXT.length;
  const currentText = FULL_TEXT.slice(0, displayedLength);

  return (
    <aside
      className={`splash-screen-overlay ${isClosing ? 'splash-closing' : ''}`}
      onClick={handleDismiss}
      role="status"
      aria-live="polite"
      aria-label={FULL_TEXT}
    >
      {/* Ambient background glow */}
      <div className="splash-ambient-bg" aria-hidden="true">
        <div className="splash-glow-disc" />
      </div>

      {/* Center Brand Identity: ONLY Logo + Letter-by-letter Animated Text */}
      <div className="splash-brand-center">
        <div className="splash-logo-container">
          <img
            src="/app-logo-clean.png"
            alt="Green Eco Organization Logo"
            className="splash-logo-img"
          />
        </div>

        <h1 className="splash-brand-text" aria-label={FULL_TEXT}>
          <span className="splash-text-content">{currentText}</span>
          <span
            className={`splash-cursor ${isTypingComplete ? 'cursor-finished' : 'cursor-typing'}`}
            aria-hidden="true"
          />
        </h1>
      </div>
    </aside>
  );
};
