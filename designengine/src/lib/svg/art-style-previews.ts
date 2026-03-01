/**
 * Generates small SVG preview illustrations for each art style preset,
 * rendered in the user's chosen brand colors.
 */

export type ArtStylePreset =
  | 'line-art'
  | 'flat-vector'
  | 'watercolor'
  | 'isometric'
  | 'abstract-geometric'
  | 'photo-overlay';

interface PreviewColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.min(255, Math.round(r + (255 - r) * amount));
  const ng = Math.min(255, Math.round(g + (255 - g) * amount));
  const nb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.max(0, Math.round(r * (1 - amount)));
  const ng = Math.max(0, Math.round(g * (1 - amount)));
  const nb = Math.max(0, Math.round(b * (1 - amount)));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

function withOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function lineArt(c: PreviewColors): string {
  return `<svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="180" fill="${c.background}"/>
  <!-- Monitor -->
  <rect x="80" y="30" width="120" height="80" rx="6" fill="none" stroke="${c.primary}" stroke-width="2"/>
  <line x1="140" y1="110" x2="140" y2="130" stroke="${c.primary}" stroke-width="2"/>
  <line x1="110" y1="130" x2="170" y2="130" stroke="${c.primary}" stroke-width="2" stroke-linecap="round"/>
  <!-- Code lines on screen -->
  <line x1="95" y1="48" x2="135" y2="48" stroke="${c.secondary}" stroke-width="2" stroke-linecap="round"/>
  <line x1="95" y1="58" x2="155" y2="58" stroke="${lighten(c.primary, 0.3)}" stroke-width="2" stroke-linecap="round"/>
  <line x1="105" y1="68" x2="145" y2="68" stroke="${c.accent}" stroke-width="2" stroke-linecap="round"/>
  <line x1="105" y1="78" x2="160" y2="78" stroke="${lighten(c.primary, 0.3)}" stroke-width="2" stroke-linecap="round"/>
  <line x1="95" y1="88" x2="125" y2="88" stroke="${c.secondary}" stroke-width="2" stroke-linecap="round"/>
  <!-- Decorative circles -->
  <circle cx="45" cy="55" r="14" fill="none" stroke="${c.accent}" stroke-width="1.5"/>
  <circle cx="45" cy="55" r="6" fill="none" stroke="${c.accent}" stroke-width="1.5"/>
  <circle cx="235" cy="70" r="18" fill="none" stroke="${c.secondary}" stroke-width="1.5" stroke-dasharray="4 3"/>
  <!-- Floating dots -->
  <circle cx="55" cy="120" r="2" fill="${c.primary}"/>
  <circle cx="230" cy="40" r="2" fill="${c.primary}"/>
  <circle cx="220" cy="120" r="2" fill="${c.accent}"/>
</svg>`;
}

function flatVector(c: PreviewColors): string {
  return `<svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="180" fill="${c.background}"/>
  <!-- Background shape -->
  <circle cx="140" cy="90" r="70" fill="${lighten(c.primary, 0.85)}"/>
  <!-- Browser window -->
  <rect x="70" y="35" width="140" height="100" rx="8" fill="white"/>
  <rect x="70" y="35" width="140" height="22" rx="8" fill="${c.primary}"/>
  <rect x="70" y="49" width="140" height="8" fill="${c.primary}"/>
  <!-- Window dots -->
  <circle cx="82" cy="46" r="3" fill="${withOpacity('#ffffff', 0.5)}"/>
  <circle cx="92" cy="46" r="3" fill="${withOpacity('#ffffff', 0.5)}"/>
  <circle cx="102" cy="46" r="3" fill="${withOpacity('#ffffff', 0.5)}"/>
  <!-- Content blocks -->
  <rect x="82" y="67" width="60" height="8" rx="2" fill="${c.primary}"/>
  <rect x="82" y="81" width="116" height="5" rx="2" fill="${lighten(c.primary, 0.6)}"/>
  <rect x="82" y="90" width="90" height="5" rx="2" fill="${lighten(c.primary, 0.6)}"/>
  <!-- CTA button -->
  <rect x="82" y="103" width="50" height="18" rx="4" fill="${c.accent}"/>
  <rect x="90" y="109" width="34" height="5" rx="2" fill="white"/>
  <!-- Decorative elements -->
  <rect x="30" y="60" width="24" height="24" rx="4" fill="${c.secondary}" opacity="0.7"/>
  <circle cx="240" cy="55" r="16" fill="${c.accent}" opacity="0.5"/>
  <rect x="225" y="110" width="30" height="30" rx="6" fill="${c.secondary}" opacity="0.4" transform="rotate(15 240 125)"/>
</svg>`;
}

