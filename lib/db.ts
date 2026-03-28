/**
 * Central data access layer — all Supabase queries live here.
 * Every page imports from this file, never from mock-data.
 */
import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type HackathonStatus = 'upcoming' | 'active' | 'ended' | 'draft';
export type SubmissionStatus = 'submitted' | 'reviewed' | 'approved' | 'disqualified';

export interface Hackathon {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  college: string;
  organizer: string;
  status: HackathonStatus;
  prize_pool: string;
  min_team_size: number;
  max_team_size: number;
  allow_solo: boolean;
  participant_count: number;
  team_count: number;
  tags: string[];
  is_featured: boolean;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  rules: string[];
  prizes: { rank: string; amount: string; description: string }[];
  timeline: { label: string; date: string; done: boolean }[];
  submission_types: string[];
  has_custom_form: boolean;
  custom_form_url: string | null;
  has_fees: boolean;
  fees_amount: string | null;
  upi_id: string | null;
  payment_qr_url: string | null;
  manager_id?: string;
  created_at: string;
}


export interface Submission {
  id: string;
  hackathon_id: string;
  hackathon_title: string;
  team_name: string;
  project_title: string;
  description: string;
  github_url: string;
  demo_url?: string;
  status: SubmissionStatus;
  score?: number;
  submitted_at: string;
  feedback?: string;
  user_id: string;
}

export interface Announcement {
  id: string;
  hackathon_id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  created_at: string;
}

export interface Certificate {
  id: string;
  hackathon_title: string;
  student_name: string;
  achievement: string;
  issued_at: string;
  verification_code: string;
  user_id: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  college?: string;
  organization_id?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Registration {
  id: string;
  hackathon_id: string;
  user_id: string;
  team_name?: string;
  registered_at: string;
  hackathons?: Hackathon;
  profiles?: Profile;
}

// ─── Hackathons ───────────────────────────────────────────────────────────────

export async function getHackathons(status?: HackathonStatus | 'all'): Promise<Hackathon[]> {
  let query = supabase
    .from('hackathons')
    .select('*')
    .order('created_at', { ascending: false });
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  const { data, error } = await query;
  if (error) { console.error('[getHackathons]', error.message); return []; }
  return (data ?? []) as Hackathon[];
}

export async function getPublicHackathons(): Promise<Hackathon[]> {
  const { data, error } = await supabase
    .from('hackathons')
    .select('*')
    .neq('status', 'draft')
    .order('created_at', { ascending: false });
  if (error) { console.error('[getPublicHackathons]', error.message); return []; }
  return (data ?? []) as Hackathon[];
}

export async function getHackathonById(id: string): Promise<Hackathon | null> {
  const { data, error } = await supabase
    .from('hackathons')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) { console.error('[getHackathonById]', error.message); return null; }
  return data as Hackathon | null;
}

export async function getManagerHackathons(managerId: string): Promise<Hackathon[]> {
  const { data, error } = await supabase
    .from('hackathons')
    .select('*')
    .eq('manager_id', managerId)
    .order('created_at', { ascending: false });
  if (error) { console.error('[getManagerHackathons]', error.message); return []; }
  return (data ?? []) as Hackathon[];
}

export async function createHackathon(payload: Partial<Hackathon>): Promise<{ data: Hackathon | null; error: string | null }> {
  const row: Record<string, unknown> = {
    title:                 payload.title ?? 'Untitled',
    subtitle:              payload.subtitle ?? null,
    description:           payload.description ?? null,
    college:               payload.college ?? null,
    status:                payload.status ?? 'upcoming',
    prize_pool:            payload.prize_pool ?? null,
    min_team_size:         payload.min_team_size ?? 1,
    max_team_size:         payload.max_team_size ?? 4,
    allow_solo:            payload.allow_solo ?? true,
    participant_count:     0,
    team_count:            0,
    tags:                  payload.tags ?? [],
    is_featured:           payload.is_featured ?? false,
    start_date:            payload.start_date ?? null,
    end_date:              payload.end_date ?? null,
    registration_deadline: payload.registration_deadline ?? null,
    rules:                 payload.rules ?? [],
    prizes:                payload.prizes ?? [],
    timeline:              payload.timeline ?? [],
    manager_id:            payload.manager_id ?? null,
    submission_types:      payload.submission_types ?? [],
    has_custom_form:       payload.has_custom_form ?? false,
    custom_form_url:       payload.custom_form_url ?? null,
    has_fees:              payload.has_fees ?? false,
    fees_amount:           payload.fees_amount ?? null,
    upi_id:                payload.upi_id ?? null,
    payment_qr_url:        payload.payment_qr_url ?? null,
  };

  const { data, error } = await supabase.from('hackathons').insert([row]).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Hackathon, error: null };
}


export async function updateHackathon(id: string, payload: Partial<Hackathon>): Promise<{ error: string | null }> {
  const allowed = ['title','subtitle','description','college','status','prize_pool',
    'min_team_size','max_team_size','allow_solo','participant_count','team_count','tags','is_featured',
    'start_date','end_date','registration_deadline','rules','prizes','timeline','manager_id',
    'submission_types','has_custom_form','custom_form_url','has_fees','fees_amount','upi_id','payment_qr_url'];
  const safe: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in payload) safe[key] = (payload as Record<string, unknown>)[key];
  }
  const { error } = await supabase.from('hackathons').update(safe).eq('id', id);
  if (error) return { error: error.message };
  return { error: null };
}


