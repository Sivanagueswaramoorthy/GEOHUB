import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  X,
  Loader2,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import {
  AppVersionManifest,
  triggerApkInstallation,
  onApkDownloadProgress,
  getInstalledVersion,
} from '../../core/versionChecker';

export interface UpdateAvailableModalProps {
  isOpen: boolean;
  updateInfo: AppVersionManifest | null;
  isMandatory?: boolean;
  onClose: () => void;
}

export const UpdateAvailableModal: React.FC<UpdateAvailableModalProps> = ({
  isOpen,
  updateInfo,
  isMandatory = false,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready to install');

  useEffect(() => {
    if (!isOpen) {
      setIsDownloading(false);
      setDownloadProgress(0);
      setStatusMessage('Ready to install');
      return;
    }

    const unsubscribe = onApkDownloadProgress((progress, message) => {
      setDownloadProgress(progress);
      setStatusMessage(message);
      if (progress === 100 || progress < 0) {
        setIsDownloading(false);
      }
    });

    return unsubscribe;
  }, [isOpen]);

  if (!isOpen || !updateInfo) return null;

  const handleDismiss = () => {
    if (updateInfo?.version) {
      try {
        localStorage.setItem('geohub_dismissed_update_version', updateInfo.version);
        sessionStorage.setItem('geohub_dismissed_update_version', updateInfo.version);
      } catch {}
    }
    onClose();
  };

  const handleStartDownload = () => {
    if (updateInfo?.version) {
      try {
        localStorage.setItem('geohub_dismissed_update_version', updateInfo.version);
        sessionStorage.setItem('geohub_dismissed_update_version', updateInfo.version);
      } catch {}
    }
    setIsDownloading(true);
    setDownloadProgress(10);
    setStatusMessage('Initiating download...');
    triggerApkInstallation(updateInfo.download_url);
  };

  const releaseNotesList = updateInfo.release_notes
    ? updateInfo.release_notes
        .split('\n')
        .map((line) => line.replace(/^[\s*\-•]+/, '').trim())
        .filter(Boolean)
    : ['Routine stability improvements and UI optimizations.'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
      data-testid="modal-update-available"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-10 sm:pt-16 bg-[#051F20]/65 backdrop-blur-md select-none transition-all duration-300 animate-fadeIn overflow-y-auto"
      style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      onClick={(e) => {
        if (!isMandatory && !isDownloading && e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_rgba(5,31,32,0.25)] border border-[#DAF1DE] relative overflow-hidden flex flex-col gap-4 text-[#051F20]"
        style={{
          animation: 'topModalEnter 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Soft Ambient Radiance */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#DAF1DE] rounded-full blur-2xl opacity-70 pointer-events-none" />
        <div className="absolute -top-8 -left-8 w-28 h-28 bg-[#8EB69B]/20 rounded-full blur-xl opacity-60 pointer-events-none" />

        {/* Top Header Pill Bar */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Update Ready</span>
            </span>

            {isMandatory && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D9534F]/10 text-[#D9534F] border border-[#D9534F]/30">
                Required
              </span>
            )}
          </div>

          {!isMandatory && (
            <button
              type="button"
              onClick={handleDismiss}
              disabled={isDownloading}
              aria-label="Close update modal"
              className="w-7 h-7 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Hero Section: Title & Icon */}
        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]/40 flex items-center justify-center shadow-xs shrink-0">
            <Zap size={22} className="text-[#163832]" strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <h2 id="update-modal-title" className="text-base sm:text-lg font-bold text-[#051F20] truncate leading-snug">
              GeoHub v{updateInfo.version}
            </h2>
            <p className="text-xs text-[#235347] font-medium truncate">
              New build with features & stability updates
            </p>
          </div>
        </div>

        {/* Version Leap Card */}
        <div className="p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#235347] text-[11px] font-medium">Installed</span>
            <span className="font-bold text-[#051F20] bg-white px-2 py-0.5 rounded-lg border border-[#DAF1DE]">
              v{getInstalledVersion()}
            </span>
          </div>

          <ArrowRight size={13} className="text-[#8EB69B] shrink-0" />

          <div className="flex items-center gap-1.5">
            <span className="text-[#235347] text-[11px] font-medium">Target</span>
            <span className="font-bold text-[#163832] bg-[#DAF1DE] px-2 py-0.5 rounded-lg border border-[#8EB69B]/50">
              v{updateInfo.version}
            </span>
          </div>
        </div>

        {/* What's New Box */}
        <div className="p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#235347]">
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#163832]" />
              <span>Release Notes</span>
            </span>
            <span className="text-[10px] text-[#8EB69B] lowercase font-normal">
              {updateInfo.file_size_mb || '10.4 MB'}
            </span>
          </div>

          <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {releaseNotesList.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#051F20] leading-snug">
                <CheckCircle2 size={13} className="text-[#163832] mt-0.5 shrink-0" />
                <span className="flex-1">{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Security & Verification Metadata */}
        <div className="flex items-center justify-between text-[11px] text-[#235347] px-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#163832]" />
            <span>Verified Package</span>
          </div>
          <span>{updateInfo.released_at}</span>
        </div>

        {/* Download Progress (if active) */}
        {isDownloading && (
          <div className="p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-semibold text-[#163832]">
              <span className="truncate">{statusMessage}</span>
              <span className="font-mono">{Math.max(0, downloadProgress)}%</span>
            </div>
            <div className="w-full h-2 bg-[#DAF1DE] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#163832] to-[#235347] rounded-full transition-all duration-300"
                style={{ width: `${Math.max(8, downloadProgress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#DAF1DE]/70">
          {!isMandatory && (
            <button
              type="button"
              onClick={handleDismiss}
              disabled={isDownloading}
              className="flex-1 h-11 rounded-2xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] transition-colors cursor-pointer disabled:opacity-40"
            >
              Later
            </button>
          )}

          <button
            type="button"
            onClick={handleStartDownload}
            disabled={isDownloading}
            className="flex-1 h-11 rounded-2xl bg-[#163832] hover:bg-[#0B2B26] active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-75"
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Installing...</span>
              </>
            ) : (
              <>
                <DownloadCloud size={16} />
                <span>Update Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateAvailableModal;
