export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return {
    r: parseInt(full.substring(0, 2), 16),
    g: parseInt(full.substring(2, 4), 16),
    b: parseInt(full.substring(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('');
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r: ri, g: gi, b: bi } = hexToRgb(hex);
  const r = ri / 255, g = gi / 255, b = bi / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastColor(bgHex: string): string {
  return relativeLuminance(bgHex) > 0.4 ? '#1A1A1A' : '#FFFFFF';
}

export function adjustOpacity(hex: string, opacity: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
}

export function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

export function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

export function mixColors(hex1: string, hex2: string, ratio: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return rgbToHex(
    c1.r + (c2.r - c1.r) * ratio,
    c1.g + (c2.g - c1.g) * ratio,
    c1.b + (c2.b - c1.b) * ratio,
  );
}

/** Deterministic pseudo-random from a seed string */
export function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = (hash * 16807) % 2147483647;
    if (hash < 0) hash += 2147483647;
    return hash / 2147483647;
  };
}

/**
 * Build a smooth closed SVG path through points using Catmull-Rom → cubic bezier.
 * `tension` controls curve tightness (0.2–0.4 typical).
 */
export function smoothClosedPath(
  points: Array<{ x: number; y: number }>,
  tension = 0.3,
): string {
  const n = points.length;
  if (n < 3) return '';
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(points[0].x)},${f(points[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C${f(cp1x)},${f(cp1y)} ${f(cp2x)},${f(cp2y)} ${f(p2.x)},${f(p2.y)}`;
  }
  return d + ' Z';
}

/**
 * Generate a smooth sine-like wave path using cubic bezier segments.
 * Returns the path `d` attribute without fill commands.
 */
export function wavePath(
  width: number,
  yCenter: number,
  amplitude: number,
  waves: number,
): string {
  const wl = width / waves;
  const f = (v: number) => v.toFixed(1);
  let d = `M0,${f(yCenter)}`;
  for (let i = 0; i < waves; i++) {
    const x0 = i * wl;
    d += ` C${f(x0 + wl / 6)},${f(yCenter - amplitude)}`;
    d += ` ${f(x0 + wl / 3)},${f(yCenter - amplitude)}`;
    d += ` ${f(x0 + wl / 2)},${f(yCenter)}`;
    d += ` C${f(x0 + 2 * wl / 3)},${f(yCenter + amplitude)}`;
    d += ` ${f(x0 + 5 * wl / 6)},${f(yCenter + amplitude)}`;
    d += ` ${f(x0 + wl)},${f(yCenter)}`;
  }
  return d;
}

export interface PaletteColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  amber?: string;
  lavender?: string;
  surface?: string;
}

/** Fill optional palette slots with sensible defaults matching dzyne's warm aesthetic. */
export function resolvePalette(colors: PaletteColors) {
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    background: colors.background,
    amber: colors.amber ?? '#F2B245',
    lavender: colors.lavender ?? '#CAC5F9',
    surface: colors.surface ?? '#FDFBF7',
  };
}
