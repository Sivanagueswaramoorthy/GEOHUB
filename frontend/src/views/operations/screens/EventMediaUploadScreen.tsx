import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  X,
  Film,
  Play,
  Trash2,
  Download,
  Sparkles,
  Check,
  Video,
} from 'lucide-react';
import { AnimatedNumber, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

export interface MediaUploadItem {
  id: string;
  eventId: string;
  event: string;
  title: string;
  type: 'image' | 'video' | 'document';
  category: string;
  size: string;
  uploadedBy: string;
  date: string;
  url: string;
}

export interface EventMediaUploadScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

const DEFAULT_SAMPLE_MEDIA: MediaUploadItem[] = [
  {
    id: 'sample_media_01',
    eventId: 'evt_drone',
    event: 'Fullstack Drone Camp',
    title: 'Autonomous Flight Mission Topographic Scan',
    type: 'image',
    category: 'Drone Photography',
    size: '4.8 MB',
    uploadedBy: 'Documentation Lead',
    date: '2026-11-20',
    url: '/nature-splash-new.jpg',
  },
  {
    id: 'sample_media_02',
    eventId: 'evt_drone',
    event: 'Fullstack Drone Camp',
    title: 'Quadcopter Obstacle Navigation & Field Test',
    type: 'video',
    category: 'Drone Footage',
    size: '24.2 MB',
    uploadedBy: 'Technical Team',
    date: '2026-11-21',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'sample_media_03',
    eventId: 'evt_drone',
    event: 'Fullstack Drone Camp',
    title: 'Hardware Assembly & Telemetry Workshop',
    type: 'image',
    category: 'Event Photos',
    size: '3.1 MB',
    uploadedBy: 'Media Squad',
    date: '2026-11-22',
    url: '/nature-splash-cartoon.jpg',
  },
];

export const EventMediaUploadScreen: React.FC<EventMediaUploadScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const { gallery, events, showToast, uploadGalleryItem, deleteGalleryItem } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventDropdownRef = useRef<HTMLDivElement>(null);

  // Step 1: Select Event Title First (Default to drone camp or first available event)
  const [chosenEventId, setChosenEventId] = useState<string>(() => {
    const drone = events?.find((e) => e.title.toLowerCase().includes('drone'));
    if (drone) return drone.id;
    const live = events?.find((e) => e.status === 'live');
    if (live) return live.id;
    return events?.[0]?.id || 'evt_drone';
  });

  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaUploadItem | null>(null);

  // Close event selector dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(e.target as Node)) {
        setIsEventDropdownOpen(false);
      }
    };
    if (isEventDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEventDropdownOpen]);

  // Selected Event Model
  const chosenEvent = useMemo(() => {
    return (
      events?.find((e) => e.id === chosenEventId) ||
      events?.[0] || {
        id: 'evt_drone',
        title: 'Fullstack Drone Camp',
        venue: 'Aero CAD Lab & Campus Quadrangle',
        startDate: '2026-11-28',
        status: 'approved',
      }
    );
  }, [events, chosenEventId]);

  // Initialize media list combining persistent AppContext gallery and initial samples
  const [mediaList, setMediaList] = useState<MediaUploadItem[]>(() => {
    const fromGallery: MediaUploadItem[] = (gallery || []).map((g: any) => ({
      id: g.id,
      eventId: g.eventId || '',
      event: g.eventTitle || 'Campus Initiative',
      title: g.title,
      type: (g.mediaType === 'video' || g.category === 'videos' ? 'video' : 'image') as 'image' | 'video',
      category: g.category || 'Event Photos',
      size: g.fileSizeBytes || g.size || '3.5 MB',
      uploadedBy: g.uploadedByName || g.uploadedBy || 'Documentation Lead',
      date: g.uploadedAt ? new Date(g.uploadedAt).toLocaleDateString() : 'Today',
      url: g.url,
    }));

    if (fromGallery.length > 0) return fromGallery;
    if (!events || events.length === 0) return [];
    return DEFAULT_SAMPLE_MEDIA;
  });

  // Keep mediaList updated if AppContext gallery changes
  useEffect(() => {
    if (gallery && gallery.length > 0) {
      const fromGallery: MediaUploadItem[] = gallery.map((g: any) => ({
        id: g.id,
        eventId: g.eventId || '',
        event: g.eventTitle || 'Campus Initiative',
        title: g.title,
        type: (g.mediaType === 'video' || g.category === 'videos' ? 'video' : 'image') as 'image' | 'video',
        category: g.category || 'Event Photos',
        size: g.fileSizeBytes || g.size || '3.5 MB',
        uploadedBy: g.uploadedByName || g.uploadedBy || 'Documentation Lead',
        date: g.uploadedAt ? new Date(g.uploadedAt).toLocaleDateString() : 'Today',
        url: g.url,
      }));
      setMediaList((prev) => {
        // Merge without losing locally uploaded object URLs
        const existingIds = new Set(fromGallery.map((m) => m.id));
        const localOnly = prev.filter((p) => !existingIds.has(p.id));
        return [...localOnly, ...fromGallery];
      });
    }
  }, [gallery]);

  // Media belonging strictly to the selected event
  const currentEventMedia = useMemo(() => {
    return mediaList.filter((m) => {
      if (m.eventId && m.eventId === chosenEvent.id) return true;
      if (m.event && chosenEvent.title && m.event.toLowerCase() === chosenEvent.title.toLowerCase()) return true;
      return false;
    });
  }, [mediaList, chosenEvent]);

  // Metric counts for the selected event
  const photoCount = useMemo(() => {
    return currentEventMedia.filter((m) => m.type === 'image').length;
  }, [currentEventMedia]);

  const videoCount = useMemo(() => {
    return currentEventMedia.filter((m) => m.type === 'video').length;
  }, [currentEventMedia]);

  const totalStorageMb = useMemo(() => {
    const totalMb = currentEventMedia.reduce((acc, m) => {
      const parsed = parseFloat(m.size.replace(/[^\d.]/g, '')) || 2.5;
      return acc + parsed;
    }, 0);
    return totalMb.toFixed(1);
  }, [currentEventMedia]);

  // Filtered and Sorted media for presentation
  const filteredAndSortedMedia = useMemo(() => {
    let list = [...currentEventMedia];

    if (mediaTypeFilter !== 'all') {
      list = list.filter((m) => m.type === mediaTypeFilter);
    }

    list.sort((a, b) => {
      const cmp = (a.title || '').localeCompare(b.title || '');
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [currentEventMedia, mediaTypeFilter, sortOrder]);

  // Event Change Handler
  const handleSelectEvent = (eventId: string) => {
    setChosenEventId(eventId);
    setIsEventDropdownOpen(false);
    const target = events?.find((e) => e.id === eventId);
    showToast?.(target?.title ? `Event: ${target.title}` : 'Event Selected', 'info');
  };

  // Real File Upload from Device for the Chosen Event
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newItems: MediaUploadItem[] = [];

    Array.from(files).forEach((file, idx) => {
      const isVideo = file.type.startsWith('video');
      const type: 'image' | 'video' = isVideo ? 'video' : 'image';
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const url = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, '');
      const uniqueId = `media-${Date.now()}-${idx}`;

      const newItem: MediaUploadItem = {
        id: uniqueId,
        eventId: chosenEvent.id,
        event: chosenEvent.title,
        title,
        type,
        category: isVideo ? 'Drone Footage' : 'Event Photography',
        size: sizeMb,
        uploadedBy: currentUser?.name || 'Documentation Lead',
        date: new Date().toLocaleDateString('en-US'),
        url,
      };

      newItems.push(newItem);

      // Persist to AppContext gallery
      if (uploadGalleryItem) {
        uploadGalleryItem({
          title,
          eventId: chosenEvent.id,
          eventTitle: chosenEvent.title,
          academicYear: '2025-26',
          category: isVideo ? 'videos' : 'photos',
          mediaType: isVideo ? 'video' : 'photo',
          url,
          uploadedByName: currentUser?.name || 'Documentation Lead',
          fileSizeBytes: sizeMb,
        });
      }
    });

    setTimeout(() => {
      setMediaList((prev) => [...newItems, ...prev]);
      setIsUploading(false);
      onLogAudit(chosenEvent.title, `Uploaded ${newItems.length} media file(s) for ${chosenEvent.title}`);
      showToast?.(`Media Uploaded (${newItems.length})`, 'success');
      setUploadSuccess(`✓ Successfully uploaded ${newItems.length} media file(s) for ${chosenEvent.title}`);
      setTimeout(() => setUploadSuccess(null), 3500);
      if (e.target) e.target.value = '';
    }, 450);
  };

  // Delete Media Item
  const handleDeleteMedia = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    if (deleteGalleryItem) {
      deleteGalleryItem(id);
    }
    if (previewMedia?.id === id) {
      setPreviewMedia(null);
    }
    showToast?.('Media removed', 'info');
  };

  // Trigger file picker
  const handleTriggerUpload = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden animate-fadeIn pb-24">
      {/* Hidden File Picker (Properly Hidden, No Raw Browser Button) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        style={{ display: 'none' }}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />

      {/* STEP 1: SELECT EVENT TITLE FIRST CARD */}
      <div className="bg-white p-4 rounded-3xl border border-[#E2EBE5] shadow-[0_4px_20px_rgba(5,31,32,0.03)] flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#051F20] flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] text-[#163832] flex items-center justify-center shrink-0">
              <Calendar size={13} strokeWidth={2.2} />
            </div>
            <span>Select Event Title:</span>
          </span>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#163832] border border-[#DAF1DE]/60">
            {events?.length || 0} Available
          </span>
        </div>

        {/* Custom Event Selector Dropdown */}
        <div className="relative w-full" ref={eventDropdownRef}>
          <button
            type="button"
            onClick={() => setIsEventDropdownOpen((prev) => !prev)}
            aria-expanded={isEventDropdownOpen}
            aria-haspopup="listbox"
            className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer select-none ${
              isEventDropdownOpen
                ? 'bg-[#F2F8F4] border-[#163832] ring-2 ring-[#163832]/10 shadow-sm'
                : 'bg-[#FAFCFA] border-[#DDE7DF] hover:bg-[#F2F7F4] hover:border-[#8EB69B]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#163832] flex items-center justify-center shrink-0">
                <Sparkles size={15} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-[#051F20] truncate">
                  {chosenEvent?.title || 'Select an Event'}
                </span>
                <span className="text-[10.5px] font-medium text-[#235347] truncate flex items-center gap-1.5">
                  <span>
                    {chosenEvent?.startDate || (chosenEvent as any)?.date
                      ? new Date(chosenEvent.startDate || (chosenEvent as any).date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Active Event'}
                  </span>
                  <span>•</span>
                  <span>{chosenEvent?.venue || (chosenEvent as any)?.location || 'Campus'}</span>
                  <span>•</span>
                  <span className="font-semibold text-[#163832]">{currentEventMedia.length} Media Assets</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  chosenEvent?.status === 'approved' || chosenEvent?.status === 'live'
                    ? 'bg-[#EAF3EC] text-[#163832] border-[#8EB69B]/60'
                    : chosenEvent?.status === 'cancelled'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {(chosenEvent?.status || 'approved').toUpperCase()}
              </span>
              <ChevronDown
                size={16}
                className={`text-[#235347] transition-transform duration-200 ${
                  isEventDropdownOpen ? 'rotate-180 text-[#163832]' : ''
                }`}
              />
            </div>
          </button>

          {/* Accessible hidden select for tests & accessibility */}
          <select
            value={chosenEventId}
            onChange={(e) => handleSelectEvent(e.target.value)}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            data-testid="event-media-selector"
          >
            {(events || []).map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.status.toUpperCase()})
              </option>
            ))}
          </select>

          {/* Animated Dropdown Menu List */}
          {isEventDropdownOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-2 z-40 bg-white rounded-2xl border border-[#DAF1DE] shadow-[0_12px_36px_rgba(5,31,32,0.14)] p-1.5 flex flex-col gap-1 max-h-60 overflow-y-auto no-scrollbar animate-fadeIn"
              role="listbox"
            >
              {(events || []).map((ev) => {
                const isSelected = ev.id === chosenEventId;
                const isApproved = ev.status === 'approved' || ev.status === 'live';
                const count = mediaList.filter((m) => m.eventId === ev.id || m.event === ev.title).length;

                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => handleSelectEvent(ev.id)}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      isSelected ? 'bg-[#EAF3EC] text-[#163832]' : 'hover:bg-[#F7FAF8] text-[#051F20]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#163832] bg-[#163832] text-white' : 'border-[#CBDAD0] bg-white'
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-xs truncate ${
                            isSelected ? 'font-bold text-[#163832]' : 'font-semibold text-[#051F20]'
                          }`}
                        >
                          {ev.title}
                        </span>
                        <span className="text-[10px] text-[#235347] truncate">
                          {ev.startDate || (ev as any).date
                            ? new Date(ev.startDate || (ev as any).date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Scheduled'}{' '}
                          {ev.venue || (ev as any).location ? `• ${ev.venue || (ev as any).location}` : ''} •{' '}
                          {count} media
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        isApproved
                          ? 'bg-[#DAF1DE]/70 text-[#163832] border-[#8EB69B]/50'
                          : ev.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {ev.status.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DYNAMIC METRIC STRIP FOR CHOSEN EVENT */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-3 rounded-2xl bg-white border border-[#E2EBE5] shadow-[0_2px_12px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wider">Total Assets</span>
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] flex items-center justify-center text-[#163832]">
              <ImageIcon size={13} strokeWidth={2.2} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={currentEventMedia.length} /> Files
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#E2EBE5] shadow-[0_2px_12px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wider">Photos</span>
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] flex items-center justify-center text-[#163832]">
              <ImageIcon size={13} strokeWidth={2.2} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-sm sm:text-base mt-1">
            {photoCount} Images
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#E2EBE5] shadow-[0_2px_12px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wider">Videos</span>
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] flex items-center justify-center text-[#163832]">
              <Film size={13} strokeWidth={2.2} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-xs sm:text-sm mt-1 truncate">
            {videoCount} Clips ({totalStorageMb} MB)
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#EAF3EC] border border-[#DAF1DE] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#163832] uppercase tracking-wider">Action</span>
          {!readOnly && (
            <button
              type="button"
              disabled={isUploading}
              onClick={handleTriggerUpload}
              className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
              data-testid="btn-upload-media"
            >
              <Upload size={14} strokeWidth={2.2} />
              <span>{isUploading ? 'Uploading...' : 'Upload Media'}</span>
            </button>
          )}
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3 rounded-2xl bg-[#EAF3EC] border border-[#8EB69B]/50 text-[#051F20] text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-[#163832] shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* STEP 2: UPLOAD PHOTOS & VIDEOS BOUND TO SELECTED EVENT */}
      {!readOnly && (
        <div
          onClick={handleTriggerUpload}
          className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-dashed border-[#8EB69B] hover:border-[#163832] hover:bg-[#FAFCFA] transition-all cursor-pointer text-center space-y-2 shadow-[0_2px_14px_rgba(5,31,32,0.02)]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3EC] text-[#163832] mx-auto flex items-center justify-center shadow-xs">
            <Upload size={20} strokeWidth={2.2} />
          </div>

          <div className="space-y-0.5">
            <h3 className="font-extrabold text-[#051F20] text-sm sm:text-base">
              Upload Photos & Videos for {chosenEvent.title}
            </h3>
            <p className="text-xs text-[#235347] max-w-sm mx-auto">
              Select device files or drop event photography, drone footage, and recap recordings here
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              className="h-9 px-5 rounded-full bg-[#163832] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer hover:bg-[#0B2B26] active:scale-95 transition-all"
            >
              <Upload size={14} strokeWidth={2.2} />
              <span>Select from Device</span>
            </button>
          </div>

          <div className="text-[10.5px] font-semibold text-[#8EB69B] uppercase tracking-wider pt-1">
            Accepts: JPG • PNG • WEBP • MP4 • MOV • WEBM (Multi-file)
          </div>
        </div>
      )}

      {/* STEP 3: EVENT MEDIA REPOSITORY & GALLERY FOR SELECTED EVENT */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-[#E2EBE5] shadow-[0_4px_20px_rgba(5,31,32,0.03)] space-y-4">
        {/* Header with Title and Media Filter Controls */}
        <div className="flex flex-col gap-3 pb-3 border-b border-[#EDF3EF]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#051F20] text-base sm:text-lg tracking-tight">
                {chosenEvent.title} Media Repository
              </h2>
              <span className="text-xs text-[#235347]">
                {currentEventMedia.length} assets available for this event
              </span>
            </div>
          </div>

          {/* Clean Segmented Filter Pills & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
            {/* Filter Pills: All / Photos / Videos */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EEF4F0] border border-[#E0EAE2] w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setMediaTypeFilter('all')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mediaTypeFilter === 'all'
                    ? 'bg-[#163832] text-white shadow-xs'
                    : 'text-[#235347] hover:text-[#051F20]'
                }`}
              >
                All ({currentEventMedia.length})
              </button>
              <button
                type="button"
                onClick={() => setMediaTypeFilter('image')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mediaTypeFilter === 'image'
                    ? 'bg-[#163832] text-white shadow-xs'
                    : 'text-[#235347] hover:text-[#051F20]'
                }`}
              >
                <ImageIcon size={12} strokeWidth={2.2} />
                <span>Photos ({photoCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaTypeFilter('video')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mediaTypeFilter === 'video'
                    ? 'bg-[#163832] text-white shadow-xs'
                    : 'text-[#235347] hover:text-[#051F20]'
                }`}
              >
                <Film size={12} strokeWidth={2.2} />
                <span>Videos ({videoCount})</span>
              </button>
            </div>

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="h-8 px-3 rounded-xl border border-[#DDE7DF] text-xs font-bold text-[#163832] bg-[#FAFCFA] hover:bg-[#EAF3EC] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs w-full sm:w-auto"
              title={`Sort by Name (${sortOrder === 'asc' ? 'Ascending A-Z' : 'Descending Z-A'})`}
              aria-label="Sort by Name"
            >
              <ArrowUpDown size={13} strokeWidth={2.2} className="shrink-0" />
              <span>Sort ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})</span>
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {filteredAndSortedMedia.length > 0 ? (
            filteredAndSortedMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => setPreviewMedia(item)}
                className="group rounded-2xl bg-[#FAFCFA] border border-[#E2EBE5] overflow-hidden hover:border-[#8EB69B] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Media Container */}
                <div className="relative aspect-video w-full bg-[#051F20]/5 overflow-hidden flex items-center justify-center">
                  {item.type === 'video' ? (
                    <div className="relative w-full h-full bg-[#0B2B26] flex items-center justify-center">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover opacity-80"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-[#051F20]/30 group-hover:bg-[#051F20]/15 transition-colors flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-[#163832]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={18} fill="white" className="ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#051F20]/80 text-white backdrop-blur-xs uppercase flex items-center gap-1">
                      {item.type === 'video' ? <Film size={10} /> : <ImageIcon size={10} />}
                      <span>{item.type}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-[#051F20] backdrop-blur-xs">
                      {item.size}
                    </span>
                  </div>

                  {/* Quick Delete button */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteMedia(item.id, e)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      title="Delete media"
                      aria-label="Delete media item"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Card Meta */}
                <div className="p-3 space-y-1">
                  <div className="text-xs font-bold text-[#051F20] line-clamp-1">
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#235347]">
                    <span className="font-semibold text-[#163832] truncate max-w-[160px]">
                      {item.event}
                    </span>
                    <span className="shrink-0">{item.uploadedBy}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-6">
              <EmptyState
                mascot="camera"
                title={`No Media for "${chosenEvent.title}" Yet`}
                description={`Upload photos and video recordings for "${chosenEvent.title}". Select your files above to archive them.`}
                actionLabel={!readOnly ? `+ Upload Media for ${chosenEvent.title}` : undefined}
                onAction={!readOnly ? handleTriggerUpload : undefined}
              />
            </div>
          )}
        </div>
      </div>

      {/* FULL-SIZE PREVIEW & PLAYBACK MODAL */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300 animate-fadeIn"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white rounded-3xl p-5 shadow-[0_24px_60px_rgba(5,31,32,0.25)] border border-[#E2EBE5] space-y-3">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#EDF3EF]">
              <div className="min-w-0 pr-2">
                <h3 className="font-bold text-[#051F20] text-sm sm:text-base truncate">
                  {previewMedia.title}
                </h3>
                <span className="text-xs text-[#235347] truncate block">
                  Event: <strong>{previewMedia.event}</strong> • By {previewMedia.uploadedBy} on {previewMedia.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="w-8 h-8 rounded-full bg-[#FAFCFA] border border-[#DDE7DF] text-[#235347] hover:bg-[#EAF3EC] flex items-center justify-center cursor-pointer text-xs font-bold transition-all active:scale-95 touch-target-44 shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Media Viewer: Video Player or Image Viewer */}
            <div className="rounded-2xl overflow-hidden aspect-video bg-black/90 flex items-center justify-center relative">
              {previewMedia.type === 'video' ? (
                <video
                  controls
                  autoPlay
                  playsInline
                  src={previewMedia.url}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-[#235347]">
                Size: {previewMedia.size} • Type: {previewMedia.type.toUpperCase()}
              </span>

              <div className="flex items-center gap-2">
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(previewMedia.id)}
                    className="h-9 px-3 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                )}

                <a
                  href={previewMedia.url}
                  download={previewMedia.title}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 px-3 rounded-xl border border-[#DDE7DF] text-[#163832] bg-[#FAFCFA] hover:bg-[#EAF3EC] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  className="h-9 px-4 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventMediaUploadScreen;
