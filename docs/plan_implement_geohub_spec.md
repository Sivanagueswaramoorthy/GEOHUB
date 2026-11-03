# Implementation Plan: GeoHub Complete Specification Alignment

This plan addresses all missing features, architectural conflicts, and operational gaps identified between the handwritten blueprint (`geo hub idea.pdf`) and the current GeoHub codebase.

---

## 1. Goal Description

Align the GeoHub application with the organizational hierarchy and specific functional requirements outlined in the handwritten design notes:
1. **Management Team Structure & Leadership Hierarchy:** Formalize the **Management Team** as the club's steering committee. It is co-led by the **Club President** and **Faculty Advisor**, with its core members consisting of the branch squad leads (**Promotion Lead**, **Treasury Lead**, and **Documentation Lead**). The President and Faculty Advisor have the authority to assign and change the Leads for each respective squad.
2. **Promotion Eco & Holiday Calendar:** Integrate Government holidays and Environmental awareness days into the Promotion Calendar.
3. **Documentation Hub Enhancements:** Add event-scoped document uploads and Daily News publishing directly within the Documentation Studio.
4. **Treasury Event Audit & Bill Export:** Add event-filtered financial audit export (individual event ledger vs. overall club ledger) with voucher attachments.
5. **Dual-Mode Attendance (Student OTP Entry):** Allow students to enter the 6-digit OTP directly (1 OTP for internal events; 2 OTPs for external events) alongside QR scanning.
6. **Member Operations ("My Duties"):** Provide a dedicated "My Duties" interface for General Members under the Operations hub to execute tasks assigned by the Management Team.
7. **All-Event Access for Squad Leads:** All Squad Leads have full WRITE and READ operations across ALL events for their functional domain, whereas non-lead members have duty-based temporal write access per event that auto-expires to read-only mode after the event concludes.

---

## 2. User Review Required

> [!IMPORTANT]
> **Management Team & Squad Lead Assignment:** The **Promotion Squad Lead**, **Treasury Squad Lead**, and **Documentation Squad Lead** are part of the **Management Team**. The **Club President** and **Faculty Advisor** co-lead this Management Team and hold the exclusive authority to assign or change the Lead for each respective squad. General members can participate in multiple functional squads simultaneously under these leads.

> [!WARNING]
> **OTP Self-Validation Window:** The 6-digit OTP self-validation flow for students requires the event to be active (`live` or during its scheduled window) and verifies student enrollment to prevent unauthorized check-ins.

---

## 3. Open Questions

> [!NOTE]
> None currently. The handwritten notes provide clear guidance on roles, screen layouts, OTP rules (1 OTP for internal, 2 OTPs for external), and event-scoped lead rights.

---

## 4. Proposed Changes

---

### Component 1: Core Roles, Permissions & 5-Tier Hierarchy Engine

#### [MODIFY] `frontend/src/core/permissions_matrix.json`
- Add `"management"` to the `roles` array.
- Define explicit permission flags for `"management"`:
  - `canAssignEventDuties: true`
  - `canViewAttendance: true`
  - `canCreateMeetings: true`
  - `canSignOffMoM: true`
  - `canReviewExecutiveApprovals: true`
  - `canManageSquads: true`
  - `canCreateEditEvents: false` (President/Faculty only)
  - `canManageMembers: false` (Faculty/President only)
  - `canRemoveMember: false` (Faculty only)

#### [MODIFY] `frontend/src/core/permissions.ts`
- Fix `normalizeRole`: stop mapping `'management'` to `'coordinator'`. Return `'management'`.
- Update `normalizeHubRole` and `can` functions to support the 5-tier escalation path.
- **Squad Member Onboarding & Operations Hub Access:** Allow Squad Leads to add members to their respective squad. Ensure squad members gain read access to their squad's Operations Hub.
- **Dynamic Event-Duty Temporal Write & Auto-Read Mode:**
  - When duties are enabled for a member for an active event, dynamically grant WRITE access to operations for that specific event.
  - When the event concludes (`status === 'completed'` or `endDate` has passed), automatically revoke write access and transition the member's view back to READ-ONLY mode.
- **All-Event Lead Permissions:** Ensure all Squad Leads (Promotion, Treasury, Documentation, Management, President, Faculty) possess full WRITE and READ permissions across ALL events.

---

### Component 2: Promotion Squad Eco Calendar & Media Uploads

