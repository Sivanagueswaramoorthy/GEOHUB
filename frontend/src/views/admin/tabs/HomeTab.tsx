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
    <div className="space-y-3 animate-fadeIn pb-12 select-none">
      {/* Executive Command Header (Obsidian Prototype Design) */}
      <div
        style={{ backgroundColor: '#0c0e12', borderColor: '#1e2430' }}
        className="cockpit-card p-3.5 sm:p-4 rounded-2xl border shadow-lg flex items-center justify-between gap-2.5"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
            className="w-9 h-9 rounded-xl border text-emerald-400 flex items-center justify-center font-black text-xs shadow-sm shrink-0"
          >
            SA
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs sm:text-sm font-black text-white tracking-tight">
                System Overview & Health
              </h1>
              <span
                style={{
                  backgroundColor: activeBackend ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  borderColor: activeBackend ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)',
                  color: activeBackend ? '#34d399' : '#fbbf24',
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0"
              >
                <span
                  style={{ backgroundColor: activeBackend ? '#10b981' : '#f59e0b' }}
                  className={`w-1.5 h-1.5 rounded-full ${activeBackend ? 'animate-pulse' : ''}`}
                />
                {activeBackend ? 'Live Operations' : 'Maintenance Mode Active'}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 truncate block mt-0.5">
              SuperAdmin Root Authority
            </p>
          </div>
        </div>

        {/* Single clean Refresh Status button (No duplicated text) */}
        <button
          type="button"
          onClick={() => onPingDatabase()}
          disabled={isPinging || !activeDb}
          style={{ backgroundColor: '#141822', borderColor: '#334155' }}
          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-sm transition-all disabled:opacity-40 cursor-pointer shrink-0 active:scale-95 border"
        >
          <RefreshCw size={12} className={isPinging ? 'animate-spin text-emerald-400' : 'text-emerald-400'} />
          <span className="text-[11px] whitespace-nowrap">
            {isPinging ? 'Checking...' : activeDb ? 'Refresh Status' : 'Offline'}
          </span>
        </button>
      </div>

      {/* Top 3 Core Metrics (Obsidian Prototype 3-Column Strip) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Students Card */}
        <div
          onClick={() => onNavigateTab('logs')}
          style={{ backgroundColor: '#0c0e12', borderColor: '#1e2430' }}
          className="cockpit-card p-2.5 sm:p-3 rounded-2xl border shadow-lg hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>Students</span>
            <span className="text-xs">🎓</span>
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-white my-1">
            {overviewCounts.students}
          </div>
          <div className="text-[10px] font-bold text-emerald-400">
            Enrolled
          </div>
          <span className="sr-only">Total Students</span>
        </div>

        {/* Staff Card */}
        <div
          onClick={() => onNavigateTab('logs')}
          style={{ backgroundColor: '#0c0e12', borderColor: '#1e2430' }}
          className="cockpit-card p-2.5 sm:p-3 rounded-2xl border shadow-lg hover:border-blue-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>Staff</span>
            <span className="text-xs">💼</span>
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-white my-1">
            {overviewCounts.faculty}
          </div>
          <div className="text-[10px] font-bold text-blue-400">
            Advisors
          </div>
          <span className="sr-only">Total Staff</span>
        </div>

        {/* Users Card */}
        <div
          onClick={() => onNavigateTab('logs')}
          style={{ backgroundColor: '#0c0e12', borderColor: '#1e2430' }}
          className="cockpit-card p-2.5 sm:p-3 rounded-2xl border shadow-lg hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>Users</span>
            <span className="text-xs">👥</span>
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-white my-1">
            {overviewCounts.users}
          </div>
          <div className="text-[10px] font-bold text-purple-400">
            Campus Total
          </div>
          <span className="sr-only">Total Users</span>
        </div>
      </div>

      {/* Card 1: TiDB Cloud Distributed (Obsidian Prototype Design) */}
      <div
        style={{ backgroundColor: '#0c0e12', borderColor: '#1e2430' }}
        className="cockpit-card p-3 sm:p-3.5 rounded-2xl border shadow-lg space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              style={{
                backgroundColor: activeDb ? 'rgba(5, 150, 105, 0.18)' : 'rgba(225, 29, 72, 0.18)',
                borderColor: activeDb ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)',
              }}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                activeDb ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <Database size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-white truncate">
                  TiDB Cloud Distributed
                </h3>
                <span
                  style={{
                    backgroundColor: activeDb ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    borderColor: activeDb ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)',
                    color: activeDb ? '#34d399' : '#fb7185',
                  }}
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold border transition-colors shrink-0"
                >
                  {activeDb ? 'Connected' : 'Disconnected'}
                </span>
                <span className="sr-only">Database Connectivity</span>
              </div>
              <p
                className="text-[11px] text-slate-400 font-mono truncate max-w-[170px] sm:max-w-md block mt-0.5"
                title={diagnostics.host}
              >
                {diagnostics.host}
              </p>
            </div>
          </div>

          <div className="shrink-0 pl-1 flex items-center">
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
          <div
            style={{ backgroundColor: 'rgba(120, 53, 15, 0.35)', borderColor: 'rgba(217, 119, 6, 0.4)' }}
            className="p-2 rounded-xl border text-amber-300 text-[11px] flex items-center gap-2 animate-fadeIn font-medium"
          >
            <AlertTriangle size={13} className="text-amber-400 shrink-0" />
            <span>TiDB database connection is turned off. Offline fallback mode active.</span>
          </div>
        )}

        {/* 3 Pills in a row (Prototype Accurate) */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5 font-mono">
          <div
            style={{ backgroundColor: '#141822', borderColor: '#1e2430' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col"
          >
            <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">PORT</span>
            <span className="font-bold text-white text-xs mt-0.5">{activeDb ? diagnostics.port : 'Offline'}</span>
          </div>
          <div
            style={{ backgroundColor: '#141822', borderColor: '#1e2430' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col"
          >
            <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">ENGINE</span>
            <span className="font-bold text-white text-xs truncate mt-0.5" title={diagnostics.engine}>
              {activeDb ? (diagnostics.engine?.includes('Distributed') ? 'Distributed' : diagnostics.engine) : 'Standby'}
            </span>
          </div>
          <div
            style={{ backgroundColor: '#141822', borderColor: '#1e2430' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col"
          >
            <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">PING</span>
            <span className={`font-bold text-xs mt-0.5 ${activeDb ? 'text-emerald-400' : 'text-slate-500'}`}>
              {activeDb ? `${latencyMs} ms` : 'Offline'}
            </span>
          </div>
        </div>

        <div
          style={{ borderColor: 'rgba(51, 65, 85, 0.4)' }}
          className="pt-2 border-t flex items-center justify-between text-xs"
        >
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

      {/* Card 2: GeoHub API Gateway (Obsidian Prototype Design) */}
      <div
        style={{ backgroundColor: '#0c0e12', borderColor: '#1e2430' }}
        className="cockpit-card p-3 sm:p-3.5 rounded-2xl border shadow-lg space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              style={{
                backgroundColor: activeBackend ? 'rgba(37, 99, 235, 0.18)' : 'rgba(217, 119, 6, 0.18)',
                borderColor: activeBackend ? 'rgba(59, 130, 246, 0.35)' : 'rgba(245, 158, 11, 0.35)',
              }}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                activeBackend ? 'text-blue-400' : 'text-amber-400'
              }`}
            >
              <Server size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-white truncate">
                  GeoHub API Gateway
                </h3>
                <span
                  style={{
                    backgroundColor: activeBackend ? 'rgba(37, 99, 235, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                    borderColor: activeBackend ? 'rgba(59, 130, 246, 0.35)' : 'rgba(245, 158, 11, 0.35)',
                    color: activeBackend ? '#60a5fa' : '#fbbf24',
                  }}
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold border transition-colors shrink-0"
                >
                  {activeBackend ? 'Operational' : 'Maintenance'}
                </span>
                <span className="sr-only">Backend Connectivity</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[170px] sm:max-w-md block mt-0.5">
                /api/v1/health · v{APP_VERSION}
              </p>
            </div>
          </div>

          <div className="shrink-0 pl-1 flex items-center">
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
          <div
            style={{ backgroundColor: 'rgba(120, 53, 15, 0.35)', borderColor: 'rgba(217, 119, 6, 0.4)' }}
            className="p-2 rounded-xl border text-amber-300 text-[11px] flex items-center gap-2 animate-fadeIn font-medium"
          >
            <AlertTriangle size={13} className="text-amber-400 shrink-0" />
            <span>Backend offline. App is in Maintenance Mode (users see Under Maintenance).</span>
          </div>
        )}

        {/* 3 Pills in a row (Prototype Accurate) */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5 font-mono">
          <div
            style={{ backgroundColor: '#141822', borderColor: '#1e2430' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col"
          >
            <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">ROUTE</span>
            <span className="font-bold text-white text-xs truncate mt-0.5">
              {activeBackend ? '/api/v1/health' : '/api/v1/health (Paused)'}
            </span>
          </div>
          <div
            style={{ backgroundColor: '#141822', borderColor: '#1e2430' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col"
          >
            <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">ONLINE</span>
            <span className="font-bold text-white text-xs truncate mt-0.5">
              {activeBackend ? `${overviewCounts.online} Sessions` : '0 Sessions (Offline)'}
            </span>
          </div>
          <div
            style={{ backgroundColor: '#141822', borderColor: '#1e2430' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col"
          >
            <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">MODULES</span>
            <span className={`font-bold text-xs truncate mt-0.5 ${activeBackend ? 'text-blue-400' : 'text-amber-400'}`}>
              {activeBackend
                ? `${overviewCounts.modulesLive}/${overviewCounts.modulesTotal} Live`
                : '0 of 9 Online (Maintenance)'}
            </span>
          </div>
        </div>

        <div
          style={{ borderColor: 'rgba(51, 65, 85, 0.4)' }}
          className="pt-2 border-t flex items-center justify-between text-xs"
        >
          <span className="text-slate-400 font-medium text-[11px]">
            API Gateway: <strong className={activeBackend ? 'text-slate-200' : 'text-amber-400'}>{activeBackend ? 'Healthy & Synchronized' : 'Paused / Maintenance'}</strong>
          </span>
          <span className={`text-[11px] font-bold ${activeBackend ? 'text-emerald-400' : 'text-amber-400'}`}>
            {activeBackend ? 'Zero downtime' : 'Maintenance Active'}
          </span>
        </div>
      </div>

      {/* Quick Navigation Dock */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onNavigateTab('access')}
          style={{ backgroundColor: '#0c0e12', borderColor: '#1e2430' }}
          className="cockpit-card flex items-center justify-center gap-1.5 p-2.5 rounded-xl border hover:border-emerald-500/40 text-center transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200">Role Access</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('features')}
          style={{ backgroundColor: '#0c0e12', borderColor: '#1e2430' }}
          className="cockpit-card flex items-center justify-center gap-1.5 p-2.5 rounded-xl border hover:border-blue-500/40 text-center transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <UserPlus size={14} className="text-blue-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200">Provision</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('logs')}
          style={{ backgroundColor: '#0c0e12', borderColor: '#1e2430' }}
          className="cockpit-card flex items-center justify-center gap-1.5 p-2.5 rounded-xl border hover:border-purple-500/40 text-center transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <GraduationCap size={14} className="text-purple-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200">Audit Logs</span>
        </button>
      </div>
    </div>
  );
};

export default HomeTab;
