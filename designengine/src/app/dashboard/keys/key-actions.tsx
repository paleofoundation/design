'use client';

import { useState } from 'react';

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
          background: 'var(--color-orange)',
          color: 'var(--color-text-on-dark)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 1rem',
          fontSize: 'var(--text-sm)',
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
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'var(--color-green-dark)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '28rem',
            boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
          }}>
            {!newKey ? (
              <>
                <h3 style={{
                  fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 500,
                  color: 'var(--color-text-on-green)',
                  marginBottom: '1rem',
                }}>
                  Create API Key
                </h3>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.25rem' }}>
                  Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Production, Development"
                  style={{
                    width: '100%',
                    background: 'var(--color-green-darker)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 0.75rem',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-on-green)',
                    outline: 'none',
                    marginBottom: '1rem',
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setShowModal(false); setKeyName(''); }}
                    style={{ padding: '0.5rem 1rem', fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.6)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    style={{
                      background: 'var(--color-orange)',
                      color: 'var(--color-text-on-dark)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.5rem 1rem',
                      fontSize: 'var(--text-sm)',
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
                  fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 500,
                  color: 'var(--color-text-on-green)',
                  marginBottom: '0.5rem',
                }}>
                  API Key Created
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--color-green-darker)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                }}>
                  <code style={{
                    flex: 1,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-success)',
                    fontFamily: 'var(--font-jetbrains, JetBrains Mono, monospace)',
                    wordBreak: 'break-all',
                    userSelect: 'all',
                  }}>
                    {newKey}
                  </code>
                  <button
                    onClick={handleCopy}
                    style={{
                      flexShrink: 0,
                      background: 'var(--color-green-dark)',
                      color: 'var(--color-text-on-green)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.25rem 0.75rem',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-amber)', marginBottom: '1rem' }}>
                  Save this key now — it will not be shown again.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleClose}
                    style={{
                      background: 'var(--color-orange)',
                      color: 'var(--color-text-on-dark)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.5rem 1rem',
                      fontSize: 'var(--text-sm)',
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
