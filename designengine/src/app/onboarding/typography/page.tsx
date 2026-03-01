'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store';
import { StepIndicator } from '../components';
import { getDesignLanguage } from '@/lib/design-language';
import { generateTypeScale, TYPE_SCALE_NAMES, type TypeScaleRatio } from '@/lib/color-utils';

const AVAILABLE_RATIOS: TypeScaleRatio[] = [1.125, 1.2, 1.25, 1.333, 1.414, 1.5];
const WEIGHT_OPTIONS = [300, 400, 500, 600, 700, 800, 900];

function buildGoogleFontsUrl(fonts: string[], weights: number[]): string {
  const families = fonts
    .filter((f, i, a) => a.indexOf(f) === i)
    .map((f) => `family=${f.replace(/\s+/g, '+')}:wght@${weights.join(';')}`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export default function OnboardingTypography() {
  const router = useRouter();
  const {
    designLanguage, typography, colors, setField, intent,
    keepAttributes, extractionStatus, extraction, inspirationUrl,
    typeScaleRatio, headingWeights, bodyWeights,
  } = useOnboardingStore();

  const isRefresh = intent === 'refresh';
  const hasExtraction = extractionStatus === 'done';
  const keepingFonts = isRefresh && keepAttributes.typography;
  const hasExtractedFonts = hasExtraction && extraction?.typography?.fontFamilies;

  useEffect(() => {
    if (keepingFonts) {
      router.replace('/onboarding/style');
    }
  }, [keepingFonts, router]);

  if (keepingFonts) return null;

  const stepNumber = 5;
  const lang = getDesignLanguage(designLanguage);
  const options = lang.fontPairings;

  const extractedHeading = extraction?.typography?.fontFamilies?.heading || extraction?.typography?.fontFamilies?.primary || '';
  const extractedBody = extraction?.typography?.fontFamilies?.primary || extraction?.typography?.fontFamilies?.heading || '';

  // Collect all fonts for dynamic loading
  const allFonts = useMemo(() => {
    const fonts = new Set<string>();
    fonts.add(typography.heading);
    fonts.add(typography.body);
    if (extractedHeading) fonts.add(extractedHeading);
    if (extractedBody) fonts.add(extractedBody);
    for (const p of options) {
      fonts.add(p.heading);
      fonts.add(p.body);
    }
    return Array.from(fonts);
  }, [typography, extractedHeading, extractedBody, options]);

  const googleFontsUrl = useMemo(
    () => buildGoogleFontsUrl(allFonts, [300, 400, 500, 600, 700, 800]),
    [allFonts],
  );

  // Type scale preview
  const typeScale = useMemo(
    () => generateTypeScale(1, typeScaleRatio as TypeScaleRatio),
    [typeScaleRatio],
  );

  function selectPairing(heading: string, body: string) {
    setField('typography', { heading, body });
  }

  function toggleWeight(list: number[], weight: number, field: 'headingWeights' | 'bodyWeights') {
    if (list.includes(weight)) {
      if (list.length > 1) setField(field, list.filter((w) => w !== weight));
    } else {
      setField(field, [...list, weight].sort((a, b) => a - b));
    }
  }

  const isSelected = (heading: string, body: string) =>
    typography.heading === heading && typography.body === body;

  function extractDomain(url: string): string {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  return (
    <div style={{
      maxWidth: '64rem',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-4)',
      width: '100%',
    }}>
      {/* Dynamic Google Fonts loading */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={googleFontsUrl} />

      <StepIndicator current={stepNumber} />

      <h1 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        lineHeight: 'var(--leading-tight)',
        marginBottom: 'var(--space-1)',
      }}>
        {hasExtractedFonts ? 'Refine your typography' : 'Choose your typography'}
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-body)',
        marginBottom: 'var(--space-6)',
        maxWidth: '38rem',
      }}>
        {hasExtractedFonts
          ? <>We detected <strong style={{ color: 'var(--color-green-deep)' }}>{extractedHeading}</strong>{extractedBody !== extractedHeading ? <> + <strong style={{ color: 'var(--color-green-deep)' }}>{extractedBody}</strong></> : null} from {extractDomain(inspirationUrl)}. Confirm or pick an alternative.</>
          : `Each pairing is curated for the \u201C${lang.label}\u201D design language. See how they look in real content \u2014 not just the font name.`
        }
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr minmax(0, 20rem)',
        gap: 'var(--space-6)',
      }}>
        {/* Left: Font pairings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {hasExtractedFonts && extractedHeading && (
            <TypographyCard
              heading={extractedHeading}
              body={extractedBody || extractedHeading}
              headingClass="serif"
              bodyClass="sans-serif"
              reason="The exact typography detected from the inspiration site. Using what already works."
              selected={isSelected(extractedHeading, extractedBody || extractedHeading)}
              colors={colors}
              badge={`From ${extractDomain(inspirationUrl)}`}
              onSelect={() => selectPairing(extractedHeading, extractedBody || extractedHeading)}
            />
          )}

          {hasExtractedFonts && (
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
              Or pick a curated alternative
            </p>
          )}

          {options.map((p) => (
            <TypographyCard
              key={p.id}
              heading={p.heading}
              body={p.body}
              headingClass={p.headingClass}
              bodyClass={p.bodyClass}
              reason={p.reason}
              selected={isSelected(p.heading, p.body)}
              colors={colors}
              onSelect={() => selectPairing(p.heading, p.body)}
            />
          ))}
        </div>

        {/* Right: Typography refinements */}
        <div style={{ position: 'sticky', top: 'var(--space-4)', alignSelf: 'start' }}>
          {/* Type scale ratio selector */}
          <div style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
          }}>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-2)',
            }}>
              Type Scale Ratio
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-normal)' }}>
              Controls how dramatically font sizes increase from body to h1. Smaller ratios = subtle hierarchy. Larger = dramatic.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {AVAILABLE_RATIOS.map((r) => {
                const active = typeScaleRatio === r;
                return (
                  <button
                    key={r}
                    onClick={() => setField('typeScaleRatio', r)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: active ? 'var(--color-green-muted)' : 'var(--color-surface)',
                      border: active ? '1.5px solid var(--color-green-deep)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    }}
                  >
                    <span style={{
                      fontSize: 'var(--text-xs)', fontWeight: active ? 600 : 400,
                      color: active ? 'var(--color-green-deep)' : 'var(--color-text-primary)',
                    }}>
                      {TYPE_SCALE_NAMES[r]}
                    </span>
                    <code style={{
                      fontSize: '0.625rem', fontFamily: 'var(--font-jetbrains)',
                      color: 'var(--color-text-muted)',
                    }}>
                      {r}
                    </code>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weight selection */}
          <div style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
          }}>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-2)',
            }}>
              Heading Weights
            </p>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
              {WEIGHT_OPTIONS.map((w) => {
                const active = headingWeights.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => toggleWeight(headingWeights, w, 'headingWeights')}
                    style={{
                      background: active ? 'var(--color-green-deep)' : 'var(--color-surface)',
                      color: active ? '#fff' : 'var(--color-text-muted)',
                      border: active ? 'none' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 8px',
                      fontSize: 'var(--text-xs)', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {w}
                  </button>
                );
              })}
            </div>

            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-2)',
            }}>
              Body Weights
            </p>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {WEIGHT_OPTIONS.map((w) => {
                const active = bodyWeights.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => toggleWeight(bodyWeights, w, 'bodyWeights')}
                    style={{
                      background: active ? 'var(--color-green-deep)' : 'var(--color-surface)',
                      color: active ? '#fff' : 'var(--color-text-muted)',
                      border: active ? 'none' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 8px',
                      fontSize: 'var(--text-xs)', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type scale preview */}
          <div style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
          }}>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-2)',
            }}>
              Scale Preview
            </p>
            {(['4xl', '3xl', '2xl', 'xl', 'lg', 'base', 'sm', 'xs'] as const).map((level) => (
              <div key={level} style={{
                display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)',
                marginBottom: '2px',
              }}>
                <code style={{
                  fontSize: '0.55rem', fontFamily: 'var(--font-jetbrains)',
                  color: 'var(--color-text-muted)', width: '2.5rem', textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {level}
                </code>
                <span style={{
                  fontFamily: level === 'base' || level === 'sm' || level === 'xs'
                    ? `'${typography.body}', sans-serif`
                    : `'${typography.heading}', serif`,
                  fontSize: typeScale[level],
                  fontWeight: level === 'base' || level === 'sm' || level === 'xs'
                    ? bodyWeights[0] || 400
                    : headingWeights[headingWeights.length - 1] || 700,
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  Heading
                </span>
                <code style={{
                  fontSize: '0.5rem', fontFamily: 'var(--font-jetbrains)',
                  color: 'var(--color-text-muted)', marginLeft: 'auto',
                  flexShrink: 0,
                }}>
                  {typeScale[level]}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-8)' }}>
        <button onClick={() => router.push('/onboarding/colors')} style={{
          background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-body)',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          &larr; Back
        </button>
        <button onClick={() => router.push('/onboarding/style')} style={{
          background: 'var(--color-orange)', color: '#fff', fontWeight: 600, fontSize: 'var(--text-base)',
          padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Next: Image style &rarr;
        </button>
      </div>
    </div>
  );
}

function TypographyCard({ heading, body, headingClass, bodyClass, reason, selected, colors, badge, onSelect }: {
  heading: string;
  body: string;
  headingClass: string;
  bodyClass: string;
  reason: string;
  selected: boolean;
  colors: { primary: string; secondary: string; accent: string; background: string; text: string };
  badge?: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        textAlign: 'left',
        background: 'var(--color-white)',
        border: selected
          ? '2px solid var(--color-green-deep)'
          : badge
            ? '1.5px solid var(--color-green-deep)'
            : '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: selected ? 'var(--shadow-md)' : badge ? 'var(--shadow-sm)' : 'none',
        transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {badge && (
        <span style={{
          position: 'absolute', top: '0.75rem', right: 'var(--space-2)', zIndex: 1,
          fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-green-deep)',
          background: 'var(--color-green-muted)', padding: '0.1rem 0.5rem',
          borderRadius: 'var(--radius-full)', letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase', border: '1px solid var(--color-green-deep)',
        }}>
          {badge}
        </span>
      )}

      <div style={{
        background: colors.background,
        padding: 'var(--space-3)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <p style={{
            fontFamily: `'${heading}', ${headingClass}`,
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: colors.text,
            lineHeight: 'var(--leading-tight)',
            marginBottom: '0.375rem',
          }}>
            The Art of Digital Design
          </p>
          <p style={{
            fontFamily: `'${body}', ${bodyClass}`,
            fontSize: 'var(--text-sm)',
            fontWeight: 400,
            color: colors.text,
            opacity: 0.75,
            lineHeight: 'var(--leading-relaxed)',
            marginBottom: '0.5rem',
          }}>
            Good design is not about decoration. It&rsquo;s about making complex things feel simple.
          </p>
          <blockquote style={{
            borderLeft: `3px solid ${colors.accent}`,
            paddingLeft: 'var(--space-2)',
            fontFamily: `'${body}', ${bodyClass}`,
            fontSize: 'var(--text-xs)',
            fontStyle: 'italic',
            color: colors.text,
            opacity: 0.6,
            lineHeight: 'var(--leading-normal)',
          }}>
            &ldquo;Design is how it works.&rdquo;
          </blockquote>
        </div>
      </div>

      <div style={{ padding: 'var(--space-2) var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {heading}{heading !== body && ` + ${body}`}
          </span>
          <span style={{
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
            color: 'var(--color-orange)',
            background: 'var(--color-orange-muted)',
            padding: '0.1rem 0.4rem',
            borderRadius: 'var(--radius-sm)',
          }}>
            {headingClass} + {bodyClass}
          </span>
          {selected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-green-deep)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-normal)' }}>
          {reason}
        </p>
      </div>
    </button>
  );
}
