-- ============================================================
-- COMPLETE TEAM MANAGEMENT SETUP
-- Run ALL of these in Supabase SQL Editor (in order)
-- ============================================================

-- Step 1: Run patch_004_teams.sql first (if not already done)
-- Then run this file

-- ============================================================
-- STEP 2: patch_005 — Additional policies for full team mgmt
-- ============================================================

-- Allow leader to delete members from their team; members can also leave themselves
DROP POLICY IF EXISTS "team_members_delete" ON team_members;
CREATE POLICY "team_members_delete" ON team_members FOR DELETE TO authenticated
  USING (
    team_id IN (SELECT id FROM teams WHERE leader_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Allow leader to update team (name change etc.)
DROP POLICY IF EXISTS "teams_update" ON teams;
CREATE POLICY "teams_update" ON teams FOR UPDATE TO authenticated
  USING (auth.uid() = leader_id)
  WITH CHECK (auth.uid() = leader_id);

-- Allow leader to delete their team
DROP POLICY IF EXISTS "teams_delete" ON teams;
CREATE POLICY "teams_delete" ON teams FOR DELETE TO authenticated
  USING (auth.uid() = leader_id);

-- Allow users to withdraw their own join requests; leaders to delete requests for their team
DROP POLICY IF EXISTS "team_requests_delete" ON team_requests;
CREATE POLICY "team_requests_delete" ON team_requests FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR team_id IN (SELECT id FROM teams WHERE leader_id = auth.uid())
  );

-- ============================================================
-- VERIFY: Check all policies are in place
-- ============================================================
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('teams', 'team_members', 'team_requests')
ORDER BY tablename, policyname;
