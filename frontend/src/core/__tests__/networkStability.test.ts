import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkNetworkStability } from '../networkStability';

describe('checkNetworkStability', () => {
  const originalNavigator = globalThis.navigator;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as any).AndroidBridge;
  });

  afterEach(() => {
    globalThis.navigator = originalNavigator;
    globalThis.fetch = originalFetch;
    delete (window as any).AndroidBridge;
  });

  it('detects when device is offline via navigator.onLine and blocks progress', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false },
      configurable: true,
      writable: true,
    });

    const progressUpdates: Array<{ pct: number; msg: string }> = [];
    const result = await checkNetworkStability((pct, msg) => {
      progressUpdates.push({ pct, msg });
    });

    expect(result.isStable).toBe(false);
    expect(result.stage).toBe('offline');
    expect(result.message).toContain('No Internet Connection');
    expect(progressUpdates[0].pct).toBe(15);
  });

  it('detects when AndroidBridge reports disconnected', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: true },
      configurable: true,
      writable: true,
    });

    (window as any).AndroidBridge = {
      isConnected: () => false,
      getNetworkType: () => 'NONE',
    };

    const result = await checkNetworkStability();
    expect(result.isStable).toBe(false);
    expect(result.stage).toBe('offline');
  });

  it('returns unreachable when probe endpoints fail and native bridge is not validated', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: true },
      configurable: true,
      writable: true,
    });

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    const result = await checkNetworkStability();
    expect(result.isStable).toBe(false);
    expect(result.stage).toBe('unreachable');
    expect(result.message).toContain('Internet Unreachable');
  });

  it('successfully completes check with 100% progress when probes succeed', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: true },
      configurable: true,
      writable: true,
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 204,
      ok: true,
    } as any);

    const progressUpdates: Array<{ pct: number; msg: string }> = [];
    const result = await checkNetworkStability((pct, msg) => {
      progressUpdates.push({ pct, msg });
    });

    expect(result.isStable).toBe(true);
    expect(result.stage).toBe('complete');
    expect(result.message).toContain('Internet Connection Stable');
    expect(progressUpdates.some((u) => u.pct === 100)).toBe(true);
  });

  it('uses AndroidBridge validation fallback if fetch is blocked but native OS confirms validated', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: true },
      configurable: true,
      writable: true,
    });

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    (window as any).AndroidBridge = {
      isConnected: () => true,
      isValidated: () => true,
      getNetworkType: () => 'WIFI',
    };

    const result = await checkNetworkStability();
    expect(result.isStable).toBe(true);
    expect(result.stage).toBe('complete');
  });
});
