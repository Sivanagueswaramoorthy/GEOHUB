import React from 'react';

export interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  icon,
  iconBg = '#E7F9F1',
  iconColor = '#065F46',
  className = '',
  style,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0 ${className}`}
      style={{
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: iconBg,
              color: iconColor,
            }}
          >
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          <span
            className="font-bold text-slate-400 uppercase tracking-wider"
            style={{ fontSize: '11px', lineHeight: 1.2 }}
          >
            {label}
          </span>
          <span
            className="font-bold text-slate-900 mt-0.5"
            style={{ fontSize: '13px', lineHeight: 1.3 }}
          >
            {value}
          </span>
        </div>
      </div>
    </div>
  );
};
