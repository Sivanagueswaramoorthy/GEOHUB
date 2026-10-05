export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'team_admin'
  | 'member'
  | 'volunteer'
  | 'faculty'
  | 'coordinator'
  | 'treasurer'
  | 'documentation'
  | 'social_media';

export type UserStatus = 'active' | 'pending' | 'disabled';

export interface UserModel {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  post?: string; // e.g. 'Faculty Advisor', 'President', 'Vice President', 'Treasurer', 'Documentation Lead', 'Social Media Lead', 'Student Volunteer'
  team?: 'Management' | 'Promotion' | 'Documentation' | 'Entertainment' | string;
  teamRole?: string;
  isVolunteer: boolean;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  yearOfStudy?: string;
  createdAt?: string;
}

export interface TeamModel {
  id: string;
  name: string;
  description: string;
  leadId: string;
  leadName: string;
  memberIds: string[];
  totalTasks: number;
  completedTasks: number;
  iconName: string;
}

export type EventStatus = 'draft' | 'submitted' | 'approved' | 'live' | 'completed' | 'cancelled' | 'archived';

export interface VolunteerAssignments {
  documentation: string[]; // volunteer user IDs
  signageDesign: string[];
  shortlistedStudents: string[];
  foodRefreshments: string[];
}

export interface WorkDoneStatus {
  documentationDone?: boolean;
  signageDone?: boolean;
  shortlistingDone?: boolean;
  foodArranged?: boolean;
}

export interface EventMoM {
  meetingDate: string;
  attendees: string[];
  notes: string;
  actionItems: { task: string; assignedTo: string; isDone: boolean }[];
}

export interface GeotaggedPhoto {
  url: string;
  caption?: string;
  isGeotagged?: boolean;
  lat?: number;
  lng?: number;
  locationName?: string;
}

export interface EventCompletedData {
  feedbackRating?: number;
  feedbackNotes?: string;
  socialMediaLinks?: {
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  photos?: GeotaggedPhoto[];
  dailyNews?: string;
  documentationSummary?: string;
}

export interface EventModel {
  id: string;
  title: string;
  description: string;
  category: string;
  eventType?: 'internal' | 'external';
  posterUrl?: string;
  venue: string;
  geoCoordinates?: { lat: number; lng: number; locationName?: string };
  startDate: string; // ISO string
  endDate: string; // ISO string
  status: EventStatus;
  cancellationReason?: string;
  capacity: number;
  registeredUserIds: string[];
  volunteerIds: string[];
  budget: number;
  createdBy: string;
  qrToken?: string;
  googleFormUrl?: string;
  volunteerAssignments?: VolunteerAssignments;
  workDoneStatus?: WorkDoneStatus;
  preEventMoM?: EventMoM;
  postEventMoM?: EventMoM;
  completedData?: EventCompletedData;
}

// ------------------------------------------
// MEETINGS & MINUTES OF MEETING (MoM)
// ------------------------------------------
export interface MeetingModel {
  id: string;
  title: string;
  type: 'pre_event' | 'post_event' | 'general';
  eventId?: string;
  eventTitle?: string;
  dateTime: string; // ISO string
  venue: string;
  organizerName: string;
  attendeeIds: string[];
  agenda: string;
  momNotes?: string;
  actionItems?: { task: string; assignedTo: string; isDone: boolean }[];
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

// ------------------------------------------
// MEMORIES HUB
// ------------------------------------------
export interface MemoryItem {
  id: string;
  title: string;
  eventId?: string;
  eventTitle: string;
  date: string;
  category: 'expedition' | 'workshop' | 'celebration' | 'field_work';
  coverUrl: string;
  mediaUrls: string[];
  geotags?: { lat: number; lng: number; locationName: string; photoUrl: string }[];
  socialLinks?: { instagram?: string; linkedin?: string; youtube?: string };
  caption: string;
  createdBy: string;
}

// ------------------------------------------
// COMMUNICATION FORUM
// ------------------------------------------
export interface ForumComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
}

export interface ForumMessage {
  id: string;
  channelId: 'announcements' | 'coordination' | 'tech_geo' | 'general';
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  title?: string;
  content: string;
  timestamp: string;
  likes: number;
  likedBy?: string[];
  pinned?: boolean;
  replies?: ForumComment[];
}

// ------------------------------------------
// TREASURER & BUYING / BUDGET HISTORY
// ------------------------------------------
export interface ExpenseItem {
  id: string;
  eventId?: string;
  eventTitle?: string;
  title: string;
  amount: number;
  category:
    | 'Logistics'
    | 'Stage'
    | 'Printing'
    | 'Refreshments'
    | 'Equipment'
    | 'Signage & Printing'
    | 'Honorarium'
    | 'Other';
  buyingDate: string;
  vendorName: string;
  receiptUrl?: string;
  paidBy: string;
  approvedBy: string;
  status: 'approved' | 'pending' | 'rejected';
  notes?: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'Logistics' | 'Stage' | 'Printing' | 'Refreshments' | 'Field Equipment' | 'Stationery';
  quantity: number;
  unit: string;
  minThreshold: number;
  unitCost: number; // in INR
  lastRestocked: string;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface BudgetChangeRequest {
  id: string;
  teamName: string;
  requestedAmount: number;
  currentAllocation: number;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}


// ------------------------------------------
// PRE-DEFINED DOCUMENTATION TEMPLATES
// ------------------------------------------
export interface DocTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | 'event_summary'
    | 'permission_letter'
    | 'budget_statement'
    | 'feedback_analysis'
    | 'meeting_minutes'
    | 'attendance_manifest'
    | 'feedback_summary';
  defaultContent: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string; // ISO string
}

export interface TaskModel {
  id: string;
  title: string;
  description?: string;
  team: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  createdById: string;
  createdByName: string;
  dueDate: string; // ISO string
  status: TaskStatus;
  priority: TaskPriority;
  proofUrl?: string;
  proofNote?: string;
  comments: TaskComment[];
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}

export type ApprovalType = 'event' | 'join_request' | 'budget';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  title: string;
  subtitle: string;
  applicantId: string;
  applicantName: string;
  applicantEmail?: string;
  requestedTeam?: string;
  requestedRole?: string;
  requestedBudget?: number;
  details?: string;
  status: ApprovalStatus;
  createdAt: string; // ISO string
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  team?: string;
  checkInTime: string; // ISO string
  scannedByVolunteerId: string;
  scannedByVolunteerName: string;
  status: 'verified' | 'flagged';
}

