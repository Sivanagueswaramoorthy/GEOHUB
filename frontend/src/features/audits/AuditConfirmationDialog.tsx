import React, { useEffect, useRef } from 'react';
import { ShieldCheck, X, AlertTriangle, Check } from 'lucide-react';
import { AuditRecord } from './audit.types';

interface AuditConfirmationDialogProps {
  isOpen: boolean;
  audit: AuditRecord;
  isSealing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AuditConfirmationDialog: React.FC<AuditConfirmationDialogProps> = ({
  isOpen,
  audit,
  isSealing,
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  // Focus management & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="audit-dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seal-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="audit-dialog-card">
        {/* Header */}
        <div className="audit-dialog-header">
          <div className="flex items-center gap-2.5">
            <div className="audit-dialog-icon-wrap">
              <ShieldCheck size={20} className="text-emerald-700" />
            </div>
            <div>
              <h3 id="seal-dialog-title" className="audit-dialog-title">
                Acknowledge & Seal Update
              </h3>
              <p className="audit-dialog-subtitle">
                Official Chapter Verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSealing}
            className="audit-dialog-close-btn"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="audit-dialog-body">
          <p className="audit-dialog-message">
            Are you sure you want to acknowledge and digitally seal the latest update for{' '}
            <strong className="text-slate-900">{audit.moduleTitle}</strong>?
          </p>

          <div className="audit-dialog-summary-box">
            <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Audit Reference:</span>
              <span className="font-mono font-semibold text-slate-800">{audit.auditRef}</span>
            </div>
            <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Lead Responsible:</span>
              <span className="font-semibold text-slate-800">{audit.leadName}</span>
            </div>
            <div className="flex justify-between items-center text-xs py-1">
              <span className="text-slate-500 font-medium">Chapter Domain:</span>
              <span className="font-semibold text-slate-800">{audit.department}</span>
            </div>
          </div>

          <div className="audit-dialog-note">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <span className="text-xs text-amber-900 leading-relaxed">
              Once sealed, this record is locked in the Green Eco Organization compliance ledger. An audit stamp will be affixed permanently.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="audit-dialog-footer">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSealing}
            className="audit-dialog-btn-cancel"
          >
            Cancel
          </button>

          <button
            type="button"
            ref={confirmBtnRef}
            onClick={onConfirm}
            disabled={isSealing}
            className="audit-dialog-btn-confirm"
          >
            {isSealing ? (
              <span className="flex items-center gap-2">
                <span className="audit-spinner-sm" />
                <span>Sealing Record...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Check size={16} strokeWidth={2.4} />
                <span>Confirm & Seal Record</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
