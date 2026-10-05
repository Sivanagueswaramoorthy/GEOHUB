import { UserRole } from '../types';

export type NavTabKey =
  | 'home'
  | 'events'
  | 'operations'
  | 'members'
  | 'archives'
  | 'finance'
  | 'campaigns'
  | 'memories'
  | 'profile';

export interface NavItemConfig {
  key: NavTabKey;
  label: string;
  iconName: 'house' | 'calendar' | 'layers' | 'user-check' | 'folder-archive' | 'wallet' | 'megaphone' | 'images' | 'user';
  hasUpdates?: boolean;
}

/**
 * Friendly display names for user roles
 */
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin (Faculty Advisor)',
  faculty: 'Super Admin (Faculty Advisor)',
  admin: 'Coordinator / Lead',
  coordinator: 'Coordinator / Lead',
  documentation: 'Documentation Lead',
  treasurer: 'Treasurer Lead',
  social_media: 'Promotion Lead',
  team_admin: 'Promotion Lead',
  volunteer: 'Student Volunteer',
  member: 'Student Volunteer',
};

export const getFriendlyRoleName = (role: UserRole | string, post?: string): string => {
  if (post && post.trim()) {
    if (post.toLowerCase().includes('faculty') || post.toLowerCase().includes('advisor')) {
      return 'Super Admin (Faculty Advisor)';
    }
    if (post.toLowerCase().includes('treasurer')) {
      return 'Treasurer Lead';
    }
    if (post.toLowerCase().includes('documentation')) {
      return 'Documentation Lead';
    }
    if (post.toLowerCase().includes('promotion') || post.toLowerCase().includes('social')) {
      return 'Promotion Lead';
    }
    if (post.toLowerCase().includes('president') || post.toLowerCase().includes('coordinator') || post.toLowerCase().includes('lead')) {
      return 'Coordinator / Lead';
    }
  }

  return ROLE_LABELS[role] || 'Student Volunteer';
};

/**
 * Single source of truth for Role to Tabs map (5 tabs per role)
 * Faculty and Coordinator: Home, Events, Operations, Members, Profile
 * Documentation: Home, Events, Operations, Archives, Profile
 * Treasurer: Home, Events, Operations, Finance, Profile
 * Promotion: Home, Events, Operations, Campaigns, Profile
 * Student: Home, Events, Operations, Memories, Profile
 */
export const getRoleNavTabs = (role: UserRole, post?: string): NavItemConfig[] => {
  // Check role or post specialization
  const lowerPost = (post || '').toLowerCase();

  // Treasurer
  if (role === 'treasurer' || lowerPost.includes('treasurer')) {
    return [
      { key: 'home', label: 'Home', iconName: 'house' },
      { key: 'events', label: 'Events', iconName: 'calendar' },
      { key: 'operations', label: 'Operations', iconName: 'layers' },
      { key: 'finance', label: 'Finance', iconName: 'wallet' },
      { key: 'profile', label: 'Profile', iconName: 'user' },
    ];
  }

  // Documentation
  if (role === 'documentation' || lowerPost.includes('documentation')) {
    return [
      { key: 'home', label: 'Home', iconName: 'house' },
      { key: 'events', label: 'Events', iconName: 'calendar' },
      { key: 'operations', label: 'Operations', iconName: 'layers' },
      { key: 'archives', label: 'Archives', iconName: 'folder-archive' },
      { key: 'profile', label: 'Profile', iconName: 'user' },
    ];
  }

  // Promotion
  if (role === 'social_media' || lowerPost.includes('promotion') || (role === 'team_admin' && lowerPost.includes('media'))) {
    return [
      { key: 'home', label: 'Home', iconName: 'house' },
      { key: 'events', label: 'Events', iconName: 'calendar' },
      { key: 'operations', label: 'Operations', iconName: 'layers' },
      { key: 'campaigns', label: 'Campaigns', iconName: 'megaphone' },
      { key: 'profile', label: 'Profile', iconName: 'user' },
    ];
  }

  // Faculty and Coordinator (Super Admin & Admin)
  if (role === 'super_admin' || role === 'faculty' || role === 'admin' || role === 'coordinator') {
    return [
      { key: 'home', label: 'Home', iconName: 'house' },
      { key: 'events', label: 'Events', iconName: 'calendar' },
      { key: 'operations', label: 'Operations', iconName: 'layers' },
      { key: 'members', label: 'Members', iconName: 'user-check' },
      { key: 'profile', label: 'Profile', iconName: 'user' },
    ];
  }

  // Student (Member / Volunteer / Default)
  return [
    { key: 'home', label: 'Home', iconName: 'house' },
    { key: 'events', label: 'Events', iconName: 'calendar' },
    { key: 'operations', label: 'Operations', iconName: 'layers' },
    { key: 'memories', label: 'Memories', iconName: 'images' },
    { key: 'profile', label: 'Profile', iconName: 'user' },
  ];
};
