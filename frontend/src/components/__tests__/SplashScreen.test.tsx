import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SplashScreen } from '../SplashScreen';
import * as networkModule from '../../core/networkStability';

describe('SplashScreen Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders splash screen with GeoHub branding, pastel emblem, and progress bar', () => {
    vi.spyOn(networkModule, 'checkNetworkStability').mockImplementation(() => {
      return new Promise(() => {}); // Pending check
    });

    render(<SplashScreen autoCheck={true} />);

    // Wordmark
    expect(screen.getByText('Geo')).toBeInTheDocument();
    expect(screen.getByText('Hub')).toBeInTheDocument();

    // Tagline
    expect(screen.getByText('GREEN ECO ORGANIZATION')).toBeInTheDocument();

    // Emblem image
    const emblem = screen.getByAltText('GeoHub Emblem');
    expect(emblem).toBeInTheDocument();
    expect(emblem.getAttribute('src')).toMatch(/geohub-emblem\.svg/);

    // Initial Step & Progress
    expect(screen.getByText('Checking network…')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('completes verification, shows 100%, and calls onFinish when connection is stable', async () => {
    const onFinish = vi.fn();

    vi.spyOn(networkModule, 'checkNetworkStability').mockImplementation(async (onProgress) => {
      onProgress?.(50, 'Reaching internet gateway...');
      onProgress?.(100, 'Connection Stable (42ms)');
      return {
        isStable: true,
        stage: 'complete',
        message: 'Internet Connection Stable',
        details: 'Latency: 42ms',
        latencyMs: 42,
      };
    });

    render(<SplashScreen onFinish={onFinish} autoCheck={true} />);

    // Waits until onFinish is triggered upon successful verification and dismissal
    await waitFor(
      () => {
        expect(onFinish).toHaveBeenCalled();
      },
      { timeout: 3500 }
    );
  });

  it('shows error card and DOES NOT call onFinish when network is offline', async () => {
    const onFinish = vi.fn();

    vi.spyOn(networkModule, 'checkNetworkStability').mockResolvedValue({
      isStable: false,
      stage: 'offline',
      message: 'No Internet Connection',
      details: 'Device has no active network. Please connect to Wi-Fi or Mobile Data.',
    });

    render(<SplashScreen onFinish={onFinish} autoCheck={true} />);

    await waitFor(() => {
      expect(screen.getByText('Connection Required')).toBeInTheDocument();
      expect(screen.getAllByText('No Internet Connection').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Retry Connection')).toBeInTheDocument();
    });

    // Verify onFinish is NOT called even after waiting
    await new Promise((r) => setTimeout(r, 600));
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('re-triggers network verification when clicking Retry Connection', async () => {
    const checkSpy = vi
      .spyOn(networkModule, 'checkNetworkStability')
      .mockResolvedValueOnce({
        isStable: false,
        stage: 'offline',
        message: 'No Internet Connection',
        details: 'Device has no active network.',
      })
      .mockResolvedValueOnce({
        isStable: true,
        stage: 'complete',
        message: 'Internet Connection Stable',
        details: 'Latency: 28ms',
        latencyMs: 28,
      });

    const onFinish = vi.fn();
    render(<SplashScreen onFinish={onFinish} autoCheck={true} />);

    await waitFor(() => {
      expect(screen.getByText('Retry Connection')).toBeInTheDocument();
    });
    expect(checkSpy).toHaveBeenCalledTimes(1);

    // Click Retry
    await act(async () => {
      fireEvent.click(screen.getByText('Retry Connection'));
    });

    await waitFor(
      () => {
        expect(checkSpy).toHaveBeenCalledTimes(2);
        expect(onFinish).toHaveBeenCalled();
      },
      { timeout: 3500 }
    );
  });
});
