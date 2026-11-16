import React, { useState } from 'react';
import { Copy, Check, Activity, Trash2, Database, ShieldCheck } from 'lucide-react';
import { DiagnosticsData, OverviewCounts } from '../types';
import { RelativeTime } from '../ui/RelativeTime';
import { BottomSheet } from '../ui/BottomSheet';
import { PurgeConfirmModal } from '../modals/PurgeConfirmModal';

export interface MaintenanceDeckProps {
  diagnostics: DiagnosticsData;
  latencyMs: number;
  isPinging: boolean;
  onPingDatabase: () => void;
  overviewCounts: OverviewCounts;
  onConfirmPurge: () => void;
  auditLogs?: Array<{
    id: string;
    action: string;
    actor_name: string;
    target_type: string;
    target_name?: string;
    timestamp: string;
  }>;
}

const DEFAULT_AUDIT_LOGS = [
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
  auditLogs = DEFAULT_AUDIT_LOGS,
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
      <div className="bg-white border border-[#E3EEE6] p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E3EEE6]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#F0F5F2] text-[#235347] flex items-center justify-center shrink-0">
              <Database size={17} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#051F20] truncate">
                TiDB Cloud MySQL Distributed Database
              </h3>
              <div className="text-[11px] text-[#235347] truncate">Distributed MySQL Engine</div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] shrink-0 border border-[#8EB69B]/40">
            ● Connected
          </span>
        </div>

        <div className="space-y-2 text-xs text-[#235347]">
          {/* Host (Text wraps instead of overflowing) */}
          <div className="flex items-start justify-between gap-2 py-1 border-b border-[#E3EEE6]">
            <span className="text-slate-500 font-medium shrink-0">Host</span>
            <div className="flex items-center gap-1.5 min-w-0 text-right">
              <span className="font-mono font-semibold break-all text-[#051F20] text-[11px]">
                {diagnostics.host}
              </span>
              <button
                type="button"
                onClick={handleCopyHost}
                className="p-1 rounded-md hover:bg-[#F0F5F2] text-[#235347] shrink-0"
                title="Copy host to clipboard"
                aria-label="Copy Host"
              >
                {copiedHost ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Port */}
          <div className="flex items-center justify-between py-1 border-b border-[#E3EEE6]">
            <span className="text-slate-500 font-medium">Port</span>
            <span className="font-mono font-semibold text-[#051F20]">{diagnostics.port}</span>
          </div>

          {/* Dialect */}
          <div className="flex items-center justify-between py-1 border-b border-[#E3EEE6]">
            <span className="text-slate-500 font-medium">Dialect</span>
            <span className="font-semibold text-[#051F20]">{diagnostics.dialect}</span>
          </div>

          {/* Health & Ping Button */}
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 font-medium">Latency & Probe</span>
            <button
              type="button"
              onClick={onPingDatabase}
              disabled={isPinging}
              className="min-h-[36px] px-3 py-1 rounded-xl bg-[#F0F5F2] hover:bg-[#E3EEE6] text-[#051F20] font-mono font-bold text-xs flex items-center gap-1.5 border border-[#E3EEE6] cursor-pointer transition"
            >
              <Activity size={13} className={isPinging ? 'animate-spin text-emerald-600' : 'text-emerald-700'} />
              <span>● {latencyMs}ms ({isPinging ? 'Pinging...' : 'Ping'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Table Inspector: 3x2 Grid of Small Tiles */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#051F20] tracking-tight">Relational Records</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-[#E3EEE6] p-3 rounded-2xl text-center shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500">Users</div>
            <div className="text-base font-extrabold text-[#051F20] mt-0.5">{overviewCounts.users}</div>
          </div>
          <div className="bg-white border border-[#E3EEE6] p-3 rounded-2xl text-center shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500">Events</div>
            <div className="text-base font-extrabold text-[#051F20] mt-0.5">12</div>
          </div>
          <div className="bg-white border border-[#E3EEE6] p-3 rounded-2xl text-center shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500">Registrations</div>
            <div className="text-base font-extrabold text-[#051F20] mt-0.5">142</div>
          </div>
          <div className="bg-white border border-[#E3EEE6] p-3 rounded-2xl text-center shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500">Tasks</div>
            <div className="text-base font-extrabold text-[#051F20] mt-0.5">28</div>
          </div>
          <div className="bg-white border border-[#E3EEE6] p-3 rounded-2xl text-center shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500">Ledger</div>
            <div className="text-base font-extrabold text-[#051F20] mt-0.5">₹42.5k</div>
          </div>
          <div className="bg-white border border-[#E3EEE6] p-3 rounded-2xl text-center shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500">Audit Logs</div>
            <div className="text-base font-extrabold text-[#051F20] mt-0.5">389</div>
          </div>
        </div>
      </div>

      {/* 3. Audit Feed: Last 5 Entries + "View all" opening BottomSheet */}
      <div className="bg-white border border-[#E3EEE6] p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E3EEE6]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[#235347]" />
            <h4 className="text-xs font-bold text-[#051F20]">Governance Audit Log</h4>
          </div>
          <button
            type="button"
            onClick={() => setIsAllAuditsOpen(true)}
            className="text-xs font-bold text-[#235347] hover:underline cursor-pointer"
          >
            View all ›
          </button>
        </div>

        <div className="space-y-2">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-2.5 bg-[#F7FAF8] border border-[#E3EEE6] rounded-xl flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <div className="font-bold text-[#051F20] truncate">{log.action}</div>
                <div className="text-[11px] text-[#235347] truncate">
                  {log.actor_name} → {log.target_name || log.target_type}
                </div>
              </div>
              <RelativeTime
                date={log.timestamp}
                className="text-[11px] font-mono text-slate-400 shrink-0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Danger Zone: Red-outline "Purge and Clean Slate" button */}
      <div className="bg-white border border-rose-200 p-4 rounded-2xl shadow-xs space-y-2.5">
        <div className="text-xs font-bold text-rose-700">Danger Zone</div>
        <button
          type="button"
          onClick={() => setIsPurgeModalOpen(true)}
          className="w-full min-h-[44px] h-11 rounded-xl border border-rose-500 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
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
              className="p-3 bg-[#F7FAF8] border border-[#E3EEE6] rounded-xl flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <div className="font-bold text-[#051F20]">{log.action}</div>
                <div className="text-xs text-[#235347]">
                  {log.actor_name} on {log.target_name || log.target_type}
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
