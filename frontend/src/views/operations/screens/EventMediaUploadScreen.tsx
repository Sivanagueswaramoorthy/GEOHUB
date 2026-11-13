import React, { useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle2,
  Trash2,
  Eye,
  Filter,
  Plus,
  Calendar,
  Tag,
} from 'lucide-react';
import { AnimatedNumber } from '../../../components/shared';

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
  const [selectedEvent, setSelectedEvent] = useState('GEO FEST 2026');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaUploadItem | null>(null);

  const [mediaList, setMediaList] = useState<MediaUploadItem[]>([
    {
      id: 'm-1',
      event: 'GEO FEST 2026',
      title: 'Inaugural Keynote Session Dr Radhakrishnan',
      type: 'image',
      category: 'Keynote Photos',
      size: '4.2 MB',
      uploadedBy: 'Aarav Patel',
      date: '2026-11-04',
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-2',
      event: 'GEO FEST 2026',
      title: 'Auditorium Drone Aerial Flyover',
      type: 'video',
      category: 'Drone Footage',
      size: '48.5 MB',
      uploadedBy: 'David Chen',
      date: '2026-11-04',
      url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-3',
      event: 'GEO FEST 2026',
      title: 'Student Exhibition Stalls & Robotics Demo',
      type: 'image',
      category: 'Stage & Audience',
      size: '3.1 MB',
      uploadedBy: 'Sneha Patel',
      date: '2026-11-04',
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'm-4',
      event: 'Campus Topo Camp',
      title: 'Theodolite Field Station Alignment',
      type: 'image',
      category: 'Field Stations',
      size: '2.8 MB',
      uploadedBy: 'Divya Rao',
      date: '2026-10-22',
      url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    },
  ]);

  const categories = ['All', 'Keynote Photos', 'Drone Footage', 'Stage & Audience', 'Field Stations'];

  const filteredMedia = mediaList.filter((m) => {
    if (selectedEvent !== 'All' && m.event !== selectedEvent) return false;
    if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
    return true;
  });

  const handleSimulatedUpload = () => {
    if (readOnly) return;
    setIsUploading(true);
    setTimeout(() => {
      const newItem: MediaUploadItem = {
        id: `m-${Date.now()}`,
        event: selectedEvent,
        title: `High-Res Retrospective Clip #${mediaList.length + 1}`,
        type: 'image',
        category: 'Stage & Audience',
        size: '5.6 MB',
        uploadedBy: currentUser?.name || 'Documentation Lead',
        date: new Date().toLocaleDateString('en-US'),
        url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
      };
      setMediaList((prev) => [newItem, ...prev]);
      setIsUploading(false);
      onLogAudit(selectedEvent, `Uploaded media asset "${newItem.title}" (${newItem.size})`);
      setUploadSuccess(`Successfully uploaded "${newItem.title}"`);
      setTimeout(() => setUploadSuccess(null), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Assets</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <ImageIcon size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={mediaList.length} /> Files
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Storage</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Upload size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-sm sm:text-base mt-1">
            58.6 MB
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Event</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Calendar size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-xs sm:text-sm mt-1 truncate">
            {selectedEvent}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#163832] uppercase tracking-wide">Action</span>
          {!readOnly && (
            <button
              type="button"
              disabled={isUploading}
              onClick={handleSimulatedUpload}
              className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
              data-testid="btn-upload-media"
            >
              <Upload size={14} />
              <span>{isUploading ? 'Uploading...' : 'Upload Media'}</span>
            </button>
          )}
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* 2. Drag & Drop Upload Card */}
      {!readOnly && (
        <div
          onClick={handleSimulatedUpload}
          className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-dashed border-[#8EB69B] hover:border-[#163832] hover:bg-[#F6FBF7] transition-all cursor-pointer text-center space-y-1.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE] text-[#163832] mx-auto flex items-center justify-center">
            <Upload size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="font-bold text-[#051F20] text-sm sm:text-base">
              Drop Photos, Drone Footage or Press Releases Here
            </h3>
          </div>
          <button
            type="button"
            className="h-8 px-4 rounded-full bg-[#163832] text-white text-xs font-bold pointer-events-none mt-2 inline-flex items-center gap-1.5 shadow-2xs"
          >
            Select from Device
          </button>
        </div>
      )}

      {/* 3. Media Gallery Feed */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-[#051F20] text-base sm:text-lg">
            Event Media Repository
          </h2>

          <div className="flex items-center gap-2">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="h-8 px-2.5 rounded-xl border border-[#DAF1DE] text-xs font-semibold text-[#051F20] bg-[#F6FBF7] cursor-pointer"
            >
              <option value="All">All Events</option>
              <option value="GEO FEST 2026">GEO FEST 2026</option>
              <option value="Campus Topo Camp">Campus Topo Camp</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`h-7 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#163832] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid (Responsive 1-col on tiny mobile, 2-col on standard mobile, 3-col on tablet/desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setPreviewMedia(item)}
              className="group rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] overflow-hidden hover:border-[#8EB69B] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-[#163832]/10 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#051F20]/80 text-white backdrop-blur-xs">
                    {item.type.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white/90 text-[#051F20] backdrop-blur-xs">
                    {item.size}
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-1">
                <div className="text-xs font-bold text-[#051F20] line-clamp-1">
                  {item.title}
                </div>
                <div className="flex items-center justify-between text-xs text-[#235347]">
                  <span>{item.category}</span>
                  <span>{item.uploadedBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-5 shadow-2xl border border-[#DAF1DE] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#051F20] text-sm sm:text-base">
                  {previewMedia.title}
                </h3>
                <span className="text-xs text-[#235347]">
                  {previewMedia.event} • Uploaded by {previewMedia.uploadedBy} on {previewMedia.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-video bg-black/10">
              <img
                src={previewMedia.url}
                alt={previewMedia.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-[#235347]">
                File Size: {previewMedia.size} | Scope: {previewMedia.category}
              </span>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="h-9 px-4 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] cursor-pointer"
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

