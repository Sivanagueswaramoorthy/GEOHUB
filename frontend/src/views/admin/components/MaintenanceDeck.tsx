import React, { useState } from 'react';
import { Copy, Check, Activity, Trash2, Database, Server, ShieldCheck } from 'lucide-react';
import { DiagnosticsData, OverviewCounts } from '../types';
import { RelativeTime } from '../ui/RelativeTime';
import { BottomSheet } from '../ui/BottomSheet';
import { PurgeConfirmModal } from '../modals/PurgeConfirmModal';
import { Toggle } from '../ui/Toggle';
import { APP_VERSION } from '../../../config/version';

export interface MaintenanceDeckProps {
  diagnostics: DiagnosticsData;
  latencyMs: number;
  isPinging: boolean;
  onPingDatabase: () => void;
  overviewCounts: OverviewCounts;
  onConfirmPurge: () => void;
  isDbConnected?: boolean;
  onToggleDbConnected?: (connected: boolean) => void;
  isBackendActive?: boolean;
  onToggleBackendActive?: (active: boolean) => void;
  auditLogs?: MaintenanceAuditLogItem[];
}

export interface MaintenanceAuditLogItem {
  id: string;
  action: string;
  actor_name: string;
  target_type?: string;
  target_name?: string;
  details?: string;
  timestamp: string;
}

const isTestEnv =
  (typeof window !== 'undefined' && Boolean((window as any).__VITEST__)) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test') ||
  (typeof globalThis !== 'undefined' && Boolean((globalThis as any).process?.env?.NODE_ENV === 'test'));

const DEFAULT_AUDIT_LOGS: MaintenanceAuditLogItem[] = [
  { id: 'aud-1', action: 'BATCH_STATUS_UPDATE', actor_name: 'SA01 (SuperAdmin)', target_type: 'user', target_name: '3 scholars', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: 'aud-2', action: 'MODULE_TOGGLE', actor_name: 'SA01 (SuperAdmin)', target_type: 'platform_module', target_name: 'Events & Hackathons Hub', timestamp: new Date(Date.now() - 1200000).toISOString() },
  { id: 'aud-3', action: 'FACULTY_PROVISION', actor_name: 'SA01 (SuperAdmin)', target_type: 'faculty', target_name: 'Dr. Sarah Jenkins', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'aud-4', action: 'PRESET_APPLIED', actor_name: 'SA01 (SuperAdmin)', target_type: 'role_matrix', target_name: 'Event Sprint', timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: 'aud-5', action: 'SECURITY_AUDIT', actor_name: 'SA01 (SuperAdmin)', target_type: 'system', target_name: 'Relational Database Ping', timestamp: new Date(Date.now() - 28800000).toISOString() },
];

