import React, { useState } from 'react';
import { Database, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { botanicalTheme } from '../theme';

export interface DatabaseTelemetryCardProps {
  latencyMs: number;
  onTestConnection: () => Promise<void>;
  lastSyncTime: string;
}

export const DatabaseTelemetryCard: React.FC<DatabaseTelemetryCardProps> = ({
  latencyMs,
  onTestConnection,
  lastSyncTime,
}) => {
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await onTestConnection();
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <section
      aria-label="TiDB Cloud MySQL Diagnostics"
      className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DAF1DE] shadow-sm flex flex-col gap-3.5 select-none"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#DAF1DE]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: botanicalTheme.colors.paleMint,
              color: botanicalTheme.colors.emeraldSlate,
              borderColor: botanicalTheme.colors.softSage,
            }}
          >
            <Database size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#051F20]">
                TiDB Cloud MySQL Distributed Database
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Connected
              </span>
            </div>
            <p className="text-xs text-[#235347] mt-0.5">
              Production distributed MySQL-compatible relational cluster on Port 3306
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTest}
          disabled={isTesting}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer touch-target-44 self-start sm:self-auto shadow-2xs"
          style={{ backgroundColor: botanicalTheme.colors.emeraldSlate }}
        >
          <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
          <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#8EB69B]">Cluster Host</span>
          <span className="font-mono font-bold text-[#051F20] truncate">
            gateway01.ap-southeast-1.prod.aws.tidbcloud.com
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#8EB69B]">Relational Dialect</span>
          <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
            <ShieldCheck size={14} />
            <span>Port 3306 · PyMySQL SSL Validated</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#8EB69B]">Target Schema</span>
          <span className="font-mono font-bold text-[#051F20]">geohub</span>
        </div>

        <div className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#8EB69B]">Live Latency & Sync</span>
          <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
            <Activity size={14} />
            <span>{latencyMs}ms · Last: {lastSyncTime}</span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default DatabaseTelemetryCard;
