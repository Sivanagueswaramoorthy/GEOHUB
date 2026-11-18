import { APP_VERSION, APP_VERSION_CODE } from '../config/version';
import { resolveApiBaseUrl } from '../api/client';

export interface AppVersionManifest {
  version: string;
  version_code: number;
  apk_filename: string;
  release_notes: string;
  download_url: string;
  min_supported_version?: string;
  released_at: string;
  file_size_bytes?: number;
  file_size_mb?: string;
  sha256?: string;
}

export interface CheckUpdateResult {
  hasUpdate: boolean;
  updateInfo: AppVersionManifest | null;
  isMandatory: boolean;
  currentVersion: string;
  latestVersion: string;
}

/**
 * Compares two semantic version strings (e.g. "1.5.0" vs "1.5.1").
 * Returns:
 *   1 if v2 > v1 (newer version available)
 *  -1 if v1 > v2
 *   0 if identical
 */
export function compareSemver(v1: string, v2: string): number {
  const parse = (v: string) =>
    v
      .replace(/^v/i, '')
      .split('.')
      .map((part) => parseInt(part, 10) || 0);

  const [maj1, min1, pat1] = parse(v1);
  const [maj2, min2, pat2] = parse(v2);

  if (maj2 > maj1) return 1;
  if (maj2 < maj1) return -1;
  if (min2 > min1) return 1;
  if (min2 < min1) return -1;
  if (pat2 > pat1) return 1;
  if (pat2 < pat1) return -1;
  return 0;
}

export const FALLBACK_VERSION_URL =
  'https://raw.githubusercontent.com/Sivanagueswaramoorthy/GEOHUB/master/backend/app_version.json';
export const CDN_APK_URL =
  'https://raw.githubusercontent.com/Sivanagueswaramoorthy/GEOHUB/master/geohub-app.apk';

/**
 * Queries the backend for latest version manifest and checks if an update is available.
 * Uses a resilient 2-tier check: primary API endpoint followed by high-speed global CDN fallback.
 */
export async function checkForAppUpdate(): Promise<CheckUpdateResult> {
  const baseUrl = resolveApiBaseUrl();

  const parseAndEvaluate = (data: AppVersionManifest): CheckUpdateResult => {
    const isNewer = compareSemver(APP_VERSION, data.version) > 0;
    const isMandatory = Boolean(
      data.min_supported_version && compareSemver(APP_VERSION, data.min_supported_version) > 0
    );

    // If download_url is relative, ensure a robust direct fallback
    const resolvedDownloadUrl =
      data.download_url && !data.download_url.startsWith('http')
        ? CDN_APK_URL
        : data.download_url || CDN_APK_URL;

    return {
      hasUpdate: isNewer,
      updateInfo: isNewer ? { ...data, download_url: resolvedDownloadUrl } : null,
      isMandatory,
      currentVersion: APP_VERSION,
      latestVersion: data.version,
    };
  };

  const cacheBuster = `?_cb=${Date.now()}`;

  // Tier 1: Primary API server check
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${baseUrl}/app/version${cacheBuster}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: AppVersionManifest = await res.json();
      return parseAndEvaluate(data);
    }
  } catch {
    // Fall through to Tier 2 CDN check
  }

  // Tier 2: Global GitHub CDN fallback check (with cache busting)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${FALLBACK_VERSION_URL}${cacheBuster}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: AppVersionManifest = await res.json();
      return parseAndEvaluate(data);
    }
  } catch {
    // Both tiers exhausted
  }

  return {
    hasUpdate: false,
    updateInfo: null,
    isMandatory: false,
    currentVersion: APP_VERSION,
    latestVersion: APP_VERSION,
  };
}

/**
 * Returns or generates a persistent device UUID.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_side_device';
  let deviceId = localStorage.getItem('geohub_device_uuid');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('geohub_device_uuid', deviceId);
  }
  return deviceId;
}

/**
 * Detects device hardware model or browser platform.
 */
export function getDevicePlatformInfo(): { deviceName: string; osVersion: string } {
  if (typeof navigator === 'undefined') {
    return { deviceName: 'Unknown Device', osVersion: 'Unknown OS' };
  }
  const ua = navigator.userAgent;
  let deviceName = 'Android Device';
  let osVersion = 'Android';

  if (ua.includes('GeoHubMobileApp')) {
    deviceName = 'GeoHub Mobile Client';
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    deviceName = 'Apple Mobile';
    osVersion = 'iOS';
  } else if (/Windows/.test(ua)) {
    deviceName = 'Desktop PC';
    osVersion = 'Windows';
  } else if (/Macintosh/.test(ua)) {
    deviceName = 'Mac';
    osVersion = 'macOS';
  } else if (/Linux/.test(ua)) {
    deviceName = 'Linux Workstation';
    osVersion = 'Linux';
  }

  return { deviceName, osVersion };
}

/**
 * Registers client device telemetry with the backend.
 */
export async function registerDeviceTelemetry(userId?: string): Promise<boolean> {
  const baseUrl = resolveApiBaseUrl();
  const deviceId = getOrCreateDeviceId();
  const { deviceName, osVersion } = getDevicePlatformInfo();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${baseUrl}/app/device-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: deviceId,
        user_id: userId || null,
        device_name: deviceName,
        os_version: osVersion,
        app_version: APP_VERSION,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Triggers APK download and native package installation.
 */
export function triggerApkInstallation(rawDownloadUrl: string): void {
  const baseUrl = resolveApiBaseUrl();
  let fullUrl = rawDownloadUrl;

  if (!rawDownloadUrl.startsWith('http://') && !rawDownloadUrl.startsWith('https://')) {
    const isApk =
      typeof navigator !== 'undefined' &&
      (navigator.userAgent.includes('GeoHubMobileApp') ||
        (typeof window !== 'undefined' && window.location.hostname === 'appassets.androidplatform.net'));

    if (isApk || baseUrl.includes('onrender.com')) {
      fullUrl = CDN_APK_URL;
    } else {
      const origin = baseUrl.replace(/\/api$/, '');
      fullUrl = `${origin}${rawDownloadUrl.startsWith('/') ? '' : '/'}${rawDownloadUrl}`;
    }
  }

  // Check for native Android bridge
  if (typeof window !== 'undefined' && (window as any).AndroidBridge?.downloadAndInstallApk) {
    (window as any).AndroidBridge.downloadAndInstallApk(fullUrl);
    return;
  }

  // Web / fallback: Direct browser download trigger
  if (typeof window !== 'undefined') {
    const a = document.createElement('a');
    a.href = fullUrl;
    a.download = 'geohub-app.apk';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/**
 * Subscribes to native APK download progress events.
 */
export function onApkDownloadProgress(
  callback: (progress: number, message: string) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  (window as any).__onApkDownloadProgress = callback;
  return () => {
    delete (window as any).__onApkDownloadProgress;
  };
}

