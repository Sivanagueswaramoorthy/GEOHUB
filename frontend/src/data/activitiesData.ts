export interface ChapterActivity {
  id: string;
  dateStr: string;
  time: string;
  item: string;
  venue: string;
  tag: string;
  status?: 'live' | 'upcoming' | 'completed';
  squad?: string;
}

export const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Comprehensive Chapter Activities for October 2026
export const chapterActivitiesList: ChapterActivity[] = [
  // Today: Oct 26, 2026
  {
    id: 'act_01',
    dateStr: '2026-10-26',
    time: '09:30 AM',
    item: 'GEO FEST 2026: Campus Odyssey Inauguration & Keynote Address',
    venue: 'University Grand Auditorium',
    tag: 'Flagship Event',
    status: 'live',
    squad: 'Management',
  },
  {
    id: 'act_02',
    dateStr: '2026-10-26',
    time: '11:45 AM',
    item: 'Live Satellite Telemetry Demonstration & Drone Flight Exhibition',
    venue: 'North Grounds & Flight Deck',
    tag: 'Technical Demo',
    status: 'upcoming',
    squad: 'Entertainment',
  },
  {
    id: 'act_03',
    dateStr: '2026-10-26',
    time: '02:15 PM',
    item: 'QGIS Hands-on Spatial Mapping & Multispectral Processing Workshop',
    venue: 'Geomatics High-Performance Lab 4B',
    tag: 'Workshop',
    status: 'upcoming',
    squad: 'Promotion',
  },
  {
    id: 'act_04',
    dateStr: '2026-10-26',
    time: '04:30 PM',
    item: 'Inter-Departmental Geo-Treasure Hunt & Campus Orienteering',
    venue: 'Main Campus Quadrangle',
    tag: 'Activity',
    status: 'upcoming',
    squad: 'Entertainment',
  },
  {
    id: 'act_05',
    dateStr: '2026-10-26',
    time: '06:30 PM',
    item: 'Core Committee Day 1 MoM Review & Gate Attendance Audit',
    venue: 'Seminar Hall A',
    tag: 'Meeting',
    status: 'upcoming',
    squad: 'Documentation',
  },

  // Tuesday: Oct 27, 2026
  {
    id: 'act_06',
    dateStr: '2026-10-27',
    time: '10:00 AM',
    item: 'Post-Conclave Delegate Feedback & Verification Desk',
    venue: 'Seminar Hall B',
    tag: 'Audit',
    status: 'upcoming',
    squad: 'Documentation',
  },
  {
    id: 'act_07',
    dateStr: '2026-10-27',
    time: '02:00 PM',
    item: 'Drone Aerial LiDAR Processing & Orthomosaic Stitching Lab',
    venue: 'GIS Lab 2',
    tag: 'Research',
    status: 'upcoming',
    squad: 'Management',
  },
  {
    id: 'act_08',
    dateStr: '2026-10-27',
    time: '04:30 PM',
    item: 'Executive Squad Lead Consultation with Faculty Advisor',
    venue: 'Dean Boardroom',
    tag: 'Executive',
    status: 'upcoming',
    squad: 'Management',
  },

  // Wednesday: Oct 28, 2026
  {
    id: 'act_09',
    dateStr: '2026-10-28',
    time: '11:00 AM',
    item: 'Field Equipment Inventory & Trimble GPS Receiver Inspection',
    venue: 'Field Gear Depo',
    tag: 'Logistics',
    status: 'upcoming',
    squad: 'Management',
  },
  {
    id: 'act_10',
    dateStr: '2026-10-28',
    time: '03:00 PM',
    item: 'Geo-Club Monthly Bulletin & Documentation MoM Archive Review',
    venue: 'Media Suite',
    tag: 'Documentation',
    status: 'upcoming',
    squad: 'Documentation',
  },

  // Thursday: Oct 29, 2026
  {
    id: 'act_11',
    dateStr: '2026-10-29',
    time: '10:30 AM',
    item: 'GIS & Satellite Telemetry Workshop: Batch 2 Practical Session',
    venue: 'Geomatics Lab 4B',
    tag: 'Workshop',
    status: 'upcoming',
    squad: 'Management',
  },
  {
    id: 'act_12',
    dateStr: '2026-10-29',
    time: '02:30 PM',
    item: 'Promotion Squad Social Media Campaign Recap & Video Premiere',
    venue: 'Promotion Room',
    tag: 'Promotion',
    status: 'upcoming',
    squad: 'Promotion',
  },

  // Friday: Oct 30, 2026
  {
    id: 'act_13',
    dateStr: '2026-10-30',
    time: '09:30 AM',
    item: 'Treasurer Financial Audit & Vendor Invoice Settlement',
    venue: 'Finance Office',
    tag: 'Finance',
    status: 'upcoming',
    squad: 'Management',
  },
  {
    id: 'act_14',
    dateStr: '2026-10-30',
    time: '04:00 PM',
    item: 'Monthly All-Hands Chapter Assembly & Star Volunteer Awards',
    venue: 'University Grand Auditorium',
    tag: 'Ceremony',
    status: 'upcoming',
    squad: 'Entertainment',
  },

  // Saturday: Oct 31, 2026
  {
    id: 'act_15',
    dateStr: '2026-10-31',
    time: '10:00 AM',
    item: 'Adyar Estuary Topographic Survey Expedition Planning',
    venue: 'Seminar Hall',
    tag: 'Field Trip',
    status: 'upcoming',
    squad: 'Management',
  },
  {
    id: 'act_16',
    dateStr: '2026-10-31',
    time: '03:00 PM',
    item: 'November Milestone Roadmap & Chapter Council Review',
    venue: 'Executive Boardroom',
    tag: 'Planning',
    status: 'upcoming',
    squad: 'Management',
  },

  // Early October milestones
  {
    id: 'act_17',
    dateStr: '2026-10-01',
    time: '03:00 PM',
    item: 'Auditorium AV Testing & Stage Fabrication for GEO FEST',
    venue: 'Auditorium',
    tag: 'Rehearsal',
    status: 'completed',
    squad: 'Entertainment',
  },
  {
    id: 'act_18',
    dateStr: '2026-10-03',
    time: '10:00 AM',
    item: 'Core Committee Briefing & MoM Review',
    venue: 'Seminar Hall B',
    tag: 'Meeting',
    status: 'completed',
    squad: 'Documentation',
  },
  {
    id: 'act_19',
    dateStr: '2026-10-03',
    time: '02:00 PM',
    item: 'Poster & Media Review (Promotion Squad)',
    venue: 'GIS Lab 2',
    tag: 'Review',
    status: 'completed',
    squad: 'Promotion',
  },
  {
    id: 'act_20',
    dateStr: '2026-10-03',
    time: '05:00 PM',
    item: 'Venue Booking & Turnstile Gate Confirmation',
    venue: 'Grand Auditorium',
    tag: 'Deadline',
    status: 'completed',
    squad: 'Management',
  },
];

export const getWeekDaysForStart = (
  weekStart: Date,
  todayStr: string,
  activities: ChapterActivity[] = chapterActivitiesList
) => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = formatLocalDate(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const hasDot = activities.some((act) => act.dateStr === dateStr);
    const isToday = dateStr === todayStr;
    return { dateStr, dayName, dayNum, hasDot, isToday };
  });
};
