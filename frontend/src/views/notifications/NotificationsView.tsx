import React, { useState } from 'react';
import { Bell, Calendar, CheckSquare, ShieldCheck, QrCode, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PillButton } from '../../components/shared/PillButton';
import { SegmentedTabs } from '../../components/shared/SegmentedTabs';
import { Mascot } from '../../components/shared/Mascot';

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
        return <Calendar size={18} strokeWidth={1.75} color="#163832" />;
      case 'task':
        return <CheckSquare size={18} strokeWidth={1.75} color="#163832" />;
      case 'approval':
        return <ShieldCheck size={18} strokeWidth={1.75} color="#163832" />;
      case 'qr':
        return <QrCode size={18} strokeWidth={1.75} color="#163832" />;
      default:
        return <Bell size={18} strokeWidth={1.75} color="#163832" />;
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

  const tabs = [
    { key: 'all', label: `All (${notifications.length})` },
    { key: 'unread', label: `Unread (${notifications.filter((n) => !n.isRead).length})` },
  ];

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
            Notifications
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Official bulletins & alerts
          </p>
        </div>

        <PillButton
          icon={<Check size={16} strokeWidth={2.5} />}
          variant="secondary"
          onClick={markAllNotificationsAsRead}
        >
          Mark all
        </PillButton>
      </div>

      {/* SegmentedTabs */}
      <SegmentedTabs
        tabs={tabs}
        activeTab={filter}
        onChange={(k) => setFilter(k as 'all' | 'unread')}
      />

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredNotifs.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '36px 20px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Mascot name="megaphone" size="md" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#051F20', margin: '8px 0 2px 0' }}>
              All caught up
            </h3>
            <p style={{ fontSize: '12px', color: '#235347', margin: 0 }}>
              No notifications at this moment
            </p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '24px',
                backgroundColor: n.isRead ? '#FFFFFF' : '#DAF1DE',
                border: n.isRead ? '1px solid #DAF1DE' : '1px solid #8EB69B',
                boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                {/* 40px circular white button with soft shadow */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DAF1DE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(5,31,32,0.06)',
                  }}
                >
                  {getNotifIcon(n.type)}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#051F20', lineHeight: 1.3 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px', fontWeight: 500 }} className="truncate">
                    {n.message}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', color: '#235347', fontWeight: 600 }}>
                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {!n.isRead && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '9999px',
                      backgroundColor: '#163832',
                      marginTop: '4px',
                      marginLeft: 'auto',
                    }}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
