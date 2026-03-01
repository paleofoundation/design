'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore, type ColorRole } from '../store';
import { StepIndicator, ToggleCard } from '../components';

const ROLES: { id: ColorRole; label: string }[] = [
  { id: 'primary', label: 'Primary' },
  { id: 'secondary', label: 'Secondary' },
  { id: 'accent', label: 'Accent' },
  { id: 'background', label: 'Background' },
  { id: 'text', label: 'Text' },
];

export default function OnboardingAnalyze() {
  const router = useRouter();
  const {
    extraction,
    screenshot,
    inspirationUrl,
    adoptions,
    additionalContext,
    detectedColors,
    colorRoleAssignments,
    setField,
    assignColorRole,
    addDetectedColor,
  } = useOnboardingStore();

  const [eyedropperActive, setEyedropperActive] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [adjustingColors, setAdjustingColors] = useState(false);
  const [assigningRole, setAssigningRole] = useState<ColorRole | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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
  const { typography, spacing, personality } = extraction;

  const hasFonts = typography?.fontFamilies?.heading || typography?.fontFamilies?.primary;
  const hasMood = personality?.tone || personality?.energy;
  const hasSpacing = spacing?.borderRadius && spacing.borderRadius !== '0';
  const hasColors = ROLES.some((r) => colorRoleAssignments[r.id]);

  const headingFont = typography?.fontFamilies?.heading || typography?.fontFamilies?.primary || '';
  const bodyFont = typography?.fontFamilies?.primary || typography?.fontFamilies?.heading || '';

  const handleScreenshotClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!eyedropperActive) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();

    addDetectedColor(hex);

    if (assigningRole) {
      assignColorRole(assigningRole, hex);
      setAssigningRole(null);
    }

    setEyedropperActive(false);
    setHoveredColor(null);
  }, [eyedropperActive, addDetectedColor, assigningRole, assignColorRole]);

  const handleScreenshotMove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!eyedropperActive) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (canvas.width !== img.naturalWidth) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    setHoveredColor(hex);
  }, [eyedropperActive]);

  function handleSwatchClick(hex: string) {
    if (assigningRole) {
      assignColorRole(assigningRole, hex);
      setAssigningRole(null);
    }
  }

  return (
    <div style={{
      maxWidth: '48rem',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-4)',
      width: '100%',
    }}>
      <StepIndicator current={2} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

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

      {/* Screenshot */}
      {screenshot && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{
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
              ref={imgRef}
              src={screenshot}
              alt={`Screenshot of ${domain}`}
              crossOrigin="anonymous"
              onClick={handleScreenshotClick}
              onMouseMove={handleScreenshotMove}
              onMouseLeave={() => setHoveredColor(null)}
              style={{
                width: '100%',
                display: 'block',
                maxHeight: '20rem',
                objectFit: 'cover',
                objectPosition: 'top',
                cursor: eyedropperActive ? 'crosshair' : 'default',
              }}
            />
          </div>
          {eyedropperActive && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-2)',
            }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-green-deep)', fontWeight: 500 }}>
                {assigningRole
                  ? <>Click the screenshot to pick a color for <strong style={{ textTransform: 'capitalize' }}>{assigningRole}</strong></>
                  : 'Click anywhere on the screenshot to pick a color'
                }
              </span>
              {hoveredColor && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.5rem',
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '2px',
                    background: hoveredColor,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }} />
                  <code style={{ fontSize: '0.625rem', fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)', color: 'var(--color-text-primary)' }}>
                    {hoveredColor}
                  </code>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setEyedropperActive(false); setAssigningRole(null); setHoveredColor(null); }}
                style={{
                  marginLeft: 'auto',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textDecoration: 'underline',
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Colors card — pre-filled, with adjust option */}
      {hasColors && (
        <ToggleCard
          active={adoptions.colors}
          onToggle={() => toggleAdoption('colors')}
          label="Colors"
          badge={`${detectedColors.length} detected`}
        >
          {/* Pre-filled role swatches */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            {ROLES.map((role) => {
              const hex = colorRoleAssignments[role.id];
              if (!hex) return null;
              return (
                <div key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: hex,
                    border: '1px solid rgba(0,0,0,0.08)',
                    flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                      {role.label}
                    </p>
                    <p style={{
                      fontSize: '0.625rem',
                      fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.2,
                    }}>
                      {hex}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Adjust toggle */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setAdjustingColors(!adjustingColors); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              color: adjustingColors ? 'var(--color-green-deep)' : 'var(--color-orange)',
              background: adjustingColors ? 'var(--color-green-muted)' : 'var(--color-orange-muted)',
              border: adjustingColors
                ? '1px solid rgba(48, 110, 94, 0.2)'
                : '1px solid rgba(255, 103, 25, 0.15)',
              borderRadius: 'var(--radius-full)',
              padding: '0.3rem 0.75rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all var(--duration-fast) var(--ease-out)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {adjustingColors
                ? <path d="M20 6 9 17l-5-5" />
                : <><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></>
              }
            </svg>
            {adjustingColors ? 'Done' : 'Edit colors'}
          </button>

          {/* Expandable adjustment panel */}
          {adjustingColors && (
            <div style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-2)',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}>
              {/* Full detected palette */}
              {detectedColors.length > 0 && (
                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
                    All detected colors {assigningRole && <>&mdash; click one to assign as <strong style={{ color: 'var(--color-green-deep)', textTransform: 'capitalize' }}>{assigningRole}</strong></>}
                  </p>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {detectedColors.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        title={`${c.name}: ${c.usage}`}
                        onClick={(e) => { e.stopPropagation(); handleSwatchClick(c.hex); }}
                        style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: 'var(--radius-sm)',
                          background: c.hex,
                          border: assigningRole ? '2px solid var(--color-green-deep)' : '1px solid rgba(0,0,0,0.1)',
                          cursor: assigningRole ? 'pointer' : 'default',
                          padding: 0,
                          flexShrink: 0,
                          transition: 'transform var(--duration-fast) var(--ease-out)',
                        }}
                        onMouseEnter={(e) => { if (assigningRole) e.currentTarget.style.transform = 'scale(1.15)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Role reassignment rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {ROLES.map((role) => {
                  const assigned = colorRoleAssignments[role.id];
                  const isActive = assigningRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setAssigningRole(isActive ? null : role.id); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.375rem 0.5rem',
                        background: isActive ? 'var(--color-green-muted)' : 'transparent',
                        border: isActive ? '1px solid var(--color-green-deep)' : '1px solid transparent',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'all var(--duration-fast) var(--ease-out)',
                      }}
                    >
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '3px',
                        background: assigned || 'repeating-conic-gradient(#ddd 0% 25%, transparent 0% 50%) 50%/6px 6px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-primary)', minWidth: '4rem' }}>
                        {role.label}
                      </span>
                      {assigned && (
                        <code style={{ fontSize: '0.625rem', fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)', color: 'var(--color-text-muted)' }}>
                          {assigned}
                        </code>
                      )}
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '0.625rem',
                        color: isActive ? 'var(--color-green-deep)' : 'var(--color-text-muted)',
                        fontWeight: isActive ? 600 : 400,
                      }}>
                        {isActive ? 'pick a swatch above' : 'tap to change'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Eyedropper */}
              <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setEyedropperActive(!eyedropperActive); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    background: eyedropperActive ? 'var(--color-green-deep)' : 'transparent',
                    color: eyedropperActive ? 'white' : 'var(--color-text-muted)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.375rem 0.5rem',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all var(--duration-fast) var(--ease-out)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m2 22 1-1h3l9-9" /><path d="M3 21v-3l9-9" />
                    <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3L15 6" />
                  </svg>
                  {eyedropperActive ? 'Click the screenshot above' : 'Missing a color? Pick from screenshot'}
                </button>
              </div>
            </div>
          )}
        </ToggleCard>
      )}

      {/* Other toggle cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
        marginTop: hasColors ? 'var(--space-3)' : 0,
      }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
            const ra = useOnboardingStore.getState().colorRoleAssignments;
            const cur = useOnboardingStore.getState().colors;
            useOnboardingStore.setState({
              colors: {
                primary: ra.primary || cur.primary,
                secondary: ra.secondary || cur.secondary,
                accent: ra.accent || cur.accent,
                background: ra.background || cur.background,
                text: ra.text || cur.text,
              },
            });
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
