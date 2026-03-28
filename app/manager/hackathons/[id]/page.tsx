'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_HACKATHONS } from '@/lib/mock-data';
import {
  ArrowLeft, Zap, Users, Trophy, Calendar, School, Tag,
  CheckCircle, Clock, Edit3, ExternalLink, BarChart2, FileText,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function HackathonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const hack = MOCK_HACKATHONS.find(h => h.id === id);

  if (!hack) {
    return (
      <DashboardLayout title="Hackathon Not Found" subtitle="">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Zap size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Hackathon not found</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>This hackathon may have been removed.</p>
          <Button leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/manager/hackathons')}>Back to Hackathons</Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusColor = { active: '#34d399', upcoming: '#818cf8', ended: '#64748b', draft: '#fbbf24' }[hack.status] ?? '#64748b';

  return (
    <DashboardLayout
      title={hack.title}
      subtitle={hack.subtitle}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/manager/hackathons')}>
            Back
          </Button>
          <Button size="sm" leftIcon={<Edit3 size={14} />} onClick={() => router.push(`/manager/hackathons/${hack.id}/edit`)}>
            Edit Hackathon
          </Button>
        </div>
      }
    >
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{
            padding: '40px 44px', borderRadius: 26,
            background: `linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(59,130,246,0.05) 100%)`,
            border: '1px solid rgba(99,102,241,0.2)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', filter: 'blur(60px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(59,130,246,0.15))',
                  border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={28} color="#818cf8" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{hack.title}</h1>
                    <Badge variant={hack.status} dot={hack.status === 'active'}>{hack.status}</Badge>
                    {hack.isFeatured && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', padding: '3px 10px', borderRadius: 99, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>⭐ Featured</span>
                    )}
                  </div>
                  <p style={{ fontSize: 15, color: '#94a3b8' }}>{hack.subtitle}</p>
                </div>
              </div>

              {/* College + organizer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)' }}>
                  <School size={14} color="#818cf8" />
                  <span style={{ fontSize: 14, color: '#a5b4fc', fontWeight: 600 }}>{hack.college}</span>
                </div>
                <span style={{ fontSize: 13, color: '#64748b' }}>Organized by {hack.organizer}</span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.8, marginBottom: 28, maxWidth: 700 }}>{hack.description}</p>

              {/* Tags */}
              {hack.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <Tag size={14} color="#475569" />
                  {hack.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 12, fontWeight: 600, color: '#64748b', padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
            {[
              { label: 'Participants', value: hack.participantCount.toLocaleString(), icon: <Users size={20} color="#60a5fa" />, color: '#60a5fa' },
              { label: 'Teams', value: hack.teamCount, icon: <BarChart2 size={20} color="#818cf8" />, color: '#818cf8' },
              { label: 'Prize Pool', value: hack.prizePool, icon: <Trophy size={20} color="#fbbf24" />, color: '#fbbf24' },
              { label: 'Team Size', value: `${hack.minTeamSize}–${hack.maxTeamSize}`, icon: <Users size={20} color="#34d399" />, color: '#34d399' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                <div style={{ padding: '22px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Two column: Timeline + Prizes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Timeline */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}>
            <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Clock size={18} color="#60a5fa" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Timeline</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {hack.timeline.map((t, ti) => (
                  <div key={ti} style={{ display: 'flex', gap: 14, paddingBottom: ti < hack.timeline.length - 1 ? 20 : 0, position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: t.done ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.06)',
                        border: t.done ? '2px solid rgba(16,185,129,0.4)' : '2px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {t.done ? <CheckCircle size={14} color="#34d399" /> : <Clock size={12} color="#475569" />}
                      </div>
                      {ti < hack.timeline.length - 1 && (
                        <div style={{ width: 2, flex: 1, minHeight: 20, background: t.done ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
                      )}
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: t.done ? '#34d399' : '#94a3b8', marginBottom: 2 }}>{t.label}</p>
                      <p style={{ fontSize: 12, color: '#475569' }}>{t.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Prizes */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}>
            <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Trophy size={18} color="#fbbf24" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Prizes</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {hack.prizes.map((prize, pi) => (
                  <div key={pi} style={{
                    padding: '16px 18px', borderRadius: 14,
                    background: pi === 0 ? 'rgba(251,191,36,0.06)' : pi === 1 ? 'rgba(148,163,184,0.06)' : 'rgba(180,108,60,0.06)',
                    border: pi === 0 ? '1px solid rgba(251,191,36,0.18)' : pi === 1 ? '1px solid rgba(148,163,184,0.18)' : '1px solid rgba(180,108,60,0.18)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: pi === 0 ? '#fbbf24' : pi === 1 ? '#94a3b8' : '#cd7c4a' }}>
                        {pi === 0 ? '🥇' : pi === 1 ? '🥈' : '🥉'} {prize.rank}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>{prize.amount}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b' }}>{prize.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Rules */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <FileText size={18} color="#94a3b8" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Rules & Guidelines</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {hack.rules.map((rule, ri) => (
                <div key={ri} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8' }}>{ri + 1}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Key dates summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Registration Deadline', value: formatDate(hack.registrationDeadline), icon: <Calendar size={16} color="#f87171" />, color: '#f87171' },
              { label: 'Hackathon Start', value: formatDate(hack.startDate), icon: <Calendar size={16} color="#34d399" />, color: '#34d399' },
              { label: 'Hackathon End', value: formatDate(hack.endDate), icon: <Calendar size={16} color="#60a5fa" />, color: '#60a5fa' },
            ].map((d, di) => (
              <div key={di} style={{ padding: '18px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>{d.icon}<span style={{ fontSize: 12, color: d.color, fontWeight: 600 }}>{d.label}</span></div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{d.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
