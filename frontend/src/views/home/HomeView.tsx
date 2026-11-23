import React from 'react';
import { useApp } from '../../context/AppContext';
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

  // Fallback if role is super_admin: display the standard Coordinator executive home
  if (currentUser.role === 'super_admin') {
    return <CoordinatorHomeView />;
  }

  const postLower = (currentUser.post || '').toLowerCase();
  const teamLower = ((currentUser as any).squad || currentUser.team || '').toLowerCase();
  const isFaculty =
    currentUser.role === 'faculty' ||
    postLower.includes('faculty') ||
    postLower.includes('advisor');

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
      teamLower === 'management');

  const isDocLead =
    !isFaculty &&
    !isCoordinator &&
    !isManagement &&
    (currentUser.role === 'documentation' ||
      postLower.includes('documentation') ||
      teamLower === 'documentation');

  const isTreasurer =
    !isFaculty &&
    !isCoordinator &&
    !isManagement &&
    !isDocLead &&
    (currentUser.role === 'treasurer' ||
      postLower.includes('treasurer') ||
      teamLower === 'treasury');

  const isPromotion =
    !isFaculty &&
    !isCoordinator &&
    !isManagement &&
    !isDocLead &&
    !isTreasurer &&
    (currentUser.role === 'promotion' ||
      currentUser.role === 'social_media' ||
      (currentUser.role === 'team_admin' &&
        (teamLower === 'promotion' || postLower.includes('promotion'))) ||
      postLower.includes('promotion') ||
      teamLower === 'promotion');

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
