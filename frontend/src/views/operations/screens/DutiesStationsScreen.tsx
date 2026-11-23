import React, { useState, useEffect, useMemo } from 'react';
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
  Briefcase,
  Search,
  Filter,
  UserCheck,
  Building2,
  Edit2,
  Radio,
  ChevronDown,
} from 'lucide-react';
import { AnimatedNumber, EmptyState, SearchField } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

export interface StationVolunteer {
  id: string;
  name: string;
  rollNo: string;
  duty: string; // Selective work / duty task description
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

// Preset selective work categories for rapid duty allocation
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

export const DEFAULT_DUTY_STATIONS: DutyStation[] = [
  {
    id: 'st-01',
    name: 'Main Gate Turnstiles & Access Pass Desk',
    location: 'North Perimeter Gate 1',
    event: 'Smart Campus Drone Survey',
    workScope: 'Validate digital scholar passes, scan attendance QR, and manage entry flow.',
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
    workScope: 'Issue survey badge lanyards, verify club registration numbers, and hand out sensors.',
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
    workScope: 'Secure launch perimeter, log drone takeoffs, monitor battery replenishment.',
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
    workScope: 'Maintain specimen recording logs, assist field researchers, and safety oversight.',
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
    workScope: 'Central dispatch, first-aid medical supplies, lost & found, radio relay.',
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

  // Load persisted stations or use rich defaults
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

  // Sync to local storage whenever stations change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stations));
      }
    } catch {
      // ignore
    }
  }, [stations]);

  // Event filter selection
  const [selectedEvent, setSelectedEvent] = useState<string>('All Operations');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_volunteers' | 'full'>('all');
  const [notice, setNotice] = useState<string | null>(null);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [targetStationForAssign, setTargetStationForAssign] = useState<DutyStation | null>(null);

  // Form state: Assign Duty to Selective Person & Selective Work
  const initialUser = (users && users.find((u) => u.rollNo)) || null;
  const [formRollNo, setFormRollNo] = useState(initialUser?.rollNo || '24GEO102');
  const [formPersonName, setFormPersonName] = useState(initialUser?.name || 'Maya Patel');
  const [formStationId, setFormStationId] = useState<string>('');
  const [formDutyPreset, setFormDutyPreset] = useState<string>(PRESET_DUTIES[0]);
  const [formCustomDuty, setFormCustomDuty] = useState<string>('');
  const [formShift, setFormShift] = useState<string>('08:30 AM - 01:00 PM');
  const [formAccessLevel, setFormAccessLevel] = useState<'lead' | 'scanner' | 'support'>('support');
  const [formIsLead, setFormIsLead] = useState<boolean>(false);

  // Form state: Create New Duty Station
  const [newStationName, setNewStationName] = useState('');
  const [newStationLocation, setNewStationLocation] = useState('Campus Operations Sector');
  const [newStationEvent, setNewStationEvent] = useState('Smart Campus Drone Survey');
  const [newStationScope, setNewStationScope] = useState('Station checkpoint and verification operations.');
  const [newStationRequired, setNewStationRequired] = useState<number>(3);
  const [newStationLead, setNewStationLead] = useState('Maya Patel (Lead)');

  // Effective list of selectable personnel with scholars fallback
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

  // Effective list of unique events
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

  // Filtered stations based on event and search
  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
      // Event filter
      if (selectedEvent !== 'All Operations' && st.event !== selectedEvent) {
        return false;
      }

      // Status filter
      const isFull = st.assignedVolunteers.length >= st.requiredVolunteers;
      if (statusFilter === 'needs_volunteers' && isFull) return false;
      if (statusFilter === 'full' && !isFull) return false;

      // Search query
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

  // Aggregate Metrics
  const totalAssigned = useMemo(
    () => filteredStations.reduce((sum, s) => sum + s.assignedVolunteers.length, 0),
    [filteredStations]
  );
  const totalRequired = useMemo(
    () => filteredStations.reduce((sum, s) => sum + s.requiredVolunteers, 0),
    [filteredStations]
  );
  const coveragePercent = totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 100) : 0;

  // Open Assign Modal for a specific station or generally
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

    // Set initial person if not set
    if (!formRollNo && users && users.length > 0) {
      const u = users.find((usr) => usr.rollNo) || users[0];
      setFormRollNo(u.rollNo || '');
      setFormPersonName(u.name);
    }

    setShowAssignModal(true);
  };

  // Handle Assign Duty Form Submission
  const handleAssignDutySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedStId = formStationId || (targetStationForAssign ? targetStationForAssign.id : stations[0]?.id);
    if (!selectedStId) {
      return;
    }

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
      isLead: formIsLead || formAccessLevel === 'lead',
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
    setNotice(
      `Assigned "${effectiveDuty}" to ${newVolunteer.name} at ${stationName}.`
    );
    setTimeout(() => setNotice(null), 4000);
  };

  // Handle Remove / Unassign Volunteer
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
    setNotice(`Unassigned ${volName} from duty.`);
    setTimeout(() => setNotice(null), 3500);
  };

  // Handle Create New Station Form Submission
  const handleCreateStationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationName.trim()) return;

    const newStation: DutyStation = {
      id: `st-${Date.now()}`,
      name: newStationName.trim(),
      location: newStationLocation.trim() || 'Campus Operations Zone',
      event: newStationEvent,
      workScope: newStationScope.trim() || 'General operational duty and checkpoint clearance.',
      requiredVolunteers: Math.max(1, Number(newStationRequired) || 2),
      assignedVolunteers: [],
      stationLead: newStationLead.trim() || `${currentUser?.name || 'Station Officer'} (Lead)`,
    };

    setStations((prev) => [newStation, ...prev]);
    onLogAudit(
      newStation.event,
      `Configured new duty station "${newStation.name}" at ${newStation.location} (Capacity: ${newStation.requiredVolunteers})`
    );

    setShowStationModal(false);
    setNewStationName('');
    setNewStationLocation('');
    setNewStationScope('');
    setNewStationLead('');
    setNotice(`Station "${newStation.name}" added to duty board.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Metric: Stations */}
        <div
          data-testid="metric-stations"
          className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">
              Stations
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <MapPin size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={filteredStations.length} /> Active
          </div>
        </div>

        {/* Metric: Strength */}
        <div
          data-testid="metric-strength"
          className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">
              Strength
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Users size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-base sm:text-lg mt-1">
            <AnimatedNumber value={totalAssigned} /> / {totalRequired}
          </div>
        </div>

        {/* Metric: Coverage */}
        <div
          data-testid="metric-coverage"
          className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">
              Coverage
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            {coveragePercent}%
          </div>
        </div>

        {/* Action: Scope Event & Assign Duties Button */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#163832] uppercase tracking-wide">
              Scope
            </span>
            <span className="text-[11px] font-bold text-[#235347] px-1.5 py-0.2 rounded-full bg-white/70 border border-[#8EB69B]/50 truncate max-w-[90px]">
              {selectedEvent === 'All Operations' ? 'All Events' : selectedEvent}
            </span>
          </div>
          <button
            type="button"
            data-testid="btn-assign-duty-header"
            onClick={() => openAssignModal()}
            className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
          >
            <Briefcase size={13} />
            <span>Assign Duty</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832] shrink-0" />
          <span className="truncate">{notice}</span>
        </div>
      )}

      {/* 2. Operational Controls & Event Filter */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#DAF1DE]/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
                Duties and Operational Station Board
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
                {filteredStations.length} Checkpoints
              </span>
            </div>
            <p className="text-xs text-[#235347]">
              Deploy selective persons to specific operational works and turnstile stations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            {!readOnly && (
              <button
                type="button"
                data-testid="btn-add-station"
                onClick={() => setShowStationModal(true)}
                className="h-9 px-3 rounded-xl border border-[#163832] text-[#163832] hover:bg-[#DAF1DE] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Plus size={14} />
                <span>New Station</span>
              </button>
            )}

            <button
              type="button"
              data-testid="btn-assign-duty-main"
              onClick={() => openAssignModal()}
              className="h-9 px-3.5 rounded-xl bg-[#163832] text-white hover:bg-[#0B2B26] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs shrink-0"
            >
              <Briefcase size={14} />
              <span>Assign Duty</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Event Dropdown + Search + Status Chips */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* Event Filter Dropdown */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-bold text-[#235347] uppercase tracking-wider mb-1">
              Filter by Event
            </label>
            <div className="relative">
              <select
                data-testid="event-filter-select"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full h-9 pl-3 pr-8 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-bold text-[#051F20] outline-none focus:border-[#163832] transition-all cursor-pointer appearance-none"
              >
                {availableEvents.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] pointer-events-none"
              />
            </div>
          </div>

          {/* Search Field */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-[#235347] uppercase tracking-wider mb-1">
              Search Personnel / Work
            </label>
            <div className="h-9">
              <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search person, roll no, duty..."
                style={{ height: '36px' }}
              />
            </div>
          </div>

          {/* Status Filter Chips */}
          <div className="md:col-span-3 flex flex-col justify-end">
            <label className="block text-[11px] font-bold text-[#235347] uppercase tracking-wider mb-1">
              Capacity Status
            </label>
            <div className="flex items-center gap-1.5 h-9">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`h-9 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  statusFilter === 'all'
                    ? 'bg-[#163832] text-white border-transparent shadow-xs'
                    : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE] hover:bg-[#DAF1DE]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('needs_volunteers')}
                className={`h-9 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  statusFilter === 'needs_volunteers'
                    ? 'bg-[#163832] text-white border-transparent shadow-xs'
                    : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE] hover:bg-[#DAF1DE]'
                }`}
              >
                Openings
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('full')}
                className={`h-9 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  statusFilter === 'full'
                    ? 'bg-[#163832] text-white border-transparent shadow-xs'
                    : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE] hover:bg-[#DAF1DE]'
                }`}
              >
                Full
              </button>
            </div>
          </div>
        </div>

        {/* 3. Stations & Duties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
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
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Header: Title, Event Badge, Capacity Pill */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          <MapPin size={16} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-[#051F20] text-xs sm:text-sm truncate">
                            {st.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-[#235347] font-medium truncate">
                              {st.location}
                            </span>
                            <span className="text-xs text-[#8EB69B]">•</span>
                            <span className="px-1.5 py-0.2 rounded-md bg-[#DAF1DE] text-[#163832] text-[10px] font-bold truncate max-w-[140px]">
                              {st.event}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            isFull
                              ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]'
                              : 'bg-[rgba(242,184,75,0.18)] text-[#051F20] border border-[rgba(242,184,75,0.4)]'
                          }`}
                        >
                          {st.assignedVolunteers.length}/{st.requiredVolunteers}
                        </span>
                        <div className="w-14 h-1.5 bg-[#DAF1DE] rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#163832] rounded-full transition-all duration-300"
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Operational Scope / Work Description */}
                    <div className="p-2 rounded-xl bg-white/70 border border-[#DAF1DE]/70 text-xs text-[#235347] leading-relaxed">
                      <strong className="text-[#051F20] font-semibold">Scope of Work: </strong>
                      {st.workScope}
                    </div>

                    <div className="text-xs text-[#235347] flex items-center justify-between">
                      <span>
                        Station Lead: <strong className="text-[#051F20]">{st.stationLead}</strong>
                      </span>
                    </div>

                    {/* Assigned Personnel & Selective Duties List */}
                    <div className="space-y-1.5 pt-1.5 border-t border-[#DAF1DE]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">
                          Deployed Duty Roster ({st.assignedVolunteers.length})
                        </span>
                      </div>

                      {st.assignedVolunteers.length > 0 ? (
                        st.assignedVolunteers.map((vol) => (
                          <div
                            key={vol.id}
                            className="p-2 rounded-xl bg-white border border-[#DAF1DE] flex flex-col gap-1 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[11px] bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]/40">
                                  {vol.rollNo}
                                </span>
                                <span className="font-bold text-[#051F20] truncate">{vol.name}</span>
                                {vol.isLead && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#163832] text-white">
                                    Lead Officer
                                  </span>
                                )}
                                {vol.accessLevel === 'scanner' && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
                                    Pass Scanner
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[#235347] text-[11px] font-semibold">
                                  {vol.shift}
                                </span>
                                {!readOnly && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUnassignVolunteer(st.id, vol.id, vol.name, vol.duty)
                                    }
                                    className="text-[#D9534F] hover:bg-[#D9534F]/10 p-1 rounded-md cursor-pointer transition-all"
                                    title="Unassign Volunteer"
                                    aria-label={`Unassign ${vol.name}`}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Specific Selective Duty Badge */}
                            <div className="flex items-center gap-1.5 text-[11px] text-[#163832] font-semibold bg-[#DAF1DE]/40 px-2 py-0.5 rounded-lg border border-[#8EB69B]/30">
                              <Briefcase size={12} className="text-[#235347] shrink-0" />
                              <span className="truncate">Duty: {vol.duty}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2.5 rounded-xl bg-white/50 border border-dashed border-[#DAF1DE] text-center text-xs text-[#235347]">
                          No volunteers deployed to this station yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Station Quick Action: Assign Duty */}
                  {!readOnly && (
                    <button
                      type="button"
                      data-testid={`btn-assign-to-${st.id}`}
                      onClick={() => openAssignModal(st)}
                      className="w-full h-8 mt-1 rounded-xl bg-white border border-[#163832] text-[#163832] hover:bg-[#DAF1DE] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                    >
                      <Plus size={13} />
                      <span>Assign Duty to Station</span>
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
                description={`No stations configured for "${selectedEvent}". Configure turnstiles or deploy duties now.`}
                actionLabel="+ Assign Duty"
                onAction={() => openAssignModal()}
              />
              <div className="flex items-center justify-center gap-2 -mt-4 mb-4">
                <button
                  type="button"
                  onClick={() => setShowStationModal(true)}
                  className="h-9 px-4 rounded-xl bg-white border border-[#163832] text-[#163832] hover:bg-[#DAF1DE] text-xs font-bold cursor-pointer transition-all"
                >
                  + Create Duty Station
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL: Assign Duty for Selective Person & Selective Work */}
      {showAssignModal && (
        <div
          data-testid="modal-assign-duty"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center">
                  <Briefcase size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-[#051F20] text-base">
                    Assign Duty to Person & Work
                  </h3>
                  <p className="text-[11px] text-[#235347]">
                    Grant operational access for selective person and specific work.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignDutySubmit} className="space-y-3.5">
              {/* Target Station Selection */}
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  1. Operational Station / Checkpoint *
                </label>
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
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                >
                  <option value="">Select Destination Station...</option>
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.event}) — {st.assignedVolunteers.length}/{st.requiredVolunteers}
                    </option>
                  ))}
                </select>
                {targetStationForAssign && (
                  <p className="mt-1 text-[11px] text-[#235347]">
                    Location: <strong>{targetStationForAssign.location}</strong> • Scope:{' '}
                    {targetStationForAssign.workScope}
                  </p>
                )}
              </div>

              {/* Selective Person Selection */}
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  2. Selective Person (Scholar / Volunteer) *
                </label>
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
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                >
                  <option value="">Choose Selective Person...</option>
                  {selectableUsers
                    .filter((u) => u.rollNo)
                    .map((u) => (
                      <option key={u.uid} value={u.rollNo}>
                        {u.rollNo} — {u.name} ({u.team || 'Scholar'})
                      </option>
                    ))}
                </select>

                <div className="mt-1.5 p-2 rounded-xl bg-[#DAF1DE]/50 border border-[#8EB69B]/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <UserCheck size={14} className="text-[#163832]" />
                    <span className="text-[#235347]">Assigned Person:</span>
                  </div>
                  <strong className="text-[#051F20] font-bold">
                    {formPersonName} ({formRollNo})
                  </strong>
                </div>
              </div>

              {/* Selective Work Selection */}
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  3. Selective Work / Duty Responsibility *
                </label>
                <select
                  data-testid="select-duty-preset"
                  value={formDutyPreset}
                  onChange={(e) => setFormDutyPreset(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                >
                  {PRESET_DUTIES.map((duty) => (
                    <option key={duty} value={duty}>
                      {duty}
                    </option>
                  ))}
                </select>

                {formDutyPreset === 'Custom Duty Work...' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      data-testid="input-custom-duty"
                      placeholder="Specify custom duty task (e.g. VIP Speaker Escort)..."
                      value={formCustomDuty}
                      onChange={(e) => setFormCustomDuty(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-white outline-none focus:border-[#163832]"
                    />
                  </div>
                )}
              </div>

              {/* Operational Shift & Clearance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    4. Assigned Shift
                  </label>
                  <select
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none"
                  >
                    <option value="08:30 AM - 01:00 PM">Morning Shift (08:30 - 13:00)</option>
                    <option value="01:00 PM - 05:30 PM">Afternoon Shift (13:00 - 17:30)</option>
                    <option value="Full Day (08:30 - 17:30)">Full Day (08:30 - 17:30)</option>
                    <option value="Evening Relay (17:00 - 20:30)">Evening Relay (17:00 - 20:30)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    5. Access Clearance Level
                  </label>
                  <select
                    value={formAccessLevel}
                    onChange={(e) =>
                      setFormAccessLevel(e.target.value as 'lead' | 'scanner' | 'support')
                    }
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none"
                  >
                    <option value="support">Duty Support (Roster)</option>
                    <option value="scanner">Authorized QR Scanner</option>
                    <option value="lead">Station Lead / Officer</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DAF1DE]">
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
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer shadow-xs transition-all"
                >
                  Confirm & Deploy Duty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: Create New Duty Station */}
      {showStationModal && (
        <div
          data-testid="modal-create-station"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center">
                  <Building2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-[#051F20] text-base">
                    Configure New Duty Station
                  </h3>
                  <p className="text-[11px] text-[#235347]">
                    Setup checkpoint location, scope of work, and required strength.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStationModal(false)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStationSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Station Name *
                </label>
                <input
                  type="text"
                  required
                  data-testid="input-station-name"
                  placeholder="e.g. South Pavilion Entry Turnstile"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    Venue / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gate 3 South"
                    value={newStationLocation}
                    onChange={(e) => setNewStationLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    Associated Event *
                  </label>
                  <select
                    value={newStationEvent}
                    onChange={(e) => setNewStationEvent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  >
                    {availableEvents
                      .filter((e) => e !== 'All Operations')
                      .map((evt) => (
                        <option key={evt} value={evt}>
                          {evt}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#051F20] mb-1">
                  Operational Scope / Duty Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the operational responsibilities at this station..."
                  value={newStationScope}
                  onChange={(e) => setNewStationScope(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    Required Personnel Count *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={newStationRequired}
                    onChange={(e) => setNewStationRequired(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#051F20] mb-1">
                    Station Officer / Lead
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Officer Name"
                    value={newStationLead}
                    onChange={(e) => setNewStationLead(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DAF1DE]">
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
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer shadow-xs transition-all"
                >
                  Create Station
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
