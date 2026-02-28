'use client';

import { useState } from 'react';
import { PALETTE, DASH, FONT, RADIUS, TEXT_SIZE } from '@/lib/design-tokens';

export function KeyActions({ userId }: { userId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: keyName || 'Default' }),
      });
      const data = await res.json();
      if (data.key) setNewKey(data.key);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleClose() {
    setShowModal(false);
    setNewKey(null);
    setKeyName('');
    setCopied(false);
    window.location.reload();
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          background: PALETTE.orange.base,
          color: PALETTE.text.onDark,
          borderRadius: RADIUS.md,
          padding: '0.5rem 1.25rem',
          fontSize: TEXT_SIZE.sm,
          fontWeight: 500,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Create New Key
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: DASH.card,
            border: `1px solid ${DASH.cardBorder}`,
            borderRadius: RADIUS.xl,
            padding: '2rem',
            width: '100%',
            maxWidth: '28rem',
            boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
          }}>
            {!newKey ? (
              <>
                <h3 style={{
                  fontFamily: FONT.heading,
                  fontSize: TEXT_SIZE.lg,
                  fontWeight: 500,
                  color: DASH.heading,
                  marginBottom: '1rem',
                }}>
                  Create API Key
                </h3>
                <label style={{ display: 'block', fontSize: TEXT_SIZE.sm, color: DASH.muted, marginBottom: '0.25rem' }}>
                  Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Production, Development"
                  style={{
                    width: '100%',
                    background: DASH.inputBg,
                    border: `1px solid ${DASH.inputBorder}`,
                    borderRadius: RADIUS.md,
                    padding: '0.5rem 0.75rem',
                    fontSize: TEXT_SIZE.sm,
                    color: DASH.heading,
                    outline: 'none',
                    marginBottom: '1.25rem',
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setShowModal(false); setKeyName(''); }}
                    style={{ padding: '0.5rem 1rem', fontSize: TEXT_SIZE.sm, color: DASH.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    style={{
                      background: PALETTE.orange.base,
                      color: PALETTE.text.onDark,
                      borderRadius: RADIUS.md,
                      padding: '0.5rem 1.25rem',
                      fontSize: TEXT_SIZE.sm,
                      fontWeight: 500,
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    {loading ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{
                  fontFamily: FONT.heading,
                  fontSize: TEXT_SIZE.lg,
                  fontWeight: 500,
                  color: DASH.heading,
                  marginBottom: '0.5rem',
                }}>
                  API Key Created
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: DASH.codeBg,
                  border: `1px solid ${DASH.cardBorder}`,
                  borderRadius: RADIUS.md,
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                }}>
                  <code style={{
                    flex: 1,
                    fontSize: TEXT_SIZE.sm,
                    color: PALETTE.green.deep,
                    fontFamily: FONT.mono,
                    wordBreak: 'break-all',
                    userSelect: 'all',
                  }}>
                    {newKey}
                  </code>
                  <button
                    onClick={handleCopy}
                    style={{
                      flexShrink: 0,
                      background: PALETTE.green.muted,
                      color: PALETTE.green.deep,
                      borderRadius: RADIUS.sm,
                      padding: '0.25rem 0.75rem',
                      fontSize: TEXT_SIZE.xs,
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: TEXT_SIZE.sm, color: PALETTE.amber.base, marginBottom: '1rem' }}>
                  Save this key now — it will not be shown again.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleClose}
                    style={{
                      background: PALETTE.orange.base,
                      color: PALETTE.text.onDark,
                      borderRadius: RADIUS.md,
                      padding: '0.5rem 1.25rem',
                      fontSize: TEXT_SIZE.sm,
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
