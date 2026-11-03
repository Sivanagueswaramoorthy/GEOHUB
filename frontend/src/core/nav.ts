import { UserRole } from '../types';

export type NavTabKey =
  | 'home'
  | 'events'
  | 'operations'
  | 'community'
  | 'gallery'
  | 'scan_qr'
  | 'qrscanner'
  | 'ledger'
  // Legacy aliases supported for route compatibility
  | 'members'
  | 'archives'
  | 'finance'
  | 'campaigns'
  | 'memories'
  | 'profile';

export interface NavItemConfig {
  key: NavTabKey;
  label: string;
  shortLabel?: string;
  iconName:
    | 'house'
    | 'calendar'
    | 'layers'
    | 'messages-square'
    | 'images'
    | 'scan'
    | 'wallet'
    | 'user-check'
    | 'folder-archive'
    | 'megaphone'
    | 'user';
  hasUpdates?: boolean;
  isReadOnly?: boolean;
}

/**
 * Friendly display names for user roles
 */
export const ROLE_LABELS: Record<string, string> = {
  faculty: 'Faculty',
  coordinator: 'Coordinator',
  documentation: 'Documentation',
  treasurer: 'Treasurer',
  promotion: 'Promotion',
  student: 'Student',
  management: 'Management',
  // Legacy aliases
  super_admin: 'Faculty',
  admin: 'Coordinator',
  social_media: 'Promotion',
  team_admin: 'Student',
  volunteer: 'Student',
  member: 'Student',
};

export const getFriendlyRoleName = (role: UserRole | string, post?: string, team?: string): string => {
  if (post && post.trim()) {
    const lower = post.toLowerCase();
    if (lower.includes('faculty') || lower.includes('advisor')) {
      return 'Faculty';
    }
    if (lower.includes('treasurer')) {
      return 'Treasurer';
    }
    if (lower.includes('documentation')) {
      return 'Documentation';
    }
    if (lower.includes('promotion') || lower.includes('social')) {
      return 'Promotion';
    }
    if (
      lower.includes('president') ||
      lower.includes('coordinator') ||
      lower.includes('lead')
    ) {
      return 'Coordinator';
    }
  }

  if (team && team.toLowerCase() === 'management') {
    return 'Management';
  }

  return ROLE_LABELS[role] || 'Student';
};

/**
 * Single source of truth for Role to Tabs map (6 universal navigation tabs per role)
 * Standardized across all roles in accordance with GeoHub Operations Hub architecture:
 * 1. Home (house)
 * 2. Events (calendar) - read-only for squad members without event-write grant
 * 3. Operations (layers) - role-specific operations hub
 * 4. Community (messages-square) - campus chat and forum
 * 5. Gallery (images) - chapter memories and event media
 * 6. QR Scanner (scan) - gate attendance scanner and token check-in
 */
export const getRoleNavTabs = (role: UserRole | string, post?: string, team?: string): NavItemConfig[] => {
  const lowerPost = (post || '').toLowerCase();
  const lowerRole = (role || '').toLowerCase();

  const isFaculty = lowerRole === 'super_admin' || lowerRole === 'faculty' || lowerPost.includes('faculty') || lowerPost.includes('advisor');
  const isPresident = lowerRole === 'admin' || lowerRole === 'coordinator' || lowerPost.includes('president') || lowerPost.includes('coordinator');

  // Only Faculty Advisor and President have create/edit access to core events without an event grant
  const isEventsReadOnly = !isFaculty && !isPresident;

  return [
    { key: 'home', label: 'Home', shortLabel: 'Home', iconName: 'house' },
    { key: 'events', label: 'Events', shortLabel: 'Events', iconName: 'calendar', isReadOnly: isEventsReadOnly },
    { key: 'operations', label: 'Operations', shortLabel: 'Ops', iconName: 'layers' },
    { key: 'community', label: 'Community', shortLabel: 'Chat', iconName: 'messages-square' },
    { key: 'gallery', label: 'Gallery', shortLabel: 'Gallery', iconName: 'images' },
    { key: 'scan_qr', label: 'QR Scanner', shortLabel: 'Scan', iconName: 'scan' },
  ];
};
