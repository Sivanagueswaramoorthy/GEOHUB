import { UserRole } from '../types';

export const FACULTY_ONLY_ARCHIVE = true;

export interface RolePermissions {
  canCreateEditEvents: boolean;
  canArchiveEvents: boolean;
  canApproveBudget: boolean;
  canScanQr: boolean;
  canManageMembers: boolean;
  canAccessFinance: boolean;
  canAccessDocStudio: boolean;
  canAccessCampaigns: boolean;
  canManageSquads: boolean;
  canAssignPosts: boolean;
  canManageSettings: boolean;
  canEditBudget: boolean;
  canReviewExecutiveApprovals: boolean;
}

export const getRolePermissions = (role: UserRole): RolePermissions => {
  switch (role) {
    case 'super_admin':
    case 'faculty':
      return {
        canCreateEditEvents: true,
        canArchiveEvents: true,
        canApproveBudget: true,
        canScanQr: true,
        canManageMembers: true,
        canAccessFinance: true,
        canAccessDocStudio: true,
        canAccessCampaigns: true,
        canManageSquads: true,
        canAssignPosts: true,
        canManageSettings: true,
        canEditBudget: true,
        canReviewExecutiveApprovals: true,
      };

    case 'admin':
    case 'coordinator':
      return {
        canCreateEditEvents: true,
        canArchiveEvents: false, // FACULTY_ONLY_ARCHIVE: hidden for Coordinator / Lead
        canApproveBudget: false,
        canScanQr: true,
        canManageMembers: true,
        canAccessFinance: true, // Read-only ledger view
        canAccessDocStudio: true,
        canAccessCampaigns: true,
        canManageSquads: true,
        canAssignPosts: false, // No assign post action or picker
        canManageSettings: false, // Hidden from Operations and direct URL
        canEditBudget: false, // Read-only budget view with "View only" chip
        canReviewExecutiveApprovals: false, // Replaced with coordinator tasks & attention queue
      };

    case 'treasurer':
      return {
        canCreateEditEvents: false,
        canArchiveEvents: false,
        canApproveBudget: true,
        canScanQr: true,
        canManageMembers: false,
        canAccessFinance: true,
        canAccessDocStudio: false,
        canAccessCampaigns: false,
        canManageSquads: false,
        canAssignPosts: false,
        canManageSettings: false,
        canEditBudget: false, // Allocation editing is hidden by permission and by route ("Set by Faculty")
        canReviewExecutiveApprovals: true,
      };

    case 'documentation':
      return {
        canCreateEditEvents: false,
        canArchiveEvents: false,
        canApproveBudget: false,
        canScanQr: true,
        canManageMembers: false,
        canAccessFinance: false,
        canAccessDocStudio: true,
        canAccessCampaigns: false,
        canManageSquads: false,
        canAssignPosts: false,
        canManageSettings: false,
        canEditBudget: false,
        canReviewExecutiveApprovals: false,
      };

    case 'social_media':
    case 'team_admin':
      return {
        canCreateEditEvents: false,
        canArchiveEvents: false,
        canApproveBudget: false,
        canScanQr: true,
        canManageMembers: false,
        canAccessFinance: false,
        canAccessDocStudio: false,
        canAccessCampaigns: true,
        canManageSquads: false,
        canAssignPosts: false,
        canManageSettings: false,
        canEditBudget: false,
        canReviewExecutiveApprovals: false,
      };

    case 'volunteer':
      return {
        canCreateEditEvents: false,
        canArchiveEvents: false,
        canApproveBudget: false,
        canScanQr: true,
        canManageMembers: false,
        canAccessFinance: false,
        canAccessDocStudio: false,
        canAccessCampaigns: false,
        canManageSquads: false,
        canAssignPosts: false,
        canManageSettings: false,
        canEditBudget: false,
        canReviewExecutiveApprovals: false,
      };

    case 'member':
    default:
      return {
        canCreateEditEvents: false,
        canArchiveEvents: false,
        canApproveBudget: false,
        canScanQr: false,
        canManageMembers: false,
        canAccessFinance: false,
        canAccessDocStudio: false,
        canAccessCampaigns: false,
        canManageSquads: false,
        canAssignPosts: false,
        canManageSettings: false,
        canEditBudget: false,
        canReviewExecutiveApprovals: false,
      };
  }
};

/**
 * Route guard checker.
 * If user attempts to navigate to a route they don't have access to,
 * redirect to 'home' with "You don't have access" toast.
 */
export const canAccessRoute = (
  route: string,
  role: UserRole
): { allowed: boolean; redirect?: string; message?: string } => {
  const normalizedRoute = route.toLowerCase().replace(/^[#/]+/, '');
  const perms = getRolePermissions(role);

  // Settings route check
  if (normalizedRoute === 'settings') {
    if (!perms.canManageSettings) {
      return {
        allowed: false,
        redirect: 'home',
        message: "You don't have access",
      };
    }
  }

  // Posts assignment route check
  if (normalizedRoute === 'posts' || normalizedRoute === 'assign_post' || normalizedRoute === 'assign-posts') {
    if (!perms.canAssignPosts) {
      return {
        allowed: false,
        redirect: 'home',
        message: "You don't have access",
      };
    }
  }

  // Budget/Officer approvals route check
  if (normalizedRoute === 'approvals') {
    if (!perms.canReviewExecutiveApprovals) {
      return {
        allowed: false,
        redirect: 'home',
        message: "You don't have access",
      };
    }
  }

  return { allowed: true };
};
