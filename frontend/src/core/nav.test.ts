import { describe, it, expect } from 'vitest';
import { getRoleNavTabs, getFriendlyRoleName } from './nav';

describe('GeoHub Unified 6-Tab Navigation (Nav Bar Architecture)', () => {
  const roles = [
    { role: 'faculty', label: 'Faculty Advisor', eventsReadOnly: false },
    { role: 'coordinator', label: 'Club President', eventsReadOnly: false },
    { role: 'management', label: 'Management Squad', eventsReadOnly: true },
    { role: 'treasurer', label: 'Treasurer', eventsReadOnly: true },
    { role: 'promotion', label: 'Promotion Lead', eventsReadOnly: true },
    { role: 'documentation', label: 'Documentation Lead', eventsReadOnly: true },
    { role: 'student', label: 'Student Member', eventsReadOnly: true },
  ];

  it('standardizes exactly 6 navigation tabs across all roles: Home, Events, Operations, Community, Gallery, QR Scanner', () => {
    roles.forEach(({ role }) => {
      const tabs = getRoleNavTabs(role);
      expect(tabs).toHaveLength(6);

      const keys = tabs.map((t) => t.key);
      expect(keys).toEqual([
        'home',
        'events',
        'operations',
        'community',
        'gallery',
        'scan_qr',
      ]);
    });
  });

  it('correctly assigns read-only flags to Events tab based on settled authority', () => {
    roles.forEach(({ role, eventsReadOnly }) => {
      const tabs = getRoleNavTabs(role);
      const eventsTab = tabs.find((t) => t.key === 'events');
      expect(eventsTab).toBeDefined();
      expect(Boolean(eventsTab?.isReadOnly)).toBe(eventsReadOnly);
    });
  });

  it('provides short labels for mobile viewport density preservation', () => {
    const tabs = getRoleNavTabs('student');
    const opsTab = tabs.find((t) => t.key === 'operations');
    const scanTab = tabs.find((t) => t.key === 'scan_qr');
    const chatTab = tabs.find((t) => t.key === 'community');

    expect(opsTab?.shortLabel).toBe('Hub');
    expect(scanTab?.shortLabel).toBe('Scan');
    expect(chatTab?.shortLabel).toBe('Chat');
  });

  it('resolves friendly role names properly for squads and posts', () => {
    expect(getFriendlyRoleName('faculty')).toBe('Faculty');
    expect(getFriendlyRoleName('coordinator')).toBe('Coordinator');
    expect(getFriendlyRoleName('student', 'President')).toBe('Coordinator');
    expect(getFriendlyRoleName('student', 'Treasurer')).toBe('Treasurer');
    expect(getFriendlyRoleName('student', '', 'Management')).toBe('Management');
  });
});

