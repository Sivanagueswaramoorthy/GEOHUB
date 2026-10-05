import React, { useState } from 'react';
import { Plus, ArrowLeft, Send, CheckCircle2, Paperclip, MessageSquare, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from '../../components/common/TaskCard';
import { StatusChip } from '../../components/common/StatusChip';
import { AppAvatar } from '../../components/common/AppAvatar';
import { Modal } from '../../components/common/Modal';
import { TaskPriority, TaskStatus } from '../../types';

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
  const [teamFilter, setTeamFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Comment input
  const [commentText, setCommentText] = useState('');
  // Proof input
  const [proofNote, setProofNote] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  // New Task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTeam, setNewTeam] = useState(currentUser.team || 'Management');
  const [newAssigneeId, setNewAssigneeId] = useState(users[0]?.uid || '');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (teamFilter !== 'All' && t.team !== teamFilter) return false;
    return true;
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTaskId) return;
    addTaskComment(selectedTaskId, commentText.trim());
    setCommentText('');
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;
    updateTaskStatus(selectedTaskId, 'done', proofUrl || undefined, proofNote || undefined);
    setIsProofModalOpen(false);
    setProofNote('');
    setProofUrl('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = users.find((u) => u.uid === newAssigneeId) || currentUser;
    createTask({
      title: newTitle,
      description: newDesc,
      team: newTeam,
      assigneeId: assignee.uid,
      assigneeName: assignee.name,
      assigneeAvatar: assignee.avatarUrl,
      createdById: currentUser.uid,
      createdByName: currentUser.name,
      dueDate: newDueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
      priority: newPriority,
      status: 'todo',
    });
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  // If viewing a single task's detail view
  if (selectedTask) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          onClick={() => setSelectedTaskId(null)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#0F766E',
            marginBottom: '4px',
          }}
        >
          <ArrowLeft size={16} /> Back to Tasks
        </button>

        <div className="app-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#0F766E',
                textTransform: 'uppercase',
              }}
            >
              {selectedTask.team} Team
            </span>
            <StatusChip status={selectedTask.status} />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3, marginBottom: '8px' }}>
            {selectedTask.title}
          </h2>

          {selectedTask.description && (
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
              {selectedTask.description}
            </p>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              borderTop: '1px solid #E8ECF2',
              paddingTop: '14px',
              fontSize: '13px',
            }}
          >
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                Assignee
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <AppAvatar name={selectedTask.assigneeName} size={22} />
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedTask.assigneeName}</span>
              </div>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                Priority
              </span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize', color: selectedTask.priority === 'high' ? '#DC2626' : '#0F172A' }}>
                {selectedTask.priority}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                Due Date
              </span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>
                {new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                Created By
              </span>
              <span style={{ fontWeight: 500, color: '#64748B' }}>{selectedTask.createdByName}</span>
            </div>
          </div>
        </div>

        {/* Task Actions: Status Toggle & Proof Upload */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`btn ${selectedTask.status === 'done' ? 'btn-secondary' : 'btn-primary'} btn-block`}
            onClick={() => {
              if (selectedTask.status !== 'done') {
                setIsProofModalOpen(true);
              } else {
                updateTaskStatus(selectedTask.id, 'in_progress');
              }
            }}
          >
            {selectedTask.status === 'done' ? (
              <>Mark as In Progress</>
            ) : (
              <>
                <CheckCircle2 size={18} /> Mark Complete & Submit Proof
              </>
            )}
          </button>
        </div>

        {/* Proof of Work Card if submitted */}
        {(selectedTask.proofUrl || selectedTask.proofNote) && (
          <div className="app-card" style={{ backgroundColor: '#F0FDFA', border: '1px solid #99F6E4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F766E', marginBottom: '8px' }}>
              <Paperclip size={18} />
              <h4 style={{ fontWeight: 700, fontSize: '14px' }}>Proof of Completion Attached</h4>
            </div>
            {selectedTask.proofNote && (
              <p style={{ fontSize: '13px', color: '#334155', marginBottom: '8px' }}>
                "{selectedTask.proofNote}"
              </p>
            )}
            {selectedTask.proofUrl && (
              <a
                href={selectedTask.proofUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '12px', color: '#0F766E', fontWeight: 600, textDecoration: 'underline' }}
              >
                View Uploaded Artifact &rarr;
              </a>
            )}
          </div>
        )}

        {/* Comments & Discussion */}
        <div className="app-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <MessageSquare size={18} color="#0F766E" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              Activity & Comments ({selectedTask.comments.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {selectedTask.comments.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '12px 0' }}>
                No comments yet. Start the conversation below.
              </div>
            ) : (
              selectedTask.comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E8ECF2',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ fontWeight: 700, color: '#0F766E' }}>{c.authorName}</span>
                    <span style={{ color: '#94A3B8' }}>
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155' }}>{c.text}</div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Write a message or update..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }}>
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Proof of Work Modal */}
        <Modal
          isOpen={isProofModalOpen}
          onClose={() => setIsProofModalOpen(false)}
          title="Complete Task"
          subtitle="Submit verification note or link for team lead approval"
        >
          <form onSubmit={handleProofSubmit}>
            <div className="input-group">
              <label className="input-label">Completion Note / Summary</label>
              <textarea
                className="input-field"
                rows={3}
                required
                placeholder="Describe work completed (e.g. All banners printed, audio soundcheck passed...)"
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Artifact or Photo URL (Optional)</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://drive.google.com/... or image link"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Verify & Complete Task
            </button>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>Club Tasks</h1>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            Action items across club operations & event workflows
          </p>
        </div>
        {(currentUser.role === 'team_admin' || currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
          <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Create Task
          </button>
        )}
      </div>

      {/* Status Filter Pills */}
      <div className="pill-tabs">
        <button
          className={`pill-tab ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button
          className={`pill-tab ${statusFilter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setStatusFilter('in_progress')}
        >
          In Progress
        </button>
        <button
          className={`pill-tab ${statusFilter === 'todo' ? 'active' : ''}`}
          onClick={() => setStatusFilter('todo')}
        >
          To Do
        </button>
        <button
          className={`pill-tab ${statusFilter === 'done' ? 'active' : ''}`}
          onClick={() => setStatusFilter('done')}
        >
          Completed
        </button>
      </div>

      {/* Team Filter Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['All', 'Management', 'Promotion', 'Documentation', 'Entertainment'].map((team) => (
          <button
            key={team}
            onClick={() => setTeamFilter(team)}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: teamFilter === team ? 700 : 500,
              backgroundColor: teamFilter === team ? '#0F766E' : '#F1F5F9',
              color: teamFilter === team ? '#FFFFFF' : '#475569',
              whiteSpace: 'nowrap',
              transition: 'all 150ms ease',
            }}
          >
            {team}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div>
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>No tasks found</h3>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              No tasks currently match this status or team filter.
            </p>
          </div>
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

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Assign New Task"
        subtitle="Delegate operational responsibilities to team members"
      >
        <form onSubmit={handleCreateTask}>
          <div className="input-group">
            <label className="input-label">Task Title</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Design 6 Exhibition Floor Posters"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="input-group">
              <label className="input-label">Team</label>
              <select
                className="input-field"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
              >
                <option value="Management">Management</option>
                <option value="Promotion">Promotion</option>
                <option value="Documentation">Documentation</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Priority</label>
              <select
                className="input-field"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Assignee</label>
            <select
              className="input-field"
              value={newAssigneeId}
              onChange={(e) => setNewAssigneeId(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.name} ({u.team || 'Member'})
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Due Date</label>
            <input
              type="date"
              className="input-field"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Task Instructions / Scope</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Specific guidelines, required dimensions, or deliverables..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>
            Assign Task
          </button>
        </form>
      </Modal>
    </div>
  );
};
