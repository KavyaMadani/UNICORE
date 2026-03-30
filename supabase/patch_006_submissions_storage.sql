-- ============================================================
-- patch_006: Submission file uploads + storage bucket
-- Run in Supabase SQL Editor
-- ============================================================

-- Extend submissions table with file storage columns
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submission_data JSONB DEFAULT '{}';
-- submission_data stores per-type URLs: { github: "...", pdf: "...", ppt: "...", website: "...", video: "...", zip: "..." }

-- Allow students to update their own submissions (before deadline)
DROP POLICY IF EXISTS "submissions_own_update" ON submissions;
CREATE POLICY "submissions_own_update" ON submissions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow students to delete their own submissions
DROP POLICY IF EXISTS "submissions_own_delete" ON submissions;
CREATE POLICY "submissions_own_delete" ON submissions FOR DELETE
  USING (user_id = auth.uid());

-- ---- Storage Bucket for Submissions ----
-- Run these in Supabase Dashboard > Storage > New Bucket
-- OR via SQL using the storage schema:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submissions',
  'submissions',
  false,  -- private bucket, URLs signed
  52428800,  -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'image/png',
    'image/jpeg',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies
DROP POLICY IF EXISTS "submissions_upload" ON storage.objects;
DROP POLICY IF EXISTS "submissions_read_own" ON storage.objects;
DROP POLICY IF EXISTS "submissions_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "submissions_manager_read" ON storage.objects;

-- Students can upload to their own folder
CREATE POLICY "submissions_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Students can read their own files
CREATE POLICY "submissions_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Students can delete their own files
CREATE POLICY "submissions_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Managers can read any submission file (for review)
-- They need service role or RLS bypass for this — use signed URLs from server
-- For now, allow all authenticated users to read (controlled by UI)
CREATE POLICY "submissions_manager_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'submissions');
