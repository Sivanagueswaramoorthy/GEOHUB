import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Plus,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Calendar,
} from 'lucide-react';
import { AnimatedNumber, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

export interface StationVolunteer {
  id: string;
  name: string;
  rollNo: string;
  shift: string;
  isLead?: boolean;
}

export interface DutyStation {
  id: string;
  name: string;
  location: string;
  event: string;
  requiredVolunteers: number;
  assignedVolunteers: StationVolunteer[];
  stationLead: string;
}

export interface DutiesStationsScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const DutiesStationsScreen: React.FC<DutiesStationsScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const { users } = useApp();
  const [selectedEvent, setSelectedEvent] = useState('General Operations');
  const [selectedStation, setSelectedStation] = useState<DutyStation | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const initialUser = (users && users.find((u) => u.rollNo)) || null;
  const [newVolName, setNewVolName] = useState(initialUser?.name || '');
  const [newVolRoll, setNewVolRoll] = useState(initialUser?.rollNo || '');
  const [newVolShift, setNewVolShift] = useState('08:30 AM - 01:00 PM');
  const [notice, setNotice] = useState<string | null>(null);

  const [stations, setStations] = useState<DutyStation[]>([]);

  const totalAssigned = stations.reduce((sum, s) => sum + s.assignedVolunteers.length, 0);
  const totalRequired = stations.reduce((sum, s) => sum + s.requiredVolunteers, 0);

  const handleAssignVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation || !newVolName.trim()) return;

    const newVolunteer: StationVolunteer = {
      id: `sv-${Date.now()}`,
      name: newVolName.trim(),
      rollNo: newVolRoll.trim(),
      shift: newVolShift,
      isLead: false,
    };

    setStations((prev) =>
      prev.map((st) =>
        st.id === selectedStation.id
          ? { ...st, assignedVolunteers: [...st.assignedVolunteers, newVolunteer] }
          : st
      )
    );

    onLogAudit(selectedEvent, `Assigned volunteer ${newVolunteer.name} to ${selectedStation.name} (${newVolunteer.shift})`);

    setShowAssignModal(false);
    setSelectedStation(null);
    setNotice(`Assigned ${newVolunteer.name} to station.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleRemoveVolunteer = (stationId: string, volId: string, volName: string) => {
    if (readOnly) return;
    setStations((prev) =>
      prev.map((st) =>
        st.id === stationId
          ? { ...st, assignedVolunteers: st.assignedVolunteers.filter((v) => v.id !== volId) }
          : st
      )
    );
    onLogAudit(selectedEvent, `Removed volunteer ${volName} from station`);
    setNotice(`Unassigned ${volName} from station.`);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Stations</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <MapPin size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={stations.length} /> Active
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Strength</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Users size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-base sm:text-lg mt-1">
            <AnimatedNumber value={totalAssigned} /> / {totalRequired}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Coverage</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            {Math.round((totalAssigned / totalRequired) * 100)}%
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#163832] uppercase tracking-wide">Scope Event</span>
          <div className="font-extrabold text-[#051F20] text-xs sm:text-sm mt-1 truncate">
            {selectedEvent}
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Stations Grid */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Duties and Operational Station Board
          </h2>
          <span className="text-xs font-semibold text-[#235347]">
            {stations.length} Checkpoints
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {stations.length > 0 ? (
            stations.map((st) => {
              const isFull = st.assignedVolunteers.length >= st.requiredVolunteers;

              return (
                <div
                  key={st.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0 shadow-2xs">
                        <MapPin size={16} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#051F20] text-xs sm:text-sm truncate">
                          {st.name}
                        </h3>
                        <p className="text-xs text-[#235347] truncate">{st.location}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                        isFull
                          ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]'
                          : 'bg-[rgba(242,184,75,0.18)] text-[#051F20] border border-[rgba(242,184,75,0.4)]'
                      }`}
                    >
                      {st.assignedVolunteers.length}/{st.requiredVolunteers}
                    </span>
                  </div>

                  <div className="text-xs text-[#235347] truncate">
                    Lead: <strong className="text-[#051F20]">{st.stationLead}</strong>
                  </div>

                  {/* Assigned Volunteers Roster */}
                  <div className="space-y-1.5 pt-1 border-t border-[#DAF1DE]">
                    <span className="text-xs font-semibold text-[#235347] uppercase tracking-wide block">
                      Deployed Volunteers
                    </span>
                    {st.assignedVolunteers.map((vol) => (
                      <div
                        key={vol.id}
                        className="p-2 rounded-xl bg-white border border-[#DAF1DE] flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="px-1.5 py-0.5 rounded font-mono font-bold text-xs bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]/40">
                            {vol.rollNo}
                          </span>
                          <span className="font-bold text-[#051F20] truncate">{vol.name}</span>
                          {vol.isLead && (
                            <span className="px-1.5 py-0.2 rounded text-xs font-bold bg-[#163832] text-white">
                              Officer
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[#235347] font-semibold">{vol.shift}</span>
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => handleRemoveVolunteer(st.id, vol.id, vol.name)}
                              className="text-[#D9534F] hover:bg-[#D9534F]/10 p-1 rounded-md cursor-pointer"
                              title="Unassign Volunteer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Add Button */}
                  {!readOnly && !isFull && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStation(st);
                        setShowAssignModal(true);
                      }}
                      className="w-full h-8 rounded-xl bg-white border border-[#163832] text-[#163832] hover:bg-[#DAF1DE] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus size={13} />
                      <span>Assign Volunteer to Station</span>
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full">
              <EmptyState
                mascot="shield"
                title="No Duty Stations"
                description="Configure turnstiles and gate verification checkpoints."
              />
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedStation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#051F20] text-base">
                Assign Volunteer: {selectedStation.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignVolunteer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Select Volunteer by Roll Number *
                </label>
                <select
                  required
                  value={newVolRoll}
                  onChange={(e) => {
                    const roll = e.target.value;
                    setNewVolRoll(roll);
                    const found = (users || []).find((u) => u.rollNo === roll || u.email?.startsWith(roll.toLowerCase()));
                    if (found) {
                      setNewVolName(found.name);
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
                {newVolName && (
                  <div className="mt-1.5 p-2 rounded-lg bg-[#DAF1DE]/60 border border-[#8EB69B]/50 flex items-center justify-between text-xs">
                    <span className="text-[#235347]">Verified Volunteer:</span>
                    <strong className="text-[#051F20] font-bold">{newVolName} ({newVolRoll})</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Assigned Shift
                </label>
                <select
                  value={newVolShift}
                  onChange={(e) => setNewVolShift(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                >
                  <option value="08:30 AM - 01:00 PM">Morning Shift (08:30 - 13:00)</option>
                  <option value="01:00 PM - 05:30 PM">Afternoon Shift (13:00 - 17:30)</option>
                  <option value="Full Day (08:30 - 17:30)">Full Day (08:30 - 17:30)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer"
                >
                  Deploy Volunteer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DutiesStationsScreen;

