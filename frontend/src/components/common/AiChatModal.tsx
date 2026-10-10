import React, { useState } from 'react';
import {
  ChevronLeft,
  MoreVertical,
  Paperclip,
  Send,
  Mic,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users2,
  DollarSign,
  QrCode,
} from 'lucide-react';
import { GeoMascot } from './GeoMascot';
import { useApp } from '../../context/AppContext';

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  time: string;
  planCard?: boolean;
}

export const AiChatModal: React.FC<AiChatModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, events, tasks, report } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'Plan my day for maximum productivity.',
      time: '10:00 AM',
    },
    {
      id: 'm2',
      sender: 'ai',
      text: "Sure! I've created an optimized plan for you based on your club tasks, events, and priorities.",
      time: '10:00 AM',
      planCard: true,
    },
    {
      id: 'm3',
      sender: 'user',
      text: 'Thank you.',
      time: '10:01 AM',
    },
  ]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputMessage.toLowerCase();
    setInputMessage('');

    // AI dynamic contextual response
    setTimeout(() => {
      let reply = "I've checked the latest GeoHub records for you.";
      if (query.includes('event') || query.includes('fest')) {
        reply = `We have "${events[0]?.title || 'GEO FEST 2026'}" active today in the Main Auditorium with live QR check-ins running smoothly!`;
      } else if (query.includes('task') || query.includes('todo')) {
        reply = `You have ${tasks.filter((t) => t.status !== 'done').length} pending club deliverables. I recommend wrapping up sprint documentation first!`;
      } else if (query.includes('budget') || query.includes('grant') || query.includes('money')) {
        reply = `The semester treasury grant is at $${report.spentBudget.toLocaleString()} spent of $${report.totalBudget.toLocaleString()} (${Math.round((report.spentBudget / report.totalBudget) * 100)}% utilized). Balance is optimal!`;
      } else if (query.includes('qr') || query.includes('attendance')) {
        reply = `Dynamic QR tokens are actively rotating every 30 seconds across 6 volunteer gates. Screen-capture fraud protection is active.`;
      } else {
        reply = `Got it! I have updated your GeoHub agenda. Let me know if you need to sanction proposals, review squad tasks, or check auditorium attendance.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '480px',
        margin: '0 auto',
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.15)',
        animation: 'fadeIn 200ms ease-out',
      }}
    >
      {/* 1. Header (Screen 3 Reference Style) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #E8ECF2',
          backgroundColor: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={onClose}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F172A',
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
            AI Chat
          </h2>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            GeoAI Companion Online
          </div>
        </div>

        <button
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748B',
          }}
        >
          <MoreVertical size={20} strokeWidth={1.75} />
        </button>
      </div>

      {/* 2. Chat Conversation Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: '#F8FAFC',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '4px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                maxWidth: '85%',
              }}
            >
              {msg.sender === 'ai' && (
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  <GeoMascot size={48} strokeWidth={1.75} waving={false} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {msg.text && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius:
                        msg.sender === 'user'
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                      backgroundColor: msg.sender === 'user' ? '#FFFFFF' : '#ECFDF5',
                      color: msg.sender === 'user' ? '#0F172A' : '#065F46',
                      border: msg.sender === 'user' ? '1px solid #E8ECF2' : '1px solid #A7F3D0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                      fontSize: '14px',
                      lineHeight: 1.45,
                    }}
                  >
                    {msg.text}
                  </div>
                )}

                {/* Embedded "Today's Plan" Card (Exact Screen 3 Match) */}
                {msg.planCard && (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      border: '1px solid #E8ECF2',
                      padding: '16px',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                        Today's Plan
                      </span>
                      <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                        Optimized
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { title: 'Meeting Faculty Advisor', time: '9:00–10:00 am', icon: '🏛️' },
                        { title: 'GIS Map & Satellite Creative Work', time: '10:00–11:00 am', icon: '🗺️' },
                        { title: 'Lunch Break & Club Standup', time: '12:00–01:00 pm', icon: '🥗' },
                        { title: 'GEO FEST Auditorium Gate Session', time: '2:00–4:00 pm', icon: '🎟️' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '12px',
                            border: '1px solid #F1F5F9',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={16} strokeWidth={1.75} /> {item.time}
                              </div>
                            </div>
                          </div>
                          <span style={{ color: '#94A3B8', fontSize: '14px' }}>•••</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <span
              style={{
                fontSize: '11px',
                color: '#94A3B8',
                marginRight: msg.sender === 'user' ? '4px' : '0',
                marginLeft: msg.sender === 'ai' ? '40px' : '0',
              }}
            >
              {msg.time}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Prompts Bar */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '8px 16px',
          overflowX: 'auto',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #F1F5F9',
        }}
      >
        {[
          'What events are today?',
          'Show club grant balance',
          'Who is checked in?',
          'My squad deliverables',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInputMessage(prompt)}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              fontSize: '11px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* 3. Bottom Input Bar (Exact Screen 3 Match) */}
      <form
        onSubmit={handleSendMessage}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px 20px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E8ECF2',
        }}
      >
        <button
          type="button"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#F8FAFC',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Paperclip size={20} strokeWidth={1.75} />
        </button>

        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Type message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            style={{
              borderRadius: '999px',
              padding: '10px 42px 10px 16px',
              fontSize: '13px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Voice / Mic Button (Solid Lightgreen Circle from Screen 3) */}
        <button
          type="button"
          onClick={() => {
            setInputMessage('Plan my schedule for tomorrow');
          }}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            flexShrink: 0,
          }}
        >
          <Mic size={20} />
        </button>
      </form>
    </div>
  );
};
