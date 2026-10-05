import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  CheckCircle2,
  Share2,
  RefreshCw,
  Send,
  Camera,
  MessageCircle,
  FileText,
  Tag,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AiSocialStudioView: React.FC = () => {
  const { events } = useApp();

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [platform, setPlatform] = useState<'instagram' | 'linkedin' | 'whatsapp' | 'daily_news'>('instagram');
  const [tone, setTone] = useState<'enthusiastic' | 'academic' | 'urgent'>('enthusiastic');
  const [customNotes, setCustomNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<{
    headline: string;
    caption: string;
    hashtags: string[];
    callToAction: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const title = selectedEvent ? selectedEvent.title : 'LiDAR Field Expedition';
      const venue = selectedEvent ? selectedEvent.venue : 'Geomatics High-Performance Lab';
      const dateStr = selectedEvent ? new Date(selectedEvent.startDate).toLocaleDateString() : 'Saturday';

      if (platform === 'instagram') {
        setGeneratedOutput({
          headline: `🛰️ READY TO MAP THE UNSEEN? Join ${title}! ✨`,
          caption: `Gear up, Geo-Scholars! 🌍 We're heading into high-precision territory with hands-on RTK GNSS receivers, drone aerial triangulation, and 3D point cloud modeling.\n\nWhether you're a first-year explorer or final-year cartographer, get real field experience that sets your resume apart! 🚀\n\n🗓️ When: ${dateStr}\n📍 Where: ${venue}\n🎟️ Open access for all college scholars!`,
          hashtags: ['#GeoHub', '#Geomatics', '#DroneMapping', '#GISDay', '#CollegeClub', '#RemoteSensing', '#LiDARSurvey'],
          callToAction: '📲 Tap the link in our bio or check GeoHub portal to register!',
        });
      } else if (platform === 'linkedin') {
        setGeneratedOutput({
          headline: `Empowering Future Geospatial Engineers: Announcing ${title}`,
          caption: `We are thrilled to announce that the Green Eco Organization (GeoHub) is hosting "${title}" on ${dateStr} at ${venue}.\n\nIn an era driven by spatial data science and autonomous mapping, this session offers scholars practical training in:\n• Multispectral terrain classification & RTK positioning\n• High-density LiDAR surface modeling\n• Open-source GIS workflows adhering to industry standards\n\nSpecial thanks to our Faculty Advisor Dr. Sarah Jenkins and the department for hardware support.`,
          hashtags: ['#GeospatialEngineering', '#GIS', '#RemoteSensing', '#HigherEducation', '#InnovationInSTEM', '#GeoHub'],
          callToAction: 'Learn more about student registrations via the official college portal.',
        });
      } else if (platform === 'whatsapp') {
        setGeneratedOutput({
          headline: `📢 *OFFICIAL NOTICE: ${title}*`,
          caption: `Hello Scholars!\n\nThe GeoHub Club has scheduled a key technical workshop:\n\n📌 *Topic:* ${title}\n📅 *Date:* ${dateStr}\n📍 *Venue:* ${venue}\n🎯 *Highlights:* Practical equipment handling & certificate on completion.\n\n*All volunteers and interested students are requested to join on time.*`,
          hashtags: [],
          callToAction: `Register your slot on the GeoHub app: ${selectedEvent.googleFormUrl || 'http://localhost:5173/'}`,
        });
      } else {
        // Daily news
        setGeneratedOutput({
          headline: `COLLEGE BULLETIN: GeoHub Conducts Advanced Session on ${title}`,
          caption: `The Department of Geomatics and GeoHub Student Chapter organized a technical session titled "${title}" at ${venue} on ${dateStr}.\n\nThe initiative brought together over 120 student participants from across engineering disciplines to explore modern terrain surveying tools. Club President Alex Rivera addressed the gathering, emphasizing collaborative field research.\n\nStudent volunteer crews effectively coordinated registration, safety briefings, and equipment distribution under faculty supervision.`,
          hashtags: ['#CollegeDailyNews', '#DepartmentOfGeomatics', '#StudentAchievements'],
          callToAction: 'Contact the Documentation Wing for full outcome reports.',
        });
      }

      setIsGenerating(false);
      showToast(`✓ AI Content Generated for ${platform.toUpperCase()}!`);
    }, 600);
  };

  const handleCopyFull = () => {
    if (!generatedOutput) return;
    const fullText = `${generatedOutput.headline}\n\n${generatedOutput.caption}\n\n${generatedOutput.hashtags.join(' ')}\n\n${generatedOutput.callToAction}`;
    navigator.clipboard.writeText(fullText);
    showToast('✓ Copied complete social copy to clipboard!');
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
              AI-POWERED SOCIAL MEDIA STUDIO
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            AI Content Studio (Social Media & Daily News)
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Generate tailor-made copy for Instagram, LinkedIn, WhatsApp Broadcasts & College Press Bulletins
          </p>
        </div>
      </div>

      {/* Controls Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E8ECF2',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {/* Event Selector */}
          <div className="input-group">
            <label className="input-label">Select Event Context</label>
            <select
              className="input-field"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({new Date(ev.startDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Platform Selector */}
          <div className="input-group">
            <label className="input-label">Target Platform / Channel</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'instagram', label: 'Instagram', icon: <Camera size={14} color="#E1306C" /> },
                { key: 'linkedin', label: 'LinkedIn', icon: <Share2 size={14} color="#0A66C2" /> },
                { key: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={14} color="#25D366" /> },
                { key: 'daily_news', label: 'Daily News', icon: <FileText size={14} color="#0F172A" /> },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPlatform(p.key as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: platform === p.key ? '2px solid #10B981' : '1px solid #E2E8F0',
                    backgroundColor: platform === p.key ? '#ECFDF5' : '#FFFFFF',
                    color: platform === p.key ? '#047857' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {p.icon}
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom prompt notes */}
        <div className="input-group">
          <label className="input-label">Additional Instructions / Special Highlights (Optional)</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Highlight free refreshments, remind about RTK battery safety, include DGCA approval"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            padding: '12px 24px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '14px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: isGenerating ? 'wait' : 'pointer',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
          }}
        >
          <Wand2 size={16} />
          {isGenerating ? 'Synthesizing with AI Studio...' : `Generate ${platform.toUpperCase()} Copy`}
        </button>
      </div>

      {/* Generated Result Container */}
      {generatedOutput && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '2px solid #10B981',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#047857',
                backgroundColor: '#ECFDF5',
                padding: '3px 10px',
                borderRadius: '8px',
                border: '1px solid #A7F3D0',
                textTransform: 'uppercase',
              }}
            >
              ✓ AI Content Draft Ready ({platform})
            </span>

            <button
              onClick={handleCopyFull}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Copy size={13} /> Copy to Clipboard
            </button>
          </div>

          {/* Headline */}
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
            {generatedOutput.headline}
          </div>

          {/* Body */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '14px', fontSize: '13px', lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-line' }}>
            {generatedOutput.caption}
          </div>

          {/* Hashtags */}
          {generatedOutput.hashtags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {generatedOutput.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#047857',
                    backgroundColor: '#ECFDF5',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
            {generatedOutput.callToAction}
          </div>
        </div>
      )}
    </div>
  );
};
