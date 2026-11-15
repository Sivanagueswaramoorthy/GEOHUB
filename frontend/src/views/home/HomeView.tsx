import React from 'react';
import { useApp } from '../../context/AppContext';
import { SuperAdminOperationsView } from '../admin/SuperAdminOperationsView';
import {
  StudentHomeView,
  CoordinatorHomeView,
  FacultyHomeView,
  TreasurerHomeView,
  DocumentationHomeView,
  PromotionHomeView,
  ManagementHomeView,
} from '../roles';

export const HomeView: React.FC = () => {
  const { currentUser, showToast, setSelectedEventId, registerForEvent } = useApp();

  // SuperAdmin Master Command Cockpit
  if (currentUser.role === 'super_admin') {
    return <SuperAdminOperationsView onBack={() => {}} isHomeCockpit={true} />;
  }

  const isFaculty = currentUser.role === 'faculty';
  const isCoordinator =
    currentUser.role === 'admin' ||
    currentUser.role === 'coordinator' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('president'));
  const isDocLead =
    currentUser.role === 'documentation' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('documentation'));
  const isTreasurer =
    currentUser.role === 'treasurer' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('treasurer'));
  const isPromotion =
    currentUser.role === 'promotion' ||
    currentUser.role === 'social_media' ||
    (currentUser.role === 'team_admin' &&
      (currentUser.team === 'Promotion' ||
        Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion')))) ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion'));
  const isManagement =
    currentUser.role === 'management' ||
    (currentUser.team === 'Management' && !isFaculty && !isCoordinator);
  const isStudent =
    !isFaculty && !isCoordinator && !isDocLead && !isTreasurer && !isPromotion && !isManagement;

  if (isPromotion) {
    return <PromotionHomeView showToast={showToast} />;
  }

  if (isTreasurer) {
    return (
      <TreasurerHomeView
        showToast={showToast}
        setSelectedEventId={setSelectedEventId}
      />
    );
  }

  if (isDocLead) {
    return <DocumentationHomeView />;
  }

  if (isManagement) {
    return <ManagementHomeView />;
  }

  if (isStudent) {
    return (
      <StudentHomeView
        showToast={showToast}
        setSelectedEventId={setSelectedEventId}
        registerForEvent={registerForEvent}
      />
    );
  }

  if (isFaculty) {
    return <FacultyHomeView />;
  }

  // Default chapter leadership / coordinator
  return <CoordinatorHomeView />;
};

export default HomeView;
