'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_HACKATHONS } from '@/lib/mock-data';
import {
  Zap, Users, Trophy, Calendar, School,
  Search, TrendingUp,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const STATUS_BG: Record<string, { bg: string; border: string }> = {
  active:   { bg: 'rgba(16,185,129,0.05)',  border: 'rgba(16,185,129,0.18)' },
  upcoming: { bg: 'rgba(99,102,241,0.05)',  border: 'rgba(99,102,241,0.18)' },
  ended:    { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.07)' },
  draft:    { bg: 'rgba(251,191,36,0.04)',  border: 'rgba(251,191,36,0.15)' },
};

export default function OrgHackathonsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended' | 'draft'>('all');

  const filtered = MOCK_HACKATHONS.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.title.toLowerCase().includes(q) || h.college.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || h.status === filter;
    return matchSearch && matchFilter;
  });

  const totalParticipants = MOCK_HACKATHONS.reduce((s, h) => s + h.participantCount, 0);
  const totalPrize = MOCK_HACKATHONS.length;

  return (
    <DashboardLayout title="Hackathons" subtitle="All events managed by your organization">

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {[
          { label: 'Total Hackathons', value: MOCK_HACKATHONS.length, icon: <Zap size={18} color="#818cf8" />, color: '#818cf8' },
          { label: 'Active Now', value: MOCK_HACKATHONS.filter(h => h.status === 'active').length, icon: <TrendingUp size={18} color="#34d399" />, color: '#34d399' },
          { label: 'Total Participants', value: totalParticipants.toLocaleString(), icon: <Users size={18} color="#60a5fa" />, color: '#60a5fa' },
          { label: 'Upcoming Events', value: MOCK_HACKATHONS.filter(h => h.status === 'upcoming').length, icon: <Calendar size={18} color="#fbbf24" />, color: '#fbbf24' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div style={{ padding: '22px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>
            <Search size={14} />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or college..."
            className="input-glass"
            style={{ paddingLeft: 40, paddingRight: 14, paddingTop: 10, paddingBottom: 10, width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'active', 'upcoming', 'ended', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '9px 16px', borderRadius: 11, fontFamily: 'inherit',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                background: filter === f ? 'rgba(99,102,241,0.18)' : 'transparent',
                color: filter === f ? '#a5b4fc' : '#64748b',
                border: filter === f ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.15s ease',
              }}
            >{f}</button>
          ))}
        </div>
        <span style={{ fontSize: 13, color: '#475569', flexShrink: 0 }}>{filtered.length} events</span>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {filtered.map((hack, i) => {
          const theme = STATUS_BG[hack.status] ?? STATUS_BG.ended;
          return (
            <motion.div key={hack.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div style={{ padding: '30px 34px', borderRadius: 22, background: theme.bg, border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, flexWrap: 'wrap' }}>

                  {/* Icon */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(59,130,246,0.1))',
                    border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Zap size={24} color="#818cf8" />
                  </div>

                  <div style={{ flex: 1, minWidth: 240 }}>
                    {/* Title + badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 19, fontWeight: 800, color: '#f1f5f9' }}>{hack.title}</h3>
                      <Badge variant={hack.status} dot={hack.status === 'active'}>{hack.status}</Badge>
                      {hack.isFeatured && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', padding: '3px 10px', borderRadius: 99, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>⭐ Featured</span>
                      )}
                    </div>

                    <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 14, lineHeight: 1.6 }}>{hack.subtitle}</p>

                    {/* College */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <School size={12} color="#818cf8" />
                        <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 600 }}>{hack.college}</span>
                      </div>
                      <span style={{ fontSize: 12, color: '#475569' }}>{hack.organizer}</span>
                    </div>

                    {/* Tags */}
                    {hack.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                        {hack.tags.slice(0, 3).map(tag => (
                          <span key={tag} style={{ fontSize: 11, color: '#64748b', padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {[
                        { icon: <Users size={13} color="#60a5fa" />, value: hack.participantCount.toLocaleString() },
                        { icon: <Trophy size={13} color="#fbbf24" />, value: hack.prizePool },
                        { icon: <Calendar size={13} color="#34d399" />, value: formatDate(hack.startDate) },
                      ].map((stat, si) => (
                        <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {stat.icon}
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{stat.value}</span>
                        </div>
                      ))}
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
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No events found</p>
            <p style={{ fontSize: 13, color: '#334155' }}>Try a different filter or search term.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
