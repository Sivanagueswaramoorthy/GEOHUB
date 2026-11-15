/**
 * SuperAdmin Botanical Design Tokens
 * Canonical 6-Tone Botanical Luxury Palette for GeoHub
 */

export const botanicalTheme = {
  colors: {
    // Primary & Surfaces
    pageBg: '#FFFFFF',
    surfaceCard: '#F6FBF7',
    surfaceInput: '#F6FBF7',
    surfaceElevated: '#FFFFFF',
    
    // Brand Tokens
    forestDark: '#051F20',      // Headings, primary dark text
    deepEmerald: '#0B2B26',     // Deep emerald secondary dark
    emeraldSlate: '#163832',    // Primary buttons, active pill states
    forestMuted: '#235347',     // Secondary text, subheadings, labels
    softSage: '#8EB69B',        // Borders, subtle chips, inactive labels
    paleMint: '#DAF1DE',        // Chips, avatar backgrounds, icon tiles
    
    // Status & Accents
    emeraldLive: '#10B981',
    emeraldLiveBg: '#D1FAE5',
    emeraldLiveBorder: '#6EE7B7',
    amberPaused: '#F59E0B',
    amberPausedBg: '#FEF3C7',
    amberPausedBorder: '#FCD34D',
    roseDanger: '#DC2626',
    roseDangerBg: '#FEE2E2',
    roseDangerBorder: '#FCA5A5',
  },
  
  gradients: {
    // Only used inline on the Hero Card
    heroDark: 'linear-gradient(135deg, #051F20 0%, #0B2B26 50%, #163832 100%)',
    ambientGlow: 'radial-gradient(circle, #8EB69B 0%, transparent 70%)',
  },
  
  radius: {
    card: '22px',
    pill: '9999px',
    input: '14px',
    tile: '12px',
  },
  
  shadows: {
    soft: '0 4px 20px rgba(5, 31, 32, 0.05)',
    card: '0 2px 10px rgba(5, 31, 32, 0.04)',
    elevated: '0 8px 30px rgba(5, 31, 32, 0.08)',
    hero: '0 16px 36px rgba(5, 31, 32, 0.22)',
    sheet: '0 -10px 40px rgba(5, 31, 32, 0.16)',
  },
  
  typography: {
    screenTitle: '22px',
    sectionTitle: '16px',
    body: '14px',
    caption: '12px',
    tiny: '10px',
  },
  
  touchTarget: {
    minHeight: '44px',
    minWidth: '44px',
  },
} as const;

export default botanicalTheme;
