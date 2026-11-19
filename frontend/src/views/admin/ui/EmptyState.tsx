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
      style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
      className={`w-full py-10 px-4 border rounded-2xl flex flex-col items-center justify-center text-center space-y-2.5 shadow-xs ${className}`}
    >
      <div
        style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE', color: '#163832' }}
        className="w-14 h-14 rounded-2xl border flex items-center justify-center shadow-2xs mb-1"
      >
        {icon}
      </div>
      <p style={{ color: '#051F20' }} className="text-sm font-bold tracking-tight">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          style={{ backgroundColor: '#163832', color: '#FFFFFF' }}
          className="mt-2 min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#235347] shadow-xs transition active:scale-95 cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
