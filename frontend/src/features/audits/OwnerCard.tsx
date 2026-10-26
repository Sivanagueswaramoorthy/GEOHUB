import React from 'react';
import { User, Shield, Clock, Award, CheckCircle } from 'lucide-react';
import { AuditRecord } from './audit.types';

interface OwnerCardProps {
  audit: AuditRecord;
}

export const OwnerCard: React.FC<OwnerCardProps> = ({ audit }) => {
  // Generate initials e.g. "Aarav Patel" -> "AP"
  const getInitials = (name: string) => {
    if (!name) return 'AP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(audit.leadName);

  return (
    <section className="audit-card owner-card" aria-labelledby="owner-heading">
      <div className="audit-card-header">
        <div className="flex items-center gap-2">
          <div className="audit-card-icon-wrap">
            <User size={16} strokeWidth={2.4} className="text-emerald-700" />
          </div>
          <span id="owner-heading" className="audit-section-label">
            Record Owner & Lead
          </span>
        </div>

        <span className="audit-time-pill flex items-center gap-1">
          <Clock size={11} className="text-slate-400" />
          <span>{audit.timeAgo}</span>
        </span>
      </div>

      <div className="owner-profile-main">
        {/* Avatar with initials */}
        <div
          className="owner-avatar"
          style={{
            backgroundColor: audit.avatarBg || '#DAF1DE',
            color: audit.avatarColor || '#163832',
            borderColor: audit.avatarColor ? `${audit.avatarColor}33` : '#8EB69B',
          }}
          aria-hidden="true"
        >
          <span>{initials}</span>
        </div>

        {/* Lead Identity Details */}
        <div className="owner-info">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="owner-name">{audit.leadName}</h3>
            <span className="owner-role-badge">
              <Shield size={11} className="text-emerald-600" />
              <span>{audit.leadRole}</span>
            </span>
          </div>

          <p className="owner-dept-team">
            <span className="text-slate-700 font-semibold">{audit.department}</span>
            <span className="owner-bullet">•</span>
            <span className="owner-status-label flex items-center gap-1 text-emerald-700 font-medium inline-flex">
              <CheckCircle size={12} className="text-emerald-600 inline shrink-0" />
              Active Squad Leader
            </span>
          </p>
        </div>
      </div>

      <div className="owner-meta-footer">
        <div className="owner-meta-pill">
          <Award size={13} className="text-emerald-600 shrink-0" />
          <span className="text-xs text-slate-600">
            Sign-off authority for <strong>{audit.domain || 'Operational Documentation'}</strong>
          </span>
        </div>
      </div>
    </section>
  );
};
