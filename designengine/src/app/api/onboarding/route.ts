import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getDesignLanguage } from '@/lib/design-language';
import { generateAllScales, generateTypeScale, type TypeScaleRatio } from '@/lib/color-utils';

const BORDER_RADIUS_MAP: Record<string, Record<string, string>> = {
  sharp: { sm: '2px', md: '4px', lg: '6px', xl: '8px', full: '9999px' },
  medium: { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
  rounded: { sm: '8px', md: '12px', lg: '16px', xl: '24px', full: '9999px' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectName,
      inspirationUrl,
      inspirationUrls,
      brandDescription,
      mood,
      designLanguage: designLangId,
      artStyle,
      colors,
      typography,
      typeScaleRatio = 1.25,
      headingWeights = [600, 700],
      bodyWeights = [400, 500, 600],
      industry,
      audience,
      contentType,
      competitors,
      emotionalKeywords,
      additionalContext,
      intent,
      siteContent,
      layoutStyle,
      spacingDensityOverride,
      borderRadiusOverride,
      shadowStyleOverride,
      animationIntensityOverride,
    } = body;

    if (!projectName || !colors || !typography) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Resolve design language properties — use overrides when the user customized
    const lang = getDesignLanguage(designLangId || mood || '');
    const effectiveSpacing = spacingDensityOverride || lang.spacingDensity;
    const effectiveShadow = shadowStyleOverride || lang.shadowStyle;
    const effectiveAnimation = animationIntensityOverride || lang.animationIntensity;
    const effectiveImageShape = lang.imageShape;
    const effectiveLayout = layoutStyle || lang.layoutPreference;

    // Resolve border radius from override or design language
    let effectiveRadius = lang.borderRadius;
    if (borderRadiusOverride && BORDER_RADIUS_MAP[borderRadiusOverride]) {
      effectiveRadius = BORDER_RADIUS_MAP[borderRadiusOverride] as typeof effectiveRadius;
    }

    // Generate full shade scales from the 5 base colors
    const colorScales = generateAllScales(colors);

    // Generate type scale from ratio
    const ratio = typeScaleRatio as TypeScaleRatio;
    const typeScale = generateTypeScale(1, ratio);

    const lineHeights: Record<string, string> = {
      tight: '1.2',
      snug: '1.35',
      normal: '1.5',
      relaxed: '1.625',
      loose: '1.8',
    };

    const tokens = {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        background: colors.background,
        surface: colors.background,
        text: {
          primary: colors.text,
          secondary: adjustOpacity(colors.text, 0.7),
          muted: adjustOpacity(colors.text, 0.5),
        },
        border: adjustOpacity(colors.primary, 0.15),
        error: '#DC3545',
        warning: '#FFC107',
        success: '#28A745',
        info: '#17A2B8',
        scales: colorScales,
      },
      typography: {
        fontFamily: {
          heading: typography.heading,
          body: typography.body,
          mono: 'JetBrains Mono',
        },
        scale: typeScale,
        scaleRatio: ratio,
        headingWeights,
        bodyWeights,
        lineHeights,
      },
      spacing: {
        unit: '8px',
        density: effectiveSpacing,
        scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24],
      },
      borders: {
        radius: effectiveRadius,
        width: { default: '1px', thick: '2px' },
      },
      shadows: {
        style: effectiveShadow,
        sm: `0 2px 8px ${adjustOpacity(colors.primary, 0.06)}`,
        md: `0 4px 16px ${adjustOpacity(colors.primary, 0.08)}`,
        lg: `0 8px 32px ${adjustOpacity(colors.primary, 0.1)}`,
        xl: `0 16px 48px ${adjustOpacity(colors.primary, 0.12)}`,
      },
      effects: { blur: '8px', opacity: {} },
      designLanguage: {
        id: designLangId || mood || '',
        layoutPreference: effectiveLayout,
        animationIntensity: effectiveAnimation,
        imageShape: effectiveImageShape,
        spacingDensity: effectiveSpacing,
      },
      mood: designLangId || mood || undefined,
      artStyle: artStyle || undefined,
      brand: {
        description: brandDescription || '',
        industry: industry || '',
        audience: audience || '',
        contentType: contentType || '',
        competitors: competitors || '',
        emotionalKeywords: emotionalKeywords || [],
        additionalContext: additionalContext || '',
      },
    };

    const cssVariables = buildCssVariables(colors, typography, effectiveRadius, colorScales, typeScale, ratio);
    const tailwindConfig = buildTailwindConfig(colors, typography, effectiveRadius, colorScales);

    const components = {
      button: {
        primary: {
          classes: `bg-primary text-white font-semibold rounded-md px-6 py-3`,
          css: `background: ${colors.primary}; color: white; font-weight: 600; border-radius: ${effectiveRadius.md}; padding: 0.75rem 1.5rem;`,
        },
        secondary: {
          classes: `bg-secondary text-white font-semibold rounded-md px-6 py-3`,
          css: `background: ${colors.secondary}; color: white; font-weight: 600; border-radius: ${effectiveRadius.md}; padding: 0.75rem 1.5rem;`,
        },
        ghost: {
          classes: `border border-primary/20 text-primary font-medium rounded-md px-6 py-3`,
          css: `border: 1px solid ${colors.primary}; color: ${colors.primary}; font-weight: 500; border-radius: ${effectiveRadius.md};`,
        },
      },
      card: {
        default: {
          classes: `bg-white border border-primary/10 rounded-lg p-6 shadow-sm`,
          css: `background: white; border: 1px solid ${adjustOpacity(colors.primary, 0.1)}; border-radius: ${effectiveRadius.lg}; padding: 1.5rem;`,
        },
      },
      input: {
        default: {
          classes: `bg-white border border-primary/15 rounded-md px-4 py-2.5 text-base`,
          css: `background: white; border: 1.5px solid ${adjustOpacity(colors.primary, 0.15)}; border-radius: ${effectiveRadius.md}; padding: 0.625rem 1rem;`,
        },
      },
      heading: {
        h1: { css: `font-family: '${typography.heading}', serif; font-size: ${typeScale['4xl']}; font-weight: ${headingWeights[headingWeights.length - 1] || 700}; letter-spacing: -0.03em; line-height: ${lineHeights.tight};` },
        h2: { css: `font-family: '${typography.heading}', serif; font-size: ${typeScale['3xl']}; font-weight: ${headingWeights[headingWeights.length - 1] || 700}; letter-spacing: -0.02em; line-height: ${lineHeights.tight};` },
        h3: { css: `font-family: '${typography.heading}', serif; font-size: ${typeScale['2xl']}; font-weight: ${headingWeights[0] || 600}; line-height: ${lineHeights.snug};` },
        h4: { css: `font-family: '${typography.heading}', serif; font-size: ${typeScale.xl}; font-weight: ${headingWeights[0] || 600}; line-height: ${lineHeights.snug};` },
      },
      body: {
        default: { css: `font-family: '${typography.body}', sans-serif; font-size: ${typeScale.base}; font-weight: ${bodyWeights[0] || 400}; line-height: ${lineHeights.relaxed};` },
        small: { css: `font-family: '${typography.body}', sans-serif; font-size: ${typeScale.sm}; font-weight: ${bodyWeights[0] || 400}; line-height: ${lineHeights.normal};` },
        label: { css: `font-family: '${typography.body}', sans-serif; font-size: ${typeScale.xs}; font-weight: ${bodyWeights[1] || 500}; letter-spacing: 0.05em; text-transform: uppercase; line-height: ${lineHeights.normal};` },
      },
    };

    const { data: existing } = await supabaseAdmin
      .from('design_profiles')
      .select('id')
      .eq('project_name', projectName)
      .limit(1) as { data: Array<{ id: string }> | null; error: unknown };

    const profileData = {
      project_name: projectName,
      source_url: inspirationUrl || null,
      tokens,
      components,
      tailwind_config: tailwindConfig,
      css_variables: cssVariables,
      metadata: {
        intent: intent || null,
        inspirationUrls: inspirationUrls || null,
        siteContent: siteContent || null,
        additionalContext: additionalContext || null,
        brandDescription: brandDescription || null,
        industry: industry || null,
        audience: audience || null,
        contentType: contentType || null,
        competitors: competitors || null,
        emotionalKeywords: emotionalKeywords || null,
      },
    };

    if (existing && existing.length > 0) {
      await supabaseAdmin
        .from('design_profiles')
        .update(profileData)
        .eq('id', existing[0].id);
    } else {
      await supabaseAdmin
        .from('design_profiles')
        .insert(profileData);
    }

    return NextResponse.json({
      success: true,
      projectName,
      mood: designLangId || mood,
      brandDescription,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function adjustOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function buildCssVariables(
  colors: Record<string, string>,
  typography: { heading: string; body: string },
  radius: Record<string, string>,
  scales: Record<string, Record<number, string>>,
  typeScale: Record<string, string>,
  ratio: number,
): string {
  const scaleVars = Object.entries(scales)
    .flatMap(([name, shades]) =>
      Object.entries(shades).map(([shade, hex]) => `  --color-${name}-${shade}: ${hex};`)
    )
    .join('\n');

  const typeVars = Object.entries(typeScale)
    .map(([name, size]) => `  --text-${name}: ${size};`)
    .join('\n');

  return `:root {
  /* Brand colors */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-text: ${colors.text};
  --color-text-secondary: ${adjustOpacity(colors.text, 0.7)};
  --color-text-muted: ${adjustOpacity(colors.text, 0.5)};
  --color-border: ${adjustOpacity(colors.primary, 0.15)};
  --color-border-strong: ${adjustOpacity(colors.primary, 0.3)};

  /* Shade scales */
${scaleVars}

  /* Typography */
  --font-heading: '${typography.heading}', serif;
  --font-body: '${typography.body}', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --type-scale-ratio: ${ratio};

  /* Type scale */
${typeVars}

  /* Radii */
  --radius-sm: ${radius.sm || '4px'};
  --radius-md: ${radius.md || '6px'};
  --radius-lg: ${radius.lg || '8px'};
  --radius-xl: ${radius.xl || '12px'};

  /* Shadows */
  --shadow-sm: 0 2px 8px ${adjustOpacity(colors.primary, 0.06)};
  --shadow-md: 0 4px 16px ${adjustOpacity(colors.primary, 0.08)};
  --shadow-lg: 0 8px 32px ${adjustOpacity(colors.primary, 0.1)};
}`;
}

function buildTailwindConfig(
  colors: Record<string, string>,
  typography: { heading: string; body: string },
  radius: Record<string, string>,
  scales: Record<string, Record<number, string>>,
): Record<string, unknown> {
  const colorConfig: Record<string, unknown> = {
    primary: { DEFAULT: colors.primary },
    secondary: { DEFAULT: colors.secondary },
    accent: { DEFAULT: colors.accent },
    background: colors.background,
    'text-primary': colors.text,
  };

  for (const [name, shades] of Object.entries(scales)) {
    const shadeObj: Record<string, string> = {};
    for (const [shade, hex] of Object.entries(shades)) {
      shadeObj[shade] = hex;
    }
    colorConfig[name] = shadeObj;
  }

  return {
    colors: colorConfig,
    fontFamily: {
      heading: [typography.heading, 'serif'],
      body: [typography.body, 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    borderRadius: {
      sm: radius.sm || '4px',
      md: radius.md || '6px',
      lg: radius.lg || '8px',
      xl: radius.xl || '12px',
    },
  };
}
