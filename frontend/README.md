# GeoHub — College Geo Club Management & QR Platform

> **React 19 + TypeScript + Vite + Vanilla CSS**  
> Complete role-based college Geo Club web application converted from Flutter with zero external UI framework dependencies (No Tailwind CSS per specification, pure custom design system).

---

## 🌟 Key Features

1. **Separate Login Page with Google Sign-In & Role Access**:
   - Gated authentication: Users land on the separate, dedicated Login page before entering the platform.
   - **Google Sign-In**: "Continue with Google (@college.edu)" with official Google logo and realistic OAuth account picker dialog.
   - Institutional accounts across all 5 roles ready to sign in with one tap.
   - **Role-Based Fast Login**: 1-click role cards to test Super Admin, Admin, Team Admin, Member, or Volunteer.
   - College email/password login with automatic role detection as the user types.
   - Complete Membership Induction Request application form and confirmation screen.

2. **Pure White Design System & Deep Teal Branding**:
   - Strict pure white (`#FFFFFF`) scaffold on every screen (no gray tints).
   - Deep Teal (`#0F766E`) primary with Mint (`#14B8A6`) accents and Slate typography (`#0F172A`).
   - Soft `#E8ECF2` card borders and subtle elevation shadows (blur 16–24px, 4–6% opacity).
   - 12% opacity soft status badges (`success`, `warning`, `danger`, `info`).
   - Dual viewports: Responsive Desktop Fullscreen Shell or Centered Mobile Simulator (390 × 844) toggle.

3. **5 Distinct Roles with Specialized Cockpits**:
   - **Super Admin** (`Dr. Sarah Jenkins`): **Executive Command Cockpit** with modern Bento grid layout, live session radial gauge telemetry, incoming turnstile scanner ticker, Dean's institutional grant ledger, in-card faculty sanction desk, and emergency volunteer broadcast directive.
   - **Admin** (`Alex Rivera`): Club President portal with members management, team administration, event approvals, and gallery uploads.
   - **Team Admin** (`David Chen`): Team Home, pending applicant induction review, manual member onboarding, team deliverables, and documentation repository.
   - **Member** (`Maya Patel`): Personalized home feed, live event notices, event registrations, interactive tasks with proof uploads & comment threads, dynamic QR access pass.
   - **Volunteer** (`Liam Vance`): Everything in Member role + QR Attendance Terminal with simulated camera reticle, rapid test buttons (Valid Student, Duplicate Check-in, Expired Barcode), and instant verified check-in logs.

3. **Dynamic QR Attendance & 30-Second Security Ring**:
   - Dynamic SVG barcode generated via `qrcode.react`.
   - Real-time animated circular countdown ring timer (30s auto-refresh) to prevent attendance fraud and screenshot forwarding.
   - Instant manual token refresh capability.

4. **Live Scanner Emulator**:
   - Terminal viewfinder with laser beam animation.
   - Event switcher and interactive test scenarios.
   - Check-in result bottom sheet and live terminal counter.

5. **Analytics & Data Export**:
   - SVG rounded bar charts for monthly attendance trends.
   - Team task completion rate visualizer.
   - Real CSV export file generation for attendance audits.

---

## 🚀 Running the Project

```bash
cd frontend

# Install dependencies (React 19, Lucide icons, QRCode.react)
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

Local URL: `http://localhost:5173/`

---

## 📂 Project Architecture

```
frontend/
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # Main routing shell & viewport mode toggle
│   ├── index.css                   # Complete design system & tokens (Vanilla CSS)
│   ├── types/
│   │   └── index.ts                # Domain models (User, Event, Task, Team, Approval, etc.)
│   ├── data/
│   │   └── mockData.ts             # 25 students, 4 teams, 8 events, 20 tasks, approvals, reports
│   ├── context/
│   │   └── AppContext.tsx          # Reactive application state & instant role switcher
│   ├── components/
│   │   ├── common/
│   │   │   ├── StatCard.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── StatusChip.tsx
│   │   │   ├── RoleBadge.tsx
│   │   │   ├── AppAvatar.tsx
│   │   │   ├── SectionHeader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ChartCard.tsx       # SVG rounded bar charts
│   │   └── navigation/
│   │       ├── AppTopBar.tsx       # Brand mark, notification badge & quick role pill
│   │       ├── BottomNavBar.tsx    # Role-specific dynamic 5-tab bar & More drawer
│   │       └── RoleSwitcherModal.tsx
│   └── views/
│       ├── auth/LoginView.tsx
│       ├── dashboard/DashboardView.tsx
│       ├── member/MemberHomeView.tsx
│       ├── events/EventsListView.tsx
│       ├── tasks/TasksListView.tsx
│       ├── teams/
│       │   ├── TeamsListView.tsx
│       │   ├── TeamHomeView.tsx
│       │   ├── AddStudentsView.tsx
│       │   └── TeamDocumentsView.tsx
│       ├── qr/
│       │   ├── MyQrView.tsx
│       │   └── VolunteerScanView.tsx
│       ├── approvals/ApprovalsView.tsx
│       ├── members/MembersListView.tsx
│       ├── gallery/GalleryView.tsx
│       ├── attendance/AttendanceView.tsx
│       ├── reports/ReportsView.tsx
│       ├── notifications/NotificationsView.tsx
│       └── profile/ProfileView.tsx
```
