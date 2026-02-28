'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { PALETTE, DASH, FONT, RADIUS, TEXT_SIZE } from '@/lib/design-tokens';
import { generateFaviconSvg, type FaviconShape } from '@/lib/svg/favicon';
import { generateAllPatterns } from '@/lib/svg/patterns';
import { generateAllDividers } from '@/lib/svg/dividers';
import { generateAllHeroes } from '@/lib/svg/hero-backgrounds';
import { generateAllAnimations } from '@/lib/assets/animations';
import type { PaletteColors } from '@/lib/svg/utils';

const SHAPES: FaviconShape[] = ['rounded-rect', 'circle', 'hexagon', 'squircle'];
const FAVICON_SIZES = [128, 64, 32, 16];

export default function PreviewPage() {
  const [primary, setPrimary] = useState('#306E5E');
  const [secondary, setSecondary] = useState('#4A8E7A');
  const [accent, setAccent] = useState('#FF6719');
  const [background, setBackground] = useState('#FFFFFF');
  const [amber, setAmber] = useState('#F2B245');
  const [lavender, setLavender] = useState('#CAC5F9');
  const [surface, setSurface] = useState('#FDFBF7');
  const [brandName, setBrandName] = useState('Dzyne');
  const [faviconShape, setFaviconShape] = useState<FaviconShape>('rounded-rect');
  const [activeHero, setActiveHero] = useState(0);
  const animStyleRef = useRef<HTMLStyleElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const faviconLinkRef = useRef<HTMLLinkElement | null>(null);

  const colors: PaletteColors = useMemo(() => ({
    primary, secondary, accent, background, amber, lavender, surface,
  }), [primary, secondary, accent, background, amber, lavender, surface]);

  const faviconSvgs = useMemo(() =>
    SHAPES.map(shape => ({
      shape,
      svg: generateFaviconSvg({ primaryColor: primary, letter: brandName, shape, accentColor: accent }),
    })),
    [primary, accent, brandName],
  );

  const patterns = useMemo(() => generateAllPatterns(colors), [colors]);
  const dividers = useMemo(() => generateAllDividers(colors), [colors]);
  const heroes = useMemo(() => generateAllHeroes(colors), [colors]);
  const animations = useMemo(() => generateAllAnimations(colors), [colors]);

  // Set browser tab favicon in real time
  useEffect(() => {
    const svg = generateFaviconSvg({ primaryColor: primary, letter: brandName, shape: faviconShape, accentColor: accent });
    const encoded = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    if (!faviconLinkRef.current) {
      const existing = document.querySelector('link[rel="icon"]');
      if (existing) existing.remove();
      faviconLinkRef.current = document.createElement('link');
      faviconLinkRef.current.rel = 'icon';
      faviconLinkRef.current.type = 'image/svg+xml';
      document.head.appendChild(faviconLinkRef.current);
    }
    faviconLinkRef.current.href = encoded;
    return () => {
      faviconLinkRef.current?.remove();
      faviconLinkRef.current = null;
    };
  }, [primary, accent, brandName, faviconShape]);

  // Inject animation CSS
  useEffect(() => {
    const allCss = animations
      .flatMap(a => Object.values(a.files).filter(f => f.type === 'css').map(f => f.content))
      .join('\n\n');
    if (!animStyleRef.current) {
      animStyleRef.current = document.createElement('style');
      animStyleRef.current.setAttribute('data-dzyn-preview', 'true');
      document.head.appendChild(animStyleRef.current);
    }
    animStyleRef.current.textContent = allCss;
    return () => {
      animStyleRef.current?.remove();
      animStyleRef.current = null;
    };
  }, [animations]);

  // Cursor follower effect
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const el = document.createElement('div');
    el.className = 'dzyn-cursor';
    document.body.appendChild(el);
    cursorRef.current = el;

    let x = 0, y = 0, tx = 0, ty = 0;
    const speed = 0.15;
    let halfW = 10;
    let raf: number;

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const sel = 'a, button, [role="button"], input, textarea, select, label';
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(sel)) { el.classList.add('dzyn-cursor--hover'); halfW = 22; }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(sel)) { el.classList.remove('dzyn-cursor--hover'); halfW = 10; }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    function tick() {
      x += (tx - x) * speed;
      y += (ty - y) * speed;
      el.style.transform = `translate3d(${x - halfW}px,${y - halfW}px,0)`;
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      el.remove();
      cursorRef.current = null;
    };
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    const sel = '.dzyn-reveal, .dzyn-reveal--left, .dzyn-reveal--right, .dzyn-reveal--scale';
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    const observe = () => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.classList.contains('is-visible')) observer.observe(el);
      });
    };
    const timer = setTimeout(observe, 100);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [colors]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: FONT.heading, fontSize: TEXT_SIZE['2xl'], fontWeight: 400, color: DASH.heading, letterSpacing: '-0.02em' }}>
          Asset Preview
        </h2>
        <p style={{ fontSize: TEXT_SIZE.sm, color: DASH.muted, marginTop: '0.25rem' }}>
          Live preview of all generated assets. Adjust colors and see everything update in real time.
        </p>
      </div>

      {/* Controls */}
      <section style={{ background: DASH.card, border: `1px solid ${DASH.cardBorder}`, borderRadius: RADIUS.lg, padding: '1.5rem' }}>
        <h3 style={{ fontFamily: FONT.heading, fontSize: TEXT_SIZE.lg, color: DASH.heading, marginBottom: '1rem' }}>
          Configuration
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <ColorInput label="Primary" value={primary} onChange={setPrimary} />
          <ColorInput label="Secondary" value={secondary} onChange={setSecondary} />
          <ColorInput label="Accent" value={accent} onChange={setAccent} />
          <ColorInput label="Amber" value={amber} onChange={setAmber} />
          <ColorInput label="Lavender" value={lavender} onChange={setLavender} />
          <ColorInput label="Surface" value={surface} onChange={setSurface} />
          <ColorInput label="Background" value={background} onChange={setBackground} />
          <div>
            <label style={labelStyle}>Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Favicon Shape</label>
            <select
              value={faviconShape}
              onChange={e => setFaviconShape(e.target.value as FaviconShape)}
              style={inputStyle}
            >
              {SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Favicon */}
      <section style={sectionStyle}>
        <SectionHeader title="Favicon" count={`${SHAPES.length} shapes × ${FAVICON_SIZES.length} sizes`} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* All shapes side by side */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {faviconSvgs.map(({ shape, svg }) => (
              <div key={shape} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  dangerouslySetInnerHTML={{ __html: svg }}
                  style={{ width: 96, height: 96 }}
                />
                <span style={{ fontSize: TEXT_SIZE.xs, color: DASH.muted, fontFamily: FONT.mono }}>{shape}</span>
              </div>
            ))}
          </div>
          {/* Selected shape at multiple sizes */}
          <div>
            <p style={{ fontSize: TEXT_SIZE.sm, color: DASH.body, marginBottom: '0.75rem' }}>
              Selected shape ({faviconShape}) at browser sizes:
            </p>
            <div style={{ display: 'flex', alignItems: 'end', gap: '1.5rem' }}>
              {FAVICON_SIZES.map(size => {
                const svg = generateFaviconSvg({ primaryColor: primary, letter: brandName, shape: faviconShape, accentColor: accent });
                return (
                  <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <div dangerouslySetInnerHTML={{ __html: svg }} style={{ width: size, height: size }} />
                    <span style={{ fontSize: TEXT_SIZE.xs, color: DASH.muted, fontFamily: FONT.mono }}>{size}px</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Patterns */}
      <section style={sectionStyle}>
        <SectionHeader title="Background Patterns" count={`${patterns.length} types`} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {patterns.map(p => (
            <div key={p.type} style={{
              borderRadius: RADIUS.md,
              border: `1px solid ${DASH.cardBorder}`,
              overflow: 'hidden',
            }}>
              <div
                style={{
                  height: 160,
                  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(p.svg)}")`,
                  backgroundRepeat: 'repeat',
                  backgroundColor: background,
                }}
              />
              <div style={{ padding: '0.625rem 0.75rem', background: DASH.card }}>
                <span style={{ fontSize: TEXT_SIZE.sm, fontFamily: FONT.mono, color: DASH.heading }}>{p.type}</span>
                <span style={{ fontSize: TEXT_SIZE.xs, color: DASH.muted, marginLeft: '0.5rem' }}>{p.svg.length}B</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dividers */}
      <section style={sectionStyle}>
        <SectionHeader title="Section Dividers" count={`${dividers.length} types`} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {dividers.map(d => (
            <div key={d.type} style={{
              borderRadius: RADIUS.md,
              border: `1px solid ${DASH.cardBorder}`,
              overflow: 'hidden',
            }}>
              <div style={{ background: primary, height: 32, opacity: 0.08 }} />
              <div dangerouslySetInnerHTML={{ __html: d.svg }} style={{ display: 'block', lineHeight: 0 }} />
              <div style={{ padding: '0.5rem 0.75rem', background: DASH.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: TEXT_SIZE.sm, fontFamily: FONT.mono, color: DASH.heading }}>{d.type}</span>
                <span style={{ fontSize: TEXT_SIZE.xs, color: DASH.muted }}>{d.svg.length}B</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hero Backgrounds */}
      <section style={sectionStyle}>
        <SectionHeader title="Hero Backgrounds" count={`${heroes.length} types`} />
        {/* Tab selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {heroes.map((h, i) => (
            <button
              key={h.type}
              onClick={() => setActiveHero(i)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: RADIUS.full,
                border: `1px solid ${i === activeHero ? primary : DASH.cardBorder}`,
                background: i === activeHero ? primary : 'transparent',
                color: i === activeHero ? '#fff' : DASH.body,
                fontSize: TEXT_SIZE.sm,
                fontFamily: FONT.mono,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {h.type}
            </button>
          ))}
        </div>
        {/* Active hero preview */}
        <div style={{
          borderRadius: RADIUS.lg,
          overflow: 'hidden',
          border: `1px solid ${DASH.cardBorder}`,
          position: 'relative',
          minHeight: 360,
        }}>
          <div
            dangerouslySetInnerHTML={{ __html: heroes[activeHero].svg }}
            style={{ position: 'absolute', inset: 0, lineHeight: 0 }}
          />
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 360,
            padding: '3rem',
            textAlign: 'center',
          }}>
            <h3 style={{ fontFamily: FONT.heading, fontSize: TEXT_SIZE['3xl'], color: DASH.heading, fontWeight: 400, letterSpacing: '-0.02em' }}>
              {brandName}
            </h3>
            <p style={{ fontSize: TEXT_SIZE.lg, color: DASH.body, maxWidth: '36rem', marginTop: '0.75rem' }}>
              This hero background is generated programmatically from your design tokens. Zero stock imagery.
            </p>
            <button className="dzyn-btn dzyn-btn--glow" style={{
              marginTop: '1.5rem',
              padding: '0.75rem 2rem',
              background: primary,
              color: '#fff',
              border: 'none',
              borderRadius: RADIUS.md,
              fontSize: TEXT_SIZE.base,
              fontFamily: FONT.body,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Micro-Interactions */}
      <section style={sectionStyle}>
        <SectionHeader title="Micro-Interactions" count={`${animations.length} modules`} />

        {/* Buttons */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: TEXT_SIZE.sm, color: DASH.body, marginBottom: '1rem' }}>
            Hover over the buttons to see each effect. The cursor follower is already active on this page.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { cls: 'dzyn-btn dzyn-btn--glow', label: 'Glow Hover' },
              { cls: 'dzyn-btn dzyn-btn--shine', label: 'Shine Sweep' },
              { cls: 'dzyn-btn dzyn-btn--pulse', label: 'Pulse CTA' },
              { cls: 'dzyn-btn dzyn-btn--scale', label: 'Scale' },
              { cls: 'dzyn-glow dzyn-glow--animate', label: 'Glow Pulse' },
              { cls: 'dzyn-glow-border', label: 'Gradient Border' },
            ].map(({ cls, label }) => (
              <button
                key={label}
                className={cls}
                style={{
                  padding: '0.625rem 1.5rem',
                  background: label === 'Gradient Border' ? background : primary,
                  color: label === 'Gradient Border' ? DASH.heading : '#fff',
                  border: label === 'Gradient Border' ? 'none' : `1px solid transparent`,
                  borderRadius: RADIUS.md,
                  fontSize: TEXT_SIZE.sm,
                  fontFamily: FONT.body,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: TEXT_SIZE.sm, color: DASH.body, marginBottom: '0.75rem' }}>Loading spinner:</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="dzyn-spinner" />
            <div className="dzyn-spinner" style={{ width: 24, height: 24 }} />
            <div className="dzyn-spinner" style={{ width: 48, height: 48 }} />
          </div>
        </div>

        {/* Scroll Reveal */}
        <div>
          <p style={{ fontSize: TEXT_SIZE.sm, color: DASH.body, marginBottom: '0.75rem' }}>
            Scroll reveal (scroll down to trigger):
          </p>
          <div className="dzyn-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {['Fade up', 'Fade up', 'Fade up', 'Fade up'].map((label, i) => (
              <div
                key={i}
                className="dzyn-reveal"
                style={{
                  background: DASH.card,
                  border: `1px solid ${DASH.cardBorder}`,
                  borderRadius: RADIUS.lg,
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `${primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  fontSize: TEXT_SIZE.lg,
                }}>
                  {['✦', '◆', '●', '▲'][i]}
                </div>
                <span style={{ fontSize: TEXT_SIZE.sm, color: DASH.heading, fontWeight: 500 }}>{label} #{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* File Manifest */}
      <section style={sectionStyle}>
        <SectionHeader title="Generated Files" count="what scaffold-assets produces" />
        <div style={{ fontFamily: FONT.mono, fontSize: TEXT_SIZE.xs, color: DASH.body, lineHeight: 1.8 }}>
          <div style={{ background: DASH.codeBg, borderRadius: RADIUS.md, padding: '1.25rem', whiteSpace: 'pre' }}>
{`assets/
  favicon/
    favicon.svg              ${faviconSvgs.find(f => f.shape === faviconShape)?.svg.length ?? 0}B
    favicon-16x16.png        (generated via sharp)
    favicon-32x32.png
    favicon-48x48.png
    apple-touch-icon.png
    favicon-192x192.png
    favicon-512x512.png
    site.webmanifest
  patterns/
${patterns.map(p => `    ${p.type}.svg${' '.repeat(22 - p.type.length)}${p.svg.length}B`).join('\n')}
  dividers/
${dividers.map(d => `    ${d.type}.svg${' '.repeat(22 - d.type.length)}${d.svg.length}B`).join('\n')}
  backgrounds/
${heroes.map(h => `    ${h.type}.svg${' '.repeat(18 - h.type.length)}${h.svg.length}B`).join('\n')}
  animations/
${animations.flatMap(a => Object.entries(a.files).map(([name, f]) => `    ${name}${' '.repeat(24 - name.length)}${f.content.length}B`)).join('\n')}
  assets.json               (manifest)`}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ——— Shared styles and sub-components ——— */

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: TEXT_SIZE.xs,
  color: DASH.muted,
  fontFamily: FONT.mono,
  marginBottom: '0.25rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.625rem',
  background: DASH.inputBg,
  border: `1px solid ${DASH.inputBorder}`,
  borderRadius: RADIUS.md,
  fontSize: TEXT_SIZE.sm,
  fontFamily: FONT.body,
  color: DASH.heading,
  outline: 'none',
};

const sectionStyle: React.CSSProperties = {
  background: DASH.card,
  border: `1px solid ${DASH.cardBorder}`,
  borderRadius: RADIUS.lg,
  padding: '1.5rem',
};

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: 36,
            height: 36,
            border: `1px solid ${DASH.inputBorder}`,
            borderRadius: RADIUS.md,
            padding: 2,
            cursor: 'pointer',
            background: 'transparent',
          }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, fontFamily: FONT.mono }}
        />
      </div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <h3 style={{ fontFamily: FONT.heading, fontSize: TEXT_SIZE.lg, color: DASH.heading }}>{title}</h3>
      <span style={{ fontSize: TEXT_SIZE.xs, color: DASH.muted, fontFamily: FONT.mono }}>{count}</span>
    </div>
  );
}
