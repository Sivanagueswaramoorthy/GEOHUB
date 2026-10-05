import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { FloatingNav } from './components/FloatingNav';
import { RoleSwitcherModal } from './components/navigation/RoleSwitcherModal';
import { Toast } from './components/Toast';

// Five Primary Screens
import { HomeView } from './views/home/HomeView';
import { ClubEventsView } from './views/events/ClubEventsView';
import { ExploreActivitiesView } from './views/operations/ExploreActivitiesView';
import { MembersDirectoryView } from './views/members/MembersDirectoryView';
import { ProfileView } from './views/profile/ProfileView';

// Sub-feature Views (accessible from Activities & Quick Actions)
import { LoginView } from './views/auth/LoginView';
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
import { AiSocialStudioView } from './views/social/AiSocialStudioView';
import { CampaignsView } from './views/campaigns/CampaignsView';
import { NotificationsView } from './views/notifications/NotificationsView';
import { PendingApprovalView } from './views/auth/PendingApprovalView';
import { NotFoundView } from './views/auth/NotFoundView';

import { getRoleNavTabs } from './core/nav';

const MainAppContent: React.FC = () => {
  const {
    isAuthenticated,
    currentUser,
    activeTab,
    setActiveTab,
    toast,
    hideToast,
    isPhoneFrame,
  } = useApp();

  if (!isAuthenticated || activeTab === 'login') {
    return <LoginView />;
  }

  if (currentUser?.status === 'pending' || activeTab === 'pending-approval') {
    return <PendingApprovalView />;
  }

  const navTabs = getRoleNavTabs(currentUser.role, currentUser.post);
  const primaryTabKeys = [
    'home',
    'dashboard',
    'operations',
    ...navTabs.map((t) => t.key),
    ...(navTabs.some((t) => t.key === 'archives') ? ['archives', 'gallery'] : []),
    ...(navTabs.some((t) => t.key === 'finance') ? ['finance', 'treasurer'] : []),
    ...(navTabs.some((t) => t.key === 'campaigns') ? ['campaigns', 'ai_social'] : []),
    ...(navTabs.some((t) => t.key === 'memories') ? ['memories'] : []),
  ];

  // Sub-routes that have a parent back destination
  const isSubRoute = !primaryTabKeys.includes(activeTab);

  const getSubRouteTitle = () => {
    switch (activeTab) {
      case 'scan_qr':
        return 'Gate QR Scanner';
      case 'my_qr':
        return 'Dynamic Chapter Pass';
      case 'attendance':
        return 'Live Gate Logs';
      case 'gallery':
        return 'Media Archives';
      case 'reports':
        return 'Executive Dossier';
      case 'approvals':
        return 'Faculty Sanctions';
      case 'tasks':
        return 'Task Deliverables';
      case 'teams':
        return 'Squad Leadership';
      case 'team_home':
        return 'Squad Command';
      case 'add_students':
        return 'Enroll Scholar';
      case 'documents':
        return 'Squad Documents';
      case 'meetings':
        return 'Chapter Meetings';
      case 'memories':
        return 'Chapter Memories';
      case 'forum':
        return 'Communication Forum';
      case 'treasurer':
        return 'Treasurer Ledger';
      case 'doc_studio':
        return 'Documentation Studio';
      case 'ai_social':
        return 'AI Social Studio';
      case 'notifications':
        return 'Official Bulletins';
      default:
        return 'Operation Module';
    }
  };

  const renderActiveScreen = () => {
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
        return <CommunicationForumView />;
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

      default:
        return <NotFoundView attemptedRoute={activeTab} onGoHome={() => setActiveTab('home')} />;
    }
  };

  return (
    <div className="mobile-scaffold-root">
      {/* Global Security / Route Guard Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type || 'error'}
          onClose={hideToast}
        />
      )}

      {/* Shell column: responsive fullscreen (1280px) or mobile frame (480px) */}
      <div
        className={`mobile-shell-column ${isPhoneFrame ? 'phone-frame-mode' : 'fullscreen-mode'}`}
        style={{
          width: '100%',
          maxWidth: isPhoneFrame ? '480px' : '1280px',
          transition: 'max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Top Sticky Header */}
        <Header />

        {/* Sub-view navigation bar if on a nested module */}
        {isSubRoute && (
          <div className="subroute-bar">
            <button
              type="button"
              onClick={() => setActiveTab('operations')}
              className="subroute-back-btn"
            >
              <ArrowLeft size={16} />
              <span>Activities</span>
            </button>
            <span className="subroute-title">{getSubRouteTitle()}</span>
            <div style={{ width: '60px' }} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="mobile-app-content">
          {renderActiveScreen()}
        </main>

        {/* Floating Pill Bottom Nav (5 role-based tabs) */}
        <FloatingNav />

        {/* Role Switcher Modal */}
        <RoleSwitcherModal />
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
