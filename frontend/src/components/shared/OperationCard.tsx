import React from 'react';
import { Mascot, MascotName } from './Mascot';

export interface OperationCardProps {
  mascot: MascotName;
  title: string;
  meta?: React.ReactNode;
  description: string;
  actionLabel?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const OperationCard: React.FC<OperationCardProps> = ({
  mascot,
  title,
  meta,
  description,
  actionLabel = 'Manage',
  onClick,
  className = '',
  style,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`pressable bg-white border border-[#DAF1DE] hover:border-[#8EB69B] active:scale-[0.99] transition-all select-none ${className}`}
      style={{
        borderRadius: '24px',
        padding: '20px',
        boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Mascot name={mascot} size="sm" />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
            {title}
          </h3>
        </div>
        {meta}
      </div>

      <p style={{ fontSize: '13px', color: '#235347', margin: 0, lineHeight: 1.5 }}>
        {description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
          {actionLabel} →
        </span>
      </div>
    </div>
  );
};

export default OperationCard;

