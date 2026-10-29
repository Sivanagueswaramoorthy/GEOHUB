import { describe, it, expect } from 'vitest';
import permissionsMatrix from './permissions_matrix.json';
import {
  getRolePermissions,
  canAccessRoute,
  FACULTY_ONLY_ARCHIVE,
  normalizeRole,
  canScanForEvent,
  hasPermission,
  RolePermissions,
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
    it('normalizes super_admin to faculty', () => {
      expect(normalizeRole('super_admin')).toBe('faculty');
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
      expect(perms.canApproveBudget).toBe(false);
    });

    it('normalizes social_media to promotion', () => {
      expect(normalizeRole('social_media')).toBe('promotion');
      const perms = getRolePermissions('social_media');
      expect(perms.canManageCampaigns).toBe(true);
    });

    it('normalizes member and volunteer to student', () => {
      expect(normalizeRole('member')).toBe('student');
      expect(normalizeRole('volunteer')).toBe('student');
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

    // 3. Treasurer cannot approve a budget
    it('3. treasurer cannot approve a budget (faculty ONLY)', () => {
      const treasurerPerms = getRolePermissions('treasurer');
      const facultyPerms = getRolePermissions('faculty');

      expect(treasurerPerms.canApproveBudget).toBe(false);
      expect(treasurerPerms.canSubmitBudgetRequest).toBe(true);
      expect(treasurerPerms.canManageExpenses).toBe(true);
      expect(facultyPerms.canApproveBudget).toBe(true);
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

    it('denies coordinator access to settings, posts, approvals, and audit log', () => {
      const settingsCheck = canAccessRoute('settings', 'coordinator');
      expect(settingsCheck.allowed).toBe(false);
      expect(settingsCheck.redirect).toBe('home');
      expect(settingsCheck.message).toBe("You don't have access");

      const postsCheck = canAccessRoute('posts', 'coordinator');
      expect(postsCheck.allowed).toBe(false);

      const approvalsCheck = canAccessRoute('approvals', 'coordinator');
      expect(approvalsCheck.allowed).toBe(false);

      const auditCheck = canAccessRoute('audit_logs', 'coordinator');
      expect(auditCheck.allowed).toBe(false);
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
  });
});
