import fs from 'fs';
import path from 'path';

const rawData = JSON.parse(fs.readFileSync('scripts/audit-raw.json', 'utf8'));

// 1. Generate SCREEN_MATRIX.md
const screens = [
  // 3.1 AUTH AND SYSTEM GATES
  {
    screen: 'SplashScreen',
    file: 'frontend/src/components/SplashScreen.tsx',
    roles: 'All (Unauthenticated)',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy CSS animation classes and non-token styling; lacks pure #F6FBF7 background with radial mint glow and floating leaf mascot auto-fade at 1.8s',
    status: 'Pending migration'
  },
  {
    screen: 'LoginPage',
    file: 'frontend/src/features/auth/LoginPage.tsx',
    roles: 'All (Unauthenticated)',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Contains leftover legacy auth styles in login.css; needs globe hero with mint halo, 16px fields, full-width PillButton, and ghost forgot password link',
    status: 'Pending migration'
  },
  {
    screen: 'ForgotPasswordSheet',
    file: 'frontend/src/features/auth/ForgotPasswordSheet.tsx',
    roles: 'All (Unauthenticated)',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy input borders and button classes; must use shared BottomSheet, 16px field, and auto-dismiss toast',
    status: 'Pending migration'
  },
  {
    screen: 'PendingApprovalView',
    file: 'frontend/src/views/auth/PendingApprovalView.tsx',
    roles: 'Pending Users',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses custom card styling, non-token colors (#0F172A, #64748B); needs white card on mint glow, shield mascot, Pending Review chip, Check Status and ghost Sign out pills',
    status: 'Pending migration'
  },
  {
    screen: 'NotFoundView',
    file: 'frontend/src/views/auth/NotFoundView.tsx',
    roles: 'All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses custom illustration; needs lock mascot, headline "No access", subtitle "Clearance required", single "Go home" pill',
    status: 'Pending migration'
  },

  // 3.2 GLOBAL SHELL
  {
    screen: 'Header',
    file: 'frontend/src/components/Header.tsx',
    roles: 'All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Missing mint accent dot on GEO wordmark, missing user squad/post pill, missing frame-mode toggle and QR pass quick launcher, role-switcher not restricted to faculty/dev',
    status: 'Pending migration'
  },
  {
    screen: 'FloatingNav',
    file: 'frontend/src/components/FloatingNav.tsx',
    roles: 'All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Shadow does not match 0 12px 36px rgba(5,31,32,0.12); active pill sizing and transitions require token harmonization',
    status: 'Pending migration'
  },
  {
    screen: 'Responsive Shell & Sidebar',
    file: 'frontend/src/components/navigation/DesktopSidebar.tsx',
    roles: 'All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Desktop sidebar uses hardcoded slate colors and non-pill active tabs; phone frame radius must be 36px',
    status: 'Pending migration'
  },

  // 3.3 STUDENT
  {
    screen: 'StudentHomeView',
    file: 'frontend/src/views/roles/student/StudentHomeView.tsx',
    roles: 'Student',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Bypassed by legacy HomeView.tsx; subtitle mismatch; stat tiles labels not matching spec; needs floating leaf hero card, 3 StatTiles (Events, My QR Pass, Squads), max 3 upcoming event cards',
    status: 'Pending migration'
  },
  {
    screen: 'ClubEventsView (Browse)',
    file: 'frontend/src/views/events/ClubEventsView.tsx',
    roles: 'All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy EventCard, hardcoded colors (#0F172A, #10B981), raw inputs; needs BentoGrid of EventCards, venue chips, capacity ProgressRings, and StatusChips',
    status: 'Pending migration'
  },
  {
    screen: 'Event Detail',
    file: 'frontend/src/views/events/ClubEventsView.tsx',
    roles: 'All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Lacks 32px dark gradient hero (#051F20 to #163832), stacked 24px white cards with #DAF1DE border (Schedule, Capacity ring, Duties checklist), and sticky 2-pill bottom bar',
    status: 'Pending migration'
  },
  {
    screen: 'MyQrView',
    file: 'frontend/src/views/qr/MyQrView.tsx',
    roles: 'Student',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy emerald badge and non-token borders; needs subtitle "Dynamic gate QR pass", radial mint glow, 60s ProgressRing countdown, "Refresh pass" ghost pill',
    status: 'Pending migration'
  },
  {
    screen: 'VolunteerScanView',
    file: 'frontend/src/views/qr/VolunteerScanView.tsx',
    roles: 'Volunteer, Coordinator, Faculty',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses 10px fonts, emerald flashers; needs 28px rounded viewfinder on #051F20, sage-400 brackets, 40px torch/flip buttons, 1.5s result bottom sheet, lock mascot empty state',
    status: 'Pending migration'
  },
  {
    screen: 'TeamsListView (Squads)',
    file: 'frontend/src/views/teams/TeamsListView.tsx',
    roles: 'Student, Coordinator',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy list rows and slate pills; needs 4 bento tiles: Management (clipboard), Documentation (notebook), Promotion (megaphone), Entertainment (trophy) with mascot icons',
    status: 'Pending migration'
  },
  {
    screen: 'MemoriesHubView',
    file: 'frontend/src/views/memories/MemoriesHubView.tsx',
    roles: 'Student, All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses 11px captions and non-token tags; needs 24px image radius masonry grid, bottom-left map-pin chip, and photo detail sheet with GPS and date',
    status: 'Pending migration'
  },
  {
    screen: 'CommunicationForumView',
    file: 'frontend/src/views/forum/CommunicationForumView.tsx',
    roles: 'Student, All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy forum cards with raw text styling; needs 20px channel pills, 24px white chat cards with #DAF1DE border, and "New post" pill',
    status: 'Pending migration'
  },
  {
    screen: 'NotificationsView',
    file: 'frontend/src/views/notifications/NotificationsView.tsx',
    roles: 'All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy notification list items; needs "Mark all" pill, SegmentedTabs All/Unread, 24px rows with 40px circular icons, unread dot',
    status: 'Pending migration'
  },
  {
    screen: 'ProfileView',
    file: 'frontend/src/views/profile/ProfileView.tsx',
    roles: 'All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy cards, slate text, and unrestricted role switcher; needs 72px avatar, squad/post chips, dossier, conditional role switch (faculty/dev only), destructive Sign out pill',
    status: 'Pending migration'
  },

  // 3.4 COORDINATOR
  {
    screen: 'CoordinatorHomeView',
    file: 'frontend/src/views/roles/coordinator/CoordinatorHomeView.tsx',
    roles: 'Coordinator',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Bypassed by legacy HomeView.tsx; large mascot instead of small (max 72px) calendar mascot; micro-copy subtitle "Chapter leadership" required; needs Events/Pending/Volunteers StatTiles',
    status: 'Pending migration'
  },
  {
    screen: 'Event Creation Stepper',
    file: 'frontend/src/views/events/ClubEventsView.tsx',
    roles: 'Coordinator',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Event creation lacks 3-step structured stepper: Step 1 Basics, Step 2 Duties Roster with avatar picker, Step 3 Review & Submit (coordinator cannot self-approve)',
    status: 'Pending migration'
  },
  {
    screen: 'MeetingsView',
    file: 'frontend/src/views/meetings/MeetingsView.tsx',
    roles: 'Coordinator, Faculty',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses custom cards and slate borders; needs tabs (All, Pre-Event Briefings, Post-Event Reviews, General Syncs), 24px cards, MoM submit action, "Schedule" pill',
    status: 'Pending migration'
  },
  {
    screen: 'AttendanceView',
    file: 'frontend/src/views/attendance/AttendanceView.tsx',
    roles: 'Coordinator, Faculty',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy table and non-token badges; needs 16px event select, ProgressRing verified percentage, summary tiles, searchable roster, "Export" primary pill',
    status: 'Pending migration'
  },
  {
    screen: 'CoordinatorOperationsView',
    file: 'frontend/src/views/roles/coordinator/CoordinatorOperationsView.tsx',
    roles: 'Coordinator',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy ModuleTile and ShortcutTile with slate classes; needs 20px tiles with 40px circular icons, bento modules for Squads/Members/Attendance/Duties/Treasury',
    status: 'Pending migration'
  },

  // 3.5 FACULTY
  {
    screen: 'FacultyHomeView',
    file: 'frontend/src/views/roles/faculty/FacultyHomeView.tsx',
    roles: 'Faculty',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: '1137 lines of legacy code with hardcoded #FEF3C7/#92400E and legacy WeekStrip; needs small shield mascot, CTA "Approvals" with pending badge, StatTiles Pending/Live/Budget, last 3 audit actions',
    status: 'Pending migration'
  },
  {
    screen: 'ApprovalsView',
    file: 'frontend/src/views/approvals/ApprovalsView.tsx',
    roles: 'Faculty',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy cards and prompt() for rejections; needs SegmentedTabs All/Events/Budget/Squads, 24px cards, PillButtons, ConfirmDialog with required rejection reason',
    status: 'Pending migration'
  },
  {
    screen: 'AuditLogView',
    file: 'frontend/src/views/audit/AuditLogView.tsx',
    roles: 'Faculty',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy table; needs dark pine gradient banner (#0B2B26 to #163832), shield icon, filter pills, expandable before/after diff cards, Export action',
    status: 'Pending migration'
  },
  {
    screen: 'MembersDirectoryView',
    file: 'frontend/src/views/members/MembersDirectoryView.tsx',
    roles: 'Faculty, Coordinator',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy MemberCard and non-token badge styles; needs searchable roster, Post Assign BottomSheet, lock hints for self-escalation and last faculty demotion',
    status: 'Pending migration'
  },
  {
    screen: 'Faculty Operations Command',
    file: 'frontend/src/views/roles/faculty/FacultyOperationsView.tsx',
    roles: 'Faculty',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy ModuleTile and slate colors; needs bento grid for lifecycle, finance, squads, MoM sign-off, and governance settings',
    status: 'Pending migration'
  },

  // 3.6 TREASURER
  {
    screen: 'TreasurerHomeView',
    file: 'frontend/src/views/roles/treasurer/TreasurerHomeView.tsx',
    roles: 'Treasurer',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: '542 lines importing legacy components; needs small coin mascot (max 72px), CTA "Add expense", StatTiles Allocated/Spent/Left, wallet mascot empty state',
    status: 'Pending migration'
  },
  {
    screen: 'TreasurerView',
    file: 'frontend/src/views/treasurer/TreasurerView.tsx',
    roles: 'Treasurer',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy tabs, table, and approve-like controls; needs sub-tabs Overview/Expenses/Stock/History, category chips, Add Expense modal with receipt upload, stock quick adjust, strictly no approve buttons',
    status: 'Pending migration'
  },

  // 3.7 DOCUMENTATION
  {
    screen: 'DocumentationHomeView',
    file: 'frontend/src/views/roles/documentation/DocumentationHomeView.tsx',
    roles: 'Documentation',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Imports legacy components; needs small notebook mascot, CTA "New report", StatTiles Drafts/Published/MoM due',
    status: 'Pending migration'
  },
  {
    screen: 'DocumentationStudioView',
    file: 'frontend/src/views/docs/DocumentationStudioView.tsx',
    roles: 'Documentation',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Bento template cards need circular arrow buttons; monospace preview must be styled with body font on clean white card; export pills max 3 (PDF, Word, Excel)',
    status: 'Pending migration'
  },

  // 3.8 PROMOTION
  {
    screen: 'PromotionHomeView',
    file: 'frontend/src/views/roles/promotion/PromotionHomeView.tsx',
    roles: 'Promotion',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy SectionCard and Overline; needs small megaphone mascot, CTA "New post", StatTiles Scheduled/Posted/Reach',
    status: 'Pending migration'
  },
  {
    screen: 'CampaignsView',
    file: 'frontend/src/views/campaigns/CampaignsView.tsx',
    roles: 'Promotion',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Sub-tabs Posts/Calendar/AI Studio/Daily News; needs 4-stage progress bar on campaign cards, Post Composer with Suggest AI button, broadcast chips',
    status: 'Pending migration'
  },

  // 3.9 DESIGN SYSTEM
  {
    screen: 'DesignSystemView',
    file: 'frontend/src/views/design/DesignSystemView.tsx',
    roles: 'Developer, Faculty',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Shows partial components; needs full brand swatches, all 17 mascots at 4 sizes, 4 button variants in all states, StatusChip gallery, live ProgressRing, FormFields, and new shared components',
    status: 'Pending migration'
  },

  // EXTRA CODEBASE SCREENS
  {
    screen: 'HomeView (Monolith Dispatcher)',
    file: 'frontend/src/views/home/HomeView.tsx',
    roles: 'All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: '984 lines of unmigrated legacy markup, bypassing role-specific home views; must cleanly dispatch to role-specific HomeViews',
    status: 'Pending migration'
  },
  {
    screen: 'ExploreActivitiesView',
    file: 'frontend/src/views/operations/ExploreActivitiesView.tsx',
    roles: 'All',
    shared: 'Y',
    tokens: 'Y',
    matchesSpec: 'Y',
    gaps: 'Dispatches to role-specific operations views; child views need full conformance',
    status: 'Pending migration'
  },
  {
    screen: 'StudentOperationsView',
    file: 'frontend/src/views/roles/student/StudentOperationsView.tsx',
    roles: 'Student',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy ShortcutTile and slate classes; needs shared BentoGrid and PastelCard components',
    status: 'Pending migration'
  },
  {
    screen: 'DocumentationOperationsView',
    file: 'frontend/src/views/roles/documentation/DocumentationOperationsView.tsx',
    roles: 'Documentation',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy module tiles; needs shared BentoGrid, PastelCard, and tokens',
    status: 'Pending migration'
  },
  {
    screen: 'TreasurerOperationsView',
    file: 'frontend/src/views/roles/treasurer/TreasurerOperationsView.tsx',
    roles: 'Treasurer',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy module tiles and slate classes; needs shared components and token adherence',
    status: 'Pending migration'
  },
  {
    screen: 'PromotionOperationsView',
    file: 'frontend/src/views/roles/promotion/PromotionOperationsView.tsx',
    roles: 'Promotion',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy module tiles; needs shared components and tokens',
    status: 'Pending migration'
  },
  {
    screen: 'GalleryView',
    file: 'frontend/src/views/gallery/GalleryView.tsx',
    roles: 'Documentation, Student',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy filter tabs and non-token shadows; should harmonize with MemoriesHubView/shared styling',
    status: 'Pending migration'
  },
  {
    screen: 'ReportsView',
    file: 'frontend/src/views/reports/ReportsView.tsx',
    roles: 'Faculty, Coordinator',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy table and non-token cards; needs shared components and tokens',
    status: 'Pending migration'
  },
  {
    screen: 'TasksListView',
    file: 'frontend/src/views/tasks/TasksListView.tsx',
    roles: 'Coordinator, Student',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy TaskCard and slate colors; needs ListRow, StatusChip, and PillButton',
    status: 'Pending migration'
  },
  {
    screen: 'TeamHomeView',
    file: 'frontend/src/views/teams/TeamHomeView.tsx',
    roles: 'Coordinator, Student',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses non-token colors and legacy button styles; needs shared components',
    status: 'Pending migration'
  },
  {
    screen: 'AddStudentsView',
    file: 'frontend/src/views/teams/AddStudentsView.tsx',
    roles: 'Coordinator, Faculty',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses raw HTML inputs; needs FormField, PillButton, and shared TopBar',
    status: 'Pending migration'
  },
  {
    screen: 'TeamDocumentsView',
    file: 'frontend/src/views/teams/TeamDocumentsView.tsx',
    roles: 'Documentation, Student',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses non-token styles; needs ListRow, StatusChip, and shared TopBar',
    status: 'Pending migration'
  },
  {
    screen: 'AiSocialStudioView',
    file: 'frontend/src/views/social/AiSocialStudioView.tsx',
    roles: 'Promotion',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy AI studio layout; mapped into CampaignsView sub-tab',
    status: 'Pending migration'
  },
  {
    screen: 'AuditDetailPage',
    file: 'frontend/src/features/audits/AuditDetailPage.tsx',
    roles: 'Faculty',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses audit.css with custom non-token colors and fonts; needs shared tokens and components',
    status: 'Pending migration'
  },
  {
    screen: 'RoleSwitcherModal',
    file: 'frontend/src/components/navigation/RoleSwitcherModal.tsx',
    roles: 'Faculty / Dev',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses raw modal styles; must be restricted to faculty/dev and preview-only changes',
    status: 'Pending migration'
  },
  {
    screen: 'QuickActionsSheet',
    file: 'frontend/src/components/QuickActionsSheet.tsx',
    roles: 'All',
    shared: 'N',
    tokens: 'N',
    matchesSpec: 'N',
    gaps: 'Uses legacy shortcut tile styles; must use shared BottomSheet, Mascot, and ListRow',
    status: 'Pending migration'
  }
];

let matrixMd = `# GeoHub UI Conformance Screen Matrix

**Audit Date**: ${new Date().toISOString()}  
**Total Screens/Views Audited**: ${screens.length}  
**Total Screens Compliant**: 0  
**Conformance Goal**: 100% Exact Conformance with UI Spec and Brand Tokens

| Screen | File | Roles | Uses Shared Only? | Uses Tokens Only? | Matches Spec? | Gaps | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :---: |
`;

for (const s of screens) {
  matrixMd += `| **${s.screen}** | \`${s.file}\` | ${s.roles} | ${s.shared} | ${s.tokens} | ${s.matchesSpec} | ${s.gaps} | ${s.status} |\n`;
}

fs.writeFileSync('docs/ui-conformance/SCREEN_MATRIX.md', matrixMd);
console.log('Generated docs/ui-conformance/SCREEN_MATRIX.md');

// 2. Generate LEGACY_REPORT.md
let legacyMd = `# GeoHub Legacy & Non-Conformance Report

**Audit Date**: ${new Date().toISOString()}  
**Total Scanned Source Files**: 160  

## Summary of Detected Violations
- **Hardcoded non-brand hex / rgb / hsl values**: ${rawData.hardcodedColors.length} occurrences
- **Inline color / background styles**: ${rawData.inlineColorStyles.length} occurrences
- **Old theme color class remnants** (\`slate-\`, \`emerald-\`, \`zinc-\`, \`gray-\`, etc.): ${rawData.oldThemeRemnants.length} occurrences
- **Font sizes under 12px** (\`text-[10px]\`, \`text-[11px]\`, \`fontSize: 11px\`): ${rawData.fontUnder12px.length} occurrences
- **Foreign / non-spec font families** (\`font-mono\`, etc.): ${rawData.foreignFonts.length} occurrences
- **Legacy component imports** (from \`../components/*\` bypassing \`shared/\`): ${rawData.legacyComponentImports.length} occurrences

---

## 1. Duplicate & Legacy Component Implementations
The following duplicate or legacy component implementations were detected in \`frontend/src/components/\` and \`components/common/\` that duplicate or bypass the single source of truth in \`src/components/shared/\`:

1. **Button**:
   - Legacy: \`frontend/src/components/Button.tsx\`
   - Shared Canonical: \`frontend/src/components/shared/PillButton.tsx\`
2. **Avatar**:
   - Legacy: \`frontend/src/components/Avatar.tsx\`, \`frontend/src/components/common/AppAvatar.tsx\`
   - Shared Canonical: \`frontend/src/components/shared/Avatar.tsx\`
3. **Chip / Badge**:
   - Legacy: \`frontend/src/components/Chip.tsx\`, \`frontend/src/components/RoleBadge.tsx\`, \`frontend/src/components/common/RoleBadge.tsx\`, \`frontend/src/components/common/StatusChip.tsx\`
   - Shared Canonical: \`frontend/src/components/shared/StatusChip.tsx\`
4. **Cards & Tiles**:
   - Legacy: \`frontend/src/components/SectionCard.tsx\`, \`frontend/src/components/ShortcutTile.tsx\`, \`frontend/src/components/ModuleTile.tsx\`, \`frontend/src/components/CategoryCard.tsx\`, \`frontend/src/components/DonutCard.tsx\`, \`frontend/src/components/common/StatCard.tsx\`, \`frontend/src/components/common/ChartCard.tsx\`, \`frontend/src/components/common/TaskCard.tsx\`
   - Shared Canonical: \`frontend/src/components/shared/PastelCard.tsx\`, \`frontend/src/components/shared/HeroCard.tsx\`, \`frontend/src/components/shared/StatTile.tsx\`, \`frontend/src/components/shared/BentoGrid.tsx\`
5. **Modals & Dialogs**:
   - Legacy: \`frontend/src/components/common/Modal.tsx\`, \`frontend/src/components/common/AiChatModal.tsx\`, \`frontend/src/components/auth/ForgotPasswordModal.tsx\`
   - Shared Canonical: \`frontend/src/components/shared/BottomSheet.tsx\`, \`frontend/src/components/shared/ConfirmDialog.tsx\`
6. **Mascot**:
   - Legacy: \`frontend/src/components/common/GeoMascot.tsx\`
   - Shared Canonical: \`frontend/src/components/shared/Mascot.tsx\`
7. **Search**:
   - Legacy: \`frontend/src/components/SearchBar.tsx\`
   - Shared Canonical: \`frontend/src/components/shared/SearchField.tsx\`
8. **Feedback / Skeleton**:
   - Legacy: \`frontend/src/components/FeedbackStates.tsx\` (uses emerald/slate and 10px text)
   - Shared Canonical: \`frontend/src/components/shared/EmptyState.tsx\`, \`frontend/src/components/shared/Skeleton.tsx\`, \`frontend/src/components/shared/ErrorState.tsx\`

---

## 2. Hardcoded Color Violations (Sample by File)
Found ${rawData.hardcodedColors.length} occurrences across source files. Major files with non-brand hardcoded colors:
`;

const byFile = {};
for (const item of rawData.hardcodedColors) {
  byFile[item.file] = (byFile[item.file] || 0) + 1;
}

const topColorFiles = Object.entries(byFile).sort((a, b) => b[1] - a[1]);
for (const [file, count] of topColorFiles.slice(0, 20)) {
  legacyMd += `- \`${file}\`: **${count}** hardcoded color values\n`;
}

legacyMd += `\n---

## 3. Font Size Under 12px Violations
Found ${rawData.fontUnder12px.length} occurrences of font size below the strict 12px floor (\`text-[10px]\`, \`text-[11px]\`, \`fontSize: 11px\`). Top violating files:
`;

const byFontFile = {};
for (const item of rawData.fontUnder12px) {
  byFontFile[item.file] = (byFontFile[item.file] || 0) + 1;
}
for (const [file, count] of Object.entries(byFontFile).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  legacyMd += `- \`${file}\`: **${count}** sub-12px font definitions\n`;
}

legacyMd += `\n---

## 4. Old Theme Remnants (Tailwind slate/emerald/zinc)
Found ${rawData.oldThemeRemnants.length} occurrences of old theme classes. Top violating files:
`;

const byThemeFile = {};
for (const item of rawData.oldThemeRemnants) {
  byThemeFile[item.file] = (byThemeFile[item.file] || 0) + 1;
}
for (const [file, count] of Object.entries(byThemeFile).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  legacyMd += `- \`${file}\`: **${count}** old theme class usages\n`;
}

legacyMd += `\n---

## 5. Screens Rendering Old Layouts
1. **HomeView.tsx** (984 lines): Completely bypassing the 6 role home views, rendering old emerald/slate cards, unstyled tables, inline styles, and prompt modals.
2. **FacultyHomeView.tsx** (1137 lines): Using legacy StatTile, SectionCard, DonutCard, WeekStrip, and hardcoded #FEF3C7 amber cards.
3. **TreasurerHomeView.tsx** (542 lines): Importing legacy components, inline style objects, and non-token borders.
4. **TreasurerView.tsx**: Contains unstyled table rows, non-conforming tab buttons, and old approval controls that violate treasurer RBAC.
5. **ApprovalsView.tsx**: Using \`window.prompt\` for rejections rather than shared ConfirmDialog with required rejection reason.
6. **DocumentationHomeView.tsx** & **StudioView.tsx**: Importing legacy SectionCard, StatTile, and raw monospace preview textarea.
7. **VolunteerScanView.tsx**: Using 10px fonts, raw SVG corner markers, and missing the 28px framed viewfinder on #051F20.
8. **MyQrView.tsx**: Missing 60s ProgressRing countdown, radial mint glow, and dynamic pass structure.
9. **ClubEventsView.tsx**: Missing BentoGrid layout, 3-step creation stepper, and dark gradient event hero.
10. **TeamsListView.tsx**: Missing the 4 bento tiles with clay mascot icons and member count badges.
`;

fs.writeFileSync('docs/ui-conformance/LEGACY_REPORT.md', legacyMd);
console.log('Generated docs/ui-conformance/LEGACY_REPORT.md');
