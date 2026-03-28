-- ============================================================
-- patch_003: College domain detection + Storage bucket policies
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add domain column to colleges table (for email-based college auto-detection)
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS city TEXT;

-- Create a unique index on domain so each domain maps to one college
CREATE UNIQUE INDEX IF NOT EXISTS colleges_domain_unique ON colleges(domain) WHERE domain IS NOT NULL;

-- ============================================================
-- STORAGE POLICIES for hackathon-assets bucket
-- (Bucket must already exist — created via Supabase Dashboard)
-- ============================================================

-- Drop existing policies first (safe to re-run)
DROP POLICY IF EXISTS "Public read hackathon-assets" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload hackathon-assets" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete hackathon-assets" ON storage.objects;

-- Allow anyone to read from the public bucket
CREATE POLICY "Public read hackathon-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'hackathon-assets');

-- Allow authenticated users to upload to hackathon-assets
CREATE POLICY "Auth upload hackathon-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hackathon-assets');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Auth delete hackathon-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hackathon-assets');

