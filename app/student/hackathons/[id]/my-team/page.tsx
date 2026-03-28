'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { getHackathonById, type Hackathon } from '@/lib/db';
import {
  getUserTeam, getTeamMembers, getJoinRequestsForLeader,
  acceptJoinRequest, declineRequest,
  type Team, type TeamMember, type TeamRequest
} from '@/lib/teams';
import { useRouter, useParams } from 'next/navigation';
import {
  Crown, Users, CheckCircle, X, ArrowLeft, Loader2,
  Mail, Clock, UserCheck, Shield, Send
} from 'lucide-react';

export default function MyTeamPage() {
  const params = useParams();
  const router = useRouter();
  const hackathonId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/signin'); return; }
      const uid = session.user.id;
      setUserId(uid);

      const [h, team] = await Promise.all([
        getHackathonById(hackathonId),
        getUserTeam(hackathonId, uid),
      ]);

      setHackathon(h);
      setMyTeam(team);

      if (!team) { setLoading(false); return; }

      const leader = team.leader_id === uid;
      setIsLeader(leader);

      const [mems, reqs] = await Promise.all([
        getTeamMembers(team.id),
        leader ? getJoinRequestsForLeader(uid, hackathonId) : Promise.resolve([]),
      ]);
      setMembers(mems);
      setRequests(reqs);
      setLoading(false);
    })();
  }, [hackathonId, router]);

  const handleAccept = async (req: TeamRequest) => {
    if (!req.user_id || !myTeam) return;
    setProcessingId(req.id);
    const { error } = await acceptJoinRequest(req.id, myTeam.id, hackathonId, req.user_id);
    setProcessingId(null);
    if (error) { showToast(error, 'err'); return; }
    showToast(`${req.requester?.name ?? 'User'} added to team!`);
    setRequests(prev => prev.filter(r => r.id !== req.id));
    // Refresh members
    const updated = await getTeamMembers(myTeam.id);
    setMembers(updated);
    // Update myTeam member count
    setMyTeam(prev => prev ? { ...prev, member_count: (prev.member_count ?? 0) + 1 } : prev);
  };

  const handleDecline = async (reqId: string) => {
    setProcessingId(reqId);
    await declineRequest(reqId);
    setProcessingId(null);
    setRequests(prev => prev.filter(r => r.id !== reqId));
    showToast('Request declined.');
  };

  if (loading) {
    return (
      <DashboardLayout title="My Team">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Loader2 size={28} color="#818cf8" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      </DashboardLayout>
    );
  }

  if (!myTeam) {
    return (
      <DashboardLayout title="My Team">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 20 }}>You&apos;re not on a team for this hackathon.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button onClick={() => router.push(`/student/hackathons/${hackathonId}/register`)}>Register & Create Team</Button>
            <Button variant="secondary" onClick={() => router.push(`/student/hackathons/${hackathonId}`)}>Back to Hackathon</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const spotsLeft = myTeam.max_size - (myTeam.member_count ?? members.length);

  return (
    <DashboardLayout
      title="My Team"
      subtitle={hackathon?.title ?? hackathonId}
      actions={
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}
          onClick={() => router.push(`/student/hackathons/${hackathonId}`)}>
          Back to Hackathon
        </Button>
      }
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, padding: '12px 20px', borderRadius: 14, fontWeight: 700, fontSize: 14,
              background: toast.type === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${toast.type === 'ok' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
              color: toast.type === 'ok' ? '#34d399' : '#f87171' }}>
            {toast.type === 'ok' ? '✓ ' : '✗ '}{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Team Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '32px 36px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(59,130,246,0.06))', border: '1px solid rgba(99,102,241,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isLeader ? <Crown size={20} color="#fbbf24" /> : <Users size={20} color="#818cf8" />}
                </div>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9' }}>{myTeam.name}</h1>
                  <p style={{ fontSize: 12, color: isLeader ? '#fbbf24' : '#94a3b8' }}>
                    {isLeader ? '👑 You are the team leader' : '👤 Team member'}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '14px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9' }}>{members.length}<span style={{ fontSize: 14, color: '#64748b', fontWeight: 400 }}> / {myTeam.max_size}</span></p>
              <p style={{ fontSize: 11, color: '#64748b' }}>members</p>
              {spotsLeft > 0 && <p style={{ fontSize: 11, color: '#34d399', marginTop: 4 }}>{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</p>}
              {spotsLeft === 0 && <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>Team full</p>}
            </div>
          </div>
        </motion.div>

        {/* ── Members List ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 20 }}>Team Members</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {members.map((member, i) => (
              <motion.div key={member.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: member.role === 'leader' ? 'rgba(251,191,36,0.12)' : 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {member.role === 'leader' ? <Crown size={16} color="#fbbf24" /> : <UserCheck size={16} color="#818cf8" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
                    {member.profile?.name ?? 'Unknown'}
                    {member.user_id === userId && <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>(you)</span>}
                  </p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{member.profile?.email}</p>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                  background: member.role === 'leader' ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.08)',
                  color: member.role === 'leader' ? '#fbbf24' : '#818cf8' }}>
                  {member.role === 'leader' ? '👑 Leader' : 'Member'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Join Requests (leader only) ── */}
        {isLeader && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Send size={16} color="#818cf8" />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>
                Join Requests
                {requests.length > 0 && (
                  <span style={{ marginLeft: 10, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>{requests.length}</span>
                )}
              </h2>
            </div>

            {requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Shield size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                <p style={{ fontSize: 14, color: '#475569' }}>No pending join requests</p>
                <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Students can find your team and request to join from the Teams tab.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {requests.map(req => (
                  <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '18px 20px', borderRadius: 16, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 16 }}>👤</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>
                          {req.requester?.name ?? 'Unknown'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b', marginBottom: req.message ? 8 : 0 }}>
                          <Mail size={11} /> {req.requester?.email}
                        </div>
                        {req.message && (
                          <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}>
                            <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>&quot;{req.message}&quot;</p>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#475569', marginTop: 8 }}>
                          <Clock size={10} /> {new Date(req.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {spotsLeft > 0 ? (
                          <Button size="sm" onClick={() => handleAccept(req)} isLoading={processingId === req.id} leftIcon={<CheckCircle size={12} />}>
                            Accept
                          </Button>
                        ) : (
                          <span style={{ fontSize: 12, color: '#f87171', padding: '6px 12px' }}>Team full</span>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => handleDecline(req.id)} isLoading={processingId === req.id} leftIcon={<X size={12} />}>
                          Decline
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Info box ── */}
        <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
          <strong style={{ color: '#94a3b8' }}>How team joining works:</strong>
          <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
            <li>Students browse the Teams tab → click &quot;Request to Join&quot; any open team.</li>
            <li>As leader, you review requests here and Accept or Decline them.</li>
            <li>Accepted members are automatically registered for the hackathon.</li>
            <li>You can also invite teammates directly by email during registration.</li>
          </ul>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
