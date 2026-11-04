import React from 'react';
import {
  Users,
  UserCheck,
  Shield,
  QrCode,
  Scan,
  MapPin,
  ClipboardList,
  Key,
  Landmark,
  BookOpen,
  Receipt,
  FileSpreadsheet,
  Calendar,
  UploadCloud,
  Newspaper,
  LayoutTemplate,
  FolderUp,
  FileText,
  Radio,
  Share2,
  CheckCircle2,
  CheckSquare,
  HelpCircle,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { AccessLevel } from '../../core/permissions';
import { AccessChip, AccessChipVariant } from './AccessChip';

export const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  UserCheck,
  Shield,
  QrCode,
  Scan,
  MapPin,
  ClipboardList,
  Key,
  Landmark,
  BookOpen,
  Receipt,
  FileSpreadsheet,
  Calendar,
  UploadCloud,
  Newspaper,
  LayoutTemplate,
  FolderUp,
  FileText,
  Radio,
  Share2,
  CheckCircle2,
  CheckSquare,
};

export interface HubCardProps {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  iconName?: string;
  accessType?: AccessChipVariant;
  access?: AccessLevel;
  pendingCount?: number;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  hideDescription?: boolean;
  hideAccessChip?: boolean;
}

export const HubCard: React.FC<HubCardProps> = ({
  id,
  title,
  description,
  icon,
  iconName,
  accessType = 'manage',
  access,
  pendingCount = 0,
  onClick,
  className = '',
  disabled = false,
  hideDescription = false,
  hideAccessChip = false,
}) => {
  const IconComponent = icon || (iconName && ICON_MAP[iconName]) || HelpCircle;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={handleKeyDown}
      data-testid={`hub-card-${id}`}
      className={`group relative flex items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-white border border-[#DAF1DE] hover:border-[#8EB69B] shadow-[0_2px_12px_rgba(5,31,32,0.03)] hover:shadow-[0_6px_20px_rgba(5,31,32,0.06)] hover:-translate-y-0.5 transition-all duration-200 text-left select-none ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {/* Icon Container */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DAF1DE] to-[#F6FBF7] border border-[#8EB69B]/40 flex items-center justify-center text-[#163832] shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
          <IconComponent size={19} className="text-[#163832]" strokeWidth={2.2} />
        </div>

        {/* Main Content (Title, Description) */}
        <div className="flex-1 min-w-0 pr-0.5">
          <h3 className="font-heading font-bold text-[#051F20] text-sm sm:text-base leading-snug group-hover:text-[#163832] transition-colors truncate">
            {title}
          </h3>
          {!hideDescription && description && (
            <p className="text-xs text-[#235347] leading-relaxed line-clamp-2 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right-side affordances: Pending badge + AccessChip (optional) + Chevron */}
      <div className="flex items-center gap-2 shrink-0">
        {pendingCount > 0 && (
          <span
            className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#F2B84B] text-[#051F20] shadow-xs"
            data-testid={`badge-pending-${id}`}
            title={`${pendingCount} pending items`}
          >
            {pendingCount}
          </span>
        )}
        {!hideAccessChip && (
          <AccessChip variant={accessType} access={access} />
        )}
        <div className="flex items-center text-[#8EB69B] group-hover:text-[#163832] group-hover:translate-x-0.5 transition-all shrink-0">
          <ChevronRight size={17} />
        </div>
      </div>
    </div>
  );
};

export default HubCard;

