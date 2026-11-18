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
      {/* Executive Command Header (Light Peach Theme) */}
      <div
        style={{ backgroundColor: '#FFF2EB', borderColor: '#FCDFD7' }}
        className="cockpit-card p-3.5 sm:p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-2.5"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            style={{ backgroundColor: '#FFE2D5', borderColor: '#F8BCA9', color: '#B43A14' }}
            className="w-9 h-9 rounded-xl border flex items-center justify-center font-black text-xs shadow-xs shrink-0"
          >
            SA
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 style={{ color: '#2D1A12' }} className="text-xs sm:text-sm font-black tracking-tight">
                System Overview & Health
              </h1>
              <span
                style={{
                  backgroundColor: activeBackend ? '#DCFCE7' : '#FEF3C7',
                  borderColor: activeBackend ? '#86EFAC' : '#FDE68A',
                  color: activeBackend ? '#15803D' : '#B45309',
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
            <p style={{ color: '#7C584C' }} className="text-[11px] font-medium truncate block mt-0.5">
              SuperAdmin Root Authority
            </p>
          </div>
        </div>

        {/* Single clean Refresh Status button (No duplicated text) */}
        <button
          type="button"
          onClick={() => onPingDatabase()}
          disabled={isPinging || !activeDb}
          style={{ backgroundColor: '#FFFFFF', borderColor: '#F5CEBE', color: '#2D1A12' }}
          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-40 cursor-pointer shrink-0 active:scale-95 border"
        >
          <RefreshCw size={12} className={isPinging ? 'animate-spin text-emerald-600' : 'text-emerald-600'} />
          <span className="text-[11px] whitespace-nowrap">
            {isPinging ? 'Checking...' : activeDb ? 'Refresh Status' : 'Offline'}
          </span>
        </button>
      </div>

      {/* Top 3 Core Metrics (Light Peach 3-Column Strip) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Students Card */}
        <div
          onClick={() => onNavigateTab('logs')}
          style={{ backgroundColor: '#FFF2EB', borderColor: '#FCDFD7' }}
          className="cockpit-card p-2.5 sm:p-3 rounded-2xl border shadow-sm hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: '#7C584C' }}>
            <span>Students</span>
            <span className="text-xs">🎓</span>
          </div>
          <div style={{ color: '#2D1A12' }} className="text-xl sm:text-2xl font-black tracking-tight my-1">
            {overviewCounts.students}
          </div>
          <div style={{ color: '#059669' }} className="text-[10px] font-bold">
            Enrolled
          </div>
          <span className="sr-only">Total Students</span>
        </div>

        {/* Staff Card */}
        <div
          onClick={() => onNavigateTab('logs')}
          style={{ backgroundColor: '#FFF2EB', borderColor: '#FCDFD7' }}
          className="cockpit-card p-2.5 sm:p-3 rounded-2xl border shadow-sm hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: '#7C584C' }}>
            <span>Staff</span>
            <span className="text-xs">💼</span>
          </div>
          <div style={{ color: '#2D1A12' }} className="text-xl sm:text-2xl font-black tracking-tight my-1">
            {overviewCounts.faculty}
          </div>
          <div style={{ color: '#2563EB' }} className="text-[10px] font-bold">
            Advisors
          </div>
          <span className="sr-only">Total Staff</span>
        </div>

        {/* Users Card */}
        <div
          onClick={() => onNavigateTab('logs')}
          style={{ backgroundColor: '#FFF2EB', borderColor: '#FCDFD7' }}
          className="cockpit-card p-2.5 sm:p-3 rounded-2xl border shadow-sm hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: '#7C584C' }}>
            <span>Users</span>
            <span className="text-xs">👥</span>
          </div>
          <div style={{ color: '#2D1A12' }} className="text-xl sm:text-2xl font-black tracking-tight my-1">
            {overviewCounts.users}
          </div>
          <div style={{ color: '#7C3AED' }} className="text-[10px] font-bold">
            Campus Total
          </div>
          <span className="sr-only">Total Users</span>
        </div>
      </div>

      {/* Card 1: TiDB Cloud Distributed (Light Peach Theme) */}
      <div
        style={{ backgroundColor: '#FFF2EB', borderColor: '#FCDFD7' }}
        className="cockpit-card p-3 sm:p-3.5 rounded-2xl border shadow-sm space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              style={{
                backgroundColor: activeDb ? '#DCFCE7' : '#FFE4E6',
                borderColor: activeDb ? '#86EFAC' : '#FECDD3',
                color: activeDb ? '#059669' : '#E11D48',
              }}
              className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors"
            >
              <Database size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 style={{ color: '#2D1A12' }} className="text-xs sm:text-sm font-black truncate">
                  TiDB Cloud Distributed
                </h3>
                <span
                  style={{
                    backgroundColor: activeDb ? '#DCFCE7' : '#FFE4E6',
                    borderColor: activeDb ? '#86EFAC' : '#FECDD3',
                    color: activeDb ? '#15803D' : '#E11D48',
                  }}
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold border transition-colors shrink-0"
                >
                  {activeDb ? 'Connected' : 'Disconnected'}
                </span>
                <span className="sr-only">Database Connectivity</span>
              </div>
              <p
                style={{ color: '#7C584C' }}
                className="text-[11px] font-mono truncate max-w-[170px] sm:max-w-md block mt-0.5"
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
            style={{ backgroundColor: '#FEF3C7', borderColor: '#FDE68A', color: '#92400E' }}
            className="p-2 rounded-xl border text-[11px] flex items-center gap-2 animate-fadeIn font-medium"
          >
            <AlertTriangle size={13} className="text-amber-600 shrink-0" />
            <span>TiDB database connection is turned off. Offline fallback mode active.</span>
          </div>
        )}

        {/* 3 Pills in a row (Crisp White on Peach) */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5 font-mono">
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#FCDFD7' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col shadow-xs"
          >
            <span style={{ color: '#8C6558' }} className="text-[9px] font-sans font-bold uppercase">PORT</span>
            <span style={{ color: '#2D1A12' }} className="font-bold text-xs mt-0.5">{activeDb ? diagnostics.port : 'Offline'}</span>
          </div>
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#FCDFD7' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col shadow-xs"
          >
            <span style={{ color: '#8C6558' }} className="text-[9px] font-sans font-bold uppercase">ENGINE</span>
            <span style={{ color: '#2D1A12' }} className="font-bold text-xs truncate mt-0.5" title={diagnostics.engine}>
              {activeDb ? (diagnostics.engine?.includes('Distributed') ? 'Distributed' : diagnostics.engine) : 'Standby'}
            </span>
          </div>
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#FCDFD7' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col shadow-xs"
          >
            <span style={{ color: '#8C6558' }} className="text-[9px] font-sans font-bold uppercase">PING</span>
            <span style={{ color: activeDb ? '#059669' : '#8C6558' }} className="font-bold text-xs mt-0.5">
              {activeDb ? `${latencyMs} ms` : 'Offline'}
            </span>
          </div>
        </div>

        <div
          style={{ borderColor: '#F5CEBE' }}
          className="pt-2 border-t flex items-center justify-between text-xs"
        >
          <span style={{ color: '#7C584C' }} className="font-medium text-[11px]">
            Health: <strong style={{ color: activeDb ? '#2D1A12' : '#E11D48' }}>{activeDb ? diagnostics.health : 'Disconnected (Offline)'}</strong>
          </span>
          <button
            type="button"
            onClick={() => onPingDatabase()}
            disabled={isPinging || !activeDb}
            style={{ color: activeDb ? '#059669' : '#8C6558' }}
            className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              activeDb ? 'hover:underline' : 'cursor-not-allowed'
            }`}
          >
            {activeDb ? 'Ping TiDB Now →' : 'Database Offline'}
          </button>
        </div>
      </div>

      {/* Card 2: GeoHub API Gateway (Light Peach Theme) */}
      <div
        style={{ backgroundColor: '#FFF2EB', borderColor: '#FCDFD7' }}
        className="cockpit-card p-3 sm:p-3.5 rounded-2xl border shadow-sm space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              style={{
                backgroundColor: activeBackend ? '#EFF6FF' : '#FEF3C7',
                borderColor: activeBackend ? '#BFDBFE' : '#FDE68A',
                color: activeBackend ? '#2563EB' : '#D97706',
              }}
              className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors"
            >
              <Server size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 style={{ color: '#2D1A12' }} className="text-xs sm:text-sm font-black truncate">
                  GeoHub API Gateway
                </h3>
                <span
                  style={{
                    backgroundColor: activeBackend ? '#EFF6FF' : '#FEF3C7',
                    borderColor: activeBackend ? '#BFDBFE' : '#FDE68A',
                    color: activeBackend ? '#1D4ED8' : '#B45309',
                  }}
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold border transition-colors shrink-0"
                >
                  {activeBackend ? 'Operational' : 'Maintenance'}
                </span>
                <span className="sr-only">Backend Connectivity</span>
              </div>
              <p
                style={{ color: '#7C584C' }}
                className="text-[11px] font-mono truncate max-w-[170px] sm:max-w-md block mt-0.5"
              >
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
            style={{ backgroundColor: '#FEF3C7', borderColor: '#FDE68A', color: '#92400E' }}
            className="p-2 rounded-xl border text-[11px] flex items-center gap-2 animate-fadeIn font-medium"
          >
            <AlertTriangle size={13} className="text-amber-600 shrink-0" />
            <span>Backend offline. App is in Maintenance Mode (users see Under Maintenance).</span>
          </div>
        )}

        {/* 3 Pills in a row (Crisp White on Peach) */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5 font-mono">
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#FCDFD7' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col shadow-xs"
          >
            <span style={{ color: '#8C6558' }} className="text-[9px] font-sans font-bold uppercase">ROUTE</span>
            <span style={{ color: '#2D1A12' }} className="font-bold text-xs truncate mt-0.5">
              {activeBackend ? '/api/v1/health' : '/api/v1/health (Paused)'}
            </span>
          </div>
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#FCDFD7' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col shadow-xs"
          >
            <span style={{ color: '#8C6558' }} className="text-[9px] font-sans font-bold uppercase">ONLINE</span>
            <span style={{ color: '#2D1A12' }} className="font-bold text-xs truncate mt-0.5">
              {activeBackend ? `${overviewCounts.online} Sessions` : '0 Sessions (Offline)'}
            </span>
          </div>
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#FCDFD7' }}
            className="cockpit-pill border rounded-xl p-2 flex flex-col shadow-xs"
          >
            <span style={{ color: '#8C6558' }} className="text-[9px] font-sans font-bold uppercase">MODULES</span>
            <span style={{ color: activeBackend ? '#2563EB' : '#D97706' }} className="font-bold text-xs truncate mt-0.5">
              {activeBackend
                ? `${overviewCounts.modulesLive}/${overviewCounts.modulesTotal} Live`
                : '0 of 9 Online (Maintenance)'}
            </span>
          </div>
        </div>

        <div
          style={{ borderColor: '#F5CEBE' }}
          className="pt-2 border-t flex items-center justify-between text-xs"
        >
          <span style={{ color: '#7C584C' }} className="font-medium text-[11px]">
            API Gateway: <strong style={{ color: activeBackend ? '#2D1A12' : '#B45309' }}>{activeBackend ? 'Healthy & Synchronized' : 'Paused / Maintenance'}</strong>
          </span>
          <span style={{ color: activeBackend ? '#059669' : '#B45309' }} className="text-[11px] font-bold">
            {activeBackend ? 'Zero downtime' : 'Maintenance Active'}
          </span>
        </div>
      </div>

      {/* Quick Navigation Dock */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onNavigateTab('access')}
          style={{ backgroundColor: '#FFF2EB', borderColor: '#FCDFD7' }}
          className="cockpit-card flex items-center justify-center gap-1.5 p-2.5 rounded-xl border hover:border-emerald-500/50 text-center transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          <span style={{ color: '#2D1A12' }} className="text-xs font-bold">Role Access</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('features')}
          style={{ backgroundColor: '#FFF2EB', borderColor: '#FCDFD7' }}
          className="cockpit-card flex items-center justify-center gap-1.5 p-2.5 rounded-xl border hover:border-blue-500/50 text-center transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <UserPlus size={14} className="text-blue-600 shrink-0" />
          <span style={{ color: '#2D1A12' }} className="text-xs font-bold">Provision</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('logs')}
          style={{ backgroundColor: '#FFF2EB', borderColor: '#FCDFD7' }}
          className="cockpit-card flex items-center justify-center gap-1.5 p-2.5 rounded-xl border hover:border-purple-500/50 text-center transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <GraduationCap size={14} className="text-purple-600 shrink-0" />
          <span style={{ color: '#2D1A12' }} className="text-xs font-bold">Audit Logs</span>
        </button>
      </div>
    </div>
  );
};

export default HomeTab;
