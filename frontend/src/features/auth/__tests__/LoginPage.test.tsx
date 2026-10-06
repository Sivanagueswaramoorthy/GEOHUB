import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../../../context/AppContext';
import { LoginPage } from '../LoginPage';
import { PasswordField } from '../PasswordField';
import { LoginForm } from '../LoginForm';
import { ForgotPasswordSheet } from '../ForgotPasswordSheet';
import { DemoRolesSheet } from '../DemoRolesSheet';
import { createLoginSchema } from '../auth.schema';

describe('Auth Validation Schema (Zod)', () => {
  const schema = createLoginSchema('college.edu');

  it('rejects empty email and password', () => {
    const res = schema.safeParse({ email: '', password: '' });
    expect(res.success).toBe(false);
    if (!res.success) {
      const messages = res.error.issues.map((i) => i.message);
      expect(messages).toContain('Institutional email is required');
      expect(messages).toContain('Password is required');
    }
  });

  it('rejects passwords shorter than 8 characters', () => {
    const res = schema.safeParse({ email: 'alex@college.edu', password: '123' });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toBe('Password must be at least 8 characters');
    }
  });

  it('validates institutional domain constraint when configured', () => {
    const res = schema.safeParse({ email: 'user@otherdomain.com', password: 'password123' });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toContain('Please use your institutional @college.edu address');
    }
  });

  it('accepts valid credentials with institutional domain', () => {
    const res = schema.safeParse({
      email: 'alex.rivera@college.edu',
      password: 'correctpassword123',
      rememberMe: true,
    });
    expect(res.success).toBe(true);
  });
});

