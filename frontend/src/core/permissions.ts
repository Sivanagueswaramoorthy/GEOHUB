import { UserRole, FinalRole, UserModel, EventModel, SquadMembership, AttendanceRecord, AttendanceStatus } from '../types';
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
  | 'canAssignEventDuties'
  | 'canAccessLedger'
  | 'canAccessCommunity'
  | 'canAccessGallery'
  | 'canUploadGallery'
  | 'canOverrideAttendance';

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
  canAccessLedger: boolean;
  canAccessCommunity: boolean;
  canAccessGallery: boolean;
  canUploadGallery: boolean;
  canOverrideAttendance: boolean;
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
      return 'super_admin';
    case 'faculty':
      return 'faculty';
    case 'admin':
    case 'coordinator':
      return 'coordinator';
    case 'management':
      return 'management';
    case 'documentation':
      return 'documentation';
    case 'treasurer':
      return 'treasurer';
    case 'social_media':
    case 'promotion':
      return 'promotion';
    case 'volunteer':
      return 'volunteer';
    case 'member':
    case 'team_admin':
    case 'student':
    default:
      return 'student';
  }
};

export const isSuperAdminRole = (role: UserRole | string): boolean => {
  const norm = normalizeRole(role);
  return norm === 'super_admin';
};

/**
 * Checks if a role is read-only for Events.
 * Treasurer, Promotion, Documentation, Volunteer, and Student are read-only for events.
 */
