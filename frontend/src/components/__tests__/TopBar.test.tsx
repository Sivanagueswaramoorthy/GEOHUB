import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TopBar } from '../shared/TopBar';
import { IconCircleButton } from '../shared/IconCircleButton';
import { AppProvider } from '../../context/AppContext';

describe('TopBar & IconCircleButton Components', () => {
  it('renders TopBar with logo mark, GeoHub title and subtitle', () => {
    const handleHome = vi.fn();
    render(
      <AppProvider>
        <TopBar onHome={handleHome} />
      </AppProvider>
    );

    expect(screen.getByLabelText('GeoHub home')).toBeInTheDocument();
    expect(screen.getByText('Green Eco')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('GeoHub home'));
    expect(handleHome).toHaveBeenCalledTimes(1);
  });

  it('renders notifications button with badge and aria-label', () => {
    const handleNotifications = vi.fn();
    render(
      <AppProvider>
        <TopBar unreadCount={5} onNotifications={handleNotifications} />
      </AppProvider>
    );

    const bellBtn = screen.getByLabelText('Notifications, 5 unread');
    expect(bellBtn).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    fireEvent.click(bellBtn);
    expect(handleNotifications).toHaveBeenCalledTimes(1);
  });

  it('caps unread badge at 9+ when count exceeds 9', () => {
    render(
      <AppProvider>
        <TopBar unreadCount={14} />
      </AppProvider>
    );

    expect(screen.getByLabelText('Notifications, 14 unread')).toBeInTheDocument();
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('renders avatar button with user initial and triggers onProfile', () => {
    const handleProfile = vi.fn();
    render(
      <AppProvider>
        <TopBar
          user={{
            uid: 'u_test_1',
            name: 'Sarah Mitchell',
            email: 's@col.edu',
            role: 'faculty',
            status: 'active',
            isVolunteer: false,
          }}
          onProfile={handleProfile}
        />
      </AppProvider>
    );

    const avatarBtn = screen.getByLabelText('Open profile menu');
    expect(avatarBtn).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();

    fireEvent.click(avatarBtn);
    expect(handleProfile).toHaveBeenCalledTimes(1);
  });

  it('navigates to full-screen profile when avatar button is clicked without onProfile prop', () => {
    render(
      <AppProvider>
        <TopBar />
      </AppProvider>
    );

    const avatarBtn = screen.getByLabelText('Open profile menu');
    expect(avatarBtn).toBeInTheDocument();

    fireEvent.click(avatarBtn);
    // Hash is set to profile
    expect(window.location.hash).toBe('#profile');
  });

  it('respects showNotificationsInTopBar=false by omitting the bell button', () => {
    render(
      <AppProvider>
        <TopBar showNotificationsInTopBar={false} />
      </AppProvider>
    );

    expect(screen.queryByLabelText(/Notifications/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Open profile menu')).toBeInTheDocument();
  });

  it('IconCircleButton provides 44x44 minimum touch target and handles variants', () => {
    const handleClick = vi.fn();
    render(
      <IconCircleButton
        ariaLabel="Custom action"
        onClick={handleClick}
        variant="default"
      >
        <span>Icon</span>
      </IconCircleButton>
    );

    const btn = screen.getByLabelText('Custom action');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveStyle({ minWidth: '44px', minHeight: '44px' });

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders custom orgName and orgSubtitle when provided', () => {
    render(
      <AppProvider>
        <TopBar orgName="Custom Eco" orgSubtitle="Sub-chapter" />
      </AppProvider>
    );

    expect(screen.getByText('Custom Eco')).toBeInTheDocument();
    expect(screen.getByText('Sub-chapter')).toBeInTheDocument();
  });

  it('defaults avatar to D initial when user name is not provided', () => {
    render(
      <AppProvider>
        <TopBar user={{ uid: 'anon', email: 'anon@col.edu', role: 'student', status: 'active', isVolunteer: false }} />
      </AppProvider>
    );

    expect(screen.getByText('D')).toBeInTheDocument();
  });
});

