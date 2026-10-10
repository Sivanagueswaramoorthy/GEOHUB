import React, { useState } from 'react';
import {
  QrCode,
  ListTodo,
  Star,
  MessageSquare,
  Scan,
  FileCheck,
  Images,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ShortcutTile } from '../../../components/ShortcutTile';
import { CategoryCard } from '../../../components/CategoryCard';
import { ModuleTile } from '../../../components/ModuleTile';
import { BottomSheet } from '../../../components/BottomSheet';
import { Toast } from '../../../components/Toast';

export const StudentOperationsView: React.FC = () => {
  const {
    currentUser,
    setActiveTab,
    events,
    gallery,
    tasks,
    updateTaskStatus,
  } = useApp();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Student Operations Modals & State
  const [isStudentPassOpen, setIsStudentPassOpen] = useState(false);
  const [isStudentDutiesOpen, setIsStudentDutiesOpen] = useState(false);
  const [isStudentRegHistoryOpen, setIsStudentRegHistoryOpen] = useState(false);
  const [isStudentFeedbackOpen, setIsStudentFeedbackOpen] = useState(false);
  const [isGateScannerDutyWarningOpen, setIsGateScannerDutyWarningOpen] = useState(false);

  // Student Feedback State
  const [studentFeedbackEventId, setStudentFeedbackEventId] = useState(events[0]?.id || '');
  const [studentFeedbackRating, setStudentFeedbackRating] = useState(5);
  const [studentFeedbackCategory, setStudentFeedbackCategory] = useState('Workshop Quality');
  const [studentFeedbackComment, setStudentFeedbackComment] = useState('');

  const handleStudentFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEvent = events.find((ev) => ev.id === studentFeedbackEventId);
    showToast(`✓ Feedback for "${targetEvent?.title || 'Event'}" submitted to Coordinator!`);
    setIsStudentFeedbackOpen(false);
    setStudentFeedbackComment('');
  };

  return (
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMsg && (
        <Toast message={toastMsg} type="success" onClose={() => setToastMsg(null)} />
      )}

      {/* Screen Title & Role Subtitle */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Student Volunteer
          </span>
          <span className="text-[11px] font-semibold text-slate-400">Volunteer & Member Suite</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Club Operations Hub</h1>
      </div>

      {/* Shortcuts (row of 4): My Pass, My Duties, Feedback, Community */}
      <div
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          maxWidth: '480px',
          gap: '8px',
        }}
      >
        <ShortcutTile
          label="My Pass"
          icon={<QrCode size={20} />}
          iconBg="#F3EEFF"
          iconBorder="#DDD1FF"
          iconColor="#7C3AED"
          onClick={() => setIsStudentPassOpen(true)}
        />

        <ShortcutTile
          label="My Duties"
          icon={<ListTodo size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          iconColor="#2563EB"
          badge={tasks.filter((t) => t.status !== 'done').length || undefined}
          onClick={() => setIsStudentDutiesOpen(true)}
        />

        <ShortcutTile
          label="Feedback"
          icon={<Star size={20} />}
          iconBg="#FFF8E6"
          iconBorder="#FDE68A"
          iconColor="#D97706"
          onClick={() => setIsStudentFeedbackOpen(true)}
        />

        <ShortcutTile
          label="Community"
          icon={<MessageSquare size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          iconColor="#059669"
          onClick={() => setActiveTab('forum')}
        />
      </div>

      {/* Category 1: Gate & Pass (2 modules) */}
      <CategoryCard title="Gate & Pass" countBadge={2}>
        <ModuleTile
          title="My Pass"
          icon={<QrCode size={20} />}
          iconBg="#F3EEFF"
          iconBorder="#DDD1FF"
          accentColor="#7C3AED"
          onClick={() => setIsStudentPassOpen(true)}
        />

        <ModuleTile
          title="Gate Scanner"
          icon={<Scan size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          accentColor="#2563EB"
          onClick={() => {
            const hasAttendanceDuty = tasks.some(
              (t) =>
                t.assigneeId === currentUser.uid &&
                (t.title.toLowerCase().includes('gate') ||
                  t.title.toLowerCase().includes('scanner') ||
                  t.title.toLowerCase().includes('attendance'))
            );
            if (hasAttendanceDuty) {
              setActiveTab('scan_qr');
            } else {
              setIsGateScannerDutyWarningOpen(true);
            }
          }}
        />
      </CategoryCard>

      {/* Category 2: Events & Duties (2 modules) */}
      <CategoryCard title="Events & Duties" countBadge={2}>
        <ModuleTile
          title="My Duties"
          icon={<ListTodo size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          accentColor="#2563EB"
          onClick={() => setIsStudentDutiesOpen(true)}
        />

        <ModuleTile
          title="Registration History"
          icon={<FileCheck size={20} />}
          iconBg="#E8FBF8"
          iconBorder="#99F6E4"
          accentColor="#0D9488"
          onClick={() => setIsStudentRegHistoryOpen(true)}
        />
      </CategoryCard>

      {/* Category 3: Community & Media (2 modules) */}
      <CategoryCard title="Community & Media" countBadge={2}>
        <ModuleTile
          title="Forum (Discussions)"
          icon={<MessageSquare size={20} />}
          iconBg="#F5F3FF"
          iconBorder="#DDD6FE"
          accentColor="#7C3AED"
          onClick={() => setActiveTab('forum')}
        />

        <ModuleTile
          title="Event Memories"
          icon={<Images size={20} />}
          iconBg="#FDF2F8"
          iconBorder="#FBCFE8"
          accentColor="#DB2777"
          onClick={() => setActiveTab('gallery')}
        />
      </CategoryCard>

      {/* Category 4: Feedback (1 module) */}
      <CategoryCard title="Feedback" countBadge={1}>
        <ModuleTile
          title="Event Feedback"
          icon={<Sparkles size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          accentColor="#059669"
          onClick={() => setIsStudentFeedbackOpen(true)}
        />
      </CategoryCard>

      {/* =========================================================================
          MODALS FOR STUDENT VOLUNTEER
          ========================================================================= */}

      {/* Digital Student Pass Modal */}
      <BottomSheet
        isOpen={isStudentPassOpen}
        onClose={() => setIsStudentPassOpen(false)}
        title="Digital Student Pass"
        subtitle="Turnstile gate barcode with live 30-second rotating security token"
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col items-center gap-2 max-w-xs w-full">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
              GeoHub Student Pass
            </span>
            <div className="w-40 h-40 bg-white p-2.5 rounded-2xl flex items-center justify-center">
              <QrCode size={130} className="text-slate-900" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              {currentUser.email.split('@')[0].toUpperCase()}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Token refreshes in 24s</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsStudentPassOpen(false);
              setActiveTab('my_qr');
            }}
            className="w-full max-w-xs py-2.5 rounded-full font-bold text-xs bg-purple-700 text-white hover:bg-purple-800 transition-all cursor-pointer"
          >
            Open Full Screen Pass View
          </button>
        </div>
      </BottomSheet>

      {/* My Volunteer Duties Modal */}
      <BottomSheet
        isOpen={isStudentDutiesOpen}
        onClose={() => setIsStudentDutiesOpen(false)}
        title="My Volunteer Duties"
        subtitle="Chapter tasks, gate responsibilities and volunteer duty roster"
      >
        <div className="flex flex-col gap-3 py-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <span className="font-extrabold text-xs text-slate-900 block truncate">
                  {task.title}
                </span>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                  Due: {task.dueDate || 'Today'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextStatus = task.status === 'done' ? 'todo' : 'done';
                  updateTaskStatus(task.id, nextStatus as any);
                  showToast(
                    nextStatus === 'done'
                      ? `✓ Marked duty as Completed!`
                      : `Reopened duty as Incomplete`
                  );
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                  task.status === 'done'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                {task.status === 'done' ? '✓ Completed' : 'Mark Done'}
              </button>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* Registration & Event Ledger Modal */}
      <BottomSheet
        isOpen={isStudentRegHistoryOpen}
        onClose={() => setIsStudentRegHistoryOpen(false)}
        title="Registration & Event Ledger"
        subtitle="Record of registered sessions, attended workshops and digital certificates"
      >
        <div className="flex flex-col gap-3 py-1">
          {events.slice(0, 3).map((ev) => (
            <div
              key={ev.id}
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="font-extrabold text-xs text-slate-900 block truncate">
                  {ev.title}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {ev.venue} • {new Date(ev.startDate).toLocaleDateString()}
                </span>
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                Confirmed ✓
              </span>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* Share Event Feedback Modal */}
      <BottomSheet
        isOpen={isStudentFeedbackOpen}
        onClose={() => setIsStudentFeedbackOpen(false)}
        title="Share Event Feedback"
        subtitle="Rate completed workshops and suggest improvements for the chapter"
      >
        <form onSubmit={handleStudentFeedbackSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Event</label>
            <select
              value={studentFeedbackEventId}
              onChange={(e) => setStudentFeedbackEventId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Category</label>
            <select
              value={studentFeedbackCategory}
              onChange={(e) => setStudentFeedbackCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
            >
              <option value="Workshop Quality">Workshop Quality</option>
              <option value="Venue & Logistics">Venue & Logistics</option>
              <option value="Gate QR Entry Speed">Gate QR Entry Speed</option>
              <option value="Speaker Delivery">Speaker Delivery</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStudentFeedbackRating(star)}
                  className={`p-2 rounded-xl cursor-pointer transition-colors ${
                    studentFeedbackRating >= star
                      ? 'text-amber-500 bg-amber-50'
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                >
                  <Star size={20} fill={studentFeedbackRating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Review / Ideas</label>
            <textarea
              rows={3}
              required
              value={studentFeedbackComment}
              onChange={(e) => setStudentFeedbackComment(e.target.value)}
              placeholder="What went great, and what can we improve?"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-all mt-1 cursor-pointer"
          >
            Submit Verified Review
          </button>
        </form>
      </BottomSheet>

      {/* Gate Scanner Duty Warning Modal */}
      <BottomSheet
        isOpen={isGateScannerDutyWarningOpen}
        onClose={() => setIsGateScannerDutyWarningOpen(false)}
        title="Restricted Duty Scanner"
        subtitle="Gate barcode scanner is reserved for assigned duty staff"
      >
        <div className="flex flex-col gap-3 py-2 text-center items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
            You do not currently have an active Gate Terminal duty assigned in your roster. Please check with your Squad Lead or view your assigned tasks in My Duties.
          </p>
          <button
            type="button"
            onClick={() => setIsGateScannerDutyWarningOpen(false)}
            className="w-full max-w-xs py-2.5 rounded-full font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            Understood
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
