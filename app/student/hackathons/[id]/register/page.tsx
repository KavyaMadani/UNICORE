'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { getHackathonById, isRegistered, type Hackathon } from '@/lib/db';
import { createTeam, sendInvites } from '@/lib/teams';
import { useRouter, useParams } from 'next/navigation';
import {
  CheckCircle, ArrowLeft, ArrowRight, User, Users, School,
  Shield, Loader2, AlertCircle, Crown, UserPlus, X, Mail,
  Search
} from 'lucide-react';

export default function RegisterHackathonPage() {
  const params = useParams();
  const router = useRouter();
  const hackathonId = params?.id as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdTeam, setCreatedTeam] = useState<{id: string; name: string} | null>(null);

  // Step 1
  const [profile, setProfile] = useState<{ id: string; name: string; email: string; college: string } | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [confirmCollege, setConfirmCollege] = useState('');

  // Step 2
  const [teamMode, setTeamMode] = useState<'solo' | 'create_team' | 'browse_teams'>('solo');
  const [teamName, setTeamName] = useState('');

  // Step 2 — invite teammates by email
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteInput, setInviteInput] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/signin'); return; }

      const { data: prof } = await supabase
        .from('profiles')
        .select('id, name, email, college')
        .eq('id', session.user.id)
        .single();

      if (prof) {
        setProfile({ id: prof.id, name: prof.name ?? '', email: prof.email ?? '', college: prof.college ?? '' });
        setConfirmName(prof.name ?? '');
        setConfirmCollege(prof.college ?? '');
      }

      const h = await getHackathonById(hackathonId);
      setHackathon(h);

      // Default team mode based on hackathon rules
      if (h && !h.allow_solo) setTeamMode('create_team');

      if (h && prof) {
        const already = await isRegistered(prof.id, h.id);
        if (already) { router.replace(`/student/hackathons/${hackathonId}`); return; }
      }
      setLoading(false);
    })();
  }, [hackathonId, router]);

  const addInviteEmail = () => {
    const e = inviteInput.trim().toLowerCase();
    if (!e || !e.includes('@')) { setError('Please enter a valid email.'); return; }
    if (inviteEmails.includes(e)) { setError('Already added.'); return; }
    if (inviteEmails.length >= (hackathon?.max_team_size ?? 4) - 1) {
      setError(`Max ${(hackathon?.max_team_size ?? 4) - 1} invites (you + teammates = ${hackathon?.max_team_size ?? 4}).`);
      return;
    }
    setError(null);
    setInviteEmails(prev => [...prev, e]);
    setInviteInput('');
  };

  const goStep2 = () => {
    if (!confirmName.trim()) { setError('Please enter your full name.'); return; }
    if (!confirmCollege.trim()) { setError('Please enter your college.'); return; }
    setError(null);
    setStep(2);
  };

  const goStep3 = () => {
    if (teamMode === 'create_team' && !teamName.trim()) {
      setError('Please enter a team name.'); return;
    }
    if (teamMode === 'browse_teams') {
      router.push(`/student/hackathons/${hackathonId}#teams`);
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleRegister = async () => {
    if (!profile || !hackathon) return;
    setSubmitting(true);
    setError(null);

    // Update profile if changed
    if (confirmName !== profile.name || confirmCollege !== profile.college) {
      await supabase.from('profiles')
        .update({ name: confirmName, college: confirmCollege })
        .eq('id', profile.id);
    }

    if (teamMode === 'solo') {
      const { error: regErr } = await supabase.from('registrations').insert([{
        user_id: profile.id,
        hackathon_id: hackathon.id,
        team_name: null,
      }]);
      setSubmitting(false);
      if (regErr) {
        setError(regErr.message.includes('unique') ? 'Already registered.' : regErr.message);
        return;
      }
    } else if (teamMode === 'create_team') {
      const { team, error: teamErr } = await createTeam(
        hackathon.id, profile.id, teamName.trim(), hackathon.max_team_size ?? 4
      );
      if (teamErr) { setSubmitting(false); setError(teamErr); return; }
      if (team && inviteEmails.length > 0) {
        await sendInvites(team.id, profile.id, inviteEmails);
      }
      setCreatedTeam(team ? { id: team.id, name: team.name } : null);
      setSubmitting(false);
    }

    setDone(true);
  };

  // ── Loading ──
  if (loading) {
    return (
      <DashboardLayout title="Register">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Loader2 size={28} color="#818cf8" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      </DashboardLayout>
    );
  }

  // ── Success Screen ──
  if (done) {
    return (
      <DashboardLayout title="Registered!">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={40} color="#34d399" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', marginBottom: 8 }}>You&apos;re In! 🎉</h2>
          <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 16 }}>
            Successfully registered for <strong style={{ color: '#e2e8f0' }}>{hackathon?.title}</strong>
          </p>

          {teamMode === 'create_team' && createdTeam && (
            <div style={{ padding: '20px 24px', borderRadius: 16, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 20, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Crown size={16} color="#818cf8" />
                <p style={{ fontSize: 14, fontWeight: 800, color: '#c7d2fe' }}>Team Created — You are the Leader!</p>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
                Team: <strong style={{ color: '#818cf8' }}>{createdTeam.name}</strong>
              </p>
              {inviteEmails.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Invites sent to:</p>
                  {inviteEmails.map(e => (
                    <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Mail size={11} color="#64748b" />
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{e}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>
                    They&apos;ll see the invite notification when they log in.
                  </p>
                </div>
              )}
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 12 }}>
                Others can also find your team and send join requests from the Teams tab.
              </p>
            </div>
          )}

          {hackathon?.has_fees && (
            <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: 16, textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: '#fde68a' }}>💳 Remember to complete payment. Check the hackathon&apos;s Payment tab for UPI details.</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button onClick={() => router.push(`/student/hackathons/${hackathonId}`)}>View Hackathon</Button>
            {teamMode === 'create_team' && createdTeam && (
              <Button variant="secondary" onClick={() => router.push(`/student/hackathons/${hackathonId}/my-team`)}>
                Manage Team
              </Button>
            )}
            <Button variant="ghost" onClick={() => router.push('/student/registrations')}>My Registrations</Button>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  const allowSolo = hackathon?.allow_solo !== false;
  const isTeamHackathon = (hackathon?.max_team_size ?? 1) > 1;
  const stepLabels = ['Verify Identity', 'Team Setup', 'Confirm & Register'];

  return (
    <DashboardLayout
      title={`Register: ${hackathon?.title ?? '...'}`}
      subtitle="Complete the steps below to secure your spot"
      actions={<Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/student/hackathons/${hackathonId}`)}>Back</Button>}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* ── Step indicator ── */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
          {stepLabels.map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 13, fontWeight: 800, transition: 'all 0.3s',
                  background: step > i + 1 ? 'rgba(52,211,153,0.2)' : step === i + 1 ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${step > i + 1 ? '#34d399' : step === i + 1 ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                  color: step > i + 1 ? '#34d399' : step === i + 1 ? '#a5b4fc' : '#475569',
                }}>
                  {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: step === i + 1 ? '#a5b4fc' : '#475569' }}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && (
                <div style={{ flex: 1, height: 1, background: step > i + 1 ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.07)', margin: '0 10px' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20 }}>
            <AlertCircle size={16} color="#f87171" />
            <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

            {/* ══ STEP 1: Identity ══ */}
            {step === 1 && (
              <div style={{ padding: '32px 36px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={18} color="#818cf8" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Verify Your Identity</h2>
                    <p style={{ fontSize: 12, color: '#64748b' }}>Confirm your details before registering</p>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Email</label>
                  <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <User size={14} color="#64748b" />
                    <span style={{ fontSize: 14, color: '#64748b' }}>{profile?.email}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.1)', color: '#34d399', fontWeight: 700 }}>Verified</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Full Name *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><User size={14} /></span>
                      <input type="text" value={confirmName} onChange={e => setConfirmName(e.target.value)} placeholder="Your full name" className="input-glass" style={{ paddingLeft: 38 }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>College / Institution *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><School size={14} /></span>
                      <input type="text" value={confirmCollege} onChange={e => setConfirmCollege(e.target.value)} placeholder="Your college name" className="input-glass" style={{ paddingLeft: 38 }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 24, padding: '12px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <p style={{ fontSize: 12, color: '#a5b4fc' }}>✓ This info will appear on your participation record and certificate.</p>
                </div>
              </div>
            )}

            {/* ══ STEP 2: Team Setup ══ */}
            {step === 2 && (
              <div style={{ padding: '32px 36px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} color="#818cf8" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Team Setup</h2>
                    <p style={{ fontSize: 12, color: '#64748b' }}>
                      Size: {hackathon?.min_team_size}–{hackathon?.max_team_size} · {allowSolo ? 'Solo allowed' : 'Teams only'}
                    </p>
                  </div>
                </div>

                {/* Mode selector */}
                <div style={{ display: 'grid', gridTemplateColumns: allowSolo && isTeamHackathon ? '1fr 1fr 1fr' : isTeamHackathon ? '1fr 1fr' : '1fr', gap: 10, marginBottom: 20, marginTop: 20 }}>
                  {allowSolo && (
                    <button type="button" onClick={() => setTeamMode('solo')}
                      style={{ padding: '18px 14px', borderRadius: 14, border: `1.5px solid ${teamMode === 'solo' ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, background: teamMode === 'solo' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                      <p style={{ fontSize: 18, marginBottom: 6 }}>👤</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: teamMode === 'solo' ? '#c7d2fe' : '#94a3b8' }}>Solo</p>
                      <p style={{ fontSize: 10, color: '#64748b' }}>Alone</p>
                    </button>
                  )}
                  {isTeamHackathon && (
                    <>
                      <button type="button" onClick={() => setTeamMode('create_team')}
                        style={{ padding: '18px 14px', borderRadius: 14, border: `1.5px solid ${teamMode === 'create_team' ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, background: teamMode === 'create_team' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                        <p style={{ fontSize: 18, marginBottom: 6 }}>👑</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: teamMode === 'create_team' ? '#c7d2fe' : '#94a3b8' }}>Create Team</p>
                        <p style={{ fontSize: 10, color: '#64748b' }}>You&apos;re the leader</p>
                      </button>
                      <button type="button" onClick={() => setTeamMode('browse_teams')}
                        style={{ padding: '18px 14px', borderRadius: 14, border: `1.5px solid ${teamMode === 'browse_teams' ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, background: teamMode === 'browse_teams' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                        <p style={{ fontSize: 18, marginBottom: 6 }}>🔍</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: teamMode === 'browse_teams' ? '#c7d2fe' : '#94a3b8' }}>Join a Team</p>
                        <p style={{ fontSize: 10, color: '#64748b' }}>Browse teams</p>
                      </button>
                    </>
                  )}
                </div>

                {/* Browse teams info */}
                <AnimatePresence>
                  {teamMode === 'browse_teams' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <div style={{ padding: '18px 20px', borderRadius: 16, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <Search size={15} color="#818cf8" />
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#c7d2fe' }}>Browse Open Teams</p>
                        </div>
                        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                          Click &quot;Continue&quot; to go to the Teams tab where you can browse all open teams and send a join request to a team leader.
                        </p>
                        <p style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>
                          Once the leader accepts your request, you&apos;ll be automatically registered.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Create team form */}
                <AnimatePresence>
                  {teamMode === 'create_team' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <Input id="team-name" label="Team Name *" placeholder="e.g. Team Phoenix" value={teamName} onChange={e => setTeamName(e.target.value)} />

                      {/* Invite teammates */}
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                          Invite Teammates by Email (optional)
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="email"
                            value={inviteInput}
                            onChange={e => setInviteInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addInviteEmail(); } }}
                            placeholder="teammate@college.edu"
                            className="input-glass"
                            style={{ flex: 1 }}
                          />
                          <Button type="button" size="sm" onClick={addInviteEmail} leftIcon={<UserPlus size={13} />}>Add</Button>
                        </div>
                        <p style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
                          Add up to {(hackathon?.max_team_size ?? 4) - 1} teammates. They&apos;ll get an invite notification.
                        </p>

                        {inviteEmails.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                            {inviteEmails.map(email => (
                              <motion.div key={email} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                <Mail size={13} color="#818cf8" />
                                <span style={{ fontSize: 13, color: '#c7d2fe', flex: 1 }}>{email}</span>
                                <button onClick={() => setInviteEmails(prev => prev.filter(e => e !== email))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                                  <X size={13} />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
                        <p style={{ fontSize: 12, color: '#fde68a' }}>
                          👑 As team leader, you can also accept/decline join requests from the Team Management page after registering.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!allowSolo && teamMode === 'solo' && (
                  <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', marginTop: 12 }}>
                    <p style={{ fontSize: 13, color: '#f87171' }}>⚠ This hackathon requires a team. Solo participation is not allowed.</p>
                  </div>
                )}
              </div>
            )}

            {/* ══ STEP 3: Confirm ══ */}
            {step === 3 && (
              <div style={{ padding: '32px 36px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={18} color="#34d399" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Confirm Registration</h2>
                    <p style={{ fontSize: 12, color: '#64748b' }}>Review your details before submitting</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
                  {[
                    { label: 'Hackathon', value: hackathon?.title },
                    { label: 'Your Name', value: confirmName },
                    { label: 'College', value: confirmCollege },
                    { label: 'Email', value: profile?.email },
                    { label: 'Mode', value: teamMode === 'solo' ? '👤 Solo' : `👑 Create Team: "${teamName}"` },
                    ...(inviteEmails.length > 0 ? [{ label: 'Inviting', value: inviteEmails.join(', ') }] : []),
                    ...(hackathon?.has_fees ? [{ label: 'Fees', value: hackathon.fees_amount ?? 'Yes — see Payment tab' }] : []),
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', gap: 16, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: 12, color: '#64748b', minWidth: 100 }}>{row.label}</span>
                      <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, flex: 1 }}>{row.value || '—'}</span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <p style={{ fontSize: 12, color: '#a5b4fc' }}>By registering, you agree to follow the hackathon rules and code of conduct.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <Button variant="secondary" onClick={() => { setError(null); step === 1 ? router.push(`/student/hackathons/${hackathonId}`) : setStep(s => s - 1); }} leftIcon={<ArrowLeft size={14} />}>
            {step === 1 ? 'Back' : 'Previous'}
          </Button>
          {step === 1 && <Button onClick={goStep2} rightIcon={<ArrowRight size={14} />}>Verify & Continue</Button>}
          {step === 2 && (
            <Button
              onClick={goStep3}
              disabled={!allowSolo && teamMode === 'solo'}
              rightIcon={teamMode === 'browse_teams' ? <Search size={14} /> : <ArrowRight size={14} />}
            >
              {teamMode === 'browse_teams' ? 'Browse Teams' : 'Continue'}
            </Button>
          )}
          {step === 3 && (
            <Button onClick={handleRegister} isLoading={submitting} leftIcon={<CheckCircle size={14} />}>
              Confirm &amp; Register
            </Button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
