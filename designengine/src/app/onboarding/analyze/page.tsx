'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store';
import { StepIndicator, ToggleCard } from '../components';

export default function OnboardingAnalyze() {
  const router = useRouter();
  const {
    extraction,
    screenshot,
    inspirationUrl,
    adoptions,
    additionalContext,
    setField,
  } = useOnboardingStore();

  if (!extraction) {
    router.replace('/onboarding');
    return null;
  }

  function toggleAdoption(key: keyof typeof adoptions) {
    const next = { ...adoptions, [key]: !adoptions[key] };
    setField('adoptions', next);
  }

  function extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  const domain = extractDomain(inspirationUrl);
  const { colors, typography, spacing, personality } = extraction;

  const hasColors = colors && (colors.primary || colors.secondary || colors.accent);
  const hasFonts = typography?.fontFamilies?.heading || typography?.fontFamilies?.primary;
  const hasMood = personality?.tone || personality?.energy;
  const hasSpacing = spacing?.borderRadius && spacing.borderRadius !== '0';

  const colorSwatches = [
    { label: 'Primary', hex: colors.primary },
    { label: 'Secondary', hex: colors.secondary },
    { label: 'Accent', hex: colors.accent },
    { label: 'Background', hex: colors.background },
    { label: 'Text', hex: colors.textPrimary },
  ].filter((s) => s.hex);

  const headingFont = typography?.fontFamilies?.heading || typography?.fontFamilies?.primary || '';
  const bodyFont = typography?.fontFamilies?.primary || typography?.fontFamilies?.heading || '';

  return (
    <div style={{
      maxWidth: '48rem',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-4)',
      width: '100%',
    }}>
      <StepIndicator current={2} />

      <h1 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        lineHeight: 'var(--leading-tight)',
        marginBottom: 'var(--space-1)',
      }}>
        Here&rsquo;s what we found
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-body)',
        marginBottom: 'var(--space-6)',
        lineHeight: 'var(--leading-normal)',
      }}>
        We analyzed <strong style={{ color: 'var(--color-green-deep)' }}>{domain}</strong> and extracted its design DNA. Toggle on what you love &mdash; we&rsquo;ll use it to seed your design system.
      </p>

      {screenshot && (
        <div style={{
          marginBottom: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{
            background: 'var(--color-surface)',
            padding: '0.5rem var(--space-2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: '#FEBC2E' }} />
            <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: '#28C840' }} />
            <span style={{
              marginLeft: 'auto',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
            }}>
              {domain}
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshot}
            alt={`Screenshot of ${domain}`}
            style={{
              width: '100%',
              display: 'block',
              maxHeight: '20rem',
              objectFit: 'cover',
              objectPosition: 'top',
            }}
          />
        </div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
      }}>
        {hasColors && (
          <ToggleCard
            active={adoptions.colors}
            onToggle={() => toggleAdoption('colors')}
            label="Colors"
            badge="detected"
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {colorSwatches.map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: s.hex,
                    border: '1px solid rgba(0,0,0,0.08)',
                    flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                      {s.label}
                    </p>
                    <p style={{
                      fontSize: '0.625rem',
                      fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.2,
                    }}>
                      {s.hex}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ToggleCard>
        )}

        {hasFonts && (
          <ToggleCard
            active={adoptions.typography}
            onToggle={() => toggleAdoption('typography')}
            label="Typography"
            badge="detected"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <div>
                <p style={{
                  fontFamily: `'${headingFont}', serif`,
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-tight)',
                }}>
                  {headingFont}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Heading font
                </p>
              </div>
              {bodyFont !== headingFont && (
                <div>
                  <p style={{
                    fontFamily: `'${bodyFont}', sans-serif`,
                    fontSize: 'var(--text-base)',
                    fontWeight: 400,
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-normal)',
                  }}>
                    {bodyFont} &mdash; The quick brown fox jumps over the lazy dog.
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Body font
                  </p>
                </div>
              )}
            </div>
          </ToggleCard>
        )}

        {hasMood && (
          <ToggleCard
            active={adoptions.mood}
            onToggle={() => toggleAdoption('mood')}
            label="Mood &amp; Personality"
            badge="detected"
          >
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {personality?.tone && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  color: 'var(--color-green-deep)',
                  background: 'var(--color-green-muted)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {personality.tone}
                </span>
              )}
              {personality?.energy && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  color: 'var(--color-orange)',
                  background: 'var(--color-orange-muted)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {personality.energy}
                </span>
              )}
              {personality?.targetAudience && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--leading-normal)',
                }}>
                  Target: {personality.targetAudience}
                </span>
              )}
            </div>
          </ToggleCard>
        )}

        {hasSpacing && (
          <ToggleCard
            active={adoptions.spacing}
            onToggle={() => toggleAdoption('spacing')}
            label="Spacing &amp; Roundness"
            badge="detected"
          >
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <div style={{
                width: '3rem',
                height: '2rem',
                borderRadius: spacing.borderRadius,
                border: '2px solid var(--color-green-deep)',
                background: 'var(--color-green-muted)',
              }} />
              <div>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Border radius: {spacing.borderRadius}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Base spacing: {spacing.baseUnit}px
                </p>
              </div>
            </div>
          </ToggleCard>
        )}
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-0-5)',
        }}>
          Anything else you love about this site?
        </label>
        <textarea
          value={additionalContext}
          onChange={(e) => setField('additionalContext', e.target.value)}
          placeholder="e.g. I love how clean and airy it feels, the way the sections breathe, the subtle animations on scroll..."
          rows={3}
          style={{
            width: '100%',
            background: 'var(--color-white)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-1) var(--space-2)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            resize: 'none',
            outline: 'none',
            transition: 'border-color var(--duration-fast) var(--ease-out)',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-green-deep)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
        />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          This context helps us fine-tune your design system beyond just tokens.
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={() => router.push('/onboarding')}
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
          onClick={() => {
            if (additionalContext.trim()) {
              const existing = useOnboardingStore.getState().brandDescription;
              const separator = existing ? ' | ' : '';
              setField('brandDescription', existing + separator + additionalContext.trim());
            }
            router.push('/onboarding/mood');
          }}
          style={{
            background: 'var(--color-orange)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 'var(--text-base)',
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Next: Refine mood &rarr;
        </button>
      </div>
    </div>
  );
}
