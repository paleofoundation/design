-- =============================================
-- DESIGNENGINE: FULL DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- =============================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- TABLE: design_patterns (knowledge base)
-- =============================================
CREATE TABLE design_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'landing-page', 'dashboard', 'e-commerce',
    'portfolio', 'blog', 'saas', 'marketing',
    'mobile-app', 'documentation', 'social-media',
    'news', 'corporate'
  )),
  tags TEXT[] DEFAULT '{}',
  source_url TEXT NOT NULL,
  tokens JSONB NOT NULL,
  screenshot_url TEXT,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: api_keys (authentication)
-- =============================================
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  permissions TEXT[] DEFAULT ARRAY['read', 'write'],
  rate_limit INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: usage_logs (billing + analytics)
-- =============================================
CREATE TABLE usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id)
    ON DELETE SET NULL,
  tool_name TEXT NOT NULL CHECK (tool_name IN (
    'ingest_design',
    'search_design_patterns',
    'generate_font',
    'pair_typography',
    'convert_design_to_code'
  )),
  input_params JSONB,
  response_size INTEGER,
  latency_ms INTEGER,
  status TEXT NOT NULL CHECK (
    status IN ('success', 'error', 'rate_limited')
  ),
  error_message TEXT,
  stripe_usage_record_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- HNSW index for fast vector similarity search
CREATE INDEX idx_design_patterns_embedding
  ON design_patterns
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_design_patterns_category
  ON design_patterns(category);

CREATE INDEX idx_design_patterns_tags
  ON design_patterns USING GIN(tags);

CREATE INDEX idx_api_keys_hash
  ON api_keys(key_hash);

CREATE INDEX idx_api_keys_user
  ON api_keys(user_id);

CREATE INDEX idx_usage_logs_api_key
  ON usage_logs(api_key_id);

CREATE INDEX idx_usage_logs_created
  ON usage_logs(created_at DESC);

CREATE INDEX idx_usage_logs_tool
  ON usage_logs(tool_name);

-- =============================================
-- FUNCTION: Vector similarity search
-- =============================================
CREATE OR REPLACE FUNCTION match_design_patterns(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  filter_category TEXT DEFAULT NULL,
  filter_tags TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  tags TEXT[],
  source_url TEXT,
  tokens JSONB,
  screenshot_url TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dp.id,
    dp.name,
    dp.description,
    dp.category,
    dp.tags,
    dp.source_url,
    dp.tokens,
    dp.screenshot_url,
    1 - (dp.embedding <=> query_embedding) AS similarity
  FROM design_patterns dp
  WHERE
    1 - (dp.embedding <=> query_embedding)
      > match_threshold
    AND (
      filter_category IS NULL
      OR dp.category = filter_category
    )
    AND (
      filter_tags IS NULL
      OR dp.tags && filter_tags
    )
  ORDER BY dp.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================
-- FUNCTION: Usage stats aggregation
-- =============================================
CREATE OR REPLACE FUNCTION get_usage_stats(
  p_api_key_id UUID,
  p_period_start TIMESTAMPTZ
    DEFAULT NOW() - INTERVAL '30 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  tool_name TEXT,
  total_calls BIGINT,
  successful_calls BIGINT,
  error_calls BIGINT,
  avg_latency_ms NUMERIC,
  total_response_bytes BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ul.tool_name,
    COUNT(*)::BIGINT AS total_calls,
    COUNT(*) FILTER (
      WHERE ul.status = 'success'
    )::BIGINT AS successful_calls,
    COUNT(*) FILTER (
      WHERE ul.status = 'error'
    )::BIGINT AS error_calls,
    ROUND(AVG(ul.latency_ms)::NUMERIC, 2)
      AS avg_latency_ms,
    COALESCE(SUM(ul.response_size)::BIGINT, 0)
      AS total_response_bytes
  FROM usage_logs ul
  WHERE
    ul.api_key_id = p_api_key_id
    AND ul.created_at >= p_period_start
    AND ul.created_at <= p_period_end
  GROUP BY ul.tool_name
  ORDER BY total_calls DESC;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_design_patterns_updated
  BEFORE UPDATE ON design_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- TABLE: design_profiles (persistent design memory)
-- =============================================
CREATE TABLE design_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  source_url TEXT,
  tokens JSONB NOT NULL,
  components JSONB,
  raw_css TEXT,
  tailwind_config JSONB,
  css_variables TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_design_profiles_user ON design_profiles(user_id);
CREATE INDEX idx_design_profiles_project ON design_profiles(user_id, project_name);

CREATE TRIGGER trigger_design_profiles_updated
  BEFORE UPDATE ON design_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_profiles ENABLE ROW LEVEL SECURITY;

-- Users can manage their own API keys
CREATE POLICY "Users can manage own API keys"
  ON api_keys FOR ALL
  USING (auth.uid() = user_id);

-- Users can view their own usage logs
CREATE POLICY "Users can view own usage logs"
  ON usage_logs FOR SELECT
  USING (
    api_key_id IN (
      SELECT id FROM api_keys
      WHERE user_id = auth.uid()
    )
  );

-- Service role has full access (for the MCP server)
CREATE POLICY "Service role full access api_keys"
  ON api_keys FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access usage_logs"
  ON usage_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Users can manage their own design profiles
CREATE POLICY "Users can manage own design profiles"
  ON design_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access design_profiles"
  ON design_profiles FOR ALL
  USING (auth.role() = 'service_role');
