'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getManagerHackathons, getSubmissionsForHackathon, updateSubmissionStatus, type Hackathon, type Submission } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { FileText, ExternalLink, Check, X, Eye, Star, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const STATUS_STYLES = {
  submitted:    { bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)',  label: 'Submitted',    color: '#60a5fa' },
  reviewed:     { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  label: 'Under Review', color: '#fbbf24' },
  approved:     { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  label: 'Approved',     color: '#34d399' },
  disqualified: { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',   label: 'Disqualified', color: '#f87171' },
};

export default function ManagerSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [hackathonId, setHackathonId] = useState<string>('all');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScore, setSelectedScore] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'reviewed' | 'approved'>('all');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (uid) {
        const hacks = await getManagerHackathons(uid);
        setHackathons(hacks);
        if (hacks.length > 0) {
          const allSubs = (await Promise.all(hacks.map(h => getSubmissionsForHackathon(h.id)))).flat();
          setSubmissions(allSubs);
        }
      }
      setLoading(false);
    })();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (subId: string, score: number) => {
    const { error } = await updateSubmissionStatus(subId, 'approved', undefined, score);
    if (error) { showToast('Error: ' + error, 'error'); return; }
    setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: 'approved', score } : s));
    showToast('Submission approved!', 'success');
  };

  const handleDisqualify = async (subId: string) => {
    const { error } = await updateSubmissionStatus(subId, 'disqualified');
    if (error) { showToast('Error: ' + error, 'error'); return; }
    setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: 'disqualified' } : s));
    showToast('Submission disqualified.', 'error');
  };

  const filteredSubs = submissions.filter(s => {
    const matchHack = hackathonId === 'all' || s.hackathon_id === hackathonId;
    const matchFilter = filter === 'all' || s.status === filter;
    return matchHack && matchFilter;
  });

  const approved = submissions.filter(s => s.status === 'approved').length;
  const pending = submissions.filter(s => s.status === 'submitted').length;
  const avgScore = submissions.filter(s => s.score != null).reduce((a, s) => a + (s.score ?? 0), 0) / (submissions.filter(s => s.score != null).length || 1);

  return (
    <DashboardLayout title="Submissions" subtitle="Review and score submissions for your hackathons">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '11px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.type === 'success' ? '#34d399' : '#f87171', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)' }}>
            {toast.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 32 }}>
        {[
          { label: 'Total Submissions', value: loading ? '—' : submissions.length, icon: <FileText size={19} className="text-indigo-400" />, change: 'All hackathons', dir: 'neutral' as const },
          { label: 'Pending Review', value: loading ? '—' : pending, icon: <AlertCircle size={19} className="text-amber-400" />, change: 'Need attention', dir: pending > 0 ? 'up' as const : 'neutral' as const },
          { label: 'Approved', value: loading ? '—' : approved, icon: <Check size={19} className="text-emerald-400" />, change: 'Scored & approved', dir: 'up' as const },
          { label: 'Avg Score', value: loading ? '—' : submissions.filter(s => s.score != null).length ? `${avgScore.toFixed(1)}/10` : '—', icon: <Star size={19} className="text-blue-400" />, change: 'Out of 10', dir: 'neutral' as const },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={hackathonId} onChange={e => setHackathonId(e.target.value)} className="input-glass" style={{ paddingLeft: 14, paddingRight: 14, paddingTop: 9, paddingBottom: 9, width: 'auto', minWidth: 200 }}>
          <option value="all">All Hackathons</option>
          {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'submitted', 'reviewed', 'approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 15px', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', background: filter === f ? 'rgba(99,102,241,0.18)' : 'transparent', color: filter === f ? '#a5b4fc' : '#64748b', border: filter === f ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)', transition: 'all 0.15s ease' }}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading submissions…
        </div>
      ) : filteredSubs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <FileText size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No submissions yet</p>
          <p style={{ fontSize: 13, color: '#64748b' }}>Submissions will appear here once participants submit their projects.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {filteredSubs.map((sub, i) => {
            const cfg = STATUS_STYLES[sub.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.submitted;
            return (
              <motion.div key={sub.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div style={{ padding: '24px 28px', borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{sub.project_title}</h3>
                      <p style={{ fontSize: 12, color: '#64748b' }}>{sub.hackathon_title}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {sub.score != null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                          <Star size={12} color="#fbbf24" /><span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>{sub.score}/10</span>
                        </div>
                      )}
                      <div style={{ padding: '5px 14px', borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 12, fontWeight: 700, color: cfg.color }}>
                        {cfg.label}
                      </div>
                    </div>
                  </div>
                  {sub.description && <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 14 }}>{sub.description}</p>}
                  {sub.team_name && <p style={{ fontSize: 12, color: '#475569', marginBottom: 12 }}>Team: <span style={{ color: '#818cf8', fontWeight: 600 }}>{sub.team_name}</span></p>}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                    {sub.github_url && (
                      <a href={sub.github_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94a3b8', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                        GitHub
                      </a>
                    )}
                    {sub.demo_url && (
                      <a href={sub.demo_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                        <ExternalLink size={12} /> Demo
                      </a>
                    )}
                  </div>

                  {/* Score + Action */}
                  {sub.status === 'submitted' && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <input type="number" min="0" max="10" step="0.5" placeholder="Score (0-10)" value={selectedScore[sub.id] ?? ''} onChange={e => setSelectedScore(prev => ({ ...prev, [sub.id]: parseFloat(e.target.value) }))}
                        className="input-glass" style={{ width: 130, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8 }} />
                      <button onClick={() => handleApprove(sub.id, selectedScore[sub.id] ?? 0)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                        <Check size={13} /> Approve
                      </button>
                      <button onClick={() => handleDisqualify(sub.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                        <X size={13} /> Disqualify
                      </button>
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
