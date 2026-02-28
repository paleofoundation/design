'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from './store';

export default function OnboardingStep1() {
  const router = useRouter();
  const { projectName, inspirationUrl, brandDescription, setField } = useOnboardingStore();

  const canProceed = projectName.trim().length > 0;

  return (
    <div style={{
      maxWidth: '36rem',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-4)',
      width: '100%',
    }}>
      <StepIndicator current={1} total={5} />

      <h1 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        lineHeight: 'var(--leading-tight)',
        marginBottom: 'var(--space-1)',
      }}>
        Tell us about your brand
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-body)',
        marginBottom: 'var(--space-6)',
        lineHeight: 'var(--leading-normal)',
      }}>
        We&rsquo;ll use this to build a design system that feels like you, not like every other AI-generated app.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <InputField
          label="Project name"
          placeholder="e.g. My SaaS, Acme Corp, Portfolio"
          value={projectName}
          onChange={(v) => setField('projectName', v)}
          required
        />

        <InputField
          label="A website you love the look of"
          placeholder="https://example.com"
          value={inspirationUrl}
          onChange={(v) => setField('inspirationUrl', v)}
          hint="We'll extract colors, fonts, and spacing from this site to use as a starting point."
        />

        <div>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-0-5)',
          }}>
            Describe your brand in a few words
          </label>
          <textarea
            value={brandDescription}
            onChange={(e) => setField('brandDescription', e.target.value)}
            placeholder="e.g. Modern and minimal for developers, warm and editorial for writers, bold and playful for a kids app..."
            rows={3}
            style={{
              width: '100%',
              background: 'var(--color-white)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-1) var(--space-2)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              resize: 'none',
              outline: 'none',
              transition: 'border-color var(--duration-fast) var(--ease-out)',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-green-deep)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          />
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: 'var(--space-8)',
      }}>
        <button
          onClick={() => router.push('/onboarding/mood')}
          disabled={!canProceed}
          style={{
            background: canProceed ? 'var(--color-orange)' : 'var(--color-border)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 'var(--text-base)',
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            transition: 'background var(--duration-fast) var(--ease-out)',
            fontFamily: 'inherit',
          }}
        >
          Next: Pick a mood &rarr;
        </button>
      </div>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      marginBottom: 'var(--space-6)',
    }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: '3px',
            borderRadius: '2px',
            background: i < current ? 'var(--color-green-deep)' : 'var(--color-border)',
            transition: 'background var(--duration-slow) var(--ease-out)',
          }}
        />
      ))}
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, required, hint }: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-0-5)',
      }}>
        {label}{required && <span style={{ color: 'var(--color-orange)' }}> *</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'var(--color-white)',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.625rem var(--space-2)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-primary)',
          outline: 'none',
          transition: 'border-color var(--duration-fast) var(--ease-out)',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-green-deep)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
      />
      {hint && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          {hint}
        </p>
      )}
    </div>
  );
}
