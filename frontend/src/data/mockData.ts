import {
  UserModel,
  TeamModel,
  EventModel,
  TaskModel,
  ApprovalItem,
  GalleryItem,
  AttendanceRecord,
  ClubReport,
  NotificationModel,
  SocialPost,
  CampaignPlan,
  DailyNewsItem,
} from '../types';

export const demoSuperAdmin: UserModel = {
  uid: 'u_super_admin_sa01',
  email: 'superadmin@college.edu',
  rollNo: 'SA01',
  name: 'System SuperAdmin',
  role: 'super_admin',
  post: 'System Administrator',
  team: 'Platform Governance',
  teamRole: 'System Administrator',
  squadMemberships: [{ squad: 'Management', isLead: true }],
  isVolunteer: false,
  status: 'active',
  department: 'Platform Governance & IT',
  yearOfStudy: 'System Administrator',
  phone: '+1 (555) 010-0001',
  hasCompletedProfileSetup: true,
  createdAt: '2025-08-01T09:00:00Z',
};

export const demoFaculty: UserModel = {
  uid: 'u_faculty_fac01',
  email: 'sarah.jenkins@college.edu',
  rollNo: 'FAC01',
  name: 'Dr. Sarah Jenkins',
  role: 'faculty',
  post: 'Faculty Advisor',
  team: 'Management',
  teamRole: 'Faculty Advisor',
  squadMemberships: [{ squad: 'Management', isLead: true }],
  isVolunteer: false,
  status: 'active',
  department: 'Geography & Geomatics',
  yearOfStudy: 'Faculty Staff',
  phone: '+1 (555) 019-2831',
  hasCompletedProfileSetup: true,
  createdAt: '2025-08-01T09:00:00Z',
};

export const demoAdmin: UserModel = {
  uid: 'u_admin_02',
  email: 'alex.rivera@college.edu',
  rollNo: '21GEO001',
  name: 'Alex Rivera',
  role: 'coordinator',
  post: 'Club President',
  team: 'Management',
  teamRole: 'Club President',
  squadMemberships: [{ squad: 'Management', isLead: true }],
  isVolunteer: false,
  status: 'active',
  department: 'Geoinformatics Engineering',
  yearOfStudy: 'Final Year (4th)',
  phone: '+1 (555) 014-9921',
  hasCompletedProfileSetup: true,
  createdAt: '2025-08-15T10:00:00Z',
};
export const demoCoordinator = demoAdmin;

export const demoTeamAdmin: UserModel = {
  uid: 'u_promo_03',
  email: 'david.chen@college.edu',
  rollNo: '22GEO014',
  name: 'David Chen',
  role: 'promotion',
  team: 'Promotion',
  teamRole: 'Promotion Lead',
  post: 'Promotion Lead',
  squadMemberships: [
    { squad: 'Promotion', isLead: true },
    { squad: 'Management', isLead: false },
  ],
  isVolunteer: false,
  status: 'active',
  department: 'Earth Science & Media',
  yearOfStudy: '3rd Year (Junior)',
  phone: '+1 (555) 018-7734',
  hasCompletedProfileSetup: true,
  createdAt: '2025-09-01T11:00:00Z',
};
export const demoPromotion = demoTeamAdmin;

export const demoMember: UserModel = {
  uid: 'u_member_04',
  email: 'maya.patel@college.edu',
  rollNo: '23GEO088',
  name: 'Maya Patel',
  role: 'student',
  team: 'Documentation',
  teamRole: 'Content Writer',
  squadMemberships: [
    { squad: 'Documentation', isLead: false },
    { squad: 'Management', isLead: false },
  ],
  isVolunteer: false,
  status: 'active',
  department: 'Cartography & Geography',
  yearOfStudy: '2nd Year',
  phone: '+1 (555) 012-3489',
  hasCompletedProfileSetup: true,
  createdAt: '2025-09-10T14:30:00Z',
};
export const demoStudent = demoMember;

