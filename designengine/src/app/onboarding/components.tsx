'use client';

import { useOnboardingStore } from './store';

const STEP_LABELS_REFRESH = ['Intent', 'Your Site', 'Design Language', 'Colors', 'Typography', 'Style', 'Preview'];
const STEP_LABELS_NEW = ['Intent', 'Inspiration', 'Design Language', 'Colors', 'Typography', 'Style', 'Preview'];
const STEP_LABELS_DEFAULT = ['Intent', 'Design Language', 'Colors', 'Typography', 'Style', 'Preview'];

export function StepIndicator({ current }: { current: number }) {
  const intent = useOnboardingStore((s) => s.intent);

  const labels = intent === 'refresh'
    ? STEP_LABELS_REFRESH
    : intent === 'new'
      ? STEP_LABELS_NEW
      : STEP_LABELS_DEFAULT;

  const total = labels.length;

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {labels.map((label, i) => (
          <span
            key={label}
            style={{
              fontSize: '0.6rem',
              color: i < current ? 'var(--color-green-deep)' : 'var(--color-text-muted)',
              fontWeight: i + 1 === current ? 600 : 400,
              letterSpacing: '0.02em',
              opacity: i < current ? 1 : 0.6,
              minWidth: 0,
              textAlign: i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center',
              flex: 1,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ToggleCard({
  active,
  onToggle,
  label,
  badge,
  children,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        textAlign: 'left',
        width: '100%',
        background: 'var(--color-white)',
        border: active
          ? '2px solid var(--color-green-deep)'
          : '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: active ? 'var(--shadow-md)' : 'none',
        transition:
          'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {label}
          </span>
          {badge && (
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 600,
                color: 'var(--color-green-deep)',
                background: 'var(--color-green-muted)',
                padding: '0.1rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <div
          style={{
            width: '2.5rem',
            height: '1.375rem',
            borderRadius: 'var(--radius-full)',
            background: active ? 'var(--color-green-deep)' : 'var(--color-border)',
            transition: 'background var(--duration-fast) var(--ease-out)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '1.125rem',
              height: '1.125rem',
              borderRadius: 'var(--radius-full)',
              background: 'white',
              position: 'absolute',
              top: '0.125rem',
              left: active ? '1.25rem' : '0.125rem',
              transition: 'left var(--duration-fast) var(--ease-out)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}
          />
        </div>
      </div>
      {children}
    </button>
  );
}

export function ProvenanceBadge({ source }: { source: 'extracted' | 'manual' }) {
  const isExtracted = source === 'extracted';
  return (
    <span
      style={{
        fontSize: '0.625rem',
        fontWeight: 600,
        color: isExtracted ? 'var(--color-green-deep)' : 'var(--color-orange)',
        background: isExtracted ? 'var(--color-green-muted)' : 'var(--color-orange-muted)',
        padding: '0.15rem 0.5rem',
        borderRadius: 'var(--radius-full)',
        letterSpacing: 'var(--tracking-wider)',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {isExtracted ? 'From site' : 'Your choice'}
    </span>
  );
}

export function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: '0.2rem', alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: '0.35rem',
            height: '0.35rem',
            borderRadius: '50%',
            background: 'currentColor',
            animation: `dzyn-dot-pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes dzyn-dot-pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  );
}
