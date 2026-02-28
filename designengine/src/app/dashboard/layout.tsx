import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/keys', label: 'API Keys' },
  { href: '/dashboard/usage', label: 'Usage' },
  { href: '/dashboard/playground', label: 'Playground' },
  { href: '/dashboard/knowledge', label: 'Knowledge' },
  { href: '/dashboard/billing', label: 'Billing' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div data-theme="dark" style={{
      minHeight: '100vh',
      background: 'var(--color-green-deep)',
      color: 'var(--color-text-on-green)',
    }}>
      <nav style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 var(--space-4)',
      }}>
        <div style={{
          maxWidth: '72rem',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '3.5rem',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', textDecoration: 'none' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              background: 'var(--color-orange)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
              fontWeight: 700,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-on-dark)',
            }}>
              dz
            </div>
            <span style={{
              fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
              fontWeight: 600,
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-on-green)',
            }}>
              dzyne
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textDecoration: 'none',
                  transition: 'color var(--duration-fast) var(--ease-out)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'rgba(255, 255, 255, 0.5)',
          }}>
            {user.email}
          </span>
        </div>
      </nav>
      <main style={{
        maxWidth: '72rem',
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-4)',
      }}>
        {children}
      </main>
    </div>
  );
}
