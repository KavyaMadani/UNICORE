'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getManagerHackathons, type Hackathon } from '@/lib/db';
import {
  Zap, Plus, Users, Trophy, Calendar, Settings, Eye,
  School, Tag, ChevronRight, Clock, TrendingUp, Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

const STATUS_BG: Record<string, { bg: string; border: string }> = {
  active:   { bg: 'rgba(16,185,129,0.05)',  border: 'rgba(16,185,129,0.18)' },
  upcoming: { bg: 'rgba(99,102,241,0.05)',  border: 'rgba(99,102,241,0.18)' },
  ended:    { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.07)' },
  draft:    { bg: 'rgba(251,191,36,0.04)',  border: 'rgba(251,191,36,0.15)' },
};

export default function ManagerHackathonsPage() {
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended' | 'draft'>('all');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const data = await getManagerHackathons(session.user.id);
        setHackathons(data);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = hackathons.filter(h => filter === 'all' || h.status === filter);
  const counts = {
    all: hackathons.length,
    active: hackathons.filter(h => h.status === 'active').length,
    upcoming: hackathons.filter(h => h.status === 'upcoming').length,
    ended: hackathons.filter(h => h.status === 'ended').length,
    draft: hackathons.filter(h => h.status === 'draft').length,
  };

  return (
    <DashboardLayout
      title="My Hackathons"
      subtitle="Manage and monitor all your hackathon events"
      actions={
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => router.push('/manager/hackathons/create')}>
          Create Hackathon
        </Button>
      }
    >
      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {[
          { label: 'Total Events', value: hackathons.length, icon: <Zap size={18} color="#818cf8" />, color: '#818cf8' },
          { label: 'Live Now', value: counts.active, icon: <TrendingUp size={18} color="#34d399" />, color: '#34d399' },
          { label: 'Upcoming', value: counts.upcoming, icon: <Clock size={18} color="#60a5fa" />, color: '#60a5fa' },
          { label: 'Completed', value: counts.ended, icon: <Trophy size={18} color="#fbbf24" />, color: '#fbbf24' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div style={{ padding: '22px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {(['all', 'active', 'upcoming', 'ended', 'draft'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '9px 18px', borderRadius: 12, fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
            background: filter === f ? 'rgba(99,102,241,0.18)' : 'transparent',
            color: filter === f ? '#a5b4fc' : '#64748b',
            border: filter === f ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)',
            transition: 'all 0.15s ease',
          }}>{f} {filter === f && <span style={{ opacity: 0.7 }}>({counts[f]})</span>}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading hackathons…
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filtered.map((hack, i) => {
              const theme = STATUS_BG[hack.status] ?? STATUS_BG.ended;
              return (
                <motion.div key={hack.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <div style={{ padding: '32px 36px', borderRadius: 22, background: theme.bg, border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
                      <div style={{ width: 60, height: 60, borderRadius: 18, flexShrink: 0, background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.12))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={26} color="#818cf8" />
                      </div>
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: 21, fontWeight: 800, color: '#f1f5f9' }}>{hack.title}</h3>
                          <Badge variant={hack.status} dot={hack.status === 'active'}>{hack.status}</Badge>
                          {hack.is_featured && <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', padding: '3px 10px', borderRadius: 99, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>⭐ Featured</span>}
                        </div>
                        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16, lineHeight: 1.6 }}>{hack.subtitle}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <School size={13} color="#818cf8" />
                            <span style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 600 }}>{hack.college}</span>
                          </div>
                          {hack.organizer && <span style={{ fontSize: 13, color: '#64748b' }}>· {hack.organizer}</span>}
                        </div>
                        {hack.tags?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                            <Tag size={12} color="#334155" />
                            {hack.tags.slice(0, 4).map(tag => (
                              <span key={tag} style={{ fontSize: 12, fontWeight: 500, color: '#64748b', padding: '3px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>{tag}</span>
                            ))}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          {[
                            { icon: <Users size={14} color="#60a5fa" />, value: hack.participant_count?.toLocaleString() ?? '0', label: 'Participants' },
                            { icon: <Trophy size={14} color="#fbbf24" />, value: hack.prize_pool ?? 'TBD', label: 'Prize Pool' },
                            { icon: <Calendar size={14} color="#34d399" />, value: hack.start_date ? formatDate(hack.start_date) : 'TBD', label: 'Start Date' },
                            { icon: <Calendar size={14} color="#f87171" />, value: hack.end_date ? formatDate(hack.end_date) : 'TBD', label: 'End Date' },
                          ].map(stat => (
                            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{stat.icon}<span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{stat.value}</span></div>
                              <span style={{ fontSize: 11, color: '#475569', paddingLeft: 19 }}>{stat.label}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <button onClick={() => router.push(`/manager/hackathons/${hack.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                            <Eye size={14} /> View Details
                          </button>
                          <button onClick={() => router.push(`/manager/hackathons/${hack.id}/edit`)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                            <Settings size={14} /> Manage <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
          <Zap size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No {filter !== 'all' ? filter : ''} hackathons yet</p>
          <p style={{ fontSize: 14, color: '#334155', marginBottom: 24 }}>Create your first hackathon — students will see it immediately.</p>
          <Button onClick={() => router.push('/manager/hackathons/create')} leftIcon={<Plus size={14} />}>Create Hackathon</Button>
        </div>
      )}
    </DashboardLayout>
  );
}
