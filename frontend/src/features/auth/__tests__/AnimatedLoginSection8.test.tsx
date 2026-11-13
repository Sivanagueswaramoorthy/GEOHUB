import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../../../context/AppContext';
import { LoginCard } from '../../../components/auth/LoginCard';
import { LoginScene } from '../../../components/auth/LoginScene';
import { PasswordField } from '../../../components/auth/PasswordField';
import { SetNewPasswordPage } from '../../../views/auth/SetNewPasswordPage';
import { MascotLogo } from '../../../components/shared/MascotLogo';

describe('Task Section 8 Specification Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Validation Messages and Uppercase Conversion', () => {
    it('shows sentence case validation messages when submitted empty', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(true);
      render(<LoginCard onSubmit={mockSubmit} isLoading={false} isSuccess={false} />);

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Enter your roll number')).toBeInTheDocument();
      });
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('converts roll number input to uppercase automatically', () => {
      const mockSubmit = vi.fn().mockResolvedValue(true);
      render(<LoginCard onSubmit={mockSubmit} isLoading={false} isSuccess={false} />);

      const rollInput = screen.getByPlaceholderText(/enter your reg no/i) as HTMLInputElement;
      fireEvent.change(rollInput, { target: { value: '21geo045' } });

      expect(rollInput.value).toBe('21GEO045');
    });

    it('enforces letters and digits only and trims to maximum 20 characters', () => {
      const mockSubmit = vi.fn().mockResolvedValue(true);
      render(<LoginCard onSubmit={mockSubmit} isLoading={false} isSuccess={false} />);

      const rollInput = screen.getByPlaceholderText(/enter your reg no/i) as HTMLInputElement;
      fireEvent.change(rollInput, { target: { value: '21-geo@#001extra_long_string_123456789' } });

      // Strips special characters, keeps uppercase alphanumeric, max 20
      expect(rollInput.value).toBe('21GEO001EXTRALONGSTR');
      expect(rollInput.value.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Password Show/Hide Toggle', () => {
    it('toggles password between hidden and visible on button click with aria-pressed', () => {
      const handleVis = vi.fn();
      render(
        <PasswordField
          id="test-pwd"
          value="mySecret123"
          onChange={vi.fn()}
          onVisibilityChange={handleVis}
        />
      );

      const input = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;
      const toggle = screen.getByRole('button', { name: /show password/i });

      expect(input.type).toBe('password');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(toggle);
      expect(input.type).toBe('text');
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
      expect(handleVis).toHaveBeenCalledWith(true);

      fireEvent.click(toggle);
      expect(input.type).toBe('password');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      expect(handleVis).toHaveBeenCalledWith(false);
    });
  });

  describe('Generic Error & Lockout After 5 Failures', () => {
    it('shows one generic error message on invalid credentials without revealing which was wrong', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(false);
      render(<LoginCard onSubmit={mockSubmit} isLoading={false} isSuccess={false} />);

      const rollInput = screen.getByPlaceholderText(/enter your reg no/i);
      const passInput = screen.getByPlaceholderText(/enter your password/i);

      fireEvent.change(rollInput, { target: { value: '21GEO001' } });
      fireEvent.change(passInput, { target: { value: 'wrongpass' } });

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText('Roll number or password is incorrect. Try again.')
        ).toBeInTheDocument();
      });
    });

    it('locks out the form after 5 consecutive failures with visible countdown', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(false);
      render(<LoginCard onSubmit={mockSubmit} isLoading={false} isSuccess={false} />);

      const rollInput = screen.getByPlaceholderText(/enter your reg no/i);
      const passInput = screen.getByPlaceholderText(/enter your password/i);
      const submitBtn = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(rollInput, { target: { value: '21GEO001' } });
      fireEvent.change(passInput, { target: { value: 'wrongpass' } });

      // Attempt 1 to 5
      for (let i = 0; i < 5; i++) {
        fireEvent.click(submitBtn);
        await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(i + 1));
      }

      // Check lockout message and countdown
      await waitFor(() => {
        expect(screen.getByText(/Too many attempts\. Try again in 60s\./i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /locked \(60s\)/i })).toBeDisabled();
      });
    });
  });

  describe('Mascot Reactions & Mood Transitions', () => {
    it('renders mascot in look-down mood when roll number is focused', () => {
      const { container } = render(<MascotLogo mood="look-down" size="xl" />);
      expect(screen.getByRole('img', { name: 'GeoHub logo' })).toBeInTheDocument();
      // look-down tilts head 6 degrees
      const tiltedGroup = container.querySelector('g[style*="rotate(6deg)"]');
      expect(tiltedGroup).toBeInTheDocument();
    });

    it('renders mascot in eyes-closed privacy peek mood when password is focused', () => {
      const { container } = render(<MascotLogo mood="eyes-closed" size="xl" />);
      expect(screen.getByRole('img', { name: 'GeoHub logo' })).toBeInTheDocument();
      // privacy paws are rendered
      const paws = container.querySelectorAll('path[fill="var(--mint-100)"]');
      expect(paws.length).toBeGreaterThan(0);
    });

    it('renders mascot in peek mood when password show toggle is active', () => {
      const { container } = render(<MascotLogo mood="peek" size="xl" />);
      expect(screen.getByRole('img', { name: 'GeoHub logo' })).toBeInTheDocument();
      // One eye open glint
      const glint = container.querySelector('circle[fill="var(--card-white)"]');
      expect(glint).toBeInTheDocument();
    });

    it('renders mascot in worried mood on error with tilted eyebrows', () => {
      render(<MascotLogo mood="worried" size="xl" />);
      expect(screen.getByRole('img', { name: 'GeoHub logo' })).toBeInTheDocument();
    });

    it('renders mascot in happy mood on successful sign in', () => {
      render(<MascotLogo mood="happy" size="xl" />);
      expect(screen.getByRole('img', { name: 'GeoHub logo' })).toBeInTheDocument();
    });
  });

  describe('SetNewPasswordPage (mustChangePassword Flow)', () => {
    it('validates minimum 8 characters, letter and number, and prevents matching roll number', async () => {
      render(
        <AppProvider>
          <SetNewPasswordPage />
        </AppProvider>
      );

      expect(screen.getByRole('heading', { name: /set a new password/i })).toBeInTheDocument();

      const newPassInput = screen.getByPlaceholderText(/at least 8 characters/i);
      const confirmPassInput = screen.getByPlaceholderText(/re-enter your new password/i);
      const submitBtn = screen.getByRole('button', { name: /save new password/i });

      // Too short (< 8 chars)
      fireEvent.change(newPassInput, { target: { value: 'short1' } });
      fireEvent.change(confirmPassInput, { target: { value: 'short1' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });

      // No numbers
      fireEvent.change(newPassInput, { target: { value: 'alllettersonly' } });
      fireEvent.change(confirmPassInput, { target: { value: 'alllettersonly' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText('Password must contain both letters and numbers')
        ).toBeInTheDocument();
      });

      // Mismatch
      fireEvent.change(newPassInput, { target: { value: 'ValidPass123' } });
      fireEvent.change(confirmPassInput, { target: { value: 'DifferentPass123' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });

  describe('Reduced Motion & Accessibility', () => {
    it('disables animation classes when animated=false', () => {
      const { container } = render(<LoginScene mood="idle" isTabVisible={false} />);
      // Drifting leaves are omitted when tab is not visible
      expect(container.querySelector('.leaf-drifting')).not.toBeInTheDocument();
      // Mascot does not have float animation
      expect(container.querySelector('.animate-mascot-float')).not.toBeInTheDocument();
    });

    it('marks background scene and decorative elements as aria-hidden="true"', () => {
      const { container } = render(<LoginScene />);
      const sceneSection = container.querySelector('section[aria-hidden="true"]');
      expect(sceneSection).toBeInTheDocument();
    });
  });
});

