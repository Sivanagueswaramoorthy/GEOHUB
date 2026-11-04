import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import {
  ALL_MODULE_IDS,
  MODULE_CONFIGS,
  ModuleId,
  ModuleSectionId,
  moduleAccess,
  can,
  canRemoveMember,
  canAddSquadMember,
  canAssignSquadLead,
  isEventEnded,
  canEditMember,
  canApproveBudgetRequest,
  normalizeHubRole,
  MOCK_POSTS_WITH_STATUSES,
  MOCK_SQUAD_GRANTS,
  revokeSquadAccess,
  grantSquadAccess,
  CampaignPostItem,
  SquadGrant,
} from '../../core/permissions';
import {
  PageHeader,
  SearchField,
  EmptyState,
  ErrorState,
  Skeleton,
  HubCard,
  AccessChip,
  ModuleSection,
  ModuleGuard,
  useAccess,
  ConfirmDialog,
  PillButton,
} from '../../components/shared';
import { ICON_MAP } from '../../components/shared/HubCard';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  Download,
  Plus,
  Shield,
  Trash2,
  Edit2,
  Clock,
  User,
  AlertCircle,
  QrCode,
  Scan,
  Crown,
  ChevronRight,
  ChevronDown,
  Check,
  Sparkles,
  Search,
  X,
  MapPin,
  Filter,
  Megaphone,
  Coins,
  Users,
  RefreshCw,
  Maximize2,
  Calendar,
  UserX,
  UserCheck,
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  actor: string;
  module: ModuleId;
  event: string;
  action: string;
  time: string;
}

interface BudgetRequest {
  id: string;
  title: string;
  event: string;
  amount: number;
  category: string;
  requesterId: string;
  requesterName: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Flagged';
  date: string;
  note?: string;
}

interface ExpenseItem {
  id: string;
  event: string;
  amount: number;
  category: string;
  description: string;
  actor: string;
  time: string;
  billProof?: string;
}

const SECTION_ORDER: ModuleSectionId[] = [
  'People',
  'Events',
  'Finance',
  'Media and Docs',
  'Review',
];

