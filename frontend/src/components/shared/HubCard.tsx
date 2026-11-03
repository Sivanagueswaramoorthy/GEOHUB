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
      className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#8EB69B]/30 hover:border-[#8EB69B] shadow-[0_4px_16px_rgba(5,31,32,0.04)] hover:shadow-[0_8px_24px_rgba(5,31,32,0.09)] transition-all duration-200 text-left min-h-[120px] select-none ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
      } ${className}`}
    >
      {/* Top Header: Icon + Status Chips / Badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0 group-hover:scale-105 transition-transform duration-200">
          <IconComponent size={20} className="text-[#163832]" />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {pendingCount > 0 && (
            <span
              className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[12px] font-bold bg-[#F2B84B] text-[#051F20] shadow-xs"
              data-testid={`badge-pending-${id}`}
              title={`${pendingCount} pending items`}
            >
              {pendingCount}
            </span>
          )}
          <AccessChip variant={accessType} access={access} />
        </div>
      </div>

      {/* Title & Description */}
      <div className="mt-3">
        <h3 className="font-heading font-bold text-[#051F20] text-[14px] leading-tight group-hover:text-[#163832] transition-colors">
          {title}
        </h3>
        <p className="text-[12px] text-[#235347] leading-normal line-clamp-2 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HubCard;

