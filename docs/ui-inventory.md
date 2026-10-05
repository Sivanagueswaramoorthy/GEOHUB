# GeoHub Web UI Route & Page Inventory

**Platform**: GeoHub College Geospatial & Earth Science Club Management (`/frontend`, React 19 + TypeScript)  
**Architecture**: Responsive Mobile-First Shell (Pure White Scaffold `#FFFFFF`, Floating 5-Tab Pill Navigation `zIndex: 40`, Elevated Modals `zIndex: 1000`)  
**Audit Scope**: 6 Persona Roles × All Routes, Modals, Sheets, and Viewports

---

## 1. Persona Role & 5-Tab Navigation Matrix

In accordance with `/frontend/src/core/nav.ts`, every role has exactly 5 bottom floating navigation tabs.

| Role | Tab 1 | Tab 2 | Tab 3 | Tab 4 | Tab 5 | Nav Access Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Faculty Advisor** (`super_admin` / `faculty`) | Home | Events | Operations | **Members** | Profile | Full club oversight, sanctions, approvals & settings |
| **Coordinator / Lead** (`admin` / `coordinator`) | Home | Events | Operations | **Members** | Profile | Student leadership, squad commands & rosters (no executive sanctions) |
| **Documentation Lead** (`documentation`) | Home | Events | Operations | **Archives** | Profile | Archival records, media geotags, MoM authoring & templates |
| **Treasurer Lead** (`treasurer`) | Home | Events | Operations | **Finance** | Profile | Corpus budget, voucher ledger, stock inventory & claims |
| **Promotion Lead** (`social_media` / `team_admin`) | Home | Events | Operations | **Campaigns** | Profile | Social broadcasts, editorial calendar, reach metrics & AI studio |
| **Student Volunteer** (`volunteer` / `member`) | Home | Events | Operations | **Memories** | Profile | Club expeditions, dynamic passes, task duties & chapter memories |

---

## 2. Complete Route & Page Inventory

