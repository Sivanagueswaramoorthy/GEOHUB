import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import apiClient from '../../../api/client';
import { RoleMeta, OperationDef, ModuleConfig, DiagnosticsData, DeckKey } from '../types';
import {
  Calendar,
  Users,
  Shield,
  Coins,
  Activity,
  FileText,
  Sparkles,
  MessageSquare,
  Database,
} from 'lucide-react';

export const OPERATIONS: OperationDef[] = [
  // Events Operations
  { key: 'canCreateEditEvents', label: 'Create & Edit Events', desc: 'Draft and publish new club gatherings', cat: 'events' },
  { key: 'canApproveEvents', label: 'Executive Event Approval', desc: 'Sanction submitted event proposals', cat: 'events' },
  { key: 'canArchiveEvents', label: 'Archive Completed Events', desc: 'Move concluded events to historical archives', cat: 'events' },
  { key: 'canCancelEvents', label: 'Cancel & Void Events', desc: 'Issue official event cancellations', cat: 'events' },
  { key: 'canAssignEventDuties', label: 'Assign Volunteers & Stations', desc: 'Staff event scanning and duty stations', cat: 'events' },

  // Financial Operations
  { key: 'canApproveBudget', label: 'Approve Budget Requests', desc: 'Authorize club expenditure grants', cat: 'finance' },
  { key: 'canSubmitBudgetRequest', label: 'Submit Budget Petitions', desc: 'Request treasury allocations', cat: 'finance' },
  { key: 'canManageExpenses', label: 'Log & Reconcile Expenses', desc: 'Record bills, receipts, and line items', cat: 'finance' },
  { key: 'canAccessFinance', label: 'View Treasury & Ledger', desc: 'Access club accounts and balances', cat: 'finance' },
  { key: 'canEditBudget', label: 'Direct Budget Reallocation', desc: 'Modify fiscal reserve allotments', cat: 'finance' },

  // Docs & Media Operations
  { key: 'canAccessDocStudio', label: 'Documentation Studio Access', desc: 'Access official press release studio', cat: 'docs' },
  { key: 'canEditDocStudio', label: 'Author Documentation Releases', desc: 'Create and publish official circulars', cat: 'docs' },
  { key: 'canCreateMemories', label: 'Upload Photo Memories', desc: 'Submit photo albums to media gallery', cat: 'docs' },
  { key: 'canPublishMemories', label: 'Approve Public Photo Wall', desc: 'Release albums to public club timeline', cat: 'docs' },

  // Activities & Operations
  { key: 'canAccessCampaigns', label: 'View Marketing Campaigns', desc: 'View AI social media drafts & banners', cat: 'ops' },
  { key: 'canManageCampaigns', label: 'Launch Social Campaigns', desc: 'Publish social media campaigns', cat: 'ops' },
  { key: 'canCreateMeetings', label: 'Convene Official Meetings', desc: 'Schedule governance assembly sessions', cat: 'ops' },
  { key: 'canSignOffMoM', label: 'Sign-Off Minutes of Meeting', desc: 'Executive ratification of MoM notes', cat: 'ops' },

  // Governance & Administration
  { key: 'canManageMembers', label: 'Manage Member Directory', desc: 'Approve, review, and roster club members', cat: 'admin' },
  { key: 'canManageSquads', label: 'Squad Orchestration', desc: 'Create teams, reassign squad leads', cat: 'admin' },
  { key: 'canAssignPosts', label: 'Bestow Executive Titles', desc: 'Appoint Presidents, Treasurers, Leads', cat: 'admin' },
  { key: 'canManageSettings', label: 'Institutional System Settings', desc: 'Configure college domain & thresholds', cat: 'admin' },
  { key: 'canReviewExecutiveApprovals', label: 'Executive Governance Approvals', desc: 'Sign off on constitutional petitions', cat: 'admin' },
  { key: 'canExportReports', label: 'Export Official Reports', desc: 'Generate PDF/CSV audit dossiers', cat: 'admin' },
  { key: 'canSendNotifications', label: 'Dispatch Push Broadcasts', desc: 'Send campus-wide mobile notifications', cat: 'admin' },
  { key: 'canViewAuditLog', label: 'Inspect Tamper-Proof Audit Log', desc: 'Review cryptographic governance ledger', cat: 'admin' },
];

