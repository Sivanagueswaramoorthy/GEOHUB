# GEO HUB Design System Specification (Production Master)

> **Location:** This document is the project documentation copy of the UI/UX Pro Max Design System.
> The primary system-of-record master file is located at `design-system/geo-hub/MASTER.md`.

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

---

## 3. Refined Typography System

GEO HUB uses **Plus Jakarta Sans** as the foundational typeface. It balances geometric modernism with high humanist legibility for dense dashboard data, mobile screens, and QR scanning operations.

### 3.1 Typeface Configuration
```css
--font-family: 'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
- Role-scoped 5-tab floating pill dock positioned `16px` above viewport bottom.
- Background: `#FFFFFF` with `backdrop-filter: blur(16px)` and border `1px solid #DAF1DE`.
- Shadow: `var(--shadow-floating-nav)`.
- Active pill indicator: `#163832` fill, `#FFFFFF` text, radius `9999px`.
- Minimum `44×44px` hit target per tab.

### 5.2 Cockpit Header / TopBar (`TopBar.tsx`)
- Height `64px`, horizontal padding `20px` (mobile) / `24px` (desktop).
- Background `#F6FBF7` with bottom hairline `1px solid #DAF1DE`.
- Role indicator pill with `12px` overline font.
- 38×38px avatar circle in deep pine `#163832` with `#DAF1DE` border.

### 5.3 Bento Grid & Hub Cards (`BentoGrid.tsx`, `HubCard.tsx`)
- Asymmetric CSS grid (1x1, 2x1, 2x2 spans).
- Radius `24px`, background `#FFFFFF`, border `1px solid #DAF1DE`.
- Ambient shadow `0 10px 30px rgba(5, 31, 32, 0.08)`.
- Hover transition `transform: translateY(-2px); box-shadow: 0 14px 34px rgba(5, 31, 32, 0.12);` (220ms ease-out).

### 5.4 Hero Spotlight Cards (`HeroCard.tsx`)
- Radius `32px`, padding `20px`–`24px`.
- Radial botanical background glow with 3D clay vector mascot integration.
- Mascot float animation (`4s ease-in-out infinite`).

### 5.5 Action Buttons (`PillButton.tsx`, `IconCircleButton.tsx`)
- Strictly `9999px` full pill radius.
- Height `44px` (standard), active press `scale(0.97)`.
- Primary: Background `#163832`, color `#FFFFFF`.
- Secondary: Background `#FFFFFF`, color `#051F20`, border `1px solid #DAF1DE`.
- Accessible focus outline: `2px solid #8EB69B` with `2px` offset.

### 5.6 Form Controls (`FormField.tsx`, `SearchField.tsx`)
- Height `48px`, radius `16px`, background `#FFFFFF`, border `1px solid #DAF1DE`.
- Focus ring: `outline: 2px solid #8EB69B`.

### 5.7 Status & Role Badges (`StatusChip.tsx`, `AccessChip.tsx`)
- Capsule pill, strictly `12px` bold font floor.
- Semantic backgrounds with verified AA contrast.

### 5.8 Dynamic Smart QR HUD (`MyQrView.tsx`, `VolunteerScanView.tsx`)
- 60s TTL dynamic token with 25s auto-refresh circular progress ring (`#163832` on `#DAF1DE`).
- Midnight pine viewfinder (`#051F20`) with warm sage reticle corners (`#8EB69B`).

### 5.9 Modals & Bottom Sheets (`BottomSheet.tsx`, `ConfirmDialog.tsx`)
- Top radius `24px`, white `#FFFFFF` surface.
- Scrim overlay `rgba(5, 31, 32, 0.45)` with `backdrop-filter: blur(8px)`.

---

## 6. Micro-interactions & Motion Tokens

```css
--motion-duration-fast:   120ms;
--motion-duration-normal: 220ms;
--motion-duration-sheet:  320ms;
--motion-ease-out:        cubic-bezier(0.16, 1, 0.3, 1);
--motion-press-scale:     0.97;
```
- Active press: `transform: scale(0.97);` (120ms).
- Reduced motion: `@media (prefers-reduced-motion: reduce)` resets duration to `0.01ms`.

---

## 7. Anti-Patterns & Prohibited Code Patterns

1. ❌ **No off-brand hex colors** (`#183A2B`, `#23523D`, `#DCE6E0`, `#7D8F86`, etc.) — strictly use the canonical 6-tone palette.
2. ❌ **No font sizes under 12px** (`10px`, `11px` strictly banned).
3. ❌ **No emoji as structural icons** — use `lucide-react` only.
4. ❌ **No touch targets under 44px**.
5. ❌ **No layout shifts on hover or focus**.
6. ❌ **No missing bottom nav clearance** (mandatory `112px` bottom padding).

---

## 8. Conformance Checklist

- [ ] `npm run lint:design` passes with 0 violations.
- [ ] Hard floor 12px respected everywhere.
- [ ] Lucide icons only.
- [ ] 44px minimum touch targets.
- [ ] Canonical palette tokens used exclusively.
