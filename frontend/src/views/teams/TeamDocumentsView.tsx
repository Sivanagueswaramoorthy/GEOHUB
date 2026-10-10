import React, { useState } from 'react';
import { FileText, Download, Upload, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';

export const TeamDocumentsView: React.FC = () => {
  const { currentUser, setActiveTab } = useApp();

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
    {
      id: 'doc_4',
      title: 'QGIS Laboratory Tutorial Dataset Guide',
      category: 'Academics',
      size: '14.2 MB',
      updatedAt: '2 weeks ago',
      author: 'Maya Patel',
    },
    {
      id: 'doc_5',
      title: 'Stage Audio & Emcee Script Run of Show',
      category: 'Entertainment',
      size: '1.5 MB',
      updatedAt: 'Yesterday',
      author: 'Ananya Rao',
    },
  ]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Design & Media');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setDocuments((prev) => [
      {
        id: `doc_${Date.now()}`,
        title: docTitle,
        category: docCategory,
        size: '3.2 MB',
        updatedAt: 'Just now',
        author: currentUser.name,
      },
      ...prev,
    ]);
    setIsUploadOpen(false);
    setDocTitle('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <button
        onClick={() => setActiveTab('team_home')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#0F766E',
        }}
      >
        <ArrowLeft size={16} /> Back to Team Home
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>Team Documents</h1>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setIsUploadOpen(true)}>
          <Upload size={16} /> Upload Doc
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="app-card interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#F0FDFA',
                  color: '#0F766E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                  {doc.title}
                </h4>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  {doc.category} • {doc.size} • Uploaded by {doc.author} ({doc.updatedAt})
                </div>
              </div>
            </div>

            <button
              className="icon-button"
              onClick={() => alert(`Downloading: ${doc.title}`)}
              title="Download file"
            >
              <Download size={20} strokeWidth={1.75} color="#0F766E" />
            </button>
          </div>
        ))}
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Document"
        subtitle="Add resource file to team repository"
      >
        <form onSubmit={handleUpload}>
          <div className="input-group">
            <label className="input-label">Document Title</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Field Geocaching Clue Sheets"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Category</label>
            <select
              className="input-field"
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
            >
              <option value="Design & Media">Design & Media</option>
              <option value="Compliance & Safety">Compliance & Safety</option>
              <option value="Corporate Outreach">Corporate Outreach</option>
              <option value="Academics">Academics</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>

          <div
            style={{
              padding: '24px',
              border: '2px dashed #E8ECF2',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '16px',
              backgroundColor: '#F8FAFC',
            }}
          >
            <Upload size={28} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
              Select PDF, DOCX or ZIP
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Up to 50MB file size</div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Upload to Repository
          </button>
        </form>
      </Modal>
    </div>
  );
};
