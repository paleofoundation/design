'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    fetch('/api/waitlist')
      .then((r) => r.json())
      .then((d) => { if (typeof d.count === 'number') setWaitlistCount(d.count); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ===== HERO ===== */}
      <section style={{
        background: 'var(--color-green-deep)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Image
          src="/assets/backgrounds/wave-layers.svg"
          alt=""
          fill
          style={{
            objectFit: 'cover',
            opacity: 0.12,
            mixBlendMode: 'soft-light',
            pointerEvents: 'none',
          }}
          priority
        />

        <nav style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '2rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'var(--text-xl)',
            fontWeight: 400,
            color: '#fff',
            letterSpacing: 'var(--tracking-tight)',
          }}>
            Refine Design
          </span>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <Link href="#before-after" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>See it</Link>
            <Link href="/pricing" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Pricing</Link>
            <Link href="/blog" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Blog</Link>
            <Link href="/login" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Sign in</Link>
            <Link
              href="/onboarding"
              className="dzyn-btn dzyn-btn--shine"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: '#fff',
                background: 'var(--color-orange)',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
              }}
            >
              Get started
            </Link>
          </div>
        </nav>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2.5rem 8rem',
          maxWidth: '48rem',
          margin: '0 auto',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <h1 className="dzyn-reveal" style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.1,
            letterSpacing: 'var(--tracking-tight)',
            marginBottom: '1.5rem',
          }}>
            Refine your design.
          </h1>
          <p className="dzyn-reveal" style={{
            fontSize: 'var(--text-lg)',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.7,
            maxWidth: '36rem',
            marginBottom: '3rem',
          }}>
            Every AI builder generates the same lifeless output. Refine Design gives your AI actual design taste &mdash; typography, spacing, color theory &mdash; so what it builds looks like a human designed it.
          </p>

          <WaitlistForm source="hero" onSuccess={() => setWaitlistCount((c) => c + 1)} />

          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '2rem',
          }}>
            {waitlistCount > 0
              ? `Join ${waitlistCount.toLocaleString()} others refining their design`
              : 'Be the first to refine your design'}
          </p>

          <Link href="/dashboard" style={{
            fontSize: 'var(--text-xs)',
            color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            marginTop: '1rem',
          }}>
            Already have access? Go to dashboard &rarr;
          </Link>
        </div>
      </section>

      {/* Wave divider: hero → before/after */}
      <div style={{ lineHeight: 0, marginTop: '-1px' }}>
        <Image src="/assets/dividers/wave.svg" alt="" width={1440} height={120} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* ===== BEFORE / AFTER ===== */}
      <section id="before-after" style={{
        background: 'var(--color-surface)',
        padding: '8rem 2.5rem',
      }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <FadeIn>
            <h2 style={{
              fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              textAlign: 'center',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              Same site. One has taste.
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              maxWidth: '32rem',
              margin: '0 auto 4rem',
            }}>
              Real before-and-after comparisons from Refine Design.
            </p>
          </FadeIn>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {[1, 2, 3].map((n) => (
              <FadeIn key={n}>
                <ComparisonCard n={n} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Curve divider: before/after → differentiators */}
      <div style={{ lineHeight: 0, marginTop: '-1px' }}>
        <Image src="/assets/dividers/curve.svg" alt="" width={1440} height={120} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* ===== DIFFERENTIATORS ===== */}
      <section style={{
        background: 'var(--color-surface-warm)',
        padding: '8rem 2.5rem',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/assets/patterns/dots.svg)',
          backgroundSize: '200px 200px',
          opacity: 0.3,
          pointerEvents: 'none',
        }} />
        <div style={{
          maxWidth: '72rem',
          margin: '0 auto',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '3rem',
        }}>
          <FadeIn>
            <Differentiator
              icon={<EyeIcon />}
              title="Ingests your existing design"
              description="Understands your CSS, fonts, and brand."
            />
          </FadeIn>
          <FadeIn>
            <Differentiator
              icon={<GraduationCapIcon />}
              title="Trained on design principles"
              description="Grid systems, typography, color theory."
            />
          </FadeIn>
          <FadeIn>
            <Differentiator
              icon={<SparklesIcon />}
              title="Generates with taste, not templates"
              description="Every output is unique to your brand."
            />
          </FadeIn>
        </div>
      </section>

      {/* Zigzag divider: differentiators → footer CTA */}
      <div style={{ lineHeight: 0, marginTop: '-1px' }}>
        <Image src="/assets/dividers/zigzag.svg" alt="" width={1440} height={120} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* ===== FOOTER CTA ===== */}
      <section style={{
        background: 'var(--color-green-deep)',
        padding: '8rem 2.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Image
          src="/assets/backgrounds/geometric.svg"
          alt=""
          fill
          style={{
            objectFit: 'cover',
            opacity: 0.08,
            mixBlendMode: 'soft-light',
            pointerEvents: 'none',
          }}
        />
        <div style={{
          maxWidth: '36rem',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <FadeIn>
            <h2 className="dzyn-reveal" style={{
              fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 400,
              color: '#fff',
              marginBottom: '1rem',
              lineHeight: 'var(--leading-tight)',
            }}>
              Done with ugly AI?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'rgba(255,255,255,0.65)',
              marginBottom: '2.5rem',
            }}>
              Join {waitlistCount > 0 ? `${waitlistCount.toLocaleString()} designers and developers` : 'designers and developers'} who are refining their design.
            </p>
            <WaitlistForm source="footer" onSuccess={() => setWaitlistCount((c) => c + 1)} />
          </FadeIn>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        background: 'var(--color-surface)',
        maxWidth: '72rem',
        margin: '0 auto',
        padding: '3rem 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'var(--text-lg)',
            fontWeight: 400,
            color: 'var(--color-green-deep)',
          }}>
            Refine Design
          </span>
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginLeft: '0.75rem',
          }}>
            AI with design taste.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/pricing" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/blog" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Blog</Link>
          <Link href="/onboarding" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Get started</Link>
          <a href="https://github.com/paleofoundation/designengine" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>GitHub</a>
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', width: '100%', textAlign: 'center', marginTop: '1rem' }}>
          &copy; 2026 Refine Design
        </span>
      </footer>
    </div>
  );
}

