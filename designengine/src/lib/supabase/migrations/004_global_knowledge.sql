-- =============================================
-- MIGRATION 004: Global Knowledge Layer
-- Adds is_global flag to knowledge_chunks so
-- admin-curated textbooks feed into ALL users'
-- MCP tool calls automatically.
-- =============================================

-- 1. Add the column
ALTER TABLE knowledge_chunks
  ADD COLUMN is_global BOOLEAN DEFAULT FALSE;

-- 2. Index for fast global-chunk lookups
CREATE INDEX idx_knowledge_chunks_global
  ON knowledge_chunks(is_global) WHERE is_global = TRUE;

-- 3. Replace the search function to include global chunks
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
    (kc.is_global = TRUE OR kc.user_id = p_user_id)
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Allow all authenticated users to READ global chunks
CREATE POLICY "Authenticated users can read global knowledge"
  ON knowledge_chunks FOR SELECT
  USING (is_global = TRUE AND auth.role() = 'authenticated');
