import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useSuperAdminState } from '../hooks/useSuperAdminState';
import { DesktopStudioSidebar, DesktopViewKey } from './DesktopStudioSidebar';
import { DesktopDashboardView } from './DesktopDashboardView';
import { DesktopTeamView } from './DesktopTeamView';
import { AccessTab } from '../tabs/AccessTab';
import { FeaturesTab } from '../tabs/FeaturesTab';
import { LogsTab } from '../tabs/LogsTab';
import { FacultyFormModal } from '../modals/FacultyFormModal';
import { StudentFormModal } from '../modals/StudentFormModal';
import { Toast } from '../ui/Toast';
import { apiClient } from '../../../api/client';
import {
  Search,
  X,
  Megaphone,
  Database,
  RotateCw,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Users,
  LayoutDashboard,
  KeyRound,
  UserPlus,
  Clock,
} from 'lucide-react';

interface SuperAdminDesktopStudioProps {
  state: ReturnType<typeof useSuperAdminState>;
}

export const SuperAdminDesktopStudio: React.FC<SuperAdminDesktopStudioProps> = ({ state }) => {
  const { isPhoneFrame, setIsPhoneFrame, setCurrentUser, currentUser } = useApp();
  const [activeView, setActiveView] = useState<DesktopViewKey>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Broadcast modal fields
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastUrgency, setBroadcastUrgency] = useState<'normal' | 'critical'>('normal');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsBroadcastOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalMembers = state.faculty.length + state.students.length;

  // Handle broadcast submission
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setIsSendingBroadcast(true);
    try {
      await apiClient.broadcastNotification({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        type: 'super_admin_broadcast',
        urgency: broadcastUrgency === 'critical' ? 'urgent' : 'normal',
      });
      state.showToast('Campus-wide broadcast dispatched successfully');
      setBroadcastTitle('');
      setBroadcastMessage('');
      setIsBroadcastOpen(false);
    } catch {
      state.showToast('Failed to dispatch broadcast');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    setCurrentUser(null as any);
  };

  return (
    <div
      className="w-full min-h-screen flex relative overflow-hidden select-none"
      style={{
        backgroundColor: '#F6FBF7',
        color: '#051F20',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* Subtle Ambient Mint & Forest Glow Orbs */}
      <div
        className="fixed top-[-100px] left-[15%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, #8EB69B 0%, transparent 70%)',
          filter: 'blur(70px)',
          zIndex: 0,
        }}
      />
      <div
        className="fixed bottom-[-150px] right-[10%] w-[700px] h-[700px] rounded-full pointer-events-none opacity-15"
        style={{
          background: 'radial-gradient(circle, #DAF1DE 0%, transparent 75%)',
          filter: 'blur(90px)',
          zIndex: 0,
        }}
      />

      {/* 1. Frosted Sidebar */}
      <DesktopStudioSidebar
        activeView={activeView}
        onSelectView={(v) => setActiveView(v)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        totalMembersCount={totalMembers}
        dbLatencyMs={state.latencyMs}
        isDbConnected={state.isDbConnected}
        isFreezeMode={state.isFreezeMode}
        onToggleFreeze={state.toggleFreezeMode}
        isPhoneFrame={Boolean(isPhoneFrame)}
        onTogglePhoneFrame={() => setIsPhoneFrame?.(!isPhoneFrame)}
        onOpenSearchDialog={() => setIsSearchOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* 2. Main Scrollable Canvas */}
      <main
        className="flex-1 min-w-0 h-screen overflow-y-auto px-6 py-6 lg:px-10 lg:py-8 z-10 transition-all duration-300"
        tabIndex={-1}
      >
        {activeView === 'dashboard' && (
          <DesktopDashboardView
            overviewCounts={state.overviewCounts}
            diagnostics={state.diagnostics}
            latencyMs={state.latencyMs}
            isPinging={state.isPinging}
            onPingDatabase={state.pingDatabase}
            onNavigateView={(v) => setActiveView(v)}
            onOpenAddMember={() => setIsAddStudentOpen(true)}
            onOpenBroadcast={() => setIsBroadcastOpen(true)}
            isFreezeMode={state.isFreezeMode}
            onToggleFreeze={state.toggleFreezeMode}
            showToast={state.showToast}
          />
        )}

        {activeView === 'team' && (
          <DesktopTeamView
            faculty={state.faculty}
            students={state.students}
            onlineUsers={state.onlineUsers}
            onOpenAddMember={() => setIsAddStudentOpen(true)}
            onDeleteMember={async (id, kind) => {
              await state.deleteMember(id, kind);
            }}
            onToggleSuspendMember={async (id, kind) => {
              await state.toggleSuspendMember(id, kind);
            }}
            onAssignMemberPost={async (id, post, role, squad) => {
              await state.assignMemberPost(id, post, role || 'student', squad);
            }}
            showToast={state.showToast}
          />
        )}

        {activeView === 'access' && (
          <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
            <header className="flex flex-col gap-1 pt-1">
              <h1 className="text-2xl md:text-3xl font-black text-[#051F20] tracking-tight">
                Role Access & Permissions
              </h1>
              <p className="text-xs md:text-sm font-medium text-[#235347]">
                Configure global module clearances across academic roles and leadership tiers
              </p>
            </header>

            <div className="rounded-[28px] border border-[#DAF1DE] bg-white/70 backdrop-blur-md p-6 shadow-xs">
              <AccessTab
                modules={state.modules}
                roles={state.rolesCredentials}
                roleModuleAccess={state.roleModuleAccess}
                onToggleRoleModule={state.toggleRoleModuleAccess}
                onSetAllRoleModules={state.setAllRoleModuleAccess}
              />
            </div>
          </div>
        )}

        {activeView === 'provisioning' && (
          <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
            <header className="flex items-center justify-between gap-4 pt-1">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-black text-[#051F20] tracking-tight">
                  Campus Provisioning Studio
                </h1>
                <p className="text-xs md:text-sm font-medium text-[#235347]">
                  Enroll student scholars and onboard faculty advisors directly into TiDB Cloud
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddFacultyOpen(true)}
                  className="px-4 py-2 rounded-full border border-[#DAF1DE] bg-white/80 hover:bg-[#DAF1DE] text-[#051F20] text-xs font-bold transition-all cursor-pointer"
                >
                  + Add Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#051F20] hover:bg-[#163832] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  + Add Scholar
                </button>
              </div>
            </header>

            <div className="rounded-[28px] border border-[#DAF1DE] bg-white/70 backdrop-blur-md p-6 shadow-xs">
              <FeaturesTab
                onAddStudent={state.addStudent}
                onAddFaculty={state.addFaculty}
                onNavigateTab={(tab) => state.setActiveTab(tab)}
              />
            </div>
          </div>
        )}

        {activeView === 'logs' && (
          <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
            <header className="flex flex-col gap-1 pt-1">
              <h1 className="text-2xl md:text-3xl font-black text-[#051F20] tracking-tight">
                Activity Logs & Audit Trail
              </h1>
              <p className="text-xs md:text-sm font-medium text-[#235347]">
                Live campus operations telemetry, login sessions, and member security access logs
              </p>
            </header>

            <div className="rounded-[28px] border border-[#DAF1DE] bg-white/70 backdrop-blur-md p-6 shadow-xs">
              <LogsTab
                members={state.allMembers}
                modules={state.modules}
                onToggleSuspend={state.toggleSuspendMember}
                onDeleteMember={state.deleteMember}
                onUpdateMemberModules={state.updateMemberModules}
                onAssignPost={state.assignMemberPost}
              />
            </div>
          </div>
        )}

        {activeView === 'database' && (
          <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
            <header className="flex items-center justify-between gap-4 pt-1">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-black text-[#051F20] tracking-tight">
                  TiDB Cloud Diagnostics & Telemetry
                </h1>
                <p className="text-xs md:text-sm font-medium text-[#235347]">
                  Real-time database connection metrics, query latencies, and distributed table health
                </p>
              </div>

              <button
                type="button"
                onClick={() => state.pingDatabase()}
                disabled={state.isPinging}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#051F20] hover:bg-[#163832] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RotateCw size={14} className={state.isPinging ? 'animate-spin' : ''} />
                <span>{state.isPinging ? 'Pinging Cloud...' : 'Ping Latency'}</span>
              </button>
            </header>

            {/* Cloud Health Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-[24px] border border-[#DAF1DE] bg-white/80 backdrop-blur-md shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#235347]">
                    Ping Latency
                  </span>
                  <Activity size={18} className="text-[#235347]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#051F20]">{state.latencyMs}</span>
                  <span className="text-xs font-bold text-[#235347]">milliseconds</span>
                </div>
                <p className="text-xs font-medium text-[#235347]/70 mt-2">
                  Round-trip ping time between client and TiDB Cloud Serverless instance.
                </p>
              </div>

              <div className="p-6 rounded-[24px] border border-[#DAF1DE] bg-white/80 backdrop-blur-md shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#235347]">
                    Engine & Protocol
                  </span>
                  <Database size={18} className="text-[#235347]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#051F20]">TiDB</span>
                  <span className="text-xs font-bold text-[#8EB69B]">v8.1.0 Cloud</span>
                </div>
                <p className="text-xs font-medium text-[#235347]/70 mt-2">
                  TLS 1.3 encrypted cluster with automated distributed sharding.
                </p>
              </div>

              <div className="p-6 rounded-[24px] border border-[#DAF1DE] bg-white/80 backdrop-blur-md shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#235347]">
                    Connection State
                  </span>
                  <Server size={18} className="text-[#235347]" />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      state.isDbConnected ? 'bg-[#235347]' : 'bg-[#D9534F]'
                    }`}
                  />
                  <span className="text-2xl font-black text-[#051F20]">
                    {state.isDbConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#235347]/70 mt-2">
                  Cloud gateway endpoint is actively serving read/write queries.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. Global ⌘K Quick Command Palette Modal                                  */}
      {/* ========================================================================= */}
      {isSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#051F20]/50 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl max-w-xl w-full p-4 overflow-hidden">
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-3 py-2 border-b border-[#DAF1DE]">
              <Search size={18} className="text-[#235347]" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or jump to screen... (e.g. team, ping, lock)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold text-[#051F20] placeholder-[#235347]/50 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="w-7 h-7 rounded-full bg-[#DAF1DE]/60 hover:bg-[#DAF1DE] text-[#051F20] flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="flex flex-col gap-1 py-3 max-h-80 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveView('dashboard');
                  setIsSearchOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#DAF1DE]/40 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={16} className="text-[#235347]" />
                  <span className="text-xs font-bold text-[#051F20]">Go to Studio Dashboard</span>
                </div>
                <ArrowRight size={14} className="text-[#235347]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('team');
                  setIsSearchOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#DAF1DE]/40 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-[#235347]" />
                  <span className="text-xs font-bold text-[#051F20]">Inspect Your Team Directory</span>
                </div>
                <ArrowRight size={14} className="text-[#235347]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('access');
                  setIsSearchOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#DAF1DE]/40 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <KeyRound size={16} className="text-[#235347]" />
                  <span className="text-xs font-bold text-[#051F20]">Open Role Clearance Matrix</span>
                </div>
                <ArrowRight size={14} className="text-[#235347]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setIsAddStudentOpen(true);
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#DAF1DE]/40 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <UserPlus size={16} className="text-[#235347]" />
                  <span className="text-xs font-bold text-[#051F20]">+ Onboard New Scholar</span>
                </div>
                <ArrowRight size={14} className="text-[#235347]" />
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsSearchOpen(false);
                  await state.pingDatabase();
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#DAF1DE]/40 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <RotateCw size={16} className="text-[#235347]" />
                  <span className="text-xs font-bold text-[#051F20]">Ping TiDB Cloud Latency</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#235347]">{state.latencyMs}ms</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  state.toggleFreezeMode();
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-red-50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-[#D9534F]" />
                  <span className="text-xs font-bold text-[#D9534F]">
                    {state.isFreezeMode ? 'Lift Maintenance Freeze' : 'Activate Maintenance Freeze'}
                  </span>
                </div>
                <ArrowRight size={14} className="text-[#D9534F]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. Campus Broadcast Push Alert Modal                                      */}
      {/* ========================================================================= */}
      {isBroadcastOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-sm"
        >
          <form
            onSubmit={handleSendBroadcast}
            className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl max-w-lg w-full p-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#DAF1DE]">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-[#235347]" />
                <h3 className="text-base font-bold text-[#051F20]">Campus Broadcast Alert</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastOpen(false)}
                className="w-8 h-8 rounded-full bg-[#DAF1DE]/60 hover:bg-[#DAF1DE] text-[#051F20] flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4 py-4">
              <p className="text-xs font-medium text-[#235347]">
                Dispatch an instant push banner to all enrolled student scholars and faculty members.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#051F20]">Broadcast Headline *</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Symposium Registration Gate Open"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DAF1DE] text-xs font-medium text-[#051F20] focus:outline-hidden focus:border-[#235347]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#051F20]">Alert Message Body *</label>
                <textarea
                  required
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Provide urgent notices or campus updates..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DAF1DE] text-xs font-medium text-[#051F20] focus:outline-hidden focus:border-[#235347] resize-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#051F20]">
                  <input
                    type="radio"
                    name="urgency"
                    checked={broadcastUrgency === 'normal'}
                    onChange={() => setBroadcastUrgency('normal')}
                    className="accent-[#051F20]"
                  />
                  <span>Normal Broadcast</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#D9534F]">
                  <input
                    type="radio"
                    name="urgency"
                    checked={broadcastUrgency === 'critical'}
                    onChange={() => setBroadcastUrgency('critical')}
                    className="accent-[#D9534F]"
                  />
                  <span>Critical High Priority</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DAF1DE]">
              <button
                type="button"
                onClick={() => setIsBroadcastOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#235347] hover:bg-[#DAF1DE]/40 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSendingBroadcast}
                className="px-4 py-2 rounded-xl bg-[#051F20] hover:bg-[#163832] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSendingBroadcast ? 'Dispatching...' : 'Dispatch Broadcast'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. Onboarding Modals                                                      */}
      {/* ========================================================================= */}
      <FacultyFormModal
        isOpen={isAddFacultyOpen}
        onClose={() => setIsAddFacultyOpen(false)}
        onSave={async (fac) => {
          await state.saveFaculty(fac);
          setIsAddFacultyOpen(false);
        }}
      />

      <StudentFormModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSave={async (std) => {
          await state.saveStudent(std);
          setIsAddStudentOpen(false);
        }}
      />

      {/* 6. Active Toast Alerts */}
      {state.toast && (
        <Toast
          message={state.toast.message}
          onUndo={state.toast.onUndo}
          onClose={state.hideToast}
        />
      )}
    </div>
  );
};

export default SuperAdminDesktopStudio;