/* ================================================================
   COMPONENTS
   ================================================================ */

function WaitlistForm({ source, onSuccess }: { source: string; onSuccess: () => void }) {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleUrlChange(val: string) {
    setUrl(val);
    if (val.length > 4 && !showEmail) setShowEmail(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, url: url || undefined, source }),
      });
      const data = await res.json();
      if (data.success || data.message) {
        setSubmitted(true);
        onSuccess();
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p style={{
        fontSize: 'var(--text-base)',
        color: '#fff',
        fontWeight: 500,
        opacity: 1,
        transition: 'opacity 0.4s ease',
      }}>
        You&rsquo;re on the list &mdash; we&rsquo;ll send your redesign.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      width: '100%',
      maxWidth: '28rem',
    }}>
      <input
        type="url"
        value={url}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder="https://yoursite.com"
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.08)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          fontSize: 'var(--text-base)',
          color: '#fff',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-orange)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
      />

      <div style={{
        maxHeight: showEmail ? '4rem' : '0',
        opacity: showEmail ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease, opacity 0.3s ease',
      }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: 'var(--text-base)',
            color: '#fff',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-orange)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
        />
      </div>

      {error && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-amber)', textAlign: 'center' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !showEmail}
        className="dzyn-btn dzyn-btn--glow dzyn-btn--shine"
        style={{
          background: 'var(--color-orange)',
          color: '#fff',
          fontWeight: 600,
          fontSize: 'var(--text-base)',
          padding: '0.875rem 2rem',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          cursor: submitting || !showEmail ? 'not-allowed' : 'pointer',
          opacity: submitting || !showEmail ? 0.5 : 1,
          fontFamily: 'inherit',
          transition: 'opacity 0.15s ease',
        }}
      >
        {submitting ? 'Joining...' : 'See the difference →'}
      </button>
    </form>
  );
}

function ComparisonCard({ n }: { n: number }) {
  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'row',
    }}>
      <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Before</span>
        <div style={{
          width: '100%',
          aspectRatio: '3/2',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <img
            src={`/images/before-${n}.png`}
            alt={`Before redesign ${n}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', position: 'absolute' }}>Placeholder</span>
        </div>
      </div>
      <div style={{ width: '1px', background: 'var(--color-border)', alignSelf: 'stretch' }} />
      <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-green-deep)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>After &mdash; Refined</span>
        <div style={{
          width: '100%',
          aspectRatio: '3/2',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <img
            src={`/images/after-${n}.png`}
            alt={`After redesign ${n}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', position: 'absolute' }}>Placeholder</span>
        </div>
      </div>
    </div>
  );
}

function Differentiator({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '3rem',
        height: '3rem',
        margin: '0 auto 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-green-deep)',
      }}>
        {icon}
      </div>
      <h3 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-xl)',
        fontWeight: 500,
        color: 'var(--color-text-primary)',
        marginBottom: '0.5rem',
        lineHeight: 'var(--leading-tight)',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        lineHeight: 'var(--leading-relaxed)',
      }}>
        {description}
      </p>
    </div>
  );
}

function FadeIn({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(1.5rem)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {children}
    </div>
  );
}

/* ================================================================
   INLINE SVG ICONS
   ================================================================ */

function EyeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function GraduationCapIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
