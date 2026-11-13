import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  Lock,
  Megaphone,
  Shield,
  Users,
  Search,
  CheckCircle2,
  X,
  Smile,
  Sparkles,
  ArrowDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CommunityMessage } from '../../types';
import { initialCommunityMessages } from '../../data/mockData';
import {
  Avatar,
  PillButton,
  Mascot,
} from '../../components/shared';

interface ChannelDef {
  id: string;
  name: string;
  isSquad: boolean;
  squadName?: string;
  description: string;
}

export const CommunicationForumView: React.FC = () => {
  const { currentUser, showToast } = useApp();

  const [messages, setMessages] = useState<CommunityMessage[]>(initialCommunityMessages);
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [inputText, setInputText] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Message reactions state: { [messageId]: { '👍': count, '🌿': count, '❤️': count } }
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({
    cmsg_01: { '🌿': 6, '👍': 4 },
    cmsg_03: { '👍': 5 },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels: ChannelDef[] = [
    { id: 'general', name: 'General', isSquad: false, description: 'Public Chapter Community Lounge' },
    { id: 'announcements', name: 'Announcements', isSquad: false, description: 'Official Chapter Sanctions & Circulars' },
    { id: 'Promotion', name: 'Promotion Squad', isSquad: true, squadName: 'Promotion', description: 'Social Media & Stage Publicity' },
    { id: 'Management', name: 'Management Squad', isSquad: true, squadName: 'Management', description: 'Event Logistics & Operations' },
    { id: 'Documentation', name: 'Documentation Squad', isSquad: true, squadName: 'Documentation', description: 'Session Transcripts & Media Archival' },
    { id: 'Entertainment', name: 'Entertainment Squad', isSquad: true, squadName: 'Entertainment', description: 'Cultural Activities & Stage Logistics' },
  ];

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  // Check if current user is authorized to access the active channel
  const isChannelAuthorized = useMemo(() => {
    if (!activeChannel.isSquad) return true;

    // Faculty and Coordinator have global oversight
    if (
      currentUser.role === 'faculty' ||
      currentUser.role === 'coordinator' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'super_admin'
    ) {
      return true;
    }

    const targetSquad = activeChannel.squadName?.toLowerCase();
    const primarySquad = currentUser.team?.toLowerCase();
    if (primarySquad && primarySquad === targetSquad) return true;

    // Check multi-squad memberships
    if (currentUser.squadMemberships && currentUser.squadMemberships.length > 0) {
      return currentUser.squadMemberships.some(
        (m) => m.squad.toLowerCase() === targetSquad
      );
    }

    return false;
  }, [activeChannel, currentUser]);

  const currentMessages = useMemo(() => {
    const list = messages.filter((m) => m.channelId === activeChannel.id);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (m) =>
        m.text.toLowerCase().includes(q) ||
        m.senderName.toLowerCase().includes(q) ||
        (m.senderRole && m.senderRole.toLowerCase().includes(q))
    );
  }, [messages, activeChannel.id, searchQuery]);

  // Scroll to bottom when new messages arrive or channel switches
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannelId, messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedPhoto) return;

    const newMsg: CommunityMessage = {
      id: `cmsg_${Date.now()}`,
      channelId: activeChannel.id,
      senderId: currentUser.uid,
      senderName: currentUser.name,
      senderRole: currentUser.post || currentUser.role,
      senderAvatar: currentUser.avatarUrl,
      text: inputText.trim(),
      imageUrl: attachedPhoto || undefined,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setAttachedPhoto(null);
    showToast('✓ Message posted to room.');
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setReactions((prev) => {
      const currentMsgReactions = prev[msgId] || {};
      const currentCount = currentMsgReactions[emoji] || 0;
      return {
        ...prev,
        [msgId]: {
          ...currentMsgReactions,
          [emoji]: currentCount > 0 ? currentCount + 1 : 1,
        },
      };
    });
  };

  const handleAttachSimulatedPhoto = () => {
    setAttachedPhoto('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80');
    showToast('Photo attached.');
  };

  const getChannelIcon = (ch: ChannelDef) => {
    if (ch.id === 'general') return MessageSquare;
    if (ch.id === 'announcements') return Megaphone;
    if (ch.isSquad) return Users;
    return MessageSquare;
  };

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 select-none animate-fadeIn max-w-4xl mx-auto w-full px-1 sm:px-4 flex-1 min-h-0 h-full overflow-hidden">
      {/* 1) Clean Header (No Redundant Tag Chip) */}
      <div className="pt-0.5 shrink-0">
        <h1
          className="text-2xl font-extrabold tracking-tight text-[#051F20]"
          style={{ fontSize: '24px', lineHeight: '28px' }}
        >
          Community
        </h1>
        <p className="text-xs font-semibold text-[#235347] mt-0.5">
          Chapter discussions & squad rooms
        </p>
      </div>

      {/* 2) Channels Selection Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '2px 0 6px 0',
          WebkitOverflowScrolling: 'touch',
        }}
        className="no-scrollbar shrink-0"
      >
        {channels.map((ch) => {
          const isSelected = activeChannelId === ch.id;
          const IconComp = getChannelIcon(ch);

          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                setActiveChannelId(ch.id);
                setSearchQuery('');
                setShowSearch(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease-out',
                backgroundColor: isSelected ? '#163832' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#235347',
                border: isSelected ? '1px solid #163832' : '1px solid #DAF1DE',
                boxShadow: isSelected
                  ? '0 4px 14px rgba(5, 31, 32, 0.16)'
                  : '0 2px 6px rgba(5, 31, 32, 0.03)',
                minHeight: '44px',
                outline: 'none',
              }}
              className="touch-target-44 active:scale-95 shrink-0"
            >
              {ch.isSquad ? (
                <Lock size={13} strokeWidth={2.2} className="shrink-0" />
              ) : (
                <IconComp size={14} strokeWidth={2.2} className="shrink-0" />
              )}
              <span>{ch.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3) Conversation Container */}
      {!isChannelAuthorized ? (
        /* Locked Squad Room Notice */
        <div
          className="p-8 bg-white border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] flex flex-col items-center justify-center text-center gap-3 rounded-3xl flex-1 min-h-0"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B]/50 flex items-center justify-center text-[#163832] shadow-xs">
            <Lock size={24} strokeWidth={2.2} />
          </div>
          <h2 className="text-base font-bold text-[#051F20]">
            Squad Room Restricted
          </h2>
          <p className="text-xs text-[#235347] max-w-sm leading-relaxed">
            Membership in the <strong>{activeChannel.squadName} Squad</strong> is required to enter this discussion room. Squad leads can assign you from Operations.
          </p>
          <div className="pt-2">
            <PillButton
              variant="secondary"
              size="sm"
              onClick={() => setActiveChannelId('general')}
            >
              Return to General
            </PillButton>
          </div>
        </div>
      ) : (
        /* Authorized Chat Feed Card */
        <div
          className="bg-white border border-[#DAF1DE] shadow-[0_4px_20px_rgba(5,31,32,0.05)] flex flex-col flex-1 min-h-0 rounded-3xl overflow-hidden"
        >
          {/* Room Header Info */}
          <div className="p-3 sm:p-4 border-b border-[#DAF1DE] flex items-center justify-between gap-3 bg-[#F6FBF7]/50 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B]/40 flex items-center justify-center text-[#163832] shrink-0 shadow-2xs">
                {activeChannel.isSquad ? (
                  <Users size={18} strokeWidth={2.2} />
                ) : activeChannel.id === 'announcements' ? (
                  <Megaphone size={18} strokeWidth={2.2} />
                ) : (
                  <MessageSquare size={18} strokeWidth={2.2} />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-[#051F20] truncate leading-tight">
                  {activeChannel.name}
                </h2>
                <p className="text-xs font-semibold text-[#235347] truncate mt-0.5">
                  {activeChannel.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  showSearch
                    ? 'bg-[#163832] text-white border-[#163832]'
                    : 'bg-white text-[#235347] border-[#DAF1DE] hover:bg-[#DAF1DE]'
                }`}
                title="Search Messages"
                aria-label="Search Messages"
              >
                <Search size={15} strokeWidth={2.2} />
              </button>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#163832] animate-pulse" />
                <span>Active</span>
              </span>
            </div>
          </div>

          {/* Optional Message Search Bar */}
          {showSearch && (
            <div className="p-2.5 px-4 bg-[#F6FBF7] border-b border-[#DAF1DE] flex items-center gap-2 shrink-0">
              <Search size={15} className="text-[#8EB69B] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages by sender or keyword..."
                className="flex-1 bg-transparent text-xs text-[#051F20] outline-none font-medium"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-[#8EB69B] hover:text-[#051F20]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Messages Stream - Scrollable, taking all remaining flex space */}
          <div className="p-3.5 sm:p-5 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {currentMessages.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#235347] flex flex-col items-center gap-2">
                <MessageSquare size={24} className="text-[#8EB69B]" />
                <span>{searchQuery ? `No messages match "${searchQuery}"` : 'No messages in this room yet. Be the first to start the conversation!'}</span>
              </div>
            ) : (
              currentMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.uid;
                const msgReactions = reactions[msg.id] || {};

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {!isMe && (
                      <div className="w-8 h-8 rounded-xl bg-[#DAF1DE] border border-[#8EB69B]/40 flex items-center justify-center font-heading font-extrabold text-xs text-[#163832] shrink-0 shadow-2xs mt-1">
                        {msg.senderAvatar ? (
                          <img
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          msg.senderName.charAt(0)
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Author Header */}
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-xs text-[#235347]">
                        {!isMe && (
                          <span className="font-heading font-bold text-[#051F20]">
                            {msg.senderName}
                          </span>
                        )}
                        {!isMe && msg.senderRole && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#DAF1DE] text-[#163832] font-semibold border border-[#8EB69B]/40">
                            {msg.senderRole}
                          </span>
                        )}
                        <span className="text-[12px] text-[#8EB69B] font-medium">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Chat Bubble */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                          isMe
                            ? 'bg-[#163832] text-white rounded-tr-xs shadow-2xs'
                            : 'bg-[#F6FBF7] text-[#051F20] border border-[#DAF1DE] rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                        {/* Photo Attachment */}
                        {msg.imageUrl && (
                          <div className="mt-2.5 rounded-xl overflow-hidden border border-[#DAF1DE] shadow-xs">
                            <img
                              src={msg.imageUrl}
                              alt="Attached chapter media"
                              className="w-full max-h-52 object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>

                      {/* Reactions Row */}
                      <div className="flex items-center gap-1.5 mt-1 px-1">
                        {Object.entries(msgReactions).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#DAF1DE] text-xs font-bold text-[#051F20] hover:bg-[#DAF1DE] transition-all cursor-pointer shadow-2xs"
                          >
                            <span>{emoji}</span>
                            <span>{count}</span>
                          </button>
                        ))}

                        {/* Quick Add Reaction Buttons */}
                        <button
                          type="button"
                          onClick={() => handleToggleReaction(msg.id, '👍')}
                          className="opacity-40 hover:opacity-100 text-xs px-1.5 py-0.5 rounded-full hover:bg-white transition-opacity cursor-pointer"
                          title="Like"
                        >
                          👍
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleReaction(msg.id, '🌿')}
                          className="opacity-40 hover:opacity-100 text-xs px-1.5 py-0.5 rounded-full hover:bg-white transition-opacity cursor-pointer"
                          title="Eco"
                        >
                          🌿
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Photo Attachment Preview Bar */}
          {attachedPhoto && (
            <div className="p-2.5 mx-3.5 sm:mx-5 mb-2 bg-[#DAF1DE] rounded-2xl border border-[#8EB69B] flex items-center justify-between shadow-2xs animate-fadeIn shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} strokeWidth={2} className="text-[#163832]" />
                <span className="text-xs font-bold text-[#051F20]">Field Media Attached</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedPhoto(null)}
                className="p-1 rounded-full text-[#051F20] hover:bg-white/60 touch-target-44 cursor-pointer"
                aria-label="Remove photo"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Chat Input Bar - Fixed at bottom of chat card */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 sm:p-3 border-t border-[#DAF1DE] flex items-center gap-2 bg-[#F6FBF7] rounded-b-3xl shrink-0 sticky bottom-0 z-10"
          >
            <button
              type="button"
              onClick={handleAttachSimulatedPhoto}
              className="p-2.5 rounded-full bg-white border border-[#DAF1DE] text-[#163832] hover:bg-[#DAF1DE] transition-all touch-target-44 cursor-pointer flex items-center justify-center shrink-0 shadow-2xs active:scale-95"
              title="Attach Media"
              aria-label="Attach Media"
            >
              <ImageIcon size={18} strokeWidth={2} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-11 px-4 text-xs font-semibold text-[#051F20] bg-white border border-[#DAF1DE] rounded-full outline-none focus:border-[#163832] shadow-2xs transition-all"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !attachedPhoto}
              className={`p-2.5 rounded-full text-white transition-all touch-target-44 flex items-center justify-center shrink-0 shadow-2xs ${
                inputText.trim() || attachedPhoto
                  ? 'bg-[#163832] hover:bg-[#235347] cursor-pointer active:scale-95'
                  : 'bg-[#8EB69B]/50 cursor-not-allowed opacity-60'
              }`}
              title="Send Message"
              aria-label="Send Message"
            >
              <Send size={16} strokeWidth={2.2} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommunicationForumView;
