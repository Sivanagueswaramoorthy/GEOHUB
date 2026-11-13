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
import { ScholarRecord } from './MemberDirectoryScreen';

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
  const { users } = useApp();
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
          squad: leadMembership ? leadMembership.squad : u.team || 'Management',
          isLead: true,
          post: u.post || u.teamRole || 'Squad Lead',
          email: u.email,
          rollNo: u.rollNo,
        };
      });
  }, [users]);

  const [leads, setLeads] = useState<ScholarRecord[]>(initialLeads);

  const canEdit = !readOnly && canAssignSquadLead(currentUser);

  const handleAppointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointName.trim()) return;

    const newLead: ScholarRecord = {
      uid: `u-lead-${Date.now()}`,
      name: appointName.trim(),
      role: 'management',
      squad: appointSquad,
      isLead: true,
      post: appointPost,
      email: `${appointName.toLowerCase().replace(/\s+/g, '.')}@geohub.edu`,
      rollNo: appointRoll,
    };

    setLeads((prev) => [newLead, ...prev]);
    onLogAudit('Squad Leads', `Appointed ${newLead.name} as ${newLead.post} for ${newLead.squad} Squad`);

    setShowAppointModal(false);
    setAppointName('');
    setNotice(`Appointed ${newLead.name} as ${newLead.post}.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    const updated: ScholarRecord = {
      ...editingLead,
      post: editPost.trim() || editingLead.post,
      squad: editSquad,
    };

    setLeads((prev) => prev.map((l) => (l.uid === editingLead.uid ? updated : l)));
    onLogAudit('Squad Leads', `Updated squad lead: ${updated.name} (${updated.post})`);

    setEditingLead(null);
    setNotice(`Updated Squad Lead record for ${updated.name}.`);
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
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#051F20] text-xs sm:text-sm truncate">
                        {lead.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B] shrink-0">
                        {lead.squad}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#235347] truncate">
                      <span className="font-semibold text-[#163832] truncate">{lead.post}</span>
                      <span>•</span>
                      <span className="font-mono text-[#051F20]">{lead.rollNo}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-xs">
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
                <input
                  type="text"
                  required
                  value={editPost}
                  onChange={(e) => setEditPost(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Assigned Squad
                </label>
                <select
                  value={editSquad}
                  onChange={(e) => setEditSquad(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                >
                  <option value="Management">Management</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Treasury">Treasury</option>
                  <option value="Documentation">Documentation</option>
                </select>
              </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-xs">
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
                  Scholar Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Patel"
                  value={appointName}
                  onChange={(e) => setAppointName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#051F20] mb-1">
                    Squad
                  </label>
                  <select
                    value={appointSquad}
                    onChange={(e) => setAppointSquad(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                  >
                    <option value="Promotion">Promotion</option>
                    <option value="Management">Management</option>
                    <option value="Treasury">Treasury</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#051F20] mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={appointRoll}
                    onChange={(e) => setAppointRoll(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Designation / Appointment Title
                </label>
                <input
                  type="text"
                  required
                  value={appointPost}
                  onChange={(e) => setAppointPost(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

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

