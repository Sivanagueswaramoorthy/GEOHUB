import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '../../../context/AppContext';
import { FirstTimeProfileSetupModal } from '../FirstTimeProfileSetupModal';
import { App } from '../../../App';
import { UserModel } from '../../../types';

// Helper component to mount modal with test user state
const TestSetupWrapper: React.FC<{
  initialUser: Partial<UserModel>;
  children?: React.ReactNode;
}> = ({ initialUser }) => {
  const { setCurrentUser, currentUser } = useApp();

  React.useEffect(() => {
    setCurrentUser({
      ...currentUser,
      ...initialUser,
    } as UserModel);
  }, []);

  return <FirstTimeProfileSetupModal isOpen={true} />;
};

describe('FirstTimeProfileSetupModal Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('renders modal with scholar identity and required contact inputs', () => {
    const testUser: Partial<UserModel> = {
      uid: 'u_new_scholar_01',
      rollNo: '24GEO181',
      name: 'Abinandhan K',
      email: '24geo181@geohub.edu',
      role: 'student',
      department: 'Geoinformatics Engineering',
      phone: '',
      hasCompletedProfileSetup: false,
    };

    render(
      <AppProvider>
        <TestSetupWrapper initialUser={testUser} />
      </AppProvider>
    );

    // Header & identity check
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/complete your profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Abinandhan K/i)).toBeInTheDocument();
    expect(screen.getByText('24GEO181')).toBeInTheDocument();

    // Inputs check
    expect(screen.getByTestId('first-time-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('first-time-phone-input')).toBeInTheDocument();
    expect(screen.getByTestId('first-time-submit-btn')).toBeInTheDocument();
  });

  it('enforces non-dismissibility (no close button, escape key ignored)', () => {
    const testUser: Partial<UserModel> = {
      uid: 'u_new_scholar_02',
      rollNo: '24GEO182',
      name: 'Rohan Sharma',
      hasCompletedProfileSetup: false,
    };

    render(
      <AppProvider>
        <TestSetupWrapper initialUser={testUser} />
      </AppProvider>
    );

    // Modal must NOT have any close (X) button
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();

    // Escape key press must NOT unmount or close the dialog
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('validates email format and phone number length', async () => {
    const testUser: Partial<UserModel> = {
      uid: 'u_new_scholar_03',
      rollNo: '24GEO183',
      name: 'Priya Sundar',
      hasCompletedProfileSetup: false,
    };

    render(
      <AppProvider>
        <TestSetupWrapper initialUser={testUser} />
      </AppProvider>
    );

    const emailInput = screen.getByTestId('first-time-email-input');
    const phoneInput = screen.getByTestId('first-time-phone-input');
    const submitBtn = screen.getByTestId('first-time-submit-btn');

    // Test invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number must be exactly 10 digits/i)).toBeInTheDocument();
    });
  });

  it('submits valid details, calls completeProfileSetup, and updates state', async () => {
    const testUser: Partial<UserModel> = {
      uid: 'u_new_scholar_04',
      rollNo: '24GEO184',
      name: 'Dinesh Kumar',
      email: '',
      phone: '',
      hasCompletedProfileSetup: false,
    };

    render(
      <AppProvider>
        <TestSetupWrapper initialUser={testUser} />
      </AppProvider>
    );

    const emailInput = screen.getByTestId('first-time-email-input');
    const phoneInput = screen.getByTestId('first-time-phone-input');
    const submitBtn = screen.getByTestId('first-time-submit-btn');

    fireEvent.change(emailInput, { target: { value: 'dinesh.k@college.edu' } });
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      // localStorage flag must be persisted for this user
      expect(localStorage.getItem('geohub_profile_setup_completed_u_new_scholar_04')).toBe('true');
      expect(localStorage.getItem('geohub_profile_setup_completed_24GEO184')).toBe('true');
    });
  });

  it('permanently suppresses popup for second time login when flag is stored', () => {
    // Stage user with profile setup flag already completed
    localStorage.setItem('geohub_profile_setup_completed_u_existing_01', 'true');

    const testUser: Partial<UserModel> = {
      uid: 'u_existing_01',
      rollNo: '24GEO100',
      name: 'Existing Scholar',
      email: 'existing@college.edu',
      phone: '+91 9442018820',
      hasCompletedProfileSetup: true,
    };

    const TestSecondLogin: React.FC = () => {
      const { currentUser } = useApp();
      const isCompleted =
        currentUser?.hasCompletedProfileSetup ||
        localStorage.getItem(`geohub_profile_setup_completed_${currentUser?.uid}`) === 'true';

      return <FirstTimeProfileSetupModal isOpen={!isCompleted} />;
    };

    render(
      <AppProvider>
        <TestSecondLogin />
      </AppProvider>
    );

    // Modal must NOT be open on second login
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(/complete your profile/i)).not.toBeInTheDocument();
  });
});
