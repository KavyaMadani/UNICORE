'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_HACKATHONS, MOCK_SUBMISSIONS, MOCK_ANNOUNCEMENTS } from '@/lib/mock-data';
import { Zap, Users, FileText, Megaphone, Plus, ArrowRight, Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

const ANNOUNCEMENT_ICONS = {
  warning: <AlertTriangle size={15} color="#fbbf24" />,
  success: <CheckCircle size={15} color="#34d399" />,
  info: <Info size={15} color="#60a5fa" />,
};

const ANNOUNCEMENT_COLORS = {
  warning: { bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.18)', title: '#fde68a' },
  success: { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.18)', title: '#6ee7b7' },
  info: { bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.18)', title: '#a5b4fc' },
};

export default function ManagerDashboard() {
  const router = useRouter();
  const active = MOCK_HACKATHONS.filter(h => h.status === 'active');

  const statItems = [
    { label: 'My Hackathons', value: MOCK_HACKATHONS.length, icon: <Zap size={20} className="text-indigo-400" />, change: `${active.length} active`, dir: 'up' as const },
    { label: 'Total Participants', value: MOCK_HACKATHONS.reduce((s, h) => s + h.participantCount, 0).toLocaleString(), icon: <Users size={20} className="text-blue-400" />, change: 'Across all events', dir: 'neutral' as const },
    { label: 'Submissions', value: MOCK_SUBMISSIONS.length, icon: <FileText size={20} className="text-emerald-400" />, change: '1 pending review', dir: 'neutral' as const },
    { label: 'Announcements', value: MOCK_ANNOUNCEMENTS.length, icon: <Megaphone size={20} className="text-amber-400" />, change: 'All time', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout title="Manager Dashboard" subtitle="Your hackathon management hub">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {statItems.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* My Hackathons */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <CardTitle>My Hackathons</CardTitle>
              <CardSubtitle>Events you are managing</CardSubtitle>
            </div>
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => router.push('/manager/hackathons')}>
              Create Hackathon
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MOCK_HACKATHONS.map((hack, i) => (
              <motion.div
                key={hack.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                onClick={() => router.push('/manager/hackathons')}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.045)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
              >
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={18} color="#818cf8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{hack.title}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>
                    {hack.participantCount.toLocaleString()} participants · {formatDate(hack.startDate)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399' }}>{hack.prizePool}</span>
                  <Badge variant={hack.status}>{hack.status}</Badge>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/manager/hackathons')}>
              View All Hackathons <ArrowRight size={14} />
            </Button>
          </div>
        </Card>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Stats */}
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <CardTitle>Live Now</CardTitle>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>● Active</span>
            </div>
            {active.length === 0 ? (
              <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', padding: '20px 0' }}>No active events</p>
            ) : active.map(h => (
              <div key={h.id} style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 10 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{h.title}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{h.participantCount} participants</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#818cf8' }}>Ends {formatDate(h.endDate)}</span>
                </div>
              </div>
            ))}
          </Card>

          {/* Announcements */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <CardTitle>Announcements</CardTitle>
              <Button variant="ghost" size="xs" onClick={() => router.push('/manager/announcements')} rightIcon={<ArrowRight size={12} />}>
                View all
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_ANNOUNCEMENTS.slice(0, 3).map((ann, i) => {
                const colors = ANNOUNCEMENT_COLORS[ann.type];
                return (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    style={{ padding: '14px 16px', borderRadius: 14, background: colors.bg, border: `1px solid ${colors.border}` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ marginTop: 1, flexShrink: 0 }}>{ANNOUNCEMENT_ICONS[ann.type]}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: colors.title, marginBottom: 4 }}>{ann.title}</p>
                        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{ann.content}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/manager/announcements')}>
                <Megaphone size={14} /> New Announcement
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
