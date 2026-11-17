import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../../context/AppContext';
import { SuperAdminTopNav } from '../../../components/navigation/SuperAdminTopNav';
import { StatStrip } from '../../../components/navigation/StatStrip';
import { SuperAdminBottomNav } from '../../../components/navigation/SuperAdminBottomNav';
import { OverviewCounts, OnlineSessionUser } from '../types';

describe('SuperAdmin Mobile Shell & Navigation Suite', () => {
  beforeEach(() => {
    window.location.hash = '';
    vi.clearAllMocks();
  });

  const mockCounts: OverviewCounts = {
    modulesLive: 9,
    modulesTotal: 9,
    faculty: 4,
    students: 7,
    users: 11,
    online: 2,
  };

  const mockOnlineUsers: OnlineSessionUser[] = [
    {
      id: 'usr-1',
      name: 'Alex Rivera',
      roll_no: '21GEO001',
      role: 'coordinator',
      last_seen_at: new Date().toISOString(),
      platform: 'Android',
    },
    {
      id: 'usr-2',
      name: 'Dr. Sarah Jenkins',
      roll_no: 'FAC01',
      role: 'faculty',
      last_seen_at: new Date(Date.now() - 120000).toISOString(),
      platform: 'Web',
    },
  ];

  describe('SuperAdminTopNav', () => {
    it('renders canonical top bar with logo wordmark, profile menu, and notification bell as like in faculty role', () => {
      render(
        <AppProvider>
          <SuperAdminTopNav />
        </AppProvider>
      );

      // Logo wordmark (GeoHub home)
      expect(screen.getByLabelText('GeoHub home')).toBeInTheDocument();
      expect(screen.getByText('Green Eco')).toBeInTheDocument();
      expect(screen.getByText('Organization')).toBeInTheDocument();

      // Profile menu trigger
      expect(screen.getByLabelText('Open profile menu')).toBeInTheDocument();

      // Notification bell
      expect(screen.getByLabelText(/Notifications/i)).toBeInTheDocument();
    });

    it('renders avatar button with user initial and opens profile menu on click', () => {
      render(
        <AppProvider>
          <SuperAdminTopNav />
        </AppProvider>
      );

      const avatarBtn = screen.getByLabelText('Open profile menu');
      expect(avatarBtn).toBeInTheDocument();
      fireEvent.click(avatarBtn);
      expect(window.location.hash).toBe('#profile');
    });

    it('renders notification bell button and calls onOpenNotifications on click', () => {
      const handleOpenNotifications = vi.fn();
      render(
        <AppProvider>
          <SuperAdminTopNav onOpenNotifications={handleOpenNotifications} />
        </AppProvider>
      );

      const bellBtn = screen.getByLabelText(/Notifications/i);
      expect(bellBtn).toBeInTheDocument();
      fireEvent.click(bellBtn);
      expect(handleOpenNotifications).toHaveBeenCalledTimes(1);
    });
  });

  describe('StatStrip', () => {
    it('renders 4 compact chips with correct metrics', () => {
      render(
        <StatStrip
          counts={mockCounts}
          onlineUsers={mockOnlineUsers}
          onSelectDeck={vi.fn()}
        />
      );

      expect(screen.getByText('9/9 Modules')).toBeInTheDocument();
      expect(screen.getByText('4 Faculty')).toBeInTheDocument();
      expect(screen.getByText('7 Students')).toBeInTheDocument();
      expect(screen.getByText('2 Online')).toBeInTheDocument();
    });

    it('jumps to corresponding decks on chip click', () => {
      const handleSelectDeck = vi.fn();
      render(
        <StatStrip
          counts={mockCounts}
          onlineUsers={mockOnlineUsers}
          onSelectDeck={handleSelectDeck}
        />
      );

      // Jump to #hub
      fireEvent.click(screen.getByText('9/9 Modules'));
      expect(handleSelectDeck).toHaveBeenCalledWith('hub');

      // Jump to #faculty
      fireEvent.click(screen.getByText('4 Faculty'));
      expect(handleSelectDeck).toHaveBeenCalledWith('faculty');

      // Jump to #students
      fireEvent.click(screen.getByText('7 Students'));
      expect(handleSelectDeck).toHaveBeenCalledWith('students');
    });

    it('opens LiveSessionsSheet when clicking online sessions chip', () => {
      render(
        <StatStrip
          counts={mockCounts}
          onlineUsers={mockOnlineUsers}
          onSelectDeck={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('2 Online'));

      // Sheet opens
      expect(screen.getByText('Active Live Sessions')).toBeInTheDocument();
      expect(screen.getByText(/Alex Rivera/)).toBeInTheDocument();
      expect(screen.getByText(/Dr. Sarah Jenkins/)).toBeInTheDocument();
    });
  });

  describe('SuperAdminBottomNav', () => {
    it('renders 5 tabs with single label for active tab and no overlapping text', () => {
      render(<SuperAdminBottomNav activeDeck="hub" />);

      // All 5 tab buttons exist
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);

      // Only the active tab ("Cockpit") renders visible text
      expect(screen.getByText('Cockpit')).toBeInTheDocument();

      // Inactive tabs should NOT render visible label text
      expect(screen.queryByText('Faculty')).not.toBeInTheDocument();
      expect(screen.queryByText('Students')).not.toBeInTheDocument();
      expect(screen.queryByText('Roles')).not.toBeInTheDocument();
      expect(screen.queryByText('System')).not.toBeInTheDocument();
    });

    it('switches active tab, updates location.hash, and dispatches event on click', () => {
      const handleSelectDeck = vi.fn();
      render(<SuperAdminBottomNav activeDeck="hub" onSelectDeck={handleSelectDeck} />);

      // Find Faculty tab button (title="Faculty")
      const facultyBtn = screen.getByTitle('Faculty');
      fireEvent.click(facultyBtn);

      expect(handleSelectDeck).toHaveBeenCalledWith('faculty');
      expect(window.location.hash).toBe('#faculty');
      expect(screen.getByText('Faculty')).toBeInTheDocument();
      expect(screen.queryByText('Cockpit')).not.toBeInTheDocument();
    });

    it('responds to external hashchange events', () => {
      render(<SuperAdminBottomNav activeDeck="hub" />);
      expect(screen.getByText('Cockpit')).toBeInTheDocument();

      // Trigger hash change to #matrix
      window.location.hash = '#matrix';
      fireEvent(window, new HashChangeEvent('hashchange'));

      expect(screen.getByText('Roles')).toBeInTheDocument();
      expect(screen.queryByText('Cockpit')).not.toBeInTheDocument();
    });
  });
});
