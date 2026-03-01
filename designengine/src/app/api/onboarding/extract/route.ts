import { NextRequest, NextResponse } from 'next/server';
import { ingestDesignFromUrl } from '@/lib/firecrawl/ingest';
import { openai } from '@/lib/openai/client';
import type { FirecrawlBrandingResponse } from '@/lib/firecrawl/client';

interface DetectedColor {
  hex: string;
  name: string;
  usage: string;
}

interface DetectedFont {
  family: string;
  source: 'google-fonts' | 'typekit' | 'font-face' | 'css-declaration' | 'css-variable' | 'firecrawl';
}

// ---------------------------------------------------------------------------
// Deterministic font extraction from HTML
// ---------------------------------------------------------------------------

function extractFontsFromHtml(html: string): DetectedFont[] {
  const fonts: DetectedFont[] = [];
  const seen = new Set<string>();

  function add(family: string, source: DetectedFont['source']) {
    const cleaned = family.replace(/['"]+/g, '').trim();
    if (!cleaned || cleaned.length < 2) return;
    const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-sans-serif|ui-serif|ui-monospace|inherit|initial|unset)$/i;
    if (generic.test(cleaned)) return;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    fonts.push({ family: cleaned, source });
  }

  // Google Fonts <link> tags: fonts.googleapis.com/css2?family=Name+Here:wght@...
  const googleFontsRe = /fonts\.googleapis\.com\/css2?\?[^"'>\s]*family=([^"'>\s&]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = googleFontsRe.exec(html)) !== null) {
    const families = decodeURIComponent(m[1]).split('|');
    for (const f of families) {
      const name = f.split(':')[0].replace(/\+/g, ' ');
      add(name, 'google-fonts');
    }
  }

  // @font-face { font-family: "Name" }
  const fontFaceRe = /@font-face\s*\{[^}]*font-family\s*:\s*(['"]?)([^;'"}\n]+)\1/gi;
  while ((m = fontFaceRe.exec(html)) !== null) {
    add(m[2], 'font-face');
  }

  // CSS custom properties: --font-*: Name, fallback
  const cssVarRe = /--font[a-z-]*\s*:\s*(['"]?)([^;'"}]+)\1/gi;
  while ((m = cssVarRe.exec(html)) !== null) {
    const value = m[2];
    const first = value.split(',')[0].trim();
    add(first, 'css-variable');
  }

  // font-family declarations on key selectors (h1-h6, body, nav, header, p, etc.)
  const fontFamilyRe = /font-family\s*:\s*([^;}"]+)/gi;
  while ((m = fontFamilyRe.exec(html)) !== null) {
    const families = m[1].split(',');
    for (const f of families.slice(0, 2)) {
      add(f, 'css-declaration');
    }
  }

  // Shorthand font property: font: [style] [variant] [weight] size[/line-height] family
  const fontShorthandRe = /(?:^|[{;\s])font\s*:\s*(?:(?:italic|oblique|normal)\s+)?(?:(?:small-caps|normal)\s+)?(?:(?:bold|bolder|lighter|\d{3})\s+)?[\d.]+(?:px|rem|em|%|vw)(?:\s*\/\s*[\d.]+(?:px|rem|em|%)?)?\s+([^;}"]+)/gi;
  while ((m = fontShorthandRe.exec(html)) !== null) {
    const families = m[1].split(',');
    for (const f of families.slice(0, 2)) {
      add(f, 'css-declaration');
    }
  }

  return fonts;
}

// ---------------------------------------------------------------------------
// GPT-4o font role classification
// ---------------------------------------------------------------------------

async function classifyFontRoles(
  html: string,
  detectedFonts: DetectedFont[],
): Promise<{ heading: string; body: string; code: string }> {
  if (detectedFonts.length === 0) {
    return { heading: '', body: '', code: '' };
  }

  const fontList = detectedFonts.map((f) => f.family).join(', ');
  const truncated = html.slice(0, 15000);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `You are a typography expert. Given the HTML/CSS below and this list of fonts found on the page, classify which font is used for headings, which for body text, and which (if any) for code.

DETECTED FONTS: ${fontList}

HTML/CSS (truncated):
${truncated}

Return ONLY valid JSON:
{
  "heading": "font name for headings (h1, h2, hero text)",
  "body": "font name for body/paragraph text",
  "code": "font name for code/monospace (or empty string if none)"
}

CRITICAL RULES:
- You MUST only use font names from this exact list: ${fontList}
- Do NOT invent or guess font names not in the list
- Look at which CSS selectors (h1, h2, .hero, .heading, body, p, code, pre) use which font-family
- If only one font is detected, use it for both heading and body
- If unsure about a role, leave it as an empty string`,
    }],
    temperature: 0.1,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    const validNames = new Set(detectedFonts.map((f) => f.family.toLowerCase()));

    function validate(name: string): string {
      if (!name) return '';
      const match = detectedFonts.find((f) => f.family.toLowerCase() === name.toLowerCase());
      return match ? match.family : '';
    }

    return {
      heading: validate(parsed.heading || ''),
      body: validate(parsed.body || ''),
      code: validate(parsed.code || ''),
    };
  } catch {
    return { heading: '', body: '', code: '' };
  }
}

// ---------------------------------------------------------------------------
// GPT-4o visual mood classification
// ---------------------------------------------------------------------------

const VALID_MOODS = ['corporate', 'playful', 'editorial', 'minimal', 'bold', 'luxury'] as const;

async function classifyMood(html: string, url: string): Promise<string> {
  const truncated = html.slice(0, 12000);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `You are a visual design expert. Analyze the HTML/CSS of ${url} and classify its VISUAL DESIGN mood — not the business type, but how the site actually looks and feels.

HTML/CSS (truncated):
${truncated}

Return ONLY valid JSON:
{
  "mood": "one of: corporate, playful, editorial, minimal, bold, luxury"
}

MOOD DEFINITIONS (classify based on VISUAL design, not business category):
- corporate: Dark navs, sharp corners, dense layouts, muted blues/grays, stock photography, formal grid
- playful: Rounded corners, warm/bright colors, illustrations, generous whitespace, friendly typography, soft shadows
- editorial: Strong typography hierarchy, lots of whitespace, serif headings, content-focused layout, muted palette
- minimal: Very sparse layout, monochrome or near-monochrome, thin fonts, maximum whitespace, few decorative elements
- bold: High contrast colors, large type, strong CTA buttons, saturated palette, dynamic/asymmetric layout
- luxury: Dark backgrounds, gold/muted accents, serif fonts, generous spacing, elegant imagery, restrained palette

CRITICAL: Judge by the VISUAL characteristics (colors, border-radius, typography, illustrations, spacing), NOT by what the company does. A payroll company can have a playful design.`,
    }],
    temperature: 0.1,
    max_tokens: 200,
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    const mood = (parsed.mood || '').toLowerCase();
    if ((VALID_MOODS as readonly string[]).includes(mood)) {
      return mood;
    }
    return '';
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// GPT-4o layout structure classification
// ---------------------------------------------------------------------------

const VALID_LAYOUTS = ['traditional', 'hero-driven', 'asymmetric', 'dense'] as const;
type LayoutStyle = typeof VALID_LAYOUTS[number];

async function classifyLayout(html: string, url: string): Promise<LayoutStyle | ''> {
  const truncated = html.slice(0, 12000);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `You are a web design layout expert. Analyze the HTML/CSS of ${url} and classify its primary LAYOUT STRUCTURE.

HTML/CSS (truncated):
${truncated}

Return ONLY valid JSON:
{
  "layout": "one of: traditional, hero-driven, asymmetric, dense"
}

LAYOUT DEFINITIONS:
- traditional: Standard header + content + footer. Navigation bar at top, content in centered container, sidebar optional. Classic corporate/blog structure.
- hero-driven: Full-width hero section dominates above the fold. Large imagery or video backgrounds, bold CTAs, sections flow vertically with full-bleed backgrounds. Modern marketing/SaaS style.
- asymmetric: Creative/non-standard layout. Offset grids, overlapping elements, varied column widths, art-directed positioning. Agency/portfolio style.
- dense: Information-rich grid layout. Multiple columns, compact cards, data tables, dashboards. Minimal whitespace between elements.

CRITICAL: Classify based on the STRUCTURAL layout patterns you see in the HTML, not the content topic.`,
    }],
    temperature: 0.1,
    max_tokens: 200,
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    const layout = (parsed.layout || '').toLowerCase();
    if ((VALID_LAYOUTS as readonly string[]).includes(layout)) {
      return layout as LayoutStyle;
    }
    return '';
  } catch {
    return '';
  }
}

function colorsFromBranding(branding: FirecrawlBrandingResponse): DetectedColor[] {
  const out: DetectedColor[] = [];
  const c = branding.colors;
  if (c.primary) out.push({ hex: c.primary, name: 'Primary', usage: 'Main brand color' });
  if (c.secondary) out.push({ hex: c.secondary, name: 'Secondary', usage: 'Supporting color' });
  if (c.accent) out.push({ hex: c.accent, name: 'Accent', usage: 'Highlight / CTA' });
  if (c.background) out.push({ hex: c.background, name: 'Background', usage: 'Page background' });
  if (c.textPrimary) out.push({ hex: c.textPrimary, name: 'Text', usage: 'Body text' });
  if (c.textSecondary) out.push({ hex: c.textSecondary, name: 'Text Secondary', usage: 'Muted text' });
  if (c.link) out.push({ hex: c.link, name: 'Link', usage: 'Link color' });
  return out;
}

function deduplicateByHex(colors: DetectedColor[]): DetectedColor[] {
  const seen = new Set<string>();
  return colors.filter((c) => {
    const key = c.hex.toUpperCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function extractAdditionalColors(html: string, url: string, knownHexes: string[]): Promise<DetectedColor[]> {
  const truncated = html.slice(0, 20000);
  const known = knownHexes.map((h) => h.toUpperCase()).join(', ');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `You are analyzing the CSS of ${url} to find colors that automated tools missed.

We already detected these colors: ${known}

HTML/CSS (truncated):
${truncated}

Find additional visually significant colors that are NOT in the list above. Look for:
- Colors in CSS custom properties (--variable: #hex)
- Background colors on nav bars, headers, footers, hero sections
- Button background and border colors
- SVG fill and stroke colors
- Colors in inline style attributes
- Colors defined in <style> blocks

Return ONLY valid JSON:
{
  "additionalColors": [
    { "hex": "#exact-hex-from-css", "name": "descriptive name", "usage": "element where this appears" }
  ]
}

CRITICAL RULES:
- ONLY return colors you can find literally written in the HTML/CSS above as hex, rgb(), or named CSS colors
- Convert rgb() values to hex. Convert named colors (e.g. "white") to hex.
- Do NOT guess or invent colors. If you cannot find the literal value in the code, do not include it.
- Do NOT return any color already in the known list above
- Return 0-6 additional colors, ranked by visual importance
- Normalize all values to uppercase 6-digit hex`,
    }],
    temperature: 0.1,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    return (parsed.additionalColors || []) as DetectedColor[];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'A valid URL is required' },
        { status: 400 },
      );
    }

    const normalized = url.startsWith('http') ? url : `https://${url}`;

    const result = await ingestDesignFromUrl(normalized, {
      includeScreenshot: true,
      includeMarkdown: false,
      includeHtml: true,
    });

    if (!result.success || !result.branding) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Could not analyze this site. Try a different URL.',
        url: normalized,
      });
    }

    const brandingColors = colorsFromBranding(result.branding);
    const knownHexes = brandingColors.map((c) => c.hex);

    let allColors = [...brandingColors];

    // Font extraction: deterministic parse + Firecrawl merge
    let htmlFonts: DetectedFont[] = [];
    if (result.html) {
      htmlFonts = extractFontsFromHtml(result.html);
    }

    // Add Firecrawl-detected fonts as fallback
    const fcTypo = result.branding.typography?.fontFamilies;
    const fcFonts = result.branding.fonts || [];
    for (const f of fcFonts) {
      if (f.family && !htmlFonts.some((h) => h.family.toLowerCase() === f.family.toLowerCase())) {
        htmlFonts.push({ family: f.family, source: 'firecrawl' });
      }
    }
    if (fcTypo?.heading && !htmlFonts.some((h) => h.family.toLowerCase() === fcTypo.heading.toLowerCase())) {
      htmlFonts.push({ family: fcTypo.heading, source: 'firecrawl' });
    }
    if (fcTypo?.primary && !htmlFonts.some((h) => h.family.toLowerCase() === fcTypo.primary.toLowerCase())) {
      htmlFonts.push({ family: fcTypo.primary, source: 'firecrawl' });
    }

    // AI color extraction + font role classification + mood classification + layout classification (run in parallel)
    let fontRoles = { heading: '', body: '', code: '' };
    let aiMood = '';
    let aiLayout: LayoutStyle | '' = '';

    if (result.html) {
      const [extraColors, roles, mood, layout] = await Promise.all([
        extractAdditionalColors(result.html, normalized, knownHexes).catch(() => [] as DetectedColor[]),
        htmlFonts.length > 0
          ? classifyFontRoles(result.html, htmlFonts).catch(() => ({ heading: '', body: '', code: '' }))
          : Promise.resolve({ heading: '', body: '', code: '' }),
        classifyMood(result.html, normalized).catch(() => ''),
        classifyLayout(result.html, normalized).catch(() => '' as const),
      ]);
      allColors = [...brandingColors, ...extraColors];
      fontRoles = roles;
      aiMood = mood;
      aiLayout = layout;
    }

    // If AI didn't classify roles, fall back to Firecrawl's typography
    if (!fontRoles.heading && fcTypo?.heading) fontRoles.heading = fcTypo.heading;
    if (!fontRoles.body && fcTypo?.primary) fontRoles.body = fcTypo.primary;
    if (!fontRoles.heading && htmlFonts.length > 0) fontRoles.heading = htmlFonts[0].family;
    if (!fontRoles.body && htmlFonts.length > 0) fontRoles.body = htmlFonts[htmlFonts.length > 1 ? 1 : 0].family;

    allColors = deduplicateByHex(allColors);

    const fc = result.branding.colors;
    const suggestedRoles = {
      primary: fc.primary || '',
      secondary: fc.secondary || '',
      accent: fc.accent || '',
      background: fc.background || '',
      text: fc.textPrimary || '',
    };

    return NextResponse.json({
      success: true,
      url: normalized,
      branding: result.branding,
      screenshot: result.screenshot,
      aiColors: {
        colors: allColors,
        suggestedRoles,
      },
      aiFonts: {
        fonts: htmlFonts,
        suggestedRoles: fontRoles,
      },
      aiMood: aiMood || null,
      aiLayout: aiLayout || null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
