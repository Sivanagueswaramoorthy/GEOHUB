import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Tag,
  Shield,
  Newspaper,
  Clock,
} from 'lucide-react';
import { AnimatedNumber } from '../../../components/shared';

export interface BulletinItem {
  id: string;
  title: string;
  category: 'Daily Report' | 'Urgent Clearance' | 'General Circular' | 'Press Briefing';
  date: string;
  author: string;
  content: string;
  signedBy: string;
}

export interface BulletinsDailyReportScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const BulletinsDailyReportScreen: React.FC<BulletinsDailyReportScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Daily Report' | 'Urgent Clearance' | 'General Circular' | 'Press Briefing'>('Daily Report');
  const [content, setContent] = useState('');

  const [bulletins, setBulletins] = useState<BulletinItem[]>([
    {
      id: 'b-1',
      title: 'GEO FEST 2026: Day 1 Operations & Turnstile Attendance Recap',
      category: 'Daily Report',
      date: '2026-11-04',
      author: 'Aarav Patel (Documentation Lead)',
      content: '98.4% turnstile verification achieved across Gates 1 and 2. Keynote auditorium reached capacity at 10:15 AM with zero incident reports.',
      signedBy: 'Dr. Sarah Jenkins (Faculty Advisor)',
    },
    {
      id: 'b-2',
      title: 'Mandatory Stage Rigging & Electrical Clearance Brief',
      category: 'Urgent Clearance',
      date: '2026-11-03',
      author: 'Divya Rao (Management Lead)',
      content: 'All stage rigging, sound telemetry and temporary power feeds inspected and passed by Campus Electrical Division.',
      signedBy: 'Campus Engineering Officer',
    },
    {
      id: 'b-3',
      title: 'Official Circular: Semester End Field Expedition Registration',
      category: 'General Circular',
      date: '2026-10-30',
      author: 'Elena Rostova (Secretary)',
      content: 'Open registration for Geomatics field expedition to Western Ghats biodiversity corridor. Limited to 40 verified scholars.',
      signedBy: 'Dr. Sarah Jenkins (Faculty Advisor)',
    },
  ]);

  const categories = ['All', 'Daily Report', 'Urgent Clearance', 'General Circular', 'Press Briefing'];

  const filteredBulletins = bulletins.filter((b) => {
    if (selectedCategory !== 'All' && b.category !== selectedCategory) return false;
    return true;
  });

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newBulletin: BulletinItem = {
      id: `b-${Date.now()}`,
      title: title.trim(),
      category,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: currentUser?.name || 'Documentation Lead',
      content: content.trim(),
      signedBy: 'Dr. Sarah Jenkins (Faculty Advisor)',
    };

    setBulletins((prev) => [newBulletin, ...prev]);
    onLogAudit('Bulletins & Daily Report', `Published official bulletin: "${newBulletin.title}" (${category})`);

    setShowComposeModal(false);
    setTitle('');
    setContent('');
    setSuccessMsg(`Published bulletin: "${newBulletin.title}"`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handlePrintBulletin = (item: BulletinItem) => {
    onLogAudit('Bulletins', `Printed official circular: "${item.title}"`);
    setSuccessMsg(`Sent "${item.title}" to institutional printer queue.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Bulletins</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <FileText size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={bulletins.length} /> Dispatches
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Daily</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-sm sm:text-base mt-1">
            <AnimatedNumber value={bulletins.filter((b) => b.category === 'Daily Report').length} /> Reports
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Clearance</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Shield size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-sm sm:text-base mt-1">
            Ratified
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#163832] uppercase tracking-wide">Action</span>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowComposeModal(true)}
              className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
              data-testid="btn-compose-bulletin"
            >
              <Plus size={14} />
              <span>Compose</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Main Bulletins Container */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Official Bulletins & Daily Dispatches
          </h2>

          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`h-7 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#163832] text-white shadow-xs'
                    : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Bulletins Feed */}
        <div className="space-y-3 pt-1">
          {filteredBulletins.map((bulletin) => (
            <div
              key={bulletin.id}
              className="p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#051F20] text-sm sm:text-base">
                    {bulletin.title}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      bulletin.category === 'Urgent Clearance'
                        ? 'bg-[#D9534F]/10 text-[#D9534F] border border-[#D9534F]/30'
                        : bulletin.category === 'Daily Report'
                        ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]'
                        : 'bg-white text-[#235347] border border-[#DAF1DE]'
                    }`}
                  >
                    {bulletin.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handlePrintBulletin(bulletin)}
                    className="h-8 px-3 rounded-xl bg-white border border-[#DAF1DE] text-xs font-bold text-[#163832] hover:bg-[#DAF1DE] active:scale-95 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Print PDF</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#235347] leading-relaxed">
                {bulletin.content}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#DAF1DE] text-xs text-[#235347]/80">
                <span>Author: <strong>{bulletin.author}</strong></span>
                <span>Sign-off: <strong>{bulletin.signedBy}</strong></span>
                <span className="text-xs font-semibold text-[#051F20]">Date: {bulletin.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compose Bulletin Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#051F20] text-base">
                Draft Official Bulletin
              </h3>
              <button
                type="button"
                onClick={() => setShowComposeModal(false)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleComposeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Bulletin Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Turnstile Attendance Recap & Auditorium Safety Clearance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Classification / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                >
                  <option value="Daily Report">Daily Report</option>
                  <option value="Urgent Clearance">Urgent Clearance</option>
                  <option value="General Circular">General Circular</option>
                  <option value="Press Briefing">Press Briefing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Bulletin Text / Executive Summary
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter official briefing text..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer"
                >
                  Publish Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulletinsDailyReportScreen;

