import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  className = '',
  action,
}) => {
  return (
    <div
      className={`w-full py-10 px-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center text-center space-y-2.5 shadow-xs ${className}`}
    >
      <div className="text-slate-400 flex items-center justify-center">{icon}</div>
      <p className="text-sm font-bold text-slate-800 tracking-tight">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
