import type { DesignTokens } from '@/types/design';
import type {
  FirecrawlBrandingResponse,
} from '@/lib/firecrawl/client';

// =============================================
// COLOR UTILITIES
// =============================================

function isValidHex(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/
    .test(color);
}

function normalizeColor(
  color: string,
  fallback: string
): string {
  if (!color) return fallback;
  const trimmed = color.trim();

  if (isValidHex(trimmed)) {
    if (trimmed.length === 4) {
      return '#'
        + trimmed[1] + trimmed[1]
        + trimmed[2] + trimmed[2]
        + trimmed[3] + trimmed[3];
    }
    return trimmed.substring(0, 7);
  }

  const rgbMatch = trimmed.match(
    /rgb\((\d+),\s*(\d+),\s*(\d+)\)/
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1])
      .toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2])
      .toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3])
      .toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  return fallback;
}

// =============================================
// TYPOGRAPHY UTILITIES
// =============================================

function normalizeFontSize(
  size: string | undefined,
  fallback: string
): string {
  if (!size) return fallback;
  const trimmed = size.trim().toLowerCase();

  if (trimmed.endsWith('px')) return trimmed;

  if (trimmed.endsWith('rem')) {
    const remValue = parseFloat(trimmed);
    if (!isNaN(remValue)) {
      return `${Math.round(remValue * 16)}px`;
    }
  }

  if (trimmed.endsWith('em')) {
    const emValue = parseFloat(trimmed);
    if (!isNaN(emValue)) {
      return `${Math.round(emValue * 16)}px`;
    }
  }

  const num = parseFloat(trimmed);
  if (!isNaN(num)) return `${Math.round(num)}px`;

  return fallback;
}

// =============================================
// SPACING UTILITIES
// =============================================

function generateSpacingScale(
  baseUnit: number
): number[] {
  return [
    0,
    baseUnit * 0.25,
    baseUnit * 0.5,
    baseUnit,
    baseUnit * 1.5,
    baseUnit * 2,
    baseUnit * 3,
    baseUnit * 4,
    baseUnit * 6,
    baseUnit * 8,
    baseUnit * 12,
    baseUnit * 16,
  ].map(Math.round);
}

function generateShadows(
  scheme: 'light' | 'dark'
): { sm: string; md: string; lg: string } {
  if (scheme === 'dark') {
    return {
      sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
      md: '0 4px 6px rgba(0, 0, 0, 0.5)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.6)',
    };
  }
  return {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.15)',
  };
}

// =============================================
// MAIN EXTRACTION FUNCTION
// =============================================

