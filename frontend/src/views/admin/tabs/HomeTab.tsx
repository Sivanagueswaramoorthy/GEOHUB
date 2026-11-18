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
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xs shadow-sm shadow-emerald-500/20 shrink-0">
            SA
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                System Overview & Health
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  activeBackend
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
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
            <p className="text-[11px] font-semibold text-slate-500 truncate">SuperAdmin Root Authority</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onPingDatabase()}
          disabled={isPinging || !activeDb}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-40 cursor-pointer shrink-0 active:scale-95"
        >
          <RefreshCw size={12} className={isPinging ? 'animate-spin text-emerald-400' : 'text-emerald-400'} />
          <span className="hidden xs:inline">{isPinging ? 'Checking...' : activeDb ? 'Refresh Status' : 'Offline'}</span>
          <span className="xs:hidden">{isPinging ? '...' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* Top 3 Core Metrics (Clean, Colorful 3-Column Strip) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Students Card - Emerald */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-emerald-50/70 via-white to-white border border-emerald-200/90 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Students</span>
            <span className="text-sm">🎓</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 my-1">
            {overviewCounts.students}
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-full inline-block">
              Enrolled
            </span>
          </div>
          <span className="sr-only">Total Students</span>
        </div>

        {/* Staff Card - Blue */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-blue-50/70 via-white to-white border border-blue-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Staff</span>
            <span className="text-sm">💼</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 my-1">
            {overviewCounts.faculty}
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-blue-700 bg-blue-100/80 border border-blue-200 px-2 py-0.5 rounded-full inline-block">
              Advisors
            </span>
          </div>
          <span className="sr-only">Total Staff</span>
        </div>

        {/* Users Card - Purple */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-purple-50/70 via-white to-white border border-purple-200/90 shadow-sm hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Users</span>
            <span className="text-sm">👥</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 my-1">
            {overviewCounts.users}
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-purple-700 bg-purple-100/80 border border-purple-200 px-2 py-0.5 rounded-full inline-block">
              Campus Total
            </span>
          </div>
          <span className="sr-only">Total Users</span>
        </div>
      </div>

      {/* Card 1: TiDB Cloud Distributed (Emerald Theme & Never-Clipped Toggle) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                activeDb
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                  : 'bg-rose-100 text-rose-600 border border-rose-200'
              }`}
            >
              <Database size={20} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  TiDB Cloud Distributed
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-colors shrink-0 ${
                    activeDb
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}
                >
                  {activeDb ? 'Connected' : 'Disconnected'}
                </span>
                <span className="sr-only">Database Connectivity</span>
              </div>
              <p
                className="text-[11px] text-slate-500 font-mono truncate max-w-[170px] sm:max-w-md block mt-0.5"
                title={diagnostics.host}
              >
                {diagnostics.host}
              </p>
            </div>
          </div>

          <div className="shrink-0 pl-1.5 flex items-center">
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
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-center gap-2 animate-fadeIn font-medium">
            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
            <span>TiDB database connection is turned off. Offline fallback mode active.</span>
          </div>
        )}

        {/* 3 Pills in a row (Rich Clean Colors) */}
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2 sm:p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">PORT</span>
            <span className="font-black text-slate-900 text-xs sm:text-sm mt-0.5">
              {activeDb ? diagnostics.port : 'Offline'}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2 sm:p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">ENGINE</span>
            <span className="font-black text-slate-900 text-xs sm:text-sm truncate mt-0.5" title={diagnostics.engine}>
              {activeDb ? (diagnostics.engine?.includes('Distributed') ? 'Distributed' : diagnostics.engine) : 'Standby'}
            </span>
          </div>
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2 sm:p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-emerald-700 uppercase tracking-wider">PING</span>
            <span className={`font-black text-xs sm:text-sm mt-0.5 ${activeDb ? 'text-emerald-700' : 'text-slate-400'}`}>
              {activeDb ? `${latencyMs} ms` : 'Offline'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium text-[11px]">
            Health: <strong className={activeDb ? 'text-slate-800' : 'text-rose-600'}>{activeDb ? diagnostics.health : 'Disconnected (Offline)'}</strong>
          </span>
          <button
            type="button"
            onClick={() => onPingDatabase()}
            disabled={isPinging || !activeDb}
            className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              activeDb ? 'text-emerald-700 hover:text-emerald-800 hover:underline' : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            {activeDb ? 'Ping TiDB Now →' : 'Database Offline'}
          </button>
        </div>
      </div>

      {/* Card 2: GeoHub API Gateway (Royal Blue Theme & Never-Clipped Toggle) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                activeBackend
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
                  : 'bg-amber-100 text-amber-600 border border-amber-200'
              }`}
            >
              <Server size={20} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  GeoHub API Gateway
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-colors shrink-0 ${
                    activeBackend
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  {activeBackend ? 'Operational' : 'Maintenance'}
                </span>
                <span className="sr-only">Backend Connectivity</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate max-w-[170px] sm:max-w-md block mt-0.5">
                /api/v1/health · v{APP_VERSION}
              </p>
            </div>
          </div>

          <div className="shrink-0 pl-1.5 flex items-center">
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
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-center gap-2 animate-fadeIn font-medium">
            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
            <span>Backend offline. App is in Maintenance Mode (users see Under Maintenance).</span>
          </div>
        )}

        {/* 3 Pills in a row (Rich Clean Colors) */}
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2 sm:p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">ROUTE</span>
            <span className="font-black text-slate-900 text-xs sm:text-sm truncate mt-0.5">
              {activeBackend ? '/api/v1/health' : '/api/v1/health (Paused)'}
            </span>
          </div>
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2 sm:p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-blue-700 uppercase tracking-wider">ONLINE</span>
            <span className="font-black text-blue-700 text-xs sm:text-sm truncate mt-0.5">
              {activeBackend ? `${overviewCounts.online} Sessions` : '0 Sessions (Offline)'}
            </span>
          </div>
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2 sm:p-2.5 flex flex-col">
            <span className="text-[10px] font-sans font-bold text-blue-700 uppercase tracking-wider">MODULES</span>
            <span className={`font-black text-xs sm:text-sm truncate mt-0.5 ${activeBackend ? 'text-blue-700' : 'text-amber-700'}`}>
              {activeBackend
                ? `${overviewCounts.modulesLive}/${overviewCounts.modulesTotal} Live`
                : '0 of 9 Online (Maintenance)'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium text-[11px]">
            API Gateway: <strong className={activeBackend ? 'text-slate-800' : 'text-amber-700'}>{activeBackend ? 'Healthy & Synchronized' : 'Paused / Maintenance'}</strong>
          </span>
          <span className={`text-[11px] font-extrabold ${activeBackend ? 'text-emerald-700' : 'text-amber-700'}`}>
            {activeBackend ? 'Zero downtime' : 'Maintenance Active'}
          </span>
        </div>
      </div>

      {/* Quick Navigation Dock (Clean Colorful Action Buttons) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => onNavigateTab('access')}
          className="flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100 text-center transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-emerald-950">Role Access</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('features')}
          className="flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 hover:bg-blue-100 text-center transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <UserPlus size={16} className="text-blue-600 shrink-0" />
          <span className="text-xs font-bold text-blue-950">Provision</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('logs')}
          className="flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 hover:bg-purple-100 text-center transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <GraduationCap size={16} className="text-purple-600 shrink-0" />
          <span className="text-xs font-bold text-purple-950">Audit Logs</span>
        </button>
      </div>
    </div>
  );
};

export default HomeTab;
