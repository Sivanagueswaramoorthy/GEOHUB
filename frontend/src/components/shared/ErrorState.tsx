import React from 'react';
import { RefreshCw } from 'lucide-react';
import { PillButton } from './PillButton';
import { Mascot } from './Mascot';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  description,
  onRetry,
  className = '',
  style,
}) => {
  const displayMessage = description || message || 'Unable to complete this action. Please check connection and retry.';
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white border border-[#DAF1DE] select-none ${className}`}
      style={{
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
        minHeight: '240px',
        ...style,
      }}
      role="alert"
    >
      <div className="mb-4">
        <Mascot name="shield" size="md" floating />
      </div>

      <h3
        className="font-bold text-[#051F20] text-base leading-snug line-clamp-1"
        style={{ fontSize: '18px', lineHeight: '24px' }}
      >
        {title}
      </h3>

      <p className="text-xs font-medium text-[#235347] mt-1.5 max-w-xs leading-relaxed">
        {displayMessage}
      </p>

      {onRetry && (
        <div className="mt-5">
          <PillButton
            variant="primary"
            size="sm"
            onClick={onRetry}
            icon={<RefreshCw size={14} strokeWidth={2.2} />}
          >
            Retry
          </PillButton>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
