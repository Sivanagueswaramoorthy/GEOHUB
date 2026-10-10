import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Printer,
  FileCheck,
  FileSpreadsheet,
  Edit3,
  Layers,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocTemplate } from '../../types';

export const DocumentationStudioView: React.FC = () => {
  const { docTemplates, events, attendance, users } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate>(docTemplates[0]);
  const [docContent, setDocContent] = useState<string>(docTemplates[0].defaultContent);
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
    showToast(`Loaded "${tpl.name}"`);
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

  // 1. Export as Word (.doc)
  const handleExportWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${selectedTemplate.name}</title>
    <style>body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.5;} h1{color:#047857;} h2{color:#0F172A;}</style>
    </head><body><pre style="font-family:Arial,sans-serif;white-space:pre-wrap;">${docContent}</pre></body></html>`;
    const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.name.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Downloaded as Word Document (.doc)`);
  };

  // 2. Export as PDF (Print Window)
  const handleExportPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Please allow popups to generate PDF preview.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedTemplate.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0F172A; line-height: 1.6; }
            .header { border-bottom: 2px solid #10B981; padding-bottom: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
            .header-title { font-size: 20px; font-weight: 800; color: #047857; margin: 0; }
            .content { white-space: pre-wrap; font-size: 13px; line-height: 1.65; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="header-title">COLLEGE GEO CLUB (GEOHUB) - OFFICIAL DOCUMENT</h1>
            <div style="font-size: 11px; color: #64748B;">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="content">${docContent}</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast(`✓ Opened PDF Print Dialog`);
  };

  // 3. Export as Excel / CSV (Attendance & Metrics)
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
    showToast(`✓ Exported Attendance & Roster to Excel/CSV!`);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(docContent);
    showToast('✓ Copied document text to clipboard!');
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
              DOCUMENTATION WING & EXPORTS
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Pre-Defined Documentation Templates & Export
          </h1>
        </div>

        {/* 3 Export Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportPdf}
            style={{
              padding: '9px 15px',
              borderRadius: '999px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(220, 38, 38, 0.25)',
            }}
          >
            <Printer size={16} strokeWidth={1.75} /> Export PDF
          </button>

          <button
            onClick={handleExportWord}
            style={{
              padding: '9px 15px',
              borderRadius: '999px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
            }}
          >
            <FileText size={16} strokeWidth={1.75} /> Export Word (.doc)
          </button>

          <button
            onClick={handleExportExcel}
            style={{
              padding: '9px 15px',
              borderRadius: '999px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(16, 185, 129, 0.25)',
            }}
          >
            <FileSpreadsheet size={16} strokeWidth={1.75} /> Export Excel / CSV
          </button>
        </div>
      </div>

      {/* Template Chooser Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {docTemplates.map((tpl) => {
          const isSelected = selectedTemplate.id === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              style={{
                backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                borderRadius: '16px',
                border: isSelected ? '2px solid #10B981' : '1px solid #E8ECF2',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: isSelected ? '#047857' : '#64748B',
                  }}
                >
                  {tpl.category.replace('_', ' ')}
                </span>
                {isSelected && <Check size={16} color="#10B981" strokeWidth={3} />}
              </div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {tpl.name}
              </h4>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                {tpl.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Editor & Autofill Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E8ECF2',
          padding: '18px 20px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Auto-Fill Data from Event:</label>
            <select
              className="input-field"
              style={{ height: '36px', fontSize: '12px', padding: '0 12px', width: 'auto' }}
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

          <button
            onClick={handleCopyText}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <Copy size={16} strokeWidth={1.75} /> Copy Document Text
          </button>
        </div>

        {/* Live Document Editor */}
        <div className="input-group">
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Live Document Editor (Editable Markdown & Text)</span>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Changes will be included in exported file</span>
          </label>
          <textarea
            className="input-field"
            rows={18}
            style={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '12px',
              lineHeight: 1.6,
              backgroundColor: '#F8FAFC',
            }}
            value={docContent}
            onChange={(e) => setDocContent(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
