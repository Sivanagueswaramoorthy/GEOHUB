import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  compareSemver,
  checkForAppUpdate,
  getOrCreateDeviceId,
  getDevicePlatformInfo,
  triggerApkInstallation,
} from '../versionChecker';
import { APP_VERSION } from '../../config/version';

describe('Version Checker & OTA System', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('compareSemver', () => {
    it('correctly compares semantic version strings', () => {
      expect(compareSemver('1.5.0', '1.5.1')).toBe(1);
      expect(compareSemver('1.5.0', '1.6.0')).toBe(1);
      expect(compareSemver('1.5.0', '2.0.0')).toBe(1);
      expect(compareSemver('1.5.1', '1.5.0')).toBe(-1);
      expect(compareSemver('1.5.0', '1.5.0')).toBe(0);
      expect(compareSemver('v1.5.0', '1.5.1')).toBe(1);
    });
  });

  describe('checkForAppUpdate', () => {
    it('detects available update when server version is higher', async () => {
      const mockManifest = {
        version: '1.9.39',
        version_code: 99,
        apk_filename: 'geohub-app.apk',
        release_notes: 'Critical bug fixes',
        download_url: '/downloads/geohub-app.apk',
        min_supported_version: '1.0.0',
        released_at: '2026-11-13',
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      } as Response);

      const result = await checkForAppUpdate();
      expect(result.hasUpdate).toBe(true);
      expect(result.latestVersion).toBe('1.9.39');
      expect(result.isMandatory).toBe(false);
      expect(result.updateInfo?.release_notes).toBe('Critical bug fixes');
    });

    it('flags mandatory update when installed version is below min_supported_version', async () => {
      const mockManifest = {
        version: '2.0.0',
        version_code: 100,
        apk_filename: 'geohub-app.apk',
        release_notes: 'Major 2.0 release',
        download_url: '/downloads/geohub-app.apk',
        min_supported_version: '2.0.0', // higher than installed 1.5.0
        released_at: '2026-11-13',
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      } as Response);

      const result = await checkForAppUpdate();
      expect(result.hasUpdate).toBe(true);
      expect(result.isMandatory).toBe(true);
    });

    it('reports no update when server version matches or is lower', async () => {
      const mockManifest = {
        version: APP_VERSION,
        version_code: 7,
        apk_filename: 'geohub-app.apk',
        release_notes: 'Current version',
        download_url: '/downloads/geohub-app.apk',
        released_at: '2026-11-13',
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      } as Response);

      const result = await checkForAppUpdate();
      expect(result.hasUpdate).toBe(false);
      expect(result.updateInfo).toBeNull();
    });
  });

  describe('Device Telemetry', () => {
    it('generates and persists a unique device ID in localStorage', () => {
      const id1 = getOrCreateDeviceId();
      expect(id1).toMatch(/^dev_/);

      const id2 = getOrCreateDeviceId();
      expect(id2).toBe(id1);
    });

    it('returns platform device and OS metadata', () => {
      const info = getDevicePlatformInfo();
      expect(info.deviceName).toBeDefined();
      expect(info.osVersion).toBeDefined();
    });
  });

  describe('Native Installation Trigger', () => {
    it('invokes native AndroidBridge.downloadAndInstallApk when running inside APK', () => {
      const mockBridge = {
        downloadAndInstallApk: vi.fn(),
      };
      (window as any).AndroidBridge = mockBridge;

      triggerApkInstallation('/downloads/geohub-app.apk');
      expect(mockBridge.downloadAndInstallApk).toHaveBeenCalled();

      delete (window as any).AndroidBridge;
    });
  });
});

