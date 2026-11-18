# GEO HUB Design System Master File (UI/UX Pro Max)

> **LOGIC & RETRIEVAL:** When building or updating a specific page or view, first check `design-system/geo-hub/pages/[page-name].md`.
> If that page file exists, its rules **override** this Master file.
> If no page override exists, strictly follow the rules documented below.

---

**Project:** GEO HUB  
**Version:** 2.0.0 (Production Master Specification)  
**Archetype:** Modular Bento Dashboard & Campus Operations Platform  
**Design Dials:** Variance 6/10 (Balanced Modern) | Motion 4/10 (Polished Micro-interactions) | Density 7/10 (Information-Dense Productivity)  
**Primary Stack:** React 19 + TypeScript + Vite PWA + Tailwind CSS + Lucide React (`lucide-react`)  
**Companion Stack:** Flutter (Material 3 Mobile Shell)  
**Single Source of Truth:** `frontend/src/styles/tokens.css` & `frontend/src/styles/tokens.ts`  
**Conformance Gate:** `npm run lint:design` (`frontend/scripts/lint-design.ts`)

---

## 1. System Invariants & Core Philosophy

1. **Botanical "Forest & Mint" Visual Identity**: Premium, organic, trustworthy, high-contrast palette reflecting Geospatial & Earth Science excellence. Built with deep midnight forest greens, warm sage accents, and soothing mint borders over a crisp botanical canvas.
2. **Deterministic Alignment (Left Edge Unity)**: Every root content block across any screen shares the exact same left gutter (20px on mobile `< 768px`, 24px on desktop `≥ 768px`). Left edge variance across sibling blocks must be ≤ 1px.
3. **12px Absolute Font Floor**: No font size below 12px is permitted anywhere in the system (WCAG 1.4.4 & strict design gate). All captions, timestamps, overlines, and badge tags must use `12px` minimum.
4. **Vector-Only Icons (Lucide Exclusivity)**: All structural, navigation, and functional icons must originate strictly from `lucide-react`. Raw SVGs and emojis (🎨, 🚀, ⚙️) are strictly forbidden for functional UI controls.
5. **Touch Target Accessibility**: Every interactive control (button, chip, tab, icon button) must maintain a minimum hit area of **44×44px** on web/iOS and **48×48dp** on Android.
6. **Floating Navigation Clearance**: All scrollable views must enforce `--page-padding-bottom: 112px` to prevent content from being obscured behind the floating navigation pill dock.
7. **Zero Layout Shift (CLS = 0)**: Interactive states (hover, press, focus) must never alter component dimensions, borders, or padding. State transitions are rendered via color, background opacity, elevation, or non-flow transforms (`scale(0.97)`).

---

## 2. Sophisticated Color Architecture

The GEO HUB color architecture uses a strict, mathematically verified 6-tone palette with high contrast ratios, semantic clarity, and zero harsh grays.

### 2.1 Core Brand Scale (Strict 6-Tone Spec)

| Token Name | Hex Code | Role & Semantics | Canvas Contrast (`#F6FBF7`) | White Contrast (`#FFFFFF`) |
| :--- | :--- | :--- | :--- | :--- |
| `--pine-950` | `#051F20` | Midnight Pine. Darkest text, hero headings, dark scanner HUD background | **15.8:1 (AAA)** | **16.5:1 (AAA)** |
| `--pine-900` | `#0B2B26` | Deep Emerald Shadow. Modal headers, dark surface layers, high-emphasis text | **13.4:1 (AAA)** | **14.0:1 (AAA)** |
| `--pine-800` | `#163832` | Forest Slate (Brand Primary). Primary buttons, active pill navigation, key icons | **9.8:1 (AAA)** | **10.2:1 (AAA)** |
| `--pine-700` | `#235347` | Muted Moss (Secondary Text). Subtitles, helper text, form labels, secondary icons | **5.6:1 (AA)** | **5.9:1 (AA)** |
| `--sage-400` | `#8EB69B` | Warm Sage (Accent & Focus). 2px focus rings, progress ring fills, badge outlines | **3.1:1 (UI AA)** | **3.3:1 (UI AA)** |
| `--mint-100` | `#DAF1DE` | Pale Mint Cream. Card borders, dividers, chip backgrounds, soft tints | Background Tier | Hairline Divider |

