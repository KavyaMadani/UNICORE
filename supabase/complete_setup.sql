-- ==============================================================
-- HackForge – COMPLETE DATABASE SETUP (Safe to run from scratch)
-- Paste ALL of this in Supabase SQL Editor and click Run
-- ==============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  role            TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'organization', 'manager', 'student')),
  college         TEXT,
  organization_id UUID,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_service_all"  ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all"    ON profiles;
DROP POLICY IF EXISTS "profiles_read_all"     ON profiles;
DROP POLICY IF EXISTS "profiles_update_any"   ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_read_all"   ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "profiles_update_any" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

-- ─── HACKATHONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hackathons (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 TEXT NOT NULL,
  subtitle              TEXT,
  description           TEXT,
  college               TEXT,
  organizer             TEXT,
  status                TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('upcoming', 'active', 'ended', 'draft')),
  prize_pool            TEXT,
  min_team_size         INT DEFAULT 1,
  max_team_size         INT DEFAULT 4,
  participant_count     INT DEFAULT 0,
  team_count            INT DEFAULT 0,
  tags                  TEXT[] DEFAULT '{}',
  is_featured           BOOLEAN DEFAULT FALSE,
  start_date            TIMESTAMPTZ,
  end_date              TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  rules                 TEXT[] DEFAULT '{}',
  prizes                JSONB DEFAULT '[]',
  timeline              JSONB DEFAULT '[]',
  manager_id            UUID REFERENCES profiles(id),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hackathons_public_read"    ON hackathons;
DROP POLICY IF EXISTS "hackathons_manager_insert" ON hackathons;
DROP POLICY IF EXISTS "hackathons_manager_update" ON hackathons;
CREATE POLICY "hackathons_public_read"    ON hackathons FOR SELECT USING (status != 'draft' OR manager_id = auth.uid());
CREATE POLICY "hackathons_manager_insert" ON hackathons FOR INSERT WITH CHECK (manager_id = auth.uid());
CREATE POLICY "hackathons_manager_update" ON hackathons FOR UPDATE USING (manager_id = auth.uid());

-- ─── REGISTRATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hackathon_id  UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  team_name     TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, hackathon_id)
);
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "registrations_own"          ON registrations;
DROP POLICY IF EXISTS "registrations_insert"       ON registrations;
DROP POLICY IF EXISTS "registrations_manager_read" ON registrations;
CREATE POLICY "registrations_own"          ON registrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "registrations_insert"       ON registrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "registrations_manager_read" ON registrations FOR SELECT USING (
  hackathon_id IN (SELECT id FROM hackathons WHERE manager_id = auth.uid())
);

-- ─── SUBMISSIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id    UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  hackathon_title TEXT,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_name       TEXT,
  project_title   TEXT NOT NULL,
  description     TEXT,
  github_url      TEXT,
  demo_url        TEXT,
  status          TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'approved', 'disqualified')),
  score           INT,
  feedback        TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "submissions_own_read"      ON submissions;
DROP POLICY IF EXISTS "submissions_own_insert"    ON submissions;
DROP POLICY IF EXISTS "submissions_manager_read"  ON submissions;
DROP POLICY IF EXISTS "submissions_manager_update" ON submissions;
CREATE POLICY "submissions_own_read"       ON submissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "submissions_own_insert"     ON submissions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "submissions_manager_read"   ON submissions FOR SELECT USING (
  hackathon_id IN (SELECT id FROM hackathons WHERE manager_id = auth.uid())
);
CREATE POLICY "submissions_manager_update" ON submissions FOR UPDATE USING (
  hackathon_id IN (SELECT id FROM hackathons WHERE manager_id = auth.uid())
);

-- ─── SAVED HACKATHONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_hackathons (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  saved_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, hackathon_id)
);
ALTER TABLE saved_hackathons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "saved_own"    ON saved_hackathons;
DROP POLICY IF EXISTS "saved_insert" ON saved_hackathons;
DROP POLICY IF EXISTS "saved_delete" ON saved_hackathons;
CREATE POLICY "saved_own"    ON saved_hackathons FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "saved_insert" ON saved_hackathons FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_delete" ON saved_hackathons FOR DELETE USING (user_id = auth.uid());

-- ─── ANNOUNCEMENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT,
  type         TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "announcements_public_read"    ON announcements;
DROP POLICY IF EXISTS "announcements_manager_insert" ON announcements;
CREATE POLICY "announcements_public_read"    ON announcements FOR SELECT USING (true);
CREATE POLICY "announcements_manager_insert" ON announcements FOR INSERT WITH CHECK (
  hackathon_id IN (SELECT id FROM hackathons WHERE manager_id = auth.uid())
);

-- ─── CERTIFICATES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hackathon_title   TEXT NOT NULL,
  student_name      TEXT NOT NULL,
  achievement       TEXT NOT NULL,
  verification_code TEXT NOT NULL UNIQUE DEFAULT upper(substring(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 12)),
  issued_at         TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "certificates_own" ON certificates;
CREATE POLICY "certificates_own" ON certificates FOR SELECT USING (user_id = auth.uid());

-- ─── ORGANIZATIONS ────────────────────────────────────────────
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

-- ─── COLLEGES ─────────────────────────────────────────────────
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

-- ─── TRIGGER: Auto-create profile on signup ───────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'student'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name  = COALESCE(profiles.name, EXCLUDED.name);
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── TRIGGER: Auto-increment participant count ────────────────
CREATE OR REPLACE FUNCTION increment_participant_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE hackathons SET participant_count = participant_count + 1 WHERE id = NEW.hackathon_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_registration_created ON registrations;
CREATE TRIGGER on_registration_created
  AFTER INSERT ON registrations
  FOR EACH ROW EXECUTE FUNCTION increment_participant_count();

CREATE OR REPLACE FUNCTION decrement_participant_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE hackathons SET participant_count = GREATEST(0, participant_count - 1) WHERE id = OLD.hackathon_id;
  RETURN OLD;
END;
$$;
DROP TRIGGER IF EXISTS on_registration_deleted ON registrations;
CREATE TRIGGER on_registration_deleted
  AFTER DELETE ON registrations
  FOR EACH ROW EXECUTE FUNCTION decrement_participant_count();

-- ─── PROMOTE your account to admin ───────────────────────────
-- This updates YOUR account (kavyamadani10@gmail.com) to admin role.
-- Only runs if your profile already exists (sign in first if it doesn't).
UPDATE profiles SET role = 'admin' WHERE email = 'kavyamadani10@gmail.com';
