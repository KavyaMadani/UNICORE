'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getManagerHackathons, getAnnouncements, type Hackathon, type Announcement } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { Zap, Users, FileText, Megaphone, Plus, ArrowRight, Clock, CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

const ANN_ICONS = { warning: <AlertTriangle size={15} color="#fbbf24" />, success: <CheckCircle size={15} color="#34d399" />, info: <Info size={15} color="#60a5fa" /> };
const ANN_COLORS = {
  warning: { bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.18)', title: '#fde68a' },
  success: { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.18)', title: '#6ee7b7' },
  info:    { bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.18)', title: '#a5b4fc' },
};

export default function ManagerDashboard() {
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (uid) {
        const [hacks, anns] = await Promise.all([
          getManagerHackathons(uid),
          getAnnouncements(),
        ]);
        setHackathons(hacks);
        // Filter announcements to only those for manager's hackathons
        const hackIds = new Set(hacks.map(h => h.id));
        setAnnouncements(anns.filter(a => hackIds.has(a.hackathon_id)));
      }
      setLoading(false);
    })();
  }, []);

  const active = hackathons.filter(h => h.status === 'active');
  const totalParticipants = hackathons.reduce((s, h) => s + (h.participant_count ?? 0), 0);

  const statItems = [
    { label: 'My Hackathons', value: loading ? '—' : hackathons.length, icon: <Zap size={20} className="text-indigo-400" />, change: loading ? '' : `${active.length} active`, dir: 'up' as const },
    { label: 'Total Participants', value: loading ? '—' : totalParticipants.toLocaleString(), icon: <Users size={20} className="text-blue-400" />, change: 'Across all events', dir: 'neutral' as const },
    { label: 'Announcements', value: loading ? '—' : announcements.length, icon: <Megaphone size={20} className="text-amber-400" />, change: 'For your events', dir: 'neutral' as const },
    { label: 'Active Events', value: loading ? '—' : active.length, icon: <Clock size={20} className="text-emerald-400" />, change: 'Live right now', dir: active.length > 0 ? 'up' as const : 'neutral' as const },
  ];

  return (
    <DashboardLayout title="Manager Dashboard" subtitle="Your hackathon management hub">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {statItems.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* My Hackathons */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div><CardTitle>My Hackathons</CardTitle><CardSubtitle>Your created events</CardSubtitle></div>
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => router.push('/manager/hackathons/create')}>New</Button>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, gap: 10, color: '#64748b' }}><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading…</div>
          ) : hackathons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Zap size={36} style={{ margin: '0 auto 14px', opacity: 0.2 }} />
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>No hackathons yet. Create your first one!</p>
              <Button size="sm" onClick={() => router.push('/manager/hackathons/create')} leftIcon={<Plus size={13} />}>Create Hackathon</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {hackathons.slice(0, 5).map((h, i) => (
                <motion.div key={h.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onClick={() => router.push(`/manager/hackathons/${h.id}`)}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Zap size={18} color="#818cf8" /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <Badge variant={h.status} dot={h.status === 'active'}>{h.status}</Badge>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{h.participant_count ?? 0} participants</span>
                        {h.prize_pool && <span style={{ fontSize: 11, color: '#64748b' }}>· {h.prize_pool}</span>}
                      </div>
                    </div>
                    <ArrowRight size={16} color="#475569" />
                  </div>
                </motion.div>
              ))}
              {hackathons.length > 5 && (
                <button onClick={() => router.push('/manager/hackathons')} style={{ fontSize: 13, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', padding: '8px 0', fontFamily: 'inherit', fontWeight: 600 }}>
                  View all {hackathons.length} hackathons →
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Announcements */}
        <Card>
          <div style={{ marginBottom: 24 }}><CardTitle>Announcements</CardTitle><CardSubtitle>For your events</CardSubtitle></div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100, gap: 10, color: '#64748b' }}><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /></div>
          ) : announcements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#475569' }}>
              <Megaphone size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>No announcements yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {announcements.slice(0, 5).map((ann, i) => {
                const col = ANN_COLORS[ann.type] ?? ANN_COLORS.info;
                return (
                  <motion.div key={ann.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                    <div style={{ padding: '14px 16px', borderRadius: 14, background: col.bg, border: `1px solid ${col.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {ANN_ICONS[ann.type]}<p style={{ fontSize: 13, fontWeight: 700, color: col.title }}>{ann.title}</p>
                      </div>
                      {ann.content && <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{ann.content.slice(0, 80)}{ann.content.length > 80 ? '…' : ''}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
