import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserModel,
  UserRole,
  UserStatus,
  TeamModel,
  EventModel,
  TaskModel,
  TaskStatus,
  ApprovalItem,
  GalleryItem,
  AttendanceRecord,
  ClubReport,
  NotificationModel,
  MeetingModel,
  MemoryItem,
  ForumMessage,
  ExpenseItem,
  StockItem,
  BudgetChangeRequest,
  DocTemplate,
  VolunteerAssignments,
  WorkDoneStatus,
  EventCompletedData,
  SocialPost,
  CampaignPlan,
  CampaignChecklist,
  DailyNewsItem,
  AuditLogItem,
  EventStatus,
} from '../types';
import {
  demoSuperAdmin,
  demoAdmin,
  demoTeamAdmin,
  demoDocLead,
  demoTreasurer,
  demoMember,
  demoVolunteer,
  demoUsersList,
  initialTeams,
  initialEvents,
  initialTasks,
  initialApprovals,
  initialGallery,
  initialAttendance,
  initialReport,
  initialNotifications,
  initialMeetings,
  initialMemories,
  initialForumMessages,
  initialExpenses,
  initialStockItems,
  initialBudgetRequests,
  initialDocTemplates,
  initialSocialPosts,
  initialCampaignPlans,
  initialDailyNews,
} from '../data/mockData';
import { canAccessRoute, canScanForEvent, normalizeRole } from '../core/permissions';

interface AppContextType {
  currentUser: UserModel;
  users: UserModel[];
  teams: TeamModel[];
  events: EventModel[];
  tasks: TaskModel[];
  approvals: ApprovalItem[];
  gallery: GalleryItem[];
  attendance: AttendanceRecord[];
  notifications: NotificationModel[];
  report: ClubReport;
  meetings: MeetingModel[];
  memories: MemoryItem[];
  forumMessages: ForumMessage[];
  expenses: ExpenseItem[];
  stockItems: StockItem[];
  budgetRequests: BudgetChangeRequest[];
  docTemplates: DocTemplate[];
  posts: SocialPost[];
  campaigns: CampaignPlan[];
  dailyNews: DailyNewsItem[];
  auditLogs: AuditLogItem[];

