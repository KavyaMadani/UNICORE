/**
 * Submissions data layer — handles file uploads and CRUD.
 */
import { supabase } from './supabase';
import type { Submission } from './db';

export type SubmissionType = 'github' | 'pdf' | 'ppt' | 'website' | 'video' | 'zip';

export interface SubmissionData {
  github?: string;
  pdf?: string;
  ppt?: string;
  website?: string;
  video?: string;
  zip?: string;
  [key: string]: string | undefined;
}

export interface FullSubmission extends Submission {
  file_url?: string;
  file_name?: string;
  file_size?: number;
  submission_data?: SubmissionData;
}

/** Upload a file to Supabase Storage submissions bucket */
export async function uploadSubmissionFile(
  userId: string,
  hackathonId: string,
  file: File,
  type: string
): Promise<{ url: string; path: string; error: string | null }> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${hackathonId}/${type}_${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from('submissions')
    .upload(path, file, { upsert: true, cacheControl: '3600' });

  if (uploadErr) return { url: '', path: '', error: uploadErr.message };

  // Get a signed URL valid for 7 days
  const { data: signed } = await supabase.storage
    .from('submissions')
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  return { url: signed?.signedUrl ?? '', path, error: null };
}

/** Get a fresh signed URL for a stored file path */
export async function getSignedUrl(
  path: string,
  expiresInSeconds = 60 * 60 * 24
): Promise<string | null> {
  const { data } = await supabase.storage
    .from('submissions')
    .createSignedUrl(path, expiresInSeconds);
  return data?.signedUrl ?? null;
}

/** Create a new submission */
export async function createSubmission(payload: {
  hackathon_id: string;
  hackathon_title: string;
  user_id: string;
  team_name?: string;
  project_title: string;
  description?: string;
  submission_data: SubmissionData;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}): Promise<{ data: FullSubmission | null; error: string | null }> {
  const { data, error } = await supabase
    .from('submissions')
    .insert([{
      ...payload,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as FullSubmission, error: null };
}

/** Update an existing submission (student edits before deadline) */
export async function updateSubmission(
  id: string,
  payload: Partial<{
    project_title: string;
    description: string;
    submission_data: SubmissionData;
    file_url: string;
    file_name: string;
    file_size: number;
  }>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('submissions')
    .update(payload)
    .eq('id', id);
  return { error: error?.message ?? null };
}

/** Delete a submission */
export async function deleteSubmission(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('submissions').delete().eq('id', id);
  return { error: error?.message ?? null };
}

/** Get submissions for a hackathon (manager view) with profile info */
export async function getSubmissionsForHackathonFull(
  hackathonId: string
): Promise<FullSubmission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, profiles!submissions_user_id_fkey(name, email, college)')
    .eq('hackathon_id', hackathonId)
    .order('submitted_at', { ascending: false });

  if (error) { console.error('[getSubmissionsForHackathonFull]', error.message); return []; }
  return (data ?? []).map(s => ({
    ...s,
    submitter: (s as { profiles?: { name: string; email: string; college: string } }).profiles,
  })) as FullSubmission[];
}

/** Get my submissions with full data */
export async function getMyFullSubmissions(userId: string): Promise<FullSubmission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  if (error) { console.error('[getMyFullSubmissions]', error.message); return []; }
  return (data ?? []) as FullSubmission[];
}

/** Check if user already submitted for a hackathon */
export async function hasSubmitted(userId: string, hackathonId: string): Promise<FullSubmission | null> {
  const { data } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .eq('hackathon_id', hackathonId)
    .maybeSingle();
  return data as FullSubmission | null;
}

/** Score and give feedback to a submission (manager) */
export async function reviewSubmission(
  id: string,
  status: 'reviewed' | 'approved' | 'disqualified',
  score?: number,
  feedback?: string
): Promise<{ error: string | null }> {
  const payload: Record<string, unknown> = { status };
  if (score !== undefined) payload.score = score;
  if (feedback !== undefined) payload.feedback = feedback;
  const { error } = await supabase.from('submissions').update(payload).eq('id', id);
  return { error: error?.message ?? null };
}

/** File size formatter */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Type icons and labels */
export const TYPE_META: Record<SubmissionType, { icon: string; label: string; accept: string; isFile: boolean }> = {
  github:  { icon: '🔗', label: 'GitHub Repository',    accept: '',                       isFile: false },
  pdf:     { icon: '📄', label: 'PDF Document',          accept: '.pdf',                   isFile: true  },
  ppt:     { icon: '📊', label: 'Presentation (PPT)',    accept: '.ppt,.pptx',             isFile: true  },
  website: { icon: '🌐', label: 'Website / Demo URL',    accept: '',                       isFile: false },
  video:   { icon: '🎥', label: 'Video Demo',            accept: '.mp4,.webm,.mov',        isFile: true  },
  zip:     { icon: '📦', label: 'ZIP Archive',           accept: '.zip',                   isFile: true  },
};