export const demoVolunteer: UserModel = {
  uid: 'u_volunteer_05',
  email: 'liam.vance@college.edu',
  rollNo: '23GEO042',
  name: 'Liam Vance',
  role: 'student',
  team: 'Entertainment',
  post: 'Student Volunteer',
  teamRole: 'Event Coordinator',
  squadMemberships: [
    { squad: 'Entertainment', isLead: true },
    { squad: 'Promotion', isLead: false },
  ],
  isVolunteer: false,
  status: 'active',
  department: 'Environmental Studies',
  yearOfStudy: '3rd Year',
  phone: '+1 (555) 017-6622',
  createdAt: '2025-09-15T16:00:00Z',
};

export const demoDocLead: UserModel = {
  uid: 'u_doc_lead_08',
  email: 'aarav.patel@college.edu',
  rollNo: '22GEO018',
  name: 'Aarav Patel',
  role: 'documentation',
  team: 'Documentation',
  post: 'Documentation Lead',
  teamRole: 'Documentation Lead',
  squadMemberships: [{ squad: 'Documentation', isLead: true }],
  isVolunteer: false,
  status: 'active',
  department: 'Geoinformatics & Archival Science',
  yearOfStudy: '3rd Year',
  phone: '+1 (555) 016-8844',
  createdAt: '2025-08-20T10:00:00Z',
};

export const demoTreasurer: UserModel = {
  uid: 'u_treasurer_09',
  email: 'ananya.iyer@college.edu',
  rollNo: '22GEO019',
  name: 'Ananya Iyer',
  role: 'treasurer',
  team: 'Management',
  post: 'Treasurer Lead',
  teamRole: 'Treasurer Lead',
  squadMemberships: [{ squad: 'Management', isLead: true }],
  isVolunteer: false,
  status: 'active',
  department: 'Economics & Financial Analytics',
  yearOfStudy: '3rd Year (Junior)',
  phone: '+1 (555) 013-5566',
  createdAt: '2025-08-25T10:00:00Z',
};

export const demoManagement: UserModel = {
  uid: 'u_mgmt_06',
  email: 'elena.rostova@college.edu',
  rollNo: '21GEO010',
  name: 'Elena Rostova',
  role: 'management',
  team: 'Management',
  post: 'Management Squad Lead',
  teamRole: 'Management Squad Lead',
  squadMemberships: [{ squad: 'Management', isLead: true }],
  isVolunteer: false,
  status: 'active',
  department: 'Geology & Environmental Management',
  yearOfStudy: '4th Year (Senior)',
  phone: '+1 (555) 011-2233',
  createdAt: '2025-08-18T10:00:00Z',
};

export const demoUsersList: UserModel[] = [
  demoSuperAdmin,
];

export const initialTeams: TeamModel[] = [
  {
    id: 'team_mgmt',
    name: 'Management',
    description: 'Oversees club strategy, university permissions, sponsorship, budget execution, and logistics.',
    leadId: '',
    leadName: 'Unassigned',
    leadIds: [],
    leadNames: [],
    memberIds: [],
    totalTasks: 0,
    completedTasks: 0,
    iconName: 'Building',
  },
  {
    id: 'team_promo',
    name: 'Promotion',
    description: 'Drives student outreach, digital campaign design, social channels, posters, and campus awareness.',
    leadId: '',
    leadName: 'Unassigned',
    leadIds: [],
    leadNames: [],
    memberIds: [],
    totalTasks: 0,
    completedTasks: 0,
    iconName: 'Megaphone',
  },
  {
    id: 'team_doc',
    name: 'Documentation',
    description: 'Captures high-res media, live records, GIS reports, archival documents, and expenditure bills.',
    leadId: '',
    leadName: 'Unassigned',
    leadIds: [],
    leadNames: [],
    memberIds: [],
    totalTasks: 0,
    completedTasks: 0,
    iconName: 'Camera',
  },
  {
    id: 'team_ent',
    name: 'Entertainment',
    description: 'Curates interactive geo-quizzes, map trivia, cultural evenings, outdoor field games, and hospitality.',
    leadId: '',
    leadName: 'Unassigned',
    leadIds: [],
    leadNames: [],
    memberIds: [],
    totalTasks: 0,
    completedTasks: 0,
    iconName: 'Sparkles',
  },
];

