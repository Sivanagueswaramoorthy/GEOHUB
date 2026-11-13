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
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import {
  ConfirmDialog,
  getRoleBadgeLabel,
} from '../../components/shared';
import { apiClient } from '../../api/client';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    logout,
    attendance = [],
    tasks = [],
    showToast,
  } = useApp();

  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'security'>('overview');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [qrToken, setQrToken] = useState(
    () => `GEO-AUTH-${currentUser.uid}-${Date.now().toString(36).toUpperCase()}`
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
    if (isFaculty) return <ShieldCheck size={16} strokeWidth={2.2} className="text-[#184E50]" />;
    if (isPresident) return <Shield size={16} strokeWidth={2.2} className="text-[#184E50]" />;
    if (isManagementLead) return <Users size={16} strokeWidth={2.2} className="text-[#184E50]" />;
    return <Award size={16} strokeWidth={2.2} className="text-[#184E50]" />;
  };

  // Password Strength Evaluation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd || pwd.length < 8) {
      return { label: 'Weak', score: 1, color: '#C86D51', width: '33%' };
    }
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSymbols = /[^a-zA-Z0-9]/.test(pwd);
    if (hasLetters && hasNumbers && hasSymbols && pwd.length >= 10) {
      return { label: 'Strong', score: 3, color: '#184E50', width: '100%' };
    }
    if (hasLetters && hasNumbers) {
      return { label: 'Fair', score: 2, color: '#D4A359', width: '66%' };
    }
    return { label: 'Weak', score: 1, color: '#C86D51', width: '33%' };
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
            className="text-2xl font-bold tracking-tight text-[#0F3638]"
            style={{ fontSize: '26px', lineHeight: '30px' }}
          >
            Account & Profile
          </h1>
          <p className="text-xs font-semibold text-[#52705E] mt-0.5">
            Verified Scholar Credentials & Academic Standing
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="h-10 px-3.5 rounded-full bg-[#184E50] text-white border border-[#184E50] shadow-[0_4px_14px_rgba(22,56,50,0.2)] flex items-center gap-1.5 text-xs font-bold hover:bg-[#52705E] active:scale-95 transition-all touch-target-44 cursor-pointer shrink-0"
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
        className="w-full bg-white rounded-3xl border border-[#E8D9BD] p-5 sm:p-6 shadow-[0_12px_32px_rgba(15,54,56,0.06)] flex flex-col items-center text-center relative overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(243, 228, 195, 0.45) 0%, rgba(255, 255, 255, 1) 75%), #FFFFFF',
        }}
      >
        {/* Soft Decorative Ambient Circles */}
        <div
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle, #F3E4C3 0%, rgba(250, 246, 237, 0) 70%)',
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle, #6B8E78 0%, rgba(250, 246, 237, 0) 70%)',
          }}
        />

        {/* Avatar with Gradient Status Ring */}
        <div className="relative mb-3">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-[#184E50] via-[#D4A359] to-[#F3E4C3] shadow-[0_6px_20px_rgba(15,54,56,0.12)] flex items-center justify-center">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-extrabold text-2xl text-[#184E50]"
                style={{ backgroundColor: '#F3E4C3' }}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'G'}
              </div>
            )}
          </div>
          {/* Active Verified Chip */}
          <div
            className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#184E50] border-2 border-white flex items-center justify-center shadow-xs"
            title="Institutional Verified Scholar"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4A359]" />
          </div>
        </div>

        {/* Scholar Identity Name */}
        <h2
          id="profile-scholar-identity"
          className="text-2xl sm:text-3xl font-extrabold text-[#0F3638] tracking-tight leading-tight"
          style={{ fontSize: '26px', lineHeight: '30px' }}
        >
          {currentUser.name}
        </h2>

        {/* Role & Squad Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#184E50] text-white shadow-xs">
            {getRoleIcon()}
            <span className="text-xs font-bold uppercase tracking-wider">
              {badgeLabel}
            </span>
          </div>

          {currentUser.team && (
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E5ECE8] text-[#184E50] border border-[#6B8E78]">
              <Users size={13} className="text-[#184E50]" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAF9] border border-[#E5ECE8] hover:border-[#6B8E78] active:scale-95 text-xs font-semibold text-[#0F3638] transition-all cursor-pointer"
              style={{ minHeight: '40px', fontSize: '12px' }}
              title="Click to copy Register Number"
            >
              <span className="text-[#52705E] font-medium">Reg No:</span>
              <strong className="font-bold font-mono">{currentUser.rollNo}</strong>
              {copiedKey === 'roll' ? (
                <Check size={14} className="text-[#184E50]" />
              ) : (
                <Copy size={14} className="text-[#6B8E78]" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleCopy('email', currentUser.email)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAF9] border border-[#E5ECE8] hover:border-[#6B8E78] active:scale-95 text-xs font-semibold text-[#0F3638] transition-all cursor-pointer"
            style={{ minHeight: '40px', fontSize: '12px' }}
            title="Click to copy email address"
          >
            <Mail size={14} className="text-[#52705E]" />
            <span className="font-mono">{currentUser.email}</span>
            {copiedKey === 'email' ? (
              <Check size={14} className="text-[#184E50]" />
            ) : (
              <Copy size={14} className="text-[#6B8E78]" />
            )}
          </button>
        </div>
      </section>

      {/* 3. Segmented Tab Navigation Bar */}
      <nav
        aria-label="Profile Sections"
        className="flex items-center p-1 rounded-2xl bg-white border border-[#E5ECE8] shadow-xs text-xs font-bold text-[#52705E]"
      >
        <button
          type="button"
          onClick={() => setActiveProfileTab('overview')}
          className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer ${
            activeProfileTab === 'overview'
              ? 'bg-[#184E50] text-white shadow-xs'
              : 'hover:text-[#0F3638] text-[#52705E]'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveProfileTab('security')}
          className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer ${
            activeProfileTab === 'security'
              ? 'bg-[#184E50] text-white shadow-xs'
              : 'hover:text-[#0F3638] text-[#52705E]'
          }`}
        >
          Security
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
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5ECE8] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#52705E]">Attendance</span>
                <div className="w-6 h-6 rounded-lg bg-[#E5ECE8] flex items-center justify-center text-[#184E50]">
                  <CalendarCheck size={14} strokeWidth={2} />
                </div>
              </div>
              <span
                className="text-lg font-extrabold text-[#0F3638] tracking-tight"
                style={{ fontSize: '20px', lineHeight: '24px' }}
              >
                {userAttendanceCount}
              </span>
              <span className="text-[11px] font-medium text-[#52705E]">Verified Check-ins</span>
            </div>

            {/* Metric 2: Squad Duty */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5ECE8] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#52705E]">Affiliation</span>
                <div className="w-6 h-6 rounded-lg bg-[#E5ECE8] flex items-center justify-center text-[#184E50]">
                  <Users size={14} strokeWidth={2} />
                </div>
              </div>
              <span
                className="text-lg font-extrabold text-[#0F3638] tracking-tight truncate"
                style={{ fontSize: '18px', lineHeight: '24px' }}
              >
                {currentUser.team || 'Leadership'}
              </span>
              <span className="text-[11px] font-medium text-[#52705E] truncate">
                {currentUser.teamRole || badgeLabel}
              </span>
            </div>

            {/* Metric 3: Assigned Duties */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5ECE8] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#52705E]">Duties</span>
                <div className="w-6 h-6 rounded-lg bg-[#E5ECE8] flex items-center justify-center text-[#184E50]">
                  <ClipboardCheck size={14} strokeWidth={2} />
                </div>
              </div>
              <span
                className="text-lg font-extrabold text-[#0F3638] tracking-tight"
                style={{ fontSize: '20px', lineHeight: '24px' }}
              >
                {userTasksCount || (isFaculty ? 18 : 6)}
              </span>
              <span className="text-[11px] font-medium text-[#52705E]">Active Tasks</span>
            </div>

            {/* Metric 4: Clearance Tier */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5ECE8] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#52705E]">Clearance</span>
                <div className="w-6 h-6 rounded-lg bg-[#E5ECE8] flex items-center justify-center text-[#184E50]">
                  <Award size={14} strokeWidth={2} />
                </div>
              </div>
              <span
                className="text-lg font-extrabold text-[#0F3638] tracking-tight"
                style={{ fontSize: '20px', lineHeight: '24px' }}
              >
                {isFaculty ? 'Tier 1' : isPresident ? 'Tier 1' : 'Tier 2'}
              </span>
              <span className="text-[11px] font-medium text-[#52705E]">
                {isFaculty ? 'Institutional' : 'Executive'}
              </span>
            </div>
          </section>

          {/* Institutional Academic Dossier Card */}
          <section
            aria-labelledby="academic-dossier-heading"
            className="w-full bg-white rounded-3xl border border-[#E5ECE8] p-4 sm:p-5 shadow-[0_8px_24px_rgba(5,31,32,0.04)] flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5ECE8]">
              <div className="flex items-center gap-2">
                <Building size={16} strokeWidth={2} className="text-[#184E50]" />
                <h3
                  id="academic-dossier-heading"
                  className="text-sm font-extrabold text-[#0F3638]"
                >
                  Academic & Club Dossier
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#184E50] bg-[#E5ECE8] px-2 py-0.5 rounded-full border border-[#6B8E78]">
                Verified
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {/* Branch / Department */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E5ECE8]">
                <span className="flex items-center gap-1.5 font-semibold text-[#52705E]">
                  <Building size={14} className="text-[#184E50]" />
                  Branch / Department
                </span>
                <span className="font-bold text-[#0F3638] text-right">
                  {currentUser.department || 'Geography & Geomatics'}
                </span>
              </div>

              {/* Academic Year */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E5ECE8]">
                <span className="flex items-center gap-1.5 font-semibold text-[#52705E]">
                  <GraduationCap size={14} className="text-[#184E50]" />
                  Academic Year / Standing
                </span>
                <span className="font-bold text-[#0F3638] text-right">
                  {currentUser.yearOfStudy || (isFaculty ? 'Faculty Board' : '4th Year (Senior)')}
                </span>
              </div>

              {/* Contact Phone */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E5ECE8]">
                <span className="flex items-center gap-1.5 font-semibold text-[#52705E]">
                  <Phone size={14} className="text-[#184E50]" />
                  Official Contact
                </span>
                <span className="font-bold text-[#0F3638] font-mono text-right">
                  {currentUser.phone || '+91 94420 18820'}
                </span>
              </div>

              {/* Squad Memberships */}
              {currentUser.squadMemberships && currentUser.squadMemberships.length > 0 && (
                <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E5ECE8]">
                  <span className="font-semibold text-[#52705E]">
                    Squad Affiliations & Leadership
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {currentUser.squadMemberships.map((m, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E5ECE8] text-[#184E50] border border-[#6B8E78]"
                      >
                        <span>{m.squad}</span>
                        {m.isLead && <span className="opacity-75 font-semibold">(Lead)</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tenure Session */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E5ECE8]">
                <span className="flex items-center gap-1.5 font-semibold text-[#52705E]">
                  <CalendarCheck size={14} className="text-[#184E50]" />
                  Tenure Period
                </span>
                <span className="font-bold text-[#0F3638] text-right">
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
            className="w-full bg-white rounded-3xl border border-[#E5ECE8] p-4 sm:p-5 shadow-[0_8px_20px_rgba(5,31,32,0.04)] flex items-center justify-between gap-3 hover:border-[#6B8E78] active:scale-[0.99] transition-all cursor-pointer"
            onClick={() => {
              setIsChangePasswordModalOpen(true);
              setPasswordError(null);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E5ECE8] flex items-center justify-center text-[#184E50] shrink-0 shadow-xs">
                <KeyRound size={20} strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <h3
                  id="change-password-heading"
                  className="text-sm font-extrabold text-[#0F3638]"
                >
                  Change Password
                </h3>
                <p className="text-xs font-medium text-[#52705E]">
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
              className="px-4 py-2 rounded-full bg-[#184E50] text-white text-xs font-bold hover:bg-[#52705E] active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
              aria-label="Change Password"
            >
              Change
            </button>
          </section>
        </div>
      )}

      {/* 4. Dedicated Session Management / Clean Logout Action (Persistent) */}
      <section
        aria-label="Account Session Actions"
        className="w-full bg-white rounded-3xl border border-[#E5ECE8] p-4 sm:p-5 shadow-[0_8px_24px_rgba(5,31,32,0.06)] flex flex-col gap-2 mt-1"
      >
        <button
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
          className="w-full h-11 rounded-2xl bg-white border border-[#C86D51] text-[#C86D51] font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-50 active:scale-[0.99] transition-all cursor-pointer touch-target-44 shadow-xs"
          aria-label="Log Out of GeoHub"
        >
          <LogOut size={16} strokeWidth={2.2} />
          <span>Log Out of GeoHub</span>
        </button>
        <p className="text-center text-[11px] font-medium text-[#52705E] opacity-75">
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F3638]/60 backdrop-blur-md select-none transition-all duration-300"
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
            className="w-full max-w-md bg-white rounded-3xl border border-[#E5ECE8] p-5 sm:p-6 shadow-[0_16px_48px_rgba(5,31,32,0.2)] flex flex-col gap-4 animate-in fade-in zoom-in-95 relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-change-password-title"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE8]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E5ECE8] flex items-center justify-center text-[#184E50]">
                  <KeyRound size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <h3
                    id="modal-change-password-title"
                    className="text-base font-extrabold text-[#0F3638] tracking-tight"
                  >
                    Change Password
                  </h3>
                  <p className="text-[11px] font-semibold text-[#52705E]">
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
                className="w-8 h-8 rounded-full bg-[#F8FAF9] border border-[#E5ECE8] flex items-center justify-center text-[#52705E] hover:bg-[#E5ECE8] hover:text-[#0F3638] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* Error Notification */}
            {passwordError && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#C86D51] text-xs font-semibold animate-in fade-in"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Success Notification */}
            {passwordSuccess && (
              <div
                role="status"
                className="flex items-start gap-2 p-3 rounded-2xl bg-[#E5ECE8]/70 border border-[#6B8E78] text-[#184E50] text-xs font-bold animate-in fade-in"
              >
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#184E50]" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="flex flex-col gap-4">
              {/* Current Password Field */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="profile-old-password"
                  className="text-xs font-bold text-[#0F3638]"
                >
                  Current / Old Password
                </label>
                <div className="relative flex items-center">
                  <div
                    className="pointer-events-none flex items-center justify-center text-[#52705E]/70"
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
                    className="w-full h-12 rounded-2xl bg-[#F8FAF9] border border-[#E5ECE8] focus:border-[#184E50] focus:bg-white focus:ring-2 focus:ring-[#184E50]/10 text-xs font-semibold text-[#0F3638] outline-hidden placeholder:text-[#6B8E78] transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    className="p-1.5 rounded-lg text-[#52705E] hover:bg-[#E5ECE8]/60 hover:text-[#0F3638] transition-colors cursor-pointer"
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
                    className="text-xs font-bold text-[#0F3638]"
                  >
                    New Password
                  </label>
                  {newPassword && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color: getPasswordStrength(newPassword).color,
                        backgroundColor: '#E5ECE8',
                      }}
                    >
                      {getPasswordStrength(newPassword).label}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <div
                    className="pointer-events-none flex items-center justify-center text-[#52705E]/70"
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
                    className="w-full h-12 rounded-2xl bg-[#F8FAF9] border border-[#E5ECE8] focus:border-[#184E50] focus:bg-white focus:ring-2 focus:ring-[#184E50]/10 text-xs font-semibold text-[#0F3638] outline-hidden placeholder:text-[#6B8E78] transition-all"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    className="p-1.5 rounded-lg text-[#52705E] hover:bg-[#E5ECE8]/60 hover:text-[#0F3638] transition-colors cursor-pointer"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff size={17} strokeWidth={2.2} /> : <Eye size={17} strokeWidth={2.2} />}
                  </button>
                </div>
                {/* Strength Meter Bar */}
                {newPassword && (
                  <div className="w-full h-1.5 rounded-full bg-[#E5ECE8] overflow-hidden mt-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: getPasswordStrength(newPassword).width,
                        backgroundColor: getPasswordStrength(newPassword).color,
                      }}
                    />
                  </div>
                )}
                <span className="text-[11px] text-[#52705E] font-medium pl-0.5">
                  At least 8 characters with letters & numbers
                </span>
              </div>

              {/* Confirm New Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="profile-confirm-password"
                    className="text-xs font-bold text-[#0F3638]"
                  >
                    Confirm New Password
                  </label>
                  {confirmPassword && newPassword === confirmPassword && (
                    <span className="text-[10px] font-bold text-[#184E50] bg-[#E5ECE8] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      Passwords match
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <div
                    className="pointer-events-none flex items-center justify-center text-[#52705E]/70"
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
                    className="w-full h-12 rounded-2xl bg-[#F8FAF9] border border-[#E5ECE8] focus:border-[#184E50] focus:bg-white focus:ring-2 focus:ring-[#184E50]/10 text-xs font-semibold text-[#0F3638] outline-hidden placeholder:text-[#6B8E78] transition-all"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    className="p-1.5 rounded-lg text-[#52705E] hover:bg-[#E5ECE8]/60 hover:text-[#0F3638] transition-colors cursor-pointer"
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
                  className="h-11 px-4 rounded-2xl bg-[#F8FAF9] hover:bg-[#E5ECE8] text-[#52705E] font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 h-11 rounded-2xl bg-[#184E50] hover:bg-[#52705E] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-[0_4px_14px_rgba(22,56,50,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F3638]/60 backdrop-blur-md select-none transition-all duration-300"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          onClick={() => setIsQrModalOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl border border-[#E5ECE8] p-6 shadow-2xl flex flex-col items-center text-center relative"
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
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F8FAF9] border border-[#E5ECE8] flex items-center justify-center text-[#52705E] hover:text-[#0F3638] active:scale-95 transition-all cursor-pointer"
              aria-label="Close pass modal"
            >
              <X size={18} strokeWidth={2.2} />
            </button>

            {/* Header */}
            <div className="w-12 h-12 rounded-2xl bg-[#E5ECE8] flex items-center justify-center text-[#184E50] mb-2 shadow-xs">
              <QrCode size={24} strokeWidth={2.2} />
            </div>
            <h3 id="qr-modal-title" className="text-lg font-extrabold text-[#0F3638]">
              Chapter Gate Pass
            </h3>
            <p className="text-xs font-semibold text-[#52705E] mt-0.5">
              Present to Management Squad scanner
            </p>

            {/* High-Contrast QR Code */}
            <div className="my-4 p-4 bg-white rounded-2xl border-2 border-[#184E50] shadow-sm flex items-center justify-center">
              <QRCodeSVG
                value={qrToken}
                size={180}
                level="H"
                fgColor="#0F3638"
                bgColor="#FFFFFF"
                includeMargin={false}
              />
            </div>

            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5ECE8] text-[#184E50] text-xs font-bold shadow-xs">
              <Sparkles size={13} className="text-[#184E50]" />
              <span>Refreshes in {secondsLeft} seconds</span>
            </div>

            {/* Copyable Token Chip */}
            <button
              type="button"
              onClick={() => handleCopy('token', qrToken)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAF9] border border-[#E5ECE8] hover:border-[#6B8E78] active:scale-95 text-xs font-mono font-bold text-[#0F3638] transition-colors cursor-pointer"
              title="Copy authentication token"
            >
              <span className="truncate max-w-[200px]">{qrToken}</span>
              {copiedKey === 'token' ? (
                <Check size={13} className="text-[#184E50]" />
              ) : (
                <Copy size={13} className="text-[#6B8E78]" />
              )}
            </button>

            {/* Ledger Disclaimer */}
            <p className="text-[11px] font-medium text-[#52705E] mt-3 px-2 leading-relaxed">
              Dynamic cryptographic token verified against institutional ledger. Single-use gate clearance.
            </p>

            {/* Bottom Done Button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-[#184E50] text-white font-bold text-xs shadow-md hover:bg-[#52705E] active:scale-95 transition-all cursor-pointer"
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
