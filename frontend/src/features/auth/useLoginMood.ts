import { useState, useRef, useEffect, useCallback } from 'react';
import { MascotMood } from '../../components/shared/MascotLogo';

export interface UseLoginMoodOptions {
  isLoading?: boolean;
  isSuccess?: boolean;
}

export function useLoginMood({ isLoading = false, isSuccess = false }: UseLoginMoodOptions = {}) {
  const [focusedField, setFocusedField] = useState<'rollNo' | 'password' | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isNodding, setIsNodding] = useState(false);
  const [isWorried, setIsWorried] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);

  const nodTimerRef = useRef<number | null>(null);
  const lastNodTimeRef = useRef<number>(0);
  const worryTimerRef = useRef<number | null>(null);

  // Monitor visibility state of document to pause loops when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (nodTimerRef.current) window.clearTimeout(nodTimerRef.current);
      if (worryTimerRef.current) window.clearTimeout(worryTimerRef.current);
    };
  }, []);

  // Throttled typing nod: 2px bounce throttled to 150ms
  const triggerTypingNod = useCallback(() => {
    const now = Date.now();
    if (now - lastNodTimeRef.current < 150) {
      return;
    }
    lastNodTimeRef.current = now;
    setIsNodding(true);

    if (nodTimerRef.current) {
      window.clearTimeout(nodTimerRef.current);
    }
    nodTimerRef.current = window.setTimeout(() => {
      setIsNodding(false);
    }, 150);
  }, []);

  // Trigger worried reaction on error for 1.5s
  const triggerErrorReaction = useCallback(() => {
    setIsWorried(true);
    if (worryTimerRef.current) {
      window.clearTimeout(worryTimerRef.current);
    }
    worryTimerRef.current = window.setTimeout(() => {
      setIsWorried(false);
    }, 1500);
  }, []);

  // Determine current mood based on state priority
  let mood: MascotMood = 'idle';

  if (isSuccess) {
    mood = 'happy';
  } else if (isWorried) {
    mood = 'worried';
  } else if (focusedField === 'password') {
    mood = isPasswordVisible ? 'peek' : 'eyes-closed';
  } else if (focusedField === 'rollNo') {
    mood = 'look-down';
  } else {
    mood = 'idle';
  }

  return {
    mood,
    isNodding,
    isHopping: isLoading,
    isTabVisible,
    focusedField,
    setFocusedField,
    isPasswordVisible,
    setIsPasswordVisible,
    triggerTypingNod,
    triggerErrorReaction,
  };
}

export default useLoginMood;

