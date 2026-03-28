'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { getPublicHackathons, type Hackathon } from '@/lib/db';
import {
  Zap, Users, Trophy, Calendar, School, Search, TrendingUp, Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function OrgHackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended' | 'draft'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicHackathons().then(data => {
      setHackathons(data);
      setLoading(false);
    });
  }, []);

  const filtered = hackathons.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.title?.toLowerCase().includes(q) || h.college?.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || h.status === filter;
    return matchSearch && matchFilter;
  });

  const totalParticipants = hackathons.reduce((s, h) => s + (h.participant_count ?? 0), 0);

  return (
    <DashboardLayout title="Hackathons" subtitle="All events managed by your organization">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 36 }}>
        {[
          { label: 'Total Hackathons', value: hackathons.length, icon: <Zap size={17} color="#818cf8" />, color: '#818cf8' },
          { label: 'Active Now', value: hackathons.filter(h => h.status === 'active').length, icon: <TrendingUp size={17} color="#34d399" />, color: '#34d399' },
          { label: 'Total Participants', value: totalParticipants.toLocaleString(), icon: <Users size={17} color="#60a5fa" />, color: '#60a5fa' },
          { label: 'Upcoming Events', value: hackathons.filter(h => h.status === 'upcoming').length, icon: <Calendar size={17} color="#fbbf24" />, color: '#fbbf24' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div style={{ padding: '20px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}><Search size={13} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or college…" className="input-glass" style={{ paddingLeft: 38, paddingRight: 14, paddingTop: 9, paddingBottom: 9, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'active', 'upcoming', 'ended'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 15px', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', background: filter === f ? 'rgba(99,102,241,0.18)' : 'transparent', color: filter === f ? '#a5b4fc' : '#64748b', border: filter === f ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)', transition: 'all 0.15s ease' }}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading hackathons…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {filtered.map((hack, i) => {
            const tags: string[] = Array.isArray(hack.tags) ? hack.tags : [];
            return (
              <motion.div key={hack.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div style={{ padding: '26px 30px', borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, flexShrink: 0, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={22} color="#818cf8" />
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{hack.title}</h3>
                        <Badge variant={hack.status} dot={hack.status === 'active'}>{hack.status}</Badge>
                        {hack.is_featured && <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', padding: '3px 10px', borderRadius: 99, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>⭐ Featured</span>}
                      </div>
                      {hack.subtitle && <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{hack.subtitle}</p>}
                      {hack.college && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <School size={12} color="#818cf8" /><span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 600 }}>{hack.college}</span>
                          </div>
                          {hack.organizer && <span style={{ fontSize: 12, color: '#475569' }}>{hack.organizer}</span>}
                        </div>
                      )}
                      {tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                          {tags.slice(0, 4).map(tag => <span key={tag} style={{ fontSize: 11, color: '#64748b', padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>{tag}</span>)}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={13} color="#60a5fa" /><span style={{ fontSize: 13, color: '#94a3b8' }}>{hack.participant_count ?? 0} participants</span></div>
                        {hack.prize_pool && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Trophy size={13} color="#fbbf24" /><span style={{ fontSize: 13, color: '#94a3b8' }}>{hack.prize_pool}</span></div>}
                        {hack.start_date && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} color="#34d399" /><span style={{ fontSize: 13, color: '#94a3b8' }}>{formatDate(hack.start_date)}</span></div>}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
              <Zap size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ fontSize: 15 }}>No hackathons found</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
