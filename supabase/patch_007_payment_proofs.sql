-- ============================================================
-- patch_007: Payment proof uploads
-- Run in Supabase SQL Editor
-- ============================================================

-- Payment proofs table: students upload screenshot for fee-based hackathons
CREATE TABLE IF NOT EXISTS payment_proofs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id  UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url      TEXT NOT NULL,         -- public or signed URL
  file_name     TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  notes         TEXT,                  -- manager notes
  uploaded_at   TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  UNIQUE(hackathon_id, user_id)        -- one proof per user per hackathon
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_hackathon ON payment_proofs(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_user ON payment_proofs(user_id);

-- RLS
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_proofs_select_own" ON payment_proofs;
DROP POLICY IF EXISTS "payment_proofs_insert_own"  ON payment_proofs;
DROP POLICY IF EXISTS "payment_proofs_update_own"  ON payment_proofs;
DROP POLICY IF EXISTS "payment_proofs_manager_select" ON payment_proofs;
DROP POLICY IF EXISTS "payment_proofs_manager_update" ON payment_proofs;

-- Students can see their own proofs
CREATE POLICY "payment_proofs_select_own" ON payment_proofs FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Students can insert their proof
CREATE POLICY "payment_proofs_insert_own" ON payment_proofs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Students can update their own pending proof (re-upload)
CREATE POLICY "payment_proofs_update_own" ON payment_proofs FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

-- Managers can read all proofs for hackathons they manage
CREATE POLICY "payment_proofs_manager_select" ON payment_proofs FOR SELECT TO authenticated
  USING (
    hackathon_id IN (SELECT id FROM hackathons WHERE manager_id = auth.uid())
  );

-- Managers can update (approve/reject) proof status
CREATE POLICY "payment_proofs_manager_update" ON payment_proofs FOR UPDATE TO authenticated
  USING (
    hackathon_id IN (SELECT id FROM hackathons WHERE manager_id = auth.uid())
  );

-- ---- Storage Bucket for Payment Proofs ----
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  10485760,  -- 10MB limit
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS for payment proofs
DROP POLICY IF EXISTS "payment_proofs_upload" ON storage.objects;
DROP POLICY IF EXISTS "payment_proofs_read_own" ON storage.objects;
DROP POLICY IF EXISTS "payment_proofs_manager_read" ON storage.objects;

CREATE POLICY "payment_proofs_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "payment_proofs_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "payment_proofs_manager_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs');
