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

export interface Adoptions {
  colors: boolean;
  typography: boolean;
  mood: boolean;
  spacing: boolean;
}

export interface OnboardingState {
  projectName: string;
  inspirationUrl: string;
  brandDescription: string;
  mood: string;
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

  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  applyExtraction: (branding: ExtractionBranding, screenshot: string | null) => void;
}

function mapPersonalityToMood(personality?: { tone?: string; energy?: string }): string {
  if (!personality) return '';
  const combined = `${personality.tone || ''} ${personality.energy || ''}`.toLowerCase();

  if (/corporate|professional|trustworth|enterprise|formal/.test(combined)) return 'corporate';
  if (/playful|fun|friendly|energetic|cheerful|whimsical/.test(combined)) return 'playful';
  if (/editorial|sophisticated|considered|literary|thoughtful/.test(combined)) return 'editorial';
  if (/minimal|clean|simple|essential|sparse/.test(combined)) return 'minimal';
  if (/bold|expressive|dynamic|vibrant|intense|loud/.test(combined)) return 'bold';
  if (/luxury|elevated|refined|premium|elegant|exclusive/.test(combined)) return 'luxury';

  if (/warm|calm|organic|natural/.test(combined)) return 'editorial';
  if (/modern|sleek|tech/.test(combined)) return 'minimal';
  if (/creative|artistic|daring/.test(combined)) return 'bold';

  return '';
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  projectName: '',
  inspirationUrl: '',
  brandDescription: '',
  mood: '',
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

  setField: (key, value) => set({ [key]: value }),

  applyExtraction: (branding, screenshot) => {
    const detectedMood = mapPersonalityToMood(branding.personality);

    set((state) => {
      const updates: Partial<OnboardingState> = {
        extraction: branding,
        screenshot,
        extractionStatus: 'done',
        extractionError: null,
        extractedTokens: branding as unknown as Record<string, unknown>,
      };

      if (state.adoptions.colors && branding.colors) {
        updates.colors = {
          primary: branding.colors.primary || state.colors.primary,
          secondary: branding.colors.secondary || state.colors.secondary,
          accent: branding.colors.accent || state.colors.accent,
          background: branding.colors.background || state.colors.background,
          text: branding.colors.textPrimary || state.colors.text,
        };
      }

      if (state.adoptions.typography && branding.typography?.fontFamilies) {
        const heading = branding.typography.fontFamilies.heading || branding.typography.fontFamilies.primary;
        const body = branding.typography.fontFamilies.primary || branding.typography.fontFamilies.heading;
        if (heading) updates.typography = { heading, body: body || heading };
      }

      if (state.adoptions.mood && detectedMood) {
        updates.mood = detectedMood;
      }

      return updates;
    });
  },
}));
