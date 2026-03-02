'use client';

import { useState, useEffect } from 'react';
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
      { name: 'extract-visual-style', desc: 'Analyze a reference image to extract its artistic DNA — technique, shading, color treatment, mood' },
      { name: 'scaffold-assets', desc: 'One call generates everything: favicons, patterns, dividers, heroes, animations, art style' },
    ],
  },
];

export default function Home() {
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    fetch('/api/waitlist')
      .then((r) => r.json())
      .then((d) => { if (typeof d.count === 'number') setWaitlistCount(d.count); })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ========== HERO ========== */}
      <section style={{
        background: 'var(--color-green-deep)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Image
          src="/assets/backgrounds/wave-layers.svg"
          alt=""
          fill
          style={{ objectFit: 'cover', opacity: 0.07, pointerEvents: 'none' }}
          priority
        />

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
          zIndex: 2,
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/logo.svg" alt="Refine Design" style={{ height: '32px', width: 'auto' }} />
          </Link>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <Link href="#how-it-works" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>How it works</Link>
            <Link href="#tools" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Tools</Link>
            <Link href="/pricing" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Pricing</Link>
            <Link href="/blog" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Blog</Link>
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

        {/* Hero content */}
        <div style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '6rem 2.5rem 8rem',
          width: '100%',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Left: copy */}
          <div style={{ maxWidth: '36rem', flex: '1 1 auto' }}>
            <h1 className="dzyn-reveal" style={{
              fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
              fontSize: 'clamp(3rem, 6vw, 4.5rem)',
              fontWeight: 400,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              color: '#fff',
              marginBottom: '2rem',
            }}>
              Refine your design.
            </h1>
            <p className="dzyn-reveal" style={{
              fontSize: 'var(--text-lg)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '32rem',
              marginBottom: '3rem',
            }}>
              Every AI builder generates the same lifeless output. Refine Design gives your AI actual design taste &mdash; typography, spacing, color theory &mdash; so what it builds looks like a human designed it.
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
            {waitlistCount > 0 && (
              <p className="dzyn-reveal" style={{
                fontSize: 'var(--text-xs)',
                color: 'rgba(255,255,255,0.35)',
                marginTop: '2rem',
              }}>
                {waitlistCount.toLocaleString()} {waitlistCount === 1 ? 'designer' : 'designers'} already refining
              </p>
            )}
          </div>

          {/* Right: editorial illustration — borderless, no card */}
          <style>{`@media(min-width:900px){[data-hero-art]{display:block!important}}`}</style>
          <div data-hero-art="" style={{ flex: '0 0 auto', position: 'relative', display: 'none' }}>
            <Image
              src="/assets/images/hero-illustration.svg"
              alt="Typography specimens, color swatches, and design tools — the craft of intentional design"
              width={480}
              height={480}
              style={{
                maxHeight: '70vh',
                width: 'auto',
                height: 'auto',
              }}
              priority
            />
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
              label="Without Refine Design"
              bad
              items={[
                { prop: 'Primary color', val: 'bg-indigo-600' },
                { prop: 'Font', val: 'Inter / Geist' },
                { prop: 'Radius', val: 'rounded-xl (12px)' },
                { prop: 'Background', val: '#0a0a0a dark' },
                { prop: 'Personality', val: '\u201cAI developer tool\u201d' },
              ]}
            />
            <ComparisonCard
              label="With Refine Design"
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
            21 tools. One design system.
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
          style={{ objectFit: 'cover', opacity: 0.08, pointerEvents: 'none' }}
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
        width: '100%',
      }}>
        <div>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/logo.svg"
              alt="Refine Design"
              style={{
                height: '26px',
                width: 'auto',
                filter: 'brightness(0) saturate(100%) invert(28%) sepia(90%) saturate(600%) hue-rotate(145deg) brightness(85%)',
              }}
            />
          </Link>
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginLeft: '0.75rem',
          }}>
            AI with design taste.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/dashboard" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/pricing" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/blog" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Blog</Link>
          <Link href="/onboarding" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Get started</Link>
          <a href="https://github.com/paleofoundation/designengine" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>GitHub</a>
        </div>
        <span style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          width: '100%',
          textAlign: 'center',
          marginTop: '1rem',
        }}>
          &copy; 2026 Refine Design
        </span>
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
