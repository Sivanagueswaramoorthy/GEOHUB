import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  Building,
  GraduationCap,
  LogOut,
  QrCode,
  Users,
  RotateCw,
  Shield,
  ShieldCheck,
  Copy,
  Check,
  Award,
  ArrowLeft,
  Bell,
  ChevronRight,
  Monitor,
  Smartphone,
  CalendarCheck,
  ClipboardCheck,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  FileCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import {
  Avatar,
  BottomSheet,
  ConfirmDialog,
  getRoleBadgeLabel,
} from '../../components/shared';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    notifications,
    setIsRoleSwitcherOpen,
    setActiveTab,
    isPhoneFrame,
    setIsPhoneFrame,
    logout,
    attendance = [],
    tasks = [],
    approvals = [],
    showToast,
  } = useApp();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [qrToken, setQrToken] = useState(
    () => `GEO-AUTH-${currentUser.uid}-${Date.now().toString(36).toUpperCase()}`
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length : 0;
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

  const canSwitchRole = isFaculty || isPresident || Boolean(import.meta.env.DEV);

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

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  const getRoleIcon = () => {
    if (isFaculty) return <ShieldCheck size={18} strokeWidth={2.2} className="text-[#163832]" />;
    if (isPresident) return <Shield size={18} strokeWidth={2.2} className="text-[#163832]" />;
    if (isManagementLead) return <Users size={18} strokeWidth={2.2} className="text-[#163832]" />;
    return <Award size={18} strokeWidth={2.2} className="text-[#163832]" />;
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto flex flex-col gap-5 px-4 sm:px-6 py-4 pb-28 select-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setActiveTab('home');
            if (typeof window !== 'undefined') {
              window.location.hash = 'home';
            }
          }}
          className="h-10 px-3.5 rounded-full bg-white text-[#163832] border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.06)] flex items-center gap-1.5 text-xs font-bold hover:bg-[#F6FBF7] transition-all touch-target-44 cursor-pointer"
          aria-label="Back to home"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="h-10 px-3.5 rounded-full bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B] shadow-xs flex items-center gap-1.5 text-xs font-bold hover:bg-[#8EB69B] hover:text-white transition-all touch-target-44 cursor-pointer"
          aria-label="Open Digital Pass"
          title="Open Chapter Pass"
        >
          <QrCode size={15} strokeWidth={2.2} />
          <span>Digital Pass</span>
        </button>
      </div>

      <div>
        <h1
          className="text-2xl font-bold tracking-tight text-[#051F20]"
          style={{ fontSize: '26px', lineHeight: '30px' }}
        >
          Account & Profile
        </h1>
        <p className="text-xs font-semibold text-[#235347] mt-0.5">
          Verified Scholar Credentials & Digital Pass
        </p>
      </div>

      {/* 2. Executive Scholar Hero Card */}
      <section
        aria-labelledby="profile-scholar-identity"
        className="w-full bg-white rounded-3xl border border-[#DAF1DE] p-5 sm:p-6 shadow-[0_12px_32px_rgba(5,31,32,0.08)] flex flex-col items-center text-center relative overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(218, 241, 222, 0.6) 0%, rgba(255, 255, 255, 1) 70%), #FFFFFF',
        }}
      >
        {/* Soft Decorative Emblem Background */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle, #DAF1DE 0%, rgba(246, 251, 247, 0) 70%)',
          }}
        />

        {/* 84px Premium Avatar with Status Ring */}
        <div className="relative mb-3.5">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-white shadow-[0_6px_20px_rgba(5,31,32,0.12)] border border-[#8EB69B] flex items-center justify-center">
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
          {/* Active Verified Pulse Dot */}
          <div
            className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#163832] border-2 border-white flex items-center justify-center shadow-sm"
            title="Active Scholar Standing"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#DAF1DE]" />
          </div>
        </div>

        {/* Name & Headline */}
        <h2
          id="profile-scholar-identity"
          className="text-2xl sm:text-3xl font-extrabold text-[#051F20] tracking-tight leading-tight"
          style={{ fontSize: '26px', lineHeight: '30px' }}
        >
          {currentUser.name}
        </h2>

        {/* Role & Squad Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#DAF1DE] border border-[#8EB69B] shadow-xs">
            {getRoleIcon()}
            <span className="text-xs font-bold uppercase tracking-wider text-[#163832]">
              {badgeLabel}
            </span>
          </div>

          {currentUser.team && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6FBF7] border border-[#DAF1DE]">
              <Users size={14} className="text-[#235347]" />
              <span className="text-xs font-bold text-[#235347]">
                {currentUser.team} Squad
              </span>
            </div>
          )}
        </div>

        {/* Identifier Pills with 1-Tap Copy */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
          {currentUser.rollNo && (
            <button
              type="button"
              onClick={() => handleCopy('roll', currentUser.rollNo || '')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] text-xs font-semibold text-[#051F20] transition-colors cursor-pointer"
              style={{ minHeight: '44px', fontSize: '12px' }}
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] text-xs font-semibold text-[#051F20] transition-colors cursor-pointer"
            style={{ minHeight: '44px', fontSize: '12px' }}
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

        {/* Verified Status Banner */}
        <div className="w-full mt-4 pt-3.5 border-t border-[#DAF1DE] flex items-center justify-between text-xs font-semibold text-[#235347] flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#163832]" />
            <span>Certified Scholar Standing</span>
          </div>
          <span className="font-mono text-xs text-[#051F20] bg-[#DAF1DE] px-2 py-0.5 rounded-md border border-[#8EB69B]">
            UID: #{currentUser.uid}
          </span>
        </div>
      </section>

      {/* 3. Key Stats Metric Grid (4 Cards) */}
      <section aria-label="Key Scholar Metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Attendance */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347]">Attendance</span>
            <div className="w-7 h-7 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CalendarCheck size={16} strokeWidth={2} />
            </div>
          </div>
          <span
            className="text-lg font-extrabold text-[#051F20] tracking-tight"
            style={{ fontSize: '20px', lineHeight: '24px' }}
          >
            {userAttendanceCount || 12}
          </span>
          <span className="text-xs font-medium text-[#235347]">Verified Check-ins</span>
        </div>

        {/* Metric 2: Squad Duty */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347]">Affiliation</span>
            <div className="w-7 h-7 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Users size={16} strokeWidth={2} />
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
            <div className="w-7 h-7 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <ClipboardCheck size={16} strokeWidth={2} />
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
            <div className="w-7 h-7 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Award size={16} strokeWidth={2} />
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

      {/* 4. Integrated Chapter Gate Pass (Spotlight Card) */}
      <section
        aria-labelledby="chapter-gate-pass-heading"
        className="w-full bg-white rounded-3xl border border-[#DAF1DE] p-5 sm:p-6 shadow-[0_10px_30px_rgba(5,31,32,0.08)] flex flex-col items-center text-center gap-4"
      >
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] border border-[#8EB69B] flex items-center justify-center text-[#163832]">
              <QrCode size={18} strokeWidth={2} />
            </div>
            <div>
              <h3
                id="chapter-gate-pass-heading"
                className="text-base font-bold text-[#051F20]"
                style={{ fontSize: '17px', lineHeight: '22px' }}
              >
                Official Chapter Gate Pass
              </h3>
              <p className="text-xs font-semibold text-[#235347]">
                Dynamic Token for Event Check-In & Scanner
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DAF1DE] border border-[#8EB69B] text-xs font-bold text-[#163832]">
            <RotateCw size={13} className="animate-spin text-[#163832]" />
            <span>{secondsLeft}s</span>
          </div>
        </div>

        {/* QR Code Container */}
        <div
          onClick={() => setIsQrModalOpen(true)}
          className="p-3 sm:p-4 rounded-2xl bg-white border-2 border-[#8EB69B] shadow-[0_6px_20px_rgba(5,31,32,0.06)] cursor-pointer hover:scale-[1.02] transition-transform"
          title="Click to view full screen pass"
        >
          <QRCodeSVG
            value={qrToken}
            size={160}
            level="H"
            includeMargin={false}
            fgColor="#051F20"
          />
        </div>

        {/* Pass Token & Copy Button */}
        <div className="w-full flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] max-w-sm">
          <span className="font-mono text-xs font-bold text-[#051F20] truncate pr-2">
            {qrToken}
          </span>
          <button
            type="button"
            onClick={() => handleCopy('token', qrToken)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#163832] hover:text-[#0B2B26] p-1.5 cursor-pointer shrink-0"
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
            aria-label="Copy gate pass token"
          >
            {copiedKey === 'token' ? (
              <>
                <Check size={14} className="text-[#163832]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-[#235347]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="w-full max-w-sm inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#DAF1DE] border border-[#8EB69B] text-xs font-bold text-[#163832] hover:bg-[#8EB69B] hover:text-white transition-colors cursor-pointer shadow-xs"
          style={{ minHeight: '44px', fontSize: '12px' }}
        >
          <ExternalLink size={14} />
          <span>Expand High-Brightness Gate Pass</span>
        </button>
      </section>

      {/* 5. Institutional Academic Dossier */}
      <section
        aria-labelledby="academic-dossier-heading"
        className="w-full bg-white rounded-3xl border border-[#DAF1DE] p-5 sm:p-6 shadow-[0_10px_30px_rgba(5,31,32,0.08)] flex flex-col gap-3.5"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]">
          <div className="flex items-center gap-2">
            <Building size={18} strokeWidth={2} className="text-[#163832]" />
            <h3
              id="academic-dossier-heading"
              className="text-base font-bold text-[#051F20]"
              style={{ fontSize: '17px', lineHeight: '22px' }}
            >
              Academic & Club Dossier
            </h3>
          </div>
          <span className="text-xs font-bold text-[#235347] bg-[#DAF1DE] px-2.5 py-0.5 rounded-full border border-[#8EB69B]">
            Verified
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Branch / Department */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#235347]">
              <Building size={16} className="text-[#163832]" />
              Branch / Department
            </span>
            <span className="text-xs font-bold text-[#051F20] text-right">
              {currentUser.department || 'Geography & Geomatics'}
            </span>
          </div>

          {/* Academic Year */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#235347]">
              <GraduationCap size={16} className="text-[#163832]" />
              Academic Year / Standing
            </span>
            <span className="text-xs font-bold text-[#051F20] text-right">
              {currentUser.yearOfStudy || (isFaculty ? 'Faculty Board' : '4th Year (Senior)')}
            </span>
          </div>

          {/* Contact Phone */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#235347]">
              <Phone size={16} className="text-[#163832]" />
              Official Contact
            </span>
            <span className="text-xs font-bold text-[#051F20] font-mono text-right">
              {currentUser.phone || '+91 94420 18820'}
            </span>
          </div>

          {/* Squad Memberships */}
          {currentUser.squadMemberships && currentUser.squadMemberships.length > 0 && (
            <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
              <span className="text-xs font-semibold text-[#235347]">
                Squad Affiliations & Leadership
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
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
            <span className="flex items-center gap-2 text-xs font-semibold text-[#235347]">
              <CalendarCheck size={16} className="text-[#163832]" />
              Tenure Period
            </span>
            <span className="text-xs font-bold text-[#051F20] text-right">
              2025–2026 Academic Session
            </span>
          </div>
        </div>
      </section>

      {/* 6. Executive Operations & Governance Desk (Faculty & Leadership) */}
      {(isFaculty || isPresident || isManagementLead) && (
        <section
          aria-labelledby="executive-governance-heading"
          className="w-full bg-white rounded-3xl border border-[#DAF1DE] p-5 sm:p-6 shadow-[0_10px_30px_rgba(5,31,32,0.08)] flex flex-col gap-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]">
            <div className="flex items-center gap-2">
              <Layers size={18} strokeWidth={2} className="text-[#163832]" />
              <h3
                id="executive-governance-heading"
                className="text-base font-bold text-[#051F20]"
                style={{ fontSize: '17px', lineHeight: '22px' }}
              >
                Executive Governance & Operations
              </h3>
            </div>
            <span className="text-xs font-bold text-[#163832] bg-[#DAF1DE] px-2.5 py-0.5 rounded-full border border-[#8EB69B]">
              Authority Desk
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('operations')}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-colors cursor-pointer text-left"
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0">
                  <Layers size={16} strokeWidth={2} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#051F20] truncate">
                    Operations Desk
                  </span>
                  <span className="text-xs font-medium text-[#235347] truncate">
                    Duty allocation & squad tasks
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8EB69B] shrink-0 ml-1" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('approvals')}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-colors cursor-pointer text-left"
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0">
                  <FileCheck size={16} strokeWidth={2} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#051F20] truncate">
                    Approvals Hub
                  </span>
                  <span className="text-xs font-medium text-[#235347] truncate">
                    {pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pending reviews` : 'Zero backlog'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8EB69B] shrink-0 ml-1" />
            </button>
          </div>
        </section>
      )}

      {/* 7. Settings, Viewport & Account Actions */}
      <section
        aria-labelledby="account-actions-heading"
        className="w-full bg-white rounded-3xl border border-[#DAF1DE] p-5 sm:p-6 shadow-[0_10px_30px_rgba(5,31,32,0.08)] flex flex-col gap-3"
      >
        <div className="pb-2 border-b border-[#DAF1DE]">
          <h3
            id="account-actions-heading"
            className="text-base font-bold text-[#051F20]"
            style={{ fontSize: '17px', lineHeight: '22px' }}
          >
            Settings & System Actions
          </h3>
          <p className="text-xs font-semibold text-[#235347]">
            Session management, device viewport & notifications
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Notifications */}
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-colors cursor-pointer text-left"
            style={{ minHeight: '44px' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0">
                <Bell size={18} strokeWidth={2} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#051F20]">Official Notifications</span>
                <span className="text-xs font-medium text-[#235347]">
                  Announcements, bulletins & squad notices
                </span>
              </div>
            </div>
            {unreadCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D9534F] text-white shrink-0 ml-2">
                {unreadCount} New
              </span>
            ) : (
              <ChevronRight size={16} className="text-[#8EB69B] shrink-0 ml-2" />
            )}
          </button>

          {/* Switch Role (Faculty / President / Dev) */}
          {canSwitchRole && (
            <button
              type="button"
              onClick={() => setIsRoleSwitcherOpen(true)}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-colors cursor-pointer text-left"
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0">
                  <Shield size={18} strokeWidth={2} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#051F20]">Switch Executive Role</span>
                  <span className="text-xs font-medium text-[#235347]">
                    Current Preview: {badgeLabel}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8EB69B] shrink-0 ml-2" />
            </button>
          )}

          {/* Device Frame Viewport Toggle (Visible only on screens >= 768px) */}
          <div className="hidden md:block">
            <button
              type="button"
              onClick={() => setIsPhoneFrame(!isPhoneFrame)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-colors cursor-pointer text-left"
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0">
                  {isPhoneFrame ? (
                    <Monitor size={18} strokeWidth={2} />
                  ) : (
                    <Smartphone size={18} strokeWidth={2} />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#051F20]">
                    {isPhoneFrame ? 'Desktop Fullscreen Canvas' : 'Phone Frame Mode (480px)'}
                  </span>
                  <span className="text-xs font-medium text-[#235347]">
                    {isPhoneFrame
                      ? 'Expand preview canvas to full desktop browser viewport'
                      : 'Constrain preview canvas to 480px mobile device frame'}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B] shrink-0 ml-2">
                {isPhoneFrame ? 'Active: Frame' : 'Active: Full'}
              </span>
            </button>
          </div>

          {/* Log Out */}
          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#D9534F] hover:bg-[#F6FBF7] transition-colors cursor-pointer text-left shadow-xs"
            style={{ minHeight: '44px' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#D9534F] flex items-center justify-center text-[#D9534F] shrink-0">
                <LogOut size={18} strokeWidth={2} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#D9534F]">Log Out of GeoHub</span>
                <span className="text-xs font-medium text-[#235347]">
                  Safely conclude scholar session
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#D9534F] shrink-0 ml-2" />
          </button>
        </div>
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

      {/* High-Brightness Dynamic QR Chapter Pass Modal */}
      <BottomSheet
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Chapter Gate Pass"
        subtitle="Present to Management Squad scanner"
      >
        <div className="flex flex-col items-center text-center gap-4 pt-2 select-none">
          <div className="p-4 rounded-3xl bg-white border-2 border-[#8EB69B] shadow-[0_8px_24px_rgba(5,31,32,0.08)]">
            <QRCodeSVG
              value={qrToken}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#051F20"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DAF1DE] border border-[#8EB69B] text-xs font-bold text-[#163832]">
            <RotateCw size={14} className="animate-spin text-[#163832]" />
            <span>Refreshes in {secondsLeft} seconds</span>
          </div>

          <button
            type="button"
            onClick={() => handleCopy('modal-token', qrToken)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-mono font-bold text-[#051F20] cursor-pointer hover:border-[#8EB69B] transition-colors"
            style={{ minHeight: '44px' }}
          >
            <span>{qrToken}</span>
            {copiedKey === 'modal-token' ? (
              <Check size={14} className="text-[#163832]" />
            ) : (
              <Copy size={14} className="text-[#235347]" />
            )}
          </button>

          <p className="text-xs font-medium text-[#235347] max-w-xs">
            Dynamic cryptographic token verified against institutional ledger. Single-use gate clearance.
          </p>
        </div>
      </BottomSheet>
    </div>
  );
};

export default ProfileView;
