import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  CheckCircle2,
  Mail,
  Award,
} from 'lucide-react';
import { AnimatedNumber, ConfirmDialog, SearchField, EmptyState } from '../../../components/shared';
import { canAddSquadMember, canRemoveMember } from '../../../core/permissions';
import { useApp } from '../../../context/AppContext';
import { apiClient } from '../../../api/client';

export interface ScholarRecord {
  uid: string;
  name: string;
  role: string;
  squad: string;
  isLead: boolean;
  post: string;
  email: string;
  rollNo?: string;
}

export interface MemberDirectoryScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const MemberDirectoryScreen: React.FC<MemberDirectoryScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const [selectedSquad, setSelectedSquad] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberToEdit, setSelectedMemberToEdit] = useState<ScholarRecord | null>(null);
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<ScholarRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Form states for Add
  const [newRollNo, setNewRollNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newSquad, setNewSquad] = useState('Promotion');
  const [newRole, setNewRole] = useState('student');

  // Form states for Edit
  const [editName, setEditName] = useState('');
  const [editPost, setEditPost] = useState('');
  const [editSquad, setEditSquad] = useState('Promotion');

  const { users, setUsers, enrollScholar, showToast } = useApp();
  const [members, setMembers] = useState<ScholarRecord[]>(() => {
    return (users || []).map((u) => ({
      uid: u.uid,
      name: u.name,
      role: u.role,
      squad: u.team || 'Management',
      isLead: Boolean(u.squadMemberships?.some((s) => s.isLead) || u.post?.includes('Lead') || u.post?.includes('Advisor')),
      post: u.post || 'Chapter Member',
      email: u.email,
      rollNo: u.rollNo || u.uid,
    }));
  });

  useEffect(() => {
    setMembers((users || []).map((u) => ({
      uid: u.uid,
      name: u.name,
      role: u.role,
      squad: u.team || 'Management',
      isLead: Boolean(u.squadMemberships?.some((s) => s.isLead) || u.post?.includes('Lead') || u.post?.includes('Advisor')),
      post: u.post || 'Chapter Member',
      email: u.email,
      rollNo: u.rollNo || u.uid,
    })));
  }, [users]);

  const canRemove = canRemoveMember(currentUser);
  const canAdd = canAddSquadMember(currentUser, selectedSquad === 'All' ? 'Promotion' : selectedSquad);

  const squads = ['All', 'Management', 'Promotion', 'Treasury', 'Documentation'];

  const filteredMembers = members.filter((m) => {
    if (selectedSquad !== 'All' && m.squad.toLowerCase() !== selectedSquad.toLowerCase()) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.rollNo || '').toLowerCase().includes(q) ||
      m.post.toLowerCase().includes(q) ||
      m.squad.toLowerCase().includes(q)
    );
  });

  const handleOpenEdit = (m: ScholarRecord) => {
    setSelectedMemberToEdit(m);
    setEditName(m.name);
    setEditPost(m.post);
    setEditSquad(m.squad);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberToEdit) return;

    const updated: ScholarRecord = {
      ...selectedMemberToEdit,
      name: editName.trim() || selectedMemberToEdit.name,
      post: editPost.trim() || selectedMemberToEdit.post,
      squad: editSquad,
    };

    setUsers((prev) =>
      prev.map((u) =>
        u.uid === selectedMemberToEdit.uid
          ? { ...u, name: updated.name, post: updated.post, team: updated.squad }
          : u
      )
    );
    setMembers((prev) => prev.map((m) => (m.uid === selectedMemberToEdit.uid ? updated : m)));
    onLogAudit('Member Directory', `Updated scholar profile for ${updated.name} (${updated.squad})`);

    setSelectedMemberToEdit(null);
    setNotice(`Updated record for ${updated.name}.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleConfirmRemove = () => {
    if (!selectedMemberToRemove) return;
    setUsers((prev) => prev.filter((u) => u.uid !== selectedMemberToRemove.uid));
    setMembers((prev) => prev.filter((m) => m.uid !== selectedMemberToRemove.uid));
    onLogAudit('Member Directory', `Removed member ${selectedMemberToRemove.name} (${selectedMemberToRemove.squad})`);
    setNotice(`Removed ${selectedMemberToRemove.name} from directory.`);
    setSelectedMemberToRemove(null);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRollNo.trim() || !newName.trim()) return;

    const cleanRoll = newRollNo.trim().toUpperCase();
    const cleanName = newName.trim();

    const enrolled = enrollScholar({
      name: cleanName,
      rollNo: cleanRoll,
      role: newRole as any,
      squad: newSquad,
      post: `${newSquad} Associate`,
    });

    onLogAudit('Member Directory', `Enrolled new scholar: ${enrolled.name} (${cleanRoll}) in ${enrolled.team}`);

    setShowAddModal(false);
    setNewRollNo('');
    setNewName('');
    setNotice(`Enrolled ${enrolled.name} (${cleanRoll}). Login: ${cleanRoll} | Password: geohub`);
    if (showToast) {
      showToast(`✓ Student ${enrolled.name} (${cleanRoll}) enrolled! Login: ${cleanRoll} | Password: geohub`);
    }
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Scholars</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Users size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={members.length} />
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Leads</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <UserCheck size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-base sm:text-lg mt-1">
            <AnimatedNumber value={members.filter((m) => m.isLead).length} />
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Squads</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Shield size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            4 Active
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#163832] uppercase tracking-wide">Enrollment</span>
          {canAdd && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
              data-testid="btn-add-member"
            >
              <Plus size={14} />
              <span>Enroll Scholar</span>
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

      {/* 2. Directory Content Card */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-[#051F20] text-base sm:text-lg">
            Official Scholar & Member Directory
          </h2>

          <div className="w-full sm:w-72">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, roll no..."
              style={{ height: '40px' }}
            />
          </div>
        </div>

        {/* Squad Filter Chips */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {squads.map((sq) => (
            <button
              key={sq}
              type="button"
              onClick={() => setSelectedSquad(sq)}
              className={`h-7 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedSquad === sq
                  ? 'bg-[#163832] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
              }`}
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Members Cards List (Grid on desktop, clean rows on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((m) => (
              <div
                key={m.uid}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] text-[#163832] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#8EB69B]/40">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#051F20] text-xs sm:text-sm truncate">
                        {m.name}
                      </span>
                      {m.isLead && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B] shrink-0">
                          Lead
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#235347] truncate">
                      <span className="font-semibold text-[#163832] truncate">{m.post}</span>
                      <span>•</span>
                      <span className="font-mono text-[#051F20]">{m.rollNo || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(m)}
                      className="w-8 h-8 rounded-xl bg-white border border-[#DAF1DE] text-[#163832] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer shadow-2xs"
                      data-testid={`btn-edit-member-${m.uid}`}
                      title="Edit Scholar"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}

                  {canRemove && m.role !== 'faculty' && m.role !== 'coordinator' && (
                    <button
                      type="button"
                      onClick={() => setSelectedMemberToRemove(m)}
                      className="w-8 h-8 rounded-xl bg-white border border-[#D9534F] text-[#D9534F] hover:bg-[#D9534F]/10 flex items-center justify-center cursor-pointer shadow-2xs"
                      data-testid={`btn-remove-member-${m.uid}`}
                      title="Remove Scholar"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState
                mascot="leaf"
                title="No Members Found"
                description={searchQuery ? `No scholars match "${searchQuery}".` : 'No scholars are enrolled in the selected squad.'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedMemberToRemove)}
        onClose={() => setSelectedMemberToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Scholar from Directory"
        message={`Are you sure you want to remove ${selectedMemberToRemove?.name} (${selectedMemberToRemove?.squad} Squad)? This action immediately revokes chapter credentials.`}
      />

      {/* Edit Scholar Modal */}
      {selectedMemberToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#051F20] text-base">
                Edit Scholar Profile: {selectedMemberToEdit.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMemberToEdit(null)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Official Post / Designation
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
                  onClick={() => setSelectedMemberToEdit(null)}
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

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#051F20] text-base">
                Enroll New Scholar
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24GEO002"
                  value={newRollNo}
                  onChange={(e) => setNewRollNo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Scholar Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Varun Verma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Assign to Squad
                </label>
                <select
                  value={newSquad}
                  onChange={(e) => setNewSquad(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                >
                  <option value="Promotion">Promotion Squad</option>
                  <option value="Management">Management Squad</option>
                  <option value="Treasury">Treasury Squad</option>
                  <option value="Documentation">Documentation Squad</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#DAF1DE] border border-[#8EB69B] text-xs text-[#051F20] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#0B2B26]">Default Login Credentials</div>
                  <div className="text-[11px] text-[#235347]">
                    Username: <strong>{newRollNo.trim().toUpperCase() || 'Roll Number'}</strong> • Password: <strong>geohub</strong>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white text-[#163832] font-mono text-[10px] font-bold border border-[#8EB69B]">
                  geohub
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDirectoryScreen;