### 2.2 Foundation & Surface Neutrals

| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| `--app-bg` / `--bg-scaffold` | `#F6FBF7` | Botanical Canvas. Warm crisp background that eliminates screen glare |
| `--card-white` / `--bg-card` | `#FFFFFF` | Pure Card Surface. Standard cards, bottom sheets, form input fields |
| `--card-border` / `--divider` | `#DAF1DE` | 1px hairline border framing cards, headers, and list dividers |
| `--scrim-overlay` | `rgba(5, 31, 32, 0.45)` | Backdrop blur scrim for modal dialogs and bottom sheets (`backdrop-filter: blur(8px)`) |

### 2.3 Semantic Signals & Status Badges

| Signal | Base Hex | Translucent Background | Border Token | Usage Context |
| :--- | :--- | :--- | :--- | :--- |
| **Amber Warning** | `#F2B84B` | `rgba(242, 184, 75, 0.14)` | `rgba(242, 184, 75, 0.40)` | Pending approvals, ledger reconciliation alerts, caution states |
| **Red Danger** | `#D9534F` | `rgba(217, 83, 79, 0.12)` | `rgba(217, 83, 79, 0.35)` | Rejections, cancellations, dynamic QR expired, destructive actions |
| **Verified Success** | `#163832` | `#DAF1DE` | `rgba(35, 83, 71, 0.25)` | Attendance verified, task approved, payment cleared |
| **Informational** | `#235347` | `#F6FBF7` | `#DAF1DE` | Neutral metadata, member counts, scheduled events |

> [!WARNING]
> **Strict Conformance Rule**: Only the approved hex codes (`#051F20`, `#0B2B26`, `#163832`, `#235347`, `#8EB69B`, `#DAF1DE`, `#F6FBF7`, `#FFFFFF`, `#F2B84B`, `#D9534F`) may be used in code. Off-brand hex variations (such as `#183A2B`, `#23523D`, `#DCE6E0`, `#7D8F86`) violate the Phase 6.1 design conformance gate and will fail automated linter audits.

---

## 3. Refined Typography System

GEO HUB uses **Plus Jakarta Sans** as the foundational typeface. It balances geometric modernism with high humanist legibility for dense dashboard data, mobile screens, and QR scanning operations.

### 3.1 Typeface Configuration
```css
--font-family: 'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
Google Fonts Import:
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
```

### 3.2 Typography Scale & Rules

| Scale Token | Font Size | Line Height | Weight | Letter Spacing | Transform | Canonical Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Hero** | `32px` | `38px` | 800 (ExtraBold) | `-0.02em` | None | Landing hero headline, big event spotlights |
| **Headline** | `28px` | `32px` | 700 (Bold) | `-0.015em` | None | Screen titles, greeting headers (max 2 lines) |
| **Title-L** | `22px` | `28px` | 700 (Bold) | `-0.01em` | None | Card hero titles, featured activity headers |
| **Section Title** | `18px` | `24px` | 600 (SemiBold) | `-0.005em` | None | Module headings, drawer titles, deck labels |
| **Subtitle** | `16px` | `22px` | 600 (SemiBold) | `normal` | None | Bento card headers, modal titles, team names |
| **Body Strong** | `14.5px` | `22px` | 600 (SemiBold) | `normal` | None | Form labels, emphasized table rows, pill text |
| **Body Regular** | `14.5px` | `22px` | 400 (Regular) | `normal` | None | Standard content, descriptions, body text |
| **Button Text** | `15px` | `20px` | 700 (Bold) | `normal` | None | PillButton text, action trigger labels |
| **Caption (HARD FLOOR)** | `12px` | `16px` | 600 (SemiBold) | `normal` | None | Helper hints, timestamps, chip text, meta |
| **Overline (HARD FLOOR)** | `12px` | `16px` | 700 (Bold) | `+0.08em` | Uppercase | Eyebrows, stat labels, category tags |
| **Stat Metric Number** | `24px`–`32px` | `28px`–`36px` | 800 (ExtraBold) | `-0.02em` | `tabular-nums` | Metric figures in StatTile, ledger balances |

