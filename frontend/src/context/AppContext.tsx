import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  AttendanceStatus,
} from '../types';
import {
  demoSuperAdmin,
  initialUsers,
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
import { canAccessRoute, canScanForEvent, normalizeRole, getRolePermissions, validateEventOtp, OtpValidationResult } from '../core/permissions';
import { apiClient } from '../api/client';
import { checkForAppUpdate, registerDeviceTelemetry, AppVersionManifest, CheckUpdateResult } from '../core/versionChecker';

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
  isSyncing: boolean;
  syncStatus: 'connected' | 'syncing' | 'offline';
  lastSyncedAt: Date | null;
  isDbConnected: boolean;
  setIsDbConnected: (connected: boolean) => void;
  isBackendActive: boolean;
  setIsBackendActive: (active: boolean) => void;
  platformModules: Record<string, boolean>;
  toggleModule: (moduleId: string, enabled: boolean) => Promise<void>;
  toggleAllModules: (enabled: boolean) => Promise<void>;
  refreshCloudData: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
  toast: { message: string; type?: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Server Diagnostics & Connection Switcher
  isServerModalOpen: boolean;
  setIsServerModalOpen: (open: boolean) => void;
  serverUrl: string;
  setServerUrl: (url: string) => void;
  testServerConnection: () => Promise<{ ok: boolean; latencyMs?: number; message?: string }>;

  // OTA Push Updates
  updateInfo: AppVersionManifest | null;
  isUpdateModalOpen: boolean;
  setIsUpdateModalOpen: (open: boolean) => void;
  isUpdateMandatory: boolean;
  checkForUpdates: (manual?: boolean) => Promise<CheckUpdateResult>;

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
  overrideAttendance: (recordId: string, newStatus: AttendanceStatus, reason: string) => { success: boolean; message: string };
  markAttendanceWithOtp: (params: { eventId: string; studentId: string; otp: string; phase?: 'entry' | 'exit' }) => OtpValidationResult;
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
  enrollScholar: (data: {
    name: string;
    role?: UserRole;
    squad: string;
    post?: string;
    rollNo?: string;
    email?: string;
    department?: string;
    yearOfStudy?: string;
    isLead?: boolean;
  }) => UserModel;
  setUsers: React.Dispatch<React.SetStateAction<UserModel[]>>;
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  setBudgetRequests: React.Dispatch<React.SetStateAction<BudgetChangeRequest[]>>;
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogItem[]>>;
}

export const DEFAULT_PLATFORM_MODULES: Record<string, boolean> = {
  events: true,
  members: true,
  squads: true,
  finance: true,
  qr_attendance: true,
  archives: true,
  campaigns: true,
  forum: true,
  documents: true,
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

function loadPersistedState<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function savePersistedState<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {
    // quota or private mode fallback
  }
}

// Wipe legacy cached data if local storage was created prior to clean slate epoch
try {
  if (typeof window !== 'undefined') {
    const epoch = localStorage.getItem('geohub_db_epoch');
    if (epoch !== '2026-11-18-clean-tidb-sync-v1') {
      localStorage.removeItem('geohub_store_events');
      localStorage.removeItem('geohub_store_tasks');
      localStorage.removeItem('geohub_store_expenses');
      localStorage.removeItem('geohub_store_budgetRequests');
      localStorage.removeItem('geohub_store_auditLogs');
      localStorage.removeItem('geohub_store_users');
      localStorage.removeItem('geohub_store_approvals');
      localStorage.removeItem('geohub_store_attendance');
      localStorage.removeItem('geohub_store_gallery');
      localStorage.removeItem('geohub_store_meetings');
      localStorage.removeItem('geohub_store_notifications');
      // If auth session is for a deleted demo user (not SA01 and not a provisioned user), clear it
      const rawSession = localStorage.getItem('geohub_auth_session') || sessionStorage.getItem('geohub_auth_session');
      if (rawSession) {
        try {
          const s = JSON.parse(rawSession);
          if (s?.user?.rollNo && s.user.rollNo !== 'SA01' && !s.user.rollNo.startsWith('FAC')) {
            localStorage.removeItem('geohub_auth_session');
            sessionStorage.removeItem('geohub_auth_session');
            localStorage.removeItem('geohub_access_token');
          }
        } catch {}
      }
      localStorage.setItem('geohub_db_epoch', '2026-11-18-clean-tidb-sync-v1');
    }
  }
} catch {
  // ignore
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserModel>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('geohub_auth_session') || sessionStorage.getItem('geohub_auth_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.token) {
            apiClient.setToken(parsed.token);
          }
          if (parsed?.user) return parsed.user;
        }
      }
    } catch {
      // ignore
    }
    return demoSuperAdmin;
  });
  const [users, setUsers] = useState<UserModel[]>(() => loadPersistedState('geohub_store_users', initialUsers));
  const [teams, setTeams] = useState<TeamModel[]>(() => loadPersistedState('geohub_store_teams', initialTeams));
  const [events, setEvents] = useState<EventModel[]>(() => loadPersistedState('geohub_store_events', initialEvents));
  const [tasks, setTasks] = useState<TaskModel[]>(() => loadPersistedState('geohub_store_tasks', initialTasks));
  const [approvals, setApprovals] = useState<ApprovalItem[]>(() => loadPersistedState('geohub_store_approvals', initialApprovals));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => loadPersistedState('geohub_store_gallery', initialGallery));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadPersistedState('geohub_store_attendance', initialAttendance));
  const [notifications, setNotifications] = useState<NotificationModel[]>(() => loadPersistedState('geohub_store_notifications', initialNotifications));
  const [report, setReport] = useState<ClubReport>(() => loadPersistedState('geohub_store_report', initialReport));
  const [meetings, setMeetings] = useState<MeetingModel[]>(() => loadPersistedState('geohub_store_meetings', initialMeetings));
  const [memories, setMemories] = useState<MemoryItem[]>(() => loadPersistedState('geohub_store_memories', initialMemories));
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>(() => loadPersistedState('geohub_store_forumMessages', initialForumMessages));
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => loadPersistedState('geohub_store_expenses', initialExpenses));
  const [stockItems, setStockItems] = useState<StockItem[]>(() => loadPersistedState('geohub_store_stockItems', initialStockItems));
  const [budgetRequests, setBudgetRequests] = useState<BudgetChangeRequest[]>(() => loadPersistedState('geohub_store_budgetRequests', initialBudgetRequests));
  const [docTemplates, setDocTemplates] = useState<DocTemplate[]>(() => loadPersistedState('geohub_store_docTemplates', initialDocTemplates));
  const [posts, setPosts] = useState<SocialPost[]>(() => loadPersistedState('geohub_store_posts', initialSocialPosts));
  const [campaigns, setCampaigns] = useState<CampaignPlan[]>(() => loadPersistedState('geohub_store_campaigns', initialCampaignPlans));
  const [dailyNews, setDailyNews] = useState<DailyNewsItem[]>(() => loadPersistedState('geohub_store_dailyNews', initialDailyNews));
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => loadPersistedState('geohub_store_auditLogs', []));

  // Auto-persist reactive states to local storage
  useEffect(() => { savePersistedState('geohub_store_users', users); }, [users]);
  useEffect(() => { savePersistedState('geohub_store_teams', teams); }, [teams]);
  useEffect(() => { savePersistedState('geohub_store_events', events); }, [events]);
  useEffect(() => { savePersistedState('geohub_store_tasks', tasks); }, [tasks]);
  useEffect(() => { savePersistedState('geohub_store_expenses', expenses); }, [expenses]);
  useEffect(() => { savePersistedState('geohub_store_budgetRequests', budgetRequests); }, [budgetRequests]);
  useEffect(() => { savePersistedState('geohub_store_auditLogs', auditLogs); }, [auditLogs]);

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
        const hash = window.location.hash.split('?')[0].replace(/^#\/?/, '').trim();
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

  const showToast = (message: string, type?: 'success' | 'error' | 'info') => {
    const resolvedType =
      type ||
      (message.startsWith('✓') ||
      message.toLowerCase().includes('success') ||
      message.toLowerCase().includes('selected event') ||
      message.toLowerCase().includes('copied') ||
      message.toLowerCase().includes('updated') ||
      message.toLowerCase().includes('assigned') ||
      message.toLowerCase().includes('confirmed')
        ? 'success'
        : message.toLowerCase().includes('error') ||
          message.toLowerCase().includes('denied') ||
          message.toLowerCase().includes('invalid') ||
          message.toLowerCase().includes('expired') ||
          message.toLowerCase().includes('failed') ||
          message.toLowerCase().includes('protection rule')
        ? 'error'
        : 'info');

    setToast({ message, type: resolvedType });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const hideToast = () => {
    setToast(null);
  };

  // OTA Push Update State
  const [updateInfo, setUpdateInfo] = useState<AppVersionManifest | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isUpdateMandatory, setIsUpdateMandatory] = useState<boolean>(false);

  const checkForUpdates = useCallback(
    async (manual: boolean = false): Promise<CheckUpdateResult> => {
      try {
        const result = await checkForAppUpdate();
        if (result.hasUpdate && result.updateInfo) {
          // If the user already dismissed or started installing this version, do not re-prompt automatically on focus/visibility
          const dismissedVer =
            (typeof localStorage !== 'undefined' ? localStorage.getItem('geohub_dismissed_update_version') : null) ||
            (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('geohub_dismissed_update_version') : null);
          if (!manual && dismissedVer === result.updateInfo.version) {
            return result;
          }
          setUpdateInfo(result.updateInfo);
          setIsUpdateMandatory(result.isMandatory);
          setIsUpdateModalOpen(true);
        } else if (manual) {
          showToast(`You are on the latest version (v${result.currentVersion}).`, 'success');
        }
        return result;
      } catch {
        if (manual) {
          showToast('Could not reach the update server. Try again later.', 'error');
        }
        return {
          hasUpdate: false,
          updateInfo: null,
          isMandatory: false,
          currentVersion: '1.5.4',
          latestVersion: '1.5.4',
        };
      }
    },
    []
  );

  // Lifecycle check on app mount, window focus, and visibility resume
  useEffect(() => {
    registerDeviceTelemetry(currentUser?.rollNo || currentUser?.email);

    // Initial check on app startup
    checkForUpdates(false);

    const handleFocus = () => checkForUpdates(false);
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        checkForUpdates(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    if (typeof window !== 'undefined') {
      (window as any).checkAppUpdate = (manual = true) => checkForUpdates(manual);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentUser?.rollNo, currentUser?.email, checkForUpdates]);

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
      const hash = window.location.hash.split('?')[0].replace(/^#\/?/, '').trim();
      const rawPath = window.location.pathname.replace(/^\//, '').trim();

      // Filter out static asset file paths, index.html, etc. inside Android WebView & web
      const isAssetPath =
        !rawPath ||
        rawPath === 'index.html' ||
        rawPath === 'assets/index.html' ||
        rawPath.startsWith('assets') ||
        rawPath.startsWith('android_asset') ||
        rawPath.includes('android_asset') ||
        rawPath.includes('.html') ||
        rawPath.includes('.js') ||
        rawPath.includes('.css');

      const cleanPath = isAssetPath ? '' : rawPath;
      const targetRoute = hash || cleanPath;

      if (!targetRoute) {
        setActiveTabState('home');
        return;
      }

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

  const [platformModules, setPlatformModules] = useState<Record<string, boolean>>(() =>
    loadPersistedState('geohub_platform_modules', DEFAULT_PLATFORM_MODULES)
  );

  useEffect(() => {
    savePersistedState('geohub_platform_modules', platformModules);
  }, [platformModules]);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // DB & Backend Module Connectivity State (Persisted in localStorage)
  const [isDbConnected, setIsDbConnectedState] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const val = localStorage.getItem('geohub_db_connected');
        if (val !== null) return val === 'true';
      }
    } catch {}
    return true;
  });

  const [isBackendActive, setIsBackendActiveState] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const val = localStorage.getItem('geohub_backend_active');
        if (val !== null) return val === 'true';
      }
    } catch {}
    return true;
  });

  const setIsDbConnected = useCallback((connected: boolean) => {
    setIsDbConnectedState(connected);
    try {
      localStorage.setItem('geohub_db_connected', String(connected));
      window.dispatchEvent(new Event('geohub_system_state_change'));
    } catch {}
  }, []);

  const setIsBackendActive = useCallback((active: boolean) => {
    setIsBackendActiveState(active);
    try {
      localStorage.setItem('geohub_backend_active', String(active));
      window.dispatchEvent(new Event('geohub_system_state_change'));
    } catch {}
  }, []);

  useEffect(() => {
    const handleSync = () => {
      try {
        const dbVal = localStorage.getItem('geohub_db_connected');
        if (dbVal !== null) setIsDbConnectedState(dbVal === 'true');
        const beVal = localStorage.getItem('geohub_backend_active');
        if (beVal !== null) setIsBackendActiveState(beVal === 'true');
      } catch {}
    };
    window.addEventListener('geohub_system_state_change', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('geohub_system_state_change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const [isServerModalOpen, setIsServerModalOpen] = useState<boolean>(false);
  const [serverUrl, setServerUrlState] = useState<string>(() => apiClient.getBaseUrl());

  // Live Backend Data Synchronization with TiDB Cloud FastAPI
  const syncWithBackend = useCallback(async () => {
    if (!isBackendActive) {
      setSyncStatus('offline');
      return;
    }
    const token = apiClient.getToken();
    const hasValidToken = Boolean(token && !token.startsWith('geohub_jwt_mock_'));

    setIsSyncing(true);
    setSyncStatus((prev) => (prev === 'connected' ? 'syncing' : prev));
    try {
      // 1. Sync Events (Public)
      const liveEvents = await apiClient.getEvents().catch(() => null);
      if (Array.isArray(liveEvents)) {
        const mappedEvents: EventModel[] = liveEvents.map((e: any): EventModel => ({
          id: e.id,
          title: e.title,
          description: e.description || '',
          category: e.type || 'Academic',
          venue: e.venue || 'Campus Auditorium',
          startDate: e.date_time || new Date().toISOString(),
          endDate: e.date_time || new Date().toISOString(),
          status: e.status || 'approved',
          capacity: 350,
          registeredUserIds: Array.isArray(e.registered_user_ids) ? e.registered_user_ids : [],
          volunteerIds: Array.isArray(e.volunteer_user_ids) ? e.volunteer_user_ids : [],
          assignedScannerUserIds: Array.isArray(e.assigned_scanner_user_ids) ? e.assigned_scanner_user_ids : [],
          posterUrl: e.poster_url || undefined,
          geofenceEnabled: Boolean(e.geofence_enabled),
          geofenceRadiusMeters: e.geofence_radius_meters || 100,
          cancellationReason: e.cancellation_reason || undefined,
          budget: Number(e.budget || 0),
          createdBy: e.created_by || 'SA01',
          attendanceCount: Number(e.attendance_count || 0),
        }));
        setEvents(mappedEvents);
      }

      // 2. Sync Squads & Teams (Public)
      const liveTeams = await apiClient.getTeams().catch(() => null);
      if (Array.isArray(liveTeams)) {
        setTeams((prev) => prev.map((t) => {
          const matched = liveTeams.find((lt: any) => lt.name.toLowerCase() === t.name.toLowerCase() || lt.id === t.id);
          if (!matched) return { ...t, memberIds: [], leadIds: [] };
          return {
            ...t,
            description: matched.description || t.description,
            memberIds: matched.member_user_ids || [],
            leadIds: matched.admin_user_ids || [],
          };
        }));
      }

      // 3. Sync Platform Module Toggles (Public)
      const liveModules = await apiClient.getPlatformModules().catch(() => null);
      if (liveModules && typeof liveModules === 'object' && !Array.isArray(liveModules)) {
        setPlatformModules((prev) => ({ ...prev, ...liveModules }));
      }

      // 4. Sync Users & Official Chapter Roster (Public from TiDB Cloud with Dual Fallback)
      let liveUsers = await apiClient.getUsers().catch(() => null);
      if (!Array.isArray(liveUsers)) {
        liveUsers = await apiClient.getAdminUsers().catch(() => null);
      }
      if (Array.isArray(liveUsers)) {
        const mappedUsers: UserModel[] = liveUsers.map((u: any): UserModel => ({
          uid: u.id,
          rollNo: u.roll_no,
          name: u.name,
          email: u.email,
          role: u.role || 'student',
          post: u.post || undefined,
          department: u.department || 'Geoinformatics Engineering',
          yearOfStudy: u.year_of_study || '3rd Year',
          phone: u.phone || undefined,
          team: u.team || undefined,
          teamRole: u.team_role || undefined,
          isVolunteer: Boolean(u.is_volunteer),
          status: u.status || 'active',
          squadMemberships: u.squad_memberships
            ? (typeof u.squad_memberships === 'string' ? JSON.parse(u.squad_memberships) : u.squad_memberships)
            : [],
        }));
        setUsers(mappedUsers);
      }

      // Authenticated Data Synchronization: Only query if user has an active backend JWT
      if (hasValidToken) {

        // 5. Sync Duty Tasks
        const liveTasks = await apiClient.getTasks('all').catch(() => null);
        if (Array.isArray(liveTasks)) {
          setTasks(liveTasks.map((t: any): TaskModel => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            priority: 'medium',
            status: t.status || 'todo',
            team: t.team_id || 'Management',
            assigneeId: t.assigned_user_ids?.[0] || 'SA01',
            assigneeName: 'Assigned Scholar',
            createdById: t.created_by || 'SA01',
            createdByName: 'Coordinator',
            dueDate: t.deadline || new Date().toISOString(),
            comments: [],
            createdAt: t.created_at || new Date().toISOString(),
            proofUrl: t.proof_urls?.[0],
          })));
        }

        // 6. Sync Treasury Budget Requests
        const liveBudget = await apiClient.getBudgetRequests().catch(() => null);
        if (Array.isArray(liveBudget)) {
          setBudgetRequests(liveBudget.map((b: any): BudgetChangeRequest => ({
            id: b.id,
            teamName: b.team_name,
            requestedAmount: Number(b.requested_amount || 0),
            currentAllocation: Number(b.current_allocation || 0),
            reason: b.reason,
            requestedBy: b.requested_by,
            requestedAt: b.created_at || new Date().toISOString(),
            status: b.status || 'pending',
          })));
        }

        // 7. Sync Official Financial Ledger Expenses
        const liveExpenses = await apiClient.getExpenses().catch(() => null);
        if (Array.isArray(liveExpenses)) {
          setExpenses(liveExpenses.map((exp: any): ExpenseItem => ({
            id: exp.id,
            title: exp.title,
            amount: Number(exp.amount || 0),
            category: exp.category,
            buyingDate: exp.date || exp.created_at || new Date().toISOString(),
            eventTitle: exp.event_title || 'General Operations',
            vendorName: 'Official Vendor',
            paidBy: exp.logged_by || 'Treasurer Lead',
            approvedBy: 'Faculty Advisor',
            receiptUrl: exp.receipt_url,
            status: 'approved',
          })));
        }

        // 8. Sync Governance Audit Logs
        const liveAudits = await apiClient.getAuditLogs().catch(() => null);
        if (Array.isArray(liveAudits)) {
          setAuditLogs(liveAudits.map((a: any): AuditLogItem => ({
            id: a.id,
            actorId: a.actor_id,
            actorName: a.actor_name,
            action: a.action,
            targetType: a.target_type,
            targetId: a.target_id,
            targetName: a.target_name,
            details: a.details,
            timestamp: a.timestamp || new Date().toISOString(),
          })));
        }

        // 9. Sync Meetings & MoM
        const liveMeetings = await apiClient.getMeetings().catch(() => null);
        if (Array.isArray(liveMeetings)) {
          setMeetings(liveMeetings.map((m: any): MeetingModel => ({
            id: m.id,
            title: m.title,
            type: m.type || 'general',
            eventId: m.event_id,
            eventTitle: m.event_title,
            dateTime: m.date_time || new Date().toISOString(),
            venue: m.venue || 'Campus Auditorium',
            organizerName: m.organizer_name || 'Coordinator',
            attendeeIds: Array.isArray(m.attendee_ids) ? m.attendee_ids : [],
            agenda: m.agenda || '',
            momNotes: m.mom_notes,
            actionItems: Array.isArray(m.action_items) ? m.action_items : [],
            status: m.status || 'scheduled',
            createdAt: m.created_at || new Date().toISOString(),
          })));
        }

        // 10. Sync Campus Forum Messages
        const liveForum = await apiClient.getForumMessages().catch(() => null);
        if (Array.isArray(liveForum)) {
          setForumMessages(liveForum.map((fm: any): ForumMessage => ({
            id: fm.id,
            channelId: fm.channel_id,
            authorId: fm.author_id,
            authorName: fm.author_name,
            authorRole: fm.author_role,
            authorAvatar: fm.author_avatar,
            title: fm.title,
            content: fm.content,
            timestamp: fm.timestamp,
            likes: Number(fm.likes || 0),
            likedBy: Array.isArray(fm.liked_by) ? fm.liked_by : [],
            pinned: Boolean(fm.pinned),
            replies: Array.isArray(fm.replies) ? fm.replies : [],
          })));
        }

        // 11. Sync Inventory & Stock
        const liveStock = await apiClient.getStockItems().catch(() => null);
        if (Array.isArray(liveStock)) {
          setStockItems(liveStock.map((s: any): StockItem => ({
            id: s.id,
            name: s.name,
            category: s.category || 'Logistics',
            quantity: Number(s.quantity || 0),
            unit: s.unit || 'pcs',
            minThreshold: Number(s.min_threshold || 5),
            unitCost: Number(s.unit_cost || 0),
            lastRestocked: s.last_restocked || '',
            location: s.location || 'Main Store',
            status: s.status || 'in_stock',
          })));
        }

        // 12. Sync Media & Gallery
        const liveGallery = await apiClient.getGalleryItems().catch(() => null);
        if (Array.isArray(liveGallery)) {
          setGallery(liveGallery.map((g: any): GalleryItem => ({
            id: g.id,
            title: g.title,
            eventId: g.event_id || '',
            eventTitle: g.event_title || '',
            academicYear: g.academic_year || '2025-26',
            category: g.category || 'photos',
            url: g.url,
            thumbnailUrl: g.thumbnail_url,
            uploadedByName: g.uploaded_by_name || 'Documentation Lead',
            uploadedAt: g.uploaded_at || new Date().toISOString(),
            fileSizeBytes: g.file_size_bytes,
            caption: g.caption,
          })));
        }

        // 13. Sync Notifications & Campus Broadcasts
        const liveNotifs = await apiClient.getNotifications().catch(() => null);
        if (Array.isArray(liveNotifs)) {
          setNotifications(liveNotifs.map((n: any): NotificationModel => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: (n.type as any) || 'info',
            timestamp: n.created_at || new Date().toISOString(),
            isRead: Boolean(n.is_read),
          })));
        }

        // 14. Sync Chapter Campaigns
        const liveCampaigns = await apiClient.getCampaigns().catch(() => null);
        if (Array.isArray(liveCampaigns) && liveCampaigns.length > 0) {
          setCampaigns(liveCampaigns.map((c: any): CampaignPlan => ({
            id: c.id,
            title: c.title,
            eventId: '',
            eventTitle: '',
            startDate: c.start_date,
            endDate: c.end_date,
            targetAudience: c.target_audience || 'General Campus',
            status: c.status || 'planning',
            checklist: typeof c.checklist === 'string' ? JSON.parse(c.checklist) : (c.checklist || {}),
          })));
        }

        // 15. Sync Social Media Posts
        const livePosts = await apiClient.getPosts().catch(() => null);
        if (Array.isArray(livePosts) && livePosts.length > 0) {
          setPosts(livePosts.map((p: any): SocialPost => ({
            id: p.id,
            platform: (p.platform as any) || 'all',
            status: (p.status as any) || 'draft',
            caption: p.content || p.title,
            scheduledDate: p.scheduled_for,
            publishedDate: p.published_at,
            hashtags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? JSON.parse(p.tags) : []),
            authorName: p.author_name,
            mediaUrl: p.image_url,
            createdAt: p.created_at || new Date().toISOString(),
          })));
        }

        // 16. Sync Daily News Bulletin
        const liveNews = await apiClient.getDailyNews().catch(() => null);
        if (Array.isArray(liveNews) && liveNews.length > 0) {
          setDailyNews(liveNews.map((dn: any): DailyNewsItem => ({
            id: dn.id,
            title: dn.title,
            content: dn.content,
            date: dn.published_at || new Date().toISOString().split('T')[0],
            publishedAt: dn.published_at,
            category: dn.category || 'announcement',
            author: dn.author_name || 'System SuperAdmin',
            authorName: dn.author_name,
            hashtags: Array.isArray(dn.tags) ? dn.tags : (typeof dn.tags === 'string' ? JSON.parse(dn.tags) : []),
            status: 'published',
          })));
        }
      }

        setSyncStatus('connected');
        setLastSyncedAt(new Date());
      } catch {
        // Resilient fallback keeps local cache when server is starting up or offline
        setSyncStatus('offline');
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  const refreshCloudData = useCallback(async () => {
    await syncWithBackend();
    showToast('✓ Synchronized with cloud server', 'success');
  }, [syncWithBackend, showToast]);

  const setServerUrl = useCallback((newUrl: string) => {
    apiClient.setBaseUrl(newUrl);
    setServerUrlState(apiClient.getBaseUrl());
    syncWithBackend();
    showToast('Server connection URL updated', 'info');
  }, [syncWithBackend, showToast]);

  const testServerConnection = useCallback(async () => {
    return await apiClient.testServerHealth();
  }, []);

  // Listen to cross-module data refresh events (e.g. from SuperAdmin operations portal)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleDataRefresh = () => {
      syncWithBackend();
    };
    window.addEventListener('geohub_refresh_data', handleDataRefresh);
    return () => {
      window.removeEventListener('geohub_refresh_data', handleDataRefresh);
    };
  }, [syncWithBackend]);

  // 1. Real-Time Multi-Device SSE Event Stream
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let unsubscribe: (() => void) | null = null;
    let reconnectTimeout: any = null;
    let isMounted = true;

    const connectSSE = () => {
      try {
        unsubscribe = apiClient.subscribeToSyncStream(
          (payload) => {
            if (!isMounted) return;
            const { type, data } = payload;

            if (type === 'SYNC_CONNECTED') {
              setSyncStatus('connected');
              setLastSyncedAt(new Date());
              return;
            }

            if (type === 'PLATFORM_PURGED') {
              try {
                localStorage.removeItem('geohub_store_events');
                localStorage.removeItem('geohub_store_tasks');
                localStorage.removeItem('geohub_store_expenses');
                localStorage.removeItem('geohub_store_budgetRequests');
                localStorage.removeItem('geohub_store_auditLogs');
              } catch {}
              setEvents([]);
              setTasks([]);
              setExpenses([]);
              setBudgetRequests([]);
              setAuditLogs([]);
              syncWithBackend();
              showToast('Platform clean slate synchronized across devices', 'info');
              return;
            }

            if (type === 'EVENT_CREATED' && data?.title) {
              showToast(`✓ New event synchronized: ${data.title}`, 'info');
            } else if (type === 'EVENT_DELETED' && data?.id) {
              setEvents((prev) => prev.filter((ev) => ev.id !== data.id));
              showToast('Event removed by administrator', 'info');
            } else if (type === 'EVENT_CANCELLED' && data?.title) {
              showToast(`Event cancelled: ${data.title}`, 'info');
            } else if (type === 'MEMBER_ENROLLED' && data?.name) {
              showToast(`✓ New scholar enrolled: ${data.name}`, 'info');
            } else if (type === 'FACULTY_PROVISIONED' && data?.name) {
              showToast(`✓ Faculty Advisor provisioned: ${data.name}`, 'info');
            } else if (type === 'FACULTY_DELETED') {
              showToast('Faculty account updated', 'info');
            } else if (type === 'MODULE_STATUS_CHANGED' && data) {
              setPlatformModules((prev) => ({ ...prev, ...data }));
              showToast('Platform module configuration updated', 'info');
            } else if (type === 'CAMPUS_BROADCAST' && data?.title) {
              showToast(`🔔 Campus Alert: ${data.title}`, 'info');
            } else if (type === 'POST_CREATED' || type === 'POST_UPDATED') {
              showToast('✓ Media studio updated', 'info');
            } else if (type === 'CAMPAIGN_UPDATED' || type === 'DOCUMENT_UPLOADED') {
              showToast('✓ Chapter records updated', 'info');
            } else if (type === 'MEMBER_CLEARANCE_UPDATED') {
              showToast('Member permissions updated', 'info');
            }

            // Always synchronize latest full authoritative state from backend
            syncWithBackend();
            setLastSyncedAt(new Date());
            setSyncStatus('connected');
          },
          () => {
            if (!isMounted) return;
            setSyncStatus('offline');
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(connectSSE, 5000);
          }
        );
        setSyncStatus('connected');
      } catch {
        if (isMounted) {
          setSyncStatus('offline');
          reconnectTimeout = setTimeout(connectSSE, 6000);
        }
      }
    };

    connectSSE();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (unsubscribe) unsubscribe();
    };
  }, [syncWithBackend, showToast]);

  // 2. Adaptive Polling & On-Focus Lifecycle Synchronization
  useEffect(() => {
    syncWithBackend();

    // Fast foreground polling every 8s when active
    const pollInterval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        syncWithBackend();
      }
    }, 8000);

    // On-focus & visibility change: immediately pull updates when user unlocks phone or switches back
    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncWithBackend();
      }
    };

    const handleOnline = () => {
      syncWithBackend();
      setSyncStatus('connected');
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncWithBackend]);

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
    setUsers((prev) => (prev.some((u) => u.uid === user.uid) ? prev : [user, ...prev]));
    
    // Ensure auth session is safely mirrored in localStorage
    try {
      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem('geohub_auth_session');
        if (!existing) {
          localStorage.setItem('geohub_auth_session', JSON.stringify({
            user,
            token: apiClient.getToken() || `geohub_jwt_token_${user.uid}`,
            rememberMe: true,
            createdAt: Date.now(),
          }));
        }
      }
    } catch {
      // ignore
    }

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
    const norm = normalizeRole(role);
    if (norm === 'super_admin') {
      loginWithUser(demoSuperAdmin);
      return;
    }
    const existing = users.find((u) => normalizeRole(u.role) === norm && u.status === 'active');
    if (existing) {
      loginWithUser(existing);
    } else {
      loginWithUser(demoSuperAdmin);
    }
  };

  const switchRole = (role: UserRole | string) => {
    loginWithRole(role);
    setIsRoleSwitcherOpen(false);
  };

  const toggleModule = useCallback(
    async (moduleId: string, enabled: boolean) => {
      const updated = { ...platformModules, [moduleId]: enabled };
      setPlatformModules(updated);
      try {
        await apiClient.updatePlatformModules({ [moduleId]: enabled });
        showToast(`Module "${moduleId}" is now ${enabled ? 'ACTIVE' : 'PAUSED'}`, 'info');
      } catch (err: any) {
        showToast(err?.message || 'Failed to update module state', 'error');
      }
    },
    [platformModules, showToast]
  );

  const toggleAllModules = useCallback(
    async (enabled: boolean) => {
      const updated: Record<string, boolean> = {};
      Object.keys(platformModules).forEach((k) => {
        updated[k] = enabled;
      });
      setPlatformModules(updated);
      try {
        await apiClient.updatePlatformModules(updated);
        showToast(`All platform modules set to ${enabled ? 'ACTIVE' : 'PAUSED'}`, 'info');
      } catch (err: any) {
        showToast(err?.message || 'Failed to update modules', 'error');
      }
    },
    [platformModules, showToast]
  );

  const logout = () => {
    try {
      localStorage.removeItem('geohub_auth_session');
      sessionStorage.removeItem('geohub_auth_session');
    } catch {
      // ignore
    }
    apiClient.setToken(null);
    setIsAuthenticated(false);
    setCurrentUser(demoSuperAdmin);
    setActiveTabState('login');
    setSelectedEventId(null);
    setSelectedTaskId(null);
    setSelectedTeamId(null);
    setSelectedUserId(null);
    setIsRoleSwitcherOpen(false);
    if (typeof window !== 'undefined') {
      window.location.hash = 'login';
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleSessionExpired = (e: any) => {
      logout();
      showToast(e?.detail?.reason || 'Signed out by admin');
    };
    window.addEventListener('geohub:session-expired', handleSessionExpired);
    return () => window.removeEventListener('geohub:session-expired', handleSessionExpired);
  }, []);

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
    apiClient.registerForEvent(eventId).catch((err: any) => {
      console.warn('[Event Register] Cloud server unreachable, saved locally:', err?.message);
    });
  };

  const registerStudentForEvent = (eventId: string, studentId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        if (ev.registeredUserIds.includes(studentId)) return ev;
        return { ...ev, registeredUserIds: [...ev.registeredUserIds, studentId] };
      })
    );
    apiClient.registerForEvent(eventId).catch((err: any) => {
      console.warn('[Event Register] Cloud server unreachable, saved locally:', err?.message);
    });
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

    // Sync student enrollment with TiDB Cloud
    apiClient.enrollUser({
      name: studentData.name,
      roll_no: studentData.rollNo || `21GEO${Date.now().toString().slice(-4)}`,
      email: studentData.email || `scholar_${Date.now()}@college.edu`,
      role: studentData.role || 'student',
      department: studentData.department,
      team: studentData.team,
      team_role: studentData.teamRole,
    }).catch(() => {});

    return newStudent;
  };

  const createEvent = async (newEventData: Omit<EventModel, 'id' | 'registeredUserIds' | 'volunteerIds'>) => {
    const tempId = `event_${Date.now()}`;
    const newEvent: EventModel = {
      ...newEventData,
      id: tempId,
      registeredUserIds: [currentUser.uid],
      volunteerIds: [],
    };
    setEvents((prev) => [newEvent, ...prev]);

    try {
      let resolvedDateTime = newEventData.startDate;
      if (resolvedDateTime && !resolvedDateTime.includes('T')) {
        resolvedDateTime = `${resolvedDateTime}T10:00:00Z`;
      }
      if (!resolvedDateTime) {
        resolvedDateTime = new Date().toISOString();
      }

      const serverEvent = await apiClient.createEvent({
        title: newEventData.title,
        type: newEventData.category,
        date_time: resolvedDateTime,
        venue: newEventData.venue,
        description: newEventData.description,
        budget: newEventData.budget || 0,
        academic_year: '2026-2027',
        volunteer_user_ids: [],
        status: newEventData.status || 'approved',
      });

      if (serverEvent && serverEvent.id) {
        setEvents((prev) =>
          prev.map((ev) => (ev.id === tempId ? { ...ev, id: serverEvent.id } : ev))
        );
        showToast('✓ Event created and synchronized to cloud!', 'success');
      } else {
        showToast('✓ Event created.', 'success');
      }
    } catch (err: any) {
      console.warn('[Event Sync] Cloud server unreachable, saved locally:', err?.message);
      showToast('Event saved on this phone. Cloud sync pending.', 'info');
    }
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

    // Sync task status update to TiDB Cloud
    apiClient.updateTaskStatus(taskId, status).catch(() => {});
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

    // Persist task to TiDB Cloud backend
    apiClient.createTask({
      title: newTaskData.title,
      description: newTaskData.description,
      team_id: newTaskData.team,
      assigned_user_ids: newTaskData.assigneeId ? [newTaskData.assigneeId] : [],
      deadline: newTaskData.dueDate,
      status: newTaskData.status || 'todo',
    }).then((created) => {
      if (created && created.id) {
        setTasks((prev) => prev.map((t) => (t.id === newId ? { ...t, id: created.id } : t)));
      }
    }).catch((err: any) => {
      console.warn('[Task Sync] Cloud server unreachable, saved locally:', err?.message);
    });
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

      // Persist budget approval in TiDB Cloud
      apiClient.approveBudgetRequest(item.id).catch(() => {});
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

  const overrideAttendance = (
    recordId: string,
    newStatus: AttendanceStatus,
    reason: string
  ): { success: boolean; message: string } => {
    const cleanReason = (reason || '').trim();
    if (!cleanReason) {
      showToast('A mandatory reason is required for manual override.', 'error');
      return { success: false, message: 'Mandatory reason required' };
    }
    const perms = getRolePermissions(currentUser.role);
    if (!perms.canOverrideAttendance) {
      showToast('Permission denied: Faculty or Coordinator role required.', 'error');
      return { success: false, message: 'Permission denied' };
    }

    setAttendance((prev) =>
      prev.map((rec) => {
        if (rec.id !== recordId) return rec;
        return {
          ...rec,
          status: newStatus,
          overrideReason: cleanReason,
          overriddenBy: currentUser.name,
        };
      })
    );

    addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'attendance_override',
      targetType: 'attendance',
      targetId: recordId,
      targetName: `Attendance Override (${newStatus})`,
      details: `Status set to ${newStatus}. Reason: ${cleanReason}`,
    });

    showToast(`✓ Attendance marked as ${newStatus}`);
    return { success: true, message: 'Updated' };
  };

  const markAttendanceWithOtp = (params: {
    eventId: string;
    studentId: string;
    otp: string;
    phase?: 'entry' | 'exit';
  }): OtpValidationResult => {
    const targetEvent = events.find((e) => e.id === params.eventId);
    if (!targetEvent) {
      return { valid: false, status: 'Not marked', error: 'Event not found', code: 'invalid_or_expired' };
    }
    const targetUser = users.find((u) => u.uid === params.studentId || u.rollNo === params.studentId);
    if (!targetUser) {
      return { valid: false, status: 'Not marked', error: 'Student not found in club directory', code: 'not_authorized' };
    }
    const existingRec = attendance.find((a) => a.eventId === params.eventId && a.userId === targetUser.uid);
    const result = validateEventOtp({
      event: targetEvent,
      userId: targetUser.uid,
      otp: params.otp,
      phase: params.phase,
      currentAttendance: existingRec,
      scannerUserId: currentUser.uid,
    });

    if (result.valid) {
      if (existingRec) {
        setAttendance((prev) =>
          prev.map((a) => {
            if (a.id !== existingRec.id) return a;
            return {
              ...a,
              status: result.status,
              ...(params.phase === 'exit' ? { exitTime: new Date().toISOString() } : { entryTime: new Date().toISOString() }),
            };
          })
        );
      } else {
        const newRec: AttendanceRecord = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          eventId: targetEvent.id,
          eventTitle: targetEvent.title,
          userId: targetUser.uid,
          userName: targetUser.name,
          userEmail: targetUser.email,
          team: targetUser.team,
          checkInTime: new Date().toISOString(),
          entryTime: new Date().toISOString(),
          scannedByVolunteerId: currentUser.uid,
          scannedByVolunteerName: currentUser.name,
          status: result.status,
        };
        setAttendance((prev) => [newRec, ...prev]);
      }
    }
    return result;
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

    // Sync event lifecycle status with TiDB Cloud
    apiClient.updateEventStatus(eventId, newStatus).catch(() => {});

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
    if (norm !== 'faculty' && norm !== 'coordinator' && norm !== 'super_admin') {
      showToast('Permission denied: Faculty, Coordinator, or SuperAdmin role required to cancel events.', 'error');
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

    apiClient.cancelEvent(eventId, cleanReason).catch((err: any) => {
      console.warn('[Event Cancel] Cloud server unreachable, updated locally:', err?.message);
    });

    showToast('Event has been cancelled.', 'info');
    return { success: true, message: 'Event cancelled' };
  };

  const assignEventScanners = (eventId: string, scannerUserIds: string[]) => {
    const norm = normalizeRole(currentUser.role);
    if (norm !== 'faculty' && norm !== 'coordinator' && norm !== 'management' && norm !== 'super_admin') {
      showToast('Permission denied: Management, Coordinator, Faculty, or SuperAdmin role required.', 'error');
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

    apiClient.assignEventScanners(eventId, scannerUserIds).catch((err: any) => {
      console.warn('[Scanner Assign] Cloud server unreachable, saved locally:', err?.message);
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
    const cleanRollNo = studentData.rollNo ? studentData.rollNo.trim().toUpperCase() : `24GEO${Math.floor(100 + Math.random() * 900)}`;
    const cleanEmail = studentData.email?.trim() || `${cleanRollNo.toLowerCase()}@geohub.edu`;
    const cleanName = studentData.name.trim();
    const tempUid = `u_${Date.now()}`;

    const newStudent: UserModel = {
      ...studentData,
      uid: tempUid,
      rollNo: cleanRollNo,
      name: cleanName,
      email: cleanEmail,
      role: 'student',
      isVolunteer: false,
      post: studentData.post || 'Student Member',
      teamRole: studentData.teamRole || 'Student',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => {
      const filtered = prev.filter((u) => u.rollNo !== cleanRollNo);
      return [...filtered, newStudent];
    });

    if (newStudent.team) {
      setTeams((prev) =>
        prev.map((tm) => {
          if (tm.name.toLowerCase() === newStudent.team?.toLowerCase()) {
            return { ...tm, memberIds: [...new Set([...tm.memberIds, tempUid])] };
          }
          return tm;
        })
      );
    }

    addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.name,
      action: 'student_added',
      targetType: 'user',
      targetId: tempUid,
      targetName: newStudent.name,
      details: `Added student ${newStudent.name} (${cleanRollNo}) with default credentials (password: geohub)`,
    });

    // Direct asynchronous TiDB Cloud persistence with cross-device sync broadcast
    apiClient
      .enrollUser({
        name: cleanName,
        roll_no: cleanRollNo,
        email: cleanEmail,
        role: 'student',
        team: newStudent.team || 'General',
        post: newStudent.post,
        department: newStudent.department || 'Geoinformatics Engineering',
        year_of_study: newStudent.yearOfStudy || '1st Year',
        password: 'geohub',
      })
      .then((res) => {
        if (res?.id) {
          setUsers((prev) =>
            prev.map((u) => (u.rollNo === cleanRollNo ? { ...u, uid: res.id, createdAt: res.created_at || u.createdAt } : u))
          );
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('geohub_refresh_data'));
        }
      })
      .catch((err) => {
        console.warn('[AppContext] Could not persist student to TiDB Cloud:', err?.message);
      });
  };

  const enrollScholar = (data: {
    name: string;
    role?: UserRole;
    squad: string;
    post?: string;
    rollNo?: string;
    email?: string;
    department?: string;
    yearOfStudy?: string;
    isLead?: boolean;
  }): UserModel => {
    const cleanName = data.name.trim();
    const cleanSquad = data.squad.trim();
    const newUid = `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanRollNo = data.rollNo?.trim() || `24GEO${Math.floor(100 + Math.random() * 900)}`;
    const cleanEmail =
      data.email?.trim() || `${cleanName.toLowerCase().replace(/\s+/g, '.')}@geohub.edu`;

    const newScholar: UserModel = {
      uid: newUid,
      name: cleanName,
      role: data.role || 'student',
      post: data.post || (data.isLead ? `${cleanSquad} Lead` : `${cleanSquad} Associate`),
      team: cleanSquad,
      teamRole: data.isLead ? `${cleanSquad} Lead` : `${cleanSquad} Associate`,
      rollNo: cleanRollNo,
      email: cleanEmail,
      department: data.department || 'Geoinformatics Engineering',
      yearOfStudy: data.yearOfStudy || '2nd Year',
      isVolunteer: true,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newScholar, ...prev]);

    if (cleanSquad) {
      setTeams((prev) =>
        prev.map((tm) => {
          if (tm.name.toLowerCase() === cleanSquad.toLowerCase()) {
            return { ...tm, memberIds: [...new Set([...tm.memberIds, newUid])] };
          }
          return tm;
        })
      );
    }

    addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.name,
      action: 'scholar_enrolled',
      targetType: 'user',
      targetId: newUid,
      targetName: cleanName,
      details: `Enrolled ${cleanName} (${cleanRollNo}) into ${cleanSquad} squad as ${newScholar.post}`,
    });

    apiClient.enrollUser({
      name: cleanName,
      roll_no: cleanRollNo,
      email: cleanEmail,
      role: newScholar.role,
      team: cleanSquad,
      post: newScholar.post,
      department: newScholar.department,
      year_of_study: newScholar.yearOfStudy,
      password: 'geohub',
    }).then(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('geohub_refresh_data'));
      }
    }).catch(() => {});

    return newScholar;
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

    apiClient
      .updateAdminUser(userId, {
        role: normNewRole,
        post: newPost,
        team_role: newPost,
        department: department || targetUser.department,
        year_of_study: yearOfStudy || targetUser.yearOfStudy,
      })
      .then(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('geohub_refresh_data'));
        }
      })
      .catch(() => {});

    return { success: true, message: 'Role and post updated' };
  };

  const createMeeting = (meetingData: Omit<MeetingModel, 'id' | 'createdAt'>) => {
    const tempId = `meet_${Date.now()}`;
    const newMeeting: MeetingModel = {
      ...meetingData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };
    setMeetings((prev) => [newMeeting, ...prev]);

    apiClient.createMeeting({
      title: meetingData.title,
      type: meetingData.type,
      event_id: meetingData.eventId,
      event_title: meetingData.eventTitle,
      date_time: meetingData.dateTime,
      venue: meetingData.venue,
      organizer_name: meetingData.organizerName,
      attendee_ids: meetingData.attendeeIds || [],
      agenda: meetingData.agenda || '',
    }).then((created) => {
      if (created && created.id) {
        setMeetings((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: created.id } : m)));
      }
    }).catch((err: any) => {
      console.warn('[Meeting Sync] Cloud server unreachable, saved locally:', err?.message);
    });
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

    apiClient.updateMeetingMoM(meetingId, momNotes, actionItems).catch((err: any) => {
      console.warn('[Meeting MoM Sync] Cloud server unreachable, saved locally:', err?.message);
    });
  };

  const addForumMessage = (msgData: {
    channelId: 'announcements' | 'coordination' | 'tech_geo' | 'general';
    title?: string;
    content: string;
  }) => {
    const tempId = `forum_${Date.now()}`;
    const newMsg: ForumMessage = {
      id: tempId,
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

    apiClient.createForumMessage(msgData.channelId, msgData.content, msgData.title).then((created) => {
      if (created && created.id) {
        setForumMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: created.id } : m)));
      }
    }).catch((err: any) => {
      console.warn('[Forum Sync] Cloud server unreachable, saved locally:', err?.message);
    });
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
    apiClient.toggleLikeForumMessage(messageId).catch((err: any) => {
      console.warn('[Forum Like Sync] Cloud server unreachable:', err?.message);
    });
  };

  const togglePinForumMessage = (messageId: string) => {
    setForumMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, pinned: !m.pinned } : m))
    );
    apiClient.togglePinForumMessage(messageId).catch((err: any) => {
      console.warn('[Forum Pin Sync] Cloud server unreachable:', err?.message);
    });
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
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      paidBy: `${currentUser.name} (${currentUser.post || 'Treasurer Lead'})`,
      status: 'approved',
    };
    setExpenses((prev) => [newExpense, ...prev]);

    addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.name,
      action: 'expense_logged',
      targetType: 'expense',
      targetId: newExpense.id,
      targetName: newExpense.title,
      details: `Logged expenditure of ₹${newExpense.amount.toLocaleString('en-IN')} for ${newExpense.title} (${newExpense.category})`,
    });

    apiClient.createExpense({
      title: newExpense.title,
      amount: newExpense.amount,
      category: newExpense.category,
      event_title: newExpense.eventTitle || 'General Club Operations',
      receipt_url: newExpense.receiptUrl,
    }).then((created) => {
      if (created && created.id) {
        setExpenses((prev) => prev.map((e) => (e.id === newExpense.id ? { ...e, id: created.id } : e)));
      }
    }).catch((err: any) => {
      console.warn('[Expense Sync] Cloud server unreachable, saved locally:', err?.message);
    });
  };

  const updateExpenseItem = (id: string, updates: Partial<ExpenseItem>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    apiClient.updateExpense(id, updates).catch((err: any) => {
      console.warn('[Expense Update Sync] Cloud server unreachable:', err?.message);
    });
  };

  const deleteExpenseItem = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    apiClient.deleteExpense(id).catch((err: any) => {
      console.warn('[Expense Delete Sync] Cloud server unreachable:', err?.message);
    });
  };

  const addStockItem = (itemData: Omit<StockItem, 'id'>) => {
    const tempId = `stock_${Date.now()}`;
    const newItem: StockItem = {
      ...itemData,
      id: tempId,
    };
    setStockItems((prev) => [newItem, ...prev]);

    apiClient.createStockItem({
      name: itemData.name,
      category: itemData.category,
      quantity: itemData.quantity,
      unit: itemData.unit,
      min_threshold: itemData.minThreshold,
      unit_cost: itemData.unitCost,
      last_restocked: itemData.lastRestocked,
      location: itemData.location,
      status: itemData.status,
    }).then((created) => {
      if (created && created.id) {
        setStockItems((prev) => prev.map((s) => (s.id === tempId ? { ...s, id: created.id } : s)));
      }
    }).catch((err: any) => {
      console.warn('[Stock Sync] Cloud server unreachable, saved locally:', err?.message);
    });
  };

  const updateStockItem = (id: string, updates: Partial<StockItem>) => {
    setStockItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );

    apiClient.updateStockItem(id, {
      name: updates.name,
      category: updates.category,
      quantity: updates.quantity,
      unit: updates.unit,
      min_threshold: updates.minThreshold,
      unit_cost: updates.unitCost,
      last_restocked: updates.lastRestocked,
      location: updates.location,
      status: updates.status,
    }).catch((err: any) => {
      console.warn('[Stock Update Sync] Cloud server unreachable, saved locally:', err?.message);
    });
  };

  const deleteStockItem = (id: string) => {
    setStockItems((prev) => prev.filter((s) => s.id !== id));
    apiClient.deleteStockItem(id).catch((err: any) => {
      console.warn('[Stock Delete Sync] Cloud server unreachable, saved locally:', err?.message);
    });
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

    addAuditLog({
      actorId: currentUser.uid,
      actorName: currentUser.name,
      action: 'budget_requested',
      targetType: 'budget_request',
      targetId: newReq.id,
      targetName: `${teamName} Budget Petition`,
      details: `Requested ₹${requestedAmount.toLocaleString('en-IN')} for ${teamName}: ${reason}`,
    });

    // Persist budget request to TiDB Cloud backend
    apiClient.submitBudgetRequest(teamName, requestedAmount, reason).then((created) => {
      if (created && created.id) {
        setBudgetRequests((prev) => prev.map((b) => (b.id === newReq.id ? { ...b, id: created.id } : b)));
      }
    }).catch((err: any) => {
      console.warn('[Budget Sync] Cloud server unreachable, saved locally:', err?.message);
    });
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

    apiClient.updateAdminUser(uid, {
      role,
      team,
      is_volunteer: isVolunteer,
      status: status || 'active',
    }).catch(() => {});
  };

  const uploadGalleryItem = (itemData: Omit<GalleryItem, 'id' | 'uploadedAt'>) => {
    const tempId = `gal_${Date.now()}`;
    const newItem: GalleryItem = {
      ...itemData,
      id: tempId,
      uploadedAt: new Date().toISOString(),
    };
    setGallery((prev) => [newItem, ...prev]);

    apiClient.createGalleryItem({
      title: itemData.title,
      event_id: itemData.eventId,
      event_title: itemData.eventTitle,
      academic_year: itemData.academicYear,
      category: itemData.category,
      url: itemData.url,
      thumbnail_url: itemData.thumbnailUrl,
      caption: itemData.caption,
    }).then((created) => {
      if (created && created.id) {
        setGallery((prev) => prev.map((g) => (g.id === tempId ? { ...g, id: created.id } : g)));
      }
    }).catch((err: any) => {
      console.warn('[Gallery Sync] Cloud server unreachable, saved locally:', err?.message);
    });
  };

  const updateGalleryItem = (id: string, updates: Partial<GalleryItem>) => {
    setGallery((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((item) => item.id !== id));
    apiClient.deleteGalleryItem(id).catch((err: any) => {
      console.warn('[Gallery Delete Sync] Cloud server unreachable:', err?.message);
    });
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

    apiClient.createPost({
      title: postData.caption ? postData.caption.slice(0, 50) : 'Social Post',
      content: postData.caption || '',
      platform: postData.platform || 'all',
      status: postData.status || 'draft',
      scheduled_for: postData.scheduledDate,
      published_at: postData.publishedDate,
      image_url: postData.mediaUrl,
      tags: postData.hashtags || [],
    }).catch(() => {});
  };

  const updatePost = (id: string, updates: Partial<SocialPost>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    apiClient.updatePost(id, {
      content: updates.caption,
      platform: updates.platform,
      status: updates.status,
      scheduled_for: updates.scheduledDate,
      published_at: updates.publishedDate,
      image_url: updates.mediaUrl,
      tags: updates.hashtags,
    }).catch(() => {});
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    apiClient.deletePost(id).catch(() => {});
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

    apiClient.updatePost(id, {
      status: 'published',
      published_at: new Date().toISOString().split('T')[0],
    }).catch(() => {});
  };

  const addCampaign = (campaignData: Omit<CampaignPlan, 'id'>) => {
    const newCamp: CampaignPlan = {
      ...campaignData,
      id: `camp_${Date.now()}`,
    };
    setCampaigns((prev) => [newCamp, ...prev]);

    apiClient.createCampaign({
      title: campaignData.title,
      theme: (campaignData as any).theme || campaignData.title,
      target_audience: campaignData.targetAudience,
      start_date: campaignData.startDate,
      end_date: campaignData.endDate || campaignData.startDate,
      status: campaignData.status || 'planning',
      checklist: campaignData.checklist,
    }).catch(() => {});
  };

  const updateCampaignChecklist = (campaignId: string, itemKey: keyof CampaignChecklist, value: boolean) => {
    let updatedChecklist: any = null;
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          updatedChecklist = {
            ...c.checklist,
            [itemKey]: value,
          };
          return {
            ...c,
            checklist: updatedChecklist,
          };
        }
        return c;
      })
    );

    if (updatedChecklist) {
      apiClient.updateCampaign(campaignId, { checklist: updatedChecklist }).catch(() => {});
    }
  };

  const addDailyNews = (itemData: Omit<DailyNewsItem, 'id'>) => {
    const newItem: DailyNewsItem = {
      ...itemData,
      id: `news_${Date.now()}`,
    };
    setDailyNews((prev) => [newItem, ...prev]);

    apiClient.createDailyNews({
      title: itemData.title,
      content: itemData.content,
      category: itemData.category || 'announcement',
      source: (itemData as any).source || 'GeoHub Editorial',
      author_name: itemData.author || itemData.authorName || 'System SuperAdmin',
      published_at: itemData.publishedAt || itemData.date,
      tags: itemData.tags || itemData.hashtags || [],
    }).catch(() => {});
  };

  const updateDailyNews = (id: string, updates: Partial<DailyNewsItem>) => {
    setDailyNews((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );

    apiClient.updateDailyNews(id, {
      title: updates.title,
      content: updates.content,
      category: updates.category,
      source: (updates as any).source || 'GeoHub Editorial',
      author_name: updates.author || updates.authorName,
      tags: updates.tags || updates.hashtags,
    }).catch(() => {});
  };

  const deleteDailyNews = (id: string) => {
    setDailyNews((prev) => prev.filter((n) => n.id !== id));
    apiClient.deleteDailyNews(id).catch(() => {});
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
        isSyncing,
        syncStatus,
        lastSyncedAt,
        isDbConnected,
        setIsDbConnected,
        isBackendActive,
        setIsBackendActive,
        platformModules,
        toggleModule,
        toggleAllModules,
        refreshCloudData,
        syncWithBackend,
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
        overrideAttendance,
        markAttendanceWithOtp,
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
        enrollScholar,
        setUsers,
        setExpenses,
        setBudgetRequests,
        setAuditLogs,
        updateEventStatus,
        assignEventScanners,
        toast,
        showToast,
        hideToast,
        isServerModalOpen,
        setIsServerModalOpen,
        serverUrl,
        setServerUrl,
        testServerConnection,
        updateInfo,
        isUpdateModalOpen,
        setIsUpdateModalOpen,
        isUpdateMandatory,
        checkForUpdates,
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
