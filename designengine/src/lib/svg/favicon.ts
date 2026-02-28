import { getContrastColor, darken } from './utils';

export type FaviconShape = 'rounded-rect' | 'circle' | 'hexagon' | 'squircle';

export interface FaviconOptions {
  primaryColor: string;
  letter: string;
  shape?: FaviconShape;
  accentColor?: string;
}

export interface FaviconPackage {
  svg: string;
  pngs: Record<string, string>;
  webmanifest: string;
  htmlHead: string;
  pngScript: string;
}

function buildShape(shape: FaviconShape, size: number, primary: string, accent?: string): { bg: string; deco: string } {
  const half = size / 2;
  const f = (v: number) => v.toFixed(1);

  switch (shape) {
    case 'circle':
      return {
        bg: `<circle cx="${half}" cy="${half}" r="${half}" fill="${primary}"/>`,
        deco: accent
          ? `<circle cx="${f(size * 0.73)}" cy="${f(size * 0.78)}" r="${f(size * 0.16)}" fill="${accent}" opacity="0.25"/>`
          : '',
      };

    case 'hexagon': {
      const r = half * 0.96;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return `${f(half + r * Math.cos(a))},${f(half + r * Math.sin(a))}`;
      }).join(' ');
      return {
        bg: `<polygon points="${pts}" fill="${primary}"/>`,
        deco: accent
          ? `<polygon points="${Array.from({ length: 6 }, (_, i) => {
              const a = (Math.PI / 3) * i - Math.PI / 2;
              const ir = r * 0.88;
              return `${f(half + ir * Math.cos(a))},${f(half + ir * Math.sin(a))}`;
            }).join(' ')}" fill="none" stroke="${accent}" stroke-width="${f(size * 0.015)}" opacity="0.2"/>`
          : '',
      };
    }

    case 'squircle': {
      const pad = size * 0.01;
      const rx = size * 0.26;
      return {
        bg: `<rect x="${f(pad)}" y="${f(pad)}" width="${f(size - pad * 2)}" height="${f(size - pad * 2)}" rx="${f(rx)}" fill="${primary}"/>`,
        deco: accent
          ? `<rect x="${f(size * 0.05)}" y="${f(size * 0.05)}" width="${f(size * 0.9)}" height="${f(size * 0.9)}" rx="${f(rx * 0.85)}" fill="none" stroke="${accent}" stroke-width="${f(size * 0.018)}" opacity="0.2"/>`
          : '',
      };
    }

    default: {
      const rx = size * 0.2;
      return {
        bg: `<rect width="${size}" height="${size}" rx="${f(rx)}" fill="${primary}"/>`,
        deco: accent
          ? `<rect x="${f(size * 0.04)}" y="${f(size * 0.04)}" width="${f(size * 0.92)}" height="${f(size * 0.92)}" rx="${f(rx * 0.85)}" fill="none" stroke="${accent}" stroke-width="${f(size * 0.015)}" opacity="0.2"/>`
          : '',
      };
    }
  }
}

export function buildFaviconSvg(opts: FaviconOptions, size: number): string {
  const { primaryColor, letter, shape = 'rounded-rect', accentColor } = opts;
  const contrast = getContrastColor(primaryColor);
  const shadow = darken(primaryColor, 0.3);
  const char = letter.charAt(0).toUpperCase();
  const half = size / 2;
  const fontSize = (size * 0.52).toFixed(0);
  const { bg, deco } = buildShape(shape, size, primaryColor, accentColor);
  const font = 'system-ui,-apple-system,Segoe UI,sans-serif';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
    `  ${bg}`,
    deco ? `  ${deco}` : null,
    `  <text x="${half}" y="${half}" text-anchor="middle" dominant-baseline="central"`,
    `    fill="${shadow}" opacity="0.12" font-family="${font}" font-weight="800"`,
    `    font-size="${fontSize}" dx="2" dy="2">${char}</text>`,
    `  <text x="${half}" y="${half}" text-anchor="middle" dominant-baseline="central"`,
    `    fill="${contrast}" font-family="${font}" font-weight="800"`,
    `    font-size="${fontSize}" letter-spacing="-0.03em">${char}</text>`,
    `</svg>`,
  ].filter(Boolean).join('\n');
}

export function generateFaviconSvg(opts: FaviconOptions): string {
  return buildFaviconSvg(opts, 512);
}

