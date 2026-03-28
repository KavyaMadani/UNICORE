'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getPublicHackathons, getSavedHackathonIds, unsaveHackathon, type Hackathon } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';
import { Bookmark, BookmarkX, Zap, Trophy, Calendar, School, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function SavedHackathonsPage() {
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const [hacks, ids] = await Promise.all([getPublicHackathons(), getSavedHackathonIds(uid)]);
        setHackathons(hacks.filter(h => ids.includes(h.id)));
        setSavedIds(ids);
      }
      setLoading(false);
    })();
  }, []);

  const handleUnsave = async (hackathonId: string) => {
    if (!userId) return;
    setSavedIds(prev => prev.filter(id => id !== hackathonId));
    setHackathons(prev => prev.filter(h => h.id !== hackathonId));
    await unsaveHackathon(userId, hackathonId);
  };

  return (
    <DashboardLayout title="Saved Hackathons" subtitle="Hackathons you've bookmarked">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 36 }}>
        {[
          { label: 'Total Saved', value: hackathons.length, color: '#818cf8' },
          { label: 'Active', value: hackathons.filter(h => h.status === 'active').length, color: '#34d399' },
          { label: 'Upcoming', value: hackathons.filter(h => h.status === 'upcoming').length, color: '#60a5fa' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div style={{ padding: '22px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 6 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading saved hackathons…
        </div>
      ) : hackathons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Bookmark size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No saved hackathons</p>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Browse hackathons and bookmark the ones you are interested in.</p>
          <button onClick={() => router.push('/student/hackathons')} style={{ padding: '10px 24px', borderRadius: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
            Browse Hackathons
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {hackathons.map((hack, i) => (
            <motion.div key={hack.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={22} color="#818cf8" />
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{hack.title}</h3>
                      <Badge variant={hack.status} dot={hack.status === 'active'}>{hack.status}</Badge>
                    </div>
                    {hack.subtitle && <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{hack.subtitle}</p>}
                    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 16 }}>
                      {hack.college && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><School size={13} color="#818cf8" /><span style={{ fontSize: 13, color: '#a5b4fc' }}>{hack.college}</span></div>}
                      {hack.prize_pool && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Trophy size={13} color="#fbbf24" /><span style={{ fontSize: 13, color: '#94a3b8' }}>{hack.prize_pool}</span></div>}
                      {hack.registration_deadline && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} color="#34d399" /><span style={{ fontSize: 13, color: '#94a3b8' }}>Deadline: {formatDate(hack.registration_deadline)}</span></div>}
                    </div>
                  </div>
                  <button onClick={() => handleUnsave(hack.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0 }}>
                    <BookmarkX size={14} /> Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
