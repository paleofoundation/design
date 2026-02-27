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
        body: JSON.stringify({
          userId,
          name: keyName || 'Default',
        }),
      });
      const data = await res.json();
      if (data.key) {
        setNewKey(data.key);
      }
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
        className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-4 py-2 text-sm font-medium transition"
      >
        Create New Key
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            {!newKey ? (
              <>
                <h3 className="text-lg font-semibold mb-4">Create API Key</h3>
                <label className="block text-sm text-gray-400 mb-1">Key Name</label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Production, Development"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 mb-4"
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setKeyName('');
                    }}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg px-4 py-2 text-sm font-medium transition"
                  >
                    {loading ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">API Key Created</h3>
                <div className="flex items-center gap-2 bg-gray-950 border border-gray-700 rounded-lg p-3 mb-3">
                  <code className="flex-1 text-sm text-emerald-400 font-mono break-all select-all">
                    {newKey}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 bg-gray-800 hover:bg-gray-700 rounded px-3 py-1 text-xs font-medium transition"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-amber-400 mb-4">
                  Save this key now — it will not be shown again.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={handleClose}
                    className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-4 py-2 text-sm font-medium transition"
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
