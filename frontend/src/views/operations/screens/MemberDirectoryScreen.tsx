import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
  GraduationCap,
  Building,
  Key,
  Layers,
  Sparkles,
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

export interface OfficialPostOption {
  post: string;
  role: string;
  squad: string;
  label: string;
  uiTitle: string;
}

export const OFFICIAL_POSTS: OfficialPostOption[] = [
  {
    post: 'Student Member',
    role: 'student',
    squad: 'General',
    label: 'Student Member (Default Scholar)',
    uiTitle: 'Campus Scholar Portal & Digital Pass',
  },
  {
    post: 'Club President',
    role: 'coordinator',
    squad: 'Management',
    label: 'Club President (Executive Head)',
    uiTitle: 'Chapter President & Executive Operations',
  },
  {
    post: 'Vice President',
    role: 'management',
    squad: 'Management',
    label: 'Vice President (Operations Lead)',
    uiTitle: 'Operations & Squad Lead Management',
  },
  {
    post: 'Documentation Lead',
    role: 'documentation',
    squad: 'Documentation',
    label: 'Documentation Lead (Archival)',
    uiTitle: 'Documentation Studio, Minutes & Archival',
  },
  {
    post: 'Treasurer',
    role: 'treasurer',
    squad: 'Treasury',
    label: 'Treasurer (Finance & Ledger)',
    uiTitle: 'Finance Desk, Budget Approvals & Ledger',
  },
  {
    post: 'Promotion Lead',
    role: 'promotion',
    squad: 'Promotion',
    label: 'Promotion Lead (Campaigns & Media)',
    uiTitle: 'Campaigns, Media & Public Broadcasts',
  },
  {
    post: 'Lead Volunteer',
    role: 'volunteer',
    squad: 'General',
    label: 'Lead Volunteer (Events & Gate Scanner)',
    uiTitle: 'Event Operations & Gate Scanner Active',
  },
  {
    post: 'Senior Technical Associate',
    role: 'coordinator',
    squad: 'General',
    label: 'Senior Technical Associate (Tech Lead)',
    uiTitle: 'Technical Operations & System Integration',
  },
  {
    post: 'Executive Committee Member',
    role: 'management',
    squad: 'Management',
    label: 'Executive Committee Member',
    uiTitle: 'Executive Council & Governance',
  },
  {
    post: 'Faculty Advisor',
    role: 'faculty',
    squad: 'Management',
    label: 'Faculty Advisor (Institutional Head)',
    uiTitle: 'Institutional Oversight & Sign-offs',
  },
];

export const matchPostOption = (post?: string, role?: string): OfficialPostOption => {
  const p = (post || '').toLowerCase().trim();
  const r = (role || '').toLowerCase().trim();

  if (p === 'club president' || (p.includes('president') && !p.includes('vice'))) {
    return OFFICIAL_POSTS[1];
  }
  if (p === 'vice president' || p.includes('vice president')) {
    return OFFICIAL_POSTS[2];
  }
  if (p.includes('documentation') || r === 'documentation') {
    return OFFICIAL_POSTS[3];
  }
  if (p.includes('treasurer') || r === 'treasurer') {
    return OFFICIAL_POSTS[4];
  }
  if (p.includes('promotion') || r === 'promotion' || r === 'social_media') {
    return OFFICIAL_POSTS[5];
  }
  if (p.includes('volunteer') || r === 'volunteer') {
    return OFFICIAL_POSTS[6];
  }
  if (p.includes('technical') || p.includes('tech associate')) {
    return OFFICIAL_POSTS[7];
  }
  if (p.includes('executive')) {
    return OFFICIAL_POSTS[8];
  }
  if (p.includes('faculty') || p.includes('advisor') || r === 'faculty') {
    return OFFICIAL_POSTS[9];
  }
  return OFFICIAL_POSTS[0];
};

export interface MemberDirectoryScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
  onSubViewChange?: (title: string | null, onBack: (() => void) | null) => void;
}

