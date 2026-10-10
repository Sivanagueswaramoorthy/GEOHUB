import React from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Images,
  FileCheck,
  Calendar,
  CheckSquare,
  DollarSign,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatTile } from '../../../components/StatTile';
import { SectionCard } from '../../../components/SectionCard';
import { GalleryItem } from '../../../types';

export interface EventDocStatus {
  eventId: string;
  eventTitle: string;
  date: string;
  venue: string;
  items: {
    report: 'submitted' | 'draft' | 'missing';
    photos: 'submitted' | 'draft' | 'missing';
    videos: 'submitted' | 'draft' | 'missing';
    dailyNews: 'submitted' | 'draft' | 'missing';
    mom: 'submitted' | 'draft' | 'missing';
    feedback: 'submitted' | 'draft' | 'missing';
  };
}

export interface DocumentationHomeViewProps {
  docEvents: EventDocStatus[];
  getCompletionDetails: (items: EventDocStatus['items']) => { completedCount: number; total: number; percent: number };
  setActiveChecklistEvent: (ev: EventDocStatus | null) => void;
  handleOpenTemplateShortcut: (name: string) => void;
  setActiveMediaItem: (item: GalleryItem | null) => void;
}

export const DocumentationHomeView: React.FC<DocumentationHomeViewProps> = ({
  docEvents,
  getCompletionDetails,
  setActiveChecklistEvent,
  handleOpenTemplateShortcut,
  setActiveMediaItem,
}) => {
  const { gallery, setActiveTab } = useApp();

  return (
    <>
      {/* 1) Four StatTiles for Documentation Lead */}
      <div className="stat-tiles-grid">
        <StatTile
          label="Events to Document"
          value="4"
          footnote="2 pending review"
          tint="mint"
          icon={<FileText size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('events')}
        />

        <StatTile
          label="Pending Uploads"
          value="12"
          footnote="8 photos, 4 videos"
          tint="amber"
          icon={<Upload size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('archives')}
        />

        <StatTile
          label="Reports Submitted"
          value="9"
          footnote="All verified briefs"
          tint="teal"
          icon={<CheckCircle2 size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('operations')}
        />

        <StatTile
          label="Memories This Month"
          value="18"
          footnote="+5 from field trip"
          tint="lavender"
          icon={<Images size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('archives')}
        />
      </div>

      {/* 2) Needs Documentation Card with Completion Ring */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck size={20} strokeWidth={1.75} className="text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Needs Documentation</h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Tap event for checklist
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {docEvents.map((ev) => {
            const { completedCount, total, percent } = getCompletionDetails(ev.items);
            const strokeDash = 2 * Math.PI * 18; // ~113
            const strokeOffset = strokeDash - (percent / 100) * strokeDash;

            return (
              <div
                key={ev.eventId}
                onClick={() => setActiveChecklistEvent(ev)}
                className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* SVG Completion Ring */}
                  <div className="relative flex items-center justify-center shrink-0" style={{ width: '48px', height: '48px' }}>
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="18" stroke="#EEF2F6" strokeWidth="4" fill="transparent" />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        stroke={percent === 100 ? '#10B981' : percent > 50 ? '#0D9488' : '#F59E0B'}
                        strokeWidth="4"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-extrabold text-slate-800">
                      {completedCount}/{total}
                    </span>
                  </div>

                  {/* Event Info & Micro Indicator Pills */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 truncate">
                        {ev.eventTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{ev.date}</span>
                      <span>•</span>
                      <span className="truncate">{ev.venue}</span>
                    </div>

                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {[
                        { key: 'report', label: 'Report' },
                        { key: 'photos', label: 'Photos' },
                        { key: 'videos', label: 'Videos' },
                        { key: 'dailyNews', label: 'News' },
                        { key: 'mom', label: 'MoM' },
                        { key: 'feedback', label: 'Feedback' },
                      ].map((chk) => {
                        const st = ev.items[chk.key as keyof EventDocStatus['items']];
                        const bg =
                          st === 'submitted'
                            ? 'bg-emerald-500 text-white'
                            : st === 'draft'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-400';
                        return (
                          <span
                            key={chk.key}
                            className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${bg}`}
                            title={`${chk.label}: ${st}`}
                          >
                            {chk.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      percent === 100
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : percent > 50
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {percent}% Done
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold mt-1 underline">
                    Checklist →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* 3) Template Shortcut Row */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={20} strokeWidth={1.75} className="text-purple-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Documentation Templates</h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('operations')}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Studio Full Editor →
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { name: 'Event Report', icon: <FileText size={16} />, bg: '#E7F9F1', border: '#A7F3D0', text: '#065F46' },
            { name: 'MoM', icon: <Calendar size={16} />, bg: '#F3EEFF', border: '#DDD1FF', text: '#5B21B6' },
            { name: 'Attendance Summary', icon: <CheckSquare size={16} />, bg: '#E8FBF8', border: '#99F6E4', text: '#0D9488' },
            { name: 'Budget Summary', icon: <DollarSign size={16} />, bg: '#FFF8E6', border: '#FDE68A', text: '#92400E' },
            { name: 'Feedback Summary', icon: <Sparkles size={16} />, bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
          ].map((tpl) => (
            <button
              key={tpl.name}
              type="button"
              onClick={() => handleOpenTemplateShortcut(tpl.name)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all shrink-0 cursor-pointer text-left active:scale-95"
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: tpl.bg, border: `1px solid ${tpl.border}`, color: tpl.text }}
              >
                {tpl.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-slate-800 whitespace-nowrap">
                  {tpl.name}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Prefill & Export</span>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* 4) Recent Uploads Strip */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Images size={20} strokeWidth={1.75} className="text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Recent Uploads Strip</h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('archives')}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            View Archives ({gallery.length}) →
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {gallery.slice(0, 6).map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveMediaItem(item)}
              className="w-48 shrink-0 rounded-2xl bg-white border border-slate-100 shadow-2xs overflow-hidden cursor-pointer hover:border-emerald-300 transition-all group"
              style={{ width: '190px' }}
            >
              <div className="relative h-24 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.geotag && (
                  <span className="absolute bottom-1.5 left-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white flex items-center gap-1">
                    <MapPin size={16} strokeWidth={1.75} className="text-emerald-400" />
                    <span className="truncate max-w-[120px]">{item.geotag.locationName || 'Geotagged'}</span>
                  </span>
                )}
                {item.submissionStatus && (
                  <span
                    className={`absolute top-1.5 right-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.submissionStatus === 'verified'
                        ? 'bg-emerald-600 text-white'
                        : item.submissionStatus === 'submitted'
                        ? 'bg-teal-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {item.submissionStatus}
                  </span>
                )}
              </div>

              <div className="p-2.5 flex flex-col gap-0.5">
                <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                <span className="text-[11px] text-emerald-700 font-semibold truncate">{item.eventTitle}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  By {item.uploadedByName} • {item.fileSizeBytes || '3.2 MB'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
};
