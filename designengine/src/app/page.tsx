import Link from 'next/link';
import Image from 'next/image';

const TOOL_GROUPS = [
  {
    category: 'Foundation',
    description: 'Capture and store your design intent',
    tools: [
      { name: 'ingest-design', desc: 'Crawl any URL and extract exact design tokens — colors, fonts, spacing, components' },
      { name: 'get-design-profile', desc: 'Load your saved design system at the start of every AI coding session' },
      { name: 'generate-responsive-rules', desc: 'Generate breakpoint behavior for every element type' },
    ],
  },
  {
    category: 'Generation',
    description: 'Build on-brand, every time',
    tools: [
      { name: 'generate-component-library', desc: 'Full set of styled components — Button, Card, Modal, Table, and 12 more' },
      { name: 'generate-page', desc: 'Complete pages — landing, dashboard, pricing, auth — using your tokens' },
      { name: 'generate-layout', desc: 'Structural shells with nav, sidebar, responsive collapse' },
      { name: 'generate-theme-variants', desc: 'Proper dark mode, high contrast, muted, and vibrant themes' },
      { name: 'generate-font', desc: 'Font recommendations that complement your existing design system' },
      { name: 'pair-typography', desc: 'Heading + body pairings with modular type scales' },
      { name: 'convert-design', desc: 'Screenshot to code — React + Tailwind and HTML + CSS' },
      { name: 'search-patterns', desc: 'Semantic search across design patterns with generated components' },
    ],
  },
  {
    category: 'Quality',
    description: 'Catch drift before it ships',
    tools: [
      { name: 'check-design-consistency', desc: 'Compare code against your profile — find every deviation, get corrected code' },
      { name: 'design-diff', desc: 'Structured diff between two designs — source vs. implementation' },
      { name: 'suggest-improvements', desc: 'Accessibility, hierarchy, contrast, whitespace — scored with fixes' },
    ],
  },
  {
    category: 'Experience',
    description: 'Make it feel custom-built',
    tools: [
      { name: 'generate-favicon', desc: 'Complete favicon package — SVG, PNGs, Apple Touch, webmanifest — from your brand colors' },
      { name: 'generate-svg-assets', desc: 'Patterns, dividers, hero backgrounds — programmatic SVGs matched to your palette' },
      { name: 'generate-art-style', desc: 'Art style manifest with DALL-E prompts, CSS filters, and SVG attributes for your brand' },
      { name: 'generate-micro-interactions', desc: 'Cursor effects, button states, scroll reveals, loading spinners, glow pulses' },
      { name: 'generate-illustrations', desc: 'AI illustrations via DALL-E 3, guided by your art style and color tokens' },
      { name: 'scaffold-assets', desc: 'One call generates everything: favicons, patterns, dividers, heroes, animations, art style' },
    ],
  },
];

