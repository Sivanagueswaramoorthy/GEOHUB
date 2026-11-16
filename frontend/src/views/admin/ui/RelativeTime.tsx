import React from 'react';

export interface RelativeTimeProps {
  date: string | Date | null | undefined;
  className?: string;
  prefix?: string;
}

export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'Never';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 'Never';

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const RelativeTime: React.FC<RelativeTimeProps> = ({
  date,
  className = '',
  prefix = '',
}) => {
  const fullIso = date ? (typeof date === 'string' ? date : date.toISOString()) : 'N/A';
  const relativeStr = formatRelativeTime(date);

  return (
    <span
      title={fullIso}
      className={`font-medium ${className}`}
      aria-label={`Time: ${relativeStr} (${fullIso})`}
    >
      {prefix && <span>{prefix} </span>}
      {relativeStr}
    </span>
  );
};

export default RelativeTime;
