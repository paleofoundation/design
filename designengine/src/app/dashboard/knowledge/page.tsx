'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { PALETTE, DASH, FONT, RADIUS, TEXT_SIZE } from '@/lib/design-tokens';

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

export default function KnowledgeLibraryPage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    try {
      const res = await fetch('/api/knowledge/sources');
      const data = await res.json();
      if (data.sources) {
        setSources(data.sources);
        setTotalChunks(
          data.sources.reduce(
            (sum: number, s: KnowledgeSource) => sum + s.chunkCount,
            0
          )
        );
      }
    } catch {
      /* ignore */
    }
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

  const cardStyle: React.CSSProperties = {
    background: DASH.card,
    border: `1px solid ${DASH.cardBorder}`,
    borderRadius: RADIUS.lg,
    padding: '1.5rem',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1
          style={{
            fontFamily: FONT.heading,
            fontSize: TEXT_SIZE['2xl'],
            fontWeight: 400,
            color: DASH.heading,
            marginBottom: '0.5rem',
          }}
        >
          dzyne Knowledge Library
        </h1>
        <p
          style={{
            fontSize: TEXT_SIZE.sm,
            color: DASH.muted,
            maxWidth: '40rem',
            lineHeight: 1.6,
          }}
        >
          These design resources power every dzyne tool. The dzyne team curates
          this library to ensure best-in-class design output across typography,
          color theory, spacing, and layout.
        </p>
      </div>

      {/* Stats strip */}
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          marginBottom: '1.5rem',
          padding: '1rem 1.5rem',
          background: PALETTE.green.muted,
          borderRadius: RADIUS.lg,
          alignItems: 'center',
        }}
      >
        <Stat label="Sources" value={String(sources.length)} />
        <div
          style={{ width: 1, height: '2rem', background: DASH.dividerStrong }}
        />
        <Stat label="Knowledge Chunks" value={totalChunks.toLocaleString()} />
        <div
          style={{ width: 1, height: '2rem', background: DASH.dividerStrong }}
        />
        <Stat
          label="Coverage"
          value={
            sources.length > 0
              ? `${sources.map((s) => s.sourceType.toUpperCase()).filter((v, i, a) => a.indexOf(v) === i).join(', ')}`
              : '—'
          }
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}
      >
        {/* Sources */}
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
            Reference Materials
          </h2>
          {sources.length === 0 ? (
            <p
              style={{
                fontSize: TEXT_SIZE.sm,
                color: DASH.faint,
                textAlign: 'center',
                padding: '3rem 0',
              }}
            >
              The dzyne team has not yet published knowledge sources. Check back
              soon.
            </p>
          ) : (
            <div>
              {sources.map((s) => (
                <div
                  key={s.sourceName}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: `1px solid ${DASH.divider}`,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: TEXT_SIZE.sm,
                        color: DASH.heading,
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      {s.sourceName}
                    </p>
                    <p
                      style={{
                        fontSize: TEXT_SIZE.xs,
                        color: DASH.faint,
                        margin: '0.125rem 0 0',
                      }}
                    >
                      {s.chunkCount} chunks &middot;{' '}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
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
                </div>
              ))}
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
            Explore What dzyne Knows
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
          <div style={{ maxHeight: '360px', overflow: 'auto' }}>
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
                      style={{
                        fontSize: TEXT_SIZE.xs,
                        color: PALETTE.amber.base,
                      }}
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
                  padding: '3rem 0',
                  textAlign: 'center',
                }}
              >
                {sources.length === 0
                  ? 'No knowledge sources available yet.'
                  : 'Ask dzyne a question to see what it knows.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: TEXT_SIZE['xl'],
          fontWeight: 600,
          color: PALETTE.green.deep,
          margin: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: TEXT_SIZE.xs,
          color: DASH.muted,
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </p>
    </div>
  );
}
