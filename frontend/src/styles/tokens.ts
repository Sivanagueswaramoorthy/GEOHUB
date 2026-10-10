/**
 * GeoHub Design System - Strongly Typed Tokens (Green Eco Organization Spec)
 * Mirror of src/styles/tokens.css
 */

export const TYPOGRAPHY = {
  fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  scale: {
    display: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      cssVarSize: 'var(--font-display-size)',
      cssVarLine: 'var(--font-display-line)',
      cssVarWeight: 'var(--font-display-weight)',
      description: 'Page titles, greeting name',
    },
    titleL: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: 800,
      letterSpacing: '-0.01em',
      cssVarSize: 'var(--font-title-l-size)',
      cssVarLine: 'var(--font-title-l-line)',
      cssVarWeight: 'var(--font-title-l-weight)',
      description: 'Card hero titles',
    },
    title: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: 700,
      cssVarSize: 'var(--font-title-size)',
      cssVarLine: 'var(--font-title-line)',
      cssVarWeight: 'var(--font-title-weight)',
      description: 'Card and section titles',
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: 600,
      cssVarSize: 'var(--font-subtitle-size)',
      cssVarLine: 'var(--font-subtitle-line)',
      cssVarWeight: 'var(--font-subtitle-weight)',
      description: 'List item titles',
    },
    body: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: 400,
      cssVarSize: 'var(--font-body-size)',
      cssVarLine: 'var(--font-body-line)',
      cssVarWeight: 'var(--font-body-weight)',
      description: 'Default text, minimum body size',
    },
    bodyStrong: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: 600,
      cssVarSize: 'var(--font-body-strong-size)',
      cssVarLine: 'var(--font-body-strong-line)',
      cssVarWeight: 'var(--font-body-strong-weight)',
      description: 'Greeting salutation, emphasized text',
    },
    small: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: 500,
      cssVarSize: 'var(--font-small-size)',
      cssVarLine: 'var(--font-small-line)',
      cssVarWeight: 'var(--font-small-weight)',
      description: 'Helper text, metadata',
    },
    smallStrong: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: 600,
      cssVarSize: 'var(--font-small-size)',
      cssVarLine: 'var(--font-small-line)',
      cssVarWeight: 'var(--font-small-label-weight, 600)',
      description: 'Form labels, emphasized metadata',
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: 500,
      cssVarSize: 'var(--font-caption-size)',
      cssVarLine: 'var(--font-caption-line)',
      cssVarWeight: 'var(--font-caption-weight)',
      description: 'Chips, nav labels, timestamps',
    },
    captionStrong: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: 600,
      cssVarSize: 'var(--font-caption-size)',
      cssVarLine: 'var(--font-caption-line)',
      cssVarWeight: 'var(--font-caption-strong-weight, 600)',
      description: 'Active nav labels, strong chips',
    },
    overline: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
      cssVarSize: 'var(--font-overline-size)',
      cssVarLine: 'var(--font-overline-line)',
      cssVarWeight: 'var(--font-overline-weight)',
      description: 'Section overlines, stat labels, table headers',
    },
    statNumber: {
      fontSize: 32,
      lineHeight: 36,
      fontWeight: 800,
      fontFeatureSettings: '"tnum"',
      cssVarSize: 'var(--font-stat-number-size)',
      cssVarLine: 'var(--font-stat-number-line)',
      cssVarWeight: 'var(--font-stat-number-weight)',
      description: 'Stat number with tabular-nums',
    },
    button: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: 700,
      cssVarSize: 'var(--font-button-size)',
      cssVarLine: 'var(--font-button-line)',
      cssVarWeight: 'var(--font-button-weight)',
      description: 'Button text',
    },
  },
} as const;

export type TypographyToken = keyof typeof TYPOGRAPHY.scale;

