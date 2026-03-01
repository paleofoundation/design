'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore, type ColorRole } from '../store';
import { StepIndicator, LoadingDots } from '../components';

const ROLES: { id: ColorRole; label: string }[] = [
  { id: 'primary', label: 'Primary' },
  { id: 'secondary', label: 'Secondary' },
  { id: 'accent', label: 'Accent' },
  { id: 'background', label: 'Background' },
  { id: 'text', label: 'Text' },
];

const LAYOUT_LABELS: Record<string, string> = {
  'traditional': 'Traditional header + content layout',
  'hero-driven': 'Full-width hero-driven layout',
  'asymmetric': 'Asymmetric / creative layout',
  'dense': 'Dense information-rich grid',
};

export default function OnboardingRefresh() {
  const router = useRouter();
  const store = useOnboardingStore();
  const {
    ownSiteUrl,
    extraction,
    screenshot,
    keepAttributes,
    detectedColors,
    colorRoleAssignments,
    detectedLayout,
    setField,
    assignColorRole,
    addDetectedColor,
  } = store;

  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [extracted, setExtracted] = useState(!!extraction);
  const [eyedropperActive, setEyedropperActive] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [assigningRole, setAssigningRole] = useState<ColorRole | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const applyExtraction = useOnboardingStore((s) => s.applyExtraction);

  const hasUrl = ownSiteUrl.trim().length > 0;

  function extractDomain(url: string): string {
    try {
      const u = url.startsWith('http') ? url : `https://${url}`;
      return new URL(u).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  async function handleExtract() {
    if (!hasUrl) return;
    setExtracting(true);
    setExtractError('');
    useOnboardingStore.setState({ extractionStatus: 'loading' });

    try {
      const res = await fetch('/api/onboarding/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ownSiteUrl.trim() }),
      });
      const data = await res.json();

      if (data.success && data.branding) {
        applyExtraction(data.branding, data.screenshot, data.aiColors, data.aiFonts, data.aiMood, data.aiLayout || null, data.siteContent || null);
        setField('inspirationUrl', ownSiteUrl.trim());
        setExtracted(true);
      } else {
        setExtractError(data.error || 'Could not analyze this site. Try a different URL.');
        useOnboardingStore.setState({ extractionStatus: 'error' });
      }
    } catch {
      setExtractError('Could not reach the server. Please try again.');
      useOnboardingStore.setState({ extractionStatus: 'error' });
    } finally {
      setExtracting(false);
    }
  }

  function toggleKeep(attr: keyof typeof keepAttributes) {
    setField('keepAttributes', { ...keepAttributes, [attr]: !keepAttributes[attr] });
  }

  function handleNext() {
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
    router.push('/onboarding/design-language');
  }

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

  const headingFont = extraction?.typography?.fontFamilies?.heading || extraction?.typography?.fontFamilies?.primary || '';
  const bodyFont = extraction?.typography?.fontFamilies?.primary || extraction?.typography?.fontFamilies?.heading || '';
  const hasColors = ROLES.some((r) => colorRoleAssignments[r.id]);
  const hasFonts = headingFont || bodyFont;
  const domain = ownSiteUrl ? extractDomain(ownSiteUrl) : '';

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
        {extracted ? `Your design DNA` : `Enter your website`}
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-body)',
        marginBottom: 'var(--space-6)',
        lineHeight: 'var(--leading-normal)',
      }}>
        {extracted
          ? <>We analyzed <strong style={{ color: 'var(--color-green-deep)' }}>{domain}</strong> and extracted its design DNA. Tell us what to keep and what to change.</>
          : `We'll analyze your current site and show you exactly what we find — colors, fonts, layout, and mood. Then you decide what stays and what gets refreshed.`
        }
      </p>

      {/* URL Input (pre-extraction) */}
      {!extracted && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-0-5)',
          }}>
            Your website URL <span style={{ color: 'var(--color-orange)' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              type="text"
              value={ownSiteUrl}
              onChange={(e) => setField('ownSiteUrl', e.target.value)}
              placeholder="https://yoursite.com"
              style={{
                flex: 1,
                background: 'var(--color-white)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.625rem var(--space-2)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'border-color var(--duration-fast) var(--ease-out)',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-green-deep)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              onKeyDown={(e) => { if (e.key === 'Enter' && hasUrl) handleExtract(); }}
            />
            <button
              onClick={handleExtract}
              disabled={!hasUrl || extracting}
              style={{
                background: hasUrl && !extracting ? 'var(--color-orange)' : 'var(--color-border)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                padding: '0.625rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: hasUrl && !extracting ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {extracting ? <>Analyzing <LoadingDots /></> : 'Analyze site'}
            </button>
          </div>
          {extractError && (
            <div style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-1) var(--space-2)',
              background: 'var(--color-orange-muted)',
              border: '1px solid rgba(255,103,25,0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-2)',
            }}>
              <span>{extractError}</span>
              <button
                type="button"
                onClick={handleExtract}
                disabled={extracting}
                style={{
                  background: 'var(--color-orange)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 'var(--text-xs)',
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Post-extraction: Design DNA Dashboard */}
      {extracted && (
        <>
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
                    maxHeight: '18rem',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    cursor: eyedropperActive ? 'crosshair' : 'default',
                  }}
                />
              </div>
              {eyedropperActive && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-green-deep)', fontWeight: 500 }}>
                    Click the screenshot to pick a color
                  </span>
                  {hoveredColor && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.5rem', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ width: '1rem', height: '1rem', borderRadius: '2px', background: hoveredColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                      <code style={{ fontSize: '0.625rem', fontFamily: 'var(--font-jetbrains)', color: 'var(--color-text-primary)' }}>{hoveredColor}</code>
                    </div>
                  )}
                  <button type="button" onClick={() => { setEyedropperActive(false); setAssigningRole(null); setHoveredColor(null); }}
                    style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Attribute cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            {/* Colors */}
            {hasColors && (
              <AttributeCard
                label="Colors"
                badge={`${detectedColors.length} detected`}
                keeping={keepAttributes.colors}
                onToggle={() => toggleKeep('colors')}
              >
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {ROLES.map((role) => {
                    const hex = colorRoleAssignments[role.id];
                    if (!hex) return null;
                    return (
                      <div key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <div style={{
                          width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-sm)',
                          background: hex, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0,
                        }} />
                        <div>
                          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1 }}>{role.label}</p>
                          <p style={{ fontSize: '0.625rem', fontFamily: 'var(--font-jetbrains)', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>{hex}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!keepAttributes.colors && (
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <button type="button" onClick={() => setEyedropperActive(!eyedropperActive)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        background: eyedropperActive ? 'var(--color-green-deep)' : 'transparent',
                        color: eyedropperActive ? 'white' : 'var(--color-text-muted)',
                        border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.375rem 0.5rem',
                        fontSize: 'var(--text-xs)', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m2 22 1-1h3l9-9" /><path d="M3 21v-3l9-9" />
                        <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3L15 6" />
                      </svg>
                      Pick from screenshot
                    </button>
                  </div>
                )}
              </AttributeCard>
            )}

            {/* Typography */}
            {hasFonts && (
              <AttributeCard
                label="Typography"
                badge="detected"
                keeping={keepAttributes.typography}
                onToggle={() => toggleKeep('typography')}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {headingFont && (
                    <div>
                      <p style={{ fontFamily: `'${headingFont}', serif`, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)' }}>
                        {headingFont}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Heading font</p>
                    </div>
                  )}
                  {bodyFont && bodyFont !== headingFont && (
                    <div>
                      <p style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: 'var(--text-base)', fontWeight: 400, color: 'var(--color-text-primary)', lineHeight: 'var(--leading-normal)' }}>
                        {bodyFont} &mdash; The quick brown fox jumps over the lazy dog.
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Body font</p>
                    </div>
                  )}
                </div>
              </AttributeCard>
            )}

            {/* Layout */}
            <AttributeCard
              label="Layout Style"
              badge={detectedLayout ? 'detected' : 'default'}
              keeping={keepAttributes.layout}
              onToggle={() => toggleKeep('layout')}
            >
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {LAYOUT_LABELS[detectedLayout] || LAYOUT_LABELS['traditional']}
              </p>
              {!keepAttributes.layout && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  You&rsquo;ll be able to pick a new layout direction in the next step.
                </p>
              )}
            </AttributeCard>
          </div>

          {/* Additional context */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-0-5)',
            }}>
              Anything else about what you want to change?
            </label>
            <textarea
              value={store.additionalContext}
              onChange={(e) => setField('additionalContext', e.target.value)}
              placeholder="e.g. I love the colors but the layout feels dated. I want something more modern with big hero images..."
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
          </div>
        </>
      )}

      {/* Navigation */}
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
        {extracted && (
          <button
            onClick={handleNext}
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
            Next: Design language &rarr;
          </button>
        )}
      </div>
    </div>
  );
}

function AttributeCard({ label, badge, keeping, onToggle, children }: {
  label: string;
  badge: string;
  keeping: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--color-white)',
      border: keeping ? '2px solid var(--color-green-deep)' : '1.5px solid var(--color-orange)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-3)',
      transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
      boxShadow: keeping ? 'var(--shadow-sm)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</span>
          <span style={{
            fontSize: '0.625rem', fontWeight: 600,
            color: 'var(--color-green-deep)', background: 'var(--color-green-muted)',
            padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)',
            letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
          }}>
            {badge}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontSize: 'var(--text-xs)', fontWeight: 600,
            color: keeping ? 'var(--color-green-deep)' : 'var(--color-orange)',
            background: keeping ? 'var(--color-green-muted)' : 'var(--color-orange-muted)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '0.3rem 0.75rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all var(--duration-fast) var(--ease-out)',
          }}
        >
          {keeping ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Keeping
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
              Changing
            </>
          )}
        </button>
      </div>
      {children}
    </div>
  );
}
