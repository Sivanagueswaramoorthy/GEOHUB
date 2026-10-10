# GeoHub Design System Specification (UI Spec v1.0)

**Platform**: GeoHub College Geospatial & Earth Science Club Management (`/frontend`, React 19 + TypeScript)  
**Reference Benchmark**: Green Eco Organization Mobile & Desktop UI System  
**Scope**: 6 Persona Roles (Faculty Advisor, Coordinator / Lead, Documentation Lead, Treasurer Lead, Promotion Lead, Student Volunteer) across ALL Screens, Views, Modals, Sheets, and Viewports (360×740, 390×844, 430×932, 768×1024, 1280×800).

---

## 1. System Principles & Scaffold Invariants

1. **Pure White Container Scaffold**: All pages, scaffold surfaces, cards, sheets, and dialogs are strictly white (`#FFFFFF`). Dark-gray, off-white, or tinted screen backgrounds are strictly forbidden.
2. **Deterministic Alignment (Left Edge Unity)**: Every root content block on any screen shares the exact same left edge (the 20px gutter on mobile, 24px on desktop). No root block may have custom horizontal indents.
3. **Strict 4px Mathematical Spacing**: All paddings, margins, and gaps are multiples of 4px. No ad-hoc odd values (e.g., 5px, 7px, 13px, 17px) are permitted.
4. **Single Source of Truth**: All styling must draw from CSS variables defined in `src/styles/tokens.css` and mirrored in `src/styles/tokens.ts`. Direct pixel overrides on screens are prohibited.

---

## 2. Typography Specification

