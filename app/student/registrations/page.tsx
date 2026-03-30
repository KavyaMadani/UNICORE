'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { getMyRegistrations, type Registration, type Hackathon } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';
import {
  Zap, Calendar, School, Users, Loader2,
  Upload, Eye, ChevronRight, CheckCircle, Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function StudentRegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const regs = await getMyRegistrations(session.user.id);
        setRegistrations(regs);
      }
      setLoading(false);
    })();
  }, []);

  const active = registrations.filter(r => (r.hackathons as Hackathon)?.status === 'active');
  const upcoming = registrations.filter(r => (r.hackathons as Hackathon)?.status === 'upcoming');
  const ended = registrations.filter(r => (r.hackathons as Hackathon)?.status === 'ended');

  return (
    <DashboardLayout title="My Registrations" subtitle="Hackathons you have registered for">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 32 }}>
        {[
          { label: 'Total Registered', value: registrations.length, color: '#818cf8', icon: <Zap size={18} color="#818cf8" /> },
          { label: 'Active Now', value: active.length, color: '#34d399', icon: <CheckCircle size={18} color="#34d399" /> },
          { label: 'Upcoming', value: upcoming.length, color: '#60a5fa', icon: <Clock size={18} color="#60a5fa" /> },
          { label: 'Completed', value: ended.length, color: '#64748b', icon: <CheckCircle size={18} color="#64748b" /> },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div style={{ padding: '22px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -18, right: -18, width: 60, height: 60, borderRadius: '50%', background: `${s.color}12`, pointerEvents: 'none' }} />
              <div style={{ marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginBottom: 4 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active hackathon banner — submit CTA */}
      {!loading && active.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: 24, padding: '18px 24px', borderRadius: 18, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 0 4px rgba(52,211,153,0.2)', animation: 'pulse 2s infinite' }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#34d399', marginBottom: 2 }}>
                  🔴 {active.length} hackathon{active.length > 1 ? 's are' : ' is'} live now!
                </p>
                <p style={{ fontSize: 12, color: '#64748b' }}>Submit your project before the event ends.</p>
              </div>
            </div>
            <Button size="sm" leftIcon={<Upload size={13} />} onClick={() => router.push('/student/submissions')}>
              My Submissions
            </Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading registrations…
        </div>
      ) : registrations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
            <Zap size={32} color="#818cf8" />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No registrations yet</p>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Browse hackathons and register for events that interest you.</p>
          <Button onClick={() => router.push('/student/hackathons')} leftIcon={<ChevronRight size={14} />}>Browse Hackathons</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {registrations.map((reg, i) => {
            const hack = reg.hackathons as Hackathon | undefined;
            if (!hack) return null;
            const isActive = hack.status === 'active';
            const isEnded = hack.status === 'ended';

            return (
              <motion.div key={reg.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <div style={{
                  padding: '26px 30px', borderRadius: 22,
                  background: isActive ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
                    {/* Icon */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                      background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.1)',
                      border: `1px solid ${isActive ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Zap size={22} color={isActive ? '#34d399' : '#818cf8'} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9' }}>{hack.title}</h3>
                        <Badge variant={hack.status} dot={hack.status === 'active'}>{hack.status}</Badge>
                      </div>
                      {hack.subtitle && <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>{hack.subtitle}</p>}

                      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 12 }}>
                        {hack.college && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#a5b4fc' }}>
                            <School size={12} /> {hack.college}
                          </div>
                        )}
                        {hack.participant_count !== undefined && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8' }}>
                            <Users size={12} /> {hack.participant_count} participants
                          </div>
                        )}
                        {hack.start_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8' }}>
                            <Calendar size={12} /> {formatDate(hack.start_date)}
                          </div>
                        )}
                        {hack.end_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: isActive ? '#f87171' : '#64748b' }}>
                            <Clock size={12} /> {isActive ? 'Ends: ' : 'Ended: '}{new Date(hack.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#475569' }}>
                          Registered: {new Date(reg.registered_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {reg.team_name && (
                          <span style={{ fontSize: 11, color: '#818cf8', padding: '2px 10px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', fontWeight: 600 }}>
                            👥 {reg.team_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<Eye size={13} />}
                        onClick={() => router.push(`/student/hackathons/${hack.id}`)}
                      >
                        View Details
                      </Button>
                      {isActive && (
                        <Button
                          size="sm"
                          leftIcon={<Upload size={13} />}
                          onClick={() => router.push(`/student/hackathons/${hack.id}/submit`)}
                        >
                          Submit Project
                        </Button>
                      )}
                      {isEnded && (
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Eye size={13} />}
                          onClick={() => router.push('/student/submissions')}
                        >
                          View Submission
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </DashboardLayout>
  );
}