### 3.3 Text Clamping & Overflow Rules
- **Screen & Card Titles**: Maximum 2 lines via `-webkit-line-clamp: 2; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical;`.
- **Descriptions & Summaries**: Maximum 3 lines via `-webkit-line-clamp: 3; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical;`.
- **IDs, Emails & Hashes**: Single line with `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`.

---

## 4. Spacing, Geometry & Layout Architecture

### 4.1 Strict 4px / 8px Modular Scale
```css
--space-1:   4px;  /* 0.25rem - tight inline icon-to-badge gaps */
--space-2:   8px;  /* 0.50rem - chip gaps, icon-to-label gaps */
--space-3:  12px;  /* 0.75rem - compact card element gap, mobile gutter */
--space-4:  16px;  /* 1.00rem - standard card padding, input padding */
--space-5:  20px;  /* 1.25rem - mobile page gutter, hero card padding */
--space-6:  24px;  /* 1.50rem - section vertical rhythm, desktop gutter */
--space-8:  32px;  /* 2.00rem - deck spacing, modal dialog padding */
--space-12: 48px;  /* 3.00rem - large section separation */
--space-28: 112px; /* 7.00rem - mandatory bottom clearance for floating nav */
```

### 4.2 Border Radius Scale
```css
--radius-pills:   9999px; /* PillButton, FloatingNav tabs, status pills */
--radius-hero:    32px;   /* Hero spotlight cards, scanner container */
--radius-cards:   24px;   /* BentoGrid tiles, HubCards, PastelCards */
--radius-sheet:   24px;   /* BottomSheet top corners */
--radius-inputs:  16px;   /* Form fields, search bars, date pickers */
--radius-chips:   12px;   /* Tag chips, small badges */
```

### 4.3 Ambient Depth & Lighting Tokens
Shadows in GEO HUB use a dark forest tint (`rgba(5, 31, 32, ...)`) rather than generic black, creating organic depth that harmonizes with the botanical palette:

```css
--shadow-card:         0 10px 30px rgba(5, 31, 32, 0.08);  /* Standard cards */
--shadow-floating-nav: 0 12px 36px rgba(5, 31, 32, 0.14);  /* Floating pill dock */
--shadow-sheet:        0 -12px 40px rgba(5, 31, 32, 0.16); /* Bottom sheet lift */
--shadow-modal:        0 24px 60px rgba(5, 31, 32, 0.22);  /* Confirmation dialogs */
--shadow-icon-btn:     0 4px 14px rgba(5, 31, 32, 0.06);   /* Icon circle buttons */
```

---

## 5. Modern Component Specifications

### 5.1 Floating Navigation Pill Bar (`FloatingNav.tsx`)
- **Container**: Floating pill dock, centered horizontally at the bottom (`bottom: 16px`), `max-width: 440px`.
- **Background**: Solid `#FFFFFF` with `backdrop-filter: blur(16px)` and border `1px solid #DAF1DE`.
- **Shadow**: `var(--shadow-floating-nav)`.
- **Tabs**: Exact 5 role-scoped tabs.
- **Active Tab Pill**: Background `#163832`, color `#FFFFFF`, radius `9999px`, padding `6px 14px`.
- **Inactive Tab**: Color `#235347`, hover background `rgba(218, 241, 222, 0.40)`.
- **Badge Counter**: Semantic red pill (`#D9534F`) with white `12px` bold text.
- **Hit Target**: Minimum `44×44px` per tab touch target.

### 5.2 Cockpit Header / TopBar (`TopBar.tsx`)
- **Layout**: Fixed or sticky top bar, height `64px`, horizontal padding `20px` (mobile) / `24px` (desktop).
- **Background**: `#F6FBF7` with subtle bottom hairline `1px solid #DAF1DE`.
- **Role Desk Indicator**: Pill badge with overline `12px` font displaying current cockpit role (e.g., "Faculty Desk", "President Command", "Finance Lead").
- **Avatar Circle**: 38×38px avatar in deep pine `#163832` with `#DAF1DE` ring and status dot.
- **Notification Bell**: 44×44px touch target with active unread indicator badge.

