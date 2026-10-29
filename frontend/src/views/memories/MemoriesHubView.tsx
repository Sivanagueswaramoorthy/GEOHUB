import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Search,
  Plus,
  Compass,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MemoryItem } from '../../types';
import {
  Mascot,
  PillButton,
  BottomSheet,
  EmptyState,
  SegmentedTabs,
} from '../../components/shared';

export const MemoriesHubView: React.FC = () => {
  const { memories, currentUser } = useApp();
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

  const filteredMemories = memories.filter((mem) => {
    if (selectedCategory !== 'all' && mem.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = mem.title.toLowerCase().includes(q);
      const matchEvent = mem.eventTitle.toLowerCase().includes(q);
      const matchCaption = (mem.caption || '').toLowerCase().includes(q);
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
      caption: newCaption,
      createdBy: currentUser.name,
    };
    memories.unshift(newMem);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewCoverUrl('');
    setNewCaption('');
    setNewLocationName('');
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'expedition', label: 'Expedition' },
    { key: 'workshop', label: 'Workshop' },
    { key: 'celebration', label: 'Celebration' },
    { key: 'field_work', label: 'Field' },
  ];

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
            Chapter Memories
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Expeditions & field archives
          </p>
        </div>

        <PillButton
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add memory
        </PillButton>
      </div>

      {/* Search and Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            placeholder="Search memories..."
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

        <SegmentedTabs
          tabs={tabs}
          activeTab={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      {/* Masonry Grid with 24px Image Radius and Bottom-Left Location Chip */}
      {filteredMemories.length === 0 ? (
        <EmptyState
          mascot="gps-pin"
          title="No memories"
          description="Photos and expeditions appear here"
          actionLabel="Add memory"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div
          style={{
            columns: '2 260px',
            columnGap: '16px',
          }}
        >
          {filteredMemories.map((mem) => {
            const loc = mem.geotags?.[0]?.locationName || 'Field Expedition';
            return (
              <div
                key={mem.id}
                onClick={() => setActiveMemoryDetail(mem)}
                style={{
                  breakInside: 'avoid',
                  marginBottom: '16px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DAF1DE',
                  boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 200ms ease-out',
                }}
              >
                <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={mem.coverUrl}
                    alt={mem.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: '24px',
                      objectFit: 'cover',
                      maxHeight: '340px',
                    }}
                    loading="lazy"
                  />

                  {/* Bottom-left pill chip with map-pin and location tag */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'rgba(5, 31, 32, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#DAF1DE',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(5,31,32,0.18)',
                    }}
                  >
                    <MapPin size={12} color="#DAF1DE" strokeWidth={2.5} />
                    <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {loc}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '12px 14px' }}>
                  <h3
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#051F20',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {mem.title}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '4px',
                      fontSize: '12px',
                      color: '#235347',
                      fontWeight: 600,
                    }}
                  >
                    <Calendar size={12} strokeWidth={2} />
                    <span>{new Date(mem.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Detail Sheet */}
      <BottomSheet
        isOpen={activeMemoryDetail !== null}
        onClose={() => setActiveMemoryDetail(null)}
        title={activeMemoryDetail?.title || 'Memory Detail'}
        subtitle={activeMemoryDetail?.eventTitle || 'Chapter Expedition'}
      >
        {activeMemoryDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
            <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #DAF1DE' }}>
              <img
                src={activeMemoryDetail.coverUrl}
                alt={activeMemoryDetail.title}
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* GPS coordinates & Event date */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#F6FBF7',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: '#235347', fontWeight: 600, display: 'block' }}>
                  Date
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
                  {new Date(activeMemoryDetail.date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#235347', fontWeight: 600, display: 'block' }}>
                  Coordinates
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
                  {activeMemoryDetail.geotags?.[0]
                    ? `${activeMemoryDetail.geotags[0].lat.toFixed(4)}, ${activeMemoryDetail.geotags[0].lng.toFixed(4)}`
                    : '10.0889° N, 77.0595° E'}
                </span>
              </div>
            </div>

            {/* Location and Caption */}
            <div>
              <span style={{ fontSize: '12px', color: '#235347', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Location
              </span>
              <p style={{ fontSize: '13px', color: '#051F20', margin: 0, fontWeight: 600 }}>
                {activeMemoryDetail.geotags?.[0]?.locationName || 'Field survey venue'}
              </p>
            </div>

            {activeMemoryDetail.caption && (
              <div>
                <span style={{ fontSize: '12px', color: '#235347', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Caption
                </span>
                <p style={{ fontSize: '13px', color: '#051F20', margin: 0, lineHeight: 1.5 }}>
                  {activeMemoryDetail.caption}
                </p>
              </div>
            )}

            <PillButton
              variant="secondary"
              fullWidth
              onClick={() => setActiveMemoryDetail(null)}
            >
              Close
            </PillButton>
          </div>
        )}
      </BottomSheet>

      {/* Add Memory BottomSheet */}
      <BottomSheet
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Memory"
        subtitle="Upload chapter photograph"
      >
        <form onSubmit={handleAddMemory} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Western Ghats Canopy Survey"
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
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Category
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
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
            >
              <option value="expedition">Expedition</option>
              <option value="workshop">Workshop</option>
              <option value="celebration">Celebration</option>
              <option value="field_work">Field Work</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Location Name
            </label>
            <input
              type="text"
              placeholder="e.g. Munnar Forest Station"
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
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Image URL
            </label>
            <input
              type="url"
              placeholder="https://..."
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
              value={newCoverUrl}
              onChange={(e) => setNewCoverUrl(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Caption
            </label>
            <textarea
              rows={3}
              placeholder="Describe this memory..."
              style={{
                width: '100%',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '10px 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'none',
              }}
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
            />
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Save
          </PillButton>
        </form>
      </BottomSheet>
    </div>
  );
};

export default MemoriesHubView;
