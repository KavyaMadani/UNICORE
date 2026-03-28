'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_CERTIFICATES } from '@/lib/mock-data';
import { Award, Download, Share2, Trophy, Star, Calendar, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const RANK_COLORS: Record<string, { bg: string; border: string; color: string; grad: string }> = {
  'Winner': { bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24', grad: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  '1st Place': { bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24', grad: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  '2nd Place': { bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.18)', color: '#94a3b8', grad: 'linear-gradient(135deg, #94a3b8, #64748b)' },
  '3rd Place': { bg: 'rgba(180,120,48,0.06)', border: 'rgba(180,120,48,0.2)', color: '#b97b30', grad: 'linear-gradient(135deg, #cd7f32, #a0522d)' },
  'Finalist': { bg: 'rgba(99,102,241,0.05)', border: 'rgba(99,102,241,0.18)', color: '#818cf8', grad: 'linear-gradient(135deg, #818cf8, #6366f1)' },
  'Participant': { bg: 'rgba(16,185,129,0.04)', border: 'rgba(16,185,129,0.15)', color: '#34d399', grad: 'linear-gradient(135deg, #34d399, #10b981)' },
};

function getCertStyle(achievement: string) {
  for (const key of Object.keys(RANK_COLORS)) {
    if (achievement.includes(key)) return RANK_COLORS[key];
  }
  return RANK_COLORS['Participant'];
}

export default function StudentCertificatesPage() {
  const stats = [
    { label: 'Total Certificates', value: MOCK_CERTIFICATES.length, icon: <Award size={20} color="#fbbf24" />, change: 'All time', dir: 'neutral' as const },
    { label: 'Wins / Podium', value: MOCK_CERTIFICATES.filter(c => c.achievement.includes('Winner') || c.achievement.includes('1st') || c.achievement.includes('2nd')).length, icon: <Trophy size={20} color="#34d399" />, change: 'Top finishes', dir: 'up' as const },
    { label: 'Finalist', value: MOCK_CERTIFICATES.filter(c => c.achievement.includes('Finalist')).length, icon: <Star size={20} color="#818cf8" />, change: 'Near top', dir: 'neutral' as const },
    { label: 'Participations', value: MOCK_CERTIFICATES.filter(c => c.achievement.includes('Participant')).length, icon: <Calendar size={20} color="#60a5fa" />, change: 'Completed events', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout title="My Certificates" subtitle="Your achievements and accolades">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      {/* Certificates grid */}
      {MOCK_CERTIFICATES.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {MOCK_CERTIFICATES.map((cert, i) => {
            const style = getCertStyle(cert.achievement);
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  borderRadius: 20, overflow: 'hidden',
                  background: style.bg, border: `1px solid ${style.border}`,
                }}
              >
                {/* Certificate banner */}
                <div style={{
                  height: 120, position: 'relative', overflow: 'hidden',
                  background: `linear-gradient(135deg, rgba(9,13,25,0.9), rgba(15,23,42,0.8))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {/* BG decoration */}
                  <div style={{ position: 'absolute', inset: 0, background: style.bg, opacity: 0.6 }} />
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: style.grad, opacity: 0.12, filter: 'blur(30px)' }} />
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: style.grad,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 24px ${style.color}40`,
                    }}>
                      <Trophy size={24} color="white" />
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                      color: style.color, padding: '3px 12px', borderRadius: 99,
                      background: `${style.color}18`, border: `1px solid ${style.color}35`,
                    }}>
                      {cert.achievement}
                    </span>
                  </div>
                </div>

                {/* Certificate body */}
                <div style={{ padding: '22px 24px' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, lineHeight: 1.3 }}>{cert.hackathonTitle}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>
                    Issued by <span style={{ color: '#94a3b8', fontWeight: 600 }}>{cert.issuedBy}</span> · {formatDate(cert.issuedDate)}
                  </p>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 14px', borderRadius: 12,
                        background: style.grad, border: 'none',
                        color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                        boxShadow: `0 4px 16px ${style.color}25`,
                      }}
                    >
                      <Download size={13} /> Download PDF
                    </button>
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#64748b', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                      }}
                    >
                      <Share2 size={13} />
                    </button>
                  </div>

                  {cert.verifyUrl && (
                    <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                        <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>Verify certificate</span>
                        <ExternalLink size={10} color="#475569" />
                      </div>
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Award size={56} style={{ margin: '0 auto 20px', color: '#334155' }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#475569', marginBottom: 10 }}>No certificates yet</h3>
          <p style={{ fontSize: 14, color: '#334155', maxWidth: 360, margin: '0 auto 28px' }}>
            Participate in hackathons and perform well to earn certificates. Every participant gets one!
          </p>
          <Button>Browse Hackathons</Button>
        </div>
      )}
    </DashboardLayout>
  );
}
