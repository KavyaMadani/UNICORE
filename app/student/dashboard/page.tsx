'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPublicHackathons, getMyRegistrations, getMyCertificates, type Hackathon, type Registration, type Certificate } from '@/lib/db';
import { getMyFullSubmissions, type FullSubmission } from '@/lib/submissions';
import { getInvitesForUser, acceptInvite, declineRequest, type TeamRequest } from '@/lib/teams';
import { supabase } from '@/lib/supabase';
import { Zap, Trophy, Calendar, Award, Loader2, ArrowRight, Upload, FileText, CheckCircle, Bell, Users, Crown, X, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthProvider';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [submissions, setSubmissions] = useState<FullSubmission[]>([]);
  const [invites, setInvites] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);
  const [inviteToast, setInviteToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      const email = session?.user?.email;
      setUserId(uid ?? null);
      setUserEmail(email ?? null);
      if (uid) {
        const [hacks, regs, certs, subs] = await Promise.all([
          getPublicHackathons(),
          getMyRegistrations(uid),
          getMyCertificates(uid),
          getMyFullSubmissions(uid),
        ]);
        setHackathons(hacks);
        setRegistrations(regs);
        setCertificates(certs);
        setSubmissions(subs);

        // Load invites by email
        if (email) {
          const inv = await getInvitesForUser(email);
          setInvites(inv);
        }
      }
      setLoading(false);
    })();
  }, []);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setInviteToast({ msg, type });
    setTimeout(() => setInviteToast(null), 4000);
  };

  const handleAcceptInvite = async (invite: TeamRequest) => {
    if (!userId || !invite.team) return;
    setProcessingInvite(invite.id);
    const { error } = await acceptInvite(invite.id, invite.team_id, invite.team.hackathon_id, userId);
    setProcessingInvite(null);
    if (error) { showToast('Failed: ' + error, 'err'); return; }
    setInvites(prev => prev.filter(i => i.id !== invite.id));
    showToast(`You joined Team ${invite.team?.name ?? ''}! 🎉`);
    // Refresh registrations
    if (userId) {
      const regs = await getMyRegistrations(userId);
      setRegistrations(regs);
    }
  };

  const handleDeclineInvite = async (inviteId: string, teamName?: string) => {
    setProcessingInvite(inviteId);
    await declineRequest(inviteId);
    setProcessingInvite(null);
    setInvites(prev => prev.filter(i => i.id !== inviteId));
    showToast(`Invite from ${teamName ?? 'team'} declined.`);
  };

  const active = hackathons.filter(h => h.status === 'active');
  const upcoming = hackathons.filter(h => h.status === 'upcoming');
  const myActiveRegs = registrations.filter(r => (r.hackathons as Hackathon)?.status === 'active');

  const statItems = [
    { label: 'Registered Events', value: loading ? '—' : registrations.length, icon: <Zap size={20} className="text-indigo-400" />, change: 'All time', dir: 'neutral' as const },
    { label: 'Submissions', value: loading ? '—' : submissions.length, icon: <FileText size={20} className="text-blue-400" />, change: submissions.filter(s => s.status === 'approved').length + ' approved', dir: submissions.filter(s => s.status === 'approved').length > 0 ? 'up' as const : 'neutral' as const },
    { label: 'Certificates', value: loading ? '—' : certificates.length, icon: <Award size={20} className="text-amber-400" />, change: 'Earned', dir: certificates.length > 0 ? 'up' as const : 'neutral' as const },
    { label: 'Live Hackathons', value: loading ? '—' : active.length, icon: <Calendar size={20} className="text-emerald-400" />, change: 'Active now', dir: active.length > 0 ? 'up' as const : 'neutral' as const },
  ];

  return (
    <DashboardLayout title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'Student'} 👋`} subtitle="Your hackathon journey at a glance">

      {/* Toast */}
      <AnimatePresence>
        {inviteToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 24, right: 24, zIndex: 9999,
              padding: '14px 22px', borderRadius: 16, fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 10,
              background: inviteToast.type === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${inviteToast.type === 'ok' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
              color: inviteToast.type === 'ok' ? '#34d399' : '#f87171',
              backdropFilter: 'blur(10px)',
            }}
          >
            {inviteToast.type === 'ok' ? '✓' : '✗'} {inviteToast.msg}
            <button onClick={() => setInviteToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6 }}><X size={13} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        {statItems.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      {/* ── Team Invitations Banner ── */}
      <AnimatePresence>
        {!loading && invites.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: 24 }}>
            <Card style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bell size={16} color="#818cf8" />
                </div>
                <div>
                  <CardTitle>Team Invitations</CardTitle>
                  <CardSubtitle>{invites.length} pending invite{invites.length > 1 ? 's' : ''} from team leaders</CardSubtitle>
                </div>
                <span style={{ marginLeft: 'auto', padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                  {invites.length} new
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {invites.map((invite, i) => (
                  <motion.div key={invite.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(99,102,241,0.15)', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Crown size={18} color="#fbbf24" />
                      </div>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 3 }}>
                          You&apos;re invited to join <span style={{ color: '#a5b4fc' }}>{invite.team?.name ?? 'a team'}</span>
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                          <Users size={11} />
                          <span>Team leader sent an invitation to your email</span>
                          <span style={{ color: '#475569' }}>·</span>
                          <span>{new Date(invite.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        {invite.team?.hackathon_id && (
                          <button
                            onClick={() => router.push(`/student/hackathons/${invite.team?.hackathon_id}`)}
                            style={{ marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontSize: 11, fontWeight: 700, fontFamily: 'inherit', padding: 0 }}
                          >
                            View Hackathon →
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<X size={12} />}
                          isLoading={processingInvite === invite.id}
                          onClick={() => handleDeclineInvite(invite.id, invite.team?.name)}
                          style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<CheckCircle size={12} />}
                          isLoading={processingInvite === invite.id}
                          onClick={() => handleAcceptInvite(invite)}
                        >
                          Accept & Join
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active hackathon submit banner */}
      <AnimatePresence>
        {!loading && myActiveRegs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: 24 }}>
            <div style={{ padding: '20px 26px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.06))', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 0 4px rgba(52,211,153,0.2)', flexShrink: 0, animation: 'pulse 2s infinite' }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#34d399', marginBottom: 3 }}>
                    🔴 {myActiveRegs.length} live hackathon{myActiveRegs.length > 1 ? 's' : ''} in progress!
                  </p>
                  <p style={{ fontSize: 13, color: '#64748b' }}>
                    {myActiveRegs[0]?.hackathons && (myActiveRegs[0].hackathons as Hackathon).title} — submit your project before it ends.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {myActiveRegs[0]?.hackathon_id && (
                  <Button size="sm" leftIcon={<Upload size={13} />}
                    onClick={() => router.push(`/student/hackathons/${myActiveRegs[0].hackathon_id}/submit`)}>
                    Submit Project
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => router.push('/student/registrations')}>
                  My Registrations
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>

        {/* Available Hackathons */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div><CardTitle>Available Hackathons</CardTitle><CardSubtitle>Register now</CardSubtitle></div>
            <Button size="sm" onClick={() => router.push('/student/hackathons')}>Browse All</Button>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, gap: 10, color: '#64748b' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
            </div>
          ) : hackathons.filter(h => h.status !== 'ended').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <Zap size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontSize: 14 }}>No hackathons available right now.</p>
              <p style={{ fontSize: 12, marginTop: 6 }}>Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hackathons.filter(h => h.status !== 'ended').slice(0, 5).map((h, i) => (
                <motion.div key={h.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => router.push(`/student/hackathons/${h.id}`)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: h.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Zap size={16} color={h.status === 'active' ? '#34d399' : '#818cf8'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Badge variant={h.status} dot={h.status === 'active'}>{h.status}</Badge>
                        {h.college && <span style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.college}</span>}
                      </div>
                    </div>
                    <ArrowRight size={14} color="#475569" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Certificates */}
        <Card>
          <div style={{ marginBottom: 24 }}>
            <CardTitle>My Certificates</CardTitle>
            <CardSubtitle>Your achievements</CardSubtitle>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100 }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#64748b' }} />
            </div>
          ) : certificates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
              <Award size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>No certificates yet.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Participate to earn!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {certificates.slice(0, 4).map(cert => (
                <div key={cert.id} style={{ padding: '11px 14px', borderRadius: 12, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#fde68a', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.hackathon_title}</p>
                  <p style={{ fontSize: 11, color: '#64748b' }}>{cert.achievement}</p>
                </div>
              ))}
              {certificates.length > 4 && (
                <button onClick={() => router.push('/student/certificates')} style={{ fontSize: 12, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '6px 0', textAlign: 'left' }}>
                  View all {certificates.length} →
                </button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Submissions */}
      {!loading && submissions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div><CardTitle>Recent Submissions</CardTitle><CardSubtitle>Track your project status</CardSubtitle></div>
              <Button size="sm" variant="secondary" onClick={() => router.push('/student/submissions')}>View All</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {submissions.slice(0, 3).map((sub, i) => {
                const statusCfg = {
                  submitted:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  label: 'Submitted' },
                  reviewed:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  label: 'Under Review' },
                  approved:     { color: '#34d399', bg: 'rgba(16,185,129,0.1)',  label: 'Approved' },
                  disqualified: { color: '#f87171', bg: 'rgba(239,68,68,0.1)',   label: 'Disqualified' },
                }[sub.status] ?? { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: sub.status };
                return (
                  <motion.div key={sub.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}
                      onClick={() => router.push('/student/submissions')}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: statusCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {sub.status === 'approved' ? <CheckCircle size={16} color={statusCfg.color} /> : <FileText size={16} color={statusCfg.color} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.project_title}</p>
                        <p style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.hackathon_title}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {sub.score != null && <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>⭐ {sub.score}/10</span>}
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: statusCfg.bg, color: statusCfg.color }}>{statusCfg.label}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      {!loading && myActiveRegs.length === 0 && submissions.length === 0 && invites.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card style={{ background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={22} color="#818cf8" />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Ready to compete?</p>
                  <p style={{ fontSize: 13, color: '#64748b' }}>Browse {active.length > 0 ? `${active.length} live` : upcoming.length > 0 ? `${upcoming.length} upcoming` : ''} hackathons and register today.</p>
                </div>
              </div>
              <Button onClick={() => router.push('/student/hackathons')} rightIcon={<ArrowRight size={14} />}>Browse Hackathons</Button>
            </div>
          </Card>
        </motion.div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 4px rgba(52,211,153,0.2); } 50% { box-shadow: 0 0 0 8px rgba(52,211,153,0.05); } }
      `}</style>
    </DashboardLayout>
  );
}
