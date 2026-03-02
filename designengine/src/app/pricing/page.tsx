import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing — Refine Design',
  description: 'Refine Design is free during beta. Generate design systems, export tokens, and connect to your AI coding tools at no cost.',
};

const FEATURES = {
  free: [
    'Design interview (unlimited)',
    'Export CSS variables, Tailwind config, design tokens',
    'WCAG contrast validation',
    'Color harmony analysis',
    'Modular type scale generation',
    'Download all formats',
  ],
  beta: [
    'Save design profiles to your account',
    'MCP server access (Cursor, Claude, Windsurf)',
    'All 20 MCP tools',
    'Persistent design memory across sessions',
    'Design consistency checking',
    'Knowledge-base-powered outputs',
  ],
  coming: [
    'Team workspaces',
    'Figma plugin sync',
    'Custom MCP tool builder',
    'Priority support',
    'White-label exports',
  ],
};

export default function PricingPage() {
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
          <Link href="/blog" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-body)', textDecoration: 'none' }}>Blog</Link>
          <Link href="/login" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-body)', textDecoration: 'none' }}>Sign in</Link>
          <Link href="/onboarding" style={{
            fontSize: 'var(--text-sm)', fontWeight: 500, color: '#fff',
            background: 'var(--color-orange)', padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-md)', textDecoration: 'none',
          }}>
            Get started
          </Link>
        </div>
      </nav>

      <main style={{
        flex: 1,
        maxWidth: '64rem',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-4)',
        width: '100%',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-tight)',
            marginBottom: 'var(--space-2)',
          }}>
            Free during beta
          </h1>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-body)',
            maxWidth: '32rem',
            margin: '0 auto',
          }}>
            We&rsquo;re building the design layer for AI-powered development. Everything is free while we get it right.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}>
          {/* Free tier */}
          <div style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
          }}>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-1)',
            }}>
              Always free
            </p>
            <p style={{
              fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)',
            }}>
              $0
            </p>
            <p style={{
              fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-4)',
            }}>
              No account needed
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {FEATURES.free.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-body)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-green-deep)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/onboarding" style={{
              display: 'block',
              textAlign: 'center',
              marginTop: 'var(--space-4)',
              background: 'var(--color-green-deep)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              padding: '0.6rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
            }}>
              Start now
            </Link>
          </div>

          {/* Beta tier */}
          <div style={{
            background: 'var(--color-white)',
            border: '2px solid var(--color-orange)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '-0.6rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--color-orange)',
              color: '#fff',
              fontSize: '0.625rem',
              fontWeight: 400,
              padding: '0.15rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Current beta
            </div>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-1)',
            }}>
              Beta access
            </p>
            <p style={{
              fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)',
            }}>
              $0
            </p>
            <p style={{
              fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-4)',
            }}>
              Free account required
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {FEATURES.beta.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-body)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-orange)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{
              display: 'block',
              textAlign: 'center',
              marginTop: 'var(--space-4)',
              background: 'var(--color-orange)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              padding: '0.6rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
            }}>
              Create free account
            </Link>
          </div>

          {/* Pro tier (coming) */}
          <div style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            opacity: 0.75,
          }}>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
              marginBottom: 'var(--space-1)',
            }}>
              Pro
            </p>
            <p style={{
              fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)',
            }}>
              TBD
            </p>
            <p style={{
              fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-4)',
            }}>
              Coming soon
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {FEATURES.coming.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-body)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <div style={{
              textAlign: 'center',
              marginTop: 'var(--space-4)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
              fontSize: 'var(--text-sm)',
              padding: '0.6rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}>
              Notify me
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: 'var(--space-6)',
          background: 'var(--color-green-muted)',
          borderRadius: 'var(--radius-md)',
        }}>
          <p style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            color: 'var(--color-green-deep)',
            marginBottom: 'var(--space-2)',
          }}>
            Why is it free?
          </p>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-body)',
            maxWidth: '36rem',
            margin: '0 auto',
            lineHeight: 'var(--leading-relaxed)',
          }}>
            We&rsquo;re still learning what the design layer for AI development should look like. Your usage and feedback during the beta shapes what Refine Design becomes. We&rsquo;ll introduce paid plans only when the tool delivers enough value to justify them.
          </p>
        </div>
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
