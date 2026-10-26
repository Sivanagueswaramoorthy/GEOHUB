import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditRecord } from './audit.types';
import { getAuditById, sealAuditRecord } from './audit.data';
import { AuditHeader } from './AuditHeader';
import { LatestActionCard } from './LatestActionCard';
import { OwnerCard } from './OwnerCard';
import { AuditDetailsCard } from './AuditDetailsCard';
import { ActivityTimeline } from './ActivityTimeline';
import { AuditConfirmationDialog } from './AuditConfirmationDialog';
import './audit.css';

interface AuditDetailPageProps {
  auditId?: string;
  onNavigateBack?: () => void;
}

export const AuditDetailPage: React.FC<AuditDetailPageProps> = ({
  auditId = 'daily-news-bulletin',
  onNavigateBack,
}) => {
  const { setActiveTab, showToast, currentUser } = useApp();

  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal confirmation state for sealing record (the ONLY allowed modal dialog)
  const [isSealDialogOpen, setIsSealDialogOpen] = useState<boolean>(false);
  const [isSealing, setIsSealing] = useState<boolean>(false);

  const loadAuditData = () => {
    setIsLoading(true);
    setError(null);

    // Simulate clean network retrieval (180ms) for high-fidelity skeleton UX
    const timer = setTimeout(() => {
      const data = getAuditById(auditId);
      if (data) {
        setAudit({ ...data });
        setError(null);
      } else {
        setAudit(null);
        setError(`Audit record "${auditId}" could not be located in chapter archives.`);
      }
      setIsLoading(false);
    }, 180);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    loadAuditData();
  }, [auditId]);

  // Handle back navigation
  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setActiveTab('operations');
    }
  };

  // Open corresponding portal module
  const handleOpenPortal = () => {
    if (!audit) return;
    if (audit.targetTab) {
      setActiveTab(audit.targetTab);
    } else {
      setActiveTab('operations');
    }
  };

  // Confirm seal action
  const handleConfirmSeal = async () => {
    if (!audit) return;
    setIsSealing(true);

    try {
      // Simulate cryptographic ledger sealing
      await new Promise((resolve) => setTimeout(resolve, 400));
      const facultyName = currentUser?.name || 'Dr. Sarah Jenkins (Faculty Advisor)';
      const updated = sealAuditRecord(audit.slug || audit.id, facultyName);

      if (updated) {
        setAudit({ ...updated });
        setIsSealDialogOpen(false);
        showToast(
          `Record ${updated.auditRef} acknowledged & digitally sealed successfully!`,
          'success'
        );
      }
    } catch {
      showToast('Failed to seal audit record. Please retry.', 'error');
    } finally {
      setIsSealing(false);
    }
  };

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="audit-page-wrapper">
        <div className="audit-page-container">
          {/* Skeleton Header */}
          <div className="audit-skeleton-header">
            <div className="audit-skeleton-row w-48 h-4 mb-3" />
            <div className="audit-skeleton-row w-3/4 h-8 mb-2" />
            <div className="audit-skeleton-row w-1/2 h-4" />
          </div>

          {/* Skeleton 2-column grid */}
          <div className="audit-grid">
            <div className="audit-main-column">
              <div className="audit-skeleton-card h-44 mb-6" />
              <div className="audit-skeleton-card h-80" />
            </div>
            <div className="audit-sidebar-column">
              <div className="audit-skeleton-card h-48 mb-6" />
              <div className="audit-skeleton-card h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error / Empty State with Retry
  if (error || !audit) {
    return (
      <div className="audit-page-wrapper">
        <div className="audit-page-container">
          <div className="audit-error-card">
            <div className="audit-error-icon-box">
              <AlertCircle size={32} className="text-amber-600" />
            </div>
            <h2 className="audit-error-title">Audit Record Not Found</h2>
            <p className="audit-error-desc">
              {error || 'Unable to retrieve portal audit details for this module.'}
            </p>
            <div className="audit-error-actions">
              <button
                type="button"
                onClick={loadAuditData}
                className="audit-btn-primary flex items-center gap-2"
              >
                <RotateCcw size={16} />
                <span>Retry Loading</span>
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="audit-btn-secondary flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                <span>Back to Operations</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Full-Page Audit Detail View
  return (
    <div className="audit-page-wrapper">
      <div className="audit-page-container">
        {/* Sticky Top Header with Breadcrumbs, Title, Subtitle, and Desktop Actions */}
        <AuditHeader
          audit={audit}
          onBack={handleBack}
          onOpenPortal={handleOpenPortal}
          onOpenSealDialog={() => setIsSealDialogOpen(true)}
        />

        {/* Two-Column Responsive Grid (Desktop 2/3 + 1/3, Mobile 1-Column) */}
        <div className="audit-grid">
          {/* LEFT: Main Column (2/3 desktop) */}
          <div className="audit-main-column">
            {/* Latest Action Card (Quotation cleaned, no doubled quotes) */}
            <LatestActionCard audit={audit} />

            {/* Activity Timeline Card */}
            <ActivityTimeline timeline={audit.timeline || []} />
          </div>

          {/* RIGHT: Sidebar Column (1/3 desktop) */}
          <div className="audit-sidebar-column">
            {/* Record Owner & Lead Card */}
            <OwnerCard audit={audit} />

            {/* Audit Details Card */}
            <AuditDetailsCard audit={audit} />
          </div>
        </div>

        {/* Mobile Sticky Bottom Action Bar (visible on viewport <= 768px) */}
        <div className="audit-mobile-action-bar">
          <button
            type="button"
            onClick={() => setIsSealDialogOpen(true)}
            disabled={audit.isSealed}
            className={`audit-btn-secondary flex-1 py-2.5 text-xs font-semibold ${
              audit.isSealed ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <ShieldCheck size={16} className="text-emerald-700" />
            <span>{audit.isSealed ? 'Sealed' : 'Seal Update'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenPortal}
            className="audit-btn-primary flex-1 py-2.5 text-xs font-semibold"
          >
            <ExternalLink size={15} />
            <span>Open in Portal</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Sealing Record (Only allowed dialog) */}
      <AuditConfirmationDialog
        isOpen={isSealDialogOpen}
        audit={audit}
        isSealing={isSealing}
        onConfirm={handleConfirmSeal}
        onCancel={() => setIsSealDialogOpen(false)}
      />
    </div>
  );
};
