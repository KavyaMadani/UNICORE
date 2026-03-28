'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MOCK_ANALYTICS, MOCK_HACKATHONS } from '@/lib/mock-data';
import { BarChart3, TrendingUp, Users, Zap, Trophy, Award } from 'lucide-react';
import { Progress } from '@/components/ui/Badge';

const MONTHLY_DATA = [
  { month: 'Jan', students: 120 },
  { month: 'Feb', students: 345 },
  { month: 'Mar', students: 210 },
  { month: 'Apr', students: 567 },
  { month: 'May', students: 489 },
  { month: 'Jun', students: 892 },
  { month: 'Jul', students: 634 },
];

export default function AdminAnalyticsPage() {
  const maxStudents = Math.max(...MONTHLY_DATA.map(d => d.students));

  const stats = [
    { label: 'Total Hackathons', value: MOCK_ANALYTICS.totalHackathons, icon: <Zap size={20} color="#818cf8" />, change: '+33% YoY', dir: 'up' as const },
    { label: 'Total Students', value: MOCK_ANALYTICS.totalStudents.toLocaleString(), icon: <Users size={20} color="#60a5fa" />, change: `+${MOCK_ANALYTICS.monthlyGrowth}% MoM`, dir: 'up' as const },
    { label: 'Total Submissions', value: MOCK_ANALYTICS.totalSubmissions.toLocaleString(), icon: <Trophy size={20} color="#34d399" />, change: '+18% MoM', dir: 'up' as const },
    { label: 'Certificates Issued', value: MOCK_ANALYTICS.certificatesIssued.toLocaleString(), icon: <Award size={20} color="#fbbf24" />, change: 'All time', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout title="Analytics" subtitle="Platform-wide performance metrics">

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Bar chart */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <CardTitle>Student Growth</CardTitle>
              <CardSubtitle>Monthly new registrations (2025)</CardSubtitle>
            </div>
            <Badge variant="active" dot>Live</Badge>
          </div>

          {/* Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180 }}>
            {MONTHLY_DATA.map((d, i) => (
              <motion.div
                key={d.month}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', damping: 20 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transformOrigin: 'bottom' }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>{d.students}</span>
                <div
                  style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    height: `${(d.students / maxStudents) * 150}px`,
                    background: 'linear-gradient(180deg, rgba(99,102,241,0.8) 0%, rgba(59,130,246,0.5) 100%)',
                    minHeight: 4,
                  }}
                />
                <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{d.month}</span>
              </motion.div>
            ))}
          </div>

          {/* Summary stats below chart */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              { label: 'Peak Month', value: 'June', sub: '892 registrations' },
              { label: 'Avg Monthly', value: Math.round(MONTHLY_DATA.reduce((s, d) => s + d.students, 0) / MONTHLY_DATA.length), sub: 'students / month' },
              { label: 'Total (2025)', value: MONTHLY_DATA.reduce((s, d) => s + d.students, 0).toLocaleString(), sub: 'registered students' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top hackathons */}
          <Card>
            <CardTitle style={{ marginBottom: 6 }}>Top Events</CardTitle>
            <CardSubtitle style={{ marginBottom: 24 }}>By participation</CardSubtitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {MOCK_HACKATHONS.slice(0, 3).map((h, i) => (
                <div key={h.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', minWidth: 24 }}>#{i + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>{h.title}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>{h.participantCount.toLocaleString()}</span>
                  </div>
                  <Progress value={h.participantCount} max={1000} />
                </div>
              ))}
            </div>
          </Card>

          {/* College breakdown */}
          <Card>
            <CardTitle style={{ marginBottom: 20 }}>College Breakdown</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'IIT Bombay', pct: 32 },
                { name: 'IIT Delhi', pct: 24 },
                { name: 'BITS Pilani', pct: 18 },
                { name: 'VIT Vellore', pct: 15 },
                { name: 'Others', pct: 11 },
              ].map(c => (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{c.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{c.pct}%</span>
                  </div>
                  <Progress value={c.pct} max={100} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