**Font Family**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`  
*All sizes and line-heights are explicit; nothing below 11px is permitted.*

| Token Name | Size (px) | Line Height (px) | Font Weight | Letter Spacing | Text Transform | Canonical Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | 28px | 34px | 800 (ExtraBold) | Normal | None | Page titles, greeting user names |
| **Title-L** | 22px | 28px | 800 (ExtraBold) | Normal | None | Card hero titles, featured banners |
| **Title** | 18px | 24px | 700 (Bold) | Normal | None | Card headers, section titles, modal titles |
| **Subtitle** | 16px | 24px | 600 (SemiBold) | Normal | None | List item titles, member names, tile titles |
| **Body** | 14px | 22px | 400 (Regular) | Normal | None | Default body text, descriptions, minimum body |
| **Body-strong** | 14px | 22px | 600 (SemiBold) | Normal | None | Greeting salutation, emphasized body |
| **Small** | 13px | 18px | 500 (Medium) | Normal | None | Helper text, metadata, form labels (600) |
| **Caption** | 12px | 16px | 500 (Medium) | Normal | None | Chips, nav labels, timestamps, form helpers |
| **Overline** | 11px | 14px | 700 (Bold) | `+0.08em` | Uppercase | Section overlines, stat labels, table headers |
| **Stat number** | 32px | 36px | 800 (ExtraBold) | Normal (`tabular-nums`) | None | Metric numbers in StatTile |
| **Button** | 15px | 20px | 700 (Bold) | Normal | None | Primary and secondary button text |

### Text Overflow & Line Clamping Rules
- **Titles & Headings**: Maximum 2 lines with `-webkit-line-clamp: 2`, `overflow: hidden`, `text-overflow: ellipsis`.
- **Descriptions & Summaries**: Maximum 3 lines with `-webkit-line-clamp: 3`, `overflow: hidden`, `text-overflow: ellipsis`.
- **Emails, Roll Numbers, IDs & URLs**: Exactly 1 line with `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`.

---

## 3. Spacing & Layout Architecture

### 4px Modular Scale
```
--space-1:   4px
--space-2:   8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-7:  28px
--space-8:  32px
--space-9:  36px
--space-10: 40px
--space-11: 44px
--space-12: 48px
--space-13: 52px
--space-14: 56px
--space-16: 64px
--space-18: 72px
--space-24: 96px
--space-28: 112px
```

### Layout Grid & Alignment Rules
- **Page Gutters**:
  - Mobile (< 768px): Exactly **20px** left and right padding.
  - Tablet & Desktop (≥ 768px): Exactly **24px** left and right padding.
  - Max Content Width: **1200px** centered on desktop screens (or 480px simulated mobile frame if active).
- **Section Gap**: **24px** vertical gap between major sections.
- **Card Padding**:
  - Standard cards & tiles: **16px** internal padding on all sides.
  - Hero cards: **20px** internal padding.
- **Stacking Gaps**:
  - Gap between stacked cards: **16px**.
  - Gap between icon and adjacent label: **8px**.
  - Gap between chips / filter pills: **8px**.
  - Gap between StatTiles: **12px**.
- **List Rows**:
  - Minimum height: **56px**.
- **Bottom Navigation Clearance**:
  - Content bottom padding: **112px** (`--page-padding-bottom: 112px`), preventing any content from being obscured by the floating nav pill (64px height + 16px bottom margin + 32px breathing room).
- **Global Left Edge Unity**:
  - All sibling blocks on a page (Overline, Header, StatTiles, SearchBar, FilterRow, Card groups) must align flush to the 20px page gutter.
  - Left edge variance across sibling blocks must be ≤ 1px.

---

## 4. Icons System

**Library**: Strictly `lucide-react`. All other icon libraries, raw custom SVGs, and emoji icons are forbidden.

### Size Tokens
| Token | Size | Stroke Width | End Caps / Joins | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `sm` | **16px** | 1.75 | `round` / `round` | Inside chips, filter pills, inline text badges |
| `md` | **20px** | 1.75 | `round` / `round` | Default in list rows, buttons, inputs, greeting sun |
| `lg` | **24px** | 1.75 | `round` / `round` | App header icons (bell, plus), floating nav tabs |
| `xl` | **28px** | 1.75 | `round` / `round` | Large module tile icons |

*Raw ad-hoc sizes (e.g. `size={18}`, `size={22}`, `size={30}`) are strictly forbidden. All icons must be rendered via `<Icon name="..." size="sm"|"md"|"lg"|"xl" />`.*

### Icon Containers
- **List & Member Tile Containers**: **40px × 40px** rounded square, `border-radius: 12px`, centered (`display: flex; align-items: center; justify-content: center;`).
- **Shortcut & Module Tile Containers**: **44px × 44px** rounded square, `border-radius: 12px`, centered.
- **Chevron & Circular Action Buttons**: **36px × 36px**, `border-radius: 999px` or `10px`, centered.
- **Vertical Alignment**: Icon and paired text baseline/center must align within **1px**. The icon container color must match the parent's semantic palette.

---

## 5. Images and Media Specifications

### Aspect Ratios & Geometry
1. **Hero Images**:
   - Aspect ratio: `16 / 9` (`aspect-ratio: 16 / 9`).
   - Border radius: `24px` (`border-radius: 24px`).
   - Object fit: `cover`, object position: `center`.
   - Contrast Protection: Bottom 60% dark linear gradient overlay (`linear-gradient(180deg, rgba(15,23,42,0) 40%, rgba(15,23,42,0.85) 100%)`) guaranteeing ≥ 4.5:1 contrast ratio for overlay text.
2. **Event Card Images**:
   - Aspect ratio: `16 / 9`.
   - Border radius: Top corners only `24px` (`border-radius: 24px 24px 0 0`).
   - Badges:
     - Date badge: pinned `12px` from top-left.
     - Status pill: pinned `12px` from top-right.
3. **Avatars**:
   - Standard Sizes: **32px**, **40px**, **48px**, and **72px** circles (`border-radius: 999px`).
   - Fallback: Centered initials in font weight `600` on tinted pastel background.
   - Online Presence Dot: **10px × 10px** circle positioned at the bottom-right with a **2px white ring** (`box-shadow: 0 0 0 2px #FFFFFF`).
