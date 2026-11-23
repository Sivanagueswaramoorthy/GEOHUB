import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  X,
  FileImage,
} from 'lucide-react';
import { AnimatedNumber, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

export interface MediaUploadItem {
  id: string;
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

export const EventMediaUploadScreen: React.FC<EventMediaUploadScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const { gallery, events, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedEvent, setSelectedEvent] = useState('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaUploadItem | null>(null);

  const [mediaList, setMediaList] = useState<MediaUploadItem[]>(() => {
    return (gallery || []).map((g: any) => ({
      id: g.id,
      event: g.eventTitle || 'Campus Initiative',
      title: g.title,
      type: g.type || 'image',
      category: g.category || 'Event Photos',
      size: g.size || '3.5 MB',
      uploadedBy: g.uploadedBy || 'Documentation Lead',
      date: g.uploadedAt ? new Date(g.uploadedAt).toLocaleDateString() : 'Today',
      url: g.url,
    }));
  });

  // Filter by selected event and sort by event name
  const filteredAndSortedMedia = useMemo(() => {
    const list = mediaList.filter((m) => {
      if (selectedEvent !== 'All' && m.event !== selectedEvent) return false;
      return true;
    });

    list.sort((a, b) => {
      const cmp = (a.event || '').localeCompare(b.event || '');
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [mediaList, selectedEvent, sortOrder]);

  // Real File Upload from Device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newItems: MediaUploadItem[] = [];

    Array.from(files).forEach((file, idx) => {
      const isVideo = file.type.startsWith('video');
      const isDoc = file.type.includes('pdf') || file.type.includes('doc');
      const type: 'image' | 'video' | 'document' = isVideo ? 'video' : isDoc ? 'document' : 'image';
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const url = URL.createObjectURL(file);
      const eventName = selectedEvent === 'All' ? (events?.[0]?.title || 'Campus Event') : selectedEvent;

      newItems.push({
        id: `m-upload-${Date.now()}-${idx}`,
        event: eventName,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type,
        category: 'Event Media',
        size: sizeMb,
        uploadedBy: currentUser?.name || 'Documentation Lead',
        date: new Date().toLocaleDateString('en-US'),
        url,
      });
    });

    setTimeout(() => {
      setMediaList((prev) => [...newItems, ...prev]);
      setIsUploading(false);
      onLogAudit(selectedEvent, `Uploaded ${newItems.length} media file(s) from device`);
      showToast?.(`✓ Uploaded ${newItems.length} media file(s) successfully!`);
      setUploadSuccess(`✓ Successfully uploaded ${newItems.length} media file(s)`);
      setTimeout(() => setUploadSuccess(null), 3500);
      if (e.target) e.target.value = '';
    }, 600);
  };

  // Fallback simulated upload if no file chosen
  const handleTriggerUpload = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden animate-fadeIn pb-24">
      {/* Hidden Device File Picker */}
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

      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-3 rounded-2xl bg-white border border-[#E2EBE5] shadow-[0_2px_12px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wider">Assets</span>
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] flex items-center justify-center text-[#163832]">
              <ImageIcon size={13} strokeWidth={2.2} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={mediaList.length} /> Files
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#E2EBE5] shadow-[0_2px_12px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wider">Storage</span>
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] flex items-center justify-center text-[#163832]">
              <Upload size={13} strokeWidth={2.2} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-sm sm:text-base mt-1">
            58.6 MB
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#E2EBE5] shadow-[0_2px_12px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wider">Event</span>
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] flex items-center justify-center text-[#163832]">
              <Calendar size={13} strokeWidth={2.2} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-xs sm:text-sm mt-1 truncate">
            {selectedEvent}
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

      {/* 2. Drag & Drop Upload Card */}
      {!readOnly && (
        <div
          onClick={handleTriggerUpload}
          className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-dashed border-[#8EB69B] hover:border-[#163832] hover:bg-[#FAFCFA] transition-all cursor-pointer text-center space-y-1.5 shadow-[0_2px_12px_rgba(5,31,32,0.02)]"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#EAF3EC] text-[#163832] mx-auto flex items-center justify-center shadow-xs">
            <Upload size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="font-bold text-[#051F20] text-sm sm:text-base">
              Drop Photos, Drone Footage or Press Releases Here
            </h3>
          </div>
          <button
            type="button"
            className="h-8 px-4 rounded-full bg-[#163832] text-white text-xs font-bold mt-2 inline-flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-[#0B2B26] transition-all"
          >
            Select from Device
          </button>
        </div>
      )}

      {/* 3. Media Gallery Feed (Category Pills Removed; Event Filter & Sort Maintained) */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-[#E2EBE5] shadow-[0_4px_20px_rgba(5,31,32,0.03)] space-y-4">
        {/* Header with Title and Event Name Filter & Sort Controls */}
        <div className="flex flex-col gap-3 pb-3 border-b border-[#EDF3EF]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#051F20] text-base sm:text-lg tracking-tight">
                Event Media Repository
              </h2>
              <span className="text-xs text-[#235347]">
                {filteredAndSortedMedia.length} assets available
              </span>
            </div>
          </div>

          {/* Clean Unified Event Filter & Sort Toolbar */}
          <div className="grid grid-cols-2 gap-2 w-full pt-1">
            {/* Filter by Event Name Dropdown */}
            <div className="relative w-full">
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full h-9 pl-3 pr-8 rounded-xl border border-[#DDE7DF] text-xs font-semibold text-[#051F20] bg-[#FAFCFA] outline-none focus:border-[#163832] focus:ring-1 focus:ring-[#163832]/20 cursor-pointer appearance-none shadow-2xs truncate"
                aria-label="Filter by Event Name"
              >
                <option value="All">All Events</option>
                {(events || []).map((ev) => (
                  <option key={ev.id} value={ev.title}>
                    {ev.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-2.5 text-[#235347] pointer-events-none"
              />
            </div>

            {/* Sort by Event Name Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="w-full h-9 px-3 rounded-xl border border-[#DDE7DF] text-xs font-bold text-[#163832] bg-[#FAFCFA] hover:bg-[#EAF3EC] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs truncate"
              title={`Sort by Event Name (${sortOrder === 'asc' ? 'Ascending A-Z' : 'Descending Z-A'})`}
              aria-label="Sort by Event Name"
            >
              <ArrowUpDown size={13} strokeWidth={2.2} className="shrink-0" />
              <span className="truncate">Sort ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})</span>
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
                <div className="relative aspect-video w-full bg-[#163832]/10 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#051F20]/80 text-white backdrop-blur-xs uppercase">
                      {item.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-[#051F20] backdrop-blur-xs">
                      {item.size}
                    </span>
                  </div>
                </div>

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
            <div className="col-span-full">
              <EmptyState
                mascot="camera"
                title="No Media Found"
                description={`No media items found for "${selectedEvent}". Upload high-resolution event photography and aerial documentation.`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300 animate-fadeIn"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white rounded-3xl p-5 shadow-[0_24px_60px_rgba(5,31,32,0.25)] border border-[#E2EBE5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDF3EF]">
              <div>
                <h3 className="font-bold text-[#051F20] text-sm sm:text-base">
                  {previewMedia.title}
                </h3>
                <span className="text-xs text-[#235347]">
                  Event: <strong>{previewMedia.event}</strong> • Uploaded by {previewMedia.uploadedBy} on {previewMedia.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="w-8 h-8 rounded-full bg-[#FAFCFA] border border-[#DDE7DF] text-[#235347] hover:bg-[#EAF3EC] flex items-center justify-center cursor-pointer text-xs font-bold transition-all active:scale-95 touch-target-44"
              >
                <X size={15} />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-video bg-black/10 flex items-center justify-center">
              <img
                src={previewMedia.url}
                alt={previewMedia.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-[#235347]">
                File Size: {previewMedia.size} | Type: {previewMedia.type.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="h-9 px-4 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventMediaUploadScreen;
