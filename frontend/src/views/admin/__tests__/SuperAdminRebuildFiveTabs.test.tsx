import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeTab } from '../tabs/HomeTab';
import { AccessTab } from '../tabs/AccessTab';
import { FeaturesTab } from '../tabs/FeaturesTab';
import { LogsTab } from '../tabs/LogsTab';
import { ProfileTab } from '../tabs/ProfileTab';
import { UnderMaintenanceScreen } from '../../../components/shared/UnderMaintenanceScreen';
import { AppProvider } from '../../../context/AppContext';
import {
  INITIAL_MODULES,
  CANONICAL_ROLES,
  DEFAULT_ROLE_MODULE_ACCESS,
} from '../hooks/useSuperAdminState';
import { UnifiedMemberItem } from '../types';

describe('SuperAdmin Rebuilt 5 Tabs Unit & Integration Suite', () => {
  describe('Tab 1: HomeTab', () => {
    it('displays Total Students, Total Staff, Total Users, TiDB Cloud database, and backend connectivity', () => {
      const handlePing = vi.fn().mockResolvedValue(undefined);
      const handleNav = vi.fn();

      render(
        <HomeTab
          overviewCounts={{
            students: 42,
            faculty: 8,
            users: 51,
            online: 6,
            modulesLive: 9,
            modulesTotal: 9,
          }}
          diagnostics={{
            host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: '3306 SSL',
            dialect: 'MySQL (TiDB Cloud)',
            latency_ms: 22,
            engine: 'Distributed TiKV / TiDB',
            status: 'Connected',
            health: '100% Operational',
          }}
          latencyMs={22}
          isPinging={false}
          onPingDatabase={handlePing}
          onNavigateTab={handleNav}
        />
      );

      // Core metrics
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Total Staff')).toBeInTheDocument();
      expect(screen.getByText('51')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();

      // Database connectivity
      expect(screen.getByText('Database Connectivity')).toBeInTheDocument();
      expect(screen.getByText('gateway01.ap-southeast-1.prod.aws.tidbcloud.com')).toBeInTheDocument();
      expect(screen.getByText('3306 SSL')).toBeInTheDocument();
      expect(screen.getByText('22 ms')).toBeInTheDocument();

      // Backend connectivity
      expect(screen.getByText('Backend Connectivity')).toBeInTheDocument();
      expect(screen.getByText('/api/v1/health')).toBeInTheDocument();
      expect(screen.getByText('6 Sessions')).toBeInTheDocument();

      // Ping interaction
      const refreshBtn = screen.getByRole('button', { name: /Refresh Status/i });
      fireEvent.click(refreshBtn);
      expect(handlePing).toHaveBeenCalled();
    });

    it('allows toggling TiDB database connectivity on and off', () => {
      const handleToggleDb = vi.fn();

      const { rerender } = render(
        <HomeTab
          overviewCounts={{
            students: 10,
            faculty: 2,
            users: 13,
            online: 2,
            modulesLive: 9,
            modulesTotal: 9,
          }}
          diagnostics={{
            host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: '3306 SSL',
            dialect: 'MySQL (TiDB Cloud)',
            latency_ms: 22,
            engine: 'Distributed TiKV / TiDB',
            status: 'Connected',
            health: '100% Operational',
          }}
          latencyMs={22}
          isPinging={false}
          onPingDatabase={vi.fn()}
          onNavigateTab={vi.fn()}
          isDbConnected={true}
          onToggleDbConnected={handleToggleDb}
        />
      );

      // Verify Connected badge and Toggle switch
      expect(screen.getByText('Connected')).toBeInTheDocument();
      const dbToggle = screen.getByRole('switch', { name: /Toggle TiDB Database Connectivity/i });
      expect(dbToggle).toBeInTheDocument();
      expect(dbToggle).toHaveAttribute('aria-checked', 'true');

      // Click to toggle off
      fireEvent.click(dbToggle);
      expect(handleToggleDb).toHaveBeenCalledWith(false);

      // Re-render in disconnected state
      rerender(
        <HomeTab
          overviewCounts={{
            students: 10,
            faculty: 2,
            users: 13,
            online: 2,
            modulesLive: 9,
            modulesTotal: 9,
          }}
          diagnostics={{
            host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: '3306 SSL',
            dialect: 'MySQL (TiDB Cloud)',
            latency_ms: 0,
            engine: 'Distributed TiKV / TiDB',
            status: 'Disconnected',
            health: 'Disconnected (Offline)',
          }}
          latencyMs={0}
          isPinging={false}
          onPingDatabase={vi.fn()}
          onNavigateTab={vi.fn()}
          isDbConnected={false}
          onToggleDbConnected={handleToggleDb}
        />
      );

      expect(screen.getByText('Disconnected')).toBeInTheDocument();
      expect(screen.getByText(/Offline fallback mode active/i)).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Database Offline/i })[0]).toBeDisabled();
    });

    it('allows toggling backend module on and off for maintenance mode', () => {
      const handleToggleBackend = vi.fn();

      const { rerender } = render(
        <HomeTab
          overviewCounts={{
            students: 10,
            faculty: 2,
            users: 13,
            online: 2,
            modulesLive: 9,
            modulesTotal: 9,
          }}
          diagnostics={{
            host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: '3306 SSL',
            dialect: 'MySQL (TiDB Cloud)',
            latency_ms: 22,
            engine: 'Distributed TiKV / TiDB',
            status: 'Connected',
            health: '100% Operational',
          }}
          latencyMs={22}
          isPinging={false}
          onPingDatabase={vi.fn()}
          onNavigateTab={vi.fn()}
          isBackendActive={true}
          onToggleBackendActive={handleToggleBackend}
        />
      );

      // Verify Operational badge and Toggle switch
      expect(screen.getByText('Operational')).toBeInTheDocument();
      const backendToggle = screen.getByRole('switch', {
        name: /Toggle Backend Module \(Maintenance Mode\)/i,
      });
      expect(backendToggle).toBeInTheDocument();
      expect(backendToggle).toHaveAttribute('aria-checked', 'true');

      // Click to toggle backend off
      fireEvent.click(backendToggle);
      expect(handleToggleBackend).toHaveBeenCalledWith(false);

      // Re-render in maintenance state
      rerender(
        <HomeTab
          overviewCounts={{
            students: 10,
            faculty: 2,
            users: 13,
            online: 0,
            modulesLive: 0,
            modulesTotal: 9,
          }}
          diagnostics={{
            host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: '3306 SSL',
            dialect: 'MySQL (TiDB Cloud)',
            latency_ms: 22,
            engine: 'Distributed TiKV / TiDB',
            status: 'Connected',
            health: '100% Operational',
          }}
          latencyMs={22}
          isPinging={false}
          onPingDatabase={vi.fn()}
          onNavigateTab={vi.fn()}
          isBackendActive={false}
          onToggleBackendActive={handleToggleBackend}
        />
      );

      expect(screen.getByText('Maintenance')).toBeInTheDocument();
      expect(screen.getByText(/App is in Maintenance Mode/i)).toBeInTheDocument();
      expect(screen.getByText('/api/v1/health (Paused)')).toBeInTheDocument();
      expect(screen.getByText('0 Sessions (Offline)')).toBeInTheDocument();
      expect(screen.getByText('0 of 9 Online (Maintenance)')).toBeInTheDocument();
    });

    it('UnderMaintenanceScreen renders system under maintenance and handles SuperAdmin resume', () => {
      const handleResume = vi.fn();
      const handleBypass = vi.fn();
      const handleRefresh = vi.fn();

      render(
        <AppProvider>
          <UnderMaintenanceScreen
            onResumeBackend={handleResume}
            onBypassToCockpit={handleBypass}
            onRefresh={handleRefresh}
            isDbConnected={true}
          />
        </AppProvider>
      );

      expect(screen.getByText('System Under Maintenance')).toBeInTheDocument();
      expect(screen.getByText(/GeoHub backend services are temporarily offline/i)).toBeInTheDocument();
      expect(screen.getByText(/Offline \(Maintenance\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Online \(Standby\)/i)).toBeInTheDocument();

      // Check refresh button
      const refreshBtn = screen.getByRole('button', { name: /Check Connection \/ Refresh/i });
      fireEvent.click(refreshBtn);
      expect(handleRefresh).toHaveBeenCalled();

      // Check SuperAdmin Resume button (since demoSuperAdmin is default in AppProvider)
      const resumeBtn = screen.getByRole('button', { name: /Resume Backend/i });
      expect(resumeBtn).toBeInTheDocument();
      fireEvent.click(resumeBtn);
      expect(handleResume).toHaveBeenCalled();

      // Check SuperAdmin Cockpit Bypass button
      const cockpitBtn = screen.getByRole('button', { name: /Open Cockpit/i });
      expect(cockpitBtn).toBeInTheDocument();
      fireEvent.click(cockpitBtn);
      expect(handleBypass).toHaveBeenCalled();
    });
  });

  describe('Tab 2: AccessTab', () => {
    it('shows all roles and toggles respective module hubs on and off', () => {
      const handleToggle = vi.fn();
      const handleSetAll = vi.fn();

      render(
        <AccessTab
          modules={INITIAL_MODULES}
          roles={CANONICAL_ROLES}
          roleModuleAccess={DEFAULT_ROLE_MODULE_ACCESS}
          onToggleRoleModule={handleToggle}
          onSetAllRoleModules={handleSetAll}
        />
      );

      // Verify roles exist in role bar
      expect(screen.getAllByText('Coordinator').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Treasurer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Documentation').length).toBeGreaterThan(0);
      expect(screen.getByText('Student Member')).toBeInTheDocument();

      // Select Coordinator role
      const coordinatorPills = screen.getAllByRole('button');
      const coordBtn = coordinatorPills.find((btn) => btn.textContent?.includes('Coordinator'));
      if (coordBtn) fireEvent.click(coordBtn);

      // Verify module hubs with toggles
      expect(screen.getByText('Events & Hackathons Hub')).toBeInTheDocument();
      expect(screen.getByText('Smart QR & Attendance Gate')).toBeInTheDocument();
      expect(screen.getByText('Treasury & Financial Ledger')).toBeInTheDocument();

      // Click switch
      const toggleBtn = screen.getByRole('switch', {
        name: /Toggle access to Events & Hackathons Hub/i,
      });
      fireEvent.click(toggleBtn);
      expect(handleToggle).toHaveBeenCalledWith('coordinator', 'events');

      // Click Grant All & Decline All
      const grantAll = screen.getByRole('button', { name: /Grant All/i });
      fireEvent.click(grantAll);
      expect(handleSetAll).toHaveBeenCalledWith('coordinator', true);

      const declineAll = screen.getByRole('button', { name: /Decline All/i });
      fireEvent.click(declineAll);
      expect(handleSetAll).toHaveBeenCalledWith('coordinator', false);
    });
  });

  describe('Tab 3: FeaturesTab', () => {
    it('provides ASK Student or Faculty prompt and validates Student form (rollno, name, year)', () => {
      const handleAddStudent = vi.fn();
      const handleAddFaculty = vi.fn();
      const handleNav = vi.fn();

      render(
        <FeaturesTab
          onAddStudent={handleAddStudent}
          onAddFaculty={handleAddFaculty}
          onNavigateTab={handleNav}
        />
      );

      // Header
      expect(screen.getByText('Add Student or Faculty')).toBeInTheDocument();

      // Student form fields
      expect(screen.getByText('Student Enrollment Form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. 24GEO055')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. Kavya Sharma')).toBeInTheDocument();

      // Fill and submit student
      fireEvent.change(screen.getByPlaceholderText('e.g. 24GEO055'), {
        target: { value: '24GEO099' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g. Kavya Sharma'), {
        target: { value: 'Rohan Verma' },
      });

      const submitStudentBtn = screen.getByRole('button', { name: /Add Student/i });
      fireEvent.click(submitStudentBtn);

      expect(handleAddStudent).toHaveBeenCalledWith(
        expect.objectContaining({
          rollno: '24GEO099',
          name: 'Rohan Verma',
          year: '1st Year',
        })
      );
    });

    it('switches to Faculty form and validates FACULTY (ROLLNO, NAME, DEPARTMENT)', () => {
      const handleAddStudent = vi.fn();
      const handleAddFaculty = vi.fn();
      const handleNav = vi.fn();

      render(
        <FeaturesTab
          onAddStudent={handleAddStudent}
          onAddFaculty={handleAddFaculty}
          onNavigateTab={handleNav}
        />
      );

      // Switch to Faculty
      const facultySegment = screen.getByRole('button', { name: /Faculty/i });
      fireEvent.click(facultySegment);

      // Verify Faculty specific fields
      expect(screen.getByText('Faculty Provisioning Form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. FAC05')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. Dr. Rajesh Kumar')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. Geoinformatics Engineering')).toBeInTheDocument();

      // Fill and submit faculty
      fireEvent.change(screen.getByPlaceholderText('e.g. FAC05'), {
        target: { value: 'FAC08' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g. Dr. Rajesh Kumar'), {
        target: { value: 'Dr. Anita Rao' },
      });

      const submitFacultyBtn = screen.getByRole('button', { name: /Add Faculty/i });
      fireEvent.click(submitFacultyBtn);

      expect(handleAddFaculty).toHaveBeenCalledWith(
        expect.objectContaining({
          rollno: 'FAC08',
          name: 'Dr. Anita Rao',
          department: 'Geoinformatics Engineering',
        })
      );
    });
  });

  describe('Tab 4: LogsTab', () => {
    const mockMembers: UnifiedMemberItem[] = [
      {
        id: 'std-1',
        kind: 'student',
        roll_no: '21GEO001',
        name: 'Alex Rivera',
        email: 'alex.rivera@college.edu',
        department: 'Geoinformatics',
        year_of_study: '4th Year',
        role: 'Coordinator',
        status: 'active',
        allowedModules: ['events', 'finance'],
      },
      {
        id: 'fac-1',
        kind: 'faculty',
        roll_no: 'FAC01',
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.jenkins@college.edu',
        department: 'Geoinformatics Engineering',
        designation: 'Senior Faculty Advisor',
        role: 'Faculty Advisor',
        status: 'active',
        allowedModules: ['events', 'finance', 'documents'],
      },
    ];

    it('renders students and faculty, excludes SuperAdmin, filters data, and opens full dossier on click', () => {
      const handleSuspend = vi.fn();
      const handleDelete = vi.fn();
      const handleUpdateModules = vi.fn();

      render(
        <LogsTab
          members={mockMembers}
          modules={INITIAL_MODULES}
          onToggleSuspend={handleSuspend}
          onDeleteMember={handleDelete}
          onUpdateMemberModules={handleUpdateModules}
        />
      );

      // Verify SuperAdmin is NOT present in the member list
      expect(screen.queryByText('SA01')).not.toBeInTheDocument();
      expect(screen.queryByText('System SuperAdmin')).not.toBeInTheDocument();

      // Verify students and faculty are present
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument();

      // Filter dropdown triggers exist on the right side
      expect(screen.getByRole('button', { name: /Filter by Department/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Filter by Role/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Filter by Year/i })).toBeInTheDocument();

      // Click Alex Rivera card to open full dossier modal
      fireEvent.click(screen.getByText('Alex Rivera'));

      // Full dossier modal opened
      expect(screen.getByText('alex.rivera@college.edu')).toBeInTheDocument();
      expect(screen.getByText('Full Legal Name')).toBeInTheDocument();
      expect(screen.getByText('Roll Number / UID')).toBeInTheDocument();

      // 3 Action Buttons exist: Suspend, Give Access, Delete
      const suspendBtn = screen.getByRole('button', { name: /Suspend Member/i });
      expect(suspendBtn).toBeInTheDocument();
      fireEvent.click(suspendBtn);
      expect(handleSuspend).toHaveBeenCalledWith('std-1', 'student');

      // Give Access
      const giveAccessBtns = screen.getAllByRole('button', { name: /Give.*Access/i });
      expect(giveAccessBtns.length).toBeGreaterThan(0);
      fireEvent.click(giveAccessBtns[0]);

      // Delete action & confirmation
      const deleteBtn = screen.getByRole('button', { name: /Delete Member/i });
      expect(deleteBtn).toBeInTheDocument();
      fireEvent.click(deleteBtn);

      // Confirm deletion warning dialog appears
      expect(screen.getByText('Confirm Permanent Deletion')).toBeInTheDocument();
      const confirmDelete = screen.getByRole('button', { name: /Yes, Delete Record/i });
      fireEvent.click(confirmDelete);
      expect(handleDelete).toHaveBeenCalledWith('std-1', 'student');
    });

    it('allows assigning post and squad to student and triggers onAssignPost callback', async () => {
      const handleAssignPost = vi.fn().mockResolvedValue({});

      render(
        <LogsTab
          members={mockMembers}
          modules={INITIAL_MODULES}
          onToggleSuspend={vi.fn()}
          onDeleteMember={vi.fn()}
          onUpdateMemberModules={vi.fn()}
          onAssignPost={handleAssignPost}
        />
      );

      // Open student dossier
      const studentCard = screen.getByText('Alex Rivera');
      fireEvent.click(studentCard);

      // Click Assign Post button to open the form
      const assignBtn = screen.getByRole('button', { name: /Assign Post/i });
      fireEvent.click(assignBtn);

      // Select Vice President and save
      const selectPost = screen.getByDisplayValue('Student Member (Primary)');
      fireEvent.change(selectPost, { target: { value: 'Vice President' } });

      const savePostBtn = screen.getByRole('button', { name: /Confirm & Assign Post/i });
      fireEvent.click(savePostBtn);

      expect(handleAssignPost).toHaveBeenCalledWith(
        'std-1',
        'Vice President',
        'Coordinator',
        'General',
        'Geoinformatics',
        '4th Year'
      );
    });
  });

  describe('Tab 5: ProfileTab', () => {
    it('displays SuperAdmin name, rollno (SA01), clearance level, and Change Password form', () => {
      const handleToast = vi.fn();

      render(
        <ProfileTab
          diagnostics={{
            host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: '3306 SSL',
            dialect: 'MySQL (TiDB Cloud)',
            latency_ms: 22,
            engine: 'Distributed TiKV / TiDB',
            status: 'Connected',
            health: '100% Operational',
          }}
          showToast={handleToast}
        />
      );

      // SuperAdmin name and rollno
      expect(screen.getByText('System SuperAdmin')).toBeInTheDocument();
      expect(screen.getByText('Roll No: SA01')).toBeInTheDocument();
      expect(screen.getByText('superadmin@college.edu')).toBeInTheDocument();

      // Protection notice
      expect(screen.getByText('Root Authority Protection Enabled')).toBeInTheDocument();

      // Change Password form
      expect(screen.getByText('Change Account Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Minimum 8 characters with letters & numbers')
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Re-enter new password')).toBeInTheDocument();

      // Submit password change
      fireEvent.change(screen.getByPlaceholderText('Enter current password'), {
        target: { value: 'CurrentPass123' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('Minimum 8 characters with letters & numbers'),
        {
          target: { value: 'NewSecretPass99' },
        }
      );
      fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), {
        target: { value: 'NewSecretPass99' },
      });

      const updateBtn = screen.getByRole('button', { name: /Update Password/i });
      fireEvent.click(updateBtn);

      expect(handleToast).toHaveBeenCalledWith(
        'SuperAdmin password updated successfully.'
      );
    });
  });
});