export const DEFAULT_ROLES: RoleMeta[] = [
  { role: 'super_admin', badge: 'Super Admin', name: 'System SuperAdmin', roll_no: 'SA01', email: 'superadmin@college.edu', post: 'System Administrator', status: 'active' },
  { role: 'faculty', badge: 'Faculty Advisor', name: 'Dr. Sarah Jenkins', roll_no: 'FAC01', email: 'sarah.jenkins@college.edu', post: 'Faculty Advisor', status: 'active' },
  { role: 'coordinator', badge: 'Coordinator', name: 'Alex Rivera', roll_no: '21GEO001', email: 'alex.rivera@college.edu', post: 'Club President', status: 'active' },
  { role: 'management', badge: 'Management Lead', name: 'Elena Rostova', roll_no: '21GEO010', email: 'elena.rostova@college.edu', post: 'Vice President', status: 'active' },
  { role: 'documentation', badge: 'Documentation', name: 'Aarav Patel', roll_no: '22GEO018', email: 'aarav.patel@college.edu', post: 'Documentation Lead', status: 'active' },
  { role: 'treasurer', badge: 'Treasurer', name: 'Ananya Iyer', roll_no: '22GEO019', email: 'ananya.iyer@college.edu', post: 'Treasurer', status: 'active' },
  { role: 'promotion', badge: 'Promotion', name: 'David Chen', roll_no: '22GEO014', email: 'david.chen@college.edu', post: 'Promotion Lead', status: 'active' },
  { role: 'volunteer', badge: 'Lead Volunteer', name: 'Liam Vance', roll_no: '23GEO042', email: 'liam.vance@college.edu', post: 'Squad Volunteer', status: 'active' },
  { role: 'student', badge: 'Student Member', name: 'Maya Patel', roll_no: '23GEO088', email: 'maya.patel@college.edu', post: 'Club Member', status: 'active' },
];

export const MODULE_CONFIGS: ModuleConfig[] = [
  { id: 'events', name: 'Events & Hackathons Hub', desc: 'Calendar, Proposals & Speaker Management', icon: Calendar },
  { id: 'members', name: 'Member & Student Directory', desc: 'Scholar Roster, Verification & KYC', icon: Users },
  { id: 'squads', name: 'Squads & Duty Workspaces', desc: 'Management, Promotion, Doc, Entertainment', icon: Shield },
  { id: 'finance', name: 'Treasury & Financial Ledger', desc: 'Expenditure Logs & Budget Petitions', icon: Coins },
  { id: 'qr_attendance', name: 'Smart QR & Attendance Gate', desc: 'Geofenced OTP & High-Speed Entry Scan', icon: Activity },
  { id: 'archives', name: 'Archives & Media Gallery', desc: 'Photo Archival & Event Coverage Media', icon: FileText },
  { id: 'campaigns', name: 'Campaigns & AI Social Studio', desc: 'Digital Posters, Announcements & Outreach', icon: Sparkles },
  { id: 'forum', name: 'Campus Forum & Community', desc: 'Broadcast Channels & Peer Discussions', icon: MessageSquare },
  { id: 'documents', name: 'Document Studio & MOM Archival', desc: 'Minutes of Meeting & Institutional Policies', icon: Database },
];

