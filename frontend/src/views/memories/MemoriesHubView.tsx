import React, { useState } from 'react';
import {
  Image,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  Plus,
  Play,
  Share2,
  ExternalLink,
  Layers,
  Compass,
  CheckCircle2,
  X,
  Eye,
  Camera,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MemoryItem } from '../../types';
import { Modal } from '../../components/common/Modal';
import { SearchBar } from '../../components/SearchBar';

export const MemoriesHubView: React.FC = () => {
  const { memories, currentUser } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'geotag'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMemoryDetail, setActiveMemoryDetail] = useState<MemoryItem | null>(null);

  // New Memory Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'expedition' | 'workshop' | 'celebration' | 'field_work'>('expedition');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newLat, setNewLat] = useState('10.0889');
  const [newLng, setNewLng] = useState('77.0595');
  const [newInstaLink, setNewInstaLink] = useState('');
  const [newYoutubeLink, setNewYoutubeLink] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredMemories = memories.filter((mem) => {
    if (selectedCategory !== 'all' && mem.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = mem.title.toLowerCase().includes(q);
      const matchEvent = mem.eventTitle.toLowerCase().includes(q);
      const matchCaption = mem.caption.toLowerCase().includes(q);
      if (!matchTitle && !matchEvent && !matchCaption) return false;
    }
    return true;
  });

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    const newMem: MemoryItem = {
      id: `mem_${Date.now()}`,
      title: newTitle,
      eventTitle: newEventTitle || 'Club Expedition',
      date: new Date().toISOString().split('T')[0],
      category: newCategory,
      coverUrl: newCoverUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
      mediaUrls: [
        newCoverUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
      ],
      geotags: [
        {
          lat: parseFloat(newLat) || 10.0889,
          lng: parseFloat(newLng) || 77.0595,
          locationName: newLocationName || 'Field Survey Site',
          photoUrl: newCoverUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
        },
      ],
      socialLinks: {
        instagram: newInstaLink || undefined,
        youtube: newYoutubeLink || undefined,
      },
      caption: newCaption,
      createdBy: currentUser.name,
    };
    memories.unshift(newMem);
    setIsAddModalOpen(false);
    showToast(`✓ Published Memory to Chapter Archive!`);
    setNewTitle('');
    setNewCoverUrl('');
    setNewCaption('');
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
              DIGITAL CHAPTER ARCHIVE
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Memories Hub
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* View Mode Toggle: Normal Grid vs Geo-tag Map View */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              borderRadius: '999px',
              padding: '4px',
              border: '1px solid #E2E8F0',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'grid' ? '#0F172A' : '#64748B',
                boxShadow: viewMode === 'grid' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Image size={16} strokeWidth={1.75} /> Normal Grid
            </button>
            <button
              onClick={() => setViewMode('geotag')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'geotag' ? '#10B981' : 'transparent',
                color: viewMode === 'geotag' ? '#FFFFFF' : '#64748B',
                boxShadow: viewMode === 'geotag' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
              }}
            >
              <Compass size={16} strokeWidth={1.75} /> Geo-tag Mode
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.28)',
              cursor: 'pointer',
            }}
          >
            <Camera size={16} /> Add Memory
          </button>
        </div>
      </div>

      {/* Filter Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { key: 'all', label: 'All Expeditions' },
          { key: 'expedition', label: 'Field Expeditions' },
          { key: 'workshop', label: 'Bootcamps & Labs' },
          { key: 'celebration', label: 'Award Galas & Celebrations' },
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            style={{
              padding: '7px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              border: selectedCategory === c.key ? '1px solid #10B981' : '1px solid #E2E8F0',
              backgroundColor: selectedCategory === c.key ? '#ECFDF5' : '#FFFFFF',
              color: selectedCategory === c.key ? '#047857' : '#64748B',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search memory titles, events, or field locations..."
        resultsCount={filteredMemories.length}
        suggestions={[
          'Western Ghats Drone Survey',
          'LiDAR Terrain Mapping',
          'Munnar Peak Survey',
          'Campus Aerial Survey',
        ]}
      />

      {/* VIEW MODE 1: NORMAL PHOTO GRID */}
      {viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => setActiveMemoryDetail(mem)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E8ECF2',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.03)';
              }}
            >
              {/* Media Thumbnail */}
              <div style={{ height: '190px', width: '100%', position: 'relative', backgroundColor: '#0F172A' }}>
                <img
                  src={mem.coverUrl}
                  alt={mem.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 60%)',
                  }}
                />

                {/* Top Badge */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {mem.category}
                  </span>

                  {mem.geotags && mem.geotags.length > 0 && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <MapPin size={16} strokeWidth={1.75} /> Geotagged
                    </span>
                  )}
                </div>

                {/* Bottom title on thumbnail */}
                <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#34D399', fontWeight: 700 }}>
                    {mem.eventTitle}
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: '2px 0 0 0', lineHeight: 1.25 }}>
                    {mem.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  {mem.caption}
                </p>

                {/* Social media links if available */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9', fontSize: '11px' }}>
                  <span style={{ color: '#94A3B8' }}>{mem.date} • {mem.createdBy}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {mem.socialLinks?.instagram && (
                      <span style={{ color: '#E1306C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <ExternalLink size={16} strokeWidth={1.75} /> Instagram
                      </span>
                    )}
                    {mem.socialLinks?.youtube && (
                      <span style={{ color: '#DC2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Play size={16} strokeWidth={1.75} /> Video
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 2: GEOTAG MAP / COORDINATE MODE */}
      {viewMode === 'geotag' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Spatial Overview Map Banner */}
          <div
            style={{
              backgroundColor: '#0F172A',
              borderRadius: '24px',
              padding: '24px',
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
              border: '1px solid #1E293B',
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Compass size={16} color="#34D399" />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#34D399', letterSpacing: '0.06em' }}>
                  SPATIAL GIS METRIC VIEW
                </span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0' }}>
                Geospatial Pinpoints & Coordinate Archive
              </h2>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 16px 0', maxWidth: '600px' }}>
                Every photo taken during field expeditions is logged with WGS84 GPS latitude and longitude coordinates.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#34D399' }}>WGS84</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Datum Reference</div>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#34D399' }}>5 cm</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>RTK Baseline Accuracy</div>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#34D399' }}>Munnar / Chennai</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Primary Baselines</div>
                </div>
              </div>
            </div>
          </div>

          {/* Coordinate Pinpoint Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredMemories.map((mem) => (
              <div
                key={`geo_${mem.id}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #A7F3D0',
                  padding: '16px',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ height: '150px', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
                  <img src={mem.coverUrl} alt={mem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      color: '#34D399',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <MapPin size={16} strokeWidth={1.75} />
                    {mem.geotags?.[0] ? `${mem.geotags[0].lat}° N, ${mem.geotags[0].lng}° E` : 'Geotagged'}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                    {mem.title}
                  </h4>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                    {mem.geotags?.[0]?.locationName || 'High-Altitude Survey Station'}
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                    {mem.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Chapter Memory & Field Photos"
        subtitle="Upload expedition photos, geotag coordinates and social links"
      >
        <form onSubmit={handleAddMemory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="input-group">
            <label className="input-label">Memory Title</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Western Ghats Drone Survey Expedition"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Linked Event Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. LiDAR Terrain Mapping Bootcamp"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Category</label>
            <select
              className="input-field"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
            >
              <option value="expedition">Field Expedition</option>
              <option value="workshop">Workshop & Bootcamp</option>
              <option value="celebration">Awards Gala & Celebration</option>
              <option value="field_work">Field Research & Lab Work</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Cover Photo URL (Unsplash or Image Link)</label>
            <input
              type="url"
              required
              className="input-field"
              placeholder="https://images.unsplash.com/photo-..."
              value={newCoverUrl}
              onChange={(e) => setNewCoverUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="input-group">
              <label className="input-label">Latitude (WGS84)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 10.0889"
                value={newLat}
                onChange={(e) => setNewLat(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Longitude (WGS84)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 77.0595"
                value={newLng}
                onChange={(e) => setNewLng(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Location / Landmark Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Munnar Peak Survey Station 1"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="input-group">
              <label className="input-label">Instagram Post Link (Optional)</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://instagram.com/p/..."
                value={newInstaLink}
                onChange={(e) => setNewInstaLink(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">YouTube Video Link (Optional)</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://youtube.com/watch?v=..."
                value={newYoutubeLink}
                onChange={(e) => setNewYoutubeLink(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Expedition Story / Caption</label>
            <textarea
              className="input-field"
              rows={3}
              required
              placeholder="Describe achievements, scholar count, equipment tested..."
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              height: '46px',
              fontSize: '14px',
              fontWeight: 700,
              marginTop: '6px',
            }}
          >
            Publish to Memories Hub
          </button>
        </form>
      </Modal>
    </div>
  );
};
