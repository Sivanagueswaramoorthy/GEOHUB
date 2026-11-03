import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileView } from '../ProfileView';
import { AppProvider } from '../../../context/AppContext';

describe('ProfileView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders executive scholar profile with identity, role badge, and dossier', () => {
    render(
      <AppProvider>
        <ProfileView />
      </AppProvider>
    );

    // Header & identity
    expect(screen.getByText('Account & Profile')).toBeInTheDocument();
    expect(screen.getByText(/Verified Scholar Credentials & Digital Pass/i)).toBeInTheDocument();
    expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getAllByText(/FACULTY ADVISOR/i).length).toBeGreaterThan(0);

    // Key metrics
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Verified Check-ins')).toBeInTheDocument();
    expect(screen.getByText('Duties')).toBeInTheDocument();
    expect(screen.getByText('Clearance')).toBeInTheDocument();

    // Chapter Gate Pass
    expect(screen.getByText('Official Chapter Gate Pass')).toBeInTheDocument();
    expect(screen.getByText(/Dynamic Token for Event Check-In/i)).toBeInTheDocument();

    // Dossier
    expect(screen.getByText('Academic & Club Dossier')).toBeInTheDocument();
    expect(screen.getByText(/Branch \/ Department/i)).toBeInTheDocument();
    expect(screen.getByText(/Academic Year \/ Standing/i)).toBeInTheDocument();

    // Settings
    expect(screen.getByText('Settings & System Actions')).toBeInTheDocument();
    expect(screen.getByText('Official Notifications')).toBeInTheDocument();
    expect(screen.getByText('Log Out of GeoHub')).toBeInTheDocument();
  });

  it('opens high-brightness gate pass modal when clicking Expand button', () => {
    render(
      <AppProvider>
        <ProfileView />
      </AppProvider>
    );

    const expandBtn = screen.getByRole('button', { name: /expand high-brightness gate pass/i });
    fireEvent.click(expandBtn);

    expect(screen.getByText('Chapter Gate Pass')).toBeInTheDocument();
    expect(screen.getByText(/Present to Management Squad scanner/i)).toBeInTheDocument();
  });

  it('opens confirmation dialog when clicking Log Out', () => {
    render(
      <AppProvider>
        <ProfileView />
      </AppProvider>
    );

    const logoutBtn = screen.getByRole('button', { name: /log out of geohub/i });
    fireEvent.click(logoutBtn);

    expect(screen.getByText('Log out of GeoHub?')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to end your current session/i)).toBeInTheDocument();
  });
});
