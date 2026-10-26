import { AuditRecord } from './audit.types';

export const cleanQuotedText = (text: string): string => {
  if (!text) return '';
  return text.trim().replace(/^["'\s]+|["'\s]+$/g, '').replace(/""+/g, '"');
};

export const INITIAL_AUDIT_RECORDS: Record<string, AuditRecord> = {
  'daily-news-bulletin': {
    id: 'daily-news-bulletin',
    slug: 'daily-news-bulletin',
    moduleTitle: 'Daily News Bulletin',
    domain: 'Documentation & Archives',
    leadName: 'Aarav Patel',
    leadRole: 'Documentation Lead',
    department: 'Geoinformatics & Archival Science',
    avatarBg: '#DAF1DE',
    avatarColor: '#163832',
    timeAgo: '4h ago',
    updateText: 'Published Bulletin #4: Eco-Awareness Drive Concludes with 200+ Trees',
    details:
      'Drafted editorial bulletin highlighting volunteer achievements, geospatial field photos, and upcoming workshops. Published across student portals and chapter notice boards with verified turnstile metrics.',
    targetTab: 'doc_studio',
    verifiedStatus: 'Synchronized with Chapter Database',
    auditRef: 'AUD-849203',
    metric: 'Bulletin #4 Live',
    category: 'Documentation & Archives',
    status: 'Synchronized',
    lastSynced: 'Today at 04:15 PM',
    isSealed: false,
    timeline: [
      {
        id: 't-1',
        title: 'Editorial Release Published',
        description: 'Bulletin #4 dispatched to 1,280 active chapter members and archived in central records.',
        author: 'Aarav Patel (Doc Lead)',
        timestamp: '4h ago',
        statusBadge: 'Live',
        type: 'publish',
      },
      {
        id: 't-2',
        title: 'Media Assets & Turnstiles Verified',
        description: 'Linked 12 geotagged field survey photos and attendee check-in counts from Hall B turnstile.',
        author: 'Aarav Patel (Doc Lead)',
        timestamp: '5h ago',
        statusBadge: 'Verified',
        type: 'sync',
      },
      {
        id: 't-3',
        title: 'Draft Endorsed by Faculty Advisor',
        description: 'Dr. Sarah Jenkins reviewed chapter draft for accreditation standards and authorized release.',
        author: 'Dr. Sarah Jenkins (Faculty)',
        timestamp: 'Yesterday',
        statusBadge: 'Approved',
        type: 'approval',
      },
      {
        id: 't-4',
        title: 'Editorial Shell Initialized',
        description: 'Template prefilled with agenda items, guest speaker bios, and sanctioned budget lines.',
        author: 'Aarav Patel (Doc Lead)',
        timestamp: '2 days ago',
        statusBadge: 'Created',
        type: 'system',
      },
    ],
  },

  'checklist-audit': {
    id: 'checklist-audit',
    slug: 'checklist-audit',
    moduleTitle: 'Checklist Audit',
    domain: 'Documentation & Archives',
    leadName: 'Aarav Patel',
    leadRole: 'Documentation Lead',
    department: 'Geoinformatics & Archival Science',
    avatarBg: '#DAF1DE',
    avatarColor: '#163832',
    timeAgo: '2h ago',
    updateText: '8 of 12 deliverables verified across 4 events; 2 missing reports flagged',
    details:
      'Comprehensive audit performed across Q3 chapter events. Missing post-event narrative for Campus Drone Survey and delayed feedback summary flagged for follow-up with squad coordinators.',
    targetTab: 'doc_studio',
    verifiedStatus: 'Synchronized with Chapter Database',
    auditRef: 'AUD-849202',
    metric: '8 of 12 Verified',
    category: 'Documentation & Archives',
    status: 'Action Required',
    lastSynced: 'Today at 02:40 PM',
    isSealed: false,
    timeline: [
      {
        id: 'ca-1',
        title: 'Accreditation Deliverables Audit',
        description: 'Cross-referenced 12 mandatory university accreditation dossiers against live chapter records.',
        author: 'Aarav Patel (Doc Lead)',
        timestamp: '2h ago',
        statusBadge: 'Audit Complete',
        type: 'audit',
      },
      {
        id: 'ca-2',
        title: 'Deficiency Notice Issued',
        description: 'Automated notice sent to Promotion and Volunteer leads for missing attendance counters.',
        author: 'System Audit Engine',
        timestamp: '3h ago',
        statusBadge: 'Pending Response',
        type: 'system',
      },
      {
        id: 'ca-3',
        title: 'Initial Event Shell Recorded',
        description: 'Semester kickoff milestones and audit milestones registered with Dean office.',
        author: 'Dr. Sarah Jenkins',
        timestamp: '3 days ago',
        statusBadge: 'Registered',
        type: 'approval',
      },
    ],
  },

  'templates-prefilled': {
    id: 'templates-prefilled',
    slug: 'templates-prefilled',
    moduleTitle: 'Templates Prefilled',
    domain: 'Documentation & Archives',
    leadName: 'Aarav Patel',
    leadRole: 'Documentation Lead',
    department: 'Geoinformatics & Archival Science',
    avatarBg: '#DAF1DE',
    avatarColor: '#163832',
    timeAgo: '1h ago',
    updateText: 'Prefilled official dossiers for QGIS Workshop & GEO FEST 2026',
    details:
      'Aarav Patel populated 4 event document templates with verified guest speaker bios, sanctioned budgets, and hall coordinates. Dossiers are formatted to university accreditation standards.',
    targetTab: 'doc_studio',
    verifiedStatus: 'Verified by Faculty In-charge',
    auditRef: 'AUD-849201',
    metric: '4 Official Dossiers',
    category: 'Documentation & Archives',
    status: 'Verified',
    lastSynced: 'Today at 03:30 PM',
    isSealed: false,
    timeline: [
      {
        id: 'tp-1',
        title: 'QGIS & GEO FEST Dossiers Finalized',
        description: 'Speaker profiles and room allocations confirmed with Hall Administration.',
        author: 'Aarav Patel (Doc Lead)',
        timestamp: '1h ago',
        statusBadge: 'Dossiers Ready',
        type: 'publish',
      },
      {
        id: 'tp-2',
        title: 'Sanctioned Budget Headers Synced',
        description: 'Treasurer allocated amounts matched against Dean office sanction letters.',
        author: 'Ananya Iyer (Treasurer)',
        timestamp: '3h ago',
        statusBadge: 'Budget Synced',
        type: 'sync',
      },
    ],
  },

  'minutes-of-meeting': {
    id: 'minutes-of-meeting',
    slug: 'minutes-of-meeting',
    moduleTitle: 'Minutes of Meeting (MoM)',
    domain: 'Documentation & Archives',
    leadName: 'Aarav Patel',
    leadRole: 'Documentation Lead',
    department: 'Geoinformatics & Archival Science',
    avatarBg: '#DAF1DE',
    avatarColor: '#163832',
    timeAgo: 'Yesterday',
    updateText: 'Drafted & submitted signed MoM for Core Committee Briefing (Hall B)',
    details:
      'Recorded minutes of meeting for October 3 core briefing. All 6 action items assigned with deadlines. Approved by Club President Alex Rivera and verified by Faculty In-charge.',
    targetTab: 'meetings',
    verifiedStatus: 'Verified by Faculty In-charge',
    auditRef: 'AUD-849204',
    metric: '14 Signatures',
    category: 'Documentation & Archives',
    status: 'Verified',
    lastSynced: 'Yesterday at 06:10 PM',
    isSealed: false,
    timeline: [
      {
        id: 'mom-1',
        title: 'Official Signatures Secured',
        description: 'President Alex Rivera and 14 committee heads signed attendance & action items ledger.',
        author: 'Aarav Patel',
        timestamp: 'Yesterday',
        statusBadge: '14 Signed',
        type: 'approval',
      },
      {
        id: 'mom-2',
        title: 'Minutes Drafted in Hall B',
        description: 'Agenda points and budget vote outcomes captured live during core council assembly.',
        author: 'Aarav Patel',
        timestamp: 'Yesterday',
        statusBadge: 'Drafted',
        type: 'publish',
      },
    ],
  },

  'geotagged-photo-records': {
    id: 'geotagged-photo-records',
    slug: 'geotagged-photo-records',
    moduleTitle: 'Geotagged Photo Records',
    domain: 'Documentation & Archives',
    leadName: 'Aarav Patel',
    leadRole: 'Documentation Lead',
    department: 'Geoinformatics & Archival Science',
    avatarBg: '#DAF1DE',
    avatarColor: '#163832',
    timeAgo: 'Yesterday',
    updateText: 'Archived 12 high-resolution field survey photos with metadata',
    details:
      'Uploaded RAW drone captures and EXIF-tagged terrain photos for Watershed Analysis project. Verified storage quota and cloud backups for institutional gallery.',
    targetTab: 'gallery',
    verifiedStatus: 'Synchronized with Chapter Database',
    auditRef: 'AUD-849205',
    metric: '12 Uploads Verified',
    category: 'Documentation & Archives',
    status: 'Synchronized',
    lastSynced: 'Yesterday at 04:30 PM',
    isSealed: false,
    timeline: [
      {
        id: 'gp-1',
        title: 'EXIF Metadata Synced',
        description: 'GPS coordinates and drone flight altitudes indexed for all 12 survey captures.',
        author: 'Aarav Patel',
        timestamp: 'Yesterday',
        statusBadge: 'Indexed',
        type: 'sync',
      },
    ],
  },

  'video-archive-links': {
    id: 'video-archive-links',
    slug: 'video-archive-links',
    moduleTitle: 'Video Archive Links',
    domain: 'Documentation & Archives',
    leadName: 'Aarav Patel',
    leadRole: 'Documentation Lead',
    department: 'Geoinformatics & Archival Science',
    avatarBg: '#DAF1DE',
    avatarColor: '#163832',
    timeAgo: '2 days ago',
    updateText: 'Linked 4K keynote recording for Clean Energy symposium',
    details:
      'Processed YouTube unlisted chapter recordings and embedded playback hashes in official institutional records. Closed captioning verified.',
    targetTab: 'gallery',
    verifiedStatus: 'Verified by Faculty In-charge',
    auditRef: 'AUD-849206',
    metric: '4K Recording Active',
    category: 'Documentation & Archives',
    status: 'Verified',
    lastSynced: '2 days ago',
    isSealed: false,
    timeline: [
      {
        id: 'va-1',
        title: '4K Keynote Stream Mounted',
        description: 'High-definition chapter video stream linked to archive with faculty authorization.',
        author: 'Aarav Patel',
        timestamp: '2 days ago',
        statusBadge: 'Mounted',
        type: 'publish',
      },
    ],
  },

  'documentation-studio-suite': {
    id: 'documentation-studio-suite',
    slug: 'documentation-studio-suite',
    moduleTitle: 'Documentation Studio Suite',
    domain: 'Documentation & Archives',
    leadName: 'Aarav Patel',
    leadRole: 'Documentation Lead',
    department: 'Geoinformatics & Archival Science',
    avatarBg: '#DAF1DE',
    avatarColor: '#163832',
    timeAgo: '1h ago',
    updateText: 'Prefilled 4 event dossiers, verified 8 deliverables, and compiled Bulletin #4',
    details:
      'Aarav Patel maintains all institutional archival assets. In this session, official dossiers for QGIS Workshop, GEO FEST, and Drone Survey were linked with speaker profiles and verified turnstiles.',
    targetTab: 'doc_studio',
    verifiedStatus: 'Verified by Faculty In-charge',
    auditRef: 'AUD-849200',
    metric: '7 Modules Active',
    category: 'Documentation & Archives',
    status: 'Synchronized',
    lastSynced: 'Today at 04:30 PM',
    isSealed: false,
    timeline: [
      {
        id: 'ds-1',
        title: 'Complete Archival Suite Audit',
        description: 'All 7 documentation and publication modules synchronized with Central Dean Records.',
        author: 'Aarav Patel',
        timestamp: '1h ago',
        statusBadge: 'Fully Synced',
        type: 'sync',
      },
    ],
  },
};

// Global in-memory storage for active session updates
const sessionAudits: Record<string, AuditRecord> = { ...INITIAL_AUDIT_RECORDS };

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const registerAudit = (record: Partial<AuditRecord> & { moduleTitle: string }): AuditRecord => {
  const slug = record.slug || slugify(record.moduleTitle);
  const existing = sessionAudits[slug];

  const fullRecord: AuditRecord = {
    id: slug,
    slug,
    moduleTitle: record.moduleTitle,
    domain: record.domain || 'Chapter Operations',
    leadName: record.leadName || 'Squad Coordinator',
    leadRole: record.leadRole || 'Department Lead',
    department: record.department || 'Academic Chapter',
    avatarBg: record.avatarBg || '#DAF1DE',
    avatarColor: record.avatarColor || '#163832',
    timeAgo: record.timeAgo || 'Just now',
    updateText: cleanQuotedText(record.updateText || `${record.moduleTitle} updated and synchronized`),
    details: record.details || `Official chapter operations update recorded for ${record.moduleTitle}. Verified by department leadership.`,
    targetTab: record.targetTab || 'operations',
    verifiedStatus: record.verifiedStatus || 'Synchronized with Chapter Database',
    auditRef: record.auditRef || `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
    metric: record.metric || 'Active',
    category: record.category || record.domain || 'Operations',
    status: record.status || 'Verified',
    lastSynced: record.lastSynced || 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSealed: existing?.isSealed ?? false,
    sealedBy: existing?.sealedBy,
    sealedAt: existing?.sealedAt,
    timeline: record.timeline || existing?.timeline || [
      {
        id: `t-${Date.now()}`,
        title: 'Deliverables Synchronized',
        description: `Verified operational milestones and assets logged for ${record.moduleTitle}.`,
        author: record.leadName || 'Squad Lead',
        timestamp: record.timeAgo || 'Recent',
        statusBadge: 'Synced',
        type: 'sync',
      },
      {
        id: `t-init`,
        title: 'Module Initialized',
        description: 'Module opened and credentials confirmed by chapter leadership.',
        author: 'System Operations',
        timestamp: '1d ago',
        statusBadge: 'Online',
        type: 'system',
      },
    ],
  };

  sessionAudits[slug] = fullRecord;
  return fullRecord;
};

export const getAuditById = (idOrSlug: string): AuditRecord | undefined => {
  if (!idOrSlug) return undefined;
  const normalized = slugify(idOrSlug);

  // Direct match
  if (sessionAudits[normalized]) return sessionAudits[normalized];
  if (sessionAudits[idOrSlug]) return sessionAudits[idOrSlug];

  // Key match
  const foundKey = Object.keys(sessionAudits).find(
    (k) => k === normalized || k.includes(normalized) || normalized.includes(k)
  );
  if (foundKey) return sessionAudits[foundKey];

  return undefined;
};

export const sealAuditRecord = (idOrSlug: string, facultyName: string): AuditRecord | null => {
  const record = getAuditById(idOrSlug);
  if (!record) return null;

  record.isSealed = true;
  record.sealedBy = facultyName;
  record.sealedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  record.status = 'Verified';
  record.timeline.unshift({
    id: `seal-${Date.now()}`,
    title: 'Update Acknowledged & Sealed',
    description: `Endorsed and sealed by ${facultyName}. Faculty electronic verification signed into ledger.`,
    author: facultyName,
    timestamp: 'Just now',
    statusBadge: 'Sealed',
    type: 'approval',
  });

  return { ...record };
};
