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
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { getRolePermissions } from '../../../core/permissions';
import { ShortcutTile } from '../../../components/ShortcutTile';
import { CategoryCard } from '../../../components/CategoryCard';
import { ModuleTile } from '../../../components/ModuleTile';
import { BottomSheet } from '../../../components/BottomSheet';
import { Toast } from '../../../components/Toast';

export const CoordinatorOperationsView: React.FC = () => {
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

  // Modals
  const [isFeedbackSummaryOpen, setIsFeedbackSummaryOpen] = useState(false);
  const [isPostsModalOpen, setIsPostsModalOpen] = useState(false);

  const handleModuleClick = (tab: string) => {
    setActiveTab(tab as any);
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
      count: 4,
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
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            Coordinator / Lead
          </span>
          <span className="text-[11px] font-semibold text-slate-400">Chapter Command Suite</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Club Operations Hub</h1>
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
          label="Templates"
          icon={<FileText size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          iconColor="#065F46"
          onClick={() => handleModuleClick('doc_studio')}
        />

        <ShortcutTile
          label="Join Requests"
          icon={<CheckSquare size={20} />}
          iconBg="#FFF8E6"
          iconBorder="#FDE68A"
          iconColor="#92400E"
          badge={approvals.filter((a) => a.status === 'pending').length || 3}
          onClick={() => handleModuleClick('members')}
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
          label="Community"
          icon={<MessageSquare size={20} />}
          iconBg="#F5F3FF"
          iconBorder="#DDD6FE"
          iconColor="#7C3AED"
          onClick={() => handleModuleClick('forum')}
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
                  <TabIcon size={16} strokeWidth={1.75} />
                </div>
                <span className="text-[13px] font-bold tracking-tight whitespace-nowrap">
                  {tab.label}
                </span>
                <span
                  className="rounded-full font-bold font-mono inline-flex items-center justify-center border"
                  style={{
                    height: '22px',
                    minWidth: '22px',
                    padding: '0 7px',
                    fontSize: '12px',
                    backgroundColor: active ? tab.activeBadgeBg : tab.inactiveBadgeBg,
                    borderColor: active ? tab.activeBadgeBorder : tab.inactiveBadgeBorder,
                    color: active ? tab.activeBadgeColor : tab.inactiveBadgeColor,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. DOCUMENTATION */}
      {showDocDomain && (
        <>
          <CategoryCard title="DOCUMENTATION" countBadge={4}>
            <ModuleTile
              title="Templates"
              icon={<FileText size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              onClick={() => handleModuleClick('doc_studio')}
            />
            <ModuleTile
              title="Documentation Update"
              icon={<FileCheck size={20} />}
              iconBg="#E8FBF8"
              iconBorder="#99F6E4"
              accentColor="#0D9488"
              onClick={() => handleModuleClick('doc_studio')}
            />
            <ModuleTile
              title="Daily News editor"
              icon={<Newspaper size={20} />}
              iconBg="#FFF8E6"
              iconBorder="#FDE68A"
              accentColor="#92400E"
              onClick={() => handleModuleClick('doc_studio')}
            />
            <ModuleTile
              title="MoM Author"
              icon={<Calendar size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              accentColor="#5B21B6"
              onClick={() => handleModuleClick('doc_studio')}
            />
          </CategoryCard>

          <CategoryCard title="MEDIA ARCHIVES" countBadge={3}>
            <ModuleTile
              title="Photo Upload"
              icon={<Camera size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              accentColor="#2563EB"
              onClick={() => handleModuleClick('archives')}
            />
            <ModuleTile
              title="Video Links"
              icon={<Video size={20} />}
              iconBg="#F5F3FF"
              iconBorder="#DDD1FF"
              accentColor="#7C3AED"
              onClick={() => handleModuleClick('archives')}
            />
            <ModuleTile
              title="Gallery Manager"
              icon={<Image size={20} />}
              iconBg="#FFF8E6"
              iconBorder="#FDE68A"
              accentColor="#B45309"
              onClick={() => handleModuleClick('archives')}
            />
          </CategoryCard>
        </>
      )}

      {/* 2. PROMOTION */}
      {showPromoDomain && (
        <CategoryCard title="PROMOTION & OUTREACH" countBadge={4}>
          <ModuleTile
            title="Content Calendar"
            icon={<Calendar size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            onClick={() => handleModuleClick('campaigns')}
          />
          <ModuleTile
            title="Posts Studio"
            icon={<Send size={20} />}
            iconBg="#F5F3FF"
            iconBorder="#DDD1FF"
            accentColor="#7C3AED"
            onClick={() => handleModuleClick('campaigns')}
          />
          <ModuleTile
            title="AI Suggestions"
            icon={<Sparkles size={20} />}
            iconBg="#FFF8E6"
            iconBorder="#FDE68A"
            accentColor="#D97706"
            onClick={() => handleModuleClick('campaigns')}
          />
          <ModuleTile
            title="Campaign Reach export"
            icon={<Download size={20} />}
            iconBg="#E7F9F1"
            iconBorder="#A7F3D0"
            accentColor="#059669"
            onClick={() => handleModuleClick('campaigns')}
          />
        </CategoryCard>
      )}

      {/* 3. MANAGEMENT */}
      {showMgmtDomain && (
        <CategoryCard title="MANAGEMENT & GOVERNANCE" countBadge={4}>
          <ModuleTile
            title="Squad Leads"
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
            title="Join Requests"
            icon={<CheckSquare size={20} />}
            iconBg="#FFF8E6"
            iconBorder="#FDE68A"
            accentColor="#B45309"
            onClick={() => handleModuleClick('members')}
          />
        </CategoryCard>
      )}

      {/* 4. TREASURER */}
      {showTreasuryDomain && (
        <CategoryCard title="FINANCE & ASSETS" countBadge={6}>
          <ModuleTile
            title="Expenses & Claims"
            icon={<DollarSign size={20} />}
            iconBg="#E7F9F1"
            iconBorder="#A7F3D0"
            accentColor="#059669"
            onClick={() => handleModuleClick('finance')}
          />
          <ModuleTile
            title="Budget Overview"
            icon={<BarChart3 size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            onClick={() => handleModuleClick('finance')}
          />
          <ModuleTile
            title="Allocation Requests"
            icon={<Layers size={20} />}
            iconBg="#F3EEFF"
            iconBorder="#DDD1FF"
            accentColor="#5B21B6"
            onClick={() => handleModuleClick('finance')}
          />
          <ModuleTile
            title="Stock Inventory"
            icon={<PackagePlus size={20} />}
            iconBg="#FFF8E6"
            iconBorder="#FDE68A"
            accentColor="#B45309"
            onClick={() => handleModuleClick('finance')}
          />
          <ModuleTile
            title="Purchase Ledger"
            icon={<Archive size={20} />}
            iconBg="#F8FAFC"
            iconBorder="#E2E8F0"
            accentColor="#475569"
            onClick={() => handleModuleClick('finance')}
          />
          <ModuleTile
            title="Finance Reports"
            icon={<Download size={20} />}
            iconBg="#E7F9F1"
            iconBorder="#A7F3D0"
            accentColor="#059669"
            onClick={() => handleModuleClick('finance')}
          />
        </CategoryCard>
      )}

      {/* 5. ATTENDANCE */}
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
            title="My Pass"
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
      <BottomSheet
        isOpen={isPostsModalOpen}
        onClose={() => setIsPostsModalOpen(false)}
        title="Designated Squad Leaders"
        subtitle="Chapter leadership roster and designated squad leaders (Read-only)"
      >
        <div className="flex flex-col gap-3 py-1">
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
      </BottomSheet>
    </div>
  );
};
