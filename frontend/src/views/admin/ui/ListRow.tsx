import React from 'react';

export interface ListRowProps {
  leftSlot?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightSlot?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
}

export const ListRow: React.FC<ListRowProps> = ({
  leftSlot,
  title,
  subtitle,
  rightSlot,
  onClick,
  className = '',
  selected = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`min-h-[64px] py-3 px-3.5 bg-white border rounded-xl flex items-center justify-between gap-3 transition-all select-none shadow-xs ${
        onClick ? 'cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/20' : ''
      } ${
        selected ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20' : 'border-slate-200/90'
      } ${className}`}
    >
      {/* Left Slot (Checkbox or Avatar) */}
      {leftSlot && (
        <div
          className="shrink-0 flex items-center justify-center min-w-[36px]"
          onClick={(e) => e.stopPropagation()}
        >
          {leftSlot}
        </div>
      )}

      {/* Main Content (Title + Subtitle) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="text-sm font-bold text-slate-900 truncate leading-tight">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs font-semibold text-slate-500 truncate leading-normal mt-0.5">
            {subtitle}
          </div>
        )}
      </div>

      {/* Right Slot (Chip or Kebab Menu) */}
      {rightSlot && (
        <div
          className="shrink-0 flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {rightSlot}
        </div>
      )}
    </div>
  );
};

export default ListRow;
