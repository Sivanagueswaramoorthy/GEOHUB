import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuperAdminDesktopStudio } from '../desktop/SuperAdminDesktopStudio';
import { AppProvider } from '../../../context/AppContext';

// Mock state builder
const createMockState = () => {
  return {
    activeDeck: 'home' as const,
    setActiveDeck: vi.fn(),
    activeTab: 'home' as const,
    setActiveTab: vi.fn(),
    rolesCredentials: [
      {
        role: 'super_admin',
        badge: 'Super Admin',
        default_post: 'System Administrator',
        default_name: 'System SuperAdmin',
        default_roll: 'SA01',
        default_email: 'superadmin@college.edu',
      },
      {
        role: 'coordinator',
        badge: 'Coordinator',
        default_post: 'Club President',
        default_name: 'Alex Rivera',
        default_roll: '21GEO001',
        default_email: 'alex.rivera@college.edu',
      },
    ],
    faculty: [
      {
        id: 'fac-1',
        roll_no: 'FAC01',
        name: 'Dr. Sarah Jenkins',
        designation: 'Senior Faculty Advisor',
        department: 'Geoinformatics',
        email: 'sarah.jenkins@college.edu',
        phone: '+91 94420 18821',
        status: 'active',
        last_seen_at: new Date().toISOString(),
      },
    ],
    students: [
      {
        id: 'std-1',
        roll_no: '21GEO001',
        name: 'Alex Rivera',
        role: 'coordinator',
        department: 'Geoinformatics',
        year_of_study: '4th Year',
        team: 'Management',
        post: 'Club President',
        email: 'alex.rivera@college.edu',
        status: 'active',
        last_seen_at: new Date().toISOString(),
      },
      {
        id: 'std-2',
        roll_no: '22GEO019',
        name: 'Ananya Iyer',
        role: 'treasurer',
        department: 'Geoinformatics',
        year_of_study: '3rd Year',
        team: 'Management',
        post: 'Treasurer',
        email: 'ananya.iyer@college.edu',
        status: 'active',
        last_seen_at: new Date().toISOString(),
      },
    ],
    allMembers: [
      {
        id: 'std-1',
        kind: 'student' as const,
        roll_no: '21GEO001',
        name: 'Alex Rivera',
        role: 'coordinator',
        department: 'Geoinformatics',
        year_of_study: '4th Year',
        team: 'Management',
        post: 'Club President',
        email: 'alex.rivera@college.edu',
        status: 'active' as const,
      },
    ],
    modules: [
      {
        key: 'events',
        label: 'Events & Hackathons Hub',
        description: 'Academic hackathons',
        iconName: 'Calendar',
        enabled: true,
      },
    ],
    roleModuleAccess: {
      super_admin: { events: true },
      coordinator: { events: true },
    },
    toggleRoleModuleAccess: vi.fn(),
    setAllRoleModuleAccess: vi.fn(),
    addStudent: vi.fn(),
    addFaculty: vi.fn(),
    saveStudent: vi.fn(),
    saveFaculty: vi.fn(),
    deleteMember: vi.fn(),
    toggleSuspendMember: vi.fn(),
    assignMemberPost: vi.fn(),
    updateMemberModules: vi.fn(),
    toggleModule: vi.fn(),
    overviewCounts: {
      faculty: 1,
      students: 2,
      users: 4,
      online: 3,
      modulesLive: 9,
      modulesTotal: 9,
    },
    diagnostics: {
      host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
      port: 4000,
      dialect: 'mysql',
      latency_ms: 24,
      engine: 'TiDB v8.1.0 Cloud Serverless',
      status: 'operational',
      health: 'Optimal',
    },
    latencyMs: 24,
    isPinging: false,
    pingDatabase: vi.fn(),
    isDbConnected: true,
    toggleDbConnected: vi.fn(),
    isBackendActive: true,
    toggleBackendActive: vi.fn(),
    isFreezeMode: false,
    toggleFreezeMode: vi.fn(),
    toast: null,
    showToast: vi.fn(),
    hideToast: vi.fn(),
    onlineUsers: [
      {
        id: 'std-1',
        name: 'Alex Rivera',
        roll_no: '21GEO001',
        role: 'coordinator',
        last_seen_at: new Date().toISOString(),
        platform: 'Web',
        app_version: '1.6.58',
      },
    ],
  };
};

