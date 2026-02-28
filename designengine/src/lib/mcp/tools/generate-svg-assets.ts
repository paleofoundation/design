import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PaletteColors } from '@/lib/svg/utils';
import { validateAssetPackage } from '@/lib/assets/brand-safety';
import { generatePattern, generateAllPatterns, type PatternType } from '@/lib/svg/patterns';
import { generateDivider, generateAllDividers, type DividerType } from '@/lib/svg/dividers';
import { generateHero, generateAllHeroes, type HeroType } from '@/lib/svg/hero-backgrounds';
import { loadDesignProfile } from './shared/load-profile';

export function registerGenerateSvgAssetsTool(server: McpServer): void {
  server.tool(
    'generate-svg-assets',
    'Generate programmatic SVG assets (background patterns, section dividers, hero backgrounds) from design tokens. All SVGs are palette-coherent, infinitely scalable, and tiny in file size. Returns SVG code and CSS usage instructions.',
    {
      projectName: z.string().optional().describe('Load colors from a stored design profile'),
      primaryColor: z.string().optional().describe('Primary color (hex). Overrides profile if both provided.'),
      secondaryColor: z.string().optional().describe('Secondary color (hex)'),
      accentColor: z.string().optional().describe('Accent color (hex)'),
      backgroundColor: z.string().optional().describe('Background color (hex). Defaults to #FFFFFF.'),
      amberColor: z.string().optional().describe('Warm highlight color (hex). Defaults to #F2B245.'),
      lavenderColor: z.string().optional().describe('Decorative accent color (hex). Defaults to #CAC5F9.'),
      surfaceColor: z.string().optional().describe('Warm surface color (hex). Defaults to #FDFBF7.'),
      assetTypes: z.array(z.enum(['patterns', 'dividers', 'heroes'])).optional()
        .describe('Which asset categories to generate. Defaults to all.'),
      patternTypes: z.array(z.enum(['dots', 'waves', 'grid', 'topographic', 'cross-hatch', 'concentric'])).optional()
        .describe('Specific pattern types. Generates all if omitted.'),
      dividerTypes: z.array(z.enum(['wave', 'curve', 'angle', 'zigzag', 'layered'])).optional()
        .describe('Specific divider types. Generates all if omitted.'),
      heroTypes: z.array(z.enum(['gradient-mesh', 'geometric', 'blob', 'wave-layers'])).optional()
        .describe('Specific hero background types. Generates all if omitted.'),
    },
    async ({
      projectName, primaryColor, secondaryColor, accentColor, backgroundColor,
      amberColor, lavenderColor, surfaceColor,
      assetTypes, patternTypes, dividerTypes, heroTypes,
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
          }
        }

        const categories = assetTypes || ['patterns', 'dividers', 'heroes'];
        const files: Record<string, { content: string; type: string; cssUsage: string }> = {};

        if (categories.includes('patterns')) {
          const patterns = patternTypes
            ? patternTypes.map(t => generatePattern(t as PatternType, colors))
            : generateAllPatterns(colors);
          for (const p of patterns) {
            files[`assets/patterns/${p.type}.svg`] = {
              content: p.svg,
              type: 'svg',
              cssUsage: p.cssUsage,
            };
          }
        }

        if (categories.includes('dividers')) {
          const dividers = dividerTypes
            ? dividerTypes.map(t => generateDivider(t as DividerType, colors))
            : generateAllDividers(colors);
          for (const d of dividers) {
            files[`assets/dividers/${d.type}.svg`] = {
              content: d.svg,
              type: 'svg',
              cssUsage: d.cssUsage,
            };
          }
        }

        if (categories.includes('heroes')) {
          const heroes = heroTypes
            ? heroTypes.map(t => generateHero(t as HeroType, colors))
            : generateAllHeroes(colors);
          for (const h of heroes) {
            files[`assets/backgrounds/${h.type}.svg`] = {
              content: h.svg,
              type: 'svg',
              cssUsage: h.cssUsage,
            };
          }
        }

        const brandCheck = validateAssetPackage(
          Object.fromEntries(
            Object.entries(files).map(([k, v]) => [k, { content: v.content, type: v.type }])
          ),
        );

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              brandSafe: brandCheck.safe,
              brandViolations: brandCheck.totalViolations > 0 ? brandCheck : undefined,
              colorsUsed: colors,
              totalAssets: Object.keys(files).length,
              files,
              instructions: [
                '1. Write each SVG file to the specified path.',
                '2. Reference patterns as CSS background-image (see cssUsage per file).',
                '3. Use dividers as <img> between sections or as CSS backgrounds.',
                '4. Hero backgrounds go behind hero section content.',
                '5. All SVGs use your exact brand colors — no post-processing needed.',
              ],
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'SVG asset generation failed';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    },
  );
}
