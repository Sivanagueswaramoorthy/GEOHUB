import React from 'react';
import { PauseCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  moduleName: string;
  onBack?: () => void;
}

export const ModulePausedNotice: React.FC<Props> = ({ moduleName, onBack }) => {
  const { setActiveTab } = useApp();

  return (
    <div className="max-w-md mx-auto my-12 p-6 rounded-3xl bg-white border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.06)] text-center flex flex-col items-center gap-4 animate-fadeIn select-none">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
        <PauseCircle size={32} strokeWidth={2.2} />
      </div>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
          <ShieldAlert size={12} />
          <span>Scheduled Maintenance</span>
        </div>
        <h2 className="text-lg font-bold text-[#051F20] pt-1">{moduleName} is Paused</h2>
        <p className="text-xs text-[#235347] leading-relaxed max-w-xs mx-auto">
          This module has been temporarily paused by the <strong>System SuperAdmin</strong>. Access will resume once maintenance is completed.
        </p>
      </div>

      <button
        type="button"
        onClick={onBack || (() => setActiveTab('home'))}
        className="mt-2 py-2.5 px-5 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
      >
        <ArrowLeft size={16} />
        <span>Return to Home</span>
      </button>
    </div>
  );
};

export default ModulePausedNotice;
