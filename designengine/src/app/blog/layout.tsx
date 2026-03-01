import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — dzyne',
  description: 'Thoughts on design systems, AI-powered development, and why your site doesn\'t have to look like every other AI build.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-surface)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <nav style={{
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '72rem',
        margin: '0 auto',
        width: '100%',
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          color: 'var(--color-green-deep)',
          letterSpacing: 'var(--tracking-tight)',
          textDecoration: 'none',
        }}>
          dzyne
        </Link>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <Link href="/blog" style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-text-body)',
            textDecoration: 'none',
          }}>
            Blog
          </Link>
          <Link href="/onboarding" style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-orange)',
            textDecoration: 'none',
          }}>
            Start designing
          </Link>
        </div>
      </nav>
      <main style={{ flex: 1, maxWidth: '44rem', margin: '0 auto', padding: 'var(--space-6) var(--space-4)', width: '100%' }}>
        {children}
      </main>
      <footer style={{
        padding: 'var(--space-4)',
        textAlign: 'center',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)',
        borderTop: '1px solid var(--color-border)',
      }}>
        dzyne — Design systems for AI-powered builds
      </footer>
    </div>
  );
}
