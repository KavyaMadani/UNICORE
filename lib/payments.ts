/**
 * Payment proof management — upload & status tracking.
 */
import { supabase } from './supabase';

export interface PaymentProof {
  id: string;
  hackathon_id: string;
  user_id: string;
  file_url: string;
  file_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
}

/** Get a user's payment proof for a specific hackathon */
export async function getMyPaymentProof(
  userId: string,
  hackathonId: string
): Promise<PaymentProof | null> {
  const { data, error } = await supabase
    .from('payment_proofs')
    .select('*')
    .eq('user_id', userId)
    .eq('hackathon_id', hackathonId)
    .maybeSingle();

  if (error) { console.error('[getMyPaymentProof]', error.message); return null; }
  return data as PaymentProof | null;
}

/** Upload a payment screenshot and upsert proof record */
export async function uploadPaymentProof(
  userId: string,
  hackathonId: string,
  file: File,
): Promise<{ proof: PaymentProof | null; error: string | null }> {
  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${userId}/${hackathonId}-payment.${ext}`;

  // Upload to storage
  const { error: uploadErr } = await supabase.storage
    .from('payment-proofs')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadErr) return { proof: null, error: uploadErr.message };

  // Get public (signed) URL
  const { data: urlData } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7-day signed URL

  const fileUrl = urlData?.signedUrl ?? path;

  // Upsert the proof record
  const { data, error } = await supabase
    .from('payment_proofs')
    .upsert([{
      hackathon_id: hackathonId,
      user_id: userId,
      file_url: fileUrl,
      file_name: file.name,
      status: 'pending',
    }], { onConflict: 'hackathon_id,user_id' })
    .select()
    .single();

  if (error) return { proof: null, error: error.message };
  return { proof: data as PaymentProof, error: null };
}

/** Get all payment proofs for a hackathon (manager use) */
export async function getPaymentProofsForHackathon(
  hackathonId: string
): Promise<(PaymentProof & { profile?: { name: string; email: string; college: string } })[]> {
  const { data, error } = await supabase
    .from('payment_proofs')
    .select('*, profiles!payment_proofs_user_id_fkey(name, email, college)')
    .eq('hackathon_id', hackathonId)
    .order('uploaded_at', { ascending: false });

  if (error) { console.error('[getPaymentProofsForHackathon]', error.message); return []; }
  return (data ?? []).map(r => ({
    ...r,
    profile: (r as { profiles?: { name: string; email: string; college: string } }).profiles,
  })) as (PaymentProof & { profile?: { name: string; email: string; college: string } })[];
}

/** Update proof status (manager action) */
export async function updatePaymentProofStatus(
  proofId: string,
  status: 'approved' | 'rejected',
  notes?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('payment_proofs')
    .update({ status, notes: notes ?? null, reviewed_at: new Date().toISOString() })
    .eq('id', proofId);
  return { error: error?.message ?? null };
}
