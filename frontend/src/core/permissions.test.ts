import { describe, it, expect } from 'vitest';
import { getRolePermissions, canAccessRoute, FACULTY_ONLY_ARCHIVE } from './permissions';

describe('Permissions & Guard Suite', () => {
  it('should verify FACULTY_ONLY_ARCHIVE constant exists', () => {
    expect(FACULTY_ONLY_ARCHIVE).toBe(true);
  });

  describe('Faculty / Super Admin permissions', () => {
    const facultyPerms = getRolePermissions('super_admin');

    it('grants full executive powers to faculty', () => {
      expect(facultyPerms.canCreateEditEvents).toBe(true);
      expect(facultyPerms.canArchiveEvents).toBe(true);
      expect(facultyPerms.canApproveBudget).toBe(true);
      expect(facultyPerms.canManageMembers).toBe(true);
      expect(facultyPerms.canAssignPosts).toBe(true);
      expect(facultyPerms.canManageSettings).toBe(true);
      expect(facultyPerms.canEditBudget).toBe(true);
      expect(facultyPerms.canReviewExecutiveApprovals).toBe(true);
    });

    it('allows faculty to access settings, posts, and approvals routes', () => {
      expect(canAccessRoute('settings', 'super_admin').allowed).toBe(true);
      expect(canAccessRoute('posts', 'super_admin').allowed).toBe(true);
      expect(canAccessRoute('approvals', 'super_admin').allowed).toBe(true);
    });
  });

  describe('Coordinator / Lead permissions', () => {
    const coordPerms = getRolePermissions('admin');

    it('restricts coordinator from archiving events, assigning posts, and managing settings', () => {
      expect(coordPerms.canCreateEditEvents).toBe(true);
      expect(coordPerms.canArchiveEvents).toBe(false); // FACULTY_ONLY_ARCHIVE
      expect(coordPerms.canApproveBudget).toBe(false);
      expect(coordPerms.canAssignPosts).toBe(false); // No assign post action or picker
      expect(coordPerms.canManageSettings).toBe(false); // Settings hidden
      expect(coordPerms.canEditBudget).toBe(false); // Read-only budget view
      expect(coordPerms.canReviewExecutiveApprovals).toBe(false); // No budget/post approvals
    });

    it('guards restricted routes for coordinator and redirects Home with "You don\'t have access"', () => {
      const settingsCheck = canAccessRoute('settings', 'admin');
      expect(settingsCheck.allowed).toBe(false);
      expect(settingsCheck.redirect).toBe('home');
      expect(settingsCheck.message).toBe("You don't have access");

      // Direct URL variations with hash and slashes
      expect(canAccessRoute('#settings', 'admin').allowed).toBe(false);
      expect(canAccessRoute('/settings', 'admin').allowed).toBe(false);
      expect(canAccessRoute('#/settings', 'admin').allowed).toBe(false);

      const postsCheck = canAccessRoute('posts', 'admin');
      expect(postsCheck.allowed).toBe(false);
      expect(postsCheck.redirect).toBe('home');
      expect(postsCheck.message).toBe("You don't have access");

      expect(canAccessRoute('#posts', 'admin').allowed).toBe(false);
      expect(canAccessRoute('assign_post', 'admin').allowed).toBe(false);
      expect(canAccessRoute('assign-posts', 'admin').allowed).toBe(false);

      const approvalsCheck = canAccessRoute('approvals', 'admin');
      expect(approvalsCheck.allowed).toBe(false);
      expect(approvalsCheck.redirect).toBe('home');
      expect(approvalsCheck.message).toBe("You don't have access");
    });

    it('allows coordinator to access allowed routes like events, members, operations, reports', () => {
      expect(canAccessRoute('events', 'admin').allowed).toBe(true);
      expect(canAccessRoute('#events', 'admin').allowed).toBe(true);
      expect(canAccessRoute('members', 'admin').allowed).toBe(true);
      expect(canAccessRoute('operations', 'admin').allowed).toBe(true);
      expect(canAccessRoute('reports', 'admin').allowed).toBe(true);
      expect(canAccessRoute('scan_qr', 'admin').allowed).toBe(true);
      expect(canAccessRoute('meetings', 'admin').allowed).toBe(true);
      expect(canAccessRoute('forum', 'admin').allowed).toBe(true);
      expect(canAccessRoute('treasurer', 'admin').allowed).toBe(true); // read-only budget view is accessible
    });
  });

  describe('UI Component Logic driven by permissions.ts', () => {
    it('QuickActions: filters out "Assign Post" for Coordinator while keeping 4 actions', () => {
      const allActions = [
        { key: 'create_event', title: 'Create Event' },
        { key: 'schedule_meeting', title: 'Schedule Meeting' },
        { key: 'assign_post', title: 'Assign Post' },
        { key: 'post_announcement', title: 'Post Announcement' },
        { key: 'add_student', title: 'Add Student' },
      ];

      const facultyPerms = getRolePermissions('super_admin');
      const coordPerms = getRolePermissions('admin');

      const facultyActions = allActions.filter((a) => a.key !== 'assign_post' || facultyPerms.canAssignPosts);
      const coordActions = allActions.filter((a) => a.key !== 'assign_post' || coordPerms.canAssignPosts);

      expect(facultyActions).toHaveLength(5);
      expect(facultyActions.some((a) => a.key === 'assign_post')).toBe(true);

      expect(coordActions).toHaveLength(4);
      expect(coordActions.some((a) => a.key === 'assign_post')).toBe(false);
      expect(coordActions.map((a) => a.key)).toEqual([
        'create_event',
        'schedule_meeting',
        'post_announcement',
        'add_student',
      ]);
    });

    it('Home: filters out Budget and Post approvals from "Needs Your Attention" for Coordinator', () => {
      const attentionItems = [
        { id: 'att_duty', category: 'Duties Not Yet Assigned', facultyOnly: false },
        { id: 'att_mom', category: 'MoMs Pending', facultyOnly: false },
        { id: 'att_join', category: 'Join Requests', facultyOnly: false },
        { id: 'att_overdue', category: 'Overdue Duties', facultyOnly: false },
        { id: 'att_budget', category: 'Budget Approval', facultyOnly: true },
        { id: 'att_post', category: 'Post Approval', facultyOnly: true },
      ];

      const facultyPerms = getRolePermissions('super_admin');
      const coordPerms = getRolePermissions('admin');

      const facultyQueue = facultyPerms.canReviewExecutiveApprovals
        ? attentionItems
        : attentionItems.filter((i) => !i.facultyOnly);

      const coordQueue = coordPerms.canReviewExecutiveApprovals
        ? attentionItems
        : attentionItems.filter((i) => !i.facultyOnly);

      expect(facultyQueue).toHaveLength(6);
      expect(coordQueue).toHaveLength(4);
      expect(coordQueue.map((i) => i.category)).toEqual([
        'Duties Not Yet Assigned',
        'MoMs Pending',
        'Join Requests',
        'Overdue Duties',
      ]);
    });

    it('Events: hides Archive button for Coordinator via FACULTY_ONLY_ARCHIVE flag', () => {
      const facultyPerms = getRolePermissions('super_admin');
      const coordPerms = getRolePermissions('admin');

      const canFacultyArchive = facultyPerms.canArchiveEvents && FACULTY_ONLY_ARCHIVE;
      const canCoordArchive = coordPerms.canArchiveEvents && FACULTY_ONLY_ARCHIVE;

      expect(canFacultyArchive).toBe(true);
      expect(canCoordArchive).toBe(false);
    });

    it('Operations: validates governance and shortcut permission flags', () => {
      const coordPerms = getRolePermissions('admin');

      // Approvals shortcut switches to Join Requests
      expect(coordPerms.canReviewExecutiveApprovals).toBe(false);

      // Settings is hidden
      expect(coordPerms.canManageSettings).toBe(false);

      // Posts assignment is disabled
      expect(coordPerms.canAssignPosts).toBe(false);

      // Budget is read-only
      expect(coordPerms.canEditBudget).toBe(false);
    });
  });

  describe('Treasurer Lead permissions & navigation', () => {
    const treasurerPerms = getRolePermissions('treasurer');

    it('grants financial capabilities while enforcing governance restrictions', () => {
      expect(treasurerPerms.canAccessFinance).toBe(true);
      expect(treasurerPerms.canApproveBudget).toBe(true);
      expect(treasurerPerms.canScanQr).toBe(true);

      // Student/Lead limits
      expect(treasurerPerms.canCreateEditEvents).toBe(false);
      expect(treasurerPerms.canArchiveEvents).toBe(false);
      expect(treasurerPerms.canManageSettings).toBe(false);
      expect(treasurerPerms.canAssignPosts).toBe(false);
      // Faculty-only direct allocation edit
      expect(treasurerPerms.canEditBudget).toBe(false);
    });

    it('guards routes appropriately for treasurer', () => {
      expect(canAccessRoute('finance', 'treasurer').allowed).toBe(true);
      expect(canAccessRoute('#finance', 'treasurer').allowed).toBe(true);
      expect(canAccessRoute('treasurer', 'treasurer').allowed).toBe(true);
      expect(canAccessRoute('events', 'treasurer').allowed).toBe(true);
      expect(canAccessRoute('operations', 'treasurer').allowed).toBe(true);
      expect(canAccessRoute('profile', 'treasurer').allowed).toBe(true);
      expect(canAccessRoute('scan_qr', 'treasurer').allowed).toBe(true);

      // Restricted
      expect(canAccessRoute('settings', 'treasurer').allowed).toBe(false);
      expect(canAccessRoute('posts', 'treasurer').allowed).toBe(false);
    });
  });

  describe('Promotion Lead permissions & navigation', () => {
    const promoPerms = getRolePermissions('social_media');

    it('grants campaign & social media capabilities while keeping student capabilities', () => {
      expect(promoPerms.canAccessCampaigns).toBe(true);
      expect(promoPerms.canScanQr).toBe(true); // attendance turnstile scanner

      // Administrative limits (no event creation, no post assignment, no faculty settings)
      expect(promoPerms.canCreateEditEvents).toBe(false);
      expect(promoPerms.canArchiveEvents).toBe(false);
      expect(promoPerms.canManageSettings).toBe(false);
      expect(promoPerms.canAssignPosts).toBe(false);
      expect(promoPerms.canEditBudget).toBe(false);
      expect(promoPerms.canReviewExecutiveApprovals).toBe(false);
    });

    it('allows promotion routes and guards restricted executive routes', () => {
      expect(canAccessRoute('campaigns', 'social_media').allowed).toBe(true);
      expect(canAccessRoute('home', 'social_media').allowed).toBe(true);
      expect(canAccessRoute('events', 'social_media').allowed).toBe(true);
      expect(canAccessRoute('operations', 'social_media').allowed).toBe(true);
      expect(canAccessRoute('profile', 'social_media').allowed).toBe(true);
      expect(canAccessRoute('scan_qr', 'social_media').allowed).toBe(true);
      expect(canAccessRoute('forum', 'social_media').allowed).toBe(true);

      // Restricted routes
      expect(canAccessRoute('settings', 'social_media').allowed).toBe(false);
      expect(canAccessRoute('posts', 'social_media').allowed).toBe(false);
      expect(canAccessRoute('approvals', 'social_media').allowed).toBe(false);
    });
  });
});
