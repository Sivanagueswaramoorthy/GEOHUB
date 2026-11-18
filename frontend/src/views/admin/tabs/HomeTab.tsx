import React, { useState, useEffect, useContext } from 'react';
import {
  GraduationCap,
  Briefcase,
  Users,
  Database,
  Server,
  Activity,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { OverviewCounts, DiagnosticsData, SuperAdminTab } from '../types';
import { Toggle } from '../ui/Toggle';
import { AppContext } from '../../../context/AppContext';
import { APP_VERSION } from '../../../config/version';

export interface HomeTabProps {
  overviewCounts: OverviewCounts;
  diagnostics: DiagnosticsData;
  latencyMs: number;
  isPinging: boolean;
  onPingDatabase: () => Promise<void>;
  onNavigateTab: (tab: SuperAdminTab) => void;
  isDbConnected?: boolean;
  onToggleDbConnected?: (connected: boolean) => void;
  isBackendActive?: boolean;
  onToggleBackendActive?: (active: boolean) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  overviewCounts,
  diagnostics,
  latencyMs,
  isPinging,
  onPingDatabase,
  onNavigateTab,
  isDbConnected: isDbConnectedProp,
  onToggleDbConnected,
  isBackendActive: isBackendActiveProp,
  onToggleBackendActive,
}) => {
  const app = useContext(AppContext);

  // Internal state fallback for maximum resilience
  const [localDbConnected, setLocalDbConnected] = useState<boolean>(() => {
    if (typeof isDbConnectedProp === 'boolean') return isDbConnectedProp;
    try {
      if (typeof window !== 'undefined') {
        const val = localStorage.getItem('geohub_db_connected');
        if (val !== null) return val === 'true';
      }
    } catch {}
    return app?.isDbConnected ?? true;
  });

  const [localBackendActive, setLocalBackendActive] = useState<boolean>(() => {
    if (typeof isBackendActiveProp === 'boolean') return isBackendActiveProp;
    try {
      if (typeof window !== 'undefined') {
        const val = localStorage.getItem('geohub_backend_active');
        if (val !== null) return val === 'true';
      }
    } catch {}
    return app?.isBackendActive ?? true;
  });

  useEffect(() => {
    if (typeof isDbConnectedProp === 'boolean') {
      setLocalDbConnected(isDbConnectedProp);
    }
  }, [isDbConnectedProp]);

  useEffect(() => {
    if (typeof isBackendActiveProp === 'boolean') {
      setLocalBackendActive(isBackendActiveProp);
    }
  }, [isBackendActiveProp]);

  const activeDb = typeof isDbConnectedProp === 'boolean' ? isDbConnectedProp : localDbConnected;
  const activeBackend = typeof isBackendActiveProp === 'boolean' ? isBackendActiveProp : localBackendActive;

  const handleToggleDb = (checked: boolean) => {
    setLocalDbConnected(checked);
    if (onToggleDbConnected) {
      onToggleDbConnected(checked);
    } else {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('geohub_db_connected', String(checked));
          window.dispatchEvent(new Event('storage'));
        }
      } catch {}
      if (app?.setIsDbConnected) {
        app.setIsDbConnected(checked);
      }
    }
  };

  const handleToggleBackend = (checked: boolean) => {
    setLocalBackendActive(checked);
    if (onToggleBackendActive) {
      onToggleBackendActive(checked);
    } else {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('geohub_backend_active', String(checked));
          window.dispatchEvent(new Event('storage'));
        }
      } catch {}
      if (app?.setIsBackendActive) {
        app.setIsBackendActive(checked);
      }
    }
  };
  return (
    <div className="space-y-3.5 animate-fadeIn pb-12 select-none">
      {/* Executive Command Header */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0c0e12] border border-slate-800 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center font-black text-xs shadow-sm shrink-0">
            SA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
                System Overview & Health
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  activeBackend
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeBackend ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {activeBackend ? 'Live Operations' : 'Maintenance Mode Active'}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">SuperAdmin Root Authority</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onPingDatabase()}
          disabled={isPinging || !activeDb}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141822] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-40 cursor-pointer shrink-0 active:scale-95 border border-slate-700"
        >
          <RefreshCw size={12} className={isPinging ? 'animate-spin text-emerald-400' : 'text-emerald-400'} />
          <span>{isPinging ? 'Checking Latency...' : activeDb ? 'Refresh Status' : 'Database Offline'}</span>
        </button>
      </div>

      {/* Top 3 Core Metrics (Matching Image 1) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Students Card */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="p-3 sm:p-3.5 rounded-2xl bg-[#0c0e12] border border-slate-800 shadow-lg hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Students</span>
            <span className="text-sm">🎓</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white my-1">
            {overviewCounts.students}
          </div>
          <div className="text-[11px] font-bold text-emerald-400">
            Enrolled
          </div>
          <span className="sr-only">Total Students</span>
        </div>

        {/* Staff Card */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="p-3 sm:p-3.5 rounded-2xl bg-[#0c0e12] border border-slate-800 shadow-lg hover:border-blue-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Staff</span>
            <span className="text-sm">💼</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white my-1">
            {overviewCounts.faculty}
          </div>
          <div className="text-[11px] font-bold text-blue-400">
            Advisors
          </div>
          <span className="sr-only">Total Staff</span>
        </div>

        {/* Users Card */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="p-3 sm:p-3.5 rounded-2xl bg-[#0c0e12] border border-slate-800 shadow-lg hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Users</span>
            <span className="text-sm">👥</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white my-1">
            {overviewCounts.users}
          </div>
          <div className="text-[11px] font-bold text-purple-400">
            Campus Total
          </div>
          <span className="sr-only">Total Users</span>
        </div>
      </div>

      {/* Card 1: TiDB Cloud Distributed (Matching Image 1) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0c0e12] border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                activeDb
                  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-950/60 border-rose-500/30 text-rose-400'
              }`}
            >
              <Database size={20} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-white whitespace-nowrap">TiDB Cloud Distributed</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-colors ${
                    activeDb
                      ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40'
                      : 'bg-rose-950/70 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {activeDb ? 'Connected' : 'Disconnected'}
                </span>
                <span className="sr-only">Database Connectivity</span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate max-w-[200px] sm:max-w-md" title={diagnostics.host}>
                {diagnostics.host}
              </p>
            </div>
          </div>

          <div className="shrink-0 pl-1">
            <Toggle
              checked={activeDb}
              onChange={handleToggleDb}
              label="Toggle TiDB Database Connectivity"
              color="emerald"
            />
          </div>
        </div>

        {/* Offline Alert Banner */}
        {!activeDb && (
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs flex items-center gap-2 animate-fadeIn font-medium">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <span>TiDB database connection is turned off. Offline fallback mode active.</span>
          </div>
        )}

        {/* 3 Pills in a row (Matching Image 1 & 2) */}
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
          <div className="bg-[#141822] border border-slate-800 rounded-xl p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">PORT</span>
            <span className="font-bold text-white text-xs mt-0.5">{activeDb ? diagnostics.port : 'Offline'}</span>
          </div>
          <div className="bg-[#141822] border border-slate-800 rounded-xl p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">ENGINE</span>
            <span className="font-bold text-white text-xs truncate mt-0.5" title={diagnostics.engine}>
              {activeDb ? (diagnostics.engine?.includes('Distributed') ? 'Distributed' : diagnostics.engine) : 'Standby'}
            </span>
          </div>
          <div className="bg-[#141822] border border-slate-800 rounded-xl p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">PING</span>
            <span className={`font-bold text-xs mt-0.5 ${activeDb ? 'text-emerald-400' : 'text-slate-500'}`}>
              {activeDb ? `${latencyMs} ms` : 'Offline'}
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium text-[11px]">
            Health: <strong className={activeDb ? 'text-slate-200' : 'text-rose-400'}>{activeDb ? diagnostics.health : 'Disconnected (Offline)'}</strong>
          </span>
          <button
            type="button"
            onClick={() => onPingDatabase()}
            disabled={isPinging || !activeDb}
            className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              activeDb ? 'text-emerald-400 hover:text-emerald-300 hover:underline' : 'text-slate-500 cursor-not-allowed'
            }`}
          >
            {activeDb ? 'Ping TiDB Now →' : 'Database Offline'}
          </button>
        </div>
      </div>

      {/* Card 2: GeoHub API Gateway (Matching Image 1) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0c0e12] border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                activeBackend
                  ? 'bg-blue-950/60 border-blue-500/30 text-blue-400'
                  : 'bg-amber-950/60 border-amber-500/30 text-amber-400'
              }`}
            >
              <Server size={20} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-white whitespace-nowrap">GeoHub API Gateway</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-colors ${
                    activeBackend
                      ? 'bg-blue-950/70 text-blue-400 border-blue-500/40'
                      : 'bg-amber-950/70 text-amber-400 border-amber-500/40'
                  }`}
                >
                  {activeBackend ? 'Operational' : 'Maintenance'}
                </span>
                <span className="sr-only">Backend Connectivity</span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate max-w-[200px] sm:max-w-md">
                /api/v1/health · v{APP_VERSION}
              </p>
            </div>
          </div>

          <div className="shrink-0 pl-1">
            <Toggle
              checked={activeBackend}
              onChange={handleToggleBackend}
              label="Toggle Backend Module (Maintenance Mode)"
              color="blue"
            />
          </div>
        </div>

        {/* Maintenance Warning */}
        {!activeBackend && (
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs flex items-center gap-2 animate-fadeIn font-medium">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <span>Backend offline. App is in Maintenance Mode (users see Under Maintenance).</span>
          </div>
        )}

        {/* 3 Pills in a row (Matching Image 1 & 2) */}
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
          <div className="bg-[#141822] border border-slate-800 rounded-xl p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">ROUTE</span>
            <span className="font-bold text-white text-xs truncate mt-0.5">
              {activeBackend ? '/api/v1/health' : '/api/v1/health (Paused)'}
            </span>
          </div>
          <div className="bg-[#141822] border border-slate-800 rounded-xl p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">ONLINE</span>
            <span className="font-bold text-white text-xs truncate mt-0.5">
              {activeBackend ? `${overviewCounts.online} Sessions` : '0 Sessions (Offline)'}
            </span>
          </div>
          <div className="bg-[#141822] border border-slate-800 rounded-xl p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">MODULES</span>
            <span className={`font-bold text-xs truncate mt-0.5 ${activeBackend ? 'text-blue-400' : 'text-amber-400'}`}>
              {activeBackend
                ? `${overviewCounts.modulesLive}/${overviewCounts.modulesTotal} Live`
                : '0 of 9 Online (Maintenance)'}
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium text-[11px]">
            API Gateway: <strong className={activeBackend ? 'text-slate-200' : 'text-amber-400'}>{activeBackend ? 'Healthy & Synchronized' : 'Paused / Maintenance'}</strong>
          </span>
          <span className={`text-[11px] font-bold ${activeBackend ? 'text-emerald-400' : 'text-amber-400'}`}>
            {activeBackend ? 'Zero downtime' : 'Maintenance Active'}
          </span>
        </div>
      </div>

      {/* Quick Navigation Dock */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => onNavigateTab('access')}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#0c0e12] border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/40 text-center transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200">Role Access</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('features')}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#0c0e12] border border-slate-800 hover:border-blue-500/40 hover:bg-slate-800/40 text-center transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <UserPlus size={15} className="text-blue-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200">Provision</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('logs')}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#0c0e12] border border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/40 text-center transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <GraduationCap size={15} className="text-purple-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200">Audit Logs</span>
        </button>
      </div>
    </div>
  );
};

export default HomeTab;
