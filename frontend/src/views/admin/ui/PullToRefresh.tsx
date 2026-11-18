import React, { useState, useRef } from 'react';

export interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = '',
}) => {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 0) {
      // Apply friction
      setPullY(Math.min(diff * 0.4, 70));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (pullY > 45 && !isRefreshing) {
      setIsRefreshing(true);
      setPullY(45);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullY(0);
      }
    } else {
      setPullY(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative min-h-full ${className}`}
    >
      {/* Pull Indicator */}
      <div
        className="w-full flex items-center justify-center overflow-hidden transition-all duration-200 pointer-events-none"
        style={{
          height: `${pullY}px`,
          opacity: pullY > 10 ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#051F20] bg-[#F6FBF7] px-3 py-1 rounded-full border border-[#DAF1DE] shadow-xs">
          <span className={`inline-block text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
            ↻
          </span>
          <span>{isRefreshing ? 'Refreshing...' : 'Pull to refresh'}</span>
        </div>
      </div>

      {children}
    </div>
  );
};

export default PullToRefresh;
