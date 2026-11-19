import { describe, it, expect } from 'vitest';
import {
  OFFICIAL_POSTS,
  OFFICIAL_SQUADS,
  resolveRoleAndUI,
  matchPostOption,
  isSuperAdminAccount,
} from '../screens/MemberDirectoryScreen';

describe('MemberDirectory Official Posts & Squad Resolution Suite', () => {
  it('exposes exactly 3 official posts: Member, Club President, Faculty Advisor', () => {
    const postNames = OFFICIAL_POSTS.map((p) => p.post);
    expect(postNames).toEqual(['Member', 'Club President', 'Faculty Advisor']);
    expect(OFFICIAL_POSTS).toHaveLength(3);
  });

  it('exposes the official squad divisions: No Squad, Documentation, Promotion, Treasury, Management', () => {
    expect(OFFICIAL_SQUADS).toEqual([
      'No Squad',
      'Documentation',
      'Promotion',
      'Treasury',
      'Management',
    ]);
  });

  it('resolves Member with No Squad to student role and digital pass UI', () => {
    const access = resolveRoleAndUI('Member', 'No Squad');
    expect(access.role).toBe('student');
    expect(access.uiTitle).toBe('Campus Scholar Portal & Digital Pass');
    expect(access.squad).toBe('No Squad');
  });

  it('resolves Member with Documentation squad to documentation role and studio UI', () => {
    const access = resolveRoleAndUI('Member', 'Documentation');
    expect(access.role).toBe('documentation');
    expect(access.uiTitle).toBe('Documentation Studio & Archival');
    expect(access.squad).toBe('Documentation');
  });

  it('resolves Member with Promotion squad to promotion role and campaign UI', () => {
    const access = resolveRoleAndUI('Member', 'Promotion');
    expect(access.role).toBe('promotion');
    expect(access.uiTitle).toBe('Promotion Campaigns & Media');
    expect(access.squad).toBe('Promotion');
  });

  it('resolves Member with Treasury squad to treasurer role and ledger UI', () => {
    const access = resolveRoleAndUI('Member', 'Treasury');
    expect(access.role).toBe('treasurer');
    expect(access.uiTitle).toBe('Finance Desk & Ledger');
    expect(access.squad).toBe('Treasury');
  });

  it('resolves Member with Management squad to management role and operations UI', () => {
    const access = resolveRoleAndUI('Member', 'Management');
    expect(access.role).toBe('management');
    expect(access.uiTitle).toBe('Operations & Squad Lead Management');
    expect(access.squad).toBe('Management');
  });

  it('resolves Club President to coordinator role regardless of squad', () => {
    const access = resolveRoleAndUI('Club President', 'Management');
    expect(access.role).toBe('coordinator');
    expect(access.uiTitle).toBe('Chapter President & Executive Operations');
  });

  it('resolves Faculty Advisor to faculty role regardless of squad', () => {
    const access = resolveRoleAndUI('Faculty Advisor', 'No Squad');
    expect(access.role).toBe('faculty');
    expect(access.uiTitle).toBe('Institutional Oversight & Faculty Portal');
  });

  it('gracefully matches legacy post titles using matchPostOption', () => {
    expect(matchPostOption('Student Member').post).toBe('Member');
    expect(matchPostOption('Club President').post).toBe('Club President');
    expect(matchPostOption('Faculty Advisor').post).toBe('Faculty Advisor');
    expect(matchPostOption('Advisor').post).toBe('Faculty Advisor');
    expect(matchPostOption('Random Title').post).toBe('Member');
  });

  it('identifies SuperAdmin accounts and isolates them from directory', () => {
    expect(isSuperAdminAccount({ role: 'super_admin' })).toBe(true);
    expect(isSuperAdminAccount({ rollNo: 'SA01' })).toBe(true);
    expect(isSuperAdminAccount({ uid: 'sa01' })).toBe(true);
    expect(isSuperAdminAccount({ role: 'student', rollNo: '24GEO001' })).toBe(false);
  });
});
