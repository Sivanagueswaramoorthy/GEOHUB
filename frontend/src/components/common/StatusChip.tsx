import React from 'react';

interface StatusChipProps {
  status: string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, className = '' }) => {
  const getStyleClass = () => {
    switch (status.toLowerCase()) {
      case 'live':
      case 'done':
      case 'active':
      case 'approved':
      case 'verified':
        return 'success';
      case 'in_progress':
      case 'submitted':
      case 'pending':
      case 'medium':
        return 'warning';
      case 'flagged':
      case 'rejected':
      case 'disabled':
      case 'high':
        return 'danger';
      case 'todo':
      case 'draft':
      case 'low':
      case 'completed':
      case 'archived':
      default:
        return 'neutral';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span className={`status-badge ${getStyleClass()} ${className}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          display: 'inline-block',
        }}
      />
      {formatText(status)}
    </span>
  );
};
