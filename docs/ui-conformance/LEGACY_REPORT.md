# GeoHub Legacy & Non-Conformance Report

**Audit Date**: 2026-10-28T03:59:57.865Z  
**Total Scanned Source Files**: 160  

## Summary of Detected Violations
- **Hardcoded non-brand hex / rgb / hsl values**: 2588 occurrences
- **Inline color / background styles**: 479 occurrences
- **Old theme color class remnants** (`slate-`, `emerald-`, `zinc-`, `gray-`, etc.): 1469 occurrences
- **Font sizes under 12px** (`text-[10px]`, `text-[11px]`, `fontSize: 11px`): 578 occurrences
- **Foreign / non-spec font families** (`font-mono`, etc.): 42 occurrences
- **Legacy component imports** (from `../components/*` bypassing `shared/`): 82 occurrences

---

## 1. Duplicate & Legacy Component Implementations
The following duplicate or legacy component implementations were detected in `frontend/src/components/` and `components/common/` that duplicate or bypass the single source of truth in `src/components/shared/`:

1. **Button**:
   - Legacy: `frontend/src/components/Button.tsx`
   - Shared Canonical: `frontend/src/components/shared/PillButton.tsx`
2. **Avatar**:
   - Legacy: `frontend/src/components/Avatar.tsx`, `frontend/src/components/common/AppAvatar.tsx`
   - Shared Canonical: `frontend/src/components/shared/Avatar.tsx`
3. **Chip / Badge**:
   - Legacy: `frontend/src/components/Chip.tsx`, `frontend/src/components/RoleBadge.tsx`, `frontend/src/components/common/RoleBadge.tsx`, `frontend/src/components/common/StatusChip.tsx`
   - Shared Canonical: `frontend/src/components/shared/StatusChip.tsx`
4. **Cards & Tiles**:
   - Legacy: `frontend/src/components/SectionCard.tsx`, `frontend/src/components/ShortcutTile.tsx`, `frontend/src/components/ModuleTile.tsx`, `frontend/src/components/CategoryCard.tsx`, `frontend/src/components/DonutCard.tsx`, `frontend/src/components/common/StatCard.tsx`, `frontend/src/components/common/ChartCard.tsx`, `frontend/src/components/common/TaskCard.tsx`
   - Shared Canonical: `frontend/src/components/shared/PastelCard.tsx`, `frontend/src/components/shared/HeroCard.tsx`, `frontend/src/components/shared/StatTile.tsx`, `frontend/src/components/shared/BentoGrid.tsx`
5. **Modals & Dialogs**:
   - Legacy: `frontend/src/components/common/Modal.tsx`, `frontend/src/components/common/AiChatModal.tsx`, `frontend/src/components/auth/ForgotPasswordModal.tsx`
   - Shared Canonical: `frontend/src/components/shared/BottomSheet.tsx`, `frontend/src/components/shared/ConfirmDialog.tsx`
6. **Mascot**:
   - Legacy: `frontend/src/components/common/GeoMascot.tsx`
   - Shared Canonical: `frontend/src/components/shared/Mascot.tsx`
7. **Search**:
   - Legacy: `frontend/src/components/SearchBar.tsx`
   - Shared Canonical: `frontend/src/components/shared/SearchField.tsx`
8. **Feedback / Skeleton**:
   - Legacy: `frontend/src/components/FeedbackStates.tsx` (uses emerald/slate and 10px text)
   - Shared Canonical: `frontend/src/components/shared/EmptyState.tsx`, `frontend/src/components/shared/Skeleton.tsx`, `frontend/src/components/shared/ErrorState.tsx`

---

## 2. Hardcoded Color Violations (Sample by File)
Found 2588 occurrences across source files. Major files with non-brand hardcoded colors:
- `frontend/src/index.css`: **231** hardcoded color values
- `frontend/src/views/roles/faculty/FacultyOperationsView.tsx`: **211** hardcoded color values
- `frontend/src/views/members/MembersListView.tsx`: **190** hardcoded color values
- `frontend/src/views/roles/coordinator/CoordinatorOperationsView.tsx`: **184** hardcoded color values
- `frontend/src/views/events/ClubEventsView.tsx`: **145** hardcoded color values
- `frontend/src/views/events/EventsListView.tsx`: **136** hardcoded color values
- `frontend/src/views/roles/faculty/FacultyHomeView.tsx`: **95** hardcoded color values
- `frontend/src/features/audits/audit.css`: **93** hardcoded color values
- `frontend/src/views/auth/LoginView.tsx`: **91** hardcoded color values
- `frontend/src/features/auth/login.css`: **82** hardcoded color values
- `frontend/src/views/dashboard/SuperAdminDashboardView.tsx`: **69** hardcoded color values
- `frontend/src/views/qr/MyQrView.tsx`: **69** hardcoded color values
- `frontend/src/views/audit/AuditLogView.tsx`: **54** hardcoded color values
- `frontend/src/views/qr/VolunteerScanView.tsx`: **54** hardcoded color values
- `frontend/src/components/QuickActionsSheet.tsx`: **45** hardcoded color values
- `frontend/src/views/roles/documentation/DocumentationOperationsView.tsx`: **39** hardcoded color values
- `frontend/src/styles/utilities.css`: **38** hardcoded color values
- `frontend/src/views/roles/treasurer/TreasurerOperationsView.tsx`: **38** hardcoded color values
- `frontend/src/views/tasks/TasksListView.tsx`: **38** hardcoded color values
- `frontend/src/views/roles/promotion/PromotionOperationsView.tsx`: **36** hardcoded color values

