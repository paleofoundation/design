/**
 * DZYNE DESIGN TOKENS — SINGLE SOURCE OF TRUTH
 *
 * Every UI component MUST import colors from here.
 * Never hardcode a hex value inline. Import from this file.
 *
 * Change a color HERE and it propagates everywhere.
 * TypeScript compilation catches references to nonexistent tokens.
 *
 * THE PALETTE (6 canonical colors):
 *   #F5EFE8  — warm off-white (light surfaces)
 *   #FFFFFF  — pure white (backgrounds, text on dark)
 *   #306E5E  — deep forest green (brand accent, nav)
 *   #FF6719  — bold orange (CTAs, primary actions)
 *   #F2B245  — warm amber (warnings, highlights)
 *   #CAC5F9  — soft lavender (decorative, tags)
 */

export const PALETTE = {
  green: {
    deep: '#306E5E',
    dark: '#275A4C',
    darker: '#1E4A3E',
    darkest: '#163A30',
    light: '#4A8E7A',
    muted: 'rgba(48, 110, 94, 0.08)',
  },
  orange: {
    base: '#FF6719',
    hover: '#E85A12',
    light: '#FF8547',
    muted: 'rgba(255, 103, 25, 0.08)',
  },
  amber: {
    base: '#F2B245',
    light: '#F5C76A',
    muted: 'rgba(242, 178, 69, 0.08)',
  },
  lavender: {
    base: '#CAC5F9',
    light: '#DDD9FC',
    muted: 'rgba(202, 197, 249, 0.1)',
  },
  surface: {
    warm: '#F5EFE8',
    light: '#FDFBF7',
    white: '#FFFFFF',
  },
  text: {
    dark: '#1A1A1A',
    body: '#4A4A4A',
    muted: '#7A7A7A',
    onDark: '#FFFFFF',
    onGreen: '#FFFFFF',
  },
  semantic: {
    error: '#DC3545',
    errorMuted: 'rgba(220, 53, 69, 0.08)',
    success: '#28A745',
    successMuted: 'rgba(40, 167, 69, 0.08)',
    warning: '#F2B245',
  },
} as const;

/** Dashboard (light) theme tokens — white canvas with green/orange accents */
export const DASH = {
  bg: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: 'rgba(48, 110, 94, 0.12)',
  cardHover: '#FDFBF7',
  inputBg: '#FDFBF7',
  inputBorder: 'rgba(48, 110, 94, 0.15)',
  heading: '#1A1A1A',
  body: '#4A4A4A',
  muted: '#7A7A7A',
  faint: '#B0ADA8',
  divider: 'rgba(48, 110, 94, 0.08)',
  dividerStrong: 'rgba(48, 110, 94, 0.15)',
  tableHeaderBg: '#FDFBF7',
  codeBg: '#F5EFE8',
} as const;

export const FONT = {
  heading: 'var(--font-fraunces, Fraunces, Georgia, serif)',
  body: 'var(--font-source-sans, Source Sans 3, system-ui, sans-serif)',
  mono: 'var(--font-jetbrains, JetBrains Mono, monospace)',
} as const;

export const RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const;

export const TEXT_SIZE = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.333rem',
  '2xl': '1.777rem',
  '3xl': '2.369rem',
  '4xl': '3.157rem',
} as const;
