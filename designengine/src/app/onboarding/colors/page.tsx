'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store';
import { StepIndicator } from '../components';
import { getDesignLanguage, getShadowCSS } from '@/lib/design-language';

const COLOR_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  background: 'Background',
  text: 'Text',
};

export default function OnboardingColors() {
  const router = useRouter();
  const {
    designLanguage, colors, setField, intent,
    keepAttributes, extractionStatus, inspirationUrl, colorRoleAssignments,
  } = useOnboardingStore();

  const isRefresh = intent === 'refresh';
  const hasExtraction = extractionStatus === 'done';
  const keepingColors = isRefresh && keepAttributes.colors;

  // If refresh user is keeping colors, skip this step
  useEffect(() => {
    if (keepingColors) {
      const keepTypo = useOnboardingStore.getState().keepAttributes.typography;
      if (keepTypo) {
        router.replace('/onboarding/style');
      } else {
        router.replace('/onboarding/typography');
      }
    }
  }, [keepingColors, router]);

  if (keepingColors) return null;

  const stepNumber = 4;

  const lang = getDesignLanguage(designLanguage);
  const palettes = lang.curatedPalettes;

  const changingColors = isRefresh && !keepAttributes.colors;

  const r = colorRoleAssignments;
  const extractedPalette = hasExtraction && (r.primary || r.secondary || r.accent)
    ? {
        name: `From ${extractDomain(inspirationUrl)}`,
        colors: {
          primary: r.primary || colors.primary,
          secondary: r.secondary || colors.secondary,
          accent: r.accent || colors.accent,
          background: r.background || colors.background,
          text: r.text || colors.text,
        },
      }
    : null;

  function extractDomain(url: string): string {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  function selectPalette(palette: { colors: typeof colors }) {
    setField('colors', { ...palette.colors });
  }

  function updateColor(key: keyof typeof colors, value: string) {
    setField('colors', { ...colors, [key]: value });
  }

  return (
    <div style={{
      maxWidth: '64rem',
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
        {changingColors ? 'Refine your colors' : 'Choose your colors'}
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-body)',
        marginBottom: 'var(--space-6)',
        maxWidth: '38rem',
      }}>
        {changingColors
          ? 'Your original colors are shown as a reference. Pick a harmonious alternative, or fine-tune each color individually.'
          : `Pick a curated palette for the "${lang.label}" design language, or build your own. These become the CSS variables and Tailwind config for your entire project.`
        }
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: 'var(--space-6)',
      }}>
        {/* Left: Palette selection */}
        <div>
          {/* Extracted palette pinned at top for refresh users */}
          {extractedPalette && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{
                fontSize: 'var(--text-sm)', fontWeight: 500,
                color: 'var(--color-green-deep)', marginBottom: 'var(--space-2)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              }}>
                <span style={{
                  fontSize: '0.625rem', fontWeight: 600,
                  background: 'var(--color-green-muted)',
                  padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)',
                  letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
                }}>
                  {changingColors ? 'Original' : 'Extracted'}
                </span>
                {extractedPalette.name}
              </p>
              <button
                onClick={() => selectPalette(extractedPalette)}
                style={{
                  textAlign: 'left', width: '100%', background: 'var(--color-white)',
                  border: '2px solid var(--color-green-deep)', borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2)', cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: 'var(--space-1)' }}>
                  {Object.values(extractedPalette.colors).map((c, i) => (
                    <div key={i} style={{
                      flex: 1, height: '2.5rem', borderRadius: 'var(--radius-sm)',
                      background: c, border: '1px solid rgba(0,0,0,0.06)',
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {extractedPalette.name}
                </p>
              </button>
            </div>
          )}

          {/* Curated palettes */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <p style={{
              fontSize: 'var(--text-sm)', fontWeight: 500,
              color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)',
            }}>
              {extractedPalette ? 'Or pick a curated alternative' : <>Curated for &ldquo;{lang.label}&rdquo;</>}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--space-2)',
            }}>
              {palettes.map((p) => {
                const isActive = Object.entries(p.colors).every(([k, v]) => colors[k as keyof typeof colors] === v);
                return (
                  <button
                    key={p.name}
                    onClick={() => selectPalette(p)}
                    style={{
                      textAlign: 'left',
                      background: 'var(--color-white)',
                      border: isActive
                        ? '2px solid var(--color-green-deep)'
                        : '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-2)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'border-color var(--duration-fast) var(--ease-out)',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: 'var(--space-1)' }}>
                      {Object.values(p.colors).map((c, i) => (
                        <div key={i} style={{
                          flex: 1, height: '1.75rem', borderRadius: 'var(--radius-sm)',
                          background: c, border: '1px solid rgba(0,0,0,0.06)',
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-primary)' }}>{p.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine-tune controls */}
          <div>
            <p style={{
              fontSize: 'var(--text-sm)', fontWeight: 500,
              color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)',
            }}>
              Fine-tune
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 8rem), 1fr))',
              gap: 'var(--space-2)',
            }}>
              {(Object.keys(colors) as Array<keyof typeof colors>).map((key) => (
                <div key={key}>
                  <label style={{
                    display: 'block', fontSize: 'var(--text-xs)',
                    fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.25rem',
                  }}>
                    {COLOR_LABELS[key]}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <input
                      type="color"
                      value={colors[key]}
                      onChange={(e) => updateColor(key, e.target.value)}
                      style={{
                        width: '2rem', height: '2rem',
                        border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer', padding: 0, background: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={colors[key]}
                      onChange={(e) => updateColor(key, e.target.value)}
                      style={{
                        flex: 1, background: 'var(--color-white)',
                        border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                        padding: '0.3rem 0.5rem', fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
                        color: 'var(--color-text-primary)', outline: 'none',
                        minWidth: 0,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Component grid preview */}
        <div style={{ position: 'sticky', top: 'var(--space-4)', alignSelf: 'start' }}>
          <p style={{
            fontSize: 'var(--text-xs)', fontWeight: 500,
            color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase', marginBottom: 'var(--space-2)',
          }}>
            Live preview
          </p>
          <ComponentGridPreview
            colors={colors}
            designLanguage={lang}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-8)' }}>
        <button onClick={() => router.push('/onboarding/design-language')} style={{
          background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-body)',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          &larr; Back
        </button>
        <button onClick={() => router.push('/onboarding/typography')} style={{
          background: 'var(--color-orange)', color: '#fff', fontWeight: 600, fontSize: 'var(--text-base)',
          padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Next: Typography &rarr;
        </button>
      </div>
    </div>
  );
}

function ComponentGridPreview({ colors, designLanguage }: {
  colors: { primary: string; secondary: string; accent: string; background: string; text: string };
  designLanguage: import('@/lib/design-language').DesignLanguagePreset;
}) {
  const r = designLanguage.borderRadius;
  const shadow = getShadowCSS(designLanguage.shadowStyle, `${colors.primary}22`);
  const isDark = isColorDark(colors.background);
  const subtleBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const mutedText = `${colors.text}88`;

  return (
    <div style={{
      background: colors.background,
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: `1px solid ${subtleBorder}`,
      }}>
        <div style={{
          width: '60px', height: '12px', borderRadius: r.sm, background: colors.primary,
        }} />
        <div style={{ display: 'flex', gap: '12px' }}>
          {['Home', 'About', 'Contact'].map((label) => (
            <span key={label} style={{
              fontSize: '11px', color: mutedText, fontWeight: 500,
            }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{
          padding: '4px 12px', borderRadius: r.md,
          background: colors.primary,
          color: isColorDark(colors.primary) ? '#fff' : '#000',
          fontSize: '10px', fontWeight: 600,
        }}>
          Sign up
        </div>
      </div>

      {/* Hero */}
      <div style={{
        padding: '24px 16px 20px',
        textAlign: 'center',
      }}>
        <h3 style={{
          fontSize: '20px', fontWeight: 700, color: colors.text,
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          lineHeight: 1.2, marginBottom: '6px',
        }}>
          Your heading here
        </h3>
        <p style={{
          fontSize: '11px', color: mutedText, lineHeight: 1.6,
          marginBottom: '12px', maxWidth: '260px', margin: '0 auto 12px',
        }}>
          Body text with comfortable line height. This is how paragraphs feel across your application.
        </p>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <span style={{
            background: colors.primary,
            color: isColorDark(colors.primary) ? '#fff' : '#000',
            padding: '6px 16px', borderRadius: r.md,
            fontSize: '10px', fontWeight: 600, boxShadow: shadow,
          }}>Get started</span>
          <span style={{
            border: `1.5px solid ${colors.primary}`, color: colors.primary,
            padding: '6px 16px', borderRadius: r.md,
            fontSize: '10px', fontWeight: 500,
          }}>Learn more</span>
        </div>
      </div>

      {/* Card */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${subtleBorder}`,
          borderRadius: r.lg, padding: '12px', boxShadow: shadow,
          display: 'flex', gap: '12px', alignItems: 'center',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: r.md, flexShrink: 0,
            background: `${colors.accent}22`, border: `1px solid ${colors.accent}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors.accent }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: colors.text, marginBottom: '2px' }}>Feature card</div>
            <div style={{ fontSize: '9px', color: mutedText, lineHeight: 1.4 }}>A brief description of this feature using your chosen palette.</div>
          </div>
        </div>
      </div>

      {/* Input + Badge row */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{
          flex: 1, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
          border: `1.5px solid ${colors.primary}44`, borderRadius: r.md,
          padding: '6px 10px', fontSize: '10px', color: mutedText,
        }}>
          Email address
        </div>
        <span style={{
          background: `${colors.secondary}22`,
          color: colors.secondary, fontSize: '9px', fontWeight: 600,
          padding: '3px 8px', borderRadius: r.full,
          border: `1px solid ${colors.secondary}33`,
        }}>
          New
        </span>
        <span style={{
          background: `${colors.accent}22`,
          color: colors.accent, fontSize: '9px', fontWeight: 600,
          padding: '3px 8px', borderRadius: r.full,
          border: `1px solid ${colors.accent}33`,
        }}>
          Beta
        </span>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${subtleBorder}`,
        padding: '10px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: '9px', color: mutedText }}>
          &copy; 2026 Your Brand
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Privacy', 'Terms', 'Contact'].map((l) => (
            <span key={l} style={{ fontSize: '9px', color: colors.secondary, fontWeight: 500 }}>{l}</span>
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
