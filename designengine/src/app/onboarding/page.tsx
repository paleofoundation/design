'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore, type UserIntent } from './store';
import { StepIndicator } from './components';

export default function OnboardingStep1() {
  const router = useRouter();
  const { projectName, brandDescription, intent, setField } = useOnboardingStore();
  const [hovered, setHovered] = useState<UserIntent | ''>('');

  const canProceed = projectName.trim().length > 0 && intent !== '';

  function handleNext() {
    if (!canProceed) return;
    if (intent === 'refresh') {
      router.push('/onboarding/refresh');
    } else {
      router.push('/onboarding/inspiration');
    }
  }

  return (
    <div style={{
      maxWidth: '42rem',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-4)',
      width: '100%',
    }}>
      <StepIndicator current={1} />

      <h1 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        lineHeight: 'var(--leading-tight)',
        marginBottom: 'var(--space-1)',
      }}>
        Let&rsquo;s build your design system
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-body)',
        marginBottom: 'var(--space-6)',
        lineHeight: 'var(--leading-normal)',
      }}>
        We&rsquo;ll create a complete set of design tokens &mdash; colors, typography, spacing, and art direction &mdash; tailored to you.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <InputField
          label="Project name"
          placeholder="e.g. My SaaS, Acme Corp, Portfolio"
          value={projectName}
          onChange={(v) => setField('projectName', v)}
          required
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

        {/* Intent selection */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}>
            What brings you here? <span style={{ color: 'var(--color-orange)' }}>*</span>
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-3)',
          }}>
            <IntentCard
              selected={intent === 'refresh'}
              hovering={hovered === 'refresh'}
              onSelect={() => setField('intent', 'refresh')}
              onHover={(h) => setHovered(h ? 'refresh' : '')}
              title="Refresh my brand"
              description="I have a website. I want it to look better, feel more modern, and stay on-brand."
              icon={
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 16a12 12 0 0 1 21.17-7.75" />
                  <path d="M28 16a12 12 0 0 1-21.17 7.75" />
                  <polyline points="25 4 25 9 20 9" />
                  <polyline points="7 28 7 23 12 23" />
                </svg>
              }
            />
            <IntentCard
              selected={intent === 'new'}
              hovering={hovered === 'new'}
              onSelect={() => setField('intent', 'new')}
              onHover={(h) => setHovered(h ? 'new' : '')}
              title="Build something new"
              description="I&rsquo;m starting fresh or going in a completely different direction. Let me pick from what inspires me."
              icon={
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="24" height="24" rx="4" />
                  <line x1="16" y1="10" x2="16" y2="22" />
                  <line x1="10" y1="16" x2="22" y2="16" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: 'var(--space-8)',
      }}>
        <button
          onClick={handleNext}
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: '10rem',
            justifyContent: 'center',
          }}
        >
          {intent === 'refresh' ? (
            <>Next: Enter your site &rarr;</>
          ) : intent === 'new' ? (
            <>Next: Gather inspiration &rarr;</>
          ) : (
            <>Choose a path to continue</>
          )}
        </button>
      </div>
    </div>
  );
}

function IntentCard({ selected, hovering, onSelect, onHover, title, description, icon }: {
  selected: boolean;
  hovering: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        textAlign: 'left',
        background: selected ? 'var(--color-green-muted)' : 'var(--color-white)',
        border: selected
          ? '2px solid var(--color-green-deep)'
          : hovering
            ? '1.5px solid var(--color-green-deep)'
            : '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        cursor: 'pointer',
        transition: 'all var(--duration-fast) var(--ease-out)',
        boxShadow: selected ? 'var(--shadow-md)' : hovering ? 'var(--shadow-sm)' : 'none',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <div style={{
        color: selected ? 'var(--color-green-deep)' : 'var(--color-text-muted)',
        transition: 'color var(--duration-fast) var(--ease-out)',
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontSize: 'var(--text-base)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: '0.25rem',
        }}>
          {title}
        </p>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-body)',
            lineHeight: 'var(--leading-normal)',
          }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
      {selected && (
        <div style={{
          alignSelf: 'flex-end',
          width: '1.25rem',
          height: '1.25rem',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-green-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      )}
    </button>
  );
}

function InputField({ label, placeholder, value, onChange, required }: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
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
    </div>
  );
}
