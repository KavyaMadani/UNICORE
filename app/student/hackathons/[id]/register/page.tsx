'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { getHackathonById, isRegistered, type Hackathon } from '@/lib/db';
import {
  createTeam, sendInvites, getTeamsForHackathon, sendJoinRequest,
  getUserRequestStatus, type Team
} from '@/lib/teams';
import { useRouter, useParams } from 'next/navigation';
import {
  CheckCircle, ArrowLeft, ArrowRight, User, Users, School,
  Shield, Loader2, AlertCircle, Crown, UserPlus, X, Mail,
  Search, Lock, Send, Clock, Zap, ChevronRight
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
  const [createdTeam, setCreatedTeam] = useState<{ id: string; name: string } | null>(null);

  // Profile
  const [profile, setProfile] = useState<{ id: string; name: string; email: string; college: string } | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [confirmCollege, setConfirmCollege] = useState('');

  // Team mode
  const [teamMode, setTeamMode] = useState<'solo' | 'create_team' | 'browse_teams'>('solo');
  const [teamName, setTeamName] = useState('');
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteInput, setInviteInput] = useState('');

  // Browse teams inline state
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [requestStatuses, setRequestStatuses] = useState<Record<string, string>>({});
  const [joinModal, setJoinModal] = useState<{ team: Team } | null>(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null); // 'ok' | 'error:msg'
  const [searchQuery, setSearchQuery] = useState('');

  // Load teams for browse mode
  const loadTeams = useCallback(async (hackId: string, uid: string) => {
    setTeamsLoading(true);
    const data = await getTeamsForHackathon(hackId);
    setTeams(data);
    const statusMap: Record<string, string> = {};
    await Promise.all(data.map(async t => {
      statusMap[t.id] = await getUserRequestStatus(t.id, uid);
    }));
    setRequestStatuses(statusMap);
    setTeamsLoading(false);
  }, []);

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

      if (h && !h.allow_solo) setTeamMode('create_team');

      if (h && prof) {
        const already = await isRegistered(prof.id, h.id);
        if (already) { router.replace(`/student/hackathons/${hackathonId}`); return; }
      }
      setLoading(false);
    })();
  }, [hackathonId, router]);

  // Load teams when browse_teams mode selected in step 2
  useEffect(() => {
    if (teamMode === 'browse_teams' && profile && hackathon && step === 2) {
      loadTeams(hackathon.id, profile.id);
    }
  }, [teamMode, profile, hackathon, step, loadTeams]);

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
      // They can still proceed to register solo if they browsed but haven't found a team
      // Just skip — the join request flow handles their participation
      setError(null);
      setStep(3);
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleJoinRequest = async () => {
    if (!joinModal || !profile) return;
    setJoining(true);
    const { error } = await sendJoinRequest(joinModal.team.id, profile.id, joinMessage || undefined);
    setJoining(false);
    if (error) { setJoinSuccess('error:' + error); return; }
    setJoinSuccess('ok');
    setRequestStatuses(prev => ({ ...prev, [joinModal.team.id]: 'pending' }));
    setTimeout(() => { setJoinModal(null); setJoinSuccess(null); setJoinMessage(''); }, 2200);
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
        user_id: profile.id, hackathon_id: hackathon.id, team_name: null,
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
    } else if (teamMode === 'browse_teams') {
      // In browse mode they may have sent a join request — we still register them solo
      // so they can be found, OR they just leave without registering (the request does that on accept)
      // Best UX: tell them they don't need to register — leader accepts = auto-registered
      setSubmitting(false);
      setDone(true);
      return;
    }

    setDone(true);
  };

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.leader?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = Object.values(requestStatuses).filter(s => s === 'pending').length;

  // ── Loading ──
  if (loading) {
    return (
      <DashboardLayout title="Register">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
          <Loader2 size={28} color="#818cf8" style={{ animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13, color: '#64748b' }}>Loading…</span>
        </div>
      </DashboardLayout>
    );
  }

  // ── Success Screen ──
  if (done) {
    return (
      <DashboardLayout title="Registered!">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: 540, margin: '80px auto', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={40} color="#34d399" />
          </div>

          {teamMode === 'browse_teams' ? (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', marginBottom: 8 }}>Request Sent! 📬</h2>
              <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 24 }}>
                Your join request has been sent. Once the team leader accepts it, you&apos;ll be automatically registered for <strong style={{ color: '#e2e8f0' }}>{hackathon?.title}</strong>.
              </p>
              <div style={{ padding: '18px 22px', borderRadius: 16, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 20, textAlign: 'left' }}>
                <p style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 700, marginBottom: 6 }}>📋 What happens next?</p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#64748b', lineHeight: 1.8 }}>
                  <li>The team leader reviews your request.</li>
                  <li>If accepted, you&apos;re automatically registered.</li>
                  <li>You can send requests to multiple teams.</li>
                  <li>Check the Teams tab to see your request status.</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', marginBottom: 8 }}>You&apos;re In! 🎉</h2>
              <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 16 }}>
                Successfully registered for <strong style={{ color: '#e2e8f0' }}>{hackathon?.title}</strong>
              </p>
            </>
          )}

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
                </div>
              )}
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 10 }}>
                Students can also browse your team and send join requests — accept them from your team management page.
              </p>
            </div>
          )}

          {hackathon?.has_fees && teamMode !== 'browse_teams' && (
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
            {teamMode !== 'browse_teams' && (
              <Button variant="ghost" onClick={() => router.push('/student/registrations')}>My Registrations</Button>
            )}
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  const allowSolo = hackathon?.allow_solo !== false;
  const isTeamHackathon = (hackathon?.max_team_size ?? 1) > 1;
  const stepLabels = isTeamHackathon
    ? ['Verify Identity', 'Team Setup', 'Confirm & Register']
    : ['Verify Identity', 'Confirm & Register'];
  const totalSteps = stepLabels.length;

  return (
    <DashboardLayout
      title={`Register: ${hackathon?.title ?? '...'}`}
      subtitle="Complete the steps below to secure your spot"
      actions={<Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/student/hackathons/${hackathonId}`)}>Back</Button>}
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* ── Step Indicator ── */}
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
              {i < totalSteps - 1 && (
                <div style={{ flex: 1, height: 1, background: step > i + 1 ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.07)', margin: '0 10px' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20 }}>
            <AlertCircle size={16} color="#f87171" />
            <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
          </motion.div>
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
            {step === 2 && isTeamHackathon && (
              <div>
                {/* Mode picker */}
                <div style={{ padding: '24px 28px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: allowSolo && isTeamHackathon ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10 }}>
                    {allowSolo && (
                      <button type="button" onClick={() => setTeamMode('solo')}
                        style={{ padding: '20px 14px', borderRadius: 16, border: `2px solid ${teamMode === 'solo' ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, background: teamMode === 'solo' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                        <p style={{ fontSize: 22, marginBottom: 6 }}>👤</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: teamMode === 'solo' ? '#c7d2fe' : '#94a3b8', marginBottom: 2 }}>Go Solo</p>
                        <p style={{ fontSize: 10, color: '#475569' }}>Participate alone</p>
                      </button>
                    )}
                    <button type="button" onClick={() => setTeamMode('create_team')}
                      style={{ padding: '20px 14px', borderRadius: 16, border: `2px solid ${teamMode === 'create_team' ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.08)'}`, background: teamMode === 'create_team' ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                      <p style={{ fontSize: 22, marginBottom: 6 }}>👑</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: teamMode === 'create_team' ? '#fde68a' : '#94a3b8', marginBottom: 2 }}>Create Team</p>
                      <p style={{ fontSize: 10, color: '#475569' }}>You lead</p>
                    </button>
                    <button type="button" onClick={() => setTeamMode('browse_teams')}
                      style={{ padding: '20px 14px', borderRadius: 16, border: `2px solid ${teamMode === 'browse_teams' ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)'}`, background: teamMode === 'browse_teams' ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                      <p style={{ fontSize: 22, marginBottom: 6 }}>🔍</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: teamMode === 'browse_teams' ? '#6ee7b7' : '#94a3b8', marginBottom: 2 }}>Join a Team</p>
                      <p style={{ fontSize: 10, color: '#475569' }}>Browse &amp; request</p>
                    </button>
                  </div>

                  {!allowSolo && teamMode === 'solo' && (
                    <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', marginTop: 12 }}>
                      <p style={{ fontSize: 13, color: '#f87171' }}>⚠ This hackathon requires a team. Solo participation is not allowed.</p>
                    </div>
                  )}
                </div>

                {/* ── Browse Teams Panel ── */}
                <AnimatePresence>
                  {teamMode === 'browse_teams' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <div style={{ padding: '24px 28px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                          <div>
                            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 }}>Open Teams</h3>
                            <p style={{ fontSize: 12, color: '#64748b' }}>Request to join a team — the leader will be notified</p>
                          </div>
                          {pendingRequests > 0 && (
                            <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
                              ⏳ {pendingRequests} pending
                            </span>
                          )}
                        </div>

                        {/* Search */}
                        <div style={{ position: 'relative', marginBottom: 16 }}>
                          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><Search size={14} /></span>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search teams or leaders…"
                            className="input-glass"
                            style={{ paddingLeft: 36 }}
                          />
                        </div>

                        {teamsLoading ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, gap: 10, color: '#64748b' }}>
                            <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} />
                            <span style={{ fontSize: 13 }}>Loading teams…</span>
                          </div>
                        ) : filteredTeams.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '36px 0' }}>
                            <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                            {teams.length === 0 ? (
                              <>
                                <p style={{ fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 4 }}>No teams yet</p>
                                <p style={{ fontSize: 12, color: '#334155' }}>Be the first! Switch to &quot;Create Team&quot; above.</p>
                              </>
                            ) : (
                              <p style={{ fontSize: 14, color: '#475569' }}>No teams match &quot;{searchQuery}&quot;</p>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
                            {filteredTeams.map((team, i) => {
                              const isFull = team.is_full;
                              const reqStatus = requestStatuses[team.id] ?? 'none';
                              const spotsLeft = team.max_size - (team.member_count ?? 0);
                              return (
                                <motion.div key={team.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 16, background: isFull ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isFull ? 'rgba(255,255,255,0.05)' : reqStatus === 'pending' ? 'rgba(251,191,36,0.2)' : reqStatus === 'accepted' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.12)'}`, opacity: isFull ? 0.65 : 1, transition: 'all 0.15s' }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 }}>{team.name}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: 11, color: '#64748b' }}>👑 {team.leader?.name ?? 'Leader'}</span>
                                      <span style={{ fontSize: 11, color: isFull ? '#f87171' : '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                                        {isFull ? <><Lock size={9} /> Full</> : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                                      </span>
                                    </div>
                                    {/* Progress bar */}
                                    <div style={{ width: 100, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginTop: 6 }}>
                                      <div style={{ height: '100%', width: `${Math.round(((team.member_count ?? 0) / team.max_size) * 100)}%`, background: isFull ? '#ef4444' : '#34d399', borderRadius: 99 }} />
                                    </div>
                                    <p style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>{team.member_count ?? 0}/{team.max_size} members</p>
                                  </div>
                                  <div style={{ flexShrink: 0 }}>
                                    {reqStatus === 'pending' ? (
                                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', padding: '6px 12px', borderRadius: 10, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Clock size={10} /> Pending…
                                      </span>
                                    ) : reqStatus === 'accepted' ? (
                                      <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', padding: '6px 12px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <CheckCircle size={10} /> Accepted!
                                      </span>
                                    ) : isFull ? (
                                      <span style={{ fontSize: 11, color: '#475569', padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Lock size={10} /> Full
                                      </span>
                                    ) : (
                                      <Button size="sm" onClick={() => { setJoinModal({ team }); setJoinSuccess(null); setJoinMessage(''); }} leftIcon={<Send size={11} />}>
                                        Request
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}

                        <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
                          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
                            💡 You can request multiple teams. Once a leader accepts, you&apos;ll be automatically registered. Or
                            {' '}<button onClick={() => setTeamMode('create_team')} style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>create your own team</button>.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Create Team Form ── */}
                <AnimatePresence>
                  {teamMode === 'create_team' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <div style={{ padding: '24px 28px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Input id="team-name" label="Team Name *" placeholder="e.g. Team Phoenix" value={teamName} onChange={e => setTeamName(e.target.value)} />

                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                            Invite Teammates by Email <span style={{ color: '#475569', fontWeight: 400 }}>(optional)</span>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                              {inviteEmails.map(email => (
                                <motion.div key={email} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                  <Mail size={13} color="#818cf8" />
                                  <span style={{ fontSize: 13, color: '#c7d2fe', flex: 1 }}>{email}</span>
                                  <button onClick={() => setInviteEmails(prev => prev.filter(e => e !== email))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                                    <X size={13} />
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
                          <p style={{ fontSize: 12, color: '#fde68a' }}>
                            👑 As team leader, you can also accept join requests from the Team Management page after registering. Your team will appear in the Teams tab for others to discover.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ══ STEP 3: Confirm ══ */}
            {((step === 3 && isTeamHackathon) || (step === 2 && !isTeamHackathon)) && (
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

                {teamMode === 'browse_teams' && (
                  <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>📬 Join Request Mode</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                      You&apos;ve browsed teams and sent {pendingRequests} request{pendingRequests !== 1 ? 's' : ''}. Once a leader accepts, you&apos;ll be automatically registered. Clicking &quot;Confirm&quot; will confirm your intent to participate.
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
                  {[
                    { label: 'Hackathon', value: hackathon?.title },
                    { label: 'Your Name', value: confirmName },
                    { label: 'College', value: confirmCollege },
                    { label: 'Email', value: profile?.email },
                    {
                      label: 'Mode', value: teamMode === 'solo' ? '👤 Solo Participation' :
                        teamMode === 'create_team' ? `👑 Create Team: "${teamName}"` :
                          `🔍 Join Request Sent (${pendingRequests} pending)`
                    },
                    ...(inviteEmails.length > 0 ? [{ label: 'Inviting', value: inviteEmails.join(', ') }] : []),
                    ...(hackathon?.has_fees && teamMode !== 'browse_teams' ? [{ label: 'Fees', value: hackathon.fees_amount ?? 'Yes — see Payment tab' }] : []),
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
          {step === 1 && (
            <Button onClick={goStep2} rightIcon={<ArrowRight size={14} />}>
              Verify &amp; Continue
            </Button>
          )}
          {step === 2 && isTeamHackathon && (
            <Button
              onClick={goStep3}
              disabled={!allowSolo && teamMode === 'solo'}
              rightIcon={<ChevronRight size={14} />}
            >
              {teamMode === 'browse_teams' && pendingRequests > 0 ? `Continue (${pendingRequests} sent)` : 'Continue'}
            </Button>
          )}
          {((step === 3 && isTeamHackathon) || (step === 2 && !isTeamHackathon)) && (
            <Button onClick={handleRegister} isLoading={submitting} leftIcon={<CheckCircle size={14} />}>
              {teamMode === 'browse_teams' ? 'Confirm Intent' : 'Confirm & Register'}
            </Button>
          )}
        </div>
      </div>

      {/* ── Join Request Modal ── */}
      <AnimatePresence>
        {joinModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) setJoinModal(null); }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ width: '100%', maxWidth: 440, padding: '32px', borderRadius: 24, background: '#0f1629', border: '1px solid rgba(99,102,241,0.3)' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9' }}>Request to Join</h2>
                  <p style={{ fontSize: 13, color: '#64748b' }}>Team: <strong style={{ color: '#818cf8' }}>{joinModal.team.name}</strong></p>
                </div>
                <button onClick={() => setJoinModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}><X size={18} /></button>
              </div>

              {/* Team info */}
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                  <span>👑 Leader: {joinModal.team.leader?.name ?? 'Unknown'}</span>
                  <span style={{ color: '#34d399' }}>{joinModal.team.max_size - (joinModal.team.member_count ?? 0)} spots left</span>
                </div>
              </div>

              {joinSuccess === 'ok' ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <CheckCircle size={44} color="#34d399" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#34d399' }}>Request sent! 🎉</p>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>The leader will be notified and can accept or decline.</p>
                </div>
              ) : joinSuccess?.startsWith('error:') ? (
                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: '#f87171' }}>{joinSuccess.replace('error:', '')}</p>
                </div>
              ) : null}

              {!joinSuccess && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Message to Leader <span style={{ fontWeight: 400, color: '#475569' }}>(optional)</span></label>
                    <textarea
                      value={joinMessage}
                      onChange={e => setJoinMessage(e.target.value)}
                      placeholder="e.g. Hi! I'm a React developer. Would love to join your team!"
                      rows={3}
                      className="input-glass"
                      style={{ width: '100%', resize: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button variant="secondary" onClick={() => setJoinModal(null)} style={{ flex: 1 }}>Cancel</Button>
                    <Button onClick={handleJoinRequest} isLoading={joining} leftIcon={<Send size={13} />} style={{ flex: 1 }}>
                      Send Request
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
