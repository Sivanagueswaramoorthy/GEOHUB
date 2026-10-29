import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Send,
  Sparkles,
  Newspaper,
  Plus,
  Clock,
  Download,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SocialPlatform, SocialPostStatus, SocialPost } from '../../types';
import {
  PillButton,
  StatusChip,
  StatTile,
  BottomSheet,
  EmptyState,
  SegmentedTabs,
  UploadCard,
} from '../../components/shared';

export const CampaignsView: React.FC = () => {
  const {
    currentUser,
    events,
    posts,
    addPost,
    markPostPublished,
    dailyNews,
    addDailyNews,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'calendar' | 'ai' | 'news'>('posts');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Post Composer State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [postPlatform, setPostPlatform] = useState<SocialPlatform>('Instagram');
  const [postCaption, setPostCaption] = useState('');
  const [postEventId, setPostEventId] = useState(events[0]?.id || '');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Content Calendar State
  const [selectedDayIndex, setSelectedDayIndex] = useState(3);

  // Daily News State
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsAudience, setNewsAudience] = useState<'all' | 'squad'>('all');

  const platforms: ('All' | SocialPlatform)[] = ['All', 'Instagram', 'LinkedIn', 'YouTube', 'WhatsApp'];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSuggestAi = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      const targetEvent = events.find((e) => e.id === postEventId) || events[0];
      setPostCaption(
        `🌿 Join us for ${targetEvent?.title || 'our next expedition'}! Exploring geomatics, remote sensing, and environmental tech on campus. Reserve your spot today! #GeoHub #CampusGeomatics`
      );
      setIsAiLoading(false);
      showToast('Generated AI caption!');
    }, 600);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postCaption.trim()) return;
    const targetEvent = events.find((ev) => ev.id === postEventId);
    addPost({
      platform: postPlatform,
      caption: postCaption,
      eventId: postEventId,
      eventTitle: targetEvent?.title || 'Chapter Initiative',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduledTime: '11:00',
      status: 'Scheduled',
      mediaUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
      createdBy: currentUser.name,
    });
    setIsComposerOpen(false);
    setPostCaption('');
    showToast('Post scheduled successfully');
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;
    addDailyNews({
      title: newsTitle.trim(),
      content: newsContent.trim(),
      category: 'Announcements',
      author: currentUser.name,
      authorName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      isPriority: true,
      hashtags: [],
      status: 'published',
      tags: [newsAudience === 'all' ? 'All Members' : 'Squad Only'],
    });
    setIsNewsModalOpen(false);
    setNewsTitle('');
    setNewsContent('');
    showToast('Bulletin broadcasted');
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedPlatform !== 'All' && p.platform !== selectedPlatform) return false;
    return true;
  });

  const subTabs = [
    { key: 'posts', label: 'Posts' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'ai', label: 'AI Studio' },
    { key: 'news', label: 'Daily News' },
  ];

  // 4-stage campaign progress: Teaser, Speaker Reveal, Registration, Recap
  const campaignStages = [
    { name: 'Teaser', done: true },
    { name: 'Speaker Reveal', done: true },
    { name: 'Registration', done: false },
    { name: 'Recap', done: false },
  ];

  const daysOfWeek = ['Mon 26', 'Tue 27', 'Wed 28', 'Thu 29', 'Fri 30', 'Sat 31', 'Sun 01'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: '#051F20',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={14} color="#8EB69B" />
          <span>{toastMsg}</span>
        </div>
      )}

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
            Chapter Campaigns
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Publicity, social media & releases
          </p>
        </div>

        {activeSubTab === 'news' ? (
          <PillButton
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsNewsModalOpen(true)}
          >
            New post
          </PillButton>
        ) : (
          <PillButton
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsComposerOpen(true)}
          >
            New post
          </PillButton>
        )}
      </div>

      {/* Sub-tabs: Posts, Calendar, AI Studio, Daily News */}
      <SegmentedTabs
        tabs={subTabs}
        activeTab={activeSubTab}
        onChange={(k) => setActiveSubTab(k as any)}
      />

      {/* SUB-TAB 1: POSTS */}
      {activeSubTab === 'posts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Campaign Overview Card with 4-Stage Progress Bar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(5,31,32,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Annual Symposium 2026
                </h3>
                <span style={{ fontSize: '12px', color: '#235347' }}>
                  4-stage publicity timeline
                </span>
              </div>
              <StatusChip status="live" label="Stage 2 Active" />
            </div>

            {/* 4-Stage Progress Bar (Teaser, Speaker Reveal, Registration, Recap) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {campaignStages.map((st, idx) => (
                <div key={st.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '9999px',
                      backgroundColor: st.done ? '#163832' : '#DAF1DE',
                      transition: 'all 200ms ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: st.done ? '#163832' : '#235347',
                      textAlign: 'center',
                    }}
                  >
                    {st.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Filter Chips: Instagram, LinkedIn, YouTube, WhatsApp */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
            {platforms.map((pl) => {
              const isActive = selectedPlatform === pl;
              return (
                <button
                  type="button"
                  key={pl}
                  onClick={() => setSelectedPlatform(pl)}
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: isActive ? '#163832' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#235347',
                    border: isActive ? '1px solid #163832' : '1px solid #DAF1DE',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {pl}
                </button>
              );
            })}
          </div>

          {/* Posts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredPosts.length === 0 ? (
              <EmptyState
                mascot="megaphone"
                title="No posts"
                description="No releases scheduled for this channel"
                actionLabel="New post"
                onAction={() => setIsComposerOpen(true)}
              />
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px solid #DAF1DE',
                    padding: '18px 20px',
                    boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        {post.platform}
                      </span>
                      <span style={{ fontSize: '12px', color: '#235347', fontWeight: 600 }}>
                        {post.eventTitle}
                      </span>
                    </div>

                    <StatusChip status={post.status === 'Published' ? 'done' : 'live'} label={post.status} />
                  </div>

                  <p style={{ fontSize: '13px', color: '#051F20', margin: 0, lineHeight: 1.5 }}>
                    {post.caption}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid #DAF1DE',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#235347', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {post.scheduledDate} at {post.scheduledTime}
                    </span>

                    {post.status !== 'Published' && (
                      <PillButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          markPostPublished(post.id);
                          showToast('Post marked as live');
                        }}
                      >
                        Publish
                      </PillButton>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CALENDAR (Month Strip with Colored Dots) */}
      {activeSubTab === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Week / Month Strip with Colored Dots */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '16px',
              boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
            }}
          >
            {daysOfWeek.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => setSelectedDayIndex(idx)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px 4px',
                    borderRadius: '16px',
                    backgroundColor: isSelected ? '#163832' : '#F6FBF7',
                    color: isSelected ? '#FFFFFF' : '#051F20',
                    border: isSelected ? '1px solid #163832' : '1px solid #DAF1DE',
                    cursor: 'pointer',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>{day}</span>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '9999px',
                      backgroundColor: isSelected ? '#DAF1DE' : '#8EB69B',
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Queue for Selected Day */}
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
            Queue for {daysOfWeek[selectedDayIndex]}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {posts.slice(0, 2).map((post) => (
              <div
                key={post.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1px solid #DAF1DE',
                  padding: '16px',
                  boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                    {post.platform} • {post.scheduledTime}
                  </span>
                  <p style={{ fontSize: '13px', color: '#051F20', margin: '4px 0 0 0' }}>
                    {post.caption}
                  </p>
                </div>
                <StatusChip status="live" label="Queued" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AI STUDIO */}
      {activeSubTab === 'ai' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #DAF1DE',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(5,31,32,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              }}
            >
              <Sparkles size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                Copywriter AI
              </h3>
              <span style={{ fontSize: '12px', color: '#235347' }}>
                Generate social media captions tailored to club events
              </span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '6px' }}>
              Select Event
            </label>
            <select
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                backgroundColor: '#F6FBF7',
                outline: 'none',
              }}
              value={postEventId}
              onChange={(e) => setPostEventId(e.target.value)}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <PillButton
            variant="primary"
            icon={<Sparkles size={16} />}
            loading={isAiLoading}
            onClick={handleSuggestAi}
          >
            Suggest
          </PillButton>

          {postCaption && (
            <div
              style={{
                padding: '14px',
                borderRadius: '16px',
                backgroundColor: '#F6FBF7',
                border: '1px solid #DAF1DE',
                fontSize: '13px',
                lineHeight: 1.5,
                color: '#051F20',
              }}
            >
              {postCaption}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: DAILY NEWS (Daily Bulletins Composer) */}
      {activeSubTab === 'news' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
              Broadcast Bulletins
            </h3>
            <PillButton
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setIsNewsModalOpen(true)}
            >
              Add bulletin
            </PillButton>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dailyNews.map((news) => (
              <div
                key={news.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1px solid #DAF1DE',
                  padding: '18px 20px',
                  boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: '#DAF1DE',
                      color: '#0B2B26',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      border: '1px solid #8EB69B',
                    }}
                  >
                    {news.tags?.[0] || 'All Members'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#235347' }}>
                    {news.date}
                  </span>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  {news.title}
                </h4>
                <p style={{ fontSize: '13px', color: '#235347', margin: 0, lineHeight: 1.45 }}>
                  {news.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Composer BottomSheet */}
      <BottomSheet
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        title="Schedule Post"
        subtitle="Compose social media publication"
      >
        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Target Platform
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
                outline: 'none',
              }}
              value={postPlatform}
              onChange={(e) => setPostPlatform(e.target.value as any)}
            >
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="YouTube">YouTube</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20' }}>
                Caption
              </label>
              <button
                type="button"
                onClick={handleSuggestAi}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#163832',
                  backgroundColor: '#DAF1DE',
                  border: '1px solid #8EB69B',
                  borderRadius: '9999px',
                  padding: '2px 8px',
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={12} />
                <span>Suggest</span>
              </button>
            </div>
            <textarea
              required
              rows={4}
              placeholder="Write post caption..."
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
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Media
            </label>
            <UploadCard
              label="Attach campaign banner"
              onFileSelected={() => {}}
            />
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Schedule
          </PillButton>
        </form>
      </BottomSheet>

      {/* Daily News Composer BottomSheet */}
      <BottomSheet
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        title="Broadcast Bulletin"
        subtitle="Daily news feed publication"
      >
        <form onSubmit={handleCreateNews} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          {/* Broadcast Chips: All Members / Squad Only */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '6px' }}>
              Target Audience
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setNewsAudience('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: newsAudience === 'all' ? '#163832' : '#FFFFFF',
                  color: newsAudience === 'all' ? '#FFFFFF' : '#235347',
                  border: newsAudience === 'all' ? '1px solid #163832' : '1px solid #DAF1DE',
                  cursor: 'pointer',
                }}
              >
                All Members
              </button>
              <button
                type="button"
                onClick={() => setNewsAudience('squad')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: newsAudience === 'squad' ? '#163832' : '#FFFFFF',
                  color: newsAudience === 'squad' ? '#FFFFFF' : '#235347',
                  border: newsAudience === 'squad' ? '1px solid #163832' : '1px solid #DAF1DE',
                  cursor: 'pointer',
                }}
              >
                Squad Only
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Headline
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Field Kit Collection Notice"
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
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Content
            </label>
            <textarea
              required
              rows={4}
              placeholder="Bulletin announcement text..."
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
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
            />
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Broadcast
          </PillButton>
        </form>
      </BottomSheet>
    </div>
  );
};

export default CampaignsView;
