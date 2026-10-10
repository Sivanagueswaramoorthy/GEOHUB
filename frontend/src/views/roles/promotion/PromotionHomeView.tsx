import React, { useState } from 'react';
import {
  Megaphone,
  Clock,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatTile } from '../../../components/StatTile';
import { SectionCard } from '../../../components/SectionCard';
import { Overline } from '../../../components/Overline';
import { WeekStrip } from '../../../components/WeekStrip';
import { BottomSheet } from '../../../components/BottomSheet';
import { CampaignPlan } from '../../../types';

export const PromotionHomeView: React.FC<{ showToast: (msg: string) => void }> = ({ showToast }) => {
  const { posts, campaigns, setActiveTab } = useApp();
  const [selectedPromoDate, setSelectedPromoDate] = useState('2026-10-08');
  const [activePromoChecklistCampaign, setActivePromoChecklistCampaign] = useState<CampaignPlan | null>(null);

  return (
    <>
      {/* 1) Four StatTiles for Promotion Lead */}
      <div className="stat-tiles-grid">
        <StatTile
          label="Events to Promote"
          value={String(campaigns.filter((c) => c.status !== 'completed').length || 4)}
          footnote="2 launches pending"
          tint="mint"
          icon={<Megaphone size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('campaigns')}
        />

        <StatTile
          label="Scheduled Posts"
          value={String(posts.filter((p) => p.status === 'Scheduled').length)}
          footnote="Across 4 channels"
          tint="lavender"
          icon={<Clock size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('campaigns')}
        />

        <StatTile
          label="Published This Month"
          value={String(posts.filter((p) => p.status === 'Posted').length)}
          footnote="+42% reach growth"
          tint="teal"
          icon={<Send size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('campaigns')}
        />

        <StatTile
          label="Drafts"
          value={String(posts.filter((p) => p.status === 'Draft').length)}
          footnote="Review & publish"
          tint="amber"
          icon={<Sparkles size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('campaigns')}
        />
      </div>

      {/* 2) Content calendar card with a week strip */}
      <SectionCard>
        <div className="flex items-center justify-between mb-3">
          <div>
            <Overline>CAMPAIGN CADENCE</Overline>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Content Calendar</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => showToast('Displaying previous week')}
              className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            <span className="text-xs font-bold text-slate-700">Oct 2026</span>
            <button
              type="button"
              onClick={() => showToast('Displaying next week')}
              className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedPromoDate('2026-10-08')}
              className="ml-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg hover:bg-purple-100 cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>

        {/* WeekStrip with dots */}
        <WeekStrip
          days={[
            { dateStr: '2026-10-05', dayName: 'Mon', dayNum: 5, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-05') },
            { dateStr: '2026-10-06', dayName: 'Tue', dayNum: 6, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-06') },
            { dateStr: '2026-10-07', dayName: 'Wed', dayNum: 7, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-07') },
            { dateStr: '2026-10-08', dayName: 'Thu', dayNum: 8, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-08') },
            { dateStr: '2026-10-09', dayName: 'Fri', dayNum: 9, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-09') },
            { dateStr: '2026-10-10', dayName: 'Sat', dayNum: 10, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-10') },
            { dateStr: '2026-10-11', dayName: 'Sun', dayNum: 11, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-11') },
          ]}
          selectedDate={selectedPromoDate}
          onSelectDate={(dt) => setSelectedPromoDate(dt)}
        />

        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
          <span>Purple dots indicate days with scheduled social media broadcasts</span>
        </div>

        {/* Posts scheduled on selected date */}
        <div className="mt-3 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Posts on {new Date(selectedPromoDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          {posts.filter((p) => p.scheduledDate === selectedPromoDate).length > 0 ? (
            posts
              .filter((p) => p.scheduledDate === selectedPromoDate)
              .map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex items-start justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                        post.platform === 'Instagram'
                          ? 'bg-pink-100 text-pink-700'
                          : post.platform === 'LinkedIn'
                          ? 'bg-blue-100 text-blue-700'
                          : post.platform === 'WhatsApp'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {post.platform}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        {post.scheduledTime || '11:00 AM'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                      {post.caption}
                    </p>
                  </div>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 shrink-0">
                    {post.status}
                  </span>
                </div>
              ))
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-xs text-slate-500">No posts scheduled for this day.</p>
              <button
                type="button"
                onClick={() => setActiveTab('campaigns')}
                className="mt-1 text-xs font-bold text-purple-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>+ Schedule New Post</span>
              </button>
            </div>
          )}
        </div>
      </SectionCard>

      {/* 3) "Needs promotion" card: upcoming events with a checklist ring */}
      <SectionCard>
        <div className="flex items-center justify-between mb-3">
          <div>
            <Overline>CAMPAIGN PIPELINE</Overline>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Needs Promotion</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Tap to manage tasks</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {campaigns.map((camp) => {
            const totalTasks = 5;
            const completedTasks = Object.values(camp.checklist).filter(Boolean).length;
            const pct = Math.round((completedTasks / totalTasks) * 100);

            return (
              <div
                key={camp.id}
                onClick={() => setActivePromoChecklistCampaign(camp)}
                className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {camp.eventTitle}
                    </span>
                    <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      completedTasks === 5
                        ? 'bg-emerald-100 text-emerald-800'
                        : completedTasks >= 3
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {completedTasks}/5 Done
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mb-1">
                    {camp.title} • {camp.targetAudience}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Poster: {camp.checklist.poster ? '✓' : '✗'}</span> •
                    <span>Teaser: {camp.checklist.teaser ? '✓' : '✗'}</span> •
                    <span>Reg Link: {camp.checklist.regLink ? '✓' : '✗'}</span> •
                    <span>Reel: {camp.checklist.reel ? '✓' : '✗'}</span> •
                    <span>Highlight: {camp.checklist.postEvent ? '✓' : '✗'}</span>
                  </div>
                </div>

                {/* Circular Completion Ring */}
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#F1F5F9"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={completedTasks === 5 ? '#059669' : '#7C3AED'}
                      strokeWidth="3.5"
                      strokeDasharray={`${pct}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-extrabold text-slate-800">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* 4) AI suggestion shortcut card */}
      <div className="p-4 rounded-3xl bg-linear-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-purple-200 text-[11px] font-extrabold tracking-wide uppercase">
              <Sparkles size={16} strokeWidth={1.75} className="text-amber-300" />
              <span>AI Studio Suggestion</span>
            </span>
            <span className="text-[11px] text-purple-300 font-medium">1-Click Content</span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Draft posts for GEO FEST
            </h4>
            <p className="text-xs text-purple-200/90 leading-relaxed mt-0.5">
              Multi-platform captions, registration hooks & trending geo-hashtags ready for review.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('campaigns')}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles size={16} strokeWidth={1.75} className="text-amber-300" />
              <span>Open AI Social Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5) Recent Posts Strip */}
      <SectionCard>
        <div className="flex items-center justify-between mb-3">
          <div>
            <Overline>PUBLISHING LOG</Overline>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Recent Posts</h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
          >
            View All ({posts.length})
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {posts.slice(0, 4).map((post) => (
            <div
              key={post.id}
              className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                    post.platform === 'Instagram'
                      ? 'bg-pink-100 text-pink-700'
                      : post.platform === 'LinkedIn'
                      ? 'bg-blue-100 text-blue-700'
                      : post.platform === 'WhatsApp'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {post.platform}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {post.status === 'Posted'
                      ? `Published ${post.publishedDate || 'Oct 2'}`
                      : post.status === 'Scheduled'
                      ? `Drop on ${post.scheduledDate} • ${post.scheduledTime || '11:00'}`
                      : 'Draft Mode'}
                  </span>
                </div>

                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                  post.status === 'Posted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : post.status === 'Scheduled'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {post.status}
                </span>
              </div>

              <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                {post.caption}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                <span>By {post.authorName || 'Promotion Squad'}</span>
                {post.postUrl && (
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-purple-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Live</span>
                    <ExternalLink size={16} strokeWidth={1.75} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Promotion Checklist Modal */}
      {activePromoChecklistCampaign && (
        <BottomSheet
          isOpen={Boolean(activePromoChecklistCampaign)}
          onClose={() => setActivePromoChecklistCampaign(null)}
          title={`Promotion Checklist: ${activePromoChecklistCampaign.eventTitle}`}
          subtitle="Manage deliverables for this campaign launch"
        >
          <div className="flex flex-col gap-3 py-1">
            {[
              { key: 'poster', label: 'Event Poster Designed & Approved' },
              { key: 'teaser', label: 'Teaser Video / Motion Graphic Published' },
              { key: 'regLink', label: 'Registration Link Live on Bio & Channels' },
              { key: 'reel', label: 'Speaker Reel / Highlights Released' },
              { key: 'postEvent', label: 'Post-Event Recap & Press Dossier' },
            ].map(({ key, label }) => {
              const checked = (activePromoChecklistCampaign.checklist as any)[key];
              return (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-slate-800">{label}</span>
                  <span className={`text-xs font-bold ${checked ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {checked ? '✓ Done' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </BottomSheet>
      )}
    </>
  );
};
