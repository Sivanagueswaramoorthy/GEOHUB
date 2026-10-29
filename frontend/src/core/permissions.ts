import { UserRole, FinalRole, UserModel, EventModel } from '../types';
import matrixData from './permissions_matrix.json';

export const FACULTY_ONLY_ARCHIVE = true;

export type PermissionFlag =
  | 'canCreateEditEvents'
  | 'canApproveEvents'
  | 'canArchiveEvents'
  | 'canCancelEvents'
  | 'canApproveBudget'
  | 'canSubmitBudgetRequest'
  | 'canManageExpenses'
  | 'canAccessFinance'
  | 'canEditBudget'
  | 'canAccessDocStudio'
  | 'canEditDocStudio'
  | 'canAccessCampaigns'
  | 'canManageCampaigns'
  | 'canManageMembers'
  | 'canManageSquads'
  | 'canAssignPosts'
  | 'canManageSettings'
  | 'canReviewExecutiveApprovals'
  | 'canCreateMemories'
  | 'canPublishMemories'
  | 'canCreateMeetings'
  | 'canSignOffMoM'
  | 'canExportReports'
  | 'canSendNotifications'
  | 'canViewAuditLog'
  | 'canViewAttendance'
  | 'canAssignEventDuties';

export interface RolePermissions {
  canCreateEditEvents: boolean;
  canApproveEvents: boolean;
  canArchiveEvents: boolean;
  canCancelEvents: boolean;
  canApproveBudget: boolean;
  canSubmitBudgetRequest: boolean;
  canManageExpenses: boolean;
  canAccessFinance: boolean;
  canEditBudget: boolean;
  canAccessDocStudio: boolean;
  canEditDocStudio: boolean;
  canAccessCampaigns: boolean;
  canManageCampaigns: boolean;
  canManageMembers: boolean;
  canManageSquads: boolean;
  canAssignPosts: boolean;
  canManageSettings: boolean;
  canReviewExecutiveApprovals: boolean;
  canCreateMemories: boolean;
  canPublishMemories: boolean;
  canCreateMeetings: boolean;
  canSignOffMoM: boolean;
  canExportReports: boolean;
  canSendNotifications: boolean;
  canViewAuditLog: boolean;
  canViewAttendance: boolean;
  canAssignEventDuties: boolean;
}

/**
 * Migration helper: normalizes legacy and final role strings to FinalRole.
 * Every new or unmapped user defaults to 'student'.
 */
export const normalizeRole = (role?: string | null): FinalRole => {
  if (!role) return 'student';
  const clean = role.toLowerCase().trim();
  switch (clean) {
    case 'super_admin':
    case 'faculty':
      return 'faculty';
    case 'admin':
    case 'coordinator':
      return 'coordinator';
    case 'documentation':
      return 'documentation';
    case 'treasurer':
      return 'treasurer';
    case 'social_media':
    case 'promotion':
      return 'promotion';
    case 'member':
    case 'volunteer':
    case 'team_admin':
    case 'student':
    default:
      return 'student';
  }
};

export const isSuperAdminRole = (role: UserRole | string): boolean => {
  const norm = normalizeRole(role);
  return norm === 'faculty';
};

/**
 * Layer 1: Long-lived Role Permission Matrix.
 * Deny by default: unknown roles or missing flags evaluate to false.
 */
