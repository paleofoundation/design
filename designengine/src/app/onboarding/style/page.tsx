'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore, type ArtStylePreset } from '../store';
import { StepIndicator } from '../components';
import {
  generateArtStylePreview,
  ART_STYLE_META,
} from '@/lib/svg/art-style-previews';

const PRESETS: ArtStylePreset[] = [
  'line-art',
  'flat-vector',
  'watercolor',
  'isometric',
  'abstract-geometric',
  'photo-overlay',
];

const MOOD_RECOMMENDATIONS: Record<string, ArtStylePreset> = {
  corporate: 'line-art',
  playful: 'flat-vector',
  editorial: 'photo-overlay',
  minimal: 'line-art',
  bold: 'abstract-geometric',
  luxury: 'photo-overlay',
};

export default function OnboardingStyle() {
  const router = useRouter();
  const { mood, artStyle, colors, setField, extractionStatus } = useOnboardingStore();
  const hasExtraction = extractionStatus === 'done';
  const stepNumber = hasExtraction ? 6 : 5;

  const recommended = MOOD_RECOMMENDATIONS[mood] || 'flat-vector';

  const previews = useMemo(
    () =>
      PRESETS.map((preset) => ({
        preset,
        svg: generateArtStylePreview(preset, {
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.accent,
          background: colors.background,
        }),
        ...ART_STYLE_META[preset],
      })),
    [colors.primary, colors.secondary, colors.accent, colors.background],
  );

  function select(preset: ArtStylePreset) {
    setField('artStyle', preset);
  }

  return (
    <div
      style={{
        maxWidth: '56rem',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-4)',
        width: '100%',
      }}
    >
      <StepIndicator current={stepNumber} />

      <h1
        style={{
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--leading-tight)',
          marginBottom: 'var(--space-1)',
        }}
      >
        Choose your image style
      </h1>
      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-body)',
          marginBottom: 'var(--space-6)',
          maxWidth: '38rem',
        }}
      >
        This sets the visual language for all AI-generated illustrations, icons,
        and imagery. Every preview below uses your brand colors.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 16rem), 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {previews.map(({ preset, svg, label, mood: styleMood, bestFor }) => {
          const isSelected = artStyle === preset;
          const isRecommended = preset === recommended;

          return (
            <button
              key={preset}
              type="button"
              onClick={() => select(preset)}
              style={{
                textAlign: 'left',
                background: 'var(--color-white)',
                border: isSelected
                  ? '2px solid var(--color-green-deep)'
                  : '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
                overflow: 'hidden',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                transition:
                  'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                position: 'relative',
              }}
            >
              {isRecommended && (
                <span
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: 'var(--color-green-deep)',
                    background: 'var(--color-green-muted)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    zIndex: 1,
                    border: '1px solid rgba(48, 110, 94, 0.15)',
                  }}
                >
                  Recommended
                </span>
              )}

              {/* SVG Preview */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '280 / 180',
                  overflow: 'hidden',
                  borderBottom: '1px solid var(--color-border)',
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />

              {/* Info */}
              <div style={{ padding: 'var(--space-2) var(--space-3) var(--space-3)' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {label}
                  </span>
                  {isSelected && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-green-deep)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.5,
                    marginBottom: '0.25rem',
                  }}
                >
                  {styleMood}
                </p>
                <p
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--color-text-muted)',
                    opacity: 0.7,
                    lineHeight: 1.4,
                  }}
                >
                  {bestFor}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 'var(--space-8)',
        }}
      >
        <button
          onClick={() => router.push('/onboarding/typography')}
          style={{
            background: 'none',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-body)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          &larr; Back
        </button>
        <button
          onClick={() => router.push('/onboarding/review')}
          disabled={!artStyle}
          style={{
            background: artStyle ? 'var(--color-orange)' : 'var(--color-border)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 'var(--text-base)',
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: artStyle ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            opacity: artStyle ? 1 : 0.6,
          }}
        >
          Next: Review &rarr;
        </button>
      </div>
    </div>
  );
}
