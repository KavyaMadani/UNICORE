/**
 * Team management DB layer — extended with leader controls.
 */
import { supabase } from './supabase';

export interface Team {
  id: string;
  hackathon_id: string;
  name: string;
  leader_id: string;
  max_size: number;
  created_at: string;
  member_count?: number;
  is_full?: boolean;
  leader?: { name: string; email: string };
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
  profile?: { name: string; email: string; college: string };
}

export interface TeamRequest {
  id: string;
  team_id: string;
  user_id: string | null;
  invite_email: string | null;
  type: 'join_request' | 'invite';
  status: 'pending' | 'accepted' | 'declined';
  message: string | null;
  created_at: string;
  team?: { name: string; hackathon_id: string };
  requester?: { name: string; email: string };
}

/** Get all teams for a hackathon with member counts */
export async function getTeamsForHackathon(hackathonId: string): Promise<Team[]> {
  const { data: teams, error } = await supabase
    .from('teams')
    .select('*, profiles!teams_leader_id_fkey(name, email)')
    .eq('hackathon_id', hackathonId)
    .order('created_at', { ascending: true });

  if (error) { console.error('[getTeamsForHackathon]', error.message); return []; }

  const teamIds = (teams ?? []).map(t => t.id);
  if (teamIds.length === 0) return [];

  const { data: members } = await supabase
    .from('team_members')
    .select('team_id')
    .in('team_id', teamIds);

  const countMap: Record<string, number> = {};
  (members ?? []).forEach(m => { countMap[m.team_id] = (countMap[m.team_id] ?? 0) + 1; });

  return (teams ?? []).map(t => ({
    ...t,
    leader: (t as { profiles?: { name: string; email: string } }).profiles ?? { name: 'Unknown', email: '' },
    member_count: countMap[t.id] ?? 0,
    is_full: (countMap[t.id] ?? 0) >= t.max_size,
  }));
}

/** Get members of a team with profile info */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*, profiles!team_members_user_id_fkey(name, email, college)')
    .eq('team_id', teamId)
    .order('joined_at', { ascending: true });

  if (error) { console.error('[getTeamMembers]', error.message); return []; }
  return (data ?? []).map(m => ({
    ...m,
    profile: (m as { profiles?: { name: string; email: string; college: string } }).profiles,
  }));
}

/** Get the team a user is on for a hackathon (null if not on any team) */
export async function getUserTeam(hackathonId: string, userId: string): Promise<Team | null> {
  const { data: memberships } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);

  if (!memberships?.length) return null;
  const teamIds = memberships.map(m => m.team_id);

  const { data } = await supabase
    .from('teams')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .in('id', teamIds)
    .maybeSingle();

  return data as Team | null;
}

/** Create a team (leader registers + creates team + becomes first member) */
export async function createTeam(
  hackathonId: string,
  leaderId: string,
  teamName: string,
  maxSize: number
): Promise<{ team: Team | null; error: string | null }> {
  const { error: regErr } = await supabase.from('registrations').upsert(
    [{ user_id: leaderId, hackathon_id: hackathonId, team_name: teamName }],
    { onConflict: 'user_id,hackathon_id' }
  );
  if (regErr && !regErr.message.includes('unique')) {
    return { team: null, error: regErr.message };
  }

  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .insert([{ hackathon_id: hackathonId, name: teamName, leader_id: leaderId, max_size: maxSize }])
    .select()
    .single();

  if (teamErr) return { team: null, error: teamErr.message };

  await supabase.from('team_members').insert([{
    team_id: team.id, user_id: leaderId, role: 'leader'
  }]);

  return { team: team as Team, error: null };
}

/** Update team name (leader only) */
export async function updateTeamName(
  teamId: string,
  newName: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('teams')
    .update({ name: newName.trim() })
    .eq('id', teamId);
  return { error: error?.message ?? null };
}

/** Remove a member from a team (leader action) */
export async function removeMember(
  teamMemberId: string,
  userId: string,
  hackathonId: string
): Promise<{ error: string | null }> {
  // Remove from team_members
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', teamMemberId);

  if (error) return { error: error.message };

  // Also remove their registration so they can re-register if they want
  await supabase.from('registrations')
    .delete()
    .eq('user_id', userId)
    .eq('hackathon_id', hackathonId);

  return { error: null };
}

/** Leave a team (member self-action) */
export async function leaveTeam(
  teamId: string,
  userId: string,
  hackathonId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  if (error) return { error: error.message };

  await supabase.from('registrations')
    .delete()
    .eq('user_id', userId)
    .eq('hackathon_id', hackathonId);

  return { error: null };
}

/** Send a join request to a team */
export async function sendJoinRequest(
  teamId: string,
  userId: string,
  message?: string
): Promise<{ error: string | null }> {
  const { data: existing } = await supabase
    .from('team_requests')
    .select('id, status')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .eq('type', 'join_request')
    .maybeSingle();

  if (existing) {
    if (existing.status === 'pending') return { error: 'You already sent a request to this team.' };
    if (existing.status === 'accepted') return { error: 'You are already a member of this team.' };
  }

  const { error } = await supabase.from('team_requests').insert([{
    team_id: teamId, user_id: userId, type: 'join_request',
    status: 'pending', message: message || null
  }]);

  return { error: error?.message ?? null };
}

