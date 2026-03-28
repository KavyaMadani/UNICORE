-- ==============================================================
-- HackForge – PATCH ONLY (run this since base schema already exists)
-- ==============================================================

-- ─── Fix profiles policies ────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own"             ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"             ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"             ON profiles;
DROP POLICY IF EXISTS "profiles_service_all"            ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all"              ON profiles;
DROP POLICY IF EXISTS "profiles_read_all"               ON profiles;
DROP POLICY IF EXISTS "profiles_read_all_authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles_update_any"             ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all"       ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_read_all"   ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "profiles_update_any" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

-- ─── Add manager read policy for registrations ────────────────
DROP POLICY IF EXISTS "registrations_manager_read" ON registrations;
CREATE POLICY "registrations_manager_read" ON registrations
  FOR SELECT USING (
    hackathon_id IN (SELECT id FROM hackathons WHERE manager_id = auth.uid())
  );

-- ─── Organizations table (NEW) ────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  email          TEXT,
  college        TEXT,
  website        TEXT,
  contact_person TEXT,
  contact_phone  TEXT,
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "organizations_select_all"   ON organizations;
DROP POLICY IF EXISTS "organizations_admin_insert" ON organizations;
DROP POLICY IF EXISTS "organizations_admin_update" ON organizations;
DROP POLICY IF EXISTS "organizations_admin_delete" ON organizations;
CREATE POLICY "organizations_select_all"   ON organizations FOR SELECT USING (true);
CREATE POLICY "organizations_admin_insert" ON organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "organizations_admin_update" ON organizations FOR UPDATE USING (true);
CREATE POLICY "organizations_admin_delete" ON organizations FOR DELETE USING (true);

-- ─── Colleges table (NEW) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS colleges (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  domain     TEXT,
  city       TEXT,
  state      TEXT,
  website    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "colleges_select_all"   ON colleges;
DROP POLICY IF EXISTS "colleges_admin_insert" ON colleges;
DROP POLICY IF EXISTS "colleges_admin_update" ON colleges;
DROP POLICY IF EXISTS "colleges_admin_delete" ON colleges;
CREATE POLICY "colleges_select_all"   ON colleges FOR SELECT USING (true);
CREATE POLICY "colleges_admin_insert" ON colleges FOR INSERT WITH CHECK (true);
CREATE POLICY "colleges_admin_update" ON colleges FOR UPDATE USING (true);
CREATE POLICY "colleges_admin_delete" ON colleges FOR DELETE USING (true);

-- ─── Promote your account to admin ───────────────────────────
UPDATE profiles SET role = 'admin' WHERE email = 'kavyamadani10@gmail.com';
