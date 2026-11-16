import React from 'react';

export type StatusType = 'online' | 'idle' | 'suspended' | 'never_logged_in';

export interface StatusDotProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  const dotClasses = {
    online: 'bg-emerald-500 ring-2 ring-emerald-100',
    idle: 'bg-slate-300',
    suspended: 'bg-rose-500 ring-2 ring-rose-100',
    never_logged_in: 'bg-rose-400',
  };

  return (
    <span
      className={`inline-block rounded-full shrink-0 ${sizeClasses} ${dotClasses[status] || 'bg-slate-300'} ${className}`}
      aria-hidden="true"
    />
  );
};

export default StatusDot;
