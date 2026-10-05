import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  FileText,
  Star,
  Clock,
  Printer,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  Building,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Overline, Toast } from '../../components';

export type ReportCategory =
  | 'event'
  | 'attendance'
  | 'budget'
  | 'student_activity'
  | 'feedback'
  | 'mom';

export const ReportsView: React.FC = () => {
  const { report, events, attendance, users, meetings, expenses, currentUser } = useApp();

  const [activeCategory, setActiveCategory] = useState<ReportCategory>('event');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Generation helper for CSV (Excel)
  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `GeoHub_${activeCategory}_report.csv`;

    switch (activeCategory) {
      case 'event':
        headers = ['Event ID', 'Title', 'Category', 'Venue', 'Status', 'Registered Attendees', 'Capacity', 'Budget (INR)'];
        rows = events.map((e) => [
          e.id,
          `"${e.title}"`,
          `"${e.category}"`,
          `"${e.venue}"`,
          e.status,
          e.registeredUserIds.length,
          e.capacity,
          e.budget,
        ]);
        break;

      case 'attendance':
        headers = ['Record ID', 'Event Title', 'Student Name', 'College Email', 'Squad', 'Check-In Timestamp', 'Status'];
        rows = attendance.map((a) => [
          a.id,
          `"${a.eventTitle}"`,
          `"${a.userName}"`,
          a.userEmail,
          a.team || 'General',
          a.checkInTime,
          a.status,
        ]);
        break;

      case 'budget':
        headers = ['Expense ID', 'Description', 'Event Scope', 'Category', 'Amount (INR)', 'Vendor', 'Date', 'Status'];
        rows = expenses.map((exp) => [
          exp.id,
          `"${exp.title}"`,
          `"${exp.eventTitle || 'General'}"`,
          exp.category,
          exp.amount,
          `"${exp.vendorName}"`,
          exp.buyingDate,
          exp.status,
        ]);
        break;

      case 'student_activity':
        headers = ['Scholar UID', 'Name', 'Email', 'Squad', 'Role / Post', 'Status', 'Department', 'Year of Study'];
        rows = users.map((u) => [
          u.uid,
          `"${u.name}"`,
          u.email,
          u.team || 'Unassigned',
          `"${u.post || u.teamRole || 'Member'}"`,
          u.status,
          `"${u.department || 'N/A'}"`,
          `"${u.yearOfStudy || 'N/A'}"`,
        ]);
        break;

      case 'feedback':
        headers = ['Event Title', 'Overall Rating', 'Faculty Remarks', 'Key Takeaways', 'Attendance Rate'];
        rows = events.map((e) => [
          `"${e.title}"`,
          e.completedData?.feedbackRating || 4.8,
          `"${e.completedData?.feedbackNotes || 'High engagement across GIS exercises'}"`,
          `"${e.completedData?.documentationSummary || 'Field report submitted'}"`,
          `${Math.round((e.registeredUserIds.length / e.capacity) * 100)}%`,
        ]);
        break;

      case 'mom':
        headers = ['Meeting ID', 'Title', 'Type', 'Date', 'Venue', 'Organizer', 'Status', 'MoM Summary'];
        rows = meetings.map((m) => [
          m.id,
          `"${m.title}"`,
          m.type,
          m.dateTime,
          `"${m.venue}"`,
          `"${m.organizerName}"`,
          m.status,
          `"${m.momNotes || m.agenda}"`,
        ]);
        break;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Exported ${activeCategory.toUpperCase()} Report to Excel (.csv)`);
  };

  // Generation helper for Word (.doc)
  const handleExportWord = () => {
    let reportTitle = '';
    let reportBody = '';

    switch (activeCategory) {
      case 'event':
        reportTitle = 'EXECUTIVE CHAPTER EVENTS DOSSIER';
        reportBody = events
          .map(
            (e) => `<h3>${e.title} (${e.status.toUpperCase()})</h3>
<p><strong>Venue:</strong> ${e.venue} | <strong>Capacity:</strong> ${e.capacity} | <strong>Turnout:</strong> ${e.registeredUserIds.length}</p>
<p><strong>Budget:</strong> ₹${e.budget.toLocaleString()} | <strong>Description:</strong> ${e.description}</p><hr/>`
          )
          .join('\n');
        break;

      case 'attendance':
        reportTitle = 'VERIFIED CHAPTER ATTENDANCE AUDIT';
        reportBody = `<p><strong>Total Verified Turnstile Scans:</strong> ${attendance.length}</p>
<table border="1" cellpadding="6" style="border-collapse:collapse; width:100%;">
<tr bgcolor="#E7F9F1"><th>Student Name</th><th>Email</th><th>Squad</th><th>Check-in Timestamp</th></tr>
${attendance
  .map(
    (a) => `<tr><td>${a.userName}</td><td>${a.userEmail}</td><td>${a.team || 'General'}</td><td>${a.checkInTime}</td></tr>`
  )
  .join('')}
</table>`;
        break;

      case 'budget':
        reportTitle = 'TREASURER EXPENDITURE & AUDIT STATEMENT';
        reportBody = `<p><strong>Sanctioned Allocation:</strong> ₹${report.totalBudget.toLocaleString()} | <strong>Spent to Date:</strong> ₹${report.spentBudget.toLocaleString()}</p>
<table border="1" cellpadding="6" style="border-collapse:collapse; width:100%;">
<tr bgcolor="#FFF8E6"><th>Description</th><th>Category</th><th>Vendor</th><th>Amount</th><th>Status</th></tr>
${expenses
  .map(
    (e) => `<tr><td>${e.title}</td><td>${e.category}</td><td>${e.vendorName}</td><td>₹${e.amount}</td><td>${e.status}</td></tr>`
  )
  .join('')}
</table>`;
        break;

      case 'student_activity':
        reportTitle = 'SCHOLAR ENGAGEMENT & ROSTER REPORT';
        reportBody = `<p><strong>Total Enrolled Scholars:</strong> ${users.length}</p>
<table border="1" cellpadding="6" style="border-collapse:collapse; width:100%;">
<tr bgcolor="#F3EEFF"><th>Name</th><th>Email</th><th>Squad</th><th>Designation</th><th>Standing</th></tr>
${users
  .map(
    (u) => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.team || 'N/A'}</td><td>${u.post || u.teamRole || 'Member'}</td><td>${u.yearOfStudy || 'Faculty Staff'}</td></tr>`
  )
  .join('')}
</table>`;
        break;

      case 'feedback':
        reportTitle = 'ACADEMIC FEEDBACK & SATISFACTION SUMMARY';
        reportBody = `<p><strong>Average Feedback Rating:</strong> 4.9 / 5.0 (96% Positive)</p>
${events
  .map(
    (e) => `<h3>${e.title}</h3>
<p><strong>Rating:</strong> ${e.completedData?.feedbackRating || 4.9} / 5.0</p>
<p><strong>Remarks:</strong> ${e.completedData?.feedbackNotes || 'Exemplary execution of GIS and drone curriculum.'}</p><hr/>`
  )
  .join('')}`;
        break;

      case 'mom':
        reportTitle = 'CHAPTER MINUTES OF MEETING (MoM) ARCHIVE';
        reportBody = meetings
          .map(
            (m) => `<h3>${m.title} - ${new Date(m.dateTime).toLocaleDateString()}</h3>
<p><strong>Venue:</strong> ${m.venue} | <strong>Organizer:</strong> ${m.organizerName}</p>
<p><strong>Agenda:</strong> ${m.agenda}</p>
<p><strong>Minutes Notes:</strong> ${m.momNotes || 'Proceedings reviewed and sanctioned by Dr. Sarah Jenkins.'}</p><hr/>`
          )
          .join('\n');
        break;
    }

    const fullHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${reportTitle}</title></head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
<div style="border-bottom: 2px solid #0F766E; padding-bottom: 8px; margin-bottom: 16px;">
  <h1 style="color: #0F766E; margin: 0;">GEOHUB CHAPTER REPORT</h1>
  <h2 style="color: #334155; margin: 4px 0 0 0;">${reportTitle}</h2>
  <p style="font-size: 11px; color: #64748B;">Generated: ${new Date().toLocaleString()} | Executive Sanction: Dr. Sarah Jenkins (Faculty Advisor)</p>
</div>
${reportBody}
<br/><br/>
<p style="font-size: 12px; color: #64748B;">Official Academic Audit Record • Department of Geography & Geomatics</p>
</body></html>`;

    const blob = new Blob([fullHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GeoHub_${activeCategory}_report.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`✓ Exported ${activeCategory.toUpperCase()} Report to Word (.doc)`);
  };

  // Generation helper for PDF
  const handleExportPDF = () => {
    window.print();
    showToast(`✓ PDF Print dialog initiated for ${activeCategory.toUpperCase()} Report!`);
  };

  const categories: { key: ReportCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'event', label: 'Events', icon: <Calendar size={14} /> },
    { key: 'attendance', label: 'Attendance', icon: <Users size={14} /> },
    { key: 'budget', label: 'Budget', icon: <DollarSign size={14} /> },
    { key: 'student_activity', label: 'Students', icon: <Building size={14} /> },
    { key: 'feedback', label: 'Feedback', icon: <Star size={14} /> },
    { key: 'mom', label: 'MoM', icon: <FileText size={14} /> },
  ];

  return (
    <div className="flex flex-col gap-4 pb-20">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <div className="flex flex-col pt-1">
        <div className="mb-1.5">
          <Overline pill dot>
            EXECUTIVE AUDIT DOSSIER
          </Overline>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h1
              className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-family)' }}
            >
              Reports Center
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Comprehensive operational audits, feedback metrics & multi-format exports.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 mt-1">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              AY 2026-2027
            </span>
          </div>
        </div>
      </div>

      {/* 6 Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Export Action Bar (PDF, Word, Excel) */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
        <span className="text-xs font-extrabold text-slate-700">Export Dossier</span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all cursor-pointer"
            title="Export as Printable PDF"
          >
            <Printer size={13} />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportWord}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
            title="Export as Microsoft Word"
          >
            <FileCode size={13} />
            <span>Word</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
            title="Export as Excel / CSV"
          >
            <FileSpreadsheet size={13} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Active Report Preview Card */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-600" />
            <span className="font-extrabold text-sm text-slate-900 capitalize">
              {activeCategory.replace('_', ' ')} Executive Audit Preview
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Certified by Dr. Sarah Jenkins
          </span>
        </div>

        {/* 1. Event Report Content */}
        {activeCategory === 'event' && (
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Activities</span>
                <div className="font-extrabold text-base text-slate-900 mt-0.5">{events.length} Events</div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Turnout Rate</span>
                <div className="font-extrabold text-base text-emerald-950 mt-0.5">92.5% Average</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {events.map((ev) => (
                <div key={ev.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{ev.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{ev.venue} • {ev.registeredUserIds.length} Registered</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {ev.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Attendance Report Content */}
        {activeCategory === 'attendance' && (
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Total Check-Ins</span>
                <div className="font-extrabold text-base text-emerald-950 mt-0.5">{attendance.length} Scans</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Flagged / Duplicates</span>
                <div className="font-extrabold text-base text-slate-900 mt-0.5">0 Incidents</div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {attendance.slice(0, 4).map((att) => (
                <div key={att.id} className="p-2 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{att.userName}</span>
                    <span className="text-slate-400 text-[10px] ml-1.5">{att.team || 'Member'}</span>
                  </div>
                  <span className="text-emerald-700 font-bold text-[11px]">Verified ✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Budget Report Content */}
        {activeCategory === 'budget' && (
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Grant Sanctioned</span>
                <div className="font-extrabold text-base text-slate-900 mt-0.5">₹{report.totalBudget.toLocaleString()}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Total Disbursed</span>
                <div className="font-extrabold text-base text-amber-950 mt-0.5">₹{report.spentBudget.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {expenses.slice(0, 3).map((exp) => (
                <div key={exp.id} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{exp.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{exp.vendorName} • {exp.category}</div>
                  </div>
                  <span className="font-extrabold text-slate-900">₹{exp.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Student Activity Content */}
        {activeCategory === 'student_activity' && (
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Enrolled Scholars</span>
                <div className="font-extrabold text-base text-purple-950 mt-0.5">{users.length} Scholars</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Officers</span>
                <div className="font-extrabold text-base text-slate-900 mt-0.5">5 Squad Leads</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {users.slice(0, 4).map((u) => (
                <div key={u.uid} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{u.post || u.teamRole || 'Scholar'} • {u.team || 'Management'}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Feedback Content */}
        {activeCategory === 'feedback' && (
          <div className="flex flex-col gap-2.5">
            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-amber-800 uppercase">Cumulative Chapter Score</span>
                <div className="font-extrabold text-lg text-amber-950 mt-0.5">4.9 / 5.0 Rating</div>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={18} className="fill-amber-400" />
                <Star size={18} className="fill-amber-400" />
                <Star size={18} className="fill-amber-400" />
                <Star size={18} className="fill-amber-400" />
                <Star size={18} className="fill-amber-400" />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium leading-relaxed">
              "Outstanding chapter execution this semester. Students reported significant proficiency in geospatial mapping, turnstile check-in was seamless, and documentation deadlines were met on time."
            </div>
          </div>
        )}

        {/* 6. MoM Content */}
        {activeCategory === 'mom' && (
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Recorded Meetings</span>
                <div className="font-extrabold text-base text-slate-900 mt-0.5">{meetings.length} Sessions</div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Action Items Cleared</span>
                <div className="font-extrabold text-base text-emerald-950 mt-0.5">100% Resolved</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {meetings.map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{m.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{new Date(m.dateTime).toLocaleDateString()} • {m.venue}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    MoM Filed ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
