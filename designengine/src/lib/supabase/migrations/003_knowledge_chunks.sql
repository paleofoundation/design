-- =============================================
-- MIGRATION 003: Knowledge Base Chunks
-- Stores chunked text from design textbooks,
-- docs, and reference materials with embeddings
-- for RAG retrieval across all MCP tools.
-- =============================================

CREATE TABLE knowledge_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'txt', 'md', 'epub')),
  section_title TEXT,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  token_count INTEGER,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_knowledge_chunks_user
  ON knowledge_chunks(user_id);

CREATE INDEX idx_knowledge_chunks_source
  ON knowledge_chunks(user_id, source_name);

CREATE INDEX idx_knowledge_chunks_embedding
  ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  p_user_id UUID,
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 8
)
RETURNS TABLE (
  id UUID,
  source_name TEXT,
  section_title TEXT,
  chunk_text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.source_name,
    kc.section_title,
    kc.chunk_text,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks kc
  WHERE
    kc.user_id = p_user_id
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- RLS
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own knowledge chunks"
  ON knowledge_chunks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access knowledge_chunks"
  ON knowledge_chunks FOR ALL
  USING (auth.role() = 'service_role');
