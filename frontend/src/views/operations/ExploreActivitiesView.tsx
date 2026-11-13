import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ALL_MODULE_IDS,
  MODULE_CONFIGS,
  ModuleId,
  ModuleSectionId,
  moduleAccess,
  can,
  isEventEnded,
  normalizeHubRole,
  MOCK_POSTS_WITH_STATUSES,
  MOCK_SQUAD_GRANTS,
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
  ModuleSection,
  ModuleGuard,
} from '../../components/shared';
import { ICON_MAP } from '../../components/shared/HubCard';
import {
  ChevronLeft,
  ArrowLeft,
  Shield,
  AlertCircle,
  LayoutGrid,
  List,
  Sparkles,
  Users,
  Calendar,
  Coins,
  FileText,
  ClipboardCheck,
} from 'lucide-react';

// Import our 18 rebuilt screen components
import {
  TreasuryScreen,
  AddExpenseScreen,
  ExpenditureLedgerScreen,
  FinancialAuditExportScreen,
  ReleaseCalendarScreen,
  EventMediaUploadScreen,
  BulletinsDailyReportScreen,
  MeetingsMomScreen,
  ApprovalsScreen,
  AttendanceDeskScreen,
  AttendanceOperationScreen,
  EventPermissionsScreen,
  MemberDirectoryScreen,
  SquadsScreen,
  SquadLeadsScreen,
  DutiesStationsScreen,
  DutiesAssignmentScreen,
  LeadActivityReviewScreen,
  BudgetRequest,
  ExpenseItem,
} from './screens';

interface AuditLogEntry {
  id: string;
  actor: string;
  module: ModuleId;
  event: string;
  action: string;
  time: string;
}

const SECTION_ORDER: ModuleSectionId[] = [
  'People',
  'Events',
  'Finance',
  'Media and Docs',
  'Review',
];

const SECTION_ICONS: Record<string, React.FC<{ size?: number; className?: string; strokeWidth?: number }>> = {
  All: Sparkles,
  People: Users,
  Events: Calendar,
  Finance: Coins,
  'Media and Docs': FileText,
  Review: ClipboardCheck,
};