export const SPACING = {
  base: 4,
  scale: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    13: 52,
    14: 56,
    16: 64,
    18: 72,
    24: 96,
    28: 112,
  },
  layout: {
    pageGutterMobile: 20,
    pageGutterDesktop: 24,
    contentMaxWidth: 1200,
    mobileMaxWidth: 480,
    sectionGap: 24,
    cardPadding: 16,
    cardHeroPadding: 20,
    gapIconLabel: 8,
    gapChips: 8,
    gapStackedCards: 16,
    gapStatTiles: 12,
    listRowMinHeight: 56,
    contentBottomPadding: 112,
  },
} as const;

export const ICONS = {
  strokeWidth: 1.75,
  lineCap: 'round' as const,
  lineJoin: 'round' as const,
  sizes: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    '2xl': 48,
  },
  containers: {
    list: 40,
    tile: 44,
    chevron: 36,
    radius: 12,
  },
} as const;

export type IconSizeToken = keyof typeof ICONS.sizes;

export const MEDIA = {
  hero: {
    aspectRatio: '16 / 9',
    aspectRatioNumeric: 16 / 9,
    radius: 24,
    overlay: 'linear-gradient(180deg, rgba(15, 23, 42, 0) 40%, rgba(15, 23, 42, 0.85) 100%)',
    minTextContrast: 4.5,
  },
  eventCard: {
    aspectRatio: '16 / 9',
    aspectRatioNumeric: 16 / 9,
    topRadius: 24,
    badgeOffset: 12,
  },
  avatar: {
    sizes: {
      sm: 32,
      md: 40,
      lg: 48,
      xl: 72,
    },
    onlineDotSize: 10,
    onlineDotRing: 2,
    fallbackWeight: 600,
  },
  orgLogo: {
    size: 72,
    radius: 22,
    padding: 12,
    fit: 'contain' as const,
  },
  gallery: {
    aspectRatio: '1 / 1',
    aspectRatioNumeric: 1,
    gap: 8,
    fit: 'cover' as const,
    lightboxCtrlSize: 44,
  },
} as const;

export type AvatarSizeToken = keyof typeof MEDIA.avatar.sizes;

export const SEARCH_AND_FILTER = {
  searchBar: {
    height: 48,
    radius: 16,
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    iconSize: 20,
    iconInset: 16,
    fontSize: 14,
    placeholderColor: '#64748B',
    textColor: '#0F172A',
    clearIconSize: 24,
    clearHitArea: 44,
    focusRing: '0 0 0 2px #10B981, 0 0 0 4px rgba(16, 185, 129, 0.18)',
    debounceMs: 250,
    marginTop: 16,
    marginBottom: 12,
  },
  filterPill: {
    visualHeight: 40,
    touchTargetHeight: 44,
    radius: 999,
    iconSize: 16,
    fontSize: 14,
    fontWeight: 600,
    badgePillSize: 22,
    badgeFontSize: 12,
    chevronSize: 16,
    gap: 8,
    gutterIndent: 20,
    resultsCountMarginTop: 16,
  },
} as const;

export const COMPONENTS = {
  header: {
    height: 64,
    buttonSize: 44,
    buttonGap: 12,
    gutter: 20,
  },
  floatingNav: {
    height: 64,
    marginSide: 16,
    marginBottom: 16,
    slotsCount: 5,
    iconSize: 24,
    labelFontSize: 12,
    labelFontWeight: 600,
  },
  buttons: {
    primaryHeight: 52,
    primaryHeightMax: 54,
    secondaryHeight: 48,
    smallHeight: 36,
    radiusPill: 999,
    gapIconText: 8,
    minHitArea: 44,
  },
  chips: {
    minHeight: 24,
    maxHeight: 28,
    paddingX: 10,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 500,
    iconSizeMin: 12,
    iconSizeMax: 14,
    gap: 4,
    radius: 999,
  },
  forms: {
    labelFontSize: 13,
    labelLineHeight: 18,
    labelWeight: 600,
    labelGap: 8,
    inputHeight: 48,
    inputRadius: 16,
    helperFontSize: 12,
    helperGap: 4,
    errorIconSize: 16,
    fieldGap: 20,
  },
  modals: {
    sheetHandleWidth: 36,
    sheetHandleHeight: 4,
    sheetPadding: 20,
    sheetTopRadius: 24,
    dialogRadius: 20,
    closeHitArea: 44,
    footerButtonHeight: 52,
    maxHeightVh: 90,
  },
  tables: {
    rowHeight: 56,
    headerFontSize: 11,
    headerLineHeight: 14,
    headerWeight: 700,
    collapseBreakpoint: 640,
  },
} as const;

