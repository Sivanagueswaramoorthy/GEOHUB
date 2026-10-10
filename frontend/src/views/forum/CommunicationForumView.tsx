import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Heart,
  Pin,
  Sparkles,
  Search,
  Plus,
  Users,
  Compass,
  CheckCircle2,
  Megaphone,
  Briefcase,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ForumMessage } from '../../types';
import { Modal } from '../../components/common/Modal';

export const CommunicationForumView: React.FC = () => {
  const { forumMessages, addForumMessage, addForumReply, likeForumMessage, togglePinForumMessage, currentUser } = useApp();

  const [activeChannel, setActiveChannel] = useState<'announcements' | 'coordination' | 'tech_geo' | 'general'>('announcements');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [openReplyBoxId, setOpenReplyBoxId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const channelInfo = {
    announcements: {
      name: 'Official Announcements',
      desc: 'Faculty notices, DGCA drone permits, symposium dates and college directives',
      icon: <Megaphone size={16} />,
      color: '#059669',
      bg: '#ECFDF5',
    },
    coordination: {
      name: 'Event & Volunteer Coordination',
      desc: 'Volunteer rosters, signage, food delivery timings, and station checklists',
      icon: <Briefcase size={16} />,
      color: '#4338CA',
      bg: '#EEF2FF',
    },
    tech_geo: {
      name: 'Geomatics & Tech Forum',
      desc: 'QGIS plugins, satellite multispectral datasets, Python automation scripts',
      icon: <Compass size={16} />,
      color: '#D97706',
      bg: '#FFFBEB',
    },
    general: {
      name: 'General Discussion & Q&A',
      desc: 'Open student conversations, suggestions, and peer collaboration',
      icon: <MessageSquare size={16} />,
      color: '#0284C7',
      bg: '#F0F9FF',
    },
  };

  const filteredMessages = forumMessages
    .filter((msg) => {
      if (msg.channelId !== activeChannel) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (msg.title || '').toLowerCase().includes(q);
        const matchContent = msg.content.toLowerCase().includes(q);
        const matchAuthor = msg.authorName.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchAuthor) return false;
      }
      return true;
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    addForumMessage({
      channelId: activeChannel,
      title: newTitle.trim() || undefined,
      content: newContent.trim(),
    });
    setIsPostModalOpen(false);
    showToast(`✓ Published message to #${channelInfo[activeChannel].name}`);
    setNewTitle('');
    setNewContent('');
  };

  const handleSendReply = (messageId: string) => {
    const text = replyInputMap[messageId];
    if (!text || !text.trim()) return;
    addForumReply(messageId, text.trim());
    setReplyInputMap((prev) => ({ ...prev, [messageId]: '' }));
    setOpenReplyBoxId(null);
    showToast(`✓ Reply posted!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '32px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#047857',
                backgroundColor: '#ECFDF5',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid #A7F3D0',
                letterSpacing: '0.04em',
              }}
            >
              COMMUNICATION FORUM
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Club Discussion Channels
          </h1>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          style={{
            padding: '10px 18px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.28)',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> New Discussion Post
        </button>
      </div>

      {/* Channel Navigation Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {(Object.keys(channelInfo) as (keyof typeof channelInfo)[]).map((cKey) => {
          const ch = channelInfo[cKey];
          const isSelected = activeChannel === cKey;
          return (
            <div
              key={cKey}
              onClick={() => setActiveChannel(cKey)}
              style={{
                backgroundColor: isSelected ? ch.bg : '#FFFFFF',
                borderRadius: '16px',
                border: isSelected ? `2px solid ${ch.color}` : '1px solid #E8ECF2',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? ch.color : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : ch.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {ch.icon}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {ch.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {ch.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="input-field"
          style={{
            paddingLeft: '40px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8ECF2',
            borderRadius: '16px',
            fontSize: '13px',
            height: '44px',
          }}
          placeholder={`Search in #${channelInfo[activeChannel].name}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search size={20} strokeWidth={1.75} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* Posts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredMessages.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E8ECF2',
              padding: '36px 20px',
              textAlign: 'center',
            }}
          >
            <MessageSquare size={48} strokeWidth={1.75} color="#10B981" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              No messages in this channel yet
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 14px 0' }}>
              Be the first to start a conversation in #{channelInfo[activeChannel].name}.
            </p>
            <button
              onClick={() => setIsPostModalOpen(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Post Message
            </button>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const hasLiked = msg.likedBy?.includes(currentUser.uid);
            return (
              <div
                key={msg.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: msg.pinned ? '2px solid #10B981' : '1px solid #E8ECF2',
                  padding: '18px 20px',
                  boxShadow: msg.pinned ? '0 8px 24px rgba(16, 185, 129, 0.1)' : '0 4px 16px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Author Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#ECFDF5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        color: '#059669',
                        fontSize: '14px',
                      }}
                    >
                      {msg.authorName[0]}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                          {msg.authorName}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '999px',
                            backgroundColor: '#F1F5F9',
                            color: '#475569',
                          }}
                        >
                          {msg.authorRole}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {new Date(msg.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {msg.pinned && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#047857',
                          backgroundColor: '#ECFDF5',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #A7F3D0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Pin size={16} strokeWidth={1.75} /> PINNED
                      </span>
                    )}
                    {(currentUser.role === 'super_admin' || currentUser.role === 'admin') && (
                      <button
                        type="button"
                        onClick={() => {
                          togglePinForumMessage(msg.id);
                          showToast(msg.pinned ? 'Unpinned message' : '✓ Pinned announcement to top!');
                        }}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: msg.pinned ? '#E7F9F1' : '#F1F5F9',
                          color: msg.pinned ? '#047857' : '#64748B',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title={msg.pinned ? 'Unpin message' : 'Pin message to top'}
                      >
                        <Pin size={16} strokeWidth={1.75} />
                        <span>{msg.pinned ? 'Unpin' : 'Pin'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div>
                  {msg.title && (
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                      {msg.title}
                    </h3>
                  )}
                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-line' }}>
                    {msg.content}
                  </p>
                </div>

                {/* Actions: Likes & Reply trigger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => likeForumMessage(msg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: hasLiked ? '#E11D48' : '#64748B',
                      cursor: 'pointer',
                    }}
                  >
                    <Heart size={16} strokeWidth={1.75} fill={hasLiked ? '#E11D48' : 'none'} color={hasLiked ? '#E11D48' : '#64748B'} />
                    <span>{msg.likes} Likes</span>
                  </button>

                  <button
                    onClick={() => setOpenReplyBoxId(openReplyBoxId === msg.id ? null : msg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#059669',
                      cursor: 'pointer',
                    }}
                  >
                    <MessageSquare size={16} strokeWidth={1.75} />
                    <span>{(msg.replies || []).length} Replies</span>
                  </button>
                </div>

                {/* Replies Thread */}
                {msg.replies && msg.replies.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px', borderLeft: '2px solid #E2E8F0', marginTop: '4px' }}>
                    {msg.replies.map((rep) => (
                      <div key={rep.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '10px 12px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <strong style={{ color: '#0F172A' }}>{rep.authorName}</strong>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>• {rep.authorRole}</span>
                        </div>
                        <div style={{ color: '#334155', lineHeight: 1.4 }}>{rep.content}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input Box */}
                {openReplyBoxId === msg.id && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <input
                      type="text"
                      className="input-field"
                      style={{ flex: 1, fontSize: '12px', height: '40px' }}
                      placeholder="Write a constructive reply..."
                      value={replyInputMap[msg.id] || ''}
                      onChange={(e) => setReplyInputMap({ ...replyInputMap, [msg.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendReply(msg.id);
                      }}
                    />
                    <button
                      onClick={() => handleSendReply(msg.id)}
                      style={{
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Send size={16} strokeWidth={1.75} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Post Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title={`New Post in #${channelInfo[activeChannel].name}`}
        subtitle="Share updates, coordinate tasks or initiate a geospatial discussion"
      >
        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="input-group">
            <label className="input-label">Title / Headline (Optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Volunteer station briefing for Saturday"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Message Content</label>
            <textarea
              className="input-field"
              rows={4}
              required
              placeholder="Type your message, notes, links or questions here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              height: '46px',
              fontSize: '14px',
              fontWeight: 700,
              marginTop: '6px',
            }}
          >
            Post to Channel
          </button>
        </form>
      </Modal>
    </div>
  );
};
