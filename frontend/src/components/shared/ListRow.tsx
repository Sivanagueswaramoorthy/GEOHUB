import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface ListRowProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ListRow: React.FC<ListRowProps> = ({
  icon,
  title,
  subtitle,
  meta,
  chevron = true,
  onClick,
  className = '',
  style,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`flex items-center justify-between p-3.5 bg-white border border-[#DAF1DE] select-none transition-all ${
        onClick ? 'pressable cursor-pointer hover:border-[#8EB69B]' : ''
      } ${className}`}
      style={{
        borderRadius: '20px',
        boxShadow: '0 4px 14px rgba(5, 31, 32, 0.04)',
        minHeight: '56px',
        ...style,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F6FBF7] text-[#163832] border border-[#DAF1DE] shrink-0">
            {icon}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-[#051F20] truncate leading-tight">
            {title}
          </span>
          {subtitle && (
            <span className="text-xs font-medium text-[#235347] truncate mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {meta && <div className="text-xs font-semibold text-[#235347]">{meta}</div>}
        {chevron && (
          <div className="flex items-center justify-center w-7 h-7 rounded-full text-[#235347]">
            <ChevronRight size={16} strokeWidth={2.2} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ListRow;
