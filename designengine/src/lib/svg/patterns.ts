import { type PaletteColors, adjustOpacity, resolvePalette, smoothClosedPath } from './utils';

export type PatternType = 'dots' | 'waves' | 'grid' | 'topographic' | 'cross-hatch' | 'concentric';

export interface PatternResult {
  type: PatternType;
  svg: string;
  cssUsage: string;
}

export function generatePattern(type: PatternType, colors: PaletteColors): PatternResult {
  const generators: Record<PatternType, () => string> = {
    dots: () => dotsPattern(colors),
    waves: () => wavesPattern(colors),
    grid: () => gridPattern(colors),
    topographic: () => topographicPattern(colors),
    'cross-hatch': () => crossHatchPattern(colors),
    concentric: () => concentricPattern(colors),
  };

  const svg = generators[type]();
  return {
    type,
    svg,
    cssUsage: `background-image: url("data:image/svg+xml,${encodeURIComponent(svg)}"); background-repeat: repeat;`,
  };
}

export function generateAllPatterns(colors: PaletteColors): PatternResult[] {
  const types: PatternType[] = ['dots', 'waves', 'grid', 'topographic', 'cross-hatch', 'concentric'];
  return types.map(t => generatePattern(t, colors));
}

function dotsPattern(colors: PaletteColors): string {
  const p = resolvePalette(colors);
  const cell = 32;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cell * 2}" height="${cell * 2}" viewBox="0 0 ${cell * 2} ${cell * 2}">`,
    `  <circle cx="${cell / 2}" cy="${cell / 2}" r="2" fill="${p.primary}" opacity="0.12"/>`,
    `  <circle cx="${cell * 1.5}" cy="${cell * 1.5}" r="2" fill="${p.primary}" opacity="0.12"/>`,
    `  <circle cx="${cell * 1.5}" cy="${cell / 2}" r="1.2" fill="${p.lavender}" opacity="0.15"/>`,
    `  <circle cx="${cell / 2}" cy="${cell * 1.5}" r="1.2" fill="${p.lavender}" opacity="0.15"/>`,
    `</svg>`,
  ].join('\n');
}

function wavesPattern(colors: PaletteColors): string {
  const p = resolvePalette(colors);
  const w = 200, h = 60;
  const layers = [
    { color: p.primary,  amp: 8, yBase: 20, opacity: 0.1 },
    { color: p.amber,    amp: 6, yBase: 30, opacity: 0.08 },
    { color: p.lavender, amp: 5, yBase: 42, opacity: 0.1 },
  ];
  const paths = layers.map(({ color, amp, yBase, opacity }) => {
    const d = `M0,${yBase} C${w * 0.17},${yBase - amp} ${w * 0.33},${yBase - amp} ${w * 0.5},${yBase} C${w * 0.67},${yBase + amp} ${w * 0.83},${yBase + amp} ${w},${yBase}`;
    return `  <path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" opacity="${opacity}"/>`;
  });
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    ...paths,
    `</svg>`,
  ].join('\n');
}

function gridPattern(colors: PaletteColors): string {
  const { primary } = colors;
  const cell = 40;
  const color = adjustOpacity(primary, 0.06);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cell}" height="${cell}" viewBox="0 0 ${cell} ${cell}">`,
    `  <path d="M${cell},0 L0,0 0,${cell}" fill="none" stroke="${color}" stroke-width="0.5"/>`,
    `</svg>`,
  ].join('\n');
}

function topographicPattern(colors: PaletteColors): string {
  const p = resolvePalette(colors);
  const size = 300;
  const cx = size / 2, cy = size / 2;
  const rings = 7;
  const maxR = size * 0.42;
  const numPoints = 20;

  const ringColors = [p.primary, p.primary, p.amber, p.primary, p.lavender, p.primary, p.primary];
  const paths: string[] = [];
  for (let ring = 1; ring <= rings; ring++) {
    const radius = (ring / rings) * maxR;
    const irregularity = radius * 0.18;
    const seed = ring * 7.3;

    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints;
      const noise =
        Math.sin(angle * 3 + seed) * irregularity +
        Math.cos(angle * 5 + seed * 2) * irregularity * 0.5;
      pts.push({
        x: cx + (radius + noise) * Math.cos(angle),
        y: cy + (radius + noise) * Math.sin(angle),
      });
    }

    const d = smoothClosedPath(pts, 0.3);
    const opacity = (0.04 + (ring / rings) * 0.08).toFixed(2);
    const color = ringColors[(ring - 1) % ringColors.length];
    paths.push(`  <path d="${d}" fill="none" stroke="${color}" stroke-width="1" opacity="${opacity}"/>`);
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    ...paths,
    `</svg>`,
  ].join('\n');
}

function crossHatchPattern(colors: PaletteColors): string {
  const { primary } = colors;
  const cell = 16;
  const color = adjustOpacity(primary, 0.07);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cell}" height="${cell}" viewBox="0 0 ${cell} ${cell}">`,
    `  <path d="M0,${cell} L${cell},0" stroke="${color}" stroke-width="0.5"/>`,
    `  <path d="M-${cell / 4},${cell / 4} L${cell / 4},-${cell / 4}" stroke="${color}" stroke-width="0.5"/>`,
    `  <path d="M${cell * 0.75},${cell * 1.25} L${cell * 1.25},${cell * 0.75}" stroke="${color}" stroke-width="0.5"/>`,
    `</svg>`,
  ].join('\n');
}

function concentricPattern(colors: PaletteColors): string {
  const p = resolvePalette(colors);
  const size = 200;
  const cx = size / 2, cy = size / 2;
  const rings = 5;
  const maxR = size * 0.45;
  const ringColors = [p.primary, p.lavender, p.primary, p.amber, p.lavender];

  const circles = Array.from({ length: rings }, (_, i) => {
    const r = ((i + 1) / rings) * maxR;
    const color = ringColors[i % ringColors.length];
    const opacity = (0.04 + (i / rings) * 0.06).toFixed(2);
    return `  <circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="${color}" stroke-width="0.8" opacity="${opacity}"/>`;
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    ...circles,
    `</svg>`,
  ].join('\n');
}
