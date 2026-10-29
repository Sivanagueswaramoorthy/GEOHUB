import React, { useState } from 'react';
import { Plus, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from '../../components/common/TaskCard';
import { TaskPriority, TaskStatus } from '../../types';
import {
  PillButton,
  StatusChip,
  Avatar,
  BottomSheet,
  EmptyState,
  SegmentedTabs,
  Mascot,
} from '../../components/shared';

export const TasksListView: React.FC = () => {
  const {
    currentUser,
    tasks,
    users,
    selectedTaskId,
    setSelectedTaskId,
    updateTaskStatus,
    addTaskComment,
    createTask,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  // New Task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTeam, setNewTeam] = useState(currentUser.team || 'Management');
  const [newAssigneeId, setNewAssigneeId] = useState(users[0]?.uid || '');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTaskId) return;
    addTaskComment(selectedTaskId, commentText.trim());
    setCommentText('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const assignee = users.find((u) => u.uid === newAssigneeId);
    createTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      team: newTeam,
      assigneeId: newAssigneeId || currentUser.uid,
      assigneeName: assignee ? assignee.name : currentUser.name,
      createdById: currentUser.uid,
      createdByName: currentUser.name,
      status: 'todo',
      priority: newPriority,
      dueDate: newDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    });
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const tabs = [
    { key: 'all', label: `All (${tasks.length})` },
    { key: 'todo', label: `To Do (${tasks.filter((t) => t.status === 'todo').length})` },
    { key: 'in_progress', label: `In Progress (${tasks.filter((t) => t.status === 'in_progress').length})` },
    { key: 'done', label: `Done (${tasks.filter((t) => t.status === 'done').length})` },
  ];

  // If viewing a single task detail
  if (selectedTask) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="select-none">
        <PillButton
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={14} strokeWidth={2} />}
          onClick={() => setSelectedTaskId(null)}
        >
          Back
        </PillButton>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #DAF1DE',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(5,31,32,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#DAF1DE',
                color: '#0B2B26',
                padding: '3px 10px',
                borderRadius: '9999px',
                border: '1px solid #8EB69B',
              }}
            >
              {selectedTask.team} Squad
            </span>
            <StatusChip status={selectedTask.status === 'done' ? 'done' : 'live'} label={selectedTask.status} />
          </div>

          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#051F20', margin: 0 }}>
            {selectedTask.title}
          </h1>

          <p style={{ fontSize: '13px', color: '#235347', margin: 0, lineHeight: 1.5 }}>
            {selectedTask.description || 'No description provided.'}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '16px',
              backgroundColor: '#F6FBF7',
              border: '1px solid #DAF1DE',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar name={selectedTask.assigneeName} size={32} />
              <div>
                <span style={{ color: '#235347', display: 'block' }}>Assigned Scholar</span>
                <span style={{ fontWeight: 700, color: '#051F20' }}>{selectedTask.assigneeName}</span>
              </div>
            </div>

            <PillButton
              variant={selectedTask.status === 'done' ? 'secondary' : 'primary'}
              size="sm"
              onClick={() =>
                updateTaskStatus(selectedTask.id, selectedTask.status === 'done' ? 'in_progress' : 'done')
              }
            >
              {selectedTask.status === 'done' ? 'Reopen' : 'Mark Done'}
            </PillButton>
          </div>

          {/* Comments Thread */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px', borderTop: '1px solid #DAF1DE' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#051F20', margin: 0 }}>
              Discussion ({(selectedTask.comments || []).length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(selectedTask.comments || []).map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '14px',
                    backgroundColor: '#F6FBF7',
                    border: '1px solid #DAF1DE',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, color: '#051F20' }}>{c.authorName}</span>
                    <span style={{ color: '#235347' }}>
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#051F20' }}>{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                placeholder="Add a remark..."
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '16px',
                  border: '1px solid #DAF1DE',
                  padding: '0 12px',
                  fontSize: '12px',
                  outline: 'none',
                }}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <PillButton type="submit" variant="primary" size="sm" icon={<Send size={14} />}>
                Post
              </PillButton>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      {/* Micro-copy: 1 headline (2-4 words), 1 subtitle (< 6 words) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1
            style={{
              fontSize: '28px',
              lineHeight: '32px',
              fontWeight: 800,
              color: '#051F20',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Task Deliverables
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Squad duties & station checklists
          </p>
        </div>

        <PillButton
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New task
        </PillButton>
      </div>

      {/* SegmentedTabs */}
      <SegmentedTabs
        tabs={tabs}
        activeTab={statusFilter}
        onChange={(k) => setStatusFilter(k as any)}
      />

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTasks.length === 0 ? (
          <EmptyState
            mascot="clipboard"
            title="No deliverables"
            description="All tasks are completed or filtered"
            actionLabel="New task"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setSelectedTaskId(task.id)}
              onToggleDone={() =>
                updateTaskStatus(task.id, task.status === 'done' ? 'in_progress' : 'done')
              }
            />
          ))
        )}
      </div>

      {/* New Task BottomSheet */}
      <BottomSheet
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="New Task"
        subtitle="Create squad deliverable"
      >
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Set up drone battery charging station"
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Operational Squad
            </label>
            <select
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
            >
              <option value="Management">Management</option>
              <option value="Documentation">Documentation</option>
              <option value="Promotion">Promotion</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Assignee
            </label>
            <select
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={newAssigneeId}
              onChange={(e) => setNewAssigneeId(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.name} ({u.department || 'Student'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Task instructions..."
              style={{
                width: '100%',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '10px 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'none',
              }}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Save
          </PillButton>
        </form>
      </BottomSheet>
    </div>
  );
};

export default TasksListView;
