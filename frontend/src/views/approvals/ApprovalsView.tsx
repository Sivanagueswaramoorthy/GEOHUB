import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  SegmentedTabs,
  PillButton,
  StatusChip,
  Avatar,
  EmptyState,
  ConfirmDialog,
} from '../../components/shared';

export const ApprovalsView: React.FC = () => {
  const { approvals, approveItem, rejectItem } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [rejectItemTarget, setRejectItemTarget] = useState<{ id: string; title: string } | null>(null);

  const filteredItems = approvals.filter((item) => {
    if (activeTab !== 'all' && item.type !== activeTab) return false;
    return true;
  });

  const handleConfirmReject = (reason?: string) => {
    if (!rejectItemTarget) return;
    rejectItem(rejectItemTarget.id, reason || 'Declined by administration');
    setRejectItemTarget(null);
  };

  const tabs = [
    { key: 'all', label: `All (${approvals.length})` },
    { key: 'event', label: `Events (${approvals.filter((a) => a.type === 'event').length})` },
    { key: 'budget', label: `Budget (${approvals.filter((a) => a.type === 'budget').length})` },
    { key: 'join_request', label: `Squads (${approvals.filter((a) => a.type === 'join_request').length})` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      {/* Micro-copy: 1 headline (2-4 words), 1 subtitle (< 6 words) */}
      <div>
        <h1
          style={{
            fontSize: '28px',
            lineHeight: '32px',
            fontWeight: 800,
            color: '#051F20',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Approvals
        </h1>
        <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
          Sanction proposals & budget
        </p>
      </div>

      {/* SegmentedTabs */}
      <SegmentedTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredItems.length === 0 ? (
          <EmptyState
            mascot="shield"
            title="All cleared"
            description="No pending proposals to review"
          />
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #DAF1DE',
                padding: '18px 20px',
                boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Header: Requester Avatar + 1-line title + StatusChip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <Avatar name={item.applicantName || 'Scholar'} size={40} />
                  <div style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#051F20',
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                      className="truncate"
                    >
                      {item.title}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#235347', fontWeight: 500 }} className="truncate">
                      {item.applicantName || 'Scholar'} • {item.subtitle || new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <StatusChip status={item.status as any} />
              </div>

              {/* Amount / Meta Pill */}
              {item.requestedBudget && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#0B2B26',
                      backgroundColor: '#DAF1DE',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      border: '1px solid #8EB69B',
                    }}
                  >
                    Requested: ₹{item.requestedBudget.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Action Buttons if Pending */}
              {item.status === 'pending' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid #DAF1DE',
                  }}
                >
                  <PillButton
                    variant="primary"
                    fullWidth
                    onClick={() => approveItem(item.id)}
                  >
                    Approve
                  </PillButton>
                  <PillButton
                    variant="destructive"
                    onClick={() => setRejectItemTarget({ id: item.id, title: item.title })}
                  >
                    Reject
                  </PillButton>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Required-Reason Rejection ConfirmDialog */}
      <ConfirmDialog
        isOpen={rejectItemTarget !== null}
        onClose={() => setRejectItemTarget(null)}
        onConfirm={handleConfirmReject}
        title="Reject Proposal"
        message={`Specify the official reason for declining "${rejectItemTarget?.title}".`}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        variant="destructive"
        requireReason={true}
        reasonPlaceholder="e.g. Budget exceeds ceiling, reschedule required..."
      />
    </div>
  );
};

export default ApprovalsView;
