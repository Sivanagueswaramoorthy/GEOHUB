import React from 'react';
import {
  Sparkles,
  ChevronLeft,
  RefreshCw,
  GraduationCap,
  Users,
  Sliders,
  Key,
  Database,
} from 'lucide-react';
import { useSuperAdminState, MODULE_CONFIGS } from './hooks/useSuperAdminState';
import { CommandHubDeck } from './components/CommandHubDeck';
import { FacultyDeck } from './components/FacultyDeck';
import { StudentDeck } from './components/StudentDeck';
import { RoleMatrixDeck } from './components/RoleMatrixDeck';
import { MaintenanceDeck } from './components/MaintenanceDeck';
import { BroadcastAlertModal } from './modals/BroadcastAlertModal';
import { FacultyPinModal } from './modals/FacultyPinModal';
import { BatchAssignSquadModal } from './modals/BatchAssignSquadModal';
import { FacultyFormModal } from './modals/FacultyFormModal';
import { StudentFormModal } from './modals/StudentFormModal';
import { PurgeConfirmModal } from './modals/PurgeConfirmModal';

export interface SuperAdminOperationsViewProps {
  onBack?: () => void;
  isHomeCockpit?: boolean;
}

export const SuperAdminOperationsView: React.FC<SuperAdminOperationsViewProps> = ({
  onBack,
  isHomeCockpit = false,
}) => {
  const state = useSuperAdminState();

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-44 animate-fadeIn select-none">
      {/* Hero Cockpit Banner with Live Telemetry */}
      <div
        className="mb-5 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col gap-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #051F20 0%, #0B2B26 50%, #163832 100%)',
          boxShadow: '0 16px 36px rgba(5, 31, 32, 0.22)',
          border: '1px solid rgba(218, 241, 222, 0.25)',
        }}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -right-16 -top-16 w-48 h-48 rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #8EB69B 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0 border"
              style={{
                width: '52px',
                height: '52px',
                backgroundColor: '#DAF1DE',
                color: '#051F20',
                borderColor: '#8EB69B',
              }}
            >
              SA
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-heading font-extrabold text-white tracking-tight">
                  SuperAdmin Master Command Cockpit
                </h1>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs"
                  style={{ backgroundColor: '#DAF1DE', color: '#051F20' }}
                >
                  Master Authority
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  TiDB Cloud:3306
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-emerald-200 border border-white/10">
                  {state.dbLatencyMs}ms
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto relative z-10">
            <button
              type="button"
              onClick={state.fetchData}
              disabled={state.loading}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                borderColor: 'rgba(218, 241, 222, 0.3)',
                color: '#DAF1DE',
              }}
              title="Refresh telemetry & sync with TiDB Cloud"
            >
              <RefreshCw size={13} className={state.loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            {!isHomeCockpit && onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-1.5 rounded-xl border text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <ChevronLeft size={14} />
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>

        {/* Live System Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/15 text-xs relative z-10">
          <div
            className="p-3 rounded-2xl flex items-center justify-between gap-2.5"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(218, 241, 222, 0.18)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold block" style={{ color: '#8EB69B' }}>
                Database
              </span>
              <span className="font-mono text-base font-black text-white block mt-0.5">TiDB Live</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>

          <div
            className="p-3 rounded-2xl flex items-center justify-between gap-2.5"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(218, 241, 222, 0.18)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold block" style={{ color: '#8EB69B' }}>
                Faculty Advisors
              </span>
              <span className="font-mono text-base font-black text-white block mt-0.5">
                {state.facultyList.length}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#DAF1DE] shrink-0">
              <GraduationCap size={16} />
            </div>
          </div>

          <div
            className="p-3 rounded-2xl flex items-center justify-between gap-2.5"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(218, 241, 222, 0.18)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold block" style={{ color: '#8EB69B' }}>
                Student Scholars
              </span>
              <span className="font-mono text-base font-black text-white block mt-0.5">
                {state.studentList.length}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#DAF1DE] shrink-0">
              <Users size={16} />
            </div>
          </div>

          <div
            className="p-3 rounded-2xl flex items-center justify-between gap-2.5"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(218, 241, 222, 0.18)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold block" style={{ color: '#8EB69B' }}>
                Module Status
              </span>
              <span className="font-mono text-base font-black text-white block mt-0.5">
                {Object.values(state.platformModules || {}).filter(Boolean).length} / {MODULE_CONFIGS.length}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#DAF1DE] shrink-0">
              <Sliders size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* 5-Deck Executive Navigation Bar */}
      <div
        className="sticky top-2 z-30 mb-5 p-1.5 rounded-2xl backdrop-blur-md border shadow-[0_4px_16px_rgba(5,31,32,0.06)] flex items-center gap-1.5 overflow-x-auto no-scrollbar"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#DAF1DE',
        }}
      >
        <button
          type="button"
          onClick={() => state.setActiveDeck('all')}
          className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 shadow-xs"
          style={{
            backgroundColor: state.activeDeck === 'all' ? '#163832' : 'transparent',
            color: state.activeDeck === 'all' ? '#FFFFFF' : '#235347',
          }}
        >
          <Sparkles size={14} />
          <span>All Decks</span>
        </button>

        <button
          type="button"
          onClick={() => state.setActiveDeck('hub')}
          className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 shadow-xs"
          style={{
            backgroundColor: state.activeDeck === 'hub' ? '#163832' : 'transparent',
            color: state.activeDeck === 'hub' ? '#FFFFFF' : '#235347',
          }}
        >
          <Sliders size={14} />
          <span>Command Hub</span>
          <span
            className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold"
            style={{
              backgroundColor: '#DAF1DE',
              color: '#163832',
            }}
          >
            {Object.values(state.platformModules || {}).filter(Boolean).length}/9
          </span>
        </button>

        <button
          type="button"
          onClick={() => state.setActiveDeck('faculty')}
          className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 shadow-xs"
          style={{
            backgroundColor: state.activeDeck === 'faculty' ? '#163832' : 'transparent',
            color: state.activeDeck === 'faculty' ? '#FFFFFF' : '#235347',
          }}
        >
          <GraduationCap size={14} />
          <span>Faculty Oversight</span>
          <span
            className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold"
            style={{
              backgroundColor: '#DAF1DE',
              color: '#163832',
            }}
          >
            {state.facultyList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => state.setActiveDeck('students')}
          className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 shadow-xs"
          style={{
            backgroundColor: state.activeDeck === 'students' ? '#163832' : 'transparent',
            color: state.activeDeck === 'students' ? '#FFFFFF' : '#235347',
          }}
        >
          <Users size={14} />
          <span>Student Governance</span>
          <span
            className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold"
            style={{
              backgroundColor: '#DAF1DE',
              color: '#163832',
            }}
          >
            {state.studentList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => state.setActiveDeck('matrix')}
          className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 shadow-xs"
          style={{
            backgroundColor: state.activeDeck === 'matrix' ? '#163832' : 'transparent',
            color: state.activeDeck === 'matrix' ? '#FFFFFF' : '#235347',
          }}
        >
          <Key size={14} />
          <span>Role & Access Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => state.setActiveDeck('maintenance')}
          className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target-44 whitespace-nowrap shrink-0 shadow-xs"
          style={{
            backgroundColor: state.activeDeck === 'maintenance' ? '#163832' : 'transparent',
            color: state.activeDeck === 'maintenance' ? '#FFFFFF' : '#235347',
          }}
        >
          <Database size={14} />
          <span>Maintenance & DB</span>
        </button>
      </div>

      {/* Deck 1: Command Hub */}
      {(state.activeDeck === 'all' || state.activeDeck === 'hub') && (
        <CommandHubDeck
          platformModules={state.platformModules}
          moduleConfigs={MODULE_CONFIGS}
          toggleModule={state.toggleModule}
          toggleAllModules={state.toggleAllModules}
          onOpenBroadcast={() => state.setIsBroadcastModalOpen(true)}
          onToggleMaintenanceFreeze={state.handleMaintenanceFreezeToggle}
          onNavigateToDeck={(deck) => state.setActiveDeck(deck)}
          onOpenAddFaculty={() => state.setIsAddFacultyModalOpen(true)}
          onOpenAddStudent={() => state.setIsAddStudentModalOpen(true)}
          isHubOnly={state.activeDeck === 'hub'}
        />
      )}

      {/* Deck 2: Faculty Oversight */}
      {(state.activeDeck === 'all' || state.activeDeck === 'faculty') && (
        <FacultyDeck
          facultyList={state.facultyList}
          filteredFaculty={state.filteredFaculty}
          facultyDepartments={state.facultyDepartments}
          selectedFacultyDept={state.selectedFacultyDept}
          setSelectedFacultyDept={state.setSelectedFacultyDept}
          facultySearch={state.facultySearch}
          setFacultySearch={state.setFacultySearch}
          onOpenAddFaculty={() => state.setIsAddFacultyModalOpen(true)}
          onOpenEditFaculty={state.handleOpenEditFaculty}
          onDeleteFaculty={state.handleDeleteFaculty}
          onExportCsv={state.handleExportFacultyCsv}
          onGeneratePin={state.handleGeneratePin}
        />
      )}

      {/* Deck 3: Student Governance */}
      {(state.activeDeck === 'all' || state.activeDeck === 'students') && (
        <StudentDeck
          studentList={state.studentList}
          filteredStudents={state.filteredStudents}
          studentSearch={state.studentSearch}
          setStudentSearch={state.setStudentSearch}
          studentRoleFilter={state.studentRoleFilter}
          setStudentRoleFilter={state.setStudentRoleFilter}
          squadDistribution={state.squadDistribution}
          selectedStudentIds={state.selectedStudentIds}
          onToggleSelectStudent={state.toggleSelectStudent}
          onSelectAllStudents={state.handleSelectAllStudents}
          onOpenAddStudent={() => state.setIsAddStudentModalOpen(true)}
          onOpenEditStudent={state.handleOpenEditStudent}
          onDeleteStudent={state.handleDeleteStudent}
          onOpenBatchSquad={() => state.setIsBatchSquadModalOpen(true)}
          onBatchToggleStatus={state.handleBatchToggleStatus}
          onBatchResetPassword={state.handleBatchResetPassword}
          onBatchDelete={state.handleBatchDelete}
          onClearSelection={() => state.setSelectedStudentIds([])}
          batchSubmitting={state.batchSubmitting}
        />
      )}

      {/* Deck 4: Role & Access Matrix */}
      {(state.activeDeck === 'all' || state.activeDeck === 'matrix') && (
        <RoleMatrixDeck
          roles={state.roles}
          selectedRoleKey={state.selectedRoleKey}
          setSelectedRoleKey={state.setSelectedRoleKey}
          activeRoleMeta={state.activeRoleMeta}
          nameInput={state.nameInput}
          setNameInput={state.setNameInput}
          rollInput={state.rollInput}
          setRollInput={state.setRollInput}
          emailInput={state.emailInput}
          setEmailInput={state.setEmailInput}
          passwordInput={state.passwordInput}
          setPasswordInput={state.setPasswordInput}
          statusInput={state.statusInput}
          setStatusInput={state.setStatusInput}
          copiedPass={state.copiedPass}
          onGeneratePassword={state.handleGeneratePassword}
          onCopyPassword={state.handleCopyPassword}
          onSaveCredentials={state.handleSaveCredentials}
          savingCredentials={state.savingCredentials}
          onActAsRole={state.handleActAsRole}
          operations={state.operations}
          filteredOperations={state.filteredOperations}
          currentRolePermissions={state.currentRolePermissions}
          activeCount={state.activeCount}
          selectedCat={state.selectedCat}
          setSelectedCat={state.setSelectedCat}
          onToggleOperation={state.handleToggleOperation}
          onEnableAll={state.handleEnableAll}
          onDisableAll={state.handleDisableAll}
          onResetToDefault={state.handleResetToDefault}
          onApplySecurityPreset={state.handleApplySecurityPreset}
          togglingOperation={state.togglingOperation}
        />
      )}

      {/* Deck 5: Maintenance & DB */}
      {(state.activeDeck === 'all' || state.activeDeck === 'maintenance') && (
        <MaintenanceDeck
          dbLatencyMs={state.dbLatencyMs}
          diagnosticsData={state.diagnosticsData}
          totalUsersCount={state.studentList.length + state.facultyList.length + 1}
          onPingDatabase={state.handlePingDatabase}
          pingingDb={state.pingingDb}
          onOpenPurgeModal={() => state.setIsConfirmPurgeOpen(true)}
          isPurging={state.isPurging}
        />
      )}

      {/* Modals Suite */}
      <BroadcastAlertModal
        isOpen={state.isBroadcastModalOpen}
        onClose={() => state.setIsBroadcastModalOpen(false)}
        broadcastTitle={state.broadcastTitle}
        setBroadcastTitle={state.setBroadcastTitle}
        broadcastMessage={state.broadcastMessage}
        setBroadcastMessage={state.setBroadcastMessage}
        broadcastPriority={state.broadcastPriority}
        setBroadcastPriority={state.setBroadcastPriority}
        broadcastSubmitting={state.broadcastSubmitting}
        onSend={state.handleSendBroadcast}
      />

      <FacultyPinModal
        faculty={state.pinModalFaculty}
        pin={state.generatedPin}
        copied={state.copiedPin}
        onCopy={() => {
          navigator.clipboard.writeText(state.generatedPin);
          state.setCopiedPin(true);
        }}
        onClose={() => state.setPinModalFaculty(null)}
      />

      <BatchAssignSquadModal
        isOpen={state.isBatchSquadModalOpen}
        onClose={() => state.setIsBatchSquadModalOpen(false)}
        selectedCount={state.selectedStudentIds.length}
        targetSquad={state.batchTargetSquad}
        setTargetSquad={state.setBatchTargetSquad}
        submitting={state.batchSubmitting}
        onConfirm={state.handleExecuteBatchSquad}
      />

      <FacultyFormModal
        isAddOpen={state.isAddFacultyModalOpen}
        onAddClose={() => state.setIsAddFacultyModalOpen(false)}
        facultyForm={state.facultyForm}
        setFacultyForm={state.setFacultyForm}
        facultySubmitting={state.facultySubmitting}
        onCreateFaculty={state.handleCreateFaculty}
        isEditOpen={state.isEditFacultyModalOpen}
        onEditClose={() => state.setIsEditFacultyModalOpen(false)}
        editFacultyForm={state.editFacultyForm}
        setEditFacultyForm={state.setEditFacultyForm}
        editFacultySubmitting={state.editFacultySubmitting}
        onUpdateFaculty={state.handleUpdateFaculty}
      />

      <StudentFormModal
        isAddOpen={state.isAddStudentModalOpen}
        onAddClose={() => state.setIsAddStudentModalOpen(false)}
        studentForm={state.studentForm}
        setStudentForm={state.setStudentForm}
        studentSubmitting={state.studentSubmitting}
        onCreateStudent={state.handleCreateStudent}
        isEditOpen={state.isEditStudentModalOpen}
        onEditClose={() => state.setIsEditStudentModalOpen(false)}
        editStudentForm={state.editStudentForm}
        setEditStudentForm={state.setEditStudentForm}
        editStudentSubmitting={state.editStudentSubmitting}
        onUpdateStudent={state.handleUpdateStudent}
      />

      <PurgeConfirmModal
        isOpen={state.isConfirmPurgeOpen}
        onClose={() => state.setIsConfirmPurgeOpen(false)}
        isPurging={state.isPurging}
        onConfirm={state.handlePurgeAllData}
      />
    </div>
  );
};

export default SuperAdminOperationsView;
