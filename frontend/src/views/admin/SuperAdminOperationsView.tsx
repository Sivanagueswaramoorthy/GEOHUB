import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import apiClient from '../../api/client';
import {
  Shield,
  Key,
  User,
  Users,
  Mail,
  Lock,
  RefreshCw,
  Check,
  X,
  RotateCcw,
  Copy,
  Sparkles,
  AlertTriangle,
  ChevronLeft,
  Sliders,
  CheckCircle2,
  Calendar,
  Coins,
  FileText,
  Activity,
  SlidersHorizontal,
  UserPlus,
  Trash2,
  Plus,
  Pencil,
  GraduationCap,
  Database,
  Repeat,
  Search,
  MessageSquare,
} from 'lucide-react';

interface RoleMeta {
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

interface OperationDef {
  key: string;
  label: string;
  desc: string;
  cat: 'events' | 'finance' | 'docs' | 'ops' | 'admin';
}

const OPERATIONS: OperationDef[] = [
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

const DEFAULT_ROLES: RoleMeta[] = [
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

const MODULE_CONFIGS = [
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

interface Props {
  onBack?: () => void;
  isHomeCockpit?: boolean;
}

export const SuperAdminOperationsView: React.FC<Props> = ({ onBack, isHomeCockpit = false }) => {
  const { showToast, currentUser, switchRole, syncWithBackend, platformModules, toggleModule, toggleAllModules } = useApp();

  const [roles, setRoles] = useState<RoleMeta[]>(DEFAULT_ROLES);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('coordinator');
  const [selectedCat, setSelectedCat] = useState<'all' | 'events' | 'finance' | 'docs' | 'ops' | 'admin'>('all');
  const [activeDeck, setActiveDeck] = useState<'all' | 'hub' | 'faculty' | 'students' | 'matrix' | 'maintenance'>('all');
  const [facultySearch, setFacultySearch] = useState<string>('');

  // Matrix state
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [savingCredentials, setSavingCredentials] = useState<boolean>(false);
  const [togglingOperation, setTogglingOperation] = useState<boolean>(false);

  // Faculty Provisioning & Data Purge State
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [isEditFacultyModalOpen, setIsEditFacultyModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isConfirmPurgeOpen, setIsConfirmPurgeOpen] = useState(false);
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

  // Student & Officer Management State
  const [studentList, setStudentList] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentRoleFilter, setStudentRoleFilter] = useState<string>('all');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState<boolean>(false);
  const [studentSubmitting, setStudentSubmitting] = useState<boolean>(false);
  const [editStudentSubmitting, setEditStudentSubmitting] = useState<boolean>(false);
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

  // Form credentials for currently selected role
  const [nameInput, setNameInput] = useState<string>('');
  const [rollInput, setRollInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [statusInput, setStatusInput] = useState<string>('active');
  const [copiedPass, setCopiedPass] = useState<boolean>(false);

  // Load backend data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, matrixRes, facultyRes, usersRes] = await Promise.all([
        apiClient.getAdminRolesCredentials().catch(() => DEFAULT_ROLES),
        apiClient.getAdminPermissionsMatrix().catch(() => null),
        apiClient.getAdminFaculty().catch(() => []),
        apiClient.getAdminUsers().catch(() => []),
      ]);

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
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
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

  const filteredFaculty = useMemo(() => {
    if (!facultySearch.trim()) return facultyList;
    const q = facultySearch.trim().toLowerCase();
    return facultyList.filter(
      (f) =>
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.roll_no && f.roll_no.toLowerCase().includes(q)) ||
        (f.email && f.email.toLowerCase().includes(q)) ||
        (f.department && f.department.toLowerCase().includes(q)) ||
        (f.post && f.post.toLowerCase().includes(q))
    );
  }, [facultyList, facultySearch]);

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

  useEffect(() => {
    fetchData();
  }, []);

  // Update input fields whenever selected role changes
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

  // Normalized key for role matrix lookup
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

  // Generate secure password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordInput(res);
    showToast('Secure password generated', 'info');
  };

  // Copy password to clipboard
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

  // Save Role Credentials
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

      // Update local state
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

