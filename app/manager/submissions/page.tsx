'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_SUBMISSIONS } from '@/lib/mock-data';
import { FileText, ExternalLink, Check, X, Eye, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type SubmissionStatus = 'pending' | 'submitted' | 'reviewed' | 'disqualified';

export default function ManagerSubmissionsPage() {
  const [submissions, setSubmissions] = useState(
    MOCK_SUBMISSIONS.map(s => ({ ...s }))
  );
  const [selectedScore, setSelectedScore] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const approveSubmission = (id: string, projectTitle: string) => {
    const score = selectedScore[id] ?? 85;
    setSubmissions(prev => prev.map(s =>
      s.id === id ? { ...s, status: 'reviewed' as const, score, feedback: 'Approved by judge. Good work!' } : s
    ));
    showToast(`"${projectTitle}" approved with score ${score}/100`);
  };

  const disqualifySubmission = (id: string, projectTitle: string) => {
    setSubmissions(prev => prev.map(s =>
      s.id === id ? { ...s, status: 'disqualified' as const, feedback: 'Disqualified by judge.' } : s
    ));
    showToast(`"${projectTitle}" disqualified`, 'error');
  };

  const statusCounts = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    reviewed: submissions.filter(s => s.status === 'reviewed').length,
    disqualified: submissions.filter(s => s.status === 'disqualified').length,
  };

  const getBadgeVariant = (status: string) => {
    if (status === 'reviewed') return 'active';
    if (status === 'submitted') return 'upcoming';
    if (status === 'disqualified') return 'ended';
    return 'draft';
  };

  return (
    <DashboardLayout title="Submissions" subtitle="Review and manage project submissions">

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
              background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: toast.type === 'success' ? '#34d399' : '#f87171',
              fontSize: 13, fontWeight: 500, backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {[
          { label: 'Total Submissions', value: statusCounts.total, icon: <FileText size={20} color="#818cf8" />, change: 'All time', dir: 'neutral' as const },
          { label: 'Pending Review', value: statusCounts.submitted, icon: <AlertCircle size={20} color="#60a5fa" />, change: 'Awaiting review', dir: 'neutral' as const },
          { label: 'Reviewed', value: statusCounts.reviewed, icon: <CheckCircle size={20} color="#34d399" />, change: 'Completed', dir: 'up' as const },
          { label: 'Disqualified', value: statusCounts.disqualified, icon: <XCircle size={20} color="#f87171" />, change: 'Removed', dir: 'neutral' as const },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      <Card>
        <div style={{ marginBottom: 28 }}>
          <CardTitle>All Submissions</CardTitle>
          <CardSubtitle>Review, score, and manage submitted projects</CardSubtitle>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {submissions.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: '22px 24px', borderRadius: 18,
                background: 'rgba(255,255,255,0.025)',
                border: sub.status === 'reviewed'
                  ? '1px solid rgba(16,185,129,0.2)'
                  : sub.status === 'disqualified'
                    ? '1px solid rgba(239,68,68,0.15)'
                    : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{sub.projectTitle}</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>
                    by <span style={{ color: '#818cf8', fontWeight: 600 }}>{sub.teamName}</span> · {sub.hackathonTitle}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {sub.score !== undefined && (
                    <div style={{
                      textAlign: 'center', padding: '8px 16px', borderRadius: 12,
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#34d399', lineHeight: 1 }}>{sub.score}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>/ 100</div>
                    </div>
                  )}
                  <Badge variant={getBadgeVariant(sub.status)}>{sub.status}</Badge>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>{sub.description}</p>

              {/* Feedback */}
              {sub.feedback && (
                <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 16, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>Judge Feedback: </span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{sub.feedback}</span>
                </div>
              )}

              {/* Actions row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                  }}>
                    <ExternalLink size={12} /> GitHub
                  </button>
                </a>
                {sub.demoUrl && (
                  <a href={sub.demoUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#94a3b8', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    }}>
                      <Eye size={12} /> Live Demo
                    </button>
                  </a>
                )}

                {sub.status === 'submitted' && (
                  <>
                    {/* Score setter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
                      <Star size={12} color="#818cf8" />
                      <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>Score:</span>
                      <input
                        type="number"
                        min={0} max={100}
                        value={selectedScore[sub.id] ?? 85}
                        onChange={e => setSelectedScore(prev => ({ ...prev, [sub.id]: Number(e.target.value) }))}
                        style={{
                          width: 52, padding: '2px 6px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.2)',
                          color: '#a5b4fc', fontFamily: 'inherit', textAlign: 'center',
                        }}
                      />
                    </div>

                    <button
                      onClick={() => approveSubmission(sub.id, sub.projectTitle)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
                        background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                        color: '#34d399', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.2)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.12)'; }}
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => disqualifySubmission(sub.id, sub.projectTitle)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
                    >
                      <X size={14} /> Disqualify
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}

          {submissions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#475569' }}>
              <FileText size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: 15, fontWeight: 500 }}>No submissions yet</p>
            </div>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
