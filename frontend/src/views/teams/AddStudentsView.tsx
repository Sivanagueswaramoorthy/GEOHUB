import React, { useState, useMemo } from 'react';
import { UserPlus, ArrowLeft, Mail, Building, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Avatar,
  BottomSheet,
  EmptyState,
} from '../../components/shared';

export const AddStudentsView: React.FC = () => {
  const {
    currentUser,
    users,
    approvals,
    approveItem,
    rejectItem,
    addStudentToTeam,
    setActiveTab,
    showToast,
  } = useApp();

  const currentTeamName = currentUser.team || 'Promotion';
  const teamMembers = users.filter((u) => u.team?.toLowerCase() === currentTeamName.toLowerCase());

  const pendingRequests = approvals.filter(
    (a) =>
      a.type === 'join_request' &&
      a.status === 'pending' &&
      (!a.requestedTeam || a.requestedTeam.toLowerCase() === currentTeamName.toLowerCase())
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [enrollMode, setEnrollMode] = useState<'single' | 'bulk'>('single');

  // Single Scholar Form State
  const [singleRoll, setSingleRoll] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [singleDept, setSingleDept] = useState('Geosciences');
  const [singleSquad, setSingleSquad] = useState(currentTeamName);

  // Bulk Range Form State
  const [bulkPrefix, setBulkPrefix] = useState('21GEO');
  const [bulkFrom, setBulkFrom] = useState('040');
  const [bulkTo, setBulkTo] = useState('065');
  const [bulkDept, setBulkDept] = useState('Geoinformatics');
  const [bulkSquad, setBulkSquad] = useState(currentTeamName);

  // Computed Bulk Preview Count
  const bulkCount = useMemo(() => {
    const fromNum = parseInt(bulkFrom, 10);
    const toNum = parseInt(bulkTo, 10);
    if (isNaN(fromNum) || isNaN(toNum) || toNum < fromNum) {
      return 0;
    }
    return toNum - fromNum + 1;
  }, [bulkFrom, bulkTo]);

  const handleSingleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleRoll.trim() || !singleName.trim()) {
      showToast('Please enter roll number and scholar name.', 'error');
      return;
    }

    addStudentToTeam({
      name: singleName.trim(),
      email: singleEmail.trim() || `${singleRoll.trim().toLowerCase()}@college.edu`,
      rollNo: singleRoll.trim().toUpperCase(),
      team: singleSquad,
      teamRole: 'Contributor',
      department: singleDept,
      yearOfStudy: '2nd Year',
      role: 'student',
      isVolunteer: false,
      status: 'active',
      mustChangePassword: true,
    });

    showToast(`✓ Scholar ${singleRoll.toUpperCase()} enrolled. Must change password on first login.`);
    setIsAddModalOpen(false);
    setSingleRoll('');
    setSingleName('');
    setSingleEmail('');
  };

  const handleBulkAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkCount <= 0) {
      showToast('Invalid roll number range.', 'error');
      return;
    }

    const fromNum = parseInt(bulkFrom, 10);
    const toNum = parseInt(bulkTo, 10);

    for (let i = fromNum; i <= toNum; i++) {
      const padded = i.toString().padStart(bulkFrom.length, '0');
      const roll = `${bulkPrefix}${padded}`;
      addStudentToTeam({
        name: `Scholar ${roll}`,
        email: `${roll.toLowerCase()}@college.edu`,
        rollNo: roll,
        team: bulkSquad,
        teamRole: 'Scholar',
        department: bulkDept,
        yearOfStudy: '1st Year',
        role: 'student',
        isVolunteer: false,
        status: 'active',
        mustChangePassword: true,
      });
    }

    showToast(`✓ Enrolled ${bulkCount} scholars. All must change password on first login.`);
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 select-none animate-fadeIn pb-16">
      {/* Back button */}
      <div>
        <PillButton
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={16} strokeWidth={1.75} />}
          onClick={() => setActiveTab('operations')}
        >
          Back to Operations
        </PillButton>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            Add Students
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Enroll scholars to chapter registry
          </p>
        </div>

        <PillButton
          variant="primary"
          icon={<UserPlus size={16} strokeWidth={1.75} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Enroll Scholars
        </PillButton>
      </div>

      {/* Institutional Security Notice */}
      <div className="p-4 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-xs text-[#051F20] flex items-start gap-3">
        <ShieldAlert size={18} strokeWidth={1.75} className="shrink-0 text-[#163832] mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[#163832]">Institutional Password Policy</span>
          <span>
            Every newly enrolled student must set a new secure password on their first login. Shared or default passwords have been removed for institutional compliance.
          </span>
        </div>
      </div>

      {/* Pending Applications Section */}
      <div
        className="p-5 bg-white border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.06)] flex flex-col gap-3"
        style={{ borderRadius: '24px' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#051F20]">
            Pending Join Requests ({pendingRequests.length})
          </h2>
          <span className="text-xs font-bold text-[#235347]">Admission Queue</span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-4 text-center text-xs text-[#235347]">
            No pending admission requests at this time.
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <Avatar name={req.applicantName} size={36} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#051F20]">{req.applicantName}</span>
                  <span className="text-xs text-[#235347]">{req.title} • {req.subtitle}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PillButton variant="primary" size="sm" onClick={() => approveItem(req.id)}>
                  Approve
                </PillButton>
                <PillButton variant="destructive" size="sm" onClick={() => rejectItem(req.id, 'Declined')}>
                  Reject
                </PillButton>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Active Enrolled Scholars List */}
      <div
        className="p-5 bg-white border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.06)] flex flex-col gap-3"
        style={{ borderRadius: '24px' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#051F20]">
            Enrolled Scholars ({users.length})
          </h2>
          <span className="text-xs font-bold text-[#235347]">Chapter Registry</span>
        </div>

        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {users.map((m) => (
            <div
              key={m.uid}
              className="p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={m.name} size={36} />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#051F20] truncate">{m.name}</div>
                  <div className="text-xs text-[#235347] truncate">{m.rollNo || m.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
                  {m.team || 'Member'}
                </span>
                <span className="text-xs font-bold text-[#235347]">
                  {m.post || m.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enroll Modal (Single or Bulk Range with Preview Count) */}
      <BottomSheet
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll Scholars"
        subtitle="Add individual student or bulk roll range"
      >
        <div className="flex flex-col gap-4 py-2 select-none">
          {/* Toggle Single vs Bulk */}
          <div className="flex items-center gap-2 p-1 bg-[#DAF1DE] rounded-full border border-[#8EB69B]">
            <button
              type="button"
              onClick={() => setEnrollMode('single')}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all touch-target-44 cursor-pointer ${
                enrollMode === 'single'
                  ? 'bg-[#163832] text-white shadow-sm'
                  : 'text-[#163832] hover:bg-white/50'
              }`}
            >
              Single Scholar
            </button>
            <button
              type="button"
              onClick={() => setEnrollMode('bulk')}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all touch-target-44 cursor-pointer ${
                enrollMode === 'bulk'
                  ? 'bg-[#163832] text-white shadow-sm'
                  : 'text-[#163832] hover:bg-white/50'
              }`}
            >
              Bulk Range (From - To)
            </button>
          </div>

          {/* Mode 1: Single Scholar Form */}
          {enrollMode === 'single' ? (
            <form onSubmit={handleSingleAdd} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#051F20]">Roll Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 21GEO045"
                  value={singleRoll}
                  onChange={(e) => setSingleRoll(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-bold text-[#051F20] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#051F20]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-medium text-[#051F20] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#051F20]">College Email (optional)</label>
                <input
                  type="email"
                  placeholder="e.g. 21geo045@college.edu"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-medium text-[#051F20] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#051F20]">Department</label>
                  <input
                    type="text"
                    value={singleDept}
                    onChange={(e) => setSingleDept(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-medium text-[#051F20] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#051F20]">Squad</label>
                  <select
                    value={singleSquad}
                    onChange={(e) => setSingleSquad(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-semibold text-[#051F20] outline-none"
                  >
                    <option value="Promotion">Promotion</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Management">Management</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[rgba(242,184,75,0.14)] border border-[#F2B84B] text-xs text-[#051F20]">
                Note: This student will be mandated to set a personal password upon first login.
              </div>

              <div className="pt-2">
                <PillButton
                  variant="primary"
                  fullWidth
                  disabled={!singleRoll.trim() || !singleName.trim()}
                  onClick={handleSingleAdd}
                >
                  Enroll Scholar
                </PillButton>
              </div>
            </form>
          ) : (
            /* Mode 2: Bulk Range Form */
            <form onSubmit={handleBulkAdd} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#051F20]">Roll Prefix</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 21GEO"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-bold text-[#051F20] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#051F20]">From Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 040"
                    value={bulkFrom}
                    onChange={(e) => setBulkFrom(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-bold text-[#051F20] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#051F20]">To Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 065"
                    value={bulkTo}
                    onChange={(e) => setBulkTo(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-bold text-[#051F20] outline-none"
                  />
                </div>
              </div>

              {/* Preview Count Card */}
              <div className="p-3.5 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#163832]">Preview Batch Count</span>
                  <span className="text-xs text-[#235347]">
                    Range: {bulkPrefix}{bulkFrom} → {bulkPrefix}{bulkTo}
                  </span>
                </div>
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#163832] text-white">
                  {bulkCount} Scholars
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#051F20]">Department</label>
                  <input
                    type="text"
                    value={bulkDept}
                    onChange={(e) => setBulkDept(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-medium text-[#051F20] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#051F20]">Squad</label>
                  <select
                    value={bulkSquad}
                    onChange={(e) => setBulkSquad(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-semibold text-[#051F20] outline-none"
                  >
                    <option value="Promotion">Promotion</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Management">Management</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[rgba(242,184,75,0.14)] border border-[#F2B84B] text-xs text-[#051F20]">
                Note: Each of these {bulkCount} students will be required to establish a password at first login.
              </div>

              <div className="pt-2">
                <PillButton
                  variant="primary"
                  fullWidth
                  disabled={bulkCount <= 0}
                  onClick={handleBulkAdd}
                >
                  Enroll {bulkCount} Scholars in Bulk
                </PillButton>
              </div>
            </form>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default AddStudentsView;