/** Withdraw a pending join request */
export async function withdrawJoinRequest(
  teamId: string,
  userId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('team_requests')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .eq('type', 'join_request')
    .eq('status', 'pending');
  return { error: error?.message ?? null };
}

/** Send email invites to teammates (leader action) */
export async function sendInvites(
  teamId: string,
  inviterId: string,
  emails: string[]
): Promise<{ error: string | null }> {
  if (emails.length === 0) return { error: null };
  const rows = emails.map(email => ({
    team_id: teamId, user_id: inviterId, invite_email: email.toLowerCase().trim(),
    type: 'invite' as const, status: 'pending' as const
  }));
  const { error } = await supabase.from('team_requests').insert(rows);
  return { error: error?.message ?? null };
}

/** Get pending join requests for all teams that this user leads */
export async function getJoinRequestsForLeader(leaderId: string, hackathonId: string): Promise<TeamRequest[]> {
  const { data: myTeams } = await supabase
    .from('teams')
    .select('id')
    .eq('leader_id', leaderId)
    .eq('hackathon_id', hackathonId);

  if (!myTeams?.length) return [];
  const teamIds = myTeams.map(t => t.id);

  const { data, error } = await supabase
    .from('team_requests')
    .select('*, teams(name, hackathon_id), profiles!team_requests_user_id_fkey(name, email)')
    .in('team_id', teamIds)
    .eq('type', 'join_request')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) { console.error('[getJoinRequestsForLeader]', error.message); return []; }
  return (data ?? []).map(r => ({
    ...r,
    team: (r as { teams?: { name: string; hackathon_id: string } }).teams,
    requester: (r as { profiles?: { name: string; email: string } }).profiles,
  })) as TeamRequest[];
}

/** Get invites sent to a user's email */
export async function getInvitesForUser(email: string): Promise<TeamRequest[]> {
  const { data, error } = await supabase
    .from('team_requests')
    .select('*, teams(name, hackathon_id)')
    .eq('invite_email', email.toLowerCase())
    .eq('type', 'invite')
    .eq('status', 'pending');

  if (error) { console.error('[getInvitesForUser]', error.message); return []; }
  return (data ?? []).map(r => ({
    ...r,
    team: (r as { teams?: { name: string; hackathon_id: string } }).teams,
  })) as TeamRequest[];
}

/** Accept a join request (leader action) — registers the user + adds to team */
export async function acceptJoinRequest(
  requestId: string,
  teamId: string,
  hackathonId: string,
  userId: string
): Promise<{ error: string | null }> {
  // Check team is not full
  const { data: members } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', teamId);
  const { data: team } = await supabase.from('teams').select('max_size').eq('id', teamId).single();
  if (team && members && members.length >= team.max_size) {
    return { error: 'Team is full. Cannot accept more members.' };
  }

  await supabase.from('team_requests').update({ status: 'accepted' }).eq('id', requestId);

  await supabase.from('registrations').upsert(
    [{ user_id: userId, hackathon_id: hackathonId }],
    { onConflict: 'user_id,hackathon_id' }
  );

  const { error } = await supabase.from('team_members').insert([{
    team_id: teamId, user_id: userId, role: 'member'
  }]);

  return { error: error?.message ?? null };
}

/** Decline a join request or invite */
export async function declineRequest(requestId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('team_requests')
    .update({ status: 'declined' })
    .eq('id', requestId);
  return { error: error?.message ?? null };
}

/** Accept an invite (member action) — registers the user + adds to team */
export async function acceptInvite(
  requestId: string,
  teamId: string,
  hackathonId: string,
  userId: string
): Promise<{ error: string | null }> {
  await supabase.from('team_requests').update({ status: 'accepted', user_id: userId }).eq('id', requestId);
  await supabase.from('registrations').upsert(
    [{ user_id: userId, hackathon_id: hackathonId }],
    { onConflict: 'user_id,hackathon_id' }
  );
  const { error } = await supabase.from('team_members').insert([{
    team_id: teamId, user_id: userId, role: 'member'
  }]);
  return { error: error?.message ?? null };
}

/** Check if user already has a pending request for a team */
export async function getUserRequestStatus(
  teamId: string, userId: string
): Promise<'none' | 'pending' | 'accepted' | 'declined'> {
  const { data } = await supabase
    .from('team_requests')
    .select('status')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .eq('type', 'join_request')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.status as 'pending' | 'accepted' | 'declined') ?? 'none';
}

/** Get all join requests made BY a user (to check which teams they requested) */
export async function getMyJoinRequests(
  userId: string,
  hackathonId: string
): Promise<TeamRequest[]> {
  const { data, error } = await supabase
    .from('team_requests')
    .select('*, teams!inner(name, hackathon_id)')
    .eq('user_id', userId)
    .eq('type', 'join_request')
    .eq('teams.hackathon_id', hackathonId)
    .order('created_at', { ascending: false });

  if (error) { console.error('[getMyJoinRequests]', error.message); return []; }
  return (data ?? []).map(r => ({
    ...r,
    team: (r as { teams?: { name: string; hackathon_id: string } }).teams,
  })) as TeamRequest[];
}
