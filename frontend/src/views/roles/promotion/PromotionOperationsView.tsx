import React from 'react';
import {
  Megaphone,
  Calendar,
  Sparkles,
  Newspaper,
  Share2,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Mascot,
} from '../../../components/shared';

export const PromotionOperationsView: React.FC = () => {
  const {
    setActiveTab,
    posts,
    dailyNews,
  } = useApp();

  const shortcuts = [
    { id: 'campaigns', label: 'Posts', icon: Megaphone, desc: `${posts.length} Posts` },
    { id: 'campaigns', label: 'Calendar', icon: Calendar, desc: 'Release timeline' },
    { id: 'campaigns', label: 'AI Studio', icon: Sparkles, desc: 'Captions' },
    { id: 'campaigns', label: 'News', icon: Newspaper, desc: `${dailyNews.length} Bulletins` },
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
            Publicity Hub
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Publicity campaigns & AI studio
          </p>
        </div>

        <Mascot name="megaphone" size="sm" />
      </div>

      {/* Shortcuts */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20', marginBottom: '10px' }}>
          Shortcuts
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.label}
                onClick={() => setActiveTab(sc.id as any)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #DAF1DE',
                  padding: '14px',
                  boxShadow: '0 4px 14px rgba(5,31,32,0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '9999px',
                    backgroundColor: '#DAF1DE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#163832',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20', lineHeight: 1.2 }}>
                    {sc.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px' }}>
                    {sc.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bento Modules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
          Workflows
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
          }}
        >
          {/* Campaigns */}
          <div
            onClick={() => setActiveTab('campaigns')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(5,31,32,0.08)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mascot name="megaphone" size="sm" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Campaigns
                </h3>
              </div>
              <StatusChip status="live" label={`${posts.length} Active`} />
            </div>
            <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
              Social media schedules, Instagram reels, LinkedIn updates, and WhatsApp blasts
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                Open Campaigns →
              </span>
            </div>
          </div>

          {/* Daily News */}
          <div
            onClick={() => setActiveTab('campaigns')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(5,31,32,0.08)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mascot name="notebook" size="sm" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Bulletins
                </h3>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
                {dailyNews.length} Broadcasts
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
              Campus notice board broadcasts, squad bulletins, and urgent club directives
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                View News →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionOperationsView;
