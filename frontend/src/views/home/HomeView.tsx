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

  const postLower = (currentUser.post || '').toLowerCase();
  const isFaculty = currentUser.role === 'faculty';
  const isCoordinator =
    !isFaculty &&
    (currentUser.role === 'admin' ||
      currentUser.role === 'coordinator' ||
      (postLower.includes('president') && !postLower.includes('vice')));
  const isManagement =
    !isFaculty &&
    !isCoordinator &&
    (currentUser.role === 'management' ||
      postLower.includes('vice president') ||
      (currentUser.team === 'Management' && !isFaculty && !isCoordinator));
  const isDocLead =
    !isFaculty &&
    !isCoordinator &&
    (currentUser.role === 'documentation' || postLower.includes('documentation'));
  const isTreasurer =
    !isFaculty &&
    !isCoordinator &&
    (currentUser.role === 'treasurer' || postLower.includes('treasurer'));
  const isPromotion =
    !isFaculty &&
    !isCoordinator &&
    (currentUser.role === 'promotion' ||
      currentUser.role === 'social_media' ||
      (currentUser.role === 'team_admin' &&
        (currentUser.team === 'Promotion' || postLower.includes('promotion'))) ||
      postLower.includes('promotion'));
  const isStudent =
    !isFaculty && !isCoordinator && !isDocLead && !isTreasurer && !isPromotion && !isManagement;

  if (isFaculty) {
    return <FacultyHomeView />;
  }

  if (isCoordinator) {
    return <CoordinatorHomeView />;
  }

  if (isManagement) {
    return <ManagementHomeView />;
  }

  if (isDocLead) {
    return <DocumentationHomeView />;
  }

  if (isTreasurer) {
    return (
      <TreasurerHomeView
        showToast={showToast}
        setSelectedEventId={setSelectedEventId}
      />
    );
  }

  if (isPromotion) {
    return <PromotionHomeView showToast={showToast} />;
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

  // Default chapter leadership / coordinator
  return <CoordinatorHomeView />;
};

export default HomeView;