export const ExploreActivitiesView: React.FC = () => {
  const { currentUser, events } = useApp();
  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isDutiesCollapsed, setIsDutiesCollapsed] = useState<boolean>(false);

  // Dynamic duty status toggling
  const [dutyStatuses, setDutyStatuses] = useState<Record<string, 'pending' | 'in_progress' | 'done'>>({});

  const handleToggleDuty = (eventId: string, squad: string) => {
    const key = `${eventId}-${squad}`;
    setDutyStatuses((prev) => ({
      ...prev,
      [key]: prev[key] === 'done' ? 'in_progress' : 'done',
    }));
  };

  // Derive duties assigned to the current active user across events
  const myDuties = (events || []).flatMap((ev: any) => {
    if (!ev.duties) return [];
    const entries = Array.isArray(ev.duties)
      ? ev.duties.map((d: any, idx: number) => [`duty-${idx}`, d])
      : Object.entries(ev.duties);
    return entries
      .filter(([_, d]: any) => {
        if (!d) return false;
        return (
          d.assignedTo === currentUser?.uid ||
          (currentUser?.name && (d.assigneeName || d.assignedToName)?.toLowerCase() === currentUser?.name?.toLowerCase()) ||
          (currentUser?.role === 'student' && (d.assignedTo === 'u_member_04' || d.assignedTo === 'u_07'))
        );
      })
      .map(([squadKey, d]: any) => {
        const key = `${ev.id}-${squadKey}`;
        return {
          eventId: ev.id,
          eventTitle: ev.title,
          eventStatus: ev.status,
          endDate: ev.endDate,
          squad: d.squad || squadKey,
          task: d.task || d.workDescription,
          status: dutyStatuses[key] || d.status || 'in_progress',
          isEnded: isEventEnded(ev),
        };
      });
  });

  // Live mock state for interactive module behaviors
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([
    {
      id: 'req-1',
      title: 'Drone Sensor Calibration & Servicing',
      event: 'Annual Drone Survey',
      amount: 14500,
      category: 'Equipment',
      requesterId: 'usr-treasurer-vikram',
      requesterName: 'Vikram Mehta (Treasurer)',
      status: 'Pending',
      date: '2026-10-28',
    },
    {
      id: 'req-2',
      title: 'Field Camp Logistics & Hydration',
      event: 'Campus Topo Camp 2026',
      amount: 3200,
      category: 'Logistics',
      requesterId: 'usr-mgmt-1',
      requesterName: 'Divya Rao (Management)',
      status: 'Approved',
      date: '2026-10-25',
    },
    {
      id: 'req-3',
      title: 'Keynote Speaker Honorarium',
      event: 'GeoTech Annual Symposium',
      amount: 10000,
      category: 'Honorarium',
      requesterId: 'usr-faculty-1',
      requesterName: 'Dr. Ramesh (Faculty)',
      status: 'Pending',
      date: '2026-10-29',
    },
  ]);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      id: 'exp-1',
      event: 'Annual Drone Survey',
      amount: 4200,
      category: 'Batteries & Cables',
      description: 'LiPo flight batteries replacement kit',
      actor: 'Vikram Mehta',
      time: '2026-10-27 11:30 AM',
      billProof: 'INV-4412.pdf',
    },
    {
      id: 'exp-2',
      event: 'Campus Topo Camp 2026',
      amount: 1850,
      category: 'Refreshments',
      description: 'Mineral water & glucose for field surveyors',
      actor: 'Vikram Mehta',
      time: '2026-10-26 04:15 PM',
      billProof: 'INV-3981.pdf',
    },
  ]);

  const [posts, setPosts] = useState<CampaignPostItem[]>(MOCK_POSTS_WITH_STATUSES);
  const [grants, setGrants] = useState<SquadGrant[]>(MOCK_SQUAD_GRANTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      actor: 'System Admin',
      module: 'treasury',
      event: 'Annual Drone Survey',
      action: 'Budget baseline configured',
      time: '2026-10-20T09:00:00Z',
    },
  ]);

  // Record an audit log entry on every WRITE action
  const logAudit = (moduleId: ModuleId, eventName: string, actionName: string) => {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      actor: currentUser?.name || 'Authorized User',
      module: moduleId,
      event: eventName,
      action: actionName,
      time: new Date().toISOString(),
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const hubRole = normalizeHubRole(currentUser?.role);

  // Role display label
  const roleDisplayLabel = (() => {
    switch (hubRole) {
      case 'faculty':
        return 'Faculty Advisor';
      case 'president':
      case 'coordinator':
        return 'President / Coordinator';
      case 'treasurer':
        return 'Treasurer';
      case 'promotion':
        return 'Promotion Team';
      case 'documentation':
        return 'Documentation Team';
      case 'management':
        return 'Management Team';
      default:
        return 'Student / Member';
    }
  })();

  // Filter modules visible to the current role (HIDDEN modules are omitted)
  const visibleModuleIds = ALL_MODULE_IDS.filter((id) => {
    const access = moduleAccess(currentUser, id);
    return access !== 'hidden';
  });

  // Search filter (applicable if >= 8 modules)
  const filteredModuleIds = visibleModuleIds.filter((id) => {
    if (!searchQuery.trim()) return true;
    const config = MODULE_CONFIGS[id];
    const q = searchQuery.toLowerCase().trim();
    return (
      config.name.toLowerCase().includes(q) ||
      config.description.toLowerCase().includes(q)
    );
  });

  // Calculate pending counts per module
  const getPendingCount = (moduleId: ModuleId): number => {
    if (moduleId === 'approvals') return 3;
    if (moduleId === 'lead_activity_review') return 2;
    if (moduleId === 'treasury') {
      return budgetRequests.filter((b) => b.status === 'Pending').length;
    }
    if (moduleId === 'campaign_post') {
      return posts.filter((p) => p.status === 'Submitted').length;
    }
    return 0;
  };

  // Determine HubCard access variant
  const getCardAccessType = (
    moduleId: ModuleId
  ): 'manage' | 'view_only' | 'approve' => {
    const access = moduleAccess(currentUser, moduleId);
    if (access === 'read') return 'view_only';
    if (access === 'write') {
      if (can(currentUser?.role, moduleId, 'approve')) {
        return 'approve';
      }
      return 'manage';
    }
    return 'view_only';
  };

  // If a module is selected, render drill-down wrapped in ModuleGuard
  if (selectedModule) {
    const config = MODULE_CONFIGS[selectedModule];
    const access = moduleAccess(currentUser, selectedModule);
    const readOnly = access === 'read';
    const canApprove = can(currentUser?.role, selectedModule, 'approve');

    return (
      <ModuleGuard
        moduleId={selectedModule}
        fallback={
          <div className="max-w-4xl mx-auto px-4 py-6 select-none animate-fadeIn">
            <button
              type="button"
              onClick={() => setSelectedModule(null)}
              data-testid="btn-back-hub"
              className="h-10 px-3.5 rounded-full bg-white text-[#163832] border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.06)] flex items-center gap-1.5 text-xs font-bold hover:bg-[#F6FBF7] active:scale-95 transition-all touch-target-44 cursor-pointer mb-6"
              aria-label="Back to Operations Hub"
            >
              <ArrowLeft size={16} strokeWidth={2.2} />
              <span>Back to Operations Hub</span>
            </button>
            <div className="p-8 text-center bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.06)]">
              <AlertCircle className="w-12 h-12 mx-auto text-[#D9534F] mb-3" />
              <h2 className="font-heading font-bold text-[#051F20] text-lg">
                Access Denied
              </h2>
              <p className="text-xs text-[#235347] mt-1">
                You do not have permission to view the {config?.name || 'requested'} module.
              </p>
            </div>
          </div>
        }
      >
        <div className="max-w-4xl mx-auto px-1 sm:px-2 pt-3 sm:pt-4 pb-36 sm:pb-40 animate-fadeIn select-none">
          {/* 1. Premium Top Navigation Bar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <button
              type="button"
              onClick={() => setSelectedModule(null)}
              data-testid="btn-back-hub"
              className="h-10 px-3.5 rounded-full bg-white text-[#163832] border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.06)] flex items-center gap-1.5 text-xs font-bold hover:bg-[#F6FBF7] active:scale-95 transition-all touch-target-44 cursor-pointer shrink-0"
              aria-label="Back to Operations Hub"
            >
              <ArrowLeft size={16} strokeWidth={2.2} />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]">
                {config.section} Squad
              </span>
              {readOnly ? (
                <AccessChip variant="view_only" label="View only" />
              ) : (
                <AccessChip variant={canApprove ? 'approve' : 'manage'} />
              )}
            </div>
          </div>

          {/* 2. Elevated Module Hero Header */}
          <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] flex items-center justify-center text-[#163832] shrink-0 shadow-xs">
                {(() => {
                  const IconComp = config.iconName && ICON_MAP[config.iconName] ? ICON_MAP[config.iconName] : Shield;
                  return <IconComp size={24} strokeWidth={2} />;
                })()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="font-heading font-extrabold text-[#051F20] text-xl sm:text-2xl tracking-tight leading-tight"
                    style={{ fontSize: '24px', lineHeight: '28px' }}
                  >
                    {config.name}
                  </h1>
                </div>
                <p className="text-xs font-semibold text-[#235347] mt-0.5">
                  {config.description}
                </p>
              </div>
            </div>

            {readOnly ? (
              <div className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center gap-1.5 text-xs font-semibold text-[#235347]">
                <Shield size={14} className="text-[#8EB69B]" />
                <span>View-only mode: changes restricted</span>
              </div>
            ) : canApprove ? (
              <div className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center gap-1.5 text-xs font-semibold text-[#235347]">
                <CheckCircle2 size={14} className="text-[#235347]" />
                <span>Approval Authority</span>
              </div>
            ) : null}
          </div>

          {/* Specific Module Interactive Implementations */}
          {selectedModule === 'treasury' && (
            <TreasuryScreen
              readOnly={readOnly}
              canApprove={canApprove}
              budgetRequests={budgetRequests}
              setBudgetRequests={setBudgetRequests}
              onLogAudit={(event, action) => logAudit('treasury', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'add_expense' && (
            <AddExpenseScreen
              readOnly={readOnly}
              expenses={expenses}
              setExpenses={setExpenses}
              onLogAudit={(event, action) => logAudit('add_expense', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'expenditure_ledger' && (
            <ExpenditureLedgerScreen
              readOnly={readOnly}
              expenses={expenses}
              setExpenses={setExpenses}
              onLogAudit={(event, action) => logAudit('expenditure_ledger', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'financial_audit_export' && (
            <FinancialAuditExportScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('financial_audit_export', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'campaign_post' && (
            <CampaignPostScreen
              readOnly={readOnly}
              posts={posts}
              setPosts={setPosts}
              onLogAudit={(event, action) => logAudit('campaign_post', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'attendance_desk' && (
            <AttendanceDeskScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('attendance_desk', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'attendance_operation' && (
            <AttendanceOperationScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('attendance_operation', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'event_permissions' && (
            <EventPermissionsScreen
              readOnly={readOnly}
              grants={grants}
              setGrants={setGrants}
              onLogAudit={(event, action) => logAudit('event_permissions', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'member_directory' && (
            <MemberDirectoryScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('member_directory', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'lead_activity_review' && (
            <LeadActivityReviewScreen
              readOnly={readOnly}
              canApprove={canApprove}
              onLogAudit={(event, action) => logAudit('lead_activity_review', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'squads' && (
            <SquadsScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('squads', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'squad_leads' && (
            <SquadLeadsScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('squad_leads', event, action)}
              currentUser={currentUser}
            />
          )}

          {(selectedModule === 'duties_assignment' || selectedModule === 'duties_stations') && (
            <DutiesAssignmentScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit(selectedModule, event, action)}
              currentUser={currentUser}
            />
          )}

          {/* Standard generic screen for other modules */}
          {![
            'treasury',
            'add_expense',
            'expenditure_ledger',
            'financial_audit_export',
            'campaign_post',
            'attendance_desk',
            'attendance_operation',
            'event_permissions',
            'member_directory',
            'lead_activity_review',
            'squads',
            'squad_leads',
            'duties_assignment',
            'duties_stations',
          ].includes(selectedModule) && (
            <GenericModuleScreen
              moduleId={selectedModule}
              config={config}
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit(selectedModule, event, action)}
              currentUser={currentUser}
            />
          )}
        </div>
      </ModuleGuard>
    );
  }

  // Operations Hub Home View
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-28">
      {/* Page Header */}
      <PageHeader
        title="Operations"
        showRoleChip={false}
      />

      {/* Role Chip Banner */}
      <div className="mt-2 mb-5 flex items-center gap-2">
        <span className="text-[12px] font-semibold text-[#235347]">Active Hub Role:</span>
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-[#163832] text-white shadow-xs"
          data-testid="active-role-chip"
        >
          {roleDisplayLabel}
        </span>
      </div>

      {/* Search field for roles with 8 or more modules (Faculty and President) */}
      {visibleModuleIds.length >= 8 && (
        <div className="mb-6">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search operational modules..."
          />
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-3 mb-6">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      )}

      {/* Error State with Retry */}
      {hasError && (
        <div className="mb-6">
          <ErrorState
            message="Failed to synchronize module matrix."
            onRetry={() => setHasError(false)}
          />
        </div>
      )}

      {/* Empty State when no modules are visible for role */}
      {!isLoading && !hasError && visibleModuleIds.length === 0 && (
        <EmptyState
          title="No Operational Modules"
          description="Your current role does not have access to any operations hub modules."
          mascot="shield"
        />
      )}

      {/* Empty State when search matches zero modules */}
      {!isLoading &&
        !hasError &&
        visibleModuleIds.length > 0 &&
        filteredModuleIds.length === 0 && (
          <EmptyState
            title="No modules found"
            description={`No operational modules match "${searchQuery}".`}
          />
        )}

      {/* Grouped Module Sections */}
      {!isLoading && !hasError && filteredModuleIds.length > 0 && (
        <div className="space-y-6">
          {SECTION_ORDER.map((sectionName) => {
            const sectionModules = filteredModuleIds.filter(
              (id) => MODULE_CONFIGS[id].section === sectionName
            );

            if (sectionModules.length === 0) return null;

            return (
              <ModuleSection
                key={sectionName}
                title={sectionName}
              >
                {sectionModules.map((id) => {
                  const cfg = MODULE_CONFIGS[id];
                  const access = moduleAccess(currentUser, id);
                  const accessType = getCardAccessType(id);
                  const pendingCount = getPendingCount(id);

                  return (
                    <HubCard
                      key={id}
                      id={id}
                      title={cfg.name}
                      description={cfg.description}
                      iconName={cfg.iconName}
                      access={access}
                      accessType={accessType}
                      pendingCount={pendingCount}
                      hideDescription={true}
                      hideAccessChip={true}
                      onClick={() => setSelectedModule(id)}
                    />
                  );
                })}
              </ModuleSection>
            );
          })}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// Interactive Module Screens
// =========================================================================

/**
 * 1. Treasury Screen:
 * - Budget requests list with status chips.
 * - Only President sees Approve and Reject (with confirmation dialog and note).
 * - Faculty sees "Flag for Review".
 * - Treasurer cannot approve their own requests.
 */
const TreasuryScreen: React.FC<{
  readOnly: boolean;
  canApprove: boolean;
  budgetRequests: BudgetRequest[];
  setBudgetRequests: React.Dispatch<React.SetStateAction<BudgetRequest[]>>;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, canApprove, budgetRequests, setBudgetRequests, onLogAudit, currentUser }) => {
  const [selectedReq, setSelectedReq] = useState<BudgetRequest | null>(null);
  const [actionType, setActionType] = useState<'Approve' | 'Reject' | 'Flag' | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  const isPresident = canApprove;
  const isFaculty = readOnly && normalizeHubRole(currentUser?.role) === 'faculty';

  const handleConfirmDecision = (reason?: string) => {
    if (!selectedReq || !actionType) return;

    const newStatus = actionType === 'Approve' ? 'Approved' : actionType === 'Reject' ? 'Rejected' : 'Flagged';
    const note = reason || decisionNote;

    setBudgetRequests((prev) =>
      prev.map((r) =>
        r.id === selectedReq.id ? { ...r, status: newStatus, note } : r
      )
    );

    onLogAudit(
      selectedReq.event,
      `${actionType} budget request "${selectedReq.title}" of Rs. ${selectedReq.amount} (${note || 'No note'})`
    );

    setSelectedReq(null);
    setActionType(null);
    setDecisionNote('');
  };

  return (
    <div className="space-y-4">
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-[#051F20] text-base">
            Budget Requests Queue
          </h2>
          <span className="text-[12px] font-semibold text-[#235347]">
            {budgetRequests.length} Total Requests
          </span>
        </div>

        <div className="divide-y divide-[#8EB69B]/20">
          {budgetRequests.map((req) => (
            <div key={req.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-[#051F20] text-sm">
                    {req.title}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold ${
                      req.status === 'Approved'
                        ? 'bg-[#DAF1DE] text-[#051F20]'
                        : req.status === 'Rejected'
                        ? 'bg-[#D9534F]/10 text-[#D9534F]'
                        : req.status === 'Flagged'
                        ? 'bg-[#F2B84B]/20 text-[#051F20]'
                        : 'bg-[#F2B84B] text-[#051F20]'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="text-[12px] text-[#235347] mt-0.5">
                  Event: <strong className="text-[#051F20]">{req.event}</strong> | Category: {req.category} | Requested by: {req.requesterName}
                </p>
                <p className="text-[12px] text-[#051F20] font-bold mt-1">
                  Amount: ₹{req.amount.toLocaleString()}
                </p>
                {req.note && (
                  <p className="text-[12px] text-[#235347] italic mt-1">
                    Note: &ldquo;{req.note}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons: President has Approve/Reject, Faculty has Flag */}
              <div className="flex items-center gap-2 shrink-0">
                {isPresident && req.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setActionType('Approve');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#163832] text-white text-[12px] font-semibold hover:bg-[#0B2B26] active:scale-95 transition-all"
                      data-testid={`btn-approve-budget-${req.id}`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setActionType('Reject');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#D9534F] text-[#D9534F] text-[12px] font-semibold hover:bg-[#D9534F]/10 active:scale-95 transition-all"
                      data-testid={`btn-reject-budget-${req.id}`}
                    >
                      Reject
                    </button>
                  </>
                )}

                {isFaculty && req.status === 'Pending' && (
                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setActionType('Flag');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#DAF1DE] text-[#051F20] text-[12px] font-semibold hover:bg-[#8EB69B]/30 active:scale-95 transition-all"
                    data-testid={`btn-flag-budget-${req.id}`}
                  >
                    Flag for Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog for Decision */}
      <ConfirmDialog
        isOpen={Boolean(selectedReq && actionType)}
        onClose={() => {
          setSelectedReq(null);
          setActionType(null);
          setDecisionNote('');
        }}
        onConfirm={handleConfirmDecision}
        title={`${actionType} Budget Request`}
        message={`Are you sure you want to ${actionType?.toLowerCase()} the request for "${selectedReq?.title}" (₹${selectedReq?.amount})?`}
        reasonPlaceholder="Add optional justification or institutional note..."
      />
    </div>
  );
};

/**
 * 2. Add Expense Screen:
 * - WRITE: Event, Amount, Category, Description, Bill upload, Submit.
 * - READ: Hides creation form, displays "View only" chip.
 * - Shows past entries with actor and time. No edit or delete offered!
 */
const AddExpenseScreen: React.FC<{
  readOnly: boolean;
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, expenses, setExpenses, onLogAudit, currentUser }) => {
  const [event, setEvent] = useState('Annual Drone Survey');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Equipment');
  const [description, setDescription] = useState('');
  const [billProof, setBillProof] = useState<string>('voucher_receipt.pdf');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description.trim()) return;

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      event,
      amount: parseFloat(amount),
      category,
      description,
      actor: currentUser?.name || 'Treasurer',
      time: new Date().toLocaleString(),
      billProof,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    onLogAudit(event, `Added expense ₹${amount} for ${description}`);

    setAmount('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3.5">
          <h2 className="font-heading font-bold text-[#051F20] text-base">
            Record New Expenditure
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#051F20] mb-1">
                Event
              </label>
              <select
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-[13px] text-[#051F20] bg-white"
              >
                <option value="Annual Drone Survey">Annual Drone Survey</option>
                <option value="Campus Topo Camp 2026">Campus Topo Camp 2026</option>
                <option value="GeoTech Annual Symposium">GeoTech Annual Symposium</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#051F20] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-[13px] text-[#051F20] bg-white"
              >
                <option value="Equipment">Equipment</option>
                <option value="Refreshments">Refreshments</option>
                <option value="Travel">Travel</option>
                <option value="Printing">Printing</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#051F20] mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-[13px] text-[#051F20]"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#051F20] mb-1">
                Bill / Voucher Upload
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={billProof}
                  onChange={(e) => setBillProof(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-[13px] text-[#051F20]"
                  placeholder="invoice_proof.pdf"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#051F20] mb-1">
              Description & Purpose
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed justification of expenditure..."
              className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-[13px] text-[#051F20]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#163832] text-white text-[13px] font-semibold hover:bg-[#0B2B26] active:scale-95 transition-all"
            data-testid="btn-submit-expense"
          >
            Submit Expense Entry
          </button>
        </form>
      )}

      {/* Past Entries List: No edit or delete offered */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-[#051F20] text-base">
            Recorded Expenses (Immutable Log)
          </h2>
          <span className="text-[12px] text-[#235347]">
            Past entries cannot be modified or deleted
          </span>
        </div>

        <div className="divide-y divide-[#8EB69B]/20">
          {expenses.map((exp) => (
            <div key={exp.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-[#051F20] text-sm">
                    {exp.description}
                  </span>
                  <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-[#DAF1DE] text-[#051F20]">
                    {exp.category}
                  </span>
                </div>
                <p className="text-[12px] text-[#235347] mt-0.5">
                  Event: <strong>{exp.event}</strong> | Bill: {exp.billProof}
                </p>
                <p className="text-[12px] text-[#235347] flex items-center gap-2 mt-1">
                  <span>Actor: <strong>{exp.actor}</strong></span>
                  <span>•</span>
                  <span>Time: {exp.time}</span>
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span className="font-bold text-[#051F20] text-base">
                  ₹{exp.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Expenditure Ledger Screen:
 * - Immutable financial ledger. Entries show actor and time.
 * - No edit or delete offered.
 * - Corrections are added as new entries.
 */
const ExpenditureLedgerScreen: React.FC<{
  readOnly: boolean;
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, expenses, setExpenses, onLogAudit, currentUser }) => {
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjEvent, setAdjEvent] = useState('Annual Drone Survey');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');

  const handleAddAdjustment = () => {
    if (!adjAmount || !adjReason.trim()) return;

    const adjustmentEntry: ExpenseItem = {
      id: `adj-${Date.now()}`,
      event: adjEvent,
      amount: parseFloat(adjAmount),
      category: 'Correction / Adjustment',
      description: `Correction: ${adjReason}`,
      actor: currentUser?.name || 'Treasurer',
      time: new Date().toLocaleString(),
      billProof: 'AUDIT-ADJ-REF',
    };

    setExpenses((prev) => [adjustmentEntry, ...prev]);
    onLogAudit(adjEvent, `Adjustment logged: ₹${adjAmount} (${adjReason})`);

    setShowAdjustmentModal(false);
    setAdjAmount('');
    setAdjReason('');
  };

  return (
    <div className="space-y-4">
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-heading font-bold text-[#051F20] text-base">
              Club Expenditure General Ledger
            </h2>
            <p className="text-[12px] text-[#235347]">
              Entries are immutable; corrections must be recorded as new offsetting entries.
            </p>
          </div>

          {!readOnly && (
            <button
              onClick={() => setShowAdjustmentModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#163832] text-white text-[12px] font-semibold hover:bg-[#0B2B26] active:scale-95 transition-all w-fit"
              data-testid="btn-add-adjustment"
            >
              + Record Offset Entry
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] text-[#051F20]">
            <thead>
              <tr className="border-b border-[#DAF1DE] text-[#235347] font-semibold">
                <th className="pb-2">Timestamp & Actor</th>
                <th className="pb-2">Event</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8EB69B]/15">
              {expenses.map((item) => (
                <tr key={item.id} className="py-2.5">
                  <td className="py-2">
                    <div className="font-semibold text-[#051F20]">{item.time}</div>
                    <div className="text-[#235347]">{item.actor}</div>
                  </td>
                  <td className="py-2 font-medium">{item.event}</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#DAF1DE] text-[12px] font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2 max-w-xs">{item.description}</td>
                  <td className="py-2 text-right font-bold">
                    ₹{item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/45 backdrop-blur-xs select-none">
          <div className="w-full max-w-md p-5 bg-white rounded-2xl border border-[#8EB69B]/40 shadow-xl space-y-3">
            <h3 className="font-heading font-bold text-[#051F20] text-base">
              Record Offsetting Ledger Entry
            </h3>
            <p className="text-[12px] text-[#235347]">
              Enter the adjustment details. Past entries remain permanently immutable.
            </p>
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[12px] font-semibold text-[#051F20] mb-1">Event</label>
                <input
                  type="text"
                  value={adjEvent}
                  onChange={(e) => setAdjEvent(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#8EB69B] text-[12px] text-[#051F20]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#051F20] mb-1">Adjustment Amount (₹)</label>
                <input
                  type="number"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  placeholder="e.g. -500 or 1200"
                  className="w-full p-2 rounded-xl border border-[#8EB69B] text-[12px] text-[#051F20]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#051F20] mb-1">Correction Reason</label>
                <textarea
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="State ledger discrepancy reason..."
                  className="w-full p-2 rounded-xl border border-[#8EB69B] text-[12px] text-[#051F20]"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdjustmentModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#8EB69B] text-[#051F20] text-[12px] font-semibold hover:bg-[#DAF1DE]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAdjustment}
                className="px-4 py-2 rounded-xl bg-[#163832] text-white text-[12px] font-semibold hover:bg-[#0B2B26]"
              >
                Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 4. Financial Audit Export Screen:
 * - Export per event and overall.
 * - Shows actor and time.
 * - READ: export buttons hidden.
 */
const FinancialAuditExportScreen: React.FC<{
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, onLogAudit, currentUser }) => {
  const [selectedEvent, setSelectedEvent] = useState('All Events (Overall)');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExport = (format: 'PDF' | 'CSV') => {
    onLogAudit(selectedEvent, `Generated financial audit ${format} export`);
    setExportSuccess(`Successfully generated ${format} audit report for "${selectedEvent}".`);
    setTimeout(() => setExportSuccess(null), 4000);
  };

  return (
    <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="font-heading font-bold text-[#051F20] text-base">
          Financial Audit Statements
        </h2>
        <span className="text-[12px] text-[#235347]">
          Actor: <strong>{currentUser?.name || 'Treasurer'}</strong>
        </span>
      </div>

      <div>
        <label className="block text-[12px] font-semibold text-[#051F20] mb-1">
          Select Scope
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full sm:w-80 p-2.5 rounded-xl border border-[#8EB69B] text-[13px] text-[#051F20] bg-white"
        >
          <option value="All Events (Overall)">All Events (Overall Financial Ledger)</option>
          <option value="Annual Drone Survey">Annual Drone Survey</option>
          <option value="Campus Topo Camp 2026">Campus Topo Camp 2026</option>
          <option value="GeoTech Annual Symposium">GeoTech Annual Symposium</option>
        </select>
      </div>

      {!readOnly && (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => handleExport('PDF')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#163832] text-white text-[13px] font-semibold hover:bg-[#0B2B26] active:scale-95 transition-all"
            data-testid="btn-export-pdf"
          >
            <Download size={16} /> Export Audit Statement (PDF)
          </button>
          <button
            onClick={() => handleExport('CSV')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#163832] text-[#163832] text-[13px] font-semibold hover:bg-[#DAF1DE] active:scale-95 transition-all"
            data-testid="btn-export-csv"
          >
            <Download size={16} /> Export Ledger Raw (CSV)
          </button>
        </div>
      )}

      {exportSuccess && (
        <div className="p-3 rounded-xl bg-[#DAF1DE] text-[#051F20] text-[12px] font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          {exportSuccess}
        </div>
      )}
    </div>
  );
};

/**
 * 5. Campaign and Post Screen:
 * - Promotion sees status flow: Draft -> Submitted -> Approved or Rejected -> Published.
 * - Only Management leads see Approve and Reject (never their own post).
 */
const CampaignPostScreen: React.FC<{
  readOnly: boolean;
  posts: CampaignPostItem[];
  setPosts: React.Dispatch<React.SetStateAction<CampaignPostItem[]>>;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, posts, setPosts, onLogAudit, currentUser }) => {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<'Instagram' | 'LinkedIn' | 'Twitter' | 'Website'>('Instagram');
  const [content, setContent] = useState('');
  const [rejectingPost, setRejectingPost] = useState<CampaignPostItem | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  // Check if current user is a Management Lead
  const isManagementLead =
    normalizeHubRole(currentUser?.role) === 'management' ||
    Boolean(currentUser?.squadMemberships?.some((m: any) => m.squad.toLowerCase() === 'management' && m.isLead)) ||
    Boolean(currentUser?.team?.toLowerCase() === 'management' && currentUser?.teamRole?.toLowerCase().includes('lead')) ||
    normalizeHubRole(currentUser?.role) === 'president' ||
    normalizeHubRole(currentUser?.role) === 'coordinator';

  const handleCreatePost = (asSubmit: boolean) => {
    if (!title.trim() || !content.trim()) return;

    const newPost: CampaignPostItem = {
      id: `post-${Date.now()}`,
      title,
      platform,
      status: asSubmit ? 'Submitted' : 'Draft',
      authorId: currentUser?.uid || 'user-promo-me',
      authorName: currentUser?.name || 'Promotion Lead',
      content,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]);
    onLogAudit('Promotion Campaign', `Created post "${title}" as ${newPost.status}`);

    setTitle('');
    setContent('');
  };

  const handleApprovePost = (post: CampaignPostItem) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: 'Approved' } : p))
    );
    onLogAudit('Promotion Campaign', `Approved post "${post.title}"`);
  };

  const handleConfirmReject = (reason?: string) => {
    if (!rejectingPost) return;

    const note = reason || rejectionNote || 'Realigned with institutional policy';

    setPosts((prev) =>
      prev.map((p) =>
        p.id === rejectingPost.id
          ? { ...p, status: 'Rejected', rejectionReason: note }
          : p
      )
    );

    onLogAudit('Promotion Campaign', `Rejected post "${rejectingPost.title}" (${note})`);
    setRejectingPost(null);
    setRejectionNote('');
  };

  const handlePublishPost = (post: CampaignPostItem) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: 'Published' } : p))
    );
    onLogAudit('Promotion Campaign', `Published post "${post.title}"`);
  };

  return (
    <div className="space-y-6">
      {/* Creation form for Promotion (hidden if readOnly) */}
      {!readOnly && (
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
          <h2 className="font-heading font-bold text-[#051F20] text-base">
            Draft & Submit Campaign Post
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#051F20] mb-1">
                Post Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Geomatics Fieldwork Teaser"
                className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-[13px] text-[#051F20]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#051F20] mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-[13px] text-[#051F20] bg-white"
              >
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Twitter">Twitter / X</option>
                <option value="Website">Official Website</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#051F20] mb-1">
              Post Content & Media Brief
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write post copy..."
              className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-[13px] text-[#051F20]"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleCreatePost(false)}
              className="px-4 py-2 rounded-xl bg-white border border-[#163832] text-[#163832] text-[12px] font-semibold hover:bg-[#DAF1DE] active:scale-95 transition-all"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleCreatePost(true)}
              className="px-4 py-2 rounded-xl bg-[#163832] text-white text-[12px] font-semibold hover:bg-[#0B2B26] active:scale-95 transition-all"
            >
              Submit for Approval
            </button>
          </div>
        </div>
      )}

      {/* Posts Pipeline List */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)]">
        <h2 className="font-heading font-bold text-[#051F20] text-base mb-3">
          Campaign Post Status Pipeline
        </h2>

        <div className="divide-y divide-[#8EB69B]/20">
          {posts.map((post) => {
            const isOwnPost =
              (currentUser?.uid && post.authorId === currentUser.uid) ||
              post.authorName === currentUser?.name;

            return (
              <div key={post.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-[#051F20] text-sm">
                      {post.title}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold ${
                        post.status === 'Published'
                          ? 'bg-[#163832] text-white'
                          : post.status === 'Approved'
                          ? 'bg-[#DAF1DE] text-[#051F20]'
                          : post.status === 'Rejected'
                          ? 'bg-[#D9534F]/10 text-[#D9534F]'
                          : post.status === 'Submitted'
                          ? 'bg-[#F2B84B] text-[#051F20]'
                          : 'bg-[#8EB69B]/30 text-[#051F20]'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#235347] mt-0.5">
                    Platform: <strong>{post.platform}</strong> | Author: {post.authorName}
                  </p>
                  <p className="text-[12px] text-[#051F20] mt-1 line-clamp-2">
                    &ldquo;{post.content}&rdquo;
                  </p>
                  {post.rejectionReason && (
                    <p className="text-[12px] text-[#D9534F] font-semibold mt-1">
                      Rejection Reason: {post.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Management Leads can approve or reject SUBMITTED posts, NEVER own post */}
                <div className="flex items-center gap-2 shrink-0">
                  {isManagementLead && post.status === 'Submitted' && !isOwnPost && (
                    <>
                      <button
                        onClick={() => handleApprovePost(post)}
                        className="px-3 py-1.5 rounded-xl bg-[#163832] text-white text-[12px] font-semibold hover:bg-[#0B2B26] active:scale-95 transition-all"
                        data-testid={`btn-approve-post-${post.id}`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingPost(post)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#D9534F] text-[#D9534F] text-[12px] font-semibold hover:bg-[#D9534F]/10 active:scale-95 transition-all"
                        data-testid={`btn-reject-post-${post.id}`}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {/* Publishing needs Management lead or Promotion when Approved */}
                  {!readOnly && post.status === 'Approved' && (
                    <button
                      onClick={() => handlePublishPost(post)}
                      className="px-3 py-1.5 rounded-xl bg-[#163832] text-white text-[12px] font-semibold hover:bg-[#0B2B26] active:scale-95 transition-all"
                      data-testid={`btn-publish-post-${post.id}`}
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(rejectingPost)}
        onClose={() => setRejectingPost(null)}
        onConfirm={handleConfirmReject}
        title="Reject Promotion Post"
        message={`State reason for rejecting "${rejectingPost?.title}":`}
        requireReason={true}
        reasonPlaceholder="Policy compliance, tone adjustment, or graphic revision required..."
        variant="danger"
      />
    </div>
  );
};

/**
 * 6. Attendance Desk Screen:
 * - Dynamic Event QR Generator with live session OTP, rotation countdown, and fullscreen projector display.
 * - Comprehensive Manual Attendance Roster for the respective event with one-tap status toggling (Present / Late / Absent).
 * - Live event attendance metrics summary.
 * - Manual attendance override with mandatory audit reason logging.
 */
interface AttendeeRecord {
  uid: string;
  name: string;
  rollNo: string;
  squad: string;
  status: 'present' | 'late' | 'absent';
  checkInTime?: string;
}

const CHAPTER_EVENTS_FOR_ATTENDANCE = [
  { id: 'ev-geofest', title: 'GEO FEST 2026: Campus Odyssey', venue: 'Main Auditorium', date: 'Tomorrow • 09:30 AM' },
  { id: 'ev-gis', title: 'GIS & Satellite Telemetry Workshop', venue: 'Geomatics Lab 3', date: 'Nov 08 • 10:00 AM' },
  { id: 'ev-drone', title: 'Campus Biodiversity Drone Survey', venue: 'North Quad Base Station', date: 'Nov 12 • 02:00 PM' },
  { id: 'ev-colloquium', title: 'National Remote Sensing Colloquium 2026', venue: 'Conference Hall A', date: 'Concluded' },
];

const INITIAL_ATTENDEES_ROSTER: Record<string, AttendeeRecord[]> = {
  'ev-geofest': [
    { uid: 'u-1', name: 'Dr. Ramesh Kumar', rollNo: 'FAC-GEO-01', squad: 'Management', status: 'present', checkInTime: '09:15 AM' },
    { uid: 'u-2', name: 'Siddharth Roy', rollNo: '22GEO001', squad: 'Management', status: 'present', checkInTime: '09:20 AM' },
    { uid: 'u-3', name: 'Divya Rao', rollNo: '22GEO005', squad: 'Management', status: 'present', checkInTime: '09:22 AM' },
    { uid: 'u-4', name: 'Sneha Patel', rollNo: '22GEO012', squad: 'Promotion', status: 'present', checkInTime: '09:25 AM' },
    { uid: 'u-5', name: 'Ananya Iyer', rollNo: '22GEO023', squad: 'Treasury', status: 'present', checkInTime: '09:28 AM' },
    { uid: 'u-6', name: 'Aarav Patel', rollNo: '22GEO034', squad: 'Documentation', status: 'late', checkInTime: '09:42 AM' },
    { uid: 'u-7', name: 'Kunal Sen', rollNo: '23GEO045', squad: 'Promotion', status: 'present', checkInTime: '09:30 AM' },
    { uid: 'u-8', name: 'David Chen', rollNo: '23GEO052', squad: 'Documentation', status: 'absent' },
    { uid: 'u-9', name: 'Priya Sharma', rollNo: '23GEO061', squad: 'Treasury', status: 'present', checkInTime: '09:33 AM' },
    { uid: 'u-10', name: 'Maya Patel', rollNo: '23GEO070', squad: 'Management', status: 'absent' },
  ],
  'ev-gis': [
    { uid: 'u-1', name: 'Dr. Ramesh Kumar', rollNo: 'FAC-GEO-01', squad: 'Management', status: 'present', checkInTime: '09:50 AM' },
    { uid: 'u-7', name: 'Kunal Sen', rollNo: '23GEO045', squad: 'Promotion', status: 'present', checkInTime: '09:55 AM' },
    { uid: 'u-9', name: 'Priya Sharma', rollNo: '23GEO061', squad: 'Treasury', status: 'present', checkInTime: '09:58 AM' },
    { uid: 'u-8', name: 'David Chen', rollNo: '23GEO052', squad: 'Documentation', status: 'late', checkInTime: '10:12 AM' },
    { uid: 'u-10', name: 'Maya Patel', rollNo: '23GEO070', squad: 'Management', status: 'absent' },
  ],
  'ev-drone': [
    { uid: 'u-8', name: 'David Chen', rollNo: '23GEO052', squad: 'Documentation', status: 'present', checkInTime: '01:50 PM' },
    { uid: 'u-2', name: 'Siddharth Roy', rollNo: '22GEO001', squad: 'Management', status: 'present', checkInTime: '01:55 PM' },
    { uid: 'u-4', name: 'Sneha Patel', rollNo: '22GEO012', squad: 'Promotion', status: 'absent' },
  ],
  'ev-colloquium': [
    { uid: 'u-3', name: 'Divya Rao', rollNo: '22GEO005', squad: 'Management', status: 'present', checkInTime: '09:00 AM' },
    { uid: 'u-5', name: 'Ananya Iyer', rollNo: '22GEO023', squad: 'Treasury', status: 'present', checkInTime: '09:05 AM' },
  ],
};

const AttendanceDeskScreen: React.FC<{
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, onLogAudit, currentUser }) => {
  const [selectedEventId, setSelectedEventId] = useState('ev-geofest');
  const [activeTab, setActiveTab] = useState<'roster' | 'qr'>('roster');
  const [attendeesByEvent, setAttendeesByEvent] = useState(INITIAL_ATTENDEES_ROSTER);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // QR Generator States
  const [otp, setOtp] = useState('829 401');
  const [secondsLeft, setSecondsLeft] = useState(28);
  const [qrToken, setQrToken] = useState('GEO-TOKEN-8F92A');
  const [showProjectorModal, setShowProjectorModal] = useState(false);

  // Manual Override States
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overrideStudent, setOverrideStudent] = useState('Kunal Sen (23GEO045)');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideStatusMsg, setOverrideStatusMsg] = useState<string | null>(null);

  // Live timer for OTP rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextOtp = Math.floor(100000 + Math.random() * 900000).toString().replace(/(\d{3})(\d{3})/, '$1 $2');
          setOtp(nextOtp);
          setQrToken(`GEO-TOKEN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedEvent =
    CHAPTER_EVENTS_FOR_ATTENDANCE.find((e) => e.id === selectedEventId) || CHAPTER_EVENTS_FOR_ATTENDANCE[0];
  const currentRoster = attendeesByEvent[selectedEventId] || [];

  const handleUpdateStatus = (uid: string, newStatus: 'present' | 'late' | 'absent') => {
    if (readOnly) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendeesByEvent((prev) => ({
      ...prev,
      [selectedEventId]: (prev[selectedEventId] || []).map((att) =>
        att.uid === uid
          ? { ...att, status: newStatus, checkInTime: newStatus === 'absent' ? undefined : att.checkInTime || nowTime }
          : att
      ),
    }));

    const student = currentRoster.find((a) => a.uid === uid);
    if (student) {
      onLogAudit(selectedEvent.title, `Updated attendance for ${student.name} (${student.rollNo}) to ${newStatus.toUpperCase()}`);
    }
  };

  const handleOverrideSubmit = (reason?: string) => {
    const finalReason = reason || overrideReason;
    if (!finalReason.trim()) return;

    onLogAudit(
      selectedEvent.title,
      `Manual attendance override for student ${overrideStudent}. Mandatory Reason: "${finalReason}"`
    );

    setOverrideStatusMsg(`Attendance override recorded for ${overrideStudent}.`);
    setShowOverrideDialog(false);
    setOverrideReason('');
    setTimeout(() => setOverrideStatusMsg(null), 4000);
  };

  const filteredAttendees = currentRoster.filter((att) => {
    if (statusFilter !== 'All' && att.status !== statusFilter.toLowerCase()) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      att.name.toLowerCase().includes(q) ||
      att.rollNo.toLowerCase().includes(q) ||
      att.squad.toLowerCase().includes(q)
    );
  });

  const totalCount = currentRoster.length;
  const presentCount = currentRoster.filter((a) => a.status === 'present').length;
  const lateCount = currentRoster.filter((a) => a.status === 'late').length;
  const absentCount = currentRoster.filter((a) => a.status === 'absent').length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  const qrPayload = `GEO-CHECKIN:${selectedEvent.id}:${qrToken}:${otp.replace(/\s/g, '')}`;

  return (
    <div className="space-y-4 select-none pb-12 animate-fadeIn">
      {/* 1. Header with Event Selector & Tab Switcher */}
      <div className="p-3.5 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#051F20]">
              Event Attendance Console
            </h2>
            <p className="text-xs text-[#235347]">
              Live QR code check-in & manual attendance roster for chapter events
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#F6FBF7] p-1 rounded-xl border border-[#DAF1DE] shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-[#163832] text-white shadow-xs'
                  : 'text-[#235347] hover:text-[#051F20]'
              }`}
            >
              <UserCheck size={14} />
              <span>Manual Attendance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'qr'
                  ? 'bg-[#163832] text-white shadow-xs'
                  : 'text-[#235347] hover:text-[#051F20]'
              }`}
            >
              <QrCode size={14} />
              <span>Event QR Generator</span>
            </button>
          </div>
        </div>

        {/* Event Selector Dropdown */}
        <div className="pt-2 border-t border-[#DAF1DE]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Calendar size={16} className="text-[#8EB69B] shrink-0" />
            <span className="text-xs font-bold text-[#163832] shrink-0">Select Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="flex-1 max-w-md p-2 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-semibold text-[#051F20] outline-none cursor-pointer focus:bg-white focus:border-[#235347]"
            >
              {CHAPTER_EVENTS_FOR_ATTENDANCE.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.date})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#235347] shrink-0">
            <MapPin size={13} className="text-[#8EB69B]" />
            <span className="font-medium">{selectedEvent.venue}</span>
          </div>
        </div>
      </div>

      {/* 2. TAB A: EVENT QR GENERATOR */}
      {activeTab === 'qr' && (
        <div className="p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DAF1DE]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#235347] block">
                Dynamic Event Pass
              </span>
              <h3 className="font-heading font-bold text-lg text-[#051F20]">
                {selectedEvent.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowProjectorModal(true)}
              className="h-9 px-3.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              <Maximize2 size={14} />
              <span>Projector / Fullscreen</span>
            </button>
          </div>

          {/* QR Display Card */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 sm:p-6 bg-gradient-to-br from-[#F6FBF7] via-white to-[#F6FBF7] rounded-3xl border border-[#8EB69B]/50">
            {/* High-res QRCodeSVG */}
            <div className="p-3 bg-white rounded-2xl border-2 border-[#163832]/20 shadow-md flex items-center justify-center">
              <QRCodeSVG
                value={qrPayload}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#051F20"
                level="Q"
              />
            </div>

            {/* OTP & Session Details */}
            <div className="text-center sm:text-left space-y-2">
              <span className="text-xs font-bold text-[#235347] uppercase tracking-wider block">
                Session Check-In OTP
              </span>
              <div className="font-mono font-extrabold text-3xl sm:text-4xl text-[#051F20] tracking-widest">
                {otp}
              </div>
              <p className="text-xs text-[#235347] flex items-center justify-center sm:justify-start gap-1.5">
                <Clock size={13} className="text-[#8EB69B]" />
                <span>Rotates in <strong>{secondsLeft}s</strong> for anti-proxy fraud prevention</span>
              </p>

              {/* Progress bar */}
              <div className="w-full sm:w-56 h-1.5 rounded-full bg-[#DAF1DE] overflow-hidden mt-2">
                <div
                  className="h-full bg-[#163832] transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(secondsLeft / 30) * 100}%` }}
                />
              </div>

              <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextOtp = Math.floor(100000 + Math.random() * 900000).toString().replace(/(\d{3})(\d{3})/, '$1 $2');
                    setOtp(nextOtp);
                    setSecondsLeft(30);
                    onLogAudit(selectedEvent.title, 'Regenerated event check-in QR & OTP pass');
                  }}
                  className="h-8 px-3 rounded-xl bg-white border border-[#8EB69B] text-[#163832] text-xs font-bold hover:bg-[#DAF1DE] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <RefreshCw size={12} />
                  <span>Refresh Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB B: MANUAL ATTENDANCE FOR RESPECTIVE EVENT */}
      {activeTab === 'roster' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 bg-white rounded-2xl border border-[#DAF1DE] shadow-2xs">
              <span className="text-xs text-[#8EB69B] block font-semibold">Total Scholars</span>
              <span className="font-heading font-extrabold text-lg text-[#051F20]">{totalCount}</span>
            </div>
            <div className="p-3 bg-[#DAF1DE]/40 rounded-2xl border border-[#8EB69B]/50 shadow-2xs">
              <span className="text-xs text-[#163832] block font-semibold">Present</span>
              <span className="font-heading font-extrabold text-lg text-[#163832]">{presentCount}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-xs text-amber-800 block font-semibold">Late</span>
              <span className="font-heading font-extrabold text-lg text-amber-900">{lateCount}</span>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 shadow-2xs">
              <span className="text-xs text-red-800 block font-semibold">Absent</span>
              <span className="font-heading font-extrabold text-lg text-red-900">{absentCount}</span>
            </div>
            <div className="p-3 bg-[#F6FBF7] rounded-2xl border border-[#DAF1DE] shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-xs text-[#235347] block font-semibold">Turnout Rate</span>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-lg text-[#051F20]">{attendanceRate}%</span>
                <span className="text-xs text-[#8EB69B]">turnout</span>
              </div>
            </div>
          </div>

          {/* Search, Status Filters & Manual Override Action */}
          <div className="p-3.5 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="relative flex-1 min-w-0">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scholars by name, roll no, or squad..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs text-[#051F20] placeholder:text-[#8EB69B] focus:border-[#235347] focus:bg-white transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#235347] hover:text-[#051F20] cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setShowOverrideDialog(true)}
                  data-testid="btn-manual-override"
                  className="h-9 px-3.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] transition-all flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer active:scale-95 shrink-0"
                >
                  <Shield size={14} />
                  <span>Manual Override</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {['All', 'Present', 'Late', 'Absent'].map((st) => {
                const isSelected = statusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`h-8 px-3 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#163832] text-white shadow-xs'
                        : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
                    }`}
                  >
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>

            {/* Notification message */}
            {overrideStatusMsg && (
              <div className="p-3 rounded-xl bg-[#DAF1DE] border border-[#8EB69B] text-xs font-bold text-[#051F20] flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#163832]" />
                <span>{overrideStatusMsg}</span>
              </div>
            )}

            {/* Attendee Roster List */}
            <div className="space-y-2 pt-1">
              {filteredAttendees.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#235347] bg-[#F6FBF7] rounded-2xl border border-[#DAF1DE]">
                  No attendees matching your search.
                </div>
              ) : (
                filteredAttendees.map((att) => {
                  const isPresent = att.status === 'present';
                  const isLate = att.status === 'late';
                  const isAbsent = att.status === 'absent';

                  return (
                    <div
                      key={att.uid}
                      className="p-3 sm:p-3.5 rounded-2xl bg-[#F6FBF7]/60 hover:bg-[#F6FBF7] border border-[#DAF1DE] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-extrabold text-xs shrink-0 shadow-2xs ${
                            isPresent
                              ? 'bg-[#163832] text-[#DAF1DE]'
                              : isLate
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-red-100 text-red-900 border border-red-200'
                          }`}
                        >
                          {att.name.charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-heading font-bold text-sm text-[#051F20] truncate">
                              {att.name}
                            </span>
                            <span className="text-xs text-[#8EB69B] font-mono shrink-0">
                              ({att.rollNo})
                            </span>
                          </div>
                          <div className="text-xs text-[#235347] flex items-center gap-1.5 mt-0.5 truncate">
                            <span className="font-semibold text-[#163832]">{att.squad} Squad</span>
                            {att.checkInTime && (
                              <>
                                <span className="text-[#8EB69B]">•</span>
                                <span className="text-[#8EB69B]">Checked-in at {att.checkInTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* One-Tap Status Toggles */}
                      {!readOnly && (
                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(att.uid, 'present')}
                            className={`h-8 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                              isPresent
                                ? 'bg-[#163832] text-white shadow-xs'
                                : 'bg-white border border-[#8EB69B] text-[#163832] hover:bg-[#DAF1DE]'
                            }`}
                          >
                            Present
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(att.uid, 'late')}
                            className={`h-8 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                              isLate
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-50'
                            }`}
                          >
                            Late
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(att.uid, 'absent')}
                            className={`h-8 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                              isAbsent
                                ? 'bg-[#D9534F] text-white shadow-xs'
                                : 'bg-white border border-red-300 text-red-800 hover:bg-red-50'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen / Projector Modal */}
      {showProjectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg border border-[#DAF1DE] shadow-2xl text-center space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]">
              <div className="text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-[#235347]">
                  Venue Check-In Projector
                </span>
                <h3 className="font-heading font-extrabold text-xl text-[#051F20]">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectorModal(false)}
                className="text-[#8EB69B] hover:text-[#051F20] cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 bg-white rounded-3xl border-4 border-[#163832] inline-block shadow-lg mx-auto">
              <QRCodeSVG
                value={qrPayload}
                size={260}
                bgColor="#FFFFFF"
                fgColor="#051F20"
                level="H"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-[#235347] uppercase tracking-wider block">
                Session OTP
              </span>
              <div className="font-mono font-extrabold text-4xl text-[#051F20] tracking-widest mt-1">
                {otp}
              </div>
              <p className="text-xs text-[#235347] mt-1">
                Scan with GeoHub app to mark attendance instantly
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Override Dialog with Mandatory Reason */}
      <ConfirmDialog
        isOpen={showOverrideDialog}
        onClose={() => setShowOverrideDialog(false)}
        onConfirm={handleOverrideSubmit}
        title="Manual Attendance Override"
        message={`Institutional governance requires a documented, mandatory reason for manual check-in override for student ${overrideStudent}.`}
        requireReason={true}
        reasonPlaceholder="State mandatory override reason (e.g. Device dead, verified in person by Faculty)..."
      />
    </div>
  );
};

/**
 * 7. Attendance Operation Screen:
 * - QR/OTP operations and scanner delegation for ONE event only.
 */
const AttendanceOperationScreen: React.FC<{
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, onLogAudit, currentUser }) => {
  const [selectedEvent, setSelectedEvent] = useState('GeoTech 2026');
  const [delegatedVolunteer, setDelegatedVolunteer] = useState('Priya Sharma (GEO-2026-088)');
  const [delegationSuccess, setDelegationSuccess] = useState<string | null>(null);

  const handleDelegateScanner = () => {
    onLogAudit(
      selectedEvent,
      `Delegated scanner authority to ${delegatedVolunteer} for "${selectedEvent}" only`
    );
    setDelegationSuccess(`Delegated scanner access to ${delegatedVolunteer} for ${selectedEvent} only.`);
    setTimeout(() => setDelegationSuccess(null), 4000);
  };

  return (
    <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4">
      <h2 className="font-heading font-bold text-[#051F20] text-base">
        Event Scanner Delegation
      </h2>
      <p className="text-[12px] text-[#235347]">
        Scanner authority is assigned per event and per delegated user, never by role alone.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-semibold text-[#051F20] mb-1">
            Target Event
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-[13px] text-[#051F20] bg-white"
          >
            <option value="GeoTech 2026">GeoTech 2026</option>
            <option value="Campus Topo Camp 2026">Campus Topo Camp 2026</option>
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#051F20] mb-1">
            Delegate Scanner to Volunteer
          </label>
          <select
            value={delegatedVolunteer}
            onChange={(e) => setDelegatedVolunteer(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-[13px] text-[#051F20] bg-white"
          >
            <option value="Priya Sharma (GEO-2026-088)">Priya Sharma (GEO-2026-088)</option>
            <option value="Rohan Dave (GEO-2026-014)">Rohan Dave (GEO-2026-014)</option>
          </select>
        </div>
      </div>

      {!readOnly && (
        <button
          onClick={handleDelegateScanner}
          className="px-4 py-2 rounded-xl bg-[#163832] text-white text-[12px] font-semibold hover:bg-[#0B2B26] active:scale-95 transition-all"
          data-testid="btn-delegate-scanner"
        >
          Assign Scanner for Single Event
        </button>
      )}

      {delegationSuccess && (
        <div className="p-3 rounded-xl bg-[#DAF1DE] text-[#051F20] text-[12px] font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {delegationSuccess}
        </div>
      )}
    </div>
  );
};

/**
 * 8. Event Permissions Screen:
 * - Per-event grants list.
 * - Grant and revoke with confirmation; revoke takes effect immediately!
 */
const EventPermissionsScreen: React.FC<{
  readOnly: boolean;
  grants: SquadGrant[];
  setGrants: React.Dispatch<React.SetStateAction<SquadGrant[]>>;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, grants, setGrants, onLogAudit, currentUser }) => {
  const [selectedGrantToRevoke, setSelectedGrantToRevoke] = useState<SquadGrant | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantUser, setGrantUser] = useState('Arun Kumar');
  const [grantSquad, setGrantSquad] = useState('documentation');
  const [grantEvent, setGrantEvent] = useState('evt-geotech-2026');

  const handleConfirmRevoke = () => {
    if (!selectedGrantToRevoke) return;

    revokeSquadAccess(selectedGrantToRevoke.id);
    setGrants((prev) => prev.filter((g) => g.id !== selectedGrantToRevoke.id));

    onLogAudit(
      selectedGrantToRevoke.eventName || selectedGrantToRevoke.eventId,
      `Revoked WRITE grant for user ${selectedGrantToRevoke.userName} in squad ${selectedGrantToRevoke.squad}`
    );

    setSelectedGrantToRevoke(null);
  };

  const handleConfirmGrant = () => {
    const created = grantSquadAccess({
      userId: 'usr-grantee-new',
      userName: grantUser,
      squad: grantSquad,
      eventId: grantEvent,
      eventName: grantEvent === 'evt-geotech-2026' ? 'GeoTech 2026' : 'Campus Topo Camp 2026',
      access: 'write',
      grantedBy: currentUser?.name || 'Authorized Lead',
    });

    setGrants((prev) => [...prev, created]);
    onLogAudit(created.eventName || grantEvent, `Granted single-event WRITE access to ${grantUser}`);
    setShowGrantModal(false);
  };

  return (
    <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-bold text-[#051F20] text-base">
            Per-Event Single Squad Grants
          </h2>
          <p className="text-xs font-semibold text-[#235347] mt-0.5">
            Grants apply strictly to ONE event and revoke takes effect immediately.
          </p>
        </div>

        {!readOnly && (
          <button
            onClick={() => setShowGrantModal(true)}
            className="h-10 px-4 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center gap-1.5 shadow-sm touch-target-44 cursor-pointer w-fit"
            data-testid="btn-open-grant"
          >
            <Plus size={15} strokeWidth={2.2} />
            <span>Grant Single Event Access</span>
          </button>
        )}
      </div>

      <div className="space-y-3 pt-1">
        {grants.map((grant) => (
          <div
            key={grant.id}
            className="p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#8EB69B] transition-colors"
          >
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DAF1DE] text-[#163832] border border-[#8EB69B] flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs">
                {(grant.userName || grant.userId).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading font-bold text-[#051F20] text-sm">
                    {grant.userName || grant.userId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]">
                    Squad: {grant.squad}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#163832] text-white">
                    WRITE
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#235347] mt-1">
                  Event: <strong className="text-[#051F20]">{grant.eventName || grant.eventId}</strong> | Granted by: {grant.grantedBy}
                </p>
              </div>
            </div>

            {!readOnly && (
              <button
                onClick={() => setSelectedGrantToRevoke(grant)}
                className="h-9 px-3.5 rounded-xl bg-white border border-[#D9534F] text-[#D9534F] text-xs font-bold hover:bg-[#D9534F]/10 active:scale-95 transition-all flex items-center gap-1.5 touch-target-44 cursor-pointer shrink-0"
                data-testid={`btn-revoke-${grant.id}`}
              >
                <Trash2 size={13} strokeWidth={2} />
                <span>Revoke Grant</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Revoke confirmation dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedGrantToRevoke)}
        onClose={() => setSelectedGrantToRevoke(null)}
        onConfirm={handleConfirmRevoke}
        title="Revoke Single-Event Write Access"
        message={`Are you sure you want to revoke WRITE access for ${selectedGrantToRevoke?.userName} on event "${selectedGrantToRevoke?.eventName || selectedGrantToRevoke?.eventId}"? This change takes effect immediately.`}
      />

      {/* Grant modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/45 backdrop-blur-xs select-none">
          <div className="w-full max-w-md p-5 bg-white rounded-2xl border border-[#8EB69B]/40 shadow-xl space-y-3">
            <h3 className="font-heading font-bold text-[#051F20] text-base">
              Grant Single-Event Write Access
            </h3>
            <p className="text-[12px] text-[#235347]">
              A grant applies to ONE specific event only and does not roll over.
            </p>
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[12px] font-semibold text-[#051F20] mb-1">Squad Member</label>
                <input
                  type="text"
                  value={grantUser}
                  onChange={(e) => setGrantUser(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#8EB69B] text-[12px] text-[#051F20]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#051F20] mb-1">Squad</label>
                <select
                  value={grantSquad}
                  onChange={(e) => setGrantSquad(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#8EB69B] text-[12px] text-[#051F20] bg-white"
                >
                  <option value="documentation">Documentation</option>
                  <option value="promotion">Promotion</option>
                  <option value="management">Management</option>
                  <option value="treasurer">Treasurer</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#051F20] mb-1">Target Event</label>
                <select
                  value={grantEvent}
                  onChange={(e) => setGrantEvent(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#8EB69B] text-[12px] text-[#051F20] bg-white"
                >
                  <option value="evt-geotech-2026">GeoTech 2026</option>
                  <option value="evt-campus-camp">Campus Topo Camp 2026</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGrantModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#8EB69B] text-[#051F20] text-[12px] font-semibold hover:bg-[#DAF1DE]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmGrant}
                className="px-4 py-2 rounded-xl bg-[#163832] text-white text-[12px] font-semibold hover:bg-[#0B2B26]"
              >
                Confirm Grant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// Roster Data Model & Initial Mock Records
// =========================================================================
interface ScholarRecord {
  uid: string;
  name: string;
  role: string;
  squad: string;
  isLead: boolean;
  post: string;
  email?: string;
  rollNo?: string;
}

const INITIAL_CHAPTER_ROSTER: ScholarRecord[] = [
  { uid: 'u-fac', name: 'Dr. Ramesh Kumar', role: 'faculty', squad: 'Management', isLead: true, post: 'Faculty Advisor', email: 'ramesh.kumar@geohub.edu', rollNo: 'FAC-GEO-01' },
  { uid: 'u-pres', name: 'Siddharth Roy', role: 'coordinator', squad: 'Management', isLead: true, post: 'Club President', email: 'siddharth.roy@geohub.edu', rollNo: '22GEO001' },
  { uid: 'u-mgmt', name: 'Divya Rao', role: 'management', squad: 'Management', isLead: true, post: 'Management Lead', email: 'divya.rao@geohub.edu', rollNo: '22GEO005' },
  { uid: 'u-promo-lead', name: 'Sneha Patel', role: 'management', squad: 'Promotion', isLead: true, post: 'Promotion Lead', email: 'sneha.patel@geohub.edu', rollNo: '22GEO012' },
  { uid: 'u-treas-lead', name: 'Ananya Iyer', role: 'management', squad: 'Treasury', isLead: true, post: 'Treasury Lead', email: 'ananya.iyer@geohub.edu', rollNo: '22GEO023' },
  { uid: 'u-doc-lead', name: 'Aarav Patel', role: 'management', squad: 'Documentation', isLead: true, post: 'Documentation Lead', email: 'aarav.patel@geohub.edu', rollNo: '22GEO034' },
  { uid: 'u-mem-1', name: 'Kunal Sen', role: 'student', squad: 'Promotion', isLead: false, post: 'Social Media Associate', email: 'kunal.sen@geohub.edu', rollNo: '23GEO045' },
  { uid: 'u-mem-2', name: 'David Chen', role: 'student', squad: 'Documentation', isLead: false, post: 'Field Archivist', email: 'david.chen@geohub.edu', rollNo: '23GEO052' },
  { uid: 'u-mem-3', name: 'Priya Sharma', role: 'student', squad: 'Treasury', isLead: false, post: 'Voucher Auditor', email: 'priya.sharma@geohub.edu', rollNo: '23GEO061' },
  { uid: 'u-mem-4', name: 'Maya Patel', role: 'student', squad: 'Management', isLead: false, post: 'Logistics Coordinator', email: 'maya.patel@geohub.edu', rollNo: '23GEO070' },
];

/**
 * 9. Member Directory Screen:
 * - Clean roster list (names, squads, roles). No cramped edit/trash buttons on row.
 * - When clicking a member card, opens a dedicated FULL PAGE with complete member details!
 * - In that detail screen: update student information and delete operation with Faculty authority.
 */
const MemberDirectoryScreen: React.FC<{
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, onLogAudit, currentUser }) => {
  const [selectedSquad, setSelectedSquad] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<ScholarRecord | null>(null);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberSquad, setNewMemberSquad] = useState('Promotion');

  // Update student states on detail page
  const [editName, setEditName] = useState('');
  const [editPost, setEditPost] = useState('');
  const [editSquad, setEditSquad] = useState('Promotion');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [members, setMembers] = useState<ScholarRecord[]>(INITIAL_CHAPTER_ROSTER);

  const canRemove = canRemoveMember(currentUser);
  const effectiveSquad = selectedSquad === 'All' ? 'Promotion' : selectedSquad;
  const canAddMember = canAddSquadMember(currentUser, effectiveSquad);

  const handleSelectMember = (m: ScholarRecord) => {
    setSelectedMember(m);
    setEditName(m.name);
    setEditPost(m.post || m.role);
    setEditSquad(m.squad);
    setSaveSuccessMsg(null);
  };

  const handleSaveMemberUpdates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    const updated: ScholarRecord = {
      ...selectedMember,
      name: editName.trim() || selectedMember.name,
      post: editPost.trim() || selectedMember.post,
      squad: editSquad,
    };
    setMembers((prev) => prev.map((m) => (m.uid === selectedMember.uid ? updated : m)));
    setSelectedMember(updated);
    onLogAudit('Member Directory', `Updated profile details for ${updated.name} (${editSquad} Squad)`);
    setSaveSuccessMsg('Student record updated successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleRemoveFromPage = (member: ScholarRecord) => {
    if (!canRemove) return;
    if (member.role === 'faculty' || member.role === 'coordinator' || member.uid === currentUser?.uid) return;
    setMembers((prev) => prev.filter((m) => m.uid !== member.uid));
    onLogAudit('Member Directory', `Removed member ${member.name} (${member.role})`);
    setSelectedMember(null);
  };

  const handleConfirmAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const squad = selectedSquad === 'All' ? newMemberSquad : selectedSquad;
    const newEntry: ScholarRecord = {
      uid: `u-${Date.now()}`,
      name: newMemberName.trim(),
      role: 'student',
      squad,
      isLead: false,
      post: `${squad} Member`,
      rollNo: `24GEO${Math.floor(100 + Math.random() * 900)}`,
      email: `${newMemberName.toLowerCase().replace(/\s+/g, '.') || 'scholar'}@geohub.edu`,
    };
    setMembers((prev) => [...prev, newEntry]);
    onLogAudit('Member Directory', `Squad Lead enrolled ${newMemberName} into ${squad} squad`);
    setShowAddMemberModal(false);
    setNewMemberName('');
  };

  const squads = ['All', 'Management', 'Promotion', 'Treasury', 'Documentation'];

  const filteredMembers = members.filter((m) => {
    const matchesSquad =
      selectedSquad === 'All' || m.squad.toLowerCase() === selectedSquad.toLowerCase();
    if (!matchesSquad) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.name.toLowerCase().includes(q) ||
      m.squad.toLowerCase().includes(q) ||
      (m.post && m.post.toLowerCase().includes(q)) ||
      m.role.toLowerCase().includes(q)
    );
  });

  // FULL PAGE VIEW FOR SELECTED STUDENT
  if (selectedMember) {
    const isProtected = selectedMember.role === 'faculty' || selectedMember.role === 'coordinator';

    return (
      <div className="space-y-4 animate-fadeIn select-none pb-16">
        {/* Top Header & Back to Roster */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedMember(null)}
            data-testid="btn-back-to-roster"
            className="h-9 px-3.5 rounded-full bg-white border border-[#DAF1DE] text-[#163832] text-xs font-bold hover:bg-[#F6FBF7] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>Back to Roster</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#163832]" />
            <span>{selectedMember.isLead ? '👑 Squad Lead' : 'General Member'}</span>
          </span>
        </div>

        {/* Profile Dossier Card */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-extrabold text-xl shrink-0 shadow-xs ${
                selectedMember.isLead
                  ? 'bg-[#163832] text-[#DAF1DE] border border-[#235347]'
                  : 'bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]/40'
              }`}
            >
              {selectedMember.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading font-bold text-lg text-[#051F20] truncate">
                {selectedMember.name}
              </h2>
              <p className="text-xs text-[#235347] font-semibold truncate">
                {selectedMember.post || selectedMember.role} • {selectedMember.squad} Squad
              </p>
              <div className="flex items-center gap-2 text-xs text-[#8EB69B] mt-0.5 truncate">
                <span>Scholar ID: {selectedMember.uid}</span>
                {selectedMember.rollNo && (
                  <>
                    <span>•</span>
                    <span>Roll: {selectedMember.rollNo}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Success Notification */}
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-[#DAF1DE] border border-[#8EB69B] text-xs font-bold text-[#051F20] flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#163832]" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Update Student Form */}
          <div className="pt-3 border-t border-[#DAF1DE]">
            <h3 className="font-heading font-bold text-sm text-[#051F20] mb-3">
              Update Student Record
            </h3>
            <form onSubmit={handleSaveMemberUpdates} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Full Scholar Name
                </label>
                <input
                  type="text"
                  required
                  disabled={readOnly}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none bg-white focus:ring-2 focus:ring-[#8EB69B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    Designation / Club Post
                  </label>
                  <input
                    type="text"
                    required
                    disabled={readOnly}
                    value={editPost}
                    onChange={(e) => setEditPost(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none bg-white focus:ring-2 focus:ring-[#8EB69B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    Assigned Squad
                  </label>
                  <select
                    disabled={readOnly}
                    value={editSquad}
                    onChange={(e) => setEditSquad(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none bg-white focus:ring-2 focus:ring-[#8EB69B]"
                  >
                    <option value="Management">Management</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Treasury">Treasury</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>
              </div>

              {!readOnly && (
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                  >
                    <Check size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Delete Student Action */}
          <div className="pt-3 border-t border-[#DAF1DE]">
            <h3 className="font-heading font-bold text-sm text-[#051F20] mb-1.5">
              Roster Removal & Governance
            </h3>
            {isProtected ? (
              <div className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs text-[#235347]">
                🔒 <strong>Institutional Steering Account:</strong> Faculty Advisor and Club President accounts cannot be removed.
              </div>
            ) : canRemove ? (
              <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-red-900">
                    Remove Scholar from Club Roster
                  </p>
                  <p className="text-xs text-red-700">
                    Revokes all squad access, event operational permissions, and QR check-in status.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFromPage(selectedMember)}
                  data-testid={`btn-remove-member-${selectedMember.uid}`}
                  className="h-9 px-3.5 rounded-xl bg-[#D9534F] text-white text-xs font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer active:scale-95"
                >
                  <Trash2 size={13} />
                  <span>Delete Student</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs text-[#235347]">
                Roster removal requires Faculty Advisor executive authorization.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ROSTER LIST VIEW
  return (
    <div className="p-3.5 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4 select-none pb-12">
      {/* 1. Search Bar & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members by name, role or squad..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs text-[#051F20] placeholder:text-[#8EB69B] focus:border-[#235347] focus:bg-white transition-all outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#235347] hover:text-[#051F20] cursor-pointer"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {canAddMember && !readOnly && (
          <button
            type="button"
            onClick={() => setShowAddMemberModal(true)}
            className="h-9 px-3.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] transition-all flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer active:scale-95 shrink-0"
            data-testid="btn-add-squad-member"
          >
            <Plus size={14} className="shrink-0" />
            <span>Enroll Member</span>
          </button>
        )}
      </div>

      {/* 2. Squad Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {squads.map((sq) => {
          const isSelected = selectedSquad === sq;
          const count =
            sq === 'All'
              ? members.length
              : members.filter((m) => m.squad.toLowerCase() === sq.toLowerCase()).length;
          return (
            <button
              key={sq}
              type="button"
              onClick={() => setSelectedSquad(sq)}
              className={`h-8 px-3 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-[#163832] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
              }`}
            >
              <span>{sq}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#DAF1DE] text-[#163832]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Members List: Clickable cards that open student full page! */}
      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#235347] bg-[#F6FBF7] rounded-2xl border border-[#DAF1DE]">
            No roster members found matching your filters.
          </div>
        ) : (
          filteredMembers.map((m) => {
            return (
              <div
                key={m.uid}
                onClick={() => handleSelectMember(m)}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#F6FBF7]/60 hover:bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer active:scale-[0.99] group shadow-2xs"
                title="Click to view full student details, update or delete"
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-heading font-extrabold text-sm shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${
                      m.isLead
                        ? 'bg-[#163832] text-[#DAF1DE] border border-[#235347]'
                        : 'bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]/40'
                    }`}
                  >
                    {m.name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-heading font-bold text-sm text-[#051F20] truncate">
                        {m.name}
                      </span>
                      {m.isLead && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B] shrink-0 whitespace-nowrap">
                          <span>👑</span>
                          <span>Squad Lead</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#235347] truncate mt-0.5 flex items-center gap-1.5">
                      <span className="font-medium">{m.post || m.role}</span>
                      <span className="text-[#8EB69B]">•</span>
                      <span className="font-semibold text-[#163832]">{m.squad} Squad</span>
                    </div>
                  </div>
                </div>

                {/* Right: Tap indicator chevron */}
                <div className="flex items-center gap-1 text-[#8EB69B] group-hover:text-[#163832] group-hover:translate-x-0.5 transition-all shrink-0">
                  <span className="text-xs font-semibold hidden min-[400px]:inline text-[#235347]/70">View</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md border border-[#DAF1DE] shadow-2xl space-y-4">
            <h3 className="font-heading font-bold text-[#051F20] text-base">
              Enroll Member into {selectedSquad === 'All' ? newMemberSquad : selectedSquad} Squad
            </h3>
            <p className="text-xs text-[#235347]">
              Enrolled members gain READ access to their squad Operations Hub and duty assignments.
            </p>
            <form onSubmit={handleConfirmAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Candidate Scholar Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                />
              </div>

              {selectedSquad === 'All' && (
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    Target Squad
                  </label>
                  <select
                    value={newMemberSquad}
                    onChange={(e) => setNewMemberSquad(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                  >
                    <option value="Promotion">Promotion</option>
                    <option value="Treasury">Treasury</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#8EB69B] text-xs font-semibold text-[#051F20] hover:bg-[#DAF1DE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#163832] text-white text-xs font-semibold hover:bg-[#0B2B26] cursor-pointer"
                >
                  Enroll Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 10. Squads Screen:
 * - Shows all squads with the Squad Leads and the Members for that respective squad.
 * - Allows searching, filtering, and clicking to view member dossiers.
 * - Allows adding members to each respective squad.
 */
const SquadsScreen: React.FC<{
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, onLogAudit, currentUser }) => {
  const [selectedSquadFilter, setSelectedSquadFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<ScholarRecord | null>(null);

  const [members, setMembers] = useState<ScholarRecord[]>(INITIAL_CHAPTER_ROSTER);
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetSquadForAdd, setTargetSquadForAdd] = useState('Promotion');
  const [newMemberName, setNewMemberName] = useState('');

  const canRemove = canRemoveMember(currentUser);
  const canEditLeads = canAssignSquadLead(currentUser);

  const squadDefinitions = [
    {
      id: 'Management',
      name: 'Management Squad',
      description: 'Institutional governance, steering, duty protocols & event administration',
      icon: Shield,
      accent: 'bg-[#163832] text-[#DAF1DE]',
    },
    {
      id: 'Promotion',
      name: 'Promotion Squad',
      description: 'Campus outreach, social releases, campaign banners & sponsor pitches',
      icon: Megaphone,
      accent: 'bg-[#235347] text-[#DAF1DE]',
    },
    {
      id: 'Treasury',
      name: 'Treasury Squad',
      description: 'Budget allocations, expense ledgers, vouchers & financial audit exports',
      icon: Coins,
      accent: 'bg-[#0B2B26] text-[#F2B84B]',
    },
    {
      id: 'Documentation',
      name: 'Documentation Squad',
      description: 'Session transcripts, circular archives, photography & press bulletins',
      icon: FileText,
      accent: 'bg-[#163832] text-[#DAF1DE]',
    },
  ];

  const handleConfirmAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newEntry: ScholarRecord = {
      uid: `u-${Date.now()}`,
      name: newMemberName.trim(),
      role: 'student',
      squad: targetSquadForAdd,
      isLead: false,
      post: `${targetSquadForAdd} Associate`,
      rollNo: `24GEO${Math.floor(100 + Math.random() * 900)}`,
      email: `${newMemberName.toLowerCase().replace(/\s+/g, '.')}@geohub.edu`,
    };
    setMembers((prev) => [...prev, newEntry]);
    onLogAudit('Squads', `Enrolled ${newMemberName} into ${targetSquadForAdd} squad`);
    setShowAddModal(false);
    setNewMemberName('');
  };

  // If member clicked, show detail view
  if (selectedMember) {
    const isProtected = selectedMember.role === 'faculty' || selectedMember.role === 'coordinator';

    return (
      <div className="space-y-4 animate-fadeIn select-none pb-16">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedMember(null)}
            className="h-9 px-3.5 rounded-full bg-white border border-[#DAF1DE] text-[#163832] text-xs font-bold hover:bg-[#F6FBF7] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>Back to Squads</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
            <span>{selectedMember.isLead ? '👑 Squad Lead' : 'General Member'}</span>
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-extrabold text-xl shrink-0 shadow-xs ${
                selectedMember.isLead
                  ? 'bg-[#163832] text-[#DAF1DE] border border-[#235347]'
                  : 'bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]/40'
              }`}
            >
              {selectedMember.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading font-bold text-lg text-[#051F20] truncate">
                {selectedMember.name}
              </h2>
              <p className="text-xs text-[#235347] font-semibold truncate">
                {selectedMember.post || selectedMember.role} • {selectedMember.squad} Squad
              </p>
              <p className="text-xs text-[#8EB69B] mt-0.5 truncate">
                Scholar ID: {selectedMember.uid}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DAF1DE]">
            <h3 className="font-heading font-bold text-sm text-[#051F20] mb-2">
              Squad Membership Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#235347]">
              <div className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
                <span className="text-[#8EB69B] block font-semibold">Current Squad</span>
                <span className="font-bold text-[#051F20] text-sm">{selectedMember.squad} Squad</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
                <span className="text-[#8EB69B] block font-semibold">Designation / Role</span>
                <span className="font-bold text-[#051F20] text-sm">{selectedMember.post}</span>
              </div>
            </div>
          </div>

          {/* Delete Action if Faculty */}
          <div className="pt-3 border-t border-[#DAF1DE]">
            <h3 className="font-heading font-bold text-sm text-[#051F20] mb-1.5">
              Roster Removal
            </h3>
            {isProtected ? (
              <div className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs text-[#235347]">
                🔒 <strong>Institutional Steering Account:</strong> Faculty Advisor and Club President accounts cannot be removed.
              </div>
            ) : canRemove ? (
              <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-red-900">
                    Remove Scholar from Squad Roster
                  </p>
                  <p className="text-xs text-red-700">
                    Revokes squad access and operational permissions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMembers((prev) => prev.filter((m) => m.uid !== selectedMember.uid));
                    onLogAudit('Squads', `Removed member ${selectedMember.name} from ${selectedMember.squad}`);
                    setSelectedMember(null);
                  }}
                  className="h-9 px-3.5 rounded-xl bg-[#D9534F] text-white text-xs font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer active:scale-95"
                >
                  <Trash2 size={13} />
                  <span>Delete Member</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const filteredSquads = squadDefinitions.filter(
    (s) => selectedSquadFilter === 'All' || s.id.toLowerCase() === selectedSquadFilter.toLowerCase()
  );

  return (
    <div className="space-y-4 select-none pb-12 animate-fadeIn">
      {/* 1. Header & Filter */}
      <div className="p-3.5 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="font-heading font-bold text-base text-[#051F20]">
              Chapter Squads & Teams
            </h2>
            <p className="text-xs text-[#235347]">
              Squad leads, team rosters, and collaborative operational stations
            </p>
          </div>

          <div className="relative min-w-0 sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads or members..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs text-[#051F20] placeholder:text-[#8EB69B] focus:border-[#235347] focus:bg-white transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#235347] hover:text-[#051F20] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Squad Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {['All', 'Management', 'Promotion', 'Treasury', 'Documentation'].map((sq) => {
            const isSelected = selectedSquadFilter === sq;
            return (
              <button
                key={sq}
                type="button"
                onClick={() => setSelectedSquadFilter(sq)}
                className={`h-8 px-3 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#163832] text-white shadow-xs'
                    : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
                }`}
              >
                <span>{sq}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Squad Cards List */}
      <div className="space-y-4">
        {filteredSquads.map((sq) => {
          const Icon = sq.icon;
          const squadLeads = members.filter(
            (m) =>
              m.squad.toLowerCase() === sq.id.toLowerCase() &&
              m.isLead &&
              (!searchQuery.trim() ||
                m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.post.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          const squadMembers = members.filter(
            (m) =>
              m.squad.toLowerCase() === sq.id.toLowerCase() &&
              !m.isLead &&
              (!searchQuery.trim() ||
                m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.post.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          const totalCount = members.filter((m) => m.squad.toLowerCase() === sq.id.toLowerCase()).length;

          return (
            <div
              key={sq.id}
              className="p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4 select-none"
            >
              {/* Squad Header */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#DAF1DE]">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${sq.accent}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#051F20]">
                      {sq.name}
                    </h3>
                    <p className="text-xs text-[#235347] line-clamp-1">
                      {sq.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
                    {totalCount} Total Scholars
                  </span>
                  {!readOnly && canAddSquadMember(currentUser, sq.id) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTargetSquadForAdd(sq.id);
                        setShowAddModal(true);
                      }}
                      className="h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                      title="Enroll member into this squad"
                    >
                      <Plus size={13} />
                      <span className="hidden sm:inline">Add Member</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION A: Respective Squad Leads */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#163832]">
                  <Crown size={14} className="text-[#F2B84B]" />
                  <span>Squad Leads ({squadLeads.length})</span>
                </div>

                {squadLeads.length === 0 ? (
                  <div className="p-3 rounded-xl bg-[#F6FBF7] text-xs text-[#8EB69B] border border-[#DAF1DE] text-center">
                    No lead appointed yet for this squad.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {squadLeads.map((lead) => (
                      <div
                        key={lead.uid}
                        onClick={() => setSelectedMember(lead)}
                        className="p-3 rounded-2xl bg-gradient-to-r from-[#F6FBF7] to-white border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex items-center justify-between gap-2.5 cursor-pointer active:scale-[0.99] group shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-xl bg-[#163832] text-[#DAF1DE] flex items-center justify-center font-heading font-extrabold text-xs shrink-0 shadow-2xs">
                            {lead.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="font-heading font-bold text-xs text-[#051F20] truncate">
                                {lead.name}
                              </span>
                              <span className="text-xs">👑</span>
                            </div>
                            <p className="text-xs text-[#235347] truncate">
                              {lead.post}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[#8EB69B] group-hover:text-[#163832] transition-colors shrink-0">
                          <span className="text-xs font-semibold hidden min-[400px]:inline">View</span>
                          <ChevronRight size={15} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION B: Respective Squad Members */}
              <div className="space-y-2 pt-2 border-t border-[#DAF1DE]/60">
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#235347]">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-[#8EB69B]" />
                    <span>Squad Members ({squadMembers.length})</span>
                  </div>
                </div>

                {squadMembers.length === 0 ? (
                  <div className="p-3 rounded-xl bg-[#F6FBF7] text-xs text-[#8EB69B] border border-[#DAF1DE] text-center">
                    No general members enrolled in this squad yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {squadMembers.map((m) => (
                      <div
                        key={m.uid}
                        onClick={() => setSelectedMember(m)}
                        className="p-2.5 rounded-xl bg-[#F6FBF7]/60 hover:bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex items-center justify-between gap-2 cursor-pointer active:scale-[0.99] group"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center font-heading font-bold text-xs shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-heading font-bold text-xs text-[#051F20] truncate block">
                              {m.name}
                            </span>
                            <span className="text-xs text-[#235347] truncate block">
                              {m.post}
                            </span>
                          </div>
                        </div>

                        <div className="text-[#8EB69B] group-hover:text-[#163832] transition-colors shrink-0">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md border border-[#DAF1DE] shadow-2xl space-y-4">
            <h3 className="font-heading font-bold text-[#051F20] text-base">
              Enroll Member into {targetSquadForAdd} Squad
            </h3>
            <p className="text-xs text-[#235347]">
              Enrolled members gain access to operational tools and duty assignments for this squad.
            </p>
            <form onSubmit={handleConfirmAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Candidate Scholar Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#8EB69B] text-xs font-semibold text-[#051F20] hover:bg-[#DAF1DE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#163832] text-white text-xs font-semibold hover:bg-[#0B2B26] cursor-pointer"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 11. Squad Leads Screen (Write Operations Enabled for Faculty Advisor & President):
 * - View all appointed squad leads.
 * - Perform write operations: Edit squad leads (change name, designation, squad transfer) and Appoint new leads!
 */
const SquadLeadsScreen: React.FC<{
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, onLogAudit, currentUser }) => {
  const [leads, setLeads] = useState<ScholarRecord[]>([
    { uid: 'u-mgmt', name: 'Divya Rao', role: 'management', squad: 'Management', isLead: true, post: 'Management Lead', email: 'divya.rao@geohub.edu', rollNo: '22GEO005' },
    { uid: 'u-promo-lead', name: 'Sneha Patel', role: 'management', squad: 'Promotion', isLead: true, post: 'Promotion Lead', email: 'sneha.patel@geohub.edu', rollNo: '22GEO012' },
    { uid: 'u-treas-lead', name: 'Ananya Iyer', role: 'management', squad: 'Treasury', isLead: true, post: 'Treasury Lead', email: 'ananya.iyer@geohub.edu', rollNo: '22GEO023' },
    { uid: 'u-doc-lead', name: 'Aarav Patel', role: 'management', squad: 'Documentation', isLead: true, post: 'Documentation Lead', email: 'aarav.patel@geohub.edu', rollNo: '22GEO034' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [editingLead, setEditingLead] = useState<ScholarRecord | null>(null);

  // Form states for editing
  const [editName, setEditName] = useState('');
  const [editPost, setEditPost] = useState('');
  const [editSquad, setEditSquad] = useState('Promotion');
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for appointing
  const [appointName, setAppointName] = useState('');
  const [appointSquad, setAppointSquad] = useState('Promotion');
  const [appointPost, setAppointPost] = useState('Promotion Co-Lead');

  const canEdit = !readOnly && canAssignSquadLead(currentUser);

  const handleOpenEdit = (lead: ScholarRecord) => {
    setEditingLead(lead);
    setEditName(lead.name);
    setEditPost(lead.post);
    setEditSquad(lead.squad);
    setShowEditModal(true);
  };

  const handleSaveLeadEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    const updated: ScholarRecord = {
      ...editingLead,
      name: editName.trim() || editingLead.name,
      post: editPost.trim() || editingLead.post,
      squad: editSquad,
    };

    setLeads((prev) => prev.map((l) => (l.uid === editingLead.uid ? updated : l)));
    onLogAudit('Squad Leads', `Updated squad lead: ${updated.name} for ${updated.squad} Squad (${updated.post})`);
    setShowEditModal(false);
    setEditingLead(null);
    setNotification(`Successfully updated Squad Lead: ${updated.name}`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleStepDownLead = () => {
    if (!editingLead) return;
    setLeads((prev) => prev.filter((l) => l.uid !== editingLead.uid));
    onLogAudit('Squad Leads', `Stepped down squad lead ${editingLead.name} from ${editingLead.squad} Squad`);
    setShowEditModal(false);
    setEditingLead(null);
    setNotification(`Stepped down lead ${editingLead.name} back to squad member.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleConfirmAppoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointName.trim()) return;

    const newLead: ScholarRecord = {
      uid: `u-lead-${Date.now()}`,
      name: appointName.trim(),
      role: 'management',
      squad: appointSquad,
      isLead: true,
      post: appointPost.trim() || `${appointSquad} Lead`,
      email: `${appointName.toLowerCase().replace(/\s+/g, '.')}@geohub.edu`,
    };

    setLeads((prev) => [...prev, newLead]);
    onLogAudit('Squad Leads', `Appointed ${appointName} as ${newLead.post}`);
    setShowAppointModal(false);
    setAppointName('');
    setNotification(`Successfully appointed ${newLead.name} as ${newLead.post}`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredLeads = leads.filter(
    (l) =>
      !searchQuery.trim() ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.squad.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.post.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3.5 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4 select-none pb-12 animate-fadeIn">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#163832] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#235347]">
              Executive Governance
            </span>
          </div>
          <h2 className="font-heading font-bold text-lg text-[#051F20]">
            Squad Leads Directory
          </h2>
          <p className="text-xs text-[#235347]">
            Squad lead appointments, operational coordination & executive leadership
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAppointModal(true)}
              data-testid="btn-appoint-squad-lead"
              className="h-9 px-3.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] transition-all flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
            >
              <Plus size={14} />
              <span>Appoint Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="p-3 rounded-xl bg-[#DAF1DE] border border-[#8EB69B] text-xs font-bold text-[#051F20] flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={15} className="text-[#163832]" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search squad leads by name, squad, or designation..."
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs text-[#051F20] placeholder:text-[#8EB69B] focus:border-[#235347] focus:bg-white transition-all outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#235347] hover:text-[#051F20] cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 3. Squad Leads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredLeads.map((lead) => (
          <div
            key={lead.uid}
            className="p-4 rounded-2xl bg-[#F6FBF7]/70 border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex flex-col justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-[#163832] text-[#DAF1DE] flex items-center justify-center font-heading font-extrabold text-sm shrink-0 shadow-2xs">
                  {lead.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-heading font-bold text-sm text-[#051F20] truncate">
                      {lead.name}
                    </h3>
                    <span className="text-xs">👑</span>
                  </div>
                  <p className="text-xs text-[#235347] font-semibold truncate mt-0.5">
                    {lead.post}
                  </p>
                  <p className="text-xs text-[#8EB69B] truncate mt-0.5">
                    {lead.squad} Squad • {lead.email}
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B] shrink-0">
                Write Access
              </span>
            </div>

            {/* Write Operation Button: Edit Squad Lead */}
            {canEdit && (
              <div className="pt-2 border-t border-[#DAF1DE] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(lead)}
                  data-testid={`btn-edit-squad-lead-${lead.uid}`}
                  className="h-8 px-3 rounded-xl bg-white border border-[#8EB69B] text-[#163832] text-xs font-bold hover:bg-[#DAF1DE] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Edit2 size={13} />
                  <span>Edit Squad Lead</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Squad Lead Modal */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md border border-[#DAF1DE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-[#051F20] text-base">
                Edit Squad Lead
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-[#8EB69B] hover:text-[#051F20] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLeadEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Lead Scholar Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Designation / Post
                </label>
                <input
                  type="text"
                  required
                  value={editPost}
                  onChange={(e) => setEditPost(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Assigned Squad
                </label>
                <select
                  value={editSquad}
                  onChange={(e) => setEditSquad(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                >
                  <option value="Management">Management Squad</option>
                  <option value="Promotion">Promotion Squad</option>
                  <option value="Treasury">Treasury Squad</option>
                  <option value="Documentation">Documentation Squad</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#DAF1DE]">
                <button
                  type="button"
                  onClick={handleStepDownLead}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-[#D9534F] hover:bg-red-50 cursor-pointer"
                >
                  Step Down Lead
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-3 py-2 rounded-xl border border-[#8EB69B] text-xs font-semibold text-[#051F20] hover:bg-[#DAF1DE] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#163832] text-white text-xs font-semibold hover:bg-[#0B2B26] cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appoint New Squad Lead Modal */}
      {showAppointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md border border-[#DAF1DE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-[#051F20] text-base">
                Appoint New Squad Lead
              </h3>
              <button
                type="button"
                onClick={() => setShowAppointModal(false)}
                className="text-[#8EB69B] hover:text-[#051F20] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAppoint} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Target Squad
                </label>
                <select
                  value={appointSquad}
                  onChange={(e) => setAppointSquad(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                >
                  <option value="Promotion">Promotion Squad</option>
                  <option value="Treasury">Treasury Squad</option>
                  <option value="Documentation">Documentation Squad</option>
                  <option value="Management">Management Squad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Candidate Scholar Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kunal Sen"
                  value={appointName}
                  onChange={(e) => setAppointName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Designation / Post
                </label>
                <input
                  type="text"
                  required
                  value={appointPost}
                  onChange={(e) => setAppointPost(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DAF1DE]">
                <button
                  type="button"
                  onClick={() => setShowAppointModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#8EB69B] text-xs font-semibold text-[#051F20] hover:bg-[#DAF1DE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#163832] text-white text-xs font-semibold hover:bg-[#0B2B26] cursor-pointer"
                >
                  Appoint Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 12. Duties Assignment Screen:
 * - Steering Committee & Squad Leads assign event-specific duties to members.
 * - Temporal Write Access Engine: Active events grant write permissions across Operational Hubs;
 *   automatically locks to Read-Only once event concludes.
 */
interface DutyRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  eventStatus: 'upcoming' | 'ongoing' | 'concluded';
  assigneeName: string;
  assigneeRole: string;
  squad: string;
  task: string;
  station: string;
  status: 'in_progress' | 'completed';
}

const DutiesAssignmentScreen: React.FC<{
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, onLogAudit, currentUser }) => {
  const [viewMode, setViewMode] = useState<'by_member' | 'by_event'>('by_member');

  const [duties, setDuties] = useState<DutyRecord[]>([
    {
      id: 'duty-1',
      eventId: 'ev-geofest',
      eventTitle: 'GEO FEST 2026: Campus Odyssey',
      eventStatus: 'ongoing',
      assigneeName: 'Ananya Iyer',
      assigneeRole: 'Treasury Lead',
      squad: 'Treasury',
      task: 'Honorarium and audio rigging voucher clearance',
      station: 'Main Auditorium Finance Station',
      status: 'completed',
    },
    {
      id: 'duty-2',
      eventId: 'ev-geofest',
      eventTitle: 'GEO FEST 2026: Campus Odyssey',
      eventStatus: 'ongoing',
      assigneeName: 'Sneha Patel',
      assigneeRole: 'Promotion Lead',
      squad: 'Promotion',
      task: 'Stage banners, guest photo wall & live social feed dispatch',
      station: 'Stage Media Deck & North Entrance',
      status: 'in_progress',
    },
    {
      id: 'duty-3',
      eventId: 'ev-geofest',
      eventTitle: 'GEO FEST 2026: Campus Odyssey',
      eventStatus: 'ongoing',
      assigneeName: 'Aarav Patel',
      assigneeRole: 'Documentation Lead',
      squad: 'Documentation',
      task: 'High-res keynote session recording & circular documentation',
      station: 'Press Gallery Tech Station',
      status: 'in_progress',
    },
    {
      id: 'duty-4',
      eventId: 'ev-geofest',
      eventTitle: 'GEO FEST 2026: Campus Odyssey',
      eventStatus: 'ongoing',
      assigneeName: 'Maya Patel',
      assigneeRole: 'Logistics Associate',
      squad: 'Management',
      task: 'Participant kit distribution, QR scanner check-in desk',
      station: 'Gate 2 Registration Desk',
      status: 'completed',
    },
    {
      id: 'duty-5',
      eventId: 'ev-gis',
      eventTitle: 'GIS & Satellite Telemetry Workshop',
      eventStatus: 'ongoing',
      assigneeName: 'Priya Sharma',
      assigneeRole: 'Treasurer Associate',
      squad: 'Treasury',
      task: 'GIS software workstation license budget allocation vouchers',
      station: 'Geomatics Lab 3 Desk',
      status: 'in_progress',
    },
    {
      id: 'duty-6',
      eventId: 'ev-gis',
      eventTitle: 'GIS & Satellite Telemetry Workshop',
      eventStatus: 'ongoing',
      assigneeName: 'Kunal Sen',
      assigneeRole: 'Promotion Associate',
      squad: 'Promotion',
      task: 'Workshop directional signage and attendee onboarding guidance',
      station: 'Seminar Hall 1 Foyer',
      status: 'in_progress',
    },
    {
      id: 'duty-7',
      eventId: 'ev-drone',
      eventTitle: 'Campus Biodiversity Drone Survey',
      eventStatus: 'upcoming',
      assigneeName: 'David Chen',
      assigneeRole: 'Field Archivist',
      squad: 'Documentation',
      task: 'Drone telemetry micro-SD card indexing & field flight logbook',
      station: 'North Quad Drone Base Station',
      status: 'in_progress',
    },
    {
      id: 'duty-8',
      eventId: 'ev-remotesensing',
      eventTitle: 'National Remote Sensing Colloquium 2026',
      eventStatus: 'concluded',
      assigneeName: 'Divya Rao',
      assigneeRole: 'Management Lead',
      squad: 'Management',
      task: 'Proceedings booklet collation and committee MoM formal sign-off',
      station: 'Conference Center Hall A',
      status: 'completed',
    },
  ]);

  const [selectedSquad, setSelectedSquad] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [newEventTitle, setNewEventTitle] = useState('GEO FEST 2026: Campus Odyssey');
  const [newSquad, setNewSquad] = useState('Promotion');
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newStation, setNewStation] = useState('');

  const canManageDuties = !readOnly;

  const handleToggleStatus = (id: string) => {
    if (readOnly) return;
    setDuties((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus = d.status === 'completed' ? 'in_progress' : 'completed';
          onLogAudit('Duties Assignment', `Updated duty for ${d.assigneeName} to ${nextStatus}`);
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  const handleRemoveDuty = (id: string, name: string) => {
    if (readOnly) return;
    setDuties((prev) => prev.filter((d) => d.id !== id));
    onLogAudit('Duties Assignment', `Unassigned duty from ${name}`);
  };

  const handleConfirmAssignDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssigneeName.trim() || !newTask.trim()) return;

    const isOngoing = newEventTitle.includes('GEO FEST') || newEventTitle.includes('GIS');
    const isConcluded = newEventTitle.includes('Colloquium');

    const newDuty: DutyRecord = {
      id: `duty-${Date.now()}`,
      eventId: `ev-${Date.now()}`,
      eventTitle: newEventTitle,
      eventStatus: isConcluded ? 'concluded' : isOngoing ? 'ongoing' : 'upcoming',
      assigneeName: newAssigneeName.trim(),
      assigneeRole: `${newSquad} Associate`,
      squad: newSquad,
      task: newTask.trim(),
      station: newStation.trim() || 'Assigned Venue Post',
      status: 'in_progress',
    };

    setDuties((prev) => [newDuty, ...prev]);
    onLogAudit('Duties Assignment', `Assigned ${newSquad} duty to ${newAssigneeName} for ${newEventTitle}`);
    setShowAssignModal(false);
    setNewAssigneeName('');
    setNewTask('');
    setNewStation('');
  };

  const squads = ['All', 'Management', 'Promotion', 'Treasury', 'Documentation'];

  // Filtered duties
  const filteredDuties = duties.filter((d) => {
    const matchesSquad = selectedSquad === 'All' || d.squad.toLowerCase() === selectedSquad.toLowerCase();
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Active' && d.status === 'in_progress') ||
      (selectedStatus === 'Completed' && d.status === 'completed');
    if (!matchesSquad || !matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      d.assigneeName.toLowerCase().includes(q) ||
      d.task.toLowerCase().includes(q) ||
      d.eventTitle.toLowerCase().includes(q) ||
      d.station.toLowerCase().includes(q) ||
      d.squad.toLowerCase().includes(q)
    );
  });

  // Group duties by member
  const membersWithDuties = Array.from(new Set(duties.map((d) => d.assigneeName))).map((memberName) => {
    const memberDuties = filteredDuties.filter((d) => d.assigneeName === memberName);
    const sampleDuty = duties.find((d) => d.assigneeName === memberName);
    return {
      name: memberName,
      role: sampleDuty?.assigneeRole || 'Scholar',
      squad: sampleDuty?.squad || 'General',
      duties: memberDuties,
    };
  }).filter((m) => m.duties.length > 0 || !searchQuery.trim());

  return (
    <div className="p-3.5 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4 select-none pb-12 animate-fadeIn">
      {/* 1. Header, View Mode Switcher & Assign Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-bold text-base sm:text-lg text-[#051F20]">
            Duties & Task Assignments
          </h2>
          <p className="text-xs text-[#235347]">
            Operational duty allocations, venue station deployments & crew tracking
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle: By Member vs By Event */}
          <div className="flex items-center gap-1 bg-[#F6FBF7] p-1 rounded-xl border border-[#DAF1DE]">
            <button
              type="button"
              onClick={() => setViewMode('by_member')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'by_member'
                  ? 'bg-[#163832] text-white shadow-xs'
                  : 'text-[#235347] hover:text-[#051F20]'
              }`}
            >
              By Member
            </button>
            <button
              type="button"
              onClick={() => setViewMode('by_event')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'by_event'
                  ? 'bg-[#163832] text-white shadow-xs'
                  : 'text-[#235347] hover:text-[#051F20]'
              }`}
            >
              By Event
            </button>
          </div>

          {canManageDuties && (
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              data-testid="btn-assign-duty"
              className="h-9 px-3.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] transition-all flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
            >
              <Plus size={14} />
              <span>Assign Duty</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search duties by member, task, or venue station..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs text-[#051F20] placeholder:text-[#8EB69B] focus:border-[#235347] focus:bg-white transition-all outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#235347] hover:text-[#051F20] cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Squad & Status Filter Pills */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {squads.map((sq) => {
              const isSelected = selectedSquad === sq;
              const count =
                sq === 'All'
                  ? duties.length
                  : duties.filter((d) => d.squad.toLowerCase() === sq.toLowerCase()).length;
              return (
                <button
                  key={sq}
                  type="button"
                  onClick={() => setSelectedSquad(sq)}
                  className={`h-8 px-3 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#163832] text-white shadow-xs'
                      : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
                  }`}
                >
                  <span>{sq}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#DAF1DE] text-[#163832]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 bg-[#F6FBF7] p-1 rounded-xl border border-[#DAF1DE] shrink-0">
            {(['All', 'Active', 'Completed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-white text-[#163832] shadow-xs border border-[#DAF1DE]'
                    : 'text-[#235347] hover:text-[#051F20]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. VIEW MODE A: BY MEMBER (SHOWS DUTIES ASSIGNED FOR EACH MEMBER) */}
      {viewMode === 'by_member' && (
        <div className="space-y-3.5 pt-1">
          {membersWithDuties.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#235347] bg-[#F6FBF7] rounded-2xl border border-[#DAF1DE]">
              No members found with assigned duties matching your filters.
            </div>
          ) : (
            membersWithDuties.map((member) => (
              <div
                key={member.name}
                className="p-4 rounded-2xl bg-[#F6FBF7]/50 border border-[#DAF1DE] shadow-2xs space-y-3"
              >
                {/* Member Dossier Header */}
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#DAF1DE]">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[#163832] text-[#DAF1DE] flex items-center justify-center font-heading font-extrabold text-xs shrink-0 shadow-2xs">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-sm text-[#051F20] truncate">
                          {member.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white text-[#163832] border border-[#DAF1DE]">
                          {member.squad} Squad
                        </span>
                      </div>
                      <p className="text-xs text-[#235347] truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
                      {member.duties.length} Assigned {member.duties.length === 1 ? 'Duty' : 'Duties'}
                    </span>
                    {canManageDuties && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewAssigneeName(member.name);
                          setNewSquad(member.squad);
                          setShowAssignModal(true);
                        }}
                        className="h-8 px-2.5 rounded-xl bg-white border border-[#8EB69B] text-[#163832] text-xs font-bold hover:bg-[#DAF1DE] transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                        title="Assign new duty to this member"
                      >
                        <Plus size={13} />
                        <span className="hidden min-[450px]:inline">Add Duty</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Assigned Duties for this Member */}
                <div className="space-y-2">
                  {member.duties.map((d) => {
                    const isDone = d.status === 'completed';
                    const isOngoing = d.eventStatus === 'ongoing';

                    return (
                      <div
                        key={d.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                          isDone
                            ? 'bg-white/60 border-[#DAF1DE] opacity-80'
                            : 'bg-white border-[#8EB69B]/50 shadow-2xs'
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-bold text-xs text-[#051F20]">
                              {d.eventTitle}
                            </span>
                            {isOngoing ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]">
                                Active Event • Write Access ✍️
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-xs font-bold bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]">
                                {d.eventStatus}
                              </span>
                            )}
                            <span className="text-xs text-[#235347] flex items-center gap-1">
                              <MapPin size={11} className="text-[#8EB69B]" />
                              <span>{d.station}</span>
                            </span>
                          </div>

                          <p className={`text-xs leading-relaxed ${isDone ? 'line-through text-[#8EB69B]' : 'text-[#235347]'}`}>
                            {d.task}
                          </p>
                        </div>

                        {canManageDuties && (
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(d.id)}
                              className={`h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                isDone
                                  ? 'bg-[#163832] text-white shadow-xs'
                                  : 'bg-[#F6FBF7] border border-[#8EB69B] text-[#163832] hover:bg-[#DAF1DE]'
                              }`}
                            >
                              <Check size={13} />
                              <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveDuty(d.id, d.assigneeName)}
                              className="w-8 h-8 rounded-xl bg-white border border-[#D9534F]/30 text-[#D9534F] hover:bg-[#D9534F]/10 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                              title="Unassign Duty"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. VIEW MODE B: BY EVENT */}
      {viewMode === 'by_event' && (
        <div className="space-y-3 pt-1">
          {filteredDuties.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#235347] bg-[#F6FBF7] rounded-2xl border border-[#DAF1DE]">
              No duties found matching your filters.
            </div>
          ) : (
            filteredDuties.map((d) => {
              const isDone = d.status === 'completed';
              const isOngoing = d.eventStatus === 'ongoing';

              return (
                <div
                  key={d.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all select-none space-y-2.5 ${
                    isDone
                      ? 'bg-[#F6FBF7]/50 border-[#DAF1DE] opacity-80'
                      : 'bg-white border-[#8EB69B]/50 shadow-[0_2px_12px_rgba(5,31,32,0.04)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-heading font-bold text-xs text-[#051F20] truncate">
                      {d.eventTitle}
                    </span>
                    {isOngoing ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B] shrink-0">
                        <span>Event Active • Temporal Write Access ✍️</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] shrink-0">
                        <span>{d.eventStatus}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-[#DAF1DE]/60">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-sm text-[#051F20]">
                          {d.assigneeName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F6FBF7] text-[#163832] border border-[#DAF1DE]">
                          {d.squad} Squad
                        </span>
                        <span className="text-xs text-[#235347] flex items-center gap-1">
                          <MapPin size={12} className="text-[#8EB69B]" />
                          <span>{d.station}</span>
                        </span>
                      </div>

                      <p className={`text-xs leading-relaxed ${isDone ? 'line-through text-[#8EB69B]' : 'text-[#235347]'}`}>
                        {d.task}
                      </p>
                    </div>

                    {canManageDuties && (
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(d.id)}
                          className={`h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                            isDone
                              ? 'bg-[#163832] text-white shadow-xs'
                              : 'bg-white border border-[#8EB69B] text-[#163832] hover:bg-[#DAF1DE]'
                          }`}
                        >
                          <Check size={13} />
                          <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveDuty(d.id, d.assigneeName)}
                          className="w-8 h-8 rounded-xl bg-white border border-[#D9534F]/30 text-[#D9534F] hover:bg-[#D9534F]/10 hover:border-[#D9534F] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="Unassign Duty"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Assign New Duty Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md border border-[#DAF1DE] shadow-2xl space-y-4">
            <h3 className="font-heading font-bold text-[#051F20] text-base">
              Assign New Event Duty
            </h3>
            <p className="text-xs text-[#235347]">
              Enables temporal operational write access for the assignee while the event is active.
            </p>
            <form onSubmit={handleConfirmAssignDuty} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Target Chapter Event
                </label>
                <select
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                >
                  <option value="GEO FEST 2026: Campus Odyssey">GEO FEST 2026: Campus Odyssey (Ongoing)</option>
                  <option value="GIS & Satellite Telemetry Workshop">GIS & Satellite Telemetry Workshop (Ongoing)</option>
                  <option value="Campus Biodiversity Drone Survey">Campus Biodiversity Drone Survey (Upcoming)</option>
                  <option value="National Remote Sensing Colloquium 2026">National Remote Sensing Colloquium 2026 (Concluded)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    Operational Squad
                  </label>
                  <select
                    value={newSquad}
                    onChange={(e) => setNewSquad(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                  >
                    <option value="Promotion">Promotion</option>
                    <option value="Treasury">Treasury</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    Assignee Scholar Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kunal Sen"
                    value={newAssigneeName}
                    onChange={(e) => setNewAssigneeName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Venue Station / Post
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Auditorium Audio Deck"
                  value={newStation}
                  onChange={(e) => setNewStation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Operational Duty Task Description
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe the exact duty responsibility..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-xs text-[#051F20] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#8EB69B] text-xs font-semibold text-[#051F20] hover:bg-[#DAF1DE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#163832] text-white text-xs font-semibold hover:bg-[#0B2B26] cursor-pointer"
                >
                  Assign Duty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const LeadActivityReviewScreen: React.FC<{
  readOnly: boolean;
  canApprove: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, canApprove, onLogAudit, currentUser }) => {
  const [milestones, setMilestones] = useState([
    {
      id: 'm-1',
      squad: 'Management',
      lead: 'Divya Rao',
      title: 'Auditorium Venue Clearance Brief',
      status: 'Pending',
    },
    {
      id: 'm-2',
      squad: 'Promotion',
      lead: 'Sneha Patel',
      title: 'Sponsorship Pitch Kit 2026',
      status: 'Pending',
    },
  ]);

  const handleSignOff = (id: string, title: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Approved' } : m))
    );
    onLogAudit('Lead Activity Review', `Signed off milestone "${title}"`);
  };

  return (
    <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4">
      <h2 className="font-heading font-bold text-[#051F20] text-base">
        Squad Lead Milestone Sign-Offs
      </h2>

      <div className="divide-y divide-[#8EB69B]/20">
        {milestones.map((m) => (
          <div key={m.id} className="py-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-heading font-bold text-[#051F20] text-sm">
                {m.title}
              </div>
              <p className="text-[12px] text-[#235347]">
                Lead: {m.lead} ({m.squad})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[12px] font-semibold ${
                  m.status === 'Approved'
                    ? 'bg-[#DAF1DE] text-[#051F20]'
                    : 'bg-[#F2B84B] text-[#051F20]'
                }`}
              >
                {m.status}
              </span>

              {canApprove && m.status === 'Pending' && (
                <button
                  onClick={() => handleSignOff(m.id, m.title)}
                  className="px-3 py-1.5 rounded-xl bg-[#163832] text-white text-[12px] font-semibold hover:bg-[#0B2B26]"
                  data-testid={`btn-signoff-${m.id}`}
                >
                  Sign Off
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 11. Generic Module Screen for other hub modules:
 * - Clean brand-consistent layout.
 * - Hides action buttons in READ mode.
 */
const GenericModuleScreen: React.FC<{
  moduleId: ModuleId;
  config: any;
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ moduleId, config, readOnly, onLogAudit, currentUser }) => {
  const [performedAction, setPerformedAction] = useState<string | null>(null);

  const handleAction = (label: string) => {
    onLogAudit(config.name, `Executed ${label}`);
    setPerformedAction(`Action "${label}" logged to audit trail.`);
    setTimeout(() => setPerformedAction(null), 3500);
  };

  return (
    <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-[#051F20] text-base">
          {config.name} Console
        </h2>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]">
          Section: <strong>{config.section}</strong>
        </span>
      </div>

      <p className="text-xs text-[#235347] leading-relaxed">
        This module provides operational controls and workflows for {config.description.toLowerCase()}.
      </p>

      {!readOnly && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => handleAction('Operational Update')}
            className="h-10 px-4 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all touch-target-44 cursor-pointer shadow-sm"
            data-testid={`btn-generic-action-${moduleId}`}
          >
            Execute Update
          </button>
        </div>
      )}

      {performedAction && (
        <div className="p-3.5 rounded-2xl bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {performedAction}

        </div>
      )}
    </div>
  );
};

export default ExploreActivitiesView;
