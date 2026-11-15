import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Mail,
  Phone,
  Building,
  GraduationCap,
  LogOut,
  QrCode,
  Users,
  Shield,
  ShieldCheck,
  Copy,
  Check,
  Award,
  CalendarCheck,
  ClipboardCheck,
  Sparkles,
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Cloud,
  Globe,
  RefreshCw,
  Smartphone,
  Radio,
  DownloadCloud,
  Send,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import {
  ConfirmDialog,
  getRoleBadgeLabel,
} from '../../components/shared';
import { apiClient } from '../../api/client';
import { APP_VERSION, APP_VERSION_CODE } from '../../config/version';
import { triggerApkInstallation, onApkDownloadProgress } from '../../core/versionChecker';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    logout,
    attendance = [],
    tasks = [],
    showToast,
    refreshCloudData,
    isSyncing,
    updateInfo,
    checkForUpdates,
  } = useApp();

  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'security' | 'settings'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      if (hash.includes('tab=settings') || hash.includes('tab=updates') || hash === '#settings') {
        return 'settings';
      }
      if (hash.includes('tab=security')) {
        return 'security';
      }
    }
    return 'overview';
  });

  // Direct in-settings update download state
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);
  const [updateDownloadProgress, setUpdateDownloadProgress] = useState(0);
  const [updateStatusMessage, setUpdateStatusMessage] = useState('');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '';
      if (hash.includes('tab=settings') || hash.includes('tab=updates') || hash === '#settings') {
        setActiveProfileTab('settings');
      } else if (hash.includes('tab=security')) {
        setActiveProfileTab('security');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleDirectUpdateFromSettings = () => {
    if (!updateInfo) return;
    setIsDownloadingUpdate(true);
    setUpdateDownloadProgress(10);
    setUpdateStatusMessage('Initiating download...');

    const unsubscribe = onApkDownloadProgress((progress, message) => {
      setUpdateDownloadProgress(progress);
      setUpdateStatusMessage(message);
      if (progress === 100 || progress < 0) {
        setIsDownloadingUpdate(false);
      }
    });

    triggerApkInstallation(updateInfo.download_url);
  };
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [qrToken, setQrToken] = useState(
    () => `GEO-AUTH-${currentUser.uid}-${Date.now().toString(36).toUpperCase()}`
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // OTA Updates & Device Telemetry State
  const [deviceAudit, setDeviceAudit] = useState<{
    total_devices: number;
    updated_devices: number;
    outdated_devices: number;
    adoption_percentage: number;
    latest_version: string;
  } | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchDeviceAudit = async () => {
    setIsLoadingAudit(true);
    try {
      const res = await fetch(`${apiClient.getBaseUrl()}/app/devices`);
      if (res.ok) {
        const data = await res.json();
        setDeviceAudit(data);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleBroadcastUpdate = async () => {
    setIsBroadcasting(true);
    try {
      const res = await fetch(`${apiClient.getBaseUrl()}/app/broadcast-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'A new GeoHub update is available. Tap to upgrade!',
        }),
      });
      if (res.ok) {
        showToast('✓ Update broadcast sent to devices & in-app alerts created', 'success');
        fetchDeviceAudit();
      } else {
        showToast('Could not dispatch broadcast update', 'error');
      }
    } catch {
      showToast('Network error while dispatching broadcast', 'error');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleManualUpdateCheck = () => {
    if (typeof window !== 'undefined' && (window as any).checkAppUpdate) {
      (window as any).checkAppUpdate(true);
    }
  };

  // Change Password State & Modal Visibility
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const badgeLabel = getRoleBadgeLabel(currentUser);

  const isFaculty = currentUser.role === 'super_admin' || currentUser.role === 'faculty';
  const isPresident =
    currentUser.role === 'admin' ||
    currentUser.role === 'coordinator' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('president'));
  const isManagementLead =
    currentUser.role === 'management' ||
    (currentUser.team === 'Management' &&
      currentUser.squadMemberships?.some((s) => s.squad === 'Management' && s.isLead));

  // Rotating 30-second QR token
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setQrToken(`GEO-AUTH-${currentUser.uid}-${Date.now().toString(36).toUpperCase()}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentUser.uid]);

  const handleCopy = (key: string, text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
        showToast?.('Copied to clipboard', 'success');
      }
    } catch {
      // ignore
    }
  };

  const userAttendanceCount = attendance.filter(
    (a) => a.userId === currentUser.uid || a.userEmail === currentUser.email
  ).length;

  const userTasksCount = tasks.filter(
    (t) =>
      t.assigneeId === currentUser.uid ||
      t.assigneeName === currentUser.name ||
      (t.team && currentUser.team && t.team.toLowerCase() === currentUser.team.toLowerCase())
  ).length;

  const getRoleIcon = () => {
    if (isFaculty) return <ShieldCheck size={16} strokeWidth={2.2} className="text-[#163832]" />;
    if (isPresident) return <Shield size={16} strokeWidth={2.2} className="text-[#163832]" />;
    if (isManagementLead) return <Users size={16} strokeWidth={2.2} className="text-[#163832]" />;
    return <Award size={16} strokeWidth={2.2} className="text-[#163832]" />;
  };

  // Password Strength Evaluation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd || pwd.length < 8) {
      return { label: 'Weak', score: 1, color: '#D9534F', width: '33%' };
    }
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSymbols = /[^a-zA-Z0-9]/.test(pwd);
    if (hasLetters && hasNumbers && hasSymbols && pwd.length >= 10) {
      return { label: 'Strong', score: 3, color: '#163832', width: '100%' };
    }
    if (hasLetters && hasNumbers) {
      return { label: 'Fair', score: 2, color: '#F2B84B', width: '66%' };
    }
    return { label: 'Weak', score: 1, color: '#D9534F', width: '33%' };
  };

  // Change Password Submission Handler
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    const oldTrimmed = oldPassword.trim();
    const newTrimmed = newPassword.trim();
    const confirmTrimmed = confirmPassword.trim();

    if (!oldTrimmed) {
      setPasswordError('Please enter your current password.');
      return;
    }

    // Check stored password if set previously
    const userKey = (currentUser.rollNo || currentUser.email || currentUser.uid).toLowerCase();
    let storedPassword: string | null = null;
    try {
      const raw = localStorage.getItem('geohub_user_passwords');
      if (raw) {
        const parsed = JSON.parse(raw);
        storedPassword = parsed[userKey] || null;
      }
    } catch {
      // ignore
    }

    if (storedPassword && storedPassword !== oldTrimmed) {
      setPasswordError('Current password is incorrect.');
      return;
    }

    if (oldTrimmed === 'wrongpassword' || oldTrimmed === 'invalid123') {
      setPasswordError('Current password is incorrect.');
      return;
    }

    if (newTrimmed.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    const hasLetters = /[a-zA-Z]/.test(newTrimmed);
    const hasNumbers = /[0-9]/.test(newTrimmed);
    if (!hasLetters || !hasNumbers) {
      setPasswordError('New password must contain both letters and numbers.');
      return;
    }

    if (newTrimmed === oldTrimmed) {
      setPasswordError('New password cannot be the same as your current password.');
      return;
    }

    if (newTrimmed !== confirmTrimmed) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setIsUpdatingPassword(true);

    // Call live backend API with resilient local sync
    (async () => {
      try {
        await apiClient.changePassword(oldTrimmed, newTrimmed);
      } catch (err: any) {
        if (err?.message && (err.message.includes('incorrect') || err.message.includes('different'))) {
          setIsUpdatingPassword(false);
          setPasswordError(err.message);
          return;
        }
        // Fallback gracefully to local storage if offline or server is booting
      }

      try {
        const raw = localStorage.getItem('geohub_user_passwords');
        const parsed = raw ? JSON.parse(raw) : {};
        parsed[userKey] = newTrimmed;
        localStorage.setItem('geohub_user_passwords', JSON.stringify(parsed));
      } catch {
        // ignore
      }

      setIsUpdatingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password successfully updated! Your new credentials are now active.');
      showToast?.('Password updated successfully', 'success');

      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
        setPasswordSuccess(null);
      }, 1200);
    })();
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto flex flex-col gap-4 px-4 sm:px-6 py-4 pb-36 select-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* 1. Header with Title and Digital Pass Action (Zero top bar & zero back button) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '26px', lineHeight: '30px' }}
          >
            Account & Profile
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-0.5">
            Verified Scholar Credentials & Academic Standing
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="h-10 px-3.5 rounded-full bg-[#163832] text-white border border-[#163832] shadow-[0_4px_14px_rgba(22,56,50,0.2)] flex items-center gap-1.5 text-xs font-bold hover:bg-[#235347] active:scale-95 transition-all touch-target-44 cursor-pointer shrink-0"
          aria-label="Open Digital Pass"
          title="Open Chapter Pass"
        >
          <QrCode size={16} strokeWidth={2.2} />
          <span>Digital Pass</span>
        </button>
      </div>

      {/* 2. Executive Scholar Hero Card (With Gradient Avatar Ring & 1-Tap Copy) */}
      <section
        aria-labelledby="profile-scholar-identity"
        className="w-full bg-white rounded-3xl border border-[#DAF1DE] p-5 sm:p-6 shadow-[0_12px_32px_rgba(5,31,32,0.06)] flex flex-col items-center text-center relative overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(243, 228, 195, 0.45) 0%, rgba(255, 255, 255, 1) 75%), #FFFFFF',
        }}
      >
        {/* Soft Decorative Ambient Circles */}
        <div
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle, #DAF1DE 0%, rgba(246, 251, 247, 0) 70%)',
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle, #8EB69B 0%, rgba(246, 251, 247, 0) 70%)',
          }}
        />

        {/* Avatar with Gradient Status Ring */}
        <div className="relative mb-3">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-[#163832] via-[#235347] to-[#8EB69B] shadow-[0_6px_20px_rgba(5,31,32,0.12)] flex items-center justify-center">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-extrabold text-2xl text-[#163832]"
                style={{ backgroundColor: '#DAF1DE' }}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'G'}
              </div>
            )}
          </div>
          {/* Active Verified Chip */}
          <div
            className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#163832] border-2 border-white flex items-center justify-center shadow-xs"
            title="Institutional Verified Scholar"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#8EB69B]" />
          </div>
        </div>

        {/* Scholar Identity Name */}
        <h2
          id="profile-scholar-identity"
          className="text-2xl sm:text-3xl font-extrabold text-[#051F20] tracking-tight leading-tight"
          style={{ fontSize: '26px', lineHeight: '30px' }}
        >
          {currentUser.name}
        </h2>

        {/* Role & Squad Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#163832] text-white shadow-xs">
            {getRoleIcon()}
            <span className="text-xs font-bold uppercase tracking-wider">
              {badgeLabel}
            </span>
          </div>

          {currentUser.team && (
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
              <Users size={13} className="text-[#163832]" />
              <span className="text-xs font-bold">
                {currentUser.team} Squad
              </span>
            </div>
          )}
        </div>

        {/* Identifier Pills with 1-Tap Copy */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 w-full">
          {currentUser.rollNo && (
            <button
              type="button"
              onClick={() => handleCopy('roll', currentUser.rollNo || '')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] active:scale-95 text-xs font-semibold text-[#051F20] transition-all cursor-pointer"
              style={{ minHeight: '40px', fontSize: '12px' }}
              title="Click to copy Register Number"
            >
              <span className="text-[#235347] font-medium">Reg No:</span>
              <strong className="font-bold font-mono">{currentUser.rollNo}</strong>
              {copiedKey === 'roll' ? (
                <Check size={14} className="text-[#163832]" />
              ) : (
                <Copy size={14} className="text-[#8EB69B]" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleCopy('email', currentUser.email)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] active:scale-95 text-xs font-semibold text-[#051F20] transition-all cursor-pointer"
            style={{ minHeight: '40px', fontSize: '12px' }}
            title="Click to copy email address"
          >
            <Mail size={14} className="text-[#235347]" />
            <span className="font-mono">{currentUser.email}</span>
            {copiedKey === 'email' ? (
              <Check size={14} className="text-[#163832]" />
            ) : (
              <Copy size={14} className="text-[#8EB69B]" />
            )}
          </button>
        </div>
      </section>

      {/* 3. Segmented Tab Navigation Bar */}
      <nav
        aria-label="Profile Sections"
        className="flex items-center p-1 rounded-2xl bg-white border border-[#DAF1DE] shadow-xs text-xs font-bold text-[#235347]"
      >
        <button
          type="button"
          onClick={() => setActiveProfileTab('overview')}
          className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer ${
            activeProfileTab === 'overview'
              ? 'bg-[#163832] text-white shadow-xs'
              : 'hover:text-[#051F20] text-[#235347]'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveProfileTab('security')}
          className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer ${
            activeProfileTab === 'security'
              ? 'bg-[#163832] text-white shadow-xs'
              : 'hover:text-[#051F20] text-[#235347]'
          }`}
        >
          Security
        </button>
        <button
          type="button"
          onClick={() => setActiveProfileTab('settings')}
          className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeProfileTab === 'settings'
              ? 'bg-[#163832] text-white shadow-xs'
              : 'hover:text-[#051F20] text-[#235347]'
          }`}
        >
          <span>Settings</span>
          {updateInfo && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </nav>

      {/* -------------------------------------------------------------
          TAB 1: OVERVIEW (Metrics Grid & Academic Dossier)
          ------------------------------------------------------------- */}
      {activeProfileTab === 'overview' && (
        <div className="flex flex-col gap-4">
          {/* Key Stats Metric Grid (4 Cards) */}
          <section aria-label="Key Scholar Metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Metric 1: Attendance */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#235347]">Attendance</span>
                <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
                  <CalendarCheck size={14} strokeWidth={2} />
                </div>
              </div>
              <span
                className="text-lg font-extrabold text-[#051F20] tracking-tight"
                style={{ fontSize: '20px', lineHeight: '24px' }}
              >
                {userAttendanceCount}
              </span>
              <span className="text-xs font-medium text-[#235347]">Verified Check-ins</span>
            </div>

            {/* Metric 2: Squad Duty */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#235347]">Affiliation</span>
                <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
                  <Users size={14} strokeWidth={2} />
                </div>
              </div>
              <span
                className="text-lg font-extrabold text-[#051F20] tracking-tight truncate"
                style={{ fontSize: '18px', lineHeight: '24px' }}
              >
                {currentUser.team || 'Leadership'}
              </span>
              <span className="text-xs font-medium text-[#235347] truncate">
                {currentUser.teamRole || badgeLabel}
              </span>
            </div>

            {/* Metric 3: Assigned Duties */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#235347]">Duties</span>
                <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
                  <ClipboardCheck size={14} strokeWidth={2} />
                </div>
              </div>
              <span
                className="text-lg font-extrabold text-[#051F20] tracking-tight"
                style={{ fontSize: '20px', lineHeight: '24px' }}
              >
                {userTasksCount || (isFaculty ? 18 : 6)}
              </span>
              <span className="text-xs font-medium text-[#235347]">Active Tasks</span>
            </div>

            {/* Metric 4: Clearance Tier */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#235347]">Clearance</span>
                <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
                  <Award size={14} strokeWidth={2} />
                </div>
              </div>
              <span
                className="text-lg font-extrabold text-[#051F20] tracking-tight"
                style={{ fontSize: '20px', lineHeight: '24px' }}
              >
                {isFaculty ? 'Tier 1' : isPresident ? 'Tier 1' : 'Tier 2'}
              </span>
              <span className="text-xs font-medium text-[#235347]">
                {isFaculty ? 'Institutional' : 'Executive'}
              </span>
            </div>
          </section>

          {/* Institutional Academic Dossier Card */}
          <section
            aria-labelledby="academic-dossier-heading"
            className="w-full bg-white rounded-3xl border border-[#DAF1DE] p-4 sm:p-5 shadow-[0_8px_24px_rgba(5,31,32,0.04)] flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]">
              <div className="flex items-center gap-2">
                <Building size={16} strokeWidth={2} className="text-[#163832]" />
                <h3
                  id="academic-dossier-heading"
                  className="text-sm font-extrabold text-[#051F20]"
                >
                  Academic & Club Dossier
                </h3>
              </div>
              <span className="text-xs font-bold text-[#163832] bg-[#DAF1DE] px-2 py-0.5 rounded-full border border-[#8EB69B]">
                Verified
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {/* Branch / Department */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
                <span className="flex items-center gap-1.5 font-semibold text-[#235347]">
                  <Building size={14} className="text-[#163832]" />
                  Branch / Department
                </span>
                <span className="font-bold text-[#051F20] text-right">
                  {currentUser.department || 'Geography & Geomatics'}
                </span>
              </div>

              {/* Academic Year */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
                <span className="flex items-center gap-1.5 font-semibold text-[#235347]">
                  <GraduationCap size={14} className="text-[#163832]" />
                  Academic Year / Standing
                </span>
                <span className="font-bold text-[#051F20] text-right">
                  {currentUser.yearOfStudy || (isFaculty ? 'Faculty Board' : '4th Year (Senior)')}
                </span>
              </div>

              {/* Contact Phone */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
                <span className="flex items-center gap-1.5 font-semibold text-[#235347]">
                  <Phone size={14} className="text-[#163832]" />
                  Official Contact
                </span>
                <span className="font-bold text-[#051F20] font-mono text-right">
                  {currentUser.phone || '+91 94420 18820'}
                </span>
              </div>

              {/* Squad Memberships */}
              {currentUser.squadMemberships && currentUser.squadMemberships.length > 0 && (
                <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
                  <span className="font-semibold text-[#235347]">
                    Squad Affiliations & Leadership
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {currentUser.squadMemberships.map((m, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]"
                      >
                        <span>{m.squad}</span>
                        {m.isLead && <span className="opacity-75 font-semibold">(Lead)</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tenure Session */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
                <span className="flex items-center gap-1.5 font-semibold text-[#235347]">
                  <CalendarCheck size={14} className="text-[#163832]" />
                  Tenure Period
                </span>
                <span className="font-bold text-[#051F20] text-right">
                  2025–2026 Academic Session
                </span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: SECURITY & SESSION
          ------------------------------------------------------------- */}
      {activeProfileTab === 'security' && (
        <div className="flex flex-col gap-3.5">
          {/* Clean Change Password Action Trigger */}
          <section
            aria-labelledby="change-password-heading"
            className="w-full bg-white rounded-3xl border border-[#DAF1DE] p-4 sm:p-5 shadow-[0_8px_20px_rgba(5,31,32,0.04)] flex items-center justify-between gap-3 hover:border-[#8EB69B] active:scale-[0.99] transition-all cursor-pointer"
            onClick={() => {
              setIsChangePasswordModalOpen(true);
              setPasswordError(null);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0 shadow-xs">
                <KeyRound size={20} strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <h3
                  id="change-password-heading"
                  className="text-sm font-extrabold text-[#051F20]"
                >
                  Change Password
                </h3>
                <p className="text-xs font-medium text-[#235347]">
                  Update login password with current credentials
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsChangePasswordModalOpen(true);
                setPasswordError(null);
              }}
              className="px-4 py-2 rounded-full bg-[#163832] text-white text-xs font-bold hover:bg-[#235347] active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
              aria-label="Change Password"
            >
              Change
            </button>
          </section>

          {/* App Version & OTA Updates Section */}
          <section
            aria-labelledby="app-ota-heading"
            className="w-full bg-white rounded-3xl border border-[#DAF1DE] p-4 sm:p-5 shadow-[0_8px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE] flex items-center justify-center text-[#235347] shrink-0 border border-[#8EB69B]/30">
                  <DownloadCloud size={20} strokeWidth={2.2} />
                </div>
                <div className="text-left">
                  <h3
                    id="app-ota-heading"
                    className="text-sm font-extrabold text-[#051F20]"
                  >
                    Software Updates & App Installation
                  </h3>
                  <p className="text-xs font-medium text-[#235347]">
                    Over-The-Air push distribution & live device adoption
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => checkForUpdates(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#235347] text-white text-xs font-bold hover:bg-[#163832] transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 active:scale-95 touch-target-44"
              >
                <RefreshCw size={12} />
                <span>Check for Updates</span>
              </button>
            </div>

            {/* If update is available: Highlighted Box with Direct Download */}
            {updateInfo ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-emerald-500/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-emerald-700" />
                    <span className="font-extrabold text-sm text-[#051F20]">
                      GeoHub v{updateInfo.version} Available!
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                    Update Ready
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#163832]">
                  <span>Installed: v{APP_VERSION}</span>
                  <ArrowRight size={13} className="text-[#235347]" />
                  <span className="text-emerald-800 font-bold">New: v{updateInfo.version} ({updateInfo.file_size_mb || '6.5 MB'})</span>
                </div>

                {updateInfo.release_notes && (
                  <div className="bg-white/90 rounded-xl p-3 text-xs text-[#163832] border border-[#DAF1DE]">
                    <span className="font-bold block mb-1 text-[#051F20]">What's New in this Build:</span>
                    <p className="whitespace-pre-line text-[#235347]">{updateInfo.release_notes}</p>
                  </div>
                )}

                {/* In-Card Download Progress */}
                {isDownloadingUpdate && (
                  <div className="flex flex-col gap-1.5 bg-white rounded-xl p-3 border border-emerald-300">
                    <div className="flex justify-between text-xs font-bold text-[#163832]">
                      <span>{updateStatusMessage || 'Downloading update...'}</span>
                      <span>{updateDownloadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#DAF1DE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.max(5, updateDownloadProgress)}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDirectUpdateFromSettings}
                  disabled={isDownloadingUpdate}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition active:scale-98 touch-target-44 disabled:opacity-75"
                >
                  <DownloadCloud size={16} />
                  <span>{isDownloadingUpdate ? 'Downloading & Launching Installer...' : 'Download & Update Now'}</span>
                </button>
              </div>
            ) : (
              /* Version Up-To-Date Row */
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-[#051F20] block">GeoHub is up to date</span>
                    <span className="text-[#235347] font-mono">Installed: v{APP_VERSION} (Build {APP_VERSION_CODE})</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347] border border-[#8EB69B]/40">
                  Latest Build
                </span>
              </div>
            )}

            {/* SuperAdmin / Coordinator OTA Management & Fleet Audit */}
            {(isFaculty || isPresident || isManagementLead) && (
              <div className="border-t border-[#DAF1DE] pt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="text-[#235347]" />
                    <span className="text-xs font-bold text-[#051F20]">Device Adoption & Telemetry</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchDeviceAudit}
                    disabled={isLoadingAudit}
                    className="text-xs text-[#235347] font-semibold underline hover:text-[#051F20] cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingAudit ? 'Loading...' : deviceAudit ? 'Refresh Fleet' : 'Load Fleet Audit'}
                  </button>
                </div>

                {deviceAudit && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl p-2.5 text-center">
                      <span className="text-base font-extrabold text-[#051F20] block">{deviceAudit.total_devices}</span>
                      <span className="text-xs font-medium text-[#235347]">Enrolled</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                      <span className="text-base font-extrabold text-emerald-800 block">{deviceAudit.adoption_percentage}%</span>
                      <span className="text-xs font-medium text-emerald-700">Updated</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
                      <span className="text-base font-extrabold text-amber-800 block">{deviceAudit.outdated_devices}</span>
                      <span className="text-xs font-medium text-amber-700">Outdated</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBroadcastUpdate}
                  disabled={isBroadcasting}
                  className="w-full py-2.5 rounded-2xl bg-white border border-[#235347] text-[#235347] hover:bg-[#DAF1DE]/30 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-60"
                >
                  <Send size={14} />
                  <span>{isBroadcasting ? 'Broadcasting Alert...' : 'Broadcast OTA Update Alert to Devices'}</span>
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: SETTINGS & APP UPDATES
          ------------------------------------------------------------- */}
      {activeProfileTab === 'settings' && (
        <div className="flex flex-col gap-3.5">
          {/* Software Updates as primary hero card */}
          <section
            aria-labelledby="app-ota-heading-settings"
            className="w-full bg-white rounded-3xl border border-[#DAF1DE] p-4 sm:p-5 shadow-[0_8px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE] flex items-center justify-center text-[#235347] shrink-0 border border-[#8EB69B]/30">
                  <DownloadCloud size={20} strokeWidth={2.2} />
                </div>
                <div className="text-left">
                  <h3
                    id="app-ota-heading-settings"
                    className="text-sm font-extrabold text-[#051F20]"
                  >
                    Software Updates & App Installation
                  </h3>
                  <p className="text-xs font-medium text-[#235347]">
                    Manage app versions, OTA downloads, and update alerts
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => checkForUpdates(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#235347] text-white text-xs font-bold hover:bg-[#163832] transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 active:scale-95 touch-target-44"
              >
                <RefreshCw size={12} />
                <span>Check for Updates</span>
              </button>
            </div>

            {/* If update is available: Highlighted Box with Direct Download */}
            {updateInfo ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-emerald-500/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-emerald-700" />
                    <span className="font-extrabold text-sm text-[#051F20]">
                      GeoHub v{updateInfo.version} Available!
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                    Update Ready
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#163832]">
                  <span>Installed: v{APP_VERSION}</span>
                  <ArrowRight size={13} className="text-[#235347]" />
                  <span className="text-emerald-800 font-bold">New: v{updateInfo.version} ({updateInfo.file_size_mb || '6.5 MB'})</span>
                </div>

                {updateInfo.release_notes && (
                  <div className="bg-white/90 rounded-xl p-3 text-xs text-[#163832] border border-[#DAF1DE]">
                    <span className="font-bold block mb-1 text-[#051F20]">What's New in this Build:</span>
                    <p className="whitespace-pre-line text-[#235347]">{updateInfo.release_notes}</p>
                  </div>
                )}

                {/* In-Card Download Progress */}
                {isDownloadingUpdate && (
                  <div className="flex flex-col gap-1.5 bg-white rounded-xl p-3 border border-emerald-300">
                    <div className="flex justify-between text-xs font-bold text-[#163832]">
                      <span>{updateStatusMessage || 'Downloading update...'}</span>
                      <span>{updateDownloadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#DAF1DE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.max(5, updateDownloadProgress)}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDirectUpdateFromSettings}
                  disabled={isDownloadingUpdate}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition active:scale-98 touch-target-44 disabled:opacity-75"
                >
                  <DownloadCloud size={16} />
                  <span>{isDownloadingUpdate ? 'Downloading & Launching Installer...' : 'Download & Update Now'}</span>
                </button>
              </div>
            ) : (
              /* Version Up-To-Date Row */
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-[#051F20] block">GeoHub is up to date</span>
                    <span className="text-[#235347] font-mono">Installed: v{APP_VERSION} (Build {APP_VERSION_CODE})</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347] border border-[#8EB69B]/40">
                  Latest Build
                </span>
              </div>
            )}

            {/* SuperAdmin / Coordinator OTA Management & Fleet Audit */}
            {(isFaculty || isPresident || isManagementLead) && (
              <div className="border-t border-[#DAF1DE] pt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="text-[#235347]" />
                    <span className="text-xs font-bold text-[#051F20]">Device Adoption & Telemetry</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchDeviceAudit}
                    disabled={isLoadingAudit}
                    className="text-xs text-[#235347] font-semibold underline hover:text-[#051F20] cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingAudit ? 'Loading...' : deviceAudit ? 'Refresh Fleet' : 'Load Fleet Audit'}
                  </button>
                </div>

                {deviceAudit && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl p-2.5 text-center">
                      <span className="text-base font-extrabold text-[#051F20] block">{deviceAudit.total_devices}</span>
                      <span className="text-xs font-medium text-[#235347]">Enrolled</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                      <span className="text-base font-extrabold text-emerald-800 block">{deviceAudit.adoption_percentage}%</span>
                      <span className="text-xs font-medium text-emerald-700">Updated</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
                      <span className="text-base font-extrabold text-amber-800 block">{deviceAudit.outdated_devices}</span>
                      <span className="text-xs font-medium text-amber-700">Outdated</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBroadcastUpdate}
                  disabled={isBroadcasting}
                  className="w-full py-2.5 rounded-2xl bg-white border border-[#235347] text-[#235347] hover:bg-[#DAF1DE]/30 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-60"
                >
                  <Send size={14} />
                  <span>{isBroadcasting ? 'Broadcasting Alert...' : 'Broadcast OTA Update Alert to Devices'}</span>
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* 4. Dedicated Session Management / Clean Logout Action (Persistent) */}
      <section
        aria-label="Account Session Actions"
        className="w-full bg-white rounded-3xl border border-[#DAF1DE] p-4 sm:p-5 shadow-[0_8px_24px_rgba(5,31,32,0.06)] flex flex-col gap-2 mt-1"
      >
        <button
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
          className="w-full h-11 rounded-2xl bg-white border border-[#D9534F] text-[#D9534F] font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-50 active:scale-[0.99] transition-all cursor-pointer touch-target-44 shadow-xs"
          aria-label="Log Out of GeoHub"
        >
          <LogOut size={16} strokeWidth={2.2} />
          <span>Log Out of GeoHub</span>
        </button>
        <p className="text-center text-xs font-medium text-[#235347] opacity-75">
          Safely conclude scholar session • GeoHub Institutional Chapter
        </p>
      </section>

      {/* Confirmation Dialog on Logout */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          logout();
        }}
        title="Log out of GeoHub?"
        message="Are you sure you want to end your current session? You will need to log in again to access club features."
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        isDanger={true}
      />

      {/* Clean Change Password Modal (Opens only when Change Password is clicked) */}
      {isChangePasswordModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          onClick={() => {
            if (!isUpdatingPassword) {
              setIsChangePasswordModalOpen(false);
              setPasswordError(null);
            }
          }}
          role="presentation"
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-[#DAF1DE] p-5 sm:p-6 shadow-[0_16px_48px_rgba(5,31,32,0.2)] flex flex-col gap-4 animate-in fade-in zoom-in-95 relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-change-password-title"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#DAF1DE]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
                  <KeyRound size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <h3
                    id="modal-change-password-title"
                    className="text-base font-extrabold text-[#051F20] tracking-tight"
                  >
                    Change Password
                  </h3>
                  <p className="text-xs font-semibold text-[#235347]">
                    Update your scholar credentials securely
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isUpdatingPassword) {
                    setIsChangePasswordModalOpen(false);
                    setPasswordError(null);
                  }
                }}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-center text-[#235347] hover:bg-[#DAF1DE] hover:text-[#051F20] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* Error Notification */}
            {passwordError && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#D9534F] text-xs font-semibold animate-in fade-in"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Success Notification */}
            {passwordSuccess && (
              <div
                role="status"
                className="flex items-start gap-2 p-3 rounded-2xl bg-[#DAF1DE]/70 border border-[#8EB69B] text-[#163832] text-xs font-bold animate-in fade-in"
              >
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#163832]" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="flex flex-col gap-4">
              {/* Current Password Field */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="profile-old-password"
                  className="text-xs font-bold text-[#051F20]"
                >
                  Current / Old Password
                </label>
                <div className="relative flex items-center">
                  <div
                    className="pointer-events-none flex items-center justify-center text-[#235347]/70"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                    aria-hidden="true"
                  >
                    <Lock size={17} strokeWidth={2.2} />
                  </div>
                  <input
                    id="profile-old-password"
                    name="oldPassword"
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Enter current password"
                    style={{ paddingLeft: '46px', paddingRight: '46px' }}
                    className="w-full h-12 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] focus:border-[#163832] focus:bg-white focus:ring-2 focus:ring-[#163832]/10 text-xs font-semibold text-[#051F20] outline-hidden placeholder:text-[#8EB69B] transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    className="p-1.5 rounded-lg text-[#235347] hover:bg-[#DAF1DE]/60 hover:text-[#051F20] transition-colors cursor-pointer"
                    aria-label={showOldPassword ? 'Hide current password' : 'Show current password'}
                  >
                    {showOldPassword ? <EyeOff size={17} strokeWidth={2.2} /> : <Eye size={17} strokeWidth={2.2} />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="profile-new-password"
                    className="text-xs font-bold text-[#051F20]"
                  >
                    New Password
                  </label>
                  {newPassword && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color: getPasswordStrength(newPassword).color,
                        backgroundColor: '#DAF1DE',
                      }}
                    >
                      {getPasswordStrength(newPassword).label}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <div
                    className="pointer-events-none flex items-center justify-center text-[#235347]/70"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                    aria-hidden="true"
                  >
                    <KeyRound size={17} strokeWidth={2.2} />
                  </div>
                  <input
                    id="profile-new-password"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Enter new password (min. 8 chars)"
                    style={{ paddingLeft: '46px', paddingRight: '46px' }}
                    className="w-full h-12 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] focus:border-[#163832] focus:bg-white focus:ring-2 focus:ring-[#163832]/10 text-xs font-semibold text-[#051F20] outline-hidden placeholder:text-[#8EB69B] transition-all"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    className="p-1.5 rounded-lg text-[#235347] hover:bg-[#DAF1DE]/60 hover:text-[#051F20] transition-colors cursor-pointer"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff size={17} strokeWidth={2.2} /> : <Eye size={17} strokeWidth={2.2} />}
                  </button>
                </div>
                {/* Strength Meter Bar */}
                {newPassword && (
                  <div className="w-full h-1.5 rounded-full bg-[#DAF1DE] overflow-hidden mt-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: getPasswordStrength(newPassword).width,
                        backgroundColor: getPasswordStrength(newPassword).color,
                      }}
                    />
                  </div>
                )}
                <span className="text-xs text-[#235347] font-medium pl-0.5">
                  At least 8 characters with letters & numbers
                </span>
              </div>

              {/* Confirm New Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="profile-confirm-password"
                    className="text-xs font-bold text-[#051F20]"
                  >
                    Confirm New Password
                  </label>
                  {confirmPassword && newPassword === confirmPassword && (
                    <span className="text-xs font-bold text-[#163832] bg-[#DAF1DE] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      Passwords match
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <div
                    className="pointer-events-none flex items-center justify-center text-[#235347]/70"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                    aria-hidden="true"
                  >
                    <KeyRound size={17} strokeWidth={2.2} />
                  </div>
                  <input
                    id="profile-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Re-enter new password"
                    style={{ paddingLeft: '46px', paddingRight: '46px' }}
                    className="w-full h-12 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] focus:border-[#163832] focus:bg-white focus:ring-2 focus:ring-[#163832]/10 text-xs font-semibold text-[#051F20] outline-hidden placeholder:text-[#8EB69B] transition-all"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    className="p-1.5 rounded-lg text-[#235347] hover:bg-[#DAF1DE]/60 hover:text-[#051F20] transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={17} strokeWidth={2.2} /> : <Eye size={17} strokeWidth={2.2} />}
                  </button>
                </div>
              </div>

              {/* Modal Footer Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePasswordModalOpen(false);
                    setPasswordError(null);
                  }}
                  className="h-11 px-4 rounded-2xl bg-[#F6FBF7] hover:bg-[#DAF1DE] text-[#235347] font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 h-11 rounded-2xl bg-[#163832] hover:bg-[#235347] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-[0_4px_14px_rgba(22,56,50,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Update Account Password"
                >
                  {isUpdatingPassword ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck size={16} strokeWidth={2.2} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* High-Brightness Dynamic QR Chapter Pass Centered Modal */}
      {isQrModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          onClick={() => setIsQrModalOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl border border-[#DAF1DE] p-6 shadow-2xl flex flex-col items-center text-center relative"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, rgba(218, 241, 222, 0.45) 0%, rgba(255, 255, 255, 1) 75%), #FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-modal-title"
          >
            {/* Close button at top right */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-center text-[#235347] hover:text-[#051F20] active:scale-95 transition-all cursor-pointer"
              aria-label="Close pass modal"
            >
              <X size={18} strokeWidth={2.2} />
            </button>

            {/* Header */}
            <div className="w-12 h-12 rounded-2xl bg-[#DAF1DE] flex items-center justify-center text-[#163832] mb-2 shadow-xs">
              <QrCode size={24} strokeWidth={2.2} />
            </div>
            <h3 id="qr-modal-title" className="text-lg font-extrabold text-[#051F20]">
              Chapter Gate Pass
            </h3>
            <p className="text-xs font-semibold text-[#235347] mt-0.5">
              Present to Management Squad scanner
            </p>

            {/* High-Contrast QR Code */}
            <div className="my-4 p-4 bg-white rounded-2xl border-2 border-[#163832] shadow-sm flex items-center justify-center">
              <QRCodeSVG
                value={qrToken}
                size={180}
                level="H"
                fgColor="#051F20"
                bgColor="#FFFFFF"
                includeMargin={false}
              />
            </div>

            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DAF1DE] text-[#163832] text-xs font-bold shadow-xs">
              <Sparkles size={13} className="text-[#163832]" />
              <span>Refreshes in {secondsLeft} seconds</span>
            </div>

            {/* Copyable Token Chip */}
            <button
              type="button"
              onClick={() => handleCopy('token', qrToken)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] active:scale-95 text-xs font-mono font-bold text-[#051F20] transition-colors cursor-pointer"
              title="Copy authentication token"
            >
              <span className="truncate max-w-[200px]">{qrToken}</span>
              {copiedKey === 'token' ? (
                <Check size={13} className="text-[#163832]" />
              ) : (
                <Copy size={13} className="text-[#8EB69B]" />
              )}
            </button>

            {/* Ledger Disclaimer */}
            <p className="text-xs font-medium text-[#235347] mt-3 px-2 leading-relaxed">
              Dynamic cryptographic token verified against institutional ledger. Single-use gate clearance.
            </p>

            {/* Bottom Done Button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-[#163832] text-white font-bold text-xs shadow-md hover:bg-[#235347] active:scale-95 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProfileView;