| Route (`#hash`) | Tab / Parent | Component File | Accessible Roles | Guarded / Blocked Roles | UI Entry Points | Required States | Audit Status & Gap Flags |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `#login` | Auth | `LoginView.tsx` | All Unauthenticated | None | Logout, session expiry | Populated, Error, Loading | **Verified**: 3-tab card (Google OAuth, 1-tap Role profiles, College Email). |
| `#join` / `#signup` | Auth | `LoginView.tsx` | All Unauthenticated | None | "Register here" on login | Populated, Form, Success | **Verified**: Student induction registration form. |
| `#forgot-password` | Auth | `LoginView.tsx` | All Unauthenticated | None | "Forgot?" link on login | Populated, Sent, Error | ⚠️ **Stub**: "Forgot?" has no onClick handler; needs password reset modal. |
| `#pending-approval` | Auth | `PendingApprovalView.tsx` | Pending Students | Active Users | Auto-redirect for unverified | Populated, Refreshing, Signout | ⚠️ **Missing View**: Old flutter screen existed; needed for students awaiting admin sanction. |
| `#404` | Shell | `NotFoundView.tsx` | All Roles | None | Any invalid hash | Error / Empty | ⚠️ **Missing View**: Unknown routes currently silently fall back to `HomeView`. |
| `#home` / `#dashboard` | Tab 1 | `HomeView.tsx` | All 6 Roles | None | Nav Tab 1, Wordmark logo | Populated, Empty, Skeleton | ⚠️ **Role Gap**: Missing dedicated Student Volunteer branch in `HomeView.tsx`! Students currently see faculty attention queue. |
| `#events` | Tab 2 | `ClubEventsView.tsx` | All 6 Roles | None | Nav Tab 2, Quick Actions | Populated, Empty (filter), Loading | **Verified**: Responsive grid, 96px thumbnails. Student needs "Registered" stat label & Register CTA. |
| `#event-detail` (`modal`) | `#events` | `ClubEventsView.tsx` (`BottomSheet`) | All 6 Roles | None | Tap any event card | Populated, Actions, Loading | **Verified**: Lifecycle bar, duties roster, budget, gate headcount. Faculty only has Archive. |
| `#create-event` (`modal`) | `#events` | `ClubEventsView.tsx` / `QuickActions` | Faculty, Coordinator | Doc, Treasurer, Promo, Student | "+ New Event" button, `+` Quick Action | Form, Submitting, Success | **Verified**: Blocked for Students & non-lead roles. |
| `#operations` | Tab 3 | `ExploreActivitiesView.tsx` | All 6 Roles | None | Nav Tab 3 | Populated, Responsive Grid | ⚠️ **Role Gap**: Student currently sees Faculty/Coord Branch B. Needs dedicated Student Operations Hub. |
| `#members` | Tab 4 (Fac/Coord) | `MembersDirectoryView.tsx` | Faculty, Coordinator | Doc, Treasurer, Promo, Student | Nav Tab 4, Operations tile | Populated, Filter, Empty, Modal | **Verified**: Filter by Year/Standing, Member details bottom sheet, Post change (Faculty only). |
| `#archives` / `#gallery` | Tab 4 (Doc) | `GalleryView.tsx` | All (Tab 4 for Doc) | None | Nav Tab 4 (Doc), Operations tile | Populated, Filter, Empty, Lightbox | **Verified**: Geotagged cards, photo/video tabs, file upload modal. |
| `#finance` / `#treasurer` | Tab 4 (Treas) | `TreasurerView.tsx` | Faculty, Coord (read), Treas | Doc, Promo, Student | Nav Tab 4 (Treas), Operations tile | Populated, Ledger, Vouchers, Empty | **Verified**: Allocation progress, vouchers, restock modal. Non-treasurer cannot edit budget. |
| `#campaigns` / `#ai_social` | Tab 4 (Promo) | `CampaignsView.tsx` | Faculty, Coord, Promo | Doc, Treas, Student | Nav Tab 4 (Promo), Operations tile | Populated, Calendar, AI Drafts | **Verified**: Platform chips, scheduling, AI prompt generator. |
| `#memories` | Tab 4 (Student) | `MemoriesHubView.tsx` | All (Tab 4 for Student) | None | Nav Tab 4 (Student), Operations tile | Populated, Empty, Detail Sheet | **Verified**: Memory stories, event photo streams, share modal. |
| `#profile` | Tab 5 | `ProfileView.tsx` | All 6 Roles | None | Nav Tab 5 | Populated, Loading | **Verified**: Persona credentials, RoleBadge, Role Switcher trigger, Logout. |
| `#scan_qr` | Sub-route | `VolunteerScanView.tsx` | Faculty, Coord, Treas, Doc, Promo, Volunteer (w/ duty) | Student without gate duty | Operations tile, `+` Quick Action | Live Camera Simulator, Success, Denied | ⚠️ **Permission Gap**: Student Volunteer should only access if they hold Attendance duty for an event. |
| `#my_qr` | Sub-route | `MyQrView.tsx` | All 6 Roles | None | Operations tile, Student Quick Action | Active 30s rotating token, Offline | **Verified**: Rotating QR token, student pass barcode. |
| `#attendance` | Sub-route | `AttendanceView.tsx` | Faculty, Coord, Leads, Volunteer | Unassigned Member | Operations tile | Populated, Live feed, Empty | **Verified**: Real-time turnstile gate log table. |
| `#reports` | Sub-route | `ReportsView.tsx` | Faculty, Coordinator | Student, Leads (restricted) | Operations tile | Populated, PDF export, Charts | **Verified**: Executive dossier, attendance trends, fiscal health. |
| `#approvals` | Sub-route | `ApprovalsView.tsx` | Faculty (Super Admin) | Coordinator, Doc, Treas, Promo, Student | Operations tile, Home attention item | Populated, Empty, Decline reason | **Verified**: Route guard redirects non-faculty to `#home` with toast. |
| `#tasks` | Sub-route | `TasksListView.tsx` | All 6 Roles | None | Operations tile, Home duty cards | Populated, Filter (status), Modal | **Verified**: Task cards, status cycle (todo, in_progress, done), proof upload. |
| `#teams` | Sub-route | `TeamsListView.tsx` | Faculty, Coordinator, Leads | Student | Operations tile | Populated, 4 squads, Lead avatars | **Verified**: Roster breakdown by Management, Promotion, Doc, Entertainment. |
| `#team_home` | Sub-route | `TeamHomeView.tsx` | Squad Leads, Team Admins | Non-leads | Teams list tile | Populated, Deliverables, Team chat | **Verified**: Squad command center. |
| `#add_students` | Sub-route | `AddStudentsView.tsx` | Faculty, Coordinator | Leads, Student | Operations tile, Quick Action | Form, Validation, Success | **Verified**: Direct enrollment into club squads. |
| `#documents` | Sub-route | `TeamDocumentsView.tsx` | Faculty, Coord, Doc Lead | Student | Operations tile | Populated, Document grid, Empty | **Verified**: Squad charters and governance docs. |
| `#meetings` | Sub-route | `MeetingsView.tsx` | Faculty, Coordinator, Leads | Student | Operations tile | Populated, MoM authoring, Agenda | **Verified**: Agendas, action items, minutes of meeting. |
| `#forum` | Sub-route | `CommunicationForumView.tsx` | All 6 Roles | None | Operations tile | Populated, 4 Channels, Reply sheet | **Verified**: Announcements, coordination, tech discussions. |
| `#doc_studio` | Sub-route | `DocumentationStudioView.tsx` | Faculty, Coordinator, Doc Lead | Treasurer, Promo, Student | Operations tile | Populated, Template editor, Export | **Verified**: Prefilled event templates & briefs. |
| `#notifications` | Sub-route | `NotificationsView.tsx` | All 6 Roles | None | Header Bell, Operations tile | Populated, Mark all read, Empty | **Verified**: Bulletins, reminders, status updates. |
| `#settings` | Sub-route | `ExploreActivitiesView.tsx` (`BottomSheet`) | Faculty (Super Admin) | Coordinator, Doc, Treas, Promo, Student | Operations Governance tile | Form, Toggle, Save | ⚠️ **Route Defect**: Direct hash `#settings` redirected or fell through without opening settings sheet. |
| `#posts` | Sub-route | `ExploreActivitiesView.tsx` (`BottomSheet`) | Faculty (Super Admin) | Coordinator, Doc, Treas, Promo, Student | Operations Governance tile | Form, Candidate picker, Submit | ⚠️ **Route Defect**: Direct hash `#posts` lacked dedicated view/modal trigger. |
| `#feedback` | Sub-route | `EventFeedbackModal.tsx` | Student, All Roles | None | Event detail button, Quick Action | Star rating, Text area, Success | ⚠️ **Missing View**: Dedicated feedback view/modal for post-event ratings. |
| `#my_duties` | Sub-route | `TasksListView.tsx` | Student, Volunteer | None | Operations shortcut, Home card | Populated, My assigned tasks only | ⚠️ **Missing Alias**: Dedicated `#my_duties` route filter for student tasks. |
| `#registration_history` | Sub-route | `ClubEventsView.tsx` | Student, All Roles | None | Student Operations, Profile | Populated, RSVP events list | ⚠️ **Missing Alias**: Dedicated route filter for student's registered events. |