export default function Home() {
  return (
    <div>
      {/* ========== HERO (full-bleed green + wave-layers background) ========== */}
      <section style={{
        background: 'var(--color-green-deep)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Programmatic hero background — dzyn-generated SVG */}
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

        {/* Nav on green */}
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
            dzyne
          </span>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <Link href="#how-it-works" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>How it works</Link>
            <Link href="#tools" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Tools</Link>
            <Link href="#setup" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Setup</Link>
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

        {/* Hero content — left-aligned like Substack */}
        <div style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '10rem 2.5rem 12rem',
          width: '100%',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ maxWidth: '42rem' }}>
            <h1 className="dzyn-reveal" style={{
              fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
              fontSize: 'clamp(3rem, 6vw, 4.5rem)',
              fontWeight: 400,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              color: '#fff',
              marginBottom: '2rem',
            }}>
              Your AI builds code. We make sure it doesn&rsquo;t look like AI built it.
            </h1>
            <p className="dzyn-reveal" style={{
              fontSize: 'var(--text-lg)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '34rem',
              marginBottom: '3rem',
            }}>
              dzyne captures your design intent and enforces it across every AI coding session. Colors, typography, spacing, components — all on-brand, every time.
            </p>
            <div className="dzyn-reveal" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/onboarding"
                className="dzyn-btn dzyn-btn--glow dzyn-btn--pulse dzyn-glow dzyn-glow--animate"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--color-orange)',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: 'var(--text-base)',
                  padding: '0.875rem 2rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                }}
              >
                Design your system
              </Link>
              <Link
                href="#how-it-works"
                className="dzyn-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  fontWeight: 400,
                  fontSize: 'var(--text-base)',
                  padding: '0.875rem 2rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                }}
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Wave divider: hero → problem */}
      <div style={{ lineHeight: 0, marginTop: '-1px' }}>
        <Image src="/assets/dividers/wave.svg" alt="" width={1440} height={120} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* ========== PROBLEM ========== */}
      <section style={{
        background: 'var(--color-surface)',
        padding: '8rem 2.5rem',
      }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <h2 className="dzyn-reveal" style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            marginBottom: '4rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            The problem with AI-generated design
          </h2>
          <div className="dzyn-stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))',
            gap: '2rem',
          }}>
            <ComparisonCard
              label="Without dzyne"
              bad
              items={[
                { prop: 'Primary color', val: 'bg-indigo-600' },
                { prop: 'Font', val: 'Inter / Geist' },
                { prop: 'Radius', val: 'rounded-xl (12px)' },
                { prop: 'Background', val: '#0a0a0a dark' },
                { prop: 'Personality', val: '"AI developer tool"' },
              ]}
            />
            <ComparisonCard
              label="With dzyne"
              items={[
                { prop: 'Primary color', val: 'Your exact brand hex' },
                { prop: 'Font', val: 'Your chosen pairing' },
                { prop: 'Radius', val: 'Your design decision' },
                { prop: 'Background', val: 'Your surface palette' },
                { prop: 'Personality', val: 'Yours' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Curve divider: problem → how-it-works */}
      <div style={{ lineHeight: 0, marginTop: '-1px' }}>
        <Image src="/assets/dividers/curve.svg" alt="" width={1440} height={120} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" style={{
        background: 'var(--color-surface-warm)',
        padding: '8rem 2.5rem',
        position: 'relative',
      }}>
        {/* Subtle dots pattern background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/assets/patterns/dots.svg)',
          backgroundSize: '200px 200px',
          opacity: 0.3,
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '72rem', margin: '0 auto', position: 'relative' }}>
          <h2 className="dzyn-reveal" style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Three steps to design that lasts
          </h2>
          <p className="dzyn-reveal" style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-body)',
            textAlign: 'center',
            maxWidth: '32rem',
            margin: '0 auto 5rem',
            lineHeight: 1.7,
          }}>
            Set it up once. Every AI session after that stays on-brand.
          </p>
          <div className="dzyn-stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))',
            gap: '2rem',
          }}>
            <StepCard
              number="01"
              title="Tell us about your brand"
              description="Walk through a short design interview. Pick your colors, typography, mood, and spacing — or paste a URL and we extract it all."
            />
            <StepCard
              number="02"
              title="We generate your system"
              description="Tokens, CSS variables, Tailwind config, component patterns, theme variants — a complete design system saved to your profile."
            />
            <StepCard
              number="03"
              title="Every AI tool stays on-brand"
              description="Connect the MCP to Cursor, Claude, or Windsurf. Every page, component, and layout your AI generates uses your design system."
            />
          </div>
        </div>
      </section>

      {/* Angle divider: how-it-works → tools */}
      <div style={{ lineHeight: 0, marginTop: '-1px' }}>
        <Image src="/assets/dividers/angle.svg" alt="" width={1440} height={120} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* ========== TOOLS ========== */}
      <section id="tools" style={{
        background: 'var(--color-surface)',
        padding: '8rem 2.5rem',
      }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <h2 className="dzyn-reveal" style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            20 tools. One design system.
          </h2>
          <p className="dzyn-reveal" style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-body)',
            textAlign: 'center',
            maxWidth: '36rem',
            margin: '0 auto 5rem',
            lineHeight: 1.7,
          }}>
            Every tool reads your design profile. Every output matches your brand.
          </p>
          {TOOL_GROUPS.map((group) => (
            <div key={group.category} className="dzyn-reveal" style={{ marginBottom: '4rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 400,
                  color: 'var(--color-green-deep)',
                  marginBottom: '0.25rem',
                }}>
                  {group.category}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {group.description}
                </p>
              </div>
              <div className="dzyn-stagger" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 20rem), 1fr))',
                gap: '1rem',
              }}>
                {group.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="dzyn-reveal"
                    style={{
                      background: 'var(--color-white)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.5rem',
                      transition: 'box-shadow var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)',
                    }}
                  >
                    <code style={{
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
                      color: 'var(--color-orange)',
                      background: 'var(--color-orange-muted)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      {tool.name}
                    </code>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-body)',
                      marginTop: '0.75rem',
                      lineHeight: 1.6,
                    }}>
                      {tool.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Zigzag divider: tools → setup */}
      <div style={{ lineHeight: 0, marginTop: '-1px' }}>
        <Image src="/assets/dividers/zigzag.svg" alt="" width={1440} height={120} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* ========== SETUP ========== */}
      <section id="setup" style={{
        background: 'var(--color-surface-warm)',
        padding: '8rem 2.5rem',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/assets/patterns/grid.svg)',
          backgroundSize: '300px 300px',
          opacity: 0.15,
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '72rem', margin: '0 auto', position: 'relative' }}>
          <h2 className="dzyn-reveal" style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Connect in 30 seconds
          </h2>
          <p className="dzyn-reveal" style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-body)',
            textAlign: 'center',
            maxWidth: '32rem',
            margin: '0 auto 5rem',
            lineHeight: 1.7,
          }}>
            Add one config file. Your AI agent loads your design system automatically.
          </p>
          <div className="dzyn-stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
            gap: '2rem',
          }}>
            <SetupCard
              title="Cursor"
              filename=".cursor/mcp.json"
              code={`{
  "mcpServers": {
    "dzyne": {
      "url": "https://dzyne.app/api/mcp/mcp"
    }
  }
}`}
            />
            <SetupCard
              title="Claude Desktop"
              filename="claude_desktop_config.json"
              code={`{
  "mcpServers": {
    "dzyne": {
      "command": "npx",
      "args": ["@dzyne/mcp-server"]
    }
  }
}`}
            />
            <SetupCard
              title="Windsurf"
              filename="mcp_config.json"
              code={`{
  "mcpServers": {
    "dzyne": {
      "serverUrl": "https://dzyne.app/api/mcp/mcp"
    }
  }
}`}
            />
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section style={{
        background: 'var(--color-green-deep)',
        padding: '8rem 2.5rem',
        textAlign: 'center',
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
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="dzyn-reveal" style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400,
            color: '#fff',
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Build something that looks like you made it.
          </h2>
          <p className="dzyn-reveal" style={{
            fontSize: 'var(--text-lg)',
            color: 'rgba(255,255,255,0.65)',
            maxWidth: '30rem',
            margin: '0 auto 3rem',
            lineHeight: 1.7,
          }}>
            Not like every other AI-generated app on the internet.
          </p>
          <Link
            href="/onboarding"
            className="dzyn-reveal dzyn-btn dzyn-btn--glow dzyn-btn--shine dzyn-glow dzyn-glow--animate"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--color-orange)',
              color: '#fff',
              fontWeight: 500,
              fontSize: 'var(--text-base)',
              padding: '0.875rem 2.5rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
            }}
          >
            Design your system
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{
        background: 'var(--color-surface)',
        maxWidth: '72rem',
        margin: '0 auto',
        padding: '3rem 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <span style={{
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontWeight: 400,
          fontSize: 'var(--text-lg)',
          color: 'var(--color-green-deep)',
        }}>
          dzyne
        </span>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/dashboard" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/onboarding" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Get started</Link>
          <a href="https://github.com/paleofoundation/designengine" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>GitHub</a>
        </div>
      </footer>
    </div>
  );
}

