import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-surface)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle pattern background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/assets/patterns/dots.svg)',
        backgroundSize: '200px 200px',
        opacity: 0.2,
        pointerEvents: 'none',
      }} />

      {/* Nav */}
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
        <Link href="/" style={{
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontSize: 'var(--text-xl)',
          fontWeight: 400,
          color: 'var(--color-green-deep)',
          letterSpacing: 'var(--tracking-tight)',
          textDecoration: 'none',
        }}>
          dzyne
        </Link>
        <Link
          href="/"
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
          Back to home
        </Link>
      </nav>

      {/* Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', maxWidth: '32rem' }}>
          {/* Large 404 with brand accent */}
          <div className="dzyn-reveal" style={{ marginBottom: 'var(--space-6)' }}>
            <span style={{
              fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
              fontSize: 'clamp(6rem, 15vw, 10rem)',
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-border)',
              display: 'block',
            }}>
              404
            </span>
          </div>

          <h1 className="dzyn-reveal" style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
            letterSpacing: 'var(--tracking-tight)',
            lineHeight: 'var(--leading-tight)',
          }}>
            This page wandered off-brand.
          </h1>

          <p className="dzyn-reveal" style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-body)',
            lineHeight: 'var(--leading-normal)',
            marginBottom: 'var(--space-6)',
          }}>
            The page you&rsquo;re looking for doesn&rsquo;t exist &mdash; but your design system still does. Let&rsquo;s get you back on track.
          </p>

          <div className="dzyn-reveal" style={{
            display: 'flex',
            gap: 'var(--space-2)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link
              href="/"
              className="dzyn-btn dzyn-btn--glow dzyn-glow dzyn-glow--animate"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'var(--color-green-deep)',
                color: '#fff',
                fontWeight: 500,
                fontSize: 'var(--text-base)',
                padding: '0.875rem 2rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
              }}
            >
              Go home
            </Link>
            <Link
              href="/dashboard"
              className="dzyn-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid var(--color-border-strong)',
                color: 'var(--color-text-primary)',
                fontWeight: 400,
                fontSize: 'var(--text-base)',
                padding: '0.875rem 2rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
              }}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Decorative divider at bottom */}
      <div style={{ lineHeight: 0, position: 'relative', zIndex: 1 }}>
        <Image
          src="/assets/dividers/wave.svg"
          alt=""
          width={1440}
          height={120}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* Footer strip */}
      <footer style={{
        background: 'var(--color-green-deep)',
        padding: 'var(--space-4) 2.5rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <p style={{
          fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
          fontSize: 'var(--text-xs)',
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: 'var(--tracking-wide)',
        }}>
          dzyne — design systems for AI-powered builds
        </p>
      </footer>
    </div>
  );
}
