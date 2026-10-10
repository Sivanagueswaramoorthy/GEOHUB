import React, { useState } from 'react';
import { Bell, Calendar, CheckSquare, ShieldCheck, QrCode, Check, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
    setSelectedEventId,
    setSelectedTaskId,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar size={20} strokeWidth={1.75} color="#0F766E" />;
      case 'task':
        return <CheckSquare size={20} strokeWidth={1.75} color="#2563EB" />;
      case 'approval':
        return <ShieldCheck size={20} strokeWidth={1.75} color="#16A34A" />;
      case 'qr':
        return <QrCode size={20} strokeWidth={1.75} color="#9333EA" />;
      default:
        return <Bell size={20} strokeWidth={1.75} color="#64748B" />;
    }
  };

  const handleNotificationClick = (n: (typeof notifications)[0]) => {
    markNotificationAsRead(n.id);
    if (n.targetRoute === 'events' && n.targetId) {
      setSelectedEventId(n.targetId);
      setActiveTab('events');
    } else if (n.targetRoute === 'tasks' && n.targetId) {
      setSelectedTaskId(n.targetId);
      setActiveTab('tasks');
    } else if (n.targetRoute) {
      setActiveTab(n.targetRoute);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>Notifications</h1>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={markAllNotificationsAsRead}
          title="Mark all as read"
        >
          <Check size={16} strokeWidth={1.75} /> Mark All Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="pill-tabs">
        <button
          className={`pill-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`pill-tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      <div>
        {filteredNotifs.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} strokeWidth={1.75} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>All caught up!</h3>
            <p style={{ fontSize: '13px', color: '#64748B' }}>You have no unread notifications.</p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className="app-card interactive"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '10px',
                backgroundColor: n.isRead ? '#FFFFFF' : '#F0FDFA',
                borderColor: n.isRead ? '#E8ECF2' : '#99F6E4',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8ECF2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {getNotifIcon(n.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{n.title}</h4>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '3px', lineHeight: 1.4 }}>
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#0F766E',
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