// Pure clean initial collections: no sample/dummy data
export const initialUsers: UserModel[] = [];
export const initialEvents: EventModel[] = [];
export const initialTasks: TaskModel[] = [];
export const initialApprovals: ApprovalItem[] = [];
export const initialGallery: GalleryItem[] = [];
export const initialAttendance: AttendanceRecord[] = [];

export const initialReport: ClubReport = {
  totalMembers: 0,
  activeMembers: 0,
  totalEvents: 0,
  completedEvents: 0,
  totalAttendance: 0,
  averageAttendanceRate: 0,
  totalTasks: 0,
  completedTasks: 0,
  totalBudget: 0,
  spentBudget: 0,
  teamMetrics: [
    { teamName: 'Management', memberCount: 0, totalTasks: 0, completedTasks: 0, budgetAllocated: 0 },
    { teamName: 'Promotion', memberCount: 0, totalTasks: 0, completedTasks: 0, budgetAllocated: 0 },
    { teamName: 'Documentation', memberCount: 0, totalTasks: 0, completedTasks: 0, budgetAllocated: 0 },
    { teamName: 'Entertainment', memberCount: 0, totalTasks: 0, completedTasks: 0, budgetAllocated: 0 },
  ],
  monthlyAttendance: [],
};

export const initialNotifications: NotificationModel[] = [];
export const initialMeetings: import('../types').MeetingModel[] = [];
export const initialMemories: import('../types').MemoryItem[] = [];
export const initialForumMessages: import('../types').ForumMessage[] = [];
export const initialExpenses: import('../types').ExpenseItem[] = [];
export const initialCommunityMessages: import('../types').CommunityMessage[] = [];
export const initialStockItems: import('../types').StockItem[] = [];
export const initialBudgetRequests: import('../types').BudgetChangeRequest[] = [];

