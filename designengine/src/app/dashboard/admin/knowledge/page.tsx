'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { PALETTE, DASH, FONT, RADIUS, TEXT_SIZE } from '@/lib/design-tokens';
import { createClient } from '@/lib/supabase/client';

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

export default function AdminKnowledgePage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    try {
      const res = await fetch('/api/admin/knowledge/sources');
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      const data = await res.json();
      if (data.sources) setSources(data.sources);
    } catch {
      /* ignore */
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadStatus(null);
    setUploadError(null);

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 50) {
      setUploadError(`File is ${sizeMB.toFixed(1)}MB. Maximum is 50MB.`);
      setUploading(false);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
    const storagePath = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    try {
      setUploadStatus('Uploading file to storage...');

      const supabase = createClient();
      const { error: storageError } = await supabase.storage
        .from('knowledge-uploads')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError) {
        setUploadError(`Storage upload failed: ${storageError.message}`);
        setUploadStatus(null);
        return;
      }

      setUploadStatus('Processing and embedding — this may take a minute for large files...');

      const res = await fetch('/api/admin/knowledge/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storagePath,
          sourceName: file.name,
          fileExtension: ext,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let errorMsg: string;
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || `Server error (${res.status})`;
        } catch {
          errorMsg = `Server error (${res.status}): ${text.substring(0, 120)}`;
        }
        setUploadError(errorMsg);
        setUploadStatus(null);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setUploadStatus(
          `Uploaded "${data.sourceName}" — ${data.insertedChunks} chunks created (global)`
        );
        loadSources();
      } else {
        setUploadError(data.error || 'Upload failed');
        setUploadStatus(null);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setUploadStatus(null);
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
      await fetch('/api/admin/knowledge/sources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceName }),
      });
      loadSources();
    } catch {
      /* ignore */
    }
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
    } catch {
      /* ignore */
    }
    setSearching(false);
  }

  if (forbidden) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: FONT.heading,
            fontSize: TEXT_SIZE['2xl'],
            fontWeight: 400,
            color: DASH.heading,
            marginBottom: '1rem',
          }}
        >
          Access Denied
        </h1>
        <p style={{ fontSize: TEXT_SIZE.base, color: DASH.muted, maxWidth: '24rem' }}>
          This area is restricted to dzyne administrators. If you believe this is
          an error, contact the team.
        </p>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: DASH.card,
    border: `1px solid ${DASH.cardBorder}`,
    borderRadius: RADIUS.lg,
    padding: '1.5rem',
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '0.125rem 0.5rem',
            background: PALETTE.orange.muted,
            color: PALETTE.orange.base,
            fontSize: TEXT_SIZE.xs,
            fontWeight: 600,
            borderRadius: RADIUS.full,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          Admin
        </div>
        <h1
          style={{
            fontFamily: FONT.heading,
            fontSize: TEXT_SIZE['2xl'],
            fontWeight: 400,
            color: DASH.heading,
            marginBottom: '0.5rem',
          }}
        >
          Global Knowledge Library
        </h1>
        <p style={{ fontSize: TEXT_SIZE.sm, color: DASH.muted, maxWidth: '40rem' }}>
          Upload design textbooks, style guides, and reference materials here.
          Everything uploaded becomes part of dzyne&apos;s global knowledge —
          every user&apos;s MCP tool calls will draw from this library
          automatically.
        </p>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}
      >
        {/* Upload */}
        <div style={cardStyle}>
          <h2
            style={{
              fontFamily: FONT.heading,
              fontSize: TEXT_SIZE.lg,
              fontWeight: 400,
              color: DASH.heading,
              marginBottom: '1.5rem',
            }}
          >
            Upload to Global Library
          </h2>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? PALETTE.orange.base : DASH.inputBorder}`,
              borderRadius: RADIUS.md,
              padding: '3rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? PALETTE.orange.muted : 'transparent',
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
              <div style={{ color: PALETTE.amber.base }}>
                <Spinner /> Processing and embedding...
              </div>
            ) : (
              <>
                <p
                  style={{
                    fontSize: TEXT_SIZE.base,
                    color: DASH.muted,
                    marginBottom: '0.5rem',
                  }}
                >
                  Drop a textbook or style guide here
                </p>
                <p style={{ fontSize: TEXT_SIZE.xs, color: DASH.faint }}>
                  Accepts .pdf, .txt, .md up to 50MB — content feeds ALL user tool calls
                </p>
              </>
            )}
          </div>
          {uploadStatus && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: PALETTE.semantic.successMuted,
                border: `1px solid rgba(40,167,69,0.15)`,
                borderRadius: RADIUS.md,
                fontSize: TEXT_SIZE.sm,
                color: PALETTE.semantic.success,
              }}
            >
              {uploadStatus}
            </div>
          )}
          {uploadError && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: PALETTE.semantic.errorMuted,
                border: `1px solid rgba(220,53,69,0.15)`,
                borderRadius: RADIUS.md,
                fontSize: TEXT_SIZE.sm,
                color: PALETTE.semantic.error,
              }}
            >
              {uploadError}
            </div>
          )}
        </div>

        {/* Search Preview */}
        <div style={cardStyle}>
          <h2
            style={{
              fontFamily: FONT.heading,
              fontSize: TEXT_SIZE.lg,
              fontWeight: 400,
              color: DASH.heading,
              marginBottom: '1.5rem',
            }}
          >
            Test Retrieval
          </h2>
          <form
            onSubmit={handleSearch}
            style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}
          >
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. color contrast for accessibility"
              style={{
                flex: 1,
                background: DASH.inputBg,
                border: `1px solid ${DASH.inputBorder}`,
                borderRadius: RADIUS.md,
                padding: '0.5rem 0.75rem',
                fontSize: TEXT_SIZE.sm,
                color: DASH.heading,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              disabled={searching}
              style={{
                background: PALETTE.orange.base,
                color: PALETTE.text.onDark,
                borderRadius: RADIUS.md,
                padding: '0.5rem 1rem',
                fontSize: TEXT_SIZE.sm,
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
                <div
                  key={r.id}
                  style={{
                    padding: '1rem',
                    borderBottom: `1px solid ${DASH.divider}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: TEXT_SIZE.xs,
                        color: PALETTE.lavender.base,
                        fontWeight: 500,
                      }}
                    >
                      {r.sourceName}
                      {r.sectionTitle ? ` — ${r.sectionTitle}` : ''}
                    </span>
                    <span
                      style={{ fontSize: TEXT_SIZE.xs, color: PALETTE.amber.base }}
                    >
                      {(r.similarity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: TEXT_SIZE.xs,
                      color: DASH.muted,
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {r.chunkText.substring(0, 250)}
                    {r.chunkText.length > 250 ? '...' : ''}
                  </p>
                </div>
              ))
            ) : (
              <p
                style={{
                  fontSize: TEXT_SIZE.sm,
                  color: DASH.faint,
                  padding: '2rem 0',
                  textAlign: 'center',
                }}
              >
                {sources.length === 0
                  ? 'Upload a document first, then search.'
                  : 'Enter a query to test retrieval.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Global Sources Table */}
      <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
        <h2
          style={{
            fontFamily: FONT.heading,
            fontSize: TEXT_SIZE.lg,
            fontWeight: 400,
            color: DASH.heading,
            marginBottom: '1.5rem',
          }}
        >
          Global Sources
        </h2>
        {sources.length === 0 ? (
          <p
            style={{
              fontSize: TEXT_SIZE.sm,
              color: DASH.faint,
              textAlign: 'center',
              padding: '2rem 0',
            }}
          >
            No global documents uploaded yet. Upload a textbook to get started.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  borderBottom: `1px solid ${DASH.dividerStrong}`,
                  background: DASH.tableHeaderBg,
                }}
              >
                {['Source', 'Type', 'Chunks', 'Uploaded', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: TEXT_SIZE.xs,
                      fontWeight: 500,
                      color: DASH.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr
                  key={s.sourceName}
                  style={{ borderBottom: `1px solid ${DASH.divider}` }}
                >
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: TEXT_SIZE.sm,
                      color: DASH.heading,
                    }}
                  >
                    {s.sourceName}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        fontSize: TEXT_SIZE.xs,
                        fontWeight: 500,
                        padding: '0.125rem 0.5rem',
                        borderRadius: RADIUS.full,
                        background: PALETTE.green.muted,
                        color: PALETTE.green.deep,
                        textTransform: 'uppercase',
                      }}
                    >
                      {s.sourceType}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: TEXT_SIZE.sm,
                      fontVariantNumeric: 'tabular-nums',
                      color: DASH.muted,
                    }}
                  >
                    {s.chunkCount}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: TEXT_SIZE.sm,
                      color: DASH.faint,
                    }}
                  >
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(s.sourceName)}
                      disabled={deleting === s.sourceName}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: PALETTE.semantic.error,
                        fontSize: TEXT_SIZE.xs,
                        fontWeight: 500,
                        cursor:
                          deleting === s.sourceName
                            ? 'not-allowed'
                            : 'pointer',
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
    <svg
      style={{
        animation: 'spin 1s linear infinite',
        height: '1rem',
        width: '1rem',
        display: 'inline',
        marginRight: '0.5rem',
        verticalAlign: 'middle',
      }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        style={{ opacity: 0.25 }}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        style={{ opacity: 0.75 }}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
