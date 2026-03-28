'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  getPublicHackathons, getSavedHackathonIds, saveHackathon, unsaveHackathon,
  isRegistered, registerForHackathon, type Hackathon,
} from '@/lib/db';
import { supabase } from '@/lib/supabase';
import {
  Zap, Users, Trophy, Calendar, School, Tag, BookmarkPlus,
  BookmarkCheck, Search, TrendingUp, Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function StudentHackathonsPage() {
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      const [hacks, saved] = await Promise.all([
        getPublicHackathons(),
        uid ? getSavedHackathonIds(uid) : Promise.resolve([]),
      ]);
      setHackathons(hacks);
      setSavedIds(saved);

      // check registrations
      if (uid && hacks.length) {
        const regChecks = await Promise.all(hacks.map(h => isRegistered(uid, h.id)));
        setRegisteredIds(hacks.filter((_, i) => regChecks[i]).map(h => h.id));
      }
      setLoading(false);
    })();
  }, []);

  const toggleSave = async (hackathonId: string) => {
    if (!userId) return;
    if (savedIds.includes(hackathonId)) {
      setSavedIds(prev => prev.filter(id => id !== hackathonId));
      await unsaveHackathon(userId, hackathonId);
    } else {
      setSavedIds(prev => [...prev, hackathonId]);
      await saveHackathon(userId, hackathonId);
    }
  };

  const handleRegister = (hackathonId: string) => {
    if (!userId) { router.push('/signin'); return; }
    router.push(`/student/hackathons/${hackathonId}/register`);
  };

  const filtered = hackathons.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.title?.toLowerCase().includes(q) || h.college?.toLowerCase().includes(q) || h.tags?.some(t => t.toLowerCase().includes(q));
    const matchFilter = filter === 'all' || h.status === filter;
    return matchSearch && matchFilter;
  });

  const STATUS_BG: Record<string, { bg: string; border: string }> = {
    active:   { bg: 'rgba(16,185,129,0.05)',  border: 'rgba(16,185,129,0.18)' },
    upcoming: { bg: 'rgba(99,102,241,0.05)',  border: 'rgba(99,102,241,0.18)' },
    ended:    { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)' },
  };

  return (
    <DashboardLayout title="Hackathons" subtitle="Discover and join exciting events">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 36 }}>
        {[
          { label: 'Total Events', value: hackathons.length, icon: <Zap size={18} color="#818cf8" />, color: '#818cf8' },
          { label: 'Live Now', value: hackathons.filter(h => h.status === 'active').length, icon: <TrendingUp size={18} color="#34d399" />, color: '#34d399' },
          { label: 'Upcoming', value: hackathons.filter(h => h.status === 'upcoming').length, icon: <Calendar size={18} color="#60a5fa" />, color: '#60a5fa' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div style={{ padding: '20px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{loading ? '—' : s.value}</div>
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hackathons, colleges, tags…" className="input-glass" style={{ paddingLeft: 40, paddingRight: 14, paddingTop: 10, paddingBottom: 10, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'active', 'upcoming', 'ended'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '9px 16px', borderRadius: 11, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', background: filter === f ? 'rgba(99,102,241,0.18)' : 'transparent', color: filter === f ? '#a5b4fc' : '#64748b', border: filter === f ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)', transition: 'all 0.15s ease' }}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading hackathons…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filtered.map((hack, i) => {
            const theme = STATUS_BG[hack.status] ?? STATUS_BG.ended;
            const isSaved = savedIds.includes(hack.id);
            const isReg = registeredIds.includes(hack.id);
            const tags: string[] = Array.isArray(hack.tags) ? hack.tags : [];
            return (
              <motion.div key={hack.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div style={{ padding: '30px 34px', borderRadius: 22, background: theme.bg, border: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, flexWrap: 'wrap' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(59,130,246,0.1))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={24} color="#818cf8" />
                    </div>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 19, fontWeight: 800, color: '#f1f5f9' }}>{hack.title}</h3>
                        <Badge variant={hack.status} dot={hack.status === 'active'}>{hack.status}</Badge>
                        {hack.is_featured && <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', padding: '3px 10px', borderRadius: 99, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>⭐ Featured</span>}
                      </div>
                      {hack.subtitle && <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 14, lineHeight: 1.6 }}>{hack.subtitle}</p>}
                      {hack.college && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <School size={12} color="#818cf8" />
                            <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 600 }}>{hack.college}</span>
                          </div>
                          {hack.organizer && <span style={{ fontSize: 12, color: '#475569' }}>{hack.organizer}</span>}
                        </div>
                      )}
                      {tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                          {tags.slice(0, 4).map(tag => <span key={tag} style={{ fontSize: 11, color: '#64748b', padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>{tag}</span>)}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={13} color="#60a5fa" /><span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{hack.participant_count ?? 0} participants</span></div>
                          {hack.prize_pool && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Trophy size={13} color="#fbbf24" /><span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{hack.prize_pool}</span></div>}
                          {hack.registration_deadline && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} color="#34d399" /><span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Deadline: {formatDate(hack.registration_deadline)}</span></div>}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => toggleSave(hack.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: isSaved ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)', border: isSaved ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.09)', color: isSaved ? '#a5b4fc' : '#64748b', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                            {isSaved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />} {isSaved ? 'Saved' : 'Save'}
                          </button>
                          {hack.status !== 'ended' ? (
                            <>
                              <button onClick={() => router.push(`/student/hackathons/${hack.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                                View Details
                              </button>
                              <button onClick={() => !isReg ? handleRegister(hack.id) : undefined} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: isReg ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.15)', border: isReg ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(99,102,241,0.3)', color: isReg ? '#34d399' : '#a5b4fc', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: isReg ? 'default' : 'pointer' }}>
                                {isReg ? '✓ Registered' : 'Register Now'}
                              </button>
                            </>
                          ) : (
                            <button onClick={() => router.push(`/student/hackathons/${hack.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                              View Details
                            </button>
                          )}
                        </div>
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
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No hackathons found</p>
              <p style={{ fontSize: 13 }}>Check back soon — managers are creating new events!</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
