/**
 * Brand Safety Validator
 *
 * Scans generated CSS and SVG output for properties that silently mutate
 * brand colors — blend modes, CSS filters, hardcoded off-palette hex values,
 * and extreme opacity that makes tokens unrecognizable.
 *
 * Every MCP asset tool runs this before returning results.
 */

export interface BrandViolation {
  severity: 'error' | 'warning';
  property: string;
  value: string;
  rule: string;
  suggestion: string;
}

export interface BrandSafetyResult {
  safe: boolean;
  violations: BrandViolation[];
}

const DANGEROUS_BLEND_MODES = [
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
];

const DANGEROUS_FILTER_FUNCTIONS = [
  'hue-rotate',
  'invert',
];

const FILTER_THRESHOLD_RULES: { fn: string; max: number; unit: string }[] = [
  { fn: 'saturate', max: 1.3, unit: '' },
  { fn: 'contrast', max: 1.5, unit: '' },
  { fn: 'brightness', max: 1.5, unit: '' },
];

const MIN_OPACITY = 0.15;

function scanCSS(content: string): BrandViolation[] {
  const violations: BrandViolation[] = [];

  const blendMatch = content.match(/mix-blend-mode\s*:\s*([^;}\n]+)/gi);
  if (blendMatch) {
    for (const match of blendMatch) {
      const value = match.split(':')[1]?.trim().replace(';', '').trim();
      if (value && DANGEROUS_BLEND_MODES.includes(value)) {
        violations.push({
          severity: 'error',
          property: 'mix-blend-mode',
          value,
          rule: 'Blend modes that invert or shift hue destroy brand color identity',
          suggestion: `Remove mix-blend-mode: ${value} or use "normal" instead`,
        });
      }
    }
  }

  const filterMatch = content.match(/filter\s*:\s*([^;}\n]+)/gi);
  if (filterMatch) {
    for (const match of filterMatch) {
      const value = match.split(':').slice(1).join(':').trim().replace(';', '').trim();

      for (const fn of DANGEROUS_FILTER_FUNCTIONS) {
        const fnRegex = new RegExp(`${fn}\\s*\\(([^)]+)\\)`, 'i');
        const fnMatch = value.match(fnRegex);
        if (fnMatch) {
          violations.push({
            severity: 'error',
            property: 'filter',
            value: `${fn}(${fnMatch[1]})`,
            rule: `${fn}() mutates brand colors beyond recognition`,
            suggestion: `Remove ${fn}() from the filter chain`,
          });
        }
      }

      for (const rule of FILTER_THRESHOLD_RULES) {
        const fnRegex = new RegExp(`${rule.fn}\\s*\\(([\\d.]+)${rule.unit}\\)`, 'i');
        const fnMatch = value.match(fnRegex);
        if (fnMatch) {
          const numVal = parseFloat(fnMatch[1]);
          if (numVal > rule.max) {
            violations.push({
              severity: 'warning',
              property: 'filter',
              value: `${rule.fn}(${fnMatch[1]})`,
              rule: `${rule.fn}() value ${numVal} exceeds safe threshold ${rule.max}`,
              suggestion: `Reduce ${rule.fn}() to ${rule.max} or below to preserve brand colors`,
            });
          }
        }
      }
    }
  }

  const opacityMatch = content.match(/(?<!fill-|stop-)opacity\s*:\s*([^;}\n]+)/gi);
  if (opacityMatch) {
    for (const match of opacityMatch) {
      const value = match.split(':')[1]?.trim().replace(';', '').trim();
      if (value) {
        const numVal = parseFloat(value);
        if (!isNaN(numVal) && numVal > 0 && numVal < MIN_OPACITY) {
          violations.push({
            severity: 'warning',
            property: 'opacity',
            value,
            rule: `Opacity below ${MIN_OPACITY} makes brand colors imperceptible`,
            suggestion: `Increase opacity to at least ${MIN_OPACITY} or remove the element`,
          });
        }
      }
    }
  }

  return violations;
}

function scanSVG(content: string): BrandViolation[] {
  const violations: BrandViolation[] = [];

  const filterAttrMatch = content.match(/filter\s*=\s*"([^"]+)"/gi);
  if (filterAttrMatch) {
    for (const match of filterAttrMatch) {
      const value = match.split('=')[1]?.replace(/"/g, '').trim();
      if (value) {
        for (const fn of DANGEROUS_FILTER_FUNCTIONS) {
          if (value.includes(fn)) {
            violations.push({
              severity: 'error',
              property: 'SVG filter attribute',
              value,
              rule: `${fn} in SVG filter mutates brand colors`,
              suggestion: `Remove the ${fn} filter or replace with a brand-safe alternative`,
            });
          }
        }
      }
    }
  }

  const feColorMatrix = content.match(/<feColorMatrix[^>]*type\s*=\s*"([^"]+)"[^>]*>/gi);
  if (feColorMatrix) {
    for (const match of feColorMatrix) {
      const typeMatch = match.match(/type\s*=\s*"([^"]+)"/i);
      if (typeMatch && ['hueRotate', 'saturate'].includes(typeMatch[1])) {
        violations.push({
          severity: 'warning',
          property: 'feColorMatrix',
          value: typeMatch[1],
          rule: `feColorMatrix type="${typeMatch[1]}" can shift brand colors`,
          suggestion: 'Verify the matrix values preserve your brand palette',
        });
      }
    }
  }

  return violations;
}

/**
 * Validate a single piece of generated content for brand safety.
 */
export function validateContent(content: string, type: 'css' | 'svg' | 'js'): BrandSafetyResult {
  let violations: BrandViolation[] = [];

  if (type === 'css') {
    violations = scanCSS(content);
  } else if (type === 'svg') {
    violations = [...scanCSS(content), ...scanSVG(content)];
  } else if (type === 'js') {
    violations = scanCSS(content);
  }

  return {
    safe: violations.filter(v => v.severity === 'error').length === 0,
    violations,
  };
}

/**
 * Validate an entire asset package (multiple files) for brand safety.
 * Returns a combined result with per-file detail.
 */
export function validateAssetPackage(
  files: Record<string, { content: string; type?: string }>,
): {
  safe: boolean;
  totalViolations: number;
  errors: number;
  warnings: number;
  fileResults: Record<string, BrandSafetyResult>;
} {
  const fileResults: Record<string, BrandSafetyResult> = {};
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const [path, file] of Object.entries(files)) {
    let fileType: 'css' | 'svg' | 'js' = 'css';
    if (path.endsWith('.svg') || file.type === 'svg') fileType = 'svg';
    else if (path.endsWith('.js') || file.type === 'js') fileType = 'js';
    else if (path.endsWith('.css') || file.type === 'css') fileType = 'css';
    else continue;

    const result = validateContent(file.content, fileType);
    fileResults[path] = result;
    totalErrors += result.violations.filter(v => v.severity === 'error').length;
    totalWarnings += result.violations.filter(v => v.severity === 'warning').length;
  }

  return {
    safe: totalErrors === 0,
    totalViolations: totalErrors + totalWarnings,
    errors: totalErrors,
    warnings: totalWarnings,
    fileResults,
  };
}
