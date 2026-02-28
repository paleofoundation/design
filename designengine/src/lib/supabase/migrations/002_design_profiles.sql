-- =============================================
-- MIGRATION: design_profiles (persistent design memory)
-- Run in Supabase SQL Editor
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

ALTER TABLE design_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own design profiles"
  ON design_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access design_profiles"
  ON design_profiles FOR ALL
  USING (auth.role() = 'service_role');
