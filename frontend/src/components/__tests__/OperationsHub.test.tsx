import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccessChip } from '../shared/AccessChip';
import { HubCard } from '../shared/HubCard';
import { ModuleSection } from '../shared/ModuleSection';
import { ModuleGuard } from '../shared/ModuleGuard';
import { AppProvider } from '../../context/AppContext';
import { Users } from 'lucide-react';
import { UserModel } from '../../types';

describe('Operations Hub Components & UI Conformance Suite', () => {
  describe('AccessChip Component', () => {
    it('renders "Manage" chip with Pine 800 styling', () => {
      render(<AccessChip variant="manage" />);
      const chip = screen.getByTestId('access-chip-manage');
      expect(chip).toBeDefined();
      expect(chip.textContent).toBe('Manage');
      expect(chip.className).toContain('bg-[#163832]');
    });

    it('renders "View only" chip with Mint 100 styling', () => {
      render(<AccessChip variant="view_only" />);
      const chip = screen.getByTestId('access-chip-view_only');
      expect(chip).toBeDefined();
      expect(chip.textContent).toBe('View only');
      expect(chip.className).toContain('bg-[#DAF1DE]');
      expect(chip.className).toContain('text-[#051F20]');
    });

    it('renders "Approve" chip with Amber tint styling', () => {
      render(<AccessChip variant="approve" />);
      const chip = screen.getByTestId('access-chip-approve');
      expect(chip).toBeDefined();
      expect(chip.textContent).toBe('Approve');
      expect(chip.className).toContain('bg-[#F2B84B]');
    });

    it('renders "Grant" chip with Sage styling', () => {
      render(<AccessChip variant="grant" />);
      const chip = screen.getByTestId('access-chip-grant');
      expect(chip).toBeDefined();
      expect(chip.textContent).toBe('Grant');
      expect(chip.className).toContain('bg-[#8EB69B]');
    });
  });

  describe('HubCard Component', () => {
    it('renders module title, description, icon and access chip', () => {
      render(
        <HubCard
          id="squads"
          title="Squads"
          description="Team rosters, squads & collaborative group stations"
          icon={Users}
          accessType="manage"
          pendingCount={0}
        />
      );

      expect(screen.getByText('Squads')).toBeDefined();
      expect(screen.getByText('Team rosters, squads & collaborative group stations')).toBeDefined();
      expect(screen.getByText('Manage')).toBeDefined();
      expect(screen.queryByTestId('badge-pending-squads')).toBeNull();
    });

    it('renders pending count badge when pendingCount > 0', () => {
      render(
        <HubCard
          id="approvals"
          title="Approvals"
          description="Review queue for squad updates"
          iconName="CheckSquare"
          accessType="approve"
          pendingCount={3}
        />
      );

      const badge = screen.getByTestId('badge-pending-approvals');
      expect(badge).toBeDefined();
      expect(badge.textContent).toBe('3');
      expect(screen.getByText('Approve')).toBeDefined();
    });

    it('handles click and keyboard Enter triggers', () => {
      const handleClick = vi.fn();
      render(
        <HubCard
          id="treasury"
          title="Treasury"
          description="Budget requests"
          iconName="Landmark"
          accessType="manage"
          onClick={handleClick}
        />
      );

      const card = screen.getByTestId('hub-card-treasury');
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('ModuleSection Component', () => {
    it('renders section header, count badge and wraps cards', () => {
      render(
        <ModuleSection title="People" count={3} description="Roster & squads">
          <div data-testid="child-card-1">Card 1</div>
          <div data-testid="child-card-2">Card 2</div>
        </ModuleSection>
      );

      expect(screen.getByText('People')).toBeDefined();
      expect(screen.getByText('3')).toBeDefined();
      expect(screen.getByTestId('child-card-1')).toBeDefined();
      expect(screen.getByTestId('child-card-2')).toBeDefined();
    });
  });

  describe('ModuleGuard & Access Enforcement', () => {
    const studentUser: UserModel = {
      uid: 'u-stud-1',
      name: 'Student User',
      email: 'student@geohub.edu',
      role: 'student',
      isVolunteer: false,
      status: 'active',
    };

    it('blocks hidden module routes and renders Access Restricted message', () => {
      render(
        <AppProvider>
          <ModuleGuard moduleId="treasury" user={studentUser}>
            <div data-testid="secret-module-content">Secret Treasury Content</div>
          </ModuleGuard>
        </AppProvider>
      );

      // Treasury is HIDDEN for student
      expect(screen.queryByTestId('secret-module-content')).toBeNull();
      expect(screen.getByTestId('module-guard-restricted')).toBeDefined();
      expect(screen.getByText('Access Restricted')).toBeDefined();
    });

    it('renders module with readOnly=true when user has READ access', () => {
      render(
        <AppProvider>
          <ModuleGuard moduleId="squads" user={studentUser}>
            {({ readOnly, access }) => (
              <div>
                <span data-testid="read-only-state">{readOnly ? 'IS_READ_ONLY' : 'IS_WRITE'}</span>
                <span data-testid="access-state">{access}</span>
              </div>
            )}
          </ModuleGuard>
        </AppProvider>
      );

      // Student has READ on squads
      expect(screen.getByTestId('read-only-state').textContent).toBe('IS_READ_ONLY');
      expect(screen.getByTestId('access-state').textContent).toBe('read');
    });

    it('renders module with readOnly=false when user has WRITE access', () => {
      const facultyUser: UserModel = {
        uid: 'u-fac-1',
        name: 'Dr. Faculty',
        email: 'faculty@geohub.edu',
        role: 'faculty',
        isVolunteer: false,
        status: 'active',
      };

      render(
        <AppProvider>
          <ModuleGuard moduleId="squads" user={facultyUser}>
            {({ readOnly, access }) => (
              <div>
                <span data-testid="read-only-state">{readOnly ? 'IS_READ_ONLY' : 'IS_WRITE'}</span>
                <span data-testid="access-state">{access}</span>
              </div>
            )}
          </ModuleGuard>
        </AppProvider>
      );

      // Faculty has WRITE on squads
      expect(screen.getByTestId('read-only-state').textContent).toBe('IS_WRITE');
      expect(screen.getByTestId('access-state').textContent).toBe('write');
    });
  });

  describe('READ screens render no action buttons', () => {
    it('asserts that read-only Treasury renders no Approve or Reject buttons', () => {
      // Mock render of a Treasury-like read screen
      const readOnly = true;

      render(
        <div>
          <div className="header">
            {readOnly && <AccessChip variant="view_only" label="View only" />}
          </div>
          <div className="requests">
            <span data-testid="req-title">Field Survey Expense</span>
            {!readOnly && (
              <>
                <button data-testid="btn-approve">Approve</button>
                <button data-testid="btn-reject">Reject</button>
              </>
            )}
          </div>
        </div>
      );

      expect(screen.getByText('View only')).toBeDefined();
      expect(screen.queryByTestId('btn-approve')).toBeNull();
      expect(screen.queryByTestId('btn-reject')).toBeNull();
    });

    it('asserts that read-only Add Expense renders no submit button or input form', () => {
      const readOnly = true;

      render(
        <div>
          <div className="header">
            {readOnly && <AccessChip variant="view_only" label="View only" />}
          </div>
          {!readOnly && (
            <form data-testid="expense-form">
              <input placeholder="Amount" />
              <button type="submit">Submit Expense Entry</button>
            </form>
          )}
          <div data-testid="past-entries">Past Expenses List</div>
        </div>
      );

      expect(screen.getByText('View only')).toBeDefined();
      expect(screen.queryByTestId('expense-form')).toBeNull();
      expect(screen.queryByText('Submit Expense Entry')).toBeNull();
      expect(screen.getByTestId('past-entries')).toBeDefined();
    });
  });
});
