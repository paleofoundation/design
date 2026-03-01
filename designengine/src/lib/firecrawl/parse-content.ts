import { parse, type HTMLElement } from 'node-html-parser';

export interface SiteContent {
  logo: string;
  heroImage: string;
  siteImages: string[];
  navItems: string[];
  headline: string;
  description: string;
}

const TINY_IMAGE_RE = /1x1|spacer|pixel|blank|transparent|tracking|beacon/i;
const ICON_EXTENSIONS = /\.(ico|svg)(\?|$)/i;

function resolveUrl(src: string, baseUrl: string): string {
  if (!src || src.startsWith('data:')) return src;
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return src;
  }
}

function isContentImage(src: string): boolean {
  if (!src || src.startsWith('data:')) return false;
  if (TINY_IMAGE_RE.test(src)) return false;
  if (ICON_EXTENSIONS.test(src)) return false;
  return true;
}

function textOf(el: HTMLElement | null): string {
  if (!el) return '';
  return el.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

/**
 * Parse structural content from raw HTML for use in the live preview.
 * Extracts nav items, headline, description, hero image, and all content images.
 */
export function parseContentFromHtml(
  html: string,
  baseUrl: string,
): SiteContent {
  const root = parse(html, { comment: false });

  // --- Nav items ---
  const navItems: string[] = [];
  const navEl = root.querySelector('nav') ?? root.querySelector('header');
  if (navEl) {
    const links = navEl.querySelectorAll('a');
    for (const a of links) {
      const text = textOf(a);
      if (text && text.length < 40 && !text.startsWith('http')) {
        navItems.push(text);
      }
      if (navItems.length >= 6) break;
    }
  }

  // --- Headline (first h1, fall back to h2) ---
  const h1 = root.querySelector('h1');
  const h2 = root.querySelector('h2');
  const headline = textOf(h1) || textOf(h2) || '';

  // --- Description: first <p> after h1, or meta description ---
  let description = '';
  if (h1) {
    let sibling = h1.nextElementSibling;
    while (sibling) {
      if (sibling.tagName === 'P') {
        description = textOf(sibling as HTMLElement);
        break;
      }
      sibling = sibling.nextElementSibling;
    }
  }
  if (!description) {
    const metaDesc =
      root.querySelector('meta[name="description"]') ??
      root.querySelector('meta[property="og:description"]');
    description = metaDesc?.getAttribute('content')?.trim() ?? '';
  }

  // --- Logo ---
  let logo = '';
  const ogImage = root
    .querySelector('meta[property="og:image"]')
    ?.getAttribute('content');

  // Look for logo in common patterns
  const logoSelectors = [
    'a.logo img',
    '.logo img',
    '#logo img',
    'header img[alt*="logo" i]',
    'nav img',
    'header a:first-child img',
  ];
  for (const sel of logoSelectors) {
    const el = root.querySelector(sel);
    if (el) {
      const src = el.getAttribute('src') ?? '';
      if (src) {
        logo = resolveUrl(src, baseUrl);
        break;
      }
    }
  }
  // Fall back: first <img> whose alt/class/id contains "logo"
  if (!logo) {
    const allImgs = root.querySelectorAll('img');
    for (const img of allImgs) {
      const alt = (img.getAttribute('alt') ?? '').toLowerCase();
      const cls = (img.getAttribute('class') ?? '').toLowerCase();
      const id = (img.getAttribute('id') ?? '').toLowerCase();
      if (alt.includes('logo') || cls.includes('logo') || id.includes('logo')) {
        const src = img.getAttribute('src') ?? '';
        if (src) {
          logo = resolveUrl(src, baseUrl);
          break;
        }
      }
    }
  }

  // --- Hero image: OG image, or first large img in the page ---
  let heroImage = ogImage ? resolveUrl(ogImage, baseUrl) : '';

  // --- All content images ---
  const seen = new Set<string>();
  const siteImages: string[] = [];
  const allImgs = root.querySelectorAll('img');
  for (const img of allImgs) {
    const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
    if (!isContentImage(src)) continue;
    const resolved = resolveUrl(src, baseUrl);
    if (resolved === logo) continue;
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    siteImages.push(resolved);
  }

  // If no OG hero, use the first content image
  if (!heroImage && siteImages.length > 0) {
    heroImage = siteImages[0];
  }

  return {
    logo,
    heroImage,
    siteImages: siteImages.slice(0, 12),
    navItems,
    headline: headline.slice(0, 200),
    description: description.slice(0, 500),
  };
}
