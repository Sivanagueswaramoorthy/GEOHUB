import React, { useState, useEffect } from 'react';
import { Bell, Plus } from 'lucide-react';
import { orgConfig } from '../config/org';
import { QuickActionsSheet } from './QuickActionsSheet';
import { useApp } from '../context/AppContext';
import { COMPONENTS } from '../styles/tokens';

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
  const { notifications, setActiveTab, isPhoneFrame } = useApp();
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length : 0;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 8) {
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
          height: `${COMPONENTS.header.height}px`,
          minHeight: `${COMPONENTS.header.height}px`,
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
          {/* Two-tone Wordmark Left (flush to gutter) */}
          <div
            className="flex items-center select-none cursor-pointer"
            onClick={() => setActiveTab('home')}
            style={{ cursor: 'pointer' }}
          >
            <span
              className="font-extrabold tracking-tight"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: '18px',
                lineHeight: '24px',
                fontWeight: 800,
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
                lineHeight: '24px',
                fontWeight: 800,
                color: orgConfig.brandGreen,
                letterSpacing: '-0.02em',
              }}
            >
              {orgConfig.wordmarkPart2}
            </span>
          </div>

          {/* Right Action Buttons (44px circles, 12px apart, right-aligned to gutter) */}
          <div
            className="flex items-center"
            style={{
              gap: `${COMPONENTS.header.buttonGap}px`,
            }}
          >
            {/* Bell Button (44px circular white button) */}
            <button
              type="button"
              onClick={handleBellClick}
              className="relative flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 rounded-full"
              style={{
                width: `${COMPONENTS.header.buttonSize}px`,
                height: `${COMPONENTS.header.buttonSize}px`,
                minWidth: `${COMPONENTS.header.buttonSize}px`,
                minHeight: `${COMPONENTS.header.buttonSize}px`,
                borderRadius: '999px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #EEF1F5',
                color: '#0F172A',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                boxSizing: 'border-box',
              }}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={24} strokeWidth={1.75} className="text-slate-700" />
              {unreadCount > 0 && (
                <span
                  className="absolute"
                  style={{
                    top: '10px',
                    right: '10px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    border: '2px solid #FFFFFF',
                  }}
                />
              )}
            </button>

            {/* Plus Button (44px mint circular action button) */}
            <button
              type="button"
              onClick={() => setIsQuickActionsOpen(true)}
              className="flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 rounded-full"
              style={{
                width: `${COMPONENTS.header.buttonSize}px`,
                height: `${COMPONENTS.header.buttonSize}px`,
                minWidth: `${COMPONENTS.header.buttonSize}px`,
                minHeight: `${COMPONENTS.header.buttonSize}px`,
                borderRadius: '999px',
                backgroundColor: '#E7F9F1',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.16)',
                boxSizing: 'border-box',
              }}
              title="Quick Actions"
              aria-label="Quick Actions"
            >
              <Plus size={24} strokeWidth={1.75} />
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
