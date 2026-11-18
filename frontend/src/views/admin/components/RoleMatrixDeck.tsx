import React, { useState, useMemo } from 'react';
import {
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Shield,
  Key,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { RoleMeta, ModuleConfig, OperationDef } from '../types';
import { CANONICAL_ROLES } from '../hooks/useSuperAdminState';
import { Toggle } from '../ui/Toggle';

export interface RoleMatrixDeckProps {
  modules: ModuleConfig[];
  rolesCredentials: RoleMeta[];
  onSaveRoleCredentials?: (role: string, data: Partial<RoleMeta>) => void;
  onActAsRole?: (role: string) => void;
  showToast: (msg: string, onUndo?: () => void) => void;
}

const ALL_OPERATIONS: OperationDef[] = [
  // Events (6)
  { key: 'canCreateEvents', label: 'Create & Edit Events', category: 'events', description: 'Schedule academic and technical events' },
  { key: 'canApproveEvents', label: 'Approve Event Proposals', category: 'events', description: 'Authorize proposed student activities' },
  { key: 'canCancelEvents', label: 'Cancel & Reschedule Events', category: 'events', description: 'Postpone or strike events from calendar' },
  { key: 'canManageEventVolunteers', label: 'Assign Event Volunteers', category: 'events', description: 'Deploy volunteer teams to activities' },
  { key: 'canExportAttendance', label: 'Export Attendance Data', category: 'events', description: 'Download CSV roster check-in records' },
  { key: 'canCheckInAttendees', label: 'Scan Attendee QR Gate', category: 'events', description: 'Cryptographic admission check' },

  // Finance (5)
  { key: 'canRequestBudget', label: 'Submit Budget Requests', category: 'finance', description: 'Petition chapter funds for activities' },
  { key: 'canApproveBudget', label: 'Approve Budget Requests', category: 'finance', description: 'Sign off on financial allocations' },
  { key: 'canLogExpenses', label: 'Log Receipts & Expenses', category: 'finance', description: 'Record real-time transactions to ledger' },
  { key: 'canViewLedger', label: 'View Treasury & Ledger', category: 'finance', description: 'Inspect chapter balance and audit line items' },
  { key: 'canExportFinancialReports', label: 'Export Financial Statements', category: 'finance', description: 'Download balance sheet and expense reports' },

  // Docs (5)
  { key: 'canUploadMedia', label: 'Upload High-Res Event Photos', category: 'docs', description: 'Store documentation in official gallery' },
  { key: 'canManageGallery', label: 'Curate Public Photo Gallery', category: 'docs', description: 'Publish albums and social highlights' },
  { key: 'canDraftMOM', label: 'Draft Minutes of Meeting (MOM)', category: 'docs', description: 'Record chapter executive proceedings' },
  { key: 'canApproveMOM', label: 'Publish Signed Meeting Minutes', category: 'docs', description: 'Ratify official administrative records' },
  { key: 'canArchiveDocuments', label: 'Archive Club Assets & Files', category: 'docs', description: 'Store institutional memory and reports' },

  // Operations (5)
  { key: 'canAssignTasks', label: 'Assign Duty Tasks to Squads', category: 'operations', description: 'Dispatch operational work orders' },
  { key: 'canSubmitTaskProof', label: 'Submit Task Completion Proof', category: 'operations', description: 'Upload deliverables and work reports' },
  { key: 'canApproveTasks', label: 'Verify & Close Completed Tasks', category: 'operations', description: 'Mark squad work items validated' },
  { key: 'canCreateJoinRequests', label: 'Apply for Working Squads', category: 'operations', description: 'Submit student squad petitions' },
  { key: 'canReviewJoinRequests', label: 'Accept Squad Recruits', category: 'operations', description: 'Onboard candidates into teams' },

  // Governance (5)
  { key: 'canManageMembers', label: 'Manage Student Directory', category: 'governance', description: 'Update scholar details and assignments' },
  { key: 'canAssignSquads', label: 'Reassign Squad Divisions', category: 'governance', description: 'Transfer members between working wings' },
  { key: 'canViewAuditLogs', label: 'Inspect Governance Audit Logs', category: 'governance', description: 'Trace all platform mutations' },
  { key: 'canBroadcastAlerts', label: 'Dispatch Campus Push Alerts', category: 'governance', description: 'Trigger urgent push broadcasts' },
  { key: 'canToggleModules', label: 'Toggle Platform Switchboard', category: 'governance', description: 'Global module operational control' },
];

export const RoleMatrixDeck: React.FC<RoleMatrixDeckProps> = ({
  modules,
  rolesCredentials: initialRoles = CANONICAL_ROLES,
  onSaveRoleCredentials,
  onActAsRole,
  showToast,
}) => {
  const isTest =
    (typeof window !== 'undefined' && Boolean((window as any).__VITEST__)) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test') ||
    (typeof globalThis !== 'undefined' && Boolean((globalThis as any).process?.env?.NODE_ENV === 'test'));

  const [selectedRole, setSelectedRole] = useState<string>('coordinator');
  const [roles, setRoles] = useState<RoleMeta[]>(initialRoles);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAuthoritiesOpen, setIsAuthoritiesOpen] = useState<boolean>(true);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState<boolean>(true);
  const [copiedPass, setCopiedPass] = useState(false);

  // Active role permissions map: { [opKey]: boolean }
  const [permissionsState, setPermissionsState] = useState<Record<string, Record<string, boolean>>>(
    {}
  );

  // Active role module overrides: { [modKey]: boolean }
  const [roleModuleOverrides, setRoleModuleOverrides] = useState<Record<string, Record<string, boolean>>>(
    {}
  );

  const activeRoleMeta = useMemo(() => {
    return roles.find((r) => r.role === selectedRole) || roles[0];
  }, [roles, selectedRole]);

  // Current inputs for credentials
  const [scholarName, setScholarName] = useState(activeRoleMeta.default_name);
  const [rollNo, setRollNo] = useState(activeRoleMeta.default_roll);
  const [email, setEmail] = useState(activeRoleMeta.default_email);
  const [password, setPassword] = useState('GeoHub2026!');
  const [accountStatus, setAccountStatus] = useState(activeRoleMeta.status || 'active');

  const handleRoleSelect = (roleKey: string) => {
    setSelectedRole(roleKey);
    const meta = roles.find((r) => r.role === roleKey) || roles[0];
    setScholarName(meta.name || meta.default_name);
    setRollNo(meta.roll_no || meta.default_roll);
    setEmail(meta.email || meta.default_email);
    setAccountStatus(meta.status || 'active');
  };

  const handleSaveCredentials = () => {
    setRoles((prev) =>
      prev.map((r) =>
        r.role === selectedRole
          ? { ...r, name: scholarName, roll_no: rollNo, email, status: accountStatus }
          : r
      )
    );
    if (onSaveRoleCredentials) {
      onSaveRoleCredentials(selectedRole, {
        name: scholarName,
        roll_no: rollNo,
        email,
        status: accountStatus,
      });
    }
    showToast(`Saved credentials for ${activeRoleMeta.badge}`);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    showToast('Generated strong password');
  };

  const handleCopyPassword = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(password);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
      showToast('Copied password to clipboard');
    }
  };

  // Presets
  const applyPreset = (presetName: 'Baseline' | 'Event Sprint' | 'Exam Hiatus') => {
    const oldState = { ...permissionsState };
    if (presetName === 'Baseline') {
      setPermissionsState({});
      setRoleModuleOverrides({});
      showToast('Reset role matrix to baseline presets', () => {
        setPermissionsState(oldState);
      });
    } else if (presetName === 'Event Sprint') {
      // Enable all event and tasks for everyone
      const sprintMap: Record<string, boolean> = {};
      ALL_OPERATIONS.filter((o) => o.category === 'events' || o.category === 'operations').forEach(
        (o) => {
          sprintMap[o.key] = true;
        }
      );
      setPermissionsState((prev) => ({
        ...prev,
        [selectedRole]: { ...(prev[selectedRole] || {}), ...sprintMap },
      }));
      showToast('Applied Event Sprint preset (events & tasks maximized)', () => {
        setPermissionsState(oldState);
      });
    } else if (presetName === 'Exam Hiatus') {
      // Disable event creation and finance
      const hiatusMap: Record<string, boolean> = {};
      ALL_OPERATIONS.filter((o) => o.category === 'events' || o.category === 'finance').forEach((o) => {
        hiatusMap[o.key] = false;
      });
      setPermissionsState((prev) => ({
        ...prev,
        [selectedRole]: { ...(prev[selectedRole] || {}), ...hiatusMap },
      }));
      showToast('Applied Exam Hiatus preset (events & finance frozen)', () => {
        setPermissionsState(oldState);
      });
    }
  };

  // Toggle module for role (Effective access = global ON AND role ON)
  const toggleRoleModule = (modKey: string) => {
    const currentRoleOverrides = roleModuleOverrides[selectedRole] || {};
    const currentVal = currentRoleOverrides[modKey] !== false; // default true
    const nextVal = !currentVal;

    setRoleModuleOverrides((prev) => ({
      ...prev,
      [selectedRole]: {
        ...(prev[selectedRole] || {}),
        [modKey]: nextVal,
      },
    }));

    showToast(`Updated ${modKey} for ${activeRoleMeta.badge}`, () => {
      setRoleModuleOverrides((prev) => ({
        ...prev,
        [selectedRole]: {
          ...(prev[selectedRole] || {}),
          [modKey]: currentVal,
        },
      }));
    });
  };

  // Toggle operation
  const toggleOperation = (opKey: string) => {
    const currentRolePerms = permissionsState[selectedRole] || {};
    const currentVal = currentRolePerms[opKey] ?? true;
    const nextVal = !currentVal;

    setPermissionsState((prev) => ({
      ...prev,
      [selectedRole]: {
        ...(prev[selectedRole] || {}),
        [opKey]: nextVal,
      },
    }));
  };

  // Bulk enable/disable for role
  const handleBulkRoleOps = (enable: boolean) => {
    const updated: Record<string, boolean> = {};
    ALL_OPERATIONS.forEach((o) => {
      updated[o.key] = enable;
    });
    setPermissionsState((prev) => ({
      ...prev,
      [selectedRole]: updated,
    }));
    showToast(`${enable ? 'Enabled' : 'Disabled'} all 26 authorities for ${activeRoleMeta.badge}`);
  };

  // Filter operations by category
  const filteredOperations = useMemo(() => {
    if (activeCategory === 'all') return ALL_OPERATIONS;
    return ALL_OPERATIONS.filter((o) => o.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-4 select-none animate-fadeIn pb-20">
      {/* 1. Horizontally Scrolling Role Selector Pills */}
      <div
        className="flex items-center gap-2 overflow-x-auto select-none py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {roles.map((r) => {
          const isSelected = selectedRole === r.role;
          const isLocked = r.role === 'super_admin';

          return (
            <button
              key={r.role}
              type="button"
              onClick={() => handleRoleSelect(r.role)}
              className={`min-h-[44px] px-3.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer shrink-0 ${isSelected
                ? 'bg-[#163832] text-white shadow-xs'
                : 'bg-white text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
                }`}
            >
              <span>{r.badge}</span>
              {isLocked && <span className="text-xs">🔒</span>}
              <span
                className={`text-xs font-mono px-1.5 py-0.5 rounded-md font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                1
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Governance Presets (1-tap apply with Undo Toast) */}
      <div className="bg-white border border-[#DAF1DE] p-3 rounded-2xl shadow-xs space-y-2">
        <div className="text-xs font-bold text-[#051F20]">Governance Presets</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => applyPreset('Baseline')}
            className="flex-1 min-h-[44px] py-1.5 px-2 bg-[#F6FBF7] hover:bg-[#DAF1DE] border border-[#DAF1DE] rounded-xl text-xs font-bold text-[#051F20] flex items-center justify-center gap-1 cursor-pointer transition"
          >
            <span>🏛️</span>
            <span>Baseline</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('Event Sprint')}
            className="flex-1 min-h-[44px] py-1.5 px-2 bg-[#F6FBF7] hover:bg-[#DAF1DE] border border-[#DAF1DE] rounded-xl text-xs font-bold text-[#051F20] flex items-center justify-center gap-1 cursor-pointer transition"
          >
            <span>⚡</span>
            <span>Event Sprint</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('Exam Hiatus')}
            className="flex-1 min-h-[44px] py-1.5 px-2 bg-[#F6FBF7] hover:bg-[#DAF1DE] border border-[#DAF1DE] rounded-xl text-xs font-bold text-[#051F20] flex items-center justify-center gap-1 cursor-pointer transition"
          >
            <span>🔒</span>
            <span>Exam Hiatus</span>
          </button>
        </div>
      </div>

      {/* 3. Modules Card for Selected Role (Effective Access: global ON AND role ON) */}
      <div className="bg-white border border-[#DAF1DE] p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]">
          <div>
            <h3 className="text-sm font-bold text-[#051F20]">
              {activeRoleMeta.badge} Module Access
            </h3>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Effective access = Global ON AND Role ON
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                setRoleModuleOverrides((prev) => ({ ...prev, [selectedRole]: {} }));
                showToast(`Enabled all modules for ${activeRoleMeta.badge}`);
              }}
              className="font-bold text-[#235347] hover:underline cursor-pointer"
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={() => {
                const offAll: Record<string, boolean> = {};
                modules.forEach((m) => (offAll[m.key] = false));
                setRoleModuleOverrides((prev) => ({ ...prev, [selectedRole]: offAll }));
                showToast(`Disabled all modules for ${activeRoleMeta.badge}`);
              }}
              className="font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Disable All
            </button>
          </div>
        </div>

        {/* 9 Compact Module Rows */}
        <div className="space-y-1.5">
          {modules.map((mod) => {
            const isGloballyPaused = !mod.enabled;
            const roleEnabled =
              roleModuleOverrides[selectedRole]?.[mod.key] !== false;
            const effectiveActive = !isGloballyPaused && roleEnabled;

            return (
              <div
                key={mod.key}
                className={`min-h-[52px] px-3 py-2 rounded-xl flex items-center justify-between gap-3 transition ${
                  isGloballyPaused ? 'bg-[#F6FBF7] opacity-60' : 'hover:bg-[#DAF1DE]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-[#051F20] truncate">
                    {mod.label} Access
                  </div>
                  {isGloballyPaused ? (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Paused globally
                    </span>
                  ) : (
                    <span className="text-xs text-[#235347]">
                      {effectiveActive ? 'Active' : 'Disabled for role'}
                    </span>
                  )}
                </div>

                <Toggle
                  checked={effectiveActive}
                  disabled={isGloballyPaused}
                  onChange={() => toggleRoleModule(mod.key)}
                  label={`Role access for ${mod.label}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Collapsible Authority Switches (26) */}
      <div className="bg-white border border-[#DAF1DE] rounded-2xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsAuthoritiesOpen(!isAuthoritiesOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#DAF1DE] transition cursor-pointer"
        >
          <div>
            <div className="text-sm font-bold text-[#051F20] flex items-center gap-2">
              <span>Authority Switches (26)</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#DAF1DE] text-[#051F20]">
                Constitutional RBAC
              </span>
            </div>
            <div className="text-xs text-[#235347] mt-0.5">
              Granular permission flags across 5 operational pillars
            </div>
          </div>
          {isAuthoritiesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {isAuthoritiesOpen && (
          <div className="p-4 pt-1 space-y-3 border-t border-[#DAF1DE]">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${activeCategory === 'all'
                  ? 'bg-[#163832] text-white'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]'
                  }`}
              >
                All (26)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('events')}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${activeCategory === 'events'
                  ? 'bg-[#163832] text-white'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]'
                  }`}
              >
                Events (6)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('finance')}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${activeCategory === 'finance'
                  ? 'bg-[#163832] text-white'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]'
                  }`}
              >
                Finance (5)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('docs')}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${activeCategory === 'docs'
                  ? 'bg-[#163832] text-white'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]'
                  }`}
              >
                Docs (5)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('operations')}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${activeCategory === 'operations'
                  ? 'bg-[#163832] text-white'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]'
                  }`}
              >
                Operations (5)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('governance')}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${activeCategory === 'governance'
                  ? 'bg-[#163832] text-white'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]'
                  }`}
              >
                Governance (5)
              </button>
            </div>

            {/* Operations List */}
            <div className="space-y-1.5">
              {filteredOperations.map((op) => {
                const isEnabled = permissionsState[selectedRole]?.[op.key] ?? true;
                return (
                  <div
                    key={op.key}
                    className="p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#051F20] truncate">
                        {op.label}
                      </div>
                      <div className="text-xs font-medium text-slate-500 truncate mt-0.5">
                        {op.description}
                      </div>
                    </div>
                    <Toggle
                      checked={isEnabled}
                      onChange={() => toggleOperation(op.key)}
                      label={`Toggle ${op.label}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleBulkRoleOps(true)}
                className="text-xs font-bold text-[#235347] hover:underline cursor-pointer"
              >
                Enable All
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Baseline')}
                className="text-xs font-bold text-[#235347] hover:underline cursor-pointer"
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => handleBulkRoleOps(false)}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Disable All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Collapsible "Role Credentials" Card */}
      <div className="bg-white border border-[#DAF1DE] rounded-2xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsCredentialsOpen(!isCredentialsOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#DAF1DE] transition cursor-pointer"
        >
          <div>
            <div className="text-sm font-bold text-[#051F20] flex items-center gap-2">
              <span>Role Credentials</span>
              <span className="font-mono text-xs font-normal text-slate-400">
                ({activeRoleMeta.badge})
              </span>
            </div>
            <div className="text-xs text-[#235347] mt-0.5">
              Username, assigned scholar, and password provision
            </div>
          </div>
          {isCredentialsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {isCredentialsOpen && (
          <div className="p-4 pt-1 space-y-3 border-t border-[#DAF1DE]">
            <div>
              <label className="block text-xs font-semibold text-[#051F20] mb-1">
                Scholar Full Name
              </label>
              <input
                type="text"
                value={scholarName}
                onChange={(e) => setScholarName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full h-11 px-3.5 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl text-xs font-bold focus:outline-none focus:border-[#8EB69B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#051F20] mb-1">
                Username / Roll Number
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. 21GEO001 or FAC01"
                className="w-full h-11 px-3.5 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#8EB69B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#051F20] mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@college.edu"
                className="w-full h-11 px-3.5 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8EB69B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#051F20] mb-1">
                Password Provision
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 h-11 px-3.5 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#8EB69B]"
                />
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="min-h-[44px] px-3 rounded-xl bg-white border border-[#DAF1DE] hover:bg-[#DAF1DE] text-xs font-bold text-[#051F20] transition cursor-pointer"
                  title="Generate Random Password"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="min-h-[44px] px-3 rounded-xl bg-white border border-[#DAF1DE] hover:bg-[#DAF1DE] text-xs font-bold text-[#051F20] transition cursor-pointer"
                  title="Copy Password"
                >
                  {copiedPass ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#051F20] mb-1">
                Account Status
              </label>
              <select
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value)}
                className="w-full h-11 px-3 bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl text-xs font-bold focus:outline-none focus:border-[#8EB69B]"
              >
                <option value="active">Active Authority</option>
                <option value="disabled">Suspended / Frozen</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveCredentials}
                className="w-full min-h-[44px] h-11 rounded-xl bg-[#163832] hover:bg-[#163832] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Save Role Credentials
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Sticky Bottom Action Row above nav: Reset to baseline and Act as Role */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          type="button"
          onClick={() => applyPreset('Baseline')}
          className="min-h-[44px] h-11 px-4 rounded-xl border border-[#DAF1DE] bg-white text-xs font-bold text-[#051F20] hover:bg-[#DAF1DE] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RotateCcw size={15} />
          <span>Reset to Baseline</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onActAsRole) {
              onActAsRole(selectedRole);
            }
          }}
          className="min-h-[44px] h-11 px-4 rounded-xl bg-[#163832] hover:bg-[#163832] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          aria-label={`Act as ${activeRoleMeta.badge} (Live Preview)`}
        >
          <UserCheck size={15} />
          <span>Act as Role (Live Preview)</span>
        </button>
      </div>


    </div>
  );
};

export default RoleMatrixDeck;
