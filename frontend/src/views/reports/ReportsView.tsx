import React, { useState } from 'react';
import {
  Download,
  Calendar,
  DollarSign,
  Users,
  Printer,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  PillButton,
  StatusChip,
  StatTile,
  SegmentedTabs,
  Mascot,
} from '../../components/shared';

export type ReportCategory = 'event' | 'attendance' | 'budget' | 'feedback';

export const ReportsView: React.FC = () => {
  const { events, attendance, users, expenses } = useApp();
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('event');

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeCategory === 'event') {
      headers = ['ID', 'Title', 'Category', 'Venue', 'Status', 'Registered', 'Capacity'];
      rows = events.map((e) => [
        e.id,
        `"${e.title}"`,
        `"${e.category}"`,
        `"${e.venue}"`,
        e.status,
        e.registeredUserIds.length,
        e.capacity,
      ]);
    } else if (activeCategory === 'attendance') {
      headers = ['ID', 'Event', 'Student', 'Email', 'CheckInTime'];
      rows = attendance.map((a) => [
        a.id,
        `"${a.eventTitle}"`,
        `"${a.userName}"`,
        a.userEmail,
        a.checkInTime,
      ]);
    } else {
      headers = ['ID', 'Category', 'Description', 'Vendor', 'Amount', 'Status'];
      rows = expenses.map((e) => [
        e.id,
        e.category,
        `"${e.title}"`,
        `"${e.vendorName || 'N/A'}"`,
        e.amount,
        e.status,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GeoHub_${activeCategory}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const tabs = [
    { key: 'event', label: 'Events' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'budget', label: 'Budget' },
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
            Executive Reports
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Institutional analytics & exports
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <PillButton
            variant="secondary"
            icon={<Printer size={16} />}
            onClick={handlePrintPdf}
          >
            PDF
          </PillButton>
          <PillButton
            variant="primary"
            icon={<FileSpreadsheet size={16} />}
            onClick={handleExportExcel}
          >
            Excel
          </PillButton>
        </div>
      </div>

      {/* Overview Stat Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <StatTile
          icon={<Calendar size={18} strokeWidth={2} />}
          value={events.length.toString()}
          label="Events"
          tint="mint"
        />
        <StatTile
          icon={<Users size={18} strokeWidth={2} />}
          value={attendance.length.toString()}
          label="Verified"
          tint="sage"
        />
        <StatTile
          icon={<DollarSign size={18} strokeWidth={2} />}
          value={`₹${(totalSpent / 1000).toFixed(0)}k`}
          label="Disbursed"
          tint="white"
        />
      </div>

      {/* Tabs */}
      <SegmentedTabs
        tabs={tabs}
        activeTab={activeCategory}
        onChange={(k) => setActiveCategory(k as any)}
      />

      {/* Report Records Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #DAF1DE',
          padding: '20px',
          boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
            Dataset Manifest
          </h3>
          <StatusChip status="live" label="Live Records" />
        </div>

        {activeCategory === 'event' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {events.map((ev) => (
              <div
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: '#F6FBF7',
                  border: '1px solid #DAF1DE',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
                    {ev.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px' }}>
                    {ev.venue} • {ev.registeredUserIds.length} / {ev.capacity} Registered
                  </div>
                </div>
                <StatusChip status={ev.status as any} />
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'attendance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attendance.slice(0, 10).map((att) => (
              <div
                key={att.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: '#F6FBF7',
                  border: '1px solid #DAF1DE',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
                    {att.userName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px' }}>
                    {att.eventTitle} • {att.userEmail}
                  </div>
                </div>
                <StatusChip status="done" label="Verified" />
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'budget' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {expenses.map((exp) => (
              <div
                key={exp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: '#F6FBF7',
                  border: '1px solid #DAF1DE',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
                    {exp.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px' }}>
                    {exp.vendorName || exp.category} • {exp.buyingDate}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#163832' }}>
                    ₹{exp.amount.toLocaleString()}
                  </div>
                  <StatusChip status={exp.status as any} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;
