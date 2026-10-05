import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendPositive,
  onClick,
}) => {
  return (
    <div
      className={`stat-card ${onClick ? 'interactive' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="stat-card-icon">{icon}</div>
        {trend && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: trendPositive ? '#16A34A' : '#64748B',
              backgroundColor: trendPositive ? 'rgba(22, 163, 74, 0.1)' : '#F1F5F9',
              padding: '2px 6px',
              borderRadius: '999px',
            }}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  );
};
