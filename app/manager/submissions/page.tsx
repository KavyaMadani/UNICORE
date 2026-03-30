'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import {
  getSubmissionsForHackathonFull, reviewSubmission, TYPE_META,
  type FullSubmission, type SubmissionType
} from '@/lib/submissions';
import { getManagerHackathons, type Hackathon } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import {
  FileText, ExternalLink, CheckCircle, XCircle, Star, Loader2,
  Clock, AlertCircle, Search, Download, Eye, MessageSquare,
  ChevronDown, ChevronUp, Filter, BarChart2, Users,
  Award, X, Check, Edit3, Zap, Package, Globe
} from 'lucide-react';

const STATUS_STYLES = {
  submitted:    { bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)',  label: 'Submitted',    color: '#60a5fa' },
  reviewed:     { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  label: 'Under Review', color: '#fbbf24' },
  approved:     { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  label: 'Approved',     color: '#34d399' },
  disqualified: { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',   label: 'Disqualified', color: '#f87171' },
};

function Toast({ msg, type, onClose }: { msg: string; type: 'ok' | 'err'; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16 }}
      style={{
        position: 'fixed', top: 24, right: 24, zIndex: 9999,
        padding: '13px 22px', borderRadius: 14, fontWeight: 700, fontSize: 13,
        display: 'flex', alignItems: 'center', gap: 10,
        background: type === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        border: `1px solid ${type === 'ok' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
        color: type === 'ok' ? '#34d399' : '#f87171',
        backdropFilter: 'blur(10px)',
      }}>
      {type === 'ok' ? <CheckCircle size={14} /> : <XCircle size={14} />} {msg}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6, marginLeft: 4 }}><X size={12} /></button>
    </motion.div>
  );
}

// Inline review form — sits at bottom of each submission card
function ReviewPanel({
  sub, processingId, onAction
}: {
  sub: FullSubmission;
  processingId: string | null;
  onAction: (id: string, status: 'approved' | 'disqualified' | 'reviewed', score?: number, feedback?: string) => void;
}) {
  const [score, setScore] = useState<number>(sub.score ?? 0);
  const [feedback, setFeedback] = useState(sub.feedback ?? '');
  const [tab, setTab] = useState<'score' | 'feedback'>('score');

  return (
    <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['score', 'feedback'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
            background: tab === t ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
            border: tab === t ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)',
            color: tab === t ? '#a5b4fc' : '#64748b',
            textTransform: 'capitalize',
          }}>{t === 'score' ? '⭐ Score' : '📝 Feedback'}</button>
        ))}
      </div>

      {tab === 'score' ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <input
              type="range" min={0} max={10} step={0.5} value={score}
              onChange={e => setScore(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#818cf8' }}
            />
            <div style={{ minWidth: 56, textAlign: 'center', padding: '7px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#a5b4fc' }}>{score}</span>
              <span style={{ fontSize: 10, color: '#475569' }}>/10</span>
            </div>
          </div>
          {/* Visual score ticks */}
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} style={{ flex: 1, height: 4, borderRadius: 99, background: idx < score ? '#818cf8' : 'rgba(255,255,255,0.07)', transition: 'background 0.2s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#334155' }}>Needs Work</span>
            <span style={{ fontSize: 10, color: '#334155' }}>Excellent</span>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Write feedback for the participant (optional). They will see this after review."
            rows={3}
            className="input-glass"
            style={{ resize: 'vertical', width: '100%' }}
            maxLength={500}
          />
          <p style={{ fontSize: 10, color: '#334155', textAlign: 'right', marginTop: 2 }}>{feedback.length}/500</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => onAction(sub.id, 'reviewed', score, feedback || undefined)}
          disabled={processingId === sub.id}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s', opacity: processingId === sub.id ? 0.5 : 1 }}
        >
          <Eye size={13} /> Mark Reviewed
        </button>
        <button
          onClick={() => onAction(sub.id, 'approved', score, feedback || undefined)}
          disabled={processingId === sub.id}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s', opacity: processingId === sub.id ? 0.5 : 1 }}
        >
          <Check size={13} /> Approve
        </button>
        <button
          onClick={() => onAction(sub.id, 'disqualified', undefined, feedback || undefined)}
          disabled={processingId === sub.id}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s', opacity: processingId === sub.id ? 0.5 : 1 }}
        >
          <X size={13} /> Disqualify
        </button>
        {processingId === sub.id && <Loader2 size={18} color="#818cf8" style={{ animation: 'spin 0.8s linear infinite', alignSelf: 'center' }} />}
      </div>
    </div>
  );
}

export default function ManagerSubmissionsPage() {
  const [submissions, setSubmissions] = useState<FullSubmission[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHack, setSelectedHack] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'reviewed' | 'approved' | 'disqualified'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score_desc' | 'score_asc'>('newest');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadSubmissions = useCallback(async (hacks: Hackathon[], hackId: string) => {
    const target = hackId === 'all' ? hacks : hacks.filter(h => h.id === hackId);
    const all = (await Promise.all(target.map(h => getSubmissionsForHackathonFull(h.id)))).flat();
    setSubmissions(all);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;
      setManagerId(uid);
      const hacks = await getManagerHackathons(uid);
      setHackathons(hacks);
      await loadSubmissions(hacks, 'all');
      setLoading(false);
    })();
  }, [loadSubmissions]);

  const handleHackChange = async (hackId: string) => {
    setSelectedHack(hackId);
    setLoading(true);
    await loadSubmissions(hackathons, hackId);
    setLoading(false);
  };

  const handleAction = async (
    id: string,
    status: 'approved' | 'disqualified' | 'reviewed',
    score?: number,
    feedback?: string
  ) => {
    setProcessingId(id);
    const { error } = await reviewSubmission(id, status, score, feedback);
    setProcessingId(null);
    if (error) { showToast('Error: ' + error, 'err'); return; }
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, score: score ?? s.score, feedback: feedback ?? s.feedback } : s));
    showToast(status === 'approved' ? '✅ Approved!' : status === 'disqualified' ? '❌ Disqualified.' : '🔍 Marked as reviewed.', status === 'disqualified' ? 'err' : 'ok');
  };

  // Filter + sort
  const displayed = submissions
    .filter(s => {
      if (filter !== 'all' && s.status !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return s.project_title?.toLowerCase().includes(q) ||
          s.team_name?.toLowerCase().includes(q) ||
          (s as FullSubmission & { submitter?: { name: string } }).submitter?.name?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      if (sortBy === 'oldest') return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
      if (sortBy === 'score_desc') return (b.score ?? -1) - (a.score ?? -1);
      return (a.score ?? 99) - (b.score ?? 99);
    });

  const counts = {
    all: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    reviewed: submissions.filter(s => s.status === 'reviewed').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    disqualified: submissions.filter(s => s.status === 'disqualified').length,
  };
  const avgScore = submissions.filter(s => s.score != null).length
    ? (submissions.reduce((a, s) => a + (s.score ?? 0), 0) / submissions.filter(s => s.score != null).length).toFixed(1)
    : null;

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ['Project', 'Team', 'Submitter', 'Hackathon', 'Status', 'Score', 'Submitted At', ...Object.keys(TYPE_META)],
      ...displayed.map(s => [
        s.project_title,
        s.team_name ?? '',
        (s as FullSubmission & { submitter?: { name: string; email: string } }).submitter?.name ?? '',
        s.hackathon_title,
        s.status,
        s.score?.toString() ?? '',
        new Date(s.submitted_at).toLocaleString(),
        ...Object.keys(TYPE_META).map(t => (s.submission_data as Record<string, string>)?.[t] ?? ''),
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'submissions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Submissions" subtitle="Review, score and manage participant submissions">

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total',       value: counts.all,       color: '#818cf8', icon: <FileText size={16} /> },
          { label: 'Unreviewed', value: counts.submitted,  color: '#60a5fa', icon: <AlertCircle size={16} /> },
          { label: 'In Review',  value: counts.reviewed,   color: '#fbbf24', icon: <Eye size={16} /> },
          { label: 'Approved',   value: counts.approved,   color: '#34d399', icon: <Award size={16} /> },
          { label: 'Avg Score',  value: loading ? '—' : (avgScore ? `${avgScore}/10` : '—'), color: '#f59e0b', icon: <Star size={16} /> },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div style={{ padding: '20px 22px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -16, right: -16, width: 64, height: 64, borderRadius: '50%', background: `${s.color}12`, pointerEvents: 'none' }} />
              <div style={{ color: s.color, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', marginBottom: 2 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Hackathon selector */}
        <select
          value={selectedHack}
          onChange={e => handleHackChange(e.target.value)}
          className="input-glass"
          style={{ paddingTop: 9, paddingBottom: 9, paddingLeft: 14, paddingRight: 14, width: 'auto', minWidth: 200, fontSize: 13 }}
        >
          <option value="all">All Hackathons ({hackathons.length})</option>
          {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
        </select>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><Search size={14} /></span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search project, team, submitter…"
            className="input-glass"
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="input-glass" style={{ paddingTop: 9, paddingBottom: 9, paddingLeft: 12, paddingRight: 12, width: 'auto', fontSize: 13 }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="score_desc">Score: High → Low</option>
          <option value="score_asc">Score: Low → High</option>
        </select>

        {/* Export */}
        <Button size="sm" variant="secondary" leftIcon={<Download size={13} />} onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['all', 'submitted', 'reviewed', 'approved', 'disqualified'] as const).map(f => {
          const styles = f !== 'all' ? STATUS_STYLES[f] : null;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', textTransform: 'capitalize',
              background: filter === f ? (styles?.bg ?? 'rgba(99,102,241,0.18)') : 'transparent',
              color: filter === f ? (styles?.color ?? '#a5b4fc') : '#64748b',
              border: filter === f ? `1px solid ${styles?.border ?? 'rgba(99,102,241,0.3)'}` : '1px solid rgba(255,255,255,0.07)',
              transition: 'all 0.15s',
            }}>
              {f === 'all' ? `All (${counts.all})` : `${STATUS_STYLES[f].label} (${counts[f]})`}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading submissions…
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Zap size={48} style={{ margin: '0 auto 20px', opacity: 0.15 }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#475569', marginBottom: 8 }}>No submissions found</p>
          <p style={{ fontSize: 13, color: '#334155' }}>
            {search ? `No results for "${search}"` : filter !== 'all' ? `No ${STATUS_STYLES[filter as keyof typeof STATUS_STYLES]?.label} submissions.` : 'Submissions will appear here once participants submit their projects.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayed.map((sub, i) => {
            const cfg = STATUS_STYLES[sub.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.submitted;
            const isOpen = expanded === sub.id;
            const types = Object.keys(sub.submission_data ?? {}).filter(k => (sub.submission_data as Record<string, string>)[k]) as SubmissionType[];
            const submitter = (sub as FullSubmission & { submitter?: { name: string; email: string; college: string } }).submitter;

            return (
              <motion.div key={sub.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }}>
                <div style={{
                  borderRadius: 22, overflow: 'hidden',
                  background: isOpen ? cfg.bg : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${isOpen ? cfg.border : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.2s',
                }}>
                  {/* Header */}
                  <div style={{ padding: '22px 28px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}
                    onClick={() => setExpanded(isOpen ? null : sub.id)}>
                    {/* Status indicator */}
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0, marginTop: 8, boxShadow: `0 0 8px ${cfg.color}` }} />

                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>{sub.project_title}</h3>
                        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>{cfg.label}</span>
                        {sub.score != null && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                            <Star size={10} /> {sub.score}/10
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#64748b' }}>
                        {submitter && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            👤 <strong style={{ color: '#94a3b8' }}>{submitter.name}</strong>
                            {submitter.college && <span>· {submitter.college}</span>}
                          </span>
                        )}
                        {sub.team_name && <span style={{ color: '#818cf8', fontWeight: 600 }}>👥 {sub.team_name}</span>}
                        <span style={{ color: '#475569' }}>📋 {sub.hackathon_title}</span>
                        <span>🕒 {new Date(sub.submitted_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Deliverable type pills + expand toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                      {types.slice(0, 3).map(type => (
                        <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#64748b' }}>
                          {TYPE_META[type]?.icon}
                          <span>{TYPE_META[type]?.label ?? type}</span>
                        </span>
                      ))}
                      {types.length > 3 && <span style={{ fontSize: 11, color: '#475569' }}>+{types.length - 3}</span>}
                      <div style={{ color: '#475569', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded review area */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <div style={{ padding: '0 28px 28px' }}>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

                            {/* Submitter profile */}
                            {submitter && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span style={{ fontSize: 16 }}>👤</span>
                                </div>
                                <div>
                                  <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>{submitter.name}</p>
                                  <p style={{ fontSize: 12, color: '#64748b' }}>{submitter.email} {submitter.college && `· ${submitter.college}`}</p>
                                </div>
                              </div>
                            )}

                            {/* Description */}
                            {sub.description && (
                              <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>PROJECT DESCRIPTION</p>
                                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{sub.description}</p>
                              </div>
                            )}

                            {/* Deliverables */}
                            {types.length > 0 && (
                              <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10 }}>DELIVERABLES</p>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                  {types.map(type => {
                                    const url = (sub.submission_data as Record<string, string>)[type];
                                    return (
                                      <a key={type} href={url} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.15s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(99,102,241,0.12)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(99,102,241,0.3)'; (e.currentTarget as HTMLAnchorElement).style.color = '#a5b4fc'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8'; }}>
                                        <span style={{ fontSize: 16 }}>{TYPE_META[type]?.icon}</span>
                                        <span>{TYPE_META[type]?.label ?? type}</span>
                                        <ExternalLink size={12} />
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Existing feedback display */}
                            {sub.feedback && sub.status !== 'submitted' && (
                              <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                  <MessageSquare size={13} color="#818cf8" />
                                  <p style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc' }}>Your Feedback (visible to participant)</p>
                                </div>
                                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{sub.feedback}</p>
                              </div>
                            )}

                            {/* Review panel */}
                            <ReviewPanel sub={sub} processingId={processingId} onAction={handleAction} />
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

      {/* Bottom summary */}
      {!loading && displayed.length > 0 && (
        <div style={{ marginTop: 24, padding: '16px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Showing <strong style={{ color: '#94a3b8' }}>{displayed.length}</strong> of <strong style={{ color: '#94a3b8' }}>{submissions.length}</strong> submissions
            {counts.submitted > 0 && <span style={{ color: '#fbbf24', marginLeft: 10 }}>· ⚠ {counts.submitted} awaiting review</span>}
          </p>
          <Button size="sm" variant="secondary" leftIcon={<Download size={13} />} onClick={exportCSV}>Export CSV</Button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
