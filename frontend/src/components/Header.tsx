import React, { useState, useEffect } from 'react';
import { Bell, QrCode, Smartphone, Monitor } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface HeaderProps {
  onOpenNotifications?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  className = '',
  style,
}) => {
  const {
    currentUser,
    notifications,
    setActiveTab,
    isPhoneFrame,
    setIsPhoneFrame,
    setIsRoleSwitcherOpen,
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length : 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBellClick = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      setActiveTab('notifications');
    }
  };

  const handleQrClick = () => {
    // If student/member, open dynamic chapter pass (my_qr); if coordinator/faculty or assigned scanner, open scan_qr
    if (currentUser.role === 'student' || currentUser.role === 'member') {
      setActiveTab('my_qr');
    } else {
      setActiveTab('scan_qr');
    }
  };

  // Role switcher allows faculty or developers to preview as other roles
  const canSwitchRole =
    currentUser.role === 'faculty' ||
    currentUser.role === 'super_admin' ||
    Boolean(import.meta.env?.DEV);

  const getRoleBadgeLabel = () => {
    if (currentUser.post && currentUser.post.trim()) {
      return currentUser.post.toUpperCase();
    }
    switch (currentUser.role) {
      case 'faculty':
      case 'super_admin':
        return 'FACULTY ADVISOR';
      case 'coordinator':
      case 'admin':
        return 'CLUB PRESIDENT';
      case 'treasurer':
        return 'TREASURER';
      case 'documentation':
        return 'DOCUMENTATION LEAD';
      case 'promotion':
      case 'social_media':
        return 'PROMOTION LEAD';
      case 'student':
      case 'member':
      default:
        return currentUser.team ? `${currentUser.team.toUpperCase()} SQUAD` : 'STUDENT MEMBER';
    }
  };

  const badgeLabel = getRoleBadgeLabel();

  return (
    <header
      role="banner"
      className={`sticky top-0 z-40 w-full transition-colors duration-200 select-none ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #DAF1DE',
        boxShadow: isScrolled ? '0 4px 16px rgba(5, 31, 32, 0.05)' : 'none',
        height: '64px',
        minHeight: '64px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        className="mx-auto h-full flex items-center justify-between"
        style={{
          maxWidth: isPhoneFrame ? '480px' : '1200px',
          paddingLeft: 'var(--page-padding-x, 20px)',
          paddingRight: 'var(--page-padding-x, 20px)',
          boxSizing: 'border-box',
          height: '100%',
        }}
      >
        {/* Left Brand Lockup: Clean Leaf Logo + Two-tone GEO•HUB + Role Credential Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer bg-transparent border-0 p-0 text-left focus:outline-none transition-transform active:scale-95"
            aria-label="GeoHub Home"
          >
            {/* Official Clean App Logo */}
            <img
              src="./app-logo-clean.png"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/app-logo-clean.png';
              }}
              alt="GeoHub Logo"
              style={{
                height: '34px',
                width: 'auto',
                maxHeight: '34px',
                objectFit: 'contain',
                display: 'block',
              }}
              draggable={false}
            />

            {/* Brand Wordmark GEO • HUB */}
            <div className="flex items-center">
              <span
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: '18px',
                  lineHeight: '24px',
                  fontWeight: 800,
                  color: '#051F20',
                  letterSpacing: '-0.02em',
                }}
              >
                GEO
              </span>
              <span
                style={{
                  display: 'inline-block',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#8EB69B',
                  margin: '0 4px',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: '18px',
                  lineHeight: '24px',
                  fontWeight: 800,
                  color: '#235347',
                  letterSpacing: '-0.02em',
                }}
              >
                HUB
              </span>
            </div>
          </button>

          {/* Role Credential Pill */}
          {canSwitchRole ? (
            <button
              type="button"
              onClick={() => setIsRoleSwitcherOpen(true)}
              className="inline-flex items-center justify-center rounded-full font-bold uppercase transition-all duration-150 cursor-pointer active:scale-95 shrink-0 focus:outline-none"
              style={{
                height: '28px',
                padding: '0 12px',
                backgroundColor: '#DAF1DE',
                border: '1px solid #8EB69B',
                color: '#051F20',
                fontSize: '12px',
                lineHeight: '16px',
                letterSpacing: '0.04em',
              }}
              title={`Role: ${badgeLabel} (Click to preview another role)`}
              aria-label={`Current Role: ${badgeLabel}. Click to preview another role.`}
            >
              <span className="truncate max-w-[120px] sm:max-w-none">{badgeLabel}</span>
            </button>
          ) : (
            <div
              className="inline-flex items-center justify-center rounded-full font-bold uppercase shrink-0"
              style={{
                height: '28px',
                padding: '0 12px',
                backgroundColor: '#DAF1DE',
                border: '1px solid #8EB69B',
                color: '#051F20',
                fontSize: '12px',
                lineHeight: '16px',
                letterSpacing: '0.04em',
              }}
              title={`Role: ${badgeLabel}`}
            >
              <span className="truncate max-w-[120px] sm:max-w-none">{badgeLabel}</span>
            </div>
          )}
        </div>

        {/* Right Action Buttons (40px circular white buttons with soft shadow) */}
        <div className="flex items-center gap-2.5">
          {/* Frame-mode toggle button */}
          <button
            type="button"
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center justify-center rounded-full transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none"
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: '9999px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DAF1DE',
              color: '#235347',
              boxShadow: '0 2px 8px rgba(5, 31, 32, 0.05)',
            }}
            title={isPhoneFrame ? 'Switch to Fullscreen' : 'Switch to Phone Frame'}
            aria-label={isPhoneFrame ? 'Switch to Fullscreen' : 'Switch to Phone Frame'}
          >
            {isPhoneFrame ? (
              <Monitor size={18} strokeWidth={2} style={{ color: '#235347' }} />
            ) : (
              <Smartphone size={18} strokeWidth={2} style={{ color: '#235347' }} />
            )}
          </button>

          {/* QR Pass Quick Launcher */}
          <button
            type="button"
            onClick={handleQrClick}
            className="flex items-center justify-center rounded-full transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none"
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: '9999px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DAF1DE',
              color: '#235347',
              boxShadow: '0 2px 8px rgba(5, 31, 32, 0.05)',
            }}
            title="Open Chapter Pass / Scanner"
            aria-label="Open Chapter Pass / Scanner"
          >
            <QrCode size={18} strokeWidth={2} style={{ color: '#235347' }} />
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={handleBellClick}
            className="relative flex items-center justify-center rounded-full transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none"
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: '9999px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DAF1DE',
              color: '#235347',
              boxShadow: '0 2px 8px rgba(5, 31, 32, 0.05)',
            }}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={2} style={{ color: '#235347' }} />
            {unreadCount > 0 && (
              <span
                className="absolute"
                style={{
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#D9534F',
                  border: '2px solid #FFFFFF',
                }}
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
