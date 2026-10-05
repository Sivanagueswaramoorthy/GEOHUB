import React from 'react';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
  style,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-[24px] bg-white border border-dashed border-slate-200 ${className}`}
      style={style}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
        {icon || <Inbox size={26} />}
      </div>
      <h4 className="font-extrabold text-sm text-slate-800 mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-1.5 rounded-full font-bold text-xs bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Unable to load content at this moment. Please try again.',
  onRetry,
  className = '',
  style,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-[24px] bg-white border border-red-100 ${className}`}
      style={style}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-red-500 mb-3 border border-red-100">
        <AlertCircle size={26} />
      </div>
      <h4 className="font-extrabold text-sm text-slate-900 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={12} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}> = ({ width = '100%', height = '16px', borderRadius = '8px', className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-100 ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
};