export function extractDesignTokens(
  branding: FirecrawlBrandingResponse,
  sourceUrl: string
): DesignTokens {
  const scheme = branding.colorScheme || 'light';

  const defaultBg =
    scheme === 'dark' ? '#1a1a1a' : '#ffffff';
  const defaultText =
    scheme === 'dark' ? '#ffffff' : '#111827';
  const defaultSecText =
    scheme === 'dark' ? '#a1a1aa' : '#6b7280';

  const colors: DesignTokens['colors'] = {
    primary: normalizeColor(
      branding.colors?.primary, '#3b82f6'
    ),
    secondary: normalizeColor(
      branding.colors?.secondary, '#6366f1'
    ),
    accent: normalizeColor(
      branding.colors?.accent, '#f59e0b'
    ),
    background: normalizeColor(
      branding.colors?.background, defaultBg
    ),
    textPrimary: normalizeColor(
      branding.colors?.textPrimary, defaultText
    ),
    textSecondary: normalizeColor(
      branding.colors?.textSecondary, defaultSecText
    ),
  };

  if (branding.colors?.link) {
    colors.link = normalizeColor(
      branding.colors.link, colors.primary
    );
  }
  if (branding.colors?.success) {
    colors.success = normalizeColor(
      branding.colors.success, '#10b981'
    );
  }
  if (branding.colors?.warning) {
    colors.warning = normalizeColor(
      branding.colors.warning, '#f59e0b'
    );
  }
  if (branding.colors?.error) {
    colors.error = normalizeColor(
      branding.colors.error, '#ef4444'
    );
  }

  const typography: DesignTokens['typography'] = {
    fontFamilies: {
      primary:
        branding.typography?.fontFamilies?.primary
        || branding.fonts?.[0]?.family
        || 'Inter',
      heading:
        branding.typography?.fontFamilies?.heading
        || branding.fonts?.[0]?.family
        || 'Inter',
      code:
        branding.typography?.fontFamilies?.code
        || 'JetBrains Mono',
    },
    fontSizes: {
      h1: normalizeFontSize(
        branding.typography?.fontSizes?.h1, '48px'
      ),
      h2: normalizeFontSize(
        branding.typography?.fontSizes?.h2, '36px'
      ),
      h3: normalizeFontSize(
        branding.typography?.fontSizes?.h3, '24px'
      ),
      h4: '20px',
      body: normalizeFontSize(
        branding.typography?.fontSizes?.body, '16px'
      ),
      small: '14px',
    },
    fontWeights: {
      light: 300,
      regular:
        branding.typography?.fontWeights?.regular || 400,
      medium:
        branding.typography?.fontWeights?.medium || 500,
      bold:
        branding.typography?.fontWeights?.bold || 700,
    },
    lineHeights:
      branding.typography?.lineHeights || {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
  };

  const baseUnit = branding.spacing?.baseUnit || 8;
  const spacing: DesignTokens['spacing'] = {
    baseUnit,
    scale: generateSpacingScale(baseUnit),
    borderRadius:
      branding.spacing?.borderRadius || '8px',
  };

  const shadows = generateShadows(scheme);

  const layout: DesignTokens['layout'] = {
    maxWidth:
      branding.layout?.maxWidth || '1280px',
    gridColumns: 12,
    containerPadding: `${baseUnit * 2}px`,
  };

  return {
    colors,
    typography,
    spacing,
    shadows,
    layout,
    colorScheme: scheme,
    sourceUrl,
    extractedAt: new Date().toISOString(),
  };
}

// =============================================
// CSS CUSTOM PROPERTIES EXPORT
// =============================================

export function tokensToCssVariables(
  tokens: DesignTokens
): string {
  const vars: string[] = [':root {'];

  Object.entries(tokens.colors).forEach(
    ([key, value]) => {
      const cssKey = key
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase();
      vars.push(`  --color-${cssKey}: ${value};`);
    }
  );

  vars.push(
    `  --font-primary: '${tokens.typography.fontFamilies.primary}', sans-serif;`
  );
  vars.push(
    `  --font-heading: '${tokens.typography.fontFamilies.heading}', sans-serif;`
  );
  if (tokens.typography.fontFamilies.code) {
    vars.push(
      `  --font-code: '${tokens.typography.fontFamilies.code}', monospace;`
    );
  }

  Object.entries(tokens.typography.fontSizes).forEach(
    ([key, value]) => {
      if (value) {
        vars.push(`  --font-size-${key}: ${value};`);
      }
    }
  );

  tokens.spacing.scale.forEach((value, index) => {
    vars.push(`  --space-${index}: ${value}px;`);
  });
  vars.push(
    `  --radius: ${tokens.spacing.borderRadius};`
  );

  if (tokens.shadows) {
    Object.entries(tokens.shadows).forEach(
      ([key, value]) => {
        vars.push(`  --shadow-${key}: ${value};`);
      }
    );
  }

  vars.push('}');
  return vars.join('\n');
}

// =============================================
// TAILWIND CONFIG EXPORT
// =============================================

export function tokensToTailwindConfig(
  tokens: DesignTokens
): object {
  return {
    colors: {
      primary: tokens.colors.primary,
      secondary: tokens.colors.secondary,
      accent: tokens.colors.accent,
      background: tokens.colors.background,
      foreground: tokens.colors.textPrimary,
      muted: tokens.colors.textSecondary,
    },
    fontFamily: {
      sans: [
        tokens.typography.fontFamilies.primary,
        'sans-serif',
      ],
      heading: [
        tokens.typography.fontFamilies.heading,
        'sans-serif',
      ],
      mono: [
        tokens.typography.fontFamilies.code || 'monospace',
      ],
    },
    fontSize: tokens.typography.fontSizes,
    borderRadius: {
      DEFAULT: tokens.spacing.borderRadius,
    },
    boxShadow: tokens.shadows,
  };
}
