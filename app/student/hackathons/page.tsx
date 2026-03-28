'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge, Tag } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { MOCK_HACKATHONS, MOCK_SAVED_HACKATHONS } from '@/lib/mock-data';
import { Zap, Search, Users, Trophy, Calendar, Bookmark, BookmarkCheck, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface HackathonItem {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  college: string;
  status: string;
  prizePool: string;
  startDate: string;
  endDate: string;
  tags: string[];
  participantCount: number;
  isFeatured: boolean;
}

const STATUS_FILTERS = ['all', 'active', 'upcoming', 'ended'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

// Normalize from Supabase snake_case
function normalizeFromDB(h: Record<string, unknown>): HackathonItem {
  return {
    id: h.id as string,
    title: h.title as string,
    subtitle: (h.subtitle ?? h.tagline ?? null) as string | null,
    description: (h.description ?? '') as string,
    college: (h.college ?? '') as string,
    status: (h.status ?? 'upcoming') as string,
    prizePool: (h.prize_pool ?? h.prizePool ?? '—') as string,
    startDate: (h.start_date ?? h.startDate ?? '') as string,
    endDate: (h.end_date ?? h.endDate ?? '') as string,
    tags: (Array.isArray(h.tags) ? h.tags : []) as string[],
    participantCount: (h.participant_count ?? h.participantCount ?? 0) as number,
    isFeatured: (h.is_featured ?? h.isFeatured ?? false) as boolean,
  };
}

function normalizeMock(h: typeof MOCK_HACKATHONS[0]): HackathonItem {
  return {
    id: h.id,
    title: h.title,
    subtitle: h.subtitle,
    description: h.subtitle ?? '',
    college: h.college,
    status: h.status,
    prizePool: h.prizePool,
    startDate: h.startDate,
    endDate: h.endDate,
    tags: h.tags,
    participantCount: h.participantCount,
    isFeatured: h.isFeatured ?? false,
  };
}

export default function BrowseHackathonsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<HackathonItem[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(MOCK_SAVED_HACKATHONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('hackathons')
          .select('*')
          .neq('status', 'draft')
          .order('created_at', { ascending: false });

        // Use Supabase data if we got rows, else fall back to mock data
        if (!error && data && data.length > 0) {
          setHackathons(data.map(h => normalizeFromDB(h as Record<string, unknown>)));

          if (user) {
            const savedRes = await supabase
              .from('saved_hackathons')
              .select('hackathon_id')
              .eq('user_id', user.id);
            setSavedIds((savedRes.data ?? []).map((s: { hackathon_id: string }) => s.hackathon_id));
          }
        } else {
          // Fallback to mock data if DB is empty or errored
          setHackathons(MOCK_HACKATHONS.map(normalizeMock));
        }
      } catch {
        setHackathons(MOCK_HACKATHONS.map(normalizeMock));
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const toggleSave = async (hackathonId: string) => {
    const isSaved = savedIds.includes(hackathonId);
    if (isSaved) {
      setSavedIds(prev => prev.filter(id => id !== hackathonId));
      if (user) await supabase.from('saved_hackathons').delete().eq('user_id', user.id).eq('hackathon_id', hackathonId);
    } else {
      setSavedIds(prev => [...prev, hackathonId]);
      if (user) await supabase.from('saved_hackathons').insert({ user_id: user.id, hackathon_id: hackathonId });
    }
  };

  const filtered = hackathons.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.title.toLowerCase().includes(q) || h.college.toLowerCase().includes(q) || h.tags?.some(t => t.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'all' || h.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout title="Browse Hackathons" subtitle="Discover and register for upcoming events">
      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>
            <Search size={15} />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, college, or tag..."
            className="input-glass"
            style={{ paddingLeft: 40, paddingRight: 16, paddingTop: 11, paddingBottom: 11, width: '100%' }}
          />
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: '9px 18px', borderRadius: 12,
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                textTransform: 'capitalize', transition: 'all 0.15s ease',
                background: statusFilter === f ? 'rgba(99,102,241,0.18)' : 'transparent',
                color: statusFilter === f ? '#818cf8' : '#64748b',
                border: statusFilter === f ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Count */}
        <span style={{ fontSize: 13, color: '#475569', fontWeight: 500, flexShrink: 0 }}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ height: 320, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 2s infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '96px 0', color: '#475569' }}>
          <Zap size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
            {hackathons.length === 0 ? 'No hackathons available yet' : `No results for "${search}"`}
          </h3>
          <p style={{ fontSize: 13, color: '#334155', marginBottom: 24 }}>
            {hackathons.length === 0 ? 'Check back soon for new events.' : 'Try a different search or filter.'}
          </p>
          {search && <Button onClick={() => { setSearch(''); setStatusFilter('all'); }}>Clear Filters</Button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 24 }}>
          {filtered.map((hack, i) => (
            <motion.div
              key={hack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.5) }}
              layout
            >
              <div style={{
                display: 'flex', flexDirection: 'column', height: '100%',
                padding: '24px 26px', borderRadius: 20,
                background: hack.status === 'active' ? 'rgba(16,185,129,0.03)' : 'rgba(255,255,255,0.025)',
                border: hack.status === 'active' ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.2s ease',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(59,130,246,0.1))',
                    border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Zap size={20} color="#818cf8" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge variant={hack.status as 'active' | 'upcoming' | 'ended' | 'draft'} dot={hack.status === 'active'}>
                      {hack.status}
                    </Badge>
                    <button
                      onClick={() => toggleSave(hack.id)}
                      title={savedIds.includes(hack.id) ? 'Unsave' : 'Save for later'}
                      style={{
                        padding: 8, borderRadius: 10, cursor: 'pointer',
                        background: savedIds.includes(hack.id) ? 'rgba(99,102,241,0.12)' : 'transparent',
                        border: savedIds.includes(hack.id) ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.07)',
                        display: 'flex', alignItems: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {savedIds.includes(hack.id)
                        ? <BookmarkCheck size={15} color="#818cf8" />
                        : <Bookmark size={15} color="#64748b" />
                      }
                    </button>
                  </div>
                </div>

                {/* Featured badge */}
                {hack.isFeatured && (
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 10px', borderRadius: 99, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                      ⭐ Featured
                    </span>
                  </div>
                )}

                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, lineHeight: 1.3 }}>{hack.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>{hack.college}</p>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginBottom: 16, flex: 1 }}>
                  {hack.subtitle ?? hack.description}
                </p>

                {/* Tags */}
                {hack.tags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                    {hack.tags.slice(0, 3).map(tag => <Tag key={tag}>{tag}</Tag>)}
                    {hack.tags.length > 3 && <span style={{ fontSize: 11, color: '#64748b' }}>+{hack.tags.length - 3} more</span>}
                  </div>
                )}

                {/* Meta row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 12, color: '#64748b', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fbbf24', fontWeight: 700 }}>
                    <Trophy size={12} /> {hack.prizePool}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={12} /> {formatDate(hack.startDate)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Users size={12} /> {hack.participantCount.toLocaleString()}
                  </div>
                </div>

                {/* CTA */}
                <button
                  disabled={hack.status === 'draft'}
                  onClick={() => router.push(`/student/hackathons/${hack.id}`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 16px', borderRadius: 13,
                    background: hack.status === 'active'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(59,130,246,0.2))'
                      : hack.status === 'ended'
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(99,102,241,0.12)',
                    border: hack.status === 'active' ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(99,102,241,0.18)',
                    color: hack.status === 'ended' ? '#64748b' : '#a5b4fc',
                    fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: hack.status === 'draft' ? 'not-allowed' : 'pointer',
                    opacity: hack.status === 'draft' ? 0.5 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {hack.status === 'upcoming' ? 'Register Now' : hack.status === 'active' ? 'View & Submit' : hack.status === 'ended' ? 'View Results' : 'Coming Soon'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