function watercolor(c: PreviewColors): string {
  return `<svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="wc-blur">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
    <filter id="wc-blur-sm">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>
  <rect width="280" height="180" fill="${c.background}"/>
  <!-- Large wash -->
  <ellipse cx="140" cy="85" rx="100" ry="65" fill="${lighten(c.primary, 0.6)}" opacity="0.4" filter="url(#wc-blur)"/>
  <!-- Overlapping washes -->
  <ellipse cx="100" cy="75" rx="55" ry="40" fill="${lighten(c.secondary, 0.4)}" opacity="0.35" filter="url(#wc-blur)"/>
  <ellipse cx="185" cy="95" rx="50" ry="35" fill="${lighten(c.accent, 0.45)}" opacity="0.3" filter="url(#wc-blur)"/>
  <!-- Organic shapes -->
  <path d="M120 60 Q135 40 155 55 Q170 65 160 80 Q150 95 130 90 Q115 85 120 60Z" fill="${c.primary}" opacity="0.25" filter="url(#wc-blur-sm)"/>
  <circle cx="190" cy="60" r="20" fill="${c.accent}" opacity="0.2" filter="url(#wc-blur-sm)"/>
  <!-- Stem/leaf -->
  <path d="M140 110 Q145 80 148 60" fill="none" stroke="${c.primary}" stroke-width="1.5" opacity="0.4"/>
  <ellipse cx="152" cy="58" rx="12" ry="8" fill="${c.primary}" opacity="0.2" filter="url(#wc-blur-sm)" transform="rotate(-30 152 58)"/>
  <!-- Paint spots -->
  <circle cx="70" cy="130" r="8" fill="${c.secondary}" opacity="0.15" filter="url(#wc-blur-sm)"/>
  <circle cx="220" cy="140" r="10" fill="${c.primary}" opacity="0.12" filter="url(#wc-blur-sm)"/>
  <circle cx="80" cy="50" r="5" fill="${c.accent}" opacity="0.2" filter="url(#wc-blur-sm)"/>
</svg>`;
}

function isometric(c: PreviewColors): string {
  const face1 = c.primary;
  const face2 = darken(c.primary, 0.15);
  const face3 = lighten(c.primary, 0.2);
  return `<svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="180" fill="${c.background}"/>
  <!-- Grid dots -->
  ${Array.from({ length: 7 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) =>
      `<circle cx="${40 + i * 35}" cy="${20 + j * 35}" r="1" fill="${lighten(c.primary, 0.7)}"/>`
    ).join('')
  ).join('')}
  <!-- Main cube -->
  <polygon points="140,40 200,70 140,100 80,70" fill="${face3}" stroke="${darken(c.primary, 0.2)}" stroke-width="1.5"/>
  <polygon points="80,70 140,100 140,145 80,115" fill="${face1}" stroke="${darken(c.primary, 0.2)}" stroke-width="1.5"/>
  <polygon points="200,70 140,100 140,145 200,115" fill="${face2}" stroke="${darken(c.primary, 0.2)}" stroke-width="1.5"/>
  <!-- Small cube left -->
  <polygon points="55,95 85,110 55,125 25,110" fill="${lighten(c.secondary, 0.2)}" stroke="${c.secondary}" stroke-width="1"/>
  <polygon points="25,110 55,125 55,145 25,130" fill="${c.secondary}" stroke="${c.secondary}" stroke-width="1"/>
  <polygon points="85,110 55,125 55,145 85,130" fill="${darken(c.secondary, 0.1)}" stroke="${c.secondary}" stroke-width="1"/>
  <!-- Small cube right -->
  <polygon points="225,85 255,100 225,115 195,100" fill="${lighten(c.accent, 0.2)}" stroke="${c.accent}" stroke-width="1"/>
  <polygon points="195,100 225,115 225,140 195,125" fill="${c.accent}" stroke="${c.accent}" stroke-width="1"/>
  <polygon points="255,100 225,115 225,140 255,125" fill="${darken(c.accent, 0.15)}" stroke="${c.accent}" stroke-width="1"/>
</svg>`;
}

