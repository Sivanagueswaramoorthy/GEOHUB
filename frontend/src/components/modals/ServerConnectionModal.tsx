import React, { useState, useEffect } from 'react';
import { Radio, Wifi, Globe, RefreshCw, CheckCircle2, AlertCircle, X, Shield, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiClient from '../../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ServerConnectionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    syncStatus,
    lastSyncedAt,
    serverUrl,
    setServerUrl,
    refreshCloudData,
    showToast,
  } = useApp();

  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; latencyMs?: number; message?: string } | null>(null);
  const [activeClientsCount, setActiveClientsCount] = useState<number | null>(null);

  const NGROK_TUNNEL_URL = 'https://roping-udder-unsaid.ngrok-free.dev/api';
  const LOCAL_LAN_URL = 'http://10.10.118.212:8000/api';
  const LOCALHOST_URL = '/api';

  useEffect(() => {
    if (isOpen) {
      setInputUrl(serverUrl);
      handleTest(serverUrl);
      fetchDiagnostics();
    }
  }, [isOpen, serverUrl]);

  const fetchDiagnostics = async () => {
    try {
      const res = await apiClient.getSyncStatus();
      if (res && typeof res.active_devices_connected === 'number') {
        setActiveClientsCount(res.active_devices_connected);
      }
    } catch {
      setActiveClientsCount(null);
    }
  };

  const handleTest = async (urlToTest?: string) => {
    setTesting(true);
    const target = urlToTest || inputUrl;
    try {
      const startTime = performance.now();
      const testEndpoint = target.endsWith('/api')
        ? `${target.slice(0, -4)}/health`
        : `${target}/health`;

      const res = await fetch(testEndpoint, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.ok) {
        setTestResult({ ok: true, latencyMs, message: 'Server Reachable' });
      } else {
        setTestResult({ ok: false, message: `HTTP ${res.status}` });
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: err?.message || 'Connection Refused' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const clean = inputUrl.trim().replace(/\/+$/, '');
    if (!clean) {
      showToast('Please enter a valid server URL', 'error');
      return;
    }
    setServerUrl(clean);
    showToast(`✓ Server updated: ${clean}`, 'success');
    onClose();
  };

  const handleSelectPreset = (url: string) => {
    setInputUrl(url);
    handleTest(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      style={{ zIndex: 9998 }}
    >
      <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl w-full max-w-md p-5 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE] text-[#235347] flex items-center justify-center">
              <Radio size={22} strokeWidth={2.4} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#051F20]">Cross-Device Sync & Server</h3>
              <p className="text-xs text-[#235347]">Configure server endpoint and real-time multi-device sync</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
            aria-label="Close server modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Diagnostics Pill */}
        <div className="p-3.5 rounded-2xl border border-[#DAF1DE] bg-[#F6FBF7] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#051F20]">Connection State:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  syncStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-500 animate-spin'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-bold capitalize text-[#163832]">
                {syncStatus === 'connected' ? 'Live Connected' : syncStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#52665C]">
            <span>Latency / Health:</span>
            {testing ? (
              <span className="font-mono text-xs text-amber-600 font-semibold">Testing...</span>
            ) : testResult ? (
              <span
                className={`font-mono text-xs font-semibold ${
                  testResult.ok ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {testResult.ok ? `${testResult.latencyMs}ms (${testResult.message})` : testResult.message}
              </span>
            ) : (
              <span className="font-mono text-xs text-gray-400">Untested</span>
            )}
          </div>

          {activeClientsCount !== null && (
            <div className="flex items-center justify-between text-xs text-[#52665C]">
              <span>Active Devices on Stream:</span>
              <span className="font-bold text-[#163832]">{activeClientsCount} connected</span>
            </div>
          )}

          {lastSyncedAt && (
            <div className="flex items-center justify-between text-[11px] text-[#52665C]">
              <span>Last Synchronized:</span>
              <span>{lastSyncedAt.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Presets */}
        <div>
          <label className="block text-xs font-bold text-[#163832] mb-1.5">Quick Server Presets</label>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleSelectPreset(NGROK_TUNNEL_URL)}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                inputUrl === NGROK_TUNNEL_URL
                  ? 'border-[#163832] bg-[#DAF1DE]/40'
                  : 'border-[#DAF1DE] bg-white hover:bg-gray-50'
              }`}
            >
              <Globe size={16} className="text-[#235347] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#051F20]">Public Tunnel (Cloud Sync)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-[#52665C] truncate font-mono">{NGROK_TUNNEL_URL}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset(LOCAL_LAN_URL)}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                inputUrl === LOCAL_LAN_URL
                  ? 'border-[#163832] bg-[#DAF1DE]/40'
                  : 'border-[#DAF1DE] bg-white hover:bg-gray-50'
              }`}
            >
              <Wifi size={16} className="text-[#235347] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#051F20]">Local Wi-Fi Network (LAN)</span>
                <p className="text-[11px] text-[#52665C] truncate font-mono">{LOCAL_LAN_URL}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Custom Server Input */}
        <div>
          <label className="block text-xs font-bold text-[#163832] mb-1">
            Server API Endpoint URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://your-server.com/api"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#8EB69B] bg-white text-xs font-mono text-[#051F20] font-medium focus:outline-none focus:ring-2 focus:ring-[#163832]/20"
            />
            <button
              type="button"
              onClick={() => handleTest()}
              disabled={testing}
              className="px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#163832] text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Test connection"
            >
              <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
              <span>Test</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-[#DAF1DE] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={async () => {
              await refreshCloudData();
              await fetchDiagnostics();
            }}
            className="px-3 py-2 rounded-xl border border-[#DAF1DE] bg-white hover:bg-gray-50 text-[#163832] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Force Sync</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 size={14} />
              <span>Apply & Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ServerConnectionModal;
