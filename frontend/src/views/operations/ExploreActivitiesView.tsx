import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  PromotionOperationsView,
  TreasurerOperationsView,
  DocumentationOperationsView,
  StudentOperationsView,
  FacultyOperationsView,
  CoordinatorOperationsView,
} from '../roles';

export const ExploreActivitiesView: React.FC = () => {
  const { currentUser } = useApp();

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
  const isStudent = currentUser.role === 'member';

  if (isPromotion) {
    return <PromotionOperationsView />;
  }

  if (isTreasurer) {
    return <TreasurerOperationsView />;
  }

  if (isDocLead) {
    return <DocumentationOperationsView />;
  }

  if (isStudent) {
    return <StudentOperationsView />;
  }

  if (isFaculty) {
    return <FacultyOperationsView />;
  }

  return <CoordinatorOperationsView />;
};

export default ExploreActivitiesView;
