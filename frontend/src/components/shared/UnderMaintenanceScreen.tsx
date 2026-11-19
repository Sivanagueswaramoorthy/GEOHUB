import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Server,
  Database,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Play,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APP_VERSION } from '../../config/version';
import { apiClient } from '../../api/client';

export interface UnderMaintenanceScreenProps {
  onRefresh?: () => void;
  onResumeBackend?: () => void;
  onBypassToCockpit?: () => void;
  isDbConnected?: boolean;
}

export const UnderMaintenanceScreen: React.FC<UnderMaintenanceScreenProps> = ({
  onRefresh,
  onResumeBackend,
  onBypassToCockpit,
  isDbConnected = true,
}) => {
  const { currentUser, setActiveTab, setIsBackendActive, setIsDbConnected } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdminUnlock, setShowAdminUnlock] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Real-time polling: automatically resumes when SuperAdmin turns backend back on from any device!
  useEffect(() => {
    let isCancelled = false;
    const interval = setInterval(async () => {
      try {
        const health = await apiClient.testServerHealth();
        if (isCancelled) return;
        if (health && typeof health.is_db_connected === 'boolean') {
          setIsDbConnected(health.is_db_connected);
        }
        if (health && health.is_backend_active === true) {
          if (onResumeBackend) {
            onResumeBackend();
          } else {
            setIsBackendActive(true);
            try {
              localStorage.setItem('geohub_backend_active', 'true');
            } catch {}
          }
        }
      } catch {}
    }, 3000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [onResumeBackend, setIsBackendActive, setIsDbConnected]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      const health = await apiClient.testServerHealth();
      if (typeof health.is_db_connected === 'boolean') {
        setIsDbConnected(health.is_db_connected);
      }
      if (health.is_backend_active === true) {
        if (onResumeBackend) {
          onResumeBackend();
        } else {
          setIsBackendActive(true);
        }
        return;
      }
    } catch {}

    if (!onRefresh) {
      const active = localStorage.getItem('geohub_backend_active') !== 'false';
      if (active) {
        window.location.reload();
      }
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = adminPin.trim();
    if (clean === 'geohub' || clean === 'SA01' || clean === '1234' || clean === 'superadmin') {
      if (onResumeBackend) {
        onResumeBackend();
      } else {
        localStorage.setItem('geohub_backend_active', 'true');
        window.location.reload();
      }
    } else {
      setPinError('Invalid SuperAdmin PIN. Use "geohub" or "SA01"');
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen w-full bg-[#F6FBF7] flex flex-col items-center justify-center p-4 sm:p-6 select-none"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 16px) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 24px)',
      }}
    >
      <div className="w-full max-w-md bg-white border border-[#DAF1DE] rounded-3xl p-6 sm:p-7 shadow-[0_12px_32px_rgba(5,31,32,0.06)] flex flex-col items-center text-center relative overflow-hidden animate-fadeIn">
        {/* Mascot / Icon Emblem (Clean, perfectly centered, zero overlapping) */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center shadow-2xs mb-3 relative z-10">
          <Wrench size={26} strokeWidth={2.2} className="animate-pulse" />
        </div>

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300 text-xs font-extrabold tracking-wide uppercase mb-3">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
          <span>Scheduled Maintenance</span>
        </div>

        {/* Main Title & Description */}
        <h1 className="text-xl sm:text-2xl font-black text-[#051F20] tracking-tight">
          System Under Maintenance
        </h1>
        <p className="text-xs sm:text-sm text-[#235347] font-medium leading-relaxed mt-2 max-w-sm mx-auto">
          GeoHub backend services are temporarily offline for routine cluster upgrades and database maintenance.
          Access will resume automatically as soon as operations complete.
        </p>

        {/* Real-time Infrastructure Status Breakdown */}
        <div className="w-full bg-[#F6FBF7] rounded-2xl p-4 border border-[#DAF1DE] mt-5 mb-5 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]">
            <span className="text-[#235347] font-bold flex items-center gap-1.5">
              <Server size={14} className="text-amber-700" />
              Backend REST API
            </span>
            <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
              ● Offline (Maintenance)
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]">
            <span className="text-[#235347] font-bold flex items-center gap-1.5">
              <Database size={14} className={isDbConnected ? 'text-emerald-700' : 'text-rose-700'} />
              TiDB Cloud Database
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-md border ${
                isDbConnected
                  ? 'text-emerald-900 bg-emerald-100 border-emerald-300'
                  : 'text-rose-900 bg-rose-100 border-rose-300'
              }`}
            >
              {isDbConnected ? '● Online (Standby)' : '● Disconnected'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#235347] pt-0.5 font-medium">
            <span>Production Version</span>
            <span className="font-mono font-bold text-[#051F20]">v{APP_VERSION} Production</span>
          </div>
        </div>

        {/* Primary Action: Check Connection */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full py-3 px-4 rounded-xl bg-[#051F20] hover:bg-[#163832] text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Checking System Status...' : 'Check Connection / Refresh'}</span>
        </button>

        {/* SuperAdmin Authority Controls (Direct when SuperAdmin is recognized) */}
        {isSuperAdmin && (
          <div className="w-full mt-4 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col gap-2.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" />
                SuperAdmin Authority
              </span>
              <span className="text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold uppercase">
                Root
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onResumeBackend && (
                <button
                  type="button"
                  onClick={onResumeBackend}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Resume Backend</span>
                </button>
              )}

              {onBypassToCockpit && (
                <button
                  type="button"
                  onClick={onBypassToCockpit}
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Cockpit</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* SuperAdmin Override for guest sessions / when not authenticated */}
        {!isSuperAdmin && (
          <div className="w-full mt-4 pt-3 border-t border-[#DAF1DE] flex flex-col items-center">
            {!showAdminUnlock ? (
              <button
                type="button"
                onClick={() => setShowAdminUnlock(true)}
                className="text-xs font-bold text-[#235347] hover:text-[#051F20] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Lock size={12} />
                <span>SuperAdmin Maintenance Bypass</span>
              </button>
            ) : (
              <form onSubmit={handleAdminPinSubmit} className="w-full space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      setPinError('');
                    }}
                    placeholder="Enter SuperAdmin PIN (geohub)"
                    className="flex-1 min-h-[38px] px-3 bg-white border border-[#DAF1DE] rounded-xl text-xs font-semibold text-[#051F20] focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    className="min-h-[38px] px-3.5 bg-[#051F20] hover:bg-[#163832] text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
                  >
                    Unlock
                  </button>
                </div>
                {pinError && <p className="text-xs font-bold text-rose-600 text-left">{pinError}</p>}
              </form>
            )}
          </div>
        )}
      </div>

      <p className="text-xs font-medium text-[#235347] mt-4">
        Green Eco Organization • Institutional Governance Portal
      </p>
    </div>
  );
};

export default UnderMaintenanceScreen;
