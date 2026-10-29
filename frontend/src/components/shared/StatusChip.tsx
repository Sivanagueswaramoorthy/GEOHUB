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
          bg: '#DAF1DE',
          color: '#235347',
          border: '1px solid #8EB69B',
          text: label || 'Draft',
        };
      case 'submitted':
        return {
          bg: 'rgba(142, 182, 155, 0.25)',
          color: '#0B2B26',
          border: '1px solid #8EB69B',
          text: label || 'Submitted',
        };
      case 'approved':
        return {
          bg: '#235347',
          color: '#FFFFFF',
          border: 'none',
          text: label || 'Approved',
        };
      case 'live':
        return {
          bg: '#163832',
          color: '#FFFFFF',
          border: 'none',
          text: label || 'Live',
          hasPulse: true,
        };
      case 'done':
        return {
          bg: '#DAF1DE',
          color: '#0B2B26',
          border: '1px solid #8EB69B',
          text: label || 'Done',
          hasCheck: true,
        };
      case 'archived':
        return {
          bg: '#FFFFFF',
          color: '#235347',
          border: '1px solid #DAF1DE',
          text: label || 'Archived',
        };
      case 'cancelled':
      case 'rejected':
        return {
          bg: 'rgba(217, 83, 79, 0.12)',
          color: '#D9534F',
          border: '1px solid rgba(217, 83, 79, 0.35)',
          text: label || (normStatus === 'rejected' ? 'Rejected' : 'Cancelled'),
        };
      case 'pending':
        return {
          bg: 'rgba(242, 184, 75, 0.16)',
          color: '#051F20',
          border: '1px solid rgba(242, 184, 75, 0.40)',
          text: label || 'Pending',
        };
      case 'low-stock':
      case 'low_stock':
        return {
          bg: 'rgba(242, 184, 75, 0.16)',
          color: '#051F20',
          border: '1px solid rgba(242, 184, 75, 0.40)',
          text: label || 'Low stock',
        };
      default:
        return {
          bg: '#DAF1DE',
          color: '#051F20',
          border: '1px solid #DAF1DE',
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
