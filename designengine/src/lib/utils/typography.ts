import type { TypographyPairing } from '@/types/design';

export function generateTypeScale(
  baseSize: number = 16,
  ratio: number = 1.25
): Record<string, string> {
  return {
    caption: `${(baseSize / ratio / ratio).toFixed(2)}px`,
    small: `${(baseSize / ratio).toFixed(2)}px`,
    body: `${baseSize}px`,
    h4: `${(baseSize * ratio).toFixed(2)}px`,
    h3: `${(baseSize * ratio * ratio).toFixed(2)}px`,
    h2: `${(baseSize * ratio * ratio * ratio).toFixed(2)}px`,
    h1: `${(baseSize * ratio * ratio * ratio * ratio).toFixed(2)}px`,
  };
}

export function pairingToCss(pairing: TypographyPairing): string {
  const lines: string[] = [':root {'];

  for (const [key, value] of Object.entries(pairing.cssVariables)) {
    lines.push(`  ${key}: ${value};`);
  }

  lines.push('}');
  return lines.join('\n');
}
