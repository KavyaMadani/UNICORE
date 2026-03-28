'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_MANAGERS, MOCK_HACKATHONS } from '@/lib/mock-data';
import { UserCog, Zap, Users, Plus, ArrowRight, TrendingUp, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';

export default function OrgDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const activeHackathons = MOCK_HACKATHONS.filter(h => h.status === 'active');

  const statItems = [
    { label: 'Event Managers', value: MOCK_MANAGERS.length, icon: <UserCog size={20} className="text-indigo-400" />, change: '+1 this month', dir: 'up' as const },
    { label: 'Active Events', value: activeHackathons.length, icon: <Zap size={20} className="text-emerald-400" />, change: 'Live now', dir: 'up' as const },
    { label: 'Total Students', value: '1,247', icon: <Users size={20} className="text-blue-400" />, change: '+12% MoM', dir: 'up' as const },
    { label: 'Total Hackathons', value: MOCK_HACKATHONS.length, icon: <TrendingUp size={20} className="text-amber-400" />, change: 'All time', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout title="Organization Dashboard" subtitle="Manage your team and events">

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ borderRadius: 20, padding: '24px 28px', marginBottom: 32, background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.08) 100%)', border: '1px solid rgba(99,102,241,0.2)', overflow: 'hidden', position: 'relative' }}
      >
        <div className="blob" style={{ width: 200, height: 200, background: 'rgba(99,102,241,0.2)', top: -60, right: -40, filter: 'blur(60px)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#818cf8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Welcome back</p>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 6 }}>
              {user?.name ?? 'Organization'}
            </h2>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>You have {activeHackathons.length} active event{activeHackathons.length !== 1 ? 's' : ''} running right now</p>
          </div>
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => router.push('/organization/managers/add')}>
            Add Manager
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {statItems.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Event Managers */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <CardTitle>Event Managers</CardTitle>
              <CardSubtitle>Your team members</CardSubtitle>
            </div>
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => router.push('/organization/managers/add')}>
              Add
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MOCK_MANAGERS.map((mgr, i) => (
              <motion.div
                key={mgr.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                  {mgr.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 3 }}>{mgr.name}</p>
                  <p style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mgr.email}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <Badge variant={mgr.status === 'active' ? 'active' : 'ended'} dot={mgr.status === 'active'}>
                    {mgr.status}
                  </Badge>
                  <span style={{ fontSize: 11, color: '#475569' }}>{mgr.hackathonsManaged} events</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/organization/managers')}>
              View All Managers <ArrowRight size={14} />
            </Button>
          </div>
        </Card>

        {/* Recent Hackathons */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <CardTitle>Recent Hackathons</CardTitle>
              <CardSubtitle>Managed by your team</CardSubtitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/organization/hackathons')} rightIcon={<ArrowRight size={14} />}>
              View all
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MOCK_HACKATHONS.slice(0, 4).map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={16} color="#818cf8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{h.title}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{h.participantCount.toLocaleString()} participants</p>
                </div>
                <Badge variant={h.status}>{h.status}</Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
