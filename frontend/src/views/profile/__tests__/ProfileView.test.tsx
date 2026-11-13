import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileView } from '../ProfileView';
import { AppProvider } from '../../../context/AppContext';

describe('ProfileView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders executive scholar profile with identity, role badge, metrics, and dossier', () => {
    render(
      <AppProvider>
        <ProfileView />
      </AppProvider>
    );

    // Header & identity
    expect(screen.getByText('Account & Profile')).toBeInTheDocument();
    expect(screen.getByText(/Verified Scholar Credentials & Academic Standing/i)).toBeInTheDocument();
    expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getAllByText(/FACULTY ADVISOR/i).length).toBeGreaterThan(0);

    // Key metrics
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Verified Check-ins')).toBeInTheDocument();
    expect(screen.getByText('Duties')).toBeInTheDocument();
    expect(screen.getByText('Clearance')).toBeInTheDocument();

    // Dossier
    expect(screen.getByText('Academic & Club Dossier')).toBeInTheDocument();
    expect(screen.getByText(/Branch \/ Department/i)).toBeInTheDocument();
    expect(screen.getByText(/Academic Year \/ Standing/i)).toBeInTheDocument();

    // Dedicated Logout Action
    expect(screen.getByRole('button', { name: /log out of geohub/i })).toBeInTheDocument();
  });

  it('opens high-brightness digital gate pass modal when clicking Digital Pass button', () => {
    render(
      <AppProvider>
        <ProfileView />
      </AppProvider>
    );

    const digitalPassBtn = screen.getByRole('button', { name: /open digital pass/i });
    fireEvent.click(digitalPassBtn);

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

  it('renders Security tab with Change Password trigger and opens clean modal on click', async () => {
    render(
      <AppProvider>
        <ProfileView />
      </AppProvider>
    );

    // Switch to Security tab
    const securityTabBtn = screen.getByRole('button', { name: 'Security' });
    fireEvent.click(securityTabBtn);

    expect(screen.getByText('Change Password')).toBeInTheDocument();

    // Open Change Password modal
    const changeBtn = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(changeBtn);

    expect(screen.getByLabelText(/Current \/ Old Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();

    const oldInput = screen.getByLabelText(/Current \/ Old Password/i);
    const newInput = screen.getByLabelText(/^New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    const updateBtn = screen.getByRole('button', { name: /Update Account Password/i });

    // Test mismatched passwords
    fireEvent.change(oldInput, { target: { value: 'CurrentPass123' } });
    fireEvent.change(newInput, { target: { value: 'ValidPass123' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentPass456' } });
    fireEvent.click(updateBtn);

    expect(screen.getByText(/New password and confirm password do not match/i)).toBeInTheDocument();

    // Test valid matching submission
    fireEvent.change(confirmInput, { target: { value: 'ValidPass123' } });
    fireEvent.click(updateBtn);

    // Should indicate updating state or show success
    expect(updateBtn).toBeDisabled();
  });

  it('renders Settings tab with Software Updates card and check trigger', async () => {
    render(
      <AppProvider>
        <ProfileView />
      </AppProvider>
    );

    // Switch to Settings tab
    const settingsTabBtn = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsTabBtn);

    // Verify Software Updates card is visible
    expect(screen.getByText('Software Updates & App Installation')).toBeInTheDocument();
    expect(screen.getByText(/GeoHub is up to date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check for Updates/i })).toBeInTheDocument();
  });
});
