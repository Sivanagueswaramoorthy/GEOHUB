import React from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { AuditRecord } from './audit.types';

interface AuditHeaderProps {
  audit: AuditRecord;
  onBack: () => void;
  onOpenPortal: () => void;
  onOpenSealDialog: () => void;
}

export const AuditHeader: React.FC<AuditHeaderProps> = ({
  audit,
  onBack,
  onOpenPortal,
  onOpenSealDialog,
}) => {
  const getStatusBadge = () => {
    if (audit.isSealed) {
      return {
        label: 'Sealed & Endorsed',
        bg: '#DAF1DE',
        border: '#8EB69B',
        text: '#163832',
        icon: ShieldCheck,
      };
    }

    switch (audit.status) {
      case 'Verified':
        return {
          label: 'Verified',
          bg: '#DAF1DE',
          border: '#8EB69B',
          text: '#163832',
          icon: CheckCircle2,
        };
      case 'Synchronized':
        return {
          label: 'Synchronized',
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#1D4ED8',
          icon: CheckCircle2,
        };
      case 'Action Required':
        return {
          label: 'Action Required',
          bg: '#FEF3C7',
          border: '#FDE68A',
          text: '#92400E',
          icon: AlertCircle,
        };
      default:
        return {
          label: audit.status || 'Active',
          bg: '#F8FAFC',
          border: '#E2E8F0',
          text: '#475569',
          icon: Clock,
        };
    }
  };

  const statusInfo = getStatusBadge();
  const StatusIcon = statusInfo.icon;

  return (
    <header className="audit-sticky-header">
      {/* Top Breadcrumb & Back Row */}
      <div className="audit-nav-row">
        <button
          type="button"
          onClick={onBack}
          className="audit-back-btn"
          aria-label="Back to Audits"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          <span>Back to Audits</span>
        </button>

        <nav aria-label="Breadcrumb" className="audit-breadcrumb">
          <button
            type="button"
            onClick={onBack}
            className="audit-breadcrumb-link"
          >
            Dashboard
          </button>
          <ChevronRight size={13} className="audit-breadcrumb-sep" />
          <button
            type="button"
            onClick={onBack}
            className="audit-breadcrumb-link"
          >
            Portal Audits
          </button>
          <ChevronRight size={13} className="audit-breadcrumb-sep" />
          <span className="audit-breadcrumb-current" aria-current="page">
            {audit.moduleTitle}
          </span>
        </nav>
      </div>

      {/* Main Title & Action Bar Row */}
      <div className="audit-header-main">
        <div className="audit-title-block">
          <div className="audit-title-line">
            <h1 className="audit-main-title">
              Portal Audit: {audit.moduleTitle}
            </h1>
            <span
              className="audit-status-badge"
              style={{
                backgroundColor: statusInfo.bg,
                borderColor: statusInfo.border,
                color: statusInfo.text,
              }}
            >
              <StatusIcon size={13} strokeWidth={2.2} />
              <span>{statusInfo.label}</span>
            </span>
          </div>

          <p className="audit-subtitle">
            <span className="audit-subtitle-dept">{audit.department}</span>
            <span className="audit-bullet">•</span>
            <span>Updated by <strong className="text-slate-800">{audit.leadName}</strong></span>
            <span className="audit-bullet">•</span>
            <span className="audit-time-pill">{audit.timeAgo}</span>
          </p>
        </div>

        {/* Action Buttons (Desktop top right, responsive) */}
        <div className="audit-actions-desktop">
          <button
            type="button"
            onClick={onOpenSealDialog}
            disabled={audit.isSealed}
            className={`audit-btn-secondary ${audit.isSealed ? 'opacity-60 cursor-not-allowed' : ''}`}
            title="Acknowledge and digitally sign this chapter update"
          >
            <ShieldCheck size={16} strokeWidth={2.2} className="text-emerald-700" />
            <span>{audit.isSealed ? 'Update Sealed' : 'Acknowledge & Seal Update'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenPortal}
            className="audit-btn-primary"
            title={`Navigate directly to ${audit.moduleTitle} operational dashboard`}
          >
            <ExternalLink size={15} strokeWidth={2.2} />
            <span>Open in Portal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
