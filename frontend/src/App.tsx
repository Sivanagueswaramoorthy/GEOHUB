import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/shared/TopBar';
import { FloatingNav } from './components/FloatingNav';
import { PageTransition } from './components/shared/PageTransition';
import { RoleSwitcherModal } from './components/navigation/RoleSwitcherModal';
import { Toast } from './components/Toast';
import { SplashScreen } from './components/SplashScreen';
import { UpdateAvailableModal } from './components/modals/UpdateAvailableModal';
import { ServerConnectionModal } from './components/modals/ServerConnectionModal';
import { checkForAppUpdate, registerDeviceTelemetry, AppVersionManifest } from './core/versionChecker';

// Five Primary Screens
import { HomeView } from './views/home/HomeView';
import { ClubEventsView } from './views/events/ClubEventsView';
import { ExploreActivitiesView } from './views/operations/ExploreActivitiesView';
import { MembersDirectoryView } from './views/members/MembersDirectoryView';
import { ProfileView } from './views/profile/ProfileView';

// Sub-feature Views (accessible from Activities & Quick Actions)
import { LoginPage } from './features/auth/LoginPage';
import { MyQrView } from './views/qr/MyQrView';
import { VolunteerScanView } from './views/qr/VolunteerScanView';
import { AttendanceView } from './views/attendance/AttendanceView';
import { GalleryView } from './views/gallery/GalleryView';
import { ReportsView } from './views/reports/ReportsView';
import { ApprovalsView } from './views/approvals/ApprovalsView';
import { TasksListView } from './views/tasks/TasksListView';
import { TeamsListView } from './views/teams/TeamsListView';
import { TeamHomeView } from './views/teams/TeamHomeView';
import { AddStudentsView } from './views/teams/AddStudentsView';
import { TeamDocumentsView } from './views/teams/TeamDocumentsView';
import { MeetingsView } from './views/meetings/MeetingsView';
import { MemoriesHubView } from './views/memories/MemoriesHubView';
import { CommunicationForumView } from './views/forum/CommunicationForumView';
import { TreasurerView } from './views/treasurer/TreasurerView';
import { DocumentationStudioView } from './views/docs/DocumentationStudioView';
import { CampaignsView } from './views/campaigns/CampaignsView';
import { NotificationsView } from './views/notifications/NotificationsView';
import { PendingApprovalView } from './views/auth/PendingApprovalView';
import { NotFoundView } from './views/auth/NotFoundView';
import { ChangePasswordView } from './features/auth/ChangePasswordView';
import { AuditDetailPage } from './features/audits/AuditDetailPage';
import { AuditLogView } from './views/audit/AuditLogView';
import { DesignSystemView } from './views/design/DesignSystemView';
import { SuperAdminOperationsView } from './views/admin/SuperAdminOperationsView';
import { ModulePausedNotice } from './components/shared/ModulePausedNotice';
import { UnderMaintenanceScreen } from './components/shared/UnderMaintenanceScreen';
import { SuperAdminTopNav } from './components/navigation/SuperAdminTopNav';
import { SuperAdminBottomNav } from './components/navigation/SuperAdminBottomNav';
import { apiClient } from './api/client';

import { getRoleNavTabs } from './core/nav';

