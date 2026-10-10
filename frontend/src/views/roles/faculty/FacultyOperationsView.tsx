import React, { useState } from 'react';
import {
  FileText,
  CheckSquare,
  Calendar,
  MessageSquare,
  FileCheck,
  Newspaper,
  Camera,
  Video,
  Image,
  Send,
  Sparkles,
  Download,
  Award,
  ListTodo,
  DollarSign,
  BarChart3,
  Layers,
  Archive,
  Scan,
  ClipboardList,
  QrCode,
  Bell,
  Star,
  Megaphone,
  ShieldCheck,
  PackagePlus,
  Settings,
  Check,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { getRolePermissions } from '../../../core/permissions';
import { ShortcutTile } from '../../../components/ShortcutTile';
import { CategoryCard } from '../../../components/CategoryCard';
import { ModuleTile } from '../../../components/ModuleTile';
import { BottomSheet } from '../../../components/BottomSheet';
import { Toast } from '../../../components/Toast';

export const FacultyOperationsView: React.FC = () => {
  const {
    currentUser,
    setActiveTab,
    attendance,
    approvals,
    tasks,
    users,
    events,
    gallery,
    expenses,
    stockItems,
    posts,
    campaigns,
    dailyNews,
    changeStudentPost,
  } = useApp();

  const perms = getRolePermissions(currentUser.role);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const [adminDeptFilter, setAdminDeptFilter] = useState<
    'All' | 'Documentation' | 'Promotion' | 'Management' | 'Treasurer' | 'Attendance' | 'Communication'
  >('All');

  // Governance Modals
  const [isPostsModalOpen, setIsPostsModalOpen] = useState(false);
  const [selectedStudentForPost, setSelectedStudentForPost] = useState(users[0]?.uid || '');
  const [targetPost, setTargetPost] = useState('Promotion Lead');
  const [targetRole, setTargetRole] = useState<'team_admin' | 'member'>('team_admin');

  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [tenurePeriod, setTenurePeriod] = useState('Fall 2026 - Spring 2027');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [gateSmsAlerts, setGateSmsAlerts] = useState(false);

  // Treasurer Audit & Allocation Modals
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isAuditReportExportOpen, setIsAuditReportExportOpen] = useState(false);

  const handleModuleClick = (tab: string) => {
    setActiveTab(tab as any);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('✓ Chapter governance settings updated!');
    setIsSettingsOpen(false);
  };

  const handleAssignPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPost) return;
    const targetUser = users.find((u) => u.uid === selectedStudentForPost);
    if (!targetUser) return;
    changeStudentPost(targetUser.uid, targetPost, targetRole);
    showToast(`✓ Confirmed: Assigned ${targetPost} to ${targetUser.name}!`);
    setIsPostsModalOpen(false);
  };

  const showDocDomain = adminDeptFilter === 'All' || adminDeptFilter === 'Documentation';
  const showPromoDomain = adminDeptFilter === 'All' || adminDeptFilter === 'Promotion';
  const showMgmtDomain = adminDeptFilter === 'All' || adminDeptFilter === 'Management';
  const showTreasuryDomain = adminDeptFilter === 'All' || adminDeptFilter === 'Treasurer';
  const showAttendanceDomain = adminDeptFilter === 'All' || adminDeptFilter === 'Attendance';
  const showCommDomain = adminDeptFilter === 'All' || adminDeptFilter === 'Communication';

  const domainTabs = [
    {
      id: 'All',
      label: 'All Modules',
      count: 20,
      icon: Layers,
      activeBg: '#EFF6FF',
      activeBorder: '#3B82F6',
      activeColor: '#1D4ED8',
      activeIconBg: '#DBEAFE',
      activeIconBorder: '#BFDBFE',
      activeIconColor: '#2563EB',
      activeBadgeBg: '#DBEAFE',
      activeBadgeBorder: '#BFDBFE',
      activeBadgeColor: '#1D4ED8',
      inactiveBg: '#FFFFFF',
      inactiveBorder: '#E2E8F0',
      inactiveColor: '#334155',
      inactiveIconBg: '#F1F5F9',
      inactiveIconBorder: '#E2E8F0',
      inactiveIconColor: '#475569',
      inactiveBadgeBg: '#F8FAFC',
      inactiveBadgeBorder: '#E2E8F0',
      inactiveBadgeColor: '#64748B',
    },
    {
      id: 'Documentation',
      label: 'Documentation',
      count: 7,
      icon: FileText,
      activeBg: '#ECFDF5',
      activeBorder: '#10B981',
      activeColor: '#065F46',
      activeIconBg: '#D1FAE5',
      activeIconBorder: '#A7F3D0',
      activeIconColor: '#059669',
      activeBadgeBg: '#D1FAE5',
      activeBadgeBorder: '#A7F3D0',
      activeBadgeColor: '#065F46',
      inactiveBg: '#FFFFFF',
      inactiveBorder: '#E2E8F0',
      inactiveColor: '#334155',
      inactiveIconBg: '#ECFDF5',
      inactiveIconBorder: '#A7F3D0',
      inactiveIconColor: '#059669',
      inactiveBadgeBg: '#F8FAFC',
      inactiveBadgeBorder: '#E2E8F0',
      inactiveBadgeColor: '#64748B',
    },
    {
      id: 'Promotion',
      label: 'Promotion',
      count: 4,
      icon: Megaphone,
      activeBg: '#FFF1F2',
      activeBorder: '#F43F5E',
      activeColor: '#9F1239',
      activeIconBg: '#FFE4E6',
      activeIconBorder: '#FECDD3',
      activeIconColor: '#E11D48',
      activeBadgeBg: '#FFE4E6',
      activeBadgeBorder: '#FECDD3',
      activeBadgeColor: '#9F1239',
      inactiveBg: '#FFFFFF',
      inactiveBorder: '#E2E8F0',
      inactiveColor: '#334155',
      inactiveIconBg: '#FFF1F2',
      inactiveIconBorder: '#FECDD3',
      inactiveIconColor: '#E11D48',
      inactiveBadgeBg: '#F8FAFC',
      inactiveBadgeBorder: '#E2E8F0',
      inactiveBadgeColor: '#64748B',
    },
    {
      id: 'Management',
      label: 'Management',
      count: 5,
      icon: ShieldCheck,
      activeBg: '#EEF2FF',
      activeBorder: '#6366F1',
      activeColor: '#3730A3',
      activeIconBg: '#E0E7FF',
      activeIconBorder: '#C7D2FE',
      activeIconColor: '#4F46E5',
      activeBadgeBg: '#E0E7FF',
      activeBadgeBorder: '#C7D2FE',
      activeBadgeColor: '#3730A3',
      inactiveBg: '#FFFFFF',
      inactiveBorder: '#E2E8F0',
      inactiveColor: '#334155',
      inactiveIconBg: '#EEF2FF',
      inactiveIconBorder: '#C7D2FE',
      inactiveIconColor: '#4F46E5',
      inactiveBadgeBg: '#F8FAFC',
      inactiveBadgeBorder: '#E2E8F0',
      inactiveBadgeColor: '#64748B',
    },
    {
      id: 'Treasurer',
      label: 'Treasurer',
      count: 6,
      icon: DollarSign,
      activeBg: '#FFFBEB',
      activeBorder: '#F59E0B',
      activeColor: '#92400E',
      activeIconBg: '#FEF3C7',
      activeIconBorder: '#FDE68A',
      activeIconColor: '#D97706',
      activeBadgeBg: '#FEF3C7',
      activeBadgeBorder: '#FDE68A',
      activeBadgeColor: '#92400E',
      inactiveBg: '#FFFFFF',
      inactiveBorder: '#E2E8F0',
      inactiveColor: '#334155',
      inactiveIconBg: '#FEF3C7',
      inactiveIconBorder: '#FDE68A',
      inactiveIconColor: '#D97706',
      inactiveBadgeBg: '#F8FAFC',
      inactiveBadgeBorder: '#E2E8F0',
      inactiveBadgeColor: '#64748B',
    },
    {
      id: 'Attendance',
      label: 'Gates & Attendance',
      count: 3,
      icon: QrCode,
      activeBg: '#F0F9FF',
      activeBorder: '#0EA5E9',
      activeColor: '#075985',
      activeIconBg: '#E0F2FE',
      activeIconBorder: '#BAE6FD',
      activeIconColor: '#0284C7',
      activeBadgeBg: '#E0F2FE',
      activeBadgeBorder: '#BAE6FD',
      activeBadgeColor: '#075985',
      inactiveBg: '#FFFFFF',
      inactiveBorder: '#E2E8F0',
      inactiveColor: '#334155',
      inactiveIconBg: '#F0F9FF',
      inactiveIconBorder: '#BAE6FD',
      inactiveIconColor: '#0284C7',
      inactiveBadgeBg: '#F8FAFC',
      inactiveBadgeBorder: '#E2E8F0',
      inactiveBadgeColor: '#64748B',
    },
    {
      id: 'Communication',
      label: 'Communication',
      count: 2,
      icon: MessageSquare,
      activeBg: '#FAF5FF',
      activeBorder: '#A855F7',
      activeColor: '#6B21A8',
      activeIconBg: '#F3E8FF',
      activeIconBorder: '#E9D5FF',
      activeIconColor: '#7E22CE',
      activeBadgeBg: '#F3E8FF',
      activeBadgeBorder: '#E9D5FF',
      activeBadgeColor: '#6B21A8',
      inactiveBg: '#FFFFFF',
      inactiveBorder: '#E2E8F0',
      inactiveColor: '#334155',
      inactiveIconBg: '#FAF5FF',
      inactiveIconBorder: '#E9D5FF',
      inactiveIconColor: '#9333EA',
      inactiveBadgeBg: '#F8FAFC',
      inactiveBadgeBorder: '#E2E8F0',
      inactiveBadgeColor: '#64748B',
    },
  ];

  return (
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMsg && (
        <Toast message={toastMsg} type="success" onClose={() => setToastMsg(null)} />
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Faculty Advisor
          </span>
          <span className="text-[11px] font-semibold text-slate-400">Executive Command Suite</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Faculty Operations Hub</h1>
      </div>

      {/* Shortcuts */}
      <div
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          maxWidth: '480px',
          gap: '8px',
        }}
      >
        <ShortcutTile
          label="Approvals"
          icon={<CheckSquare size={20} />}
          iconBg="#FFF8E6"
          iconBorder="#FDE68A"
          iconColor="#92400E"
          badge={approvals.filter((a) => a.status === 'pending').length || 3}
          onClick={() => handleModuleClick('approvals')}
        />

        <ShortcutTile
          label="Squad Leads"
          icon={<Award size={20} />}
          iconBg="#F3EEFF"
          iconBorder="#DDD1FF"
          iconColor="#5B21B6"
          onClick={() => setIsPostsModalOpen(true)}
        />

        <ShortcutTile
          label="Calendar"
          icon={<Calendar size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          iconColor="#1D4ED8"
          onClick={() => handleModuleClick('events')}
        />

        <ShortcutTile
          label="Settings"
          icon={<Settings size={20} />}
          iconBg="#F8FAFC"
          iconBorder="#E2E8F0"
          iconColor="#475569"
          onClick={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Domain Filter Section */}
      <div className="flex flex-col gap-2.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-extrabold tracking-wider uppercase text-[#1E3A8A]">
            OPERATIONS BY DOMAIN
          </span>
          <span className="text-[13px] font-bold text-[#2563EB] whitespace-nowrap">
            {adminDeptFilter === 'All' ? '20 Modules' : `${adminDeptFilter} Filtered`}
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 -mx-1">
          {domainTabs.map((tab) => {
            const active = adminDeptFilter === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAdminDeptFilter(tab.id as any)}
                className="shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-[18px] transition-all duration-200 cursor-pointer text-left select-none border"
                style={{
                  backgroundColor: active ? tab.activeBg : tab.inactiveBg,
                  borderColor: active ? tab.activeBorder : tab.inactiveBorder,
                  color: active ? tab.activeColor : tab.inactiveColor,
                }}
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: active ? tab.activeIconBg : tab.inactiveIconBg,
                    borderColor: active ? tab.activeIconBorder : tab.inactiveIconBorder,
                    color: active ? tab.activeIconColor : tab.inactiveIconColor,
                  }}
                >
                  <TabIcon size={14} strokeWidth={2.2} />
                </div>
                <div className="flex flex-col leading-tight pr-1">
                  <span className="text-xs font-bold tracking-tight">{tab.label}</span>
                  <span className="text-[11px] font-semibold opacity-70">
                    {tab.count} {tab.count === 1 ? 'module' : 'modules'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. DOCUMENTATION */}
      {showDocDomain && (
        <CategoryCard title="DOCUMENTATION & ARCHIVES" countBadge={7}>
          <ModuleTile
            title="Templates Prefilled"
            icon={<FileText size={20} />}
            iconBg="#E7F9F1"
            iconBorder="#A7F3D0"
            accentColor="#059669"
            onClick={() => handleModuleClick('doc_studio')}
          />
          <ModuleTile
            title="Checklist Audit"
            icon={<FileCheck size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            onClick={() => handleModuleClick('doc_studio')}
          />
          <ModuleTile
            title="Daily News Bulletin"
            icon={<Newspaper size={20} />}
            iconBg="#FFF8E6"
            iconBorder="#FDE68A"
            accentColor="#D97706"
            onClick={() => handleModuleClick('doc_studio')}
          />
          <ModuleTile
            title="Minutes of Meeting (MoM)"
            icon={<Calendar size={20} />}
            iconBg="#F5F3FF"
            iconBorder="#DDD1FF"
            accentColor="#7C3AED"
            onClick={() => handleModuleClick('meetings')}
          />
          <ModuleTile
            title="Geotagged Photo Records"
            icon={<Camera size={20} />}
            iconBg="#E8FBF8"
            iconBorder="#99F6E4"
            accentColor="#0D9488"
            onClick={() => handleModuleClick('gallery')}
          />
          <ModuleTile
            title="Video Archive Links"
            icon={<Video size={20} />}
            iconBg="#FEF2F2"
            iconBorder="#FECACA"
            accentColor="#DC2626"
            onClick={() => handleModuleClick('gallery')}
          />
          <ModuleTile
            title="Media Gallery Manager"
            icon={<Image size={20} />}
            iconBg="#FFF1F2"
            iconBorder="#FECDD3"
            accentColor="#E11D48"
            onClick={() => handleModuleClick('gallery')}
          />
        </CategoryCard>
      )}

      {/* 2. PROMOTION */}
      {showPromoDomain && (
        <CategoryCard title="PROMOTION & CAMPAIGNS" countBadge={4}>
          <ModuleTile
            title="Campaigns"
            icon={<Megaphone size={20} />}
            iconBg="#FFF1F2"
            iconBorder="#FECDD3"
            accentColor="#E11D48"
            onClick={() => handleModuleClick('campaigns')}
          />
          <ModuleTile
            title="Posts Studio"
            icon={<Send size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            onClick={() => handleModuleClick('social_media')}
          />
          <ModuleTile
            title="Content Calendar"
            icon={<Calendar size={20} />}
            iconBg="#F5F3FF"
            iconBorder="#DDD1FF"
            accentColor="#7C3AED"
            onClick={() => handleModuleClick('events')}
          />
          <ModuleTile
            title="Campaign Reach Export"
            icon={<Download size={20} />}
            iconBg="#E7F9F1"
            iconBorder="#A7F3D0"
            accentColor="#059669"
            onClick={() => showToast('✓ Generated Campaign Reach Summary (PDF)')}
          />
        </CategoryCard>
      )}

      {/* 3. MANAGEMENT & GOVERNANCE */}
      {showMgmtDomain && (
        <CategoryCard title="MANAGEMENT & GOVERNANCE" countBadge={5}>
          <ModuleTile
            title="Squad Leads & Posts"
            icon={<Award size={20} />}
            iconBg="#F3EEFF"
            iconBorder="#DDD1FF"
            accentColor="#5B21B6"
            onClick={() => setIsPostsModalOpen(true)}
          />
          <ModuleTile
            title="Master Duty Roster"
            icon={<ListTodo size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            onClick={() => handleModuleClick('tasks')}
          />
          <ModuleTile
            title="Meetings & MoM"
            icon={<Calendar size={20} />}
            iconBg="#F5F3FF"
            iconBorder="#DDD1FF"
            accentColor="#6D28D9"
            onClick={() => handleModuleClick('meetings')}
          />
          <ModuleTile
            title="Approvals"
            icon={<CheckSquare size={20} />}
            iconBg="#FFF8E6"
            iconBorder="#FDE68A"
            accentColor="#B45309"
            onClick={() => handleModuleClick('approvals')}
          />
          <ModuleTile
            title="Settings"
            icon={<Settings size={20} />}
            iconBg="#F8FAFC"
            iconBorder="#E2E8F0"
            accentColor="#475569"
            onClick={() => setIsSettingsOpen(true)}
          />
        </CategoryCard>
      )}

      {/* 4. TREASURER & FINANCE */}
      {showTreasuryDomain && (
        <CategoryCard title="TREASURER & FINANCE" countBadge={6}>
          <ModuleTile
            title="Expenses & Claims"
            icon={<DollarSign size={20} />}
            iconBg="#E7F9F1"
            iconBorder="#A7F3D0"
            accentColor="#059669"
            onClick={() => setActiveTab('treasurer')}
          />
          <ModuleTile
            title="Budget Overview"
            icon={<BarChart3 size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            onClick={() => setActiveTab('treasurer')}
          />
          <ModuleTile
            title="Allocation Requests"
            icon={<Layers size={20} />}
            iconBg="#F3EEFF"
            iconBorder="#DDD1FF"
            accentColor="#7C3AED"
            onClick={() => setIsAllocationModalOpen(true)}
          />
          <ModuleTile
            title="Stock Items"
            icon={<PackagePlus size={20} />}
            iconBg="#FFF8E6"
            iconBorder="#FDE68A"
            accentColor="#92400E"
            onClick={() => setActiveTab('treasurer')}
          />
          <ModuleTile
            title="Purchase History"
            icon={<FileText size={20} />}
            iconBg="#E8FBF8"
            iconBorder="#99F6E4"
            accentColor="#0D9488"
            onClick={() => setActiveTab('treasurer')}
          />
          <ModuleTile
            title="Fiscal Audit export"
            icon={<Download size={20} />}
            iconBg="#E7F9F1"
            iconBorder="#A7F3D0"
            accentColor="#059669"
            onClick={() => setIsAuditReportExportOpen(true)}
          />
        </CategoryCard>
      )}

      {/* 5. ATTENDANCE & GATES */}
      {showAttendanceDomain && (
        <CategoryCard title="ATTENDANCE & GATES" countBadge={3}>
          <ModuleTile
            title="Gate Scanner"
            icon={<Scan size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            onClick={() => handleModuleClick('scan_qr')}
          />
          <ModuleTile
            title="Live Gate Logs"
            icon={<ClipboardList size={20} />}
            iconBg="#E8FBF8"
            iconBorder="#99F6E4"
            accentColor="#0D9488"
            onClick={() => handleModuleClick('attendance')}
          />
          <ModuleTile
            title="Advisor Pass"
            icon={<QrCode size={20} />}
            iconBg="#F3EEFF"
            iconBorder="#DDD1FF"
            accentColor="#7C3AED"
            onClick={() => handleModuleClick('my_qr')}
          />
        </CategoryCard>
      )}

      {/* 6. COMMUNICATION */}
      {showCommDomain && (
        <CategoryCard title="COMMUNICATION" countBadge={2}>
          <ModuleTile
            title="Forum (Discussions)"
            icon={<MessageSquare size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#1D4ED8"
            onClick={() => handleModuleClick('forum')}
          />
          <ModuleTile
            title="Notifications"
            icon={<Bell size={20} />}
            iconBg="#FEF2F2"
            iconBorder="#FECACA"
            accentColor="#DC2626"
            onClick={() => handleModuleClick('notifications')}
          />
        </CategoryCard>
      )}

      {/* MODALS */}

      {/* Chapter Governance Settings Modal */}
      <BottomSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Chapter Governance Settings"
        subtitle="Manage academic tenure, club standing, and advisory notifications"
      >
        <form onSubmit={handleSettingsSave} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tenure Period</label>
            <input
              type="text"
              value={tenurePeriod}
              onChange={(e) => setTenurePeriod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700">Notification Preferences</span>
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Email alerts for budget & duty approvals</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Live gate entry SMS summaries</span>
              <input
                type="checkbox"
                checked={gateSmsAlerts}
                onChange={(e) => setGateSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-2 cursor-pointer"
          >
            Save Governance Settings
          </button>
        </form>
      </BottomSheet>

      {/* Posts & Squad Leads Management Bottom Sheet */}
      <BottomSheet
        isOpen={isPostsModalOpen}
        onClose={() => setIsPostsModalOpen(false)}
        title="Posts & Squad Leads Governance"
        subtitle="Assign officer posts, designate squad leads, and inspect post history"
      >
        <div className="flex flex-col gap-4 py-1">
          {/* Current Leads */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Designated Squad Leaders (AY 2026-2027)
            </span>
            <div className="flex flex-col gap-2">
              {users
                .filter(
                  (u) =>
                    u.role === 'team_admin' ||
                    u.role === 'admin' ||
                    u.post?.toLowerCase().includes('lead')
                )
                .slice(0, 4)
                .map((lead) => (
                  <div
                    key={lead.uid}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {lead.team} Squad • {lead.department}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {lead.post || 'Squad Lead'}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Form to Assign New Post */}
          <form onSubmit={handleAssignPostSubmit} className="flex flex-col gap-3 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              Designate Scholar to Squad Lead Post
            </span>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Select Scholar
              </label>
              <select
                value={selectedStudentForPost}
                onChange={(e) => setSelectedStudentForPost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none bg-white"
              >
                {users.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.name} ({u.department || 'Geosciences'} • ID: {u.uid})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Officer Post
              </label>
              <select
                value={targetPost}
                onChange={(e) => setTargetPost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none bg-white"
              >
                <option value="Promotion Lead">Promotion Lead</option>
                <option value="Documentation Lead">Documentation Lead</option>
                <option value="Treasurer Lead">Treasurer Lead</option>
                <option value="Events Coordinator">Events Coordinator</option>
                <option value="Field Logistics Head">Field Logistics Head</option>
                <option value="General Secretary">General Secretary</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                System Role Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetRole('team_admin')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    targetRole === 'team_admin'
                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Squad Admin (Team Lead)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetRole('member')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    targetRole === 'member'
                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Active Member
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full font-bold text-xs bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition-all mt-1 cursor-pointer"
            >
              Confirm Appointment
            </button>
          </form>
        </div>
      </BottomSheet>

      {/* Allocation Modal */}
      <BottomSheet
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        title="Squad Budget Allocations"
        subtitle="Review and balance squad corpus distributions"
      >
        <div className="flex flex-col gap-3 py-1">
          {[
            { team: 'Promotion', alloc: '₹1,20,000', spent: '₹68,000' },
            { team: 'Documentation', alloc: '₹95,000', spent: '₹42,000' },
            { team: 'Management', alloc: '₹1,50,000', spent: '₹84,000' },
            { team: 'Treasurer Reserve', alloc: '₹85,000', spent: '₹33,000' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900">{item.team} Squad</span>
                <div className="text-[11px] text-slate-500">Spent: {item.spent}</div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {item.alloc}
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsAllocationModalOpen(false);
              showToast('✓ Budget balance verified!');
            }}
            className="w-full py-2.5 rounded-full font-bold text-xs bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-all mt-1 cursor-pointer"
          >
            Acknowledge Corpus Balance
          </button>
        </div>
      </BottomSheet>

      {/* Fiscal Audit Report Export Modal */}
      <BottomSheet
        isOpen={isAuditReportExportOpen}
        onClose={() => setIsAuditReportExportOpen(false)}
        title="Fiscal Audit Dossier"
        subtitle="Export full semester financial statement"
      >
        <div className="flex flex-col gap-3 py-1">
          <p className="text-xs text-slate-600 font-medium">
            Generate an official audit dossier compliant with university faculty financial standards.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {['PDF Dossier', 'Excel Sheet', 'Word Summary'].map((fmt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setIsAuditReportExportOpen(false);
                  showToast(`✓ Exported Fiscal Audit in ${fmt}`);
                }}
                className="py-3 px-2 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-800 flex flex-col items-center gap-1.5 transition-all"
              >
                <Download size={18} className="text-emerald-600" />
                <span>{fmt}</span>
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
