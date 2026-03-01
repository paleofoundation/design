'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store';
import { StepIndicator } from '../components';
import { DESIGN_LANGUAGES, DESIGN_LANGUAGE_IDS, getShadowCSS, getSpacingScale, type DesignLanguagePreset } from '@/lib/design-language';

export default function OnboardingDesignLanguage() {
  const router = useRouter();
  const { designLanguage, colors, typography, intent, extractionStatus, setField } = useOnboardingStore();
  const setDesignLanguage = useOnboardingStore((s) => s.setDesignLanguage);
  const hasExtraction = extractionStatus === 'done';
  const moodWasDetected = hasExtraction && designLanguage !== '';

  const stepNumber = 3;

  function extractDomain(url: string): string {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  const inspirationUrl = useOnboardingStore((s) => s.inspirationUrl);

  function handleNext() {
    const keepColors = intent === 'refresh' && useOnboardingStore.getState().keepAttributes.colors;
    if (keepColors) {
      const keepTypo = useOnboardingStore.getState().keepAttributes.typography;
      if (keepTypo) {
        router.push('/onboarding/style');
      } else {
        router.push('/onboarding/typography');
      }
    } else {
      router.push('/onboarding/colors');
    }
  }

  function getBackPath() {
    if (intent === 'refresh') return '/onboarding/refresh';
    if (intent === 'new') return '/onboarding/inspiration';
    return '/onboarding';
  }

  return (
    <div style={{
      maxWidth: '72rem',
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
        {moodWasDetected ? 'Confirm the design language' : 'Choose your design language'}
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-body)',
        marginBottom: 'var(--space-6)',
        maxWidth: '40rem',
        lineHeight: 'var(--leading-normal)',
      }}>
        {moodWasDetected
          ? <>Based on {extractDomain(inspirationUrl)}, we detected a <strong style={{ color: 'var(--color-green-deep)', textTransform: 'capitalize' }}>{designLanguage}</strong> feel. Confirm or pick a different direction. Each preview uses your actual colors.</>
          : 'This shapes everything — layout density, corner radii, shadow style, spacing, and animation. Each preview uses your actual colors so you can feel the difference.'
        }
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 22rem), 1fr))',
        gap: 'var(--space-4)',
      }}>
        {DESIGN_LANGUAGE_IDS.map((id) => {
          const lang = DESIGN_LANGUAGES[id];
          const isSelected = designLanguage === id;
          const isDetected = moodWasDetected && id === designLanguage;

          return (
            <button
              key={id}
              onClick={() => setDesignLanguage(id)}
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
                transition: 'all var(--duration-fast) var(--ease-out)',
                transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                position: 'relative',
              }}
            >
              {isDetected && (
                <span style={{
                  position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 2,
                  fontSize: '0.6rem', fontWeight: 600, color: 'var(--color-green-deep)',
                  background: 'var(--color-green-muted)', padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)', letterSpacing: '0.06em', textTransform: 'uppercase',
                  border: '1px solid rgba(48, 110, 94, 0.15)',
                }}>
                  Detected
                </span>
              )}

              <MiniMockup lang={lang} userColors={colors} userTypography={typography} />

              <div style={{ padding: 'var(--space-2) var(--space-3) var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {lang.label}
                  </span>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-green-deep)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-green-deep)', marginBottom: '0.25rem' }}>
                  {lang.subtitle}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-normal)' }}>
                  {lang.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 'var(--space-8)',
      }}>
        <button
          onClick={() => router.push(getBackPath())}
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
          onClick={handleNext}
          disabled={!designLanguage}
          style={{
            background: designLanguage ? 'var(--color-orange)' : 'var(--color-border)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 'var(--text-base)',
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: designLanguage ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          Next: Colors &rarr;
        </button>
      </div>
    </div>
  );
}

