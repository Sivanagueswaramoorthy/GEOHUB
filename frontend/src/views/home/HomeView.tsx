import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  StudentHomeView,
  CoordinatorHomeView,
  FacultyHomeView,
  TreasurerHomeView,
  DocumentationHomeView,
  PromotionHomeView,
} from '../roles';

export const HomeView: React.FC = () => {
  const { currentUser, showToast, setSelectedEventId, registerForEvent } = useApp();

  const isFaculty = currentUser.role === 'super_admin' || currentUser.role === 'faculty';
  const isDocLead =
    currentUser.role === 'documentation' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('documentation'));
  const isTreasurer =
    currentUser.role === 'treasurer' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('treasurer'));
  const isPromotion =
    currentUser.role === 'social_media' ||
    (currentUser.role === 'team_admin' &&
      (currentUser.team === 'Promotion' ||
        Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion')))) ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion'));
  const isStudent =
    currentUser.role === 'student' ||
    currentUser.role === 'member' ||
    currentUser.role === 'volunteer';

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
