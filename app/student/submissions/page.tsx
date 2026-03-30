'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { getMyFullSubmissions, TYPE_META, type FullSubmission, type SubmissionType } from '@/lib/submissions';
import { useRouter } from 'next/navigation';
import {
  FileText, CheckCircle, Clock, XCircle, Star, Loader2,
  ExternalLink, Edit3, ChevronRight, Zap, MessageSquare,
  Upload, TrendingUp, Award
} from 'lucide-react';

const STATUS_CONFIG = {
  submitted:    { label: 'Submitted',    color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)',  icon: <Clock size={13} /> },
  reviewed:     { label: 'Under Review', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  icon: <FileText size={13} /> },
  approved:     { label: 'Approved',     color: '#34d399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  icon: <CheckCircle size={13} /> },
  disqualified: { label: 'Disqualified', color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   icon: <XCircle size={13} /> },
};

export default function StudentSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<FullSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'reviewed' | 'approved' | 'disqualified'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const subs = await getMyFullSubmissions(session.user.id);
        setSubmissions(subs);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = submissions.filter(s => filter === 'all' || s.status === filter);
  const approved = submissions.filter(s => s.status === 'approved').length;
  const avgScore = submissions.filter(s => s.score != null).length
    ? (submissions.reduce((a, s) => a + (s.score ?? 0), 0) / submissions.filter(s => s.score != null).length).toFixed(1)
    : null;

  const stats = [
    { label: 'Total Projects', value: submissions.length, icon: <Upload size={18} color="#818cf8" />, color: '#818cf8' },
    { label: 'Under Review',   value: submissions.filter(s => s.status === 'reviewed').length, icon: <Clock size={18} color="#fbbf24" />, color: '#fbbf24' },
    { label: 'Approved',       value: approved, icon: <Award size={18} color="#34d399" />, color: '#34d399' },
    { label: 'Avg Score',      value: avgScore ? `${avgScore}/10` : '—', icon: <Star size={18} color="#f59e0b" />, color: '#f59e0b' },
  ];

  return (
    <DashboardLayout title="My Submissions" subtitle="Track your project submissions across all hackathons">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div style={{ padding: '22px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${s.color}10`, pointerEvents: 'none' }} />
              <div style={{ marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['all', 'submitted', 'reviewed', 'approved', 'disqualified'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', textTransform: 'capitalize',
              background: filter === f ? 'rgba(99,102,241,0.18)' : 'transparent',
              color: filter === f ? '#a5b4fc' : '#64748b',
              border: filter === f ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)',
              transition: 'all 0.15s',
            }}>
              {f === 'all' ? `All (${submissions.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${submissions.filter(s => s.status === f).length})`}
            </button>
          ))}
        </div>
        <Button size="sm" leftIcon={<Upload size={13} />} onClick={() => router.push('/student/hackathons')}>
          Submit New Project
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading submissions…
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Zap size={32} color="#818cf8" />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            {filter === 'all' ? 'No submissions yet' : `No ${filter} submissions`}
          </p>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            {filter === 'all' ? 'Register for a hackathon and submit your project during the event.' : `You have no submissions with "${filter}" status.`}
          </p>
          {filter === 'all' && (
            <Button onClick={() => router.push('/student/hackathons')}>Browse Hackathons</Button>
          )}
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((sub, i) => {
            const cfg = STATUS_CONFIG[sub.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.submitted;
            const isOpen = expanded === sub.id;
            const types = Object.keys(sub.submission_data ?? {}).filter(k => (sub.submission_data as Record<string, string>)[k]) as SubmissionType[];

            return (
              <motion.div key={sub.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div style={{ borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: `1px solid ${isOpen ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.07)'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  {/* Header row */}
                  <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'flex-start', gap: 16, cursor: 'pointer', flexWrap: 'wrap' }}
                    onClick={() => setExpanded(isOpen ? null : sub.id)}>
                    {/* Status dot */}
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: cfg.color }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9' }}>{sub.project_title}</h3>
                        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        {sub.score != null && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                            <Star size={10} /> {sub.score}/10
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        {sub.hackathon_title}
                        {sub.team_name && <span style={{ color: '#818cf8', marginLeft: 8 }}>· Team: {sub.team_name}</span>}
                      </p>
                      {/* Deliverable pills */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {types.map(type => (
                          <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                            {TYPE_META[type]?.icon} {TYPE_META[type]?.label ?? type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      <p style={{ fontSize: 11, color: '#475569' }}>
                        {new Date(sub.submitted_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <ChevronRight size={16} color="#475569" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </div>

                  {/* Expandable details */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <div style={{ padding: '0 28px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ paddingTop: 20 }}>
                            {sub.description && (
                              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 20 }}>{sub.description}</p>
                            )}

                            {/* Links */}
                            {types.length > 0 && (
                              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                                {types.map(type => {
                                  const url = (sub.submission_data as Record<string, string>)[type];
                                  return (
                                    <a key={type} href={url} target="_blank" rel="noopener noreferrer"
                                      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.15s' }}
                                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.16)')}
                                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}>
                                      <span>{TYPE_META[type]?.icon}</span>
                                      {TYPE_META[type]?.label ?? type}
                                      <ExternalLink size={11} />
                                    </a>
                                  );
                                })}
                              </div>
                            )}

                            {/* Feedback */}
                            {sub.feedback && (
                              <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                  <MessageSquare size={13} color="#34d399" />
                                  <p style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>Reviewer Feedback</p>
                                </div>
                                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{sub.feedback}</p>
                              </div>
                            )}

                            {/* Edit button — only if submitted/reviewed and event still running */}
                            {sub.status !== 'approved' && sub.status !== 'disqualified' && (
                              <Button size="sm" variant="secondary" leftIcon={<Edit3 size={13} />}
                                onClick={() => router.push(`/student/hackathons/${sub.hackathon_id}/submit`)}>
                                Edit Submission
                              </Button>
                            )}
                            {(sub.status === 'approved' || sub.status === 'disqualified') && (
                              <p style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
                                {sub.status === 'approved' ? '✅ Submission has been approved — no further edits allowed.' : '❌ Submission was disqualified by the event manager.'}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
