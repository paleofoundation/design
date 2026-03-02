import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PALETTE, DASH, FONT, RADIUS, TEXT_SIZE } from '@/lib/design-tokens';
import { isAdminEmail } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard — Refine Design',
  description: 'Manage your design profiles, API keys, usage, and run the tool playground.',
};

const NAV_LINKS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/keys', label: 'API Keys' },
  { href: '/dashboard/usage', label: 'Usage' },
  { href: '/dashboard/playground', label: 'Playground' },
  { href: '/dashboard/knowledge', label: 'Knowledge' },
  { href: '/dashboard/preview', label: 'Preview' },
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

  const showAdmin = isAdminEmail(user.email ?? undefined);

  return (
    <div style={{ minHeight: '100vh', background: DASH.bg }}>
      {/* Green nav strip — brand anchor */}
      <nav style={{
        background: PALETTE.green.deep,
        padding: '0 2rem',
      }}>
        <div style={{
          maxWidth: '72rem',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '3.5rem',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/logo.svg" alt="Refine Design" style={{ height: '30px', width: 'auto' }} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: TEXT_SIZE.sm,
                  color: 'rgba(255, 255, 255, 0.75)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
            {showAdmin && (
              <Link
                href="/dashboard/admin/knowledge"
                style={{
                  fontSize: TEXT_SIZE.sm,
                  color: PALETTE.orange.base,
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Admin
              </Link>
            )}
          </div>

          <span style={{
            fontSize: TEXT_SIZE.sm,
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            {user.email}
          </span>
        </div>
      </nav>

      {/* White content area */}
      <main style={{
        maxWidth: '72rem',
        margin: '0 auto',
        padding: '3rem 2rem',
      }}>
        {children}
      </main>
    </div>
  );
}
