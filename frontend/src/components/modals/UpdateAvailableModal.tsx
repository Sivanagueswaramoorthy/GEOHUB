import React, { useState, useEffect } from 'react';
import { DownloadCloud, Sparkles, ShieldCheck, ArrowRight, X, Loader2 } from 'lucide-react';
import { AppVersionManifest, triggerApkInstallation, onApkDownloadProgress } from '../../core/versionChecker';
import { APP_VERSION } from '../../config/version';

interface UpdateAvailableModalProps {
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
  const [statusMessage, setStatusMessage] = useState('Ready to download');

  useEffect(() => {
    if (!isOpen) {
      setIsDownloading(false);
      setDownloadProgress(0);
      setStatusMessage('Ready to download');
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

  const handleStartDownload = () => {
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
    : ['Routine stability improvements and general optimizations.'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full max-w-md bg-[#F6FBF7] border border-[#DAF1DE] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5 text-[#051F20]"
        style={{
          boxShadow: '0 20px 40px -15px rgba(5, 31, 32, 0.25)',
        }}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#DAF1DE] rounded-full blur-2xl opacity-60 pointer-events-none" />

        {/* Header Section */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B]/40 flex items-center justify-center text-[#235347] shadow-sm">
              <DownloadCloud size={24} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#235347] bg-[#DAF1DE] px-2 py-0.5 rounded-full border border-[#8EB69B]/30">
                  New Release
                </span>
                {isMandatory && (
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    Mandatory
                  </span>
                )}
              </div>
              <h2 id="update-modal-title" className="text-lg font-bold text-[#051F20] mt-0.5">
                GeoHub v{updateInfo.version} Available
              </h2>
            </div>
          </div>

          {!isMandatory && (
            <button
              type="button"
              onClick={onClose}
              disabled={isDownloading}
              aria-label="Close update modal"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#235347] hover:bg-[#DAF1DE] transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Version Transition Chip */}
        <div className="flex items-center justify-between bg-white/80 border border-[#DAF1DE] rounded-2xl p-3 text-xs text-[#163832]">
          <div className="flex items-center gap-2">
            <span className="text-[#235347] font-medium">Installed:</span>
            <span className="font-bold text-[#051F20] bg-[#F6FBF7] px-2 py-0.5 rounded-lg border border-[#DAF1DE]">
              v{APP_VERSION}
            </span>
          </div>
          <ArrowRight size={14} className="text-[#8EB69B]" />
          <div className="flex items-center gap-2">
            <span className="text-[#235347] font-medium">Latest:</span>
            <span className="font-bold text-[#235347] bg-[#DAF1DE] px-2 py-0.5 rounded-lg border border-[#8EB69B]/40">
              v{updateInfo.version}
            </span>
          </div>
        </div>

        {/* What's New Section */}
        <div className="bg-white/90 border border-[#DAF1DE] rounded-2xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#235347]">
            <Sparkles size={14} />
            <span>What's New in this Release</span>
          </div>
          <ul className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
            {releaseNotesList.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#163832] leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#235347] mt-1.5 shrink-0" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Telemetry info row */}
        <div className="flex items-center justify-between text-xs text-[#235347] px-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} />
            <span>Verified package ({updateInfo.file_size_mb || '6.5 MB'})</span>
          </div>
          <span>Released {updateInfo.released_at}</span>
        </div>

        {/* Download Progress Bar (shown when downloading) */}
        {isDownloading && (
          <div className="flex flex-col gap-1.5 bg-white border border-[#DAF1DE] rounded-2xl p-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-[#163832]">
              <span>{statusMessage}</span>
              <span>{Math.max(0, downloadProgress)}%</span>
            </div>
            <div className="w-full h-2 bg-[#DAF1DE] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#235347] transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(5, downloadProgress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          {!isMandatory && (
            <button
              type="button"
              onClick={onClose}
              disabled={isDownloading}
              className="flex-1 py-3 rounded-2xl border border-[#8EB69B] text-xs font-bold text-[#235347] bg-white hover:bg-[#DAF1DE]/40 transition-colors disabled:opacity-50"
            >
              Later
            </button>
          )}

          <button
            type="button"
            onClick={handleStartDownload}
            disabled={isDownloading}
            className="flex-1 py-3 rounded-2xl bg-[#235347] hover:bg-[#163832] active:bg-[#0B2B26] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-75"
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Installing...</span>
              </>
            ) : (
              <>
                <DownloadCloud size={16} />
                <span>Download & Install</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

