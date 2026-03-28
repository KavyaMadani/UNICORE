-- ============================================================
-- HackForge – Complete Database Schema
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'organization', 'manager', 'student')),
  college       TEXT,
  organization_id UUID,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Allow reading own profile + allow inserts from service role
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Allow admins to read all profiles (via service role key on server)
CREATE POLICY "profiles_service_all" ON profiles USING (true) WITH CHECK (true);

-- ─── Hackathons ───────────────────────────────────────────────
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
-- Everyone can read non-draft hackathons
CREATE POLICY "hackathons_public_read" ON hackathons FOR SELECT USING (status != 'draft' OR manager_id = auth.uid());
-- Managers can insert their own
CREATE POLICY "hackathons_manager_insert" ON hackathons FOR INSERT WITH CHECK (manager_id = auth.uid());
-- Managers can update their own
CREATE POLICY "hackathons_manager_update" ON hackathons FOR UPDATE USING (manager_id = auth.uid());

-- ─── Registrations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hackathon_id   UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  team_name      TEXT,
  registered_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, hackathon_id)
);
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "registrations_own" ON registrations USING (user_id = auth.uid());
CREATE POLICY "registrations_insert" ON registrations FOR INSERT WITH CHECK (user_id = auth.uid());

-- ─── Submissions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id     UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  hackathon_title  TEXT,
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_name        TEXT,
  project_title    TEXT NOT NULL,
  description      TEXT,
  github_url       TEXT,
  demo_url         TEXT,
  status           TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'approved', 'disqualified')),
  score            INT,
  feedback         TEXT,
  submitted_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "submissions_own_read" ON submissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "submissions_own_insert" ON submissions FOR INSERT WITH CHECK (user_id = auth.uid());
-- Managers can read all submissions for their hackathons
CREATE POLICY "submissions_manager_read" ON submissions FOR SELECT USING (
  hackathon_id IN (SELECT id FROM hackathons WHERE manager_id = auth.uid())
);
CREATE POLICY "submissions_manager_update" ON submissions FOR UPDATE USING (
  hackathon_id IN (SELECT id FROM hackathons WHERE manager_id = auth.uid())
);

-- ─── Saved Hackathons ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_hackathons (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hackathon_id  UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  saved_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, hackathon_id)
);
ALTER TABLE saved_hackathons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_own" ON saved_hackathons USING (user_id = auth.uid());
CREATE POLICY "saved_insert" ON saved_hackathons FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_delete" ON saved_hackathons FOR DELETE USING (user_id = auth.uid());

-- ─── Announcements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id  UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT,
  type          TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements_public_read" ON announcements FOR SELECT USING (true);
CREATE POLICY "announcements_manager_insert" ON announcements FOR INSERT WITH CHECK (
  hackathon_id IN (SELECT id FROM hackathons WHERE manager_id = auth.uid())
);

-- ─── Certificates ─────────────────────────────────────────────
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
CREATE POLICY "certificates_own" ON certificates FOR SELECT USING (user_id = auth.uid());

-- ─── Handle new user signup ────────────────────────────────────
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

-- ─── Auto-increment participant_count when someone registers ──
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
