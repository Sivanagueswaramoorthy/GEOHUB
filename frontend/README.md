# GeoHub — College Geo Club Management & QR Platform (v1.3.1)

> **React 19 + TypeScript + Vite PWA**  
> Complete role-based college Geo Club web application converted to the Pine & Mint design system specification with strict 64px floating pill bar navigation (exact 5 tabs per role), 12px font floor, 17 clay vector mascots, Lucide-only icons, and shared components.

---

## 🌟 Key Architecture & Nav Matrix

### 1. Exactly 5 Tabs per Role (Floating Pill Bar — 64px Height)
- **Faculty Advisor**: Home, Events, Operations, Community, Gallery
- **Club Coordinator / President**: Home, Events, Operations, Community, Gallery
- **Treasurer**: Home, Events (read-only), Ledger, Community, Gallery
- **Promotion Squad Lead**: Home, Events (read-only), Operations, Community, Gallery
- **Documentation Squad Lead**: Home, Events (read-only), Operations, Community, Gallery
- **Management Squad Lead**: Home, Events, Operations, Community, Gallery
- **Student Member**: Home, Events, Community, Gallery, Operations (My Duties, Squads)

### 2. Architectural Moves
- **Profile Navigation**: Profile leaves the tab bar and opens directly from the 40px circular avatar in the sticky top header.
- **Members Directory**: Relocated into Faculty and Coordinator Operations with search and post assignment.
- **Archives & Campaigns**: Archives integrated inside Documentation Operations; Campaigns integrated inside Promotion Operations.
- **Gallery Consolidation**: Memories merged into Gallery as event albums with photo and video grid and full-screen lightbox.
- **Header QR Shortcut**: Students open rotating Pass QR (30-60s countdown ring); users assigned as event attendance takers open the Gate Scanner.

---

## 🏛️ Role Home Screens (Specialized Cockpits)

1. **Faculty Advisor (`Dr. Sarah Jenkins`)**:
   - Header: "Faculty desk" with Approvals and QR Generator buttons.
   - Tiles: Total events, Live, Budget (₹4.5L reconciled).
   - Audit feed list plus a Ledgers inspection button.

2. **Coordinator / President (`Alex Rivera`)**:
   - Header: "Plan something" with "+ New event" and "QR Scanner" ("To give attendance for respective event").
   - Tiles: Events, Pending, Volunteers.
   - "Need action" list with "View all".

3. **Treasurer (`Devon Vance`)**:
   - Header: "Finance" with "+ Add expense" and "QR Scanner".
   - Tiles: Events, Spent (₹1.8L), Available (₹2.7L), Total (₹4.5L) — **numbers reconcile (spent + available = total)**.
   - Budget Requests list with View button, marked Approved or Pending.

4. **Promotion Squad Lead (`Maya Patel`)**:
   - Header: "Promotion" with "+ New post" and "QR Scanner".
   - Tiles: Scheduled, Posted, Events.
   - Approval list with Approved / Pending status chips.

5. **Documentation Squad Lead (`Aarav Patel`)**:
   - Greeting, upcoming events, quick links to Templates, Upload, and Daily News.

6. **Management Squad Lead (`Vikram Seth`)**:
   - Shortcuts for Attendance Desk and Meetings.
   - Tiles: Squad leads, pending approvals, meetings.

7. **Student Member (`Jordan Hayes`)**:
   - "Good morning, {name}" with a Join event button.
   - Quick picks: Events, Pass QR, Squads.
   - Upcoming events with View all.

---

## 📅 Events & 2-Phase Attendance

1. **Events (`ClubEventsView`)**:
   - **New event form**: Name, date, time, venue, capacity, and type toggle (`internal` vs `external`).
   - **Event card**: Title, venue, date and time, members registered. Student view adds a Register button directly on the card and filter chips ("All events" / "Registered events").
   - **Event detail for Faculty/Coordinator**:
     - Duties checklist (Promotion, Documentation, Treasurer, MoM) with assigned members and status.
     - Attendance sheet button navigating to live gate roster.
     - Squad action log (actions by Promotion, Documentation, Treasurer).
     - Cancel event button with mandatory cancellation reason bottom sheet (min 10 characters).
   - **Capacity**: Displays "Full" badge and disables registration at capacity. Read-only roles hide create and edit buttons.

2. **Attendance & Scanner (`VolunteerScanView`, `MyQrView`, `AttendanceView`)**:
   - **Pass QR (Students)**: Rotating dynamic QR code refreshing every 30-60 seconds, accompanied by a SVG ProgressRing countdown.
   - **Scanner Screen**: Two tabs: "Scan QR" and "Enter 6-digit OTP". Result states: `success`, `already_marked`, `invalid_or_expired`, `not_authorized`.
   - **Scanner Access Guard**: The scanner opens ONLY for users assigned to take attendance for that event (`canScanForEvent`). Others see a "Not assigned" empty state.
   - **Internal Events**: 1 OTP/QR marks attendance to `Completed`.
   - **External Events**: 2 phases: Entry OTP and Exit OTP with separate countdown timers. Statuses: `Not marked`, `Entered`, `Completed`, `Incomplete`.
   - **Management Attendance Desk**: Event picker, multi-select student scanner assignments for that event, and live OTP panels with countdown timers.
   - **Attendance Sheet**: Status chips filter, student search, CSV export, and manual override sheet requiring a reason (Faculty & Coordinator only).

---

## 🔒 Access Rules & Security Invariants

1. **Lead vs Non-Lead Squad Operations**:
   - Team leads have full read/write on their squad's operations across all events.
   - Non-lead squad members have no squad operations by default. A lead can grant read or write for a specific event only (`squadGrants`). A grant never applies to another event.
   - Supports multi-squad membership and squads with multiple leads.
2. **First Login Password Mandate**:
   - Forced `ChangePasswordView` triggered upon first login (`mustChangePassword: true`), enforcing minimum 8 characters, confirmation match, and live strength indicator.
   - All shared default-password text removed.

---

## 🔑 Demo Logins for All 7 Roles

| Role | Name | Email | Roll No |
|---|---|---|---|
| Faculty Advisor | Dr. Sarah Jenkins | `sarah.jenkins@college.edu` | `FAC-001` |
| Coordinator / President | Alex Rivera | `alex@college.edu` | `21GEO001` |
| Treasurer | Devon Vance | `devon@college.edu` | `21GEO003` |
| Promotion Squad Lead | Maya Patel | `maya@college.edu` | `21GEO004` |
| Documentation Squad Lead | Aarav Patel | `aarav@college.edu` | `21GEO008` |
| Management Squad Lead | Vikram Seth | `vikram@college.edu` | `21GEO010` |
| Student Member | Jordan Hayes | `jordan@college.edu` | `21GEO002` |

---

## 🚀 Running Verification & Quality Gates

```bash
cd frontend

# 1. Run full unit and permissions test suite
npm run test

# 2. Run Design System Conformance Linter (Strict 0 violations)
npm run lint:design

# 3. Start development server
npm run dev

# 4. Run Layout Audit across all 5 viewports (360x740, 390x844, 430x932, 768x1024, 1280x800)
npm run audit:layout
```
