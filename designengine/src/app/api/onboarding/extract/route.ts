import { NextRequest, NextResponse } from 'next/server';
import { ingestDesignFromUrl } from '@/lib/firecrawl/ingest';
import { openai } from '@/lib/openai/client';

async function extractColorsWithAI(html: string, url: string): Promise<{
  colors: Array<{ hex: string; name: string; usage: string }>;
  suggestedRoles: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}> {
  const truncated = html.slice(0, 25000);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `You are a design system engineer. Analyze the HTML/CSS from ${url} and extract ALL significant colors used on this site.

HTML (truncated):
${truncated}

Return ONLY valid JSON with this structure:
{
  "colors": [
    { "hex": "#exact-hex", "name": "descriptive name", "usage": "where this color is used" }
  ],
  "suggestedRoles": {
    "primary": "#hex (the main brand/action color)",
    "secondary": "#hex (supporting brand color)",
    "accent": "#hex (highlight or CTA color)",
    "background": "#hex (page background)",
    "text": "#hex (main body text color)"
  }
}

CRITICAL RULES:
- Extract EXACT hex values from CSS properties, inline styles, SVG fills, and class definitions
- Include ALL visually significant colors (buttons, headers, nav bars, links, icons, borders)
- Do NOT include near-duplicates (colors within 10 units of each other in RGB space)
- Normalize all colors to 6-digit hex (no shorthand, no rgb(), no named colors)
- Return 4-10 colors, ranked by visual prominence
- The suggestedRoles should use hex values from the colors array`,
    }],
    temperature: 0.2,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch {
    return { colors: [], suggestedRoles: { primary: '', secondary: '', accent: '', background: '', text: '' } };
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

    let aiColors = null;
    if (result.html) {
      try {
        aiColors = await extractColorsWithAI(result.html, normalized);
      } catch {
        // AI extraction failed — fall back to Firecrawl-only branding
      }
    }

    return NextResponse.json({
      success: true,
      url: normalized,
      branding: result.branding,
      screenshot: result.screenshot,
      aiColors: aiColors || null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
