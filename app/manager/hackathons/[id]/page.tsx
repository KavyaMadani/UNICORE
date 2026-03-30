'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getHackathonById, type Hackathon } from '@/lib/db';
import {
  ArrowLeft, Zap, Users, Trophy, Calendar, School, Tag,
  CheckCircle, Clock, Edit3, BarChart2, FileText, Loader2,
  Upload, ExternalLink,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const SUBMISSION_TYPE_META: Record<string, { icon: string; label: string }> = {
  github:  { icon: '🔗', label: 'GitHub Repository' },
  pdf:     { icon: '📄', label: 'PDF Document' },
  ppt:     { icon: '📊', label: 'Presentation' },
  website: { icon: '🌐', label: 'Website / Demo URL' },
  video:   { icon: '🎥', label: 'Video Demo' },
  zip:     { icon: '📦', label: 'ZIP Archive' },
};

export default function HackathonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hack, setHack] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHackathonById(id as string).then(data => {
      setHack(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Loading…" subtitle="">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#64748b' }}>
          <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> Loading hackathon…
        </div>
      </DashboardLayout>
    );
  }

  if (!hack) {
    return (
      <DashboardLayout title="Not Found" subtitle="">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Zap size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 24 }}>Hackathon not found.</p>
          <Button leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/manager/hackathons')}>Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const prizes: { rank: string; amount: string; description: string }[] = Array.isArray(hack.prizes) ? hack.prizes : [];
  const timeline: { label: string; date: string; done: boolean }[] = Array.isArray(hack.timeline) ? hack.timeline : [];
  const rules: string[] = Array.isArray(hack.rules) ? hack.rules : [];
  const tags: string[] = Array.isArray(hack.tags) ? hack.tags : [];
  const submissionTypes: string[] = Array.isArray(hack.submission_types) ? hack.submission_types : [];

  return (
    <DashboardLayout
      title={hack.title}
      subtitle={hack.subtitle ?? ''}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/manager/hackathons')}>Back</Button>
          <Button variant="secondary" size="sm" leftIcon={<Upload size={14} />} onClick={() => router.push('/manager/submissions')}>View Submissions</Button>
          <Button size="sm" leftIcon={<Edit3 size={14} />} onClick={() => router.push(`/manager/hackathons/${hack.id}/edit`)}>Edit</Button>
        </div>
      }
    >
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ padding: '40px 44px', borderRadius: 26, background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(59,130,246,0.05) 100%)', border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', filter: 'blur(60px)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(59,130,246,0.15))', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={28} color="#818cf8" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9' }}>{hack.title}</h1>
                    <Badge variant={hack.status} dot={hack.status === 'active'}>{hack.status}</Badge>
                    {hack.is_featured && <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', padding: '3px 10px', borderRadius: 99, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>⭐ Featured</span>}
                  </div>
                  <p style={{ fontSize: 15, color: '#94a3b8' }}>{hack.subtitle}</p>
                </div>
              </div>
              {hack.college && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)' }}>
                    <School size={14} color="#818cf8" />
                    <span style={{ fontSize: 14, color: '#a5b4fc', fontWeight: 600 }}>{hack.college}</span>
                  </div>
                  {hack.organizer && <span style={{ fontSize: 13, color: '#64748b' }}>Organized by {hack.organizer}</span>}
                </div>
              )}
              {hack.description && <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.8, marginBottom: 28, maxWidth: 700 }}>{hack.description}</p>}
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <Tag size={14} color="#475569" />
                  {tags.map(tag => <span key={tag} style={{ fontSize: 12, fontWeight: 600, color: '#64748b', padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>{tag}</span>)}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {[
            { label: 'Participants', value: hack.participant_count?.toLocaleString() ?? '0', icon: <Users size={20} color="#60a5fa" />, color: '#60a5fa' },
            { label: 'Teams', value: hack.team_count ?? 0, icon: <BarChart2 size={20} color="#818cf8" />, color: '#818cf8' },
            { label: 'Prize Pool', value: hack.prize_pool ?? 'TBD', icon: <Trophy size={20} color="#fbbf24" />, color: '#fbbf24' },
            { label: 'Team Size', value: `${hack.min_team_size ?? 1}–${hack.max_team_size ?? 4}`, icon: <Users size={20} color="#34d399" />, color: '#34d399' },
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

        {/* Submission Types Panel */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Upload size={18} color="#818cf8" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Required Submissions</h3>
                <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>(participants must submit these)</span>
              </div>
              <Button size="sm" variant="secondary" leftIcon={<ExternalLink size={13} />} onClick={() => router.push('/manager/submissions')}>
                Review All Submissions
              </Button>
            </div>
            {submissionTypes.length === 0 ? (
              <div style={{ padding: '20px', borderRadius: 14, border: '1px dashed rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#475569' }}>
                  No submission types configured.{' '}
                  <button onClick={() => router.push(`/manager/hackathons/${hack.id}/edit`)}
                    style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: 13 }}>
                    Edit hackathon
                  </button>{' '}
                  to add them.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {submissionTypes.map(type => {
                  const meta = SUBMISSION_TYPE_META[type] ?? { icon: '📁', label: type };
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                      <span style={{ fontSize: 20 }}>{meta.icon}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#c7d2fe' }}>{meta.label}</p>
                        <p style={{ fontSize: 11, color: '#475569' }}>Required</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Timeline + Prizes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}><Clock size={18} color="#60a5fa" /><h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Timeline</h3></div>
            {timeline.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Registration Deadline', date: hack.registration_deadline ? formatDate(hack.registration_deadline) : 'TBD', done: false },
                  { label: 'Hackathon Start', date: hack.start_date ? formatDate(hack.start_date) : 'TBD', done: false },
                  { label: 'Hackathon End', date: hack.end_date ? formatDate(hack.end_date) : 'TBD', done: false },
                ].map((t, ti) => (
                  <div key={ti} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '2px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Clock size={12} color="#818cf8" /></div>
                    <div style={{ paddingTop: 4 }}><p style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 2 }}>{t.label}</p><p style={{ fontSize: 12, color: '#475569' }}>{t.date}</p></div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {timeline.map((t, ti) => (
                  <div key={ti} style={{ display: 'flex', gap: 14, paddingBottom: ti < timeline.length - 1 ? 20 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.done ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.06)', border: t.done ? '2px solid rgba(16,185,129,0.4)' : '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {t.done ? <CheckCircle size={14} color="#34d399" /> : <Clock size={12} color="#475569" />}
                      </div>
                      {ti < timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: t.done ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)', margin: '4px 0' }} />}
                    </div>
                    <div style={{ paddingTop: 4 }}><p style={{ fontSize: 14, fontWeight: 600, color: t.done ? '#34d399' : '#94a3b8', marginBottom: 2 }}>{t.label}</p><p style={{ fontSize: 12, color: '#475569' }}>{t.date}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}><Trophy size={18} color="#fbbf24" /><h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Prizes</h3></div>
            {prizes.length === 0 ? (
              <p style={{ fontSize: 14, color: '#475569' }}>No prize details added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {prizes.map((prize, pi) => (
                  <div key={pi} style={{ padding: '16px 18px', borderRadius: 14, background: pi === 0 ? 'rgba(251,191,36,0.06)' : pi === 1 ? 'rgba(148,163,184,0.06)' : 'rgba(180,108,60,0.06)', border: pi === 0 ? '1px solid rgba(251,191,36,0.18)' : pi === 1 ? '1px solid rgba(148,163,184,0.18)' : '1px solid rgba(180,108,60,0.18)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: pi === 0 ? '#fbbf24' : pi === 1 ? '#94a3b8' : '#cd7c4a' }}>{pi === 0 ? '🥇' : pi === 1 ? '🥈' : '🥉'} {prize.rank}</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>{prize.amount}</span>
                    </div>
                    {prize.description && <p style={{ fontSize: 12, color: '#64748b' }}>{prize.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rules */}
        {rules.length > 0 && (
          <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}><FileText size={18} color="#94a3b8" /><h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Rules</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rules.map((rule, ri) => (
                <div key={ri} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8' }}>{ri + 1}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key dates */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Registration Deadline', value: hack.registration_deadline ? formatDate(hack.registration_deadline) : 'TBD', icon: <Calendar size={16} color="#f87171" />, color: '#f87171' },
            { label: 'Hackathon Start', value: hack.start_date ? formatDate(hack.start_date) : 'TBD', icon: <Calendar size={16} color="#34d399" />, color: '#34d399' },
            { label: 'Hackathon End', value: hack.end_date ? formatDate(hack.end_date) : 'TBD', icon: <Calendar size={16} color="#60a5fa" />, color: '#60a5fa' },
          ].map((d, di) => (
            <div key={di} style={{ padding: '18px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>{d.icon}<span style={{ fontSize: 12, color: d.color, fontWeight: 600 }}>{d.label}</span></div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{d.value}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
