import React from 'react';
import { Activity, CheckCircle2, Hash, Sparkles } from 'lucide-react';
import { AuditRecord } from './audit.types';
import { cleanQuotedText } from './audit.data';

interface LatestActionCardProps {
  audit: AuditRecord;
}

export const LatestActionCard: React.FC<LatestActionCardProps> = ({ audit }) => {
  const cleanedActionTitle = cleanQuotedText(audit.updateText);

  return (
    <section className="audit-card latest-action-card" aria-labelledby="latest-action-heading">
      {/* Card Header */}
      <div className="audit-card-header">
        <div className="flex items-center gap-2">
          <div className="audit-card-icon-wrap">
            <Activity size={16} strokeWidth={2.4} className="text-emerald-700" />
          </div>
          <span id="latest-action-heading" className="audit-section-label">
            Latest Action in Respective Portal
          </span>
        </div>

        {audit.metric && (
          <span className="audit-metric-badge">
            <Sparkles size={12} className="text-emerald-600" />
            <span>{audit.metric}</span>
          </span>
        )}
      </div>

      {/* Main Action Title (Quotes cleaned, no double quotation bugs) */}
      <div className="latest-action-title-wrap">
        <h2 className="latest-action-title">
          {cleanedActionTitle}
        </h2>
      </div>

      {/* Detailed Narrative Description */}
      <div className="latest-action-desc-box">
        <p className="latest-action-desc">
          {audit.details}
        </p>
      </div>

      {/* Card Footer: Sync Status & Audit Ref */}
      <div className="latest-action-footer">
        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
          <CheckCircle2 size={15} strokeWidth={2.2} className="text-emerald-600 shrink-0" />
          <span>{audit.verifiedStatus || 'Synchronized with Chapter Database'}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-500 font-semibold text-xs bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
          <Hash size={12} className="text-slate-400" />
          <span>Audit Ref: <strong>{audit.auditRef}</strong></span>
        </div>
      </div>
    </section>
  );
};