// Pre-defined official documentation templates (forms for drafting records)
export const initialDocTemplates: import('../types').DocTemplate[] = [
  {
    id: 'tpl_01',
    name: 'Event Report',
    description: 'Mandatory NAAC/Department format covering event objectives, attendee statistics, photographs, and learning outcomes.',
    category: 'event_summary',
    defaultContent: `# COLLEGE GEO CLUB (GEOHUB)
## POST-EVENT SUMMARY & OUTCOME REPORT

**Event Title:** [Event Title Here]  
**Academic Year:** 2026 - 2027  
**Date of Event:** [Date] | **Duration:** 4 Hours  
**Venue / Coordinates:** [Venue Name / Geo Coordinates]  
**Target Audience:** Chapter Scholars & External Participants  
**Total Attendance Count:** [Verified Attendance]  

---

### 1. Objectives of the Event
1. Provide practical exposure to modern geospatial tools and satellite data acquisition.
2. Foster collaborative peer learning, spatial modeling, and interdisciplinary field science.

### 2. Event Agenda & Execution
- **Session 1 (Morning):** Keynote briefing, safety orientation, and GNSS receiver calibration.
- **Session 2 (Mid-day):** Hands-on laboratory training and campus field survey expedition.
- **Session 3 (Afternoon):** QGIS layer compilation, outcome presentation, and attendee verification.

### 3. Key Accomplishments & Outcomes
- 100% of participants completed spatial coordinate mapping with under 1m positional accuracy.
- Generated high-resolution campus orthomosaic raster layer published to club repository.

### 4. Photographic Evidence & Geotag Records
*(Refer to GeoHub Media Archives for verified geotagged photography and drone flight telemetry)*

---
**Prepared By:** Aarav Patel (Documentation Lead)  
**Verified By:** Dr. Sarah Jenkins (Faculty Advisor)  
**Approved By:** Head of Department (HOD)`,
  },
  {
    id: 'tpl_02',
    name: 'MoM (Minutes of Meeting)',
    description: 'Official record of executive and squad discussions, decisions, and action items with assignees.',
    category: 'meeting_minutes',
    defaultContent: `# COLLEGE GEO CLUB (GEOHUB)
## MINUTES OF MEETING (MoM)

**Meeting Title:** Executive Standup: [Event Title] Preparation  
**Date & Time:** [Date], 10:00 AM - 11:30 AM  
**Venue / Platform:** [Venue / Auditorium] / Hybrid Virtual Link  
**Presided By:** Alex Rivera (President)  
**MoM Recorded By:** Aarav Patel (Documentation Lead)  

### Attendees:
- Dr. Sarah Jenkins (Faculty Advisor)
- Alex Rivera (Coordinator / President)
- Elena Rostova (Management Lead)
- David Chen (Promotion Lead)
- Aarav Patel (Documentation Lead)
- Ananya Iyer (Treasurer Lead)

---

### 1. Agenda Items Discussed
1. Turnstile gate attendance terminals and QR scanner deployment.
2. Photographic and video documentation equipment allocation.
3. Refreshment vendor vouchers and participant kit distribution.

### 2. Key Decisions Taken
- All squad volunteers must check in 45 minutes prior to gate opening.
- Geotagging enabled on all camera units for archival compliance.
- Budget allocation sanctioned for stage audio and display consoles.

### 3. Action Items & Deliverables
| Action Item | Assignee | Deadline | Status |
| :--- | :--- | :--- | :--- |
| Set up Gate QR terminal scanners | Elena Rostova | Event Day, 08:30 AM | Assigned |
| Field photography & Drone footage | Aarav Patel | Event Day, 10:00 AM | In Progress |
| Social media livestream announcement | David Chen | Event Day, 09:30 AM | Ready |

---
**Signed:** Alex Rivera (Club President) | Aarav Patel (Documentation Lead)`,
  },
  {
    id: 'tpl_03',
    name: 'Attendance Summary',
    description: 'Consolidated attendance manifest with barcode scan timestamps, squad participation, and turnout metrics.',
    category: 'attendance_manifest',
    defaultContent: `# COLLEGE GEO CLUB (GEOHUB)
## OFFICIAL ATTENDANCE & GATE VERIFICATION SUMMARY

**Event:** [Event Title]  
**Date:** [Date]  
**Venue:** [Venue / Auditorium]  
**Total RSVP Registrations:** 0  
**Verified Gate Check-ins:** [Verified Attendance]  
**Turnout Percentage:** 0%  

---

Certified that all scanned attendee tokens matched active student cryptographic passes.

**Verified By:** Aarav Patel (Documentation Lead)  
**Gate In-Charge:** Elena Rostova (Management Lead)`,
  },
  {
    id: 'tpl_04',
    name: 'Budget Summary',
    description: 'Financial utilization certificate with itemized expense receipts and balance reconciliation.',
    category: 'budget_statement',
    defaultContent: `# GEOHUB FINANCIAL UTILIZATION CERTIFICATE
**Event Title:** [Event Title]  
**Sanctioned Budget:** ₹[Budget Amount]  
**Total Actual Expenditure:** ₹[Spent Amount]  
**Unspent Balance Returned:** ₹0  

---

Certified that expenditures incurred for the conduct of approved events are audited against valid receipts.

**Documentation Lead:** Aarav Patel  
**Treasurer Lead:** Ananya Iyer  
**Faculty Advisor:** Dr. Sarah Jenkins`,
  },
  {
    id: 'tpl_05',
    name: 'Feedback Summary',
    description: 'Post-event survey analytics, participant ratings, qualitative testimonials, and recommendations.',
    category: 'feedback_summary',
    defaultContent: `# COLLEGE GEO CLUB (GEOHUB)
## PARTICIPANT FEEDBACK & OUTCOME ANALYSIS

**Event Title:** [Event Title]  
**Survey Period:** [Date] + 24 Hours  

---

**Prepared By:** Aarav Patel (Documentation Lead)  
**Approved By:** Alex Rivera (Club President)`,
  },
];

export const initialSocialPosts: SocialPost[] = [];
export const initialCampaignPlans: CampaignPlan[] = [];
export const initialDailyNews: DailyNewsItem[] = [];