  // Toggle single operation flag
  const handleToggleOperation = async (opKey: string) => {
    const currentVal = !!currentRolePermissions[opKey];
    const newVal = !currentVal;

    // Optimistic update
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
      // Revert optimistic update
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

  // Master action: Enable All
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
        // Fallback optimistic
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

  // Master action: Disable All
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

  // Master action: Reset to Baseline
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

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-32 animate-fadeIn select-none">
      {/* Hero Cockpit Banner with Live Telemetry */}
      <div className="mb-5 rounded-3xl bg-gradient-to-br from-[#051F20] via-[#0B2B26] to-[#163832] p-5 sm:p-6 text-white shadow-xl border border-[#163832]/60 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DAF1DE] text-[#051F20] flex items-center justify-center font-black text-lg shadow-md shrink-0">
              SA
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-heading font-extrabold text-white tracking-tight">
                  SuperAdmin Master Command Cockpit
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DAF1DE] text-[#051F20] uppercase tracking-wider">
                  Master Authority
                </span>
              </div>
              <p className="text-xs text-[#DAF1DE]/80 mt-0.5">
                Universal operations governance, dynamic module switches, and institutional provisioning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#DAF1DE] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            {!isHomeCockpit && onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>

        {/* Live System Telemetry Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10 text-xs">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <div className="min-w-0">
              <span className="text-[10px] text-[#8EB69B] uppercase font-bold block">Database</span>
              <span className="font-mono font-bold text-white truncate block text-[11px]">TiDB Cloud:3306</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <GraduationCap size={16} className="text-[#DAF1DE] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-[#8EB69B] uppercase font-bold block">Faculty Advisors</span>
              <span className="font-bold text-white text-[11px]">{facultyList.length} Active</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Users size={16} className="text-[#DAF1DE] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-[#8EB69B] uppercase font-bold block">Student Scholars</span>
              <span className="font-bold text-white text-[11px]">{studentList.length} Active</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Sliders size={16} className="text-[#DAF1DE] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-[#8EB69B] uppercase font-bold block">Module Status</span>
              <span className="font-bold text-white text-[11px]">
                {Object.values(platformModules || {}).filter(Boolean).length} / {MODULE_CONFIGS.length} Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Deck Executive Navigation Bar */}
      <div className="sticky top-2 z-30 mb-5 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.06)] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveDeck('all')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 ${
            activeDeck === 'all'
              ? 'bg-[#163832] text-white shadow-xs'
              : 'text-[#235347] hover:bg-[#DAF1DE]'
          }`}
        >
          <Sparkles size={14} />
          <span>All Decks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeck('hub')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 ${
            activeDeck === 'hub'
              ? 'bg-[#163832] text-white shadow-xs'
              : 'text-[#235347] hover:bg-[#DAF1DE]'
          }`}
        >
          <Sliders size={14} />
          <span>Command Hub</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#DAF1DE] text-[#163832]">
            {Object.values(platformModules || {}).filter(Boolean).length}/9
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeck('faculty')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 ${
            activeDeck === 'faculty'
              ? 'bg-[#163832] text-white shadow-xs'
              : 'text-[#235347] hover:bg-[#DAF1DE]'
          }`}
        >
          <GraduationCap size={14} />
          <span>Faculty Oversight</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#DAF1DE] text-[#163832]">
            {facultyList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeck('students')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 ${
            activeDeck === 'students'
              ? 'bg-[#163832] text-white shadow-xs'
              : 'text-[#235347] hover:bg-[#DAF1DE]'
          }`}
        >
          <Users size={14} />
          <span>Student Governance</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#DAF1DE] text-[#163832]">
            {studentList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeck('matrix')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 ${
            activeDeck === 'matrix'
              ? 'bg-[#163832] text-white shadow-xs'
              : 'text-[#235347] hover:bg-[#DAF1DE]'
          }`}
        >
          <Key size={14} />
          <span>Role & Access Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeck('maintenance')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 ${
            activeDeck === 'maintenance'
              ? 'bg-[#163832] text-white shadow-xs'
              : 'text-[#235347] hover:bg-[#DAF1DE]'
          }`}
        >
          <Database size={14} />
          <span>Maintenance & DB</span>
        </button>
      </div>

      {/* Platform Module Switchboard */}
      {(activeDeck === 'all' || activeDeck === 'hub') && (
      <div className="mb-5 bg-white border border-[#DAF1DE] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#DAF1DE] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
              <Sliders size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#051F20] leading-tight">
                  Platform Module Switchboard
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347]">
                  {Object.values(platformModules || {}).filter(Boolean).length} / {MODULE_CONFIGS.length} Active
                </span>
              </div>
              <p className="text-xs text-[#235347]">
                Toggle respective club modules online or pause them across the platform for scheduled maintenance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => toggleAllModules(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition cursor-pointer"
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={() => toggleAllModules(false)}
              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 transition cursor-pointer"
            >
              Disable All
            </button>
          </div>
        </div>

        {/* Module Cards Grid with Toggle Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {MODULE_CONFIGS.map((mod) => {
            const isEnabled = platformModules?.[mod.id] !== false;
            const IconComponent = mod.icon;
            return (
              <div
                key={mod.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                  isEnabled
                    ? 'bg-[#F6FBF7] border-[#DAF1DE] hover:border-[#8EB69B]'
                    : 'bg-rose-50/40 border-rose-200/80 opacity-80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isEnabled ? 'bg-[#DAF1DE] text-[#163832]' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    <IconComponent size={16} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#051F20] truncate">{mod.name}</span>
                    </div>
                    <p className="text-[10px] text-[#235347] truncate">{mod.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isEnabled ? 'LIVE' : 'PAUSED'}
                  </span>

                  {/* Accessible Animated Toggle Switch Button */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    aria-label={`Toggle ${mod.name} ${isEnabled ? 'Off' : 'On'}`}
                    onClick={() => toggleModule(mod.id, !isEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-[#163832]' : 'bg-gray-300'
                    }`}
                    title={`Click to turn ${mod.name} ${isEnabled ? 'OFF' : 'ON'}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Action Shortcuts inside Command Hub */}
        {activeDeck === 'hub' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#DAF1DE]">
            <button
              type="button"
              onClick={() => { setActiveDeck('faculty'); setIsAddFacultyModalOpen(true); }}
              className="p-3.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] flex items-center gap-3 transition cursor-pointer text-left shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center font-bold shrink-0">
                <GraduationCap size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#051F20]">+ Provision Faculty</div>
                <div className="text-[11px] text-[#235347]">Onboard institutional advisors</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setActiveDeck('students'); setIsAddStudentModalOpen(true); }}
              className="p-3.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] flex items-center gap-3 transition cursor-pointer text-left shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center font-bold shrink-0">
                <UserPlus size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#051F20]">+ Onboard Student</div>
                <div className="text-[11px] text-[#235347]">Register scholars with Reg No</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveDeck('matrix')}
              className="p-3.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] flex items-center gap-3 transition cursor-pointer text-left shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center font-bold shrink-0">
                <Key size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#051F20]">Role Permissions</div>
                <div className="text-[11px] text-[#235347]">Configure 26 operations matrix</div>
              </div>
            </button>
          </div>
        )}
      </div>
      )}

      {/* Faculty Governance & Provisioning Suite */}
      {(activeDeck === 'all' || activeDeck === 'faculty') && (
      <div className="mb-5 bg-white border border-[#DAF1DE] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#DAF1DE] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
              <GraduationCap size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#051F20] leading-tight">
                  Faculty Governance & Provisioning
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347]">
                  {facultyList.length} Active
                </span>
              </div>
              <p className="text-xs text-[#235347]">
                SuperAdmin authority to onboard and sanction verified Faculty Advisors
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddFacultyModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 shadow-xs self-start sm:self-auto"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add Faculty Advisor</span>
          </button>
        </div>

        {/* Search Bar for Faculty */}
        {facultyList.length > 0 && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
            <input
              type="text"
              placeholder="Search faculty by name, ID, email, or department..."
              value={facultySearch}
              onChange={(e) => setFacultySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-medium text-[#051F20] placeholder-[#8EB69B] focus:outline-none focus:border-[#235347] transition"
            />
          </div>
        )}

        {/* Faculty Roster List */}
        {facultyList.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#F6FBF7] border border-dashed border-[#DAF1DE] text-center flex flex-col items-center justify-center gap-1.5 py-6">
            <GraduationCap size={28} className="text-[#8EB69B]" />
            <span className="text-xs font-bold text-[#051F20]">No Faculty Advisors Provisioned</span>
            <p className="text-xs text-[#235347] max-w-sm">
              All legacy demo accounts were purged. Click &quot;Add Faculty Advisor&quot; to onboard institutional faculty with login credentials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFaculty.map((fac) => (
              <div
                key={fac.id}
                className="p-3.5 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] flex flex-col justify-between gap-3 shadow-2xs hover:border-[#8EB69B] transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#163832] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {fac.name ? fac.name.charAt(0).toUpperCase() : 'F'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[#051F20] truncate">{fac.name}</h3>
                        <span className="font-mono text-xs text-[#235347] font-semibold">{fac.roll_no}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>
                  <div className="mt-2.5 space-y-1 text-xs text-[#235347]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail size={12} className="text-[#8EB69B] shrink-0" />
                      <span className="truncate">{fac.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Shield size={12} className="text-[#8EB69B] shrink-0" />
                      <span className="truncate">{fac.post || 'Faculty Advisor'} • {fac.department}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#DAF1DE] flex items-center justify-between">
                  <span className="text-[11px] text-[#52665C] capitalize">{fac.status || 'Active'}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditFaculty(fac)}
                      className="p-1 rounded-lg text-[#235347] hover:bg-[#DAF1DE] transition cursor-pointer"
                      title="Edit faculty details & password"
                      aria-label={`Edit faculty details for ${fac.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaculty(fac.id, fac.name)}
                      className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove faculty account"
                      aria-label={`Remove faculty account for ${fac.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Student & Member Governance Suite */}
      {(activeDeck === 'all' || activeDeck === 'students') && (
      <div className="mb-5 bg-white border border-[#DAF1DE] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#DAF1DE] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
              <Users size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#051F20] leading-tight">
                  Student & Member Governance
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347]">
                  {studentList.length} Registered
                </span>
              </div>
              <p className="text-xs text-[#235347]">
                SuperAdmin master control to onboard students, appoint squad officers, and configure credentials
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddStudentModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 shadow-xs self-start sm:self-auto"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add Student / Member</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
            <input
              type="text"
              placeholder="Search by name, roll number, or role..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-medium text-[#051F20] placeholder-[#8EB69B] focus:outline-none focus:border-[#235347] transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {['all', 'student', 'volunteer', 'coordinator', 'management', 'treasurer', 'documentation', 'promotion'].map((rKey) => (
              <button
                key={rKey}
                type="button"
                onClick={() => setStudentRoleFilter(rKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition capitalize shrink-0 cursor-pointer ${
                  studentRoleFilter === rKey
                    ? 'bg-[#163832] text-white shadow-2xs'
                    : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:border-[#8EB69B]'
                }`}
              >
                {rKey}
              </button>
            ))}
          </div>
        </div>

        {/* Student Roster Cards */}
        {filteredStudents.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#F6FBF7] border border-dashed border-[#DAF1DE] text-center flex flex-col items-center justify-center gap-1.5 py-6">
            <Users size={28} className="text-[#8EB69B]" />
            <span className="text-xs font-bold text-[#051F20]">No Students Matching Criteria</span>
            <p className="text-xs text-[#235347] max-w-sm">
              Click &quot;Add Student / Member&quot; above to onboard student scholars or officers into the club directory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredStudents.map((st) => (
              <div
                key={st.id || st.uid}
                className="p-3.5 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] flex flex-col justify-between gap-3 shadow-2xs hover:border-[#8EB69B] transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#163832] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[#051F20] truncate">{st.name}</h3>
                        <span className="font-mono text-xs text-[#235347] font-semibold">{st.roll_no || st.rollNo}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DAF1DE] text-[#163832] uppercase shrink-0">
                      {st.role || 'Student'}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1 text-xs text-[#235347]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail size={12} className="text-[#8EB69B] shrink-0" />
                      <span className="truncate">{st.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Shield size={12} className="text-[#8EB69B] shrink-0" />
                      <span className="truncate">{st.post || 'Student Member'} • {st.team || 'General'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#DAF1DE] flex items-center justify-between">
                  <span className={`text-[11px] font-semibold capitalize ${st.status === 'disabled' ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {st.status || 'Active'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditStudent(st)}
                      className="p-1 rounded-lg text-[#235347] hover:bg-[#DAF1DE] transition cursor-pointer"
                      title="Edit student details & role"
                      aria-label={`Edit details for ${st.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(st.id || st.uid, st.name)}
                      className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove student account"
                      aria-label={`Remove account for ${st.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Role Selection & Operations Authority Matrix */}
      {(activeDeck === 'all' || activeDeck === 'matrix') && (
      <div>
        {/* Role Selection Horizontal Bar */}
        <div className="mb-4">
        <label className="block text-xs font-bold text-[#163832] uppercase tracking-wider mb-2">
          Select Official Chapter Role
        </label>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {roles.map((r) => {
            const isSelected = r.role === selectedRoleKey;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => setSelectedRoleKey(r.role)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 touch-target-44 active:scale-95 border ${
                  isSelected
                    ? 'bg-[#163832] text-white border-[#163832] shadow-sm'
                    : 'bg-white text-[#163832] border-[#DAF1DE] hover:border-[#8EB69B] hover:bg-[#F6FBF7]'
                }`}
              >
                <Shield size={14} className={isSelected ? 'text-[#8EB69B]' : 'text-[#235347]'} />
                <span>{r.badge}</span>
                {r.is_registered && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#8EB69B]' : 'bg-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Role Credentials Card (5 cols) */}
        <div className="md:col-span-5 bg-white border border-[#DAF1DE] rounded-2xl p-4 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5">
          <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
                <Key size={16} strokeWidth={2.4} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#051F20] leading-tight">
                  Role Credentials
                </h2>
                <p className="text-xs text-[#235347]">Account & login access</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347]">
              {activeRoleMeta.badge}
            </span>
          </div>

          {/* Scholar Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#163832] flex items-center gap-1.5">
              <User size={13} className="text-[#235347]" /> Scholar Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] focus:outline-none focus:border-[#235347] transition"
            />
          </div>

          {/* Roll No / Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#163832] flex items-center gap-1.5">
              <Shield size={13} className="text-[#235347]" /> Username / Roll Number
            </label>
            <input
              type="text"
              value={rollInput}
              onChange={(e) => setRollInput(e.target.value)}
              placeholder="e.g. 21GEO001 or FAC01"
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#051F20] uppercase focus:outline-none focus:border-[#235347] transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#163832] flex items-center gap-1.5">
              <Mail size={13} className="text-[#235347]" /> Institutional Email
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="scholar@college.edu"
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] focus:outline-none focus:border-[#235347] transition"
            />
          </div>

          {/* Password with Generator & Copy */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#163832] flex items-center gap-1.5">
                <Lock size={13} className="text-[#235347]" /> Set / Change Password
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-xs font-bold text-[#235347] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles size={12} /> Generate
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Leave blank to keep unchanged"
                className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl pl-3 pr-10 py-2 text-xs font-mono font-semibold text-[#051F20] focus:outline-none focus:border-[#235347] transition"
              />
              <button
                type="button"
                onClick={handleCopyPassword}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#235347] hover:text-[#051F20] cursor-pointer p-1"
                title="Copy password"
              >
                {copiedPass ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#163832]">Account Status</label>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-bold text-[#051F20] focus:outline-none focus:border-[#235347] transition"
            >
              <option value="active">Active (Access Granted)</option>
              <option value="pending">Pending Institutional Review</option>
              <option value="disabled">Disabled / Suspended</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSaveCredentials}
            disabled={savingCredentials}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#235347] hover:bg-[#163832] active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition touch-target-44"
          >
            {savingCredentials ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <CheckCircle2 size={15} />
            )}
            <span>Save Role Credentials</span>
          </button>

          {/* SuperAdmin Master Role Action: Live Preview / Act as Role */}
          <button
            type="button"
            onClick={() => {
              switchRole(selectedRoleKey);
              showToast(`Switched preview session to ${activeRoleMeta.badge}`, 'success');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#DAF1DE] hover:bg-[#c6ebd0] text-[#163832] font-bold text-xs flex items-center justify-center gap-2 border border-[#8EB69B]/40 transition active:scale-98 cursor-pointer shadow-2xs"
            title={`Preview application and controls as ${activeRoleMeta.badge}`}
          >
            <Repeat size={14} strokeWidth={2.4} />
            <span>Act as {activeRoleMeta.badge} (Live Preview)</span>
          </button>
        </div>

        {/* Right Column: Operations Authority & Master Switches (7 cols) */}
        <div className="md:col-span-7 bg-white border border-[#DAF1DE] rounded-2xl p-4 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5">
          {/* Header & Master Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DAF1DE] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
                <SlidersHorizontal size={16} strokeWidth={2.4} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#051F20] leading-tight">
                    Operation Authorities
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347]">
                    {activeCount} / 26 Active
                  </span>
                </div>
                <p className="text-xs text-[#235347]">
                  Instant toggle switches for {activeRoleMeta.badge}
                </p>
              </div>
            </div>

            {/* Master Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleEnableAll}
                disabled={togglingOperation}
                className="px-2.5 py-1.5 rounded-xl bg-[#DAF1DE] hover:bg-[#8EB69B]/40 text-[#235347] font-bold text-xs border border-[#8EB69B]/40 flex items-center gap-1 cursor-pointer transition active:scale-95 touch-target-44"
              >
                <Check size={13} strokeWidth={2.5} />
                <span>Enable All</span>
              </button>

              <button
                type="button"
                onClick={handleDisableAll}
                disabled={togglingOperation || selectedRoleKey === 'super_admin'}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 flex items-center gap-1 cursor-pointer transition active:scale-95 touch-target-44 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <X size={13} strokeWidth={2.5} />
                <span>Disable All</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={togglingOperation}
                className="px-2.5 py-1.5 rounded-xl bg-[#F6FBF7] hover:bg-[#DAF1DE] text-[#235347] font-bold text-xs border border-[#DAF1DE] flex items-center gap-1 cursor-pointer transition active:scale-95 touch-target-44"
                title="Restore default institutional baseline"
              >
                <RotateCcw size={13} />
                <span>Default</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 ${
                selectedCat === 'all'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              All (26)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCat('events')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 flex items-center gap-1 ${
                selectedCat === 'events'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              <Calendar size={12} /> Events (5)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCat('finance')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 flex items-center gap-1 ${
                selectedCat === 'finance'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              <Coins size={12} /> Finance (5)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCat('docs')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 flex items-center gap-1 ${
                selectedCat === 'docs'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              <FileText size={12} /> Docs (4)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCat('ops')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 flex items-center gap-1 ${
                selectedCat === 'ops'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              <Activity size={12} /> Activities (4)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCat('admin')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 flex items-center gap-1 ${
                selectedCat === 'admin'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              <Shield size={12} /> Governance (8)
            </button>
          </div>

          {/* Operations List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
            {filteredOperations.map((op) => {
              const isActive = !!currentRolePermissions[op.key];
              return (
                <div
                  key={op.key}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-[#F6FBF7] border-[#8EB69B]/50'
                      : 'bg-white border-[#DAF1DE] opacity-80'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#051F20] truncate">
                        {op.label}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {isActive ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-xs text-[#235347] truncate mt-0.5">
                      {op.desc}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleOperation(op.key)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 touch-target-44 p-0.5 ${
                      isActive ? 'bg-[#235347]' : 'bg-gray-300'
                    }`}
                    aria-label={`Toggle ${op.label}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                        isActive ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Institutional Compliance Notice */}
          <div className="pt-2 border-t border-[#DAF1DE] flex items-center justify-between text-xs text-[#235347]">
            <div className="flex items-center gap-1.5">
              <Shield size={13} className="text-[#8EB69B]" />
              <span>Changes take effect immediately across all client devices.</span>
            </div>
            <span className="font-mono text-xs font-bold text-[#163832]">RBAC v2.4</span>
          </div>
        </div>
      </div>
      </div>
      )}

      {/* Maintenance & Database Diagnostics */}
      {(activeDeck === 'all' || activeDeck === 'maintenance') && (
      <div className="mt-5 space-y-4">
        {/* Live Database Engine Diagnostics */}
        <div className="bg-[#051F20] text-white rounded-2xl p-4 sm:p-5 border border-[#163832] shadow-xl flex flex-col gap-3 font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white tracking-wide">TiDB Cloud MySQL Distributed Database</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
              CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[#8EB69B]">Host:</span>
              <span className="font-bold text-white truncate max-w-[200px]">gateway01.ap-southeast-1.prod.aws.tidbcloud.com</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[#8EB69B]">Port:</span>
              <span className="font-bold text-emerald-400">3306 (SSL Verified)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[#8EB69B]">Dialect:</span>
              <span className="font-bold text-white">mysql+pymysql (Relational)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[#8EB69B]">Health Status:</span>
              <span className="font-bold text-emerald-400">200 OK (Live Engine)</span>
            </div>
          </div>
        </div>

        {/* Platform Data Purge & Clean Slate Controls */}
        <div className="bg-white border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(225,29,72,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <Database size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">
                  Platform Data Purge & Clean Slate
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                  Permanent Action
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Wipe all events, tasks, registrations, expenses, and dummy accounts. Retain solely SuperAdmin (SA01).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsConfirmPurgeOpen(true)}
            disabled={isPurging}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 shadow-xs self-start sm:self-auto disabled:opacity-50"
          >
            <Trash2 size={14} />
            <span>{isPurging ? 'Purging Data...' : 'Purge All Platform Data'}</span>
          </button>
        </div>
      </div>
      )}

      {/* Add Faculty Modal */}
      {isAddFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl w-full max-w-lg p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
                  <GraduationCap size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#051F20]">Provision Faculty Advisor</h3>
                  <p className="text-xs text-[#235347]">Grant official faculty credentials & sanction authority</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFacultyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Faculty ID / Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyForm.roll_no}
                    onChange={(e) => setFacultyForm({ ...facultyForm, roll_no: e.target.value.toUpperCase() })}
                    placeholder="e.g. FAC01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Institutional Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    placeholder="e.g. sarah.jenkins@college.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={facultyForm.department}
                    onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })}
                    placeholder="e.g. Geoinformatics Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Designation / Post
                  </label>
                  <input
                    type="text"
                    value={facultyForm.post}
                    onChange={(e) => setFacultyForm({ ...facultyForm, post: e.target.value })}
                    placeholder="e.g. Faculty Advisor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={facultyForm.phone}
                    onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                    placeholder="e.g. +91 94420 18820"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    value={facultyForm.password}
                    onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                    placeholder="GeoHub2026!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#DAF1DE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFacultyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={facultySubmitting}
                  className="px-5 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <UserPlus size={14} />
                  <span>{facultySubmitting ? 'Provisioning...' : 'Provision Faculty'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Faculty Modal */}
      {isEditFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl w-full max-w-lg p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE] text-[#235347] flex items-center justify-center">
                  <GraduationCap size={22} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#051F20]">Edit Faculty Advisor</h3>
                  <p className="text-xs text-[#235347]">Update advisor record, post title, credentials & status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditFacultyModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateFaculty} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">
                  Full Name & Salutation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFacultyForm.name}
                  onChange={(e) => setEditFacultyForm({ ...editFacultyForm, name: e.target.value })}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Faculty ID / Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFacultyForm.roll_no}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, roll_no: e.target.value.toUpperCase() })}
                    placeholder="e.g. FAC01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Institutional Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editFacultyForm.email}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, email: e.target.value })}
                    placeholder="e.g. sarah.jenkins@college.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editFacultyForm.department}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, department: e.target.value })}
                    placeholder="e.g. Geoinformatics Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Designation / Post
                  </label>
                  <input
                    type="text"
                    value={editFacultyForm.post}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, post: e.target.value })}
                    placeholder="e.g. Faculty Advisor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={editFacultyForm.phone}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, phone: e.target.value })}
                    placeholder="e.g. +91 94420 18820"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#163832] mb-1">
                    Status
                  </label>
                  <select
                    value={editFacultyForm.status}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#163832] mb-1">
                  Reset Password <span className="text-[10px] text-gray-500 font-normal">(Optional, leave blank to retain current)</span>
                </label>
                <input
                  type="text"
                  value={editFacultyForm.password}
                  onChange={(e) => setEditFacultyForm({ ...editFacultyForm, password: e.target.value })}
                  placeholder="Enter new password (optional)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
                />
              </div>

              <div className="pt-3 border-t border-[#DAF1DE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditFacultyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editFacultySubmitting}
                  className="px-5 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  <span>{editFacultySubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard Student / Officer Modal */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl w-full max-w-lg p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
                  <UserPlus size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#051F20]">Onboard Student or Officer</h3>
                  <p className="text-xs text-[#235347]">Provision student scholar or club role</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-1 rounded-xl hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Roll / Reg No *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.roll_no}
                    onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value.toUpperCase() })}
                    placeholder="e.g. 23GEO045"
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="student@college.edu"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Role Type *</label>
                  <select
                    value={studentForm.role}
                    onChange={(e) => setStudentForm({ ...studentForm, role: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none bg-white cursor-pointer font-semibold"
                  >
                    <option value="student">Student Scholar</option>
                    <option value="member">Club Member</option>
                    <option value="volunteer">Volunteer (Gate Check-In)</option>
                    <option value="coordinator">President / Coordinator</option>
                    <option value="treasurer">Treasurer (Finance)</option>
                    <option value="documentation">Documentation Lead</option>
                    <option value="promotion">Promotion Lead</option>
                    <option value="management">Management Lead</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Year of Study</label>
                  <select
                    value={studentForm.year_of_study}
                    onChange={(e) => setStudentForm({ ...studentForm, year_of_study: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none bg-white cursor-pointer"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="PG / Research">PG / Research</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Squad / Team</label>
                  <input
                    type="text"
                    value={studentForm.team}
                    onChange={(e) => setStudentForm({ ...studentForm, team: e.target.value })}
                    placeholder="e.g. Field Mapping & GIS"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Post / Title</label>
                  <input
                    type="text"
                    value={studentForm.post}
                    onChange={(e) => setStudentForm({ ...studentForm, post: e.target.value })}
                    placeholder="e.g. Squad Lead / Member"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Department</label>
                  <input
                    type="text"
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    placeholder="Geoinformatics Engineering"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    placeholder="Default: geohub"
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#DAF1DE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={studentSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <UserPlus size={14} />
                  <span>{studentSubmitting ? 'Onboarding...' : 'Onboard Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student / Officer Modal */}
      {isEditStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl w-full max-w-lg p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
                  <Pencil size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#051F20]">Edit Student or Officer Account</h3>
                  <p className="text-xs text-[#235347]">Update profile, role, or reset password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditStudentModalOpen(false)}
                className="p-1 rounded-xl hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.name}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Roll / Reg No *</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.roll_no}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, roll_no: e.target.value.toUpperCase() })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editStudentForm.email}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Role Type *</label>
                  <select
                    value={editStudentForm.role}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, role: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none bg-white cursor-pointer font-semibold"
                  >
                    <option value="student">Student Scholar</option>
                    <option value="member">Club Member</option>
                    <option value="volunteer">Volunteer (Gate Check-In)</option>
                    <option value="coordinator">President / Coordinator</option>
                    <option value="treasurer">Treasurer (Finance)</option>
                    <option value="documentation">Documentation Lead</option>
                    <option value="promotion">Promotion Lead</option>
                    <option value="management">Management Lead</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Year of Study</label>
                  <select
                    value={editStudentForm.year_of_study}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, year_of_study: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none bg-white cursor-pointer"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="PG / Research">PG / Research</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Squad / Team</label>
                  <input
                    type="text"
                    value={editStudentForm.team}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, team: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Post / Title</label>
                  <input
                    type="text"
                    value={editStudentForm.post}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, post: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Account Status</label>
                  <select
                    value={editStudentForm.status}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, status: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none bg-white cursor-pointer font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editStudentForm.phone}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#163832] mb-1">Reset Password (Optional)</label>
                  <input
                    type="password"
                    value={editStudentForm.password}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-[#DAF1DE] focus:border-[#163832] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#DAF1DE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editStudentSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  <span>{editStudentSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Purge Modal */}
      {isConfirmPurgeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-rose-300 shadow-2xl w-full max-w-md p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Confirm Platform Data Purge</h3>
                <p className="text-xs text-rose-600 font-semibold">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This will permanently delete all events, registrations, tasks, finances, expenses, and all user accounts except <strong>System SuperAdmin (SA01)</strong>. Squad shells will be emptied.
            </p>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1 font-medium">
              <div>• Retains only SuperAdmin: <code>SA01</code> / <code>GeoHub2026!</code></div>
              <div>• Clears all test feeds and old cached records.</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmPurgeOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurgeAllData}
                disabled={isPurging}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span>{isPurging ? 'Purging...' : 'Yes, Purge Everything'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminOperationsView;

