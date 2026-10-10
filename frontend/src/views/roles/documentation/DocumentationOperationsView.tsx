import React, { useState } from 'react';
import {
  FileText,
  FileCheck,
  Newspaper,
  Calendar,
  Camera,
  Video,
  Image,
  Scan,
  QrCode,
  MessageSquare,
  Bell,
  Download,
  Upload,
  MapPin,
  Check,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ShortcutTile } from '../../../components/ShortcutTile';
import { CategoryCard } from '../../../components/CategoryCard';
import { ModuleTile } from '../../../components/ModuleTile';
import { BottomSheet } from '../../../components/BottomSheet';
import { Toast } from '../../../components/Toast';

export const DocumentationOperationsView: React.FC = () => {
  const {
    currentUser,
    setActiveTab,
    events,
    gallery,
    docTemplates,
    dailyNews,
    uploadGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  } = useApp();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Templates Modal
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);

  // 2. Documentation Update Modal
  const [isDocUpdateOpen, setIsDocUpdateOpen] = useState(false);
  const [docUpdateEventId, setDocUpdateEventId] = useState(events[0]?.id || 'event_02');
  const [docAuditStatuses, setDocAuditStatuses] = useState<Record<string, 'missing' | 'draft' | 'submitted'>>({
    report: 'draft',
    photos: 'submitted',
    videos: 'draft',
    dailyNews: 'submitted',
    mom: 'submitted',
    feedback: 'missing',
    attendanceSheet: 'submitted',
  });

  // 3. Daily News Editor Modal
  const [isDailyNewsOpen, setIsDailyNewsOpen] = useState(false);
  const [newsTitle, setNewsTitle] = useState('Field Expedition Drone Permits Sanctioned');
  const [newsEventId, setNewsEventId] = useState(events[0]?.id || 'event_02');
  const [newsHeadline, setNewsHeadline] = useState(
    'DGCA clear zones confirmed for upcoming campus aerial canopy mapping survey.'
  );
  const [newsContent, setNewsContent] = useState(
    'The College Directorate has officially granted GeoHub clearance to operate unmanned aerial mapping receivers across Zone B and C.'
  );

  // 4. MoM Author Modal
  const [isMomAuthorOpen, setIsMomAuthorOpen] = useState(false);
  const [momTitle, setMomTitle] = useState('Core Committee Preparation: QGIS Workshop');
  const [momVenue, setMomVenue] = useState('Grand Auditorium Annex');
  const [momDate, setMomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [momAttendees, setMomAttendees] = useState(
    'Dr. Sarah Jenkins, Alex Rivera, Aarav Patel, Elena Rostova, David Chen'
  );
  const [momAgenda, setMomAgenda] = useState(
    '1. Turnstile gate attendance terminals\n2. Geotagged photographic documentation\n3. Pre-event briefing and attendee roster'
  );
  const [momDecisions, setMomDecisions] = useState(
    '1. All camera units must record GPS coordinates.\n2. Documentation squad will publish daily news bulletin within 4 hours of closing.'
  );
  const [momActions, setMomActions] = useState(
    'Aarav Patel: Finalize drone camera calibration | Elena: Gate terminal setup'
  );

  // 5. Photo Upload Modal (Geotagged or Normal with progress)
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('Laboratory Spectrometer Calibration');
  const [photoEventId, setPhotoEventId] = useState(events[0]?.id || 'event_02');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  );
  const [photoGeotag, setPhotoGeotag] = useState(true);
  const [photoCoords] = useState({
    lat: 13.0827,
    lng: 80.2707,
    locationName: 'Main Campus Grand Auditorium',
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // 6. Video Links Modal
  const [isVideoLinksOpen, setIsVideoLinksOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState('Drone Corridor 4K Aerial Orthomosaic Stream');
  const [videoEventId, setVideoEventId] = useState(events[0]?.id || 'event_02');
  const [videoUrl, setVideoUrl] = useState('https://youtu.be/geohub_live_aerial');
  const [videoError, setVideoError] = useState<string | null>(null);

  // 7. Gallery Manager Modal
  const [isGalleryManagerOpen, setIsGalleryManagerOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editCaptionText, setEditCaptionText] = useState('');

  const handleDailyNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('✓ Daily Chapter News bulletin published!');
    setIsDailyNewsOpen(false);
  };

  const handleMomAuthorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`✓ MoM "${momTitle}" authored & exported!`);
    setIsMomAuthorOpen(false);
  };

  const handlePhotoUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) return;

    setIsUploading(true);
    setUploadProgress(20);
    const targetEvent = events.find((ev) => ev.id === photoEventId);

    setTimeout(() => setUploadProgress(65), 300);
    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      setIsPhotoUploadOpen(false);

      uploadGalleryItem({
        title: photoTitle,
        eventId: photoEventId,
        eventTitle: targetEvent?.title || 'QGIS Workshop',
        academicYear: '2026-2027',
        category: 'photos',
        mediaType: 'photo',
        submissionStatus: 'verified',
        url: photoUrl,
        uploadedByName: `${currentUser.name} (Doc Lead)`,
        fileSizeBytes: '8.4 MB',
        geotag: photoGeotag ? photoCoords : undefined,
      });

      showToast(`✓ Uploaded & Geotagged: "${photoTitle}"`);
    }, 700);
  };

  const handleVideoLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be') && !videoUrl.includes('drive.google.com')) {
      setVideoError('Please enter a valid YouTube, Vimeo, or Google Drive URL.');
      return;
    }
    setVideoError(null);
    const targetEvent = events.find((ev) => ev.id === videoEventId);

    uploadGalleryItem({
      title: videoTitle,
      eventId: videoEventId,
      eventTitle: targetEvent?.title || 'QGIS Workshop',
      academicYear: '2026-2027',
      category: 'videos',
      mediaType: 'video',
      submissionStatus: 'verified',
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      uploadedByName: `${currentUser.name} (Doc Lead)`,
      fileSizeBytes: 'Streaming Link',
    });

    showToast(`✓ Cataloged Video Link: "${videoTitle}"`);
    setIsVideoLinksOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMsg && (
        <Toast message={toastMsg} type="success" onClose={() => setToastMsg(null)} />
      )}

      {/* Screen Title & Role Subtitle */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Documentation Lead
          </span>
          <span className="text-[11px] font-semibold text-slate-400">Archival & Press Suite</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Club Operations Hub</h1>
      </div>

      {/* Shortcuts (row of 4): Templates, Daily News, Upload, Checklists */}
      <div
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          maxWidth: '480px',
          gap: '8px',
        }}
      >
        <ShortcutTile
          label="Templates"
          icon={<FileText size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          iconColor="#065F46"
          onClick={() => setIsTemplatesModalOpen(true)}
        />

        <ShortcutTile
          label="Daily News"
          icon={<Newspaper size={20} />}
          iconBg="#FFF8E6"
          iconBorder="#FDE68A"
          iconColor="#92400E"
          onClick={() => setIsDailyNewsOpen(true)}
        />

        <ShortcutTile
          label="Upload"
          icon={<Upload size={20} />}
          iconBg="#F3EEFF"
          iconBorder="#DDD1FF"
          iconColor="#5B21B6"
          onClick={() => setIsPhotoUploadOpen(true)}
        />

        <ShortcutTile
          label="Checklists"
          icon={<FileCheck size={20} />}
          iconBg="#E8FBF8"
          iconBorder="#99F6E4"
          iconColor="#0D9488"
          onClick={() => setIsDocUpdateOpen(true)}
        />
      </div>

      {/* Category 1: Documentation (4 modules) */}
      <CategoryCard title="Documentation" countBadge={4}>
        <ModuleTile
          title="Templates"
          icon={<FileText size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          accentColor="#059669"
          onClick={() => setIsTemplatesModalOpen(true)}
        />

        <ModuleTile
          title="Documentation Update"
          icon={<FileCheck size={20} />}
          iconBg="#E8FBF8"
          iconBorder="#99F6E4"
          accentColor="#0D9488"
          onClick={() => setIsDocUpdateOpen(true)}
        />

        <ModuleTile
          title="Daily News editor"
          icon={<Newspaper size={20} />}
          iconBg="#FFF8E6"
          iconBorder="#FDE68A"
          accentColor="#92400E"
          onClick={() => setIsDailyNewsOpen(true)}
        />

        <ModuleTile
          title="MoM Author"
          icon={<Calendar size={20} />}
          iconBg="#F3EEFF"
          iconBorder="#DDD1FF"
          accentColor="#5B21B6"
          onClick={() => setIsMomAuthorOpen(true)}
        />
      </CategoryCard>

      {/* Category 2: Media Archives (3 modules) */}
      <CategoryCard title="Media Archives" countBadge={3}>
        <ModuleTile
          title="Photo Upload"
          icon={<Camera size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          accentColor="#2563EB"
          onClick={() => setIsPhotoUploadOpen(true)}
        />

        <ModuleTile
          title="Video Links"
          icon={<Video size={20} />}
          iconBg="#F5F3FF"
          iconBorder="#DDD1FF"
          accentColor="#7C3AED"
          onClick={() => setIsVideoLinksOpen(true)}
        />

        <ModuleTile
          title="Gallery Manager"
          icon={<Image size={20} />}
          iconBg="#FFF8E6"
          iconBorder="#FDE68A"
          accentColor="#B45309"
          onClick={() => setIsGalleryManagerOpen(true)}
        />
      </CategoryCard>

      {/* Category 3: Attendance & Gates (2 modules) */}
      <CategoryCard title="Attendance & Gates" countBadge={2}>
        <ModuleTile
          title="Turnstile Check-in"
          icon={<Scan size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          accentColor="#2563EB"
          onClick={() => setActiveTab('scan_qr')}
        />

        <ModuleTile
          title="Dynamic QR"
          icon={<QrCode size={20} />}
          iconBg="#F3EEFF"
          iconBorder="#DDD1FF"
          accentColor="#7C3AED"
          onClick={() => setActiveTab('my_qr')}
        />
      </CategoryCard>

      {/* Category 4: Communication (2 modules) */}
      <CategoryCard title="Communication" countBadge={2}>
        <ModuleTile
          title="Post & Pin"
          icon={<MessageSquare size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          accentColor="#1D4ED8"
          onClick={() => setActiveTab('forum')}
        />

        <ModuleTile
          title="Advisories"
          icon={<Bell size={20} />}
          iconBg="#FEF2F2"
          iconBorder="#FECACA"
          accentColor="#DC2626"
          onClick={() => setActiveTab('notifications')}
        />
      </CategoryCard>

      {/* Category 5: Reports (1 module) */}
      <CategoryCard title="Reports" countBadge={1}>
        <ModuleTile
          title="Official Dossier"
          icon={<Download size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          accentColor="#059669"
          onClick={() => {
            showToast('✓ Generating Official Chapter Dossier export...');
          }}
        />
      </CategoryCard>

      {/* =========================================================================
          MODALS & SHEETS FOR DOCUMENTATION LEAD
          ========================================================================= */}

      {/* 1. Templates Prefilled Modal */}
      <BottomSheet
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        title="Official Documentation Templates"
        subtitle="Prefilled from latest chapter event metrics with 1-click export"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {docTemplates.map((tpl, idx) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setActiveTemplateIdx(idx)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTemplateIdx === idx
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
            {docTemplates[activeTemplateIdx]?.defaultContent
              .replace(/\[Event Title Here\]/g, events[0]?.title || 'QGIS Workshop')
              .replace(/\[Event Title\]/g, events[0]?.title || 'QGIS Workshop')
              .replace(/\[Date\]/g, new Date().toLocaleDateString())
              .replace(/\[Venue Name \/ Geo Coordinates\]/g, events[0]?.venue || 'Grand Auditorium')
              .replace(/\[Venue \/ Auditorium\]/g, events[0]?.venue || 'Grand Auditorium')}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(docTemplates[activeTemplateIdx]?.defaultContent || '');
                showToast('✓ Template markdown copied to clipboard');
              }}
              className="flex-1 py-2.5 rounded-full font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Copy Markdown
            </button>
            <button
              type="button"
              onClick={() => {
                showToast('✓ Downloaded template document (.txt)');
                setIsTemplatesModalOpen(false);
              }}
              className="flex-1 py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Export Word / Text
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* 2. Documentation Update Modal */}
      <BottomSheet
        isOpen={isDocUpdateOpen}
        onClose={() => setIsDocUpdateOpen(false)}
        title="Event Documentation Checklist Audit"
        subtitle="Verify all mandatory submission deliverables for selected chapter activity"
      >
        <div className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Event</label>
            <select
              value={docUpdateEventId}
              onChange={(e) => setDocUpdateEventId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {[
              { key: 'report', label: 'Event Report', desc: 'Post-event outcomes brief' },
              { key: 'photos', label: 'Photos (Geotagged / Normal)', desc: 'High-res images with GPS records' },
              { key: 'videos', label: 'Videos (as links)', desc: 'Validated video links' },
              { key: 'dailyNews', label: 'Daily News', desc: 'Official bulletin published' },
              { key: 'mom', label: 'MoM (Minutes of Meeting)', desc: 'Signed meeting minutes' },
              { key: 'feedback', label: 'Feedback Summary', desc: 'Survey analytics & quotes' },
              { key: 'attendanceSheet', label: 'Attendance Sheet', desc: 'Gate scanner barcode records' },
            ].map((chk) => {
              const st = docAuditStatuses[chk.key] || 'missing';
              const chipClass =
                st === 'submitted'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
                  : st === 'draft'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                  : 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';

              return (
                <div
                  key={chk.key}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{chk.label}</span>
                    <span className="text-[11px] text-slate-400">{chk.desc}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = st === 'missing' ? 'draft' : st === 'draft' ? 'submitted' : 'missing';
                      setDocAuditStatuses((prev) => ({ ...prev, [chk.key]: next }));
                      showToast(`✓ Updated ${chk.label} to ${next.toUpperCase()}`);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] border shadow-2xs transition-all cursor-pointer uppercase tracking-wider ${chipClass}`}
                  >
                    {st === 'submitted' ? '✓ Submitted' : st === 'draft' ? '✎ Draft' : '✗ Missing'}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsDocUpdateOpen(false);
              showToast('✓ Documentation checklist audit saved!');
            }}
            className="w-full py-2.5 rounded-full font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all mt-1"
          >
            Confirm & Save Checklist Status
          </button>
        </div>
      </BottomSheet>

      {/* 3. Daily News Editor Modal */}
      <BottomSheet
        isOpen={isDailyNewsOpen}
        onClose={() => setIsDailyNewsOpen(false)}
        title="Write Daily Chapter News"
        subtitle="Compose and publish official daily activities to members feed"
      >
        <form onSubmit={handleDailyNewsSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              required
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="e.g. Drone Corridor Permission Sanctioned"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Associated Event</label>
            <select
              value={newsEventId}
              onChange={(e) => setNewsEventId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary (Sub-headline)</label>
            <input
              type="text"
              required
              value={newsHeadline}
              onChange={(e) => setNewsHeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="Summary for chapter feed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bulletin Story / Details</label>
            <textarea
              rows={4}
              required
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none resize-none leading-relaxed"
              placeholder="Write the full news brief..."
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Author: <strong>{currentUser.name}</strong></span>
            <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 font-bold">
              Documentation Squad
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer mt-1"
          >
            Publish Daily News Bulletin
          </button>
        </form>
      </BottomSheet>

      {/* 4. MoM Author Modal */}
      <BottomSheet
        isOpen={isMomAuthorOpen}
        onClose={() => setIsMomAuthorOpen(false)}
        title="Author Minutes of Meeting (MoM)"
        subtitle="Full authoring, attendee roll-call, decisions, and export"
      >
        <form onSubmit={handleMomAuthorSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Title</label>
            <input
              type="text"
              required
              value={momTitle}
              onChange={(e) => setMomTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={momDate}
                onChange={(e) => setMomDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Venue / Room</label>
              <input
                type="text"
                value={momVenue}
                onChange={(e) => setMomVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Attendees Present</label>
            <input
              type="text"
              value={momAttendees}
              onChange={(e) => setMomAttendees(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Agenda Items Discussed</label>
            <textarea
              rows={2}
              value={momAgenda}
              onChange={(e) => setMomAgenda(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Decisions Approved</label>
            <textarea
              rows={2}
              value={momDecisions}
              onChange={(e) => setMomDecisions(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Action Items & Squad Assignees</label>
            <textarea
              rows={2}
              value={momActions}
              onChange={(e) => setMomActions(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-700 text-white hover:bg-purple-800 shadow-sm transition-all cursor-pointer mt-1"
          >
            Sign & Publish Official Minutes (MoM)
          </button>
        </form>
      </BottomSheet>

      {/* 5. Photo Upload Modal */}
      <BottomSheet
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        title="Upload Archival Photo"
        subtitle="Store high-resolution photograph with embedded geolocation metadata"
      >
        <form onSubmit={handlePhotoUploadSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Photo Title / Caption</label>
            <input
              type="text"
              required
              value={photoTitle}
              onChange={(e) => setPhotoTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="e.g. Spectrometer Calibration Session"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Associated Event</label>
            <select
              value={photoEventId}
              onChange={(e) => setPhotoEventId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              required
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          {/* Geotag Toggle */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950">
                <MapPin size={16} strokeWidth={1.75} className="text-emerald-600" />
                <span>Geotag with Browser Location</span>
              </div>
              <input
                type="checkbox"
                checked={photoGeotag}
                onChange={(e) => setPhotoGeotag(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer rounded"
              />
            </div>

            {photoGeotag && (
              <div className="text-[11px] text-emerald-800 font-medium">
                📍 Location Coordinates: <strong>{photoCoords.lat}° N, {photoCoords.lng}° E</strong> ({photoCoords.locationName})
              </div>
            )}
          </div>

          {isUploading && (
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Uploading to Media Archives...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer mt-1 disabled:opacity-60"
          >
            {isUploading ? 'Uploading Media...' : 'Upload & Archive Photo'}
          </button>
        </form>
      </BottomSheet>

      {/* 6. Video Links Modal */}
      <BottomSheet
        isOpen={isVideoLinksOpen}
        onClose={() => setIsVideoLinksOpen(false)}
        title="Archive Event Video Link"
        subtitle="Validate and catalog YouTube, Vimeo, or Google Drive recordings"
      >
        <form onSubmit={handleVideoLinkSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Video Title</label>
            <input
              type="text"
              required
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="e.g. Drone Corridor Flight Survey Stream"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Associated Event</label>
            <select
              value={videoEventId}
              onChange={(e) => setVideoEventId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Validated Video URL</label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setVideoError(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="https://youtube.com/... or drive.google.com/..."
            />
            {videoError && (
              <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                {videoError}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer mt-2"
          >
            Validate & Catalog Video
          </button>
        </form>
      </BottomSheet>

      {/* 7. Gallery Manager Modal */}
      <BottomSheet
        isOpen={isGalleryManagerOpen}
        onClose={() => setIsGalleryManagerOpen(false)}
        title="Gallery & Media Manager"
        subtitle="Edit media captions or delete items with confirmation"
      >
        <div className="flex flex-col gap-3 py-1 max-h-[70vh] overflow-y-auto">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-xs text-slate-900 truncate">
                    {item.title}
                  </span>
                  {editingItemId === item.id ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={editCaptionText}
                        onChange={(e) => setEditCaptionText(e.target.value)}
                        className="px-2 py-0.5 rounded-lg border border-emerald-400 text-xs font-medium outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          updateGalleryItem(item.id, { caption: editCaptionText });
                          setEditingItemId(null);
                          showToast('✓ Caption updated');
                        }}
                        className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Check size={16} strokeWidth={1.75} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.caption || 'No caption'}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {item.eventTitle} • {item.fileSizeBytes || '3 MB'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItemId(item.id);
                    setEditCaptionText(item.caption || '');
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteGalleryItem(item.id);
                    showToast('✓ Removed item from gallery');
                  }}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 size={16} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};
