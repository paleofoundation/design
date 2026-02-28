'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store';
import { StepIndicator } from '../components';

const MOODS = [
  {
    id: 'corporate',
    label: 'Corporate',
    subtitle: 'Professional & trustworthy',
    palette: ['#1B365D', '#2C5F7C', '#E8E4DF', '#F7F5F2'],
    description: 'Clean lines, navy and slate tones, structured layouts. Think enterprise SaaS, finance, consulting.',
  },
  {
    id: 'playful',
    label: 'Playful',
    subtitle: 'Friendly & approachable',
    palette: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#F7FFF7'],
    description: 'Rounded shapes, bright colors, generous spacing. Think consumer apps, ed-tech, kids.',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    subtitle: 'Sophisticated & considered',
    palette: ['#1A1A1A', '#6B6B6B', '#F5F0E8', '#FDFBF7'],
    description: 'Strong typography, restrained color, lots of white space. Think Substack, Medium, luxury brands.',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    subtitle: 'Clean & essential',
    palette: ['#111111', '#888888', '#F5F5F5', '#FFFFFF'],
    description: 'Nothing extra. Monochrome with one accent. Think Apple, Linear, Dieter Rams.',
  },
  {
    id: 'bold',
    label: 'Bold',
    subtitle: 'Expressive & energetic',
    palette: ['#6C2BD9', '#FF4F00', '#00D4AA', '#0A0A0A'],
    description: 'Saturated colors, strong contrast, dynamic layouts. Think Vercel, Stripe, creative agencies.',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    subtitle: 'Elevated & refined',
    palette: ['#2C2C2C', '#C5A55A', '#F5F0E8', '#1A1A1A'],
    description: 'Deep tones, gold accents, generous spacing, serif typography. Think high-end fashion, hospitality.',
  },
];

export default function OnboardingMood() {
  const router = useRouter();
  const { mood, setField, extractionStatus, adoptions, inspirationUrl } = useOnboardingStore();
  const hasExtraction = extractionStatus === 'done';
  const moodWasDetected = hasExtraction && adoptions.mood && mood !== '';

  const stepNumber = hasExtraction ? 3 : 2;

  function extractDomain(url: string): string {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  return (
    <div style={{
      maxWidth: '56rem',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-4)',
      width: '100%',
    }}>
      <StepIndicator current={stepNumber} />

      <h1 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        lineHeight: 'var(--leading-tight)',
        marginBottom: 'var(--space-1)',
      }}>
        {moodWasDetected ? 'Confirm the mood' : 'What\u2019s the mood?'}
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-body)',
        marginBottom: 'var(--space-6)',
      }}>
        {moodWasDetected
          ? <>Based on {extractDomain(inspirationUrl)}, we detected a <strong style={{ color: 'var(--color-green-deep)', textTransform: 'capitalize' }}>{mood}</strong> feel. Confirm or pick a different direction.</>
          : 'This shapes everything \u2014 color choices, typography weight, spacing density, corner radii.'
        }
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 16rem), 1fr))',
        gap: 'var(--space-3)',
      }}>
        {MOODS.map((m) => {
          const isDetected = moodWasDetected && m.id === mood;
          return (
            <button
              key={m.id}
              onClick={() => setField('mood', m.id)}
              style={{
                textAlign: 'left',
                background: 'var(--color-white)',
                border: mood === m.id
                  ? '2px solid var(--color-green-deep)'
                  : '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                cursor: 'pointer',
                transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
                boxShadow: mood === m.id ? 'var(--shadow-md)' : 'none',
                fontFamily: 'inherit',
                position: 'relative',
              }}
            >
              {isDetected && (
                <span style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: 'var(--space-2)',
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'var(--color-green-deep)',
                  background: 'var(--color-green-muted)',
                  padding: '0.1rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase',
                  border: '1px solid var(--color-green-deep)',
                }}>
                  Detected
                </span>
              )}
              <div style={{
                display: 'flex',
                gap: '0.25rem',
                marginBottom: 'var(--space-2)',
              }}>
                {m.palette.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: 'var(--radius-sm)',
                      background: c,
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  />
                ))}
              </div>
              <p style={{
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '0.125rem',
              }}>
                {m.label}
              </p>
              <p style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                color: 'var(--color-green-deep)',
                marginBottom: 'var(--space-1)',
              }}>
                {m.subtitle}
              </p>
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--leading-normal)',
              }}>
                {m.description}
              </p>
            </button>
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 'var(--space-8)',
      }}>
        <button
          onClick={() => router.push(hasExtraction ? '/onboarding/analyze' : '/onboarding')}
          style={{
            background: 'none',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-body)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          &larr; Back
        </button>
        <button
          onClick={() => router.push('/onboarding/colors')}
          disabled={!mood}
          style={{
            background: mood ? 'var(--color-orange)' : 'var(--color-border)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 'var(--text-base)',
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: mood ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          Next: Colors &rarr;
        </button>
      </div>
    </div>
  );
}
