import { type PaletteColors, wavePath, resolvePalette } from './utils';

export type DividerType = 'wave' | 'curve' | 'angle' | 'zigzag' | 'layered';

export interface DividerResult {
  type: DividerType;
  svg: string;
  cssUsage: string;
}

const W = 1440;
const H = 120;
const f = (v: number) => v.toFixed(1);

export function generateDivider(type: DividerType, colors: PaletteColors): DividerResult {
  const generators: Record<DividerType, () => string> = {
    wave: () => waveDivider(colors),
    curve: () => curveDivider(colors),
    angle: () => angleDivider(colors),
    zigzag: () => zigzagDivider(colors),
    layered: () => layeredDivider(colors),
  };

  const svg = generators[type]();
  return {
    type,
    svg,
    cssUsage: [
      `/* Place between sections. Set width: 100%; height: auto; display: block; */`,
      `/* Or as CSS background: background-image: url("path/to/divider.svg"); */`,
    ].join('\n'),
  };
}

export function generateAllDividers(colors: PaletteColors): DividerResult[] {
  const types: DividerType[] = ['wave', 'curve', 'angle', 'zigzag', 'layered'];
  return types.map(t => generateDivider(t, colors));
}

function waveDivider(colors: PaletteColors): string {
  const d = wavePath(W, H * 0.4, H * 0.35, 3);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="${W}" height="${H}">`,
    `  <path d="${d} L${W},${H} L0,${H} Z" fill="${colors.primary}" opacity="0.08"/>`,
    `</svg>`,
  ].join('\n');
}

function curveDivider(colors: PaletteColors): string {
  const d = `M0,${H} C${f(W * 0.3)},${f(H * 0.1)} ${f(W * 0.7)},${f(H * 0.1)} ${W},${H}`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="${W}" height="${H}">`,
    `  <path d="${d} Z" fill="${colors.primary}" opacity="0.06"/>`,
    `</svg>`,
  ].join('\n');
}

function angleDivider(colors: PaletteColors): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="${W}" height="${H}">`,
    `  <polygon points="0,${H} ${W},0 ${W},${H}" fill="${colors.primary}" opacity="0.06"/>`,
    `</svg>`,
  ].join('\n');
}

function zigzagDivider(colors: PaletteColors): string {
  const teeth = 12;
  const tw = W / teeth;
  let d = `M0,${H}`;
  for (let i = 0; i < teeth; i++) {
    const peakY = i % 2 === 0 ? H * 0.15 : H * 0.5;
    d += ` L${f(i * tw + tw / 2)},${f(peakY)} L${f((i + 1) * tw)},${H}`;
  }
  d += ` L${W},${H} Z`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="${W}" height="${H}">`,
    `  <path d="${d}" fill="${colors.primary}" opacity="0.05"/>`,
    `</svg>`,
  ].join('\n');
}

function layeredDivider(colors: PaletteColors): string {
  const p = resolvePalette(colors);
  const layers = [
    { color: p.primary,  yCenter: H * 0.35, amp: H * 0.3,  waves: 2, opacity: 0.08 },
    { color: p.amber,    yCenter: H * 0.5,  amp: H * 0.25, waves: 3, opacity: 0.06 },
    { color: p.lavender, yCenter: H * 0.65, amp: H * 0.2,  waves: 4, opacity: 0.05 },
  ];

  const paths = layers.map(({ color, yCenter, amp, waves, opacity }) => {
    const d = wavePath(W, yCenter, amp, waves);
    return `  <path d="${d} L${W},${H} L0,${H} Z" fill="${color}" opacity="${opacity}"/>`;
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="${W}" height="${H}">`,
    ...paths,
    `</svg>`,
  ].join('\n');
}
