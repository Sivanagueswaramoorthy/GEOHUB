import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Heart,
  Pin,
  Search,
  Plus,
  Compass,
  Megaphone,
  Briefcase,
  CornerDownRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ForumMessage } from '../../types';
import {
  Avatar,
  PillButton,
  BottomSheet,
  EmptyState,
  StatusChip,
} from '../../components/shared';

export const CommunicationForumView: React.FC = () => {
  const {
    forumMessages,
    addForumMessage,
    addForumReply,
    likeForumMessage,
    togglePinForumMessage,
    currentUser,
  } = useApp();

  const [activeChannel, setActiveChannel] = useState<'announcements' | 'coordination' | 'tech_geo' | 'general'>('announcements');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [openReplyBoxId, setOpenReplyBoxId] = useState<string | null>(null);

  const channels = [
    { id: 'announcements', label: '#Announcements', icon: Megaphone },
    { id: 'coordination', label: '#Coordination', icon: Briefcase },
    { id: 'tech_geo', label: '#Tech-Geo', icon: Compass },
    { id: 'general', label: '#General', icon: MessageSquare },
  ] as const;

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
    setNewTitle('');
    setNewContent('');
  };

  const handleSendReply = (messageId: string) => {
    const replyText = replyInputMap[messageId];
    if (!replyText || !replyText.trim()) return;
    addForumReply(messageId, replyText.trim());
    setReplyInputMap((prev) => ({ ...prev, [messageId]: '' }));
    setOpenReplyBoxId(null);
  };

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
            Discussions
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Channels & community chat
          </p>
        </div>

        <PillButton
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsPostModalOpen(true)}
        >
          New post
        </PillButton>
      </div>

      {/* 20px channel pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
        {channels.map((ch) => {
          const isActive = activeChannel === ch.id;
          const Icon = ch.icon;
          return (
            <button
              type="button"
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: isActive ? '#163832' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#235347',
                border: isActive ? '1px solid #163832' : '1px solid #DAF1DE',
                boxShadow: isActive ? '0 4px 14px rgba(5,31,32,0.12)' : '0 2px 8px rgba(5,31,32,0.04)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 200ms ease-out',
                flexShrink: 0,
              }}
            >
              <Icon size={14} strokeWidth={2.2} />
              <span>{ch.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          style={{
            width: '100%',
            height: '44px',
            boxSizing: 'border-box',
            paddingLeft: '40px',
            paddingRight: '14px',
            fontSize: '13px',
            color: '#051F20',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DAF1DE',
            borderRadius: '16px',
            outline: 'none',
            boxShadow: '0 4px 14px rgba(5,31,32,0.03)',
          }}
          placeholder="Search discussions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search
          size={18}
          strokeWidth={2}
          color="#8EB69B"
          style={{ position: 'absolute', left: 14, top: 13 }}
        />
      </div>

      {/* Chat cards (24px, white, #DAF1DE border) with avatars, role badges, reaction pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredMessages.length === 0 ? (
          <EmptyState
            mascot="megaphone"
            title="No messages"
            description="Start the discussion in this channel"
            actionLabel="New post"
            onAction={() => setIsPostModalOpen(true)}
          />
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: msg.pinned ? '1.5px solid #8EB69B' : '1px solid #DAF1DE',
                padding: '20px',
                boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Header with Avatar, Name, Role badge, Pinned indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar name={msg.authorName} size={40} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#051F20' }}>
                        {msg.authorName}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: '#DAF1DE',
                          color: '#0B2B26',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          border: '1px solid #8EB69B',
                          textTransform: 'capitalize',
                        }}
                      >
                        {msg.authorRole.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#235347', fontWeight: 500 }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {msg.pinned && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '9999px',
                      backgroundColor: '#DAF1DE',
                      color: '#163832',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <Pin size={12} strokeWidth={2.5} />
                    <span>Pinned</span>
                  </div>
                )}
              </div>

              {/* Title & Content */}
              {msg.title && (
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  {msg.title}
                </h3>
              )}
              <p style={{ fontSize: '13px', color: '#051F20', lineHeight: 1.5, margin: 0 }}>
                {msg.content}
              </p>

              {/* Reaction & Action Pills */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid #DAF1DE',
                }}
              >
                <button
                  type="button"
                  onClick={() => likeForumMessage(msg.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: '9999px',
                    backgroundColor: msg.likes > 0 ? '#DAF1DE' : '#F6FBF7',
                    color: '#163832',
                    border: '1px solid #8EB69B',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Heart
                    size={14}
                    fill={msg.likes > 0 ? '#163832' : 'none'}
                    strokeWidth={2}
                  />
                  <span>{msg.likes}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpenReplyBoxId(openReplyBoxId === msg.id ? null : msg.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: '9999px',
                    backgroundColor: '#F6FBF7',
                    color: '#235347',
                    border: '1px solid #DAF1DE',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <MessageSquare size={14} strokeWidth={2} />
                  <span>{(msg.replies || []).length} Replies</span>
                </button>

                {(currentUser.role === 'super_admin' || currentUser.role === 'coordinator' || currentUser.role === 'faculty') && (
                  <button
                    type="button"
                    onClick={() => togglePinForumMessage(msg.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      height: '32px',
                      padding: '0 10px',
                      borderRadius: '9999px',
                      backgroundColor: '#F6FBF7',
                      color: '#235347',
                      border: '1px solid #DAF1DE',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginLeft: 'auto',
                    }}
                  >
                    <Pin size={13} strokeWidth={2} />
                    <span>{msg.pinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                )}
              </div>

              {/* Replies Thread */}
              {(msg.replies || []).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
                  {(msg.replies || []).map((rep) => (
                    <div
                      key={rep.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '16px',
                        backgroundColor: '#F6FBF7',
                        border: '1px solid #DAF1DE',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Avatar name={rep.authorName} size={24} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#051F20' }}>
                          {rep.authorName}
                        </span>
                        <span style={{ fontSize: '12px', color: '#235347', fontWeight: 500 }}>
                          {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#051F20', margin: 0, paddingLeft: '30px' }}>
                        {rep.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Reply Input */}
              {openReplyBoxId === msg.id && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="text"
                    style={{
                      flex: 1,
                      height: '38px',
                      borderRadius: '16px',
                      border: '1px solid #DAF1DE',
                      padding: '0 12px',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                    placeholder="Write a reply..."
                    value={replyInputMap[msg.id] || ''}
                    onChange={(e) =>
                      setReplyInputMap((prev) => ({ ...prev, [msg.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendReply(msg.id);
                    }}
                  />
                  <PillButton
                    variant="primary"
                    size="sm"
                    icon={<Send size={14} />}
                    onClick={() => handleSendReply(msg.id)}
                  >
                    Reply
                  </PillButton>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Post BottomSheet */}
      <BottomSheet
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title="New Post"
        subtitle={`Post to #${channels.find((c) => c.id === activeChannel)?.label || 'General'}`}
      >
        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Schedule update for Saturday"
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
              Message
            </label>
            <textarea
              required
              rows={4}
              placeholder="Type your message..."
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
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Send
          </PillButton>
        </form>
      </BottomSheet>
    </div>
  );
};

export default CommunicationForumView;