export const MemberDirectoryScreen: React.FC<MemberDirectoryScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
  onSubViewChange,
}) => {
  const [selectedSquad, setSelectedSquad] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberToEdit, setSelectedMemberToEdit] = useState<ScholarRecord | null>(null);
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<ScholarRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Mode for Add Student
  const [enrollMode, setEnrollMode] = useState<'single' | 'bulk'>('single');

  // Form states for Add Student (Single)
  const [newRollNo, setNewRollNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('Geoinformatics');
  const [newYear, setNewYear] = useState('2nd Year');
  const [newEmail, setNewEmail] = useState('');
  const [newPost, setNewPost] = useState('Student Member');
  const [newSquad, setNewSquad] = useState('General');

  // Form states for Add Student (Bulk Batch)
  const [bulkPrefix, setBulkPrefix] = useState('24GEO');
  const [bulkFrom, setBulkFrom] = useState('001');
  const [bulkTo, setBulkTo] = useState('030');
  const [bulkDept, setBulkDept] = useState('Geoinformatics');
  const [bulkYear, setBulkYear] = useState('1st Year');

  const bulkCount = useMemo(() => {
    const fromNum = parseInt(bulkFrom, 10);
    const toNum = parseInt(bulkTo, 10);
    if (isNaN(fromNum) || isNaN(toNum) || toNum < fromNum) {
      return 0;
    }
    return toNum - fromNum + 1;
  }, [bulkFrom, bulkTo]);

  // Form states for Edit
  const [editName, setEditName] = useState('');
  const [editPost, setEditPost] = useState('Student Member');
  const [editSquad, setEditSquad] = useState('General');

  const { users, setUsers, enrollScholar, showToast, setCurrentUser } = useApp();
  const [members, setMembers] = useState<ScholarRecord[]>(() => {
    return (users || []).map((u) => ({
      uid: u.uid,
      name: u.name,
      role: u.role,
      squad: u.team || 'General',
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
      squad: u.team || 'General',
      isLead: Boolean(u.squadMemberships?.some((s) => s.isLead) || u.post?.includes('Lead') || u.post?.includes('Advisor')),
      post: u.post || 'Chapter Member',
      email: u.email,
      rollNo: u.rollNo || u.uid,
    })));
  }, [users]);

  // Synchronize top-bar header with ExploreActivitiesView: single back button and title
  useEffect(() => {
    if (showAddModal) {
      onSubViewChange?.('Add Student', () => setShowAddModal(false));
    } else {
      onSubViewChange?.(null, null);
    }
    return () => {
      onSubViewChange?.(null, null);
    };
  }, [showAddModal, onSubViewChange]);

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
    const matched = matchPostOption(m.post, m.role);
    setEditPost(matched.post);
    setEditSquad(m.squad || matched.squad);
  };

  const handleEditPostChange = (chosenPost: string) => {
    setEditPost(chosenPost);
    const matched = OFFICIAL_POSTS.find((p) => p.post === chosenPost);
    if (matched) {
      setEditSquad(matched.squad);
    }
  };

  const handleNewPostChange = (chosenPost: string) => {
    setNewPost(chosenPost);
    const matched = OFFICIAL_POSTS.find((p) => p.post === chosenPost);
    if (matched) {
      setNewSquad(matched.squad);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberToEdit) return;

    const matched = OFFICIAL_POSTS.find((p) => p.post === editPost) || matchPostOption(editPost);
    const targetRole = matched.role;
    const finalPost = editPost.trim() || matched.post;
    const finalSquad = editSquad || matched.squad;

    const updated: ScholarRecord = {
      ...selectedMemberToEdit,
      name: editName.trim() || selectedMemberToEdit.name,
      post: finalPost,
      role: targetRole,
      squad: finalSquad,
    };

    setUsers((prev) =>
      prev.map((u) =>
        u.uid === selectedMemberToEdit.uid
          ? { ...u, name: updated.name, post: updated.post, team: updated.squad, role: targetRole as any }
          : u
      )
    );

    if (currentUser?.uid === selectedMemberToEdit.uid || currentUser?.rollNo === selectedMemberToEdit.rollNo) {
      if (setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          name: updated.name,
          post: updated.post,
          team: updated.squad,
          role: targetRole as any,
        });
      }
    }

    setMembers((prev) => prev.map((m) => (m.uid === selectedMemberToEdit.uid ? updated : m)));
    onLogAudit('Member Directory', `Updated scholar profile for ${updated.name} to ${updated.post} (${targetRole}) in ${updated.squad}`);

    try {
      const targetId = selectedMemberToEdit.rollNo || selectedMemberToEdit.uid;
      await apiClient.setUserRole(targetId, targetRole, updated.post, updated.squad);
    } catch (err: any) {
      console.warn('[MemberDirectory] Cloud role sync notice:', err?.message || err);
    }

    setSelectedMemberToEdit(null);
    setNotice(`Updated record for ${updated.name} to ${updated.post}.`);
    if (showToast) {
      showToast(`✓ Updated ${updated.name} to ${updated.post}! UI Role: ${matched.uiTitle}`);
    }
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

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRollNo.trim() || !newName.trim()) return;

    const cleanRoll = newRollNo.trim().toUpperCase();
    const cleanName = newName.trim();
    const cleanEmail = newEmail.trim() || `${cleanRoll.toLowerCase()}@geohub.edu`;

    const matched = OFFICIAL_POSTS.find((p) => p.post === newPost) || matchPostOption(newPost);
    const assignedRole = matched.role as any;
    const assignedSquad = newSquad || matched.squad;

    const enrolled = enrollScholar({
      name: cleanName,
      rollNo: cleanRoll,
      email: cleanEmail,
      role: assignedRole,
      squad: assignedSquad,
      post: matched.post,
      department: newDept.trim() || 'Geoinformatics',
      yearOfStudy: newYear,
    });

    try {
      await apiClient.setUserRole(cleanRoll, assignedRole, matched.post, assignedSquad);
    } catch (err: any) {
      console.warn('[MemberDirectory] Cloud role sync notice:', err?.message || err);
    }

    onLogAudit('Member Directory', `Enrolled scholar: ${enrolled.name} (${cleanRoll}) as ${matched.post} (${assignedRole})`);

    setShowAddModal(false);
    setNewRollNo('');
    setNewName('');
    setNewEmail('');
    setNewPost('Student Member');
    setNewSquad('General');
    setNotice(`Enrolled ${enrolled.name} (${cleanRoll}) as ${matched.post}. Login: ${cleanRoll} | Password: geohub`);
    if (showToast) {
      showToast(`✓ Scholar ${enrolled.name} enrolled as ${matched.post}! Access: ${matched.uiTitle}`);
    }
    setTimeout(() => setNotice(null), 4000);
  };

  const handleBulkAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkCount <= 0) return;

    const fromNum = parseInt(bulkFrom, 10);
    const toNum = parseInt(bulkTo, 10);

    for (let i = fromNum; i <= toNum; i++) {
      const padded = i.toString().padStart(bulkFrom.length, '0');
      const roll = `${bulkPrefix}${padded}`.toUpperCase();
      enrollScholar({
        name: `Scholar ${roll}`,
        rollNo: roll,
        email: `${roll.toLowerCase()}@geohub.edu`,
        role: 'student',
        squad: 'Member',
        post: 'Member',
        department: bulkDept.trim() || 'Geoinformatics',
        yearOfStudy: bulkYear,
      });
    }

    onLogAudit('Member Directory', `Batch enrolled ${bulkCount} students (${bulkPrefix}${bulkFrom} - ${bulkPrefix}${bulkTo}) as Members`);

    setShowAddModal(false);
    setNotice(`Batch enrolled ${bulkCount} students. Default Password: geohub`);
    if (showToast) {
      showToast(`✓ Batch enrolled ${bulkCount} students as Members! Password: geohub`);
    }
    setTimeout(() => setNotice(null), 4000);
  };

  // Rebuilt Full-Screen Add Student Page (Zero duplicate back button when managed by parent)
  if (showAddModal) {
    return (
      <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full animate-fadeIn pb-16">
        {/* Only render back button if parent header is NOT handling it */}
        {!onSubViewChange && (
          <div className="flex items-center justify-between pb-3 border-b border-[#DAF1DE]">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="inline-flex items-center gap-2 bg-transparent border-0 p-0 text-xs font-bold text-[#051F20] hover:text-[#163832] cursor-pointer touch-target-44"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
              <span>Back to Member Directory</span>
            </button>
          </div>
        )}

        {/* 1. Hero Context & Mode Switcher */}
        <div
          className="p-4 sm:p-5 rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F6FBF7 50%, #DAF1DE 100%)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#163832] inline-block ring-2 ring-[#8EB69B]"></span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#163832]">Member Provisioning Desk</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#051F20] m-0">
              Enroll Student to Registry
            </h2>
            <p className="text-xs font-medium text-[#235347] mt-0.5 leading-snug">
              Enrolls student by default as an active Member with campus event access, dynamic QR attendance, and ledger visibility.
            </p>
          </div>

          {/* Mode Switcher: Single vs Bulk */}
          <div className="flex items-center gap-1.5 p-1 bg-white/90 rounded-2xl border border-[#8EB69B]/40 shrink-0 self-start sm:self-center shadow-xs">
            <button
              type="button"
              onClick={() => setEnrollMode('single')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                enrollMode === 'single'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#235347] hover:bg-[#DAF1DE]/40'
              }`}
            >
              Individual Student
            </button>
            <button
              type="button"
              onClick={() => setEnrollMode('bulk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                enrollMode === 'bulk'
                  ? 'bg-[#051F20] text-white shadow-xs'
                  : 'text-[#235347] hover:bg-[#DAF1DE]/40'
              }`}
            >
              Bulk Range (Batch)
            </button>
          </div>
        </div>

        {/* 2. Rebuilt Enrollment Form */}
        {enrollMode === 'single' ? (
          <form onSubmit={handleAddMember} className="space-y-4">
            {/* Card A: Academic Identity */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#DAF1DE] shadow-[0_6px_20px_rgba(5,31,32,0.04)] space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DAF1DE]">
                <Users size={16} className="text-[#163832]" />
                <h3 className="font-bold text-[#051F20] text-sm sm:text-base m-0">
                  Academic Credentials
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Roll Number */}
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1.5">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24GEO002"
                    value={newRollNo}
                    onChange={(e) => setNewRollNo(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832] uppercase"
                    autoFocus
                  />
                  <span className="text-xs text-[#235347] mt-1 block">
                    Institutional ID used as login username
                  </span>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1.5">
                    Scholar Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Washington"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#DAF1DE] text-xs font-medium text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  />
                  <span className="text-xs text-[#235347] mt-1 block">
                    Official name as registered in college roll
                  </span>
                </div>
              </div>

              {/* Year of Study touch selector */}
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1.5">
                  Year of Study
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setNewYear(year)}
                      className={`h-10 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        newYear === year
                          ? 'bg-[#051F20] text-white border-[#051F20] shadow-xs'
                          : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE] hover:bg-[#DAF1DE]/50'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* College Email (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1.5">
                  College Email (optional)
                </label>
                <input
                  type="email"
                  placeholder={newRollNo ? `${newRollNo.toLowerCase().trim()}@geohub.edu` : 'e.g. 24geo002@geohub.edu'}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#DAF1DE] text-xs font-medium text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                />
              </div>

              {/* Role & Post Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1.5">
                    Official Post / Designation
                  </label>
                  <select
                    value={newPost}
                    onChange={(e) => handleNewPostChange(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  >
                    {OFFICIAL_POSTS.map((opt) => (
                      <option key={opt.post} value={opt.post}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-[#235347] mt-1 block">
                    Defines platform clearance & assigned UI
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1.5">
                    Assigned Squad
                  </label>
                  <select
                    value={newSquad}
                    onChange={(e) => setNewSquad(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  >
                    <option value="General">General</option>
                    <option value="Management">Management</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Treasury">Treasury</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                  <span className="text-xs text-[#235347] mt-1 block">
                    Operating division for tasks & budget
                  </span>
                </div>
              </div>

              {/* Dynamic UI Access Preview Card */}
              {(() => {
                const opt = OFFICIAL_POSTS.find((p) => p.post === newPost) || matchPostOption(newPost);
                return (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-[#DAF1DE]/60 border border-[#8EB69B]/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#8EB69B]/50 flex items-center justify-center text-[#163832] shrink-0">
                        <Shield size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-[#051F20] block truncate">
                          {opt.uiTitle}
                        </span>
                        <span className="text-xs font-medium text-[#235347] block truncate">
                          Assigned Portal Clearance: <strong className="font-bold uppercase">{opt.role}</strong>
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#163832] text-white text-xs font-black uppercase tracking-wider shrink-0">
                      {opt.role}
                    </span>
                  </div>
                );
              })()}

              {/* Integrated Action Deck */}
              <div className="pt-3 border-t border-[#DAF1DE] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#163832] ring-2 ring-[#8EB69B]/50 shrink-0"></span>
                  <span className="text-xs font-bold text-[#051F20]">
                    {newRollNo.trim() && newName.trim()
                      ? `${newName.trim()} (${newRollNo.trim().toUpperCase()}) ready`
                      : 'Provide roll number & full name'}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-11 px-4 sm:px-5 rounded-full border border-[#8EB69B]/60 bg-white text-xs font-bold text-[#235347] hover:bg-[#DAF1DE]/30 hover:border-[#235347] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0 text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newRollNo.trim() || !newName.trim()}
                    className="flex-1 sm:flex-none h-11 px-5 sm:px-6 rounded-full bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-[0.98] shadow-[0_4px_14px_rgba(22,56,50,0.22)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <span>Confirm Enrollment</span>
                    <CheckCircle2 size={16} className="shrink-0 text-[#8EB69B]" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          /* Bulk Batch Form */
          <form onSubmit={handleBulkAddMember} className="space-y-4">
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#DAF1DE] shadow-[0_6px_20px_rgba(5,31,32,0.04)] space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DAF1DE]">
                <Layers size={16} className="text-[#163832]" />
                <h3 className="font-bold text-[#051F20] text-sm sm:text-base m-0">
                  Batch Roll Number Range
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1.5">
                  Roll Prefix *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24GEO"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832] uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1.5">
                    From Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 001"
                    value={bulkFrom}
                    onChange={(e) => setBulkFrom(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1.5">
                    To Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 030"
                    value={bulkTo}
                    onChange={(e) => setBulkTo(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  />
                </div>
              </div>

              {/* Live Preview Batch Count Card */}
              <div className="p-3.5 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#163832] block">Batch Preview</span>
                  <span className="text-xs text-[#235347]">
                    Range: <strong>{bulkPrefix}{bulkFrom}</strong> → <strong>{bulkPrefix}{bulkTo}</strong>
                  </span>
                </div>
                <span className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#163832] text-white">
                  {bulkCount} Scholars
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1.5">
                  Year of Study
                </label>
                <select
                  value={bulkYear}
                  onChange={(e) => setBulkYear(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              {/* Rebuilt Integrated Action Deck */}
              <div className="pt-3 border-t border-[#DAF1DE] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#163832] ring-2 ring-[#8EB69B]/50 shrink-0"></span>
                  <span className="text-xs font-bold text-[#051F20]">
                    {bulkCount > 0
                      ? `${bulkCount} scholar${bulkCount === 1 ? '' : 's'} ready for enrollment`
                      : 'Specify a valid range'}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-11 px-4 sm:px-5 rounded-full border border-[#8EB69B]/60 bg-white text-xs font-bold text-[#235347] hover:bg-[#DAF1DE]/30 hover:border-[#235347] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0 text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkCount <= 0}
                    className="flex-1 sm:flex-none h-11 px-5 sm:px-6 rounded-full bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-[0.98] shadow-[0_4px_14px_rgba(22,56,50,0.22)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <span>Enroll {bulkCount} Scholars</span>
                    <CheckCircle2 size={16} className="shrink-0 text-[#8EB69B]" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* 3. Recent Enrollments Mini-List */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]">
            <h4 className="font-bold text-[#051F20] text-xs sm:text-sm m-0">
              Recently Enrolled Scholars ({members.slice(0, 4).length})
            </h4>
            <span className="text-xs text-[#235347] font-semibold">Active in Chapter</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {members.slice(0, 4).map((m) => (
              <div key={m.uid} className="p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#051F20]">{m.name}</div>
                  <div className="text-xs text-[#235347] font-mono">{m.rollNo}</div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]/40">
                  Member
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
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
                <select
                  value={editPost}
                  onChange={(e) => handleEditPostChange(e.target.value)}
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

              {/* Dynamic Role UI Interface Preview Card */}
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

    </div>
  );
};

export default MemberDirectoryScreen;

