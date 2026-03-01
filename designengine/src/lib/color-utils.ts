/**
 * Color science utilities for generating design-system-quality color scales,
 * validating contrast ratios, and checking palette harmony.
 *
 * Uses HSL manipulation with perceptual lightness adjustments so dark shades
 * feel rich rather than muddy (the main flaw with simple opacity math).
 */

// ---------------------------------------------------------------------------
// Core conversions
// ---------------------------------------------------------------------------

export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }

export function hexToRgb(hex: string): RGB {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.substring(0, 2), 16),
    g: parseInt(c.substring(2, 4), 16),
    b: parseInt(c.substring(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: h * 360, s, l };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hue = ((h % 360) + 360) % 360;
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const hk = hue / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  function hueToRgb(t: number) {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  }
  return {
    r: Math.round(hueToRgb(hk + 1 / 3) * 255),
    g: Math.round(hueToRgb(hk) * 255),
    b: Math.round(hueToRgb(hk - 1 / 3) * 255),
  };
}

// ---------------------------------------------------------------------------
// Shade scale generation (50–950)
// ---------------------------------------------------------------------------

const SHADE_TARGETS: Record<number, number> = {
  50: 0.96, 100: 0.92, 200: 0.84, 300: 0.72, 400: 0.58,
  500: 0.46, 600: 0.36, 700: 0.28, 800: 0.20, 900: 0.14, 950: 0.08,
};

export type ShadeScale = Record<number, string>;

/**
 * Generate a perceptually-spaced shade scale from a single hex color.
 * The input color maps to the closest shade level; the rest are derived
 * by shifting lightness while gently desaturating at extremes.
 */
export function generateShadeScale(hex: string): ShadeScale {
  const hsl = rgbToHsl(hexToRgb(hex));
  const scale: ShadeScale = {};

  for (const [shade, targetL] of Object.entries(SHADE_TARGETS)) {
    const n = Number(shade);
    let s = hsl.s;
    // Desaturate at extremes for natural-looking tints and shades
    if (targetL > 0.85) s = hsl.s * (0.3 + 0.7 * ((1 - targetL) / 0.15));
    if (targetL < 0.15) s = hsl.s * (0.5 + 0.5 * (targetL / 0.15));
    s = Math.max(0, Math.min(1, s));
    scale[n] = rgbToHex(hslToRgb({ h: hsl.h, s, l: targetL }));
  }
  return scale;
}

/**
 * Generate full shade scales for all 5 design token colors.
 */
export function generateAllScales(colors: {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}): Record<string, ShadeScale> {
  return {
    primary: generateShadeScale(colors.primary),
    secondary: generateShadeScale(colors.secondary),
    accent: generateShadeScale(colors.accent),
    neutral: generateNeutralScale(colors.background, colors.text),
  };
}

/**
 * Generate a neutral gray scale that transitions from background to text color,
 * preserving any warmth/coolness in the base colors.
 */
function generateNeutralScale(bgHex: string, textHex: string): ShadeScale {
  const bgHsl = rgbToHsl(hexToRgb(bgHex));
  const textHsl = rgbToHsl(hexToRgb(textHex));
  const scale: ShadeScale = {};

  for (const [shade, targetL] of Object.entries(SHADE_TARGETS)) {
    const n = Number(shade);
    const t = 1 - targetL; // 0 = light end, 1 = dark end
    const h = bgHsl.h + (textHsl.h - bgHsl.h) * t;
    const s = bgHsl.s * (1 - t) * 0.3 + textHsl.s * t * 0.3;
    scale[n] = rgbToHex(hslToRgb({ h, s: Math.max(0, Math.min(1, s)), l: targetL }));
  }
  return scale;
}

// ---------------------------------------------------------------------------
// WCAG Contrast ratio
// ---------------------------------------------------------------------------

function relativeLuminance({ r, g, b }: RGB): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type WcagLevel = 'AAA' | 'AA' | 'AA-large' | 'fail';

export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-large';
  return 'fail';
}

/**
 * Validate all critical contrast pairs in a palette.
 */
export interface ContrastIssue {
  pair: string;
  fg: string;
  bg: string;
  ratio: number;
  level: WcagLevel;
  required: 'AA' | 'AA-large';
}

