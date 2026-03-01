'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store';
import { StepIndicator, ProvenanceBadge } from '../components';
import { ART_STYLE_META } from '@/lib/svg/art-style-previews';
import { getDesignLanguage } from '@/lib/design-language';
import { LivePreview } from '../components/live-preview';

export default function OnboardingReview() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  const hasExtraction = store.extractionStatus === 'done';
  const isRefresh = store.intent === 'refresh';
  const stepNumber = 7;

  const lang = getDesignLanguage(store.designLanguage);

  function extractDomain(url: string): string {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: store.projectName,
          inspirationUrl: store.inspirationUrl,
          brandDescription: store.brandDescription,
          mood: store.designLanguage || store.mood,
          artStyle: store.artStyle,
          colors: store.colors,
          typography: store.typography,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  const mcpConfig = `{
  "mcpServers": {
    "dzyne": {
      "url": "https://dzyne.app/api/mcp/mcp"
    }
  }
}`;

  if (saved) {
    return (
      <div style={{
        maxWidth: '40rem',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-4)',
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          width: '4rem', height: '4rem',
          background: 'var(--color-green-muted)',
          borderRadius: 'var(--radius-full)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-4)', fontSize: 'var(--text-2xl)',
        }}>
          &#10003;
        </div>
        <h1 style={{
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontSize: 'var(--text-3xl)', fontWeight: 700,
          color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)',
        }}>
          Your design system is ready
        </h1>
        <p style={{
          fontSize: 'var(--text-base)', color: 'var(--color-text-body)',
          marginBottom: 'var(--space-6)',
          maxWidth: '28rem', margin: '0 auto var(--space-6)',
        }}>
          Project &ldquo;{store.projectName}&rdquo; is saved. Now connect your AI coding tools so every build stays on-brand.
        </p>

        <div style={{
          background: 'var(--color-green-darkest)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          textAlign: 'left',
          marginBottom: 'var(--space-4)',
        }}>
          <div style={{
            padding: 'var(--space-2) var(--space-3)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-on-green)' }}>Cursor</span>
            <code style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-jetbrains)', color: 'var(--color-amber)' }}>.cursor/mcp.json</code>
          </div>
          <pre style={{
            padding: 'var(--space-3)', fontSize: 'var(--text-xs)',
            lineHeight: 1.7, fontFamily: 'var(--font-jetbrains)',
            color: 'var(--color-text-on-green)', margin: 0, overflowX: 'auto',
          }}>
            {mcpConfig}
          </pre>
        </div>

        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-6)',
        }}>
          Once connected, start any coding session by asking your AI to call{' '}
          <code style={{
            fontFamily: 'var(--font-jetbrains)', fontSize: 'var(--text-xs)',
            color: 'var(--color-orange)', background: 'var(--color-orange-muted)',
            padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)',
          }}>get-design-profile</code>
          {' '}with project name &ldquo;{store.projectName}&rdquo;.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/dashboard')} style={{
            background: 'var(--color-orange)', color: '#fff', fontWeight: 600,
            fontSize: 'var(--text-base)', padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Go to Dashboard
          </button>
          <button onClick={() => router.push('/dashboard/playground')} style={{
            background: 'none', border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '0.75rem 1.5rem',
            fontSize: 'var(--text-sm)', color: 'var(--color-text-body)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Test in Playground
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '72rem',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-4)',
      width: '100%',
    }}>
      <StepIndicator current={stepNumber} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'var(--text-3xl)', fontWeight: 700,
            color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)',
            marginBottom: 'var(--space-1)',
          }}>
            This is what your AI tools will build
          </h1>
          <p style={{
            fontSize: 'var(--text-base)', color: 'var(--color-text-body)',
            maxWidth: '38rem',
          }}>
            A live preview of your design system applied to a real page. Every component, every color, every font &mdash; exactly as your AI coding tools will use it.
            {hasExtraction && (
              <> Elements sourced from <strong style={{ color: 'var(--color-green-deep)' }}>{extractDomain(store.inspirationUrl)}</strong> are marked in green.</>
            )}
          </p>
        </div>

        {/* Viewport toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          padding: '3px',
        }}>
          <button
            onClick={() => setViewport('desktop')}
            style={{
              background: viewport === 'desktop' ? 'var(--color-white)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              color: viewport === 'desktop' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: viewport === 'desktop' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Desktop
          </button>
          <button
            onClick={() => setViewport('mobile')}
            style={{
              background: viewport === 'mobile' ? 'var(--color-white)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              color: viewport === 'mobile' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: viewport === 'mobile' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            Mobile
          </button>
        </div>
      </div>

      {/* Side-by-side for refresh path */}
      {isRefresh && store.screenshot && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 'var(--space-2)',
          alignItems: 'start',
          marginBottom: 'var(--space-4)',
        }}>
          <div>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-1)',
            }}>
              Before
            </p>
            <div style={{
              borderRadius: 'var(--radius-md)', overflow: 'hidden',
              border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={store.screenshot}
                alt="Current site"
                style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'cover', objectPosition: 'top' }}
              />
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-4) 0',
            color: 'var(--color-text-muted)', fontSize: 'var(--text-2xl)',
          }}>
            &rarr;
          </div>
          <div>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-green-deep)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-1)',
            }}>
              After
            </p>
            <div style={{ fontSize: '9px' }}>
              <LivePreview
                projectName={store.projectName}
                colors={store.colors}
                typography={store.typography}
                designLanguage={lang}
                viewport="desktop"
              />
            </div>
          </div>
        </div>
      )}

      {/* Full preview */}
      {!(isRefresh && store.screenshot) && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <LivePreview
            projectName={store.projectName}
            colors={store.colors}
            typography={store.typography}
            designLanguage={lang}
            viewport={viewport}
          />
        </div>
      )}

      {/* Token summary grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
      }}>
        <ReviewSection
          title="Colors"
          provenance={hasExtraction && store.adoptions.colors ? 'extracted' : 'manual'}
          showProvenance={hasExtraction}
        >
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: 'var(--space-1)' }}>
            {Object.values(store.colors).map((v, i) => (
              <div key={i} style={{
                flex: 1, height: '2rem', borderRadius: 'var(--radius-sm)',
                background: v, border: '1px solid rgba(0,0,0,0.06)',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {Object.entries(store.colors).map(([k, v]) => (
              <code key={k} style={{
                fontSize: '0.6rem', fontFamily: 'var(--font-jetbrains)',
                color: 'var(--color-text-muted)', background: 'var(--color-surface)',
                padding: '0.1rem 0.3rem', borderRadius: 'var(--radius-sm)',
              }}>
                {k}: {v}
              </code>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection
          title="Typography"
          provenance={hasExtraction && store.adoptions.typography ? 'extracted' : 'manual'}
          showProvenance={hasExtraction}
        >
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
            {store.typography.heading}
          </p>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--color-text-body)' }}>
            {store.typography.body}
          </p>
        </ReviewSection>

        <ReviewSection
          title="Design Language"
          provenance={hasExtraction && store.adoptions.mood ? 'extracted' : 'manual'}
          showProvenance={hasExtraction}
        >
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-green-deep)', textTransform: 'capitalize' }}>
            {lang.label}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
            {lang.subtitle}
          </p>
        </ReviewSection>

        <ReviewSection title="Image Style" provenance="manual" showProvenance={false}>
          {store.artStyle ? (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-green-deep)' }}>
                {ART_STYLE_META[store.artStyle]?.label || store.artStyle}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                {ART_STYLE_META[store.artStyle]?.mood}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Not selected</p>
          )}
        </ReviewSection>

        <ReviewSection title="Project" provenance="manual" showProvenance={false}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {store.projectName}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
            {isRefresh ? 'Brand refresh' : 'New build'}
            {store.inspirationUrl && <> &middot; {extractDomain(store.inspirationUrl)}</>}
          </p>
        </ReviewSection>
      </div>

      {error && (
        <div style={{
          background: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.2)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-2)',
          marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-error)',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => router.push('/onboarding/style')} style={{
          background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-body)',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          &larr; Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: 'var(--color-orange)',
            color: '#fff', fontWeight: 600, fontSize: 'var(--text-base)',
            padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)',
            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1, fontFamily: 'inherit',
          }}
        >
          {saving ? 'Saving...' : 'Save design system'}
        </button>
      </div>
    </div>
  );
}

function ReviewSection({ title, children, provenance, showProvenance }: {
  title: string;
  children: React.ReactNode;
  provenance: 'extracted' | 'manual';
  showProvenance: boolean;
}) {
  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-3)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'var(--space-2)',
      }}>
        <p style={{
          fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-muted)',
          letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
        }}>
          {title}
        </p>
        {showProvenance && <ProvenanceBadge source={provenance} />}
      </div>
      {children}
    </div>
  );
}