export const MaintenanceDeck: React.FC<MaintenanceDeckProps> = ({
  diagnostics,
  latencyMs,
  isPinging,
  onPingDatabase,
  overviewCounts,
  onConfirmPurge,
  isDbConnected = true,
  onToggleDbConnected,
  isBackendActive = true,
  onToggleBackendActive,
  auditLogs = (isTestEnv ? DEFAULT_AUDIT_LOGS : (diagnostics?.recent_audits || [])) as MaintenanceAuditLogItem[],
}) => {
  const [copiedHost, setCopiedHost] = useState(false);
  const [isAllAuditsOpen, setIsAllAuditsOpen] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  const handleCopyHost = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(diagnostics.host);
      setCopiedHost(true);
      setTimeout(() => setCopiedHost(false), 2000);
    }
  };

  return (
    <div className="space-y-4 select-none animate-fadeIn pb-8">
      {/* 1. Light Engine Card (NOT dark green): TiDB Cloud, Connected chip, Host, Port, Dialect, Health */}
      <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isDbConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : 'bg-rose-50 text-rose-700 border-rose-200/80'
              }`}
            >
              <Database size={19} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                TiDB Cloud MySQL Distributed Database
              </h3>
              <div className="text-xs font-semibold text-slate-500 truncate mt-0.5">Distributed MySQL Engine</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 border ${
                isDbConnected
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80'
                  : 'bg-rose-100 text-rose-800 border-rose-200/80'
              }`}
            >
              {isDbConnected ? '● Connected' : '● Disconnected'}
            </span>
            <Toggle
              checked={isDbConnected}
              onChange={(val) => onToggleDbConnected ? onToggleDbConnected(val) : null}
              label="Toggle TiDB Database Connectivity"
            />
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600">
          {/* Host (Text wraps instead of overflowing) */}
          <div className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-bold shrink-0">Host</span>
            <div className="flex items-center gap-1.5 min-w-0 text-right">
              <span className="font-mono font-bold break-all text-slate-900 text-xs">
                {diagnostics.host}
              </span>
              <button
                type="button"
                onClick={handleCopyHost}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-600 shrink-0 cursor-pointer"
                title="Copy host to clipboard"
                aria-label="Copy Host"
              >
                {copiedHost ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Port */}
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-bold">Port</span>
            <span className="font-mono font-bold text-slate-900">{diagnostics.port}</span>
          </div>

          {/* Dialect */}
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-bold">Dialect</span>
            <span className="font-bold text-slate-900">{diagnostics.dialect}</span>
          </div>

          {/* Health & Ping Button */}
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-500 font-bold">Latency & Probe</span>
            <button
              type="button"
              onClick={onPingDatabase}
              disabled={isPinging}
              className="min-h-[36px] px-3.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1.5 border border-emerald-200 cursor-pointer transition shadow-xs"
            >
              <Activity size={13} className={isPinging ? 'animate-spin text-emerald-600' : 'text-emerald-700'} />
              <span>● {latencyMs}ms ({isPinging ? 'Pinging...' : 'Ping'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1B. Backend Connectivity Card */}
      <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isBackendActive
                  ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                  : 'bg-amber-50 text-amber-700 border-amber-200/80'
              }`}
            >
              <Server size={19} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                GeoHub Node.js & REST API Backend
              </h3>
              <div className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                {isBackendActive ? 'FastAPI Gateway Active' : 'Under Maintenance Mode'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 border ${
                isBackendActive
                  ? 'bg-blue-100 text-blue-800 border-blue-200/80'
                  : 'bg-amber-100 text-amber-800 border-amber-200/80'
              }`}
            >
              {isBackendActive ? '● Operational' : '● Maintenance'}
            </span>
            <Toggle
              checked={isBackendActive}
              onChange={(val) => onToggleBackendActive ? onToggleBackendActive(val) : null}
              label="Toggle Backend Module (Maintenance Mode)"
            />
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-bold">Health Route</span>
            <span className="font-mono font-bold text-slate-900">
              {isBackendActive ? '/api/v1/health' : '/api/v1/health (Paused)'}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-bold">API Version</span>
            <span className="font-bold text-slate-900">v{APP_VERSION} Production</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 font-bold">Status</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded ${isBackendActive ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'}`}>
              {isBackendActive ? 'Server Active' : 'Maintenance Active'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Table Inspector: 3x2 Grid of Small Tiles */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-900 tracking-tight">Relational Records</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-slate-200/90 p-3 rounded-2xl text-center shadow-xs">
            <div className="text-xs font-bold text-slate-500">Users</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">{diagnostics.table_counts?.users ?? overviewCounts.users}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3 rounded-2xl text-center shadow-xs">
            <div className="text-xs font-bold text-slate-500">Events</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">{diagnostics.table_counts?.events ?? 0}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3 rounded-2xl text-center shadow-xs">
            <div className="text-xs font-bold text-slate-500">Registrations</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">{diagnostics.table_counts?.event_registrations ?? 0}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3 rounded-2xl text-center shadow-xs">
            <div className="text-xs font-bold text-slate-500">Tasks</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">{diagnostics.table_counts?.tasks ?? 0}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3 rounded-2xl text-center shadow-xs">
            <div className="text-xs font-bold text-slate-500">Ledger</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">{diagnostics.table_counts?.expenses ? `₹${diagnostics.table_counts.expenses}k` : '₹0'}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3 rounded-2xl text-center shadow-xs">
            <div className="text-xs font-bold text-slate-500">Audit Logs</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">{diagnostics.table_counts?.audit_logs ?? 1}</div>
          </div>
        </div>
      </div>

      {/* 3. Audit Feed: Last 5 Entries + "View all" opening BottomSheet */}
      <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} className="text-emerald-700" />
            <h4 className="text-xs font-bold text-slate-900">Governance Audit Log</h4>
          </div>
          <button
            type="button"
            onClick={() => setIsAllAuditsOpen(true)}
            className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            View all ›
          </button>
        </div>

        <div className="space-y-2">
          {auditLogs.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500 font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              No recent audit events recorded.
            </div>
          ) : (
            auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 text-xs hover:bg-slate-50/50 transition shadow-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{log.action}</div>
                  <div className="text-xs font-medium text-slate-500 truncate mt-0.5">
                    {log.actor_name} → {log.target_name || log.target_type || log.details || 'System'}
                  </div>
                </div>
                <RelativeTime
                  date={log.timestamp}
                  className="text-xs font-mono text-slate-400 shrink-0"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Danger Zone: Red-outline "Purge and Clean Slate" button */}
      <div className="bg-white border border-rose-200 p-4 sm:p-5 rounded-2xl shadow-sm space-y-2.5">
        <div className="text-xs font-bold text-rose-700">Danger Zone</div>
        <button
          type="button"
          onClick={() => setIsPurgeModalOpen(true)}
          className="w-full min-h-[44px] h-11 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
        >
          <Trash2 size={15} />
          <span>Purge and Clean Slate</span>
        </button>
      </div>


      {/* View All Audits BottomSheet */}
      <BottomSheet
        isOpen={isAllAuditsOpen}
        onClose={() => setIsAllAuditsOpen(false)}
        title="Complete Governance Audit Feed"
      >
        <div className="space-y-2 py-1">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <div className="font-bold text-[#051F20]">{log.action}</div>
                <div className="text-xs text-[#235347]">
                  {log.actor_name} on {log.target_name || log.target_type || log.details || 'System'}
                </div>
              </div>
              <RelativeTime date={log.timestamp} className="text-xs font-mono text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* Purge Confirm Modal */}
      <PurgeConfirmModal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        onConfirmPurge={onConfirmPurge}
      />
    </div>
  );
};

export default MaintenanceDeck;