/* ========== SUB-COMPONENTS ========== */

function ComparisonCard({ label, bad, items }: {
  label: string;
  bad?: boolean;
  items: { prop: string; val: string }[];
}) {
  return (
    <div className={`dzyn-reveal${bad ? '' : ' dzyn-glow-border'}`} style={{
      background: bad ? 'var(--color-green-darkest)' : 'var(--color-green-deep)',
      borderRadius: 'var(--radius-md)',
      padding: '2rem',
      border: bad ? '1px solid rgba(255,255,255,0.06)' : '1.5px solid var(--color-orange)',
    }}>
      <p style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        color: bad ? 'rgba(255,255,255,0.4)' : 'var(--color-orange)',
        marginBottom: '1.5rem',
      }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {items.map((item) => (
          <div key={item.prop} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontSize: 'var(--text-sm)',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.prop}</span>
            <span style={{
              fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
              fontSize: 'var(--text-xs)',
              color: bad ? 'rgba(255,255,255,0.35)' : 'var(--color-amber-light)',
            }}>
              {item.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="dzyn-reveal dzyn-btn" style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '2.5rem 2rem',
    }}>
      <span style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: '3.5rem',
        fontWeight: 300,
        color: 'var(--color-border)',
        lineHeight: 1,
      }}>
        {number}
      </span>
      <h3 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-xl)',
        fontWeight: 500,
        color: 'var(--color-text-primary)',
        marginTop: '1.5rem',
        marginBottom: '0.75rem',
        lineHeight: 1.3,
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-body)',
        lineHeight: 1.7,
      }}>
        {description}
      </p>
    </div>
  );
}

function SetupCard({ title, filename, code }: {
  title: string;
  filename: string;
  code: string;
}) {
  return (
    <div className="dzyn-reveal dzyn-btn" style={{
      background: 'var(--color-green-darkest)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
          {title}
        </span>
        <code style={{
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
          color: 'var(--color-amber)',
        }}>
          {filename}
        </code>
      </div>
      <pre style={{
        padding: '1.5rem',
        fontSize: 'var(--text-xs)',
        lineHeight: 1.8,
        fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
        color: 'rgba(255,255,255,0.75)',
        overflowX: 'auto',
        margin: 0,
      }}>
        {code}
      </pre>
    </div>
  );
}