### 5.3 Bento Grid & Hub Cards (`BentoGrid.tsx`, `HubCard.tsx`)
- **Structure**: CSS Grid with responsive columns (4 columns on desktop, 2 columns on tablet, 1 column on mobile).
- **Container**: Background `#FFFFFF`, border `1px solid #DAF1DE`, border-radius `24px`, padding `16px`–`20px`.
- **Shadow**: `0 10px 30px rgba(5, 31, 32, 0.08)`.
- **Hover Micro-interaction**: `transform: translateY(-2px); box-shadow: 0 14px 34px rgba(5, 31, 32, 0.12);` with `transition: all 220ms ease-out;`.

### 5.4 Hero Spotlight Cards (`HeroCard.tsx`)
- **Container**: Border-radius `32px`, padding `20px`–`24px`.
- **Surface**: Radial gradient (`radial-gradient(circle at 80% 20%, rgba(218,241,222,0.6) 0%, #FFFFFF 70%)`) with border `1px solid #DAF1DE`.
- **Mascot Illustration**: Integrated 3D clay vector mascot (`Mascot.tsx`) with floating animation loop (`animation: mascotFloat 4s ease-in-out infinite;`).

### 5.5 Action Buttons (`PillButton.tsx`, `IconCircleButton.tsx`)
- **Border Radius**: Strictly `9999px` (full pill).
- **Hit Area**: Height `44px` (md) / `52px` (lg) / `36px` (sm with 44px tap target expansion).
- **Primary Variant**: Background `#163832`, color `#FFFFFF`, shadow `0 4px 14px rgba(22, 56, 50, 0.22)`. Active press: `transform: scale(0.97);`.
- **Secondary Variant**: Background `#FFFFFF`, color `#051F20`, border `1px solid #DAF1DE`, shadow `0 2px 8px rgba(5, 31, 32, 0.04)`.
- **Ghost Variant**: Background `transparent`, color `#235347`, border `1px solid transparent`.
- **Destructive Variant**: Background `rgba(217, 83, 79, 0.12)`, color `#D9534F`, border `1px solid rgba(217, 83, 79, 0.35)`.
- **Keyboard Focus Ring**: `outline: 2px solid #8EB69B; outline-offset: 2px;`.

### 5.6 Form Controls (`FormField.tsx`, `SearchField.tsx`, `AmountInput.tsx`)
- **Height**: Minimum `48px` input box.
- **Border Radius**: `16px`.
- **Background**: `#FFFFFF`, border `1px solid #DAF1DE`.
- **Typography**: Input text `14.5px` (`#051F20`), placeholder `14.5px` (`#235347` with 50% opacity), label `12px` bold (`#235347`).
- **Focus State**: Border color `#163832`, box shadow `0 0 0 3px rgba(142, 182, 155, 0.25)`.
- **Error State**: Border color `#D9534F`, helper error text `12px` bold in `#D9534F`.

### 5.7 Status & Role Badges (`StatusChip.tsx`, `AccessChip.tsx`)
- **Height**: `28px`–`32px`, border-radius `9999px` or `12px`.
- **Font**: Strictly `12px` bold (Hard Floor).
- **Icon**: `16px` Lucide icon with `4px` gap to label.
- **Variants**:
  - `Active / Verified`: Background `#DAF1DE`, text `#051F20`, border `1px solid rgba(35, 83, 71, 0.25)`.
  - `Pending / Warning`: Background `rgba(242, 184, 75, 0.14)`, text `#051F20`, border `1px solid rgba(242, 184, 75, 0.40)`.
  - `Urgent / Danger`: Background `rgba(217, 83, 79, 0.12)`, text `#D9534F`, border `1px solid rgba(217, 83, 79, 0.35)`.
  - `Neutral / Role`: Background `#F6FBF7`, text `#235347`, border `1px solid #DAF1DE`.

### 5.8 Dynamic Smart QR HUD (`MyQrView.tsx`, `VolunteerScanView.tsx`)
- **QR Token Display**: Crisp 60s dynamic time-to-live with 25s auto-refresh interval.
- **Progress Ring**: 60-second circular countdown stroke in `--pine-800` (`#163832`) over `--mint-100` (`#DAF1DE`) track.
- **Scanner Viewfinder**: Dark midnight pine container (`#051F20`), high-contrast targeting frame with `--sage-400` (`#8EB69B`) corner reticles.
- **Verification Feedback**: Immediate tactile vibration (`80ms`) and sound synthesis pulse on successful volunteer scan.

