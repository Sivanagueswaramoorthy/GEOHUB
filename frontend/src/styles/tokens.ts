/**
 * GeoHub Design System - Strongly Typed Soft Pastel 3D Tokens (Single Source of Truth)
 * Mirror of src/styles/tokens.css
 */

export const BRAND_COLORS = {
  pine950: '#051F20', // darkest text, dark hero cards, scanner background
  pine900: '#0B2B26', // dark surfaces, headings on mint
  pine800: '#163832', // primary buttons, active pill tabs, key icons
  pine700: '#235347', // secondary text, links, helper meta, chart lines
  sage400: '#8EB69B', // dividers, chips, progress fills, secondary borders, focus ring
  mint100: '#DAF1DE', // selected states, card tints, hero radial glow
} as const;

export const DERIVED_NEUTRALS = {
  appBg: '#F6FBF7',
  cardWhite: '#FFFFFF',
  textPrimary: '#051F20',
  textSecondary: '#235347',
  textOnDark: '#FFFFFF',
  amberWarn: '#F2B84B',
  redDanger: '#D9534F',
} as const;

export const SEMANTIC_COLORS = {
  amber: '#F2B84B',
  red: '#D9534F',
  amberBg: 'rgba(242, 184, 75, 0.14)',
  amberBorder: 'rgba(242, 184, 75, 0.40)',
  redBg: 'rgba(217, 83, 79, 0.12)',
  redBorder: 'rgba(217, 83, 79, 0.35)',
} as const;

export const RADII = {
  cards: '24px',
  bento: '24px',
  hero: '32px',
  pills: '9999px',
  inputs: '16px',
  sheets: '24px',
  phone: '36px',
} as const;

export const SHADOWS = {
  card: '0 10px 30px rgba(5, 31, 32, 0.08)',
  nav: '0 12px 36px rgba(5, 31, 32, 0.12)',
  sheet: '0 -12px 40px rgba(5, 31, 32, 0.12)',
  modal: '0 24px 60px rgba(5, 31, 32, 0.18)',
} as const;

export const TYPOGRAPHY = {
  fontFamily: "'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  scale: {
    headline: {
      fontSize: 28,
      lineHeight: 32,
      fontWeight: 700,
      description: 'Per screen headline (2-4 words, max 2 lines)',
    },
    sectionTitle: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: 600,
      description: 'Section titles (1-2 words)',
    },
    statNumber: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: 800,
      description: 'Stat numbers (extra bold)',
    },
    body: {
      fontSize: 14.5,
      lineHeight: 22,
      fontWeight: 400,
      description: 'Standard body text (14-15px)',
    },
    bodyStrong: {
      fontSize: 14.5,
      lineHeight: 22,
      fontWeight: 600,
      description: 'Emphasized body text',
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: 600,
      description: 'Hard floor (never below 12px)',
    },
    captionStrong: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: 700,
      description: 'Strong captions (never below 12px)',
    },
    overline: {
      fontSize: 12, // Floor 12px
      lineHeight: 16,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
      description: 'Section overlines (12px floor)',
    },
    button: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: 700,
      description: 'Button text',
    },
    title: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: 700,
      description: 'Legacy title',
    },
  },
} as const;

export const COMPONENTS = {
  header: {
    height: 64,
  },
  floatingNav: {
    height: 60,
    bottomOffset: 20,
  },
  buttons: {
    gapIconText: 8,
  },
  chips: {
    minHeight: 24,
    maxHeight: 32,
    paddingX: 10,
    gap: 6,
  },
  tables: {
    rowHeight: 52,
  },
  forms: {
    fieldGap: 16,
    labelFontSize: 13,
    labelLineHeight: 18,
    labelWeight: 600,
    labelGap: 8,
    inputHeight: 48,
    inputRadius: 16,
    helperFontSize: 12,
    helperGap: 4,
    errorIconSize: 14,
  },
} as const;

export const COLORS = {
  ...BRAND_COLORS,
  ...DERIVED_NEUTRALS,
  statTiles: {
    mint: { bg: '#DAF1DE', border: '#8EB69B', text: '#163832', number: '#051F20' },
    lavender: { bg: '#DAF1DE', border: '#8EB69B', text: '#163832', number: '#051F20' },
    amber: { bg: 'rgba(242, 184, 75, 0.14)', border: 'rgba(242, 184, 75, 0.40)', text: '#051F20', number: '#051F20' },
    teal: { bg: '#DAF1DE', border: '#8EB69B', text: '#163832', number: '#051F20' },
  },
} as const;

export const ICONS = {
  strokeWidth: 2,
  sizes: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    '2xl': 48,
  },
} as const;
export type IconSizeToken = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const MEDIA = {
  hero: {
    overlay: 'linear-gradient(180deg, rgba(5,31,32,0) 0%, rgba(5,31,32,0.8) 100%)',
  },
} as const;

export const SEARCH_AND_FILTER = {
  searchBar: {
    debounceMs: 300,
  },
  filterPill: {
    touchTargetHeight: 36,
    fontSize: 14,
    fontWeight: 600,
    badgeFontSize: 12,
    badgePillSize: 22,
    chevronSize: 16,
    gap: 8,
  },
} as const;

export const MOTION = {
  duration: '220ms',
  ease: 'ease-out',
  pressScale: 0.97,
  floatDuration: '4s',
} as const;

/**
 * Tailwind Theme Extension Preset
 */
export const tailwindThemeConfig = {
  colors: {
    pine: {
      950: '#051F20',
      900: '#0B2B26',
      800: '#163832',
      700: '#235347',
    },
    sage: {
      400: '#8EB69B',
    },
    mint: {
      100: '#DAF1DE',
    },
    app: {
      bg: '#F6FBF7',
      card: '#FFFFFF',
    },
    brand: {
      amber: '#F2B84B',
      red: '#D9534F',
    },
  },
  borderRadius: {
    card: '24px',
    bento: '24px',
    hero: '32px',
    pill: '9999px',
    input: '16px',
    sheet: '24px',
    phone: '36px',
  },
  boxShadow: {
    card: '0 10px 30px rgba(5, 31, 32, 0.08)',
    nav: '0 12px 36px rgba(5, 31, 32, 0.12)',
  },
};
