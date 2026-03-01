'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore, type ArtStylePreset } from '../store';
import { StepIndicator, ProvenanceBadge } from '../components';
import { ART_STYLE_META } from '@/lib/svg/art-style-previews';
import { getDesignLanguage } from '@/lib/design-language';
import { LivePreview } from '../components/live-preview';
import type { AuditImprovement } from '@/app/api/onboarding/audit/route';

const ALL_ART_STYLES: ArtStylePreset[] = [
  'line-art', 'flat-vector', 'watercolor', 'isometric', 'abstract-geometric', 'photo-overlay',
];

const SPACING_OPTIONS = [
  { id: 'tight' as const, label: 'Tight' },
  { id: 'balanced' as const, label: 'Balanced' },
  { id: 'generous' as const, label: 'Generous' },
];

export default function OnboardingReview() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const [auditLoading, setAuditLoading] = useState(false);
  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [auditImprovements, setAuditImprovements] = useState<AuditImprovement[]>([]);
  const [auditQuickWins, setAuditQuickWins] = useState<string[]>([]);
  const [auditError, setAuditError] = useState('');
  const [auditOpen, setAuditOpen] = useState(false);

  const hasExtraction = store.extractionStatus === 'done';
  const isRefresh = store.intent === 'refresh';
  const stepNumber = 7;
  const auditUrl = store.ownSiteUrl || store.inspirationUrl;

  const lang = getDesignLanguage(store.designLanguage);

  function extractDomain(url: string): string {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  function handleFontChange(heading: string, body: string) {
    useOnboardingStore.setState({ typography: { heading, body } });
  }

  function handleArtStyleChange(style: ArtStylePreset) {
    useOnboardingStore.setState({ artStyle: style });
  }

  const [spacingOverride, setSpacingOverride] = useState<'tight' | 'balanced' | 'generous' | null>(null);

  function handleSpacingChange(density: 'tight' | 'balanced' | 'generous') {
    setSpacingOverride(density);
  }

  const runAudit = useCallback(async () => {
    if (!auditUrl || auditLoading) return;
    setAuditLoading(true);
    setAuditError('');
    setAuditOpen(true);
    try {
      const res = await fetch('/api/onboarding/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: auditUrl,
          tokens: {
            colors: store.colors,
            typography: store.typography,
            designLanguage: store.designLanguage,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditScore(data.overallScore);
        setAuditImprovements(data.improvements || []);
        setAuditQuickWins(data.quickWins || []);
      } else {
        setAuditError(data.error || 'Audit failed. Please try again.');
      }
    } catch {
      setAuditError('Could not reach the server. Please try again.');
    } finally {
      setAuditLoading(false);
    }
  }, [auditUrl, auditLoading, store.colors, store.typography, store.designLanguage]);

  const effectiveLang = spacingOverride
    ? { ...lang, spacingDensity: spacingOverride }
    : lang;

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
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
            A live preview of your design system applied to a real page. Tweak fonts, image style, or spacing below &mdash; changes update instantly.
            {hasExtraction && (
              <> Elements sourced from <strong style={{ color: 'var(--color-green-deep)' }}>{extractDomain(store.inspirationUrl)}</strong>.</>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {/* Customize toggle */}
          <button
            onClick={() => setCustomizeOpen(!customizeOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: customizeOpen ? 'var(--color-green-deep)' : 'var(--color-white)',
              color: customizeOpen ? '#fff' : 'var(--color-text-body)',
              border: customizeOpen ? 'none' : '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 14px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Customize
          </button>

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
      </div>

      {/* Customize toolbar */}
      {customizeOpen && (
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
        }}>
          {/* Typography switcher */}
          <div style={{ flex: '1 1 220px', minWidth: 0 }}>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-1)',
            }}>
              Typography
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {lang.fontPairings.map((fp) => {
                const isActive = store.typography.heading === fp.heading && store.typography.body === fp.body;
                return (
                  <button
                    key={fp.id}
                    onClick={() => handleFontChange(fp.heading, fp.body)}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '8px',
                      background: isActive ? 'var(--color-green-muted)' : 'var(--color-surface)',
                      border: isActive ? '1.5px solid var(--color-green-deep)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <span style={{
                      fontFamily: `'${fp.heading}', ${fp.headingClass}`,
                      fontSize: 'var(--text-sm)',
                      fontWeight: 700,
                      color: isActive ? 'var(--color-green-deep)' : 'var(--color-text-primary)',
                    }}>
                      {fp.heading}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>/</span>
                    <span style={{
                      fontFamily: `'${fp.body}', ${fp.bodyClass}`,
                      fontSize: 'var(--text-xs)',
                      fontWeight: 400,
                      color: 'var(--color-text-muted)',
                    }}>
                      {fp.body}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image style switcher */}
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-1)',
            }}>
              Image Style
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {ALL_ART_STYLES.map((style) => {
                const isActive = store.artStyle === style;
                const meta = ART_STYLE_META[style];
                return (
                  <button
                    key={style}
                    onClick={() => handleArtStyleChange(style)}
                    style={{
                      background: isActive ? 'var(--color-green-muted)' : 'var(--color-surface)',
                      border: isActive ? '1.5px solid var(--color-green-deep)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'center',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: isActive ? 'var(--color-green-deep)' : 'var(--color-text-primary)',
                      marginBottom: '2px',
                    }}>
                      {meta?.label || style}
                    </p>
                    <p style={{ fontSize: '9px', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
                      {meta?.mood || ''}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spacing density */}
          <div style={{ flex: '0 0 auto' }}>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-1)',
            }}>
              Spacing
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {SPACING_OPTIONS.map((opt) => {
                const current = spacingOverride ?? lang.spacingDensity;
                const isActive = current === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSpacingChange(opt.id)}
                    style={{
                      background: isActive ? 'var(--color-green-muted)' : 'var(--color-surface)',
                      border: isActive ? '1.5px solid var(--color-green-deep)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 14px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 'var(--text-xs)',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-green-deep)' : 'var(--color-text-body)',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AI Audit button */}
      {auditUrl && (
        <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            onClick={runAudit}
            disabled={auditLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: auditScore !== null ? 'var(--color-surface)' : 'linear-gradient(135deg, var(--color-green-deep), #2A7C6F)',
              color: auditScore !== null ? 'var(--color-text-body)' : '#fff',
              border: auditScore !== null ? '1px solid var(--color-border)' : 'none',
              borderRadius: 'var(--radius-md)',
              padding: '10px 20px',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: auditLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: auditLoading ? 0.7 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
              <circle cx="12" cy="15" r="2" />
            </svg>
            {auditLoading ? 'Analyzing your site...' : auditScore !== null ? 'Re-run AI Audit' : 'Run AI Design Audit'}
          </button>
          {auditScore !== null && (
            <button
              onClick={() => setAuditOpen(!auditOpen)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-green-deep)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 500,
                textDecoration: 'underline',
              }}
            >
              {auditOpen ? 'Hide results' : 'Show results'}
            </button>
          )}
          {auditScore !== null && (
            <ScoreBadge score={auditScore} />
          )}
        </div>
      )}

      {/* AI Audit results panel */}
      {auditOpen && (auditLoading || auditScore !== null || auditError) && (
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
        }}>
          {auditLoading && (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
                Auditing your current site against design conventions...
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                This usually takes 10-15 seconds.
              </p>
            </div>
          )}

          {auditError && (
            <div style={{
              background: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.2)',
              borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)',
              fontSize: 'var(--text-sm)', color: 'var(--color-error)',
            }}>
              {auditError}
            </div>
          )}

          {!auditLoading && auditScore !== null && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <ScoreBadge score={auditScore} large />
                <div>
                  <p style={{
                    fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)',
                    marginBottom: '2px',
                  }}>
                    Current Site Design Score
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Based on WCAG accessibility, typographic scale, color theory, whitespace rhythm, and visual hierarchy.
                  </p>
                </div>
              </div>

              {/* Quick Wins */}
              {auditQuickWins.length > 0 && (
                <div style={{
                  background: 'var(--color-green-muted)',
                  border: '1px solid rgba(48,110,94,0.15)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-3)',
                  marginBottom: 'var(--space-4)',
                }}>
                  <p style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-green-deep)',
                    letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
                    marginBottom: 'var(--space-1)',
                  }}>
                    Your new design system addresses
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {auditQuickWins.map((win, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-green-deep)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                          {win}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvement list */}
              <p style={{
                fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
                letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
                marginBottom: 'var(--space-2)',
              }}>
                Convention Violations Found
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {auditImprovements.map((item, i) => (
                  <div key={i} style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderLeft: `3px solid ${
                      item.severity === 'high' ? '#DC3545'
                        : item.severity === 'medium' ? '#FFC107'
                          : '#28A745'
                    }`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        color: item.severity === 'high' ? '#DC3545' : item.severity === 'medium' ? '#856404' : '#155724',
                        background: item.severity === 'high' ? '#F8D7DA' : item.severity === 'medium' ? '#FFF3CD' : '#D4EDDA',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {item.severity}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {item.category}
                      </span>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px', lineHeight: 1.4 }}>
                      {item.issue}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-body)', lineHeight: 1.5, marginBottom: '4px' }}>
                      {item.suggestion}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                      {item.impact}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

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
                designLanguage={effectiveLang}
                viewport="desktop"
                siteContent={store.siteContent}
                artStyle={store.artStyle}
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
            designLanguage={effectiveLang}
            viewport={viewport}
            siteContent={store.siteContent}
            artStyle={store.artStyle}
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

function ScoreBadge({ score, large }: { score: number; large?: boolean }) {
  const color = score >= 70 ? '#28A745' : score >= 40 ? '#FFC107' : '#DC3545';
  const bg = score >= 70 ? '#D4EDDA' : score >= 40 ? '#FFF3CD' : '#F8D7DA';
  const textColor = score >= 70 ? '#155724' : score >= 40 ? '#856404' : '#721C24';
  const size = large ? '48px' : '32px';
  const fontSize = large ? 'var(--text-lg)' : 'var(--text-xs)';

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 'var(--radius-full)',
      background: bg,
      border: `2px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontSize,
        fontWeight: 700,
        color: textColor,
        fontFamily: 'var(--font-jetbrains, monospace)',
      }}>
        {score}
      </span>
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
