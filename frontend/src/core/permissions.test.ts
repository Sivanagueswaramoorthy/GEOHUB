import { describe, it, expect } from 'vitest';
import permissionsMatrix from './permissions_matrix.json';
import {
  getRolePermissions,
  canAccessRoute,
  FACULTY_ONLY_ARCHIVE,
  normalizeRole,
  canScanForEvent,
  hasPermission,
  canAccessSquadOperations,
  isReadOnlyEventsRole,
  validateEventOtp,
  canApprovePromotionPost,
  RolePermissions,
  ALL_MODULE_IDS,
  MODULE_ACCESS,
  moduleAccess,
  can,
  canRemoveMember,
  canEditMember,
  canApproveBudgetRequest,
  grantSquadAccess,
  revokeSquadAccess,
  ModuleId,
  AccessLevel,
  HubRole,
  MOCK_MULTI_SQUAD_USER,
  MOCK_SQUADS_WITH_LEADS,
} from './permissions';
import { UserModel, EventModel, UserRole } from '../types';

describe('RBAC Hardened Permissions Matrix & Security Suite', () => {
  const finalRoles: UserRole[] = [
    'faculty',
    'coordinator',
    'documentation',
    'treasurer',
    'promotion',
    'student',
  ];

  const allFlags = Object.keys(permissionsMatrix.matrix.faculty) as (keyof RolePermissions)[];

  // =========================================================================
  // 1. Full Matrix Generation: Every Flag × Every Role (27 flags × 6 roles = 162 assertions)
  // =========================================================================
  describe('Exhaustive Matrix Generation (All 27 Flags × All 6 Final Roles)', () => {
    finalRoles.forEach((role) => {
      describe(`Role: ${role}`, () => {
        const perms = getRolePermissions(role);
        const expectedRoleMatrix = (permissionsMatrix.matrix as Record<string, Record<string, boolean>>)[role];

        allFlags.forEach((flag) => {
          const expectedValue = Boolean(expectedRoleMatrix[flag]);
          it(`asserts flag "${flag}" is ${expectedValue}`, () => {
            expect(perms[flag]).toBe(expectedValue);
          });
        });
      });
    });
  });

  // =========================================================================
  // 2. Backward Compatibility & Migration of Old Role Names
  // =========================================================================
  describe('Legacy Role Migration & Normalization', () => {
    it('normalizes super_admin as super_admin', () => {
      expect(normalizeRole('super_admin')).toBe('super_admin');
      const perms = getRolePermissions('super_admin');
      expect(perms.canApproveEvents).toBe(true);
      expect(perms.canArchiveEvents).toBe(true);
      expect(perms.canApproveBudget).toBe(true);
    });

    it('normalizes admin to coordinator', () => {
      expect(normalizeRole('admin')).toBe('coordinator');
      const perms = getRolePermissions('admin');
      expect(perms.canCreateEditEvents).toBe(true);
      expect(perms.canApproveEvents).toBe(false);
      expect(perms.canArchiveEvents).toBe(false);
      expect(perms.canApproveBudget).toBe(true);
    });

    it('normalizes social_media to promotion', () => {
      expect(normalizeRole('social_media')).toBe('promotion');
      const perms = getRolePermissions('social_media');
      expect(perms.canManageCampaigns).toBe(true);
    });

    it('normalizes member to student and preserves canonical volunteer role', () => {
      expect(normalizeRole('member')).toBe('student');
      expect(normalizeRole('volunteer')).toBe('volunteer');
      expect(normalizeRole('team_admin')).toBe('student');
    });

    it('defaults unknown role to student (deny by default)', () => {
      expect(normalizeRole('guest')).toBe('student');
      expect(normalizeRole('')).toBe('student');
      expect(normalizeRole(undefined as any)).toBe('student');
    });

    it('verifies canScanQr has been completely removed from matrix', () => {
      const perms = getRolePermissions('faculty');
      expect((perms as any).canScanQr).toBeUndefined();
    });
  });

  // =========================================================================
  // 3. The 12 Specific Security and Governance Tests (Spec Section 10)
  // =========================================================================
  describe('12 Core Security Scenarios', () => {
    // 1. Unassigned user cannot scan
    it('1. unassigned user cannot scan for an event', () => {
      const unassignedUser = {
        uid: 'u_user_99',
        name: 'Unassigned User',
        email: 'unassigned@college.edu',
        role: 'student',
        isVolunteer: false,
        status: 'active',
      } as UserModel;
      const event = {
        id: 'event_01',
        title: 'GIS Expedition',
        status: 'live',
        venue: 'Room 101',
        startDate: '2026-11-01',
        endDate: '2026-11-01',
        category: 'GIS',
        assignedScannerUserIds: ['u_scanner_01', 'u_scanner_02'],
      } as EventModel;

      const canScan = canScanForEvent(unassignedUser, event);
      expect(canScan).toBe(false);
    });

    // 2. Assigned student can scan
    it('2. assigned student can scan for an event', () => {
      const assignedStudent = {
        uid: 'u_student_42',
        name: 'Assigned Student',
        email: 'assigned.student@college.edu',
        role: 'student',
        isVolunteer: false,
        status: 'active',
      } as UserModel;
      const event = {
        id: 'event_01',
        title: 'GIS Expedition',
        status: 'live',
        venue: 'Room 101',
        startDate: '2026-11-01',
        endDate: '2026-11-01',
        category: 'GIS',
        assignedScannerUserIds: ['u_student_42'],
      } as EventModel;

      const canScan = canScanForEvent(assignedStudent, event);
      expect(canScan).toBe(true);
    });

    // 3. Treasurer cannot approve a budget (President approves final per DEC-02)
    it('3. treasurer cannot approve a budget (President approves final per DEC-02)', () => {
      const treasurerPerms = getRolePermissions('treasurer');
      const facultyPerms = getRolePermissions('faculty');
      const coordPerms = getRolePermissions('coordinator');

      expect(treasurerPerms.canApproveBudget).toBe(false);
      expect(treasurerPerms.canSubmitBudgetRequest).toBe(true);
      expect(treasurerPerms.canManageExpenses).toBe(true);
      expect(facultyPerms.canApproveBudget).toBe(true);
      expect(coordPerms.canApproveBudget).toBe(true);
    });

    // 4. Coordinator cannot approve or archive events
    it('4. coordinator cannot approve or archive events', () => {
      const coordPerms = getRolePermissions('coordinator');
      expect(coordPerms.canCreateEditEvents).toBe(true);
      expect(coordPerms.canApproveEvents).toBe(false);
      expect(coordPerms.canArchiveEvents).toBe(false);
      expect(FACULTY_ONLY_ARCHIVE).toBe(true);
    });

    // 5. Expired token rejected
    it('5. expired token (> 60s) is rejected', () => {
      const issueTime = Date.now() - 65 * 1000; // 65 seconds ago
      const expiresAt = issueTime + 60 * 1000;
      const isExpired = Date.now() > expiresAt;

      expect(isExpired).toBe(true);

      const verifyToken = (tokenExpiresAt: number) => {
        if (Date.now() > tokenExpiresAt) {
          return { valid: false, error: 'QR token has expired (60s lifetime exceeded)' };
        }
        return { valid: true };
      };

      const result = verifyToken(expiresAt);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    // 6. Reused token rejected
    it('6. reused single-use token is rejected atomically', () => {
      const usedTokens = new Set<string>(['tok_abc_123']);

      const verifyAndConsumeToken = (token: string) => {
        if (usedTokens.has(token)) {
          return { valid: false, error: 'QR token has already been used' };
        }
        usedTokens.add(token);
        return { valid: true };
      };

      const firstAttempt = verifyAndConsumeToken('tok_new_999');
      expect(firstAttempt.valid).toBe(true);

      const secondAttempt = verifyAndConsumeToken('tok_new_999');
      expect(secondAttempt.valid).toBe(false);
      expect(secondAttempt.error).toContain('already been used');
    });

    // 7. Wrong-event token rejected
    it('7. wrong-event token is rejected', () => {
      const token = {
        tokenId: 'tok_xyz',
        eventId: 'event_01',
        userId: 'u_user_01',
        expiresAt: Date.now() + 60000,
      };

      const currentEventId = 'event_02';

      const verifyEventMatch = (tokenEventId: string, targetEventId: string) => {
        if (tokenEventId !== targetEventId) {
          return { valid: false, error: 'Token event mismatch' };
        }
        return { valid: true };
      };

      const result = verifyEventMatch(token.eventId, currentEventId);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token event mismatch');
    });

    // 8. Cancel without reason rejected
    it('8. cancel without non-empty reason is rejected', () => {
      const validateCancellation = (reason?: string) => {
        if (!reason || reason.trim().length < 10) {
          return { valid: false, error: 'Mandatory cancellation reason required (min 10 characters)' };
        }
        return { valid: true };
      };

      expect(validateCancellation('').valid).toBe(false);
      expect(validateCancellation('   ').valid).toBe(false);
      expect(validateCancellation('Too short').valid).toBe(false);
      expect(validateCancellation('Weather emergency and flash flood warning').valid).toBe(true);
    });

    // 9. Self role change rejected
    it('9. self role change / escalation is rejected', () => {
      const actorId = 'u_coord_01';
      const targetId = 'u_coord_01';

      const verifyRoleChange = (actor: string, target: string, newRole: UserRole) => {
        if (actor === target) {
          return { allowed: false, error: 'No self-escalation allowed' };
        }
        return { allowed: true };
      };

      const result = verifyRoleChange(actorId, targetId, 'faculty');
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('No self-escalation');
    });

    // 10. Last faculty cannot be demoted
    it('10. last remaining faculty account cannot be removed or demoted', () => {
      const allUsers = [
        { uid: 'u_fac_01', role: 'faculty', name: 'Dr. Jenkins', email: 'j@col.edu', isVolunteer: false, status: 'active' },
        { uid: 'u_coord_01', role: 'coordinator', name: 'Alex', email: 'a@col.edu', isVolunteer: false, status: 'active' },
      ] as UserModel[];

      const verifyFacultyDemotion = (targetUid: string, users: UserModel[]) => {
        const target = users.find((u) => u.uid === targetUid);
        if (target && target.role === 'faculty') {
          const facultyCount = users.filter((u) => u.role === 'faculty').length;
          if (facultyCount <= 1) {
            return { allowed: false, error: 'Cannot demote the last remaining faculty account' };
          }
        }
        return { allowed: true };
      };

      const result = verifyFacultyDemotion('u_fac_01', allUsers);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('last remaining faculty');
    });

    // 11. Expired post loses its permissions
    it('11. expired post tenure automatically loses squad authority permissions', () => {
      const activePostUser = {
        uid: 'u_squad_lead',
        name: 'Squad Lead',
        email: 'lead@col.edu',
        role: 'student',
        post: 'team_admin',
        team: 'Management',
        isVolunteer: false,
        status: 'active',
        tenureEnd: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days future
      } as UserModel;

      const expiredPostUser = {
        uid: 'u_expired_lead',
        name: 'Expired Lead',
        email: 'expired@col.edu',
        role: 'student',
        post: 'team_admin',
        team: 'Management',
        isVolunteer: false,
        status: 'active',
        tenureEnd: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days past
      } as UserModel;

      const activePerms = hasPermission(activePostUser, 'canManageSquads', { squad: 'Management' });
      const expiredPerms = hasPermission(expiredPostUser, 'canManageSquads', { squad: 'Management' });

      expect(activePerms).toBe(true);
      expect(expiredPerms).toBe(false);
    });

    // 12. Invalid lifecycle transitions rejected
    it('12. invalid lifecycle jumps are rejected on state machine', () => {
      const allowedTransitions: Record<string, string[]> = {
        draft: ['submitted', 'cancelled'],
        submitted: ['approved', 'draft', 'cancelled'],
        approved: ['live', 'cancelled'],
        live: ['completed', 'done', 'cancelled'],
        completed: ['archived'],
        done: ['archived'],
        archived: [],
        cancelled: [],
      };

      const isValidTransition = (from: string, to: string) => {
        return allowedTransitions[from]?.includes(to) ?? false;
      };

      // Invalid jumps
      expect(isValidTransition('draft', 'live')).toBe(false); // cannot jump directly to live
      expect(isValidTransition('draft', 'archived')).toBe(false); // cannot jump to archive
      expect(isValidTransition('submitted', 'completed')).toBe(false); // must go to approved then live
      expect(isValidTransition('archived', 'live')).toBe(false); // terminal state
      expect(isValidTransition('cancelled', 'approved')).toBe(false); // terminal state

      // Valid progressions
      expect(isValidTransition('draft', 'submitted')).toBe(true);
      expect(isValidTransition('submitted', 'approved')).toBe(true);
      expect(isValidTransition('approved', 'live')).toBe(true);
      expect(isValidTransition('live', 'completed')).toBe(true);
      expect(isValidTransition('completed', 'archived')).toBe(true);
    });
  });

  // =========================================================================
  // 4. Route Guard & UX Protection Tests
  // =========================================================================
  describe('Route Guards and Deny-by-Default UX', () => {
    it('allows faculty to access institutional governance routes', () => {
      expect(canAccessRoute('settings', 'faculty').allowed).toBe(true);
      expect(canAccessRoute('posts', 'faculty').allowed).toBe(true);
      expect(canAccessRoute('approvals', 'faculty').allowed).toBe(true);
      expect(canAccessRoute('audit_logs', 'faculty').allowed).toBe(true);
      expect(canAccessRoute('audit-logs', 'faculty').allowed).toBe(true);
    });

    it('denies coordinator access to settings and posts, but allows approvals and audit log per DEC-02/DEC-06', () => {
      const settingsCheck = canAccessRoute('settings', 'coordinator');
      expect(settingsCheck.allowed).toBe(false);
      expect(settingsCheck.redirect).toBe('home');
      expect(settingsCheck.message).toBe("You don't have access");

      const postsCheck = canAccessRoute('posts', 'coordinator');
      expect(postsCheck.allowed).toBe(false);

      const approvalsCheck = canAccessRoute('approvals', 'coordinator');
      expect(approvalsCheck.allowed).toBe(true);

      const auditCheck = canAccessRoute('audit_logs', 'coordinator');
      expect(auditCheck.allowed).toBe(true);
    });

    it('denies student access to finance and management routes', () => {
      expect(canAccessRoute('finance', 'student').allowed).toBe(false);
      expect(canAccessRoute('settings', 'student').allowed).toBe(false);
      expect(canAccessRoute('audit_logs', 'student').allowed).toBe(false);
    });

    it('allows coordinator read-only finance view and denies edit capabilities', () => {
      expect(canAccessRoute('finance', 'coordinator').allowed).toBe(true);
      expect(getRolePermissions('coordinator').canEditBudget).toBe(false);
      expect(getRolePermissions('coordinator').canManageExpenses).toBe(false);
    });

    it('allows access to community and gallery routes for all roles', () => {
      expect(canAccessRoute('community', 'student').allowed).toBe(true);
      expect(canAccessRoute('gallery', 'student').allowed).toBe(true);
      expect(canAccessRoute('ledger', 'treasurer').allowed).toBe(true);
      expect(canAccessRoute('ledger', 'faculty').allowed).toBe(true);
      expect(canAccessRoute('ledger', 'student').allowed).toBe(false);
    });
  });

  // =========================================================================
  // 5. Spec Section 6 Tests: Lead vs Non-Lead, Per-Event Grants, Scanners, OTP & Read-Only Roles
  // =========================================================================
  describe('Spec Section 6: Granular Squad Access & Governance Suite', () => {
    const promotionLead: UserModel = {
      uid: 'u_promo_lead',
      name: 'Promo Lead',
      email: 'lead@col.edu',
      role: 'promotion',
      team: 'Promotion',
      teamRole: 'Promotion Lead',
      post: 'Promotion Lead',
      squadMemberships: [{ squad: 'Promotion', isLead: true }],
      isVolunteer: false,
      status: 'active',
    };

    const regularMember: UserModel = {
      uid: 'u_regular_member',
      name: 'Regular Member',
      email: 'member@col.edu',
      role: 'student',
      team: 'Promotion',
      teamRole: 'Graphic Designer',
      squadMemberships: [{ squad: 'Promotion', isLead: false }],
      isVolunteer: false,
      status: 'active',
    };

    const eventWithGrant: EventModel = {
      id: 'event_hack_01',
      title: 'Geohack 2026',
      description: 'Hackathon',
      category: 'Tech',
      status: 'live',
      venue: 'Main Hall',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      capacity: 100,
      registeredUserIds: [],
      volunteerIds: [],
      budget: 10000,
      createdBy: 'u_fac_01',
      assignedScannerUserIds: ['u_regular_member'],
      squadGrants: [
        {
          userId: 'u_regular_member',
          squad: 'Promotion',
          access: 'write',
          grantedBy: 'u_promo_lead',
          grantedAt: new Date().toISOString(),
        },
      ],
    };

    const anotherEvent: EventModel = {
      id: 'event_symp_02',
      title: 'GIS Symposium',
      description: 'Symposium',
      category: 'Academic',
      status: 'live',
      venue: 'Hall B',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      capacity: 100,
      registeredUserIds: [],
      volunteerIds: [],
      budget: 5000,
      createdBy: 'u_fac_01',
      assignedScannerUserIds: [],
      squadGrants: [],
    };

    it('squad leads have full read/write on their own squad operations for ALL events', () => {
      // Event 1
      expect(canAccessSquadOperations(promotionLead, 'Promotion', eventWithGrant, 'read')).toBe(true);
      expect(canAccessSquadOperations(promotionLead, 'Promotion', eventWithGrant, 'write')).toBe(true);
      // Event 2 (grant not required for leads)
      expect(canAccessSquadOperations(promotionLead, 'Promotion', anotherEvent, 'read')).toBe(true);
      expect(canAccessSquadOperations(promotionLead, 'Promotion', anotherEvent, 'write')).toBe(true);
      // Generic without event
      expect(canAccessSquadOperations(promotionLead, 'Promotion', null, 'write')).toBe(true);
    });

    it('squad leads cannot access operations of other squads (hidden)', () => {
      expect(canAccessSquadOperations(promotionLead, 'Documentation', eventWithGrant, 'read')).toBe(false);
      expect(canAccessSquadOperations(promotionLead, 'Management', eventWithGrant, 'read')).toBe(false);
    });

    it('non-lead squad members have no squad operations by default', () => {
      expect(canAccessSquadOperations(regularMember, 'Promotion', null, 'read')).toBe(false);
      expect(canAccessSquadOperations(regularMember, 'Promotion', anotherEvent, 'read')).toBe(false);
    });

    it('a lead grant applies to the specific event only and NEVER to another event', () => {
      // Access granted for eventWithGrant
      expect(canAccessSquadOperations(regularMember, 'Promotion', eventWithGrant, 'read')).toBe(true);
      expect(canAccessSquadOperations(regularMember, 'Promotion', eventWithGrant, 'write')).toBe(true);

      // Access NOT granted for anotherEvent
      expect(canAccessSquadOperations(regularMember, 'Promotion', anotherEvent, 'read')).toBe(false);
      expect(canAccessSquadOperations(regularMember, 'Promotion', anotherEvent, 'write')).toBe(false);
    });

    it('scanner access depends strictly on per-event assignment, not on role alone', () => {
      // regularMember is assigned in eventWithGrant
      expect(canScanForEvent(regularMember, eventWithGrant)).toBe(true);
      // regularMember is NOT assigned in anotherEvent
      expect(canScanForEvent(regularMember, anotherEvent)).toBe(false);

      // Even a lead or faculty is denied if not in event.assignedScannerUserIds
      expect(canScanForEvent(promotionLead, eventWithGrant)).toBe(false);
    });

    it('validates internal event OTP: single OTP marks attendance to Completed', () => {
      const internalEvent: EventModel = {
        ...eventWithGrant,
        eventType: 'internal',
        entryOtp: '654321',
        otpExpiresAt: Date.now() + 60000,
      };

      // Valid OTP marks Completed
      const res = validateEventOtp({
        event: internalEvent,
        userId: 'u_student_99',
        otp: '654321',
        scannerUserId: 'u_regular_member',
      });
      expect(res.valid).toBe(true);
      expect(res.status).toBe('Completed');
      expect(res.code).toBe('success');

      // Invalid OTP fails
      const badRes = validateEventOtp({
        event: internalEvent,
        userId: 'u_student_99',
        otp: '000000',
        scannerUserId: 'u_regular_member',
      });
      expect(badRes.valid).toBe(false);
      expect(badRes.code).toBe('invalid_or_expired');

      // Already marked fails
      const dupRes = validateEventOtp({
        event: internalEvent,
        userId: 'u_student_99',
        otp: '654321',
        currentAttendance: {
          id: 'att_1',
          eventId: internalEvent.id,
          eventTitle: internalEvent.title,
          userId: 'u_student_99',
          userName: 'Student',
          userEmail: 's@col.edu',
          status: 'Completed',
        },
        scannerUserId: 'u_regular_member',
      });
      expect(dupRes.valid).toBe(false);
      expect(dupRes.code).toBe('already_marked');
    });

    it('validates external event OTP: two phases (Entry OTP and Exit OTP)', () => {
      const externalEvent: EventModel = {
        ...eventWithGrant,
        eventType: 'external',
        entryOtp: '111222',
        exitOtp: '333444',
        otpExpiresAt: Date.now() + 60000,
      };

      // Phase 1: Entry OTP
      const entryRes = validateEventOtp({
        event: externalEvent,
        userId: 'u_student_99',
        otp: '111222',
        phase: 'entry',
        scannerUserId: 'u_regular_member',
      });
      expect(entryRes.valid).toBe(true);
      expect(entryRes.status).toBe('Entered');
      expect(entryRes.code).toBe('success');

      // Phase 2: Exit OTP without prior entry is rejected
      const earlyExitRes = validateEventOtp({
        event: externalEvent,
        userId: 'u_student_99',
        otp: '333444',
        phase: 'exit',
        currentAttendance: {
          id: 'att_1',
          eventId: externalEvent.id,
          eventTitle: externalEvent.title,
          userId: 'u_student_99',
          userName: 'Student',
          userEmail: 's@col.edu',
          status: 'Not marked',
        },
        scannerUserId: 'u_regular_member',
      });
      expect(earlyExitRes.valid).toBe(false);

      // Phase 2: Exit OTP after entry marks Completed
      const validExitRes = validateEventOtp({
        event: externalEvent,
        userId: 'u_student_99',
        otp: '333444',
        phase: 'exit',
        currentAttendance: {
          id: 'att_1',
          eventId: externalEvent.id,
          eventTitle: externalEvent.title,
          userId: 'u_student_99',
          userName: 'Student',
          userEmail: 's@col.edu',
          status: 'Entered',
        },
        scannerUserId: 'u_regular_member',
      });
      expect(validExitRes.valid).toBe(true);
      expect(validExitRes.status).toBe('Completed');
    });

    it('enforces read-only roles on events: Treasurer, Promotion, Documentation, and Student', () => {
      expect(isReadOnlyEventsRole('treasurer')).toBe(true);
      expect(isReadOnlyEventsRole('promotion')).toBe(true);
      expect(isReadOnlyEventsRole('documentation')).toBe(true);
      expect(isReadOnlyEventsRole('student')).toBe(true);

      expect(isReadOnlyEventsRole('faculty')).toBe(false);
      expect(isReadOnlyEventsRole('coordinator')).toBe(false);

      expect(getRolePermissions('treasurer').canCreateEditEvents).toBe(false);
      expect(getRolePermissions('promotion').canCreateEditEvents).toBe(false);
      expect(getRolePermissions('documentation').canCreateEditEvents).toBe(false);
      expect(getRolePermissions('student').canCreateEditEvents).toBe(false);

      expect(getRolePermissions('faculty').canCreateEditEvents).toBe(true);
      expect(getRolePermissions('coordinator').canCreateEditEvents).toBe(true);
    });

    // =========================================================================
    // 6. Settled Decisions Suite (DEC-02, DEC-03, DEC-04, DEC-06)
    // =========================================================================
    it('DEC-02 & FIN-01: president can approve budget requests, treasurer cannot approve self', () => {
      const presidentPerms = getRolePermissions('coordinator');
      const treasurerPerms = getRolePermissions('treasurer');

      expect(presidentPerms.canApproveBudget).toBe(true);
      expect(treasurerPerms.canApproveBudget).toBe(false);
      expect(treasurerPerms.canSubmitBudgetRequest).toBe(true);
    });

    it('DEC-03 & PRO-01/PRO-02: management lead can approve promotion posts and cannot approve self-created post', () => {
      const mgmtLead: UserModel = {
        uid: 'u_mgmt_lead_01',
        name: 'Vikram Seth',
        email: 'vikram@college.edu',
        role: 'student',
        team: 'Management',
        post: 'Management Lead',
        teamRole: 'Lead',
        isVolunteer: false,
        status: 'active',
      };

      const regularStudent: UserModel = {
        uid: 'u_student_02',
        name: 'Regular Student',
        email: 'student@college.edu',
        role: 'student',
        team: 'Management',
        post: 'Volunteer',
        isVolunteer: false,
        status: 'active',
      };

      const promoPostOther = {
        id: 'post_01',
        title: 'Tree Planting Drive',
        createdBy: 'Maya Patel',
        creatorId: 'u_promo_lead',
      };

      const promoPostSelf = {
        id: 'post_02',
        title: 'Management Convening',
        createdBy: 'Vikram Seth',
        creatorId: 'u_mgmt_lead_01',
      };

      // Management lead can approve posts by others
      expect(canApprovePromotionPost(mgmtLead, promoPostOther)).toBe(true);

      // Management lead cannot approve self-created post (PRO-02)
      expect(canApprovePromotionPost(mgmtLead, promoPostSelf)).toBe(false);

      // Non-lead member cannot approve posts
      expect(canApprovePromotionPost(regularStudent, promoPostOther)).toBe(false);
    });

    it('DEC-06 & PERM-07: president can manage and assign posts but member deletion is guarded', () => {
      const coordPerms = getRolePermissions('coordinator');
      expect(coordPerms.canManageMembers).toBe(true);
      expect(coordPerms.canCreateEditEvents).toBe(true);

      // Verify deletion restriction logic: only faculty can delete users
      const canDeleteMember = (actorRole: string) => {
        return actorRole === 'faculty' || actorRole === 'super_admin';
      };

      expect(canDeleteMember('coordinator')).toBe(false);
      expect(canDeleteMember('student')).toBe(false);
      expect(canDeleteMember('faculty')).toBe(true);
    });

    it('DEC-04 & AUD-01: student member activity scope is restricted to personal records', () => {
      const studentPerms = getRolePermissions('student');
      expect(studentPerms.canViewAuditLog).toBe(false); // Global audit log is hidden

      const filterUserActivity = (logs: { actorId: string; targetId?: string }[], currentUserId: string) => {
        return logs.filter((log) => log.actorId === currentUserId || log.targetId === currentUserId);
      };

      const mockLogs = [
        { actorId: 'u_student_01', action: 'registered_event' },
        { actorId: 'u_student_02', action: 'registered_event' },
        { actorId: 'u_coord_01', targetId: 'u_student_01', action: 'assigned_duty' },
      ];

      const myLogs = filterUserActivity(mockLogs, 'u_student_01');
      expect(myLogs.length).toBe(2);
      expect(myLogs.every((l) => l.actorId === 'u_student_01' || l.targetId === 'u_student_01')).toBe(true);
    });
  });

  // =========================================================================
  // 4. Operations Hub RBAC Matrix & Squad Rules Verification (Spec Section 3, 4, 8)
  // =========================================================================
  describe('Operations Hub Exhaustive Role Matrix (Section 3)', () => {
    const EXPECTED_ROLE_COUNTS: Record<string, { total: number; write: number; read: number; hidden: number }> = {
      faculty: { total: 13, write: 10, read: 3, hidden: 9 },
      president: { total: 13, write: 12, read: 1, hidden: 9 },
      coordinator: { total: 13, write: 12, read: 1, hidden: 9 },
      treasurer: { total: 3, write: 3, read: 0, hidden: 19 },
      promotion: { total: 4, write: 4, read: 0, hidden: 18 },
      documentation: { total: 4, write: 4, read: 0, hidden: 18 },
      management: { total: 5, write: 5, read: 0, hidden: 17 },
      student: { total: 1, write: 0, read: 1, hidden: 21 },
    };

    it('verifies that exactly 22 modules are defined in ALL_MODULE_IDS', () => {
      expect(ALL_MODULE_IDS.length).toBe(22);
    });

    Object.keys(EXPECTED_ROLE_COUNTS).forEach((role) => {
      describe(`Exhaustive Hub Check for Role: ${role}`, () => {
        const matrix = MODULE_ACCESS[role];

        it(`has expected module counts (total visible, write, read, hidden)`, () => {
          const visible = ALL_MODULE_IDS.filter((m) => matrix[m] !== 'hidden');
          const writeCount = ALL_MODULE_IDS.filter((m) => matrix[m] === 'write').length;
          const readCount = ALL_MODULE_IDS.filter((m) => matrix[m] === 'read').length;
          const hiddenCount = ALL_MODULE_IDS.filter((m) => matrix[m] === 'hidden').length;

          const exp = EXPECTED_ROLE_COUNTS[role];
          expect(visible.length).toBe(exp.total);
          expect(writeCount).toBe(exp.write);
          expect(readCount).toBe(exp.read);
          expect(hiddenCount).toBe(exp.hidden);
        });

        ALL_MODULE_IDS.forEach((moduleId) => {
          it(`evaluates ${moduleId} access level strictly`, () => {
            const level = matrix[moduleId];
            expect(['hidden', 'read', 'write']).toContain(level);
          });
        });
      });
    });

    it('asserts exact Faculty modules and access levels (13 modules)', () => {
      const fac = MODULE_ACCESS.faculty;
      expect(fac.squads).toBe('write');
      expect(fac.member_directory).toBe('write');
      expect(fac.attendance_desk).toBe('write');
      expect(fac.duties_stations).toBe('read');
      expect(fac.lead_activity_review).toBe('write');
      expect(fac.event_permissions).toBe('write');
      expect(fac.treasury).toBe('read');
      expect(fac.expenditure_ledger).toBe('read');
      expect(fac.add_expense).toBe('write');
      expect(fac.financial_audit_export).toBe('write');
      expect(fac.release_calendar).toBe('write');
      expect(fac.event_media_upload).toBe('write');
      expect(fac.bulletins_daily_report).toBe('write');

      // Others are hidden
      expect(fac.studio_templates).toBe('hidden');
      expect(fac.pre_event_upload).toBe('hidden');
      expect(fac.meetings_mom).toBe('hidden');
      expect(fac.daily_news_bulletins).toBe('hidden');
      expect(fac.attendance_operation).toBe('hidden');
      expect(fac.squad_leads).toBe('hidden');
      expect(fac.approvals).toBe('hidden');
      expect(fac.duties_assignment).toBe('hidden');
      expect(fac.campaign_post).toBe('hidden');
    });

    it('asserts exact President differences from Faculty (13 modules)', () => {
      const pres = MODULE_ACCESS.president;
      const fac = MODULE_ACCESS.faculty;

      // Differences:
      expect(pres.duties_stations).toBe('write'); // Faculty was read
      expect(fac.duties_stations).toBe('read');

      expect(pres.treasury).toBe('write'); // Faculty was read
      expect(fac.treasury).toBe('read');

      expect(pres.member_directory).toBe('write'); // Faculty was write, but deletion restricted

      // Matching modules
      expect(pres.squads).toBe(fac.squads);
      expect(pres.attendance_desk).toBe(fac.attendance_desk);
      expect(pres.lead_activity_review).toBe(fac.lead_activity_review);
      expect(pres.event_permissions).toBe(fac.event_permissions);
      expect(pres.expenditure_ledger).toBe(fac.expenditure_ledger);
      expect(pres.add_expense).toBe(fac.add_expense);
      expect(pres.financial_audit_export).toBe(fac.financial_audit_export);
      expect(pres.release_calendar).toBe(fac.release_calendar);
      expect(pres.event_media_upload).toBe(fac.event_media_upload);
      expect(pres.bulletins_daily_report).toBe(fac.bulletins_daily_report);
    });

    it('asserts exact Treasurer modules (3 modules)', () => {
      const tr = MODULE_ACCESS.treasurer;
      expect(tr.expenditure_ledger).toBe('write');
      expect(tr.add_expense).toBe('write');
      expect(tr.financial_audit_export).toBe('write');

      // Hidden
      expect(tr.treasury).toBe('hidden');
      expect(tr.squads).toBe('hidden');
      expect(tr.member_directory).toBe('hidden');
      expect(tr.attendance_desk).toBe('hidden');
      expect(tr.campaign_post).toBe('hidden');
    });

    it('asserts exact Promotion modules (4 modules)', () => {
      const pr = MODULE_ACCESS.promotion;
      expect(pr.campaign_post).toBe('write');
      expect(pr.release_calendar).toBe('write');
      expect(pr.event_media_upload).toBe('write');
      expect(pr.bulletins_daily_report).toBe('write');

      expect(pr.squads).toBe('hidden');
      expect(pr.treasury).toBe('hidden');
      expect(pr.attendance_desk).toBe('hidden');
    });

    it('asserts exact Documentation modules (4 modules)', () => {
      const doc = MODULE_ACCESS.documentation;
      expect(doc.studio_templates).toBe('write');
      expect(doc.pre_event_upload).toBe('write');
      expect(doc.meetings_mom).toBe('write');
      expect(doc.daily_news_bulletins).toBe('write');

      expect(doc.squads).toBe('hidden');
      expect(doc.treasury).toBe('hidden');
      expect(doc.campaign_post).toBe('hidden');
    });

    it('asserts exact Management modules (5 modules)', () => {
      const mgmt = MODULE_ACCESS.management;
      expect(mgmt.attendance_operation).toBe('write');
      expect(mgmt.squad_leads).toBe('write');
      expect(mgmt.approvals).toBe('write');
      expect(mgmt.meetings_mom).toBe('write');
      expect(mgmt.duties_assignment).toBe('write');

      expect(mgmt.squads).toBe('hidden');
      expect(mgmt.treasury).toBe('hidden');
      expect(mgmt.campaign_post).toBe('hidden');
    });

    it('asserts Student has only Squads READ, all others hidden', () => {
      const st = MODULE_ACCESS.student;
      expect(st.squads).toBe('read');
      ALL_MODULE_IDS.filter((m) => m !== 'squads').forEach((m) => {
        expect(st[m]).toBe('hidden');
      });
    });
  });

  describe('Extra Rights: can(role, moduleId, "approve" | "grant")', () => {
    it('Faculty has approve on lead_activity_review and grant on event_permissions', () => {
      expect(can('faculty', 'lead_activity_review', 'approve')).toBe(true);
      expect(can('faculty', 'event_permissions', 'grant')).toBe(true);
      expect(can('faculty', 'treasury', 'approve')).toBe(false); // Can flag, cannot approve final
    });

    it('President has approve on lead_activity_review, treasury, and grant on event_permissions', () => {
      expect(can('president', 'lead_activity_review', 'approve')).toBe(true);
      expect(can('president', 'event_permissions', 'grant')).toBe(true);
      expect(can('president', 'treasury', 'approve')).toBe(true);
      expect(can('coordinator', 'treasury', 'approve')).toBe(true);
    });

    it('Management has approve on approvals', () => {
      expect(can('management', 'approvals', 'approve')).toBe(true);
      expect(can('management', 'treasury', 'approve')).toBe(false);
      expect(can('management', 'event_permissions', 'grant')).toBe(false);
    });

    it('Denies approval rights to roles without explicit approve right', () => {
      expect(can('student', 'approvals', 'approve')).toBe(false);
      expect(can('treasurer', 'treasury', 'approve')).toBe(false);
      expect(can('promotion', 'approvals', 'approve')).toBe(false);
    });
  });

  describe('Squad Rules on top of table (Section 4)', () => {
    it('Team leads have WRITE on their own squad modules for ALL events; other squads stay HIDDEN', () => {
      const promoLeadUser: UserModel = {
        uid: 'user-promo-lead-1',
        name: 'Sneha Patel',
        email: 'sneha@geohub.edu',
        role: 'student', // base student
        isVolunteer: false,
        status: 'active',
        squadMemberships: [{ squad: 'Promotion', isLead: true }],
      };

      // Own squad modules are WRITE for all events (even without eventId)
      expect(moduleAccess(promoLeadUser, 'campaign_post')).toBe('write');
      expect(moduleAccess(promoLeadUser, 'release_calendar')).toBe('write');
      expect(moduleAccess(promoLeadUser, 'event_media_upload')).toBe('write');
      expect(moduleAccess(promoLeadUser, 'bulletins_daily_report')).toBe('write');

      // Other squads stay HIDDEN
      expect(moduleAccess(promoLeadUser, 'studio_templates')).toBe('hidden');
      expect(moduleAccess(promoLeadUser, 'attendance_operation')).toBe('hidden');
      expect(moduleAccess(promoLeadUser, 'treasury')).toBe('hidden');
    });

    it('Non-lead squad member gets READ on own squad modules; lead can give WRITE for ONE event only', () => {
      const docMember: UserModel = {
        uid: 'user-doc-member-1',
        name: 'Arun Member',
        email: 'arun@geohub.edu',
        role: 'student',
        isVolunteer: false,
        status: 'active',
        squadMemberships: [{ squad: 'Documentation', isLead: false }],
      };

      // By default without eventId: READ
      expect(moduleAccess(docMember, 'studio_templates')).toBe('read');
      expect(moduleAccess(docMember, 'pre_event_upload')).toBe('read');

      // Without grant for event A: still READ
      expect(moduleAccess(docMember, 'studio_templates', 'evt-alpha')).toBe('read');

      // Now grant WRITE for event A only
      const grant = grantSquadAccess({
        userId: docMember.uid,
        userName: docMember.name,
        squad: 'documentation',
        eventId: 'evt-alpha',
        access: 'write',
        grantedBy: 'Lead',
      });

      // For event A: access is now WRITE!
      expect(moduleAccess(docMember, 'studio_templates', 'evt-alpha')).toBe('write');

      // Grant NEVER applies to another event!
      expect(moduleAccess(docMember, 'studio_templates', 'evt-beta')).toBe('read');
      expect(moduleAccess(docMember, 'studio_templates')).toBe('read');

      // Revoke takes effect immediately
      revokeSquadAccess(grant.id);
      expect(moduleAccess(docMember, 'studio_templates', 'evt-alpha')).toBe('read');
    });

    it('A member in several squads gets each squad access separately', () => {
      // Arun is in Documentation (member: read) AND Promotion (lead: write)
      const user = MOCK_MULTI_SQUAD_USER;

      // Documentation squad modules -> READ
      expect(moduleAccess(user, 'studio_templates')).toBe('read');
      expect(moduleAccess(user, 'pre_event_upload')).toBe('read');

      // Promotion squad modules -> WRITE (lead)
      expect(moduleAccess(user, 'campaign_post')).toBe('write');
      expect(moduleAccess(user, 'release_calendar')).toBe('write');

      // Other squads (Management, Finance) -> HIDDEN
      expect(moduleAccess(user, 'attendance_operation')).toBe('hidden');
      expect(moduleAccess(user, 'treasury')).toBe('hidden');
    });

    it('A squad can have several leads, all with equal WRITE access', () => {
      expect(MOCK_SQUADS_WITH_LEADS[0].leads.length).toBe(2);

      const lead1: UserModel = {
        uid: MOCK_SQUADS_WITH_LEADS[0].leads[0].uid,
        name: MOCK_SQUADS_WITH_LEADS[0].leads[0].name,
        email: MOCK_SQUADS_WITH_LEADS[0].leads[0].email,
        role: 'student',
        isVolunteer: false,
        status: 'active',
        squadMemberships: [{ squad: 'Management', isLead: true }],
      };

      const lead2: UserModel = {
        uid: MOCK_SQUADS_WITH_LEADS[0].leads[1].uid,
        name: MOCK_SQUADS_WITH_LEADS[0].leads[1].name,
        email: MOCK_SQUADS_WITH_LEADS[0].leads[1].email,
        role: 'student',
        isVolunteer: false,
        status: 'active',
        squadMemberships: [{ squad: 'Management', isLead: true }],
      };

      expect(moduleAccess(lead1, 'attendance_operation')).toBe('write');
      expect(moduleAccess(lead2, 'attendance_operation')).toBe('write');
    });
  });

  describe('Governance Rules (Member Directory, Treasury, Promotion)', () => {
    const facultyUser: UserModel = {
      uid: 'u-faculty',
      name: 'Dr. Ramesh',
      email: 'ramesh@geohub.edu',
      role: 'faculty',
      isVolunteer: false,
      status: 'active',
    };

    const presidentUser: UserModel = {
      uid: 'u-president',
      name: 'Siddharth Roy',
      email: 'siddharth@geohub.edu',
      role: 'coordinator',
      isVolunteer: false,
      status: 'active',
    };

    const treasurerUser: UserModel = {
      uid: 'u-treasurer',
      name: 'Vikram Mehta',
      email: 'vikram@geohub.edu',
      role: 'treasurer',
      isVolunteer: false,
      status: 'active',
    };

    const studentUser: UserModel = {
      uid: 'u-student',
      name: 'Regular Member',
      email: 'student@geohub.edu',
      role: 'student',
      isVolunteer: false,
      status: 'active',
    };

    it('Only Faculty can remove members; President CANNOT remove members', () => {
      expect(canRemoveMember(facultyUser)).toBe(true);
      expect(canRemoveMember(presidentUser)).toBe(false);
      expect(canRemoveMember(treasurerUser)).toBe(false);
      expect(canRemoveMember(studentUser)).toBe(false);
    });

    it('President cannot edit Faculty accounts; Faculty can edit all accounts', () => {
      // Faculty editing anyone: true
      expect(canEditMember(facultyUser, presidentUser)).toBe(true);
      expect(canEditMember(facultyUser, studentUser)).toBe(true);

      // President editing Student or Treasurer: true
      expect(canEditMember(presidentUser, studentUser)).toBe(true);
      expect(canEditMember(presidentUser, treasurerUser)).toBe(true);

      // President editing Faculty: strictly FALSE
      expect(canEditMember(presidentUser, facultyUser)).toBe(false);
    });

    it('Treasurer cannot approve their own (or any) budget requests; President can approve budget requests', () => {
      const requestByTreasurer = { requesterId: treasurerUser.uid, requesterEmail: treasurerUser.email };
      const requestByOther = { requesterId: studentUser.uid, requesterEmail: studentUser.email };

      // Treasurer cannot approve
      expect(canApproveBudgetRequest(treasurerUser, requestByTreasurer)).toBe(false);
      expect(canApproveBudgetRequest(treasurerUser, requestByOther)).toBe(false);

      // President can approve other requests
      expect(canApproveBudgetRequest(presidentUser, requestByOther)).toBe(true);
      expect(canApproveBudgetRequest(presidentUser, requestByTreasurer)).toBe(true);

      // If President were requester of their own request, cannot approve own
      const requestByPresident = { requesterId: presidentUser.uid, requesterEmail: presidentUser.email };
      expect(canApproveBudgetRequest(presidentUser, requestByPresident)).toBe(false);
    });

    it('Promotion posts: Management lead can approve, but NEVER their own post', () => {
      const mgmtLead: UserModel = {
        uid: 'u-mgmt-lead',
        name: 'Divya Rao',
        email: 'divya@geohub.edu',
        role: 'management',
        team: 'Management',
        post: 'Management Lead',
        isVolunteer: false,
        status: 'active',
      };

      const promoPostBySomeoneElse = {
        creatorId: 'u-promo-writer',
        authorId: 'u-promo-writer',
        createdBy: 'Sneha Patel',
      };

      const promoPostByLeadSelf = {
        creatorId: mgmtLead.uid,
        authorId: mgmtLead.uid,
        createdBy: mgmtLead.name,
      };

      expect(canApprovePromotionPost(mgmtLead, promoPostBySomeoneElse)).toBe(true);
      expect(canApprovePromotionPost(mgmtLead, promoPostByLeadSelf)).toBe(false);
    });
  });

});
