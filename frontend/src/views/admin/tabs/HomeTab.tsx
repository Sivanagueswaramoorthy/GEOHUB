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
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeBackend
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  activeBackend ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {activeBackend ? 'Live Operations' : 'Maintenance Mode Active'}
            </span>
            <span className="text-xs font-semibold text-slate-500">SuperAdmin Root Authority</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            System Overview & Health
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Real-time control over campus users, TiDB cloud database, and API backend.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onPingDatabase()}
          disabled={isPinging || !activeDb}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw size={16} className={isPinging ? 'animate-spin' : ''} />
          {isPinging ? 'Checking Latency...' : activeDb ? 'Refresh Status' : 'Database Offline'}
        </button>
      </div>

      {/* Top 3 Core Metrics: Total Students, Total Staff, Total Users */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Students
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap size={20} strokeWidth={2.4} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {overviewCounts.students}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Enrolled
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1 group-hover:text-emerald-700">
            View in Logs & Directory <ArrowRight size={12} />
          </p>
        </div>

        {/* Total Staff (Faculty) */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Staff
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase size={20} strokeWidth={2.4} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {overviewCounts.faculty}
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Faculty
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1 group-hover:text-blue-700">
            View Faculty Advisors <ArrowRight size={12} />
          </p>
        </div>

        {/* Total Users Combined */}
        <div
          onClick={() => onNavigateTab('logs')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Users
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users size={20} strokeWidth={2.4} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {overviewCounts.users}
            </span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Campus Wide
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1 group-hover:text-purple-700">
            Inspect All Profiles <ArrowRight size={12} />
          </p>
        </div>
      </div>

      {/* Connectivity & Infrastructure Grid (Rebuilt with Toggle Modules) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Database Connectivity Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
                    activeDb
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border-rose-200'
                  }`}
                >
                  <Database size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Database Connectivity</h2>
                  <p className="text-xs font-medium text-slate-500">TiDB Cloud Distributed Cluster</p>
                </div>
              </div>

              {/* Status Pill Badge + Toggle Switch */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                    activeDb
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {activeDb ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Connected
                    </>
                  ) : (
                    <>
                      <XCircle size={13} className="text-rose-600" />
                      Disconnected
                    </>
                  )}
                </span>
                <Toggle
                  checked={activeDb}
                  onChange={handleToggleDb}
                  label="Toggle TiDB Database Connectivity"
                />
              </div>
            </div>

            {/* Prominent Quick Toggle Bar */}
            <div className="mb-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Database Connectivity Switch</div>
                <div className="text-[11px] font-medium text-slate-500">
                  {activeDb ? 'TiDB Cloud Live · Queries Enabled' : 'Offline Mode · Mock Fallback'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono font-extrabold px-2 py-0.5 rounded ${
                    activeDb ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {activeDb ? 'ON' : 'OFF'}
                </span>
                <Toggle
                  checked={activeDb}
                  onChange={handleToggleDb}
                  label="Quick Switch Database Connectivity"
                />
              </div>
            </div>

            {/* Offline Notice Banner */}
            {!activeDb && (
              <div className="mb-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>TiDB database connection is turned off. Offline fallback mode active.</span>
              </div>
            )}

            <div className="space-y-2.5 text-xs bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 border-b border-slate-200/60 gap-1">
                <span className="text-slate-500 font-medium shrink-0">Host Endpoint</span>
                <span
                  className="font-mono font-bold text-slate-800 text-[11px] break-all sm:text-right"
                  title={diagnostics.host}
                >
                  {diagnostics.host}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Port & Protocol</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Lock size={12} className={activeDb ? 'text-emerald-600' : 'text-slate-400'} />
                  {activeDb ? diagnostics.port : 'Offline / Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Database Engine</span>
                <span className="font-bold text-slate-800">
                  {activeDb ? diagnostics.engine : 'TiDB Cloud (Standby)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Ping Round-Trip</span>
                <span
                  className={`font-bold flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
                    activeDb
                      ? 'text-emerald-700 bg-emerald-100/60'
                      : 'text-slate-500 bg-slate-200/60'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeDb ? 'bg-emerald-600' : 'bg-slate-400'
                    }`}
                  />
                  {activeDb ? `${latencyMs} ms` : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Health status:{' '}
              <strong className={activeDb ? 'text-slate-700' : 'text-rose-600'}>
                {activeDb ? diagnostics.health : 'Disconnected (Offline)'}
              </strong>
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

        {/* 2. Backend Connectivity Card (with Toggle Module for Maintenance Mode) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
                    activeBackend
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}
                >
                  <Server size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Backend Connectivity</h2>
                  <p className="text-xs font-medium text-slate-500">GeoHub Node.js & REST API</p>
                </div>
              </div>

              {/* Status Pill Badge + Toggle Switch */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                    activeBackend
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {activeBackend ? (
                    <>
                      <CheckCircle2 size={13} className="text-blue-600" />
                      Operational
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} className="text-amber-600" />
                      Maintenance
                    </>
                  )}
                </span>
                <Toggle
                  checked={activeBackend}
                  onChange={handleToggleBackend}
                  label="Toggle Backend Module (Maintenance Mode)"
                />
              </div>
            </div>

            {/* Prominent Quick Toggle Bar */}
            <div className="mb-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Backend Server Switch</div>
                <div className="text-[11px] font-medium text-slate-500">
                  {activeBackend ? 'Server Active · Normal App Mode' : 'Server Offline · Maintenance Mode Active'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono font-extrabold px-2 py-0.5 rounded ${
                    activeBackend ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeBackend ? 'ON' : 'OFF'}
                </span>
                <Toggle
                  checked={activeBackend}
                  onChange={handleToggleBackend}
                  label="Quick Switch Backend Module"
                />
              </div>
            </div>

            {/* Maintenance Warning Banner */}
            {!activeBackend && (
              <div className="mb-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>Backend offline. App is in Maintenance Mode (users see Under Maintenance).</span>
              </div>
            )}

            <div className="space-y-2.5 text-xs bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Health Route</span>
                <span className="font-mono font-bold text-slate-800">
                  {activeBackend ? '/api/v1/health' : '/api/v1/health (Paused)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">API Version</span>
                <span className="font-bold text-slate-800">v{APP_VERSION} Production</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Active Online Sessions</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity size={12} className={activeBackend ? 'text-emerald-600' : 'text-amber-600'} />
                  {activeBackend ? `${overviewCounts.online} Sessions` : '0 Sessions (Offline)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Active Modules</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    activeBackend
                      ? 'text-emerald-700 bg-emerald-100/60'
                      : 'text-amber-800 bg-amber-100/60'
                  }`}
                >
                  {activeBackend
                    ? `${overviewCounts.modulesLive} of ${overviewCounts.modulesTotal} Online`
                    : '0 of 9 Online (Maintenance)'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              API Gateway:{' '}
              <strong className={activeBackend ? 'text-slate-700' : 'text-amber-700'}>
                {activeBackend ? 'Healthy & Synchronized' : 'Paused / Maintenance'}
              </strong>
            </span>
            <span
              className={`text-xs font-bold ${
                activeBackend ? 'text-slate-400' : 'text-amber-600'
              }`}
            >
              {activeBackend ? 'Zero downtime' : 'Maintenance Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Navigation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('access')}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck size={18} strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Manage Access</p>
              <p className="text-xs font-medium text-slate-500">Configure role module toggles</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('features')}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <UserPlus size={18} strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Add Members</p>
              <p className="text-xs font-medium text-slate-500">Register student or faculty</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('logs')}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap size={18} strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">View Logs & Records</p>
              <p className="text-xs font-medium text-slate-500">Filter, inspect, suspend, delete</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
