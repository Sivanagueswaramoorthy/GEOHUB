import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
    onClose();
    onConfirm(reason);
  };

  const dialogContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F3638]/60 backdrop-blur-md select-none transition-all duration-300"
      style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-[0_20px_50px_rgba(15,54,56,0.22)] border border-[#E8D9BD]"
        style={{ borderRadius: '24px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              backgroundColor: isDangerActive ? 'rgba(200, 109, 81, 0.12)' : '#F3E4C3',
              color: isDangerActive ? '#C86D51' : '#184E50',
              border: isDangerActive ? '1px solid rgba(200, 109, 81, 0.3)' : '1px solid #E8D9BD',
            }}
          >
            <AlertTriangle size={18} strokeWidth={2.2} />
          </div>
          <h3 className="font-bold text-base text-[#0F3638] leading-tight">
            {title}
          </h3>
        </div>

        <p className="text-xs text-[#52705E] font-medium leading-relaxed mb-4">
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
              className="w-full p-3 rounded-2xl border border-[#E8D9BD] text-xs text-[#0F3638] placeholder-[#6B8E78] outline-none font-medium focus:border-[#6B8E78] resize-none"
              style={{ borderRadius: '16px' }}
            />
            {error && (
              <span className="text-xs font-semibold text-[#C86D51]">{error}</span>
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

  if (typeof document !== 'undefined') {
    return createPortal(dialogContent, document.body);
  }
  return dialogContent;
};

export default ConfirmDialog;
