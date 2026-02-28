import { NextRequest, NextResponse } from 'next/server';
import { ingestDesignFromUrl } from '@/lib/firecrawl/ingest';

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
      includeHtml: false,
    });

    if (!result.success || !result.branding) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Could not analyze this site. Try a different URL.',
        url: normalized,
      });
    }

    return NextResponse.json({
      success: true,
      url: normalized,
      branding: result.branding,
      screenshot: result.screenshot,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
