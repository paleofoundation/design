import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PaletteColors } from '@/lib/svg/utils';
import { type FaviconShape, buildIntegrationCode } from '@/lib/svg/favicon';
import { generateFaviconPackage } from '@/lib/svg/favicon-package';
import { generateAllPatterns } from '@/lib/svg/patterns';
import { generateAllDividers } from '@/lib/svg/dividers';
import { generateAllHeroes } from '@/lib/svg/hero-backgrounds';
import { generateAllAnimations } from '@/lib/assets/animations';
import { buildManifest, type AssetEntry } from '@/lib/assets/manifest';
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
      includeAnimations: z.boolean().optional().default(true)
        .describe('Include micro-interaction CSS/JS (cursor follower, button states, scroll reveal, etc.)'),
      includePatterns: z.boolean().optional().default(true)
        .describe('Include tileable background patterns'),
      includeDividers: z.boolean().optional().default(true)
        .describe('Include section divider SVGs'),
      includeHeroes: z.boolean().optional().default(true)
        .describe('Include hero background SVGs'),
    },
    async ({
      brandName, projectName,
      primaryColor, secondaryColor, accentColor, backgroundColor,
      amberColor, lavenderColor, surfaceColor,
      faviconShape, includeAnimations, includePatterns, includeDividers, includeHeroes,
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

        // --- Manifest ---
        const manifest = buildManifest({
          projectName: brandName,
          colors,
          files: manifestEntries,
          htmlHead: faviconPkg.htmlHead,
        });
        files['assets/assets.json'] = { content: JSON.stringify(manifest, null, 2), encoding: 'utf-8' };

        const integrationCode = buildIntegrationCode();

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              brandName,
              colorsUsed: colors,
              faviconShape,
              pngsGenerated: hasPngs,
              totalFiles: Object.keys(files).length,
              breakdown: {
                favicon: manifestEntries.filter(e => e.category === 'favicon').length,
                patterns: manifestEntries.filter(e => e.category === 'pattern').length,
                dividers: manifestEntries.filter(e => e.category === 'divider').length,
                heroes: manifestEntries.filter(e => e.category === 'hero').length,
                animations: manifestEntries.filter(e => e.category === 'animation').length,
              },
              files,
              htmlHead: faviconPkg.htmlHead,
              integrationCode,
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
                '10. assets/assets.json is the manifest — it tells other tools what assets are available.',
                hasPngs
                  ? '11. PNG favicons are ready to use.'
                  : '11. Run `cd assets/favicon && npm install sharp && node generate-pngs.mjs` for PNG favicons.',
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