export function validatePaletteContrast(colors: {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}): ContrastIssue[] {
  const issues: ContrastIssue[] = [];

  const pairs: Array<{ pair: string; fg: string; bg: string; required: 'AA' | 'AA-large' }> = [
    { pair: 'Text on Background', fg: colors.text, bg: colors.background, required: 'AA' },
    { pair: 'Primary on Background', fg: colors.primary, bg: colors.background, required: 'AA-large' },
    { pair: 'White on Primary (button text)', fg: '#FFFFFF', bg: colors.primary, required: 'AA-large' },
    { pair: 'White on Secondary (button text)', fg: '#FFFFFF', bg: colors.secondary, required: 'AA-large' },
    { pair: 'White on Accent (button text)', fg: '#FFFFFF', bg: colors.accent, required: 'AA-large' },
  ];

  for (const { pair, fg, bg, required } of pairs) {
    const ratio = contrastRatio(fg, bg);
    const level = wcagLevel(ratio);
    const threshold = required === 'AA' ? 4.5 : 3;
    if (ratio < threshold) {
      issues.push({ pair, fg, bg, ratio: Math.round(ratio * 10) / 10, level, required });
    }
  }
  return issues;
}

// ---------------------------------------------------------------------------
// Color harmony analysis
// ---------------------------------------------------------------------------

export type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'monochromatic' | 'custom';

export function analyzeHarmony(colors: string[]): { type: HarmonyType; score: number; notes: string } {
  if (colors.length < 2) return { type: 'monochromatic', score: 100, notes: 'Single color.' };

  const hues = colors.map((c) => rgbToHsl(hexToRgb(c)).h);
  const saturations = colors.map((c) => rgbToHsl(hexToRgb(c)).s);

  // Check if essentially monochromatic (hues within 15°)
  const hueRange = Math.max(...hues) - Math.min(...hues);
  if (hueRange < 15 || hueRange > 345) {
    return { type: 'monochromatic', score: 85, notes: 'Monochromatic palette — elegant but low contrast. Consider an accent hue.' };
  }

  const chromatic = colors.filter((_, i) => saturations[i] > 0.08);
  if (chromatic.length < 2) {
    return { type: 'monochromatic', score: 80, notes: 'Mostly neutral palette. The accent color carries all the weight — make it count.' };
  }

  const chromaticHues = chromatic.map((c) => rgbToHsl(hexToRgb(c)).h);

  // Angle differences between chromatic hues
  const diffs: number[] = [];
  for (let i = 0; i < chromaticHues.length; i++) {
    for (let j = i + 1; j < chromaticHues.length; j++) {
      const d = Math.abs(chromaticHues[i] - chromaticHues[j]);
      diffs.push(d > 180 ? 360 - d : d);
    }
  }

  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

  if (diffs.some((d) => d > 150 && d < 210))
    return { type: 'complementary', score: 90, notes: 'Complementary palette — high energy and contrast. Use the complement sparingly.' };
  if (avgDiff < 45)
    return { type: 'analogous', score: 88, notes: 'Analogous palette — harmonious and cohesive. Ensure enough value contrast between similar hues.' };
  if (diffs.some((d) => d > 100 && d < 140))
    return { type: 'triadic', score: 85, notes: 'Triadic palette — vibrant and balanced. Let one color dominate (60-30-10 rule).' };
  if (diffs.some((d) => d > 130 && d < 170))
    return { type: 'split-complementary', score: 92, notes: 'Split-complementary — versatile with good contrast. One of the strongest harmony types.' };

  return { type: 'custom', score: 70, notes: 'No classic harmony detected. This can work, but double-check that the palette feels cohesive at scale.' };
}

// ---------------------------------------------------------------------------
// Type scale generation
// ---------------------------------------------------------------------------

export type TypeScaleRatio = 1.067 | 1.125 | 1.2 | 1.25 | 1.333 | 1.414 | 1.5 | 1.618;

export const TYPE_SCALE_NAMES: Record<number, string> = {
  1.067: 'Minor Second',
  1.125: 'Major Second',
  1.2: 'Minor Third',
  1.25: 'Major Third (default)',
  1.333: 'Perfect Fourth',
  1.414: 'Augmented Fourth',
  1.5: 'Perfect Fifth',
  1.618: 'Golden Ratio',
};

export function generateTypeScale(
  base: number,
  ratio: TypeScaleRatio,
): Record<string, string> {
  const scale = (n: number) => (base * Math.pow(ratio, n)).toFixed(3);
  return {
    xs: `${scale(-2)}rem`,
    sm: `${scale(-1)}rem`,
    base: `${base}rem`,
    lg: `${scale(1)}rem`,
    xl: `${scale(2)}rem`,
    '2xl': `${scale(3)}rem`,
    '3xl': `${scale(4)}rem`,
    '4xl': `${scale(5)}rem`,
    '5xl': `${scale(6)}rem`,
  };
}

// ---------------------------------------------------------------------------
// Dark-on-light check
// ---------------------------------------------------------------------------

export function isColorDark(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
