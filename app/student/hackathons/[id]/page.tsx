'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { getHackathonById, isRegistered, type Hackathon } from '@/lib/db';
import {
  getTeamsForHackathon, sendJoinRequest, getUserTeam, getUserRequestStatus,
  type Team
} from '@/lib/teams';
import { useRouter, useParams } from 'next/navigation';
import {
  Calendar, Users, Trophy, School, Clock, ChevronRight,
  FileCode2, FileText, Globe, Presentation, Upload as UploadIcon,
  File, CreditCard, ArrowLeft, CheckCircle, ExternalLink, Shield,
  Crown, Lock, UserCheck, Send, X, Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const SUBMISSION_TYPE_ICONS: Record<string, React.ReactNode> = {
  github: <FileCode2 size={14} />,
  pdf: <FileText size={14} />,
  ppt: <Presentation size={14} />,
  website: <Globe size={14} />,
  video: <UploadIcon size={14} />,
  zip: <File size={14} />,
};

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  github: 'GitHub Repository',
  pdf: 'PDF Document',
  ppt: 'PPT / Slides',
  website: 'Website / Demo URL',
  video: 'Video Demo',
  zip: 'ZIP Archive',
};

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'prizes' | 'rules' | 'payment' | 'teams'>('overview');

  // Teams tab state
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [requestStatuses, setRequestStatuses] = useState<Record<string, string>>({}); // teamId → status
  const [joinModal, setJoinModal] = useState<{ team: Team } | null>(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  const loadTeams = useCallback(async (hackathonId: string, uid: string | null) => {
    setTeamsLoading(true);
    const data = await getTeamsForHackathon(hackathonId);
    setTeams(data);
    if (uid) {
      const userT = await getUserTeam(hackathonId, uid);
      setMyTeam(userT);
      // Load request status for each team
      const statusMap: Record<string, string> = {};
      await Promise.all(data.map(async t => {
        statusMap[t.id] = await getUserRequestStatus(t.id, uid);
      }));
      setRequestStatuses(statusMap);
    }
    setTeamsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      setUserEmail(session?.user?.email ?? null);

      const h = await getHackathonById(id);
      setHackathon(h);

      if (uid && h) {
        const reg = await isRegistered(uid, h.id);
        setAlreadyRegistered(reg);
      }
      setLoading(false);
    })();
  }, [id]);

  // Load teams when teams tab is activated
  useEffect(() => {
    if (activeTab === 'teams' && hackathon) {
      loadTeams(hackathon.id, userId);
    }
  }, [activeTab, hackathon, userId, loadTeams]);

  const handleJoinRequest = async () => {
    if (!joinModal || !userId) return;
    setJoining(true);
    const { error } = await sendJoinRequest(joinModal.team.id, userId, joinMessage || undefined);
    setJoining(false);
    if (error) { setJoinSuccess('error:' + error); return; }
    setJoinSuccess('ok');
    setRequestStatuses(prev => ({ ...prev, [joinModal.team.id]: 'pending' }));
    setTimeout(() => { setJoinModal(null); setJoinSuccess(null); setJoinMessage(''); }, 2000);
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </DashboardLayout>
    );
  }

  if (!hackathon) {
    return (
      <DashboardLayout title="Not Found">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 20 }}>Hackathon not found.</p>
          <Button onClick={() => router.push('/student/hackathons')}>Browse Hackathons</Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    upcoming: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8' },
    active:   { bg: 'rgba(16,185,129,0.1)', color: '#34d399' },
    ended:    { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
  };
  const sc = statusColors[hackathon.status] ?? statusColors.upcoming;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'prizes',   label: 'Prizes' },
    { id: 'rules',    label: 'Rules' },
    ...(hackathon.has_fees ? [{ id: 'payment', label: '💳 Payment' }] : []),
    ...((hackathon.max_team_size ?? 1) > 1 ? [{ id: 'teams', label: '👥 Teams' }] : []),
  ];

  return (
    <DashboardLayout
      title={hackathon.title}
      subtitle={hackathon.subtitle}
      actions={
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/student/hackathons')}>
          Back
        </Button>
      }
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Header Banner ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '36px 40px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.08) 100%)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>

          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.05)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {hackathon.status}
                </span>
                {hackathon.is_featured && (
                  <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>⭐ Featured</span>
                )}
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.2 }}>{hackathon.title}</h1>
              <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 20 }}>{hackathon.subtitle}</p>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {hackathon.college && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                    <School size={13} /> {hackathon.college}
                  </div>
                )}
                {hackathon.start_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                    <Calendar size={13} /> {formatDate(hackathon.start_date)}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                  <Users size={13} /> Team: {hackathon.min_team_size}–{hackathon.max_team_size}
                  {hackathon.allow_solo && <span style={{ fontSize: 11, color: '#475569', marginLeft: 4 }}>(Solo ok)</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                  <Users size={13} /> {hackathon.participant_count ?? 0} registered
                </div>
              </div>

              {hackathon.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                  {hackathon.tags.map(tag => (
                    <span key={tag} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minWidth: 180 }}>
              {hackathon.prize_pool && (
                <div style={{ textAlign: 'center', padding: '16px 24px', borderRadius: 16, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Prize Pool</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24' }}>{hackathon.prize_pool}</p>
                </div>
              )}
              {alreadyRegistered ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700, fontSize: 14 }}>
                    <CheckCircle size={16} /> Registered!
                  </div>
                </div>
              ) : hackathon.status === 'ended' ? (
                <Button disabled variant="secondary">Event Ended</Button>
              ) : (
                <Button onClick={() => router.push(`/student/hackathons/${hackathon.id}/register`)} rightIcon={<ChevronRight size={14} />} size="lg">
                  Register Now
                </Button>
              )}
              {hackathon.registration_deadline && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
                  <Clock size={11} /> Deadline: {formatDate(hackathon.registration_deadline)}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{ padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s', background: activeTab === tab.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', color: activeTab === tab.id ? '#a5b4fc' : '#64748b', borderBottom: activeTab === tab.id ? '2px solid #818cf8' : '2px solid transparent' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Description */}
              <div style={{ padding: '28px 32px', borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 14 }}>About This Hackathon</h3>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{hackathon.description}</p>
              </div>

              {/* Timeline */}
              {hackathon.timeline?.length > 0 && (
                <div style={{ padding: '28px 32px', borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 20 }}>Timeline</h3>
                  <div style={{ position: 'relative', paddingLeft: 24 }}>
                    <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.07)' }} />
                    {hackathon.timeline.map((ev, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, position: 'relative' }}>
                        <div style={{ position: 'absolute', left: -24, width: 14, height: 14, borderRadius: '50%', background: ev.done ? '#34d399' : 'rgba(99,102,241,0.3)', border: `2px solid ${ev.done ? '#34d399' : 'rgba(99,102,241,0.5)'}`, flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: ev.done ? '#34d399' : '#e2e8f0' }}>{ev.label}</p>
                          <p style={{ fontSize: 12, color: '#64748b' }}>{ev.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Types */}
              {hackathon.submission_types?.length > 0 && (
                <div style={{ padding: '28px 32px', borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 16 }}>Accepted Submissions</h3>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {hackathon.submission_types.map(type => (
                      <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <span style={{ color: '#818cf8' }}>{SUBMISSION_TYPE_ICONS[type] ?? <FileText size={14} />}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc' }}>{SUBMISSION_TYPE_LABELS[type] ?? type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Form */}
              {hackathon.has_custom_form && hackathon.custom_form_url && (
                <div style={{ padding: '20px 24px', borderRadius: 16, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fbbf24', marginBottom: 8 }}>📝 Custom Registration Form Required</h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>You must also fill out this form as part of registration.</p>
                  <a href={hackathon.custom_form_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" rightIcon={<ExternalLink size={12} />}>Open Form</Button>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Prizes */}
          {activeTab === 'prizes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {(hackathon.prizes ?? []).map((prize, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <div style={{ padding: '28px 24px', borderRadius: 20, background: i === 0 ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.025)', border: `1px solid ${i === 0 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.07)'}`, textAlign: 'center' }}>
                    <p style={{ fontSize: 28, marginBottom: 8 }}>{['🥇', '🥈', '🥉'][i] ?? '🏆'}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>{prize.rank}</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: i === 0 ? '#fbbf24' : '#f1f5f9' }}>{prize.amount}</p>
                    {prize.description && <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>{prize.description}</p>}
                  </div>
                </motion.div>
              ))}
              {(!hackathon.prizes || hackathon.prizes.length === 0) && (
                <p style={{ color: '#64748b', fontSize: 14 }}>Prize details not announced yet.</p>
              )}
            </div>
          )}

          {/* Rules */}
          {activeTab === 'rules' && (
            <div style={{ padding: '28px 32px', borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Shield size={18} color="#818cf8" />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>Rules & Guidelines</h3>
              </div>
              {hackathon.rules?.length > 0 ? (
                <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {hackathon.rules.map((rule, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#818cf8', flexShrink: 0 }}>{i + 1}</span>
                      <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>{rule}</p>
                    </motion.li>
                  ))}
                </ol>
              ) : (
                <p style={{ color: '#64748b', fontSize: 14 }}>No specific rules added. Follow standard hackathon etiquette.</p>
              )}
            </div>
          )}

          {/* Payment */}
          {activeTab === 'payment' && hackathon.has_fees && (
            <div style={{ padding: '32px', borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', maxWidth: 480 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <CreditCard size={18} color="#818cf8" />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>Registration Fee</h3>
              </div>
              <div style={{ padding: '20px 24px', borderRadius: 16, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: 24, textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Fee Amount</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#fbbf24' }}>{hackathon.fees_amount ?? 'TBD'}</p>
              </div>
              {hackathon.upi_id && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>UPI ID</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>{hackathon.upi_id}</p>
                  </div>
                </div>
              )}
              {hackathon.payment_qr_url && (
                <div>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Scan QR to Pay</p>
                  <img src={hackathon.payment_qr_url} alt="Payment QR" style={{ width: 200, height: 200, objectFit: 'contain', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'white', padding: 12 }} />
                </div>
              )}
              <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                <p style={{ fontSize: 13, color: '#fde68a' }}>⚠ Pay before registering. Keep your payment screenshot for verification.</p>
              </div>
            </div>
          )}

          {/* ── Teams Tab ── */}
          {activeTab === 'teams' && (
            <div>
              {/* My team banner */}
              {myTeam && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '18px 24px', borderRadius: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <CheckCircle size={18} color="#34d399" />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#34d399' }}>You&apos;re on Team: {myTeam.name}</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>
                      {myTeam.leader_id === userId ? '👑 You are the team leader' : '👤 Team member'}
                    </p>
                  </div>
                  {myTeam.leader_id === userId && (
                    <Button size="sm" onClick={() => router.push(`/student/hackathons/${hackathon.id}/my-team`)}>
                      Manage Team
                    </Button>
                  )}
                </motion.div>
              )}

              {teamsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
                  <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading teams…
                </div>
              ) : teams.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Users size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#475569', marginBottom: 6 }}>No teams yet</p>
                  <p style={{ fontSize: 13, color: '#475569' }}>Be the first — register and create your team!</p>
                  {!alreadyRegistered && hackathon.status !== 'ended' && (
                    <Button style={{ marginTop: 16 }} onClick={() => router.push(`/student/hackathons/${hackathon.id}/register`)}>
                      Create a Team
                    </Button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {teams.map((team, i) => {
                    const isMine = myTeam?.id === team.id;
                    const isFull = team.is_full;
                    const reqStatus = requestStatuses[team.id] ?? 'none';
                    const spotsLeft = team.max_size - (team.member_count ?? 0);

                    return (
                      <motion.div key={team.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <div style={{
                          padding: '24px', borderRadius: 20,
                          background: isMine ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.025)',
                          border: `1px solid ${isMine ? 'rgba(16,185,129,0.25)' : isFull ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.15)'}`,
                          opacity: isFull && !isMine ? 0.7 : 1,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div>
                              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{team.name}</h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                                <Crown size={11} color="#fbbf24" />
                                <span>{team.leader?.name ?? 'Leader'}</span>
                              </div>
                            </div>
                            <span style={{
                              padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                              background: isFull ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                              color: isFull ? '#f87171' : '#34d399',
                              display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                              {isFull ? <><Lock size={10} /> Full</> : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} open`}
                            </span>
                          </div>

                          {/* Member bar */}
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', marginBottom: 6 }}>
                              <span>Members</span>
                              <span>{team.member_count ?? 0} / {team.max_size}</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.round(((team.member_count ?? 0) / team.max_size) * 100)}%`, background: isFull ? '#ef4444' : '#34d399', borderRadius: 99, transition: 'width 0.5s' }} />
                            </div>
                          </div>

                          {/* Action */}
                          {isMine ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontSize: 12, fontWeight: 700 }}>
                              <UserCheck size={14} /> Your Team
                            </div>
                          ) : !userId ? (
                            <Button size="sm" variant="secondary" onClick={() => router.push('/signin')}>Sign in to join</Button>
                          ) : myTeam ? (
                            <span style={{ fontSize: 12, color: '#475569' }}>You&apos;re already on a team</span>
                          ) : isFull ? (
                            <span style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}><Lock size={11} /> Team is full</span>
                          ) : reqStatus === 'pending' ? (
                            <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>⏳ Request pending…</span>
                          ) : reqStatus === 'accepted' ? (
                            <span style={{ fontSize: 12, color: '#34d399', fontWeight: 700 }}>✓ Request accepted!</span>
                          ) : (
                            <Button size="sm" onClick={() => setJoinModal({ team })} leftIcon={<Send size={12} />}>
                              Request to Join
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 12, color: '#475569' }}>
                  💡 Don&apos;t see an open team? <button onClick={() => router.push(`/student/hackathons/${hackathon.id}/register`)} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Create your own team</button> and invite friends.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Join Request Modal ── */}
        <AnimatePresence>
          {joinModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
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

                {joinSuccess === 'ok' ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <CheckCircle size={40} color="#34d399" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#34d399' }}>Request sent!</p>
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
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Message to Leader (optional)</label>
                      <textarea
                        value={joinMessage}
                        onChange={e => setJoinMessage(e.target.value)}
                        placeholder="e.g. Hi! I&apos;m a full-stack developer. Would love to join your team!"
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

        {/* ── Bottom Register CTA ── */}
        {!alreadyRegistered && hackathon.status !== 'ended' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ marginTop: 36, padding: '28px 36px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(59,130,246,0.06) 100%)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Ready to join?</h3>
              <p style={{ fontSize: 13, color: '#64748b' }}>Secure your spot before the deadline closes.</p>
            </div>
            <Button onClick={() => router.push(`/student/hackathons/${hackathon.id}/register`)} size="lg" rightIcon={<ChevronRight size={16} />}>
              Register Now
            </Button>
          </motion.div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}