export const useSuperAdminState = () => {
  const { showToast, switchRole, syncWithBackend, platformModules, toggleModule, toggleAllModules } = useApp();

  const [roles, setRoles] = useState<RoleMeta[]>(DEFAULT_ROLES);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('coordinator');
  const [selectedCat, setSelectedCat] = useState<'all' | 'events' | 'finance' | 'docs' | 'ops' | 'admin'>('all');
  const [activeDeck, setActiveDeckState] = useState<DeckKey>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const h = window.location.hash.replace('#', '');
      if (['all', 'hub', 'faculty', 'students', 'matrix', 'maintenance'].includes(h)) {
        return h as DeckKey;
      }
    }
    return 'all';
  });

  const setActiveDeck = useCallback((deck: DeckKey) => {
    setActiveDeckState(deck);
    if (typeof window !== 'undefined') {
      window.location.hash = '#' + deck;
      window.dispatchEvent(
        new CustomEvent('geohub_superadmin_deck_change', { detail: { deck } })
      );
    }
  }, []);

  useEffect(() => {
    const handleDeckChange = (e: any) => {
      const d = e.detail?.deck;
      if (d && ['all', 'hub', 'faculty', 'students', 'matrix', 'maintenance'].includes(d)) {
        setActiveDeckState(d);
      }
    };
    window.addEventListener('geohub_superadmin_deck_change', handleDeckChange);
    return () => window.removeEventListener('geohub_superadmin_deck_change', handleDeckChange);
  }, []);
  const [facultySearch, setFacultySearch] = useState<string>('');
  const [dbLatencyMs, setDbLatencyMs] = useState<number>(24);
  const [loading, setLoading] = useState<boolean>(true);

  // Diagnostics & Live Telemetry
  const [diagnosticsData, setDiagnosticsData] = useState<DiagnosticsData | null>(null);

  // Broadcast Modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState('urgent');
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);

  // Faculty State
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedFacultyDept, setSelectedFacultyDept] = useState<string>('all');
  const [pinModalFaculty, setPinModalFaculty] = useState<any | null>(null);
  const [generatedPin, setGeneratedPin] = useState<string>('');
  const [copiedPin, setCopiedPin] = useState(false);
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [isEditFacultyModalOpen, setIsEditFacultyModalOpen] = useState(false);
  const [facultySubmitting, setFacultySubmitting] = useState(false);
  const [editFacultySubmitting, setEditFacultySubmitting] = useState(false);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    roll_no: '',
    email: '',
    department: 'Geoinformatics Engineering',
    post: 'Faculty Advisor',
    phone: '',
    password: 'GeoHub2026!',
  });
  const [editFacultyForm, setEditFacultyForm] = useState({
    id: '',
    name: '',
    roll_no: '',
    email: '',
    department: 'Geoinformatics Engineering',
    post: 'Faculty Advisor',
    phone: '',
    status: 'active',
    password: '',
  });

  // Student State
  const [studentList, setStudentList] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentRoleFilter, setStudentRoleFilter] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [isBatchSquadModalOpen, setIsBatchSquadModalOpen] = useState(false);
  const [batchTargetSquad, setBatchTargetSquad] = useState('Management');
  const [studentSubmitting, setStudentSubmitting] = useState(false);
  const [editStudentSubmitting, setEditStudentSubmitting] = useState(false);
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    roll_no: '',
    email: '',
    role: 'student',
    department: 'Geoinformatics Engineering',
    year_of_study: '1st Year',
    post: 'Student Member',
    team: 'General',
    phone: '',
    password: 'geohub',
  });
  const [editStudentForm, setEditStudentForm] = useState({
    id: '',
    name: '',
    roll_no: '',
    email: '',
    role: 'student',
    department: 'Geoinformatics Engineering',
    year_of_study: '1st Year',
    post: 'Student Member',
    team: 'General',
    status: 'active',
    phone: '',
    password: '',
  });

  // Role Matrix & Credentials State
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, boolean>>>({});
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [togglingOperation, setTogglingOperation] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [rollInput, setRollInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [statusInput, setStatusInput] = useState('active');
  const [copiedPass, setCopiedPass] = useState(false);

  // System & Maintenance State
  const [pingingDb, setPingingDb] = useState(false);
  const [isConfirmPurgeOpen, setIsConfirmPurgeOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // Fetch all backend telemetry
  const fetchData = useCallback(async () => {
    setLoading(true);
    const start = Date.now();
    try {
      const [rolesRes, matrixRes, facultyRes, usersRes, diagRes] = await Promise.all([
        apiClient.getAdminRolesCredentials().catch(() => DEFAULT_ROLES),
        apiClient.getAdminPermissionsMatrix().catch(() => null),
        apiClient.getAdminFaculty().catch(() => []),
        apiClient.getAdminUsers().catch(() => []),
        apiClient.getAdminSystemDiagnostics().catch(() => null),
      ]);
      setDbLatencyMs(diagRes?.latency_ms || Math.max(16, Date.now() - start));

      if (rolesRes && Array.isArray(rolesRes) && rolesRes.length > 0) {
        setRoles(rolesRes);
      }
      if (matrixRes && matrixRes.matrix) {
        setMatrixData(matrixRes.matrix);
      }
      if (Array.isArray(facultyRes)) {
        setFacultyList(facultyRes);
      }
      if (Array.isArray(usersRes)) {
        const nonFaculty = usersRes.filter((u: any) => u.role !== 'faculty' && u.role !== 'super_admin');
        setStudentList(nonFaculty);
      }
      if (diagRes) {
        setDiagnosticsData(diagRes);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync inputs with selected role
  useEffect(() => {
    const r = roles.find((item) => item.role === selectedRoleKey);
    if (r) {
      setNameInput(r.name || '');
      setRollInput(r.roll_no || '');
      setEmailInput(r.email || '');
      setPasswordInput('');
      setStatusInput(r.status || 'active');
    }
  }, [selectedRoleKey, roles]);

  const activeRoleMeta = useMemo(() => {
    return roles.find((r) => r.role === selectedRoleKey) || roles[0];
  }, [roles, selectedRoleKey]);

  const normRoleKey = useMemo(() => {
    if (selectedRoleKey === 'super_admin') return 'faculty';
    if (selectedRoleKey === 'coordinator') return 'president';
    return selectedRoleKey;
  }, [selectedRoleKey]);

  const currentRolePermissions: Record<string, boolean> = useMemo(() => {
    return matrixData[normRoleKey] || {};
  }, [matrixData, normRoleKey]);

  const activeCount = useMemo(() => {
    return OPERATIONS.filter((op) => !!currentRolePermissions[op.key]).length;
  }, [currentRolePermissions]);

  const filteredOperations = useMemo(() => {
    if (selectedCat === 'all') return OPERATIONS;
    return OPERATIONS.filter((op) => op.cat === selectedCat);
  }, [selectedCat]);

  // Faculty filtering
  const facultyDepartments = useMemo(() => {
    const depts = new Set<string>();
    facultyList.forEach((f) => {
      if (f.department) depts.add(f.department.trim());
    });
    return ['all', ...Array.from(depts)];
  }, [facultyList]);

  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      const q = facultySearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.roll_no && f.roll_no.toLowerCase().includes(q)) ||
        (f.email && f.email.toLowerCase().includes(q)) ||
        (f.department && f.department.toLowerCase().includes(q)) ||
        (f.post && f.post.toLowerCase().includes(q));

      const matchDept =
        selectedFacultyDept === 'all' ||
        (f.department && f.department.toLowerCase() === selectedFacultyDept.toLowerCase());

      return matchSearch && matchDept;
    });
  }, [facultyList, facultySearch, selectedFacultyDept]);

  // Student filtering
  const filteredStudents = useMemo(() => {
    return studentList.filter((s) => {
      const q = studentSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.roll_no && s.roll_no.toLowerCase().includes(q)) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.role && s.role.toLowerCase().includes(q));

      const matchRole =
        studentRoleFilter === 'all' ||
        (s.role && s.role.toLowerCase() === studentRoleFilter.toLowerCase());

      return matchSearch && matchRole;
    });
  }, [studentList, studentSearch, studentRoleFilter]);

  const squadDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      General: 0,
      Management: 0,
      Promotion: 0,
      Documentation: 0,
      Entertainment: 0,
    };
    studentList.forEach((s) => {
      const sq = s.team || 'General';
      counts[sq] = (counts[sq] || 0) + 1;
    });
    return counts;
  }, [studentList]);

  // Handlers
  const handleToggleOperation = async (opKey: string) => {
    const currentVal = !!currentRolePermissions[opKey];
    const newVal = !currentVal;

    setMatrixData((prev) => ({
      ...prev,
      [normRoleKey]: {
        ...(prev[normRoleKey] || {}),
        [opKey]: newVal,
      },
    }));

    try {
      await apiClient.updateAdminPermissionsMatrix({
        role: selectedRoleKey,
        permissions: { [opKey]: newVal },
      });
      showToast(`Updated ${opKey} to ${newVal ? 'Active' : 'Disabled'}`, 'success');
    } catch (err: any) {
      setMatrixData((prev) => ({
        ...prev,
        [normRoleKey]: {
          ...(prev[normRoleKey] || {}),
          [opKey]: currentVal,
        },
      }));
      showToast(err?.message || 'Failed to update authority', 'error');
    }
  };

  const handleEnableAll = async () => {
    setTogglingOperation(true);
    try {
      const res = await apiClient.updateAdminPermissionsMatrix({
        role: selectedRoleKey,
        action: 'enable_all',
      });
      if (res.effective_matrix?.matrix) {
        setMatrixData(res.effective_matrix.matrix);
      } else {
        const updated: Record<string, boolean> = {};
        OPERATIONS.forEach((o) => (updated[o.key] = true));
        setMatrixData((prev) => ({ ...prev, [normRoleKey]: updated }));
      }
      showToast(`Enabled all 26 operations for ${activeRoleMeta.badge}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to enable operations', 'error');
    } finally {
      setTogglingOperation(false);
    }
  };

  const handleDisableAll = async () => {
    if (selectedRoleKey === 'super_admin') {
      showToast('SuperAdmin permissions cannot be revoked', 'error');
      return;
    }

    setTogglingOperation(true);
    try {
      const res = await apiClient.updateAdminPermissionsMatrix({
        role: selectedRoleKey,
        action: 'disable_all',
      });
      if (res.effective_matrix?.matrix) {
        setMatrixData(res.effective_matrix.matrix);
      } else {
        const updated: Record<string, boolean> = {};
        OPERATIONS.forEach((o) => (updated[o.key] = false));
        setMatrixData((prev) => ({ ...prev, [normRoleKey]: updated }));
      }
      showToast(`Disabled all operations for ${activeRoleMeta.badge}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to disable operations', 'error');
    } finally {
      setTogglingOperation(false);
    }
  };

  const handleResetToDefault = async () => {
    setTogglingOperation(true);
    try {
      const res = await apiClient.resetAdminPermissionsMatrix(selectedRoleKey);
      if (res.effective_matrix?.matrix) {
        setMatrixData(res.effective_matrix.matrix);
      } else {
        await fetchData();
      }
      showToast(`Restored default baseline for ${activeRoleMeta.badge}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to reset matrix', 'error');
    } finally {
      setTogglingOperation(false);
    }
  };

  const handleApplySecurityPreset = async (preset: 'baseline' | 'event_sprint' | 'exam_hiatus') => {
    setTogglingOperation(true);
    try {
      if (preset === 'baseline') {
        const res = await apiClient.resetAdminPermissionsMatrix(selectedRoleKey);
        if (res.effective_matrix?.matrix) {
          setMatrixData(res.effective_matrix.matrix);
        } else {
          await fetchData();
        }
        showToast(`✓ Applied Baseline preset for ${activeRoleMeta.badge}`, 'success');
      } else if (preset === 'event_sprint') {
        const sprintKeys = [
          'canAssignEventDuties',
          'canManageExpenses',
          'canCreateMemories',
          'canPublishMemories',
          'canAccessDocStudio',
          'canEditDocStudio',
        ];
        const currentRolePerms = { ...(matrixData[normRoleKey] || {}) };
        sprintKeys.forEach((k) => (currentRolePerms[k] = true));
        setMatrixData((prev) => ({ ...prev, [normRoleKey]: currentRolePerms }));
        for (const k of sprintKeys) {
          await apiClient.updateAdminPermissionsMatrix({
            role: selectedRoleKey,
            permissions: { [k]: true },
          }).catch(() => null);
        }
        showToast(`⚡ Event Sprint preset applied to ${activeRoleMeta.badge}`, 'success');
      } else if (preset === 'exam_hiatus') {
        const hiatusKeys = [
          'canCreateEditEvents',
          'canApproveEvents',
          'canSubmitBudgetRequest',
          'canManageExpenses',
          'canCreateMeetings',
          'canManageCampaigns',
        ];
        const currentRolePerms = { ...(matrixData[normRoleKey] || {}) };
        hiatusKeys.forEach((k) => (currentRolePerms[k] = false));
        setMatrixData((prev) => ({ ...prev, [normRoleKey]: currentRolePerms }));
        for (const k of hiatusKeys) {
          await apiClient.updateAdminPermissionsMatrix({
            role: selectedRoleKey,
            permissions: { [k]: false },
          }).catch(() => null);
        }
        showToast(`🔒 Exam Hiatus preset applied (restricted non-admin mutations)`, 'info');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to apply preset', 'error');
    } finally {
      setTogglingOperation(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!rollInput.trim()) {
      showToast('Username / Roll No is required', 'error');
      return;
    }

    setSavingCredentials(true);
    try {
      const res = await apiClient.setAdminRoleCredentials({
        role: selectedRoleKey,
        roll_no: rollInput.trim(),
        name: nameInput.trim() || undefined,
        email: emailInput.trim() || undefined,
        password: passwordInput.trim() || undefined,
        status: statusInput,
      });

      showToast(res.message || 'Role credentials updated successfully', 'success');

      setRoles((prev) =>
        prev.map((r) =>
          r.role === selectedRoleKey
            ? {
                ...r,
                name: nameInput.trim() || r.name,
                roll_no: rollInput.trim().toUpperCase(),
                email: emailInput.trim() || r.email,
                status: statusInput,
                is_registered: true,
              }
            : r
        )
      );
      setPasswordInput('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update credentials', 'error');
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordInput(res);
    showToast('Secure password generated', 'info');
  };

  const handleCopyPassword = () => {
    if (!passwordInput) {
      showToast('No password set yet', 'error');
      return;
    }
    navigator.clipboard?.writeText(passwordInput);
    setCopiedPass(true);
    showToast('Password copied to clipboard', 'success');
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleActAsRole = () => {
    const roleToPreview = activeRoleMeta.role;
    switchRole(roleToPreview);
    showToast(`Master Control: Switched preview to "${activeRoleMeta.badge}"`, 'info');
  };

  const handleMaintenanceFreezeToggle = () => {
    const isAnyPaused = Object.values(platformModules || {}).some((v) => v === false);
    if (isAnyPaused) {
      toggleAllModules(true);
      showToast('✓ Resumed all platform modules', 'success');
    } else {
      const nonEssentials = ['events', 'archives', 'campaigns', 'forum'];
      nonEssentials.forEach((modId) => toggleModule(modId, false));
      showToast('⏸ Maintenance Freeze: paused public modules', 'info');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('Please enter an alert title and message', 'error');
      return;
    }
    setBroadcastSubmitting(true);
    try {
      await apiClient.sendAdminBroadcastAlert({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        priority: broadcastPriority,
      });
      showToast('✓ Campus broadcast dispatched to all devices', 'success');
      setIsBroadcastModalOpen(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      await fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to dispatch alert', 'error');
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name.trim() || !facultyForm.roll_no.trim() || !facultyForm.email.trim()) {
      showToast('Please fill in Name, Faculty ID, and Institutional Email', 'error');
      return;
    }
    setFacultySubmitting(true);
    try {
      const created = await apiClient.addAdminFaculty(facultyForm);
      showToast(`✓ Faculty Advisor "${created.name}" provisioned successfully`, 'success');
      setIsAddFacultyModalOpen(false);
      setFacultyForm({
        name: '',
        roll_no: '',
        email: '',
        department: 'Geoinformatics Engineering',
        post: 'Faculty Advisor',
        phone: '',
        password: 'GeoHub2026!',
      });
      await fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to provision faculty account', 'error');
    } finally {
      setFacultySubmitting(false);
    }
  };

  const handleOpenEditFaculty = (fac: any) => {
    setEditFacultyForm({
      id: fac.id,
      name: fac.name || '',
      roll_no: fac.roll_no || '',
      email: fac.email || '',
      department: fac.department || 'Geoinformatics Engineering',
      post: fac.post || 'Faculty Advisor',
      phone: fac.phone || '',
      status: fac.status || 'active',
      password: '',
    });
    setIsEditFacultyModalOpen(true);
  };

  const handleUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFacultyForm.name.trim() || !editFacultyForm.roll_no.trim() || !editFacultyForm.email.trim()) {
      showToast('Please fill in Name, Faculty ID, and Institutional Email', 'error');
      return;
    }
    setEditFacultySubmitting(true);
    try {
      const payload: any = {
        name: editFacultyForm.name.trim(),
        roll_no: editFacultyForm.roll_no.trim().toUpperCase(),
        email: editFacultyForm.email.trim(),
        department: editFacultyForm.department.trim(),
        post: editFacultyForm.post.trim(),
        phone: editFacultyForm.phone.trim(),
        status: editFacultyForm.status,
      };
      if (editFacultyForm.password && editFacultyForm.password.trim()) {
        payload.password = editFacultyForm.password.trim();
      }
      await apiClient.updateAdminFaculty(editFacultyForm.id, payload);
      showToast(`✓ Faculty Advisor "${editFacultyForm.name}" updated successfully`, 'success');
      setIsEditFacultyModalOpen(false);
      await fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update faculty details', 'error');
    } finally {
      setEditFacultySubmitting(false);
    }
  };

  const handleDeleteFaculty = async (facId: string, facName: string) => {
    if (!window.confirm(`Revoke and remove Faculty Advisor credentials for "${facName}"?\n\nAs SuperAdmin, this will remove this faculty member unconditionally.`)) return;
    try {
      await apiClient.deleteAdminFaculty(facId);
      showToast(`✓ Removed faculty account for ${facName}`, 'info');
      setFacultyList((prev) => prev.filter((f) => f.id !== facId));
      await fetchData();
      await syncWithBackend();
    } catch (err: any) {
      showToast(err?.message || 'Failed to remove faculty account', 'error');
    }
  };

  const handleExportFacultyCsv = () => {
    if (facultyList.length === 0) {
      showToast('No faculty advisors to export', 'error');
      return;
    }
    const headers = ['Name', 'Faculty ID', 'Email', 'Department', 'Post', 'Phone', 'Status'];
    const rows = facultyList.map((f) => [
      `"${(f.name || '').replace(/"/g, '""')}"`,
      `"${(f.roll_no || '').replace(/"/g, '""')}"`,
      `"${(f.email || '').replace(/"/g, '""')}"`,
      `"${(f.department || '').replace(/"/g, '""')}"`,
      `"${(f.post || '').replace(/"/g, '""')}"`,
      `"${(f.phone || '').replace(/"/g, '""')}"`,
      `"${(f.status || 'active').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `faculty_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Faculty directory exported as CSV', 'success');
  };

  const handleGeneratePin = (fac: any) => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPin(pin);
    setPinModalFaculty(fac);
    setCopiedPin(false);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.roll_no.trim() || !studentForm.email.trim()) {
      showToast('Please fill in Student Name, Register Number (Reg No), and Email', 'error');
      return;
    }
    setStudentSubmitting(true);
    try {
      const payload = {
        name: studentForm.name.trim(),
        roll_no: studentForm.roll_no.trim().toUpperCase(),
        email: studentForm.email.trim().toLowerCase(),
        role: studentForm.role,
        department: studentForm.department.trim(),
        year_of_study: studentForm.year_of_study.trim(),
        post: studentForm.post.trim(),
        team: studentForm.team.trim(),
        phone: studentForm.phone.trim(),
        password: studentForm.password.trim() || 'geohub',
      };
      const created = await apiClient.createAdminUser(payload);
      showToast(`✓ Account "${created.name}" onboarded as ${created.role.toUpperCase()}`, 'success');
      setIsAddStudentModalOpen(false);
      setStudentForm({
        name: '',
        roll_no: '',
        email: '',
        role: 'student',
        department: 'Geoinformatics Engineering',
        year_of_study: '1st Year',
        post: 'Student Member',
        team: 'General',
        phone: '',
        password: 'geohub',
      });
      await fetchData();
      await syncWithBackend();
    } catch (err: any) {
      showToast(err?.message || 'Failed to onboard student', 'error');
    } finally {
      setStudentSubmitting(false);
    }
  };

  const handleOpenEditStudent = (st: any) => {
    setEditStudentForm({
      id: st.id || st.uid,
      name: st.name || '',
      roll_no: (st.roll_no || st.rollNo || '').toUpperCase(),
      email: st.email || '',
      role: st.role || 'student',
      department: st.department || 'Geoinformatics Engineering',
      year_of_study: st.year_of_study || st.yearOfStudy || '1st Year',
      post: st.post || 'Student Member',
      team: st.team || 'General',
      status: st.status || 'active',
      phone: st.phone || '',
      password: '',
    });
    setIsEditStudentModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudentForm.name.trim() || !editStudentForm.roll_no.trim() || !editStudentForm.email.trim()) {
      showToast('Please fill in Student Name, Register Number, and Email', 'error');
      return;
    }
    setEditStudentSubmitting(true);
    try {
      const payload: any = {
        name: editStudentForm.name.trim(),
        roll_no: editStudentForm.roll_no.trim().toUpperCase(),
        email: editStudentForm.email.trim().toLowerCase(),
        role: editStudentForm.role,
        department: editStudentForm.department.trim(),
        year_of_study: editStudentForm.year_of_study.trim(),
        post: editStudentForm.post.trim(),
        team: editStudentForm.team.trim(),
        phone: editStudentForm.phone.trim(),
        status: editStudentForm.status,
      };
      if (editStudentForm.password && editStudentForm.password.trim()) {
        payload.password = editStudentForm.password.trim();
      }
      await apiClient.updateAdminUser(editStudentForm.id, payload);
      showToast(`✓ Account "${editStudentForm.name}" updated successfully`, 'success');
      setIsEditStudentModalOpen(false);
      await fetchData();
      await syncWithBackend();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update account', 'error');
    } finally {
      setEditStudentSubmitting(false);
    }
  };

  const handleDeleteStudent = async (stId: string, stName: string) => {
    if (!window.confirm(`Are you sure you want to remove account "${stName}"?\n\nAs SuperAdmin, this will remove this account completely.`)) return;
    try {
      await apiClient.deleteAdminUser(stId);
      showToast(`✓ Account "${stName}" successfully removed`, 'success');
      await fetchData();
      await syncWithBackend();
    } catch (err: any) {
      showToast(err?.message || 'Failed to remove account', 'error');
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id || s.uid).filter(Boolean));
    }
  };

  const handleExecuteBatchSquad = async () => {
    if (selectedStudentIds.length === 0) return;
    setBatchSubmitting(true);
    try {
      const res = await apiClient.executeAdminBatchAction({
        user_ids: selectedStudentIds,
        action: 'assign_squad',
        value: batchTargetSquad,
      });
      showToast(`✓ Assigned ${res.affected_count} scholars to ${batchTargetSquad}`, 'success');
      setIsBatchSquadModalOpen(false);
      setSelectedStudentIds([]);
      await fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed batch squad assignment', 'error');
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleBatchToggleStatus = async () => {
    if (selectedStudentIds.length === 0) return;
    setBatchSubmitting(true);
    try {
      const sample = studentList.filter((s) => selectedStudentIds.includes(s.id || s.uid));
      const targetStatus = sample.some((s) => s.status === 'disabled') ? 'active' : 'disabled';
      const res = await apiClient.executeAdminBatchAction({
        user_ids: selectedStudentIds,
        action: 'set_status',
        value: targetStatus,
      });
      showToast(`✓ Updated status to "${targetStatus}" for ${res.affected_count} scholars`, 'success');
      setSelectedStudentIds([]);
      await fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed batch status update', 'error');
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleBatchResetPassword = async () => {
    if (selectedStudentIds.length === 0) return;
    if (!window.confirm(`Reset passwords to default "geohub" for all ${selectedStudentIds.length} selected accounts?`)) return;
    setBatchSubmitting(true);
    try {
      const res = await apiClient.executeAdminBatchAction({
        user_ids: selectedStudentIds,
        action: 'reset_password',
        value: 'geohub',
      });
      showToast(`✓ Reset password to "geohub" for ${res.affected_count} scholars`, 'success');
      setSelectedStudentIds([]);
      await fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed batch password reset', 'error');
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedStudentIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedStudentIds.length} selected accounts?\n\nRoot SuperAdmin (SA01) is protected and will never be deleted.`)) return;
    setBatchSubmitting(true);
    try {
      const res = await apiClient.executeAdminBatchAction({
        user_ids: selectedStudentIds,
        action: 'delete',
      });
      showToast(`✓ Removed ${res.affected_count} student accounts`, 'info');
      setSelectedStudentIds([]);
      await fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed batch deletion', 'error');
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handlePingDatabase = async () => {
    setPingingDb(true);
    const start = Date.now();
    try {
      const diag = await apiClient.getAdminSystemDiagnostics();
      const elapsed = Math.max(8, Date.now() - start);
      setDbLatencyMs(diag?.latency_ms || elapsed);
      if (diag) setDiagnosticsData(diag);
      showToast(`✓ TiDB Cloud ping: ${diag?.latency_ms || elapsed}ms roundtrip`, 'success');
    } catch {
      showToast('TiDB ping completed', 'info');
    } finally {
      setPingingDb(false);
    }
  };

  const handlePurgeAllData = async () => {
    setIsPurging(true);
    try {
      await apiClient.purgePlatformData();
      showToast('✓ All dummy data and user records purged. Clean slate initialized.', 'success');
      setIsConfirmPurgeOpen(false);
      try {
        localStorage.setItem('geohub_db_epoch', `purged_${Date.now()}`);
        localStorage.removeItem('geohub_store_events');
        localStorage.removeItem('geohub_store_tasks');
        localStorage.removeItem('geohub_store_expenses');
        localStorage.removeItem('geohub_store_budgetRequests');
        localStorage.removeItem('geohub_store_auditLogs');
      } catch {}
      await fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Purge failed', 'error');
    } finally {
      setIsPurging(false);
    }
  };

  return {
    roles,
    selectedRoleKey,
    setSelectedRoleKey,
    activeRoleMeta,
    selectedCat,
    setSelectedCat,
    activeDeck,
    setActiveDeck,
    facultySearch,
    setFacultySearch,
    dbLatencyMs,
    loading,
    diagnosticsData,
    fetchData,

    // Command Hub
    platformModules,
    toggleModule,
    toggleAllModules,
    handleMaintenanceFreezeToggle,
    isBroadcastModalOpen,
    setIsBroadcastModalOpen,
    broadcastTitle,
    setBroadcastTitle,
    broadcastMessage,
    setBroadcastMessage,
    broadcastPriority,
    setBroadcastPriority,
    broadcastSubmitting,
    handleSendBroadcast,

    // Faculty
    facultyList,
    filteredFaculty,
    facultyDepartments,
    selectedFacultyDept,
    setSelectedFacultyDept,
    handleExportFacultyCsv,
    handleGeneratePin,
    pinModalFaculty,
    setPinModalFaculty,
    generatedPin,
    copiedPin,
    setCopiedPin,
    isAddFacultyModalOpen,
    setIsAddFacultyModalOpen,
    facultyForm,
    setFacultyForm,
    facultySubmitting,
    handleCreateFaculty,
    isEditFacultyModalOpen,
    setIsEditFacultyModalOpen,
    editFacultyForm,
    setEditFacultyForm,
    editFacultySubmitting,
    handleOpenEditFaculty,
    handleUpdateFaculty,
    handleDeleteFaculty,

    // Students
    studentList,
    filteredStudents,
    studentSearch,
    setStudentSearch,
    studentRoleFilter,
    setStudentRoleFilter,
    squadDistribution,
    selectedStudentIds,
    setSelectedStudentIds,
    toggleSelectStudent,
    handleSelectAllStudents,
    isAddStudentModalOpen,
    setIsAddStudentModalOpen,
    studentForm,
    setStudentForm,
    studentSubmitting,
    handleCreateStudent,
    isEditStudentModalOpen,
    setIsEditStudentModalOpen,
    editStudentForm,
    setEditStudentForm,
    editStudentSubmitting,
    handleOpenEditStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    isBatchSquadModalOpen,
    setIsBatchSquadModalOpen,
    batchTargetSquad,
    setBatchTargetSquad,
    batchSubmitting,
    handleExecuteBatchSquad,
    handleBatchToggleStatus,
    handleBatchResetPassword,
    handleBatchDelete,

    // Role Matrix & Credentials
    operations: OPERATIONS,
    filteredOperations,
    currentRolePermissions,
    activeCount,
    nameInput,
    setNameInput,
    rollInput,
    setRollInput,
    emailInput,
    setEmailInput,
    passwordInput,
    setPasswordInput,
    statusInput,
    setStatusInput,
    copiedPass,
    handleGeneratePassword,
    handleCopyPassword,
    handleSaveCredentials,
    savingCredentials,
    handleActAsRole,
    handleToggleOperation,
    handleEnableAll,
    handleDisableAll,
    handleResetToDefault,
    handleApplySecurityPreset,
    togglingOperation,

    // Maintenance & DB
    pingingDb,
    handlePingDatabase,
    isConfirmPurgeOpen,
    setIsConfirmPurgeOpen,
    isPurging,
    handlePurgeAllData,
  };
};
