import React from 'react';
import { ArrowLeft, User, Search } from 'lucide-react';
import { orgConfig, OrgLogoIcon } from '../../config/org';

export interface TopBarProps {
  title?: string;
  subtitle?: string;
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
  title,
  subtitle,
  showBack = false,
  onBack,
  showProfile = true,
  onProfileClick,
  showSearch = false,
  onSearchClick,
  rightAction,
  className = '',
}) => {
  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between px-5 py-3.5 backdrop-blur-md bg-[#F6FBF7]/90 border-b border-[#DAF1DE]/60 select-none transition-all ${className}`}
      style={{ minHeight: '64px' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#163832] shadow-[0_4px_12px_rgba(5,31,32,0.06)] border border-[#DAF1DE] pressable shrink-0 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-[0_4px_12px_rgba(5,31,32,0.06)] border border-[#DAF1DE] p-1.5">
              <OrgLogoIcon size={24} />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#051F20]">
              {(orgConfig as any).shortName || orgConfig.orgName || 'GEO'}
            </span>
          </div>
        )}

        {title && (
          <div className="flex flex-col min-w-0">
            <h1 className="text-base font-bold text-[#051F20] truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <span className="text-xs font-medium text-[#235347] truncate">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {showSearch && (
          <button
            type="button"
            onClick={onSearchClick}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#163832] shadow-[0_4px_12px_rgba(5,31,32,0.06)] border border-[#DAF1DE] pressable cursor-pointer"
            aria-label="Search"
          >
            <Search size={18} strokeWidth={2} />
          </button>
        )}

        {rightAction}

        {showProfile && (
          <button
            type="button"
            onClick={onProfileClick}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#163832] shadow-[0_4px_12px_rgba(5,31,32,0.06)] border border-[#DAF1DE] pressable cursor-pointer"
            aria-label="Profile"
          >
            <User size={18} strokeWidth={2} />
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
