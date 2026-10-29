import React, { useState } from 'react';
import { FileText, Download, ArrowLeft, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  PillButton,
  StatusChip,
  BottomSheet,
  EmptyState,
  UploadCard,
} from '../../components/shared';

export const TeamDocumentsView: React.FC = () => {
  const { setActiveTab } = useApp();

  const [documents, setDocuments] = useState([
    {
      id: 'doc_1',
      title: 'Geo Club Visual Identity & Brand Guidelines v2.4',
      category: 'Design & Media',
      size: '4.8 MB',
      updatedAt: '2 days ago',
      author: 'David Chen',
    },
    {
      id: 'doc_2',
      title: 'DGCA Campus Drone Flight Zone Safety Protocol',
      category: 'Compliance & Safety',
      size: '2.1 MB',
      updatedAt: '1 week ago',
      author: 'Tariq Al-Mansoor',
    },
    {
      id: 'doc_3',
      title: 'GEO FEST 2026 Sponsorship Brochure & Tier Matrix',
      category: 'Corporate Outreach',
      size: '6.4 MB',
      updatedAt: '3 days ago',
      author: 'Priya Sharma',
    },
  ]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Design & Media');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;
    setDocuments((prev) => [
      {
        id: `doc_${Date.now()}`,
        title: docTitle.trim(),
        category: docCategory,
        size: '2.4 MB',
        updatedAt: 'Just now',
        author: 'Lead Appointee',
      },
      ...prev,
    ]);
    setIsUploadOpen(false);
    setDocTitle('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      <PillButton
        variant="secondary"
        size="sm"
        icon={<ArrowLeft size={14} strokeWidth={2} />}
        onClick={() => setActiveTab('team_home')}
      >
        Back
      </PillButton>

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
            Squad Documents
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Official dossiers & directives
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

      {/* Documents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '16px 20px',
              boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '9999px',
                  backgroundColor: '#DAF1DE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#163832',
                  flexShrink: 0,
                }}
              >
                <FileText size={18} strokeWidth={2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#051F20', margin: 0 }} className="truncate">
                  {doc.title}
                </h4>
                <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px' }}>
                  {doc.category} • {doc.size} • {doc.author}
                </div>
              </div>
            </div>

            <PillButton
              variant="secondary"
              size="sm"
              icon={<Download size={14} />}
              onClick={() => alert(`Downloading ${doc.title}`)}
            >
              Get
            </PillButton>
          </div>
        ))}
      </div>

      {/* Upload BottomSheet */}
      <BottomSheet
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Document"
        subtitle="Attach official chapter file"
      >
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Document Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flight Zone Map Protocol"
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
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
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
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
            >
              <option value="Design & Media">Design & Media</option>
              <option value="Compliance & Safety">Compliance & Safety</option>
              <option value="Corporate Outreach">Corporate Outreach</option>
              <option value="Academics">Academics</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              File Attachment
            </label>
            <UploadCard
              label="Select document"
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

export default TeamDocumentsView;
