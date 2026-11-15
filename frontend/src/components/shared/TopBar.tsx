import React, { useState, useEffect } from 'react';
import { Bell, ChevronLeft, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserModel } from '../../types';
import { IconCircleButton } from './IconCircleButton';
import { ProfileSheet } from './ProfileSheet';
import astafineWordmarkFull from '../../assets/astafine-wordmark-full.png';

export interface TopBarProps {
  orgName?: string;
  orgSubtitle?: string;
  unreadCount?: number;
  user?: UserModel | {
    uid?: string;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
    isVolunteer?: boolean;
    avatarUrl?: string;
  };
  onProfile?: () => void;
  onNotifications?: () => void;
  // Aliases and backwards compatibility props
  title?: string;
  subtitle?: string;
  onHome?: () => void;
  showNotificationsInTopBar?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  showProfile?: boolean;
  onProfileClick?: () => void;
  showSearch?: boolean;
  onSearchClick?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  orgName,
  orgSubtitle,
  unreadCount: propUnreadCount,
  user: propUser,
  onProfile,
  onNotifications,
  title,
  subtitle,
  onHome,
  showNotificationsInTopBar = true,
  showBack = false,
  onBack,
  showProfile = true,
  onProfileClick,
  rightAction,
  className = '',
}) => {
  const appContext = useApp();
  const currentUser = propUser || appContext?.currentUser;
  const notifications = appContext?.notifications || [];
  const setActiveTab = appContext?.setActiveTab;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [prevUnread, setPrevUnread] = useState(0);
  const [shouldShake, setShouldShake] = useState(false);

  // Compute live unread count
  const unreadCount =
    propUnreadCount !== undefined
      ? propUnreadCount
      : notifications.filter((n) => !n.isRead).length;

  // Bell shake trigger when a new notification arrives
  useEffect(() => {
    if (unreadCount > prevUnread && prevUnread !== 0) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 400);
      return () => clearTimeout(timer);
    }
    setPrevUnread(unreadCount);
  }, [unreadCount, prevUnread]);

  // Scroll detection: transparent at rest; soft mint elevation when scrolled past 8px
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeClick = () => {
    if (onHome) {
      onHome();
    } else if (setActiveTab) {
      setActiveTab('home');
    }
  };

  const handleNotificationsClick = () => {
    if (onNotifications) {
      onNotifications();
    } else if (setActiveTab) {
      setActiveTab('notifications');
    }
  };

  const handleProfileClick = () => {
    if (onProfile) {
      onProfile();
    } else if (onProfileClick) {
      onProfileClick();
    } else if (setActiveTab) {
      setActiveTab('profile');
      if (typeof window !== 'undefined') {
        window.location.hash = 'profile';
      }
    } else {
      setIsProfileSheetOpen(true);
    }
  };

  const userInitial = currentUser?.name
    ? currentUser.name.trim().charAt(0).toUpperCase()
    : 'D';

  const bellAriaLabel =
    unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications';

  const displayOrgName = orgName || title || 'Green Eco';
  const displayOrgSubtitle = orgSubtitle || subtitle || 'Organization';
  const isDefaultBrand =
    displayOrgName === 'Green Eco' && displayOrgSubtitle === 'Organization';

  // Astafine – Serif Typeface Family by Rishsketch (Luxury display serif with ligatures)
  const astafineSerifFamily =
    "'Astafine', 'Bodoni Moda', 'Playfair Display', 'Cinzel', Didot, 'Bodoni MT', Georgia, serif";

  return (
    <>
      {/* Flush edge-to-edge TopBar: NO curved corners, NO top gap, transparent background */}
      <header
        className={`sticky top-0 z-30 w-full select-none ${className}`}
        style={{
          height: 'calc(64px + env(safe-area-inset-top, 0px))',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 0,
          marginTop: 0,
          borderRadius: 0,
          backgroundColor: isScrolled ? '#F6FBF7' : 'transparent',
          borderBottom: isScrolled ? '1px solid #DAF1DE' : '1px solid transparent',
          boxShadow: isScrolled ? '0 4px 16px rgba(5, 31, 32, 0.05)' : 'none',
          transition: 'background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
        }}
      >
        <div
          className="mx-auto h-full flex items-center justify-between"
          style={{
            maxWidth: '1280px',
            paddingLeft: '16px',
            paddingRight: '16px',
            borderRadius: 0,
          }}
        >
          {/* LEFT GROUP: Medallion Tile, Divider, Astafine Serif Typography Stack */}
          <div className="flex items-center min-w-0 pr-2">
            {showBack ? (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] text-[#051F20] bg-transparent active:scale-[0.95] transition-all duration-150 focus:outline-none shrink-0 cursor-pointer border-0 p-0"
                aria-label="Go back"
              >
                <ChevronLeft size={26} strokeWidth={2.5} className="lucide text-[#051F20]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleHomeClick}
                aria-label="GeoHub home"
                className="flex items-center min-w-0 bg-transparent border-0 p-0 m-0 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EB69B] focus-visible:ring-offset-2 rounded-xl transition-all duration-150 active:scale-[0.98]"
                style={{
                  height: '44px',
                  minHeight: '44px',
                }}
              >
                {/* Clean Editorial Wordmark: Authentic Astafine Luxury Serif */}
                {isDefaultBrand ? (
                  <div className="flex items-center min-w-0">
                    <img
                      src={astafineWordmarkFull}
                      alt="Green Eco Organization"
                      className="block object-contain object-left shrink"
                      style={{
                        height: '21px',
                        maxHeight: '23px',
                        width: 'auto',
                        maxWidth: '100%',
                      }}
                    />
                    {/* Accessible text for screen readers & testing queries */}
                    <span className="sr-only">Green Eco</span>
                    <span className="sr-only">Organization</span>
                  </div>
                ) : (
                  <div className="flex items-baseline min-w-0" style={{ gap: '6px' }}>
                    {/* Line 1: Custom Org Name in Astafine Luxury Serif */}
                    <span
                      className="geohub-bar-title font-extrabold text-[#11241B] truncate"
                      style={{
                        fontFamily: astafineSerifFamily,
                        fontSize: '20px',
                        lineHeight: '24px',
                        fontWeight: 900,
                        color: '#11241B',
                        letterSpacing: '-0.025em',
                        fontOpticalSizing: 'auto',
                        fontFeatureSettings: "'dlig' 1, 'liga' 1, 'swsh' 1, 'calt' 1",
                        textRendering: 'optimizeLegibility',
                      }}
                    >
                      {displayOrgName}
                    </span>

                    {/* Line 2: Custom Org Subtitle in Astafine Luxury Serif */}
                    {displayOrgSubtitle && (
                      <span
                        className="geohub-bar-subtitle font-bold text-[#52665C] truncate"
                        style={{
                          fontFamily: astafineSerifFamily,
                          fontSize: '12px',
                          lineHeight: '14px',
                          fontWeight: 700,
                          color: '#52665C',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          fontOpticalSizing: 'auto',
                          fontFeatureSettings: "'dlig' 1, 'liga' 1",
                          textRendering: 'optimizeLegibility',
                        }}
                      >
                        {displayOrgSubtitle}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )}
          </div>

          {/* RIGHT GROUP: High-Contrast Bell, Avatar with Dropdown Arrow */}
          <div className="flex items-center shrink-0" style={{ gap: '10px' }}>
            {rightAction}

            {/* Notification Bell (High-contrast 3D raised white disc button) */}
            {showNotificationsInTopBar && (
              <IconCircleButton
                ariaLabel={bellAriaLabel}
                unreadCount={unreadCount}
                shake={shouldShake}
                onClick={handleNotificationsClick}
                variant="bell"
                size="sm"
              >
                <Bell
                  size={18}
                  strokeWidth={2}
                  className="lucide text-[#11241B]"
                />
              </IconCircleButton>
            )}

            {/* Avatar Button with Dropdown Chevron */}
            {showProfile && (
              <button
                type="button"
                onClick={handleProfileClick}
                aria-label="Open profile menu"
                className="group flex items-center gap-1.5 p-0 m-0 bg-transparent border-0 cursor-pointer select-none rounded-full transition-transform duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#183A2B] focus-visible:ring-offset-2"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {/* 38px Avatar Circle in Deep Forest Green #183A2B with Sage Ring and Moss Hover #23523D */}
                <div
                  className="flex items-center justify-center rounded-full shrink-0 transition-colors duration-150 group-hover:bg-[#23523D] group-active:bg-[#23523D]"
                  style={{
                    width: '38px',
                    height: '38px',
                    backgroundColor: '#183A2B',
                    border: '2px solid #DCE6E0',
                    boxShadow: '0 2px 8px rgba(5, 31, 32, 0.12)',
                  }}
                >
                  <span
                    className="font-extrabold select-none"
                    style={{
                      color: '#FFFFFF',
                      fontSize: '16px',
                      lineHeight: '18px',
                      fontWeight: 800,
                    }}
                  >
                    {userInitial}
                  </span>
                </div>

                {/* Dropdown Chevron in Slate Neutral */}
                <ChevronDown
                  size={14}
                  strokeWidth={2.5}
                  className="lucide text-[#7D8F86] shrink-0"
                />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Profile BottomSheet */}
      <ProfileSheet
        isOpen={isProfileSheetOpen}
        onClose={() => setIsProfileSheetOpen(false)}
      />
    </>
  );
};

export default TopBar;