export const isReadOnlyEventsRole = (role?: UserRole | string): boolean => {
  const norm = normalizeRole(role);
  return norm === 'treasurer' || norm === 'promotion' || norm === 'documentation' || norm === 'student' || norm === 'volunteer';
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
      canAccessLedger: false,
      canAccessCommunity: false,
      canAccessGallery: false,
      canUploadGallery: false,
      canOverrideAttendance: false,
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
    canAccessLedger: !!matrixEntry.canAccessLedger,
    canAccessCommunity: !!matrixEntry.canAccessCommunity,
    canAccessGallery: !!matrixEntry.canAccessGallery,
    canUploadGallery: !!matrixEntry.canUploadGallery,
    canOverrideAttendance: !!matrixEntry.canOverrideAttendance,
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
 * Checks whether an event has concluded.
 * An event is ended if its status is 'completed', 'cancelled', or 'archived',
 * or if current time is past its scheduled endDate.
 */
export const isEventEnded = (event?: EventModel | null): boolean => {
  if (!event) return false;
  if (event.status === 'completed' || event.status === 'cancelled' || event.status === 'archived') {
    return true;
  }
  if (event.endDate) {
    const end = new Date(event.endDate).getTime();
    if (!isNaN(end) && Date.now() > end) {
      return true;
    }
  }
  return false;
};

/**
 * Checks if a user is authorized to access a squad's operations.
 * - Faculty and Coordinator: full access to all squads.
 * - Squad Leads: full read/write on their own squad for ALL events.
 * - Non-lead squad members:
 *   - Have READ access to their respective squad's Operations Hub.
 *   - Gain temporal WRITE access for a specific event if a duty is assigned/enabled.
 *   - Automatically reverts back to READ-ONLY mode once the event has ended.
 */
export const canAccessSquadOperations = (
  user: {
    uid?: string;
    name?: string;
    role?: UserRole | string;
    team?: string;
    teamRole?: string;
    post?: string;
    squadMemberships?: SquadMembership[];
  } | null | undefined,
  squad: string,
  event?: EventModel | null,
  requiredAccess: 'read' | 'write' = 'read'
): boolean => {
  if (!user) return false;
  const role = normalizeRole(user.role);
  if (role === 'faculty' || role === 'coordinator') return true;

  const targetSquad = squad.toLowerCase().trim();

  // Check if user is a lead for this specific squad
  const isSquadLead =
    user.squadMemberships?.some(
      (m) => m.squad.toLowerCase().trim() === targetSquad && m.isLead
    ) ||
    (user.team?.toLowerCase().trim() === targetSquad &&
      (user.teamRole?.toLowerCase().includes('lead') ||
        user.post?.toLowerCase().includes('lead') ||
        user.post?.toLowerCase().includes('admin') ||
        user.role === 'team_admin' ||
        (role as string) === targetSquad));

  // Team leads have full read/write on their own squad for ALL events
  if (isSquadLead) return true;

  // Check if user belongs to this squad
  const isSquadMember =
    user.team?.toLowerCase().trim() === targetSquad ||
    user.squadMemberships?.some((m) => m.squad.toLowerCase().trim() === targetSquad);

  if (!isSquadMember) return false;

  // Non-lead squad members: access strictly tied to duty assignment or per-event grant
  if (event && user.uid) {
    const hasDutyAssigned = Boolean(
      event.duties &&
      (Array.isArray(event.duties)
        ? event.duties.some(
            (d: any) =>
              (d.assignedTo === user.uid || (user.name && d.assignedToName?.toLowerCase() === user.name.toLowerCase())) &&
              (!d.squad || d.squad.toLowerCase().trim() === targetSquad)
          )
        : Object.entries(event.duties).some(
            ([sq, d]: any) =>
              sq.toLowerCase().trim() === targetSquad &&
              (d.assignedTo === user.uid || (user.name && d.assigneeName?.toLowerCase() === user.name.toLowerCase()))
          ))
    );

    const grant = event.squadGrants?.find(
      (g) => g.userId === user.uid && g.squad.toLowerCase().trim() === targetSquad
    );

    const hasEventAccess = hasDutyAssigned || Boolean(grant);

    if (hasEventAccess) {
      if (requiredAccess === 'write') {
        // If event ended, write access automatically drops back to read-only mode!
        if (isEventEnded(event)) {
          return false;
        }
        return hasDutyAssigned || grant?.access === 'write';
      }
      // Read access is retained for assigned members even post-event
      return true;
    }
  }

  return false;
};

/**
 * Checks whether an actor can add or enroll members into a specific squad.
 * Allowed for Faculty, Coordinator, or the respective Squad Lead.
 */
export const canAddSquadMember = (
  actor: UserModel | null | undefined,
  targetSquad: string
): boolean => {
  if (!actor) return false;
  const role = normalizeRole(actor.role);
  if (role === 'faculty' || role === 'coordinator') return true;

  const sq = targetSquad.toLowerCase().trim();
  const isLead =
    actor.squadMemberships?.some(
      (m) => m.squad.toLowerCase().trim() === sq && m.isLead
    ) ||
    (actor.team?.toLowerCase().trim() === sq &&
      (actor.teamRole?.toLowerCase().includes('lead') ||
        actor.post?.toLowerCase().includes('lead') ||
        actor.role === 'team_admin' ||
        (role as string) === sq));

  return Boolean(isLead);
};

/**
 * Checks whether an actor can assign or change Squad Leads.
 * Strictly reserved for Faculty Advisor (SuperAdmin) and Club President (Coordinator).
 */
export const canAssignSquadLead = (actor: UserModel | null | undefined): boolean => {
  if (!actor) return false;
  const role = normalizeRole(actor.role);
  return role === 'faculty' || role === 'coordinator';
};

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
    squadMemberships?: SquadMembership[];
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
  const hasActiveTenure = isPostTenureValid(user.tenureEnd);
  if (hasActiveTenure) {
    const isTeamAdminPost =
      (user.post && (user.post.toLowerCase().includes('admin') || user.post.toLowerCase().includes('lead'))) ||
      user.role === 'team_admin' ||
      user.teamRole === 'Lead';

    if (isTeamAdminPost && user.team) {
      if ((flag === 'canManageMembers' || flag === 'canManageSquads') && context?.squad) {
        if (context.squad.toLowerCase() === user.team.toLowerCase()) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Layer 3 Helper: Verify if a user is an authorized scanner for a specific event.
 * Scanner access depends on per-event attendance assignment, NOT on role alone.
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

export interface OtpValidationResult {
  valid: boolean;
  status: AttendanceStatus;
  error?: string;
  code: 'success' | 'already_marked' | 'invalid_or_expired' | 'not_authorized';
}

/**
 * Validates attendance marking via 6-digit OTP or scanned QR.
 * Internal events: 1 OTP/QR marks attendance directly to 'Completed'.
 * External events: 2 phases (Entry OTP -> 'Entered', Exit OTP -> 'Completed').
 */
export const validateEventOtp = (params: {
  event: EventModel;
  userId: string;
  otp: string;
  phase?: 'entry' | 'exit';
  currentAttendance?: AttendanceRecord;
  scannerUserId?: string;
}): OtpValidationResult => {
  const { event, otp, phase = 'entry', currentAttendance, scannerUserId } = params;

  // Scanner authority check (if scanned by another volunteer/proctor)
  if (scannerUserId && scannerUserId !== params.userId && !canScanForEvent(scannerUserId, event)) {
    return {
      valid: false,
      status: currentAttendance?.status || 'Not marked',
      error: 'User not authorized to take attendance for this event',
      code: 'not_authorized',
    };
  }

  const cleanOtp = otp.trim();

  // Expiry check
  if (event.otpExpiresAt && Date.now() > event.otpExpiresAt) {
    return {
      valid: false,
      status: currentAttendance?.status || 'Not marked',
      error: 'OTP has expired',
      code: 'invalid_or_expired',
    };
  }

  // Internal events: single OTP
  if (event.eventType !== 'external') {
    const validOtp = event.entryOtp || event.qrToken || '829401';
    if (cleanOtp !== validOtp) {
      return {
        valid: false,
        status: currentAttendance?.status || 'Not marked',
        error: 'Invalid or expired OTP',
        code: 'invalid_or_expired',
      };
    }
    if (currentAttendance?.status === 'Completed' || currentAttendance?.status === 'verified') {
      return {
        valid: false,
        status: currentAttendance.status,
        error: 'Attendance already marked for this event',
        code: 'already_marked',
      };
    }
    return {
      valid: true,
      status: 'Completed',
      code: 'success',
    };
  }

  // External events: two phases
  if (phase === 'entry') {
    const validEntryOtp = event.entryOtp || '419203';
    if (cleanOtp !== validEntryOtp) {
      return {
        valid: false,
        status: currentAttendance?.status || 'Not marked',
        error: 'Invalid or expired Entry OTP',
        code: 'invalid_or_expired',
      };
    }
    if (currentAttendance?.status === 'Entered' || currentAttendance?.status === 'Completed') {
      return {
        valid: false,
        status: currentAttendance.status,
        error: 'Entry already recorded',
        code: 'already_marked',
      };
    }
    return {
      valid: true,
      status: 'Entered',
      code: 'success',
    };
  } else {
    // Exit OTP
    const validExitOtp = event.exitOtp || '736194';
    if (cleanOtp !== validExitOtp) {
      return {
        valid: false,
        status: currentAttendance?.status || 'Not marked',
        error: 'Invalid or expired Exit OTP',
        code: 'invalid_or_expired',
      };
    }
    if (!currentAttendance || currentAttendance.status === 'Not marked') {
      return {
        valid: false,
        status: 'Not marked',
        error: 'Cannot record exit before entry is marked',
        code: 'invalid_or_expired',
      };
    }
    if (currentAttendance.status === 'Completed') {
      return {
        valid: false,
        status: 'Completed',
        error: 'Attendance already completed',
        code: 'already_marked',
      };
    }
    return {
      valid: true,
      status: 'Completed',
      code: 'success',
    };
  }
};

/**
 * Decision DEC-03 & PRO-01/PRO-02: Promotion posts are approved by Management Lead.
 * Any lead of the Management squad can approve, since a squad can have several leads.
 * A Management lead cannot approve a post they created themselves.
 * Faculty and the President can also review the queue.
 */
export const canApprovePromotionPost = (
  user: UserModel,
  post: { createdBy?: string; creatorId?: string; authorId?: string }
): boolean => {
  const isManagementLead =
    (user.team?.toLowerCase() === 'management' && (user.post?.toLowerCase().includes('lead') || user.teamRole?.toLowerCase().includes('lead') || user.role === 'team_admin')) ||
    Boolean(user.squadMemberships?.some((m) => m.squad.toLowerCase() === 'management' && m.isLead)) ||
    user.role === 'coordinator' ||
    user.role === 'admin' ||
    user.role === 'faculty' ||
    user.role === 'super_admin';

  if (!isManagementLead) return false;

  // Cannot approve own post (PRO-02)
  if (post.creatorId && post.creatorId === user.uid) return false;
  if (post.authorId && post.authorId === user.uid) return false;
  if (post.createdBy && (post.createdBy === user.name || post.createdBy === user.email)) return false;

  return true;
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

  // SuperAdmin Role Credentials & Operations Governance: SuperAdmin only
  if (
    normalizedRoute === 'role_governance' ||
    normalizedRoute === 'role-governance' ||
    normalizedRoute === 'role_credentials' ||
    normalizedRoute === 'super_admin_governance'
  ) {
    if (normRole !== 'super_admin') {
      return {
        allowed: false,
        redirect: 'home',
        message: "You don't have access - SuperAdmin clearance required",
      };
    }
  }

  // Finance & Ledger: faculty, treasurer, coordinator
  if (normalizedRoute === 'finance' || normalizedRoute === 'treasurer' || normalizedRoute === 'ledger') {
    if (!perms.canAccessFinance && !perms.canAccessLedger) {
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

// =========================================================================
// Operations Hub RBAC & Module Access Matrix
// =========================================================================

export type ModuleId =
  | 'squads'
  | 'member_directory'
  | 'attendance_desk'
  | 'duties_stations'
  | 'lead_activity_review'
  | 'event_permissions'
  | 'treasury'
  | 'expenditure_ledger'
  | 'add_expense'
  | 'financial_audit_export'
  | 'release_calendar'
  | 'event_media_upload'
  | 'bulletins_daily_report'
  | 'studio_templates'
  | 'pre_event_upload'
  | 'meetings_mom'
  | 'daily_news_bulletins'
  | 'attendance_operation'
  | 'squad_leads'
  | 'approvals'
  | 'duties_assignment'
  | 'campaign_post';

export type AccessLevel = 'hidden' | 'read' | 'write';

export type HubRole =
  | 'faculty'
  | 'president'
  | 'coordinator'
  | 'treasurer'
  | 'promotion'
  | 'documentation'
  | 'management'
  | 'student';

export type ModuleSectionId = 'People' | 'Events' | 'Finance' | 'Media and Docs' | 'Review';

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  description: string;
  section: ModuleSectionId;
  iconName: string;
  defaultPendingCount?: number;
}

export const ALL_MODULE_IDS: ModuleId[] = [
  'squads',
  'member_directory',
  'attendance_desk',
  'duties_stations',
  'lead_activity_review',
  'event_permissions',
  'treasury',
  'expenditure_ledger',
  'add_expense',
  'financial_audit_export',
  'release_calendar',
  'event_media_upload',
  'bulletins_daily_report',
  'studio_templates',
  'pre_event_upload',
  'meetings_mom',
  'daily_news_bulletins',
  'attendance_operation',
  'squad_leads',
  'approvals',
  'duties_assignment',
  'campaign_post',
];

export const normalizeHubRole = (role?: string | null): HubRole => {
  if (!role) return 'student';
  const clean = role.toLowerCase().trim();
  switch (clean) {
    case 'faculty':
    case 'super_admin':
      return 'faculty';
    case 'president':
      return 'president';
    case 'coordinator':
    case 'admin':
      return 'coordinator';
    case 'treasurer':
      return 'treasurer';
    case 'promotion':
    case 'social_media':
      return 'promotion';
    case 'documentation':
      return 'documentation';
    case 'management':
      return 'management';
    case 'member':
    case 'volunteer':
    case 'student':
    default:
      return 'student';
  }
};

/**
 * Squad to Module Ownership mapping.
 */
export const SQUAD_MODULES: Record<string, ModuleId[]> = {
  management: ['attendance_operation', 'squad_leads', 'approvals', 'meetings_mom', 'duties_assignment'],
  promotion: ['campaign_post', 'release_calendar', 'event_media_upload', 'bulletins_daily_report'],
  documentation: ['studio_templates', 'pre_event_upload', 'meetings_mom', 'daily_news_bulletins'],
  treasurer: ['treasury', 'expenditure_ledger', 'add_expense', 'financial_audit_export'],
  finance: ['treasury', 'expenditure_ledger', 'add_expense', 'financial_audit_export'],
};

/**
 * Base Operations Hub Matrix per Role.
 * Shows ONLY the listed modules for each role; anything not listed is HIDDEN.
 */
export const MODULE_ACCESS: Record<string, Record<ModuleId, AccessLevel>> = {
  faculty: {
    squads: 'write',
    member_directory: 'write',
    attendance_desk: 'write',
    duties_stations: 'read',
    lead_activity_review: 'write',
    event_permissions: 'write',
    treasury: 'read',
    expenditure_ledger: 'read',
    add_expense: 'write',
    financial_audit_export: 'write',
    release_calendar: 'write',
    event_media_upload: 'write',
    bulletins_daily_report: 'write',
    studio_templates: 'hidden',
    pre_event_upload: 'hidden',
    meetings_mom: 'hidden',
    daily_news_bulletins: 'hidden',
    attendance_operation: 'hidden',
    squad_leads: 'hidden',
    approvals: 'hidden',
    duties_assignment: 'hidden',
    campaign_post: 'hidden',
  },
  president: {
    squads: 'write',
    member_directory: 'write',
    attendance_desk: 'write',
    duties_stations: 'write',
    lead_activity_review: 'write',
    event_permissions: 'write',
    treasury: 'write',
    expenditure_ledger: 'read',
    add_expense: 'write',
    financial_audit_export: 'write',
    release_calendar: 'write',
    event_media_upload: 'write',
    bulletins_daily_report: 'write',
    studio_templates: 'hidden',
    pre_event_upload: 'hidden',
    meetings_mom: 'hidden',
    daily_news_bulletins: 'hidden',
    attendance_operation: 'hidden',
    squad_leads: 'hidden',
    approvals: 'hidden',
    duties_assignment: 'hidden',
    campaign_post: 'hidden',
  },
  coordinator: {
    // Coordinator has identical rights to President
    squads: 'write',
    member_directory: 'write',
    attendance_desk: 'write',
    duties_stations: 'write',
    lead_activity_review: 'write',
    event_permissions: 'write',
    treasury: 'write',
    expenditure_ledger: 'read',
    add_expense: 'write',
    financial_audit_export: 'write',
    release_calendar: 'write',
    event_media_upload: 'write',
    bulletins_daily_report: 'write',
    studio_templates: 'hidden',
    pre_event_upload: 'hidden',
    meetings_mom: 'hidden',
    daily_news_bulletins: 'hidden',
    attendance_operation: 'hidden',
    squad_leads: 'hidden',
    approvals: 'hidden',
    duties_assignment: 'hidden',
    campaign_post: 'hidden',
  },
  treasurer: {
    expenditure_ledger: 'write',
    add_expense: 'write',
    financial_audit_export: 'write',
    squads: 'hidden',
    member_directory: 'hidden',
    attendance_desk: 'hidden',
    duties_stations: 'hidden',
    lead_activity_review: 'hidden',
    event_permissions: 'hidden',
    treasury: 'hidden',
    release_calendar: 'hidden',
    event_media_upload: 'hidden',
    bulletins_daily_report: 'hidden',
    studio_templates: 'hidden',
    pre_event_upload: 'hidden',
    meetings_mom: 'hidden',
    daily_news_bulletins: 'hidden',
    attendance_operation: 'hidden',
    squad_leads: 'hidden',
    approvals: 'hidden',
    duties_assignment: 'hidden',
    campaign_post: 'hidden',
  },
  promotion: {
    campaign_post: 'write',
    release_calendar: 'write',
    event_media_upload: 'write',
    bulletins_daily_report: 'write',
    squads: 'hidden',
    member_directory: 'hidden',
    attendance_desk: 'hidden',
    duties_stations: 'hidden',
    lead_activity_review: 'hidden',
    event_permissions: 'hidden',
    treasury: 'hidden',
    expenditure_ledger: 'hidden',
    add_expense: 'hidden',
    financial_audit_export: 'hidden',
    studio_templates: 'hidden',
    pre_event_upload: 'hidden',
    meetings_mom: 'hidden',
    daily_news_bulletins: 'hidden',
    attendance_operation: 'hidden',
    squad_leads: 'hidden',
    approvals: 'hidden',
    duties_assignment: 'hidden',
  },
  documentation: {
    studio_templates: 'write',
    pre_event_upload: 'write',
    meetings_mom: 'write',
    daily_news_bulletins: 'write',
    squads: 'hidden',
    member_directory: 'hidden',
    attendance_desk: 'hidden',
    duties_stations: 'hidden',
    lead_activity_review: 'hidden',
    event_permissions: 'hidden',
    treasury: 'hidden',
    expenditure_ledger: 'hidden',
    add_expense: 'hidden',
    financial_audit_export: 'hidden',
    release_calendar: 'hidden',
    event_media_upload: 'hidden',
    bulletins_daily_report: 'hidden',
    attendance_operation: 'hidden',
    squad_leads: 'hidden',
    approvals: 'hidden',
    duties_assignment: 'hidden',
    campaign_post: 'hidden',
  },
  management: {
    attendance_operation: 'write',
    squad_leads: 'write',
    approvals: 'write',
    meetings_mom: 'write',
    duties_assignment: 'write',
    squads: 'hidden',
    member_directory: 'hidden',
    attendance_desk: 'hidden',
    duties_stations: 'hidden',
    lead_activity_review: 'hidden',
    event_permissions: 'hidden',
    treasury: 'hidden',
    expenditure_ledger: 'hidden',
    add_expense: 'hidden',
    financial_audit_export: 'hidden',
    release_calendar: 'hidden',
    event_media_upload: 'hidden',
    bulletins_daily_report: 'hidden',
    studio_templates: 'hidden',
    pre_event_upload: 'hidden',
    daily_news_bulletins: 'hidden',
    campaign_post: 'hidden',
  },
  student: {
    squads: 'read',
    member_directory: 'hidden',
    attendance_desk: 'hidden',
    duties_stations: 'hidden',
    lead_activity_review: 'hidden',
    event_permissions: 'hidden',
    treasury: 'hidden',
    expenditure_ledger: 'hidden',
    add_expense: 'hidden',
    financial_audit_export: 'hidden',
    release_calendar: 'hidden',
    event_media_upload: 'hidden',
    bulletins_daily_report: 'hidden',
    studio_templates: 'hidden',
    pre_event_upload: 'hidden',
    meetings_mom: 'hidden',
    daily_news_bulletins: 'hidden',
    attendance_operation: 'hidden',
    squad_leads: 'hidden',
    approvals: 'hidden',
    duties_assignment: 'hidden',
    campaign_post: 'hidden',
  },
};

// Aliases for legacy role strings
MODULE_ACCESS.super_admin = MODULE_ACCESS.faculty;
MODULE_ACCESS.admin = MODULE_ACCESS.coordinator;
MODULE_ACCESS.social_media = MODULE_ACCESS.promotion;
MODULE_ACCESS.member = MODULE_ACCESS.student;
MODULE_ACCESS.volunteer = MODULE_ACCESS.student;

/**
 * Checks extra role permissions (approve, grant) for a module.
 */
export const can = (
  role: string | null | undefined,
  moduleId: ModuleId,
  action: 'approve' | 'grant'
): boolean => {
  if (!role) return false;
  const hubRole = normalizeHubRole(role);

  if (action === 'approve') {
    if (moduleId === 'lead_activity_review') {
      return hubRole === 'faculty' || hubRole === 'president' || hubRole === 'coordinator';
    }
    if (moduleId === 'treasury') {
      // Final budget approval is President/Coordinator only. Faculty can flag, cannot give final approval.
      return hubRole === 'president' || hubRole === 'coordinator';
    }
    if (moduleId === 'approvals') {
      return (
        hubRole === 'management' ||
        hubRole === 'faculty' ||
        hubRole === 'president' ||
        hubRole === 'coordinator'
      );
    }
    return false;
  }

  if (action === 'grant') {
    if (moduleId === 'event_permissions') {
      return hubRole === 'faculty' || hubRole === 'president' || hubRole === 'coordinator';
    }
    return false;
  }

  return false;
};

// =========================================================================
// Squad Grants Store & Helpers (Per-event single grants)
// =========================================================================

export interface SquadGrant {
  id: string;
  userId: string;
  userName?: string;
  squad: string;
  eventId: string;
  eventName?: string;
  access: 'read' | 'write';
  grantedBy: string;
  grantedAt: string;
}

export const MOCK_SQUAD_GRANTS: SquadGrant[] = [];

export const grantSquadAccess = (
  grant: Omit<SquadGrant, 'id' | 'grantedAt'>
): SquadGrant => {
  const newGrant: SquadGrant = {
    ...grant,
    id: `grant-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    squad: grant.squad.toLowerCase().trim(),
    grantedAt: new Date().toISOString(),
  };
  MOCK_SQUAD_GRANTS.push(newGrant);
  return newGrant;
};

export const revokeSquadAccess = (
  grantIdOrUserId: string,
  eventId?: string
): boolean => {
  const index = MOCK_SQUAD_GRANTS.findIndex(
    (g) =>
      g.id === grantIdOrUserId ||
      (g.userId === grantIdOrUserId && (!eventId || g.eventId === eventId))
  );
  if (index >= 0) {
    MOCK_SQUAD_GRANTS.splice(index, 1);
    return true;
  }
  return false;
};

export const getSquadGrant = (
  userId: string,
  squad: string,
  eventId?: string,
  event?: EventModel | null
): SquadGrant | undefined => {
  if (!eventId) return undefined;
  const targetSquad = squad.toLowerCase().trim();

  // First check event-attached grants if available
  if (event && event.squadGrants) {
    const eg = event.squadGrants.find(
      (g) =>
        g.userId === userId &&
        g.squad.toLowerCase().trim() === targetSquad
    );
    if (eg) {
      return {
        id: `event-grant-${userId}-${targetSquad}`,
        userId,
        squad: targetSquad,
        eventId,
        access: eg.access as 'read' | 'write',
        grantedBy: 'Squad Lead',
        grantedAt: new Date().toISOString(),
      };
    }
  }

  // Then check MOCK_SQUAD_GRANTS
  return MOCK_SQUAD_GRANTS.find(
    (g) =>
      g.userId === userId &&
      g.squad.toLowerCase().trim() === targetSquad &&
      g.eventId === eventId
  );
};

/**
 * Section 4 Squad Access Evaluation:
 * - Team leads have WRITE on their own squad's modules for ALL events. Other squads' modules stay HIDDEN.
 * - A non-lead squad member gets READ on their own squad's modules.
 *   A lead can give them WRITE for ONE event only. The grant never applies to another event.
 * - A member in several squads gets each squad's access separately. A squad can have several leads, all with equal access.
 * - Scanner access is per event and per delegated user, never by role alone.
 */
export const moduleAccess = (
  user: UserModel | null | undefined,
  moduleId: ModuleId,
  eventId?: string,
  event?: EventModel | null
): AccessLevel => {
  if (!user) return 'hidden';

  const hubRole = normalizeHubRole(user.role);
  let bestAccess: AccessLevel = MODULE_ACCESS[hubRole]?.[moduleId] || 'hidden';

  // If role matrix already grants write, keep it
  if (bestAccess === 'write') {
    return 'write';
  }

  // Gather squads and lead status
  const userSquads: { squad: string; isLead: boolean }[] = [];

  if (user.squadMemberships && user.squadMemberships.length > 0) {
    user.squadMemberships.forEach((m) => {
      userSquads.push({
        squad: m.squad.toLowerCase().trim(),
        isLead: Boolean(m.isLead),
      });
    });
  }

  if (user.team) {
    const teamNorm = user.team.toLowerCase().trim();
    const isLead = Boolean(
      user.teamRole?.toLowerCase().includes('lead') ||
      user.post?.toLowerCase().includes('lead') ||
      user.post?.toLowerCase().includes('admin') ||
      user.role === 'team_admin'
    );
    if (!userSquads.some((s) => s.squad === teamNorm)) {
      userSquads.push({ squad: teamNorm, isLead });
    }
  }

  const roleClean = (user.role || '').toLowerCase().trim();
  if (['management', 'promotion', 'documentation', 'treasurer'].includes(roleClean)) {
    const isLead = Boolean(user.post?.toLowerCase().includes('lead') || roleClean === 'treasurer');
    if (!userSquads.some((s) => s.squad === roleClean)) {
      userSquads.push({ squad: roleClean, isLead });
    }
  }

  // Evaluate squad memberships
  for (const sq of userSquads) {
    const squadModules = SQUAD_MODULES[sq.squad] || [];
    if (squadModules.includes(moduleId)) {
      if (sq.isLead) {
        return 'write';
      } else {
        let currentSquadAccess: AccessLevel = 'read';

        if (eventId) {
          if (!isEventEnded(event)) {
            const hasDuty = Boolean(
              event &&
              event.duties &&
              Array.isArray(event.duties) &&
              event.duties.some(
                (d: any) =>
                  (d.assignedTo === user.uid || (user.name && d.assignedToName?.toLowerCase() === user.name.toLowerCase())) &&
                  (!d.squad || d.squad.toLowerCase().trim() === sq.squad)
              )
            );
            const grant = getSquadGrant(user.uid, sq.squad, eventId, event);
            if (hasDuty || (grant && grant.access === 'write')) {
              return 'write';
            }
          }
        }

        if (bestAccess === 'hidden') {
          bestAccess = currentSquadAccess;
        }
      }
    }
  }

  return bestAccess;
};

// =========================================================================
// Governance & Role Specific Guard Helpers
// =========================================================================

/**
 * Member Directory: Only Faculty can remove members.
 * President has WRITE, but CANNOT remove members.
 */
export const canRemoveMember = (actor: UserModel | null | undefined): boolean => {
  if (!actor) return false;
  const hubRole = normalizeHubRole(actor.role);
  return hubRole === 'faculty';
};

/**
 * President cannot edit Faculty accounts.
 * Faculty can edit all accounts.
 */
export const canEditMember = (
  actor: UserModel | null | undefined,
  target: UserModel | null | undefined
): boolean => {
  if (!actor || !target) return false;
  const actorRole = normalizeHubRole(actor.role);
  const targetRole = normalizeHubRole(target.role);

  if (actorRole === 'faculty') return true;

  if (actorRole === 'president' || actorRole === 'coordinator') {
    if (targetRole === 'faculty') return false;
    return true;
  }

  return false;
};

/**
 * Treasurer cannot approve their own budget requests.
 * Only President can approve Treasury budget requests.
 */
export const canApproveBudgetRequest = (
  actor: UserModel | null | undefined,
  request: { requesterId?: string; requesterEmail?: string }
): boolean => {
  if (!actor) return false;
  const hubRole = normalizeHubRole(actor.role);
  if (hubRole === 'treasurer') return false;
  if (actor.uid && request.requesterId && actor.uid === request.requesterId) return false;
  if (actor.email && request.requesterEmail && actor.email === request.requesterEmail) return false;

  return can(actor.role, 'treasury', 'approve');
};

// =========================================================================
// Mock Data for Hub & Squad Testing
// =========================================================================

export const MOCK_MULTI_SQUAD_USER: UserModel = {
  uid: 'usr-multi-squad-1',
  name: 'Arun Kumar',
  email: 'arun.multi@geohub.edu',
  role: 'student',
  isVolunteer: false,
  status: 'active',
  squadMemberships: [
    { squad: 'Documentation', isLead: false },
    { squad: 'Promotion', isLead: true },
  ],
};

export const MOCK_SQUADS_WITH_LEADS = [
  {
    id: 'squad-management',
    name: 'Management',
    leads: [
      { uid: 'lead-mgmt-1', name: 'Divya Rao', email: 'divya@geohub.edu' },
      { uid: 'lead-mgmt-2', name: 'Karthik Raja', email: 'karthik@geohub.edu' },
    ],
    membersCount: 14,
  },
  {
    id: 'squad-promotion',
    name: 'Promotion',
    leads: [{ uid: 'lead-promo-1', name: 'Sneha Patel', email: 'sneha@geohub.edu' }],
    membersCount: 9,
  },
  {
    id: 'squad-documentation',
    name: 'Documentation',
    leads: [{ uid: 'lead-doc-1', name: 'Manoj Verma', email: 'manoj@geohub.edu' }],
    membersCount: 8,
  },
];

export interface CampaignPostItem {
  id: string;
  title: string;
  platform: 'Instagram' | 'LinkedIn' | 'Twitter' | 'Website';
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Published';
  authorId: string;
  authorName: string;
  scheduledFor?: string;
  rejectionReason?: string;
  content: string;
  createdAt: string;
}

export const MOCK_POSTS_WITH_STATUSES: CampaignPostItem[] = [
  {
    id: 'post-draft-1',
    title: 'Drone Mapping Workshop Teaser',
    platform: 'Instagram',
    status: 'Draft',
    authorId: 'user-promo-writer',
    authorName: 'Sneha Patel',
    content: 'Get ready for aerial photogrammetry hands-on training this weekend! 🚁',
    createdAt: '2026-10-27T08:00:00Z',
  },
  {
    id: 'post-submitted-1',
    title: 'GIS Summit 2026 Registration Announcement',
    platform: 'LinkedIn',
    status: 'Submitted',
    authorId: 'user-promo-writer',
    authorName: 'Sneha Patel',
    content: 'Registrations are now live for the state GIS & Remote Sensing Conclave.',
    createdAt: '2026-10-27T10:15:00Z',
  },
  {
    id: 'post-approved-1',
    title: 'Recap: Geodesy Field Camp 2026',
    platform: 'Instagram',
    status: 'Approved',
    authorId: 'user-promo-writer',
    authorName: 'Sneha Patel',
    scheduledFor: '2026-11-02T16:00:00Z',
    content: 'Highlights from our 3-day GNSS positioning field campaign.',
    createdAt: '2026-10-26T12:00:00Z',
  },
  {
    id: 'post-rejected-1',
    title: 'Unofficial Afterparty Post',
    platform: 'Instagram',
    status: 'Rejected',
    authorId: 'user-promo-writer',
    authorName: 'Sneha Patel',
    rejectionReason: 'Must strictly follow institutional branding and conduct guidelines.',
    content: 'Join us after the symposium for an off-campus bash!',
    createdAt: '2026-10-25T15:00:00Z',
  },
  {
    id: 'post-published-1',
    title: 'Welcome New GeoHub Scholars 2026',
    platform: 'Website',
    status: 'Published',
    authorId: 'lead-mgmt-1',
    authorName: 'Divya Rao',
    content: 'Welcome to the Geomatics Engineering Organization Hub family!',
    createdAt: '2026-10-20T09:00:00Z',
  },
];

export const MODULE_CONFIGS: Record<ModuleId, ModuleConfig> = {
  squads: {
    id: 'squads',
    name: 'Squads',
    description: 'Team rosters, squads & collaborative group stations',
    section: 'People',
    iconName: 'Users',
  },
  member_directory: {
    id: 'member_directory',
    name: 'Member Directory',
    description: 'Roster management, membership statuses & profiles',
    section: 'People',
    iconName: 'UserCheck',
  },
  squad_leads: {
    id: 'squad_leads',
    name: 'Squad Leads',
    description: 'Squad lead appointments & operational coordination',
    section: 'People',
    iconName: 'Shield',
  },
  attendance_desk: {
    id: 'attendance_desk',
    name: 'Attendance Desk',
    description: 'Check-in tracking & manual override with audit reasons',
    section: 'Events',
    iconName: 'QrCode',
  },
  attendance_operation: {
    id: 'attendance_operation',
    name: 'Attendance Operation',
    description: 'QR/OTP generation and single-event scanner delegation',
    section: 'Events',
    iconName: 'Scan',
  },
  duties_stations: {
    id: 'duties_stations',
    name: 'Duties and Stations',
    description: 'Station deployments, venue logistics & task allocations',
    section: 'Events',
    iconName: 'MapPin',
  },
  duties_assignment: {
    id: 'duties_assignment',
    name: 'Duties Assignment',
    description: 'Assign volunteer tasks, venue posts & crew stations',
    section: 'Events',
    iconName: 'ClipboardList',
  },
  event_permissions: {
    id: 'event_permissions',
    name: 'Event Permissions',
    description: 'Single-event access delegation, grants & immediate revokes',
    section: 'Events',
    iconName: 'Key',
  },
  treasury: {
    id: 'treasury',
    name: 'Treasury',
    description: 'Budget requests, sanction approvals & fund allocations',
    section: 'Finance',
    iconName: 'Landmark',
    defaultPendingCount: 1,
  },
  expenditure_ledger: {
    id: 'expenditure_ledger',
    name: 'Expenditure Ledger',
    description: 'Immutable financial log with timestamps & actors',
    section: 'Finance',
    iconName: 'BookOpen',
  },
  add_expense: {
    id: 'add_expense',
    name: 'Add Expense',
    description: 'Log expenses with bill proof, event tags & categories',
    section: 'Finance',
    iconName: 'Receipt',
  },
  financial_audit_export: {
    id: 'financial_audit_export',
    name: 'Financial Audit Export',
    description: 'Generate formal audit statements & expense reports',
    section: 'Finance',
    iconName: 'FileSpreadsheet',
  },
  release_calendar: {
    id: 'release_calendar',
    name: 'Release Calendar',
    description: 'Campaign milestones, publication schedules & launch dates',
    section: 'Media and Docs',
    iconName: 'Calendar',
  },
  event_media_upload: {
    id: 'event_media_upload',
    name: 'Event Media Upload',
    description: 'High-res photos, video reels & visual asset repository',
    section: 'Media and Docs',
    iconName: 'UploadCloud',
  },
  bulletins_daily_report: {
    id: 'bulletins_daily_report',
    name: 'Bulletins and Daily Report',
    description: 'Daily activity summaries, releases & operational bulletins',
    section: 'Media and Docs',
    iconName: 'Newspaper',
  },
  studio_templates: {
    id: 'studio_templates',
    name: 'Studio and Templates',
    description: 'Standard document templates, letters & graphic assets',
    section: 'Media and Docs',
    iconName: 'LayoutTemplate',
  },
  pre_event_upload: {
    id: 'pre_event_upload',
    name: 'Pre-event Upload',
    description: 'Permission briefs, venue permits & clearance dossiers',
    section: 'Media and Docs',
    iconName: 'FolderUp',
  },
  meetings_mom: {
    id: 'meetings_mom',
    name: 'Meetings and MoM',
    description: 'Meeting minutes, attendance records & agenda scheduling',
    section: 'Media and Docs',
    iconName: 'FileText',
  },
  daily_news_bulletins: {
    id: 'daily_news_bulletins',
    name: 'Daily News Bulletins',
    description: 'Official club bulletins, community updates & notices',
    section: 'Media and Docs',
    iconName: 'Radio',
  },
  campaign_post: {
    id: 'campaign_post',
    name: 'Campaign and Post',
    description: 'Draft, schedule & submit posts through the approval flow',
    section: 'Media and Docs',
    iconName: 'Share2',
    defaultPendingCount: 2,
  },
  lead_activity_review: {
    id: 'lead_activity_review',
    name: 'Lead Activity Review',
    description: 'Review squad lead initiatives & sign off milestones',
    section: 'Review',
    iconName: 'CheckCircle2',
    defaultPendingCount: 2,
  },
  approvals: {
    id: 'approvals',
    name: 'Approvals',
    description: 'Review queue for squad updates & campaign posts',
    section: 'Review',
    iconName: 'CheckSquare',
    defaultPendingCount: 3,
  },
};

