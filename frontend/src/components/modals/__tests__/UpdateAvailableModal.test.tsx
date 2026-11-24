import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UpdateAvailableModal } from '../UpdateAvailableModal';
import { AppVersionManifest } from '../../../core/versionChecker';
import * as versionChecker from '../../../core/versionChecker';

const mockManifest: AppVersionManifest = {
  version: '1.6.74',
  version_code: 93,
  apk_filename: 'geohub-v1.6.74.apk',
  release_notes: 'Premium top-center push update popup UI\nOptimized minimal layout\nLive progress indicators',
  download_url: 'https://example.com/geohub-v1.6.74.apk',
  released_at: '2026-11-24',
  file_size_mb: '12.8 MB',
};

describe('UpdateAvailableModal Component', () => {
  let progressCallback: ((progress: number, msg: string) => void) | null = null;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();

    vi.spyOn(versionChecker, 'getInstalledVersion').mockReturnValue('1.6.73');
    vi.spyOn(versionChecker, 'triggerApkInstallation').mockImplementation(vi.fn());
    vi.spyOn(versionChecker, 'onApkDownloadProgress').mockImplementation((cb) => {
      progressCallback = cb;
      return () => {
        progressCallback = null;
      };
    });
  });

  it('renders nothing when isOpen is false or updateInfo is null', () => {
    const { rerender } = render(
      <UpdateAvailableModal
        isOpen={false}
        updateInfo={mockManifest}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <UpdateAvailableModal
        isOpen={true}
        updateInfo={null}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders top-center modal with version cards and release notes', () => {
    render(
      <UpdateAvailableModal
        isOpen={true}
        updateInfo={mockManifest}
        onClose={vi.fn()}
      />
    );

    // Modal dialog
    const modal = screen.getByTestId('modal-update-available');
    expect(modal).toBeInTheDocument();
    expect(modal.className).toContain('items-center');
    expect(modal.className).toContain('justify-center');

    // Headers & Badges
    expect(screen.getByText('Update Ready')).toBeInTheDocument();
    expect(screen.getByText(/GeoHub v1.6.74/i)).toBeInTheDocument();
    expect(screen.getByText('v1.6.73')).toBeInTheDocument(); // Installed
    expect(screen.getByText('v1.6.74')).toBeInTheDocument(); // Target

    // Release notes
    expect(screen.getByText(/Premium top-center push update popup UI/i)).toBeInTheDocument();
    expect(screen.getByText(/Optimized minimal layout/i)).toBeInTheDocument();
    expect(screen.getByText(/Live progress indicators/i)).toBeInTheDocument();

    // Size & Security info
    expect(screen.getByText('12.8 MB')).toBeInTheDocument();
    expect(screen.getByText('Verified Package')).toBeInTheDocument();
    expect(screen.getByText('2026-11-24')).toBeInTheDocument();

    // Action buttons for optional update
    expect(screen.getByRole('button', { name: /later/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update now/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close update modal/i })).toBeInTheDocument();
  });

  it('dismisses modal and updates storage when Later is clicked', () => {
    const handleClose = vi.fn();
    render(
      <UpdateAvailableModal
        isOpen={true}
        updateInfo={mockManifest}
        onClose={handleClose}
      />
    );

    const laterBtn = screen.getByRole('button', { name: /later/i });
    fireEvent.click(laterBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('geohub_dismissed_update_version')).toBe('1.6.74');
    expect(sessionStorage.getItem('geohub_dismissed_update_version')).toBe('1.6.74');
  });

  it('enforces mandatory mode without dismiss options', () => {
    const handleClose = vi.fn();
    render(
      <UpdateAvailableModal
        isOpen={true}
        updateInfo={mockManifest}
        isMandatory={true}
        onClose={handleClose}
      />
    );

    // Required badge present
    expect(screen.getByText('Required')).toBeInTheDocument();

    // Dismiss buttons must not exist
    expect(screen.queryByRole('button', { name: /later/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /close update modal/i })).not.toBeInTheDocument();

    // Clicking outer container does not close
    const modal = screen.getByTestId('modal-update-available');
    fireEvent.click(modal);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('triggers download and renders progress smoothly', async () => {
    render(
      <UpdateAvailableModal
        isOpen={true}
        updateInfo={mockManifest}
        onClose={vi.fn()}
      />
    );

    const updateBtn = screen.getByRole('button', { name: /update now/i });
    fireEvent.click(updateBtn);

    expect(versionChecker.triggerApkInstallation).toHaveBeenCalledWith(mockManifest.download_url);
    expect(screen.getByText(/installing.../i)).toBeInTheDocument();

    // Simulate progress updates
    act(() => {
      progressCallback?.(45, 'Downloading package... 45%');
    });

    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('Downloading package... 45%')).toBeInTheDocument();

    // Complete download
    act(() => {
      progressCallback?.(100, 'Install completed');
    });

    // Should return to ready state once download finishes (100%)
    expect(screen.getByRole('button', { name: /update now/i })).toBeInTheDocument();
  });
});
