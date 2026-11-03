import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  Video,
  Upload,
  Calendar,
  MapPin,
  Download,
  Search,
  Plus,
  Play,
  X,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRolePermissions } from '../../core/permissions';
import { GalleryItem } from '../../types';
import {
  PillButton,
  StatusChip,
  BottomSheet,
  EmptyState,
} from '../../components/shared';

export const GalleryView: React.FC = () => {
  const { gallery, events, currentUser, uploadGalleryItem, showToast } = useApp();

  const perms = getRolePermissions(currentUser.role);
  // Promotion, Documentation and Faculty can add media; others view only
  const canUpload = perms.canUploadGallery ||
    currentUser.role === 'faculty' ||
    currentUser.role === 'super_admin' ||
    currentUser.role === 'documentation' ||
    currentUser.role === 'social_media' ||
    (currentUser.team === 'Promotion' && currentUser.role === 'team_admin');

  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [selectedMediaType, setSelectedMediaType] = useState<'All' | 'photo' | 'video'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'photos' | 'videos'>('photos');
  const [uploadEventId, setUploadEventId] = useState(events[0]?.id || 'event_01');
  const [uploadUrl, setUploadUrl] = useState('');

  // Extract event titles for albums
  const eventAlbums = useMemo(() => {
    const list = events.map((e) => e.title);
    return ['All', ...Array.from(new Set(list))];
  }, [events]);

  const filteredItems = useMemo(() => {
    return gallery.filter((item) => {
      if (selectedAlbum !== 'All' && item.eventTitle !== selectedAlbum) {
        return false;
      }
      if (selectedMediaType === 'photo' && item.category !== 'photos') {
        return false;
      }
      if (selectedMediaType === 'video' && item.category !== 'videos') {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchEvent = (item.eventTitle || '').toLowerCase().includes(q);
        if (!matchTitle && !matchEvent) return false;
      }
      return true;
    });
  }, [gallery, selectedAlbum, selectedMediaType, searchQuery]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      showToast('Please enter an asset title.', 'error');
      return;
    }

    const targetEvent = events.find((ev) => ev.id === uploadEventId);
    uploadGalleryItem({
      title: uploadTitle.trim(),
      eventId: uploadEventId,
      eventTitle: targetEvent?.title || 'Chapter Activity',
      category: uploadCategory,
      url: uploadUrl || (uploadCategory === 'photos'
        ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80'
        : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80'),
      uploadedByName: currentUser.name,
      academicYear: new Date().getFullYear().toString(),
    });

    showToast(`✓ Media added to "${targetEvent?.title || 'Gallery'}"!`);
    setIsUploadOpen(false);
    setUploadTitle('');
    setUploadUrl('');
  };

  return (
    <div className="flex flex-col gap-5 select-none animate-fadeIn pb-16">
      {/* 1) Header: Headline, Subtitle, and Conditionally Rendered Upload Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            Gallery & Albums
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Event memories, photos & videos
          </p>
        </div>

        {/* Promotion, Documentation and Faculty can add media; others view only */}
        {canUpload ? (
          <PillButton
            variant="primary"
            icon={<Plus size={16} strokeWidth={1.75} />}
            onClick={() => setIsUploadOpen(true)}
          >
            Add Media
          </PillButton>
        ) : (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]">
            View Only
          </span>
        )}
      </div>

      {/* 2) Event Albums Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-[#051F20] pl-1">Event Albums</label>
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
          {eventAlbums.map((album) => {
            const isSelected = selectedAlbum === album;
            return (
              <button
                key={album}
                type="button"
                onClick={() => setSelectedAlbum(album)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
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
                {album === 'All' ? 'All Event Albums' : album}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3) Media Type Toggle & Search */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-[#DAF1DE] rounded-full border border-[#8EB69B] shrink-0">
          {(['All', 'photo', 'video'] as const).map((type) => {
            const isSelected = selectedMediaType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedMediaType(type)}
                className={`py-1.5 px-3 rounded-full text-xs font-bold transition-all touch-target-44 cursor-pointer ${
                  isSelected
                    ? 'bg-[#163832] text-white shadow-sm'
                    : 'text-[#163832] hover:bg-white/50'
                }`}
              >
                {type === 'All' ? 'All Media' : type === 'photo' ? 'Photos' : 'Videos'}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search album..."
            className="w-full h-12 px-3 text-xs font-medium text-[#051F20] bg-white border border-[#DAF1DE] rounded-full outline-none focus:border-[#163832]"
          />
        </div>
      </div>

      {/* 4) Photo & Video Grid */}
      {filteredItems.length === 0 ? (
        <div
          className="p-8 bg-white border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.06)] flex flex-col items-center text-center"
          style={{ borderRadius: '24px' }}
        >
          <EmptyState
            mascot="camera"
            title="No media in album"
            subtitle="Photos and event video recordings will appear here"
            actionLabel={canUpload ? 'Add Media' : undefined}
            onAction={canUpload ? () => setIsUploadOpen(true) : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isVideo = item.category === 'videos';

            return (
              <div
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className="bg-white border border-[#DAF1DE] rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(5,31,32,0.06)] hover:border-[#8EB69B] transition-all cursor-pointer flex flex-col group"
              >
                {/* Media Thumbnail */}
                <div className="relative w-full h-44 bg-[#051F20] overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Video Play Overlay */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-11 h-11 rounded-full bg-[#163832]/90 text-white flex items-center justify-center shadow-lg border border-[#DAF1DE]">
                        <Play size={18} strokeWidth={2.2} className="ml-0.5 fill-current" />
                      </div>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[rgba(5,31,32,0.7)] text-white backdrop-blur-sm border border-white/20">
                      {isVideo ? 'Video' : 'Photo'}
                    </span>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-4 flex flex-col gap-1">
                  <h3 className="text-xs font-bold text-[#051F20] line-clamp-1">{item.title}</h3>
                  <div className="flex items-center justify-between text-xs text-[#235347]">
                    <span className="truncate">{item.eventTitle || 'Chapter Event'}</span>
                    <span className="shrink-0 font-medium">By {item.uploadedByName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5) Full-Screen Lightbox Viewer */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-[#051F20]/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn"
          onClick={() => setLightboxItem(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-4xl flex items-center justify-between text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#8EB69B]">
                {lightboxItem.eventTitle || 'Chapter Album'} • {lightboxItem.category.toUpperCase()}
              </span>
              <h2 className="text-lg font-bold">{lightboxItem.title}</h2>
            </div>

            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white touch-target-44 cursor-pointer flex items-center justify-center"
              aria-label="Close Lightbox"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Full Screen Image / Video View */}
          <div
            className="my-auto max-w-4xl max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxItem.url}
              alt={lightboxItem.title}
              className="max-w-full max-h-[75vh] object-contain"
            />
          </div>

          {/* Bottom Caption Bar */}
          <div
            className="w-full max-w-4xl p-4 rounded-2xl bg-white/10 text-white flex items-center justify-between backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col text-xs">
              <span>Uploaded by: <strong>{lightboxItem.uploadedByName}</strong></span>
              <span className="text-[#8EB69B]">High-resolution Chapter Archive Asset</span>
            </div>

            <PillButton
              variant="secondary"
              size="sm"
              icon={<Download size={14} strokeWidth={1.75} />}
              onClick={() => {
                showToast('✓ Media download initiated.');
              }}
            >
              Download
            </PillButton>
          </div>
        </div>
      )}

      {/* Upload Media BottomSheet (Promotion, Documentation, Faculty only) */}
      <BottomSheet
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Add Event Media"
        subtitle="Upload photos or videos to chapter albums"
      >
        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 py-2 select-none">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#051F20]">Asset Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Drone Topographic Survey Keynote"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-bold text-[#051F20] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#051F20]">Media Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['photos', 'videos'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setUploadCategory(cat)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border touch-target-44 ${
                    uploadCategory === cat
                      ? 'bg-[#163832] text-white border-[#163832]'
                      : 'bg-white text-[#235347] border-[#DAF1DE]'
                  }`}
                  style={{ borderRadius: '16px' }}
                >
                  {cat === 'photos' ? 'Photo' : 'Video Recording'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#051F20]">Select Event Album</label>
            <select
              value={uploadEventId}
              onChange={(e) => setUploadEventId(e.target.value)}
              className="w-full h-11 px-3 text-xs font-bold text-[#051F20] bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#051F20]">Image or Video URL (optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-medium text-[#051F20] outline-none"
            />
          </div>

          <div className="pt-2">
            <PillButton
              variant="primary"
              fullWidth
              disabled={!uploadTitle.trim()}
              onClick={handleUploadSubmit}
            >
              Upload to Album
            </PillButton>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
};

export default GalleryView;
