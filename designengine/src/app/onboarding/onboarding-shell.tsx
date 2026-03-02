'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function OnboardingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.classList.add('no-dzyn-cursor');
    return () => document.body.classList.remove('no-dzyn-cursor');
  }, []);

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