---

## 3. Discovered Defects & Fix Priority (Pre-Harness)

1. **[BLOCKER] Missing Student Experience in `HomeView.tsx`**:
   - `HomeView.tsx` only handles `isTreasurer`, `isPromotion`, `isDocLead`, and defaults to Faculty/Coordinator Admin.
   - *Fix*: Implement dedicated Student Volunteer branch with 4 StatTiles (Upcoming Events, Duties Pending, Events Attended, Badges/Hours), Next Event Hero, My Duties list, Events Carousel, and Registration History.

2. **[BLOCKER] Missing Student Operations Hub in `ExploreActivitiesView.tsx`**:
   - Students currently see the Faculty/Coordinator admin operations with Squad Leads, Budget View, and Reports.
   - *Fix*: Implement dedicated Student Operations branch with Gate & Pass (My Pass, conditional Gate Scanner), Events & Duties (My Duties, Registered Events), Community (Forum, Memories), and Event Feedback.

3. **[BLOCKER] Quick Actions (+) Sheet Misconfigured for Students**:
   - `QuickActionsSheet.tsx` offers Faculty/Coordinator actions (Create Event, Schedule Meeting, Assign Post, Add Student) to Students.
   - *Fix*: Provide Student-specific actions: "Show My Pass", "Register for Event", and "Give Feedback".

4. **[MAJOR] Missing `pending-approval`, `forgot-password`, and `404` Views**:
   - No screen for students waiting for account verification.
   - "Forgot?" link on login does nothing.
   - Unknown URLs silently load `HomeView` instead of a 404 page.
   - *Fix*: Implement `PendingApprovalView`, `ForgotPasswordModal`, and `NotFoundView`.

5. **[MAJOR] Route Guarding & Direct URL Handling**:
   - Direct URLs `#settings` and `#posts` must cleanly open their respective governance modals for Faculty and redirect with "You don't have access" toast for all other roles.
   - Gate Scanner (`#scan_qr`) for Student must be allowed only if the student holds the attendance duty on an active event.

6. **[MINOR] Missing Route Aliases**:
   - Wire `#feedback`, `#my_duties`, `#registration_history` to their respective views/filtered states in `App.tsx`.
