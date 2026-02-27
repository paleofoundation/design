export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    textPrimary: string;
    textSecondary: string;
    [key: string]: string;
  };
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
      h4?: string;
      body: string;
      small?: string;
    };
    fontWeights: {
      light?: number;
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
    scale: number[];
    borderRadius: string;
  };
  shadows?: {
    sm: string;
    md: string;
    lg: string;
  };
  layout?: {
    maxWidth: string;
    gridColumns: number;
    containerPadding: string;
  };
  colorScheme: 'light' | 'dark';
  sourceUrl: string;
  extractedAt: string;
}

export interface DesignPattern {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  sourceUrl: string;
  tokens: DesignTokens;
  screenshot?: string;
  embedding?: number[];
  createdAt: string;
}

export interface FontGenerationResult {
  recommendation: {
    primaryFont: string;
    fallbackStack: string;
    googleFontsUrl: string;
    weights: number[];
    italicAvailable: boolean;
    category: string;
  };
  alternatives: Array<{
    font: string;
    reason: string;
    googleFontsUrl: string;
  }>;
  css: {
    importStatement: string;
    fontFaceDeclarations: string;
    cssVariables: string;
    utilityClasses: string;
  };
  htmlPreview: string;
  designRationale: string;
}

export interface TypographyPairing {
  heading: {
    fontFamily: string;
    weight: number;
    letterSpacing: string;
  };
  body: {
    fontFamily: string;
    weight: number;
    letterSpacing: string;
  };
  sizeScale: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    body: string;
    small: string;
    caption: string;
  };
  mood: string;
  reasoning: string;
  cssVariables: Record<string, string>;
}

export interface ConvertDesignResult {
  html: string;
  css: string;
  javascript?: string;
  componentCode?: string;
  metadata: {
    outputFormat: string;
    responsive: boolean;
    accessibility: string;
    estimatedFidelity: 'high' | 'medium' | 'low';
    notes: string[];
  };
}
