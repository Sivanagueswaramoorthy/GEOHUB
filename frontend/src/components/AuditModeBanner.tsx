import React from 'react';
import { ShieldCheck, Eye, ArrowRight } from 'lucide-react';

export interface AuditModeBannerProps {
  moduleName: string;
  operatedByRole: string;
  actionRestrictions?: string;
  onFacultyActionClick?: () => void;
  facultyActionLabel?: string;
}

export const AuditModeBanner: React.FC<AuditModeBannerProps> = ({
  moduleName,
  operatedByRole,
  actionRestrictions,
  onFacultyActionClick,
  facultyActionLabel,
}) => {
  return (
    <div
      className="p-3.5 rounded-2xl border transition-all shadow-2xs"
      style={{
        backgroundColor: '#F6FBF7',
        borderColor: '#DAF1DE',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
        >
          <ShieldCheck size={18} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-xs text-slate-900 tracking-tight">
              Institutional Audit Mode
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: '#DAF1DE',
                color: '#163832',
                border: '1px solid #8EB69B',
              }}
            >
              Super Admin • Read-Only
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            You have full institutional oversight of <strong className="text-slate-800">{moduleName}</strong>.
            Entries, editing, and uploads are operated by the <strong className="text-slate-800">{operatedByRole}</strong>.
            {actionRestrictions && ` ${actionRestrictions}`}
          </p>

          {onFacultyActionClick && facultyActionLabel && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={onFacultyActionClick}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163832] hover:text-[#0B2B26] hover:underline cursor-pointer"
              >
                <span>{facultyActionLabel}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-700 text-xs font-bold shrink-0">
          <Eye size={12} strokeWidth={2} />
          <span>Auditor</span>
        </div>
      </div>
    </div>
  );
};
