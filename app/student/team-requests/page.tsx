'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { getInvitesForUser, acceptInvite, declineRequest, getMyJoinRequests, type TeamRequest } from '@/lib/teams';
import { useRouter } from 'next/navigation';
import {
  Bell, Crown, Users, CheckCircle, X, Loader2,
  Clock, Send, Zap, ArrowRight
} from 'lucide-react';

export default function TeamRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<TeamRequest[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/signin'); return; }
      setUserId(session.user.id);
      const inv = await getInvitesForUser(session.user.email ?? '');
      setInvites(inv);
      setLoading(false);
    })();
  }, [router]);

  const handleAccept = async (invite: TeamRequest) => {
    if (!userId || !invite.team) return;
    setProcessingId(invite.id);
    const { error } = await acceptInvite(invite.id, invite.team_id, invite.team.hackathon_id, userId);
    setProcessingId(null);
    if (error) { showToast('Failed: ' + error, 'err'); return; }
    setInvites(prev => prev.filter(i => i.id !== invite.id));
    showToast(`You joined Team "${invite.team?.name}"! 🎉`);
  };

  const handleDecline = async (invite: TeamRequest) => {
    setProcessingId(invite.id);
    await declineRequest(invite.id);
    setProcessingId(null);
    setInvites(prev => prev.filter(i => i.id !== invite.id));
    showToast(`Invite from "${invite.team?.name ?? 'team'}" declined.`);
  };

  return (
    <DashboardLayout title="Team Invitations" subtitle="Manage invitations from team leaders">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 24, right: 24, zIndex: 9999,
              padding: '14px 22px', borderRadius: 16, fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 10,
              background: toast.type === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${toast.type === 'ok' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
              color: toast.type === 'ok' ? '#34d399' : '#f87171',
              backdropFilter: 'blur(10px)',
            }}
          >
            {toast.type === 'ok' ? '✓' : '✗'} {toast.msg}
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6 }}><X size={13} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#64748b' }}>
          <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading invitations…
        </div>
      ) : invites.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '100px 40px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Bell size={36} color="#818cf8" style={{ opacity: 0.5 }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 10 }}>No Pending Invites</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
            When a team leader invites you to join their team, the invitation will appear here. You can also browse hackathons to find teams.
          </p>
          <Button onClick={() => router.push('/student/hackathons')} rightIcon={<ArrowRight size={14} />}>
            Browse Hackathons
          </Button>
        </motion.div>
      ) : (
        <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Count badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ padding: '4px 14px', borderRadius: 99, fontSize: 13, fontWeight: 700, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
              {invites.length} pending invite{invites.length > 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>Accept to join a team and register for the hackathon</span>
          </div>

          {invites.map((invite, i) => (
            <motion.div key={invite.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div style={{
                padding: '28px 32px', borderRadius: 22,
                background: 'rgba(99,102,241,0.04)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap'
              }}>
                {/* Crown icon */}
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Crown size={24} color="#fbbf24" />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
                    Invited to join <span style={{ color: '#a5b4fc' }}>{invite.team?.name ?? 'a team'}</span>
                  </h3>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                      <Users size={11} /> Team invitation
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                      <Clock size={11} /> {new Date(invite.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                      A team leader has invited you to join <strong style={{ color: '#c7d2fe' }}>{invite.team?.name}</strong> for this hackathon. If you accept, you&apos;ll be automatically registered and added to the team.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {invite.team?.hackathon_id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/student/hackathons/${invite.team?.hackathon_id}`)}
                      >
                        View Hackathon
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<X size={13} />}
                      isLoading={processingId === invite.id}
                      onClick={() => handleDecline(invite)}
                      style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<CheckCircle size={13} />}
                      isLoading={processingId === invite.id}
                      onClick={() => handleAccept(invite)}
                    >
                      Accept & Join Team
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Info note */}
          <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)', marginTop: 8 }}>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
              💡 <strong style={{ color: '#94a3b8' }}>How invitations work:</strong> Team leaders can invite you by email. When you accept, you&apos;re automatically added to the team and registered for the hackathon. Declining removes the invitation permanently.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}
