import React from 'react';

export type SuperAdminCockpitTab = 'home' | 'control' | 'people' | 'access' | 'system';

export interface ModuleConfig {
  id: string;
  name: string;
  desc: string;
  category: 'core' | 'governance' | 'media';
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

export interface RoleMeta {
  role: string;
  badge: string;
  name: string;
  roll_no: string;
  email: string;
  post?: string;
  status?: string;
  is_registered?: boolean;
}

export interface OperationDef {
  key: string;
  label: string;
  desc: string;
  cat: 'events' | 'attendance' | 'finance' | 'docs' | 'members' | 'system' | 'audits';
}

export interface FacultyAdvisor {
  id: string;
  name: string;
  roll_no: string; // e.g. FAC01
  email: string;
  department: string;
  post: string; // Designation
  phone?: string;
  status?: string;
}

export interface StudentScholar {
  id: string;
  uid?: string;
  name: string;
  roll_no: string; // e.g. 24GEO002
  rollNo?: string;
  email: string;
  role: string;
  department: string;
  year_of_study: string;
  post?: string;
  team?: string;
  phone?: string;
  status?: string;
}

export interface AuditActionEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  category: 'modules' | 'faculty' | 'students' | 'security' | 'database';
  status: 'success' | 'warning' | 'info';
}