export const COLORS = {
  scaffold: '#FFFFFF',
  card: '#FFFFFF',
  sheet: '#FFFFFF',
  modal: '#FFFFFF',
  brandGreen: '#10B981',
  darkGreen: '#064E3B',
  mintTint: '#E7F9F1',
  mintBorder: '#A7F3D0',
  mintText: '#065F46',
  statTiles: {
    mint: {
      bg: '#E7F9F1',
      border: '#A7F3D0',
      text: '#065F46',
      number: '#064E3B',
    },
    lavender: {
      bg: '#F3EEFF',
      border: '#DDD1FF',
      text: '#5B21B6',
      number: '#5B21B6',
    },
    amber: {
      bg: '#FFF8E6',
      border: '#FDE68A',
      text: '#92400E',
      number: '#7C2D12',
    },
    teal: {
      bg: '#E8FBF8',
      border: '#99F6E4',
      text: '#0F766E',
      number: '#115E59',
    },
  },
  text: {
    main: '#0F172A',
    secondary: '#64748B',
    tertiary: '#94A3B8',
  },
  borders: {
    card: '#EEF1F5',
    divider: '#EEF1F5',
    input: '#E2E8F0',
  },
  danger: {
    red: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#DC2626',
  },
} as const;

export const RADII = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
  card: 24,
  tile: 20,
  input: 16,
  btn: 999,
} as const;

export const SHADOWS = {
  card: '0 6px 24px rgba(15, 23, 42, 0.06)',
  floatingNav: '0 10px 30px rgba(15, 23, 42, 0.12)',
  sheet: '0 -10px 40px rgba(15, 23, 42, 0.14)',
  modal: '0 20px 48px rgba(15, 23, 42, 0.18)',
} as const;

/**
 * Standard CSS style objects for direct TSX style assignment
 */
export const typographyStyles = {
  display: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 'var(--font-display-size, 28px)',
    lineHeight: 'var(--font-display-line, 34px)',
    fontWeight: 800,
  },
  titleL: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 'var(--font-title-l-size, 22px)',
    lineHeight: 'var(--font-title-l-line, 28px)',
    fontWeight: 800,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 'var(--font-title-size, 18px)',
    lineHeight: 'var(--font-title-line, 24px)',
    fontWeight: 700,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 'var(--font-subtitle-size, 16px)',
    lineHeight: 'var(--font-subtitle-line, 24px)',
    fontWeight: 600,
  },
  body: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 'var(--font-body-size, 14px)',
    lineHeight: 'var(--font-body-line, 22px)',
    fontWeight: 400,
  },
  bodyStrong: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 'var(--font-body-strong-size, 14px)',
    lineHeight: 'var(--font-body-strong-line, 22px)',
    fontWeight: 600,
  },
  small: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 'var(--font-small-size, 13px)',
    lineHeight: 'var(--font-small-line, 18px)',
    fontWeight: 500,
  },
  caption: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 'var(--font-caption-size, 12px)',
    lineHeight: 'var(--font-caption-line, 16px)',
    fontWeight: 500,
  },
  overline: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 'var(--font-overline-size, 11px)',
    lineHeight: 'var(--font-overline-line, 14px)',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  statNumber: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 'var(--font-stat-number-size, 32px)',
    lineHeight: 'var(--font-stat-number-line, 36px)',
    fontWeight: 800,
    fontFeatureSettings: '"tnum"',
  },
  button: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 'var(--font-button-size, 15px)',
    lineHeight: 'var(--font-button-line, 20px)',
    fontWeight: 700,
  },
} as const;

/**
 * Text overflow clamping utilities
 */
export const lineClamp = {
  title2: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  desc3: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  singleLine: {
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
} as const;
