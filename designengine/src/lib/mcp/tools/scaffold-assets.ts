import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PaletteColors } from '@/lib/svg/utils';
import { type FaviconShape, buildIntegrationCode } from '@/lib/svg/favicon';
import { generateFaviconPackage } from '@/lib/svg/favicon-package';
import { generateAllPatterns } from '@/lib/svg/patterns';
import { generateAllDividers } from '@/lib/svg/dividers';
import { generateAllHeroes } from '@/lib/svg/hero-backgrounds';
import { generateAllAnimations } from '@/lib/assets/animations';
import {
  type ArtStylePreset,
  generateArtStyle,
  recommendPreset,
} from '@/lib/assets/art-style';
import { buildManifest, type AssetEntry } from '@/lib/assets/manifest';
import { validateAssetPackage } from '@/lib/assets/brand-safety';
import { loadDesignProfile } from './shared/load-profile';

export function registerScaffoldAssetsTool(server: McpServer): void {
  server.tool(
    'scaffold-assets',
    'Generate a complete, brand-consistent asset package: favicons, SVG patterns, section dividers, hero backgrounds, micro-interaction CSS/JS, and an assets.json manifest. This is the all-in-one tool that makes a site feel custom-built instead of AI-generated.',
    {
      brandName: z.string().describe('Brand or project name (used for favicon letter and webmanifest)'),
      projectName: z.string().optional().describe('Load design tokens from a stored profile'),
      primaryColor: z.string().optional().describe('Override primary color (hex)'),
      secondaryColor: z.string().optional().describe('Override secondary color (hex)'),
      accentColor: z.string().optional().describe('Override accent color (hex)'),
      backgroundColor: z.string().optional().describe('Override background color (hex)'),
      amberColor: z.string().optional().describe('Warm highlight color (hex). Defaults to #F2B245.'),
      lavenderColor: z.string().optional().describe('Decorative accent color (hex). Defaults to #CAC5F9.'),
      surfaceColor: z.string().optional().describe('Warm surface color (hex). Defaults to #FDFBF7.'),
      faviconShape: z.enum(['rounded-rect', 'circle', 'hexagon', 'squircle']).optional().default('rounded-rect')
        .describe('Favicon shape'),
      artStylePreset: z.enum([
        'line-art', 'flat-vector', 'watercolor',
        'isometric', 'abstract-geometric', 'photo-overlay',
      ]).optional().describe('Art style preset for illustrations. Auto-recommended if omitted.'),
      industry: z.string().optional().describe('Industry keyword for art style auto-recommendation'),
      mood: z.string().optional().describe('Mood keyword for art style auto-recommendation'),
      includeAnimations: z.boolean().optional().default(true)
        .describe('Include micro-interaction CSS/JS (cursor follower, button states, scroll reveal, etc.)'),
      includePatterns: z.boolean().optional().default(true)
        .describe('Include tileable background patterns'),
      includeDividers: z.boolean().optional().default(true)
        .describe('Include section divider SVGs'),
      includeHeroes: z.boolean().optional().default(true)
        .describe('Include hero background SVGs'),
      includeArtStyle: z.boolean().optional().default(true)
        .describe('Include art style manifest for downstream illustration generation'),
      includeIllustrationPrompts: z.boolean().optional().default(true)
        .describe('Include DALL-E prompts for hero, feature icon, and empty state illustrations'),
    },
    async ({
      brandName, projectName,
      primaryColor, secondaryColor, accentColor, backgroundColor,
      amberColor, lavenderColor, surfaceColor,
      faviconShape, artStylePreset, industry, mood,
      includeAnimations, includePatterns, includeDividers, includeHeroes,
      includeArtStyle, includeIllustrationPrompts,
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

        const files: Record<string, { content: string; encoding: string }> = {};
        const manifestEntries: AssetEntry[] = [];

        // --- Favicon ---
        const faviconPkg = await generateFaviconPackage({
          primaryColor: colors.primary,
          letter: brandName,
          shape: faviconShape as FaviconShape,
          accentColor: colors.accent,
          brandName,
          backgroundColor: colors.background,
        });

        files['assets/favicon/favicon.svg'] = { content: faviconPkg.svg, encoding: 'utf-8' };
        files['assets/favicon/site.webmanifest'] = { content: faviconPkg.webmanifest, encoding: 'utf-8' };
        manifestEntries.push(
          { path: 'assets/favicon/favicon.svg', type: 'svg', category: 'favicon', description: 'SVG favicon', encoding: 'utf-8' },
          { path: 'assets/favicon/site.webmanifest', type: 'json', category: 'favicon', description: 'Web app manifest', encoding: 'utf-8' },
        );

        const hasPngs = Object.keys(faviconPkg.pngs).length > 0;
        if (hasPngs) {
          for (const [name, data] of Object.entries(faviconPkg.pngs)) {
            files[`assets/favicon/${name}`] = { content: data, encoding: 'base64' };
            manifestEntries.push({
              path: `assets/favicon/${name}`, type: 'png', category: 'favicon',
              description: `PNG favicon ${name}`, encoding: 'base64',
            });
          }
        } else {
          files['assets/favicon/generate-pngs.mjs'] = { content: faviconPkg.pngScript, encoding: 'utf-8' };
          manifestEntries.push({
            path: 'assets/favicon/generate-pngs.mjs', type: 'js', category: 'favicon',
            description: 'Script to generate PNG favicons from SVG (requires sharp)', encoding: 'utf-8',
          });
        }

        // --- Patterns ---
        if (includePatterns) {
          for (const p of generateAllPatterns(colors)) {
            const path = `assets/patterns/${p.type}.svg`;
            files[path] = { content: p.svg, encoding: 'utf-8' };
            manifestEntries.push({
              path, type: 'svg', category: 'pattern',
              description: `${p.type} background pattern`, encoding: 'utf-8',
              usage: p.cssUsage,
            });
          }
        }

        // --- Dividers ---
        if (includeDividers) {
          for (const d of generateAllDividers(colors)) {
            const path = `assets/dividers/${d.type}.svg`;
            files[path] = { content: d.svg, encoding: 'utf-8' };
            manifestEntries.push({
              path, type: 'svg', category: 'divider',
              description: `${d.type} section divider`, encoding: 'utf-8',
              usage: d.cssUsage,
            });
          }
        }

        // --- Hero Backgrounds ---
        if (includeHeroes) {
          for (const h of generateAllHeroes(colors)) {
            const path = `assets/backgrounds/${h.type}.svg`;
            files[path] = { content: h.svg, encoding: 'utf-8' };
            manifestEntries.push({
              path, type: 'svg', category: 'hero',
              description: `${h.type} hero background`, encoding: 'utf-8',
              usage: h.cssUsage,
            });
          }
        }

        // --- Animations ---
        if (includeAnimations) {
          for (const anim of generateAllAnimations(colors)) {
            for (const [filename, file] of Object.entries(anim.files)) {
              const path = `assets/animations/${filename}`;
              files[path] = { content: file.content, encoding: 'utf-8' };
              manifestEntries.push({
                path, type: file.type, category: 'animation',
                description: anim.description, encoding: 'utf-8',
              });
            }
          }
        }

        // --- Art Style (Layer 2) ---
        const resolvedPreset: ArtStylePreset = artStylePreset ?? recommendPreset(industry, mood);
        const artStyle = includeArtStyle
          ? generateArtStyle(resolvedPreset, colors)
          : null;

        if (artStyle) {
          files['assets/art-style.json'] = {
            content: JSON.stringify(artStyle, null, 2),
            encoding: 'utf-8',
          };
          manifestEntries.push({
            path: 'assets/art-style.json', type: 'json', category: 'art-style',
            description: `Art style manifest (${artStyle.preset})`, encoding: 'utf-8',
          });
        }

        // --- Illustration Prompts (Layer 4) ---
        interface IllustrationPrompt {
          subject: string;
          description: string;
          prompt: string;
          suggestedSize: string;
        }
        let illustrationPrompts: IllustrationPrompt[] | null = null;
        if (includeIllustrationPrompts && artStyle) {
          const subjects = ['hero', 'feature-icon', 'empty-state', 'error-page'] as const;
          illustrationPrompts = subjects.map(subject => {
            const sceneMap: Record<string, { desc: string; size: string; scene: string }> = {
              'hero': {
                desc: 'Main hero illustration',
                size: '1792x1024',
                scene: `a hero section illustration for "${brandName}", conveying innovation and trust, centered composition with breathing room for overlaid text`,
              },
              'feature-icon': {
                desc: 'Feature/benefit icon illustration',
                size: '512x512',
                scene: `a simple iconic illustration for "${brandName}", representing a product feature, centered on a white background`,
              },
              'empty-state': {
                desc: 'Empty/zero-data state illustration',
                size: '512x512',
                scene: `a friendly empty state illustration for "${brandName}", conveying "nothing here yet" in an encouraging way`,
              },
              'error-page': {
                desc: '404/error page illustration',
                size: '512x512',
                scene: `a lighthearted error page illustration for "${brandName}", conveying "something went wrong" without being alarming`,
              },
            };
            const spec = sceneMap[subject];
            const prompt = [
              spec.scene,
              artStyle.promptSuffix,
              `Style: ${artStyle.mood}.`,
              'No text or words in the image.',
            ].join('. ');
            return { subject, description: spec.desc, prompt, suggestedSize: spec.size };
          });

          files['assets/illustration-prompts.json'] = {
            content: JSON.stringify(illustrationPrompts, null, 2),
            encoding: 'utf-8',
          };
          manifestEntries.push({
            path: 'assets/illustration-prompts.json', type: 'json', category: 'illustration',
            description: 'DALL-E prompts for brand-coherent illustrations', encoding: 'utf-8',
          });
        }

        // --- Manifest ---
        const manifest = buildManifest({
          projectName: brandName,
          colors,
          files: manifestEntries,
          htmlHead: faviconPkg.htmlHead,
        });
        files['assets/assets.json'] = { content: JSON.stringify(manifest, null, 2), encoding: 'utf-8' };

        const integrationCode = buildIntegrationCode();

        const brandCheck = validateAssetPackage(files);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              brandSafe: brandCheck.safe,
              brandViolations: brandCheck.totalViolations > 0 ? {
                errors: brandCheck.errors,
                warnings: brandCheck.warnings,
                details: brandCheck.fileResults,
              } : undefined,
              brandName,
              colorsUsed: colors,
              faviconShape,
              artStylePreset: resolvedPreset,
              pngsGenerated: hasPngs,
              totalFiles: Object.keys(files).length,
              breakdown: {
                favicon: manifestEntries.filter(e => e.category === 'favicon').length,
                patterns: manifestEntries.filter(e => e.category === 'pattern').length,
                dividers: manifestEntries.filter(e => e.category === 'divider').length,
                heroes: manifestEntries.filter(e => e.category === 'hero').length,
                animations: manifestEntries.filter(e => e.category === 'animation').length,
                artStyle: artStyle ? 1 : 0,
                illustrationPrompts: illustrationPrompts?.length ?? 0,
              },
              files,
              htmlHead: faviconPkg.htmlHead,
              integrationCode,
              artStyle: artStyle ?? undefined,
              illustrationPrompts: illustrationPrompts ?? undefined,
              cssImports: manifest.cssImports,
              instructions: [
                '1. Write each file to the specified path relative to your project\'s public/ directory.',
                '2. Files with encoding "base64" are binary — decode before writing.',
                '3. CRITICAL (Next.js only): DELETE any existing favicon convention files in app/ or src/app/ — these override metadata.icons and will prevent the custom favicon from appearing. Check for and remove: favicon.ico, icon.png, icon.svg, apple-icon.png.',
                '4. Wire the favicon into the project layout using the integrationCode snippet for your framework.',
                '5. For Next.js App Router: add the icons and manifest fields to the metadata export in layout.tsx.',
                '6. For plain HTML or Vite: paste the HTML head tags inside <head>.',
                '7. For Remix: add the links to the root.tsx links export.',
                '8. Import the CSS files listed in cssImports into your global stylesheet.',
                '9. Include the JS animation files before </body> or import as modules.',
                '10. assets/art-style.json defines the visual language — use it for any custom illustrations.',
                '11. Use the illustration prompts (or call generate-illustrations) with DALL-E 3 for brand-coherent AI imagery.',
                '12. assets/assets.json is the manifest — it tells other tools what assets are available.',
                hasPngs
                  ? '13. PNG favicons are ready to use.'
                  : '13. Run `cd assets/favicon && npm install sharp && node generate-pngs.mjs` for PNG favicons.',
              ],
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Asset scaffolding failed';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    },
  );
}
