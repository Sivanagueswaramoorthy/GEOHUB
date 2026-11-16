import React from 'react';
import { Key, Copy, Check } from 'lucide-react';

interface Props {
  faculty: any | null;
  pin: string;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}

export const FacultyPinModal: React.FC<Props> = ({
  faculty,
  pin,
  copied,
  onCopy,
  onClose,
}) => {
  if (!faculty) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl w-full max-w-sm p-5 sm:p-6 flex flex-col gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center mx-auto font-bold">
          <Key size={22} />
        </div>

        <div>
          <h3 className="text-base font-bold text-[#051F20]">Temporary Access PIN</h3>
          <p className="text-xs text-[#235347] mt-0.5">Faculty: {faculty.name}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-[#8EB69B] uppercase tracking-wider">One-Time Token</span>
          <span className="font-mono text-2xl font-black text-[#163832] tracking-widest">{pin}</span>
          <span className="text-[10px] text-[#52665C]">Valid for institutional verification</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="flex-1 py-2 rounded-xl bg-[#163832] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy PIN'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