function MiniMockup({ lang, userColors, userTypography }: {
  lang: DesignLanguagePreset;
  userColors: { primary: string; secondary: string; accent: string; background: string; text: string };
  userTypography: { heading: string; body: string };
}) {
  const shadow = getShadowCSS(lang.shadowStyle, `${userColors.primary}22`);
  const spacing = getSpacingScale(lang.spacingDensity);
  const r = lang.borderRadius;

  const isDark = isColorDark(userColors.background);
  const textColor = userColors.text;
  const mutedText = isDark ? `${textColor}99` : `${textColor}88`;

  return (
    <div style={{
      width: '100%',
      aspectRatio: '16 / 11',
      background: userColors.background,
      overflow: 'hidden',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '10px',
      position: 'relative',
    }}>
      {/* Nav */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        <div style={{
          width: '40px', height: '8px',
          borderRadius: r.sm,
          background: userColors.primary,
        }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              width: '24px', height: '5px',
              borderRadius: r.sm,
              background: mutedText,
              opacity: 0.4,
            }} />
          ))}
        </div>
        <div style={{
          padding: '3px 8px',
          borderRadius: r.md,
          background: userColors.accent,
          color: isColorDark(userColors.accent) ? '#fff' : '#000',
          fontSize: '6px',
          fontWeight: 600,
          fontFamily: `'${userTypography.body}', sans-serif`,
        }}>
          CTA
        </div>
      </div>

      {/* Hero */}
      <div style={{
        padding: `${lang.spacingDensity === 'generous' ? '16px' : lang.spacingDensity === 'balanced' ? '12px' : '8px'} 12px`,
        flex: lang.layoutPreference === 'asymmetric' ? 'none' : 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: lang.layoutPreference === 'asymmetric' ? 'flex-start' : 'center',
        textAlign: lang.layoutPreference === 'asymmetric' ? 'left' : 'center',
      }}>
        <div style={{
          fontFamily: `'${userTypography.heading}', serif`,
          fontSize: lang.spacingDensity === 'tight' ? '14px' : '16px',
          fontWeight: 700,
          color: textColor,
          lineHeight: 1.2,
          marginBottom: '4px',
          maxWidth: lang.layoutPreference === 'asymmetric' ? '70%' : '85%',
        }}>
          Design that speaks
        </div>
        <div style={{
          fontFamily: `'${userTypography.body}', sans-serif`,
          fontSize: '7px',
          color: mutedText,
          lineHeight: 1.5,
          marginBottom: '8px',
          maxWidth: lang.layoutPreference === 'asymmetric' ? '60%' : '75%',
        }}>
          Every pixel, every token, every component.
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{
            padding: '4px 10px',
            borderRadius: r.md,
            background: userColors.primary,
            color: isColorDark(userColors.primary) ? '#fff' : '#000',
            fontSize: '6px',
            fontWeight: 600,
            fontFamily: `'${userTypography.body}', sans-serif`,
            boxShadow: shadow !== 'none' ? shadow : undefined,
          }}>
            Get started
          </div>
          <div style={{
            padding: '4px 10px',
            borderRadius: r.md,
            border: `1px solid ${userColors.primary}`,
            color: userColors.primary,
            fontSize: '6px',
            fontWeight: 500,
            fontFamily: `'${userTypography.body}', sans-serif`,
          }}>
            Learn more
          </div>
        </div>
      </div>

      {/* Feature cards row */}
      <div style={{
        display: 'flex',
        gap: lang.spacingDensity === 'generous' ? '8px' : '5px',
        padding: '0 12px 10px',
      }}>
        {[userColors.primary, userColors.secondary, userColors.accent].map((c, i) => (
          <div key={i} style={{
            flex: 1,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: r.md,
            padding: lang.spacingDensity === 'generous' ? '8px' : '6px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
            boxShadow: shadow,
          }}>
            <div style={{
              width: '14px', height: '14px',
              borderRadius: lang.imageShape === 'rounded' ? r.lg : r.sm,
              background: `${c}33`,
              border: `1px solid ${c}44`,
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c }} />
            </div>
            <div style={{
              width: '60%', height: '4px',
              borderRadius: r.sm,
              background: textColor,
              opacity: 0.7,
              marginBottom: '3px',
            }} />
            <div style={{
              width: '90%', height: '3px',
              borderRadius: r.sm,
              background: mutedText,
              opacity: 0.3,
              marginBottom: '2px',
            }} />
            <div style={{
              width: '75%', height: '3px',
              borderRadius: r.sm,
              background: mutedText,
              opacity: 0.3,
            }} />
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div style={{
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
        padding: '4px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ width: '30px', height: '3px', borderRadius: r.sm, background: mutedText, opacity: 0.3 }} />
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ width: '16px', height: '3px', borderRadius: r.sm, background: mutedText, opacity: 0.2 }} />
          ))}
        </div>
      </div>
    </div>
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
