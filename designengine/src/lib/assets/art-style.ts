import type { PaletteColors } from '@/lib/svg/utils';
import { resolvePalette, darken, lighten, mixColors, hexToHsl } from '@/lib/svg/utils';

export type ArtStylePreset =
  | 'line-art'
  | 'flat-vector'
  | 'watercolor'
  | 'isometric'
  | 'abstract-geometric'
  | 'photo-overlay';

export interface ArtStyleManifest {
  preset: ArtStylePreset;
  palette: string[];
  stroke: string;
  fill: 'solid' | 'gradient' | 'none' | 'wash';
  mood: string;
  promptSuffix: string;
  cssFilter: string;
  svgAttributes: Record<string, string>;
  usage: string;
}

interface PresetConfig {
  mood: string;
  stroke: (colors: ReturnType<typeof resolvePalette>) => string;
  fill: ArtStyleManifest['fill'];
  promptSuffix: (hex: { primary: string; secondary: string; accent: string }) => string;
  cssFilter: string;
  svgAttributes: (colors: ReturnType<typeof resolvePalette>) => Record<string, string>;
  usage: string;
  buildPalette: (colors: ReturnType<typeof resolvePalette>) => string[];
}

const PRESETS: Record<ArtStylePreset, PresetConfig> = {
  'line-art': {
    mood: 'minimal, technical, refined',
    stroke: () => '2px',
    fill: 'none',
    promptSuffix: (c) =>
      `clean line drawing using only ${c.primary} and ${c.secondary} on white background, consistent 2px stroke, SVG-friendly, no fills, technical illustration style`,
    cssFilter: 'none',
    svgAttributes: (p) => ({
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      fill: 'none',
      stroke: p.primary,
    }),
    usage: 'Best for tech, SaaS, professional services. Pair with generous whitespace.',
    buildPalette: (p) => [p.primary, p.secondary, p.surface],
  },

  'flat-vector': {
    mood: 'bold, playful, modern',
    stroke: () => '0',
    fill: 'solid',
    promptSuffix: (c) =>
      `flat vector illustration with bold shapes, no gradients, using exactly ${c.primary}, ${c.secondary}, and ${c.accent}, clean edges, geometric style`,
    cssFilter: 'none',
    svgAttributes: (p) => ({
      'stroke-width': '0',
      fill: p.primary,
    }),
    usage: 'Great for startups, apps, landing pages. Energetic and approachable.',
    buildPalette: (p) => [p.primary, p.secondary, p.accent, p.amber, lighten(p.primary, 0.3)],
  },

  'watercolor': {
    mood: 'organic, soft, artisanal',
    stroke: () => '0',
    fill: 'wash',
    promptSuffix: (c) =>
      `soft watercolor illustration with organic edges, palette-derived washes in ${c.primary} and ${c.secondary}, white background, gentle blending, no hard lines`,
    cssFilter: 'none',
    svgAttributes: (p) => ({
      'stroke-width': '0',
      fill: p.primary,
      opacity: '0.7',
      'filter': 'url(#watercolor)',
    }),
    usage: 'Ideal for wellness, food, lifestyle, creative brands. Feels handmade.',
    buildPalette: (p) => [
      lighten(p.primary, 0.2),
      lighten(p.secondary, 0.15),
      lighten(p.accent, 0.25),
      p.lavender,
      p.surface,
    ],
  },

  'isometric': {
    mood: 'technical, dimensional, structured',
    stroke: (p) => `1.5px ${darken(p.primary, 0.2)}`,
    fill: 'gradient',
    promptSuffix: (c) =>
      `isometric 3D illustration, 30-degree projection, using ${c.primary} for faces, ${c.secondary} for shadows, and ${c.accent} for highlights, clean technical style`,
    cssFilter: 'none',
    svgAttributes: (p) => ({
      'stroke-width': '1.5',
      stroke: darken(p.primary, 0.2),
      fill: p.primary,
    }),
    usage: 'Perfect for fintech, developer tools, data products. Conveys precision.',
    buildPalette: (p) => [
      p.primary,
      darken(p.primary, 0.15),
      lighten(p.primary, 0.2),
      p.secondary,
      p.accent,
    ],
  },

  'abstract-geometric': {
    mood: 'dynamic, creative, energetic',
    stroke: () => '0',
    fill: 'solid',
    promptSuffix: (c) =>
      `abstract geometric composition with overlapping shapes, circles and polygons, using ${c.primary}, ${c.secondary}, and ${c.accent}, white background, modern art style`,
    cssFilter: 'none',
    svgAttributes: (p) => ({
      'stroke-width': '0',
      fill: p.accent,
      opacity: '0.9',
    }),
    usage: 'Works for creative agencies, design tools, bold brands. Eye-catching backgrounds and section art.',
    buildPalette: (p) => [p.primary, p.secondary, p.accent, p.amber, p.lavender],
  },

  'photo-overlay': {
    mood: 'sophisticated, editorial, branded',
    stroke: () => '0',
    fill: 'gradient',
    promptSuffix: (c) =>
      `high-quality photograph with a ${c.primary} to ${c.secondary} gradient overlay at 40% opacity, brand-tinted, editorial style`,
    cssFilter: 'none',
    svgAttributes: (p) => ({
      fill: `url(#brand-overlay)`,
      opacity: '0.4',
    }),
    usage: 'Best for editorial, luxury, real estate. Use with real photography underneath brand-color overlays.',
    buildPalette: (p) => [p.primary, p.secondary, mixColors(p.primary, p.accent, 0.5)],
  },
};

export function generateArtStyle(
  preset: ArtStylePreset,
  colors: PaletteColors,
): ArtStyleManifest {
  const p = resolvePalette(colors);
  const config = PRESETS[preset];
  const hex = { primary: p.primary, secondary: p.secondary, accent: p.accent };

  return {
    preset,
    palette: config.buildPalette(p),
    stroke: config.stroke(p),
    fill: config.fill,
    mood: config.mood,
    promptSuffix: config.promptSuffix(hex),
    cssFilter: config.cssFilter,
    svgAttributes: config.svgAttributes(p),
    usage: config.usage,
  };
}

export function recommendPreset(industry?: string, mood?: string): ArtStylePreset {
  const input = `${industry ?? ''} ${mood ?? ''}`.toLowerCase();

  if (/tech|saas|developer|api|code/.test(input)) return 'line-art';
  if (/startup|app|mobile|playful|fun/.test(input)) return 'flat-vector';
  if (/wellness|food|organic|artisan|craft|lifestyle/.test(input)) return 'watercolor';
  if (/fintech|finance|data|analytics|enterprise/.test(input)) return 'isometric';
  if (/creative|agency|design|art|bold/.test(input)) return 'abstract-geometric';
  if (/luxury|editorial|real.?estate|premium|fashion/.test(input)) return 'photo-overlay';

  return 'flat-vector';
}

export function getAllPresets(): ArtStylePreset[] {
  return Object.keys(PRESETS) as ArtStylePreset[];
}

export function getPresetDescription(preset: ArtStylePreset): { mood: string; usage: string } {
  const config = PRESETS[preset];
  return { mood: config.mood, usage: config.usage };
}
