import React, { useState, useMemo } from 'react';
import {
  Check,
  Building,
  GraduationCap,
  Mail,
  Phone,
  UserPlus,
  Calendar,
  CheckSquare,
  History,
  Power,
  Edit3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserModel, UserRole } from '../../types';
import { getRolePermissions } from '../../core/permissions';
import {
  Overline,
  SearchBar,
  FilterPill,
  MemberCard,
  BottomSheet,
  Toast,
  RoleBadge,
  InfoRow,
  EmptyState,
} from '../../components';

export const MembersDirectoryView: React.FC = () => {
  const {
    users,
    currentUser,
    setSelectedUserId,
    updateUserRoleAndTeam,
    changeStudentPost,
    addStudentToTeam,
    isPhoneFrame,
  } = useApp();

  const perms = getRolePermissions(currentUser.role);

  // Tabs: Roster vs Join Requests
  const [activeTabMode, setActiveTabMode] = useState<'roster' | 'join_requests'>('roster');

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [squadFilter, setSquadFilter] = useState('All');

  const [isRoleSheetOpen, setIsRoleSheetOpen] = useState(false);
  const [isSquadSheetOpen, setIsSquadSheetOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserModel | null>(null);

  // Add Student Sheet State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentDept, setNewStudentDept] = useState('Geography & Geomatics');
  const [newStudentYear, setNewStudentYear] = useState('1st Year');
  const [newStudentSquad, setNewStudentSquad] = useState('Management');

  // Change Post Modal & Confirmation State
  const [isChangePostOpen, setIsChangePostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('Promotion Lead');
  const [newPostRole, setNewPostRole] = useState<UserRole>('team_admin');
  const [isConfirmPostOpen, setIsConfirmPostOpen] = useState(false);

  // Join Requests state
  const [joinRequests, setJoinRequests] = useState([
    {
      id: 'req_1',
      name: 'Anjali R.',
      email: 'anjali.r@college.edu',
      department: 'Cartography & Spatial Media',
      year: '2nd Year',
      requestedSquad: 'Promotion',
      requestedRole: 'Social Media Graphics Designer',
      portfolioNote: 'Proficient in Adobe Illustrator, Blender, and GIS story maps.',
    },
    {
      id: 'req_2',
      name: 'Rohan Verma',
      email: 'rohan.v@college.edu',
      department: 'Remote Sensing & Drone Systems',
      year: '1st Year',
      requestedSquad: 'Management',
      requestedRole: 'Gate Logistics Volunteer',
      portfolioNote: 'Drone pilot license certified, event usher experience.',
    },
    {
      id: 'req_3',
      name: 'Fatima Zahra',
      email: 'fatima.z@college.edu',
      department: 'Environmental Conservation',
      year: '3rd Year',
      requestedSquad: 'Documentation',
      requestedRole: 'Field Report Scribe',
      portfolioNote: 'Authored chapter seminar summaries and MoM transcripts.',
    },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered Roster list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchDept = u.department?.toLowerCase().includes(q);
        const matchPost = u.post?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDept && !matchPost) return false;
      }

      // Role filter
      if (roleFilter !== 'All') {
        if (roleFilter === 'leads') {
          const isLead =
            u.role === 'team_admin' ||
            u.role === 'admin' ||
            u.role === 'super_admin' ||
            u.post?.toLowerCase().includes('lead');
          if (!isLead) return false;
        } else if (roleFilter === '1st_year') {
          if (!u.yearOfStudy?.toLowerCase().includes('1st')) return false;
        } else if (roleFilter === '2nd_year') {
          if (!u.yearOfStudy?.toLowerCase().includes('2nd')) return false;
        } else if (roleFilter === '3rd_year') {
          if (!u.yearOfStudy?.toLowerCase().includes('3rd')) return false;
        } else if (roleFilter === '4th_year') {
          if (
            !u.yearOfStudy?.toLowerCase().includes('4th') &&
            !u.yearOfStudy?.toLowerCase().includes('final')
          )
            return false;
        }
      }

      // Squad filter
      if (squadFilter !== 'All') {
        if (!u.team || u.team.toLowerCase() !== squadFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, squadFilter]);

  const handleMemberClick = (user: UserModel) => {
    setSelectedUserDetail(user);
    setSelectedUserId(user.uid);
    setNewPostTitle(user.post || 'Student Volunteer');
    setNewPostRole(user.role);
  };

  const handleToggleStatus = () => {
    if (!selectedUserDetail) return;
    const newStatus = selectedUserDetail.status === 'active' ? 'disabled' : 'active';
    setSelectedUserDetail({ ...selectedUserDetail, status: newStatus });
    // Also update in users list in state
    updateUserRoleAndTeam(selectedUserDetail.uid, selectedUserDetail.role, selectedUserDetail.team);
    showToast(
      newStatus === 'active'
        ? `✓ Scholar account restored to Active.`
        : `Scholar account Suspended.`
    );
  };

  const handleConfirmPostChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserDetail) return;

    changeStudentPost(selectedUserDetail.uid, newPostTitle, newPostRole);
    updateUserRoleAndTeam(selectedUserDetail.uid, newPostRole, selectedUserDetail.team);

    showToast(`✓ Confirmed: ${selectedUserDetail.name} is now ${newPostTitle}`);
    setIsConfirmPostOpen(false);
    setIsChangePostOpen(false);
    setSelectedUserDetail((prev) =>
      prev
        ? {
            ...prev,
            post: newPostTitle,
            role: newPostRole,
          }
        : null
    );
  };

  const handleApproveJoin = (id: string, name: string, squad: string) => {
    setJoinRequests((prev) => prev.filter((r) => r.id !== id));
    showToast(`✓ Approved & Inducted: ${name} into ${squad} Squad`);
  };

  const handleRejectJoin = (id: string, name: string) => {
    setJoinRequests((prev) => prev.filter((r) => r.id !== id));
    showToast(`Application declined for ${name}`);
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;

    addStudentToTeam({
      name: newStudentName,
      email: newStudentEmail,
      department: newStudentDept,
      yearOfStudy: newStudentYear,
      team: newStudentSquad,
      role: 'member',
      isVolunteer: true,
      status: 'active',
    });

    showToast(`✓ Successfully enrolled ${newStudentName}!`);
    setIsAddStudentOpen(false);
    setNewStudentName('');
    setNewStudentEmail('');
  };

  return (
    <div className="flex flex-col gap-5">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header Area */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Overline pill dot>
              INSTITUTIONAL REGISTRY
            </Overline>
            <span className="text-[11px] font-bold text-slate-500">
              {users.length} Enrolled Scholars
            </span>
          </div>

          <h1
            className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            Members Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Browse, filter and connect with verified scholars and squad leaders.
          </p>
        </div>

        {/* Add Student Button */}
        {perms.canManageMembers && (
          <button
            type="button"
            onClick={() => setIsAddStudentOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all active:scale-95 shrink-0 mt-1 cursor-pointer"
          >
            <UserPlus size={15} />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Roster vs Join Requests Tab Pill Switcher */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTabMode('roster')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeTabMode === 'roster'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Enrolled Roster ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTabMode('join_requests')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTabMode === 'join_requests'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Join Requests</span>
          {joinRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-extrabold">
              {joinRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Enrolled Roster */}
      {activeTabMode === 'roster' && (
        <>
          {/* SearchBar */}
          <div>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, roll no, department..."
            />
          </div>

          {/* Two FilterPills ('All Students', 'All Squads') with count badges */}
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5">
            <FilterPill
              label={
                roleFilter === 'All'
                  ? 'All Students'
                  : roleFilter === 'leads'
                  ? 'Squad Leads'
                  : `${roleFilter.replace('_', ' ')}`
              }
              count={filteredUsers.length}
              isActive={roleFilter !== 'All'}
              onClick={() => setIsRoleSheetOpen(true)}
            />

            <FilterPill
              label={squadFilter === 'All' ? 'All Squads' : `${squadFilter} Squad`}
              isActive={squadFilter !== 'All'}
              onClick={() => setIsSquadSheetOpen(true)}
            />
          </div>

          {/* Overline: ROSTER • N STUDENTS */}
          <div className="flex items-center justify-between px-1 pt-1">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              ROSTER • {filteredUsers.length} STUDENTS
            </span>
            {(roleFilter !== 'All' || squadFilter !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setRoleFilter('All');
                  setSquadFilter('All');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Reset all
              </button>
            )}
          </div>

          {/* MemberCards List */}
          {filteredUsers.length === 0 ? (
            <EmptyState
              title="No scholars found"
              description="Try selecting a different squad filter or reset the search query."
              actionLabel="Clear Filters"
              onAction={() => {
                setRoleFilter('All');
                setSquadFilter('All');
                setSearchQuery('');
              }}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isPhoneFrame ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '12px',
              }}
            >
              {filteredUsers.map((u) => (
                <MemberCard
                  key={u.uid}
                  user={u}
                  onClick={handleMemberClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Join Requests */}
      {activeTabMode === 'join_requests' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Pending Candidate Inductions ({joinRequests.length})
            </span>
          </div>

          {joinRequests.length === 0 ? (
            <EmptyState
              title="No pending join requests"
              description="All candidate induction requests have been reviewed and approved."
            />
          ) : (
            joinRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {req.name}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {req.department} • {req.year}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Applying: {req.requestedSquad} Squad
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium leading-relaxed">
                  <span className="font-bold text-slate-900">Role: </span>
                  {req.requestedRole}
                  <p className="mt-1 text-slate-500">{req.portfolioNote}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleRejectJoin(req.id, req.name)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveJoin(req.id, req.name, req.requestedSquad)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    Approve Induction
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Member Details Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedUserDetail && !isChangePostOpen && !isConfirmPostOpen}
        onClose={() => setSelectedUserDetail(null)}
        title={selectedUserDetail?.name}
        subtitle={selectedUserDetail?.email}
      >
        {selectedUserDetail && (
          <div className="flex flex-col gap-4 py-1">
            {/* Top Identity & Status Pill */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-emerald-700">
                  Institutional Post
                </span>
                <span className="font-extrabold text-sm text-emerald-950 mt-0.5">
                  {selectedUserDetail.post || selectedUserDetail.teamRole || 'Student Volunteer'}
                </span>
              </div>
              <RoleBadge role={selectedUserDetail.role} post={selectedUserDetail.post} />
            </div>

            {/* Contacts & Academic InfoRows */}
            <div className="flex flex-col border border-slate-100 rounded-2xl p-3 bg-white">
              <InfoRow
                label="Institutional Email"
                value={selectedUserDetail.email}
                icon={<Mail size={16} />}
              />
              <InfoRow
                label="Contact Phone"
                value={selectedUserDetail.phone || '+91 98450 12844'}
                icon={<Phone size={16} />}
              />
              <InfoRow
                label="Academic Department"
                value={selectedUserDetail.department || 'Environmental Science'}
                icon={<Building size={16} />}
              />
              <InfoRow
                label="Standing / Year"
                value={selectedUserDetail.yearOfStudy || '2nd Year'}
                icon={<GraduationCap size={16} />}
              />
            </div>

            {/* Post History, Events Attended & Duties Done */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Expeditions RSVPed</span>
                <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-sm mt-1">
                  <Calendar size={15} className="text-emerald-600" />
                  <span>6 Events Attended</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Duties</span>
                <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-sm mt-1">
                  <CheckSquare size={15} className="text-emerald-600" />
                  <span>14 Duties Verified</span>
                </div>
              </div>
            </div>

            {/* Post History Trail */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <History size={14} className="text-slate-400" />
                <span>Officer Post History Trail</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#475569',
                  paddingLeft: '14px',
                  borderLeft: '2px solid #6EE7B7',
                  marginLeft: '6px',
                  lineHeight: 1.45,
                }}
              >
                <div>2024: Student Volunteer (Gate Entry Roster)</div>
                <div>2025: Operational Lead ({selectedUserDetail.team || 'Management'})</div>
                <div style={{ fontWeight: 700, color: '#065F46' }}>2026: {selectedUserDetail.post || 'Current Active Post'}</div>
              </div>
            </div>

            {/* Faculty Control Actions: Change Post & Active/Suspended Toggle */}
            {perms.canManageMembers && (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                {perms.canAssignPosts ? (
                  <button
                    type="button"
                    onClick={() => setIsChangePostOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    <Edit3 size={15} />
                    <span>Change Scholar Post (Confirm)</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500">Post Assignment</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {selectedUserDetail.post || selectedUserDetail.teamRole || 'Student Volunteer'} (Read-only)
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-xs transition-all ${
                    selectedUserDetail.status === 'active'
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Power size={15} />
                  <span>
                    {selectedUserDetail.status === 'active'
                      ? 'Suspend Scholar Membership'
                      : 'Restore Scholar to Active'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Change Post Sheet */}
      <BottomSheet
        isOpen={isChangePostOpen && !isConfirmPostOpen}
        onClose={() => setIsChangePostOpen(false)}
        title="Designate Officer Post"
        subtitle={selectedUserDetail?.name}
      >
        <div className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Officer Post
            </label>
            <select
              value={newPostTitle}
              onChange={(e) => {
                setNewPostTitle(e.target.value);
                if (e.target.value.includes('Lead')) {
                  setNewPostRole('team_admin');
                } else {
                  setNewPostRole('member');
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none focus:border-emerald-500"
            >
              <option value="Promotion Lead">Promotion Lead</option>
              <option value="Documentation Lead">Documentation Lead</option>
              <option value="Treasurer Lead">Treasurer Lead</option>
              <option value="Entertainment Lead">Entertainment Lead</option>
              <option value="Management Lead">Management Lead</option>
              <option value="Student Volunteer">Student Volunteer</option>
              <option value="Senior Scholar">Senior Scholar</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsConfirmPostOpen(true)}
            className="w-full py-3 rounded-full font-bold text-xs bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-all mt-2"
          >
            Review & Confirm Post Change
          </button>
        </div>
      </BottomSheet>

      {/* Confirmation Dialog for Post Change */}
      <BottomSheet
        isOpen={isConfirmPostOpen}
        onClose={() => setIsConfirmPostOpen(false)}
        title="Confirm Post Designation"
        subtitle="Institutional Governance Sanction"
      >
        <div className="flex flex-col gap-3 py-1 text-xs">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 leading-relaxed font-medium">
            Are you sure you want to designate <span className="font-extrabold text-slate-950">{selectedUserDetail?.name}</span> as <span className="font-extrabold text-emerald-800">{newPostTitle}</span>?
            This will update chapter executive records and dispatch an official appointment notification.
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsConfirmPostOpen(false)}
              className="px-4 py-2 rounded-full font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPostChange}
              className="px-5 py-2 rounded-full font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Add Student Sheet */}
      <BottomSheet
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        title="Enroll Scholar into Chapter"
        subtitle="Add student details directly to database"
      >
        <form onSubmit={handleAddStudentSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Scholar Full Name</label>
            <input
              type="text"
              required
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="e.g. Liam Washington"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">College Email Address</label>
            <input
              type="email"
              required
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
              placeholder="e.g. liam.w@college.edu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={newStudentDept}
                onChange={(e) => setNewStudentDept(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year of Study</label>
              <select
                value={newStudentYear}
                onChange={(e) => setNewStudentYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assign to Squad</label>
            <select
              value={newStudentSquad}
              onChange={(e) => setNewStudentSquad(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
            >
              <option value="Management">Management Squad</option>
              <option value="Promotion">Promotion Squad</option>
              <option value="Documentation">Documentation Squad</option>
              <option value="Entertainment">Entertainment Squad</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-2"
          >
            Confirm Enrollment
          </button>
        </form>
      </BottomSheet>

      {/* Role Filter Sheet */}
      <BottomSheet
        isOpen={isRoleSheetOpen}
        onClose={() => setIsRoleSheetOpen(false)}
        title="Filter by Student Year & Standing"
        subtitle="Select an academic tier"
      >
        <div className="flex flex-col gap-2 py-1">
          {[
            { key: 'All', label: 'All Students & Scholars' },
            { key: 'leads', label: 'Squad Leads & Team Admins' },
            { key: '1st_year', label: '1st Year Scholars' },
            { key: '2nd_year', label: '2nd Year Scholars' },
            { key: '3rd_year', label: '3rd Year Scholars' },
            { key: '4th_year', label: '4th Year (Final Year)' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setRoleFilter(opt.key);
                setIsRoleSheetOpen(false);
              }}
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                roleFilter === opt.key
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-extrabold'
                  : 'bg-white border-slate-100 text-slate-700 font-semibold'
              }`}
            >
              <span className="text-xs">{opt.label}</span>
              {roleFilter === opt.key && <Check size={16} className="text-emerald-600" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Squad Filter Sheet */}
      <BottomSheet
        isOpen={isSquadSheetOpen}
        onClose={() => setIsSquadSheetOpen(false)}
        title="Filter by Operational Squad"
        subtitle="Select chapter squad assignment"
      >
        <div className="flex flex-col gap-2 py-1">
          {['All', 'Management', 'Promotion', 'Documentation', 'Entertainment'].map((sq) => (
            <button
              key={sq}
              type="button"
              onClick={() => {
                setSquadFilter(sq);
                setIsSquadSheetOpen(false);
              }}
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                squadFilter === sq
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-extrabold'
                  : 'bg-white border-slate-100 text-slate-700 font-semibold'
              }`}
            >
              <span className="text-xs">{sq === 'All' ? 'All Squads' : `${sq} Squad`}</span>
              {squadFilter === sq && <Check size={16} className="text-emerald-600" />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};
