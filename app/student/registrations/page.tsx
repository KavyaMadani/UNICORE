'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_HACKATHONS } from '@/lib/mock-data';
import { Zap, Users, Trophy, Calendar, ArrowRight, ClipboardList, CheckCircle, Clock, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

const MY_REGISTRATIONS = MOCK_HACKATHONS.filter(h => ['active', 'upcoming', 'ended'].includes(h.status)).slice(0, 3);

export default function StudentRegistrationsPage() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const statusColor: Record<string, { bg: string; border: string }> = {
    active: { bg: 'rgba(16,185,129,0.04)', border: 'rgba(16,185,129,0.2)' },
    upcoming: { bg: 'rgba(99,102,241,0.04)', border: 'rgba(99,102,241,0.15)' },
    ended: { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)' },
  };

  const stats = [
    { label: 'Total Registered', value: MY_REGISTRATIONS.length, icon: <ClipboardList size={20} color="#818cf8" />, change: 'All time', dir: 'neutral' as const },
    { label: 'Active Now', value: MY_REGISTRATIONS.filter(h => h.status === 'active').length, icon: <Zap size={20} color="#34d399" />, change: 'Live hackathons', dir: 'up' as const },
    { label: 'Upcoming', value: MY_REGISTRATIONS.filter(h => h.status === 'upcoming').length, icon: <Clock size={20} color="#60a5fa" />, change: 'Starting soon', dir: 'neutral' as const },
    { label: 'Completed', value: MY_REGISTRATIONS.filter(h => h.status === 'ended').length, icon: <CheckCircle size={20} color="#fbbf24" />, change: 'Finished', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout title="My Registrations" subtitle="Hackathons you have registered for">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 999,
              padding: '12px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399', fontSize: 13, fontWeight: 500, backdropFilter: 'blur(8px)',
            }}
          >
            <CheckCircle size={15} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      {/* Registration cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {MY_REGISTRATIONS.map((hack, i) => {
          const sc = statusColor[hack.status] ?? statusColor.ended;
          return (
            <motion.div key={hack.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div style={{ padding: '28px 30px', borderRadius: 20, background: sc.bg, border: `1px solid ${sc.border}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>

                  {/* Left: Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flex: 1, minWidth: 240 }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: 16, flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.1))',
                      border: '1px solid rgba(99,102,241,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Zap size={22} color="#818cf8" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{hack.title}</h3>
                        <Badge variant={hack.status as 'active' | 'upcoming' | 'ended'} dot={hack.status === 'active'}>{hack.status}</Badge>
                      </div>
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                        {hack.college} · Team: <span style={{ color: '#818cf8', fontWeight: 600 }}>NeuralNinjas</span>
                      </p>
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                          <Calendar size={13} color="#475569" />
                          {formatDate(hack.startDate)} – {formatDate(hack.endDate)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>
                          <Trophy size={13} color="#fbbf24" /> {hack.prizePool}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                          <Users size={13} color="#475569" /> {hack.participantCount} participants
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Team + Action */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-end', flexShrink: 0 }}>
                    {/* Team members */}
                    <div style={{
                      padding: '12px 16px', borderRadius: 14,
                      background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)',
                      minWidth: 180,
                    }}>
                      <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Team Members</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        {['A', 'P', 'R'].map((initial, mi) => (
                          <div key={mi} style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: 11, fontWeight: 700,
                          }}>
                            {initial}
                          </div>
                        ))}
                        <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>+1 slot</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => {
                        if (hack.status === 'active') router.push(`/student/hackathons/${hack.id}`);
                        else if (hack.status === 'upcoming') showToast('Hackathon starts soon!');
                        else router.push('/student/certificates');
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '11px 20px', borderRadius: 12,
                        background: hack.status === 'active' ? 'rgba(99,102,241,0.2)' : hack.status === 'ended' ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.1)',
                        border: hack.status === 'active' ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)',
                        color: hack.status === 'active' ? '#a5b4fc' : hack.status === 'ended' ? '#64748b' : '#93c5fd',
                        fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {hack.status === 'active' ? 'Go to Hackathon' : hack.status === 'upcoming' ? 'View Details' : 'View Results'}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {MY_REGISTRATIONS.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
            <ClipboardList size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#475569', marginBottom: 8 }}>No registrations yet</h3>
            <p style={{ fontSize: 14, color: '#334155', marginBottom: 24 }}>Browse and register for hackathons to get started.</p>
            <Button onClick={() => router.push('/student/hackathons')}>Browse Hackathons</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
