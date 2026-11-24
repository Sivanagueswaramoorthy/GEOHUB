import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Users,
  Plus,
  Shield,
  Clock,
  CheckCircle2,
  Trash2,
  Briefcase,
  ChevronDown,
  X,
  Scan,
  Package,
  HeartPulse,
  Camera,
  ShieldCheck,
  Building2,
  Radio,
  UserCheck,
} from 'lucide-react';
import { AnimatedNumber, EmptyState, SearchField } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

export interface StationVolunteer {
  id: string;
  name: string;
  rollNo: string;
  duty: string;
  shift: string;
  isLead?: boolean;
  accessLevel?: 'lead' | 'scanner' | 'support';
}

export interface DutyStation {
  id: string;
  name: string;
  location: string;
  event: string;
  workScope: string;
  requiredVolunteers: number;
  assignedVolunteers: StationVolunteer[];
  stationLead: string;
}

export interface DutiesStationsScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

const STORAGE_KEY = 'geohub_store_duty_stations';

export const DEFAULT_SCHOLARS = [
  { rollNo: '24GEO101', name: 'Ananya Sharma', team: 'Management' },
  { rollNo: '24GEO102', name: 'Maya Patel', team: 'Operations' },
  { rollNo: '24GEO103', name: 'Arjun Das', team: 'Technical' },
  { rollNo: '24GEO104', name: 'Rohan Verma', team: 'Media' },
  { rollNo: '24GEO105', name: 'Kavita Menon', team: 'Promotion' },
  { rollNo: '24GEO106', name: 'Pooja Iyer', team: 'Documentation' },
  { rollNo: '24GEO107', name: 'Siddharth Rao', team: 'Logistics' },
  { rollNo: '24GEO108', name: 'Vikram Joshi', team: 'Field Squad' },
  { rollNo: '24GEO109', name: 'Sneha Kulkarni', team: 'Support' },
];

export const PRESET_DUTIES = [
  'Gate & Turnstile QR Verification',
  'Participant Kit & Badge Distribution',
  'Stage AV & Lighting Systems',
  'VIP Protocol & Guest Hospitality',
  'Hydration & Emergency First-Aid',
  'Crowd Flow & Queue Marshal',
  'Field Drone Telemetry & Safety Zone',
  'Official Media & Photography Coverage',
  'Logistics & Equipment Desk',
  'Custom Duty Work...',
] as const;

// 1-tap quick duty chips with minimal labels
const QUICK_CHIPS = [
  { label: 'Gate QR', duty: 'Gate & Turnstile QR Verification', icon: Scan },
  { label: 'Kits', duty: 'Participant Kit & Badge Distribution', icon: Package },
  { label: 'Safety', duty: 'Crowd Flow & Queue Marshal', icon: Shield },
  { label: 'Drone Arena', duty: 'Field Drone Telemetry & Safety Zone', icon: Radio },
  { label: 'First Aid', duty: 'Hydration & Emergency First-Aid', icon: HeartPulse },
  { label: 'Media', duty: 'Official Media & Photography Coverage', icon: Camera },
];

const SHIFT_OPTIONS = [
  { id: '08:30 AM - 01:00 PM', label: 'Morning', time: '08:30–13:00' },
  { id: '01:00 PM - 05:30 PM', label: 'Afternoon', time: '13:00–17:30' },
  { id: 'Full Day (08:30 - 17:30)', label: 'Full Day', time: '08:30–17:30' },
  { id: 'Evening Relay (17:00 - 20:30)', label: 'Evening', time: '17:00–20:30' },
];

const CLEARANCE_OPTIONS = [
  { id: 'support' as const, label: 'Support', desc: 'Roster Duty' },
  { id: 'scanner' as const, label: 'Scanner', desc: 'QR Verification' },
  { id: 'lead' as const, label: 'Officer', desc: 'Station Lead' },
];