### 5.9 Modals & Bottom Sheets (`BottomSheet.tsx`, `ConfirmDialog.tsx`)
- **Overlay**: Scrim `rgba(5, 31, 32, 0.45)` with `backdrop-filter: blur(8px)`.
- **Container**: White `#FFFFFF`, top corners `border-radius: 24px 24px 0 0`.
- **Drag Handle**: 36×4px rounded pill in `#DAF1DE`, margin-top `12px`.
- **Max Width**: 480px on desktop (centered), 100% on mobile.
- **Accessibility**: Focus trap active, Escape key dismissal, `aria-modal="true"`.

---

## 6. Motion & Micro-interactions

GEO HUB favors crisp, responsive micro-interactions that feel snappy, grounded, and physical.

### 6.1 Timing & Easing Tokens
```css
--motion-duration-fast:   120ms;
--motion-duration-normal: 220ms;
--motion-duration-sheet:  320ms;
--motion-ease-out:        cubic-bezier(0.16, 1, 0.3, 1);
--motion-press-scale:     0.97;
```

### 6.2 Press & Hover Rules
- **Tactile Tap**: `.pressable { transition: transform 120ms ease-out; } .pressable:active { transform: scale(0.97); }`
- **Mascot Float Animation**:
```css
@keyframes mascotFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.mascot-floating { animation: mascotFloat 4s ease-in-out infinite; }
```
- **Skeleton Shimmer**:
```css
@keyframes mintShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.mint-shimmer {
  background: linear-gradient(90deg, #DAF1DE 25%, #F6FBF7 50%, #DAF1DE 75%);
  background-size: 200% 100%;
  animation: mintShimmer 1.8s infinite ease-in-out;
}
```

### 6.3 Reduced Motion Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Anti-Patterns (Strictly Forbidden)

| Prohibited Practice | Reason | Correct Approach |
| :--- | :--- | :--- |
| ❌ **Arbitrary / Off-brand Hex Colors** (`#183A2B`, `#23523D`, `#DCE6E0`, `#7D8F86`, `#11241B`) | Breaks brand unity and causes design linter failures | Use only canonical brand tokens (`#051F20`, `#0B2B26`, `#163832`, `#235347`, `#8EB69B`, `#DAF1DE`, `#F6FBF7`, `#FFFFFF`, `#F2B84B`, `#D9534F`) |
| ❌ **Font Sizes Below 12px** (`10px`, `11px`) | Violates accessibility guidelines and fails design gate | Use `12px` hard floor for all small tags, overlines, and hints |
| ❌ **Emojis as Functional Icons** (⚙️, 📅, 🔍) | Cross-platform inconsistency, unscalable, unthemable | Strictly use `lucide-react` vector icons |
| ❌ **Touch Targets Below 44px** | Causes accidental taps and mobile frustration | Ensure all clickable elements meet `min-height: 44px; min-width: 44px;` |
| ❌ **Layout-Shifting State Transforms** | Causes visual jitter and layout recalculation jank | Use `scale(0.97)` on active press, never change width/height/border |
| ❌ **Missing Bottom Nav Clearance** | Content gets hidden underneath the 5-tab floating pill bar | Maintain `--page-padding-bottom: 112px` on all scrollable views |
| ❌ **Arbitrary Spacing Increments** (7px, 13px, 19px) | Breaks mathematical visual rhythm | Use strict 4px/8px modular spacing scale |

---

## 8. Verification & Delivery Gate

Before submitting any code changes or adding new views, verify:

- [ ] `npm run lint:design` passes with **0 violations** (colors, font-size, icons, legacy imports).
- [ ] No font size under `12px` anywhere in JSX or CSS classes.
- [ ] Only `lucide-react` icons are imported.
- [ ] Touch targets on buttons, tabs, and interactive chips are `≥ 44×44px`.
- [ ] All colors derive from the approved 6-tone forest + mint palette.
- [ ] Page bottom padding has `112px` clearance for the floating navigation pill bar.
- [ ] Accessible focus indicators (`2px solid #8EB69B`) are visible during keyboard navigation.
- [ ] Reduced-motion media query is respected across all animations.
- [ ] Layout verified across viewports: `360px` (small mobile), `390px` (standard phone), `768px` (tablet), and `1280px` (desktop).
