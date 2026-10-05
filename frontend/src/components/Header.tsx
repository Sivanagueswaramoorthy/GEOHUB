import React, { useState, useEffect } from 'react';
import { Bell, Plus, Monitor, Smartphone } from 'lucide-react';
import { orgConfig } from '../config/org';
import { QuickActionsSheet } from './QuickActionsSheet';
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
  const { notifications, setActiveTab, isPhoneFrame, setIsPhoneFrame } = useApp();
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length : 0;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-colors duration-200 ${className}`}
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: isScrolled ? '1px solid #EEF1F5' : '1px solid transparent',
          height: '64px',
          ...style,
        }}
      >
        <div
          className="mx-auto h-full flex items-center justify-between"
          style={{
            maxWidth: isPhoneFrame ? '480px' : '1280px',
            padding: '0 var(--page-padding-x)',
            transition: 'max-width 0.25s ease',
          }}
        >
          {/* Two-tone Wordmark Left */}
          <div className="flex items-center select-none cursor-pointer" onClick={() => setActiveTab('home')}>
            <span
              className="font-extrabold tracking-tight"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: '18px',
                color: orgConfig.darkGreen,
                letterSpacing: '-0.02em',
              }}
            >
              {orgConfig.wordmarkPart1}{' '}
            </span>
            <span
              className="font-extrabold tracking-tight ml-1"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: '18px',
                color: orgConfig.brandGreen,
                letterSpacing: '-0.02em',
              }}
            >
              {orgConfig.wordmarkPart2}
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Viewport Frame Toggle: Fullscreen vs Mobile Frame */}
            <button
              type="button"
              onClick={() => setIsPhoneFrame((prev) => !prev)}
              className="relative flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #EEF1F5',
                color: isPhoneFrame ? '#059669' : '#0F172A',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              }}
              title={isPhoneFrame ? 'Expand to Fullscreen View' : 'Switch to Mobile Frame'}
              aria-label="Toggle Fullscreen"
            >
              {isPhoneFrame ? <Monitor size={18} /> : <Smartphone size={18} />}
            </button>

            {/* Bell Button (44px circular outlined button with green unread dot) */}
            <button
              type="button"
              onClick={handleBellClick}
              className="relative flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #EEF1F5',
                color: '#0F172A',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              }}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-slate-700" />
              {unreadCount > 0 && (
                <span
                  className="absolute"
                  style={{
                    top: '11px',
                    right: '11px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    border: '2px solid #FFFFFF',
                  }}
                />
              )}
            </button>

            {/* Plus Button (44px mint circle with green border) */}
            <button
              type="button"
              onClick={() => setIsQuickActionsOpen(true)}
              className="flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#E7F9F1',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.16)',
              }}
              title="Quick Actions"
              aria-label="Quick Actions"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Role-based Quick Actions Bottom Sheet */}
      <QuickActionsSheet
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
      />
    </>
  );
};
