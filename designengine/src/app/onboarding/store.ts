'use client';

import { create } from 'zustand';

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
  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
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
  setField: (key, value) => set({ [key]: value }),
}));