4. **Organization Logo Card**:
   - Dimensions: **72px × 72px** white card.
   - Border radius: **22px** (`border-radius: 22px`).
   - Internal padding: **12px**.
   - Object fit: `contain`, object position: `center`.
5. **Gallery Thumbnails**:
   - Aspect ratio: `1 / 1` (Square).
   - Grid spacing: `8px` gap.
   - Object fit: `cover`.
   - Lightbox: Centered `object-fit: contain` on white background with `44px` minimum hit-target controls.

### Asset Loading & Resiliency
- Every `<Image>` component must define explicit `width` and `height` or `aspect-ratio` to enforce Cumulative Layout Shift (CLS) ≤ 0.02.
- `loading="lazy"` on all images except the initial above-the-fold hero image (`loading="eager"`).
- `decoding="async"`.
- Loading State: Neutral skeleton placeholder block (`#F1F5F9`) matching exact target dimensions.
- Error Fallback: Tinted container with standard Lucide `Image` fallback icon.
- Accessibility: Meaningful `alt` for content images; empty `alt=""` with `aria-hidden="true"` for decorative images.

---

## 6. Search Bars and Filter Pills

### Shared `<SearchBar>` Specification
- **Width**: `100%` (Full width of container gutter).
- **Height**: **48px**.
- **Border Radius**: **16px** (`border-radius: 16px`).
- **Border**: `1px solid #E2E8F0`.
- **Background**: `#FFFFFF` strictly.
- **Leading Icon**: Lucide `Search` **20px**, inset at `16px` from left.
- **Input Text**: `14px` / `22px`, `#0F172A` (weight 400).
- **Placeholder**: `14px`, `#64748B`, following unified pattern: `"Search <category>..."` (e.g. `"Search by title, venue, or description..."`).
- **Trailing Clear Button**: Lucide `X` icon (**24px**), in a **44px** circular touch-target button; visible only when input is non-empty.
- **Focus Ring**: `2px solid #10B981` with soft glow (`box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18)`).
- **Semantics**: `type="search"`, `enterKeyHint="search"`, debounced at **250ms**, accessible `aria-label`.
- **Placement**: Placed directly below the page header block (overline, title, subtitle, action) with **16px** margin-top and **12px** margin-bottom.

### Shared `<FilterPill>` Row Specification
- **Height**: **40px** visual height, **44px** touch target (`padding: 10px 14px`).
- **Border Radius**: **999px** (Fully rounded capsule).
- **Layout**: Single horizontal scrolling row (`overflow-x: auto; flex-wrap: nowrap; scrollbar-width: none;`).
- **Gaps**: **8px** gap between pills.
- **Alignment**: First item aligns flush with the **20px** page gutter.
- **Edge Fade**: Smooth horizontal gradient mask on trailing edge to indicate scroll overflow.
- **Interior Elements**:
  - Leading Icon: **16px** (`size="sm"`).
  - Label: `14px`, weight `600` (SemiBold).
  - Count Badge: `12px` font in a **22px** capsule pill (`padding: 2px 6px; border-radius: 999px`).
  - Chevron (if dropdown): **16px** (`size="sm"`).

### Results Counter & Empty State
- **Results Counter**: Text in **Overline** (11px / 14px, 700 uppercase), placed **16px** below the filter pills.
- **Empty State**: Centered block with **48px** Lucide icon, **Title** (18px/700), **Body** (14px/400), and a primary recovery CTA button.

---

## 7. Headers, Cards, Lists, and Interactive Elements

### 1. App Header
- **Height**: Exactly **64px**.
- **Scaffold**: Sticky at top (`position: sticky; top: 0; z-index: 40; background: #FFFFFF;`).
- **Wordmark**: Left-aligned flush with the 20px gutter.
- **Action Buttons**: Bell (notifications) and `+` (quick actions) are **44px × 44px** circles, **12px** apart, right-aligned flush with the 20px gutter.
- **Vertical Alignment**: All items vertically centered at `32px` line. Identical on all role screens.

