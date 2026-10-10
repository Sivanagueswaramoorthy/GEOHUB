import React, { useState } from 'react';
import { Check, X, ShieldCheck, DollarSign, Calendar, UserCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusChip } from '../../components/common/StatusChip';
import { Modal } from '../../components/common/Modal';
import { ApprovalType } from '../../types';

export const ApprovalsView: React.FC = () => {
  const { approvals, approveItem, rejectItem } = useApp();
  const [activeTab, setActiveTab] = useState<ApprovalType | 'all'>('all');

  const [rejectModalItem, setRejectModalItem] = useState<{ id: string; title: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredItems = approvals.filter((item) => {
    if (activeTab !== 'all' && item.type !== activeTab) return false;
    return true;
  });

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalItem) return;
    rejectItem(rejectModalItem.id, rejectionReason || 'Declined by club administration');
    setRejectModalItem(null);
    setRejectionReason('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar size={20} strokeWidth={1.75} color="#0F766E" />;
      case 'budget':
        return <DollarSign size={20} strokeWidth={1.75} color="#16A34A" />;
      case 'join_request':
      default:
        return <UserCheck size={20} strokeWidth={1.75} color="#2563EB" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
          Approvals Hub
        </h1>
      </div>

      {/* Tabs */}
      <div className="pill-tabs">
        <button
          className={`pill-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({approvals.length})
        </button>
        <button
          className={`pill-tab ${activeTab === 'event' ? 'active' : ''}`}
          onClick={() => setActiveTab('event')}
        >
          Events ({approvals.filter((a) => a.type === 'event').length})
        </button>
        <button
          className={`pill-tab ${activeTab === 'join_request' ? 'active' : ''}`}
          onClick={() => setActiveTab('join_request')}
        >
          Join Requests ({approvals.filter((a) => a.type === 'join_request').length})
        </button>
        <button
          className={`pill-tab ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          Budgets ({approvals.filter((a) => a.type === 'budget').length})
        </button>
      </div>

      {/* Items List */}
      <div>
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={48} strokeWidth={1.75} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>No approvals pending</h3>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              All submissions in this category have been processed.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="app-card"
              style={{
                marginBottom: '12px',
                borderLeft:
                  item.status === 'approved'
                    ? '4px solid #16A34A'
                    : item.status === 'rejected'
                    ? '4px solid #DC2626'
                    : '4px solid #D97706',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                      {item.type.replace('_', ' ')}
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                      {item.title}
                    </h3>
                  </div>
                </div>
                <StatusChip status={item.status} />
              </div>

              <div style={{ fontSize: '12px', color: '#0F766E', fontWeight: 600, marginBottom: '6px' }}>
                {item.subtitle}
              </div>

              {item.details && (
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.4, marginBottom: '12px' }}>
                  {item.details}
                </p>
              )}

              {item.requestedBudget && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#16A34A',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                  }}
                >
                  <DollarSign size={16} strokeWidth={1.75} /> Requested: ${item.requestedBudget.toLocaleString()}
                </div>
              )}

              {item.status === 'rejected' && item.rejectionReason && (
                <div style={{ fontSize: '12px', color: '#DC2626', backgroundColor: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', marginBottom: '10px' }}>
                  <strong>Reason:</strong> {item.rejectionReason}
                </div>
              )}

              {item.status === 'approved' && item.reviewedBy && (
                <div style={{ fontSize: '12px', color: '#16A34A', marginBottom: '8px' }}>
                  Approved by {item.reviewedBy} on {new Date(item.reviewedAt || Date.now()).toLocaleDateString()}
                </div>
              )}

              {/* Action Buttons if Pending */}
              {item.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #E8ECF2', paddingTop: '12px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => approveItem(item.id)}
                  >
                    <Check size={16} /> Approve Proposal
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#DC2626' }}
                    onClick={() => setRejectModalItem({ id: item.id, title: item.title })}
                  >
                    <X size={16} /> Decline
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Decline Reason Modal */}
      <Modal
        isOpen={rejectModalItem !== null}
        onClose={() => setRejectModalItem(null)}
        title="Decline Submission"
        subtitle={`Specify rationale for refusing "${rejectModalItem?.title}"`}
      >
        <form onSubmit={handleConfirmReject}>
          <div className="input-group">
            <label className="input-label">Administrative Rejection Notes</label>
            <textarea
              className="input-field"
              rows={3}
              required
              placeholder="e.g. Exceeds semester budget allocations, schedule clash with university exams..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-danger btn-block">
            Confirm Rejection
          </button>
        </form>
      </Modal>
    </div>
  );
};
