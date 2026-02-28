import { type PaletteColors, adjustOpacity, lighten, resolvePalette, seededRandom, smoothClosedPath } from './utils';

export type HeroType = 'gradient-mesh' | 'geometric' | 'blob' | 'wave-layers';

export interface HeroResult {
  type: HeroType;
  svg: string;
  cssUsage: string;
}

const W = 1440;
const H = 800;

export function generateHero(type: HeroType, colors: PaletteColors): HeroResult {
  const generators: Record<HeroType, () => string> = {
    'gradient-mesh': () => gradientMesh(colors),
    geometric: () => geometric(colors),
    blob: () => blob(colors),
    'wave-layers': () => waveLayers(colors),
  };

  const svg = generators[type]();
  return {
    type,
    svg,
    cssUsage: `/* Use as hero section background */\nbackground-image: url('/assets/backgrounds/${type}.svg');\nbackground-size: cover;\nbackground-position: center;`,
  };
}

export function generateAllHeroes(colors: PaletteColors): HeroResult[] {
  const types: HeroType[] = ['gradient-mesh', 'geometric', 'blob', 'wave-layers'];
  return types.map(t => generateHero(t, colors));
}

function gradientMesh(colors: PaletteColors): string {
  const p = resolvePalette(colors);
  const gradients = [
    { id: 'gm1', cx: '20%', cy: '25%', r: '55%', color: p.primary,  opacity: 0.3 },
    { id: 'gm2', cx: '75%', cy: '65%', r: '45%', color: p.accent,   opacity: 0.2 },
    { id: 'gm3', cx: '50%', cy: '10%', r: '50%', color: p.amber,    opacity: 0.18 },
    { id: 'gm4', cx: '90%', cy: '20%', r: '35%', color: p.lavender, opacity: 0.2 },
    { id: 'gm5', cx: '10%', cy: '80%', r: '40%', color: lighten(p.primary, 0.3), opacity: 0.12 },
  ];

  const defs = gradients.map(g => [
    `    <radialGradient id="${g.id}" cx="${g.cx}" cy="${g.cy}" r="${g.r}">`,
    `      <stop offset="0%" stop-color="${g.color}" stop-opacity="${g.opacity}"/>`,
    `      <stop offset="100%" stop-color="${g.color}" stop-opacity="0"/>`,
    `    </radialGradient>`,
  ].join('\n')).join('\n');

  const rects = gradients.map(g =>
    `  <rect width="${W}" height="${H}" fill="url(#${g.id})"/>`
  ).join('\n');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
    `  <defs>`,
    defs,
    `  </defs>`,
    `  <rect width="${W}" height="${H}" fill="${p.surface}"/>`,
    rects,
    `</svg>`,
  ].join('\n');
}

function geometric(colors: PaletteColors): string {
  const p = resolvePalette(colors);
  const rng = seededRandom(p.primary + p.accent);
  const shapes: string[] = [];
  const palette = [p.primary, p.accent, p.amber, p.lavender, p.secondary];

  for (let i = 0; i < 10; i++) {
    const x = rng() * W;
    const y = rng() * H;
    const color = palette[Math.floor(rng() * palette.length)];
    const opacity = (0.04 + rng() * 0.06).toFixed(2);
    const shapeType = Math.floor(rng() * 3);

    if (shapeType === 0) {
      const r = 40 + rng() * 140;
      shapes.push(`  <circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="${color}" opacity="${opacity}"/>`);
    } else if (shapeType === 1) {
      const w = 60 + rng() * 160;
      const h = 60 + rng() * 160;
      const rx = 8 + rng() * 24;
      const rot = (rng() * 40 - 20).toFixed(0);
      shapes.push(`  <rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="${rx.toFixed(0)}" fill="${color}" opacity="${opacity}" transform="rotate(${rot}, ${(x + w / 2).toFixed(0)}, ${(y + h / 2).toFixed(0)})"/>`);
    } else {
      const r = 30 + rng() * 100;
      const pts = Array.from({ length: 3 + Math.floor(rng() * 3) }, (_, j) => {
        const a = (2 * Math.PI * j) / (3 + Math.floor(rng()));
        return `${(x + r * Math.cos(a)).toFixed(0)},${(y + r * Math.sin(a)).toFixed(0)}`;
      }).join(' ');
      shapes.push(`  <polygon points="${pts}" fill="${color}" opacity="${opacity}"/>`);
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
    `  <rect width="${W}" height="${H}" fill="${p.surface}"/>`,
    ...shapes,
    `</svg>`,
  ].join('\n');
}

function blob(colors: PaletteColors): string {
  const p = resolvePalette(colors);
  const configs = [
    { cx: W * 0.2,  cy: H * 0.3,  r: 200, color: p.primary,  opacity: 0.1,  seed: 1.0 },
    { cx: W * 0.8,  cy: H * 0.6,  r: 250, color: p.accent,   opacity: 0.08, seed: 2.5 },
    { cx: W * 0.5,  cy: H * 0.15, r: 180, color: p.amber,    opacity: 0.08, seed: 4.2 },
    { cx: W * 0.65, cy: H * 0.85, r: 160, color: p.lavender,  opacity: 0.1,  seed: 6.1 },
    { cx: W * 0.35, cy: H * 0.7,  r: 140, color: lighten(p.primary, 0.2), opacity: 0.06, seed: 8.3 },
  ];

  const blobs = configs.map(({ cx, cy, r, color, opacity, seed }) => {
    const numPoints = 8;
    const pts = Array.from({ length: numPoints }, (_, i) => {
      const angle = (2 * Math.PI * i) / numPoints;
      const noise = Math.sin(angle * 2 + seed) * r * 0.25 +
                    Math.cos(angle * 3 + seed * 1.7) * r * 0.15;
      return {
        x: cx + (r + noise) * Math.cos(angle),
        y: cy + (r + noise) * Math.sin(angle),
      };
    });
    const d = smoothClosedPath(pts, 0.35);
    return `  <path d="${d}" fill="${color}" opacity="${opacity}"/>`;
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
    `  <rect width="${W}" height="${H}" fill="${p.surface}"/>`,
    ...blobs,
    `</svg>`,
  ].join('\n');
}

function waveLayers(colors: PaletteColors): string {
  const p = resolvePalette(colors);
  const layers = [
    { color: p.primary,  yBase: H * 0.5,  amp: 60, opacity: 0.1 },
    { color: p.amber,    yBase: H * 0.6,  amp: 45, opacity: 0.08 },
    { color: p.lavender, yBase: H * 0.7,  amp: 35, opacity: 0.08 },
    { color: p.accent,   yBase: H * 0.8,  amp: 28, opacity: 0.06 },
    { color: lighten(p.primary, 0.3), yBase: H * 0.88, amp: 20, opacity: 0.04 },
  ];

  const f = (v: number) => v.toFixed(1);
  const paths = layers.map(({ color, yBase, amp, opacity }) => {
    const d = [
      `M0,${f(yBase)}`,
      `C${f(W * 0.17)},${f(yBase - amp)} ${f(W * 0.33)},${f(yBase - amp)} ${f(W * 0.5)},${f(yBase)}`,
      `C${f(W * 0.67)},${f(yBase + amp)} ${f(W * 0.83)},${f(yBase + amp)} ${W},${f(yBase)}`,
      `L${W},${H} L0,${H} Z`,
    ].join(' ');
    return `  <path d="${d}" fill="${color}" opacity="${opacity}"/>`;
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
    `  <rect width="${W}" height="${H}" fill="${p.surface}"/>`,
    ...paths,
    `</svg>`,
  ].join('\n');
}