### 2. Greeting Row
- **Salutation**: Lucide `Sun` (20px) + greeting text (Body-strong 14/22 600) on one baseline.
- **User Name**: Directly below in **Display** (28/34 800) with a **4px** gap.
- **Org Logo Card**: 72px white rounded card (radius 22px), top-right aligned flush with the greeting block top edge.

### 3. Page Header Block
- **Overline Chip**: Overline text (11/14 700) in a rounded capsule.
- **Title**: Display (28/34 800).
- **Subtitle**: Body (14/22 400), color `#64748B`.
- **Primary Action Pill**: Aligned to the title baseline on the right.

### 4. Stat Tiles
- **Grid Layout**: 2 per row on mobile (gap 12px), 4 per row on desktop (≥ 1024px). Equal height within each row.
- **Top Row**: Label (Overline) top-left; Icon container (40px, radius 12px) top-right.
- **Metric Row**: Stat number (32/36 800 `tabular-nums`) with **8px** gap below label.
- **Bottom Row**: Footnote status chip bottom-left.

### 5. Card Header Row
- **Title**: Title (18/24 700) left-aligned.
- **Count / Action**: Count badge or "See all" link right-aligned on the exact same baseline.
- **Bottom Gap**: **12px** gap to card body content.

### 6. Member & List Cards
- **Avatar**: **48px** circle on the left.
- **Gap**: **12px** gap between avatar and text column.
- **Text Column**: Name in **Subtitle** (16/24 600) with role chip inline; email in **Small** (13/18 500) with 1-line ellipsis; squad/year chips wrap with **8px** gap.
- **Action**: Chevron button **36px** on the right, vertically centered to the card.
- **Minimum Row Height**: **56px**.

### 7. Chips & Badges
- **Height**: **24px to 28px**.
- **Padding**: `0 10px`.
- **Typography**: Caption (12/16 500).
- **Icon**: `12px` to `14px` with a **4px** gap.
- **Border Radius**: **999px** (Fully rounded pill).
- **Variants**: Strictly unified (Role, Squad, Year, Status) across all screens.

### 8. Buttons
- **Primary Button**: Height **52px to 54px**, radius **999px** (or 16px where specified), text Button (15/20 700). Full width on mobile form views.
- **Secondary Button**: Height **48px**, radius **999px**, text Button (15/20 700).
- **Small Button**: Height **36px**, radius **999px**, text Caption (12/16 600).
- **Hit Area Minimum**: Minimum touch area is **44px × 44px**.
- **Icon & Label Gap**: Exactly **8px**, vertically and horizontally centered.

### 9. Tables
- **Header**: Overline (11/14 700 uppercase).
- **Row Height**: **56px**.
- **Data Alignment**: Numeric columns right-aligned with `tabular-nums`; text columns left-aligned.
- **Responsive Collapse**: Automatic card conversion below `640px` viewport width.

### 10. Forms & Inputs
- **Label**: Small-strong (13/18 600) placed **8px** above input.
- **Input Height**: **48px**, radius **16px**, border `1px solid #E2E8F0`, padding `0 16px`.
- **Helper Text**: Caption (12/16 500) placed **4px** below input.
- **Error State**: `1px solid #EF4444` with a **16px** error icon and red caption text.
- **Field Spacing**: **20px** vertical gap between form fields.

### 11. Modals and Bottom Sheets
- **Bottom Sheet Handle**: **36px × 4px** pill, centered, `#CBD5E1`.
- **Internal Padding**: **20px** on all sides.
- **Header**: Title (18/24 700) left, **44px** circular close button right.
- **Footer Buttons**: Full width, height **52px**.
- **Maximum Height**: `90vh` with internal scrolling (`overscroll-behavior: contain`).
- **Radii**: Sheet top corners `24px` (`border-radius: 24px 24px 0 0`); Dialog modal `20px` all corners.
- **Scaffold**: Strictly `#FFFFFF` pure white background.

