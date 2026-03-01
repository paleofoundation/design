import type { ArtStylePreset } from '@/app/onboarding/store';

export interface ColorPalette {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export interface FontPairing {
  id: string;
  heading: string;
  body: string;
  headingClass: string;
  bodyClass: string;
  reason: string;
}

export interface DesignLanguagePreset {
  id: string;
  label: string;
  subtitle: string;
  description: string;

  curatedPalettes: ColorPalette[];
  fontPairings: FontPairing[];
  artStyleRecommendation: ArtStylePreset;

  borderRadius: { sm: string; md: string; lg: string; full: string };
  shadowStyle: 'none' | 'subtle' | 'soft' | 'sharp' | 'long';
  spacingDensity: 'tight' | 'balanced' | 'generous';
  layoutPreference: 'structured' | 'flowing' | 'asymmetric';
  animationIntensity: 'none' | 'subtle' | 'moderate' | 'bouncy';
  imageShape: 'sharp-crop' | 'rounded' | 'organic-mask' | 'full-bleed';
}

export const DESIGN_LANGUAGES: Record<string, DesignLanguagePreset> = {
  corporate: {
    id: 'corporate',
    label: 'Corporate',
    subtitle: 'Professional & trustworthy',
    description: 'Clean lines, structured grids, and restrained color. Dense but organized layouts with subtle hierarchy.',
    curatedPalettes: [
      { name: 'Navy Trust', colors: { primary: '#1B365D', secondary: '#2C5F7C', accent: '#C5A55A', background: '#F7F5F2', text: '#1A1A1A' } },
      { name: 'Steel Blue', colors: { primary: '#2D4059', secondary: '#5C7A99', accent: '#FF6B35', background: '#FAFAFA', text: '#1A1A1A' } },
      { name: 'Forest Authority', colors: { primary: '#1D3C34', secondary: '#306E5E', accent: '#D4A574', background: '#F5F5F0', text: '#1A1A1A' } },
      { name: 'Iron Gray', colors: { primary: '#2E3440', secondary: '#4C566A', accent: '#88C0D0', background: '#F8F9FA', text: '#2E3440' } },
      { name: 'Slate Professional', colors: { primary: '#334155', secondary: '#64748B', accent: '#0EA5E9', background: '#F8FAFC', text: '#0F172A' } },
      { name: 'Deep Teal', colors: { primary: '#115E59', secondary: '#2DD4BF', accent: '#F59E0B', background: '#F0FDFA', text: '#134E4A' } },
    ],
    fontPairings: [
      { id: 'inter-inter', heading: 'Inter', body: 'Inter', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Geometric precision reads as reliable and professional. One font family for maximum consistency.' },
      { id: 'playfair-source', heading: 'Playfair Display', body: 'Source Sans 3', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'The transitional serif adds gravitas to headlines while the humanist sans keeps body text approachable.' },
      { id: 'dm-serif-dm-sans', heading: 'DM Serif Display', body: 'DM Sans', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Same type family ensures optical harmony. The serif display adds distinction without clashing.' },
    ],
    artStyleRecommendation: 'line-art',
    borderRadius: { sm: '4px', md: '6px', lg: '8px', full: '9999px' },
    shadowStyle: 'subtle',
    spacingDensity: 'tight',
    layoutPreference: 'structured',
    animationIntensity: 'subtle',
    imageShape: 'sharp-crop',
  },

  playful: {
    id: 'playful',
    label: 'Playful',
    subtitle: 'Friendly & approachable',
    description: 'Rounded shapes, bright colors, and generous spacing. Everything feels warm, inviting, and slightly whimsical.',
    curatedPalettes: [
      { name: 'Tropical', colors: { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D', background: '#F7FFF7', text: '#2D3436' } },
      { name: 'Sunset Pop', colors: { primary: '#FF6719', secondary: '#F2B245', accent: '#CAC5F9', background: '#FDFBF7', text: '#1A1A1A' } },
      { name: 'Berry Fizz', colors: { primary: '#E84393', secondary: '#6C5CE7', accent: '#00CEC9', background: '#FFF8F0', text: '#2D3436' } },
      { name: 'Coral Reef', colors: { primary: '#FF7979', secondary: '#7ED6DF', accent: '#F9CA24', background: '#FFFDF7', text: '#2C3A47' } },
      { name: 'Lavender Dream', colors: { primary: '#A29BFE', secondary: '#FD79A8', accent: '#55EFC4', background: '#FFF8FC', text: '#2D3436' } },
      { name: 'Citrus Garden', colors: { primary: '#FDCB6E', secondary: '#E17055', accent: '#00B894', background: '#FEFFFE', text: '#2D3436' } },
    ],
    fontPairings: [
      { id: 'nunito-nunito', heading: 'Nunito', body: 'Nunito', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Rounded terminals feel warm and inviting. The soft geometry reads as friendly and non-intimidating.' },
      { id: 'fredoka-dm-sans', heading: 'Fredoka', body: 'DM Sans', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Fredoka\'s rounded display weight grabs attention with personality. DM Sans keeps body text clean and readable.' },
      { id: 'space-grotesk-inter', heading: 'Space Grotesk', body: 'Inter', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Space Grotesk has character without being novelty. Paired with Inter for functional body text.' },
    ],
    artStyleRecommendation: 'flat-vector',
    borderRadius: { sm: '8px', md: '12px', lg: '16px', full: '9999px' },
    shadowStyle: 'soft',
    spacingDensity: 'generous',
    layoutPreference: 'flowing',
    animationIntensity: 'bouncy',
    imageShape: 'rounded',
  },

  editorial: {
    id: 'editorial',
    label: 'Editorial',
    subtitle: 'Sophisticated & considered',
    description: 'Strong typography hierarchy, generous whitespace, and restrained color. Content-first with intentional visual rhythm.',
    curatedPalettes: [
      { name: 'Classic Ink', colors: { primary: '#1A1A1A', secondary: '#6B6B6B', accent: '#C5A55A', background: '#FDFBF7', text: '#1A1A1A' } },
      { name: 'Warm Mono', colors: { primary: '#2C2C2C', secondary: '#8B8580', accent: '#B85C38', background: '#F5F0E8', text: '#1A1A1A' } },
      { name: 'Green Leaf', colors: { primary: '#306E5E', secondary: '#4A8E7A', accent: '#FF6719', background: '#FDFBF7', text: '#1A1A1A' } },
      { name: 'Burgundy Press', colors: { primary: '#722F37', secondary: '#A85751', accent: '#D4A574', background: '#FBF8F4', text: '#2C1810' } },
      { name: 'Midnight Olive', colors: { primary: '#3D405B', secondary: '#81B29A', accent: '#E07A5F', background: '#F4F1DE', text: '#3D405B' } },
      { name: 'Charcoal Sage', colors: { primary: '#2F3E46', secondary: '#84A98C', accent: '#CAD2C5', background: '#F8FAF8', text: '#2F3E46' } },
    ],
    fontPairings: [
      { id: 'fraunces-source', heading: 'Fraunces', body: 'Source Sans 3', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Fraunces is an old-style soft serif with optical sizing — it gets more expressive at large sizes. Source Sans keeps body text humanist and warm.' },
      { id: 'playfair-lato', heading: 'Playfair Display', body: 'Lato', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'High-contrast display serif for editorial authority. Lato\'s warmth prevents the pairing from feeling cold.' },
      { id: 'literata-inter', heading: 'Literata', body: 'Inter', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Literata was designed for long-form reading. Paired with Inter for UI elements — a content-first combination.' },
    ],
    artStyleRecommendation: 'photo-overlay',
    borderRadius: { sm: '2px', md: '4px', lg: '6px', full: '9999px' },
    shadowStyle: 'none',
    spacingDensity: 'generous',
    layoutPreference: 'flowing',
    animationIntensity: 'subtle',
    imageShape: 'sharp-crop',
  },

  minimal: {
    id: 'minimal',
    label: 'Minimal',
    subtitle: 'Clean & essential',
    description: 'Nothing extra. Maximum whitespace, near-monochrome palette, and precision typography. Let the content speak.',
    curatedPalettes: [
      { name: 'Pure', colors: { primary: '#111111', secondary: '#888888', accent: '#0066FF', background: '#FFFFFF', text: '#111111' } },
      { name: 'Warm Minimal', colors: { primary: '#1A1A1A', secondary: '#999999', accent: '#FF4F00', background: '#FAFAF8', text: '#1A1A1A' } },
      { name: 'Cool Gray', colors: { primary: '#18181B', secondary: '#71717A', accent: '#22C55E', background: '#FAFAFA', text: '#18181B' } },
      { name: 'Off-White', colors: { primary: '#0A0A0A', secondary: '#737373', accent: '#3B82F6', background: '#FAFAF9', text: '#171717' } },
      { name: 'Stone', colors: { primary: '#1C1917', secondary: '#78716C', accent: '#DC2626', background: '#FAFAF9', text: '#1C1917' } },
      { name: 'Zinc', colors: { primary: '#18181B', secondary: '#A1A1AA', accent: '#8B5CF6', background: '#FAFAFA', text: '#09090B' } },
    ],
    fontPairings: [
      { id: 'inter-inter-m', heading: 'Inter', body: 'Inter', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Pure minimalism. One font, varied weights. Let the content and whitespace do the talking.' },
      { id: 'geist-geist', heading: 'Geist', body: 'Geist', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Designed for interfaces. Tight metrics and clear letterforms for maximum information density.' },
      { id: 'dm-sans-dm-mono', heading: 'DM Sans', body: 'DM Mono', headingClass: 'sans-serif', bodyClass: 'monospace', reason: 'Sans headings for hierarchy, monospace body for a developer-craft aesthetic. Unusual but distinctive.' },
    ],
    artStyleRecommendation: 'line-art',
    borderRadius: { sm: '2px', md: '4px', lg: '6px', full: '9999px' },
    shadowStyle: 'none',
    spacingDensity: 'balanced',
    layoutPreference: 'structured',
    animationIntensity: 'none',
    imageShape: 'sharp-crop',
  },

  bold: {
    id: 'bold',
    label: 'Bold',
    subtitle: 'Expressive & energetic',
    description: 'Saturated colors, strong contrast, and dynamic layouts. Large type, sharp shadows, and unapologetic personality.',
    curatedPalettes: [
      { name: 'Electric', colors: { primary: '#6C2BD9', secondary: '#FF4F00', accent: '#00D4AA', background: '#0A0A0A', text: '#F5F5F5' } },
      { name: 'Neon Night', colors: { primary: '#FF006E', secondary: '#8338EC', accent: '#FFBE0B', background: '#0F0F0F', text: '#FFFFFF' } },
      { name: 'Cyber', colors: { primary: '#00F5D4', secondary: '#7B2FF7', accent: '#F15BB5', background: '#0A0A0F', text: '#E8E8E8' } },
      { name: 'Magma', colors: { primary: '#FF4500', secondary: '#FF8C00', accent: '#FFD700', background: '#0D0D0D', text: '#FAFAFA' } },
      { name: 'Aurora', colors: { primary: '#06D6A0', secondary: '#118AB2', accent: '#FFD166', background: '#073B4C', text: '#F0F4F8' } },
      { name: 'Voltage', colors: { primary: '#E6FF00', secondary: '#FF00E6', accent: '#00E6FF', background: '#0A0A0A', text: '#FFFFFF' } },
    ],
    fontPairings: [
      { id: 'space-grotesk-inter-b', heading: 'Space Grotesk', body: 'Inter', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Space Grotesk\'s geometric construction pops at bold weights. Inter is invisible in body — by design.' },
      { id: 'clash-display-satoshi', heading: 'Clash Display', body: 'Satoshi', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Display font with strong personality for headlines. Satoshi provides clean, modern body text.' },
      { id: 'cabinet-grotesk-general', heading: 'Cabinet Grotesk', body: 'General Sans', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Two neo-grotesque families with character. Tight letter-spacing at display sizes creates impact.' },
    ],
    artStyleRecommendation: 'abstract-geometric',
    borderRadius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
    shadowStyle: 'sharp',
    spacingDensity: 'balanced',
    layoutPreference: 'asymmetric',
    animationIntensity: 'moderate',
    imageShape: 'full-bleed',
  },

  luxury: {
    id: 'luxury',
    label: 'Luxury',
    subtitle: 'Elevated & refined',
    description: 'Deep tones, gold accents, and generous spacing. Serif typography, subtle long shadows, and an elevated sense of calm.',
    curatedPalettes: [
      { name: 'Gold Standard', colors: { primary: '#2C2C2C', secondary: '#666666', accent: '#C5A55A', background: '#F5F0E8', text: '#1A1A1A' } },
      { name: 'Noir', colors: { primary: '#0A0A0A', secondary: '#3A3A3A', accent: '#B8860B', background: '#1A1A1A', text: '#F5F0E8' } },
      { name: 'Emerald Lux', colors: { primary: '#0F2620', secondary: '#306E5E', accent: '#D4AF37', background: '#FDFBF7', text: '#0F2620' } },
      { name: 'Champagne', colors: { primary: '#1A1A2E', secondary: '#16213E', accent: '#E2B659', background: '#FAF7F0', text: '#1A1A2E' } },
      { name: 'Onyx Rose', colors: { primary: '#1A1A1A', secondary: '#4A4A4A', accent: '#D4A5A5', background: '#FAF5F5', text: '#1A1A1A' } },
      { name: 'Midnight Velvet', colors: { primary: '#0D1B2A', secondary: '#1B2838', accent: '#C9B037', background: '#0D1B2A', text: '#E0D8C8' } },
    ],
    fontPairings: [
      { id: 'cormorant-lato', heading: 'Cormorant Garamond', body: 'Lato', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Cormorant is an elegant display Garamond — high contrast, refined serifs. Lato provides warm, neutral body text.' },
      { id: 'fraunces-source-l', heading: 'Fraunces', body: 'Source Sans 3', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Fraunces at heavy weights feels indulgent and confident. Source Sans is the refined, readable counterpart.' },
      { id: 'playfair-raleway', heading: 'Playfair Display', body: 'Raleway', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Classical display serif meets elegant thin sans-serif. A high-fashion pairing with clear hierarchy.' },
    ],
    artStyleRecommendation: 'photo-overlay',
    borderRadius: { sm: '2px', md: '4px', lg: '8px', full: '9999px' },
    shadowStyle: 'long',
    spacingDensity: 'generous',
    layoutPreference: 'flowing',
    animationIntensity: 'subtle',
    imageShape: 'organic-mask',
  },
};

export const DESIGN_LANGUAGE_IDS = Object.keys(DESIGN_LANGUAGES) as Array<keyof typeof DESIGN_LANGUAGES>;

export function getDesignLanguage(id: string): DesignLanguagePreset {
  return DESIGN_LANGUAGES[id] || DESIGN_LANGUAGES.editorial;
}

export function getShadowCSS(style: DesignLanguagePreset['shadowStyle'], primaryColor?: string): string {
  const color = primaryColor || 'rgba(0,0,0,0.08)';
  switch (style) {
    case 'none': return 'none';
    case 'subtle': return `0 1px 3px ${color}`;
    case 'soft': return `0 4px 16px ${color}`;
    case 'sharp': return `4px 4px 0px ${color}`;
    case 'long': return `0 8px 30px ${color}`;
  }
}

export function getSpacingScale(density: DesignLanguagePreset['spacingDensity']): {
  section: string;
  card: string;
  element: string;
} {
  switch (density) {
    case 'tight': return { section: '48px', card: '24px', element: '12px' };
    case 'balanced': return { section: '64px', card: '32px', element: '16px' };
    case 'generous': return { section: '96px', card: '40px', element: '20px' };
  }
}
