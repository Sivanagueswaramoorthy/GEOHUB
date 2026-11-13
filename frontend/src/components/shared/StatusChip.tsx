import React from 'react';
import { Check } from 'lucide-react';

export type StatusType =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'live'
  | 'done'
  | 'archived'
  | 'cancelled'
  | 'rejected'
  | 'pending'
  | 'low_stock'
  | 'low-stock';

export interface StatusChipProps {
  status: StatusType | string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  className = '',
  style,
}) => {
  const normStatus = status.toLowerCase().replace(/_/g, '-') as StatusType;

  const getConfig = () => {
    switch (normStatus) {
      case 'draft':
        return {
          bg: 'rgba(107, 142, 120, 0.15)',
          color: '#0F3638',
          border: '1px solid rgba(107, 142, 120, 0.30)',
          text: label || 'Draft',
        };
      case 'submitted':
        return {
          bg: 'rgba(107, 142, 120, 0.18)',
          color: '#0F3638',
          border: '1px solid rgba(107, 142, 120, 0.35)',
          text: label || 'Submitted',
        };
      case 'approved':
        return {
          bg: '#184E50',
          color: '#FFFFFF',
          border: 'none',
          text: label || 'Approved',
        };
      case 'live':
        return {
          bg: '#184E50',
          color: '#FFFFFF',
          border: 'none',
          text: label || 'Live',
          hasPulse: true,
        };
      case 'done':
        return {
          bg: 'rgba(107, 142, 120, 0.15)',
          color: '#0F3638',
          border: '1px solid rgba(107, 142, 120, 0.30)',
          text: label || 'Done',
          hasCheck: true,
        };
      case 'archived':
        return {
          bg: '#FFFFFF',
          color: '#52705E',
          border: '1px solid #E5ECE8',
          text: label || 'Archived',
        };
      case 'cancelled':
      case 'rejected':
        return {
          bg: 'rgba(200, 109, 81, 0.14)',
          color: '#C86D51',
          border: '1px solid rgba(200, 109, 81, 0.35)',
          text: label || (normStatus === 'rejected' ? 'Rejected' : 'Cancelled'),
        };
      case 'pending':
        return {
          bg: 'rgba(212, 163, 89, 0.15)',
          color: '#0F3638',
          border: '1px solid rgba(212, 163, 89, 0.35)',
          text: label || 'Pending',
        };
      case 'low-stock':
      case 'low_stock':
        return {
          bg: 'rgba(212, 163, 89, 0.15)',
          color: '#0F3638',
          border: '1px solid rgba(212, 163, 89, 0.35)',
          text: label || 'Low stock',
        };
      default:
        return {
          bg: 'rgba(24, 78, 80, 0.08)',
          color: '#0F3638',
          border: '1px solid rgba(24, 78, 80, 0.15)',
          text: label || status,
        };
    }
  };

  const config = getConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 select-none font-semibold text-xs leading-none whitespace-nowrap ${className}`}
      style={{
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.color,
        border: config.border,
        fontSize: '12px',
        minHeight: '24px',
        ...style,
      }}
    >
      {config.hasPulse && (
        <span
          className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
          style={{ backgroundColor: '#8EB69B' }}
        />
      )}
      {config.hasCheck && <Check size={12} strokeWidth={2.2} className="shrink-0" />}
      <span>{config.text}</span>
    </span>
  );
};

export default StatusChip;
