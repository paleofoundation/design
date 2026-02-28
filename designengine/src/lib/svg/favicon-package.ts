import {
  type FaviconOptions,
  type FaviconPackage,
  buildFaviconSvg,
  buildPngScript,
  buildWebManifest,
  buildHtmlHeadTags,
} from './favicon';

/**
 * Server-only: generates the full favicon package including PNGs via sharp.
 * Do NOT import this file from client components — use favicon.ts instead.
 */
export async function generateFaviconPackage(
  opts: FaviconOptions & { brandName: string; backgroundColor?: string },
): Promise<FaviconPackage> {
  const svg = buildFaviconSvg(opts, 512);

  const pngs: Record<string, string> = {};

  try {
    const sharpMod = await import('sharp');
    const sharpFn = sharpMod.default;
    const sizes = [16, 32, 48, 180, 192, 512];
    for (const size of sizes) {
      const svgAtSize = buildFaviconSvg(opts, size);
      const buf = await sharpFn(Buffer.from(svgAtSize)).resize(size, size).png().toBuffer();
      const name = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
      pngs[name] = buf.toString('base64');
    }
  } catch {
    // sharp not available — PNGs skipped, SVG + script provided instead
  }

  const webmanifest = buildWebManifest({
    brandName: opts.brandName,
    primaryColor: opts.primaryColor,
    backgroundColor: opts.backgroundColor,
  });

  const htmlHead = buildHtmlHeadTags();

  return { svg, pngs, webmanifest, htmlHead, pngScript: buildPngScript() };
}
