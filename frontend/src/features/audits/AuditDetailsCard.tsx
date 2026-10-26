import React from 'react';
import {
  FileText,
  Hash,
  Layers,
  Activity,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { AuditRecord } from './audit.types';

interface AuditDetailsCardProps {
  audit: AuditRecord;
}

export const AuditDetailsCard: React.FC<AuditDetailsCardProps> = ({ audit }) => {
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

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  const detailRows = [
    {
      label: 'Audit Ref',
      value: audit.auditRef,
      icon: Hash,
      highlight: true,
    },
    {
      label: 'Category',
      value: audit.category,
      icon: Layers,
    },
    {
      label: 'Status',
      value: status.label,
      icon: Activity,
      customRender: (
        <span
          className="audit-details-status-chip"
          style={{
            backgroundColor: status.bg,
            borderColor: status.border,
            color: status.text,
          }}
        >
          <StatusIcon size={12} strokeWidth={2.4} />
          <span>{status.label}</span>
        </span>
      ),
    },
    {
      label: 'Last Synced',
      value: audit.lastSynced,
      icon: Calendar,
    },
    {
      label: audit.metric ? (audit.metric.toLowerCase().includes('bulletin') ? 'Bulletin # Live' : 'Active Index') : 'Module Status',
      value: audit.metric || 'Operating Normally',
      icon: Sparkles,
      isGreenMetric: true,
    },
  ];

  return (
    <section className="audit-card audit-details-card" aria-labelledby="details-heading">
      <div className="audit-card-header">
        <div className="flex items-center gap-2">
          <div className="audit-card-icon-wrap">
            <FileText size={16} strokeWidth={2.4} className="text-emerald-700" />
          </div>
          <span id="details-heading" className="audit-section-label">
            Audit Details
          </span>
        </div>
      </div>

      <div className="audit-details-list">
        {detailRows.map((row, idx) => {
          const Icon = row.icon;
          return (
            <div key={idx} className="audit-detail-row">
              <div className="audit-detail-label-group">
                <Icon size={14} className="text-slate-400 shrink-0" />
                <span className="audit-detail-label">{row.label}</span>
              </div>

              <div className="audit-detail-value-group">
                {row.customRender ? (
                  row.customRender
                ) : row.isGreenMetric ? (
                  <span className="audit-detail-metric-chip">
                    {row.value}
                  </span>
                ) : row.highlight ? (
                  <span className="audit-detail-code">
                    {row.value}
                  </span>
                ) : (
                  <span className="audit-detail-text">
                    {row.value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
