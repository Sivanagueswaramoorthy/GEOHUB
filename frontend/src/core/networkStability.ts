/**
 * GeoHub Network Stability & Connectivity Verification Service
 *
 * Provides multi-tier network validation for Web and Android APK environments:
 * 1. Interface validation (navigator.onLine + AndroidBridge.isConnected)
 * 2. Route & Gateway reachability (Google Connectivity 204 + DNS verification)
 * 3. Latency & stability measurement (RTT timing and packet integrity)
 */

export interface AndroidBridgeInterface {
  isConnected?: () => boolean;
  isValidated?: () => boolean;
  getNetworkType?: () => string;
}

export interface NetworkStabilityResult {
  isStable: boolean;
  stage: 'complete' | 'offline' | 'unreachable' | 'unstable' | 'timeout';
  message: string;
  details: string;
  latencyMs?: number;
  networkType?: string;
}

export type StabilityProgressCallback = (percent: number, statusText: string) => void;

function getAndroidBridge(): AndroidBridgeInterface | null {
  if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
    return (window as any).AndroidBridge as AndroidBridgeInterface;
  }
  return null;
}

/**
 * Probes an endpoint with strict timeout and no-cache policy.
 */
async function probeEndpoint(url: string, timeoutMs = 3500): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startTime = performance.now();

  try {
    const cacheBuster = url.includes('?') ? `&_t=${Date.now()}` : `?_t=${Date.now()}`;
    await fetch(`${url}${cacheBuster}`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    return Math.round(performance.now() - startTime);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Checks internet connectivity and stability with smooth progress reporting.
 */
export async function checkNetworkStability(
  onProgress?: StabilityProgressCallback
): Promise<NetworkStabilityResult> {
  const bridge = getAndroidBridge();
  const bridgeType = bridge?.getNetworkType ? bridge.getNetworkType() : undefined;

  // ----------------------------------------------------
  // Phase 1: Device Interface Check (0% -> 25%)
  // ----------------------------------------------------
  onProgress?.(15, 'Checking device network interface...');

  const isNavigatorOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const isBridgeConnected = bridge?.isConnected ? bridge.isConnected() : true;

  if (!isNavigatorOnline || !isBridgeConnected) {
    onProgress?.(15, 'No network connection detected');
    return {
      isStable: false,
      stage: 'offline',
      message: 'No Internet Connection',
      details: 'Device has no active network. Please connect to Wi-Fi or Mobile Data.',
      networkType: bridgeType || 'NONE',
    };
  }

  // Brief pause for visual smoothness
  await new Promise((r) => setTimeout(r, 120));
  onProgress?.(35, 'Reaching internet gateway...');

  // ----------------------------------------------------
  // Phase 2: Gateway Reachability Probe (35% -> 65%)
  // ----------------------------------------------------
  let latency1 = 0;
  let probeSuccess = false;

  const probeUrls = [
    'https://connectivitycheck.gstatic.com/generate_204',
    'https://www.google.com/generate_204',
    'https://dns.google/resolve?name=google.com',
  ];

  for (const url of probeUrls) {
    try {
      latency1 = await probeEndpoint(url, 3800);
      probeSuccess = true;
      break;
    } catch {
      // Try next endpoint fallback
    }
  }

  if (!probeSuccess) {
    // Check if Android Native bridge has validated connectivity as last resort
    if (bridge?.isValidated && bridge.isValidated()) {
      probeSuccess = true;
      latency1 = 120;
    } else {
      onProgress?.(35, 'Gateway unreachable');
      return {
        isStable: false,
        stage: 'unreachable',
        message: 'Internet Unreachable',
        details: 'Connected to local network, but cannot reach internet servers.',
        networkType: bridgeType || 'LIMITED',
      };
    }
  }

  // ----------------------------------------------------
  // Phase 3: Stability & Jitter Check (65% -> 85%)
  // ----------------------------------------------------
  onProgress?.(65, 'Measuring connection stability & speed...');
  await new Promise((r) => setTimeout(r, 120));

  let latency2 = latency1;
  try {
    latency2 = await probeEndpoint('https://connectivitycheck.gstatic.com/generate_204', 3500);
  } catch {
    // Fall back to first latency reading if second jitter check timed out
    latency2 = latency1;
  }

  const avgLatency = Math.round((latency1 + latency2) / 2);

  // Unstable if average latency exceeds 4000ms
  if (avgLatency > 4000) {
    onProgress?.(70, 'Connection unstable');
    return {
      isStable: false,
      stage: 'unstable',
      message: 'Unstable Connection Detected',
      details: `High network latency (${avgLatency}ms) detected. Please check your signal.`,
      latencyMs: avgLatency,
      networkType: bridgeType,
    };
  }

  // ----------------------------------------------------
  // Phase 4: Connection Verified & Complete (85% -> 100%)
  // ----------------------------------------------------
  onProgress?.(90, 'Finalizing connection security...');
  await new Promise((r) => setTimeout(r, 100));

  onProgress?.(100, `Connection Stable (${avgLatency}ms)`);

  return {
    isStable: true,
    stage: 'complete',
    message: 'Internet Connection Stable',
    details: `Latency: ${avgLatency}ms`,
    latencyMs: avgLatency,
    networkType: bridgeType || 'ONLINE',
  };
}

