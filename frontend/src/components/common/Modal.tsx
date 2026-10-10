import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '520px',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', lineHeight: '24px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-family)' }}>{title}</h3>
            {subtitle && (
              <p style={{ fontSize: '13px', lineHeight: '18px', color: '#64748B', marginTop: '4px', fontFamily: 'var(--font-family)' }}>{subtitle}</p>
            )}
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close modal"
            style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};
