'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';

interface KnowledgeSource {
  sourceName: string;
  sourceType: string;
  chunkCount: number;
  createdAt: string;
}

interface SearchResult {
  id: string;
  sourceName: string;
  sectionTitle: string | null;
  chunkText: string;
  similarity: number;
}

export default function KnowledgePage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    try {
      const res = await fetch('/api/knowledge/sources');
      const data = await res.json();
      if (data.sources) setSources(data.sources);
    } catch { /* ignore */ }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadStatus(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sourceName', file.name);

    try {
      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setUploadStatus(`Uploaded "${data.sourceName}" — ${data.insertedChunks} chunks created`);
        loadSources();
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  async function handleDelete(sourceName: string) {
    setDeleting(sourceName);
    try {
      await fetch('/api/knowledge/sources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceName }),
      });
      loadSources();
    } catch { /* ignore */ }
    setDeleting(null);
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);

    try {
      const res = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 6 }),
      });
      const data = await res.json();
      if (data.results) setSearchResults(data.results);
    } catch { /* ignore */ }
    setSearching(false);
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-green-dark)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 400,
          color: 'var(--color-text-on-green)',
          marginBottom: 'var(--space-1)',
        }}>
          Knowledge Base
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.5)' }}>
          Upload design textbooks, style guides, and reference docs. Their principles will be applied by every MCP tool.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        {/* Upload Section */}
        <div style={cardStyle}>
          <h2 style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'var(--text-lg)',
            fontWeight: 400,
            color: 'var(--color-text-on-green)',
            marginBottom: 'var(--space-3)',
          }}>
            Upload
          </h2>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--color-orange)' : 'rgba(255, 255, 255, 0.12)'}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-6) var(--space-4)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color var(--duration-fast) var(--ease-out)',
              background: dragOver ? 'rgba(255, 103, 25, 0.04)' : 'transparent',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {uploading ? (
              <div style={{ color: 'var(--color-amber)' }}>
                <Spinner /> Processing and embedding...
              </div>
            ) : (
              <>
                <p style={{ fontSize: 'var(--text-base)', color: 'rgba(255, 255, 255, 0.6)', marginBottom: 'var(--space-1)' }}>
                  Drop a file here or click to browse
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255, 255, 255, 0.35)' }}>
                  Accepts .pdf, .txt, .md
                </p>
              </>
            )}
          </div>

          {uploadStatus && (
            <div style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-2)',
              background: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-success) 15%, transparent)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-success)',
            }}>
              {uploadStatus}
            </div>
          )}

          {uploadError && (
            <div style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-2)',
              background: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-error) 15%, transparent)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-error)',
            }}>
              {uploadError}
            </div>
          )}
        </div>

        {/* Search Preview */}
        <div style={cardStyle}>
          <h2 style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontSize: 'var(--text-lg)',
            fontWeight: 400,
            color: 'var(--color-text-on-green)',
            marginBottom: 'var(--space-3)',
          }}>
            Test Retrieval
          </h2>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. color contrast for accessibility"
              style={{
                flex: 1,
                background: 'var(--color-green-darker)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.75rem',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-on-green)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              disabled={searching}
              style={{
                background: 'var(--color-orange)',
                color: 'var(--color-text-on-dark)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1rem',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                border: 'none',
                cursor: searching ? 'not-allowed' : 'pointer',
                opacity: searching ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          <div style={{ maxHeight: '320px', overflow: 'auto' }}>
            {searchResults.length > 0 ? (
              searchResults.map((r) => (
                <div key={r.id} style={{
                  padding: 'var(--space-2)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-lavender)', fontWeight: 500 }}>
                      {r.sourceName}{r.sectionTitle ? ` — ${r.sectionTitle}` : ''}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-amber)' }}>
                      {(r.similarity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5, margin: 0 }}>
                    {r.chunkText.substring(0, 250)}{r.chunkText.length > 250 ? '...' : ''}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.25)', padding: 'var(--space-4) 0', textAlign: 'center' }}>
                {sources.length === 0 ? 'Upload a document first, then search.' : 'Enter a query to test retrieval.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div style={{ ...cardStyle, marginTop: 'var(--space-4)' }}>
        <h2 style={{
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontSize: 'var(--text-lg)',
          fontWeight: 400,
          color: 'var(--color-text-on-green)',
          marginBottom: 'var(--space-3)',
        }}>
          Uploaded Sources
        </h2>

        {sources.length === 0 ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.35)', textAlign: 'center', padding: 'var(--space-4) 0' }}>
            No documents uploaded yet. Upload design textbooks, style guides, or reference docs above.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {['Source', 'Type', 'Chunks', 'Uploaded', ''].map((h) => (
                  <th key={h} style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.sourceName} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-on-green)' }}>
                    {s.sourceName}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 500,
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textTransform: 'uppercase',
                    }}>
                      {s.sourceType}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: 'var(--text-sm)', fontVariantNumeric: 'tabular-nums', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {s.chunkCount}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: 'var(--text-sm)', color: 'rgba(255, 255, 255, 0.4)' }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(s.sourceName)}
                      disabled={deleting === s.sourceName}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-error)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 500,
                        cursor: deleting === s.sourceName ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                        opacity: deleting === s.sourceName ? 0.5 : 1,
                      }}
                    >
                      {deleting === s.sourceName ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg style={{ animation: 'spin 1s linear infinite', height: '1rem', width: '1rem', display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none">
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
