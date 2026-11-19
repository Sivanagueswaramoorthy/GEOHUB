import React from 'react';
import {
  LayoutDashboard,
  Users,
  KeyRound,
  UserPlus,
  Clock,
  Database,
  Smartphone,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  LogOut,
} from 'lucide-react';

export type DesktopViewKey =
  | 'dashboard'
  | 'team'
  | 'access'
  | 'provisioning'
  | 'logs'
  | 'database';

interface DesktopStudioSidebarProps {
  activeView: DesktopViewKey;
  onSelectView: (view: DesktopViewKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  totalMembersCount: number;
  dbLatencyMs: number;
  isDbConnected: boolean;
  isFreezeMode: boolean;
  onToggleFreeze: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  onOpenSearchDialog: () => void;
  onSignOut: () => void;
}

export const DesktopStudioSidebar: React.FC<DesktopStudioSidebarProps> = ({
  activeView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  totalMembersCount,
  dbLatencyMs,
  isDbConnected,
  isFreezeMode,
  onToggleFreeze,
  isPhoneFrame,
  onTogglePhoneFrame,
  onOpenSearchDialog,
  onSignOut,
}) => {
  return (
    <aside
      className={`relative shrink-0 flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(142, 182, 155, 0.28)',
        minHeight: '100vh',
      }}
    >
      {/* Top Header & Navigation Links */}
      <div className="flex flex-col p-3">
        {/* Workspace Brand Capsule & Collapse Toggle */}
        <div className="flex items-center justify-between gap-2 px-2 py-3 mb-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #051F20 0%, #163832 100%)',
                border: '1px solid rgba(142, 182, 155, 0.35)',
              }}
            >
              <Shield size={20} className="text-[#DAF1DE]" strokeWidth={2.2} />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-[#051F20] tracking-tight truncate leading-snug">
                  GEO HUB
                </span>
                <span className="text-xs font-semibold text-[#235347] truncate">
                  Master Studio
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-7 h-7 rounded-full bg-[#DAF1DE]/70 hover:bg-[#DAF1DE] text-[#051F20] flex items-center justify-center shrink-0 transition-colors cursor-pointer border border-[#8EB69B]/30"
          >
            {isCollapsed ? (
              <ChevronRight size={14} strokeWidth={2.5} />
            ) : (
              <ChevronLeft size={14} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Quick Search Command Capsule */}
        <button
          type="button"
          onClick={onOpenSearchDialog}
          title="Search studio actions and members (⌘K)"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border transition-all mb-4 cursor-pointer text-left ${
            isCollapsed
              ? 'justify-center border-[#DAF1DE] bg-white/80 hover:bg-[#DAF1DE]/40'
              : 'border-[#DAF1DE] bg-white/75 hover:bg-[#DAF1DE]/40 shadow-2xs'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#163832] to-[#8EB69B] flex items-center justify-center shrink-0 shadow-xs">
            <Search size={12} className="text-[#DAF1DE]" strokeWidth={2.5} />
          </div>

          {!isCollapsed && (
            <>
              <span className="text-xs font-medium text-[#235347] truncate flex-1">
                Quick search...
              </span>
              <span className="text-xs font-bold font-mono text-[#163832] bg-[#DAF1DE]/80 px-1.5 py-0.5 rounded-md border border-[#8EB69B]/40">
                ⌘K
              </span>
            </>
          )}
        </button>

        {/* Navigation Group: MAIN */}
        <div className="flex flex-col mb-4">
          {!isCollapsed && (
            <span className="text-xs font-black uppercase tracking-wider text-[#235347]/80 px-3 mb-1.5">
              Main
            </span>
          )}

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onSelectView('dashboard')}
              title="Studio Executive Dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-white/80'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LayoutDashboard size={18} strokeWidth={2.2} />
              {!isCollapsed && <span className="truncate">Dashboard</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectView('team')}
              title="Campus Team & Directory"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'team'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-white/80'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Users size={18} strokeWidth={2.2} />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">Your Team</span>
                  {totalMembersCount > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        activeView === 'team'
                          ? 'bg-[#163832] text-[#DAF1DE]'
                          : 'bg-[#DAF1DE] text-[#051F20]'
                      }`}
                    >
                      {totalMembersCount}
                    </span>
                  )}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectView('access')}
              title="Role & Matrix Clearances"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'access'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-white/80'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <KeyRound size={18} strokeWidth={2.2} />
              {!isCollapsed && <span className="truncate">Access & Roles</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectView('provisioning')}
              title="Student & Faculty Onboarding"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'provisioning'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-white/80'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <UserPlus size={18} strokeWidth={2.2} />
              {!isCollapsed && <span className="truncate">Provisioning</span>}
            </button>
          </div>
        </div>

        {/* Navigation Group: OPERATIONS */}
        <div className="flex flex-col mb-4">
          {!isCollapsed && (
            <span className="text-xs font-black uppercase tracking-wider text-[#235347]/80 px-3 mb-1.5">
              Operations
            </span>
          )}

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onSelectView('logs')}
              title="Campus Audit Trails & System Logs"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'logs'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-white/80'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Clock size={18} strokeWidth={2.2} />
              {!isCollapsed && <span className="truncate">Activity Logs</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectView('database')}
              title="TiDB Cloud Diagnostics & Telemetry"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'database'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#163832] hover:bg-white/80'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Database size={18} strokeWidth={2.2} />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">TiDB Cloud</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isDbConnected
                        ? 'bg-[#DAF1DE] text-[#051F20]'
                        : 'bg-red-100 text-[#D9534F]'
                    }`}
                  >
                    {dbLatencyMs}ms
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Group: SYSTEM */}
        <div className="flex flex-col mb-2">
          {!isCollapsed && (
            <span className="text-xs font-black uppercase tracking-wider text-[#235347]/80 px-3 mb-1.5">
              System
            </span>
          )}

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={onTogglePhoneFrame}
              title={isPhoneFrame ? 'Return to Desktop Canvas' : 'Preview Mobile Frame Layout'}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isPhoneFrame
                  ? 'bg-[#235347] text-white'
                  : 'text-[#163832] hover:bg-white/80'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Smartphone size={18} strokeWidth={2.2} />
              {!isCollapsed && (
                <span className="truncate">
                  {isPhoneFrame ? 'Exit Mobile Frame' : 'Mobile Frame'}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onToggleFreeze}
              title={isFreezeMode ? 'Lift Campus Freeze' : 'Activate Maintenance Freeze'}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isFreezeMode
                  ? 'bg-[#D9534F] text-white'
                  : 'text-[#163832] hover:bg-white/80'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isFreezeMode ? (
                <Lock size={18} strokeWidth={2.2} />
              ) : (
                <Unlock size={18} strokeWidth={2.2} />
              )}
              {!isCollapsed && (
                <span className="truncate">
                  {isFreezeMode ? 'Freeze Active' : 'Maintenance Lock'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SuperAdmin Profile Footer Capsule */}
      <div className="p-3 border-t border-[#DAF1DE]/70">
        <div
          className={`flex items-center gap-3 p-2 rounded-2xl bg-white/70 border border-[#DAF1DE]/60 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-[#051F20] text-[#DAF1DE] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
            SA
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-black text-[#051F20] truncate">
                SuperAdmin Root
              </span>
              <span className="text-xs font-medium text-[#235347] truncate">
                superadmin@geohub.edu
              </span>
            </div>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={onSignOut}
              title="Sign Out"
              aria-label="Sign out"
              className="w-7 h-7 rounded-xl hover:bg-[#DAF1DE]/60 text-[#235347] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <LogOut size={14} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DesktopStudioSidebar;