describe('PasswordField Component', () => {
  it('toggles password visibility and updates aria-pressed', () => {
    render(<PasswordField id="test-password" />);
    const input = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;
    const toggleBtn = screen.getByRole('button', { name: /show password/i });

    expect(input.type).toBe('password');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(toggleBtn);
    expect(input.type).toBe('password');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('detects Caps Lock activation and displays warning chip', () => {
    render(<PasswordField id="test-password" />);
    const input = screen.getByPlaceholderText('Enter your password');

    // Caps Lock inactive initially
    expect(screen.queryByText(/Caps Lock is on/i)).not.toBeInTheDocument();

    // Trigger key event with CapsLock active
    fireEvent.keyDown(input, {
      key: 'A',
      modifierCapsLock: true,
      getModifierState: (key: string) => key === 'CapsLock',
    });

    expect(screen.getByText(/Caps Lock is on/i)).toBeInTheDocument();

    // On blur, chip disappears
    fireEvent.blur(input);
    expect(screen.queryByText(/Caps Lock is on/i)).not.toBeInTheDocument();
  });
});

describe('LoginForm Component', () => {
  const mockSubmit = vi.fn().mockResolvedValue(true);
  const mockForgot = vi.fn();
  const mockJoin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors when submitted empty', async () => {
    render(
      <LoginForm
        onSubmit={mockSubmit}
        isLoading={false}
        isSuccess={false}
        errorState={{ code: null, message: null }}
        rateLimitSeconds={0}
        onForgotPasswordClick={mockForgot}
        onRequestJoinClick={mockJoin}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Institutional email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('disables submit button and shows loading spinner while authenticating', () => {
    render(
      <LoginForm
        onSubmit={mockSubmit}
        isLoading={true}
        isSuccess={false}
        errorState={{ code: null, message: null }}
        rateLimitSeconds={0}
        onForgotPasswordClick={mockForgot}
        onRequestJoinClick={mockJoin}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /signing in\.\.\./i });
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveAttribute('aria-busy', 'true');
  });

  it('renders 401 error message properly', () => {
    render(
      <LoginForm
        onSubmit={mockSubmit}
        isLoading={false}
        isSuccess={false}
        errorState={{ code: '401', message: 'Incorrect email or password.' }}
        rateLimitSeconds={0}
        onForgotPasswordClick={mockForgot}
        onRequestJoinClick={mockJoin}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Incorrect email or password.');
  });

  it('renders 403 suspension error message properly', () => {
    render(
      <LoginForm
        onSubmit={mockSubmit}
        isLoading={false}
        isSuccess={false}
        errorState={{
          code: '403',
          message: 'Your account is awaiting approval or has been suspended. Contact your club coordinator.',
        }}
        rateLimitSeconds={0}
        onForgotPasswordClick={mockForgot}
        onRequestJoinClick={mockJoin}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your account is awaiting approval or has been suspended.'
    );
  });

  it('renders 429 rate limit lock state with countdown', () => {
    render(
      <LoginForm
        onSubmit={mockSubmit}
        isLoading={false}
        isSuccess={false}
        errorState={{ code: '429', message: 'Too many attempts. Try again in 2 minutes.' }}
        rateLimitSeconds={90}
        onForgotPasswordClick={mockForgot}
        onRequestJoinClick={mockJoin}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Too many attempts.');
    const submitBtn = screen.getByRole('button', { name: /locked \(90s\)/i });
    expect(submitBtn).toBeDisabled();
  });

  it('renders network error with retry button', () => {
    render(
      <LoginForm
        onSubmit={mockSubmit}
        isLoading={false}
        isSuccess={false}
        errorState={{
          code: 'NETWORK',
          message: "Can't reach the server. Check your connection and try again.",
          retryable: true,
        }}
        rateLimitSeconds={0}
        onForgotPasswordClick={mockForgot}
        onRequestJoinClick={mockJoin}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent("Can't reach the server.");
    expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument();
  });
});

describe('ForgotPasswordSheet Component', () => {
  it('validates email input and submits password reset request', async () => {
    const handleClose = vi.fn();
    render(<ForgotPasswordSheet isOpen={true} onClose={handleClose} initialEmail="" />);

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/institutional email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a valid institutional email/i)).toBeInTheDocument();
    });

    fireEvent.change(emailInput, { target: { value: 'sarah.jenkins@college.edu' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(
      () => {
        expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
        expect(screen.getByText(/a password reset link is on its way/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});

describe('DemoRolesSheet Component', () => {
  it('renders all 6 required demo personas', () => {
    const handleSelect = vi.fn();
    render(<DemoRolesSheet isOpen={true} onClose={vi.fn()} onSelectPersona={handleSelect} />);

    expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Aarav Patel')).toBeInTheDocument();
    expect(screen.getByText('Ananya Iyer')).toBeInTheDocument();
    expect(screen.getByText('David Chen')).toBeInTheDocument();
    expect(screen.getByText('Liam Vance')).toBeInTheDocument();

    // Selecting persona triggers callback
    fireEvent.click(screen.getByText('Dr. Sarah Jenkins'));
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });
});

describe('LoginPage Integration and E2E Auth Behavior', () => {
  it('renders brand elements, two-tone wordmark, and institutional tagline', () => {
    render(
      <AppProvider>
        <LoginPage />
      </AppProvider>
    );

    expect(screen.getAllByText('Green Eco').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Organization').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Your club, organized.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getAllByText('Department of Geography').length).toBeGreaterThanOrEqual(1);
  });

  it('successfully authenticates with valid credentials and triggers redirect', async () => {
    render(
      <AppProvider>
        <LoginPage />
      </AppProvider>
    );

    const emailInput = screen.getByLabelText(/institutional email/i);
    const passwordInput = screen.getByPlaceholderText('••••••••••••');

    fireEvent.change(emailInput, { target: { value: 'alex.rivera@college.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'leadership2026' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(
      () => {
        expect(screen.getByText(/verified & redirecting/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('hides Demo Roles trigger by default in production mode', () => {
    render(
      <AppProvider>
        <LoginPage />
      </AppProvider>
    );

    expect(screen.queryByRole('button', { name: /demo roles/i })).not.toBeInTheDocument();
  });

  it('renders Demo Roles trigger when enabled via ?demo=true param', () => {
    window.history.pushState({}, '', '/login?demo=true');
    render(
      <AppProvider>
        <LoginPage />
      </AppProvider>
    );

    const trigger = screen.getByRole('button', { name: /demo roles/i });
    expect(trigger).toBeInTheDocument();

    // Clicking it opens the demo roles sheet
    fireEvent.click(trigger);
    expect(screen.getByRole('heading', { name: /instant demo personas/i })).toBeInTheDocument();

    // Reset url
    window.history.pushState({}, '', '/');
  });
});

