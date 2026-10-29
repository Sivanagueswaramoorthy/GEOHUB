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
  Award,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import {
  Avatar,
  PillButton,
  StatusChip,
  BottomSheet,
} from '../../components/shared';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    setIsRoleSwitcherOpen,
    logout,
    attendance,
  } = useApp();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [qrToken, setQrToken] = useState(() => `GEO-AUTH-${currentUser.uid}-${Date.now().toString(36)}`);
  const [copiedToken, setCopiedToken] = useState(false);

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

  const handleCopyToken = () => {
    navigator.clipboard?.writeText(qrToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const isFaculty = currentUser.role === 'super_admin' || currentUser.role === 'faculty';
  const canSwitchRole = isFaculty || Boolean(import.meta.env.DEV);

  const userAttendanceCount = attendance.filter(
    (a) => a.userId === currentUser.uid || a.userEmail === currentUser.email
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      {/* Micro-copy: 1 headline (2-4 words), 1 subtitle (< 6 words) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1
            style={{
              fontSize: '28px',
              lineHeight: '32px',
              fontWeight: 800,
              color: '#051F20',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            My Profile
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Scholar credentials & standing
          </p>
        </div>

        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '9999px',
            backgroundColor: '#DAF1DE',
            color: '#0B2B26',
            border: '1px solid #8EB69B',
          }}
        >
          #{currentUser.uid}
        </span>
      </div>

      {/* Identity Card with 72px Avatar, Name, Roll number, Role badge, Squad and Post chips */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #DAF1DE',
          padding: '24px 20px',
          boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Dynamic QR Quick Launcher Button */}
        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '40px',
            height: '40px',
            borderRadius: '9999px',
            backgroundColor: '#DAF1DE',
            border: '1px solid #8EB69B',
            color: '#163832',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(5, 31, 32, 0.08)',
          }}
          title="Open Chapter Pass"
          aria-label="Open Chapter Pass"
        >
          <QrCode size={18} strokeWidth={2} />
        </button>

        {/* 72px Avatar with online status */}
        <div style={{ marginBottom: '12px' }}>
          <Avatar name={currentUser.name} size={72} status="online" />
        </div>

        {/* Name */}
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#051F20',
            margin: '0 0 4px 0',
            letterSpacing: '-0.01em',
          }}
        >
          {currentUser.name}
        </h2>

        {/* Roll Number */}
        <p style={{ fontSize: '13px', color: '#235347', margin: '0 0 12px 0', fontWeight: 600 }}>
          {currentUser.email}
        </p>

        {/* Role & Squad Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: '#163832',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '9999px',
              textTransform: 'capitalize',
            }}
          >
            {currentUser.role.replace(/_/g, ' ')}
          </span>

          {currentUser.post && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#DAF1DE',
                color: '#0B2B26',
                padding: '4px 12px',
                borderRadius: '9999px',
                border: '1px solid #8EB69B',
              }}
            >
              {currentUser.post}
            </span>
          )}

          {currentUser.team && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#F6FBF7',
                color: '#235347',
                padding: '4px 12px',
                borderRadius: '9999px',
                border: '1px solid #DAF1DE',
              }}
            >
              {currentUser.team} Squad
            </span>
          )}
        </div>
      </div>

      {/* Dossier Card (branch, year, attendance count) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #DAF1DE',
          padding: '20px',
          boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#051F20',
            margin: 0,
          }}
        >
          Dossier
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Branch */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#235347', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={16} color="#163832" />
              Branch
            </span>
            <span style={{ color: '#051F20', fontWeight: 700 }}>
              {currentUser.department || 'Geoinformatics'}
            </span>
          </div>

          {/* Academic Year */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#235347', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={16} color="#163832" />
              Year
            </span>
            <span style={{ color: '#051F20', fontWeight: 700 }}>
              {currentUser.yearOfStudy || (isFaculty ? 'Faculty Board' : '3rd Year')}
            </span>
          </div>

          {/* Verified Attendance Count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#235347', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} color="#163832" />
              Attendance
            </span>
            <span style={{ color: '#051F20', fontWeight: 700 }}>
              {userAttendanceCount || 12} check-ins
            </span>
          </div>

          {/* Contact */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#235347', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="#163832" />
              Contact
            </span>
            <span style={{ color: '#051F20', fontWeight: 700 }}>
              {currentUser.phone || '+91 94420 18820'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Switch Role (if authorized) and Sign out */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {canSwitchRole && (
          <PillButton
            variant="secondary"
            fullWidth
            icon={<Shield size={16} strokeWidth={2} />}
            onClick={() => setIsRoleSwitcherOpen(true)}
          >
            Switch Role
          </PillButton>
        )}

        <PillButton
          variant="destructive"
          fullWidth
          icon={<LogOut size={16} strokeWidth={2} />}
          onClick={logout}
        >
          Sign out
        </PillButton>
      </div>

      {/* Dynamic QR Pass BottomSheet */}
      <BottomSheet
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Dynamic Pass"
        subtitle="30s gate verification token"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px', paddingTop: '8px' }}>
          <div
            style={{
              padding: '16px',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #8EB69B',
              boxShadow: '0 8px 24px rgba(5,31,32,0.08)',
            }}
          >
            <QRCodeSVG
              value={qrToken}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#051F20"
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: '#DAF1DE',
              border: '1px solid #8EB69B',
              color: '#163832',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <RotateCw size={14} className="animate-spin text-[#235347]" />
            <span>Refreshes in {secondsLeft}s</span>
          </div>

          <div
            onClick={handleCopyToken}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '16px',
              backgroundColor: '#F6FBF7',
              border: '1px solid #DAF1DE',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#051F20',
              cursor: 'pointer',
            }}
          >
            <span>{qrToken}</span>
            {copiedToken ? <Check size={14} color="#163832" /> : <Copy size={14} color="#235347" />}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default ProfileView;
