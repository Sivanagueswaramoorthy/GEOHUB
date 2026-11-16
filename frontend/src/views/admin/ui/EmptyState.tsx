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
      className={`w-full py-10 px-4 bg-white border border-[#E3EEE6] rounded-2xl flex flex-col items-center justify-center text-center space-y-2.5 ${className}`}
    >
      <div className="text-[#8EB69B] flex items-center justify-center">{icon}</div>
      <p className="text-sm font-semibold text-[#051F20] tracking-tight">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 min-h-[44px] px-4 py-1.5 rounded-xl bg-[#051F20] text-white text-xs font-bold hover:bg-[#163832] transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
