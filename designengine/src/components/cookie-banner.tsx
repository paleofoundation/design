'use client';

import { useState, useEffect } from 'react';

const INDIGO = '#4338ca';
const INDIGO_HOVER = '#3730a3';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('dzyne-cookies-ok');
    if (!dismissed) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem('dzyne-cookies-ok', '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: INDIGO,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '0.75rem 1.5rem',
        fontFamily: 'var(--font-source-sans, system-ui, sans-serif)',
        fontSize: '0.875rem',
        color: '#FFFFFF',
        letterSpacing: '0.01em',
      }}
    >
      <span>
        We are using cookies on all our websites including this one because
        without cookies the entire Internet would go to shit.
      </span>
      <button
        onClick={dismiss}
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: '#FFFFFF',
          borderRadius: '6px',
          padding: '0.375rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = INDIGO_HOVER)}
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')
        }
      >
        Fine
      </button>
    </div>
  );
}
