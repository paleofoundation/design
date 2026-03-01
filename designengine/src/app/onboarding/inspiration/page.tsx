'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore, type InspirationUrls, type ExtractionBranding } from '../store';
import { StepIndicator, LoadingDots } from '../components';

type SlotKey = keyof InspirationUrls;

interface SlotConfig {
  key: SlotKey;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const SLOTS: SlotConfig[] = [
  {
    key: 'colors',
    label: 'Colors',
    description: 'A site whose color palette you love',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="8" r="2" fill="currentColor" /><circle cx="8" cy="14" r="2" fill="currentColor" /><circle cx="16" cy="14" r="2" fill="currentColor" /></svg>,
  },
  {
    key: 'typography',
    label: 'Typography',
    description: 'A site whose fonts feel right',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></svg>,
  },
  {
    key: 'layout',
    label: 'Layout & Feel',
    description: 'A site whose structure and vibe you admire',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>,
  },
  {
    key: 'general',
    label: 'General Inspiration',
    description: 'Another site you admire (optional)',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>,
  },
];

interface SlotExtraction {
  branding: ExtractionBranding | null;
  screenshot: string | null;
  loading: boolean;
  error: string;
  done: boolean;
}

type SlotExtractions = Record<SlotKey, SlotExtraction>;

const emptySlot: SlotExtraction = { branding: null, screenshot: null, loading: false, error: '', done: false };

export default function OnboardingInspiration() {
  const router = useRouter();
  const { inspirationUrls, setField } = useOnboardingStore();
  const applyExtraction = useOnboardingStore((s) => s.applyExtraction);
  const [extractions, setExtractions] = useState<SlotExtractions>({
    colors: { ...emptySlot },
    typography: { ...emptySlot },
    layout: { ...emptySlot },
    general: { ...emptySlot },
  });

  const filledSlots = Object.entries(inspirationUrls).filter(([, v]) => v.trim().length > 0);
  const extractedSlots = Object.entries(extractions).filter(([, v]) => v.done);
  const hasAtLeastOne = filledSlots.length > 0;
  const allExtracted = filledSlots.length > 0 && filledSlots.every(([k]) => extractions[k as SlotKey].done);
  const anyLoading = Object.values(extractions).some((v) => v.loading);

  function updateUrl(key: SlotKey, value: string) {
    setField('inspirationUrls', { ...inspirationUrls, [key]: value });
    if (!value.trim()) {
      setExtractions((prev) => ({ ...prev, [key]: { ...emptySlot } }));
    }
  }

  async function extractSlot(key: SlotKey) {
    const url = inspirationUrls[key].trim();
    if (!url) return;

    setExtractions((prev) => ({
      ...prev,
      [key]: { ...prev[key], loading: true, error: '', done: false },
    }));

    try {
      const res = await fetch('/api/onboarding/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.success && data.branding) {
        setExtractions((prev) => ({
          ...prev,
          [key]: { branding: data.branding, screenshot: data.screenshot, loading: false, error: '', done: true },
        }));
      } else {
        setExtractions((prev) => ({
          ...prev,
          [key]: { ...prev[key], loading: false, error: data.error || 'Could not analyze this site.', done: false },
        }));
      }
    } catch {
      setExtractions((prev) => ({
        ...prev,
        [key]: { ...prev[key], loading: false, error: 'Network error. Please try again.', done: false },
      }));
    }
  }

  async function extractAll() {
    const slots = filledSlots.filter(([k]) => !extractions[k as SlotKey].done);
    await Promise.all(slots.map(([k]) => extractSlot(k as SlotKey)));
  }

  function handleNext() {
    const colorSource = extractions.colors.branding || extractions.general.branding;
    const typoSource = extractions.typography.branding || extractions.general.branding;
    const layoutSource = extractions.layout.branding || extractions.general.branding;

    if (colorSource) {
      const fc = colorSource.colors;
      useOnboardingStore.setState({
        colors: {
          primary: fc.primary || '#306E5E',
          secondary: fc.secondary || '#FF6719',
          accent: fc.accent || '#F2B245',
          background: fc.background || '#FDFBF7',
          text: fc.textPrimary || '#1A1A1A',
        },
        colorRoleAssignments: {
          primary: fc.primary || '',
          secondary: fc.secondary || '',
          accent: fc.accent || '',
          background: fc.background || '',
          text: fc.textPrimary || '',
        },
      });
    }

    if (typoSource?.typography?.fontFamilies) {
      const tf = typoSource.typography.fontFamilies;
      useOnboardingStore.setState({
        typography: {
          heading: tf.heading || tf.primary || 'Fraunces',
          body: tf.primary || tf.heading || 'Source Sans 3',
        },
      });
    }

    // Store the first available URL as the main inspiration URL for backward compat
    const firstUrl = inspirationUrls.colors || inspirationUrls.typography || inspirationUrls.layout || inspirationUrls.general;
    useOnboardingStore.setState({ inspirationUrl: firstUrl });

    // Store all extractions
    useOnboardingStore.setState({
      inspirationExtractions: {
        colors: extractions.colors.branding,
        typography: extractions.typography.branding,
        layout: extractions.layout.branding,
        general: extractions.general.branding,
      },
    });

    // Apply full extraction from the most comprehensive source for mood detection
    const bestSource = extractions.general.branding || extractions.layout.branding || extractions.colors.branding || extractions.typography.branding;
    if (bestSource) {
      const bestScreenshot = extractions.general.screenshot || extractions.layout.screenshot || extractions.colors.screenshot || extractions.typography.screenshot;
      applyExtraction(bestSource, bestScreenshot);
    }

    router.push('/onboarding/design-language');
  }

  function extractDomain(url: string): string {
    try {
      const u = url.startsWith('http') ? url : `https://${url}`;
      return new URL(u).hostname.replace('www.', '');
    } catch {
      return url;
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

      <h1 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        lineHeight: 'var(--leading-tight)',
        marginBottom: 'var(--space-1)',
      }}>
        Gather your inspiration
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-body)',
        marginBottom: 'var(--space-6)',
        lineHeight: 'var(--leading-normal)',
      }}>
        Real designers pull from multiple sources. Add sites whose colors, typography, or layout you love &mdash; we&rsquo;ll extract the best from each and composite them into your starting point.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {SLOTS.map((slot) => {
          const url = inspirationUrls[slot.key];
          const ext = extractions[slot.key];
          const hasUrl = url.trim().length > 0;

          return (
            <div
              key={slot.key}
              style={{
                background: 'var(--color-white)',
                border: ext.done
                  ? '2px solid var(--color-green-deep)'
                  : '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                transition: 'border-color var(--duration-fast) var(--ease-out)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <div style={{ color: ext.done ? 'var(--color-green-deep)' : 'var(--color-text-muted)' }}>
                  {slot.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {slot.label}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {slot.description}
                  </p>
                </div>
                {ext.done && (
                  <span style={{
                    fontSize: '0.625rem', fontWeight: 600,
                    color: 'var(--color-green-deep)', background: 'var(--color-green-muted)',
                    padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)',
                    letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
                  }}>
                    Extracted
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateUrl(slot.key, e.target.value)}
                  placeholder="https://example.com"
                  disabled={ext.loading}
                  style={{
                    flex: 1,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem var(--space-2)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-green-deep)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                />
                {hasUrl && !ext.done && !ext.loading && (
                  <button
                    onClick={() => extractSlot(slot.key)}
                    style={{
                      background: 'var(--color-green-deep)',
                      color: 'white',
                      fontWeight: 500,
                      fontSize: 'var(--text-xs)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Extract
                  </button>
                )}
                {ext.loading && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    fontSize: 'var(--text-xs)', color: 'var(--color-green-deep)', fontWeight: 500,
                    padding: '0 0.5rem',
                  }}>
                    Analyzing <LoadingDots />
                  </span>
                )}
              </div>

              {ext.error && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-orange)', marginTop: 'var(--space-1)' }}>
                  {ext.error}
                </p>
              )}

              {/* Mini-preview of what was extracted */}
              {ext.done && ext.branding && (
                <div style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-2)',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}>
                  {slot.key === 'colors' && (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {[ext.branding.colors.primary, ext.branding.colors.secondary, ext.branding.colors.accent, ext.branding.colors.background].filter(Boolean).map((c, i) => (
                        <div key={i} style={{
                          flex: 1, height: '2rem', borderRadius: 'var(--radius-sm)',
                          background: c, border: '1px solid rgba(0,0,0,0.06)',
                        }} />
                      ))}
                    </div>
                  )}
                  {slot.key === 'typography' && ext.branding.typography?.fontFamilies && (
                    <div>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {ext.branding.typography.fontFamilies.heading || ext.branding.typography.fontFamilies.primary || 'Unknown'}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        Body: {ext.branding.typography.fontFamilies.primary || ext.branding.typography.fontFamilies.heading || 'Unknown'}
                      </p>
                    </div>
                  )}
                  {slot.key === 'layout' && ext.screenshot && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ext.screenshot}
                      alt={`Layout from ${extractDomain(url)}`}
                      style={{ width: '100%', height: '6rem', objectFit: 'cover', objectPosition: 'top', borderRadius: 'var(--radius-sm)' }}
                    />
                  )}
                  {slot.key === 'general' && (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
                        {[ext.branding.colors.primary, ext.branding.colors.secondary, ext.branding.colors.accent].filter(Boolean).map((c, i) => (
                          <div key={i} style={{ width: '1.5rem', height: '1.5rem', borderRadius: 'var(--radius-sm)', background: c, border: '1px solid rgba(0,0,0,0.06)' }} />
                        ))}
                      </div>
                      {ext.branding.typography?.fontFamilies && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {ext.branding.typography.fontFamilies.heading || ext.branding.typography.fontFamilies.primary}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Composite preview */}
      {extractedSlots.length > 0 && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
        }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-2)',
          }}>
            Composite preview
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {extractions.colors.done && extractions.colors.branding && (
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                  Colors from {extractDomain(inspirationUrls.colors)}
                </p>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[extractions.colors.branding.colors.primary, extractions.colors.branding.colors.secondary, extractions.colors.branding.colors.accent].filter(Boolean).map((c, i) => (
                    <div key={i} style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: c, border: '1px solid rgba(0,0,0,0.06)' }} />
                  ))}
                </div>
              </div>
            )}
            {extractions.typography.done && extractions.typography.branding?.typography?.fontFamilies && (
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                  Fonts from {extractDomain(inspirationUrls.typography)}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {extractions.typography.branding.typography.fontFamilies.heading || extractions.typography.branding.typography.fontFamilies.primary}
                </p>
              </div>
            )}
            {extractions.layout.done && (
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                  Layout from {extractDomain(inspirationUrls.layout)}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-green-deep)' }}>
                  Extracted
                </p>
              </div>
            )}
          </div>
        </div>
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

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {hasAtLeastOne && !allExtracted && (
            <button
              onClick={extractAll}
              disabled={anyLoading}
              style={{
                background: 'var(--color-green-deep)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: anyLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {anyLoading ? <>Analyzing <LoadingDots /></> : 'Extract all'}
            </button>
          )}
          {allExtracted && (
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
    </div>
  );
}
