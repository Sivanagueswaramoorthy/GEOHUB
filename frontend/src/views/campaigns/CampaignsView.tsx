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

  // Eco & Government Holiday Observance Days
  const [observanceFilter, setObservanceFilter] = useState<'all' | 'eco' | 'holiday'>('all');

  const OBSERVANCE_DAYS = [
    { id: 'obs_1', title: 'National Youth Day', date: 'Jan 12', month: 'JAN', day: 12, type: 'holiday', description: 'Swami Vivekananda Jayanti inspiring youth environmental leadership.', hashtags: ['#NationalYouthDay', '#EcoYouth', '#GeoHub'] },
    { id: 'obs_2', title: 'Republic Day', date: 'Jan 26', month: 'JAN', day: 26, type: 'holiday', description: 'National Gazetted Holiday celebrating sovereign ecological stewardship.', hashtags: ['#RepublicDay', '#GreenIndia'] },
    { id: 'obs_3', title: 'World Wetlands Day', date: 'Feb 02', month: 'FEB', day: 2, type: 'eco', description: 'Wetlands conservation, lake cleanup and groundwater restoration.', hashtags: ['#WorldWetlandsDay', '#WetlandsAction'] },
    { id: 'obs_4', title: 'National Science Day', date: 'Feb 28', month: 'FEB', day: 28, type: 'holiday', description: 'Commemorating Raman Effect; indigenous green technology innovations.', hashtags: ['#NationalScienceDay', '#EcoTech'] },
    { id: 'obs_5', title: 'World Wildlife Day', date: 'Mar 03', month: 'MAR', day: 3, type: 'eco', description: 'Protecting endangered flora and fauna, botanical biodiversity.', hashtags: ['#WorldWildlifeDay', '#ProtectWild'] },
    { id: 'obs_6', title: 'International Day of Forests', date: 'Mar 21', month: 'MAR', day: 21, type: 'eco', description: 'Campus afforestation, agroforestry and native tree planting.', hashtags: ['#ForestDay', '#PlantTrees'] },
    { id: 'obs_7', title: 'World Water Day', date: 'Mar 22', month: 'MAR', day: 22, type: 'eco', description: 'Rainwater harvesting, zero water waste, aquifer recharge initiatives.', hashtags: ['#WorldWaterDay', '#SaveWater'] },
    { id: 'obs_8', title: 'World Earth Day', date: 'Apr 22', month: 'APR', day: 22, type: 'eco', description: 'Global environmental protection, climate action and carbon reduction.', hashtags: ['#EarthDay', '#InvestInOurPlanet'] },
    { id: 'obs_9', title: 'International Workers Day', date: 'May 01', month: 'MAY', day: 1, type: 'holiday', description: 'Honoring ground environmental workforce and field volunteers.', hashtags: ['#MayDay', '#EcoWarriors'] },
    { id: 'obs_10', title: 'Biological Diversity Day', date: 'May 22', month: 'MAY', day: 22, type: 'eco', description: 'Ecosystem balance, microbial and botanical preservation.', hashtags: ['#BiodiversityDay', '#EcoHarmony'] },
    { id: 'obs_11', title: 'World Environment Day', date: 'Jun 05', month: 'JUN', day: 5, type: 'eco', description: 'UN flagship environmental day: beat plastic pollution & restore land.', hashtags: ['#WorldEnvironmentDay', '#BeatPlasticPollution'] },
    { id: 'obs_12', title: 'World Ocean Day', date: 'Jun 08', month: 'JUN', day: 8, type: 'eco', description: 'Coastal cleanups, marine ecology, river basin waste interception.', hashtags: ['#WorldOceanDay', '#CleanWaterways'] },
    { id: 'obs_13', title: 'Independence Day', date: 'Aug 15', month: 'AUG', day: 15, type: 'holiday', description: 'National celebration accompanied by campus mega green drives.', hashtags: ['#IndependenceDay', '#CleanCampus'] },
    { id: 'obs_14', title: 'International Ozone Day', date: 'Sep 16', month: 'SEP', day: 16, type: 'eco', description: 'Preserving the stratospheric ozone layer and energy efficient cooling.', hashtags: ['#OzoneDay', '#SaveOzone'] },
    { id: 'obs_15', title: 'Mahatma Gandhi Jayanti', date: 'Oct 02', month: 'OCT', day: 2, type: 'holiday', description: 'Swachh Bharat Abhiyan nationwide clean-up and sanitation day.', hashtags: ['#GandhiJayanti', '#SwachhBharat'] },
    { id: 'obs_16', title: 'National Wildlife Week', date: 'Oct 04', month: 'OCT', day: 4, type: 'eco', description: 'Wildlife symposium, ecological photography and sanctuary treks.', hashtags: ['#WildlifeWeek', '#WildIndia'] },
    { id: 'obs_17', title: 'Constitution Day', date: 'Nov 26', month: 'NOV', day: 26, type: 'holiday', description: 'Fundamental duty Article 51A(g) to protect forests, lakes and rivers.', hashtags: ['#ConstitutionDay', '#Article51A'] },
    { id: 'obs_18', title: 'Pollution Prevention Day', date: 'Dec 02', month: 'DEC', day: 2, type: 'eco', description: 'Air, water, hazardous waste mitigation and industrial safety.', hashtags: ['#PollutionControl', '#CleanAirNow'] },
    { id: 'obs_19', title: 'World Soil Day', date: 'Dec 05', month: 'DEC', day: 5, type: 'eco', description: 'Organic soil composting, micro-nutrients and erosion control.', hashtags: ['#WorldSoilDay', '#SaveSoil'] },
    { id: 'obs_20', title: 'Energy Conservation Day', date: 'Dec 14', month: 'DEC', day: 14, type: 'eco', description: 'Rooftop solar, smart energy meters and clean renewable power.', hashtags: ['#EnergyConservationDay', '#CleanEnergy'] },
  ];

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

      {/* SUB-TAB 2: CALENDAR (Eco Observance Days & Government Holidays) */}
      {activeSubTab === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header & Filter Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#051F20', margin: 0 }}>
                  Chapter Calendar
                </h3>
                <p style={{ fontSize: '12px', color: '#235347', margin: '2px 0 0 0' }}>
                  Government holidays & ecological observance days
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {(['all', 'eco', 'holiday'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setObservanceFilter(f)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor: observanceFilter === f ? '#163832' : '#FFFFFF',
                    color: observanceFilter === f ? '#FFFFFF' : '#235347',
                    border: observanceFilter === f ? '1px solid #163832' : '1px solid #DAF1DE',
                  }}
                >
                  {f === 'all' ? 'All Days' : f === 'eco' ? 'Eco Related Days' : 'Government Holidays'}
                </button>
              ))}
            </div>
          </div>

          {/* Observance Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {OBSERVANCE_DAYS.filter((obs) => (observanceFilter === 'all' ? true : obs.type === observanceFilter)).map((obs) => (
              <div
                key={obs.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #DAF1DE',
                  padding: '14px 16px',
                  boxShadow: '0 4px 16px rgba(5,31,32,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      backgroundColor: obs.type === 'eco' ? '#DAF1DE' : '#F6FBF7',
                      border: '1px solid #8EB69B',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#051F20', lineHeight: 1 }}>
                      {obs.day}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#235347', lineHeight: 1, marginTop: '2px' }}>
                      {obs.month}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
                        {obs.title}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: obs.type === 'eco' ? '#DAF1DE' : '#F6FBF7',
                          color: '#163832',
                          border: '1px solid #8EB69B',
                        }}
                      >
                        {obs.type === 'eco' ? 'Eco Day' : 'Govt Holiday'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#235347', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                      {obs.description}
                    </p>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {obs.hashtags.map((tag) => (
                        <span key={tag} style={{ fontSize: '12px', color: '#8EB69B', fontWeight: 600 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPostCaption(`Join us in observing ${obs.title}! ${obs.description}\n\n${obs.hashtags.join(' ')}`);
                    setIsComposerOpen(true);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: '#163832',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Draft Post
                </button>
              </div>
            ))}
          </div>

          {/* Active Post Queue */}
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#051F20', margin: 0 }}>
              Scheduled Campaign Releases
            </h4>

            {posts.slice(0, 3).map((post) => (
              <div
                key={post.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #DAF1DE',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                    {post.platform} • {post.scheduledDate} {post.scheduledTime}
                  </span>
                  <p style={{ fontSize: '12px', color: '#051F20', margin: '2px 0 0 0' }}>
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