---

## 3. Font Size Under 12px Violations
Found 578 occurrences of font size below the strict 12px floor (`text-[10px]`, `text-[11px]`, `fontSize: 11px`). Top violating files:
- `frontend/src/views/treasurer/TreasurerView.tsx`: **41** sub-12px font definitions
- `frontend/src/views/campaigns/CampaignsView.tsx`: **34** sub-12px font definitions
- `frontend/src/views/members/MembersListView.tsx`: **32** sub-12px font definitions
- `frontend/src/views/events/ClubEventsView.tsx`: **29** sub-12px font definitions
- `frontend/src/views/events/EventsListView.tsx`: **27** sub-12px font definitions
- `frontend/src/views/members/MembersDirectoryView.tsx`: **23** sub-12px font definitions
- `frontend/src/views/roles/promotion/PromotionOperationsView.tsx`: **23** sub-12px font definitions
- `frontend/src/views/reports/ReportsView.tsx`: **22** sub-12px font definitions
- `frontend/src/views/roles/treasurer/TreasurerHomeView.tsx`: **21** sub-12px font definitions
- `frontend/src/views/gallery/GalleryView.tsx`: **20** sub-12px font definitions
- `frontend/src/views/qr/MyQrView.tsx`: **19** sub-12px font definitions
- `frontend/src/views/qr/VolunteerScanView.tsx`: **18** sub-12px font definitions
- `frontend/src/views/roles/treasurer/TreasurerOperationsView.tsx`: **18** sub-12px font definitions
- `frontend/src/views/dashboard/SuperAdminDashboardView.tsx`: **16** sub-12px font definitions
- `frontend/src/views/roles/promotion/PromotionHomeView.tsx`: **16** sub-12px font definitions

---

## 4. Old Theme Remnants (Tailwind slate/emerald/zinc)
Found 1469 occurrences of old theme classes. Top violating files:
- `frontend/src/components/QuickActionsSheet.tsx`: **162** old theme class usages
- `frontend/src/views/members/MembersDirectoryView.tsx`: **158** old theme class usages
- `frontend/src/views/treasurer/TreasurerView.tsx`: **151** old theme class usages
- `frontend/src/views/campaigns/CampaignsView.tsx`: **144** old theme class usages
- `frontend/src/views/roles/promotion/PromotionOperationsView.tsx`: **96** old theme class usages
- `frontend/src/views/gallery/GalleryView.tsx`: **92** old theme class usages
- `frontend/src/views/events/ClubEventsView.tsx`: **87** old theme class usages
- `frontend/src/views/roles/documentation/DocumentationOperationsView.tsx`: **70** old theme class usages
- `frontend/src/views/roles/treasurer/TreasurerOperationsView.tsx`: **65** old theme class usages
- `frontend/src/views/roles/treasurer/TreasurerHomeView.tsx`: **55** old theme class usages
- `frontend/src/views/home/HomeView.tsx`: **48** old theme class usages
- `frontend/src/views/roles/promotion/PromotionHomeView.tsx`: **47** old theme class usages
- `frontend/src/views/reports/ReportsView.tsx`: **45** old theme class usages
- `frontend/src/views/roles/faculty/FacultyOperationsView.tsx`: **39** old theme class usages
- `frontend/src/styles/utilities.css`: **31** old theme class usages

---

## 5. Screens Rendering Old Layouts
1. **HomeView.tsx** (984 lines): Completely bypassing the 6 role home views, rendering old emerald/slate cards, unstyled tables, inline styles, and prompt modals.
2. **FacultyHomeView.tsx** (1137 lines): Using legacy StatTile, SectionCard, DonutCard, WeekStrip, and hardcoded #FEF3C7 amber cards.
3. **TreasurerHomeView.tsx** (542 lines): Importing legacy components, inline style objects, and non-token borders.
4. **TreasurerView.tsx**: Contains unstyled table rows, non-conforming tab buttons, and old approval controls that violate treasurer RBAC.
5. **ApprovalsView.tsx**: Using `window.prompt` for rejections rather than shared ConfirmDialog with required rejection reason.
6. **DocumentationHomeView.tsx** & **StudioView.tsx**: Importing legacy SectionCard, StatTile, and raw monospace preview textarea.
7. **VolunteerScanView.tsx**: Using 10px fonts, raw SVG corner markers, and missing the 28px framed viewfinder on #051F20.
8. **MyQrView.tsx**: Missing 60s ProgressRing countdown, radial mint glow, and dynamic pass structure.
9. **ClubEventsView.tsx**: Missing BentoGrid layout, 3-step creation stepper, and dark gradient event hero.
10. **TeamsListView.tsx**: Missing the 4 bento tiles with clay mascot icons and member count badges.
