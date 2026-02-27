import FirecrawlApp from '@mendable/firecrawl-js';

export const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!,
});

export type { BrandingProfile } from '@mendable/firecrawl-js';

export interface FirecrawlBrandingResponse {
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
    success?: string;
    warning?: string;
    error?: string;
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
  components?: {
    buttonPrimary?: {
      background: string;
      textColor: string;
      borderRadius: string;
    };
    buttonSecondary?: {
      background: string;
      textColor: string;
      borderColor?: string;
      borderRadius: string;
    };
    input?: {
      background: string;
      borderColor: string;
      borderRadius: string;
    };
  };
  images?: {
    logo: string;
    favicon: string;
    ogImage: string;
  };
  layout?: {
    maxWidth?: string;
    headerHeight?: string;
    footerHeight?: string;
  };
  personality?: {
    tone?: string;
    energy?: string;
    targetAudience?: string;
  };
}
