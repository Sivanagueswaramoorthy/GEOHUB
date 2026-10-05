import React, { useState } from 'react';
import { Bell, Plus, Sun, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const AppTopBar: React.FC = () => {
  const {
    currentUser,
    notifications,
    setActiveTab,
    setIsRoleSwitcherOpen,
    createTask,
    teams,
  } = useApp();

  const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length || 1 : 1;
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTeam, setQuickTeam] = useState('Management');


  const [activeSheetAction, setActiveSheetAction] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTime, setMeetingTime] = useState('10:00 AM');
  const [selectedAdminUser, setSelectedAdminUser] = useState('');
  const [targetTeam, setTargetTeam] = useState('Entertainment');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleActionSelect = (action: string) => {
    setIsQuickCreateOpen(false);
    if (action === 'create_event') {
      setActiveTab('events');
    } else {
      setActiveSheetAction(action);
    }
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Announcement posted to all chapter scholars!');
    setActiveSheetAction(null);
    setAnnouncementText('');
  };

  const handleAssignAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Team Admin assigned for ${targetTeam} squad!`);
    setActiveSheetAction(null);
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Meeting "${meetingTitle}" scheduled for ${meetingTime}!`);
    setActiveSheetAction(null);
    setMeetingTitle('');
  };


  return (
    <>
      {toastMsg && (
        <div className="executive-toast">
          <span>{toastMsg}</span>
        </div>
      )}

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #F1F5F9',
          padding: '14px 18px',
        }}
      >
        {/* Top Bar Header Layout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Premium Green Eco Organization Title */}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #0F172A 0%, #064E3B 45%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Green Eco Organization
          </span>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Notification Bell Button */}
            <button
              onClick={() => setActiveTab('notifications')}
              title="Notifications"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E8ECF2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F172A',
                position: 'relative',
                transition: 'all 150ms ease',
              }}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '7px',
                    right: '7px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#10B981',
                    borderRadius: '50%',
                    border: '2px solid #FFFFFF',
                  }}
                />
              )}
            </button>

            {/* Plus Action Button */}
            <button
              onClick={() => setIsQuickCreateOpen(true)}
              title="Quick Actions"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#047857',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
                transition: 'all 150ms ease',
              }}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Quick Action Sheet Modal (Item 1 Specification) */}
      <Modal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        title="Super Admin Actions"
        subtitle="Quick faculty governance and operations tools"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {[
            {
              id: 'create_event',
              title: 'Create Event',
              desc: 'Charter a new workshop, symposium or trip',
              icon: '📅',
            },
            {
              id: 'announcement',
              title: 'Post Announcement',
              desc: 'Broadcast advisory notice to all scholars',
              icon: '📢',
            },
            {
              id: 'assign_admin',
              title: 'Assign Team Admin',
              desc: 'Designate squad leads and managers',
              icon: '👥',
            },
            {
              id: 'schedule_meeting',
              title: 'Schedule Meeting',
              desc: 'Call core committee or squad standup',
              icon: '🤝',
            },
          ].map((act) => (
            <div
              key={act.id}
              onClick={() => handleActionSelect(act.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '14px',
                borderRadius: '16px',
                border: '1px solid #E8ECF2',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <span style={{ fontSize: '24px' }}>{act.icon}</span>
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                {act.title}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>
                {act.desc}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Post Announcement Modal */}
      <Modal
        isOpen={activeSheetAction === 'announcement'}
        onClose={() => setActiveSheetAction(null)}
        title="Post Chapter Announcement"
        subtitle="Broadcast advisory notice to all active students"
      >
        <form onSubmit={handleAnnouncementSubmit}>
          <div className="input-group">
            <label className="input-label">Announcement Content</label>
            <textarea
              className="input-field"
              rows={3}
              required
              placeholder="e.g. Core committee meeting rescheduled to 10:00 AM in Seminar Hall..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ borderRadius: '999px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
          >
            Broadcast Announcement
          </button>
        </form>
      </Modal>

      {/* Assign Team Admin Modal */}
      <Modal
        isOpen={activeSheetAction === 'assign_admin'}
        onClose={() => setActiveSheetAction(null)}
        title="Assign Squad Admin"
        subtitle="Designate team lead for chapter operational squads"
      >
        <form onSubmit={handleAssignAdminSubmit}>
          <div className="input-group">
            <label className="input-label">Operational Squad</label>
            <select
              className="input-field"
              value={targetTeam}
              onChange={(e) => setTargetTeam(e.target.value)}
            >
              <option value="Entertainment">Entertainment Squad (No Admin Assigned)</option>
              <option value="Management">Management Squad (Elena Rostova)</option>
              <option value="Promotion">Promotion Squad (David Chen)</option>
              <option value="Documentation">Documentation Squad (Marcus Vance)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Select Chapter Scholar</label>
            <select
              className="input-field"
              value={selectedAdminUser}
              onChange={(e) => setSelectedAdminUser(e.target.value)}
            >
              <option value="">Choose candidate scholar...</option>
              <option value="Fatima Zahra">Fatima Zahra (1st Year Env Science)</option>
              <option value="Samira Khan">Samira Khan (Cartography)</option>
              <option value="Rohan Verma">Rohan Verma (Remote Sensing)</option>
              <option value="Chloe Bennett">Chloe Bennett (Geomatics)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ borderRadius: '999px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
          >
            Confirm Assignment
          </button>
        </form>
      </Modal>

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={activeSheetAction === 'schedule_meeting'}
        onClose={() => setActiveSheetAction(null)}
        title="Schedule Chapter Meeting"
        subtitle="Set up faculty advisory or squad synchronization"
      >
        <form onSubmit={handleMeetingSubmit}>
          <div className="input-group">
            <label className="input-label">Meeting Title</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Core committee meeting, Seminar Hall"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Meeting Time</label>
            <input
              type="text"
              required
              className="input-field"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ borderRadius: '999px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
          >
            Schedule & Add to Agenda
          </button>
        </form>
      </Modal>
    </>
  );
};
