'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store';
import { StepIndicator } from '../components';

const PAIRINGS: Record<string, Array<{
  id: string;
  heading: string;
  body: string;
  headingClass: string;
  bodyClass: string;
  reason: string;
}>> = {
  corporate: [
    { id: 'inter-inter', heading: 'Inter', body: 'Inter', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Geometric precision reads as reliable and professional. One font family for maximum consistency.' },
    { id: 'playfair-source', heading: 'Playfair Display', body: 'Source Sans 3', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'The transitional serif adds gravitas to headlines while the humanist sans keeps body text approachable.' },
    { id: 'dm-serif-dm-sans', heading: 'DM Serif Display', body: 'DM Sans', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Same type family ensures optical harmony. The serif display adds distinction without clashing.' },
  ],
  playful: [
    { id: 'nunito-nunito', heading: 'Nunito', body: 'Nunito', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Rounded terminals feel warm and inviting. The soft geometry reads as friendly and non-intimidating.' },
    { id: 'fredoka-dm-sans', heading: 'Fredoka', body: 'DM Sans', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Fredoka\'s rounded display weight grabs attention with personality. DM Sans keeps body text clean and readable.' },
    { id: 'space-grotesk-inter', heading: 'Space Grotesk', body: 'Inter', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Space Grotesk has character without being novelty. Paired with Inter for functional body text.' },
  ],
  editorial: [
    { id: 'fraunces-source', heading: 'Fraunces', body: 'Source Sans 3', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Fraunces is an old-style soft serif with optical sizing \u2014 it gets more expressive at large sizes. Source Sans keeps body text humanist and warm.' },
    { id: 'playfair-lato', heading: 'Playfair Display', body: 'Lato', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'High-contrast display serif for editorial authority. Lato\'s warmth prevents the pairing from feeling cold.' },
    { id: 'literata-inter', heading: 'Literata', body: 'Inter', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Literata was designed for long-form reading. Paired with Inter for UI elements \u2014 a content-first combination.' },
  ],
  minimal: [
    { id: 'inter-inter-m', heading: 'Inter', body: 'Inter', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Pure minimalism. One font, varied weights. Let the content and whitespace do the talking.' },
    { id: 'geist-geist', heading: 'Geist', body: 'Geist', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Designed for interfaces. Tight metrics and clear letterforms for maximum information density.' },
    { id: 'dm-sans-dm-mono', heading: 'DM Sans', body: 'DM Mono', headingClass: 'sans-serif', bodyClass: 'monospace', reason: 'Sans headings for hierarchy, monospace body for a developer-craft aesthetic. Unusual but distinctive.' },
  ],
  bold: [
    { id: 'space-grotesk-inter-b', heading: 'Space Grotesk', body: 'Inter', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Space Grotesk\'s geometric construction pops at bold weights. Inter is invisible in body \u2014 by design.' },
    { id: 'clash-display-satoshi', heading: 'Clash Display', body: 'Satoshi', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Display font with strong personality for headlines. Satoshi provides clean, modern body text.' },
    { id: 'cabinet-grotesk-general', heading: 'Cabinet Grotesk', body: 'General Sans', headingClass: 'sans-serif', bodyClass: 'sans-serif', reason: 'Two neo-grotesque families with character. Tight letter-spacing at display sizes creates impact.' },
  ],
  luxury: [
    { id: 'cormorant-lato', heading: 'Cormorant Garamond', body: 'Lato', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Cormorant is an elegant display Garamond \u2014 high contrast, refined serifs. Lato provides warm, neutral body text.' },
    { id: 'fraunces-source-l', heading: 'Fraunces', body: 'Source Sans 3', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Fraunces at heavy weights feels indulgent and confident. Source Sans is the refined, readable counterpart.' },
    { id: 'playfair-raleway', heading: 'Playfair Display', body: 'Raleway', headingClass: 'serif', bodyClass: 'sans-serif', reason: 'Classical display serif meets elegant thin sans-serif. A high-fashion pairing with clear hierarchy.' },
  ],
};

export default function OnboardingTypography() {
  const router = useRouter();
  const { mood, typography, colors, setField, extractionStatus, adoptions, extraction, inspirationUrl } = useOnboardingStore();
  const hasExtraction = extractionStatus === 'done';
  const hasExtractedFonts = hasExtraction && adoptions.typography && extraction?.typography?.fontFamilies;

  const stepNumber = hasExtraction ? 5 : 4;

  const options = PAIRINGS[mood] || PAIRINGS.editorial;

  const extractedHeading = extraction?.typography?.fontFamilies?.heading || extraction?.typography?.fontFamilies?.primary || '';
  const extractedBody = extraction?.typography?.fontFamilies?.primary || extraction?.typography?.fontFamilies?.heading || '';

  function selectPairing(heading: string, body: string) {
    setField('typography', { heading, body });
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
      maxWidth: '56rem',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-4)',
      width: '100%',
    }}>
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
      }}>
        {hasExtractedFonts
          ? <>We detected <strong style={{ color: 'var(--color-green-deep)' }}>{extractedHeading}</strong>{extractedBody !== extractedHeading ? <> + <strong style={{ color: 'var(--color-green-deep)' }}>{extractedBody}</strong></> : null} from {extractDomain(inspirationUrl)}. Confirm or pick an alternative.</>
          : 'Each pairing is curated for your mood. The rationale explains why it works \u2014 because design decisions should be intentional.'
        }
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}>
        {/* Extracted font pairing */}
        {hasExtractedFonts && extractedHeading && (
          <button
            onClick={() => selectPairing(extractedHeading, extractedBody || extractedHeading)}
            style={{
              textAlign: 'left',
              background: 'var(--color-white)',
              border: isSelected(extractedHeading, extractedBody || extractedHeading)
                ? '2px solid var(--color-green-deep)'
                : '1.5px solid var(--color-green-deep)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: isSelected(extractedHeading, extractedBody || extractedHeading) ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
              position: 'relative',
            }}
          >
            <span style={{
              position: 'absolute',
              top: '-0.5rem',
              right: 'var(--space-2)',
              fontSize: '0.625rem',
              fontWeight: 600,
              color: 'var(--color-green-deep)',
              background: 'var(--color-green-muted)',
              padding: '0.1rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              border: '1px solid var(--color-green-deep)',
            }}>
              From {extractDomain(inspirationUrl)}
            </span>
            <div style={{
              background: colors.background,
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-3)',
              marginBottom: 'var(--space-2)',
            }}>
              <p style={{
                fontFamily: `'${extractedHeading}', serif`,
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: colors.text,
                lineHeight: 'var(--leading-tight)',
                marginBottom: '0.5rem',
              }}>
                {extractedHeading}
              </p>
              <p style={{
                fontFamily: `'${extractedBody || extractedHeading}', sans-serif`,
                fontSize: 'var(--text-base)',
                fontWeight: 400,
                color: colors.text,
                opacity: 0.75,
                lineHeight: 'var(--leading-normal)',
              }}>
                paired with {extractedBody || extractedHeading} &mdash; The quick brown fox jumps over the lazy dog.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {extractedHeading} + {extractedBody || extractedHeading}
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-normal)' }}>
              The exact typography detected from the inspiration site. Using what already works.
            </p>
          </button>
        )}

        {hasExtractedFonts && (
          <p style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-1)',
          }}>
            Or pick a curated alternative
          </p>
        )}

        {options.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPairing(p.heading, p.body)}
            style={{
              textAlign: 'left',
              background: 'var(--color-white)',
              border: isSelected(p.heading, p.body)
                ? '2px solid var(--color-green-deep)'
                : '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: isSelected(p.heading, p.body) ? 'var(--shadow-md)' : 'none',
              transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
            }}
          >
            <div style={{
              background: colors.background,
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-3)',
              marginBottom: 'var(--space-2)',
            }}>
              <p style={{
                fontFamily: `'${p.heading}', ${p.headingClass}`,
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: colors.text,
                lineHeight: 'var(--leading-tight)',
                marginBottom: '0.5rem',
              }}>
                {p.heading}
              </p>
              <p style={{
                fontFamily: `'${p.body}', ${p.bodyClass}`,
                fontSize: 'var(--text-base)',
                fontWeight: 400,
                color: colors.text,
                opacity: 0.75,
                lineHeight: 'var(--leading-normal)',
              }}>
                paired with {p.body} &mdash; The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {p.heading} + {p.body}
              </span>
              <span style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
                color: 'var(--color-orange)',
                background: 'var(--color-orange-muted)',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
              }}>
                {p.headingClass} + {p.bodyClass}
              </span>
            </div>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-normal)',
            }}>
              {p.reason}
            </p>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-8)' }}>
        <button onClick={() => router.push('/onboarding/colors')} style={{ background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-body)', cursor: 'pointer', fontFamily: 'inherit' }}>
          &larr; Back
        </button>
        <button onClick={() => router.push('/onboarding/review')} style={{ background: 'var(--color-orange)', color: '#fff', fontWeight: 600, fontSize: 'var(--text-base)', padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          Next: Review &rarr;
        </button>
      </div>
    </div>
  );
}
