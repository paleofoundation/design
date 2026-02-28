import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, inspirationUrl, brandDescription, mood, colors, typography } = body;

    if (!projectName || !colors || !typography) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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
        success: '#28A745',
      },
      typography: {
        fontFamily: {
          heading: typography.heading,
          body: typography.body,
          mono: 'JetBrains Mono',
        },
        scale: {
          xs: '0.75rem/1.4',
          sm: '0.875rem/1.5',
          base: '1rem/1.6',
          lg: '1.125rem/1.5',
          xl: '1.333rem/1.4',
          '2xl': '1.777rem/1.3',
          '3xl': '2.369rem/1.2',
          '4xl': '3.157rem/1.15',
        },
      },
      spacing: { unit: '8px', scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24] },
      borders: {
        radius: { sm: '4px', md: '6px', lg: '8px', xl: '12px', full: '9999px' },
        width: { default: '1px', thick: '2px' },
      },
      shadows: {
        sm: `0 2px 8px ${adjustOpacity(colors.primary, 0.06)}`,
        md: `0 4px 16px ${adjustOpacity(colors.primary, 0.08)}`,
        lg: `0 8px 32px ${adjustOpacity(colors.primary, 0.1)}`,
        xl: `0 16px 48px ${adjustOpacity(colors.primary, 0.12)}`,
      },
      effects: { blur: '8px', opacity: {} },
    };

    const cssVariables = buildCssVariables(colors, typography);
    const tailwindConfig = buildTailwindConfig(colors, typography);

    const components = {
      button: {
        primary: { classes: `bg-[${colors.primary}] text-white font-semibold rounded-md px-6 py-3`, css: `background: ${colors.primary}; color: white; font-weight: 600; border-radius: 6px; padding: 0.75rem 1.5rem;` },
        secondary: { classes: `bg-[${colors.secondary}] text-white font-semibold rounded-md px-6 py-3`, css: `background: ${colors.secondary}; color: white; font-weight: 600; border-radius: 6px; padding: 0.75rem 1.5rem;` },
        ghost: { classes: `border border-[${colors.primary}]/20 text-[${colors.primary}] font-medium rounded-md px-6 py-3`, css: `border: 1px solid ${colors.primary}; color: ${colors.primary}; font-weight: 500; border-radius: 6px;` },
      },
      card: { default: { classes: `bg-white border border-[${colors.primary}]/10 rounded-md p-6 shadow-sm`, css: `background: white; border: 1px solid ${adjustOpacity(colors.primary, 0.1)}; border-radius: 6px; padding: 1.5rem;` } },
      input: { default: { classes: `bg-white border border-[${colors.primary}]/15 rounded-md px-4 py-2.5 text-base`, css: `background: white; border: 1.5px solid ${adjustOpacity(colors.primary, 0.15)}; border-radius: 6px; padding: 0.625rem 1rem;` } },
      heading: {
        h1: { classes: `font-serif text-5xl font-bold tracking-tight`, css: `font-family: '${typography.heading}', serif; font-size: 3.157rem; font-weight: 700; letter-spacing: -0.03em;` },
        h2: { classes: `font-serif text-4xl font-bold tracking-tight`, css: `font-family: '${typography.heading}', serif; font-size: 2.369rem; font-weight: 700; letter-spacing: -0.03em;` },
        h3: { classes: `font-serif text-3xl font-bold`, css: `font-family: '${typography.heading}', serif; font-size: 1.777rem; font-weight: 700;` },
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
      mood,
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

function buildCssVariables(colors: Record<string, string>, typography: { heading: string; body: string }): string {
  return `:root {
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-text: ${colors.text};
  --color-text-secondary: ${adjustOpacity(colors.text, 0.7)};
  --color-text-muted: ${adjustOpacity(colors.text, 0.5)};
  --color-border: ${adjustOpacity(colors.primary, 0.15)};
  --color-border-strong: ${adjustOpacity(colors.primary, 0.3)};
  --font-heading: '${typography.heading}', serif;
  --font-body: '${typography.body}', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --shadow-sm: 0 2px 8px ${adjustOpacity(colors.primary, 0.06)};
  --shadow-md: 0 4px 16px ${adjustOpacity(colors.primary, 0.08)};
  --shadow-lg: 0 8px 32px ${adjustOpacity(colors.primary, 0.1)};
}`;
}

function buildTailwindConfig(colors: Record<string, string>, typography: { heading: string; body: string }): Record<string, unknown> {
  return {
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      'text-primary': colors.text,
    },
    fontFamily: {
      heading: [typography.heading, 'serif'],
      body: [typography.body, 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
    },
  };
}
