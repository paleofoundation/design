'use client';

import { getShadowCSS, type DesignLanguagePreset } from '@/lib/design-language';
import type { SiteContent } from '../store';

interface LivePreviewProps {
  projectName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  designLanguage: DesignLanguagePreset;
  viewport: 'desktop' | 'mobile';
  siteContent?: SiteContent | null;
  artStyle?: string;
}

const ART_STYLE_FILTERS: Record<string, string> = {
  'line-art': 'grayscale(100%) contrast(1.3)',
  'flat-vector': 'saturate(1.3) contrast(1.1)',
  'watercolor': 'saturate(0.7) brightness(1.1) blur(0.5px)',
  'isometric': 'saturate(0.8) contrast(1.2)',
  'abstract-geometric': 'contrast(1.2) saturate(1.4)',
  'photo-overlay': 'saturate(0.9) contrast(1.05)',
};

export function LivePreview({
  projectName,
  colors,
  typography,
  designLanguage,
  viewport,
  siteContent,
  artStyle,
}: LivePreviewProps) {
  const r = designLanguage.borderRadius;
  const shadow = getShadowCSS(designLanguage.shadowStyle, `${colors.primary}22`);
  const isDark = isColorDark(colors.background);
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const mutedText = `${colors.text}88`;
  const subtleText = `${colors.text}55`;
  const isMobile = viewport === 'mobile';
  const headingFont = `'${typography.heading}', serif`;
  const bodyFont = `'${typography.body}', sans-serif`;

  const imgFilter = artStyle && ART_STYLE_FILTERS[artStyle] ? ART_STYLE_FILTERS[artStyle] : undefined;

  const navItems = siteContent?.navItems?.length
    ? siteContent.navItems.slice(0, 4)
    : ['Features', 'Pricing', 'About', 'Blog'];

  const headline = siteContent?.headline || 'Design systems that feel like you';
  const description =
    siteContent?.description ||
    `Stop fighting generic templates. ${projectName} gives you a design language that reflects your brand at every touchpoint.`;

  const logoSrc = siteContent?.logo || '';
  const heroImgSrc = siteContent?.heroImage || '';
  const featureImages = siteContent?.siteImages?.slice(0, 3) || [];

  return (
    <div
      style={{
        width: isMobile ? '375px' : '100%',
        maxWidth: isMobile ? '375px' : '100%',
        margin: isMobile ? '0 auto' : undefined,
        background: colors.background,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: isMobile ? '14px' : '16px',
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'var(--color-surface)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840' }} />
        <div
          style={{
            flex: 1,
            marginLeft: '8px',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderRadius: r.full,
            padding: '3px 12px',
            fontSize: '11px',
            color: mutedText,
            fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
          }}
        >
          {projectName.toLowerCase().replace(/\s+/g, '')}.com
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '12px 16px' : '16px 32px',
          borderBottom: `1px solid ${border}`,
        }}
      >
        {logoSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoSrc}
            alt={projectName}
            style={{
              height: isMobile ? '24px' : '32px',
              maxWidth: isMobile ? '100px' : '140px',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div
            style={{
              fontFamily: headingFont,
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: 700,
              color: colors.text,
            }}
          >
            {projectName}
          </div>
        )}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {navItems.map((item) => (
              <span
                key={item}
                style={{
                  fontFamily: bodyFont,
                  fontSize: '14px',
                  fontWeight: 500,
                  color: mutedText,
                }}
              >
                {item}
              </span>
            ))}
            <span
              style={{
                fontFamily: bodyFont,
                fontSize: '13px',
                fontWeight: 600,
                background: colors.primary,
                color: isColorDark(colors.primary) ? '#fff' : '#000',
                padding: '8px 20px',
                borderRadius: r.md,
                boxShadow: shadow,
              }}
            >
              Get started
            </span>
          </div>
        )}
        {isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{ width: '18px', height: '2px', background: colors.text, borderRadius: '1px', opacity: 0.5 }}
              />
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section
        style={{
          position: 'relative',
          padding: heroImgSrc
            ? '0'
            : isMobile
              ? '40px 20px'
              : '64px 48px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {heroImgSrc && (
          <div style={{ position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImgSrc}
              alt="Hero"
              style={{
                width: '100%',
                height: isMobile ? '180px' : '280px',
                objectFit: 'cover',
                display: 'block',
                filter: imgFilter,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to bottom, ${colors.background}33, ${colors.background}ee)`,
              }}
            />
          </div>
        )}
        <div
          style={{
            position: heroImgSrc ? 'relative' : undefined,
            marginTop: heroImgSrc ? '-80px' : undefined,
            padding: heroImgSrc
              ? isMobile
                ? '0 20px 32px'
                : '0 48px 48px'
              : '0',
            maxWidth: '600px',
            margin: heroImgSrc ? '-80px auto 0' : '0 auto',
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontFamily: bodyFont,
              fontSize: '12px',
              fontWeight: 600,
              color: colors.accent,
              background: `${colors.accent}18`,
              padding: '4px 12px',
              borderRadius: r.full,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '16px',
              border: `1px solid ${colors.accent}33`,
            }}
          >
            Now available
          </span>
          <h1
            style={{
              fontFamily: headingFont,
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: 700,
              color: colors.text,
              lineHeight: 1.15,
              marginBottom: '12px',
            }}
          >
            {headline}
          </h1>
          <p
            style={{
              fontFamily: bodyFont,
              fontSize: isMobile ? '15px' : '17px',
              color: mutedText,
              lineHeight: 1.65,
              marginBottom: '24px',
              maxWidth: '480px',
              margin: '0 auto 24px',
            }}
          >
            {description.length > 160 ? description.slice(0, 160) + '...' : description}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: bodyFont,
                background: colors.primary,
                color: isColorDark(colors.primary) ? '#fff' : '#000',
                padding: '10px 24px',
                borderRadius: r.md,
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: shadow,
              }}
            >
              Start building
            </span>
            <span
              style={{
                fontFamily: bodyFont,
                border: `1.5px solid ${colors.primary}`,
                color: colors.primary,
                padding: '10px 24px',
                borderRadius: r.md,
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              See how it works
            </span>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section
        style={{
          padding: isMobile ? '20px 16px 32px' : '0 48px 48px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '12px' : '20px',
        }}
      >
        {[
          { title: 'Design Tokens', desc: 'Colors, typography, and spacing as structured data.', color: colors.primary },
          { title: 'Component Library', desc: 'Pre-styled components that match your brand.', color: colors.secondary },
          { title: 'AI-Ready Export', desc: 'Ship to Cursor, Figma, or any AI coding tool.', color: colors.accent },
        ].map((feature, idx) => (
          <div
            key={feature.title}
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.015)',
              border: `1px solid ${border}`,
              borderRadius: r.lg,
              overflow: 'hidden',
              boxShadow: shadow,
            }}
          >
            {featureImages[idx] ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={featureImages[idx]}
                alt=""
                style={{
                  width: '100%',
                  height: isMobile ? '100px' : '120px',
                  objectFit: 'cover',
                  display: 'block',
                  filter: imgFilter,
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: isMobile ? '60px' : '72px',
                  background: `${feature.color}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: designLanguage.imageShape === 'rounded' ? r.lg : r.md,
                    background: `${feature.color}25`,
                    border: `1px solid ${feature.color}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: feature.color }} />
                </div>
              </div>
            )}
            <div style={{ padding: isMobile ? '16px' : '20px' }}>
              <h3
                style={{
                  fontFamily: headingFont,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: colors.text,
                  marginBottom: '6px',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontFamily: bodyFont,
                  fontSize: '13px',
                  color: mutedText,
                  lineHeight: 1.6,
                }}
              >
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Testimonial */}
      <section
        style={{
          padding: isMobile ? '24px 20px' : '32px 48px',
          borderTop: `1px solid ${border}`,
          borderBottom: `1px solid ${border}`,
          background: isDark ? 'rgba(255,255,255,0.02)' : `${colors.accent}08`,
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: headingFont,
              fontSize: isMobile ? '16px' : '18px',
              fontStyle: 'italic',
              color: colors.text,
              lineHeight: 1.6,
              marginBottom: '12px',
              opacity: 0.8,
            }}
          >
            &ldquo;This completely changed how we build. Every AI session stays on-brand without us thinking about
            it.&rdquo;
          </p>
          <p
            style={{
              fontFamily: bodyFont,
              fontSize: '13px',
              fontWeight: 600,
              color: colors.accent,
            }}
          >
            Sarah Chen
          </p>
          <p
            style={{
              fontFamily: bodyFont,
              fontSize: '12px',
              color: subtleText,
            }}
          >
            Head of Design, Acme Corp
          </p>
        </div>
      </section>

      {/* Pricing table */}
      <section
        style={{
          padding: isMobile ? '32px 16px' : '48px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: headingFont,
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: 700,
            color: colors.text,
            marginBottom: '8px',
          }}
        >
          Simple pricing
        </h2>
        <p
          style={{
            fontFamily: bodyFont,
            fontSize: '14px',
            color: mutedText,
            marginBottom: '24px',
          }}
        >
          Start free, scale when you&rsquo;re ready.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '16px',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          {[
            { name: 'Starter', price: 'Free', features: ['1 project', '500 tokens/mo', 'Community support'] },
            {
              name: 'Pro',
              price: '$19/mo',
              features: ['Unlimited projects', 'Unlimited tokens', 'Priority support'],
              highlighted: true,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.highlighted
                  ? isDark
                    ? `${colors.primary}15`
                    : `${colors.primary}08`
                  : isDark
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(0,0,0,0.01)',
                border: plan.highlighted ? `2px solid ${colors.primary}` : `1px solid ${border}`,
                borderRadius: r.lg,
                padding: '24px 20px',
                boxShadow: plan.highlighted ? shadow : 'none',
              }}
            >
              <p
                style={{
                  fontFamily: bodyFont,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: plan.highlighted ? colors.primary : mutedText,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                {plan.name}
              </p>
              <p
                style={{
                  fontFamily: headingFont,
                  fontSize: '28px',
                  fontWeight: 700,
                  color: colors.text,
                  marginBottom: '12px',
                }}
              >
                {plan.price}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                {plan.features.map((f) => (
                  <p key={f} style={{ fontFamily: bodyFont, fontSize: '12px', color: mutedText }}>
                    {f}
                  </p>
                ))}
              </div>
              <span
                style={{
                  fontFamily: bodyFont,
                  display: 'block',
                  background: plan.highlighted ? colors.primary : 'transparent',
                  color: plan.highlighted ? (isColorDark(colors.primary) ? '#fff' : '#000') : colors.primary,
                  border: plan.highlighted ? 'none' : `1.5px solid ${colors.primary}`,
                  padding: '8px 20px',
                  borderRadius: r.md,
                  fontSize: '13px',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {plan.highlighted ? 'Start free trial' : 'Get started'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${border}`,
          padding: isMobile ? '20px 16px' : '24px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
        }}
      >
        <div>
          {logoSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoSrc}
              alt={projectName}
              style={{ height: '20px', maxWidth: '100px', objectFit: 'contain', marginBottom: '4px' }}
            />
          ) : (
            <p style={{ fontFamily: headingFont, fontSize: '14px', fontWeight: 700, color: colors.text, marginBottom: '4px' }}>
              {projectName}
            </p>
          )}
          <p style={{ fontFamily: bodyFont, fontSize: '12px', color: subtleText }}>
            Design systems for the AI era.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['Privacy', 'Terms', 'Contact', 'Twitter'].map((link) => (
            <span key={link} style={{ fontFamily: bodyFont, fontSize: '12px', fontWeight: 500, color: colors.secondary }}>
              {link}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}

function isColorDark(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length < 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
