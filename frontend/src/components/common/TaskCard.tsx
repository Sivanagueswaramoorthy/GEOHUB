import React from 'react';
import { Calendar, CheckCircle2, MessageSquare, Paperclip } from 'lucide-react';
import { TaskModel } from '../../types';
import { StatusChip } from './StatusChip';
import { AppAvatar } from './AppAvatar';

interface TaskCardProps {
  task: TaskModel;
  onClick: () => void;
  onToggleDone?: (e: React.MouseEvent) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onToggleDone }) => {
  const formatDueDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'rgba(220, 38, 38, 0.12)', color: '#DC2626' };
      case 'medium':
        return { bg: 'rgba(217, 119, 6, 0.12)', color: '#D97706' };
      case 'low':
      default:
        return { bg: 'rgba(100, 116, 139, 0.12)', color: '#475569' };
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);

  return (
    <div
      className="app-card interactive"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '10px',
        borderLeft: task.status === 'done' ? '4px solid #16A34A' : '4px solid #0F766E',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '999px',
              backgroundColor: priorityStyle.bg,
              color: priorityStyle.color,
              textTransform: 'uppercase',
            }}
          >
            {task.priority}
          </span>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {task.team}
          </span>
        </div>
        <StatusChip status={task.status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        {onToggleDone && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleDone(e);
            }}
            style={{
              padding: 0,
              color: task.status === 'done' ? '#16A34A' : '#CBD5E1',
              marginTop: '2px',
            }}
          >
            <CheckCircle2 size={20} />
          </button>
        )}
        <h4
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: task.status === 'done' ? '#64748B' : '#0F172A',
            lineHeight: 1.4,
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </h4>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid #E8ECF2',
          fontSize: '12px',
          color: '#64748B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AppAvatar name={task.assigneeName} avatarUrl={task.assigneeAvatar} size={22} />
          <span style={{ fontWeight: 500 }}>{task.assigneeName}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {(task.proofUrl || task.proofNote) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#16A34A' }}>
              <Paperclip size={13} />
              Proof
            </span>
          )}
          {task.comments.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MessageSquare size={13} />
              {task.comments.length}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} />
            <span>{formatDueDate(task.dueDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
