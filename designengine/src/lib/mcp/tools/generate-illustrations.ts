import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PaletteColors } from '@/lib/svg/utils';
import {
  type ArtStylePreset,
  type ArtStyleManifest,
  generateArtStyle,
  recommendPreset,
} from '@/lib/assets/art-style';
import { loadDesignProfile } from './shared/load-profile';

type IllustrationSubject =
  | 'hero'
  | 'section-divider'
  | 'feature-icon'
  | 'empty-state'
  | 'onboarding'
  | 'error-page'
  | 'background-pattern';

interface IllustrationSpec {
  subject: IllustrationSubject;
  description: string;
  size: string;
  prompt: string;
}

function buildPrompt(
  subject: IllustrationSubject,
  artStyle: ArtStyleManifest,
  brandName?: string,
): IllustrationSpec {
  const brand = brandName ? `for "${brandName}"` : '';
  const base: Record<IllustrationSubject, { description: string; sizeHint: string; scenePrompt: string }> = {
    'hero': {
      description: 'Main hero illustration — the first visual users see',
      sizeHint: '1792x1024',
      scenePrompt: `a hero section illustration ${brand}, conveying innovation and trust, centered composition with breathing room for overlaid text`,
    },
    'section-divider': {
      description: 'Decorative element between content sections',
      sizeHint: '1792x256',
      scenePrompt: `a wide horizontal decorative divider ${brand}, abstract and subtle, meant to separate content sections without competing for attention`,
    },
    'feature-icon': {
      description: 'Icon-style illustration for feature/benefit blocks',
      sizeHint: '512x512',
      scenePrompt: `a simple iconic illustration ${brand}, representing a product feature, centered on a transparent or white background, single concept`,
    },
    'empty-state': {
      description: 'Illustration for empty/zero-data states in the app',
      sizeHint: '512x512',
      scenePrompt: `a friendly empty state illustration ${brand}, conveying "nothing here yet" in an encouraging way, centered composition`,
    },
    'onboarding': {
      description: 'Welcome/onboarding illustration',
      sizeHint: '1024x1024',
      scenePrompt: `a welcoming onboarding illustration ${brand}, conveying getting started and possibility, warm and inviting`,
    },
    'error-page': {
      description: 'Illustration for 404/error pages',
      sizeHint: '512x512',
      scenePrompt: `a lighthearted error page illustration ${brand}, conveying "something went wrong" without being alarming, with character`,
    },
    'background-pattern': {
      description: 'Tileable background pattern or texture',
      sizeHint: '512x512',
      scenePrompt: `a seamless tileable background pattern ${brand}, subtle and non-distracting, suitable for use behind text content`,
    },
  };

  const spec = base[subject];

  const fullPrompt = [
    spec.scenePrompt,
    artStyle.promptSuffix,
    `Style: ${artStyle.mood}.`,
    artStyle.fill === 'none' ? 'No fills, outline only.' : '',
    'No text or words in the image.',
  ].filter(Boolean).join('. ');

  return {
    subject,
    description: spec.description,
    size: spec.sizeHint,
    prompt: fullPrompt,
  };
}

async function callDallE(
  prompt: string,
  size: '1024x1024' | '1792x1024' | '1024x1792',
): Promise<{ url: string } | { error: string }> {
  try {
    const { openai } = await import('@/lib/openai/client');
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'standard',
      response_format: 'url',
    });

    const url = response.data?.[0]?.url;
    if (!url) return { error: 'No image URL returned from DALL-E' };
    return { url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'DALL-E call failed';
    return { error: msg };
  }
}

function normalizeDallESize(sizeHint: string): '1024x1024' | '1792x1024' | '1024x1792' {
  if (sizeHint.startsWith('1792x')) return '1792x1024';
  if (sizeHint.endsWith('x1792')) return '1024x1792';
  return '1024x1024';
}