export const DEFAULT_DUTY_STATIONS: DutyStation[] = [
  {
    id: 'st-01',
    name: 'Main Gate Turnstiles & Access Pass Desk',
    location: 'North Perimeter Gate 1',
    event: 'Smart Campus Drone Survey',
    workScope: 'Validate passes, scan attendance QR, and manage entry flow.',
    requiredVolunteers: 3,
    stationLead: 'Maya Patel (24GEO102)',
    assignedVolunteers: [
      {
        id: 'sv-101',
        name: 'Maya Patel',
        rollNo: '24GEO102',
        duty: 'Gate & Turnstile QR Verification',
        shift: '08:30 AM - 01:00 PM',
        isLead: true,
        accessLevel: 'lead',
      },
      {
        id: 'sv-102',
        name: 'Arjun Das',
        rollNo: '24GEO103',
        duty: 'Crowd Flow & Queue Marshal',
        shift: '08:30 AM - 01:00 PM',
        isLead: false,
        accessLevel: 'scanner',
      },
    ],
  },
  {
    id: 'st-02',
    name: 'Central Registration & Scholar Kit Booth',
    location: 'Admin Concourse Foyer',
    event: 'Smart Campus Drone Survey',
    workScope: 'Issue badges, verify registrations, and distribute sensors.',
    requiredVolunteers: 4,
    stationLead: 'Ananya Sharma (24GEO101)',
    assignedVolunteers: [
      {
        id: 'sv-103',
        name: 'Ananya Sharma',
        rollNo: '24GEO101',
        duty: 'Participant Kit & Badge Distribution',
        shift: 'Full Day (08:30 - 17:30)',
        isLead: true,
        accessLevel: 'lead',
      },
      {
        id: 'sv-104',
        name: 'Kavita Menon',
        rollNo: '24GEO105',
        duty: 'Participant Kit & Badge Distribution',
        shift: '08:30 AM - 01:00 PM',
        isLead: false,
        accessLevel: 'support',
      },
      {
        id: 'sv-105',
        name: 'Siddharth Rao',
        rollNo: '24GEO107',
        duty: 'Logistics & Equipment Desk',
        shift: '01:00 PM - 05:30 PM',
        isLead: false,
        accessLevel: 'support',
      },
    ],
  },
  {
    id: 'st-03',
    name: 'Flight Arena & Drone Telemetry Bay',
    location: 'Central Oval Ground',
    event: 'Smart Campus Drone Survey',
    workScope: 'Launch perimeter, takeoff log, and battery replenishment.',
    requiredVolunteers: 2,
    stationLead: 'Rohan Verma (24GEO104)',
    assignedVolunteers: [
      {
        id: 'sv-106',
        name: 'Rohan Verma',
        rollNo: '24GEO104',
        duty: 'Field Drone Telemetry & Safety Zone',
        shift: 'Full Day (08:30 - 17:30)',
        isLead: true,
        accessLevel: 'lead',
      },
      {
        id: 'sv-107',
        name: 'Pooja Iyer',
        rollNo: '24GEO106',
        duty: 'Field Drone Telemetry & Safety Zone',
        shift: '08:30 AM - 01:00 PM',
        isLead: false,
        accessLevel: 'support',
      },
    ],
  },
  {
    id: 'st-04',
    name: 'Bio-Reserve Observation Checkpoint',
    location: 'Wetlands Sector 4',
    event: 'Wetland Biodiversity Census',
    workScope: 'Maintain specimen recording logs and researcher safety.',
    requiredVolunteers: 3,
    stationLead: 'Vikram Joshi (24GEO108)',
    assignedVolunteers: [
      {
        id: 'sv-108',
        name: 'Vikram Joshi',
        rollNo: '24GEO108',
        duty: 'Official Media & Photography Coverage',
        shift: '08:30 AM - 01:00 PM',
        isLead: true,
        accessLevel: 'lead',
      },
      {
        id: 'sv-109',
        name: 'Maya Patel',
        rollNo: '24GEO102',
        duty: 'Hydration & Emergency First-Aid',
        shift: '01:00 PM - 05:30 PM',
        isLead: false,
        accessLevel: 'support',
      },
    ],
  },
  {
    id: 'st-05',
    name: 'Central Control & First-Aid Post',
    location: 'Student Activity Center Rm 102',
    event: 'General Operations',
    workScope: 'Central dispatch, first-aid triage, and radio coordination.',
    requiredVolunteers: 2,
    stationLead: 'Dr. Ramesh Kumar (Faculty)',
    assignedVolunteers: [
      {
        id: 'sv-110',
        name: 'Sneha Kulkarni',
        rollNo: '24GEO109',
        duty: 'Hydration & Emergency First-Aid',
        shift: 'Full Day (08:30 - 17:30)',
        isLead: false,
        accessLevel: 'support',
      },
    ],
  },
];

