import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PaletteColors } from '@/lib/svg/utils';
import { validateAssetPackage } from '@/lib/assets/brand-safety';
import {
  generateAllAnimations,
  generateCursorFollower,
  generateButtonStates,
  generateScrollReveal,
  generateLoadingSpinner,
  generateGlowPulse,
  type AnimationResult,
} from '@/lib/assets/animations';
import { loadDesignProfile } from './shared/load-profile';

const ANIMATION_NAMES = [
  'cursor-follower',
  'button-states',
  'scroll-reveal',
  'loading-spinner',
  'glow-pulse',
] as const;

type AnimationName = (typeof ANIMATION_NAMES)[number];

const GENERATORS: Record<AnimationName, (c: PaletteColors) => AnimationResult> = {
  'cursor-follower': generateCursorFollower,
  'button-states': generateButtonStates,
  'scroll-reveal': generateScrollReveal,
  'loading-spinner': generateLoadingSpinner,
  'glow-pulse': generateGlowPulse,
};

export function registerGenerateMicroInteractionsTool(server: McpServer): void {
  server.tool(
    'generate-micro-interactions',
    'Generate brand-themed micro-interaction CSS and JS modules: cursor follower, button hover effects, scroll reveals, loading spinners, and glow pulses. Each module respects prefers-reduced-motion and uses design token CSS variables. Select specific interactions or generate all.',
    {
      projectName: z.string().optional().describe('Load tokens from a stored design profile'),
      primaryColor: z.string().optional().describe('Primary color (hex)'),
      secondaryColor: z.string().optional().describe('Secondary color (hex)'),
      accentColor: z.string().optional().describe('Accent color (hex)'),
      backgroundColor: z.string().optional().describe('Background color (hex)'),
      amberColor: z.string().optional().describe('Warm highlight color (hex)'),
      lavenderColor: z.string().optional().describe('Decorative accent color (hex)'),
      surfaceColor: z.string().optional().describe('Warm surface color (hex)'),
      interactions: z.array(z.enum([
        'cursor-follower', 'button-states', 'scroll-reveal',
        'loading-spinner', 'glow-pulse',
      ])).optional().describe('Specific interactions to generate. Generates all 5 if omitted.'),
    },
    async ({
      projectName, primaryColor, secondaryColor, accentColor, backgroundColor,
      amberColor, lavenderColor, surfaceColor,
      interactions,
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

        let results: AnimationResult[];
        if (interactions && interactions.length > 0) {
          results = interactions.map(name => GENERATORS[name as AnimationName](colors));
        } else {
          results = generateAllAnimations(colors);
        }

        const files: Record<string, { content: string; encoding: string; type: string }> = {};
        const cssImports: string[] = [];
        const jsImports: string[] = [];

        for (const anim of results) {
          for (const [filename, file] of Object.entries(anim.files)) {
            const path = `assets/animations/${filename}`;
            files[path] = { content: file.content, encoding: 'utf-8', type: file.type };
            if (file.type === 'css') cssImports.push(path);
            if (file.type === 'js') jsImports.push(path);
          }
        }

        const brandCheck = validateAssetPackage(files);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              brandSafe: brandCheck.safe,
              brandViolations: brandCheck.totalViolations > 0 ? brandCheck : undefined,
              colorsUsed: colors,
              generated: results.map(r => ({ name: r.name, description: r.description })),
              totalFiles: Object.keys(files).length,
              files,
              cssImports,
              jsImports,
              instructions: [
                '1. Write each file to the specified path under your public/ directory.',
                '2. Import CSS files into your global stylesheet or <head>.',
                '3. Include JS files before </body> or import as ES modules.',
                '4. All animations respect prefers-reduced-motion automatically.',
                '5. CSS uses design token variables with hardcoded fallbacks — works with or without a CSS variable setup.',
                '6. cursor-follower: add class "dzyn-cursor" is auto-created; no markup needed.',
                '7. button-states: add classes like "dzyn-btn dzyn-btn--glow" to buttons.',
                '8. scroll-reveal: add class "dzyn-reveal" to elements; JS handles observation.',
                '9. loading-spinner: add class "dzyn-spinner" to a container element.',
                '10. glow-pulse: add class "dzyn-glow" to any element for hover glow effect.',
              ],
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Micro-interaction generation failed';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    },
  );
}
