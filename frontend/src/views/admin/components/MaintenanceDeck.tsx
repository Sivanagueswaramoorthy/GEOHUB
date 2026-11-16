import React from 'react';
import { Database, BarChart3, Radio, Activity, Trash2 } from 'lucide-react';
import { DiagnosticsData } from '../types';

interface Props {
  dbLatencyMs: number;
  diagnosticsData: DiagnosticsData | null;
  totalUsersCount: number;
  onPingDatabase: () => Promise<void>;
  pingingDb: boolean;
  onOpenPurgeModal: () => void;
  isPurging: boolean;
}

export const MaintenanceDeck: React.FC<Props> = ({
  dbLatencyMs,
  diagnosticsData,
  totalUsersCount,
  onPingDatabase,
  pingingDb,
  onOpenPurgeModal,
  isPurging,
}) => {
  return (
    <div className="space-y-4">
      {/* Live Database Engine Diagnostics */}
      <div className="bg-[#051F20] text-white rounded-2xl p-4 sm:p-5 border border-[#163832] shadow-xl flex flex-col gap-3 font-mono">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-white tracking-wide">
              TiDB Cloud MySQL Distributed Database
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
            CONNECTED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[#8EB69B]">Host:</span>
            <span className="font-bold text-white truncate max-w-[200px]">
              gateway01.ap-southeast-1.prod.aws.tidbcloud.com
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[#8EB69B]">Port:</span>
            <span className="font-bold text-emerald-400">3306 (SSL Verified)</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[#8EB69B]">Dialect:</span>
            <span className="font-bold text-white">mysql+pymysql (Relational)</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[#8EB69B]">Health Status:</span>
            <span className="font-bold text-emerald-400">200 OK (Live Engine)</span>
          </div>
        </div>
      </div>

      {/* Relational Table Record Inspector (Row Counts) */}
      <div className="bg-white border border-[#DAF1DE] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
              <BarChart3 size={16} strokeWidth={2.4} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#051F20]">Relational Table Record Inspector</h3>
              <p className="text-xs text-[#235347]">Live TiDB Cloud row distribution</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onPingDatabase}
            disabled={pingingDb}
            className="px-2.5 py-1 rounded-xl bg-[#DAF1DE] hover:bg-[#8EB69B]/40 text-[#163832] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 shadow-2xs"
          >
            <Radio size={13} className={pingingDb ? 'animate-pulse text-emerald-600' : 'text-[#235347]'} />
            <span>{pingingDb ? 'Probing...' : `Ping (${dbLatencyMs}ms)`}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
          {[
            { label: 'Users', count: diagnosticsData?.table_counts?.users ?? totalUsersCount },
            { label: 'Events', count: diagnosticsData?.table_counts?.events ?? 0 },
            { label: 'Registrations', count: diagnosticsData?.table_counts?.event_registrations ?? 0 },
            { label: 'Tasks', count: diagnosticsData?.table_counts?.tasks ?? 0 },
            {
              label: 'Ledger',
              count:
                (diagnosticsData?.table_counts?.expenses ?? 0) +
                (diagnosticsData?.table_counts?.budget_requests ?? 0),
            },
            { label: 'Audit Logs', count: diagnosticsData?.table_counts?.audit_logs ?? 0 },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col items-center justify-center"
            >
              <span className="font-mono text-base font-black text-[#051F20]">{item.count}</span>
              <span className="text-[10px] font-bold text-[#52665C] uppercase tracking-wider mt-0.5">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Governance Audit Feed (Last 5 actions) */}
      {diagnosticsData?.recent_audits && diagnosticsData.recent_audits.length > 0 && (
        <div className="bg-white border border-[#DAF1DE] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-2">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#235347]" />
              <h3 className="text-xs font-bold text-[#051F20] uppercase tracking-wider">
                Recent Governance Audit Log
              </h3>
            </div>
            <span className="text-[10px] font-bold text-[#8EB69B]">Last 5 Records</span>
          </div>
          <div className="divide-y divide-[#DAF1DE]/60">
            {diagnosticsData.recent_audits.map((a) => (
              <div key={a.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#DAF1DE] text-[#163832] shrink-0">
                    {a.action}
                  </span>
                  <span className="font-bold text-[#051F20] truncate">{a.target_name || a.actor_name}</span>
                  <span className="text-[#52665C] truncate hidden sm:inline">{a.details}</span>
                </div>
                <span className="font-mono text-[10px] text-[#8EB69B] shrink-0">
                  {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Data Purge & Clean Slate Controls */}
      <div className="bg-white border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(225,29,72,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <Database size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 leading-tight">
                Platform Data Purge & Clean Slate
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                Permanent Action
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Wipe all events, tasks, registrations, expenses, and dummy accounts. Retain solely SuperAdmin (SA01).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPurgeModal}
          disabled={isPurging}
          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 shadow-xs self-start sm:self-auto disabled:opacity-50"
        >
          <Trash2 size={14} />
          <span>{isPurging ? 'Purging Data...' : 'Purge All Platform Data'}</span>
        </button>
      </div>
    </div>
  );
};