### 12. Floating Navigation
- **Height**: **64px**.
- **Margins**: **16px** left, **16px** right, **16px** bottom.
- **Slots**: Exactly **5 equal slots** (`flex: 1`).
- **Icons**: Lucide **24px** (`size="lg"`).
- **Active State**: Pill with icon + `12px` / weight 600 label, vertically centered.
- **Invariants**: Positioned fixed at bottom, identical layout and slot proportions across all 6 roles.

---

## 8. Color Palette & Surface Tokens

### Surface & Canvas
- `--bg-scaffold`: `#FFFFFF`
- `--bg-card`: `#FFFFFF`
- `--bg-sheet`: `#FFFFFF`
- `--bg-modal`: `#FFFFFF`
- `--bg-subtle`: `#F8FAFC`

### Brand Green Palette
- `--brand-green`: `#10B981` (Primary Emerald)
- `--dark-green`: `#064E3B` (Deep Forest)
- `--mint-tint`: `#E7F9F1` (Light Tint)
- `--mint-border`: `#A7F3D0` (Border Mint)
- `--mint-text`: `#065F46` (Dark Mint Text)

### Pastel Stat Tile Tokens
- **Mint**: Bg `#E7F9F1`, Border `#A7F3D0`, Text `#065F46`, Number `#064E3B`
- **Lavender**: Bg `#F3EEFF`, Border `#DDD1FF`, Text `#5B21B6`, Number `#5B21B6`
- **Amber**: Bg `#FFF8E6`, Border `#FDE68A`, Text `#92400E`, Number `#7C2D12`
- **Teal**: Bg `#E8FBF8`, Border `#99F6E4`, Text `#0F766E`, Number `#115E59`

### Neutrals & Text
- `--text-main`: `#0F172A` (Slate 900)
- `--text-secondary`: `#64748B` (Slate 500)
- `--text-tertiary`: `#94A3B8` (Slate 400)
- `--divider`: `#EEF1F5`
- `--card-border`: `#EEF1F5`
- `--input-border`: `#E2E8F0`

### Status & Danger
- `--danger-red`: `#EF4444`
- `--danger-bg`: `#FEF2F2`
- `--danger-border`: `#FECACA`
- `--danger-text`: `#DC2626`

---

## 9. Visual Regression Audit Gates (Phase 2 Spec)

All screens and viewports will be audited against the following 11 automated gates:

1. **Font Gate**: Every computed `font-size`, `line-height`, and `font-weight` must match a token in the scale. Zero ad-hoc sizes or values < 11px.
2. **Spacing Gate**: All computed `padding`, `margin`, and `gap` values must be multiples of 4px. Left gutters must strictly equal 20px (24px at ≥ 768px). Sibling root blocks must share identical left edge (delta ≤ 1px).
3. **Icon Gate**: Every rendered SVG must match width and height of 16px, 20px, 24px, or 28px with stroke width 1.75. Icon and text vertical centers must align within 1px. No emojis or non-Lucide icons.
4. **Image Gate**: Aspect ratios must match spec (Hero 16:9, Event 16:9, Gallery 1:1, Avatar 1:1) within 2%. No layout shift (CLS ≤ 0.02). Image overlays must guarantee ≥ 4.5:1 text contrast.
5. **Search Bar Gate**: Exactly one `<SearchBar>` per list screen, height 48px, radius 16px, leading icon 20px, clear button present, debounced 250ms.
6. **Filter Pill Gate**: Height 40px (touch target 44px), single horizontal scrolling row, no wrap, first pill flush to 20px gutter.
7. **Header & Nav Gate**: AppHeader 64px, FloatingNav 64px with 16px margins and 5 equal slots. Content bottom padding must clear nav by ≥ 16px.
8. **Truncation Gate**: Long strings (names, emails, titles, currency) do not break layout; ellipsis applied correctly.
9. **Tap Target Gate**: Interactive elements have minimum touch bounding box of 44px × 44px.
10. **Overflow Gate**: Zero horizontal page overflow (`scrollWidth === clientWidth`). Zero clipped text.
11. **White Scaffold Gate**: Container backgrounds are strictly pure white `#FFFFFF`.