  // Navigation & Shell
  activeTab: string;
  selectedEventId: string | null;
  selectedTaskId: string | null;
  selectedTeamId: string | null;
  selectedUserId: string | null;
  isRoleSwitcherOpen: boolean;
  isPhoneFrame: boolean;
  toast: { message: string; type?: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Authentication
  isAuthenticated: boolean;
  loginWithRole: (role: UserRole | string) => void;
  loginWithUser: (user: UserModel) => void;
  logout: () => void;

  // Setters
  setCurrentUser: (user: UserModel) => void;
  switchRole: (role: UserRole | string) => void;
  setActiveTab: (tab: string) => void;
  setSelectedEventId: (id: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  setSelectedTeamId: (id: string | null) => void;
  setSelectedUserId: (id: string | null) => void;
  setIsRoleSwitcherOpen: (open: boolean) => void;
  setIsPhoneFrame: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Business Actions
  registerForEvent: (eventId: string) => void;
  registerStudentForEvent: (eventId: string, studentId: string) => void;
  registerMultipleStudentsForEvent: (eventId: string, studentIds: string[]) => void;
  addNewStudentAndRegisterForEvent: (studentData: Omit<UserModel, 'uid'>, eventId: string) => UserModel;
  createEvent: (newEvent: Omit<EventModel, 'id' | 'registeredUserIds' | 'volunteerIds'>) => void;
  updateEventStatus: (eventId: string, newStatus: EventStatus) => { success: boolean; message: string };
  cancelEvent: (eventId: string, cancellationReason: string) => { success: boolean; message: string };
  assignEventScanners: (eventId: string, scannerUserIds: string[]) => { success: boolean; message: string };
  updateEventVolunteerWork: (eventId: string, assignments: VolunteerAssignments, workDone?: WorkDoneStatus) => void;
  completeEventWithData: (eventId: string, completedData: EventCompletedData) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, proofUrl?: string, proofNote?: string) => void;
  addTaskComment: (taskId: string, text: string) => void;
  createTask: (newTask: Omit<TaskModel, 'id' | 'createdAt' | 'comments'>) => void;
  approveItem: (id: string) => void;
  rejectItem: (id: string, reason: string) => void;
  recordAttendance: (eventId: string, studentId: string) => { success: boolean; message: string; record?: AttendanceRecord };
  addStudentToTeam: (student: Omit<UserModel, 'uid'>) => void;
  updateUserRoleAndTeam: (uid: string, role: UserRole, team?: string, isVolunteer?: boolean, status?: UserStatus) => void;
  changeStudentPost: (
    userId: string,
    newPost: string,
    newRole: UserRole,
    department?: string,
    yearOfStudy?: string,
    tenureEnd?: string
  ) => { success: boolean; message: string };
  addAuditLog: (entry: Omit<AuditLogItem, 'id' | 'timestamp'>) => void;
  createMeeting: (meetingData: Omit<MeetingModel, 'id' | 'createdAt'>) => void;
  updateMeetingMoM: (meetingId: string, momNotes: string, actionItems: { task: string; assignedTo: string; isDone: boolean }[]) => void;
  addForumMessage: (msgData: { channelId: 'announcements' | 'coordination' | 'tech_geo' | 'general'; title?: string; content: string }) => void;
  addForumReply: (messageId: string, content: string) => void;
  likeForumMessage: (messageId: string) => void;
  addExpenseItem: (expenseData: Omit<ExpenseItem, 'id' | 'paidBy' | 'status'> & { notes?: string }) => void;
  updateExpenseItem: (id: string, updates: Partial<ExpenseItem>) => void;
  deleteExpenseItem: (id: string) => void;
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockItem: (id: string, updates: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;
  requestBudgetChange: (teamName: string, requestedAmount: number, reason: string) => void;
  uploadGalleryItem: (item: Omit<GalleryItem, 'id' | 'uploadedAt'>) => void;
  updateGalleryItem: (id: string, updates: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  updateEvent: (eventId: string, updatedFields: Partial<EventModel>) => void;
  togglePinForumMessage: (messageId: string) => void;
  updateBudgetAllocations: (teamName: string, newAllocation: number) => void;
  addPost: (post: Omit<SocialPost, 'id' | 'createdAt'> & { createdAt?: string }) => void;
  updatePost: (id: string, updates: Partial<SocialPost>) => void;
  deletePost: (id: string) => void;
  markPostPublished: (id: string, postUrl?: string) => void;
  addCampaign: (campaign: Omit<CampaignPlan, 'id'>) => void;
  updateCampaignChecklist: (campaignId: string, itemKey: keyof CampaignChecklist, value: boolean) => void;
  addDailyNews: (item: Omit<DailyNewsItem, 'id'>) => void;
  updateDailyNews: (id: string, updates: Partial<DailyNewsItem>) => void;
  deleteDailyNews: (id: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserModel>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('geohub_auth_session') || sessionStorage.getItem('geohub_auth_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.user) return parsed.user;
        }
      }
    } catch {
      // ignore
    }
    return demoSuperAdmin;
  });
  const [users, setUsers] = useState<UserModel[]>(demoUsersList);
  const [teams, setTeams] = useState<TeamModel[]>(initialTeams);
  const [events, setEvents] = useState<EventModel[]>(initialEvents);
  const [tasks, setTasks] = useState<TaskModel[]>(initialTasks);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [notifications, setNotifications] = useState<NotificationModel[]>(initialNotifications);
  const [report, setReport] = useState<ClubReport>(initialReport);
  const [meetings, setMeetings] = useState<MeetingModel[]>(initialMeetings);
  const [memories, setMemories] = useState<MemoryItem[]>(initialMemories);
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>(initialForumMessages);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems);
  const [budgetRequests, setBudgetRequests] = useState<BudgetChangeRequest[]>(initialBudgetRequests);
  const [docTemplates, setDocTemplates] = useState<DocTemplate[]>(initialDocTemplates);
  const [posts, setPosts] = useState<SocialPost[]>(initialSocialPosts);
  const [campaigns, setCampaigns] = useState<CampaignPlan[]>(initialCampaignPlans);
  const [dailyNews, setDailyNews] = useState<DailyNewsItem[]>(initialDailyNews);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'audit_01',
      actorId: 'u_super_admin_01',
      actorName: 'Dr. Sarah Jenkins',
      actorRole: 'faculty',
      action: 'role_change',
      targetType: 'user',
      targetId: 'u_admin_02',
      targetName: 'Alex Rivera',
      beforeState: 'role=student',
      afterState: 'role=coordinator',
      details: 'Appointed Alex Rivera as Club Coordinator',
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'audit_02',
      actorId: 'u_super_admin_01',
      actorName: 'Dr. Sarah Jenkins',
      actorRole: 'faculty',
      action: 'budget_approval',
      targetType: 'budget',
      targetId: 'b_req_01',
      targetName: 'Management',
      beforeState: 'status=pending',
      afterState: 'status=approved',
      details: 'Sanctioned annual GeoFest 2026 allocation: ₹4,500',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'audit_03',
      actorId: 'u_admin_02',
      actorName: 'Alex Rivera',
      actorRole: 'coordinator',
      action: 'scanner_assignment_change',
      targetType: 'event',
      targetId: 'event_01',
      targetName: 'GEO FEST 2026',
      beforeState: 'assignedScanners=[]',
      afterState: 'assignedScanners=[u_volunteer_05, u_11, u_13, u_16, u_19]',
      details: 'Designated 5 scanners for event turnstile check-in',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ]);

  const addAuditLog = (entry: Omit<AuditLogItem, 'id' | 'timestamp'>) => {
    const newLog: AuditLogItem = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.replace(/^#\/?/, '').trim();
        const path = window.location.pathname.replace(/^\//, '').trim();
        if (hash === 'login' || path === 'login') return false;
        const raw = localStorage.getItem('geohub_auth_session') || sessionStorage.getItem('geohub_auth_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          return Boolean(parsed?.user);
        }
        return false;
      }
    } catch {
      // ignore
    }
    return false;
  });
  const [activeTab, setActiveTabState] = useState<string>('home');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const hideToast = () => {
    setToast(null);
  };

  const setActiveTab = (tab: string) => {
    const guard = canAccessRoute(tab, currentUser.role);
    if (!guard.allowed) {
      const target = guard.redirect || 'home';
      setActiveTabState(target);
      window.location.hash = target;
      showToast(guard.message || "You don't have access", 'error');
      return;
    }
    setActiveTabState(tab);
    window.location.hash = tab;
  };

  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      const path = window.location.pathname.replace(/^\//, '').trim();
      const targetRoute = hash || (path && path !== 'index.html' ? path : '');

      if (!targetRoute) return;

      const guard = canAccessRoute(targetRoute, currentUser.role);
      if (!guard.allowed) {
        const target = guard.redirect || 'home';
        setActiveTabState(target);
        window.location.hash = target;
        showToast(guard.message || "You don't have access", 'error');
      } else {
        setActiveTabState(targetRoute);
      }
    };

    handleUrlRoute();

    window.addEventListener('hashchange', handleUrlRoute);
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, [currentUser.role]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState<boolean>(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(() => {
    try {
      localStorage.setItem('geohub_phone_frame', 'false');
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('geohub_phone_frame', String(isPhoneFrame));
    } catch {
      // ignore
    }
  }, [isPhoneFrame]);

  const loginWithUser = (user: UserModel) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    switch (user.role) {
      case 'super_admin':
      case 'admin':
      case 'coordinator':
      case 'team_admin':
      case 'social_media':
      case 'documentation':
      case 'treasurer':
      case 'member':
      case 'volunteer':
      default:
        setActiveTab('home');
        break;
    }
    setSelectedEventId(null);
    setSelectedTaskId(null);
    setSelectedTeamId(null);
    setSelectedUserId(null);
  };

  const loginWithRole = (role: UserRole | string) => {
    let targetUser: UserModel = demoSuperAdmin;
    const norm = normalizeRole(role);
    switch (norm) {
      case 'faculty':
        targetUser = demoSuperAdmin;
        break;
      case 'coordinator':
        targetUser = demoAdmin;
        break;
      case 'promotion':
        targetUser = demoTeamAdmin;
        break;
      case 'documentation':
        targetUser = demoDocLead;
        break;
      case 'treasurer':
        targetUser = demoTreasurer;
        break;
      case 'student':
      default:
        targetUser = demoMember;
        break;
    }
    loginWithUser(targetUser);
  };

  const switchRole = (role: UserRole | string) => {
    loginWithRole(role);
    setIsRoleSwitcherOpen(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveTab('login');
    setSelectedEventId(null);
    setSelectedTaskId(null);
    setSelectedTeamId(null);
    setSelectedUserId(null);
    setIsRoleSwitcherOpen(false);
    try {
      localStorage.removeItem('geohub_auth_session');
      sessionStorage.removeItem('geohub_auth_session');
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.location.hash = 'login';
    }
  };

  const registerForEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const isRegistered = ev.registeredUserIds.includes(currentUser.uid);
        const updatedIds = isRegistered
          ? ev.registeredUserIds.filter((id) => id !== currentUser.uid)
          : [...ev.registeredUserIds, currentUser.uid];
        return { ...ev, registeredUserIds: updatedIds };
      })
    );
  };

  const registerStudentForEvent = (eventId: string, studentId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        if (ev.registeredUserIds.includes(studentId)) return ev;
        return { ...ev, registeredUserIds: [...ev.registeredUserIds, studentId] };
      })
    );
  };

  const registerMultipleStudentsForEvent = (eventId: string, studentIds: string[]) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const toAdd = studentIds.filter((id) => !ev.registeredUserIds.includes(id));
        if (toAdd.length === 0) return ev;
        return { ...ev, registeredUserIds: [...ev.registeredUserIds, ...toAdd] };
      })
    );
  };

  const addNewStudentAndRegisterForEvent = (
    studentData: Omit<UserModel, 'uid'>,
    eventId: string
  ): UserModel => {
    const newUid = `u_${Date.now()}`;
    const newStudent: UserModel = {
      ...studentData,
      uid: newUid,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newStudent]);
    if (newStudent.team) {
      setTeams((prev) =>
        prev.map((tm) => {
          if (tm.name.toLowerCase() === newStudent.team?.toLowerCase()) {
            return { ...tm, memberIds: [...tm.memberIds, newUid] };
          }
          return tm;
        })
      );
    }
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return { ...ev, registeredUserIds: [...ev.registeredUserIds, newUid] };
      })
    );
    return newStudent;
  };

  const createEvent = (newEventData: Omit<EventModel, 'id' | 'registeredUserIds' | 'volunteerIds'>) => {
    const newId = `event_${Date.now()}`;
    const newEvent: EventModel = {
      ...newEventData,
      id: newId,
      registeredUserIds: [currentUser.uid],
      volunteerIds: [],
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const updateEvent = (eventId: string, updatedFields: Partial<EventModel>) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, ...updatedFields } : ev))
    );
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus, proofUrl?: string, proofNote?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status,
          proofUrl: proofUrl ?? t.proofUrl,
          proofNote: proofNote ?? t.proofNote,
          completedAt: status === 'done' ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const addTaskComment = (taskId: string, text: string) => {
    const newComment = {
      id: `c_${Date.now()}`,
      authorName: currentUser.name,
      text,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, comments: [...t.comments, newComment] };
      })
    );
  };

  const createTask = (newTaskData: Omit<TaskModel, 'id' | 'createdAt' | 'comments'>) => {
    const newId = `task_${Date.now()}`;
    const newTask: TaskModel = {
      ...newTaskData,
      id: newId,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const approveItem = (id: string) => {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    // Defense in depth: Treasurer cannot approve a request they submitted
    if (item.type === 'budget') {
      const normRole = normalizeRole(currentUser.role);
      if (normRole !== 'faculty') {
        showToast('Permission denied: Only Faculty can approve budget requests.', 'error');
        return;
      }
      if (item.applicantId === currentUser.uid) {
        showToast('Protection Rule: You cannot approve your own budget request.', 'error');
        return;
      }
    }

    setApprovals((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        return {
          ...it,
          status: 'approved',
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser.name,
        };
      })
    );

    addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: item.type === 'budget' ? 'budget_approval' : 'item_approval',
      targetType: item.type,
      targetId: item.id,
      targetName: item.title,
      beforeState: 'pending',
      afterState: 'approved',
      details: `Approved ${item.type}: ${item.title} (${item.subtitle})`,
    });
  };

  const rejectItem = (id: string, reason: string) => {
    const item = approvals.find((a) => a.id === id);
    setApprovals((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        return {
          ...it,
          status: 'rejected',
          rejectionReason: reason,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser.name,
        };
      })
    );

    if (item) {
      addAuditLog({
        actorId: currentUser.uid,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: item.type === 'budget' ? 'budget_rejection' : 'item_rejection',
        targetType: item.type,
        targetId: item.id,
        targetName: item.title,
        beforeState: 'pending',
        afterState: 'rejected',
        details: `Rejected ${item.type}. Reason: ${reason}`,
      });
    }
  };

  const recordAttendance = (eventId: string, studentId: string) => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) {
      return { success: false, message: 'Event not found.' };
    }

    // Layer 3 Verification: Scanner must be explicitly assigned to this event
    const assignedScanners = targetEvent.assignedScannerUserIds || targetEvent.volunteerIds || [];
    if (!canScanForEvent(currentUser.uid, assignedScanners)) {
      return {
        success: false,
        message: 'Permission Denied: You are not assigned as an attendance scanner for this event.',
      };
    }

    const targetUser = users.find((u) => u.uid === studentId);
    if (!targetUser) {
      return { success: false, message: 'Student ID not recognized in club database.' };
    }

    // Check if student is registered for the respective event
    const isRegistered = targetEvent.registeredUserIds.includes(studentId);
    if (!isRegistered) {
      return {
        success: false,
        message: `Registration Required: ${targetUser.name} is NOT registered for "${targetEvent.title}". Only registered students can be marked for attendance.`,
      };
    }

    // Check if already checked in
    const existing = attendance.find((a) => a.eventId === eventId && a.userId === studentId);
    if (existing) {
      return { success: false, message: `Duplicate scan: ${targetUser.name} is already checked in for this event!` };
    }

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      eventId,
      eventTitle: targetEvent.title,
      userId: targetUser.uid,
      userName: targetUser.name,
      userEmail: targetUser.email,
      team: targetUser.team,
      checkInTime: new Date().toISOString(),
      scannedByVolunteerId: currentUser.uid,
      scannedByVolunteerName: currentUser.name,
      status: 'verified',
    };

    setAttendance((prev) => [newRecord, ...prev]);

    addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'attendance_override',
      targetType: 'attendance',
      targetId: newRecord.id,
      targetName: targetUser.name,
      details: `Verified check-in for ${targetUser.name} at "${targetEvent.title}"`,
    });

    return { success: true, message: `Verified! Check-in confirmed for ${targetUser.name}.`, record: newRecord };
  };

  const updateEventStatus = (eventId: string, newStatus: EventStatus) => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return { success: false, message: 'Event not found' };

    const norm = normalizeRole(currentUser.role);
    const currStatus = targetEvent.status;

    // Allowed transition map
    const allowedMap: Record<string, string[]> = {
      draft: ['submitted', 'cancelled'],
      submitted: ['approved', 'cancelled'],
      approved: ['live', 'cancelled'],
      live: ['done', 'completed', 'cancelled'],
      done: ['archived'],
      completed: ['archived'],
      archived: [],
      cancelled: [],
    };

    const allowed = allowedMap[currStatus] || [];
    if (!allowed.includes(newStatus)) {
      showToast(`Invalid transition: Cannot move event from ${currStatus} to ${newStatus}.`, 'error');
      return { success: false, message: `Invalid lifecycle transition from ${currStatus} to ${newStatus}` };
    }

    // Role enforcement per transition
    if (newStatus === 'submitted') {
      if (norm !== 'coordinator' && norm !== 'faculty') {
        showToast('Permission denied: Coordinator role required to submit events.', 'error');
        return { success: false, message: 'Coordinator role required' };
      }
    } else if (newStatus === 'approved') {
      // Coordinator CAN NEVER approve their own events. Only faculty can approve.
      if (norm !== 'faculty') {
        showToast('Permission denied: Faculty role required to approve events. Coordinators cannot approve events.', 'error');
        return { success: false, message: 'Only faculty can approve events' };
      }
    } else if (newStatus === 'archived') {
      // Only faculty can archive events
      if (norm !== 'faculty') {
        showToast('Permission denied: Only faculty can archive events.', 'error');
        return { success: false, message: 'Only faculty can archive events' };
      }
    }

    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, status: newStatus } : ev))
    );

    addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'event_status_change',
      targetType: 'event',
      targetId: eventId,
      targetName: targetEvent.title,
      beforeState: currStatus,
      afterState: newStatus,
      details: `Status transitioned from ${currStatus} to ${newStatus}`,
    });

    showToast(`Event status updated to ${newStatus}.`, 'success');
    return { success: true, message: `Status updated to ${newStatus}` };
  };

  const cancelEvent = (eventId: string, cancellationReason: string) => {
    const cleanReason = (cancellationReason || '').trim();
    if (!cleanReason) {
      showToast('A mandatory non-empty reason is required to cancel an event.', 'error');
      return { success: false, message: 'Mandatory reason required' };
    }
    const norm = normalizeRole(currentUser.role);
    if (norm !== 'faculty' && norm !== 'coordinator') {
      showToast('Permission denied: Faculty or Coordinator role required to cancel events.', 'error');
      return { success: false, message: 'Permission denied' };
    }
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return { success: false, message: 'Event not found' };

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          status: 'cancelled',
          cancellationReason: cleanReason,
        };
      })
    );

    addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'event_cancellation',
      targetType: 'event',
      targetId: eventId,
      targetName: targetEvent.title,
      beforeState: targetEvent.status,
      afterState: 'cancelled',
      details: `Event cancelled. Reason: ${cleanReason}`,
    });

    showToast('Event has been cancelled.', 'info');
    return { success: true, message: 'Event cancelled' };
  };

  const assignEventScanners = (eventId: string, scannerUserIds: string[]) => {
    const norm = normalizeRole(currentUser.role);
    if (norm !== 'faculty' && norm !== 'coordinator') {
      showToast('Permission denied: Only Coordinator or Faculty can assign scanners.', 'error');
      return { success: false, message: 'Permission denied' };
    }
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return { success: false, message: 'Event not found' };

    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, assignedScannerUserIds: scannerUserIds } : ev))
    );

    addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'scanner_assignment_change',
      targetType: 'event',
      targetId: eventId,
      targetName: targetEvent.title,
      details: `Assigned ${scannerUserIds.length} scanners for event attendance`,
    });

    showToast('Event scanners updated successfully.', 'success');
    return { success: true, message: 'Scanners assigned successfully' };
  };

  const updateEventVolunteerWork = (
    eventId: string,
    assignments: VolunteerAssignments,
    workDone?: WorkDoneStatus
  ) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          volunteerAssignments: assignments,
          workDoneStatus: workDone ?? ev.workDoneStatus,
        };
      })
    );
  };

  const completeEventWithData = (eventId: string, completedData: EventCompletedData) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          status: 'completed',
          completedData,
        };
      })
    );
  };

  const addStudentToTeam = (studentData: Omit<UserModel, 'uid'>) => {
    const newUid = `u_${Date.now()}`;
    const newStudent: UserModel = {
      ...studentData,
      uid: newUid,
      role: 'student',
      isVolunteer: false,
      post: studentData.post || 'Student',
      teamRole: studentData.teamRole || 'Student',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newStudent]);
    if (newStudent.team) {
      setTeams((prev) =>
        prev.map((tm) => {
          if (tm.name.toLowerCase() === newStudent.team?.toLowerCase()) {
            return { ...tm, memberIds: [...tm.memberIds, newUid] };
          }
          return tm;
        })
      );
    }
  };

  const changeStudentPost = (
    userId: string,
    newPost: string,
    newRole: UserRole,
    department?: string,
    yearOfStudy?: string,
    tenureEnd?: string
  ) => {
    // Protection Rule 1: No self-escalation
    if (currentUser.uid === userId) {
      showToast('Protection Rule: You cannot modify your own role or posts.', 'error');
      return { success: false, message: 'No self-escalation permitted' };
    }

    // Protection Rule 2: Only faculty can change roles and assign posts
    const normCurrentRole = normalizeRole(currentUser.role);
    if (normCurrentRole !== 'faculty') {
      showToast('Protection Rule: Only Faculty can assign posts or change user roles.', 'error');
      return { success: false, message: 'Only Faculty can assign posts or change user roles' };
    }

    const targetUser = users.find((u) => u.uid === userId);
    if (!targetUser) return { success: false, message: 'User not found' };

    // Protection Rule 3: The last remaining faculty account cannot be removed or demoted
    const normTargetRole = normalizeRole(targetUser.role);
    const normNewRole = normalizeRole(newRole);
    if (normTargetRole === 'faculty' && normNewRole !== 'faculty') {
      const activeFacultyCount = users.filter(
        (u) => normalizeRole(u.role) === 'faculty' && u.status === 'active'
      ).length;
      if (activeFacultyCount <= 1) {
        showToast('Protection Rule: The last remaining Faculty account cannot be removed or demoted.', 'error');
        return { success: false, message: 'Last faculty protection: Demotion rejected' };
      }
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid !== userId) return u;
        return {
          ...u,
          post: newPost,
          teamRole: newPost,
          role: normNewRole,
          department: department || u.department,
          yearOfStudy: yearOfStudy || u.yearOfStudy,
          tenureEnd: tenureEnd || u.tenureEnd,
        };
      })
    );

    addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'role_change',
      targetType: 'user',
      targetId: userId,
      targetName: targetUser.name,
      beforeState: `role=${targetUser.role}, post=${targetUser.post || ''}`,
      afterState: `role=${normNewRole}, post=${newPost}`,
      details: `Faculty assigned post "${newPost}" and role "${normNewRole}" (tenureEnd=${tenureEnd || 'none'})`,
    });

    showToast(`Updated ${targetUser.name}'s role to ${normNewRole} (${newPost}).`, 'success');
    return { success: true, message: 'Role and post updated' };
  };

  const createMeeting = (meetingData: Omit<MeetingModel, 'id' | 'createdAt'>) => {
    const newMeeting: MeetingModel = {
      ...meetingData,
      id: `meet_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMeetings((prev) => [newMeeting, ...prev]);
  };

  const updateMeetingMoM = (
    meetingId: string,
    momNotes: string,
    actionItems: { task: string; assignedTo: string; isDone: boolean }[]
  ) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          momNotes,
          actionItems,
          status: 'completed',
        };
      })
    );
  };

  const addForumMessage = (msgData: {
    channelId: 'announcements' | 'coordination' | 'tech_geo' | 'general';
    title?: string;
    content: string;
  }) => {
    const newMsg: ForumMessage = {
      id: `forum_${Date.now()}`,
      channelId: msgData.channelId,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.teamRole || currentUser.post || (currentUser.role === 'super_admin' ? 'Faculty Advisor' : currentUser.role === 'admin' ? 'President' : 'Member'),
      authorAvatar: currentUser.avatarUrl,
      title: msgData.title,
      content: msgData.content,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: [],
    };
    setForumMessages((prev) => [newMsg, ...prev]);
  };

  const addForumReply = (messageId: string, content: string) => {
    const newReply = {
      id: `rep_${Date.now()}`,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.teamRole || currentUser.post || 'Member',
      authorAvatar: currentUser.avatarUrl,
      content,
      timestamp: new Date().toISOString(),
    };
    setForumMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        return {
          ...m,
          replies: [...(m.replies || []), newReply],
        };
      })
    );
  };

  const likeForumMessage = (messageId: string) => {
    setForumMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const alreadyLiked = m.likedBy?.includes(currentUser.uid);
        const newLikedBy = alreadyLiked
          ? m.likedBy?.filter((id) => id !== currentUser.uid) || []
          : [...(m.likedBy || []), currentUser.uid];
        return {
          ...m,
          likes: Math.max(0, m.likes + (alreadyLiked ? -1 : 1)),
          likedBy: newLikedBy,
        };
      })
    );
  };

  const togglePinForumMessage = (messageId: string) => {
    setForumMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, pinned: !m.pinned } : m))
    );
  };

  const updateBudgetAllocations = (teamName: string, newAllocation: number) => {
    setReport((prev) => ({
      ...prev,
      teamMetrics: prev.teamMetrics.map((tm) =>
        tm.teamName.toLowerCase() === teamName.toLowerCase()
          ? { ...tm, budgetAllocated: newAllocation }
          : tm
      ),
    }));
  };

  const addExpenseItem = (expenseData: Omit<ExpenseItem, 'id' | 'paidBy' | 'status'> & { notes?: string }) => {
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      paidBy: `${currentUser.name} (${currentUser.post || 'Treasurer Lead'})`,
      status: 'approved',
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const updateExpenseItem = (id: string, updates: Partial<ExpenseItem>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteExpenseItem = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addStockItem = (itemData: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = {
      ...itemData,
      id: `stock_${Date.now()}`,
    };
    setStockItems((prev) => [newItem, ...prev]);
  };

  const updateStockItem = (id: string, updates: Partial<StockItem>) => {
    setStockItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteStockItem = (id: string) => {
    setStockItems((prev) => prev.filter((s) => s.id !== id));
  };

  const requestBudgetChange = (teamName: string, requestedAmount: number, reason: string) => {
    const currentAllocation =
      report.teamMetrics.find((tm) => tm.teamName.toLowerCase() === teamName.toLowerCase())
        ?.budgetAllocated || 25000;
    const newReq: BudgetChangeRequest = {
      id: `breq_${Date.now()}`,
      teamName,
      requestedAmount,
      currentAllocation,
      reason,
      requestedBy: `${currentUser.name} (${currentUser.post || 'Treasurer Lead'})`,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    setBudgetRequests((prev) => [newReq, ...prev]);
  };

  const updateUserRoleAndTeam = (uid: string, role: UserRole, team?: string, isVolunteer?: boolean, status?: UserStatus) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid !== uid) return u;
        return {
          ...u,
          role,
          team: team ?? u.team,
          isVolunteer: isVolunteer ?? u.isVolunteer,
          status: status ?? u.status,
        };
      })
    );
  };

  const uploadGalleryItem = (itemData: Omit<GalleryItem, 'id' | 'uploadedAt'>) => {
    const newItem: GalleryItem = {
      ...itemData,
      id: `gal_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setGallery((prev) => [newItem, ...prev]);
  };

  const updateGalleryItem = (id: string, updates: Partial<GalleryItem>) => {
    setGallery((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((item) => item.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const addPost = (postData: Omit<SocialPost, 'id' | 'createdAt'> & { createdAt?: string }) => {
    const newPost: SocialPost = {
      ...postData,
      id: `post_${Date.now()}`,
      createdAt: postData.createdAt || new Date().toISOString(),
      authorName: postData.authorName || `${currentUser.name} (${currentUser.post || 'Promotion Lead'})`,
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (id: string, updates: Partial<SocialPost>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const markPostPublished = (id: string, postUrl?: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Posted',
              publishedDate: new Date().toISOString().split('T')[0],
              postUrl: postUrl || p.postUrl || 'https://instagram.com/geohub_live',
            }
          : p
      )
    );
  };

  const addCampaign = (campaignData: Omit<CampaignPlan, 'id'>) => {
    const newCamp: CampaignPlan = {
      ...campaignData,
      id: `camp_${Date.now()}`,
    };
    setCampaigns((prev) => [newCamp, ...prev]);
  };

  const updateCampaignChecklist = (campaignId: string, itemKey: keyof CampaignChecklist, value: boolean) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              checklist: {
                ...c.checklist,
                [itemKey]: value,
              },
            }
          : c
      )
    );
  };

  const addDailyNews = (itemData: Omit<DailyNewsItem, 'id'>) => {
    const newItem: DailyNewsItem = {
      ...itemData,
      id: `news_${Date.now()}`,
    };
    setDailyNews((prev) => [newItem, ...prev]);
  };

  const updateDailyNews = (id: string, updates: Partial<DailyNewsItem>) => {
    setDailyNews((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  const deleteDailyNews = (id: string) => {
    setDailyNews((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        teams,
        events,
        tasks,
        approvals,
        gallery,
        attendance,
        notifications,
        report,
        meetings,
        memories,
        forumMessages,
        expenses,
        docTemplates,
        isAuthenticated,
        loginWithRole,
        loginWithUser,
        logout,
        activeTab,
        selectedEventId,
        selectedTaskId,
        selectedTeamId,
        selectedUserId,
        isRoleSwitcherOpen,
        isPhoneFrame,
        setCurrentUser,
        switchRole,
        setActiveTab,
        setSelectedEventId,
        setSelectedTaskId,
        setSelectedTeamId,
        setSelectedUserId,
        setIsRoleSwitcherOpen,
        setIsPhoneFrame,
        registerForEvent,
        registerStudentForEvent,
        registerMultipleStudentsForEvent,
        addNewStudentAndRegisterForEvent,
        createEvent,
        cancelEvent,
        updateEventVolunteerWork,
        completeEventWithData,
        updateTaskStatus,
        addTaskComment,
        createTask,
        approveItem,
        rejectItem,
        recordAttendance,
        addStudentToTeam,
        updateUserRoleAndTeam,
        changeStudentPost,
        createMeeting,
        updateMeetingMoM,
        addForumMessage,
        addForumReply,
        likeForumMessage,
        stockItems,
        budgetRequests,
        addExpenseItem,
        updateExpenseItem,
        deleteExpenseItem,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        requestBudgetChange,
        uploadGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updateEvent,
        togglePinForumMessage,
        updateBudgetAllocations,
        posts,
        campaigns,
        dailyNews,
        addPost,
        updatePost,
        deletePost,
        markPostPublished,
        addCampaign,
        updateCampaignChecklist,
        addDailyNews,
        updateDailyNews,
        deleteDailyNews,
        auditLogs,
        addAuditLog,
        updateEventStatus,
        assignEventScanners,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
