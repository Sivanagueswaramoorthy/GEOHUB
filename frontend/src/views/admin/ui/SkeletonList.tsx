import React from 'react';

export interface SkeletonListProps {
  count?: number;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 4, className = '' }) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="min-h-[64px] p-3.5 bg-[#F6FBF7] border border-[#DAF1DE] rounded-2xl flex items-center justify-between gap-3 animate-pulse"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-1.5 flex-1 max-w-[200px]">
              <div className="h-3.5 bg-slate-200 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
          <div className="w-14 h-6 bg-slate-100 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonList;