function abstractGeometric(c: PreviewColors): string {
  return `<svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="180" fill="${c.background}"/>
  <!-- Large circle -->
  <circle cx="120" cy="90" r="60" fill="${c.primary}" opacity="0.15"/>
  <!-- Overlapping shapes -->
  <rect x="90" y="40" width="80" height="80" rx="4" fill="${c.secondary}" opacity="0.2" transform="rotate(15 130 80)"/>
  <circle cx="170" cy="80" r="45" fill="${c.accent}" opacity="0.2"/>
  <!-- Bold foreground -->
  <circle cx="130" cy="85" r="30" fill="${c.primary}" opacity="0.8"/>
  <rect x="155" y="60" width="50" height="50" rx="6" fill="${c.accent}" opacity="0.7"/>
  <!-- Small accent shapes -->
  <polygon points="60,40 75,25 90,40 75,55" fill="${c.secondary}" opacity="0.6"/>
  <circle cx="230" cy="130" r="18" fill="${c.primary}" opacity="0.3"/>
  <rect x="40" y="120" width="25" height="25" rx="12" fill="${c.accent}" opacity="0.4"/>
  <!-- Lines -->
  <line x1="200" y1="30" x2="250" y2="50" stroke="${c.primary}" stroke-width="2" opacity="0.3"/>
  <line x1="205" y1="35" x2="255" y2="55" stroke="${c.primary}" stroke-width="2" opacity="0.15"/>
  <!-- Dots -->
  <circle cx="50" cy="80" r="4" fill="${c.accent}"/>
  <circle cx="240" cy="90" r="3" fill="${c.secondary}"/>
</svg>`;
}

function photoOverlay(c: PreviewColors): string {
  return `<svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="po-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.primary}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${c.secondary}" stop-opacity="0.5"/>
    </linearGradient>
    <linearGradient id="po-base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${darken(c.primary, 0.5)}"/>
      <stop offset="100%" stop-color="${darken(c.secondary, 0.4)}"/>
    </linearGradient>
  </defs>
  <!-- "Photo" base with abstract shapes to simulate imagery -->
  <rect width="280" height="180" fill="url(#po-base)"/>
  <!-- Simulated landscape shapes -->
  <rect x="0" y="100" width="280" height="80" fill="${darken(c.primary, 0.3)}" opacity="0.5"/>
  <circle cx="220" cy="50" r="25" fill="${lighten(c.secondary, 0.3)}" opacity="0.3"/>
  <path d="M0 120 Q70 70 140 100 Q210 130 280 90 L280 180 L0 180Z" fill="${darken(c.secondary, 0.2)}" opacity="0.4"/>
  <!-- Gradient overlay -->
  <rect width="280" height="180" fill="url(#po-grad)"/>
  <!-- Editorial text overlay -->
  <rect x="30" y="55" width="90" height="5" rx="2" fill="white" opacity="0.9"/>
  <rect x="30" y="67" width="140" height="3" rx="1" fill="white" opacity="0.5"/>
  <rect x="30" y="75" width="110" height="3" rx="1" fill="white" opacity="0.5"/>
  <!-- Accent line -->
  <rect x="30" y="95" width="40" height="3" rx="1" fill="${c.accent}"/>
  <rect x="30" y="105" width="60" height="14" rx="3" fill="white" opacity="0.2"/>
  <rect x="36" y="109" width="48" height="5" rx="2" fill="white" opacity="0.8"/>
</svg>`;
}

const GENERATORS: Record<ArtStylePreset, (c: PreviewColors) => string> = {
  'line-art': lineArt,
  'flat-vector': flatVector,
  'watercolor': watercolor,
  'isometric': isometric,
  'abstract-geometric': abstractGeometric,
  'photo-overlay': photoOverlay,
};

export function generateArtStylePreview(
  preset: ArtStylePreset,
  colors: PreviewColors,
): string {
  return GENERATORS[preset](colors);
}

export function generateAllArtStylePreviews(
  colors: PreviewColors,
): Array<{ preset: ArtStylePreset; svg: string }> {
  return (Object.keys(GENERATORS) as ArtStylePreset[]).map(preset => ({
    preset,
    svg: GENERATORS[preset](colors),
  }));
}

export const ART_STYLE_META: Record<ArtStylePreset, {
  label: string;
  mood: string;
  bestFor: string;
}> = {
  'line-art': {
    label: 'Line Art',
    mood: 'Minimal, technical, refined',
    bestFor: 'SaaS, dev tools, professional services',
  },
  'flat-vector': {
    label: 'Flat Vector',
    mood: 'Bold, playful, modern',
    bestFor: 'Startups, apps, landing pages',
  },
  'watercolor': {
    label: 'Watercolor',
    mood: 'Organic, soft, artisanal',
    bestFor: 'Wellness, food, lifestyle, creative',
  },
  'isometric': {
    label: 'Isometric',
    mood: 'Technical, dimensional, structured',
    bestFor: 'Fintech, data, analytics, enterprise',
  },
  'abstract-geometric': {
    label: 'Abstract Geometric',
    mood: 'Dynamic, creative, energetic',
    bestFor: 'Agencies, design tools, bold brands',
  },
  'photo-overlay': {
    label: 'Photo Overlay',
    mood: 'Sophisticated, editorial, branded',
    bestFor: 'Luxury, editorial, real estate',
  },
};