export function buildPngScript(): string {
  return `#!/usr/bin/env node
/**
 * Generate PNG favicons from the SVG source.
 * Run: node generate-pngs.mjs
 * Requires: npm install sharp
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(__dirname, 'favicon.svg'));

const targets = [
  { size: 16,  name: 'favicon-16x16.png' },
  { size: 32,  name: 'favicon-32x32.png' },
  { size: 48,  name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'favicon-192x192.png' },
  { size: 512, name: 'favicon-512x512.png' },
];

for (const { size, name } of targets) {
  const buf = await sharp(svg).resize(size, size).png().toBuffer();
  writeFileSync(join(__dirname, name), buf);
  console.log('Generated', name);
}
console.log('Done. All PNG favicons generated.');
`;
}

export function buildWebManifest(opts: { brandName: string; primaryColor: string; backgroundColor?: string }): string {
  return JSON.stringify({
    name: opts.brandName,
    short_name: opts.brandName,
    icons: [
      { src: '/assets/favicon/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/favicon/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: opts.primaryColor,
    background_color: opts.backgroundColor || '#FFFFFF',
    display: 'standalone',
  }, null, 2);
}

export function buildHtmlHeadTags(): string {
  return [
    '<link rel="icon" href="/assets/favicon/favicon.svg" type="image/svg+xml">',
    '<link rel="icon" href="/assets/favicon/favicon-32x32.png" sizes="32x32" type="image/png">',
    '<link rel="icon" href="/assets/favicon/favicon-16x16.png" sizes="16x16" type="image/png">',
    '<link rel="apple-touch-icon" href="/assets/favicon/apple-touch-icon.png">',
    '<link rel="manifest" href="/assets/favicon/site.webmanifest">',
  ].join('\n');
}

export interface IntegrationCode {
  nextjs: string;
  html: string;
  remix: string;
  conflictWarning: string;
  filesToDelete: string[];
  description: string;
}

/**
 * Returns framework-specific code snippets for wiring favicons into a project.
 * Consuming AI agents use these to know exactly what code to add — and what
 * convention files to remove so the custom favicon actually takes effect.
 */
export function buildIntegrationCode(): IntegrationCode {
  return {
    nextjs: `// STEP 1: Delete any convention-based favicon files that override metadata.
// These files MUST be removed or the custom favicon will never appear:
//   - app/favicon.ico  (or src/app/favicon.ico)
//   - app/icon.png     (or src/app/icon.png, app/icon.svg, etc.)
//   - app/apple-icon.png (or src/app/apple-icon.png)
//
// STEP 2: Add to your root layout.tsx metadata export:
import type { Metadata } from "next";

export const metadata: Metadata = {
  // ...your existing metadata
  icons: {
    icon: [
      { url: "/assets/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/assets/favicon/apple-touch-icon.png",
  },
  manifest: "/assets/favicon/site.webmanifest",
};`,
    html: `<!-- Remove any existing <link rel="icon"> or <link rel="shortcut icon"> tags first -->
<!-- Then add inside <head>: -->
<link rel="icon" href="/assets/favicon/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/favicon/favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/favicon/favicon-16x16.png" sizes="16x16" type="image/png">
<link rel="apple-touch-icon" href="/assets/favicon/apple-touch-icon.png">
<link rel="manifest" href="/assets/favicon/site.webmanifest">`,
    remix: `// Remove any existing favicon links first, then add to root.tsx:
export const links: LinksFunction = () => [
  { rel: "icon", href: "/assets/favicon/favicon.svg", type: "image/svg+xml" },
  { rel: "icon", href: "/assets/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
  { rel: "icon", href: "/assets/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
  { rel: "apple-touch-icon", href: "/assets/favicon/apple-touch-icon.png" },
  { rel: "manifest", href: "/assets/favicon/site.webmanifest" },
];`,
    conflictWarning: 'CRITICAL for Next.js App Router: Files named favicon.ico, icon.png, icon.svg, or apple-icon.png in the app/ (or src/app/) directory are convention-based and ALWAYS override metadata.icons. You MUST delete these files or the custom favicon will not appear. This is the #1 reason favicons fail to show up in Next.js projects.',
    filesToDelete: [
      'app/favicon.ico',
      'src/app/favicon.ico',
      'app/icon.png',
      'src/app/icon.png',
      'app/icon.svg',
      'src/app/icon.svg',
      'app/apple-icon.png',
      'src/app/apple-icon.png',
    ],
    description: 'Copy the snippet matching your framework into your project. All favicon files go into public/assets/favicon/. For Next.js: you MUST delete any existing convention favicon files in app/ first.',
  };
}
