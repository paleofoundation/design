import {
  firecrawl,
  type FirecrawlBrandingResponse,
} from './client';
import type { BrandingProfile } from '@mendable/firecrawl-js';

export interface IngestionResult {
  success: boolean;
  url: string;
  branding: FirecrawlBrandingResponse | null;
  markdown: string | null;
  html: string | null;
  screenshot: string | null;
  error?: string;
  scrapedAt: string;
}

function toBrandingResponse(
  profile: BrandingProfile
): FirecrawlBrandingResponse {
  return {
    colorScheme: profile.colorScheme ?? 'light',
    logo: profile.logo ?? '',
    colors: {
      primary: profile.colors?.primary ?? '',
      secondary: profile.colors?.secondary ?? '',
      accent: profile.colors?.accent ?? '',
      background: profile.colors?.background ?? '',
      textPrimary: profile.colors?.textPrimary ?? '',
      textSecondary: profile.colors?.textSecondary ?? '',
      link: profile.colors?.link,
      success: profile.colors?.success,
      warning: profile.colors?.warning,
      error: profile.colors?.error,
    },
    fonts: profile.fonts ?? [],
    typography: {
      fontFamilies: {
        primary: profile.typography?.fontFamilies?.primary ?? '',
        heading: profile.typography?.fontFamilies?.heading ?? '',
        code: profile.typography?.fontFamilies?.code,
      },
      fontSizes: {
        h1: profile.typography?.fontSizes?.h1 ?? '',
        h2: profile.typography?.fontSizes?.h2 ?? '',
        h3: profile.typography?.fontSizes?.h3 ?? '',
        body: profile.typography?.fontSizes?.body ?? '',
      },
      fontWeights: {
        regular: profile.typography?.fontWeights?.regular ?? 400,
        medium: profile.typography?.fontWeights?.medium ?? 500,
        bold: profile.typography?.fontWeights?.bold ?? 700,
      },
      lineHeights: profile.typography?.lineHeights
        ? {
            tight: String(profile.typography.lineHeights.heading ?? 1.2),
            normal: String(profile.typography.lineHeights.body ?? 1.5),
            relaxed: '1.75',
          }
        : undefined,
    },
    spacing: {
      baseUnit: profile.spacing?.baseUnit ?? 4,
      borderRadius: profile.spacing?.borderRadius ?? '0',
    },
    components: profile.components
      ? {
          buttonPrimary: profile.components.buttonPrimary
            ? {
                background: profile.components.buttonPrimary.background ?? '',
                textColor: profile.components.buttonPrimary.textColor ?? '',
                borderRadius:
                  profile.components.buttonPrimary.borderRadius ?? '',
              }
            : undefined,
          buttonSecondary: profile.components.buttonSecondary
            ? {
                background:
                  profile.components.buttonSecondary.background ?? '',
                textColor:
                  profile.components.buttonSecondary.textColor ?? '',
                borderColor: profile.components.buttonSecondary.borderColor,
                borderRadius:
                  profile.components.buttonSecondary.borderRadius ?? '',
              }
            : undefined,
          input: profile.components.input
            ? {
                background: '',
                borderColor: profile.components.input.borderColor ?? '',
                borderRadius: profile.components.input.borderRadius ?? '',
              }
            : undefined,
        }
      : undefined,
    images: profile.images
      ? {
          logo: profile.images.logo ?? '',
          favicon: profile.images.favicon ?? '',
          ogImage: profile.images.ogImage ?? '',
        }
      : undefined,
    layout: profile.layout
      ? {
          maxWidth: profile.layout.grid?.maxWidth,
          headerHeight: profile.layout.headerHeight,
          footerHeight: profile.layout.footerHeight,
        }
      : undefined,
    personality: profile.personality
      ? {
          tone: profile.personality.tone,
          energy: profile.personality.energy,
          targetAudience: profile.personality.targetAudience,
        }
      : undefined,
  };
}

export async function ingestDesignFromUrl(
  url: string,
  options?: {
    includeScreenshot?: boolean;
    includeMarkdown?: boolean;
    includeHtml?: boolean;
    timeout?: number;
  }
): Promise<IngestionResult> {
  const formats: Array<
    'branding' | 'screenshot' | 'markdown' | 'html'
  > = ['branding'];

  if (options?.includeScreenshot !== false) {
    formats.push('screenshot');
  }
  if (options?.includeMarkdown) {
    formats.push('markdown');
  }
  if (options?.includeHtml) {
    formats.push('html');
  }

  try {
    const result = await firecrawl.scrape(url, {
      formats,
      timeout: options?.timeout || 30000,
    });

    return {
      success: true,
      url,
      branding: result.branding
        ? toBrandingResponse(result.branding)
        : null,
      markdown: result.markdown || null,
      html: result.html || null,
      screenshot: result.screenshot || null,
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      url,
      branding: null,
      markdown: null,
      html: null,
      screenshot: null,
      error: error instanceof Error
        ? error.message
        : 'Unknown ingestion error',
      scrapedAt: new Date().toISOString(),
    };
  }
}
