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
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Executive Command Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center font-black text-sm shadow-sm shrink-0">
            SA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                System Overview & Health
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
                  activeBackend
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
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
            <p className="text-xs font-semibold text-slate-500">SuperAdmin Root Authority</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onPingDatabase()}
          disabled={isPinging || !activeDb}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
        >
          <RefreshCw size={14} className={isPinging ? 'animate-spin' : ''} />
          <span>{isPinging ? 'Checking Latency...' : activeDb ? 'Refresh Status' : 'Database Offline'}</span>
        </button>
      </div>

      {/* Top 3 Core Metrics (Clean, Bold & Text-Free) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Students */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap size={18} strokeWidth={2.4} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {overviewCounts.students}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              Enrolled
            </span>
          </div>
        </div>

        {/* Total Staff (Faculty) */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Staff
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase size={18} strokeWidth={2.4} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {overviewCounts.faculty}
            </span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
              Faculty
            </span>
          </div>
        </div>

        {/* Total Users Combined */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users size={18} strokeWidth={2.4} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {overviewCounts.users}
            </span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-full">
              Campus Wide
            </span>
          </div>
        </div>
      </div>

      {/* Infrastructure Telemetry Grid (With Single Tactile Master Toggles) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* 1. Database Connectivity Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                    activeDb
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                      : 'bg-rose-50 text-rose-600 border-rose-200'
                  }`}
                >
                  <Database size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">Database Connectivity</h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-colors ${
                        activeDb
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {activeDb ? (
                        <>
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          Connected
                        </>
                      ) : (
                        <>
                          <XCircle size={11} className="text-rose-600" />
                          Disconnected
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">TiDB Cloud Distributed Cluster</p>
                </div>
              </div>

              {/* Single Master Tactile Toggle */}
              <Toggle
                checked={activeDb}
                onChange={handleToggleDb}
                label="Toggle TiDB Database Connectivity"
                color="emerald"
              />
            </div>

            {/* Offline Alert Banner */}
            {!activeDb && (
              <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-fadeIn font-medium">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>TiDB database connection is turned off. Offline fallback mode active.</span>
              </div>
            )}

            {/* Spec Readout Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Port & Protocol</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Lock size={11} className={activeDb ? 'text-emerald-600' : 'text-slate-400'} />
                  {activeDb ? diagnostics.port : 'Offline'}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Database Engine</span>
                <span className="font-bold text-slate-800 truncate mt-0.5" title={diagnostics.engine}>
                  {activeDb ? diagnostics.engine : 'Standby'}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ping Round-Trip</span>
                <span
                  className={`font-bold flex items-center gap-1 mt-0.5 ${
                    activeDb ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeDb ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  {activeDb ? `${latencyMs} ms` : 'Offline'}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Health status</span>
                <span
                  className={`font-bold truncate mt-0.5 ${
                    activeDb ? 'text-slate-800' : 'text-rose-600'
                  }`}
                >
                  {activeDb ? diagnostics.health : 'Disconnected (Offline)'}
                </span>
              </div>
            </div>

            {/* Host Spec Pill */}
            <div className="mt-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 font-sans font-semibold text-[10px] uppercase">Host</span>
              <span className="font-bold text-slate-700 truncate max-w-[280px]" title={diagnostics.host}>
                {diagnostics.host}
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              SSL Gateway: <strong className="text-slate-700 font-semibold">Active Encryption</strong>
            </span>
            <button
              type="button"
              onClick={() => onPingDatabase()}
              disabled={isPinging || !activeDb}
              className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                activeDb
                  ? 'text-emerald-700 hover:text-emerald-800 hover:underline'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              {activeDb ? 'Ping TiDB Now →' : 'Database Offline'}
            </button>
          </div>
        </div>

        {/* 2. Backend Connectivity Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                    activeBackend
                      ? 'bg-blue-50 text-blue-600 border-blue-200/60'
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}
                >
                  <Server size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">Backend Connectivity</h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-colors ${
                        activeBackend
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {activeBackend ? (
                        <>
                          <CheckCircle2 size={11} className="text-blue-600" />
                          Operational
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={11} className="text-amber-600" />
                          Maintenance
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">GeoHub Node.js & REST API</p>
                </div>
              </div>

              {/* Single Master Tactile Toggle */}
              <Toggle
                checked={activeBackend}
                onChange={handleToggleBackend}
                label="Toggle Backend Module (Maintenance Mode)"
                color="blue"
              />
            </div>

            {/* Maintenance Warning Banner */}
            {!activeBackend && (
              <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-fadeIn font-medium">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>Backend offline. App is in Maintenance Mode (users see Under Maintenance).</span>
              </div>
            )}

            {/* Spec Readout Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Health Route</span>
                <span className="font-mono font-bold text-slate-800 truncate mt-0.5">
                  {activeBackend ? '/api/v1/health' : '/api/v1/health (Paused)'}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">API Version</span>
                <span className="font-bold text-slate-800 mt-0.5">v{APP_VERSION}</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Sessions</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Activity size={11} className={activeBackend ? 'text-emerald-600' : 'text-amber-600'} />
                  {activeBackend ? `${overviewCounts.online} Sessions` : '0 Sessions (Offline)'}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Modules</span>
                <span
                  className={`font-bold truncate mt-0.5 ${
                    activeBackend ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {activeBackend
                    ? `${overviewCounts.modulesLive} of ${overviewCounts.modulesTotal} Online`
                    : '0 of 9 Online (Maintenance)'}
                </span>
              </div>
            </div>

            {/* API Gateway Spec Pill */}
            <div className="mt-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-sans font-semibold text-[10px] uppercase">API Gateway</span>
              <span className="font-bold text-slate-700">
                {activeBackend ? 'Healthy & Synchronized' : 'Paused / Maintenance'}
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Architecture: <strong className="text-slate-700 font-semibold">FastAPI + Async Worker</strong>
            </span>
            <span
              className={`text-xs font-bold ${
                activeBackend ? 'text-emerald-700' : 'text-amber-600'
              }`}
            >
              {activeBackend ? 'Zero downtime' : 'Maintenance Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Dock */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => onNavigateTab('access')}
          className="flex items-center justify-center sm:justify-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-sm group active:scale-98"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck size={16} strokeWidth={2.4} />
          </div>
          <span className="text-xs font-bold text-slate-800">Role Access</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('features')}
          className="flex items-center justify-center sm:justify-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer shadow-sm group active:scale-98"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <UserPlus size={16} strokeWidth={2.4} />
          </div>
          <span className="text-xs font-bold text-slate-800">Provision</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('logs')}
          className="flex items-center justify-center sm:justify-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer shadow-sm group active:scale-98"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <GraduationCap size={16} strokeWidth={2.4} />
          </div>
          <span className="text-xs font-bold text-slate-800">Audit Logs</span>
        </button>
      </div>
    </div>
  );
};

export default HomeTab;
