'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { getHackathonById, type Hackathon } from '@/lib/db';
import {
  getUserTeam, getTeamMembers, getJoinRequestsForLeader,
  acceptJoinRequest, declineRequest, removeMember, leaveTeam,
  updateTeamName, sendInvites,
  type Team, type TeamMember, type TeamRequest
} from '@/lib/teams';
import { useRouter, useParams } from 'next/navigation';
import {
  Crown, Users, CheckCircle, X, ArrowLeft, Loader2,
  Mail, Clock, UserCheck, Shield, Send, Edit3, Trash2,
  UserMinus, UserPlus, Save, AlertTriangle, LogOut, Copy
} from 'lucide-react';

// ── Toast helper ──────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: 'ok' | 'err'; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        position: 'fixed', top: 24, right: 24, zIndex: 9999,
        padding: '14px 22px', borderRadius: 16, fontWeight: 700, fontSize: 14,
        display: 'flex', alignItems: 'center', gap: 10,
        background: type === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        border: `1px solid ${type === 'ok' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
        color: type === 'ok' ? '#34d399' : '#f87171',
        backdropFilter: 'blur(10px)',
        boxShadow: `0 8px 32px ${type === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
      }}>
      <span>{type === 'ok' ? '✓' : '✗'}</span>
      {msg}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: 4, opacity: 0.6 }}><X size={13} /></button>
    </motion.div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ title, body, confirmLabel, onConfirm, onCancel, danger = true }:
  { title: string; body: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{ width: '100%', maxWidth: 400, padding: '32px', borderRadius: 24, background: '#0f1629', border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {danger ? <AlertTriangle size={18} color="#f87171" /> : <Shield size={18} color="#818cf8" />}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>{title}</h3>
        </div>
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>{body}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button>
          <Button onClick={onConfirm} style={{ flex: 1, background: danger ? 'rgba(239,68,68,0.15)' : undefined, borderColor: danger ? 'rgba(239,68,68,0.4)' : undefined, color: danger ? '#f87171' : undefined }}>
            {confirmLabel}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

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

  // Edit team name
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Invite by email
  const [inviteInput, setInviteInput] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  // Confirm modals
  const [confirmRemove, setConfirmRemove] = useState<TeamMember | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  // Active tab for leader
  const [activeTab, setActiveTab] = useState<'members' | 'requests' | 'invite'>('members');

  // Registration deadline status
  const regDeadlinePassed = hackathon?.registration_deadline
    ? new Date(hackathon.registration_deadline) < new Date()
    : false;

  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async (uid: string) => {
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
    setNewName(team.name);
    setLoading(false);
  }, [hackathonId]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/signin'); return; }
      setUserId(session.user.id);
      await loadData(session.user.id);
    })();
  }, [hackathonId, router, loadData]);

  const handleAccept = async (req: TeamRequest) => {
    if (!req.user_id || !myTeam) return;
    setProcessingId(req.id);
    const { error } = await acceptJoinRequest(req.id, myTeam.id, hackathonId, req.user_id);
    setProcessingId(null);
    if (error) { showToast(error, 'err'); return; }
    showToast(`${req.requester?.name ?? 'User'} added to team! 🎉`);
    setRequests(prev => prev.filter(r => r.id !== req.id));
    const updated = await getTeamMembers(myTeam.id);
    setMembers(updated);
    setMyTeam(prev => prev ? { ...prev, member_count: (prev.member_count ?? 0) + 1 } : prev);
  };

  const handleDecline = async (reqId: string) => {
    setProcessingId(reqId);
    await declineRequest(reqId);
    setProcessingId(null);
    setRequests(prev => prev.filter(r => r.id !== reqId));
    showToast('Request declined.');
  };

  const handleSaveName = async () => {
    if (!myTeam || !newName.trim()) return;
    if (newName.trim() === myTeam.name) { setEditingName(false); return; }
    setSavingName(true);
    const { error } = await updateTeamName(myTeam.id, newName.trim());
    setSavingName(false);
    if (error) { showToast('Failed to update name: ' + error, 'err'); return; }
    setMyTeam(prev => prev ? { ...prev, name: newName.trim() } : prev);
    setEditingName(false);
    showToast('Team name updated! ✨');
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!myTeam) return;
    setProcessingId(member.id);
    const { error } = await removeMember(member.id, member.user_id, hackathonId);
    setProcessingId(null);
    setConfirmRemove(null);
    if (error) { showToast('Failed to remove member: ' + error, 'err'); return; }
    showToast(`${member.profile?.name ?? 'Member'} removed from team.`);
    setMembers(prev => prev.filter(m => m.id !== member.id));
    setMyTeam(prev => prev ? { ...prev, member_count: Math.max(0, (prev.member_count ?? 1) - 1) } : prev);
  };

  const handleLeave = async () => {
    if (!myTeam || !userId) return;
    setProcessingId('leave');
    const { error } = await leaveTeam(myTeam.id, userId, hackathonId);
    setProcessingId(null);
    setConfirmLeave(false);
    if (error) { showToast('Failed to leave team: ' + error, 'err'); return; }
    showToast('You have left the team.');
    setTimeout(() => router.push(`/student/hackathons/${hackathonId}`), 1500);
  };

  const handleSendInvite = async () => {
    const email = inviteInput.trim().toLowerCase();
    if (!email || !email.includes('@') || !myTeam) return;
    setSendingInvite(true);
    const { error } = await sendInvites(myTeam.id, userId!, [email]);
    setSendingInvite(false);
    if (error) { showToast('Failed to send invite: ' + error, 'err'); return; }
    setInviteInput('');
    showToast(`Invite sent to ${email}! 📧`);
  };

  const copyTeamLink = () => {
    const url = `${window.location.origin}/student/hackathons/${hackathonId}`;
    navigator.clipboard.writeText(url).then(() => showToast('Team link copied! 🔗'));
  };

  // ── Loading ──
  if (loading) {
    return (
      <DashboardLayout title="My Team">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, flexDirection: 'column' }}>
          <Loader2 size={32} color="#818cf8" style={{ animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 13, color: '#64748b' }}>Loading your team…</p>
        </div>
      </DashboardLayout>
    );
  }

  // ── Not on a team ──
  if (!myTeam) {
    return (
      <DashboardLayout title="My Team">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '80px 40px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Users size={32} color="#818cf8" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', marginBottom: 10 }}>Not on a Team</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
            You haven&apos;t joined a team for this hackathon yet. Register to create a team or browse existing teams.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button onClick={() => router.push(`/student/hackathons/${hackathonId}/register`)}>Register &amp; Create Team</Button>
            <Button variant="secondary" onClick={() => router.push(`/student/hackathons/${hackathonId}`)}>Browse Teams</Button>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  const spotsLeft = myTeam.max_size - members.length;
  const isFull = spotsLeft <= 0;
  const pendingCount = requests.length;

  const leaderMember = members.find(m => m.role === 'leader');
  const regularMembers = members.filter(m => m.role !== 'leader');

  return (
    <DashboardLayout
      title={isLeader ? '👑 Manage My Team' : '👥 My Team'}
      subtitle={hackathon?.title ?? hackathonId}
      actions={
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}
          onClick={() => router.push(`/student/hackathons/${hackathonId}`)}>
          Back to Hackathon
        </Button>
      }
    >
      {/* Toast overlay */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Confirm Modals */}
      <AnimatePresence>
        {confirmRemove && (
          <ConfirmModal
            title="Remove Member"
            body={`Remove ${confirmRemove.profile?.name ?? 'this member'} from the team? They'll be unregistered and can rejoin later.`}
            confirmLabel="Remove Member"
            onConfirm={() => handleRemoveMember(confirmRemove)}
            onCancel={() => setConfirmRemove(null)}
          />
        )}
        {confirmLeave && (
          <ConfirmModal
            title="Leave Team"
            body="Are you sure you want to leave this team? You will be unregistered and can rejoin another team later."
            confirmLabel="Leave Team"
            onConfirm={handleLeave}
            onCancel={() => setConfirmLeave(false)}
          />
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 740, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Team Header Card ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '32px 36px', borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(59,130,246,0.06))',
            border: '1px solid rgba(99,102,241,0.25)',
            position: 'relative', overflow: 'hidden'
          }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
            <div style={{ flex: 1 }}>
              {/* Team name with edit */}
              {editingName && isLeader ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditingName(false); setNewName(myTeam.name); } }}
                    autoFocus
                    className="input-glass"
                    style={{ fontSize: 20, fontWeight: 900, padding: '8px 14px', borderRadius: 12, flex: 1, maxWidth: 320 }}
                  />
                  <Button size="sm" onClick={handleSaveName} isLoading={savingName} leftIcon={<Save size={13} />}>Save</Button>
                  <button onClick={() => { setEditingName(false); setNewName(myTeam.name); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}><X size={16} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9' }}>{myTeam.name}</h1>
                  {isLeader && !regDeadlinePassed && (
                    <button onClick={() => { setEditingName(true); setNewName(myTeam.name); }}
                      title="Edit team name"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a5b4fc'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.4)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: isLeader ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.1)', color: isLeader ? '#fbbf24' : '#818cf8' }}>
                  {isLeader ? '👑 Team Leader' : '👤 Member'}
                </span>
                {regDeadlinePassed && (
                  <span style={{ padding: '3px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(100,116,139,0.1)', color: '#64748b' }}>
                    🔒 Registration Closed
                  </span>
                )}
                {!regDeadlinePassed && isFull && (
                  <span style={{ padding: '3px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                    Team Full
                  </span>
                )}
                {!regDeadlinePassed && !isFull && (
                  <span style={{ padding: '3px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                    {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} open
                  </span>
                )}
              </div>
            </div>

            {/* Member count + share */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'center', padding: '16px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9' }}>
                  {members.length}<span style={{ fontSize: 14, color: '#64748b', fontWeight: 400 }}> / {myTeam.max_size}</span>
                </p>
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 0 }}>members</p>
                {/* Progress bar */}
                <div style={{ width: 80, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginTop: 8 }}>
                  <div style={{ height: '100%', width: `${Math.round((members.length / myTeam.max_size) * 100)}%`, background: isFull ? '#ef4444' : '#34d399', borderRadius: 99, transition: 'width 0.5s' }} />
                </div>
              </div>
              <button onClick={copyTeamLink} title="Copy hackathon link to share"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: 12, color: '#64748b', fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a5b4fc'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; }}>
                <Copy size={12} /> Share Link
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Leader tabs ── */}
        {isLeader ? (
          <>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { id: 'members' as const, label: `👥 Members (${members.length})` },
                { id: 'requests' as const, label: `📨 Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}`, pulse: pendingCount > 0 },
                { id: 'invite' as const, label: '✉️ Invite' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{
                    position: 'relative', padding: '10px 20px', borderRadius: 12, border: 'none',
                    cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s', fontFamily: 'inherit',
                    background: activeTab === tab.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    color: activeTab === tab.id ? '#a5b4fc' : '#64748b',
                    borderBottom: activeTab === tab.id ? '2px solid #818cf8' : '2px solid transparent',
                  }}>
                  {tab.label}
                  {tab.pulse && (
                    <span style={{ position: 'absolute', top: 6, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.5s infinite' }} />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

                {/* Members Tab */}
                {activeTab === 'members' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {members.map((member, i) => (
                      <motion.div key={member.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.15s' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: member.role === 'leader' ? 'rgba(251,191,36,0.12)' : 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {member.role === 'leader' ? <Crown size={18} color="#fbbf24" /> : <UserCheck size={18} color="#818cf8" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
                            {member.profile?.name ?? 'Unknown'}
                            {member.user_id === userId && <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>(you)</span>}
                          </p>
                          <p style={{ fontSize: 12, color: '#64748b' }}>{member.profile?.email}</p>
                          {member.profile?.college && <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{member.profile.college}</p>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: member.role === 'leader' ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.08)', color: member.role === 'leader' ? '#fbbf24' : '#818cf8' }}>
                            {member.role === 'leader' ? '👑 Leader' : 'Member'}
                          </span>
                          {/* Only show remove for non-leaders */}
                          {member.role !== 'leader' && !regDeadlinePassed && (
                            <button onClick={() => setConfirmRemove(member)}
                              title="Remove member"
                              style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#475569', transition: 'all 0.15s', display: 'flex', alignItems: 'center' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#475569'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}>
                              <UserMinus size={14} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {/* Empty slots */}
                    {Array.from({ length: spotsLeft }).map((_, i) => (
                      <div key={`slot-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UserPlus size={16} color="#334155" />
                        </div>
                        <p style={{ fontSize: 13, color: '#334155', fontStyle: 'italic' }}>Open slot — waiting for a teammate</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Join Requests Tab */}
                {activeTab === 'requests' && (
                  <div>
                    {regDeadlinePassed && (
                      <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.2)', marginBottom: 16 }}>
                        <p style={{ fontSize: 13, color: '#94a3b8' }}>🔒 Registration has closed. New join requests are no longer accepted.</p>
                      </div>
                    )}
                    {requests.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <Send size={36} style={{ margin: '0 auto 14px', opacity: 0.15 }} />
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#475569', marginBottom: 6 }}>No pending requests</p>
                        <p style={{ fontSize: 13, color: '#334155' }}>Students can find your team in the Teams tab and send join requests.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {requests.map(req => (
                          <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            style={{ padding: '20px 22px', borderRadius: 18, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: 18 }}>👤</span>
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 }}>{req.requester?.name ?? 'Unknown'}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b', marginBottom: req.message ? 10 : 0 }}>
                                  <Mail size={11} /> {req.requester?.email}
                                </div>
                                {req.message && (
                                  <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', marginTop: 8, marginBottom: 6 }}>
                                    <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>&ldquo;{req.message}&rdquo;</p>
                                  </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#475569', marginTop: 6 }}>
                                  <Clock size={10} /> {new Date(req.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                {isFull ? (
                                  <span style={{ fontSize: 12, color: '#f87171', padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>Team full</span>
                                ) : !regDeadlinePassed ? (
                                  <Button size="sm" onClick={() => handleAccept(req)} isLoading={processingId === req.id} leftIcon={<CheckCircle size={13} />}>
                                    Accept
                                  </Button>
                                ) : null}
                                <Button size="sm" variant="secondary" onClick={() => handleDecline(req.id)} isLoading={processingId === req.id} leftIcon={<X size={13} />}>
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Invite Tab */}
                {activeTab === 'invite' && (
                  <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {regDeadlinePassed ? (
                      <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <Shield size={32} style={{ margin: '0 auto 14px', opacity: 0.2 }} />
                        <p style={{ fontSize: 14, color: '#64748b' }}>Registration has closed. Invites can no longer be sent.</p>
                      </div>
                    ) : isFull ? (
                      <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <Users size={32} style={{ margin: '0 auto 14px', opacity: 0.2 }} />
                        <p style={{ fontSize: 14, color: '#64748b' }}>Team is full. Remove a member to invite someone new.</p>
                      </div>
                    ) : (
                      <>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Invite by Email</h3>
                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
                          Send an invitation. They&apos;ll see it when they log in and can accept to join your team.
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><Mail size={14} /></span>
                            <input
                              type="email"
                              value={inviteInput}
                              onChange={e => setInviteInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSendInvite(); } }}
                              placeholder="teammate@college.edu"
                              className="input-glass"
                              style={{ paddingLeft: 38, width: '100%' }}
                            />
                          </div>
                          <Button onClick={handleSendInvite} isLoading={sendingInvite} leftIcon={<Send size={13} />} disabled={!inviteInput.trim().includes('@')}>
                            Send Invite
                          </Button>
                        </div>
                        <p style={{ fontSize: 11, color: '#475569' }}>
                          Spots remaining: <strong style={{ color: '#34d399' }}>{spotsLeft}</strong> / {myTeam.max_size}
                        </p>

                        <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 14, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc', marginBottom: 6 }}>💡 Share the hackathon link</p>
                          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
                            Share the hackathon page link with your friends. They can browse teams and send a join request directly to you from the Teams tab.
                          </p>
                          <button onClick={copyTeamLink} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#a5b4fc', fontFamily: 'inherit' }}>
                            <Copy size={12} /> Copy Link
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          // ── Member view (non-leader) ──
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
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: member.role === 'leader' ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.08)', color: member.role === 'leader' ? '#fbbf24' : '#818cf8' }}>
                    {member.role === 'leader' ? '👑 Leader' : 'Member'}
                  </span>
                </motion.div>
              ))}
              {/* Empty slots for non-leader */}
              {Array.from({ length: spotsLeft }).map((_, i) => (
                <div key={`slot-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus size={14} color="#334155" />
                  </div>
                  <p style={{ fontSize: 13, color: '#334155', fontStyle: 'italic' }}>Open slot</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── How It Works ── */}
        <div style={{ padding: '18px 22px', borderRadius: 16, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)', fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
          {isLeader ? (
            <>
              <strong style={{ color: '#94a3b8' }}>👑 Leader Actions:</strong>
              <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                <li>Edit your team name with the ✏️ pencil icon (before deadline).</li>
                <li>Accept or decline join requests from the Requests tab.</li>
                <li>Remove members from the Members tab (before deadline).</li>
                <li>Invite teammates by email from the Invite tab.</li>
                <li>Share the hackathon link so others can find and request to join your team.</li>
              </ul>
            </>
          ) : (
            <>
              <strong style={{ color: '#94a3b8' }}>How team joining works:</strong>
              <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                <li>Your team leader can accept join requests from other students.</li>
                <li>Once accepted, teammates are automatically registered for the hackathon.</li>
                <li>Maximum team size is {myTeam.max_size} members.</li>
              </ul>
            </>
          )}
        </div>

        {/* Leave team (non-leader only) */}
        {!isLeader && !regDeadlinePassed && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setConfirmLeave(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 12, background: 'none', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748b', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}>
              <LogOut size={14} /> Leave Team
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </DashboardLayout>
  );
}
