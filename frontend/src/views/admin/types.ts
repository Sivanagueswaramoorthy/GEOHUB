export type DeckKey =
  | 'hub'
  | 'faculty'
  | 'students'
  | 'matrix'
  | 'maintenance'
  | 'all'
  | 'home'
  | 'access'
  | 'features'
  | 'logs'
  | 'profile';

export type SuperAdminTab = 'home' | 'access' | 'features' | 'logs' | 'profile';

export interface UnifiedMemberItem {
  id: string;
  kind: 'student' | 'faculty';
  roll_no: string;
  name: string;
  email: string;
  department: string;
  year_of_study?: string;
  designation?: string;
  role: string;
  status: 'active' | 'disabled' | 'suspended';
  phone?: string;
  team?: string;
  post?: string;
  last_login_at?: string;
  last_seen_at?: string;
  allowedModules?: string[];
}

export interface RoleMeta {
  role: string;
  badge: string;
  default_post: string;
  default_name: string;
  default_roll: string;
  default_email: string;
  user_id?: string;
  name?: string;
  roll_no?: string;
  email?: string;
  post?: string;
  status?: string;
  is_registered?: boolean;
}

export interface OperationDef {
  key: string;
  label: string;
  category: 'events' | 'finance' | 'docs' | 'operations' | 'governance';
  description: string;
}

export interface ModuleConfig {
  key: string;
  label: string;
  description: string;
  iconName: string;
  enabled: boolean;
  roleOverrides?: Record<string, boolean>;
}

export interface DiagnosticsData {
  host: string;
  port: number | string;
  dialect: string;
  latency_ms: number;
  engine: string;
  status: string;
  health: string;
  table_counts?: Record<string, number>;
  recent_audits?: Array<{
    id: string;
    action: string;
    actor_name: string;
    target_name?: string;
    details?: string;
    timestamp: string;
  }>;
}

export interface OverviewCounts {
  faculty: number;
  students: number;
  users: number;
  online: number;
  modulesLive: number;
  modulesTotal: number;
}

export interface OnlineSessionUser {
  id: string;
  name: string;
  roll_no: string;
  role: string;
  last_seen_at: string;
  platform?: string;
  app_version?: string;
}

export interface SuperAdminUserItem {
  id: string;
  roll_no: string;
  name: string;
  email: string;
  role: string;
  department: string;
  year_of_study?: string;
  team?: string;
  post?: string;
  team_role?: string;
  status: 'active' | 'disabled' | 'pending' | 'suspended';
  last_login_at?: string;
  last_seen_at?: string;
  last_platform?: string;
  last_app_version?: string;
  events_attended?: number;
  tasks_completed?: number;
}

export interface FacultyAdvisorItem {
  id: string;
  roll_no: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  department: string;
  status: 'active' | 'disabled';
  last_login_at?: string;
  last_seen_at?: string;
  last_platform?: string;
  last_app_version?: string;
}

