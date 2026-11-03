import React, { useState } from 'react';
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
        subtitle="Operational modules, role assignments & squad governance"
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
                count={sectionModules.length}
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
 * - Internal events: 1 OTP/QR code.
 * - External events: Entry OTP and Exit OTP with separate countdowns.
 * - Manual override with mandatory reason.
 */
const AttendanceDeskScreen: React.FC<{
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, onLogAudit, currentUser }) => {
  const [eventType, setEventType] = useState<'internal' | 'external'>('internal');
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overrideStudent, setOverrideStudent] = useState('GEO-2026-042');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideStatus, setOverrideStatus] = useState<string | null>(null);

  const handleOverrideSubmit = (reason?: string) => {
    const finalReason = reason || overrideReason;
    if (!finalReason.trim()) return;

    onLogAudit(
      eventType === 'internal' ? 'Internal GIS Orientation' : 'Inter-College Geo-Marathon',
      `Manual attendance override for student ${overrideStudent}. Mandatory Reason: "${finalReason}"`
    );

    setOverrideStatus(`Attendance overridden for ${overrideStudent}.`);
    setShowOverrideDialog(false);
    setOverrideReason('');
    setTimeout(() => setOverrideStatus(null), 4000);
  };

  return (
    <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-heading font-bold text-[#051F20] text-base">
          Live Attendance Desk
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEventType('internal')}
            className={`px-3 py-1 rounded-xl text-[12px] font-semibold transition-all ${
              eventType === 'internal'
                ? 'bg-[#163832] text-white'
                : 'bg-[#DAF1DE] text-[#051F20]'
            }`}
          >
            Internal Event (1-Phase)
          </button>
          <button
            onClick={() => setEventType('external')}
            className={`px-3 py-1 rounded-xl text-[12px] font-semibold transition-all ${
              eventType === 'external'
                ? 'bg-[#163832] text-white'
                : 'bg-[#DAF1DE] text-[#051F20]'
            }`}
          >
            External Event (Entry/Exit)
          </button>
        </div>
      </div>

      {/* OTP Display Card */}
      {eventType === 'internal' ? (
        <div className="p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[12px] font-semibold text-[#235347] uppercase tracking-wider">
              Single-Phase Check-In OTP / QR
            </span>
            <div className="text-3xl font-mono font-bold text-[#051F20] tracking-widest mt-1">
              829 401
            </div>
            <p className="text-[12px] text-[#235347] mt-1">
              Rotates every 30 seconds for fraud prevention.
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
            <QrCode size={32} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE]">
            <span className="text-[12px] font-semibold text-[#235347] uppercase tracking-wider">
              Phase 1: Entry OTP
            </span>
            <div className="text-2xl font-mono font-bold text-[#051F20] tracking-widest mt-1">
              419 203
            </div>
            <p className="text-[12px] text-[#235347] mt-1">Valid until 11:30 AM</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE]">
            <span className="text-[12px] font-semibold text-[#235347] uppercase tracking-wider">
              Phase 2: Exit OTP
            </span>
            <div className="text-2xl font-mono font-bold text-[#051F20] tracking-widest mt-1">
              736 194
            </div>
            <p className="text-[12px] text-[#235347] mt-1">Countdown active post 04:00 PM</p>
          </div>
        </div>
      )}

      {/* Manual Override Action (Hidden if readOnly) */}
      {!readOnly && (
        <div className="pt-2">
          <button
            onClick={() => setShowOverrideDialog(true)}
            className="px-4 py-2 rounded-xl bg-[#163832] text-white text-[12px] font-semibold hover:bg-[#0B2B26] active:scale-95 transition-all"
            data-testid="btn-manual-override"
          >
            Manual Attendance Override
          </button>
        </div>
      )}

      {overrideStatus && (
        <div className="p-3 rounded-xl bg-[#DAF1DE] text-[#051F20] text-[12px] font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {overrideStatus}
        </div>
      )}

      {/* Override Dialog with Mandatory Reason */}
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

/**
 * 9. Member Directory Screen:
 * - Only Faculty can remove members.
 * - President has WRITE, but NO remove-member action and no editing of Faculty accounts.
 */
const MemberDirectoryScreen: React.FC<{
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}> = ({ readOnly, onLogAudit, currentUser }) => {
  const [members, setMembers] = useState([
    { uid: 'u-fac', name: 'Dr. Ramesh Kumar', role: 'faculty', squad: 'Faculty Governance' },
    { uid: 'u-pres', name: 'Siddharth Roy', role: 'coordinator', squad: 'Management' },
    { uid: 'u-lead', name: 'Divya Rao', role: 'management', squad: 'Management Lead' },
    { uid: 'u-mem', name: 'Kunal Sen', role: 'student', squad: 'General Member' },
  ]);

  const canRemove = canRemoveMember(currentUser);

  const handleRemove = (member: any) => {
    if (!canRemove) return;
    setMembers((prev) => prev.filter((m) => m.uid !== member.uid));
    onLogAudit('Member Directory', `Removed member ${member.name} (${member.role})`);
  };

  return (
    <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-[#051F20] text-base">
          Member Roster
        </h2>
        <span className="text-[12px] text-[#235347]">
          {members.length} Registered Scholars
        </span>
      </div>

      <div className="divide-y divide-[#8EB69B]/20">
        {members.map((m) => {
          const canEditThisMember = !readOnly && canEditMember(currentUser, m as any);

          return (
            <div key={m.uid} className="py-3 flex items-center justify-between gap-2">
              <div>
                <div className="font-heading font-bold text-[#051F20] text-sm">
                  {m.name}
                </div>
                <div className="text-[12px] text-[#235347]">
                  Role: <strong>{m.role}</strong> | {m.squad}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canEditThisMember && (
                  <button
                    className="p-1.5 rounded-lg border border-[#8EB69B] text-[#163832] hover:bg-[#DAF1DE]"
                    title="Edit Member"
                  >
                    <Edit2 size={14} />
                  </button>
                )}

                {/* Remove member button: ONLY rendered if canRemoveMember(currentUser) is true (Faculty only) */}
                {canRemove && (
                  <button
                    onClick={() => handleRemove(m)}
                    className="p-1.5 rounded-lg border border-[#D9534F] text-[#D9534F] hover:bg-[#D9534F]/10"
                    title="Remove Member"
                    data-testid={`btn-remove-member-${m.uid}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 10. Lead Activity Review Screen:
 * - Review squad lead milestones.
 * - Sign off / approve if has APPROVE right.
 */
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
