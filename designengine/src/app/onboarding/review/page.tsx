'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store';

export default function OnboardingReview() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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
          mood: store.mood,
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
          width: '4rem',
          height: '4rem',
          background: 'var(--color-green-muted)',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
          fontSize: 'var(--text-2xl)',
        }}>
          &#10003;
        </div>
        <h1 style={{
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-2)',
        }}>
          Your design system is ready
        </h1>
        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-body)',
          marginBottom: 'var(--space-6)',
          maxWidth: '28rem',
          margin: '0 auto var(--space-6)',
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
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-on-green)' }}>Cursor</span>
            <code style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)', color: 'var(--color-amber)' }}>.cursor/mcp.json</code>
          </div>
          <pre style={{
            padding: 'var(--space-3)',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.7,
            fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
            color: 'var(--color-text-on-green)',
            margin: 0,
            overflowX: 'auto',
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
            fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-orange)',
            background: 'var(--color-orange-muted)',
            padding: '0.1rem 0.4rem',
            borderRadius: 'var(--radius-sm)',
          }}>get-design-profile</code>
          {' '}with project name &ldquo;{store.projectName}&rdquo;.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/dashboard')}
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
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push('/dashboard/playground')}
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
            Test in Playground
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '56rem',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-4)',
      width: '100%',
    }}>
      <StepIndicator current={5} total={5} />

      <h1 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        lineHeight: 'var(--leading-tight)',
        marginBottom: 'var(--space-1)',
      }}>
        Review your design system
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-body)',
        marginBottom: 'var(--space-6)',
      }}>
        This is what every AI tool will use when building for &ldquo;{store.projectName}&rdquo;.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}>
        {/* Colors */}
        <ReviewSection title="Colors">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {Object.entries(store.colors).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: 'var(--radius-sm)', background: v, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-body)', textTransform: 'capitalize' }}>{k}</span>
                <code style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{v}</code>
              </div>
            ))}
          </div>
        </ReviewSection>

        {/* Typography */}
        <ReviewSection title="Typography">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.125rem' }}>Headings</p>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{store.typography.heading}</p>
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.125rem' }}>Body</p>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 400, color: 'var(--color-text-primary)' }}>{store.typography.body}</p>
            </div>
          </div>
        </ReviewSection>

        {/* Mood */}
        <ReviewSection title="Mood">
          <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-green-deep)', textTransform: 'capitalize' }}>{store.mood || 'Not selected'}</p>
          {store.brandDescription && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', lineHeight: 'var(--leading-normal)' }}>&ldquo;{store.brandDescription}&rdquo;</p>
          )}
        </ReviewSection>

        {/* Project */}
        <ReviewSection title="Project">
          <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{store.projectName}</p>
          {store.inspirationUrl && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem', wordBreak: 'break-all' }}>{store.inspirationUrl}</p>
          )}
        </ReviewSection>
      </div>

      {/* Full preview */}
      <div style={{
        background: store.colors.background,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
      }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', fontWeight: 500, letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase' }}>Full preview</p>
        <h2 style={{ fontFamily: `'${store.typography.heading}', serif`, fontSize: 'var(--text-3xl)', fontWeight: 700, color: store.colors.text, lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-2)' }}>
          Welcome to {store.projectName}
        </h2>
        <p style={{ fontFamily: `'${store.typography.body}', sans-serif`, fontSize: 'var(--text-base)', color: store.colors.text, opacity: 0.7, lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)', maxWidth: '40rem' }}>
          This is what your application will feel like. Every page, every component, every layout your AI generates will use these exact tokens. The heading uses {store.typography.heading}, the body uses {store.typography.body}.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
          <span style={{ background: store.colors.primary, color: '#fff', padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: `'${store.typography.body}', sans-serif` }}>Get started</span>
          <span style={{ border: `1.5px solid ${store.colors.primary}`, color: store.colors.primary, padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 500, fontFamily: `'${store.typography.body}', sans-serif` }}>Learn more</span>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.2)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => router.push('/onboarding/typography')} style={{ background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-body)', cursor: 'pointer', fontFamily: 'inherit' }}>
          &larr; Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: 'var(--color-orange)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 'var(--text-base)',
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            fontFamily: 'inherit',
          }}
        >
          {saving ? 'Saving...' : 'Save design system'}
        </button>
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-3)',
    }}>
      <p style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        color: 'var(--color-text-muted)',
        letterSpacing: 'var(--tracking-wider)',
        textTransform: 'uppercase',
        marginBottom: 'var(--space-2)',
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--space-6)' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < current ? 'var(--color-green-deep)' : 'var(--color-border)' }} />
      ))}
    </div>
  );
}