export const DutiesStationsScreen: React.FC<DutiesStationsScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const { users, events } = useApp();

  const [stations, setStations] = useState<DutyStation[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_DUTY_STATIONS;
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stations));
      }
    } catch {
      // ignore
    }
  }, [stations]);

  const [selectedEvent, setSelectedEvent] = useState<string>('All Operations');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_volunteers' | 'full'>('all');
  const [notice, setNotice] = useState<string | null>(null);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [targetStationForAssign, setTargetStationForAssign] = useState<DutyStation | null>(null);

  // Form states
  const initialUser = (users && users.find((u) => u.rollNo)) || null;
  const [formRollNo, setFormRollNo] = useState(initialUser?.rollNo || '24GEO102');
  const [formPersonName, setFormPersonName] = useState(initialUser?.name || 'Maya Patel');
  const [formStationId, setFormStationId] = useState<string>('');
  const [formDutyPreset, setFormDutyPreset] = useState<string>(PRESET_DUTIES[0]);
  const [formCustomDuty, setFormCustomDuty] = useState<string>('');
  const [formShift, setFormShift] = useState<string>('08:30 AM - 01:00 PM');
  const [formAccessLevel, setFormAccessLevel] = useState<'lead' | 'scanner' | 'support'>('support');

  // New Station form
  const [newStationName, setNewStationName] = useState('');
  const [newStationLocation, setNewStationLocation] = useState('North Concourse');
  const [newStationEvent, setNewStationEvent] = useState('Smart Campus Drone Survey');
  const [newStationScope, setNewStationScope] = useState('Pass validation and checkpoint clearance.');
  const [newStationRequired, setNewStationRequired] = useState<number>(3);
  const [newStationLead, setNewStationLead] = useState('Maya Patel (Lead)');

  const selectableUsers = useMemo(() => {
    const list = [...(users || [])];
    DEFAULT_SCHOLARS.forEach((s) => {
      if (!list.some((u) => u.rollNo === s.rollNo)) {
        list.push({
          uid: `u-${s.rollNo}`,
          name: s.name,
          rollNo: s.rollNo,
          team: s.team,
          email: `${s.rollNo.toLowerCase()}@geohub.org`,
          role: 'student',
        } as any);
      }
    });
    return list;
  }, [users]);

  const availableEvents = useMemo(() => {
    const list = new Set<string>();
    list.add('All Operations');
    (events || []).forEach((e) => {
      if (e.title) list.add(e.title);
    });
    stations.forEach((st) => {
      if (st.event) list.add(st.event);
    });
    list.add('General Operations');
    return Array.from(list);
  }, [events, stations]);

  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
      if (selectedEvent !== 'All Operations' && st.event !== selectedEvent) {
        return false;
      }

      const isFull = st.assignedVolunteers.length >= st.requiredVolunteers;
      if (statusFilter === 'needs_volunteers' && isFull) return false;
      if (statusFilter === 'full' && !isFull) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = st.name.toLowerCase().includes(q);
        const matchLocation = st.location.toLowerCase().includes(q);
        const matchScope = st.workScope.toLowerCase().includes(q);
        const matchLead = st.stationLead.toLowerCase().includes(q);
        const matchVolunteer = st.assignedVolunteers.some(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            v.rollNo.toLowerCase().includes(q) ||
            v.duty.toLowerCase().includes(q)
        );
        if (!matchName && !matchLocation && !matchScope && !matchLead && !matchVolunteer) {
          return false;
        }
      }

      return true;
    });
  }, [stations, selectedEvent, statusFilter, searchQuery]);

  const totalAssigned = useMemo(
    () => filteredStations.reduce((sum, s) => sum + s.assignedVolunteers.length, 0),
    [filteredStations]
  );
  const totalRequired = useMemo(
    () => filteredStations.reduce((sum, s) => sum + s.requiredVolunteers, 0),
    [filteredStations]
  );
  const coveragePercent = totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 100) : 0;

  const openAssignModal = (preselectedStation?: DutyStation) => {
    if (preselectedStation) {
      setTargetStationForAssign(preselectedStation);
      setFormStationId(preselectedStation.id);
    } else if (filteredStations.length > 0) {
      setTargetStationForAssign(filteredStations[0]);
      setFormStationId(filteredStations[0].id);
    } else if (stations.length > 0) {
      setTargetStationForAssign(stations[0]);
      setFormStationId(stations[0].id);
    } else {
      setTargetStationForAssign(null);
      setFormStationId('');
    }

    if (!formRollNo && selectableUsers.length > 0) {
      const u = selectableUsers.find((usr) => usr.rollNo) || selectableUsers[0];
      setFormRollNo(u.rollNo || '24GEO102');
      setFormPersonName(u.name);
    }

    setShowAssignModal(true);
  };

  const handleAssignDutySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedStId = formStationId || (targetStationForAssign ? targetStationForAssign.id : stations[0]?.id);
    if (!selectedStId) return;

    const personName = formPersonName.trim() || 'Assigned Scholar';
    const rollNo = formRollNo.trim() || '24GEO102';

    const effectiveDuty =
      formDutyPreset === 'Custom Duty Work...'
        ? formCustomDuty.trim() || 'Assigned Duty Task'
        : formDutyPreset;

    const newVolunteer: StationVolunteer = {
      id: `sv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: personName,
      rollNo: rollNo,
      duty: effectiveDuty,
      shift: formShift,
      isLead: formAccessLevel === 'lead',
      accessLevel: formAccessLevel,
    };

    setStations((prev) =>
      prev.map((st) => {
        if (st.id === selectedStId) {
          return {
            ...st,
            assignedVolunteers: [...st.assignedVolunteers, newVolunteer],
          };
        }
        return st;
      })
    );

    const targetSt = stations.find((s) => s.id === selectedStId);
    const stationName = targetSt ? targetSt.name : 'Duty Station';

    onLogAudit(
      targetSt?.event || selectedEvent,
      `Assigned selective duty "${effectiveDuty}" to ${newVolunteer.name} (${newVolunteer.rollNo}) at ${stationName} with ${formAccessLevel} clearance`
    );

    setShowAssignModal(false);
    setNotice(`Assigned to ${newVolunteer.name}`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleUnassignVolunteer = (stationId: string, volId: string, volName: string, dutyName: string) => {
    if (readOnly) return;
    setStations((prev) =>
      prev.map((st) =>
        st.id === stationId
          ? { ...st, assignedVolunteers: st.assignedVolunteers.filter((v) => v.id !== volId) }
          : st
      )
    );
    onLogAudit(selectedEvent, `Unassigned ${volName} from duty "${dutyName}"`);
    setNotice(`Unassigned ${volName}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleCreateStationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationName.trim()) return;

    const newStation: DutyStation = {
      id: `st-${Date.now()}`,
      name: newStationName.trim(),
      location: newStationLocation.trim() || 'Campus Operations',
      event: newStationEvent,
      workScope: newStationScope.trim() || 'General checkpoint duties.',
      requiredVolunteers: Math.max(1, Number(newStationRequired) || 2),
      assignedVolunteers: [],
      stationLead: newStationLead.trim() || `${currentUser?.name || 'Officer'} (Lead)`,
    };

    setStations((prev) => [newStation, ...prev]);
    onLogAudit(
      newStation.event,
      `Configured station "${newStation.name}"`
    );

    setShowStationModal(false);
    setNewStationName('');
    setNotice(`Station created`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-4 select-none w-full max-w-full overflow-hidden">
      {/* 1. Ultra-Clean Minimal Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div
          data-testid="metric-stations"
          className="p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.02)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">Stations</span>
            <MapPin size={13} className="text-[#163832]" />
          </div>
          <div className="font-extrabold text-[#051F20] text-lg mt-1">
            <AnimatedNumber value={filteredStations.length} /> <span className="text-xs font-semibold text-[#235347]">Active</span>
          </div>
        </div>

        <div
          data-testid="metric-strength"
          className="p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.02)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">Strength</span>
            <Users size={13} className="text-[#163832]" />
          </div>
          <div className="font-extrabold text-[#163832] text-lg mt-1">
            <AnimatedNumber value={totalAssigned} /> <span className="text-xs font-semibold text-[#235347]">/ {totalRequired}</span>
          </div>
        </div>

        <div
          data-testid="metric-coverage"
          className="p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.02)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">Coverage</span>
            <CheckCircle2 size={13} className="text-[#163832]" />
          </div>
          <div className="font-extrabold text-[#051F20] text-lg mt-1">
            {coveragePercent}%
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#163832] uppercase tracking-wider">Scope</span>
            <span className="text-[10px] font-bold text-[#235347] truncate max-w-[80px]">
              {selectedEvent === 'All Operations' ? 'All' : selectedEvent}
            </span>
          </div>
          <button
            type="button"
            data-testid="btn-assign-duty-header"
            onClick={() => openAssignModal()}
            className="mt-1 h-8 px-2 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
          >
            <Briefcase size={13} />
            <span>Assign Duty</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-2.5 px-3.5 rounded-xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={14} className="text-[#163832] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Stations Board Container */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.03)] space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]/60">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
              Duty Stations
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]/50">
              {filteredStations.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!readOnly && (
              <button
                type="button"
                data-testid="btn-add-station"
                onClick={() => setShowStationModal(true)}
                className="h-8 px-2.5 rounded-xl border border-[#DAF1DE] text-[#163832] hover:bg-[#DAF1DE] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus size={13} />
                <span>Station</span>
              </button>
            )}

            <button
              type="button"
              data-testid="btn-assign-duty-main"
              onClick={() => openAssignModal()}
              className="h-8 px-3 rounded-xl bg-[#163832] text-white hover:bg-[#0B2B26] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <Plus size={13} />
              <span>Assign</span>
            </button>
          </div>
        </div>

        {/* Minimal Search & Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-5 relative">
            <select
              data-testid="event-filter-select"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full h-8.5 pl-3 pr-8 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-bold text-[#051F20] outline-none focus:border-[#163832] transition-all cursor-pointer appearance-none"
            >
              {availableEvents.map((evt) => (
                <option key={evt} value={evt}>
                  {evt}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] pointer-events-none"
            />
          </div>

          <div className="sm:col-span-4">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search..."
              style={{ height: '34px' }}
            />
          </div>

          <div className="sm:col-span-3 flex items-center gap-1 h-8.5">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`flex-1 h-full rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                statusFilter === 'all'
                  ? 'bg-[#163832] text-white border-transparent'
                  : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('needs_volunteers')}
              className={`flex-1 h-full rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                statusFilter === 'needs_volunteers'
                  ? 'bg-[#163832] text-white border-transparent'
                  : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE]'
              }`}
            >
              Open
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('full')}
              className={`flex-1 h-full rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                statusFilter === 'full'
                  ? 'bg-[#163832] text-white border-transparent'
                  : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE]'
              }`}
            >
              Full
            </button>
          </div>
        </div>

        {/* 3. Station Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {filteredStations.length > 0 ? (
            filteredStations.map((st) => {
              const isFull = st.assignedVolunteers.length >= st.requiredVolunteers;
              const fillPercent =
                st.requiredVolunteers > 0
                  ? Math.min(100, Math.round((st.assignedVolunteers.length / st.requiredVolunteers) * 100))
                  : 0;

              return (
                <div
                  key={st.id}
                  data-testid={`station-card-${st.id}`}
                  className="p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#051F20] text-xs sm:text-sm truncate">
                          {st.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#235347]">
                          <span className="truncate">{st.location}</span>
                          <span className="text-[#8EB69B]">•</span>
                          <span className="font-semibold text-[#163832] truncate">{st.event}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isFull
                              ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]'
                              : 'bg-[rgba(242,184,75,0.18)] text-[#051F20] border border-[rgba(242,184,75,0.4)]'
                          }`}
                        >
                          {st.assignedVolunteers.length}/{st.requiredVolunteers}
                        </span>
                        <div className="w-12 h-1 bg-[#DAF1DE] rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#163832] rounded-full transition-all duration-300"
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scope Pill */}
                    <div className="px-2.5 py-1.5 rounded-xl bg-white border border-[#DAF1DE]/70 text-[11px] text-[#235347] truncate">
                      {st.workScope}
                    </div>

                    {/* Volunteers List */}
                    <div className="space-y-1 pt-1 border-t border-[#DAF1DE]/70">
                      {st.assignedVolunteers.length > 0 ? (
                        st.assignedVolunteers.map((vol) => (
                          <div
                            key={vol.id}
                            className="p-2 rounded-xl bg-white border border-[#DAF1DE]/80 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[10px] bg-[#DAF1DE] text-[#051F20]">
                                {vol.rollNo}
                              </span>
                              <span className="font-bold text-[#051F20] truncate">{vol.name}</span>
                              <span className="text-[11px] text-[#235347] font-semibold truncate">
                                · Duty: {vol.duty}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-semibold text-[#8EB69B]">
                                {vol.shift.split(' ')[0]}
                              </span>
                              {!readOnly && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUnassignVolunteer(st.id, vol.id, vol.name, vol.duty)
                                  }
                                  className="text-[#D9534F] hover:bg-[#D9534F]/10 p-1 rounded cursor-pointer transition-all"
                                  title="Unassign Volunteer"
                                  aria-label={`Unassign ${vol.name}`}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-center text-[11px] text-[#235347]/80">
                          No assignments yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      data-testid={`btn-assign-to-${st.id}`}
                      onClick={() => openAssignModal(st)}
                      className="w-full h-8 mt-1 rounded-xl bg-white border border-[#DAF1DE] text-[#163832] hover:bg-[#DAF1DE] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus size={13} />
                      <span>Assign</span>
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full">
              <EmptyState
                mascot="shield"
                title="No Stations"
                description="No checkpoints for this scope."
                actionLabel="+ Assign Duty"
                onAction={() => openAssignModal()}
              />
              <div className="flex items-center justify-center gap-2 -mt-4 mb-4">
                <button
                  type="button"
                  onClick={() => setShowStationModal(true)}
                  className="h-8 px-3 rounded-xl bg-white border border-[#163832] text-[#163832] text-xs font-bold cursor-pointer"
                >
                  + New Station
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. CENTER FLOATING MODAL: Assign Duty */}
      {showAssignModal && (
        <div
          data-testid="modal-assign-duty"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#051F20]/75 backdrop-blur-md select-none transition-all duration-300 animate-fadeIn overflow-y-auto"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAssignModal(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_rgba(5,31,32,0.30)] border border-[#DAF1DE] space-y-3.5 max-h-[88vh] overflow-y-auto flex flex-col"
            style={{
              animation: 'geohubModalPopIn 220ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} strokeWidth={2.4} />
                </div>
                <h3 className="font-bold text-[#051F20] text-base">
                  Assign Duty to Person & Work
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="w-7 h-7 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold transition-colors"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAssignDutySubmit} className="space-y-3">
              {/* Field 1: Station */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={12} />
                  <span>Station Checkpoint *</span>
                </label>
                <div className="relative">
                  <select
                    data-testid="select-target-station"
                    required
                    value={formStationId}
                    onChange={(e) => {
                      const sid = e.target.value;
                      setFormStationId(sid);
                      const found = stations.find((s) => s.id === sid);
                      setTargetStationForAssign(found || null);
                    }}
                    className="w-full h-9.5 pl-3 pr-8 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832] appearance-none cursor-pointer"
                  >
                    <option value="">Choose Station...</option>
                    {stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.event})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] pointer-events-none"
                  />
                </div>
              </div>

              {/* Field 2: Scholar */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider flex items-center gap-1">
                  <UserCheck size={12} />
                  <span>Assignee Scholar *</span>
                </label>
                <div className="relative">
                  <select
                    data-testid="select-volunteer-person"
                    required
                    value={formRollNo}
                    onChange={(e) => {
                      const roll = e.target.value;
                      setFormRollNo(roll);
                      const found = selectableUsers.find(
                        (u) => u.rollNo === roll || u.email?.startsWith(roll.toLowerCase())
                      );
                      if (found) {
                        setFormPersonName(found.name);
                      }
                    }}
                    className="w-full h-9.5 pl-3 pr-8 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832] appearance-none cursor-pointer"
                  >
                    <option value="">Choose Scholar...</option>
                    {selectableUsers
                      .filter((u) => u.rollNo)
                      .map((u) => (
                        <option key={u.uid} value={u.rollNo}>
                          {u.rollNo} — {u.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] pointer-events-none"
                  />
                </div>
              </div>

              {/* Field 3: Selective Work with Quick Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider flex items-center gap-1">
                  <Briefcase size={12} />
                  <span>Duty Responsibility *</span>
                </label>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1">
                  {QUICK_CHIPS.map((chip) => {
                    const isSelected = formDutyPreset === chip.duty;
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => {
                          setFormDutyPreset(chip.duty);
                          setFormCustomDuty('');
                        }}
                        className={`h-6.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#163832] text-white border-[#163832]'
                            : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE] hover:border-[#8EB69B]'
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <select
                    data-testid="select-duty-preset"
                    value={formDutyPreset}
                    onChange={(e) => setFormDutyPreset(e.target.value)}
                    className="w-full h-9 pl-3 pr-8 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832] appearance-none cursor-pointer"
                  >
                    {PRESET_DUTIES.map((duty) => (
                      <option key={duty} value={duty}>
                        {duty}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] pointer-events-none"
                  />
                </div>

                {formDutyPreset === 'Custom Duty Work...' && (
                  <input
                    type="text"
                    required
                    data-testid="input-custom-duty"
                    placeholder="Custom duty..."
                    value={formCustomDuty}
                    onChange={(e) => setFormCustomDuty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#163832] text-xs text-[#051F20] bg-white outline-none"
                  />
                )}
              </div>

              {/* Field 4: Shift (Segmented Pills) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider flex items-center gap-1">
                  <Clock size={12} />
                  <span>Shift</span>
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {SHIFT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormShift(opt.id)}
                      className={`h-8 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                        formShift === opt.id
                          ? 'bg-[#163832] text-white border-[#163832] shadow-xs'
                          : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE] hover:border-[#8EB69B]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 5: Clearance (Segmented Pills) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider flex items-center gap-1">
                  <Shield size={12} />
                  <span>Clearance Level</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CLEARANCE_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormAccessLevel(c.id)}
                      className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        formAccessLevel === c.id
                          ? 'bg-[#163832] text-white border-[#163832] shadow-xs'
                          : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE] hover:border-[#8EB69B]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DAF1DE]/70">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="btn-submit-duty"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>Deploy Duty</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CENTER FLOATING MODAL: Create Station */}
      {showStationModal && (
        <div
          data-testid="modal-create-station"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#051F20]/75 backdrop-blur-md select-none transition-all duration-300 animate-fadeIn overflow-y-auto"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowStationModal(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_rgba(5,31,32,0.30)] border border-[#DAF1DE] space-y-3.5 max-h-[88vh] overflow-y-auto flex flex-col"
            style={{
              animation: 'geohubModalPopIn 220ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
                  <Building2 size={16} strokeWidth={2.4} />
                </div>
                <h3 className="font-bold text-[#051F20] text-base">
                  New Duty Station
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStationModal(false)}
                className="w-7 h-7 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold transition-colors"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateStationSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">
                  Station Name *
                </label>
                <input
                  type="text"
                  required
                  data-testid="input-station-name"
                  placeholder="e.g. Pavilion Entry"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gate 3"
                    value={newStationLocation}
                    onChange={(e) => setNewStationLocation(e.target.value)}
                    className="w-full h-9.5 px-3 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">
                    Event
                  </label>
                  <div className="relative">
                    <select
                      value={newStationEvent}
                      onChange={(e) => setNewStationEvent(e.target.value)}
                      className="w-full h-9.5 pl-3 pr-8 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832] appearance-none"
                    >
                      {availableEvents
                        .filter((e) => e !== 'All Operations')
                        .map((evt) => (
                          <option key={evt} value={evt}>
                            {evt}
                          </option>
                        ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">
                  Scope
                </label>
                <input
                  type="text"
                  required
                  placeholder="Operational responsibilities..."
                  value={newStationScope}
                  onChange={(e) => setNewStationScope(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">
                    Strength *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={newStationRequired}
                    onChange={(e) => setNewStationRequired(Number(e.target.value))}
                    className="w-full h-9.5 px-3 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">
                    Lead Officer
                  </label>
                  <input
                    type="text"
                    placeholder="Officer name"
                    value={newStationLead}
                    onChange={(e) => setNewStationLead(e.target.value)}
                    className="w-full h-9.5 px-3 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DAF1DE]/70">
                <button
                  type="button"
                  onClick={() => setShowStationModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="btn-submit-station"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Create Station</span>
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
