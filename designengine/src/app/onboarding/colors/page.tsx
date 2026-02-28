'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store';

const CURATED_PALETTES: Record<string, Array<{ name: string; colors: { primary: string; secondary: string; accent: string; background: string; text: string } }>> = {
  corporate: [
    { name: 'Navy Trust', colors: { primary: '#1B365D', secondary: '#2C5F7C', accent: '#C5A55A', background: '#F7F5F2', text: '#1A1A1A' } },
    { name: 'Steel Blue', colors: { primary: '#2D4059', secondary: '#5C7A99', accent: '#FF6B35', background: '#FAFAFA', text: '#1A1A1A' } },
    { name: 'Forest Authority', colors: { primary: '#1D3C34', secondary: '#306E5E', accent: '#D4A574', background: '#F5F5F0', text: '#1A1A1A' } },
  ],
  playful: [
    { name: 'Tropical', colors: { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D', background: '#F7FFF7', text: '#2D3436' } },
    { name: 'Sunset Pop', colors: { primary: '#FF6719', secondary: '#F2B245', accent: '#CAC5F9', background: '#FDFBF7', text: '#1A1A1A' } },
    { name: 'Berry Fizz', colors: { primary: '#E84393', secondary: '#6C5CE7', accent: '#00CEC9', background: '#FFF8F0', text: '#2D3436' } },
  ],
  editorial: [
    { name: 'Classic Ink', colors: { primary: '#1A1A1A', secondary: '#6B6B6B', accent: '#C5A55A', background: '#FDFBF7', text: '#1A1A1A' } },
    { name: 'Warm Mono', colors: { primary: '#2C2C2C', secondary: '#8B8580', accent: '#B85C38', background: '#F5F0E8', text: '#1A1A1A' } },
    { name: 'Green Leaf', colors: { primary: '#306E5E', secondary: '#4A8E7A', accent: '#FF6719', background: '#FDFBF7', text: '#1A1A1A' } },
  ],
  minimal: [
    { name: 'Pure', colors: { primary: '#111111', secondary: '#888888', accent: '#0066FF', background: '#FFFFFF', text: '#111111' } },
    { name: 'Warm Minimal', colors: { primary: '#1A1A1A', secondary: '#999999', accent: '#FF4F00', background: '#FAFAF8', text: '#1A1A1A' } },
    { name: 'Cool Gray', colors: { primary: '#18181B', secondary: '#71717A', accent: '#22C55E', background: '#FAFAFA', text: '#18181B' } },
  ],
  bold: [
    { name: 'Electric', colors: { primary: '#6C2BD9', secondary: '#FF4F00', accent: '#00D4AA', background: '#0A0A0A', text: '#F5F5F5' } },
    { name: 'Neon Night', colors: { primary: '#FF006E', secondary: '#8338EC', accent: '#FFBE0B', background: '#0F0F0F', text: '#FFFFFF' } },
    { name: 'Cyber', colors: { primary: '#00F5D4', secondary: '#7B2FF7', accent: '#F15BB5', background: '#0A0A0F', text: '#E8E8E8' } },
  ],
  luxury: [
    { name: 'Gold Standard', colors: { primary: '#2C2C2C', secondary: '#666666', accent: '#C5A55A', background: '#F5F0E8', text: '#1A1A1A' } },
    { name: 'Noir', colors: { primary: '#0A0A0A', secondary: '#3A3A3A', accent: '#B8860B', background: '#1A1A1A', text: '#F5F0E8' } },
    { name: 'Emerald Lux', colors: { primary: '#0F2620', secondary: '#306E5E', accent: '#D4AF37', background: '#FDFBF7', text: '#0F2620' } },
  ],
};

const COLOR_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  background: 'Background',
  text: 'Text',
};

export default function OnboardingColors() {
  const router = useRouter();
  const { mood, colors, setField } = useOnboardingStore();

  const palettes = CURATED_PALETTES[mood] || CURATED_PALETTES.editorial;

  function selectPalette(palette: typeof palettes[0]) {
    setField('colors', { ...palette.colors });
  }

  function updateColor(key: keyof typeof colors, value: string) {
    setField('colors', { ...colors, [key]: value });
  }

  return (
    <div style={{
      maxWidth: '56rem',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-4)',
      width: '100%',
    }}>
      <StepIndicator current={3} total={5} />

      <h1 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        lineHeight: 'var(--leading-tight)',
        marginBottom: 'var(--space-1)',
      }}>
        Choose your colors
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-body)',
        marginBottom: 'var(--space-6)',
      }}>
        Pick a curated palette or fine-tune each color. These become the CSS variables and Tailwind config for your entire project.
      </p>

      {/* Curated palettes */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <p style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-2)',
        }}>
          Curated for &ldquo;{mood || 'editorial'}&rdquo; mood
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 14rem), 1fr))',
          gap: 'var(--space-2)',
        }}>
          {palettes.map((p) => (
            <button
              key={p.name}
              onClick={() => selectPalette(p)}
              style={{
                textAlign: 'left',
                background: 'var(--color-white)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'border-color var(--duration-fast) var(--ease-out)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: 'var(--space-1)' }}>
                {Object.values(p.colors).map((c, i) => (
                  <div key={i} style={{
                    flex: 1, height: '2rem', borderRadius: 'var(--radius-sm)',
                    background: c, border: '1px solid rgba(0,0,0,0.06)',
                  }} />
                ))}
              </div>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-primary)' }}>{p.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Fine-tune controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 10rem), 1fr))',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
      }}>
        {(Object.keys(colors) as Array<keyof typeof colors>).map((key) => (
          <div key={key}>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              marginBottom: '0.25rem',
            }}>
              {COLOR_LABELS[key]}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => updateColor(key, e.target.value)}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  border: '2px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  padding: 0,
                  background: 'none',
                }}
              />
              <input
                type="text"
                value={colors[key]}
                onChange={(e) => updateColor(key, e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--color-white)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.375rem 0.5rem',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Live preview */}
      <div style={{
        background: colors.background,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-4)',
      }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', fontWeight: 500, letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase' }}>Live preview</p>
        <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: colors.text, fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)', marginBottom: 'var(--space-1)' }}>
          Your heading looks like this
        </h3>
        <p style={{ fontSize: 'var(--text-base)', color: colors.text, opacity: 0.7, marginBottom: 'var(--space-3)', maxWidth: '32rem', lineHeight: 'var(--leading-normal)' }}>
          Body text with comfortable line height. This is what your paragraphs will feel like across the whole application.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
          <span style={{ background: colors.primary, color: '#fff', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Primary Button</span>
          <span style={{ background: colors.secondary, color: '#fff', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Secondary</span>
          <span style={{ background: colors.accent, color: colors.text, padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Accent</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-4)' }}>
        <button onClick={() => router.push('/onboarding/mood')} style={{ background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-body)', cursor: 'pointer', fontFamily: 'inherit' }}>
          &larr; Back
        </button>
        <button onClick={() => router.push('/onboarding/typography')} style={{ background: 'var(--color-orange)', color: '#fff', fontWeight: 600, fontSize: 'var(--text-base)', padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          Next: Typography &rarr;
        </button>
      </div>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--space-6)' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < current ? 'var(--color-green-deep)' : 'var(--color-border)' }} />
      ))}
    </div>
  );
}
