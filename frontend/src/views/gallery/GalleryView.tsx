import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Eye,
  FileText,
  Video,
  Newspaper,
  Calendar,
  FileSpreadsheet,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutGrid,
  List,
  ExternalLink,
  Copy,
  Download,
  Filter,
  X,
  Search,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GalleryItem } from '../../types';
import {
  Overline,
  SearchBar,
  BottomSheet,
  Toast,
  EmptyState,
  ErrorState,
} from '../../components';

export const GalleryView: React.FC = () => {
  const { gallery, events, currentUser, uploadGalleryItem } = useApp();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // View Mode: Grid vs List
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Lightbox Modal
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadEventId, setUploadEventId] = useState(events[0]?.id || 'event_01');
  const [uploadYear, setUploadYear] = useState('2026-2027');
  const [uploadType, setUploadType] = useState<'photo' | 'video' | 'report' | 'mom' | 'news' | 'sheet'>('photo');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadGeotag, setUploadGeotag] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return gallery.filter((item) => {
      // Academic Year Filter
      if (selectedYear !== 'all' && item.academicYear !== selectedYear) return false;

      // Event Filter
      if (selectedEventId !== 'all' && item.eventId !== selectedEventId) return false;

      // Media Type Filter
      if (selectedType !== 'all') {
        const itemType = item.mediaType || (item.category === 'photos' ? 'photo' : item.category === 'videos' ? 'video' : 'report');
        if (itemType !== selectedType) return false;
      }

      // Submission Status Filter
      if (selectedStatus !== 'all') {
        const itemStatus = item.submissionStatus || 'verified';
        if (itemStatus !== selectedStatus) return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesEvent = item.eventTitle.toLowerCase().includes(q);
        const matchesUploader = item.uploadedByName.toLowerCase().includes(q);
        const matchesCaption = (item.caption || '').toLowerCase().includes(q);
        const matchesGeotag = (item.geotag?.locationName || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesEvent && !matchesUploader && !matchesCaption && !matchesGeotag) {
          return false;
        }
      }

      return true;
    });
  }, [gallery, selectedYear, selectedEventId, selectedType, selectedStatus, searchQuery]);

  // Upload Submission Handler with Simulated Progress
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      showToast('Please enter a title.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          const ev = events.find((item) => item.id === uploadEventId);
          const categoryMapped: 'photos' | 'videos' | 'bills' | 'reports' =
            uploadType === 'photo'
              ? 'photos'
              : uploadType === 'video'
              ? 'videos'
              : 'reports';

          uploadGalleryItem({
            title: uploadTitle,
            eventId: uploadEventId,
            eventTitle: ev?.title || 'Chapter Activity',
            academicYear: uploadYear,
            category: categoryMapped,
            mediaType: uploadType,
            submissionStatus: 'submitted',
            geotag: uploadGeotag
              ? {
                  lat: 13.0827,
                  lng: 80.2707,
                  locationName: 'Main Campus Grand Auditorium',
                }
              : undefined,
            caption: uploadCaption || uploadTitle,
            url:
              uploadUrl.trim() ||
              (uploadType === 'photo'
                ? 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80'
                : 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'),
            uploadedByName: currentUser.name,
            fileSizeBytes: uploadType === 'video' ? 'Streaming Link' : '4.2 MB',
          });

          setIsUploadOpen(false);
          setUploadTitle('');
          setUploadUrl('');
          setUploadCaption('');
          setUploadProgress(0);
          showToast(`✓ Archival media uploaded: "${uploadTitle}"`);
          return 0;
        }
        return prev + 25;
      });
    }, 200);
  };

  const getMediaTypeIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} strokeWidth={1.75} className="text-purple-600" />;
      case 'mom':
        return <Calendar size={16} strokeWidth={1.75} className="text-indigo-600" />;
      case 'news':
        return <Newspaper size={16} strokeWidth={1.75} className="text-amber-600" />;
      case 'sheet':
        return <FileSpreadsheet size={16} strokeWidth={1.75} className="text-emerald-600" />;
      case 'report':
        return <FileText size={16} strokeWidth={1.75} className="text-teal-600" />;
      case 'photo':
      default:
        return <ImageIcon size={16} strokeWidth={1.75} className="text-blue-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header Area */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <Overline pill dot className="mb-1.5">
            CHAPTER ARCHIVAL REPOSITORY
          </Overline>
          <h1
            className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            Media Archives
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all shrink-0 mt-1 cursor-pointer active:scale-95"
        >
          <Upload size={16} strokeWidth={1.75} />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Search Bar & Grid/List View Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search title, event, uploader, geotag..."
            resultsCount={filteredItems.length}
            suggestions={['GEO FEST 2026', 'Drone Survey', 'Field Expedition', 'RTK Calibration', 'Chapter Showcase']}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-xl transition-all ${
              viewMode === 'grid'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-xl transition-all ${
              viewMode === 'list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filter Row 1: Academic Year & Event Picker */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs outline-none focus:border-emerald-500 shrink-0"
        >
          <option value="all">All Academic Years</option>
          <option value="2026-2027">AY 2026-2027 (Current)</option>
          <option value="2025-2026">AY 2025-2026</option>
          <option value="2024-2025">AY 2024-2025</option>
        </select>

        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs outline-none focus:border-emerald-500 shrink-0 max-w-[200px] truncate"
        >
          <option value="all">All Events ({events.length})</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Row 2: Media Type Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { key: 'all', label: 'All Types' },
          { key: 'photo', label: 'Photos' },
          { key: 'video', label: 'Videos' },
          { key: 'report', label: 'Reports' },
          { key: 'mom', label: 'MoMs' },
          { key: 'news', label: 'Daily News' },
          { key: 'sheet', label: 'Attendance Sheets' },
        ].map((type) => (
          <button
            key={type.key}
            type="button"
            onClick={() => setSelectedType(type.key)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === type.key
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Filter Row 3: Submission Status Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
          Status:
        </span>
        {[
          { key: 'all', label: 'All' },
          { key: 'verified', label: 'Verified ✓', color: 'text-emerald-700' },
          { key: 'submitted', label: 'Submitted', color: 'text-teal-700' },
          { key: 'draft', label: 'Draft', color: 'text-amber-700' },
        ].map((st) => (
          <button
            key={st.key}
            type="button"
            onClick={() => setSelectedStatus(st.key)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === st.key
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Results Count & Active Filter Clearer */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong>{filteredItems.length}</strong> archival items
        </span>
        {(selectedYear !== 'all' || selectedEventId !== 'all' || selectedType !== 'all' || selectedStatus !== 'all' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedYear('all');
              setSelectedEventId('all');
              setSelectedType('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
          >
            <X size={16} strokeWidth={1.75} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          MEDIA CONTENT: GRID VS LIST
          ========================================================================= */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No Archival Media Found"
          description="No media or documentation matches the active filters. Try broadening your query or upload new files."
          actionLabel="Clear All Filters"
          onAction={() => {
            setSelectedYear('all');
            setSelectedEventId('all');
            setSelectedType('all');
            setSelectedStatus('all');
            setSearchQuery('');
          }}
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (2 Columns) */
        <div
          className="grid grid-cols-2 gap-3"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxItem(item)}
              className="rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-emerald-300 transition-all cursor-pointer overflow-hidden flex flex-col group active:scale-[0.98]"
            >
              <div className="relative h-28 w-full bg-slate-900 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Status Badge */}
                {item.submissionStatus && (
                  <span
                    className={`absolute top-2 right-2 text-[11px] font-extrabold uppercase px-1.5 py-0.5 rounded-full shadow-xs ${
                      item.submissionStatus === 'verified'
                        ? 'bg-emerald-600 text-white'
                        : item.submissionStatus === 'submitted'
                        ? 'bg-teal-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {item.submissionStatus}
                  </span>
                )}

                {/* Geotag Chip on Image */}
                {item.geotag && (
                  <span className="absolute bottom-1.5 left-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white flex items-center gap-1 max-w-[90%] truncate">
                    <MapPin size={16} strokeWidth={1.75} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{item.geotag.locationName}</span>
                  </span>
                )}
              </div>

              <div className="p-2.5 flex flex-col flex-1 justify-between gap-1">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold mb-0.5">
                    {getMediaTypeIcon(item.mediaType)}
                    <span className="uppercase tracking-wider truncate">
                      {item.mediaType || item.category}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                </div>

                <div className="pt-1.5 border-t border-slate-100 flex flex-col gap-0.5 text-[11px]">
                  <span className="text-emerald-700 font-semibold truncate">
                    {item.eventTitle}
                  </span>
                  <span className="text-slate-400">
                    By {item.uploadedByName} • {item.academicYear}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="flex flex-col gap-2.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxItem(item)}
              className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900 truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold truncate mt-0.5">
                    {item.eventTitle}
                  </span>
                  {item.geotag && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                      <MapPin size={16} strokeWidth={1.75} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{item.geotag.locationName}</span>
                    </div>
                  )}
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    By {item.uploadedByName} • {item.fileSizeBytes || '3 MB'} • {item.academicYear}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-1.5">
                {item.submissionStatus && (
                  <span
                    className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      item.submissionStatus === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.submissionStatus === 'submitted'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.submissionStatus}
                  </span>
                )}
                <span className="text-[11px] text-emerald-700 font-bold underline">
                  View →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          LIGHTBOX VIEWER WITH GEOTAG CHIP
          ========================================================================= */}
      <BottomSheet
        isOpen={!!activeLightboxItem}
        onClose={() => setActiveLightboxItem(null)}
        title={activeLightboxItem?.title || 'Archival Viewer'}
        subtitle={activeLightboxItem?.eventTitle}
      >
        {activeLightboxItem && (
          <div className="flex flex-col gap-3 py-1">
            {/* Media Image / Stream Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-72 flex items-center justify-center">
              <img
                src={activeLightboxItem.url}
                alt={activeLightboxItem.title}
                className="max-h-72 w-full object-contain"
              />
              {activeLightboxItem.mediaType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg">
                    <Video size={24} className="text-emerald-600 ml-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Geotag Chip with Coordinates */}
            {activeLightboxItem.geotag ? (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-emerald-950">
                      {activeLightboxItem.geotag.locationName}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-700">
                      {activeLightboxItem.geotag.lat.toFixed(4)}° N, {activeLightboxItem.geotag.lng.toFixed(4)}° E
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  GPS Verified
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin size={16} strokeWidth={1.75} className="text-slate-400" />
                <span>Normal Upload (No Geotag coordinates recorded)</span>
              </div>
            )}

            {/* Caption */}
            {activeLightboxItem.caption && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Caption / Archival Description
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  "{activeLightboxItem.caption}"
                </p>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Event</span>
                <span className="font-bold text-slate-800 truncate block mt-0.5">
                  {activeLightboxItem.eventTitle}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Academic Year</span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  {activeLightboxItem.academicYear}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Uploaded By</span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  {activeLightboxItem.uploadedByName}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Submission Status</span>
                <span className="font-extrabold text-emerald-700 uppercase block mt-0.5">
                  {activeLightboxItem.submissionStatus || 'Verified'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(activeLightboxItem.url);
                  showToast('✓ Media link copied to clipboard');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <Copy size={16} strokeWidth={1.75} />
                <span>Copy URL</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.open(activeLightboxItem.url, '_blank');
                  showToast('Opened media source');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
              >
                <ExternalLink size={16} strokeWidth={1.75} />
                <span>Open Full Asset</span>
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* =========================================================================
          UPLOAD MEDIA MODAL
          ========================================================================= */}
      <BottomSheet
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload to Media Archives"
        subtitle="Archive high-res photography, bills, reports, or video streams"
      >
        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title / Label</label>
            <input
              type="text"
              required
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="e.g. Field GPS Coordinate Collection"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Associated Event</label>
              <select
                value={uploadEventId}
                onChange={(e) => setUploadEventId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
              <select
                value={uploadYear}
                onChange={(e) => setUploadYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
              >
                <option value="2026-2027">2026-2027</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Media Type</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
            >
              <option value="photo">Photo (High-res photography)</option>
              <option value="video">Video (Drone / Presentation)</option>
              <option value="report">Post-Event Report Brief</option>
              <option value="mom">Minutes of Meeting (MoM)</option>
              <option value="news">Daily Chapter News</option>
              <option value="sheet">Gate Attendance Sheet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Asset URL (Cloud / Image link)</label>
            <input
              type="url"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="https://images.unsplash.com/... or cloud share link"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Caption / Testimonial</label>
            <textarea
              rows={2}
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none resize-none leading-relaxed"
              placeholder="Provide context for the archival record..."
            />
          </div>

          {/* Geotag Toggle */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950">
                <MapPin size={16} strokeWidth={1.75} className="text-emerald-600" />
                <span>Store Geotag Coordinates</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                Embeds 13.0827° N, 80.2707° E (Main Campus)
              </span>
            </div>
            <input
              type="checkbox"
              checked={uploadGeotag}
              onChange={(e) => setUploadGeotag(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          {/* Upload Progress Bar if active */}
          {isUploading && (
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Saving to Central Media Archives...</span>
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
            {isUploading ? 'Uploading Media Asset...' : 'Upload & Catalog Asset'}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
};
