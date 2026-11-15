import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SuperAdminOperationsView } from '../SuperAdminOperationsView';
import { AppProvider } from '../../../context/AppContext';
import { canAccessRoute } from '../../../core/permissions';

describe('SuperAdminOperationsView & Governance Security Tests', () => {
  it('enforces route guard denying student and faculty access and permitting super_admin', () => {
    const studentCheck = canAccessRoute('role_governance', 'student');
    expect(studentCheck.allowed).toBe(false);
    expect(studentCheck.message).toContain('SuperAdmin clearance required');

    const facultyCheck = canAccessRoute('role_governance', 'faculty');
    expect(facultyCheck.allowed).toBe(false);

    const superAdminCheck = canAccessRoute('role_governance', 'super_admin');
    expect(superAdminCheck.allowed).toBe(true);
  });

  it('renders SuperAdmin header, role pills, and credentials card', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Title and badge
    expect(screen.getByText('SuperAdmin Master Command Cockpit')).toBeInTheDocument();
    expect(screen.getByText('Master Authority')).toBeInTheDocument();

    // Canonical role pills rendered
    expect(screen.getAllByText('Coordinator').length).toBeGreaterThan(0);
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('Management Lead')).toBeInTheDocument();
    expect(screen.getByText('Treasurer')).toBeInTheDocument();

    // Credentials Card
    expect(screen.getByText('Role Credentials')).toBeInTheDocument();
    expect(screen.getByText('Username / Roll Number')).toBeInTheDocument();
    expect(screen.getByText('Save Role Credentials')).toBeInTheDocument();

    // Master Authority Buttons
    expect(screen.getAllByText('Enable All').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Disable All').length).toBeGreaterThan(0);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('switches between roles when clicking role selector pills', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    const treasurerButtons = screen.getAllByRole('button', { name: /Treasurer/i });
    const roleBarTreasurer = treasurerButtons[treasurerButtons.length - 1];
    fireEvent.click(roleBarTreasurer);

    // Username input should update to treasurer default
    const rollInput = screen.getByPlaceholderText('e.g. 21GEO001 or FAC01') as HTMLInputElement;
    expect(rollInput.value).toBe('22GEO019');
  });

  it('filters operations checklist by category pill', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Click on Finance (5) tab
    const financeTab = screen.getByRole('button', { name: /Finance \(5\)/i });
    fireEvent.click(financeTab);

    // Verify financial operations are visible
    expect(screen.getByText('Approve Budget Requests')).toBeInTheDocument();
    expect(screen.getByText('View Treasury & Ledger')).toBeInTheDocument();

    // Events operation should be hidden
    expect(screen.queryByText('Create & Edit Events')).not.toBeInTheDocument();
  });

  it('renders Student & Member Governance section and allows opening Add Student modal', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Switch to Student Scholars segment in People directory
    const studentSegmentBtn = screen.getByRole('button', { name: /Student Scholars/i });
    fireEvent.click(studentSegmentBtn);

    expect(screen.getByText('Student & Member Governance')).toBeInTheDocument();
    const addStudentBtns = screen.getAllByRole('button', { name: /Add Student \/ Member/i });
    expect(addStudentBtns.length).toBeGreaterThan(0);

    fireEvent.click(addStudentBtns[0]);
    expect(screen.getByText('Onboard Student or Officer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Priya Sharma')).toBeInTheDocument();
  });

  it('renders Act as Role (Live Preview) button for SuperAdmin master control', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    const actAsBtn = screen.getByRole('button', { name: /Act as .* \(Live Preview\)/i });
    expect(actAsBtn).toBeInTheDocument();
    fireEvent.click(actAsBtn);
  });

  it('renders Platform Module Switchboard with interactive toggle buttons', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Switch to Control / Switchboard deck to isolate switchboard
    fireEvent.click(screen.getByRole('button', { name: /Switchboard/i }));

    // Module Switchboard section and telemetry
    expect(screen.getByText('Platform Module Switchboard')).toBeInTheDocument();
    expect(screen.getByText(/Toggle respective club modules online or pause them/i)).toBeInTheDocument();

    // Specific module titles
    expect(screen.getByText('Events & Hackathons Hub')).toBeInTheDocument();
    expect(screen.getByText('Smart QR & Attendance Gate')).toBeInTheDocument();
    expect(screen.getByText('Treasury & Financial Ledger')).toBeInTheDocument();
    expect(screen.getByText('Archives & Media Gallery')).toBeInTheDocument();

    // Toggle switch buttons
    const eventSwitch = screen.getByRole('switch', { name: /Toggle Events & Hackathons Hub/i });
    expect(eventSwitch).toBeInTheDocument();
    expect(eventSwitch).toHaveAttribute('aria-checked', 'true');

    // Click toggle to turn OFF
    fireEvent.click(eventSwitch);

    // Bulk buttons
    expect(screen.getAllByRole('button', { name: /^Enable All$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /^Disable All$/i }).length).toBeGreaterThan(0);
  });

  it('renders Faculty Management section and opens Add Faculty modal', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Switch to Faculty Oversight deck
    fireEvent.click(screen.getByRole('button', { name: /Faculty Oversight/i }));

    // Faculty Advisory section
    expect(screen.getByText('Faculty Governance & Provisioning')).toBeInTheDocument();
    const addFacultyBtns = screen.getAllByRole('button', { name: /Add Faculty Advisor/i });
    expect(addFacultyBtns.length).toBeGreaterThan(0);

    // Open modal
    fireEvent.click(addFacultyBtns[0]);
    expect(screen.getByText('Provision Faculty Advisor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Dr. Sarah Jenkins')).toBeInTheDocument();
  });

  it('renders 5-Deck Executive Navigation bar and allows filtering to focused decks', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Assert all 5 decks + All Decks are present
    expect(screen.getByRole('button', { name: /All Decks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Command Hub/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Faculty Oversight/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Student Governance/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Role & Access Matrix/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Maintenance & DB/i })).toBeInTheDocument();

    // Switch to Command Hub
    fireEvent.click(screen.getByRole('button', { name: /Command Hub/i }));
    expect(screen.getByText('+ Provision Faculty')).toBeInTheDocument();
    expect(screen.getByText('+ Onboard Student')).toBeInTheDocument();

    // Switch to Maintenance & DB
    fireEvent.click(screen.getByRole('button', { name: /Maintenance & DB/i }));
    expect(screen.getByText(/TiDB Cloud MySQL Distributed Database/i)).toBeInTheDocument();
    expect(screen.getByText(/gateway01.ap-southeast-1.prod.aws.tidbcloud.com/i)).toBeInTheDocument();
  });

  /* -------------------------------------------------------------------------
     NEW MOBILE-FIRST COCKPIT & BOTTOM-SHEET FLOW SPECIFICATION TESTS
     ------------------------------------------------------------------------- */
  it('navigates via Floating Pill Bottom Nav across 5 dedicated screens without clipping', () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Assert 5 mobile bottom nav tabs exist with 44px tap targets
    const homeTab = screen.getByRole('tab', { name: /Home Screen/i });
    const controlTab = screen.getByRole('tab', { name: /Control Screen/i });
    const peopleTab = screen.getByRole('tab', { name: /People Screen/i });
    const accessTab = screen.getByRole('tab', { name: /Access Screen/i });
    const systemTab = screen.getByRole('tab', { name: /System Screen/i });

    expect(homeTab).toBeInTheDocument();
    expect(controlTab).toBeInTheDocument();
    expect(peopleTab).toBeInTheDocument();
    expect(accessTab).toBeInTheDocument();
    expect(systemTab).toBeInTheDocument();

    // Navigate to Control
    fireEvent.click(controlTab);
    expect(screen.getByText('Platform Module Switchboard')).toBeInTheDocument();

    // Navigate to System
    fireEvent.click(systemTab);
    expect(screen.getByText('TiDB Cloud MySQL Distributed Database')).toBeInTheDocument();
  });

  it('opens and confirms Disable All Confirmation bottom sheet before pausing modules', () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Switch to Control deck
    fireEvent.click(screen.getByRole('tab', { name: /Control Screen/i }));

    // Click Disable All button
    const disableAllBtn = screen.getByRole('button', { name: /^Disable All$/i });
    fireEvent.click(disableAllBtn);

    // Assert confirmation bottom sheet opens with safety warning
    expect(screen.getByText('Pause All Club Modules?')).toBeInTheDocument();
    expect(screen.getByText(/All 9 modules will be set to maintenance mode/i)).toBeInTheDocument();

    // Cancel action dismisses sheet
    const cancelBtn = screen.getByRole('button', { name: /^Cancel$/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByText('Pause All Club Modules?')).not.toBeInTheDocument();
  });

  it('opens Add Faculty bottom sheet, performs inline validation, and handles close', () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Open from Command Hub quick actions
    const addFacultyQuick = screen.getByRole('button', { name: /\+ Provision Faculty/i });
    fireEvent.click(addFacultyQuick);

    // Form inputs rendered in bottom sheet
    expect(screen.getByText('Provision Faculty Advisor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Dr. Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. FAC01')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. sarah.jenkins@college.edu')).toBeInTheDocument();

    // Close sheet
    const closeBtn = screen.getByRole('button', { name: /Close bottom sheet/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Provision Faculty Advisor')).not.toBeInTheDocument();
  });

  it('renders Danger Zone Factory Purge bottom sheet requiring CONFIRM typed input', () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Navigate to System tab
    fireEvent.click(screen.getByRole('tab', { name: /System Screen/i }));

    // Expand danger zone
    const expandDangerBtn = screen.getByRole('button', { name: /Danger Zone/i });
    fireEvent.click(expandDangerBtn);

    // Trigger purge
    const purgeBtn = screen.getByRole('button', { name: /Initialize Clean Slate/i });
    fireEvent.click(purgeBtn);

    // Bottom sheet confirmation
    expect(screen.getByText('Confirm Factory Purge')).toBeInTheDocument();
    const confirmInput = screen.getByPlaceholderText('Type CONFIRM...');
    const executeBtn = screen.getByRole('button', { name: /Authorize Purge/i });

    // Disabled before typing CONFIRM
    expect(executeBtn).toBeDisabled();

    // Type partial string
    fireEvent.change(confirmInput, { target: { value: 'CONF' } });
    expect(executeBtn).toBeDisabled();

    // Type full CONFIRM
    fireEvent.change(confirmInput, { target: { value: 'CONFIRM' } });
    expect(executeBtn).not.toBeDisabled();
  });
});
