import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Calendar,
  MapPin,
  Download,
  Search,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GalleryItem } from '../../types';
import {
  PillButton,
  StatusChip,
  BottomSheet,
  EmptyState,
  SegmentedTabs,
  UploadCard,
  Mascot,
} from '../../components/shared';

export const GalleryView: React.FC = () => {
  const { gallery, events, currentUser, uploadGalleryItem } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadEventId, setUploadEventId] = useState(events[0]?.id || 'event_01');
  const [uploadUrl, setUploadUrl] = useState('');

  const typeTabs = [
    { key: 'all', label: 'All Media' },
    { key: 'photos', label: 'Photos' },
    { key: 'videos', label: 'Videos' },
    { key: 'reports', label: 'Reports' },
  ];

  const filteredItems = useMemo(() => {
    return gallery.filter((item) => {
      if (selectedType !== 'all' && item.category !== selectedType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchEvent = (item.eventTitle || '').toLowerCase().includes(q);
        if (!matchTitle && !matchEvent) return false;
      }
      return true;
    });
  }, [gallery, selectedType, searchQuery]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;
    const targetEvent = events.find((ev) => ev.id === uploadEventId);
    uploadGalleryItem({
      title: uploadTitle.trim(),
      eventId: uploadEventId,
      eventTitle: targetEvent?.title || 'Chapter Activity',
      category: 'photos',
      url: uploadUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
      uploadedByName: currentUser.name,
      academicYear: new Date().getFullYear().toString(),
    });
    setIsUploadOpen(false);
    setUploadTitle('');
    setUploadUrl('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      {/* Micro-copy: 1 headline (2-4 words), 1 subtitle (< 6 words) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1
            style={{
              fontSize: '28px',
              lineHeight: '32px',
              fontWeight: 800,
              color: '#051F20',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Media Archives
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Visual assets & documentation
          </p>
        </div>

        <PillButton
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsUploadOpen(true)}
        >
          Upload
        </PillButton>
      </div>

      {/* Tabs and Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SegmentedTabs
          tabs={typeTabs}
          activeTab={selectedType}
          onChange={setSelectedType}
        />

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            style={{
              width: '100%',
              height: '44px',
              boxSizing: 'border-box',
              paddingLeft: '40px',
              paddingRight: '14px',
              fontSize: '13px',
              color: '#051F20',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DAF1DE',
              borderRadius: '16px',
              outline: 'none',
              boxShadow: '0 4px 14px rgba(5,31,32,0.03)',
            }}
            placeholder="Search media by title or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={18}
            strokeWidth={2}
            color="#8EB69B"
            style={{ position: 'absolute', left: 14, top: 13 }}
          />
        </div>
      </div>

      {/* Masonry / Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          mascot="camera"
          title="No archives"
          description="Uploaded photos and reels appear here"
          actionLabel="Upload"
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxItem(item)}
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DAF1DE',
                boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <img
                src={item.url}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  display: 'block',
                }}
                loading="lazy"
              />
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: '#DAF1DE',
                      color: '#0B2B26',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.category}
                  </span>
                  <span style={{ fontSize: '12px', color: '#235347' }}>
                    {item.academicYear || '2026'}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#051F20', margin: '4px 0 2px 0' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '12px', color: '#235347', margin: 0 }}>
                  {item.eventTitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox BottomSheet */}
      <BottomSheet
        isOpen={activeLightboxItem !== null}
        onClose={() => setActiveLightboxItem(null)}
        title={activeLightboxItem?.title || 'Archive Item'}
        subtitle={activeLightboxItem?.eventTitle || 'Media File'}
      >
        {activeLightboxItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
            <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #DAF1DE' }}>
              <img
                src={activeLightboxItem.url}
                alt={activeLightboxItem.title}
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#235347' }}>
              <span>Uploaded by {activeLightboxItem.uploadedByName}</span>
              <span>Year {activeLightboxItem.academicYear || '2026'}</span>
            </div>
            <PillButton variant="secondary" fullWidth onClick={() => setActiveLightboxItem(null)}>
              Close
            </PillButton>
          </div>
        )}
      </BottomSheet>

      {/* Upload BottomSheet */}
      <BottomSheet
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Archive"
        subtitle="Add photo or media record"
      >
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Drone telemetry snapshot"
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Linked Event
            </label>
            <select
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={uploadEventId}
              onChange={(e) => setUploadEventId(e.target.value)}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Media
            </label>
            <UploadCard
              label="Select file"
              onFileSelected={() => {}}
            />
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Upload
          </PillButton>
        </form>
      </BottomSheet>
    </div>
  );
};

export default GalleryView;
