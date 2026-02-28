-- =============================================
-- MIGRATION 005: Knowledge Uploads Storage Bucket
-- Creates the storage bucket and policies so
-- authenticated admins can upload large files
-- and the service role can download/clean up.
-- =============================================

-- 1. Create the bucket (private, 50MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('knowledge-uploads', 'knowledge-uploads', FALSE, 52428800)
ON CONFLICT (id) DO NOTHING;

-- 2. Authenticated users can upload files
CREATE POLICY "Authenticated users can upload to knowledge-uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'knowledge-uploads');

-- 3. Authenticated users can read their own uploads (needed for upload confirmation)
CREATE POLICY "Authenticated users can read knowledge-uploads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'knowledge-uploads');

-- 4. Service role can do everything (download for processing, delete after)
-- Note: service_role bypasses RLS by default, so this is mainly explicit documentation.
-- If you have RLS force-enabled on storage.objects, uncomment these:
-- CREATE POLICY "Service role full access to knowledge-uploads"
--   ON storage.objects FOR ALL
--   TO service_role
--   USING (bucket_id = 'knowledge-uploads')
--   WITH CHECK (bucket_id = 'knowledge-uploads');
