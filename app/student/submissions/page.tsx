'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getMySubmissions, type Submission } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { FileText, CheckCircle, Clock, XCircle, Star, Loader2, GitBranch, ExternalLink } from 'lucide-react';

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
  reviewed:  { label: 'Under Review', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
  approved:  { label: 'Approved', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
  disqualified: { label: 'Disqualified', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
};

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const subs = await getMySubmissions(session.user.id);
        setSubmissions(subs);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <DashboardLayout title="My Submissions" subtitle="Track your project submissions across all hackathons">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 36 }}>
        {[
          { label: 'Total', value: submissions.length, icon: <FileText size={18} color="#818cf8" /> },
          { label: 'Under Review', value: submissions.filter(s => s.status === 'reviewed').length, icon: <Clock size={18} color="#fbbf24" /> },
          { label: 'Approved', value: submissions.filter(s => s.status === 'approved').length, icon: <CheckCircle size={18} color="#34d399" /> },
          { label: 'Avg Score', value: submissions.filter(s => s.score).length ? `${(submissions.reduce((a, s) => a + (s.score ?? 0), 0) / submissions.filter(s => s.score).length).toFixed(1)}/10` : '—', icon: <Star size={18} color="#fbbf24" /> },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div style={{ padding: '22px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading submissions…
        </div>
      ) : submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <FileText size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No submissions yet</p>
          <p style={{ fontSize: 14, color: '#64748b' }}>Submit your project during an active hackathon to see it here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {submissions.map((sub, i) => {
            const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.submitted;
            return (
              <motion.div key={sub.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{sub.project_title}</h3>
                      <p style={{ fontSize: 13, color: '#64748b' }}>Hackathon: {sub.hackathon_title}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {sub.score !== null && sub.score !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                          <Star size={13} color="#fbbf24" />
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>{sub.score}/10</span>
                        </div>
                      )}
                      <div style={{ padding: '6px 16px', borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 12, fontWeight: 700, color: cfg.color }}>
                        {cfg.label}
                      </div>
                    </div>
                  </div>
                  {sub.description && <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>{sub.description}</p>}
                  {sub.team_name && <p style={{ fontSize: 12, color: '#475569', marginBottom: 12 }}>Team: <span style={{ color: '#818cf8', fontWeight: 600 }}>{sub.team_name}</span></p>}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                    {sub.github_url && (
                      <a href={sub.github_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94a3b8', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                        <GitBranch size={13} /> GitHub
                      </a>
                    )}
                    {sub.demo_url && (
                      <a href={sub.demo_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                        <ExternalLink size={13} /> Demo
                      </a>
                    )}
                  </div>
                  {sub.feedback && (
                    <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Feedback</p>
                      <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{sub.feedback}</p>
                    </div>
                  )}
                  <p style={{ fontSize: 11, color: '#334155', marginTop: 12 }}>Submitted: {new Date(sub.submitted_at).toLocaleString()}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