describe('SuperAdminDesktopStudio & Desktop Views Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Desktop Studio with translucent frosted sidebar and navigation groups', () => {
    const mockState = createMockState();
    render(
      <AppProvider>
        <SuperAdminDesktopStudio state={mockState as any} />
      </AppProvider>
    );

    // Sidebar Branding
    expect(screen.getByText('GEO HUB')).toBeDefined();
    expect(screen.getByText('Master Studio')).toBeDefined();

    // Quick Search capsule
    expect(screen.getByText('Quick search...')).toBeDefined();
    expect(screen.getByText('⌘K')).toBeDefined();

    // Navigation sections
    expect(screen.getByText(/Dashboard/i)).toBeDefined();
    expect(screen.getByText(/Your Team/i)).toBeDefined();
    expect(screen.getByText(/Access & Roles/i)).toBeDefined();
    expect(screen.getByText(/Provisioning/i)).toBeDefined();
    expect(screen.getAllByText(/Activity Logs/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/TiDB Cloud/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Mobile Frame/i)).toBeDefined();

    // Profile Capsule
    expect(screen.getByText('SuperAdmin Root')).toBeDefined();
    expect(screen.getByText('superadmin@geohub.edu')).toBeDefined();
  });

  it('renders Desktop Dashboard view with hero card, donut metric, schedule card, and KPIs', () => {
    const mockState = createMockState();
    render(
      <AppProvider>
        <SuperAdminDesktopStudio state={mockState as any} />
      </AppProvider>
    );

    // Dashboard Greeting & Header
    expect(screen.getByText(/Master SuperAdmin/i)).toBeDefined();
    expect(screen.getByText(/All 9 campus systems operational/i)).toBeDefined();

    // Hero Card Content matching Image 2
    expect(screen.getByText(/Your campus is on a/i)).toBeDefined();
    expect(screen.getByText('roll')).toBeDefined();
    expect(screen.getByText(/68%/i)).toBeDefined();
    expect(screen.getByText('shipped')).toBeDefined();

    // 4 KPI Cards
    expect(screen.getByText('Active people')).toBeDefined();
    expect(screen.getByText('Faculty mentors')).toBeDefined();
    expect(screen.getByText('System uptime')).toBeDefined();

    // Schedule Widget
    expect(screen.getAllByText(/November/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Faculty Council Sync")).toBeDefined();
    expect(screen.getByText("Breakthrough Brainstorm")).toBeDefined();
  });

  it('switches to Your Team view matching Code XR Image 1 with member cards and segmented filter pills', () => {
    const mockState = createMockState();
    render(
      <AppProvider>
        <SuperAdminDesktopStudio state={mockState as any} />
      </AppProvider>
    );

    // Click 'Your Team' in sidebar
    const teamNavBtn = screen.getByRole('button', { name: /Your Team/i });
    fireEvent.click(teamNavBtn);

    // Title and Subtitle matching Image 1
    expect(screen.getByRole('heading', { name: 'Your team' })).toBeDefined();
    expect(screen.getByText(/people ·/i)).toBeDefined();

    // Segmented Status Filter Pills
    expect(screen.getByRole('tab', { name: 'All' })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Online/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'Students' })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'Faculty' })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'Suspended' })).toBeDefined();

    // Member Cards in grid
    expect(screen.getByText('Dr. Sarah Jenkins')).toBeDefined();
    expect(screen.getByText('Alex Rivera')).toBeDefined();
    expect(screen.getByText('Ananya Iyer')).toBeDefined();

    // Member Card Action Buttons
    const dossierButtons = screen.getAllByRole('button', { name: /Dossier/i });
    expect(dossierButtons.length).toBeGreaterThan(0);

    const assignButtons = screen.getAllByRole('button', { name: /Assign/i });
    expect(assignButtons.length).toBeGreaterThan(0);
  });

  it('switches to Role Access & Permissions view and displays matrix', () => {
    const mockState = createMockState();
    render(
      <AppProvider>
        <SuperAdminDesktopStudio state={mockState as any} />
      </AppProvider>
    );

    // Click 'Access & Roles' in sidebar
    const accessNavBtn = screen.getByRole('button', { name: /Access & Roles/i });
    fireEvent.click(accessNavBtn);

    // Verify Heading
    const headings = screen.getAllByRole('heading', { name: /Role Access & Permissions/i });
    expect(headings.length).toBeGreaterThan(0);
  });

  it('opens and closes global ⌘K quick search palette', () => {
    const mockState = createMockState();
    render(
      <AppProvider>
        <SuperAdminDesktopStudio state={mockState as any} />
      </AppProvider>
    );

    // Click search trigger in sidebar
    const searchTrigger = screen.getByTitle(/Search studio actions and members/i);
    fireEvent.click(searchTrigger);

    // Verify search modal is open
    expect(screen.getByPlaceholderText(/Type a command or jump to screen/i)).toBeDefined();
    expect(screen.getByText('Go to Studio Dashboard')).toBeDefined();
    expect(screen.getByText('Inspect Your Team Directory')).toBeDefined();

    // Close modal via Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByPlaceholderText(/Type a command or jump to screen/i)).toBeNull();
  });
});
