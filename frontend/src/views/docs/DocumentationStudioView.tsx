import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Printer,
  FileSpreadsheet,
  Check,
  ArrowRight,
  Bold,
  Italic,
  List,
  Table as TableIcon,
  Archive,
  Upload,
  Newspaper,
  Plus,
  Download,
  Calendar,
  Tag,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocTemplate } from '../../types';
import {
  PillButton,
  StatusChip,
  Mascot,
  SegmentedTabs,
  BottomSheet,
} from '../../components/shared';

export const DocumentationStudioView: React.FC = () => {
  const { docTemplates, events, attendance, users, dailyNews, addDailyNews, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'editor' | 'uploads' | 'news' | 'archives'>('editor');

  // Event Upload State
  const [selectedUploadEventId, setSelectedUploadEventId] = useState(events[0]?.id || '');
  const [uploadDocTitle, setUploadDocTitle] = useState('');
  const [uploadDocCategory, setUploadDocCategory] = useState<'report' | 'circular' | 'permission' | 'signed_sheet'>('report');
  const [uploadFileName, setUploadFileName] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [uploadedDocs, setUploadedDocs] = useState([
    {
      id: 'doc_1',
      eventId: events[0]?.id || 'event_01',
      eventTitle: events[0]?.title || 'Campus Odyssey',
      title: 'Dean Clearance & Campus Permission Letter',
      category: 'permission',
      fileName: 'Dean_Permission_Sanction.pdf',
      fileSize: '1.2 MB',
      uploadedBy: 'Elena Rostova',
      uploadedAt: '2026-10-24 10:30 AM',
    },
    {
      id: 'doc_2',
      eventId: events[0]?.id || 'event_01',
      eventTitle: events[0]?.title || 'Campus Odyssey',
      title: 'Post-Event Retrospective & Documentation Report',
      category: 'report',
      fileName: 'Post_Event_Documentation_Report.pdf',
      fileSize: '3.4 MB',
      uploadedBy: 'Aarav Patel',
      uploadedAt: '2026-10-25 04:15 PM',
    },
  ]);

  // Daily News State
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsEventId, setNewsEventId] = useState(events[0]?.id || '');
  const [newsTags, setNewsTags] = useState('#DailyEcoNews, #GeoHub');

  const standardTemplates: DocTemplate[] = [
    {
      id: 'tpl_summary',
      name: 'Event Summary',
      description: 'Official chapter retrospective',
      category: 'event_summary',
      defaultContent: '# Event Summary\n\n**Event:** [Event Title]\n**Date:** [Date]\n**Venue:** [Venue / Auditorium]\n**Verified Attendance:** [Verified Attendance]\n\n## Key Highlights\n- Successful execution of technical sessions.\n- Drone flight telemetry recorded and filed.\n- Resolution passed by chapter leadership.',
    },
    {
      id: 'tpl_permission',
      name: 'Permission Letter',
      description: 'DGCA & Dean clearance letter',
      category: 'permission_letter',
      defaultContent: 'To,\nThe Dean of Student Affairs,\nCollege Campus,\n\nSubject: Request for Official Clearance for [Event Title]\n\nRespected Sir/Madam,\n\nWe hereby request permission to conduct [Event Title] on [Date] at [Venue / Auditorium]. All safety protocols and institutional mandates will be strictly adhered to.\n\nSincerely,\nGreen Eco Organization Hub (GeoHub)',
    },
    {
      id: 'tpl_budget',
      name: 'Budget Statement',
      description: 'Financial sanction statement',
      category: 'budget_statement',
      defaultContent: '# Budget Statement\n\n**Event:** [Event Title]\n**Allocated Ceiling:** ₹[Budget Amount]\n**Expended Amount:** ₹[Spent Amount]\n\n| Expense Head | Amount (₹) |\n| --- | --- |\n| Logistics & Stage | 12,000 |\n| Printing & Badges | 4,500 |\n| Refreshments | 8,000 |\n| Honorarium | 5,000 |',
    },
    {
      id: 'tpl_attendance',
      name: 'Attendance Manifest',
      description: 'Turnstile gate verification roster',
      category: 'attendance_manifest',
      defaultContent: '# Official Attendance Manifest\n\n**Event:** [Event Title]\n**Gate Check-ins:** [Verified Attendance]\n**Date:** [Date]\n\n| Scholar UID | Name | Department | Check-in Time |\n| --- | --- | --- | --- |\n| 2026-GEO-01 | Elena Rostova | Geoinformatics | 09:30 AM |\n| 2026-GEO-02 | Alex Rivera | Computer Science | 09:35 AM |',
    },
    {
      id: 'tpl_mom',
      name: 'Meeting Minutes',
      description: 'Executive committee minutes',
      category: 'meeting_minutes',
      defaultContent: '# Minutes of Meeting (MoM)\n\n**Body:** Executive Board Sync\n**Date:** [Date]\n**Presided By:** Faculty Advisor & Coordinator\n\n## Agenda\n1. Review of campus geomatics survey.\n2. Volunteer duty roster finalization.\n3. Turnstile pass cryptographic verification.',
    },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate>(standardTemplates[0]);
  const [docContent, setDocContent] = useState<string>(selectedTemplate.defaultContent);
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectTemplate = (tpl: DocTemplate) => {
    setSelectedTemplate(tpl);
    const targetEvent = events.find((e) => e.id === selectedEventId) || events[0];
    let populated = tpl.defaultContent;
    if (targetEvent) {
      populated = populated
        .replace(/\[Event Title Here\]/g, targetEvent.title)
        .replace(/\[Event Title\]/g, targetEvent.title)
        .replace(/\[Date\]/g, new Date(targetEvent.startDate).toLocaleDateString())
        .replace(/\[Venue Name \/ Geo Coordinates\]/g, targetEvent.venue)
        .replace(/\[Venue \/ Auditorium\]/g, targetEvent.venue)
        .replace(/\[Verified Attendance\]/g, `${targetEvent.registeredUserIds.length} verified attendees`)
        .replace(/\[Budget Amount\]/g, `${targetEvent.budget || 5000}`)
        .replace(/\[Spent Amount\]/g, `${(targetEvent.budget || 5000) * 0.9}`);
    }
    setDocContent(populated);
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;
    const populated = selectedTemplate.defaultContent
      .replace(/\[Event Title Here\]/g, targetEvent.title)
      .replace(/\[Event Title\]/g, targetEvent.title)
      .replace(/\[Date\]/g, new Date(targetEvent.startDate).toLocaleDateString())
      .replace(/\[Venue Name \/ Geo Coordinates\]/g, targetEvent.venue)
      .replace(/\[Venue \/ Auditorium\]/g, targetEvent.venue)
      .replace(/\[Verified Attendance\]/g, `${targetEvent.registeredUserIds.length} verified attendees`)
      .replace(/\[Budget Amount\]/g, `${targetEvent.budget || 5000}`)
      .replace(/\[Spent Amount\]/g, `${(targetEvent.budget || 5000) * 0.9}`);
    setDocContent(populated);
  };

  const handleExportPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedTemplate.name}</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 40px; color: #051F20; line-height: 1.6; }
            .header { border-bottom: 2px solid #235347; padding-bottom: 12px; margin-bottom: 24px; }
            .header-title { font-size: 20px; font-weight: 800; color: #051F20; margin: 0; }
            .content { white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="header-title">COLLEGE GEO CLUB (GEOHUB) - OFFICIAL DOCUMENT</h1>
            <div style="font-size: 12px; color: #235347; margin-top: 4px;">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="content">${docContent}</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${selectedTemplate.name}</title>
    <style>body{font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:11pt;line-height:1.5;} h1{color:#051F20;}</style>
    </head><body><pre style="font-family:'Plus Jakarta Sans',Arial,sans-serif;white-space:pre-wrap;">${docContent}</pre></body></html>`;
    const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.name.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const targetEvent = events.find((e) => e.id === selectedEventId) || events[0];
    const eventAttendance = attendance.filter((a) => a.eventId === targetEvent.id);
    const headers = ['Record ID', 'Event Name', 'Student UID', 'Student Name', 'Email', 'Team', 'Check-In Timestamp', 'Verified By'];
    const rows = (eventAttendance.length > 0 ? eventAttendance : targetEvent.registeredUserIds.map((uid, idx) => {
      const u = users.find((usr) => usr.uid === uid);
      return {
        id: `att_${idx + 1}`,
        eventTitle: targetEvent.title,
        userId: uid,
        userName: u ? u.name : `Scholar ${idx + 1}`,
        userEmail: u ? u.email : `scholar${idx + 1}@college.edu`,
        team: u?.team || 'General Member',
        checkInTime: new Date(targetEvent.startDate).toISOString(),
        scannedByVolunteerName: 'Gate Terminal 1',
      };
    })).map((r) => [
      r.id,
      `"${r.eventTitle}"`,
      r.userId,
      `"${r.userName}"`,
      r.userEmail,
      `"${r.team || 'Member'}"`,
      r.checkInTime,
      `"${r.scannedByVolunteerName}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${targetEvent.title.replace(/\s+/g, '_')}_Attendee_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(docContent);
    showToast('Copied to clipboard');
  };

  const insertText = (prefix: string, suffix = '') => {
    setDocContent((prev) => `${prev}\n${prefix}Text${suffix}\n`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: '#051F20',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={14} color="#8EB69B" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            Studio
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Official templates & exports
          </p>
        </div>

        <Mascot name="notebook" size="sm" />
      </div>

      <SegmentedTabs
        tabs={[
          { key: 'editor', label: 'Templates' },
          { key: 'uploads', label: 'Event Uploads' },
          { key: 'news', label: 'Daily News' },
          { key: 'archives', label: 'Archives' },
        ]}
        activeTab={activeTab}
        onChange={(k) => setActiveTab(k as any)}
      />

      {/* TAB 1: EVENT DOCUMENT UPLOADS */}
      {activeTab === 'uploads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Bar with Event Selector and Upload Button */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '18px 20px',
              boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Event Document Upload
                </h3>
                <p style={{ fontSize: '12px', color: '#235347', margin: '2px 0 0 0' }}>
                  Upload formal circulars, reports & signed sheets for respective events
                </p>
              </div>

              <PillButton
                variant="primary"
                icon={<Upload size={15} />}
                onClick={() => setIsUploadModalOpen(true)}
              >
                Upload Document
              </PillButton>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                Select Event:
              </label>
              <select
                value={selectedUploadEventId}
                onChange={(e) => setSelectedUploadEventId(e.target.value)}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  border: '1px solid #8EB69B',
                  backgroundColor: '#F6FBF7',
                  padding: '0 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#051F20',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.venue} • {new Date(ev.startDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of Uploaded Documents for Selected Event */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#051F20', margin: 0 }}>
              Uploaded Deliverables ({uploadedDocs.filter((d) => d.eventId === selectedUploadEventId).length})
            </h4>

            {uploadedDocs.filter((d) => d.eventId === selectedUploadEventId).length === 0 ? (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px dashed #8EB69B',
                  padding: '28px',
                  textAlign: 'center',
                  color: '#235347',
                  fontSize: '13px',
                }}
              >
                No documents uploaded for this event yet. Tap <strong>"Upload Document"</strong> to attach reports or permissions.
              </div>
            ) : (
              uploadedDocs.filter((d) => d.eventId === selectedUploadEventId).map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid #DAF1DE',
                    padding: '16px 18px',
                    boxShadow: '0 4px 16px rgba(5,31,32,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: '#DAF1DE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#163832',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={20} strokeWidth={2} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span className="truncate" style={{ fontSize: '13px', fontWeight: 800, color: '#051F20' }}>
                        {doc.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#235347', marginTop: '2px' }}>
                        <span style={{ fontWeight: 700, color: '#163832' }}>{doc.fileName}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                        <span>•</span>
                        <span>By {doc.uploadedBy}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast(`✓ Opening file: ${doc.fileName}`)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '9999px',
                      backgroundColor: '#F6FBF7',
                      border: '1px solid #8EB69B',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#163832',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                    }}
                  >
                    <Download size={13} />
                    <span>View</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DAILY NEWS (Daily Eco Bulletins) */}
      {activeTab === 'news' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '18px 20px',
              boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                Daily Eco Bulletins & News
              </h3>
              <p style={{ fontSize: '12px', color: '#235347', margin: '2px 0 0 0' }}>
                Publish and broadcast environmental alerts and chapter news
              </p>
            </div>

            <PillButton
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => setIsNewsModalOpen(true)}
            >
              Publish News
            </PillButton>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dailyNews.map((news) => (
              <div
                key={news.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #DAF1DE',
                  padding: '16px 20px',
                  boxShadow: '0 4px 16px rgba(5,31,32,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: '#DAF1DE',
                        color: '#163832',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                      }}
                    >
                      Daily Bulletin
                    </span>
                    {news.eventTitle && (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#235347' }}>
                        Linked: {news.eventTitle}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: '#235347', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {news.date}
                  </span>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  {news.title}
                </h4>

                <p style={{ fontSize: '13px', color: '#235347', margin: 0, lineHeight: 1.5 }}>
                  {news.content}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid #F6FBF7' }}>
                  <span style={{ fontSize: '12px', color: '#8EB69B', fontWeight: 600 }}>
                    {news.hashtags ? news.hashtags.join(' ') : '#DailyEcoNews'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#163832', fontWeight: 600 }}>
                    By {news.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'archives' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {standardTemplates.map((tpl) => (
            <div
              key={tpl.id}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  }}
                >
                  <Archive size={18} strokeWidth={2} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                    {tpl.name}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#235347' }}>
                    {tpl.description}
                  </span>
                </div>
              </div>

              <PillButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  handleSelectTemplate(tpl);
                  setActiveTab('editor');
                }}
              >
                Load
              </PillButton>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* BentoGrid of template cards with circular arrow buttons */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20', marginBottom: '10px' }}>
              Templates
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              {standardTemplates.map((tpl) => {
                const isSelected = selectedTemplate.id === tpl.id;
                return (
                  <button
                    type="button"
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    style={{
                      textAlign: 'left',
                      backgroundColor: isSelected ? '#DAF1DE' : '#FFFFFF',
                      borderRadius: '24px',
                      border: isSelected ? '2px solid #163832' : '1px solid #DAF1DE',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '120px',
                      boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
                      transition: 'all 200ms ease-out',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '9999px',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(5,31,32,0.06)',
                          color: '#163832',
                        }}
                      >
                        <FileText size={18} strokeWidth={2} />
                      </div>

                      {/* 40px circular arrow button */}
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '9999px',
                          backgroundColor: isSelected ? '#163832' : '#F6FBF7',
                          color: isSelected ? '#FFFFFF' : '#235347',
                          border: '1px solid #DAF1DE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected ? <Check size={14} strokeWidth={3} /> : <ArrowRight size={14} strokeWidth={2} />}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#051F20', margin: '8px 0 2px 0' }}>
                        {tpl.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#235347', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tpl.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor Card (24px white) with event auto-fill select, Auto-saved mint chip, micro-toolbar, body font preview */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(5,31,32,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Event Autofill Selector & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>Event:</span>
                <select
                  style={{
                    height: '38px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#051F20',
                    backgroundColor: '#F6FBF7',
                    border: '1px solid #DAF1DE',
                    borderRadius: '16px',
                    padding: '0 12px',
                    outline: 'none',
                    width: '100%',
                    maxWidth: '260px',
                  }}
                  value={selectedEventId}
                  onChange={(e) => handleEventChange(e.target.value)}
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StatusChip status="done" label="Auto-saved" />
                <button
                  type="button"
                  onClick={handleCopyText}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#F6FBF7',
                    border: '1px solid #DAF1DE',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#235347',
                    cursor: 'pointer',
                  }}
                >
                  <Copy size={13} strokeWidth={2} />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Micro Toolbar (Bold, Italic, Bullet List, Table) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                backgroundColor: '#F6FBF7',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
              }}
            >
              <button
                type="button"
                onClick={() => insertText('**', '**')}
                title="Bold"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#051F20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(5,31,32,0.04)',
                }}
              >
                <Bold size={14} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => insertText('*', '*')}
                title="Italic"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#051F20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(5,31,32,0.04)',
                }}
              >
                <Italic size={14} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => insertText('- ')}
                title="Bullet List"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#051F20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(5,31,32,0.04)',
                }}
              >
                <List size={14} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => insertText('| Header 1 | Header 2 |\n| --- | --- |\n| Data 1 | Data 2 |')}
                title="Table"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#051F20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(5,31,32,0.04)',
                }}
              >
                <TableIcon size={14} strokeWidth={2} />
              </button>
            </div>

            {/* Clean White Card Textarea with Body Font (per Conflict Resolution 2) */}
            <textarea
              rows={14}
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
                fontSize: '13px',
                lineHeight: 1.6,
                color: '#051F20',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DAF1DE',
                borderRadius: '16px',
                padding: '14px',
                outline: 'none',
                resize: 'vertical',
              }}
            />

            {/* Sticky Action Bar max 3 Pills: PDF, Word, Excel */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '6px' }}>
              <PillButton
                icon={<Printer size={16} />}
                variant="primary"
                onClick={handleExportPdf}
              >
                PDF
              </PillButton>
              <PillButton
                icon={<FileText size={16} />}
                variant="secondary"
                onClick={handleExportWord}
              >
                Word
              </PillButton>
              <PillButton
                icon={<FileSpreadsheet size={16} />}
                variant="ghost"
                onClick={handleExportExcel}
              >
                Excel
              </PillButton>
            </div>
          </div>
        </>
      )}

      {/* Upload Event Document BottomSheet */}
      <BottomSheet
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Event Document"
        subtitle="Publish formal circulars, reports or permission letters"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!uploadDocTitle.trim()) {
              showToast('Please enter document title');
              return;
            }
            const targetEvent = events.find((ev) => ev.id === selectedUploadEventId) || events[0];
            const newDoc = {
              id: `doc_${Date.now()}`,
              eventId: selectedUploadEventId,
              eventTitle: targetEvent?.title || 'Chapter Activity',
              title: uploadDocTitle.trim(),
              category: uploadDocCategory,
              fileName: uploadFileName.trim() || `${uploadDocTitle.trim().replace(/\s+/g, '_')}.pdf`,
              fileSize: '2.1 MB',
              uploadedBy: currentUser.name,
              uploadedAt: new Date().toLocaleString(),
            };
            setUploadedDocs((prev) => [newDoc, ...prev]);
            showToast(`✓ Document uploaded for "${targetEvent?.title || 'Event'}"`);
            setIsUploadModalOpen(false);
            setUploadDocTitle('');
            setUploadFileName('');
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>Target Event</label>
            <select
              value={selectedUploadEventId}
              onChange={(e) => setSelectedUploadEventId(e.target.value)}
              style={{
                height: '40px',
                borderRadius: '12px',
                border: '1px solid #DAF1DE',
                backgroundColor: '#F6FBF7',
                padding: '0 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#051F20',
                outline: 'none',
              }}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>Document Category</label>
            <select
              value={uploadDocCategory}
              onChange={(e) => setUploadDocCategory(e.target.value as any)}
              style={{
                height: '40px',
                borderRadius: '12px',
                border: '1px solid #DAF1DE',
                backgroundColor: '#F6FBF7',
                padding: '0 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#051F20',
                outline: 'none',
              }}
            >
              <option value="report">Post-Event Summary Report</option>
              <option value="permission">Dean / Authority Permission Letter</option>
              <option value="circular">Formal Notice / Executive Circular</option>
              <option value="signed_sheet">Signed Attendance Manifest</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>Document Title</label>
            <input
              type="text"
              value={uploadDocTitle}
              onChange={(e) => setUploadDocTitle(e.target.value)}
              placeholder="e.g. DGCA Airspace Clearance Sanction"
              style={{
                height: '40px',
                borderRadius: '12px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>Attachment File Name</label>
            <input
              type="text"
              value={uploadFileName}
              onChange={(e) => setUploadFileName(e.target.value)}
              placeholder="e.g. Clearance_Sanction_Signed.pdf"
              style={{
                height: '40px',
                borderRadius: '12px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
            <PillButton variant="primary" fullWidth type="submit">
              Confirm & Upload
            </PillButton>
            <PillButton variant="secondary" fullWidth onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </PillButton>
          </div>
        </form>
      </BottomSheet>

      {/* Publish Daily News BottomSheet */}
      <BottomSheet
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        title="Publish Daily News"
        subtitle="Broadcast campus environmental announcements"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newsTitle.trim() || !newsContent.trim()) {
              showToast('Please enter news title and content.');
              return;
            }
            const targetEvent = events.find((ev) => ev.id === newsEventId);
            addDailyNews({
              title: newsTitle.trim(),
              content: newsContent.trim(),
              date: new Date().toISOString().split('T')[0],
              status: 'published',
              eventId: newsEventId || undefined,
              eventTitle: targetEvent?.title,
              author: currentUser.name,
              hashtags: newsTags.split(',').map((t) => t.trim()).filter(Boolean),
            });
            showToast(`✓ Daily News bulletin published!`);
            setIsNewsModalOpen(false);
            setNewsTitle('');
            setNewsContent('');
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>Associate with Event (Optional)</label>
            <select
              value={newsEventId}
              onChange={(e) => setNewsEventId(e.target.value)}
              style={{
                height: '40px',
                borderRadius: '12px',
                border: '1px solid #DAF1DE',
                backgroundColor: '#F6FBF7',
                padding: '0 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#051F20',
                outline: 'none',
              }}
            >
              <option value="">General Club Bulletin (No specific event)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>Bulletin Headline</label>
            <input
              type="text"
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              placeholder="e.g. Zero-Waste Campus Drive Achieves 92% Diversion"
              style={{
                height: '40px',
                borderRadius: '12px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>Bulletin Content</label>
            <textarea
              rows={4}
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              placeholder="State the environmental update, circular details or event recap..."
              style={{
                borderRadius: '12px',
                border: '1px solid #DAF1DE',
                padding: '10px 12px',
                fontSize: '12px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>Hashtags (comma separated)</label>
            <input
              type="text"
              value={newsTags}
              onChange={(e) => setNewsTags(e.target.value)}
              placeholder="#DailyEcoNews, #GeoHub, #ZeroWaste"
              style={{
                height: '40px',
                borderRadius: '12px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
            <PillButton variant="primary" fullWidth type="submit">
              Broadcast Bulletin
            </PillButton>
            <PillButton variant="secondary" fullWidth onClick={() => setIsNewsModalOpen(false)}>
              Cancel
            </PillButton>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
};

export default DocumentationStudioView;