export interface GalleryItem {
  id: string;
  title: string;
  eventId: string;
  eventTitle: string;
  academicYear: string;
  category: 'photos' | 'videos' | 'bills' | 'reports';
  url: string;
  thumbnailUrl?: string;
  uploadedByName: string;
  uploadedAt: string; // ISO string
  fileSizeBytes?: string;
  geotag?: { lat: number; lng: number; locationName: string };
  submissionStatus?: 'submitted' | 'draft' | 'verified' | 'missing';
  mediaType?: 'photo' | 'video' | 'report' | 'mom' | 'news' | 'sheet';
  caption?: string;
}

export interface TeamMetric {
  teamName: string;
  memberCount: number;
  totalTasks: number;
  completedTasks: number;
  budgetAllocated: number;
}

export interface MonthlyAttendance {
  month: string;
  count: number;
  percentage: number;
}

export interface ClubReport {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  completedEvents: number;
  totalAttendance: number;
  averageAttendanceRate: number;
  totalTasks: number;
  completedTasks: number;
  totalBudget: number;
  spentBudget: number;
  teamMetrics: TeamMetric[];
  monthlyAttendance: MonthlyAttendance[];
}

export type NotificationType = 'event' | 'task' | 'approval' | 'system' | 'qr';

export interface NotificationModel {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string; // ISO string
  isRead: boolean;
  targetRoute?: string;
  targetId?: string;
}

// ------------------------------------------
// PROMOTION & SOCIAL MEDIA CAMPAIGNS
// ------------------------------------------
export type SocialPlatform = 'Instagram' | 'LinkedIn' | 'WhatsApp' | 'Other';
export type SocialPostStatus = 'Draft' | 'Scheduled' | 'Posted';

export interface SocialPost {
  id: string;
  eventId?: string;
  eventTitle?: string;
  platform: SocialPlatform;
  status: SocialPostStatus;
  caption: string;
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  publishedDate?: string;
  postUrl?: string; // Live post URL
  hashtags?: string[];
  authorName?: string;
  mediaUrl?: string;
  likesCount?: number;
  reachCount?: number;
  createdAt: string;
}

export interface CampaignChecklist {
  poster: boolean;
  teaser: boolean;
  regLink: boolean;
  reel: boolean;
  postEvent: boolean;
}

export interface CampaignPlan {
  id: string;
  title: string;
  eventId: string;
  eventTitle: string;
  startDate: string;
  endDate?: string;
  channels?: SocialPlatform[];
  targetAudience: string;
  status: 'planning' | 'active' | 'completed';
  checklist: CampaignChecklist;
  notes?: string;
}

export interface DailyNewsItem {
  id: string;
  title: string;
  date: string;
  eventId?: string;
  eventTitle?: string;
  author: string;
  content: string;
  hashtags: string[];
  status: 'draft' | 'published';
}
