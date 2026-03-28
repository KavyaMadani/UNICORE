-- ============================================================
-- patch_004: Team management system
-- Run in Supabase SQL Editor
-- ============================================================

-- ─── Teams table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id  UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  leader_id     UUID NOT NULL REFERENCES profiles(id),
  max_size      INT NOT NULL DEFAULT 4,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Team Members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id),
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader','member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- ─── Team Requests (join requests + leader invites) ─────────────
CREATE TABLE IF NOT EXISTS team_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id      UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES profiles(id),   -- set for join_request & accepted invites
  invite_email TEXT,                           -- set for invite by email
  type         TEXT NOT NULL CHECK (type IN ('join_request','invite')),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  message      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_teams_hackathon ON teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_requests_team ON team_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_team_requests_user ON team_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_team_requests_email ON team_requests(invite_email);

-- ─── RLS Policies ─────────────────────────────────────────────

-- Teams: everyone can read, authenticated can create
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "teams_select" ON teams;
DROP POLICY IF EXISTS "teams_insert" ON teams;
DROP POLICY IF EXISTS "teams_update" ON teams;

CREATE POLICY "teams_select" ON teams FOR SELECT USING (true);
CREATE POLICY "teams_insert" ON teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "teams_update" ON teams FOR UPDATE TO authenticated USING (auth.uid() = leader_id);

-- Team Members: everyone can read, authenticated can insert (for joins)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "team_members_select" ON team_members;
DROP POLICY IF EXISTS "team_members_insert" ON team_members;

CREATE POLICY "team_members_select" ON team_members FOR SELECT USING (true);
CREATE POLICY "team_members_insert" ON team_members FOR INSERT TO authenticated WITH CHECK (true);

-- Team Requests: authenticated can read own requests, insert, update
ALTER TABLE team_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "team_requests_select" ON team_requests;
DROP POLICY IF EXISTS "team_requests_insert" ON team_requests;
DROP POLICY IF EXISTS "team_requests_update" ON team_requests;

CREATE POLICY "team_requests_select" ON team_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "team_requests_insert" ON team_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "team_requests_update" ON team_requests FOR UPDATE TO authenticated USING (true);
