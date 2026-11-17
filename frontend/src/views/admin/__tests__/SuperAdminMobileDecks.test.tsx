import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../../context/AppContext';
import { CommandHubDeck } from '../components/CommandHubDeck';
import { FacultyDeck } from '../components/FacultyDeck';
import { StudentDeck } from '../components/StudentDeck';
import { RoleMatrixDeck } from '../components/RoleMatrixDeck';
import { MaintenanceDeck } from '../components/MaintenanceDeck';
import { INITIAL_MODULES, INITIAL_FACULTY, INITIAL_STUDENTS, CANONICAL_ROLES } from '../hooks/useSuperAdminState';

describe('SuperAdmin Mobile Decks Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CommandHubDeck', () => {
    it('renders 100% Operational status badge, Freeze, and Broadcast buttons', () => {
      const handleToggleFreeze = vi.fn();
      render(
        <AppProvider>
          <CommandHubDeck
            modules={INITIAL_MODULES}
            onToggleModule={vi.fn()}
            onToggleAllModules={vi.fn()}
            isFreezeMode={false}
            onToggleFreeze={handleToggleFreeze}
            onlineUsers={[]}
            onDispatchBroadcast={vi.fn()}
          />
        </AppProvider>
      );

      expect(screen.getByText(/100% Operational/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Freeze/i })).toBeInTheDocument();
      expect(screen.getByTitle('Dispatch Campus Broadcast')).toBeInTheDocument();
    });

    it('opens broadcast modal on click and dispatches alert', () => {
      const handleDispatchBroadcast = vi.fn();
      render(
        <AppProvider>
          <CommandHubDeck
            modules={INITIAL_MODULES}
            onToggleModule={vi.fn()}
            onToggleAllModules={vi.fn()}
            isFreezeMode={false}
            onToggleFreeze={vi.fn()}
            onlineUsers={[]}
            onDispatchBroadcast={handleDispatchBroadcast}
          />
        </AppProvider>
      );

      // Open broadcast modal
      fireEvent.click(screen.getByTitle('Dispatch Campus Broadcast'));

      // Verify modal is open
      expect(screen.getByText('Dispatch Campus Broadcast')).toBeInTheDocument();

      // Enter title and message
      const titleInput = screen.getByPlaceholderText(/e\.g\. Campus Wi-Fi Scheduled Maintenance/i);
      const messageInput = screen.getByPlaceholderText(/Write clear, concise announcement details/i);
      fireEvent.change(titleInput, { target: { value: 'System Upgrade Tonight' } });
      fireEvent.change(messageInput, { target: { value: 'Maintenance begins at 11 PM.' } });

      // Click Send Broadcast button
      const sendBtn = screen.getByRole('button', { name: /Dispatch Alert to All Devices/i });
      fireEvent.click(sendBtn);

      expect(handleDispatchBroadcast).toHaveBeenCalledWith({
        title: 'System Upgrade Tonight',
        message: 'Maintenance begins at 11 PM.',
        urgency: 'normal',
      });
    });

    it('renders 9 module rows and allows toggling', () => {
      const handleToggle = vi.fn();
      render(
        <AppProvider>
          <CommandHubDeck
            modules={INITIAL_MODULES}
            onToggleModule={handleToggle}
            onToggleAllModules={vi.fn()}
            isFreezeMode={false}
            onToggleFreeze={vi.fn()}
            onlineUsers={[]}
            onDispatchBroadcast={vi.fn()}
          />
        </AppProvider>
      );

      // Check module count
      const perRoleLinks = screen.getAllByText(/Per role ›/i);
      expect(perRoleLinks).toHaveLength(9);

      // Toggle first module
      const switchBtn = screen.getByRole('switch', { name: /Toggle Events & Hackathons Hub/i });
      fireEvent.click(switchBtn);
      expect(handleToggle).toHaveBeenCalledWith('events');
    });
  });

  describe('FacultyDeck', () => {
    it('renders search input and filters faculty list by query', () => {
      render(
        <FacultyDeck
          facultyList={INITIAL_FACULTY}
          onSaveFaculty={vi.fn()}
          onDeleteFaculty={vi.fn()}
          onToggleStatus={vi.fn()}
          onResetPassword={vi.fn()}
          onForceLogout={vi.fn()}
        />
      );

      expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument();
      expect(screen.getByText('Prof. Ramanathan K')).toBeInTheDocument();

      // Search for Ramanathan
      const searchInput = screen.getByPlaceholderText(/Search faculty name or dept/i);
      fireEvent.change(searchInput, { target: { value: 'Ramanathan' } });

      expect(screen.getByText('Prof. Ramanathan K')).toBeInTheDocument();
      expect(screen.queryByText('Dr. Sarah Jenkins')).not.toBeInTheDocument();
    });

    it('opens faculty detail sheet when tapping an advisor row', () => {
      render(
        <FacultyDeck
          facultyList={INITIAL_FACULTY}
          onSaveFaculty={vi.fn()}
          onDeleteFaculty={vi.fn()}
          onToggleStatus={vi.fn()}
          onResetPassword={vi.fn()}
          onForceLogout={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('Dr. Sarah Jenkins'));

      // Dossier opens
      expect(screen.getByText('Faculty Advisor Dossier')).toBeInTheDocument();
      expect(screen.getByText('sarah.jenkins@college.edu')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate PIN/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Logout Devices/i })).toBeInTheDocument();
    });
  });

  describe('StudentDeck', () => {
    it('renders students and enters selection mode on checkbox click showing sticky batch bar', () => {
      const handleToggleSelect = vi.fn();
      render(
        <StudentDeck
          students={INITIAL_STUDENTS}
          selectedIds={['std-1', 'std-2']}
          onToggleSelect={handleToggleSelect}
          onSelectAll={vi.fn()}
          onClearSelection={vi.fn()}
          onSaveStudent={vi.fn()}
          onDeleteStudent={vi.fn()}
          onToggleStatus={vi.fn()}
          onResetPassword={vi.fn()}
          onForceLogout={vi.fn()}
          onBatchAssignSquad={vi.fn()}
          onBatchSetRole={vi.fn()}
          onBatchToggleStatus={vi.fn()}
          onBatchResetPassword={vi.fn()}
          onBatchForceLogout={vi.fn()}
          onBatchDelete={vi.fn()}
        />
      );

      // Selected header counter
      expect(screen.getAllByText(/2 selected/i)[0]).toBeInTheDocument();

      // Floating batch action bar buttons
      expect(screen.getByRole('button', { name: /Assign Squad/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Pass/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Force Logout/i })).toBeInTheDocument();
    });

    it('opens student detail sheet when clicking a student row outside checkbox', () => {
      render(
        <StudentDeck
          students={INITIAL_STUDENTS}
          selectedIds={[]}
          onToggleSelect={vi.fn()}
          onSelectAll={vi.fn()}
          onClearSelection={vi.fn()}
          onSaveStudent={vi.fn()}
          onDeleteStudent={vi.fn()}
          onToggleStatus={vi.fn()}
          onResetPassword={vi.fn()}
          onForceLogout={vi.fn()}
          onBatchAssignSquad={vi.fn()}
          onBatchSetRole={vi.fn()}
          onBatchToggleStatus={vi.fn()}
          onBatchResetPassword={vi.fn()}
          onBatchForceLogout={vi.fn()}
          onBatchDelete={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('Alex Rivera'));

      // Student dossier sheet
      expect(screen.getByText('Scholar Identity Dossier')).toBeInTheDocument();
      expect(screen.getAllByText(/21GEO001/)[0]).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Logout Devices/i })).toBeInTheDocument();
    });
  });

  describe('RoleMatrixDeck', () => {
    it('renders role pills, security presets, and role credentials', () => {
      render(
        <AppProvider>
          <RoleMatrixDeck
            modules={INITIAL_MODULES}
            rolesCredentials={CANONICAL_ROLES}
            showToast={vi.fn()}
          />
        </AppProvider>
      );

      // Security Presets
      expect(screen.getByText('Baseline')).toBeInTheDocument();
      expect(screen.getByText('Event Sprint')).toBeInTheDocument();
      expect(screen.getByText('Exam Hiatus')).toBeInTheDocument();

      // Role Credentials card
      expect(screen.getByText('Role Credentials')).toBeInTheDocument();
    });
  });

  describe('MaintenanceDeck', () => {
    it('renders TiDB Cloud engine card, ping probe button, and table inspector', () => {
      const handlePing = vi.fn();
      render(
        <MaintenanceDeck
          diagnostics={{
            host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: 3306,
            dialect: 'MySQL (PyMySQL)',
            latency_ms: 24,
            engine: 'TiDB Cloud Serverless',
            status: 'connected',
            health: 'optimal',
          }}
          latencyMs={24}
          isPinging={false}
          onPingDatabase={handlePing}
          overviewCounts={{
            modulesLive: 9,
            modulesTotal: 9,
            faculty: 4,
            students: 7,
            users: 11,
            online: 1,
          }}
          onConfirmPurge={vi.fn()}
        />
      );

      // TiDB Host
      expect(screen.getByText(/gateway01.ap-southeast-1.prod.aws.tidbcloud.com/i)).toBeInTheDocument();

      // Ping Probe Button
      const pingBtn = screen.getByRole('button', { name: /Ping/i });
      expect(pingBtn).toBeInTheDocument();
      fireEvent.click(pingBtn);
      expect(handlePing).toHaveBeenCalled();

      // Table Inspector
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    it('provides database connectivity toggle in MaintenanceDeck', () => {
      const handleToggleDb = vi.fn();
      render(
        <MaintenanceDeck
          diagnostics={{
            host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: 3306,
            dialect: 'MySQL (PyMySQL)',
            latency_ms: 24,
            engine: 'TiDB Cloud Serverless',
            status: 'connected',
            health: 'optimal',
          }}
          latencyMs={24}
          isPinging={false}
          onPingDatabase={vi.fn()}
          overviewCounts={{
            modulesLive: 9,
            modulesTotal: 9,
            faculty: 4,
            students: 7,
            users: 11,
            online: 1,
          }}
          onConfirmPurge={vi.fn()}
          isDbConnected={true}
          onToggleDbConnected={handleToggleDb}
        />
      );

      const dbToggle = screen.getByRole('switch', { name: /Toggle TiDB Database Connectivity/i });
      expect(dbToggle).toBeInTheDocument();
      fireEvent.click(dbToggle);
      expect(handleToggleDb).toHaveBeenCalledWith(false);
    });
  });
});
