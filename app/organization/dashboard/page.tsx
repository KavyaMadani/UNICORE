'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getPublicHackathons, getManagers, type Hackathon, type Profile } from '@/lib/db';
import { UserCog, TrendingUp, Zap, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';

export default function OrgDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [managers, setManagers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [hacks, mgrs] = await Promise.all([getPublicHackathons(), getManagers()]);
      setHackathons(hacks);
      setManagers(mgrs);
      setLoading(false);
    })();
  }, []);

  const activeHackathons = hackathons.filter(h => h.status === 'active');
  const totalParticipants = hackathons.reduce((s, h) => s + (h.participant_count ?? 0), 0);

  const stats = [
    { label: 'Event Managers', value: loading ? '—' : managers.length, icon: <UserCog size={20} className="text-indigo-400" />, change: 'On platform', dir: 'neutral' as const },
    { label: 'Active Hackathons', value: loading ? '—' : activeHackathons.length, icon: <TrendingUp size={20} className="text-emerald-400" />, change: 'Live right now', dir: activeHackathons.length > 0 ? 'up' as const : 'neutral' as const },
    { label: 'Total Participants', value: loading ? '—' : totalParticipants.toLocaleString(), icon: <Users size={20} className="text-blue-400" />, change: 'Across all events', dir: 'neutral' as const },
    { label: 'Total Hackathons', value: loading ? '—' : hackathons.length, icon: <Zap size={20} className="text-amber-400" />, change: 'All time', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout title={`Welcome, ${user?.name ?? 'Organization'} 👋`} subtitle="Your organization overview">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Hackathons */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div><CardTitle>All Hackathons</CardTitle><CardSubtitle>Platform-wide events</CardSubtitle></div>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, gap: 10, color: '#64748b' }}><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /></div>
          ) : hackathons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <Zap size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontSize: 13 }}>No hackathons on the platform yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {hackathons.slice(0, 6).map((h, i) => (
                <motion.div key={h.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Zap size={17} color="#818cf8" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Badge variant={h.status} dot={h.status === 'active'}>{h.status}</Badge>
                        {h.college && <span style={{ fontSize: 11, color: '#64748b' }}>{h.college}</span>}
                        <span style={{ fontSize: 11, color: '#475569' }}>{h.participant_count ?? 0} participants</span>
                      </div>
                    </div>
                    <ArrowRight size={15} color="#475569" />
                  </div>
                </motion.div>
              ))}
              {hackathons.length > 6 && (
                <button onClick={() => router.push('/organization/hackathons')} style={{ fontSize: 13, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', padding: '8px 0', fontFamily: 'inherit', fontWeight: 600 }}>
                  View all {hackathons.length} →
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Managers */}
        <Card>
          <div style={{ marginBottom: 24 }}><CardTitle>Event Managers</CardTitle><CardSubtitle>{managers.length} on platform</CardSubtitle></div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100 }}><Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#64748b' }} /></div>
          ) : managers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
              <UserCog size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>No managers yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {managers.slice(0, 5).map((mgr, i) => (
                <div key={mgr.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(59,130,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#a5b4fc' }}>
                    {(mgr.name ?? mgr.email ?? 'M')[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mgr.name ?? mgr.email?.split('@')[0]}</p>
                    {mgr.college && <p style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mgr.college}</p>}
                  </div>
                </div>
              ))}
              {managers.length > 5 && (
                <button onClick={() => router.push('/organization/managers')} style={{ fontSize: 12, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '6px 0', textAlign: 'center' }}>
                  View all {managers.length} →
                </button>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
