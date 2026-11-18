import React, { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Copy, Check, ShieldAlert } from 'lucide-react';

export interface FacultyPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyName: string;
  pin: string;
}

export const FacultyPinModal: React.FC<FacultyPinModalProps> = ({
  isOpen,
  onClose,
  facultyName,
  pin,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Instant Access Token">
      <div className="space-y-4 py-2 text-center">
        <p className="text-xs text-[#235347] font-medium">
          One-time 6-digit cryptographic PIN generated for{' '}
          <span className="font-bold text-[#051F20]">{facultyName}</span>.
        </p>

        {/* Large 6-Digit PIN Display */}
        <div className="py-4 px-6 bg-[#F6FBF7] border border-[#DAF1DE] rounded-2xl flex items-center justify-center">
          <span className="font-mono text-3xl font-extrabold tracking-[0.35em] text-[#051F20]">
            {pin}
          </span>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-left text-xs text-amber-800">
          <ShieldAlert size={18} className="shrink-0 text-amber-600" />
          <span>
            This PIN is valid for 15 minutes and can only be used once for emergency portal access.
          </span>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full min-h-[44px] h-11 rounded-xl bg-[#163832] hover:bg-[#163832] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy 6-Digit PIN'}</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default FacultyPinModal;

