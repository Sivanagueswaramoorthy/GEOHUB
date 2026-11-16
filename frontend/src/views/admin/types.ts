import { LucideIcon } from 'lucide-react';

export interface RoleMeta {
  role: string;
  badge: string;
  user_id?: string;
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
  cat: 'events' | 'finance' | 'docs' | 'ops' | 'admin';
}

export interface ModuleConfig {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
}

export interface DiagnosticsData {
  status: string;
  engine: string;
  endpoint: string;
  latency_ms: number;
  table_counts: Record<string, number>;
  recent_audits: Array<{
    id: string;
    action: string;
    actor_name: string;
    target_name: string;
    details: string;
    timestamp: string;
  }>;
}

export type DeckKey = 'all' | 'hub' | 'faculty' | 'students' | 'matrix' | 'maintenance';
