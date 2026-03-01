'use client';

import { create } from 'zustand';

export interface ExtractionBranding {
  colorScheme: 'light' | 'dark';
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    textPrimary: string;
    textSecondary: string;
    link?: string;
  };
  fonts: Array<{ family: string }>;
  typography: {
    fontFamilies: {
      primary: string;
      heading: string;
      code?: string;
    };
    fontSizes: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
    };
    fontWeights: {
      regular: number;
      medium: number;
      bold: number;
    };
    lineHeights?: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  spacing: {
    baseUnit: number;
    borderRadius: string;
  };
  personality?: {
    tone?: string;
    energy?: string;
    targetAudience?: string;
  };
}

export interface DetectedColor {
  hex: string;
  name: string;
  usage: string;
}

export type ColorRole = 'primary' | 'secondary' | 'accent' | 'background' | 'text';

export interface Adoptions {
  colors: boolean;
  typography: boolean;
  mood: boolean;
  spacing: boolean;
}

export type ArtStylePreset =
  | 'line-art'
  | 'flat-vector'
  | 'watercolor'
  | 'isometric'
  | 'abstract-geometric'
  | 'photo-overlay';

export interface OnboardingState {
  projectName: string;
  inspirationUrl: string;
  brandDescription: string;
  mood: string;
  artStyle: ArtStylePreset | '';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  extractedTokens: Record<string, unknown> | null;

  extraction: ExtractionBranding | null;
  screenshot: string | null;
  extractionStatus: 'idle' | 'loading' | 'done' | 'error' | 'skipped';
  extractionError: string | null;
  adoptions: Adoptions;
  additionalContext: string;

  detectedColors: DetectedColor[];
  colorRoleAssignments: Record<ColorRole, string>;

  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  applyExtraction: (
    branding: ExtractionBranding,
    screenshot: string | null,
    aiColors?: {
      colors: Array<{ hex: string; name: string; usage: string }>;
      suggestedRoles: Record<string, string>;
    } | null,
    aiFonts?: {
      fonts: Array<{ family: string; source: string }>;
      suggestedRoles: { heading: string; body: string; code?: string };
    } | null,
    aiMood?: string | null,
  ) => void;
  assignColorRole: (role: ColorRole, hex: string) => void;
  addDetectedColor: (hex: string) => void;
}

function mapPersonalityToMood(personality?: { tone?: string; energy?: string }): string {
  if (!personality) return '';
  const combined = `${personality.tone || ''} ${personality.energy || ''}`.toLowerCase();

  if (/corporate|enterprise|formal|institutional/.test(combined)) return 'corporate';
  if (/playful|fun|friendly|energetic|cheerful|whimsical|approachable/.test(combined)) return 'playful';
  if (/editorial|sophisticated|considered|literary|thoughtful/.test(combined)) return 'editorial';
  if (/minimal|clean|simple|essential|sparse/.test(combined)) return 'minimal';
  if (/bold|expressive|dynamic|vibrant|intense|loud/.test(combined)) return 'bold';
  if (/luxury|elevated|refined|premium|elegant|exclusive/.test(combined)) return 'luxury';

  if (/warm|calm|organic|natural/.test(combined)) return 'editorial';
  if (/modern|sleek|tech/.test(combined)) return 'minimal';
  if (/creative|artistic|daring/.test(combined)) return 'bold';

  return '';
}