// ─── Submissions ──────────────────────────────────────────────────────────────

export async function getSubmissionsForHackathon(hackathonId: string): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .order('submitted_at', { ascending: false });
  if (error) { console.error('[getSubmissionsForHackathon]', error.message); return []; }
  return (data ?? []) as Submission[];
}

export async function getMySubmissions(userId: string): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });
  if (error) { console.error('[getMySubmissions]', error.message); return []; }
  return (data ?? []) as Submission[];
}

export async function createSubmission(payload: Partial<Submission>): Promise<{ data: Submission | null; error: string | null }> {
  const { data, error } = await supabase
    .from('submissions')
    .insert([payload])
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as Submission, error: null };
}

export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  feedback?: string,
  score?: number
): Promise<{ error: string | null }> {
  const payload: Record<string, unknown> = { status };
  if (feedback !== undefined) payload.feedback = feedback;
  if (score !== undefined) payload.score = score;
  const { error } = await supabase.from('submissions').update(payload).eq('id', id);
  if (error) return { error: error.message };
  return { error: null };
}

// ─── Announcements ────────────────────────────────────────────────────────────

export async function getAnnouncements(hackathonId?: string): Promise<Announcement[]> {
  let query = supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  if (hackathonId) query = query.eq('hackathon_id', hackathonId);
  const { data, error } = await query;
  if (error) { console.error('[getAnnouncements]', error.message); return []; }
  return (data ?? []) as Announcement[];
}

export async function createAnnouncement(payload: Partial<Announcement>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('announcements').insert([payload]);
  if (error) return { error: error.message };
  return { error: null };
}

// ─── Registrations ────────────────────────────────────────────────────────────

export async function registerForHackathon(userId: string, hackathonId: string, teamName?: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('registrations')
    .insert([{ user_id: userId, hackathon_id: hackathonId, team_name: teamName }]);
  if (error) return { error: error.message };
  return { error: null };
}

export async function getMyRegistrations(userId: string): Promise<Registration[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, hackathons(*)')
    .eq('user_id', userId)
    .order('registered_at', { ascending: false });
  if (error) { console.error('[getMyRegistrations]', error.message); return []; }
  return (data ?? []) as Registration[];
}

export async function isRegistered(userId: string, hackathonId: string): Promise<boolean> {
  const { data } = await supabase
    .from('registrations')
    .select('id')
    .eq('user_id', userId)
    .eq('hackathon_id', hackathonId)
    .maybeSingle();
  return !!data;
}

export async function unregisterFromHackathon(userId: string, hackathonId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('user_id', userId)
    .eq('hackathon_id', hackathonId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function getRegistrationsForHackathon(hackathonId: string): Promise<Registration[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, profiles(*)')
    .eq('hackathon_id', hackathonId)
    .order('registered_at', { ascending: false });
  if (error) { console.error('[getRegistrationsForHackathon]', error.message); return []; }
  return (data ?? []) as Registration[];
}


export async function getSavedHackathonIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('saved_hackathons')
    .select('hackathon_id')
    .eq('user_id', userId);
  return (data ?? []).map((r: { hackathon_id: string }) => r.hackathon_id);
}

export async function saveHackathon(userId: string, hackathonId: string): Promise<void> {
  await supabase.from('saved_hackathons').insert([{ user_id: userId, hackathon_id: hackathonId }]);
}

export async function unsaveHackathon(userId: string, hackathonId: string): Promise<void> {
  await supabase.from('saved_hackathons').delete().eq('user_id', userId).eq('hackathon_id', hackathonId);
}

// ─── Certificates ─────────────────────────────────────────────────────────────

export async function getMyCertificates(userId: string): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });
  if (error) { console.error('[getMyCertificates]', error.message); return []; }
  return (data ?? []) as Certificate[];
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function getAllProfiles(role?: string): Promise<Profile[]> {
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (role) query = query.eq('role', role);
  const { data, error } = await query;
  if (error) { console.error('[getAllProfiles]', error.message); return []; }
  return (data ?? []) as Profile[];
}

export async function getStudents(): Promise<Profile[]> {
  return getAllProfiles('student');
}

export async function getManagers(): Promise<Profile[]> {
  return getAllProfiles('manager');
}

export async function updateProfile(userId: string, payload: Partial<Profile>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  if (error) return { error: error.message };
  return { error: null };
}

// ─── Stats helpers ────────────────────────────────────────────────────────────

export async function getPlatformStats() {
  const [hackRes, profileRes, subRes] = await Promise.all([
    supabase.from('hackathons').select('id, status', { count: 'exact' }),
    supabase.from('profiles').select('id, role', { count: 'exact' }),
    supabase.from('submissions').select('id', { count: 'exact' }),
  ]);
  const hackathons = hackRes.data ?? [];
  const profiles = profileRes.data ?? [];
  return {
    totalHackathons: hackathons.length,
    activeHackathons: hackathons.filter((h: { status: string }) => h.status === 'active').length,
    totalStudents: profiles.filter((p: { role: string }) => p.role === 'student').length,
    totalManagers: profiles.filter((p: { role: string }) => p.role === 'manager').length,
    totalOrganizations: profiles.filter((p: { role: string }) => p.role === 'organization').length,
    totalSubmissions: subRes.data?.length ?? 0,
  };
}
