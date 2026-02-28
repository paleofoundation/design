import Link from 'next/link';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <Link href="/" style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
        }}>
          Back to home
        </Link>
      </nav>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}
