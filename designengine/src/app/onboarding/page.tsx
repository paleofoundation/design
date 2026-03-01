'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore, type UserIntent } from './store';
import { StepIndicator } from './components';
import { track } from '@/lib/posthog';

const INDUSTRIES = [
  'SaaS / Tech', 'E-commerce / Retail', 'Agency / Studio', 'Finance / Fintech',
  'Healthcare / Wellness', 'Education', 'Food & Beverage', 'Real Estate',
  'Media / Publishing', 'Non-profit', 'Legal / Professional Services',
  'Fashion / Beauty', 'Travel / Hospitality', 'Other',
];

const AUDIENCES = [
  'Developers / Technical', 'Designers / Creatives', 'Business executives',
  'General consumers', 'Young adults (18-30)', 'Parents / Families',
  'Enterprise / B2B buyers', 'Students / Educators', 'Other',
];

const CONTENT_TYPES = [
  'Marketing / Landing pages', 'Blog / Editorial', 'E-commerce / Product pages',
  'SaaS Dashboard / App', 'Portfolio / Showcase', 'Documentation / Knowledge base',
  'Community / Social', 'Multi-purpose (several of these)',
];

const EMOTIONAL_OPTIONS = [
  'Trustworthy', 'Innovative', 'Warm', 'Sophisticated', 'Energetic',
  'Calm', 'Playful', 'Authoritative', 'Approachable', 'Premium',
  'Bold', 'Minimal', 'Human', 'Technical', 'Whimsical',
];

export default function OnboardingStep1() {
  const router = useRouter();
  const store = useOnboardingStore();
  const {
    projectName, brandDescription, intent, industry, audience,
    contentType, emotionalKeywords, setField,
  } = store;
  const [hovered, setHovered] = useState<UserIntent | ''>('');

  const canProceed = projectName.trim().length > 0 && intent !== '';

  useEffect(() => {
    track('onboarding_started', { step: 1 });
  }, []);

  function toggleKeyword(kw: string) {
    const current = emotionalKeywords;
    if (current.includes(kw)) {
      setField('emotionalKeywords', current.filter((k) => k !== kw));
    } else if (current.length < 5) {
      setField('emotionalKeywords', [...current, kw]);
    }
  }

  function handleNext() {
    if (!canProceed) return;
    track('onboarding_step_complete', {
      step: 1,
      intent,
      industry,
      audience,
      emotionalKeywords,
    });
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
        A great designer starts by listening. Tell us about your project so every decision downstream &mdash; colors, type, spacing &mdash; is grounded in who you are and who you&rsquo;re building for.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Project name */}
        <InputField
          label="Project name"
          placeholder="e.g. My SaaS, Acme Corp, Portfolio"
          value={projectName}
          onChange={(v) => setField('projectName', v)}
          required
        />

        {/* Industry */}
        <SelectField
          label="Industry"
          placeholder="Select your industry"
          options={INDUSTRIES}
          value={industry}
          onChange={(v) => setField('industry', v)}
        />

        {/* Audience */}
        <SelectField
          label="Who is this for?"
          placeholder="Select your primary audience"
          options={AUDIENCES}
          value={audience}
          onChange={(v) => setField('audience', v)}
        />

        {/* Content type */}
        <SelectField
          label="What kind of pages will you build?"
          placeholder="Select content type"
          options={CONTENT_TYPES}
          value={contentType}
          onChange={(v) => setField('contentType', v)}
        />

        {/* Emotional keywords */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-1)',
          }}>
            Pick up to 5 words your brand should evoke
          </label>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            {EMOTIONAL_OPTIONS.map((kw) => {
              const active = emotionalKeywords.includes(kw);
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => toggleKeyword(kw)}
                  style={{
                    background: active ? 'var(--color-green-deep)' : 'var(--color-white)',
                    color: active ? '#fff' : 'var(--color-text-body)',
                    border: active ? '1.5px solid var(--color-green-deep)' : '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.375rem 0.875rem',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all var(--duration-fast) var(--ease-out)',
                  }}
                >
                  {kw}
                </button>
              );
            })}
          </div>
          {emotionalKeywords.length > 0 && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
              {emotionalKeywords.length}/5 selected
            </p>
          )}
        </div>

        {/* Brand description (now supplemental, not primary) */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-0-5)',
          }}>
            Anything else about your brand? <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={brandDescription}
            onChange={(e) => setField('brandDescription', e.target.value)}
            placeholder="e.g. We're a small olive oil company that values tradition but wants a modern web presence..."
            rows={2}
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

        {/* Competitors (optional) */}
        <InputField
          label="Any competitors or sites you want to stand apart from?"
          placeholder="e.g. competitor.com, bigbrand.io"
          value={store.competitors}
          onChange={(v) => setField('competitors', v)}
          sublabel="(optional)"
        />

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

function InputField({ label, placeholder, value, onChange, required, sublabel }: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  sublabel?: string;
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
        {label}
        {required && <span style={{ color: 'var(--color-orange)' }}> *</span>}
        {sublabel && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '0.375rem' }}>{sublabel}</span>}
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

function SelectField({ label, placeholder, options, value, onChange }: {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
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
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          background: 'var(--color-white)',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.625rem var(--space-2)',
          fontSize: 'var(--text-base)',
          color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          outline: 'none',
          transition: 'border-color var(--duration-fast) var(--ease-out)',
          fontFamily: 'inherit',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          paddingRight: '2.5rem',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-green-deep)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
