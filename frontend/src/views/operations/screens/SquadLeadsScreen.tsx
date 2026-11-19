import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Award,
  Calendar,
} from 'lucide-react';
import { AnimatedNumber, ConfirmDialog, EmptyState } from '../../../components/shared';
import { canAssignSquadLead } from '../../../core/permissions';
import { useApp } from '../../../context/AppContext';
import { ScholarRecord, OFFICIAL_POSTS, matchPostOption } from './MemberDirectoryScreen';
import { apiClient } from '../../../api/client';

export interface SquadLeadsScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const SquadLeadsScreen: React.FC<SquadLeadsScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const { users, setUsers, showToast } = useApp();
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [editingLead, setEditingLead] = useState<ScholarRecord | null>(null);
  const [stepDownTarget, setStepDownTarget] = useState<ScholarRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Form states for Appoint
  const [appointName, setAppointName] = useState('');
  const [appointSquad, setAppointSquad] = useState('Promotion');
  const [appointPost, setAppointPost] = useState('Promotion Lead');
  const [appointRoll, setAppointRoll] = useState('');

  // Form states for Edit
  const [editPost, setEditPost] = useState('');
  const [editSquad, setEditSquad] = useState('Promotion');

  const initialLeads: ScholarRecord[] = React.useMemo(() => {
    return (users || [])
      .filter(
        (u) =>
          u.squadMemberships?.some((m) => m.isLead) ||
          (u.post && u.post.toLowerCase().includes('lead'))
      )
      .map((u) => {
        const leadMembership = u.squadMemberships?.find((m) => m.isLead);
        return {
          uid: u.uid,
          name: u.name,
          role: u.role,
          squad: leadMembership ? leadMembership.squad : u.team || 'General',
          isLead: true,
          post: u.post || u.teamRole || 'Squad Lead',
          email: u.email,
          rollNo: u.rollNo,
        };
      });
  }, [users]);

  const [leads, setLeads] = useState<ScholarRecord[]>(initialLeads);

  const canEdit = !readOnly && canAssignSquadLead(currentUser);

  const handleAppointSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointName.trim()) return;

    const matched = OFFICIAL_POSTS.find((p) => p.post === appointPost) || matchPostOption(appointPost);
    const targetRole = matched.role;

    const newLead: ScholarRecord = {
      uid: `u-lead-${Date.now()}`,
      name: appointName.trim(),
      role: targetRole,
      squad: appointSquad,
      isLead: true,
      post: appointPost,
      email: `${appointName.toLowerCase().replace(/\s+/g, '.')}@geohub.edu`,
      rollNo: appointRoll,
    };

    setLeads((prev) => [newLead, ...prev]);
    setUsers((prev) =>
      prev.map((u) =>
        (appointRoll && u.rollNo === appointRoll) || u.name === appointName
          ? { ...u, post: appointPost, team: appointSquad, role: targetRole as any }
          : u
      )
    );
    onLogAudit('Squad Leads', `Appointed ${newLead.name} as ${newLead.post} for ${newLead.squad} Squad`);

    try {
      if (appointRoll) {
        await apiClient.setUserRole(appointRoll, targetRole, appointPost, appointSquad);
      }
    } catch {}

    setShowAppointModal(false);
    setAppointName('');
    setAppointRoll('');
    setNotice(`Appointed ${newLead.name} as ${newLead.post}.`);
    if (showToast) {
      showToast(`✓ Appointed ${newLead.name} as ${newLead.post}! UI Role: ${matched.uiTitle}`);
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    const matched = OFFICIAL_POSTS.find((p) => p.post === editPost) || matchPostOption(editPost);
    const targetRole = matched.role;

    const updated: ScholarRecord = {
      ...editingLead,
      post: editPost.trim() || editingLead.post,
      role: targetRole,
      squad: editSquad,
    };

    setLeads((prev) => prev.map((l) => (l.uid === editingLead.uid ? updated : l)));
    setUsers((prev) =>
      prev.map((u) =>
        u.uid === editingLead.uid
          ? { ...u, post: updated.post, team: updated.squad, role: targetRole as any }
          : u
      )
    );
    onLogAudit('Squad Leads', `Updated squad lead: ${updated.name} (${updated.post})`);

    try {
      const targetId = editingLead.rollNo || editingLead.uid;
      await apiClient.setUserRole(targetId, targetRole, updated.post, updated.squad);
    } catch {}

    setEditingLead(null);
    setNotice(`Updated Squad Lead record for ${updated.name}.`);
    if (showToast) {
      showToast(`✓ Updated ${updated.name} to ${updated.post}! UI Role: ${matched.uiTitle}`);
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleConfirmStepDown = () => {
    if (!stepDownTarget) return;

    setLeads((prev) => prev.filter((l) => l.uid !== stepDownTarget.uid));
    onLogAudit('Squad Leads', `Stepped down squad lead ${stepDownTarget.name} from ${stepDownTarget.squad} Squad`);

    setNotice(`Stepped down ${stepDownTarget.name} back to squad member.`);
    setStepDownTarget(null);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Leads</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <UserCheck size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={leads.length} /> Officers
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Tenure</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Award size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-sm sm:text-base mt-1">
            AY 2025-2026
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Standing</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Shield size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-sm sm:text-base mt-1">
            Ratified
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#163832] uppercase tracking-wide">Appointment</span>
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAppointModal(true)}
              className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
              data-testid="btn-appoint-lead"
            >
              <Plus size={14} />
              <span>Appoint Lead</span>
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Leads Cards List */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Appointed Squad Leadership Council
          </h2>
          <span className="text-xs font-semibold text-[#235347]">
            Active Term
          </span>
        </div>

        {leads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {leads.map((lead) => (
              <div
                key={lead.uid}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#DAF1DE] text-[#163832] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#8EB69B]/40">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {lead.rollNo && (
                        <span className="px-1.5 py-0.5 rounded font-mono font-bold text-xs bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]/40">
                          {lead.rollNo}
                        </span>
                      )}
                      <span className="font-bold text-[#051F20] text-xs sm:text-sm truncate">
                        {lead.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B] shrink-0">
                        {lead.squad}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#235347] truncate">
                      <span className="font-semibold text-[#163832] truncate">{lead.post}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {canEdit && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLead(lead);
                        setEditPost(lead.post);
                        setEditSquad(lead.squad);
                      }}
                      className="w-8 h-8 rounded-xl bg-white border border-[#DAF1DE] text-[#163832] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer shadow-2xs"
                      title="Edit Designation"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStepDownTarget(lead)}
                      className="w-8 h-8 rounded-xl bg-white border border-[#D9534F] text-[#D9534F] hover:bg-[#D9534F]/10 flex items-center justify-center cursor-pointer shadow-2xs"
                      title="Step Down Lead"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            mascot="shield"
            title="No Appointed Squad Leads"
            description="No scholars are currently designated as squad leadership council officers."
          />
        )}
      </div>

      {/* Step Down Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(stepDownTarget)}
        onClose={() => setStepDownTarget(null)}
        onConfirm={handleConfirmStepDown}
        title="Step Down Squad Lead"
        message={`Step down ${stepDownTarget?.name} from ${stepDownTarget?.squad} Squad Lead? The scholar will remain an active squad member.`}
      />

      {/* Edit Lead Modal */}
      {editingLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#051F20] text-base">
                Edit Squad Lead: {editingLead.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Designation / Post
                </label>
                <select
                  value={editPost}
                  onChange={(e) => {
                    setEditPost(e.target.value);
                    const matched = OFFICIAL_POSTS.find((p) => p.post === e.target.value);
                    if (matched) {
                      setEditSquad(matched.squad);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none"
                >
                  {OFFICIAL_POSTS.map((opt) => (
                    <option key={opt.post} value={opt.post}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Assigned Squad
                </label>
                <select
                  value={editSquad}
                  onChange={(e) => setEditSquad(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none"
                >
                  <option value="General">General</option>
                  <option value="Management">Management</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Treasury">Treasury</option>
                  <option value="Documentation">Documentation</option>
                </select>
              </div>

              {/* Dynamic Role UI Interface Preview */}
              {(() => {
                const opt = OFFICIAL_POSTS.find((p) => p.post === editPost) || matchPostOption(editPost);
                return (
                  <div className="p-3 rounded-2xl bg-[#DAF1DE]/60 border border-[#8EB69B]/40 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#8EB69B]/50 flex items-center justify-center text-[#163832] shrink-0">
                        <Shield size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-[#051F20] block truncate">
                          {opt.uiTitle}
                        </span>
                        <span className="text-xs font-medium text-[#235347] block truncate">
                          Assigned Clearance: <strong className="font-bold uppercase">{opt.role}</strong> • Squad: {editSquad}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#163832] text-white text-xs font-black uppercase tracking-wider shrink-0">
                      {opt.role}
                    </span>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appoint Modal */}
      {showAppointModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#051F20] text-base">
                Appoint New Squad Lead
              </h3>
              <button
                type="button"
                onClick={() => setShowAppointModal(false)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAppointSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Select Scholar by Roll Number *
                </label>
                <select
                  required
                  value={appointRoll}
                  onChange={(e) => {
                    const roll = e.target.value;
                    setAppointRoll(roll);
                    const found = (users || []).find((u) => u.rollNo === roll || u.email?.startsWith(roll.toLowerCase()));
                    if (found) {
                      setAppointName(found.name);
                      if (found.team) {
                        setAppointSquad(found.team);
                        setAppointPost(`${found.team} Lead`);
                      }
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none"
                >
                  <option value="">Choose Roll Number...</option>
                  {(users || [])
                    .filter((u) => u.rollNo)
                    .map((u) => (
                      <option key={u.uid} value={u.rollNo}>
                        {u.rollNo} — {u.name} ({u.team || 'Member'})
                      </option>
                    ))}
                </select>
                {appointName && (
                  <div className="mt-1.5 p-2 rounded-lg bg-[#DAF1DE]/60 border border-[#8EB69B]/50 flex items-center justify-between text-xs">
                    <span className="text-[#235347]">Verified Scholar:</span>
                    <strong className="text-[#051F20] font-bold">{appointName} ({appointRoll})</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Designation / Appointment Title
                </label>
                <select
                  value={appointPost}
                  onChange={(e) => {
                    setAppointPost(e.target.value);
                    const matched = OFFICIAL_POSTS.find((p) => p.post === e.target.value);
                    if (matched) {
                      setAppointSquad(matched.squad);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none"
                >
                  {OFFICIAL_POSTS.map((opt) => (
                    <option key={opt.post} value={opt.post}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Squad
                </label>
                <select
                  value={appointSquad}
                  onChange={(e) => setAppointSquad(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none"
                >
                  <option value="General">General</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Management">Management</option>
                  <option value="Treasury">Treasury</option>
                  <option value="Documentation">Documentation</option>
                </select>
              </div>

              {/* Dynamic Role UI Interface Preview */}
              {(() => {
                const opt = OFFICIAL_POSTS.find((p) => p.post === appointPost) || matchPostOption(appointPost);
                return (
                  <div className="p-3 rounded-2xl bg-[#DAF1DE]/60 border border-[#8EB69B]/40 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#8EB69B]/50 flex items-center justify-center text-[#163832] shrink-0">
                        <Shield size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-[#051F20] block truncate">
                          {opt.uiTitle}
                        </span>
                        <span className="text-xs font-medium text-[#235347] block truncate">
                          Clearance: <strong className="font-bold uppercase">{opt.role}</strong> • Squad: {appointSquad}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#163832] text-white text-xs font-black uppercase tracking-wider shrink-0">
                      {opt.role}
                    </span>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppointModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadLeadsScreen;

