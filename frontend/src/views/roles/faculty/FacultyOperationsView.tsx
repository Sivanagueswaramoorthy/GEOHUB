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
  CheckCircle2,
  ExternalLink,
  Info,
  Activity,
  UserCheck,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { getRolePermissions } from '../../../core/permissions';
import { ShortcutTile } from '../../../components/ShortcutTile';
import { CategoryCard } from '../../../components/CategoryCard';
import { ModuleTile } from '../../../components/ModuleTile';
import { BottomSheet } from '../../../components/BottomSheet';
import { Toast } from '../../../components/Toast';
import { registerAudit } from '../../../features/audits/audit.data';

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

  // Toggle display of rich Team Lead Portal Updates on each module
  const [showLeadUpdates, setShowLeadUpdates] = useState(true);

  // Navigate to Dedicated Full-Page Portal Audit View
  const openAuditPage = (data: {
    moduleTitle: string;
    domain?: string;
    leadName?: string;
    leadRole?: string;
    department?: string;
    timeAgo?: string;
    updateText?: string;
    metric?: string;
    details?: string;
    targetTab?: string;
    verifiedStatus?: string;
    lastAction?: string;
    auditRef?: string;
  }) => {
    const record = registerAudit(data);
    setActiveTab(`audits/${record.slug}`);
  };

  const openAuditModal = openAuditPage;

  // Portal Leads Overview for the executive activity ticker
  const portalLeadsSummary = [
    {
      id: 'Documentation',
      name: 'Aarav Patel',
      role: 'Documentation Lead',
      dept: 'Geoinformatics & Archival',
      avatarBg: '#DAF1DE',
      avatarColor: '#163832',
      latestAction: 'Prefilled 4 event dossiers & verified 8 deliverables',
      timeAgo: '1h ago',
      count: '7 Modules',
    },
    {
      id: 'Promotion',
      name: 'David Chen',
      role: 'Promotion Lead',
      dept: 'Earth Science & Media',
      avatarBg: '#FFF1F2',
      avatarColor: '#BE123C',
      latestAction: 'GEO FEST 2026 live campaign reaching 1,840 students',
      timeAgo: '2h ago',
      count: '4 Modules',
    },
    {
      id: 'Management',
      name: 'Elena Rostova',
      role: 'Management Lead (VP)',
      dept: 'Geology & Governance',
      avatarBg: '#EEF2FF',
      avatarColor: '#4338CA',
      latestAction: 'Allocated 18 squad duties & approved 4 member proofs',
      timeAgo: '3h ago',
      count: '5 Modules',
    },
    {
      id: 'Treasurer',
      name: 'Ananya Iyer',
      role: 'Treasurer Lead',
      dept: 'Economics & Financial Analytics',
      avatarBg: '#FFFBEB',
      avatarColor: '#B45309',
      latestAction: 'Logged ₹6,500 audio voucher; ₹71,800 balance remaining',
      timeAgo: '2h ago',
      count: '6 Modules',
    },
    {
      id: 'Attendance',
      name: 'Liam Vance',
      role: 'Gate & Volunteer Lead',
      dept: 'Environmental Studies',
      avatarBg: '#F0F9FF',
      avatarColor: '#0369A1',
      latestAction: '185 gate scans synchronized for QGIS Workshop',
      timeAgo: 'Yesterday',
      count: '3 Modules',
    },
  ];

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
      activeBg: '#DAF1DE',
      activeBorder: '#235347',
      activeColor: '#0B2B26',
      activeIconBg: '#DAF1DE',
      activeIconBorder: '#8EB69B',
      activeIconColor: '#235347',
      activeBadgeBg: '#DAF1DE',
      activeBadgeBorder: '#8EB69B',
      activeBadgeColor: '#0B2B26',
      inactiveBg: '#FFFFFF',
      inactiveBorder: '#E2E8F0',
      inactiveColor: '#334155',
      inactiveIconBg: '#DAF1DE',
      inactiveIconBorder: '#8EB69B',
      inactiveIconColor: '#235347',
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
        <CategoryCard
          title="DOCUMENTATION & ARCHIVES"
          countBadge={7}
          leadInfo={{
            name: 'Aarav Patel',
            role: 'Documentation Lead',
            department: 'Geoinformatics & Archival Science',
            avatarBg: '#DAF1DE',
            avatarColor: '#163832',
            updatesSummary: 'Lead Portal • 7 modules managed in Documentation Studio',
          }}
          onAuditLead={() =>
            openAuditModal({
              moduleTitle: 'Documentation Studio Suite',
              domain: 'Documentation & Archives',
              leadName: 'Aarav Patel',
              leadRole: 'Documentation Lead',
              department: 'Geoinformatics & Archival Science',
              timeAgo: '1h ago',
              updateText: 'Prefilled 4 event dossiers, verified 8 deliverables, and compiled Bulletin #4',
              metric: '7 Modules Active',
              details:
                'Aarav Patel maintains all institutional archival assets. In this session, official dossiers for QGIS Workshop, GEO FEST, and Drone Survey were linked with speaker profiles and verified turnstiles.',
              targetTab: 'doc_studio',
              verifiedStatus: 'Verified by Faculty In-charge',
            })
          }
        >
          <ModuleTile
            title="Templates Prefilled"
            icon={<FileText size={20} />}
            iconBg="#DAF1DE"
            iconBorder="#8EB69B"
            accentColor="#235347"
            metric="4 Dossiers"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Aarav Patel',
                    leadRole: 'Doc Lead',
                    updateText: 'Prefilled official dossiers for QGIS Workshop & GEO FEST 2026',
                    timeAgo: '1h ago',
                    badge: '4 Templates Ready',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Templates Prefilled',
                domain: 'Documentation & Archives',
                leadName: 'Aarav Patel',
                leadRole: 'Documentation Lead',
                department: 'Geoinformatics & Archival Science',
                timeAgo: '1h ago',
                updateText: 'Prefilled official dossiers for QGIS Workshop & GEO FEST 2026',
                metric: '4 Official Dossiers',
                details:
                  'Aarav Patel populated 4 event document templates with verified guest speaker bios, sanctioned budgets, and hall coordinates. Dossiers are formatted to university accreditation standards.',
                targetTab: 'doc_studio',
              })
            }
            onClick={() => handleModuleClick('doc_studio')}
          />
          <ModuleTile
            title="Checklist Audit"
            icon={<FileCheck size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            metric="8/12 Done"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Aarav Patel',
                    leadRole: 'Doc Lead',
                    updateText: '8 of 12 deliverables verified across 4 events; 2 missing reports flagged',
                    timeAgo: '2h ago',
                    badge: '67% Complete',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Checklist Audit',
                domain: 'Documentation & Archives',
                leadName: 'Aarav Patel',
                leadRole: 'Documentation Lead',
                department: 'Geoinformatics & Archival Science',
                timeAgo: '2h ago',
                updateText: '8 of 12 deliverables verified across 4 events; 2 missing reports flagged',
                metric: '8 of 12 Verified',
                details:
                  'Audit performed across Q3 chapter events. Missing post-event narrative for Campus Drone Survey and delayed feedback summary flagged for follow-up.',
                targetTab: 'doc_studio',
              })
            }
            onClick={() => handleModuleClick('doc_studio')}
          />
          <ModuleTile
            title="Daily News Bulletin"
            icon={<Newspaper size={20} />}
            iconBg="#FFF8E6"
            iconBorder="#FDE68A"
            accentColor="#D97706"
            metric="3 Published"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Aarav Patel',
                    leadRole: 'Doc Lead',
                    updateText: 'Published Bulletin #4: "Eco-Awareness Drive Concludes with 200+ Trees"',
                    timeAgo: '4h ago',
                    badge: 'Published',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Daily News Bulletin',
                domain: 'Documentation & Archives',
                leadName: 'Aarav Patel',
                leadRole: 'Documentation Lead',
                department: 'Geoinformatics & Archival Science',
                timeAgo: '4h ago',
                updateText: 'Published Bulletin #4: "Eco-Awareness Drive Concludes with 200+ Trees"',
                metric: 'Bulletin #4 Live',
                details:
                  'Drafted editorial bulletin highlighting volunteer achievements, geospatial field photos, and upcoming workshops. Published across student portals.',
                targetTab: 'doc_studio',
              })
            }
            onClick={() => handleModuleClick('doc_studio')}
          />
          <ModuleTile
            title="Minutes of Meeting (MoM)"
            icon={<Calendar size={20} />}
            iconBg="#F5F3FF"
            iconBorder="#DDD1FF"
            accentColor="#7C3AED"
            metric="5 Sessions"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Aarav Patel',
                    leadRole: 'Doc Lead',
                    updateText: 'Drafted & submitted signed MoM for Core Committee Briefing (Hall B)',
                    timeAgo: 'Yesterday',
                    badge: 'Signed MoM',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Minutes of Meeting (MoM)',
                domain: 'Documentation & Archives',
                leadName: 'Aarav Patel',
                leadRole: 'Documentation Lead',
                department: 'Geoinformatics & Archival Science',
                timeAgo: 'Yesterday',
                updateText: 'Drafted & submitted signed MoM for Core Committee Briefing (Hall B)',
                metric: '14 Signatures',
                details:
                  'Recorded minutes of meeting for October 3 core briefing. All 6 action items assigned with deadlines. Approved by Club President Alex Rivera.',
                targetTab: 'meetings',
              })
            }
            onClick={() => handleModuleClick('meetings')}
          />
          <ModuleTile
            title="Geotagged Photo Records"
            icon={<Camera size={20} />}
            iconBg="#E8FBF8"
            iconBorder="#99F6E4"
            accentColor="#0D9488"
            metric="12 Uploads"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Aarav Patel',
                    leadRole: 'Doc Lead',
                    updateText: 'Uploaded 12 high-res GPS tagged photos from Alumni Talk & GIS Lab',
                    timeAgo: '2h ago',
                    badge: '12 Geotagged',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Geotagged Photo Records',
                domain: 'Documentation & Archives',
                leadName: 'Aarav Patel',
                leadRole: 'Documentation Lead',
                department: 'Geoinformatics & Archival Science',
                timeAgo: '2h ago',
                updateText: 'Uploaded 12 high-res GPS tagged photos from Alumni Talk & GIS Lab',
                metric: '12 Images (+13.08, +80.27)',
                details:
                  '12 camera RAW files ingested with embedded GPS coordinate stamps and timestamps. Linked directly to event archive album.',
                targetTab: 'gallery',
              })
            }
            onClick={() => handleModuleClick('gallery')}
          />
          <ModuleTile
            title="Video Archive Links"
            icon={<Video size={20} />}
            iconBg="#FEF2F2"
            iconBorder="#FECACA"
            accentColor="#DC2626"
            metric="3 Streams"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Aarav Patel',
                    leadRole: 'Doc Lead',
                    updateText: 'Attached 4K stream recording link for QGIS Remote Sensing session',
                    timeAgo: '1d ago',
                    badge: '4K Recording',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Video Archive Links',
                domain: 'Documentation & Archives',
                leadName: 'Aarav Patel',
                leadRole: 'Documentation Lead',
                department: 'Geoinformatics & Archival Science',
                timeAgo: '1d ago',
                updateText: 'Attached 4K stream recording link for QGIS Remote Sensing session',
                metric: '3 Cloud Streams',
                details:
                  'Private cloud video stream linked for workshop attendees who missed hands-on lab exercises. Secured behind institutional single sign-on.',
                targetTab: 'gallery',
              })
            }
            onClick={() => handleModuleClick('gallery')}
          />
          <ModuleTile
            title="Media Gallery Manager"
            icon={<Image size={20} />}
            iconBg="#FFF1F2"
            iconBorder="#FECDD3"
            accentColor="#E11D48"
            metric="4 Albums"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Aarav Patel',
                    leadRole: 'Doc Lead',
                    updateText: 'Organized 2026-27 albums; categorized 48 photos by event tags',
                    timeAgo: 'Yesterday',
                    badge: '48 Photos',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Media Gallery Manager',
                domain: 'Documentation & Archives',
                leadName: 'Aarav Patel',
                leadRole: 'Documentation Lead',
                department: 'Geoinformatics & Archival Science',
                timeAgo: 'Yesterday',
                updateText: 'Organized 2026-27 albums; categorized 48 photos by event tags',
                metric: '48 Media Files',
                details:
                  'Categorized media repository into 4 thematic folders: Conclaves, Field Expeditions, Workshops, and Alumni Engagements.',
                targetTab: 'gallery',
              })
            }
            onClick={() => handleModuleClick('gallery')}
          />
        </CategoryCard>
      )}

      {/* 2. PROMOTION */}
      {showPromoDomain && (
        <CategoryCard
          title="PROMOTION & CAMPAIGNS"
          countBadge={4}
          leadInfo={{
            name: 'David Chen',
            role: 'Promotion Lead',
            department: 'Earth Science & Media',
            avatarBg: '#FFF1F2',
            avatarColor: '#BE123C',
            updatesSummary: 'Lead Portal • 4 modules managed in Campaigns & AI Studio',
          }}
          onAuditLead={() =>
            openAuditModal({
              moduleTitle: 'Promotion Studio Suite',
              domain: 'Promotion & Campaigns',
              leadName: 'David Chen',
              leadRole: 'Promotion Lead',
              department: 'Earth Science & Media',
              timeAgo: '2h ago',
              updateText: 'Activated GEO FEST outreach campaign reaching 1,840 impressions and queued 3 promo blasts',
              metric: '4 Modules Active',
              details:
                'David Chen manages club brand visibility and event turnouts. Current active campaign tracking shows +34% follower surge across social portals.',
              targetTab: 'campaigns',
            })
          }
        >
          <ModuleTile
            title="Campaigns"
            icon={<Megaphone size={20} />}
            iconBg="#FFF1F2"
            iconBorder="#FECDD3"
            accentColor="#E11D48"
            metric="1.8k Reach"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'David Chen',
                    leadRole: 'Promo Lead',
                    updateText: 'Active campaign "GEO FEST 2026" achieved 1,840 impressions & 85 clicks',
                    timeAgo: '2h ago',
                    badge: 'Active • 1.8k Reach',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Campaigns',
                domain: 'Promotion & Campaigns',
                leadName: 'David Chen',
                leadRole: 'Promotion Lead',
                department: 'Earth Science & Media',
                timeAgo: '2h ago',
                updateText: 'Active campaign "GEO FEST 2026" achieved 1,840 impressions & 85 clicks',
                metric: '1,840 Impressions',
                details:
                  'David Chen initiated wave 2 promotional blitz across WhatsApp bulletin and Instagram Stories. Conversion rate on registration link is 4.6%.',
                targetTab: 'campaigns',
              })
            }
            onClick={() => handleModuleClick('campaigns')}
          />
          <ModuleTile
            title="Posts Studio"
            icon={<Send size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            metric="14 Posts"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'David Chen',
                    leadRole: 'Promo Lead',
                    updateText: 'Published Instagram Carousel "Speaker Spotlight: Dr. Sarah Jenkins"',
                    timeAgo: '4h ago',
                    badge: 'Live on IG',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Posts Studio',
                domain: 'Promotion & Campaigns',
                leadName: 'David Chen',
                leadRole: 'Promotion Lead',
                department: 'Earth Science & Media',
                timeAgo: '4h ago',
                updateText: 'Published Instagram Carousel "Speaker Spotlight: Dr. Sarah Jenkins"',
                metric: '14 Feed Posts',
                details:
                  'Published official 5-slide carousel showcasing keynote topics on AI Geospatial mapping. Logged 340 likes and 42 shares.',
                targetTab: 'social_media',
              })
            }
            onClick={() => handleModuleClick('social_media')}
          />
          <ModuleTile
            title="Content Calendar"
            icon={<Calendar size={20} />}
            iconBg="#F5F3FF"
            iconBorder="#DDD1FF"
            accentColor="#7C3AED"
            metric="6 Upcoming"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'David Chen',
                    leadRole: 'Promo Lead',
                    updateText: 'Scheduled 3 promotional posts for Thursday 3:00 PM & Friday 10:00 AM',
                    timeAgo: 'Yesterday',
                    badge: '3 Scheduled',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Content Calendar',
                domain: 'Promotion & Campaigns',
                leadName: 'David Chen',
                leadRole: 'Promotion Lead',
                department: 'Earth Science & Media',
                timeAgo: 'Yesterday',
                updateText: 'Scheduled 3 promotional posts for Thursday 3:00 PM & Friday 10:00 AM',
                metric: '6 Calendar Slots',
                details:
                  'Configured automated dissemination schedule for registration deadline notices, volunteer badges reveal, and speaker arrival announcements.',
                targetTab: 'events',
              })
            }
            onClick={() => handleModuleClick('events')}
          />
          <ModuleTile
            title="Campaign Reach Export"
            icon={<Download size={20} />}
            iconBg="#DAF1DE"
            iconBorder="#8EB69B"
            accentColor="#235347"
            metric="Q3 Report"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'David Chen',
                    leadRole: 'Promo Lead',
                    updateText: 'Generated Q3 Social Analytics summary report: +34% student engagement',
                    timeAgo: '3d ago',
                    badge: 'PDF Ready',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Campaign Reach Export',
                domain: 'Promotion & Campaigns',
                leadName: 'David Chen',
                leadRole: 'Promotion Lead',
                department: 'Earth Science & Media',
                timeAgo: '3d ago',
                updateText: 'Generated Q3 Social Analytics summary report: +34% student engagement',
                metric: 'Analytics Dossier',
                details:
                  'Compiled consolidated outreach metrics across Instagram, LinkedIn, and campus bulletin boards. Verified +34% year-over-year participation increase.',
                targetTab: 'reports',
              })
            }
            onClick={() => showToast('✓ Generated Campaign Reach Summary (PDF)')}
          />
        </CategoryCard>
      )}

      {/* 3. MANAGEMENT & GOVERNANCE */}
      {showMgmtDomain && (
        <CategoryCard
          title="MANAGEMENT & GOVERNANCE"
          countBadge={5}
          leadInfo={{
            name: 'Elena Rostova',
            role: 'Management Lead (VP)',
            department: 'Geology & Governance',
            avatarBg: '#EEF2FF',
            avatarColor: '#4338CA',
            updatesSummary: 'Lead Portal • 5 modules managed in Roster & Committee',
          }}
          onAuditLead={() =>
            openAuditModal({
              moduleTitle: 'Management & Governance Suite',
              domain: 'Management & Governance',
              leadName: 'Elena Rostova',
              leadRole: 'Management Lead (VP)',
              department: 'Geology & Governance',
              timeAgo: '1h ago',
              updateText: 'Allocated 18 squad duties, approved 4 member proofs, and endorsed 1 officer elevation',
              metric: '5 Modules Active',
              details:
                'Elena Rostova oversees internal club operations, member tasks, and volunteer deployments. Active duty roster tracking 75% completion across all departments.',
              targetTab: 'tasks',
            })
          }
        >
          <ModuleTile
            title="Squad Leads & Posts"
            icon={<Award size={20} />}
            iconBg="#F3EEFF"
            iconBorder="#DDD1FF"
            accentColor="#5B21B6"
            metric="5 Leads"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Elena Rostova',
                    leadRole: 'Mgmt Lead',
                    updateText: 'Endorsed Maya Patel for Documentation Officer elevation; verified portfolio',
                    timeAgo: '1h ago',
                    badge: '1 Elevation Pending',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Squad Leads & Posts',
                domain: 'Management & Governance',
                leadName: 'Elena Rostova',
                leadRole: 'Management Lead (VP)',
                department: 'Geology & Governance',
                timeAgo: '1h ago',
                updateText: 'Endorsed Maya Patel for Documentation Officer elevation; verified portfolio',
                metric: '5 Active Squad Leads',
                details:
                  'Formal elevation requisition submitted to elevate Maya Patel to 2nd Year Documentation Officer. Verified by club executive board.',
                targetTab: 'teams',
              })
            }
            onClick={() => setIsPostsModalOpen(true)}
          />
          <ModuleTile
            title="Master Duty Roster"
            icon={<ListTodo size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            metric="18/24 Done"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Elena Rostova',
                    leadRole: 'Mgmt Lead',
                    updateText: 'Allocated 18 squad duties for GIS Expedition; approved 4 member proofs',
                    timeAgo: '3h ago',
                    badge: '75% Complete',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Master Duty Roster',
                domain: 'Management & Governance',
                leadName: 'Elena Rostova',
                leadRole: 'Management Lead (VP)',
                department: 'Geology & Governance',
                timeAgo: '3h ago',
                updateText: 'Allocated 18 squad duties for GIS Expedition; approved 4 member proofs',
                metric: '18 of 24 Fulfilled',
                details:
                  'Reviewed photographic proof submissions from 4 volunteers for stage rigging and directional banners. Approved marks recorded into member dossiers.',
                targetTab: 'tasks',
              })
            }
            onClick={() => handleModuleClick('tasks')}
          />
          <ModuleTile
            title="Meetings & MoM"
            icon={<Calendar size={20} />}
            iconBg="#F5F3FF"
            iconBorder="#DDD1FF"
            accentColor="#6D28D9"
            metric="14 Present"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Elena Rostova',
                    leadRole: 'Mgmt Lead',
                    updateText: 'Convened Core Committee Meeting in Seminar Hall B; 14 of 16 attended',
                    timeAgo: 'Yesterday',
                    badge: 'Quorum Met',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Meetings & MoM',
                domain: 'Management & Governance',
                leadName: 'Elena Rostova',
                leadRole: 'Management Lead (VP)',
                department: 'Geology & Governance',
                timeAgo: 'Yesterday',
                updateText: 'Convened Core Committee Meeting in Seminar Hall B; 14 of 16 attended',
                metric: '14 of 16 Present',
                details:
                  'Core committee convened with quorum met. Reviewed final venue security checklist and stage layout for the upcoming symposium.',
                targetTab: 'meetings',
              })
            }
            onClick={() => handleModuleClick('meetings')}
          />
          <ModuleTile
            title="Approvals"
            icon={<CheckSquare size={20} />}
            iconBg="#FFF8E6"
            iconBorder="#FDE68A"
            accentColor="#B45309"
            metric="3 Pending"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Elena Rostova',
                    leadRole: 'Mgmt Lead',
                    updateText: 'Endorsed Anjali R. membership application & ₹3,500 workshop charter',
                    timeAgo: '2h ago',
                    badge: '3 Requiring Seal',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Approvals',
                domain: 'Management & Governance',
                leadName: 'Elena Rostova',
                leadRole: 'Management Lead (VP)',
                department: 'Geology & Governance',
                timeAgo: '2h ago',
                updateText: 'Endorsed Anjali R. membership application & ₹3,500 workshop charter',
                metric: '3 Pending Seals',
                details:
                  '3 executive approvals queued for Faculty Advisor digital authorization: Anjali R. induction, ₹3,500 QGIS workshop charter, and stage budget.',
                targetTab: 'approvals',
              })
            }
            onClick={() => handleModuleClick('approvals')}
          />
          <ModuleTile
            title="Settings"
            icon={<Settings size={20} />}
            iconBg="#F8FAFC"
            iconBorder="#E2E8F0"
            accentColor="#475569"
            metric="AY 26-27"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Elena Rostova',
                    leadRole: 'Mgmt Lead',
                    updateText: 'Tenure period Fall 2026 - Spring 2027 confirmed with Faculty Advisory',
                    timeAgo: '3d ago',
                    badge: 'Governance OK',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Settings',
                domain: 'Management & Governance',
                leadName: 'Elena Rostova',
                leadRole: 'Management Lead (VP)',
                department: 'Geology & Governance',
                timeAgo: '3d ago',
                updateText: 'Tenure period Fall 2026 - Spring 2027 confirmed with Faculty Advisory',
                metric: 'Governance Synchronized',
                details:
                  'Verified academic year settings, department rosters, and emergency SMS notification routing with institutional admin directory.',
                targetTab: 'settings',
              })
            }
            onClick={() => setIsSettingsOpen(true)}
          />
        </CategoryCard>
      )}

      {/* 4. TREASURER & FINANCE */}
      {showTreasuryDomain && (
        <CategoryCard
          title="TREASURER & FINANCE"
          countBadge={6}
          leadInfo={{
            name: 'Ananya Iyer',
            role: 'Treasurer Lead',
            department: 'Economics & Financial Analytics',
            avatarBg: '#FFFBEB',
            avatarColor: '#B45309',
            updatesSummary: 'Lead Portal • 6 modules managed in Treasury & Vouchers',
          }}
          onAuditLead={() =>
            openAuditModal({
              moduleTitle: 'Treasurer & Finance Suite',
              domain: 'Treasurer & Finance',
              leadName: 'Ananya Iyer',
              leadRole: 'Treasurer Lead',
              department: 'Economics & Financial Analytics',
              timeAgo: '2h ago',
              updateText: 'Logged ₹6,500 audio voucher, reconciled ₹48,200 spent, and audited stock ledger',
              metric: '6 Modules Active',
              details:
                'Ananya Iyer oversees chapter disbursements, voucher proofs, and physical inventory. Chapter corpus balance stands at ₹71,800 remaining with 100% receipt coverage.',
              targetTab: 'treasurer',
            })
          }
        >
          <ModuleTile
            title="Expenses & Claims"
            icon={<DollarSign size={20} />}
            iconBg="#DAF1DE"
            iconBorder="#8EB69B"
            accentColor="#235347"
            metric="12 Vouchers"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Ananya Iyer',
                    leadRole: 'Treasurer',
                    updateText: 'Logged ₹6,500 stage audio console voucher with verified tax receipt',
                    timeAgo: '2h ago',
                    badge: '₹6,500 Logged',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Expenses & Claims',
                domain: 'Treasurer & Finance',
                leadName: 'Ananya Iyer',
                leadRole: 'Treasurer Lead',
                department: 'Economics & Financial Analytics',
                timeAgo: '2h ago',
                updateText: 'Logged ₹6,500 stage audio console voucher with verified tax receipt',
                metric: '12 Cleared Vouchers',
                details:
                  'Recorded voucher #EXP-1092 from Campus Logistics for seminar hall audio mixers. High-res tax receipt and GST invoice attached.',
                targetTab: 'treasurer',
              })
            }
            onClick={() => setActiveTab('treasurer')}
          />
          <ModuleTile
            title="Budget Overview"
            icon={<BarChart3 size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            metric="40% Burn"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Ananya Iyer',
                    leadRole: 'Treasurer',
                    updateText: 'Audited ledger: ₹48,200 disbursed of ₹1,20,000 ceiling (40.2% burn rate)',
                    timeAgo: 'Today',
                    badge: '₹71.8k Rem.',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Budget Overview',
                domain: 'Treasurer & Finance',
                leadName: 'Ananya Iyer',
                leadRole: 'Treasurer Lead',
                department: 'Economics & Financial Analytics',
                timeAgo: 'Today',
                updateText: 'Audited ledger: ₹48,200 disbursed of ₹1,20,000 ceiling (40.2% burn rate)',
                metric: '₹71,800 Available',
                details:
                  'Mid-semester budget audit reveals healthy fiscal burn rate of 40.2%. Reserve contingency corpus of ₹25,000 remains untouched.',
                targetTab: 'treasurer',
              })
            }
            onClick={() => setActiveTab('treasurer')}
          />
          <ModuleTile
            title="Allocation Requests"
            icon={<Layers size={20} />}
            iconBg="#F3EEFF"
            iconBorder="#DDD1FF"
            accentColor="#7C3AED"
            metric="1 Pending"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Ananya Iyer',
                    leadRole: 'Treasurer',
                    updateText: 'Submitted ₹12,000 disbursement requisition for GEO FEST main stage setup',
                    timeAgo: '3h ago',
                    badge: '₹12,000 Req.',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Allocation Requests',
                domain: 'Treasurer & Finance',
                leadName: 'Ananya Iyer',
                leadRole: 'Treasurer Lead',
                department: 'Economics & Financial Analytics',
                timeAgo: '3h ago',
                updateText: 'Submitted ₹12,000 disbursement requisition for GEO FEST main stage setup',
                metric: '₹12,000 Requisition',
                details:
                  'Requisition for stage fabrication, truss lighting, and delegate kit printing submitted for Faculty In-charge final sanction.',
                targetTab: 'treasurer',
              })
            }
            onClick={() => setIsAllocationModalOpen(true)}
          />
          <ModuleTile
            title="Stock Items"
            icon={<PackagePlus size={20} />}
            iconBg="#FFF8E6"
            iconBorder="#FDE68A"
            accentColor="#92400E"
            metric="8 Types"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Ananya Iyer',
                    leadRole: 'Treasurer',
                    updateText: 'Added 40 badge lanyards & 5 banner stands; inventory total ₹32,400',
                    timeAgo: 'Yesterday',
                    badge: '124 Units Stocked',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Stock Items',
                domain: 'Treasurer & Finance',
                leadName: 'Ananya Iyer',
                leadRole: 'Treasurer Lead',
                department: 'Economics & Financial Analytics',
                timeAgo: 'Yesterday',
                updateText: 'Added 40 badge lanyards & 5 banner stands; inventory total ₹32,400',
                metric: '124 Units (₹32,400)',
                details:
                  'Storeroom inventory verified in department cabinet. 40 reusable lanyards, 5 roll-up banners, and 3 wireless presenter remotes logged.',
                targetTab: 'treasurer',
              })
            }
            onClick={() => setActiveTab('treasurer')}
          />
          <ModuleTile
            title="Purchase History"
            icon={<FileText size={20} />}
            iconBg="#E8FBF8"
            iconBorder="#99F6E4"
            accentColor="#0D9488"
            metric="8 Invoices"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Ananya Iyer',
                    leadRole: 'Treasurer',
                    updateText: 'Archived GST tax invoices for GIS Lab workshop consumables',
                    timeAgo: '2d ago',
                    badge: 'GST Verified',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Purchase History',
                domain: 'Treasurer & Finance',
                leadName: 'Ananya Iyer',
                leadRole: 'Treasurer Lead',
                department: 'Economics & Financial Analytics',
                timeAgo: '2d ago',
                updateText: 'Archived GST tax invoices for GIS Lab workshop consumables',
                metric: '8 GST Invoices',
                details:
                  'All vendor purchases logged with GSTIN numbers, bank transaction reference IDs, and payment stamps.',
                targetTab: 'treasurer',
              })
            }
            onClick={() => setActiveTab('treasurer')}
          />
          <ModuleTile
            title="Fiscal Audit export"
            icon={<Download size={20} />}
            iconBg="#DAF1DE"
            iconBorder="#8EB69B"
            accentColor="#235347"
            metric="Audited"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Ananya Iyer',
                    leadRole: 'Treasurer',
                    updateText: 'Compiled Mid-Term Utilization Dossier for Dean of Sciences sign-off',
                    timeAgo: 'Yesterday',
                    badge: 'Dean Format',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Fiscal Audit Export',
                domain: 'Treasurer & Finance',
                leadName: 'Ananya Iyer',
                leadRole: 'Treasurer Lead',
                department: 'Economics & Financial Analytics',
                timeAgo: 'Yesterday',
                updateText: 'Compiled Mid-Term Utilization Dossier for Dean of Sciences sign-off',
                metric: 'Audit Ready',
                details:
                  'Financial report generated matching institutional format required for Dean of Sciences quarterly review and funding allocation.',
                targetTab: 'treasurer',
              })
            }
            onClick={() => setIsAuditReportExportOpen(true)}
          />
        </CategoryCard>
      )}

      {/* 5. ATTENDANCE & GATES */}
      {showAttendanceDomain && (
        <CategoryCard
          title="ATTENDANCE & GATES"
          countBadge={3}
          leadInfo={{
            name: 'Liam Vance',
            role: 'Gate & Volunteer Lead',
            department: 'Environmental Studies',
            avatarBg: '#F0F9FF',
            avatarColor: '#0369A1',
            updatesSummary: 'Lead Portal • 3 modules managed in Gate Operations',
          }}
          onAuditLead={() =>
            openAuditModal({
              moduleTitle: 'Gates & Attendance Suite',
              domain: 'Attendance & Gates',
              leadName: 'Liam Vance',
              leadRole: 'Gate & Volunteer Lead',
              department: 'Environmental Studies',
              timeAgo: 'Yesterday',
              updateText: 'Synchronized gate ledger with 185 verified student check-ins and zero scan failures',
              metric: '3 Modules Active',
              details:
                'Liam Vance coordinates entrance turnstiles, volunteer scanners, and dynamic token validation. 94.8% turn-out verified for the QGIS Workshop.',
              targetTab: 'attendance',
            })
          }
        >
          <ModuleTile
            title="Gate Scanner"
            icon={<Scan size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#2563EB"
            metric="185 Scanned"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Liam Vance',
                    leadRole: 'Gate Lead',
                    updateText: 'Closed Gate 1 session for QGIS Workshop: 185 check-ins, zero rejections',
                    timeAgo: 'Yesterday',
                    badge: '185 Verified',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Gate Scanner',
                domain: 'Attendance & Gates',
                leadName: 'Liam Vance',
                leadRole: 'Gate & Volunteer Lead',
                department: 'Environmental Studies',
                timeAgo: 'Yesterday',
                updateText: 'Closed Gate 1 session for QGIS Workshop: 185 check-ins, zero rejections',
                metric: '185 Verified Attendees',
                details:
                  'High-speed dynamic QR token validation deployed at Grand Auditorium entrance. Average scan speed 1.8 seconds per attendee.',
                targetTab: 'scan_qr',
              })
            }
            onClick={() => handleModuleClick('scan_qr')}
          />
          <ModuleTile
            title="Live Gate Logs"
            icon={<ClipboardList size={20} />}
            iconBg="#E8FBF8"
            iconBorder="#99F6E4"
            accentColor="#0D9488"
            metric="Live Sync"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Liam Vance',
                    leadRole: 'Gate Lead',
                    updateText: 'Synchronized dynamic token ledger with 94.8% verified turnout',
                    timeAgo: 'Yesterday',
                    badge: '94.8% Turnout',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Live Gate Logs',
                domain: 'Attendance & Gates',
                leadName: 'Liam Vance',
                leadRole: 'Gate & Volunteer Lead',
                department: 'Environmental Studies',
                timeAgo: 'Yesterday',
                updateText: 'Synchronized dynamic token ledger with 94.8% verified turnout',
                metric: '94.8% Verified Turnout',
                details:
                  'Real-time check-in ledger cross-referenced against advance registrations. Turn-out certificate generated for academic credit.',
                targetTab: 'attendance',
              })
            }
            onClick={() => handleModuleClick('attendance')}
          />
          <ModuleTile
            title="Advisor Pass"
            icon={<QrCode size={20} />}
            iconBg="#F3EEFF"
            iconBorder="#DDD1FF"
            accentColor="#7C3AED"
            metric="VIP Active"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Liam Vance',
                    leadRole: 'Gate Lead',
                    updateText: 'Generated Faculty VIP Gate Pass with perpetual biometric clearance',
                    timeAgo: '2d ago',
                    badge: 'VIP Clearance',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Advisor Pass',
                domain: 'Attendance & Gates',
                leadName: 'Liam Vance',
                leadRole: 'Gate & Volunteer Lead',
                department: 'Environmental Studies',
                timeAgo: '2d ago',
                updateText: 'Generated Faculty VIP Gate Pass with perpetual biometric clearance',
                metric: 'Faculty Pass Active',
                details:
                  'Encrypted dynamic token pass generated for Dr. Sarah Jenkins. Grants uninterrupted VIP access to all lab facilities and event stages.',
                targetTab: 'my_qr',
              })
            }
            onClick={() => handleModuleClick('my_qr')}
          />
        </CategoryCard>
      )}

      {/* 6. COMMUNICATION */}
      {showCommDomain && (
        <CategoryCard
          title="COMMUNICATION"
          countBadge={2}
          leadInfo={{
            name: 'Alex Rivera',
            role: 'Club President',
            department: 'Geoinformatics Engineering',
            avatarBg: '#FAF5FF',
            avatarColor: '#7E22CE',
            updatesSummary: 'Executive Portal • 2 modules managed in Forum & Broadcasts',
          }}
          onAuditLead={() =>
            openAuditModal({
              moduleTitle: 'Communication Suite',
              domain: 'Communication & Outreach',
              leadName: 'Alex Rivera',
              leadRole: 'Club President',
              department: 'Geoinformatics Engineering',
              timeAgo: '3h ago',
              updateText: 'Dispatched broadcast alert to 128 scholars and moderated volunteer discussion forum',
              metric: '2 Modules Active',
              details:
                'Alex Rivera manages club announcements and general body communications. Official notice issued regarding room reallocation.',
              targetTab: 'forum',
            })
          }
        >
          <ModuleTile
            title="Forum (Discussions)"
            icon={<MessageSquare size={20} />}
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
            accentColor="#1D4ED8"
            metric="Pinned"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Alex Rivera',
                    leadRole: 'President',
                    updateText: 'Pinned thread: "Volunteer briefing for Saturday 9:00 AM in Hall B"',
                    timeAgo: '3h ago',
                    badge: '18 Replies',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Forum (Discussions)',
                domain: 'Communication',
                leadName: 'Alex Rivera',
                leadRole: 'Club President',
                department: 'Geoinformatics Engineering',
                timeAgo: '3h ago',
                updateText: 'Pinned thread: "Volunteer briefing for Saturday 9:00 AM in Hall B"',
                metric: '18 Active Replies',
                details:
                  'Club-wide discussion thread initiated for student volunteers regarding Saturday setup timeline and equipment handling.',
                targetTab: 'forum',
              })
            }
            onClick={() => handleModuleClick('forum')}
          />
          <ModuleTile
            title="Notifications"
            icon={<Bell size={20} />}
            iconBg="#FEF2F2"
            iconBorder="#FECACA"
            accentColor="#DC2626"
            metric="128 Sent"
            leadUpdate={
              showLeadUpdates
                ? {
                    leadName: 'Alex Rivera',
                    leadRole: 'President',
                    updateText: 'Dispatched broadcast alert to 128 chapter scholars regarding room shift',
                    timeAgo: '5h ago',
                    badge: '128 Scholars',
                  }
                : undefined
            }
            onAuditClick={() =>
              openAuditModal({
                moduleTitle: 'Notifications',
                domain: 'Communication',
                leadName: 'Alex Rivera',
                leadRole: 'Club President',
                department: 'Geoinformatics Engineering',
                timeAgo: '5h ago',
                updateText: 'Dispatched broadcast alert to 128 chapter scholars regarding room shift',
                metric: '128 Deliveries (100%)',
                details:
                  'High-priority push alert successfully delivered to all active scholars notifying them of venue reallocation to Seminar Hall B.',
                targetTab: 'notifications',
              })
            }
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
