'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPublicHackathons, getMyRegistrations, getMyCertificates, type Hackathon, type Registration, type Certificate } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { Zap, Trophy, Calendar, Award, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthProvider';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (uid) {
        const [hacks, regs, certs] = await Promise.all([
          getPublicHackathons(),
          getMyRegistrations(uid),
          getMyCertificates(uid),
        ]);
        setHackathons(hacks);
        setRegistrations(regs);
        setCertificates(certs);
      }
      setLoading(false);
    })();
  }, []);

  const active = hackathons.filter(h => h.status === 'active');
  const upcoming = hackathons.filter(h => h.status === 'upcoming');
  const myActiveHackathon = registrations.find(r => (r.hackathons as Hackathon)?.status === 'active');

  const statItems = [
    { label: 'Registered Events', value: loading ? '—' : registrations.length, icon: <Zap size={20} className="text-indigo-400" />, change: 'All time', dir: 'neutral' as const },
    { label: 'Certificates', value: loading ? '—' : certificates.length, icon: <Award size={20} className="text-amber-400" />, change: 'Earned', dir: 'up' as const },
    { label: 'Live Hackathons', value: loading ? '—' : active.length, icon: <Calendar size={20} className="text-emerald-400" />, change: 'Active now', dir: active.length > 0 ? 'up' as const : 'neutral' as const },
    { label: 'Upcoming', value: loading ? '—' : upcoming.length, icon: <Trophy size={20} className="text-blue-400" />, change: 'Coming soon', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'Student'} 👋`} subtitle="Your hackathon journey at a glance">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {statItems.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Active + Upcoming Hackathons */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div><CardTitle>Available Hackathons</CardTitle><CardSubtitle>Register now</CardSubtitle></div>
            <Button size="sm" onClick={() => router.push('/student/hackathons')}>Browse All</Button>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, gap: 10, color: '#64748b' }}><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading…</div>
          ) : hackathons.filter(h => h.status !== 'ended').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <Zap size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontSize: 14 }}>No hackathons available right now.</p>
              <p style={{ fontSize: 12, marginTop: 6 }}>Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {hackathons.filter(h => h.status !== 'ended').slice(0, 5).map((h, i) => (
                <motion.div key={h.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}
                    onClick={() => router.push('/student/hackathons')}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Zap size={17} color="#818cf8" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Badge variant={h.status} dot={h.status === 'active'}>{h.status}</Badge>
                        {h.college && <span style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.college}</span>}
                      </div>
                    </div>
                    <ArrowRight size={16} color="#475569" />
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100 }}><Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#64748b' }} /></div>
          ) : certificates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
              <Award size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>No certificates yet.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Participate to earn!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {certificates.slice(0, 4).map((cert, i) => (
                <div key={cert.id} style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fde68a', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.hackathon_title}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{cert.achievement}</p>
                </div>
              ))}
              {certificates.length > 4 && (
                <button onClick={() => router.push('/student/certificates')} style={{ fontSize: 12, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '6px 0' }}>
                  View all {certificates.length} →
                </button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* My active registration */}
      {myActiveHackathon && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: 24 }}>
          <Card style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={22} color="#34d399" />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: '#34d399', fontWeight: 600, marginBottom: 4 }}>🔴 Active Hackathon</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>{(myActiveHackathon.hackathons as Hackathon)?.title}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => router.push('/student/hackathons')}>View Details</Button>
            </div>
          </Card>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