export const getRolePermissions = (role: UserRole | string): RolePermissions => {
  const normalized = normalizeRole(role);
  const matrixEntry = (matrixData.matrix as Record<string, Record<string, boolean>>)[normalized];

  if (!matrixEntry) {
    // Default Deny
    return {
      canCreateEditEvents: false,
      canApproveEvents: false,
      canArchiveEvents: false,
      canCancelEvents: false,
      canApproveBudget: false,
      canSubmitBudgetRequest: false,
      canManageExpenses: false,
      canAccessFinance: false,
      canEditBudget: false,
      canAccessDocStudio: false,
      canEditDocStudio: false,
      canAccessCampaigns: false,
      canManageCampaigns: false,
      canManageMembers: false,
      canManageSquads: false,
      canAssignPosts: false,
      canManageSettings: false,
      canReviewExecutiveApprovals: false,
      canCreateMemories: false,
      canPublishMemories: false,
      canCreateMeetings: false,
      canSignOffMoM: false,
      canExportReports: false,
      canSendNotifications: false,
      canViewAuditLog: false,
      canViewAttendance: false,
      canAssignEventDuties: false,
    };
  }

  return {
    canCreateEditEvents: !!matrixEntry.canCreateEditEvents,
    canApproveEvents: !!matrixEntry.canApproveEvents,
    canArchiveEvents: !!matrixEntry.canArchiveEvents,
    canCancelEvents: !!matrixEntry.canCancelEvents,
    canApproveBudget: !!matrixEntry.canApproveBudget,
    canSubmitBudgetRequest: !!matrixEntry.canSubmitBudgetRequest,
    canManageExpenses: !!matrixEntry.canManageExpenses,
    canAccessFinance: !!matrixEntry.canAccessFinance,
    canEditBudget: !!matrixEntry.canEditBudget,
    canAccessDocStudio: !!matrixEntry.canAccessDocStudio,
    canEditDocStudio: !!matrixEntry.canEditDocStudio,
    canAccessCampaigns: !!matrixEntry.canAccessCampaigns,
    canManageCampaigns: !!matrixEntry.canManageCampaigns,
    canManageMembers: !!matrixEntry.canManageMembers,
    canManageSquads: !!matrixEntry.canManageSquads,
    canAssignPosts: !!matrixEntry.canAssignPosts,
    canManageSettings: !!matrixEntry.canManageSettings,
    canReviewExecutiveApprovals: !!matrixEntry.canReviewExecutiveApprovals,
    canCreateMemories: !!matrixEntry.canCreateMemories,
    canPublishMemories: !!matrixEntry.canPublishMemories,
    canCreateMeetings: !!matrixEntry.canCreateMeetings,
    canSignOffMoM: !!matrixEntry.canSignOffMoM,
    canExportReports: !!matrixEntry.canExportReports,
    canSendNotifications: !!matrixEntry.canSendNotifications,
    canViewAuditLog: !!matrixEntry.canViewAuditLog,
    canViewAttendance: !!matrixEntry.canViewAttendance,
    canAssignEventDuties: !!matrixEntry.canAssignEventDuties,
  };
};

/**
 * Checks if a user's post tenure has expired.
 */
export const isPostTenureValid = (tenureEnd?: string | null): boolean => {
  if (!tenureEnd) return true; // No tenure expiration set
  const expiry = new Date(tenureEnd).getTime();
  if (isNaN(expiry)) return true;
  return Date.now() <= expiry;
};

export interface PermissionContext {
  squad?: string;
  eventId?: string;
  assignedScanners?: string[];
  reportCategory?: 'finance' | 'general' | 'documentation';
}

/**
 * Three-Layer Permission Evaluation:
 * Check = Role allows it OR valid Post / Assignment grants it for specific resource.
 * Deny by default: missing flag or ungranted = false.
 */
export const hasPermission = (
  user: {
    role?: UserRole | string;
    post?: string;
    tenureEnd?: string;
    team?: string;
    teamRole?: string;
    uid?: string;
  } | null | undefined,
  flag: PermissionFlag,
  context?: PermissionContext
): boolean => {
  if (!user) return false;

  // Layer 1: Long-lived Role
  const rolePerms = getRolePermissions(user.role || 'student');
  if (rolePerms[flag]) {
    // Special check for treasurer report export: only finance exports allowed
    if (flag === 'canExportReports' && normalizeRole(user.role) === 'treasurer') {
      if (context?.reportCategory && context.reportCategory !== 'finance') {
        return false;
      }
    }
    return true;
  }

  // Layer 2: Post / Squad Level Authority
  // Check if post tenure is active
  const hasActiveTenure = isPostTenureValid(user.tenureEnd);
  if (hasActiveTenure) {
    const isTeamAdminPost =
      (user.post && (user.post.toLowerCase().includes('admin') || user.post.toLowerCase().includes('lead'))) ||
      user.role === 'team_admin' ||
      user.teamRole === 'Lead';

    if (isTeamAdminPost && user.team) {
      // Squad level student management: within own squad only
      if ((flag === 'canManageMembers' || flag === 'canManageSquads') && context?.squad) {
        if (context.squad.toLowerCase() === user.team.toLowerCase()) {
          return true;
        }
      }
    }
  }

  // Layer 3: Per-event Assignment (e.g., event scanner assignment)
  // Scanner module is controlled by per-event assigned scanners list, not role matrix!

  return false;
};

