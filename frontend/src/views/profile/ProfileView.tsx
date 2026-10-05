import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  Building,
  GraduationCap,
  LogOut,
  QrCode,
  Users2,
  RotateCw,
  Shield,
  Copy,
  Check,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import {
  Overline,
  RoleBadge,
  InfoRow,
  BottomSheet,
  Toast,
} from '../../components';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    setIsRoleSwitcherOpen,
    logout,
  } = useApp();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [qrToken, setQrToken] = useState(() => `GEO-AUTH-${currentUser.uid}-${Date.now().toString(36)}`);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Rotating 30-second token
  useEffect(() => {
    if (!isQrModalOpen) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setQrToken(`GEO-AUTH-${currentUser.uid}-${Date.now().toString(36)}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isQrModalOpen, currentUser.uid]);

  // Initials
  const names = (currentUser.name || 'User').trim().split(' ');
  const initials =
    names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0].slice(0, 2).toUpperCase();

  const handleCopyToken = () => {
    navigator.clipboard?.writeText(qrToken);
    setCopiedToken(true);
    showToast('Token copied to clipboard');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const isFaculty = currentUser.role === 'super_admin' || currentUser.role === 'faculty';
  const isPromotion =
    currentUser.role === 'social_media' ||
    (currentUser.role === 'team_admin' && (currentUser.team === 'Promotion' || Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion')))) ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion'));
  const isTreasurer =
    currentUser.role === 'treasurer' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('treasurer'));
  const isDocLead =
    currentUser.role === 'documentation' ||
    (currentUser.post && currentUser.post.toLowerCase().includes('documentation'));

  return (
    <div className="flex flex-col gap-5 pb-10">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Top Bar: Overline with dot 'PROMOTION & MEDIA LEADERSHIP' / 'TREASURY & FISCAL GOVERNANCE' / 'DOCUMENTATION & ARCHIVAL LEAD' / 'INSTITUTIONAL GOVERNANCE' & UID Pill (#u_...) */}
      <div className="flex items-center justify-between pt-1">
        <Overline dot>
          {isPromotion
            ? 'PROMOTION & MEDIA LEADERSHIP'
            : isTreasurer
            ? 'TREASURY & FISCAL GOVERNANCE'
            : isDocLead
            ? 'DOCUMENTATION & ARCHIVAL LEAD'
            : isFaculty
            ? 'INSTITUTIONAL GOVERNANCE'
            : 'COORDINATION & LEADERSHIP'}
        </Overline>
        <span
          className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full"
          style={{
            backgroundColor: '#F1F5F9',
            color: '#64748B',
            border: '1px solid #E2E8F0',
          }}
        >
          #{currentUser.uid}
        </span>
      </div>

      {/* Large Card with big initials avatar, online dot, QR button top-right, Name, RoleBadge */}
      <div
        className="relative w-full rounded-[24px] bg-white border border-[#EEF1F5] p-6 text-center"
        style={{
          boxShadow: '0 6px 24px rgba(15, 23, 42, 0.06)',
        }}
      >
        {/* QR Icon Button Top-Right (opens member's own QR pass) */}
        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="absolute top-4 right-4 flex items-center justify-center rounded-2xl cursor-pointer transition-all hover:scale-105 active:scale-95"
          style={{
            width: '44px',
            height: '44px',
            backgroundColor: '#E7F9F1',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.16)',
          }}
          title="Open Dynamic QR Pass"
          aria-label="Open Dynamic QR Pass"
        >
          <QrCode size={22} />
        </button>

        {/* Big Initials Avatar with Online Dot */}
        <div className="flex justify-center mb-3">
          <div className="relative inline-flex items-center justify-center">
            <div
              className="flex items-center justify-center font-extrabold text-2xl"
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                backgroundColor: '#E7F9F1',
                border: '2.5px solid #A7F3D0',
                color: '#064E3B',
                fontFamily: 'var(--font-family)',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
              }}
            >
              {initials}
            </div>

            {/* Online Dot */}
            <span
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-white"
              title="Active Executive"
            />
          </div>
        </div>

        {/* Name */}
        <h2
          className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight mb-1.5"
          style={{ fontFamily: 'var(--font-family)' }}
        >
          {currentUser.name}
        </h2>

        {/* RoleBadge */}
        <div className="flex justify-center mb-1">
          <RoleBadge role={currentUser.role} post={currentUser.post || currentUser.teamRole} size="md" />
        </div>
      </div>

      {/* InfoRows: Institutional Email, Contact, Academic Department, Standing */}
      <div
        className="rounded-[24px] bg-white border border-[#EEF1F5] p-5"
        style={{
          boxShadow: '0 6px 24px rgba(15, 23, 42, 0.06)',
        }}
      >
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Scholar Information
        </h3>

        <div className="flex flex-col">
          <InfoRow
            label="Institutional Email"
            value={currentUser.email}
            icon={<Mail size={16} />}
            iconBg="#EFF6FF"
            iconColor="#1D4ED8"
          />

          <InfoRow
            label={isFaculty ? 'Advisory Contact' : 'Contact'}
            value={
              currentUser.phone ||
              (isPromotion
                ? '+1 (555) 018-7734'
                : isTreasurer
                ? '+1 (555) 013-5566'
                : isDocLead
                ? '+1 (555) 016-8844'
                : isFaculty
                ? '+1 (555) 019-2831'
                : '+1 (555) 014-9921')
            }
            icon={<Phone size={16} />}
            iconBg="#E7F9F1"
            iconColor="#065F46"
          />

          <InfoRow
            label="Academic Department"
            value={
              currentUser.department ||
              (isPromotion
                ? 'Earth Science & Media'
                : isTreasurer
                ? 'Economics & Financial Analytics'
                : isDocLead
                ? 'Geoinformatics & Archival Science'
                : isFaculty
                ? 'Geography & Geomatics'
                : 'Geoinformatics Engineering')
            }
            icon={<Building size={16} />}
            iconBg="#F3EEFF"
            iconColor="#5B21B6"
          />

          <InfoRow
            label={isFaculty ? 'Institutional Standing' : 'Standing'}
            value={
              <div className="flex items-center gap-2">
                <span>
                  {currentUser.yearOfStudy ||
                    (isPromotion || isTreasurer || isDocLead
                      ? '3rd Year (Junior)'
                      : isFaculty
                      ? 'Faculty Staff'
                      : 'Final Year (4th)')}
                </span>
                {(currentUser.team || isPromotion || isTreasurer || isDocLead) && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: isPromotion ? '#F5F3FF' : '#ECFDF5',
                      color: isPromotion ? '#6D28D9' : '#065F46',
                      border: isPromotion ? '1px solid #DDD6FE' : '1px solid #A7F3D0',
                    }}
                  >
                    {currentUser.team || (isPromotion ? 'Promotion' : isTreasurer ? 'Management' : 'Documentation')} Squad
                  </span>
                )}
              </div>
            }
            icon={<GraduationCap size={16} />}
            iconBg="#FFF8E6"
            iconColor="#92400E"
          />

          <InfoRow
            label="Assigned Operational Squad"
            value={
              currentUser.team
                ? `${currentUser.team} Squad`
                : isPromotion
                ? 'Promotion Squad'
                : isTreasurer
                ? 'Management Squad'
                : isDocLead
                ? 'Documentation Squad'
                : 'Executive Administration'
            }
            icon={<Users2 size={16} />}
            iconBg="#E8FBF8"
            iconColor="#0F766E"
          />
        </div>
      </div>

      {/* Action Buttons: Switch Demo Role & Logout */}
      <div className="flex flex-col gap-3 pt-1">
        {/* Switch Demo Role outlined button with shield icon */}
        <button
          type="button"
          onClick={() => setIsRoleSwitcherOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs bg-white border border-slate-200 text-slate-800 shadow-xs hover:border-emerald-400 hover:text-emerald-700 transition-all cursor-pointer active:scale-98"
        >
          <Shield size={16} className="text-emerald-600" />
          <span>Switch Demo Role (Preview As Another Role)</span>
        </button>

        {/* Logout button in danger-soft style */}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs transition-all cursor-pointer active:scale-98"
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
          }}
        >
          <LogOut size={16} />
          <span>Sign Out of GeoHub</span>
        </button>
      </div>

      {/* Dynamic QR Pass Bottom Sheet */}
      <BottomSheet
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Dynamic Chapter Pass"
        subtitle="30-second cryptographic token for gate entry verification"
      >
        <div className="flex flex-col items-center text-center py-2">
          {/* QR Code Container */}
          <div
            className="p-4 rounded-3xl bg-white border-2 border-emerald-200 shadow-md mb-4"
            style={{ width: '220px', height: '220px' }}
          >
            <QRCodeSVG
              value={qrToken}
              size={188}
              level="H"
              includeMargin={false}
              fgColor="#064E3B"
            />
          </div>

          {/* Countdown timer pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs mb-3">
            <RotateCw size={13} className="animate-spin text-emerald-600" />
            <span>Refreshes in {secondsLeft}s</span>
          </div>

          {/* Security Token String */}
          <div
            onClick={handleCopyToken}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 cursor-pointer hover:bg-slate-100 mb-2"
          >
            <span>{qrToken}</span>
            {copiedToken ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          </div>

          <p className="text-[11px] text-slate-400 font-medium max-w-xs">
            Hold this pass under the entrance camera terminal. Tokens rotate automatically every 30 seconds to prevent replay.
          </p>
        </div>
      </BottomSheet>
    </div>
  );
};
