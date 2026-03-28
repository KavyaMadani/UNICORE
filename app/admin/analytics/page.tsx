'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { getPublicHackathons, type Hackathon } from '@/lib/db';
import { BarChart3, TrendingUp, Users, Zap, Trophy, Award, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/Badge';

const MONTHLY_DATA = [
  { month: 'Jan', students: 0 },
  { month: 'Feb', students: 0 },
  { month: 'Mar', students: 0 },
  { month: 'Apr', students: 0 },
  { month: 'May', students: 0 },
  { month: 'Jun', students: 0 },
  { month: 'Jul', students: 0 },
];

interface RealStats { totalHackathons: number; totalStudents: number; totalSubmissions: number; totalCertificates: number; activeHackathons: number; }

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<RealStats>({ totalHackathons: 0, totalStudents: 0, totalSubmissions: 0, totalCertificates: 0, activeHackathons: 0 });
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [hacks, studRes, subRes, certRes] = await Promise.all([
        getPublicHackathons(),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('submissions').select('id', { count: 'exact', head: true }),
        supabase.from('certificates').select('id', { count: 'exact', head: true }),
      ]);
      setHackathons(hacks);
      setStats({
        totalHackathons: hacks.length,
        totalStudents: studRes.count ?? 0,
        totalSubmissions: subRes.count ?? 0,
        totalCertificates: certRes.count ?? 0,
        activeHackathons: hacks.filter(h => h.status === 'active').length,
      });
      setLoading(false);
    })();
  }, []);

  const maxStudents = Math.max(...MONTHLY_DATA.map(d => d.students), 1);
  const topHacks = [...hackathons].sort((a, b) => (b.participant_count ?? 0) - (a.participant_count ?? 0)).slice(0, 3);
  const maxParticipants = Math.max(...topHacks.map(h => h.participant_count ?? 0), 1);

  const kpiStats = [
    { label: 'Total Hackathons', value: loading ? '—' : stats.totalHackathons, icon: <Zap size={20} color="#818cf8" />, change: `${stats.activeHackathons} active`, dir: 'up' as const },
    { label: 'Total Students', value: loading ? '—' : stats.totalStudents.toLocaleString(), icon: <Users size={20} color="#60a5fa" />, change: 'Registered', dir: 'up' as const },
    { label: 'Total Submissions', value: loading ? '—' : stats.totalSubmissions, icon: <Trophy size={20} color="#34d399" />, change: 'Across all events', dir: 'up' as const },
    { label: 'Certificates Issued', value: loading ? '—' : stats.totalCertificates, icon: <Award size={20} color="#fbbf24" />, change: 'All time', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout title="Analytics" subtitle="Platform-wide performance metrics">

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {kpiStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Real hackathon participation chart */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div><CardTitle>Hackathon Participation</CardTitle><CardSubtitle>All events by participant count</CardSubtitle></div>
            <Badge variant="active" dot>Live</Badge>
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, gap: 10, color: '#64748b' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
            </div>
          ) : hackathons.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
              No hackathons yet. Charts will appear once events are created.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180 }}>
                {hackathons.slice(0, 8).map((h, i) => {
                  const pct = hackathons.length > 0 ? Math.max(((h.participant_count ?? 0) / Math.max(...hackathons.map(x => x.participant_count ?? 0), 1)) * 150, 4) : 4;
                  return (
                    <motion.div key={h.id} initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ delay: i * 0.08, type: 'spring', damping: 20 }}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transformOrigin: 'bottom' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>{h.participant_count ?? 0}</span>
                      <div style={{ width: '100%', borderRadius: '6px 6px 0 0', height: pct, background: 'linear-gradient(180deg, rgba(99,102,241,0.8) 0%, rgba(59,130,246,0.5) 100%)', minHeight: 4 }} />
                      <span style={{ fontSize: 9, color: '#475569', fontWeight: 600, maxWidth: 48, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title?.split(' ')[0] ?? ''}</span>
                    </motion.div>
                  );
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                  { label: 'Total Events', value: hackathons.length, sub: 'All time' },
                  { label: 'Most Popular', value: topHacks[0]?.title?.split(' ')[0] ?? '—', sub: 'By participants' },
                  { label: 'Total Participants', value: hackathons.reduce((s, h) => s + (h.participant_count ?? 0), 0).toLocaleString(), sub: 'Across all events' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <CardTitle style={{ marginBottom: 6 }}>Top Events</CardTitle>
            <CardSubtitle style={{ marginBottom: 24 }}>By participation</CardSubtitle>
            {topHacks.length === 0 ? (
              <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', padding: '20px 0' }}>No events yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {topHacks.map((h, i) => (
                  <div key={h.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', minWidth: 24 }}>#{i + 1}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120, whiteSpace: 'nowrap' }}>{h.title}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>{(h.participant_count ?? 0).toLocaleString()}</span>
                    </div>
                    <Progress value={h.participant_count ?? 0} max={maxParticipants} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardTitle style={{ marginBottom: 20 }}>Platform Status</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Active Events', value: stats.activeHackathons, total: Math.max(stats.totalHackathons, 1), color: '#34d399' },
                { label: 'Students', value: stats.totalStudents, total: Math.max(stats.totalStudents, 1), color: '#818cf8' },
                { label: 'Submissions', value: stats.totalSubmissions, total: Math.max(stats.totalSubmissions, 1), color: '#60a5fa' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{s.value}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: s.color, width: '100%', opacity: 0.7 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