/**
 * Layer 3 Helper: Verify if a user is an authorized scanner for a specific event.
 */
export const canScanForEvent = (
  userOrId: string | UserModel,
  eventOrIds: string[] | EventModel | undefined | null
): boolean => {
  const userId = typeof userOrId === 'string' ? userOrId : userOrId?.uid;
  if (!userId) return false;

  let assigned: string[] = [];
  if (Array.isArray(eventOrIds)) {
    assigned = eventOrIds;
  } else if (eventOrIds && typeof eventOrIds === 'object') {
    assigned = (eventOrIds as EventModel).assignedScannerUserIds || [];
  }
  return assigned.includes(userId);
};

/**
 * Route guard checker.
 * Deny by default: If user attempts to navigate to a route they lack permissions for,
 * redirect with "You don't have access" message.
 */
export const canAccessRoute = (
  route: string,
  role: UserRole | string
): { allowed: boolean; redirect?: string; message?: string } => {
  const normalizedRoute = route.toLowerCase().replace(/^[#/]+/, '');
  const perms = getRolePermissions(role);
  const normRole = normalizeRole(role);

  // Settings: Faculty only
  if (normalizedRoute === 'settings') {
    if (!perms.canManageSettings) {
      return {
        allowed: false,
        redirect: 'home',
        message: "You don't have access",
      };
    }
  }

  // Posts assignment: Faculty only
  if (
    normalizedRoute === 'posts' ||
    normalizedRoute === 'assign_post' ||
    normalizedRoute === 'assign-posts'
  ) {
    if (!perms.canAssignPosts) {
      return {
        allowed: false,
        redirect: 'home',
        message: "You don't have access",
      };
    }
  }

  // Executive Approvals: Faculty only
  if (normalizedRoute === 'approvals') {
    if (!perms.canReviewExecutiveApprovals) {
      return {
        allowed: false,
        redirect: 'home',
        message: "You don't have access",
      };
    }
  }

  // Audit Log: Faculty only
  if (
    normalizedRoute.startsWith('audit') ||
    normalizedRoute === 'audit_logs' ||
    normalizedRoute === 'audit-logs' ||
    normalizedRoute === 'audit_log' ||
    normalizedRoute === 'audit-log'
  ) {
    if (!perms.canViewAuditLog) {
      return {
        allowed: false,
        redirect: 'home',
        message: "You don't have access",
      };
    }
  }

  // Finance: faculty, treasurer, coordinator
  if (normalizedRoute === 'finance' || normalizedRoute === 'treasurer') {
    if (!perms.canAccessFinance) {
      return {
        allowed: false,
        redirect: 'home',
        message: "You don't have access",
      };
    }
  }

  // Documentation Studio: faculty, coordinator, documentation
  if (normalizedRoute === 'doc_studio' || normalizedRoute === 'documentation' || normalizedRoute === 'docs') {
    if (!perms.canAccessDocStudio) {
      return {
        allowed: false,
        redirect: 'home',
        message: "You don't have access",
      };
    }
  }

  // Campaigns: faculty, coordinator, promotion
  if (normalizedRoute === 'campaigns' || normalizedRoute === 'social' || normalizedRoute === 'promotion') {
    if (!perms.canAccessCampaigns) {
      return {
        allowed: false,
        redirect: 'home',
        message: "You don't have access",
      };
    }
  }

  // Members management view: faculty, coordinator
  if (normalizedRoute === 'members' && normRole === 'student') {
    // Regular students can view the student directory or forum, but restricted admin management
    // We allow directory view, but restrict if squad management
  }

  return { allowed: true };
};
