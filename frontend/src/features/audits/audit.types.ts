export interface AuditTimelineItem {
  id: string;
  title: string;
  description: string;
  author: string;
  timestamp: string;
  statusBadge?: string;
  type?: 'publish' | 'audit' | 'approval' | 'system' | 'sync';
}

export interface AuditRecord {
  id: string;
  slug: string;
  moduleTitle: string;
  domain: string;
  leadName: string;
  leadRole: string;
  department: string;
  avatarBg?: string;
  avatarColor?: string;
  timeAgo: string;
  updateText: string;
  details: string;
  targetTab: string;
  verifiedStatus?: string;
  auditRef: string;
  metric?: string;
  category: string;
  status: 'Verified' | 'Pending Endorsement' | 'Action Required' | 'Synchronized';
  lastSynced: string;
  isSealed?: boolean;
  sealedBy?: string;
  sealedAt?: string;
  timeline: AuditTimelineItem[];
}