function deduplicateColors(colors: DetectedColor[]): DetectedColor[] {
  const seen = new Set<string>();
  return colors.filter((c) => {
    const normalized = c.hex.toUpperCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  projectName: '',
  inspirationUrl: '',
  brandDescription: '',
  mood: '',
  artStyle: '',
  colors: {
    primary: '#306E5E',
    secondary: '#FF6719',
    accent: '#F2B245',
    background: '#FDFBF7',
    text: '#1A1A1A',
  },
  typography: {
    heading: 'Fraunces',
    body: 'Source Sans 3',
  },
  extractedTokens: null,

  extraction: null,
  screenshot: null,
  extractionStatus: 'idle',
  extractionError: null,
  adoptions: { colors: true, typography: true, mood: true, spacing: true },
  additionalContext: '',

  detectedColors: [],
  colorRoleAssignments: { primary: '', secondary: '', accent: '', background: '', text: '' },

  setField: (key, value) => set({ [key]: value }),

  applyExtraction: (branding, screenshot, aiColors, aiFonts, aiMood) => {
    const fallbackMood = mapPersonalityToMood(branding.personality);
    const detectedMood = aiMood || fallbackMood;

    set((state) => {
      const updates: Partial<OnboardingState> = {
        extraction: branding,
        screenshot,
        extractionStatus: 'done',
        extractionError: null,
        extractedTokens: branding as unknown as Record<string, unknown>,
      };

      if (aiColors?.colors?.length) {
        updates.detectedColors = deduplicateColors(aiColors.colors);

        const roles = aiColors.suggestedRoles;
        updates.colorRoleAssignments = {
          primary: roles?.primary || branding.colors.primary || '',
          secondary: roles?.secondary || branding.colors.secondary || '',
          accent: roles?.accent || branding.colors.accent || '',
          background: roles?.background || branding.colors.background || '',
          text: roles?.text || branding.colors.textPrimary || '',
        };
      } else {
        const fc = branding.colors;
        const fallbackColors: DetectedColor[] = [];
        if (fc.primary) fallbackColors.push({ hex: fc.primary, name: 'Primary', usage: 'Main brand color' });
        if (fc.secondary) fallbackColors.push({ hex: fc.secondary, name: 'Secondary', usage: 'Supporting color' });
        if (fc.accent) fallbackColors.push({ hex: fc.accent, name: 'Accent', usage: 'Highlight color' });
        if (fc.background) fallbackColors.push({ hex: fc.background, name: 'Background', usage: 'Page background' });
        if (fc.textPrimary) fallbackColors.push({ hex: fc.textPrimary, name: 'Text', usage: 'Body text' });

        updates.detectedColors = deduplicateColors(fallbackColors);
        updates.colorRoleAssignments = {
          primary: fc.primary || '',
          secondary: fc.secondary || '',
          accent: fc.accent || '',
          background: fc.background || '',
          text: fc.textPrimary || '',
        };
      }

      if (state.adoptions.colors && updates.colorRoleAssignments) {
        const r = updates.colorRoleAssignments;
        updates.colors = {
          primary: r.primary || state.colors.primary,
          secondary: r.secondary || state.colors.secondary,
          accent: r.accent || state.colors.accent,
          background: r.background || state.colors.background,
          text: r.text || state.colors.text,
        };
      }

      // Typography: prefer aiFonts (parsed from actual HTML/CSS) over Firecrawl heuristics
      if (state.adoptions.typography) {
        const aiHeading = aiFonts?.suggestedRoles?.heading;
        const aiBody = aiFonts?.suggestedRoles?.body;

        if (aiHeading || aiBody) {
          updates.typography = {
            heading: aiHeading || aiBody || state.typography.heading,
            body: aiBody || aiHeading || state.typography.body,
          };
        } else if (branding.typography?.fontFamilies) {
          const heading = branding.typography.fontFamilies.heading || branding.typography.fontFamilies.primary;
          const body = branding.typography.fontFamilies.primary || branding.typography.fontFamilies.heading;
          if (heading) updates.typography = { heading, body: body || heading };
        }
      }

      if (state.adoptions.mood && detectedMood) {
        updates.mood = detectedMood;
      }

      return updates;
    });
  },

  assignColorRole: (role, hex) => {
    set((state) => ({
      colorRoleAssignments: { ...state.colorRoleAssignments, [role]: hex },
      colors: { ...state.colors, [role]: hex },
    }));
  },

  addDetectedColor: (hex) => {
    set((state) => {
      const normalized = hex.toUpperCase();
      if (state.detectedColors.some((c) => c.hex.toUpperCase() === normalized)) {
        return state;
      }
      return {
        detectedColors: [
          ...state.detectedColors,
          { hex, name: 'Picked', usage: 'From screenshot' },
        ],
      };
    });
  },
}));
