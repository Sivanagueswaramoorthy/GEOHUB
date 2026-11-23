import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  Megaphone,
  Upload,
  Download,
  FileSpreadsheet,
  Trash2,
  X,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { AnimatedNumber, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

export interface CampaignReleaseItem {
  id: string;
  title: string;
  event: string;
  day?: string;
  channel: string;
  scheduledDate: string;
  status: 'Scheduled' | 'Live' | 'Draft' | 'Completed';
  caption: string;
  author: string;
}

export interface ReleaseCalendarScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

const DEFAULT_FUNCTIONS: CampaignReleaseItem[] = [
  {
    id: 'fn-diwali-2026',
    title: 'Diwali',
    event: 'Diwali Festival of Lights',
    day: 'Sunday',
    channel: 'Festival',
    scheduledDate: '2026-11-01',
    status: 'Scheduled',
    caption: 'Campus festival celebration and traditional light displays.',
    author: 'Cultural Coordinator',
  },
  {
    id: 'fn-pongal-2027',
    title: 'Pongal',
    event: 'Pongal Harvest Festival',
    day: 'Thursday',
    channel: 'Harvest Festival',
    scheduledDate: '2027-01-14',
    status: 'Scheduled',
    caption: 'Traditional harvest festival celebration with pot cooking.',
    author: 'Cultural Coordinator',
  },
  {
    id: 'fn-independence-2026',
    title: 'Independence Day',
    event: 'National Independence Day',
    day: 'Saturday',
    channel: 'National Holiday',
    scheduledDate: '2026-08-15',
    status: 'Scheduled',
    caption: 'National celebration and campus flag hoisting ceremony.',
    author: 'Promotion Lead',
  },
];

export const ReleaseCalendarScreen: React.FC<ReleaseCalendarScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const { campaigns: contextCampaigns, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for manual single-event entry
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-11-01');
  const [newDay, setNewDay] = useState('Sunday');
  const [newCategory, setNewCategory] = useState('Festival');
  const [newCaption, setNewCaption] = useState('');

  // Auto-calculate day of week when date changes
  const handleDateChange = (dateString: string) => {
    setNewDate(dateString);
    if (dateString) {
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        setNewDay(days[d.getDay()]);
      }
    }
  };

  // State initialized from localStorage or defaults
  const [campaigns, setCampaigns] = useState<CampaignReleaseItem[]>(() => {
    try {
      const saved = localStorage.getItem('geohub_release_calendar_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved calendar functions:', e);
    }

    if (contextCampaigns && contextCampaigns.length > 0) {
      return (contextCampaigns || []).map((c: any) => ({
        id: c.id,
        title: c.name || c.title || 'Function',
        event: c.eventTitle || c.title || 'Campus Function',
        day: c.day || 'Monday',
        channel: c.channel || 'Festival',
        scheduledDate: c.startDate || '2026-11-01',
        status: (c.status || 'Scheduled') as any,
        caption: c.caption || c.description || 'Public celebration',
        author: c.author || 'Promotion Lead',
      }));
    }

    return DEFAULT_FUNCTIONS;
  });

  // Save to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem('geohub_release_calendar_items', JSON.stringify(campaigns));
    } catch (e) {
      console.warn('Failed to persist calendar functions:', e);
    }
  }, [campaigns]);

  // Single Manual Event Creation
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: CampaignReleaseItem = {
      id: `fn-${Date.now()}`,
      title: newTitle.trim(),
      event: newTitle.trim(),
      day: newDay.trim() || 'Day',
      channel: newCategory,
      scheduledDate: newDate,
      status: 'Scheduled',
      caption: newCaption.trim() || `${newTitle.trim()} function on ${newDay} (${newDate}).`,
      author: currentUser?.name || 'Coordinator',
    };

    setCampaigns((prev) => [created, ...prev]);
    onLogAudit('Release Calendar', `Added single function: "${created.title}" on ${newDay}, ${newDate}`);

    setShowScheduleModal(false);
    setNewTitle('');
    setNewCaption('');
    showToast?.(`✓ Added function "${created.title}"!`);
    setSuccessMsg(`✓ Added "${created.title}" successfully!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Delete Single Function
  const handleDeleteFunction = (id: string, title: string) => {
    setCampaigns((prev) => prev.filter((item) => item.id !== id));
    showToast?.(`Removed "${title}"`);
    onLogAudit('Release Calendar', `Removed function: "${title}"`);
  };

  // Excel / CSV File Import Handler
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const firstSheet = workbook.Sheets[firstSheetName];
        const rawRows: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          showToast?.('Uploaded Excel sheet is empty.', 'error');
          return;
        }

        const importedItems: CampaignReleaseItem[] = [];

        rawRows.forEach((row, idx) => {
          // Flexible case-insensitive column getter
          const getVal = (possibleKeys: string[]): string => {
            for (const k of Object.keys(row)) {
              const cleanK = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
              for (const target of possibleKeys) {
                if (cleanK === target.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                  return String(row[k]).trim();
                }
              }
            }
            return '';
          };

          const rawTitle = getVal([
            'Function Title',
            'Function',
            'Title',
            'Event Title',
            'Event',
            'Holiday',
            'Name',
            'Occasion',
            'Festival',
          ]);
          const rawDate = getVal(['Date', 'Scheduled Date', 'Event Date', 'Date & Time']);
          let rawDay = getVal(['Day', 'Day of Week', 'Weekday']);
          const rawCategory = getVal(['Category', 'Channel', 'Type']) || 'Festival';
          const rawNotes = getVal(['Notes', 'Caption', 'Description', 'Remarks']);

          if (!rawTitle && !rawDate) return;

          // Normalize Date (handles Excel numeric serials and date strings)
          let parsedDate = rawDate;
          if (!parsedDate) {
            parsedDate = new Date().toISOString().split('T')[0];
          } else if (!isNaN(Number(parsedDate)) && Number(parsedDate) > 30000 && Number(parsedDate) < 60000) {
            const excelDate = new Date((Number(parsedDate) - 25569) * 86400 * 1000);
            parsedDate = excelDate.toISOString().split('T')[0];
          }

          // Auto-compute day of week if missing
          if (!rawDay && parsedDate) {
            const d = new Date(parsedDate);
            if (!isNaN(d.getTime())) {
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              rawDay = days[d.getDay()];
            }
          }

          importedItems.push({
            id: `excel-${Date.now()}-${idx}`,
            title: rawTitle || `Function ${idx + 1}`,
            event: rawTitle || 'Campus Function',
            day: rawDay || 'Day',
            channel: rawCategory,
            scheduledDate: parsedDate,
            status: 'Scheduled',
            caption: rawNotes || `${rawTitle} on ${rawDay || ''} (${parsedDate})`,
            author: currentUser?.name || 'Excel Import',
          });
        });

        if (importedItems.length === 0) {
          showToast?.('No valid rows with Function Title or Date found in Excel.', 'error');
          return;
        }

        setCampaigns((prev) => [...importedItems, ...prev]);
        onLogAudit('Release Calendar', `Imported ${importedItems.length} functions from Excel sheet`);
        showToast?.(`✓ Successfully imported ${importedItems.length} functions from Excel!`);
        setSuccessMsg(`✓ Imported ${importedItems.length} functions from Excel spreadsheet!`);
        setTimeout(() => setSuccessMsg(null), 4000);
      } catch (err: any) {
        console.error('Excel parse error:', err);
        showToast?.('Failed to parse Excel file. Please ensure valid format.', 'error');
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Download Sample Excel Template
  const handleDownloadSample = () => {
    const wsData = [
      ['Date', 'Day', 'Function Title', 'Category', 'Notes'],
      ['2026-11-01', 'Sunday', 'Diwali', 'Festival', 'Festival of Lights campus celebration'],
      ['2027-01-14', 'Thursday', 'Pongal', 'Harvest Festival', 'Traditional harvest festival celebration'],
      ['2026-08-15', 'Saturday', 'Independence Day', 'National Holiday', 'National flag hoisting ceremony'],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Functions');
    XLSX.writeFile(wb, 'GeoHub_Functions_Template.xlsx');
    showToast?.('✓ Sample Excel template downloaded!');
  };

  // Format date helper
  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { dayNum: '--', monthStr: 'DATE', full: dateStr };
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthStr = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = d.getFullYear();
      return { dayNum, monthStr, full: `${dayNum} ${monthStr} ${year}` };
    } catch {
      return { dayNum: '--', monthStr: 'DATE', full: dateStr };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden animate-fadeIn pb-24">
      {/* Hidden File Input for Excel Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleExcelUpload}
      />

      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-3 rounded-2xl bg-white border border-[#E2EBE5] shadow-[0_2px_12px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wider">Scheduled</span>
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] flex items-center justify-center text-[#163832]">
              <CalendarIcon size={13} strokeWidth={2.2} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={campaigns.filter((c) => c.status === 'Scheduled').length} />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#E2EBE5] shadow-[0_2px_12px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wider">Live</span>
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] flex items-center justify-center text-[#163832]">
              <Megaphone size={13} strokeWidth={2.2} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-base sm:text-lg mt-1">
            <AnimatedNumber value={campaigns.filter((c) => c.status === 'Live').length} />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#E2EBE5] shadow-[0_2px_12px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wider">Total</span>
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] flex items-center justify-center text-[#163832]">
              <CalendarDays size={13} strokeWidth={2.2} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            {campaigns.length} Events
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#EAF3EC] border border-[#DAF1DE] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#163832] uppercase tracking-wider">Action</span>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
              data-testid="btn-new-release"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add Event</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-2xl bg-[#EAF3EC] border border-[#8EB69B]/50 text-[#051F20] text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-[#163832] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Main Functions & Release Timeline Card (FILTERS REMOVED) */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#E2EBE5] shadow-[0_4px_20px_rgba(5,31,32,0.03)] space-y-3.5">
        {/* Header Strip with Title & Excel Import / Manual Add Actions */}
        <div className="flex flex-col gap-2.5 pb-3 border-b border-[#EDF3EF]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
                Campaign & Release Timeline
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#163832] border border-[#DAF1DE]/60">
                {campaigns.length} Functions
              </span>
            </div>
          </div>

          {/* Clean Unified Action Toolbar */}
          {!readOnly && (
            <div className="grid grid-cols-3 gap-2 w-full pt-1">
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="h-9 px-3 rounded-xl bg-[#163832] text-white hover:bg-[#0B2B26] active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                title="Add single function manually"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>+ Add</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 px-3 rounded-xl bg-[#FAFCFA] border border-[#DDE7DF] text-[#163832] hover:bg-[#EAF3EC] active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                title="Import Excel spreadsheet (.xlsx, .xls, .csv)"
              >
                <Upload size={13} strokeWidth={2.2} />
                <span>Import</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSample}
                className="h-9 px-2.5 rounded-xl bg-[#FAFCFA] border border-[#DDE7DF] text-[#235347] hover:bg-[#EAF3EC] active:scale-95 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                title="Download sample template for Excel import"
              >
                <Download size={13} strokeWidth={2.2} />
                <span>Template</span>
              </button>
            </div>
          )}
        </div>

        {/* Function Cards Feed with Date, Day, and Function Title */}
        <div className="space-y-3 pt-1">
          {campaigns.length > 0 ? (
            campaigns.map((camp) => {
              const dateInfo = formatDateDisplay(camp.scheduledDate);
              return (
                <div
                  key={camp.id}
                  className="p-3 sm:p-4 rounded-2xl bg-[#FAFCFA] border border-[#E2EBE5] hover:border-[#8EB69B]/70 transition-all flex items-start sm:items-center justify-between gap-3"
                >
                  {/* Left: Date & Day Medallion Tile */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF3EC] border border-[#DAF1DE] flex flex-col items-center justify-center shrink-0 text-center shadow-2xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#163832]">
                        {camp.day?.slice(0, 3) || 'DAY'}
                      </span>
                      <span className="text-base font-extrabold text-[#051F20] leading-none my-0.5">
                        {dateInfo.dayNum}
                      </span>
                      <span className="text-[9px] font-bold uppercase text-[#235347]">
                        {dateInfo.monthStr}
                      </span>
                    </div>

                    {/* Middle: Function Title, Day, Date, and Category */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#051F20] text-sm sm:text-base tracking-tight truncate">
                          {camp.title}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3EC] text-[#163832] border border-[#DAF1DE]/60">
                          {camp.channel || 'Festival'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#235347]">
                        <span className="font-semibold text-[#163832]">
                          Day: <strong>{camp.day || 'Day'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Date: <strong>{camp.scheduledDate}</strong>
                        </span>
                      </div>

                      {camp.caption && (
                        <p className="text-xs text-[#235347]/80 mt-1 line-clamp-1">
                          {camp.caption}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions (Delete) */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFunction(camp.id, camp.title)}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E2EBE5] text-[#235347] hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 touch-target-44"
                      title={`Remove ${camp.title}`}
                      aria-label={`Remove ${camp.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-10 px-4 rounded-2xl bg-[#FAFCFA] border border-dashed border-[#DAF1DE] text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EAF3EC] text-[#163832] flex items-center justify-center shadow-xs">
                <CalendarDays size={24} strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <span className="text-sm font-bold text-[#051F20]">No Functions Scheduled</span>
                <span className="text-xs text-[#235347] leading-relaxed">
                  Import an Excel sheet with Date, Day, and Function Title, or click &quot;+&quot; to type manually.
                </span>
              </div>
              {!readOnly && (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-4 rounded-xl bg-[#FAFCFA] border border-[#DDE7DF] text-[#163832] hover:bg-[#EAF3EC] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Import Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(true)}
                    className="h-9 px-4 rounded-xl bg-[#163832] text-white hover:bg-[#0B2B26] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Manually</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Manual Single Event Entry Modal */}
      {showScheduleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300 animate-fadeIn"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-[0_24px_60px_rgba(5,31,32,0.25)] border border-[#E2EBE5] space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#EDF3EF]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAF3EC] text-[#163832] flex items-center justify-center">
                  <Plus size={16} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-[#051F20] text-base">
                  Add Function / Event
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAFCFA] border border-[#DDE7DF] text-[#235347] hover:bg-[#EAF3EC] flex items-center justify-center cursor-pointer text-xs font-bold transition-all active:scale-95 touch-target-44"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5">
              {/* Function Title */}
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Function Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali, Pongal, Independence Day"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#DDE7DF] text-xs font-semibold text-[#051F20] bg-[#FAFCFA] outline-none focus:border-[#163832] focus:ring-2 focus:ring-[#163832]/10 transition-all"
                />
              </div>

              {/* Date and Day Row (Both manually typed / editable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#DDE7DF] text-xs font-semibold text-[#051F20] bg-[#FAFCFA] outline-none focus:border-[#163832] focus:ring-2 focus:ring-[#163832]/10 transition-all cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    Day <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunday, Monday"
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#DDE7DF] text-xs font-semibold text-[#051F20] bg-[#FAFCFA] outline-none focus:border-[#163832] focus:ring-2 focus:ring-[#163832]/10 transition-all"
                  />
                </div>
              </div>

              {/* Category / Type */}
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Category / Tag
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#DDE7DF] text-xs font-semibold text-[#051F20] bg-[#FAFCFA] outline-none focus:border-[#163832] focus:ring-2 focus:ring-[#163832]/10 transition-all cursor-pointer"
                >
                  <option value="Festival">Festival (e.g. Diwali)</option>
                  <option value="Harvest Festival">Harvest Festival (e.g. Pongal)</option>
                  <option value="National Holiday">National Holiday (e.g. Independence Day)</option>
                  <option value="Celebration">Celebration</option>
                  <option value="Campus Event">Campus Event</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Function Notes / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter details, timings, or venue..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#DDE7DF] text-xs text-[#051F20] bg-[#FAFCFA] outline-none focus:border-[#163832] focus:ring-2 focus:ring-[#163832]/10 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EDF3EF]">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DDE7DF] text-xs font-bold text-[#235347] hover:bg-[#FAFCFA] cursor-pointer active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer shadow-xs transition-all"
                >
                  Add Function
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReleaseCalendarScreen;
