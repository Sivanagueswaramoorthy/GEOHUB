import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export interface OfflineBannerProps {
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ className = '' }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className={`w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-[#051F20] bg-[rgba(242,184,75,0.18)] border-b border-[#F2B84B] select-none ${className}`}
      role="status"
    >
      <div className="flex items-center gap-2">
        <WifiOff size={16} strokeWidth={2.2} className="text-[#051F20]" />
        <span>You are currently offline. Changes will sync once connected.</span>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#F2B84B] text-xs font-bold text-[#051F20] cursor-pointer pressable"
      >
        <RefreshCw size={12} strokeWidth={2.2} />
        <span>Retry</span>
      </button>
    </div>
  );
};

export default OfflineBanner;
