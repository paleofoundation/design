import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PaletteColors } from '@/lib/svg/utils';
import {
  type ArtStylePreset,
  generateArtStyle,
  recommendPreset,
  getAllPresets,
  getPresetDescription,
} from '@/lib/assets/art-style';
import { loadDesignProfile } from './shared/load-profile';

export function registerGenerateArtStyleTool(server: McpServer): void {
  server.tool(
    'generate-art-style',
    'Generate an art style manifest from design tokens and a preset. The manifest defines palette, stroke, fill, mood, DALL-E prompt suffix, CSS filters, and SVG attributes — everything downstream tools need to produce visually coherent illustrations, icons, and imagery. Can also recommend a preset based on industry/mood.',
    {
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
      ]).optional().describe('Art style preset. If omitted, one is recommended based on industry/mood.'),
      industry: z.string().optional().describe('Industry keyword for auto-recommendation (e.g. "fintech", "wellness", "saas")'),
      mood: z.string().optional().describe('Mood keyword for auto-recommendation (e.g. "playful", "premium", "technical")'),
    },
    async ({
      projectName, primaryColor, secondaryColor, accentColor, backgroundColor,
      amberColor, lavenderColor, surfaceColor,
      preset, industry, mood,
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
        const manifest = generateArtStyle(resolvedPreset, colors);

        const allPresets = getAllPresets().map(p => ({
          name: p,
          ...getPresetDescription(p),
        }));

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              recommended: !preset,
              artStyle: manifest,
              availablePresets: allPresets,
              instructions: [
                '1. Use the artStyle.promptSuffix when generating images with DALL-E or any AI image model.',
                '2. Use artStyle.palette for all visual assets — illustrations, icons, backgrounds.',
                '3. Apply artStyle.svgAttributes to any programmatic SVG elements.',
                '4. If artStyle.cssFilter is not "none", apply it to generated image containers.',
                '5. Pass this manifest to generate-illustrations for AI-generated visual assets.',
                '6. The mood and usage fields help inform layout and spacing decisions.',
              ],
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Art style generation failed';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    },
  );
}
