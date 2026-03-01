'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store';
import { StepIndicator } from '../components';
import { getDesignLanguage } from '@/lib/design-language';

export default function OnboardingTypography() {
  const router = useRouter();
  const {
    designLanguage, typography, colors, setField, intent,
    keepAttributes, extractionStatus, extraction, inspirationUrl,
  } = useOnboardingStore();

  const isRefresh = intent === 'refresh';
  const hasExtraction = extractionStatus === 'done';
  const keepingFonts = isRefresh && keepAttributes.typography;
  const hasExtractedFonts = hasExtraction && extraction?.typography?.fontFamilies;

  // Skip if refresh user is keeping fonts
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
        maxWidth: '38rem',
      }}>
        {hasExtractedFonts
          ? <>We detected <strong style={{ color: 'var(--color-green-deep)' }}>{extractedHeading}</strong>{extractedBody !== extractedHeading ? <> + <strong style={{ color: 'var(--color-green-deep)' }}>{extractedBody}</strong></> : null} from {extractDomain(inspirationUrl)}. Confirm or pick an alternative.</>
          : `Each pairing is curated for the "${lang.label}" design language. See how they look in real content — not just the font name.`
        }
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}>
        {/* Extracted font pairing */}
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

      {/* Content preview */}
      <div style={{
        background: colors.background,
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {/* Blog post snippet */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <p style={{
            fontFamily: `'${heading}', ${headingClass}`,
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: colors.text,
            lineHeight: 'var(--leading-tight)',
            marginBottom: '0.5rem',
          }}>
            The Art of Digital Design
          </p>
          <p style={{
            fontFamily: `'${body}', ${bodyClass}`,
            fontSize: 'var(--text-base)',
            fontWeight: 400,
            color: colors.text,
            opacity: 0.75,
            lineHeight: 'var(--leading-relaxed)',
            marginBottom: '0.75rem',
          }}>
            Good design is not about decoration. It&rsquo;s about making complex things feel simple, creating systems that scale, and building interfaces that respect the people who use them.
          </p>
          <blockquote style={{
            borderLeft: `3px solid ${colors.accent}`,
            paddingLeft: 'var(--space-2)',
            fontFamily: `'${body}', ${bodyClass}`,
            fontSize: 'var(--text-sm)',
            fontStyle: 'italic',
            color: colors.text,
            opacity: 0.6,
            lineHeight: 'var(--leading-normal)',
          }}>
            &ldquo;Design is not just what it looks like. Design is how it works.&rdquo;
          </blockquote>
        </div>

        {/* UI elements snippet */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: `'${body}', ${bodyClass}`,
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            color: colors.text,
            opacity: 0.5,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Nav Label
          </span>
          <span style={{
            fontFamily: `'${body}', ${bodyClass}`,
            background: colors.primary,
            color: isColorDark(colors.primary) ? '#fff' : '#000',
            padding: '0.375rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
          }}>
            Button Text
          </span>
          <span style={{
            fontFamily: `'${body}', ${bodyClass}`,
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            color: colors.text,
            opacity: 0.4,
          }}>
            Form Label
          </span>
          <span style={{
            fontFamily: `'${body}', ${bodyClass}`,
            fontSize: '0.625rem',
            color: colors.text,
            opacity: 0.35,
          }}>
            Caption text &middot; 3 min read
          </span>
        </div>
      </div>

      {/* Meta */}
      <div style={{ padding: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {heading} + {body}
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
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--leading-normal)',
        }}>
          {reason}
        </p>
      </div>
    </button>
  );
}

function isColorDark(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length < 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