const MainAppContent: React.FC = () => {
  const {
    isAuthenticated,
    currentUser,
    activeTab,
    setActiveTab,
    toast,
    showToast,
    hideToast,
    isPhoneFrame,
    platformModules,
    isBackendActive,
    setIsBackendActive,
    isDbConnected,
  } = useApp();

  const [isBypassedBySuperAdmin, setIsBypassedBySuperAdmin] = React.useState(false);

  React.useEffect(() => {
    if (isBackendActive) {
      setIsBypassedBySuperAdmin(false);
    }
  }, [isBackendActive]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__showToast = showToast;
    }
  }, [showToast]);

  // Route guarding for /login and protected routes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash.split('?')[0].replace(/^#\/?/, '').trim();
    const isDesignSystem = hash === 'design-system' || hash === 'design_system';

    if (isDesignSystem) {
      setActiveTab('design-system');
      return;
    }

    if (isAuthenticated) {
      // If user is authenticated and currently on login tab/hash, move them to home
      if (activeTab === 'login' || hash === 'login') {
        setActiveTab('home');
        if (window.location.hash.includes('login')) {
          window.location.hash = '';
        }
      }
    } else {
      // Unauthenticated users hitting protected routes are set to login
      if (activeTab !== 'login' && hash !== 'login') {
        setActiveTab('login');
        if (window.location.hash && window.location.hash !== '#login') {
          window.location.hash = 'login';
        }
      }
    }
  }, [isAuthenticated, activeTab, setActiveTab]);

  // Scroll to the very top whenever the active screen or route changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } catch {
        window.scrollTo(0, 0);
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [activeTab]);

  React.useEffect(() => {
    const handleHashScrollTop = () => {
      if (typeof window !== 'undefined') {
        try {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } catch {
          window.scrollTo(0, 0);
        }
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };
    window.addEventListener('hashchange', handleHashScrollTop);
    return () => window.removeEventListener('hashchange', handleHashScrollTop);
  }, []);

  if (activeTab === 'design-system') {
    return (
      <div className="mobile-scaffold-root">
        <div className="mobile-shell-column phone-frame-mode" style={{ width: '100%', maxWidth: '640px', margin: '0 auto', padding: '16px 20px' }}>
          <DesignSystemView />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || activeTab === 'login') {
    return <LoginPage />;
  }

  if (currentUser?.status === 'pending' || activeTab === 'pending-approval') {
    return <PendingApprovalView />;
  }

  if (currentUser?.mustChangePassword) {
    return <ChangePasswordView />;
  }

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const navTabs = getRoleNavTabs(currentUser.role, currentUser.post);
  const primaryTabKeys = [
    'home',
    'dashboard',
    'operations',
    'events',
    'community',
    'gallery',
    'scan_qr',
    'qrscanner',
    'ledger',
    ...navTabs.map((t) => t.key),
    ...(navTabs.some((t) => t.key === 'archives') ? ['archives', 'gallery'] : []),
    ...(navTabs.some((t) => t.key === 'finance') ? ['finance', 'treasurer', 'ledger'] : []),
    ...(navTabs.some((t) => t.key === 'campaigns') ? ['campaigns', 'ai_social'] : []),
    ...(navTabs.some((t) => t.key === 'memories') ? ['memories'] : []),
  ];

  const renderActiveScreen = () => {
    // Platform Module Gatekeeper: If SuperAdmin toggled a module OFF, non-superadmins see the elegant paused notice
    const isSuperAdmin = currentUser?.role === 'super_admin';
    if (!isSuperAdmin && platformModules) {
      if (activeTab === 'events' && platformModules.events === false) {
        return <ModulePausedNotice moduleName="Events & Hackathons Hub" />;
      }
      if (activeTab === 'members' && platformModules.members === false) {
        return <ModulePausedNotice moduleName="Member & Student Directory" />;
      }
      if ((activeTab === 'teams' || activeTab === 'team_home') && platformModules.squads === false) {
        return <ModulePausedNotice moduleName="Squads & Duty Workspaces" />;
      }
      if ((activeTab === 'finance' || activeTab === 'treasurer' || activeTab === 'ledger') && platformModules.finance === false) {
        return <ModulePausedNotice moduleName="Treasury & Financial Ledger" />;
      }
      if ((activeTab === 'scan_qr' || activeTab === 'attendance') && platformModules.qr_attendance === false) {
        return <ModulePausedNotice moduleName="Smart QR & Attendance Gate" />;
      }
      if ((activeTab === 'archives' || activeTab === 'gallery' || activeTab === 'memories') && platformModules.archives === false) {
        return <ModulePausedNotice moduleName="Archives & Media Gallery" />;
      }
      if ((activeTab === 'campaigns' || activeTab === 'ai_social') && platformModules.campaigns === false) {
        return <ModulePausedNotice moduleName="Social Campaigns & AI Studio" />;
      }
      if ((activeTab === 'forum' || activeTab === 'community') && platformModules.forum === false) {
        return <ModulePausedNotice moduleName="Campus Forum & Community" />;
      }
      if ((activeTab === 'documents' || activeTab === 'doc_studio') && platformModules.documents === false) {
        return <ModulePausedNotice moduleName="Document Studio & MOM Archival" />;
      }
    }

    switch (activeTab) {
      // 1) Home template
      case 'home':
      case 'dashboard':
        return <HomeView />;

      // 2) Club Events
      case 'events':
        return <ClubEventsView />;

      // 3) Explore Activities hub
      case 'operations':
        return <ExploreActivitiesView />;

      // 4) Members Directory
      case 'members':
        return <MembersDirectoryView />;

      // 5) Profile
      case 'profile':
        return <ProfileView />;

      // Sub-views
      case 'scan_qr':
        return <VolunteerScanView />;
      case 'my_qr':
        return <MyQrView />;
      case 'attendance':
        return <AttendanceView />;
      case 'archives':
      case 'gallery':
        return <GalleryView />;
      case 'reports':
        return <ReportsView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'tasks':
        return <TasksListView />;
      case 'teams':
        return <TeamsListView />;
      case 'team_home':
        return <TeamHomeView />;
      case 'add_students':
        return <AddStudentsView />;
      case 'documents':
        return <TeamDocumentsView />;
      case 'meetings':
        return <MeetingsView />;
      case 'memories':
        return <MemoriesHubView />;
      case 'forum':
      case 'community':
        return <CommunicationForumView />;
      case 'ledger':
      case 'finance':
      case 'treasurer':
        return <TreasurerView />;
      case 'doc_studio':
        return <DocumentationStudioView />;
      case 'campaigns':
      case 'ai_social':
        return <CampaignsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'audit_logs':
      case 'audit-logs':
      case 'audit_log':
        return <AuditLogView />;
      case 'settings':
        return <ProfileView />;
      case 'posts':
      case 'assign_post':
      case 'assign-posts':
        return <HomeView />;
      case 'role_governance':
      case 'role-governance':
      case 'role_credentials':
      case 'super_admin_governance':
        return <SuperAdminOperationsView onBack={() => setActiveTab('operations')} />;
      case 'design-system':
      case 'design_system':
        return <DesignSystemView />;

      default:
        if (activeTab.startsWith('audits/')) {
          const auditId = activeTab.replace(/^audits\/?/, '') || 'daily-news-bulletin';
          return <AuditDetailPage auditId={auditId} />;
        }
        if (activeTab === 'audits') {
          return <AuditLogView />;
        }
        // Always fall back gracefully to HomeView instead of blocking entry with a lock screen
        return <HomeView />;
    }
  };

  // If backend module is turned off (Maintenance Mode), render the Under Maintenance screen
  // ONLY for non-superadmin users and unauthenticated guests.
  // SuperAdmin retains uninterrupted access to the SuperAdmin Cockpit to control and resume services.
  if (!isBackendActive && !isBypassedBySuperAdmin && !isSuperAdmin) {
    return (
      <UnderMaintenanceScreen
        onRefresh={async () => {
          const health = await apiClient.testServerHealth();
          if (health?.is_backend_active === true) {
            setIsBackendActive(true);
            showToast('Backend services resumed successfully.', 'success');
          } else {
            const active = localStorage.getItem('geohub_backend_active') !== 'false';
            if (active) {
              setIsBackendActive(true);
            }
          }
        }}
        onResumeBackend={() => {
          setIsBackendActive(true);
          showToast('Backend services resumed successfully.', 'success');
        }}
        onBypassToCockpit={() => {
          setIsBypassedBySuperAdmin(true);
          setActiveTab('home');
          showToast('Bypassed maintenance mode into SuperAdmin Cockpit.', 'info');
        }}
        isDbConnected={isDbConnected}
      />
    );
  }

  return (
    <div className="mobile-scaffold-root">
      {/* Shell column: responsive fullscreen or mobile frame */}
      <div
        className={`mobile-shell-column ${isPhoneFrame && !activeTab.startsWith('audits') ? 'phone-frame-mode' : 'fullscreen-mode'}`}
        style={{
          width: '100%',
          maxWidth: isPhoneFrame && !activeTab.startsWith('audits') ? '480px' : '100%',
          transition: 'max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Top Sticky Header (Hidden on immersive fullscreen QR Scanner and Profile page) */}
        {activeTab !== 'scan_qr' && activeTab !== 'profile' && (
          isSuperAdmin ? (
            <SuperAdminTopNav className={isPhoneFrame ? '' : 'lg:hidden'} />
          ) : (
            <TopBar />
          )
        )}

        {/* Global Security / Notification Toast (Floating gracefully below TopBar) */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type || 'info'}
            onClose={hideToast}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`mobile-app-content ${activeTab.startsWith('audits') ? 'audit-content-override' : ''
            } ${activeTab === 'community' || activeTab === 'forum'
              ? 'chat-content-override'
              : ''
            } ${activeTab === 'scan_qr' ? 'scan-content-override' : ''}`}
        >
          <PageTransition tabKey={activeTab}>
            {renderActiveScreen()}
          </PageTransition>
        </main>

        {/* Floating Pill Bottom Nav (5 role-based tabs, hidden on dedicated full-page audit views and immersive QR scanner) */}
        {isSuperAdmin ? (
          <SuperAdminBottomNav className={isPhoneFrame ? '' : 'lg:hidden'} />
        ) : (
          !activeTab.startsWith('audits') && activeTab !== 'scan_qr' && <FloatingNav />
        )}

        {/* Role Switcher Modal */}
        <RoleSwitcherModal />
      </div>
    </div>
  );
};

const GlobalUpdateModal: React.FC = () => {
  const { updateInfo, isUpdateModalOpen, setIsUpdateModalOpen, isUpdateMandatory } = useApp();
  return (
    <UpdateAvailableModal
      isOpen={isUpdateModalOpen}
      updateInfo={updateInfo}
      isMandatory={isUpdateMandatory}
      onClose={() => setIsUpdateModalOpen(false)}
    />
  );
};

const GlobalServerModal: React.FC = () => {
  const { isServerModalOpen, setIsServerModalOpen } = useApp();
  return (
    <ServerConnectionModal
      isOpen={isServerModalOpen}
      onClose={() => setIsServerModalOpen(false)}
    />
  );
};

const AppContentWithSplash: React.FC = () => {
  const { checkForUpdates } = useApp();
  const [showSplash, setShowSplash] = React.useState(() => {
    if (typeof window === 'undefined') return false;

    // Detect if running inside Android APK wrapper
    const isApk =
      navigator.userAgent.includes('GeoHubMobileApp') ||
      window.location.hostname === 'appassets.androidplatform.net' ||
      Boolean((window as any).AndroidBridge);

    // In APK: ALWAYS open the splash screen on launch to verify internet stability,
    // even if already authenticated, blocking entry until stable connection is confirmed.
    if (isApk) {
      return true;
    }

    // If backend is offline, skip splash to show Under Maintenance immediately
    if (localStorage.getItem('geohub_backend_active') === 'false') {
      return false;
    }

    // Explicit bypass for automated tests or headless audits
    if (window.location.search.includes('bypass_splash') || (window as any).__GEOHUB_E2E_AUDIT__) {
      return false;
    }

    // Direct hash deep-linking in automated layout audits (e.g. #non_existent_route_test)
    if (window.location.hash && window.location.hash !== '#login' && window.location.hash !== '#home') {
      return false;
    }

    return true;
  });

  // Allow re-triggering splash from console/testing if needed
  React.useEffect(() => {
    (window as any).triggerSplash = () => setShowSplash(true);
  }, []);

  return (
    <>
      {showSplash && (
        <SplashScreen
          onFinish={() => {
            setShowSplash(false);
            // Re-trigger update check right after splash completes network verification
            checkForUpdates(false);
          }}
        />
      )}
      <GlobalUpdateModal />
      <GlobalServerModal />
      <MainAppContent />
    </>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContentWithSplash />
    </AppProvider>
  );
}

export default App;
