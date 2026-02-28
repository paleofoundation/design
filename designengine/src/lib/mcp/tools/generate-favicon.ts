import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { type FaviconShape } from '@/lib/svg/favicon';
import { generateFaviconPackage } from '@/lib/svg/favicon-package';
import { loadDesignProfile } from './shared/load-profile';

export function registerGenerateFaviconTool(server: McpServer): void {
  server.tool(
    'generate-favicon',
    'Generate a complete favicon package from design tokens: SVG favicon, PNG variants (if sharp is available), Apple Touch Icon, site.webmanifest, and HTML head tags. Produces brand-consistent favicons that immediately differentiate from default AI-generated sites.',
    {
      brandName: z.string().describe('Brand or project name (first letter is used for the favicon, full name for the webmanifest)'),
      projectName: z.string().optional().describe('Load design tokens from a stored profile. If omitted, you must provide primaryColor.'),
      primaryColor: z.string().optional().describe('Primary brand color (hex). Overrides profile token if both provided.'),
      accentColor: z.string().optional().describe('Accent color for subtle decorative detail (hex). Optional.'),
      backgroundColor: z.string().optional().describe('Background color for webmanifest (hex). Defaults to #FFFFFF.'),
      shape: z.enum(['rounded-rect', 'circle', 'hexagon', 'squircle']).optional().default('rounded-rect')
        .describe('Favicon shape. rounded-rect is most versatile; squircle matches iOS; circle for minimal brands.'),
    },
    async ({ brandName, projectName, primaryColor, accentColor, backgroundColor, shape }) => {
      try {
        let resolvedPrimary = primaryColor;
        let resolvedAccent = accentColor;
        let resolvedBg = backgroundColor;

        if (projectName) {
          const profile = await loadDesignProfile(projectName);
          if (profile?.tokens) {
            const colors = profile.tokens.colors as Record<string, unknown> | undefined;
            if (colors) {
              if (!resolvedPrimary && typeof colors.primary === 'string') resolvedPrimary = colors.primary;
              if (!resolvedAccent && typeof colors.accent === 'string') resolvedAccent = colors.accent;
              if (!resolvedBg && typeof colors.background === 'string') resolvedBg = colors.background;
            }
          }
        }

        if (!resolvedPrimary) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                error: 'No primary color available. Either provide primaryColor or a projectName with a stored profile.',
              }),
            }],
            isError: true,
          };
        }

        const pkg = await generateFaviconPackage({
          primaryColor: resolvedPrimary,
          letter: brandName,
          shape: shape as FaviconShape,
          accentColor: resolvedAccent,
          brandName,
          backgroundColor: resolvedBg,
        });

        const hasPngs = Object.keys(pkg.pngs).length > 0;

        const files: Record<string, { content: string; encoding: string }> = {
          'assets/favicon/favicon.svg': { content: pkg.svg, encoding: 'utf-8' },
          'assets/favicon/site.webmanifest': { content: pkg.webmanifest, encoding: 'utf-8' },
        };

        if (hasPngs) {
          for (const [name, data] of Object.entries(pkg.pngs)) {
            files[`assets/favicon/${name}`] = { content: data, encoding: 'base64' };
          }
        } else {
          files['assets/favicon/generate-pngs.mjs'] = { content: pkg.pngScript, encoding: 'utf-8' };
        }

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              brandName,
              shape,
              primaryColor: resolvedPrimary,
              pngsGenerated: hasPngs,
              pngNote: hasPngs
                ? 'PNG favicons included as base64. Decode and write as binary files.'
                : 'sharp not available. Run assets/favicon/generate-pngs.mjs after installing sharp to generate PNGs.',
              files,
              htmlHead: pkg.htmlHead,
              instructions: [
                '1. Write each file to the specified path in your project.',
                hasPngs
                  ? '2. PNG files are base64-encoded — decode to binary when writing.'
                  : '2. Run `cd assets/favicon && npm install sharp && node generate-pngs.mjs` to generate PNGs.',
                '3. Add the htmlHead tags to your <head> element.',
                '4. The SVG favicon works in all modern browsers immediately.',
              ],
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Favicon generation failed';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    },
  );
}
