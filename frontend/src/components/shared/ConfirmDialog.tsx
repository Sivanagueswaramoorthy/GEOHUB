import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PillButton } from './PillButton';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  variant?: 'danger' | 'default' | string;
  requireReason?: boolean;
  reasonPlaceholder?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  variant,
  requireReason = false,
  reasonPlaceholder = 'Please state the reason (mandatory)...',
}) => {
  const isDangerActive = isDanger || variant === 'danger';
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('A reason is strictly required to proceed.');
      return;
    }
    setError(null);
    onConfirm(reason);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/45 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-[0_16px_40px_rgba(5,31,32,0.16)] border border-[#DAF1DE]"
        style={{ borderRadius: '24px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              backgroundColor: isDanger ? 'rgba(217, 83, 79, 0.12)' : '#DAF1DE',
              color: isDanger ? '#D9534F' : '#163832',
              border: isDanger ? '1px solid rgba(217, 83, 79, 0.3)' : '1px solid #8EB69B',
            }}
          >
            <AlertTriangle size={18} strokeWidth={2.2} />
          </div>
          <h3 className="font-bold text-base text-[#051F20] leading-tight">
            {title}
          </h3>
        </div>

        <p className="text-xs text-[#235347] font-medium leading-relaxed mb-4">
          {message}
        </p>

        {requireReason && (
          <div className="flex flex-col gap-1.5 mb-4">
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder={reasonPlaceholder}
              rows={3}
              className="w-full p-3 rounded-2xl border border-[#DAF1DE] text-xs text-[#051F20] placeholder-[#8EB69B] outline-none font-medium focus:border-[#8EB69B] resize-none"
              style={{ borderRadius: '16px' }}
            />
            {error && (
              <span className="text-xs font-semibold text-[#D9534F]">{error}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5">
          <PillButton
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            {cancelLabel}
          </PillButton>
          <PillButton
            variant={isDangerActive ? 'destructive' : 'primary'}
            size="sm"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </PillButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
