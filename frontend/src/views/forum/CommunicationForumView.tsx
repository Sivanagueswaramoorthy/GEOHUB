import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  Lock,
  Megaphone,
  ShieldAlert,
  Users,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CommunityMessage } from '../../types';
import { initialCommunityMessages } from '../../data/mockData';
import {
  Avatar,
  PillButton,
  StatusChip,
  Mascot,
  SearchField,
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

  const channels: ChannelDef[] = [
    { id: 'general', name: '#general', isSquad: false, description: 'Public Chapter Community Lounge' },
    { id: 'announcements', name: '#announcements', isSquad: false, description: 'Official Chapter Sanctions & Circulars' },
    { id: 'Promotion', name: '#squad-promotion', isSquad: true, squadName: 'Promotion', description: 'Social Media & Stage Publicity' },
    { id: 'Management', name: '#squad-management', isSquad: true, squadName: 'Management', description: 'Event Logistics & Operations' },
    { id: 'Documentation', name: '#squad-documentation', isSquad: true, squadName: 'Documentation', description: 'Session Transcripts & Media Archival' },
    { id: 'Entertainment', name: '#squad-entertainment', isSquad: true, squadName: 'Entertainment', description: 'Cultural Activities & Icebreakers' },
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

  const currentMessages = messages.filter((m) => m.channelId === activeChannel.id);

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

  const handleAttachSimulatedPhoto = () => {
    setAttachedPhoto('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80');
    showToast('Photo attached.');
  };

  return (
    <div className="flex flex-col gap-4 select-none animate-fadeIn pb-16">
      {/* 1) Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            Community
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Chapter channels & squad rooms
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]">
          {activeChannel.name}
        </span>
      </div>

      {/* 2) Channels Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '2px 0',
          WebkitOverflowScrolling: 'touch',
        }}
        className="no-scrollbar"
      >
        {channels.map((ch) => {
          const isSelected = activeChannelId === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setActiveChannelId(ch.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
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
                  ? '0 4px 12px rgba(5, 31, 32, 0.18)'
                  : '0 2px 6px rgba(5, 31, 32, 0.04)',
                minHeight: '44px',
                outline: 'none',
              }}
              className="touch-target-44"
            >
              {ch.isSquad && <Lock size={12} strokeWidth={1.75} className="shrink-0" />}
              <span>{ch.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3) Conversation Body */}
      {!isChannelAuthorized ? (
        /* Locked Squad Room Notice */
        <div
          className="p-8 bg-white border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.06)] flex flex-col items-center text-center gap-3"
          style={{ borderRadius: '24px' }}
        >
          <Mascot name="lock" size="md" />
          <h2 className="text-base font-bold text-[#051F20]">
            Squad Room Restricted
          </h2>
          <p className="text-xs text-[#235347] max-w-sm">
            Membership in the <strong>{activeChannel.squadName} Squad</strong> is required to enter this discussion room. Squad leads can assign you from Operations.
          </p>
          <PillButton
            variant="secondary"
            size="sm"
            onClick={() => setActiveChannelId('general')}
          >
            Return to #general
          </PillButton>
        </div>
      ) : (
        /* Authorized Chat Stream */
        <div
          className="bg-white border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.06)] flex flex-col justify-between"
          style={{
            borderRadius: '24px',
            minHeight: '420px',
          }}
        >
          {/* Room Header Info */}
          <div className="p-4 border-b border-[#DAF1DE] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#051F20]">{activeChannel.name}</span>
              <span className="text-xs text-[#235347]">{activeChannel.description}</span>
            </div>
            <StatusChip status="live" label="Live Stream" />
          </div>

          {/* Messages Stream */}
          <div className="p-4 flex flex-col gap-3.5 max-h-[380px] overflow-y-auto">
            {currentMessages.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#235347]">
                No messages in this room yet. Be the first to start the discussion!
              </div>
            ) : (
              currentMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.uid;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-xs text-[#235347]">
                      {!isMe && <span className="font-bold text-[#051F20]">{msg.senderName}</span>}
                      {!isMe && msg.senderRole && (
                        <span className="text-xs px-1.5 py-0.2 rounded-full bg-[#DAF1DE] text-[#163832]">
                          {msg.senderRole}
                        </span>
                      )}
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-medium ${
                        isMe
                          ? 'bg-[#163832] text-white rounded-br-sm'
                          : 'bg-[#F6FBF7] text-[#051F20] border border-[#DAF1DE] rounded-bl-sm'
                      }`}
                    >
                      {msg.text && <p className="leading-relaxed">{msg.text}</p>}

                      {/* Photo Attachment */}
                      {msg.imageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-[#DAF1DE]">
                          <img
                            src={msg.imageUrl}
                            alt="Attached chapter media"
                            className="w-full h-40 object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Photo Attachment Preview Bar */}
          {attachedPhoto && (
            <div className="p-2.5 mx-4 mb-2 bg-[#DAF1DE] rounded-2xl border border-[#8EB69B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} strokeWidth={1.75} className="text-[#163832]" />
                <span className="text-xs font-bold text-[#051F20]">Field Photo Attached</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedPhoto(null)}
                className="p-1 rounded-full text-[#051F20] hover:bg-white/50 touch-target-44 cursor-pointer"
                aria-label="Remove photo"
              >
                <X size={14} strokeWidth={1.75} />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-[#DAF1DE] flex items-center gap-2 bg-[#F6FBF7] rounded-b-3xl"
          >
            <button
              type="button"
              onClick={handleAttachSimulatedPhoto}
              className="p-2.5 rounded-full bg-white border border-[#DAF1DE] text-[#163832] hover:bg-[#DAF1DE] transition-colors touch-target-44 cursor-pointer flex items-center justify-center shrink-0"
              title="Send Photo"
              aria-label="Attach Photo"
            >
              <ImageIcon size={18} strokeWidth={1.75} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeChannel.name}...`}
              className="flex-1 h-11 px-4 text-xs font-medium text-[#051F20] bg-white border border-[#DAF1DE] rounded-full outline-none focus:border-[#163832]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !attachedPhoto}
              className={`p-2.5 rounded-full text-white transition-all touch-target-44 cursor-pointer flex items-center justify-center shrink-0 ${
                inputText.trim() || attachedPhoto
                  ? 'bg-[#163832] hover:bg-[#235347]'
                  : 'bg-[#8EB69B] cursor-not-allowed'
              }`}
              title="Send Message"
              aria-label="Send Message"
            >
              <Send size={16} strokeWidth={1.75} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommunicationForumView;
