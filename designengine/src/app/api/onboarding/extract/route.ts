import { NextRequest, NextResponse } from 'next/server';
import { ingestDesignFromUrl } from '@/lib/firecrawl/ingest';
import { openai } from '@/lib/openai/client';
import type { FirecrawlBrandingResponse } from '@/lib/firecrawl/client';

interface DetectedColor {
  hex: string;
  name: string;
  usage: string;
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

    if (result.html) {
      try {
        const extra = await extractAdditionalColors(result.html, normalized, knownHexes);
        allColors = [...brandingColors, ...extra];
      } catch {
        // AI failed — proceed with Firecrawl colors only
      }
    }

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
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
