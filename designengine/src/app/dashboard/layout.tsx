import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PALETTE, DASH, FONT, RADIUS, TEXT_SIZE } from '@/lib/design-tokens';

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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              background: PALETTE.orange.base,
              borderRadius: RADIUS.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT.heading,
              fontWeight: 700,
              fontSize: TEXT_SIZE.xs,
              color: PALETTE.text.onDark,
            }}>
              dz
            </div>
            <span style={{
              fontFamily: FONT.heading,
              fontWeight: 600,
              fontSize: TEXT_SIZE.lg,
              color: PALETTE.text.onGreen,
            }}>
              dzyne
            </span>
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