#### [MODIFY] `frontend/src/views/campaigns/CampaignsView.tsx`
- Expand the **Calendar** sub-tab to display a curated dataset of:
  - **Indian Government National Holidays:** Republic Day (Jan 26), Independence Day (Aug 15), Gandhi Jayanti (Oct 2), etc.
  - **Global & National Eco Days:** World Wetlands Day (Feb 2), World Wildlife Day (Mar 3), World Water Day (Mar 22), Earth Day (Apr 22), World Environment Day (Jun 5), International Ozone Day (Sep 16), National Wildlife Week (Oct 2–8), National Pollution Prevention Day (Dec 2).
- Add filter toggle: `All Observances` | `Eco Days` | `Govt Holidays`.
- Connect campaign post drafting shortcuts directly to upcoming calendar observances.

---

### Component 3: Documentation Studio (Event Uploads & Daily News)

#### [MODIFY] `frontend/src/views/docs/DocumentationStudioView.tsx`
- Add a dedicated **Event Documents Upload** section allowing users to pick an event, select document type (Circular, Permission Letter, Post-Event Retrospective, Attendee Signatures), and attach/publish files.
- Add **Daily News Publishing** tab within Documentation Studio (re-locating/linking with daily bulletins) to let Documentation leads author and publish daily eco circulars linked to club events.

---

### Component 4: Treasury Ledger & Event Audit Export

#### [MODIFY] `frontend/src/views/treasurer/TreasurerView.tsx`
- Update the export system to support:
  1. **Event-Specific Financial Audit Export:** Filters ledger by selected event and exports formatted summary (allocated budget, itemized expenses, vendor receipts, variance).
  2. **Overall Annual Financial Audit Export:** Comprehensive club corpus ledger.
- Add receipt/bill photo attachment preview modal in recent vouchers list.

---

### Component 5: Attendance Engine (Student OTP Entry & Dual-Phase Flow)

#### [MODIFY] `frontend/src/views/qr/MyQrView.tsx` & `frontend/src/views/events/ClubEventsView.tsx`
- In `MyQrView.tsx` and the Event Details screen:
  - Add an **"Enter Attendance OTP"** action card for registered students.
  - If event is **Internal**: Single 6-digit OTP input field.
  - If event is **External**: Two-step OTP input:
    - Step 1: Entry / Assembly OTP.
    - Step 2: Exit / Destination OTP.
  - Validates against `event.entryOtp` and `event.exitOtp`.
  - Automatically marks student attendance as `Completed` (or `Entered` for Step 1 of external events) in `attendance` state.

---

### Component 6: Member Operations Hub ("My Duties")

#### [MODIFY] `frontend/src/views/operations/ExploreActivitiesView.tsx`
- For users with the `student` role:
  - Show a prominent, personalized **"My Assigned Duties"** card stack at the top of the Operations hub.
  - Displays tasks assigned to the student by the Management Squad for upcoming events.
  - Allows marking tasks as `In Progress` or `Completed` with optional proof notes.

---

## 5. Verification Plan

### Automated Tests
Run existing project test suites and linter:
```bash
npm run test
npm run lint
```

### Manual Verification Flows
1. **Hierarchy & Role Switching:**
   - Open Demo Roles Sheet $\rightarrow$ switch to **Management Lead** $\rightarrow$ verify Management Desk has independent squad leads, approvals, and meetings controls.
   - Switch to **Club President** $\rightarrow$ verify member removal is disabled.
   - Switch to **Faculty Advisor** $\rightarrow$ verify member removal and global budget controls are active.
2. **Attendance OTP Validation:**
   - Switch to **Student Member** $\rightarrow$ navigate to My QR or registered Event $\rightarrow$ enter the 6-digit OTP for an Internal event $\rightarrow$ confirm attendance marked as `Completed`.
   - Test an External event $\rightarrow$ enter Phase 1 OTP $\rightarrow$ verify status changes to `Entered` $\rightarrow$ enter Phase 2 OTP $\rightarrow$ verify status changes to `Completed`.
3. **Promotion Eco Calendar:**
   - Switch to **Promotion Lead** $\rightarrow$ navigate to Promotion $\rightarrow$ Calendar $\rightarrow$ verify Eco days (Earth Day, Environment Day) and Government holidays are visible and filterable.
4. **Documentation Studio:**
   - Switch to **Documentation Lead** $\rightarrow$ navigate to Docs Studio $\rightarrow$ verify Document Upload per event and Daily News publishing work smoothly.
5. **Treasurer Audit Export:**
   - Switch to **Treasurer Lead** $\rightarrow$ select a specific event $\rightarrow$ export Financial Audit CSV/statement $\rightarrow$ verify event-scoped breakdown.

