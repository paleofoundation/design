import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — Refine Design',
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
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/logo.svg"
            alt="Refine Design"
            style={{
              height: '28px',
              width: 'auto',
              filter: 'brightness(0) saturate(100%) invert(28%) sepia(90%) saturate(600%) hue-rotate(145deg) brightness(85%)',
            }}
          />
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
        Refine Design — AI with design taste.
      </footer>
    </div>
  );
}
