import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRolePermissions } from '../../core/permissions';
import { AuditLogItem } from '../../types';
import {
  Avatar,
  PillButton,
  StatusChip,
  EmptyState,
} from '../../components/shared';

export const AuditLogView: React.FC = () => {
  const { currentUser, auditLogs } = useApp();
  const perms = getRolePermissions(currentUser.role);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [remoteLogs, setRemoteLogs] = useState<AuditLogItem[]>([]);

  // Fetch backend audit logs if available
  useEffect(() => {
    if (!perms.canViewAuditLog) return;
    const fetchLogs = async () => {
      try {
        const resp = await fetch('http://localhost:8000/audit-logs');
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data)) {
            const mapped: AuditLogItem[] = data.map((d: any) => ({
              id: d.id,
              actorId: d.actor_id,
              actorName: d.actor_name,
              actorRole: d.actor_role,
              action: d.action,
              targetType: d.target_type,
              targetId: d.target_id,
              targetName: d.target_name,
              beforeState: d.before_state,
              afterState: d.after_state,
              details: d.details,
              timestamp: d.timestamp,
            }));
            setRemoteLogs(mapped);
          }
        }
      } catch {
        // Fallback to in-memory context logs
      }
    };
    fetchLogs();
  }, [perms.canViewAuditLog]);

  const combinedLogs = useMemo(() => {
    const list = [...remoteLogs];
    for (const log of auditLogs) {
      if (!list.some((r) => r.id === log.id)) {
        list.push(log);
      }
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [remoteLogs, auditLogs]);

  // Deny-by-default access gate
  if (!perms.canViewAuditLog) {
    return (
      <div style={{ padding: '40px 0' }}>
        <EmptyState
          mascot="lock"
          title="No access"
          description="Clearance required for governance records"
        />
      </div>
    );
  }

  // Filter pills: Approvals / Role Changes / Scanner Scans / Budget Requests
  const filterPills = [
    { key: 'all', label: 'All' },
    { key: 'approval', label: 'Approvals' },
    { key: 'role', label: 'Role Changes' },
    { key: 'scan', label: 'Scanner Scans' },
    { key: 'budget', label: 'Budget Requests' },
  ];

  const filteredLogs = combinedLogs.filter((item) => {
    if (selectedFilter === 'approval') {
      const act = item.action.toLowerCase();
      if (!act.includes('approve') && !act.includes('reject')) return false;
    } else if (selectedFilter === 'role') {
      const act = item.action.toLowerCase();
      if (!act.includes('role') && !act.includes('post') && !act.includes('promote')) return false;
    } else if (selectedFilter === 'scan') {
      const act = item.action.toLowerCase();
      if (!act.includes('scan') && !act.includes('check_in')) return false;
    } else if (selectedFilter === 'budget') {
      const act = item.action.toLowerCase();
      if (!act.includes('budget') && !act.includes('expense')) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchActor = item.actorName.toLowerCase().includes(q);
      const matchAction = item.action.toLowerCase().includes(q);
      const matchTarget = (item.targetName || '').toLowerCase().includes(q);
      const matchDetails = (item.details || '').toLowerCase().includes(q);
      if (!matchActor && !matchAction && !matchTarget && !matchDetails) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Target', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.actorName}"`,
      l.actorRole,
      `"${l.action}"`,
      `"${l.targetName || l.targetType}"`,
      `"${l.details || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GeoHub_Audit_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      {/* Micro-copy: 1 headline (2-4 words), 1 subtitle (< 6 words) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
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
            Audit Ledger
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Immutable governance records
          </p>
        </div>

        <PillButton
          icon={<Download size={16} />}
          variant="primary"
          onClick={handleExportCSV}
        >
          Export
        </PillButton>
      </div>

      {/* Dark pine gradient banner (#0B2B26 to #163832) with shield icon and record count badge */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B2B26 0%, #163832 100%)',
          borderRadius: '32px',
          padding: '24px',
          color: '#FFFFFF',
          boxShadow: '0 10px 30px rgba(5,31,32,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(218, 241, 222, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DAF1DE',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Governance Records
            </h3>
            <p style={{ fontSize: '12px', color: '#DAF1DE', margin: '2px 0 0 0', opacity: 0.9 }}>
              Cryptographically verified audit trail
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: '#DAF1DE',
            color: '#051F20',
            flexShrink: 0,
          }}
        >
          {combinedLogs.length} Records
        </span>
      </div>

      {/* Filter pills & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Filter pills: Approvals / Role Changes / Scanner Scans / Budget Requests */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
          {filterPills.map((fp) => {
            const isActive = selectedFilter === fp.key;
            return (
              <button
                type="button"
                key={fp.key}
                onClick={() => setSelectedFilter(fp.key)}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: isActive ? '#163832' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#235347',
                  border: isActive ? '1px solid #163832' : '1px solid #DAF1DE',
                  boxShadow: isActive ? '0 4px 14px rgba(5,31,32,0.12)' : '0 2px 8px rgba(5,31,32,0.04)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 200ms ease-out',
                  flexShrink: 0,
                }}
              >
                {fp.label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            style={{
              width: '100%',
              height: '44px',
              boxSizing: 'border-box',
              paddingLeft: '40px',
              paddingRight: '14px',
              fontSize: '13px',
              color: '#051F20',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DAF1DE',
              borderRadius: '16px',
              outline: 'none',
              boxShadow: '0 4px 14px rgba(5,31,32,0.03)',
            }}
            placeholder="Search by actor, action, or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={18}
            strokeWidth={2}
            color="#8EB69B"
            style={{ position: 'absolute', left: 14, top: 13 }}
          />
        </div>
      </div>

      {/* Rows with actor avatar, action badge, target, exact timestamp, expandable diff card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredLogs.length === 0 ? (
          <EmptyState
            mascot="shield"
            title="No records"
            description="Audit events will appear here"
          />
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const hasDiff = Boolean(log.beforeState || log.afterState || log.details);

            return (
              <div
                key={log.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1px solid #DAF1DE',
                  padding: '16px 18px',
                  boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <Avatar name={log.actorName} size={40} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#051F20' }}>
                          {log.actorName}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: '#DAF1DE',
                            color: '#163832',
                            border: '1px solid #8EB69B',
                          }}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px', fontWeight: 500 }} className="truncate">
                        Target: {log.targetName || log.targetType}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', color: '#235347', fontWeight: 600 }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8EB69B', marginTop: '2px' }}>
                      {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                {hasDiff && (
                  <button
                    type="button"
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      backgroundColor: '#F6FBF7',
                      border: '1px solid #DAF1DE',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#235347',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Audit Diff'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}

                {/* Expandable Before/After Diff Card */}
                {isExpanded && hasDiff && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '16px',
                      backgroundColor: '#F6FBF7',
                      border: '1px solid #DAF1DE',
                      fontSize: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {log.details && (
                      <div>
                        <span style={{ fontWeight: 700, color: '#051F20' }}>Details: </span>
                        <span style={{ color: '#235347' }}>{log.details}</span>
                      </div>
                    )}
                    {log.beforeState && (
                      <div>
                        <span style={{ fontWeight: 700, color: '#D9534F' }}>Before: </span>
                        <code style={{ color: '#051F20', backgroundColor: '#FFFFFF', padding: '2px 6px', borderRadius: '6px' }}>
                          {JSON.stringify(log.beforeState)}
                        </code>
                      </div>
                    )}
                    {log.afterState && (
                      <div>
                        <span style={{ fontWeight: 700, color: '#163832' }}>After: </span>
                        <code style={{ color: '#051F20', backgroundColor: '#FFFFFF', padding: '2px 6px', borderRadius: '6px' }}>
                          {JSON.stringify(log.afterState)}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AuditLogView;