export const ExploreActivitiesView: React.FC = () => {
  const { currentUser, events } = useApp();
  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(() => {
    if (typeof window === 'undefined') return null;
    const match = window.location.hash.match(/[?&]module=([a-z_]+)/);
    if (match && ALL_MODULE_IDS.includes(match[1] as ModuleId)) {
      return match[1] as ModuleId;
    }
    return null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [subViewBackHandler, setSubViewBackHandler] = useState<(() => void) | null>(null);
  const [subViewTitle, setSubViewTitle] = useState<string | null>(null);

  useEffect(() => {
    setSubViewBackHandler(null);
    setSubViewTitle(null);
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } catch {
        window.scrollTo(0, 0);
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [selectedModule]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } catch {
        window.scrollTo(0, 0);
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [subViewTitle]);

  useEffect(() => {
    const onHashChange = () => {
      const match = window.location.hash.match(/[?&]module=([a-z_]+)/);
      if (match && ALL_MODULE_IDS.includes(match[1] as ModuleId)) {
        setSelectedModule(match[1] as ModuleId);
      } else if (!window.location.hash.includes('module=')) {
        setSelectedModule(null);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Clean operational state initialized to empty zero-states
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [grants, setGrants] = useState<SquadGrant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

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

  // Search and Category filter
  const filteredModuleIds = visibleModuleIds.filter((id) => {
    const config = MODULE_CONFIGS[id];
    if (selectedCategory !== 'All' && config.section !== selectedCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;
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
    return 0;
  };

  const totalPending = visibleModuleIds.reduce((acc, id) => acc + getPendingCount(id), 0);

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
              onClick={() => {
                setSelectedModule(null);
                window.location.hash = '#operations';
              }}
              data-testid="btn-back-hub"
              className="w-10 h-10 bg-transparent border-0 active:scale-95 text-[#051F20] flex items-center justify-center transition-all touch-target-44 cursor-pointer p-0 mb-6"
              aria-label="Back to Operations Hub"
            >
              <ChevronLeft size={26} strokeWidth={2.5} />
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
        <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-3 sm:pt-4 pb-36 sm:pb-40 animate-fadeIn select-none w-full">
          {/* Sleek Minimalist Module Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => {
                  if (subViewBackHandler) {
                    subViewBackHandler();
                  } else {
                    setSelectedModule(null);
                    window.location.hash = '#operations';
                  }
                  if (typeof window !== 'undefined') {
                    window.scrollTo(0, 0);
                  }
                }}
                data-testid="btn-back-hub"
                className="w-10 h-10 bg-transparent border-0 active:scale-95 text-[#051F20] flex items-center justify-center transition-all touch-target-44 cursor-pointer p-0 shrink-0"
                aria-label="Back"
              >
                <ChevronLeft size={26} strokeWidth={2.5} />
              </button>

              <h1
                className="font-heading font-extrabold text-[#051F20] text-lg sm:text-xl truncate leading-tight"
                style={{ fontSize: '20px', lineHeight: '24px' }}
              >
                {subViewTitle || config?.name}
              </h1>
            </div>
          </div>

          {/* Specific Rebuilt Interactive Module Implementations */}
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

          {(selectedModule === 'campaign_post' || selectedModule === 'release_calendar') && (
            <ReleaseCalendarScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('release_calendar', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'event_media_upload' && (
            <EventMediaUploadScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('event_media_upload', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'bulletins_daily_report' && (
            <BulletinsDailyReportScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('bulletins_daily_report', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'meetings_mom' && (
            <MeetingsMomScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('meetings_mom', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'approvals' && (
            <ApprovalsScreen
              readOnly={readOnly}
              canApprove={canApprove}
              onLogAudit={(event, action) => logAudit('approvals', event, action)}
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
              onSubViewChange={(title, onBack) => {
                setSubViewTitle(title);
                setSubViewBackHandler(() => onBack);
              }}
            />
          )}

          {selectedModule === 'squad_leads' && (
            <SquadLeadsScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('squad_leads', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'duties_stations' && (
            <DutiesStationsScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('duties_stations', event, action)}
              currentUser={currentUser}
            />
          )}

          {selectedModule === 'duties_assignment' && (
            <DutiesAssignmentScreen
              readOnly={readOnly}
              onLogAudit={(event, action) => logAudit('duties_assignment', event, action)}
              currentUser={currentUser}
            />
          )}
        </div>
      </ModuleGuard>
    );
  }

  // Operations Hub Home View
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 pb-28">
      {/* Top Header Row with Active Role & Status Indicator */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <PageHeader
          title="Operations"
          showRoleChip={false}
          className="mb-0"
        />
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#163832] text-white shadow-xs"
            data-testid="active-role-chip"
          >
            <Shield size={12} strokeWidth={2.4} className="text-[#8EB69B]" />
            {roleDisplayLabel}
          </span>
        </div>
      </div>

      {/* Category Filter Pills (Rebuilt Modern UI) */}
      <div
        className="mb-2 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1"
        role="tablist"
        aria-label="Module categories"
      >
        {/* 'All' Category Pill */}
        {(() => {
          const isSelected = selectedCategory === 'All';
          const IconComp = SECTION_ICONS.All;
          return (
            <button
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedCategory('All')}
              className={`h-9 px-3.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 touch-target-44 select-none active:scale-95 ${
                isSelected
                  ? 'bg-[#163832] text-white shadow-sm border border-[#163832]'
                  : 'bg-white text-[#163832] border border-[#DAF1DE] hover:border-[#8EB69B] hover:bg-[#F6FBF7] shadow-[0_2px_6px_rgba(5,31,32,0.04)]'
              }`}
            >
              <IconComp
                size={13}
                strokeWidth={2.4}
                className={isSelected ? 'text-[#8EB69B]' : 'text-[#235347]'}
              />
              <span className="font-bold leading-none">All</span>
              <span
                style={{
                  minWidth: '20px',
                  height: '20px',
                  lineHeight: '20px',
                  boxSizing: 'border-box',
                }}
                className={`px-1.5 rounded-full text-xs font-bold inline-flex items-center justify-center shrink-0 text-center ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-[#DAF1DE] text-[#051F20]'
                }`}
              >
                {visibleModuleIds.length}
              </span>
            </button>
          );
        })()}

        {/* Dynamic Category Pills */}
        {SECTION_ORDER.map((section) => {
          const count = visibleModuleIds.filter(
            (id) => MODULE_CONFIGS[id].section === section
          ).length;
          if (count === 0) return null;
          const isSelected = selectedCategory === section;
          const IconComp = SECTION_ICONS[section] || Sparkles;

          return (
            <button
              key={section}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedCategory(section)}
              className={`h-9 px-3.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 touch-target-44 select-none active:scale-95 ${
                isSelected
                  ? 'bg-[#163832] text-white shadow-sm border border-[#163832]'
                  : 'bg-white text-[#163832] border border-[#DAF1DE] hover:border-[#8EB69B] hover:bg-[#F6FBF7] shadow-[0_2px_6px_rgba(5,31,32,0.04)]'
              }`}
            >
              <IconComp
                size={13}
                strokeWidth={2.4}
                className={isSelected ? 'text-[#8EB69B]' : 'text-[#235347]'}
              />
              <span className="font-bold leading-none">{section}</span>
              <span
                style={{
                  minWidth: '20px',
                  height: '20px',
                  lineHeight: '20px',
                  boxSizing: 'border-box',
                }}
                className={`px-1.5 rounded-full text-xs font-bold inline-flex items-center justify-center shrink-0 text-center ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-[#DAF1DE] text-[#051F20]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Layout View Switcher */}
      <div className="mb-5 flex items-center gap-2 -mt-0.5">
        <div className="flex-1 min-w-0">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search operational modules..."
          />
        </div>

        <div className="flex items-center p-1 bg-white border border-[#DAF1DE] rounded-2xl shadow-2xs shrink-0">
          <button
            type="button"
            onClick={() => setViewLayout('grid')}
            aria-label="Grid View"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              viewLayout === 'grid'
                ? 'bg-[#163832] text-white shadow-xs'
                : 'text-[#235347] hover:bg-[#F6FBF7]'
            }`}
          >
            <LayoutGrid size={16} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => setViewLayout('list')}
            aria-label="List View"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              viewLayout === 'list'
                ? 'bg-[#163832] text-white shadow-xs'
                : 'text-[#235347] hover:bg-[#F6FBF7]'
            }`}
          >
            <List size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 mb-6">
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
        <div className="space-y-6 mt-3.5">
          {SECTION_ORDER.map((sectionName) => {
            if (selectedCategory !== 'All' && selectedCategory !== sectionName) {
              return null;
            }

            const sectionModules = filteredModuleIds.filter(
              (id) => MODULE_CONFIGS[id].section === sectionName
            );

            if (sectionModules.length === 0) return null;

            return (
              <ModuleSection
                key={sectionName}
                title={sectionName}
                count={sectionModules.length}
                layout={viewLayout}
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
                      hideDescription={viewLayout === 'grid'}
                      hideAccessChip={true}
                      variant={viewLayout === 'grid' ? 'bento' : 'row'}
                      category={cfg.section}
                      onClick={() => {
                        setSelectedModule(id);
                        window.location.hash = `#operations?module=${id}`;
                        if (typeof window !== 'undefined') {
                          window.scrollTo(0, 0);
                        }
                      }}
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

export default ExploreActivitiesView;