export function registerGenerateIllustrationsTool(server: McpServer): void {
  server.tool(
    'generate-illustrations',
    'Generate AI illustrations using DALL-E 3, guided by an art style manifest from design tokens. Produces brand-coherent hero images, feature icons, empty states, error pages, and more. If no OpenAI key is available, returns ready-to-use prompts instead.',
    {
      brandName: z.string().optional().describe('Brand name for context in prompts'),
      projectName: z.string().optional().describe('Load tokens from a stored design profile'),
      primaryColor: z.string().optional().describe('Primary brand color (hex)'),
      secondaryColor: z.string().optional().describe('Secondary color (hex)'),
      accentColor: z.string().optional().describe('Accent color (hex)'),
      backgroundColor: z.string().optional().describe('Background color (hex)'),
      amberColor: z.string().optional().describe('Warm highlight color (hex)'),
      lavenderColor: z.string().optional().describe('Decorative accent color (hex)'),
      surfaceColor: z.string().optional().describe('Warm surface color (hex)'),
      preset: z.enum([
        'line-art', 'flat-vector', 'watercolor',
        'isometric', 'abstract-geometric', 'photo-overlay',
      ]).optional().describe('Art style preset. Auto-recommended if omitted.'),
      industry: z.string().optional().describe('Industry for auto-recommendation'),
      mood: z.string().optional().describe('Mood for auto-recommendation'),
      subjects: z.array(z.enum([
        'hero', 'section-divider', 'feature-icon', 'empty-state',
        'onboarding', 'error-page', 'background-pattern',
      ])).optional().describe('Which illustration types to generate. Defaults to hero + feature-icon + empty-state.'),
      generateImages: z.boolean().optional().default(false)
        .describe('If true, actually call DALL-E 3 to generate images. If false (default), return prompts only.'),
    },
    async ({
      brandName, projectName,
      primaryColor, secondaryColor, accentColor, backgroundColor,
      amberColor, lavenderColor, surfaceColor,
      preset, industry, mood,
      subjects, generateImages,
    }) => {
      try {
        let colors: PaletteColors = {
          primary: primaryColor || '#306E5E',
          secondary: secondaryColor || '#4A8E7A',
          accent: accentColor || '#FF6719',
          background: backgroundColor || '#FFFFFF',
          amber: amberColor,
          lavender: lavenderColor,
          surface: surfaceColor,
        };

        let profileArtStyle: ArtStylePreset | undefined;
        let profileMood: string | undefined;

        if (projectName) {
          const profile = await loadDesignProfile(projectName);
          if (profile?.tokens) {
            const tc = profile.tokens.colors as Record<string, unknown> | undefined;
            if (tc) {
              colors = {
                primary: (primaryColor || tc.primary as string) || colors.primary,
                secondary: (secondaryColor || tc.secondary as string) || colors.secondary,
                accent: (accentColor || tc.accent as string) || colors.accent,
                background: (backgroundColor || tc.background as string) || colors.background,
                amber: amberColor || (tc.amber as string) || colors.amber,
                lavender: lavenderColor || (tc.lavender as string) || colors.lavender,
                surface: surfaceColor || (tc.surface as string) || colors.surface,
              };
            }
            profileArtStyle = profile.tokens.artStyle as ArtStylePreset | undefined;
            profileMood = profile.tokens.mood as string | undefined;
          }
        }

        const resolvedPreset: ArtStylePreset = preset ?? profileArtStyle ?? recommendPreset(industry, mood || profileMood);
        const artStyle = generateArtStyle(resolvedPreset, colors);

        const targetSubjects = subjects ?? ['hero', 'feature-icon', 'empty-state'];
        const specs = targetSubjects.map(s =>
          buildPrompt(s as IllustrationSubject, artStyle, brandName),
        );

        interface IllustrationOutput {
          subject: string;
          description: string;
          prompt: string;
          suggestedSize: string;
          imageUrl?: string;
          error?: string;
        }

        const illustrations: IllustrationOutput[] = [];

        if (generateImages) {
          for (const spec of specs) {
            const size = normalizeDallESize(spec.size);
            const result = await callDallE(spec.prompt, size);
            illustrations.push({
              subject: spec.subject,
              description: spec.description,
              prompt: spec.prompt,
              suggestedSize: spec.size,
              ...('url' in result
                ? { imageUrl: result.url }
                : { error: result.error }),
            });
          }
        } else {
          for (const spec of specs) {
            illustrations.push({
              subject: spec.subject,
              description: spec.description,
              prompt: spec.prompt,
              suggestedSize: spec.size,
            });
          }
        }

        const hasImages = illustrations.some(i => i.imageUrl);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              artStyle: {
                preset: artStyle.preset,
                mood: artStyle.mood,
                palette: artStyle.palette,
              },
              imagesGenerated: hasImages,
              illustrations,
              instructions: generateImages
                ? [
                    '1. Download images from the provided URLs (they expire in ~1 hour).',
                    '2. Save to assets/images/ with descriptive names (e.g. hero-illustration.png).',
                    '3. Optimize images for web (compress, serve WebP where supported).',
                    '4. The art style ensures visual coherence — all images share the same palette and mood.',
                    '5. For hero images, position behind text content with appropriate overlay if needed.',
                  ]
                : [
                    '1. Use the provided prompts with DALL-E 3, Midjourney, or any AI image generator.',
                    '2. The prompts are pre-loaded with brand colors and art style — paste directly.',
                    '3. Recommended: use DALL-E 3 with quality="standard" for consistent results.',
                    '4. Save generated images to assets/images/.',
                    '5. Or re-run this tool with generateImages=true to have dzyn call DALL-E directly.',
                    '6. For programmatic alternatives, use generate-svg-assets for patterns/dividers/heroes.',
                  ],
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Illustration generation failed';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    },
  );
}
