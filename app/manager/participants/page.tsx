'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import { getManagerHackathons, getRegistrationsForHackathon, type Hackathon, type Registration } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { Users, GraduationCap, Building2, Mail, Loader2 } from 'lucide-react';

export default function ManagerParticipantsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (uid) {
        const hacks = await getManagerHackathons(uid);
        setHackathons(hacks);
        if (hacks.length > 0) {
          const allRegs = (await Promise.all(hacks.map(h => getRegistrationsForHackathon(h.id)))).flat();
          setRegistrations(allRegs);
        }
      }
      setLoading(false);
    })();
  }, []);

  const filteredRegs = registrations.filter(r => {
    const matchHack = selectedHackathon === 'all' || r.hackathon_id === selectedHackathon;
    const q = search.toLowerCase();
    const profile = r.profiles as { name?: string; email?: string; college?: string } | undefined;
    const matchSearch = !q || profile?.name?.toLowerCase().includes(q) || profile?.email?.toLowerCase().includes(q) || profile?.college?.toLowerCase().includes(q);
    return matchHack && matchSearch;
  });

  const totalParticipants = hackathons.reduce((s, h) => s + (h.participant_count ?? 0), 0);
  const totalTeams = hackathons.reduce((s, h) => s + (h.team_count ?? 0), 0);
  const colleges = new Set(registrations.map(r => (r.profiles as { college?: string } | undefined)?.college).filter(Boolean)).size;

  return (
    <DashboardLayout title="Participants" subtitle="All registered participants across your hackathons">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 32 }}>
        {[
          { label: 'Total Participants', value: loading ? '—' : totalParticipants, icon: <Users size={18} className="text-indigo-400" /> },
          { label: 'Total Teams', value: loading ? '—' : totalTeams, icon: <Users size={18} className="text-blue-400" /> },
          { label: 'Institutions', value: loading ? '—' : colleges, icon: <Building2 size={18} className="text-emerald-400" /> },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} />
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)} className="input-glass" style={{ paddingLeft: 14, paddingRight: 14, paddingTop: 9, paddingBottom: 9, width: 'auto', minWidth: 200 }}>
          <option value="all">All Hackathons</option>
          {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search participants…" className="input-glass" style={{ paddingLeft: 14, paddingRight: 14, paddingTop: 9, paddingBottom: 9, width: 220 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading participants…
        </div>
      ) : filteredRegs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Users size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No participants yet</p>
          <p style={{ fontSize: 13, color: '#64748b' }}>Participants will appear here once students register for your hackathons.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Student', 'Email', 'College', 'Hackathon', 'Team', 'Registered'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRegs.slice(0, 50).map((reg, i) => {
                const profile = reg.profiles as { name?: string; email?: string; college?: string } | undefined;
                const hackName = hackathons.find(h => h.id === reg.hackathon_id)?.title ?? '—';
                return (
                  <motion.tr key={reg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#818cf8' }}>
                          {(profile?.name ?? profile?.email ?? 'S')[0].toUpperCase()}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{profile?.name ?? profile?.email?.split('@')[0] ?? '—'}</p>
                      </div>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Mail size={11} color="#64748b" />
                        <span style={{ fontSize: 12, color: '#64748b' }}>{profile?.email ?? '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      {profile?.college ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <GraduationCap size={11} color="#64748b" />
                          <span style={{ fontSize: 12, color: '#64748b' }}>{profile.college}</span>
                        </div>
                      ) : <span style={{ fontSize: 12, color: '#334155' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, display: 'block', whiteSpace: 'nowrap' }}>{hackName}</span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      {reg.team_name ? <span style={{ fontSize: 12, color: '#818cf8' }}>{reg.team_name}</span> : <span style={{ fontSize: 12, color: '#334155' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ fontSize: 11, color: '#475569' }}>{new Date(reg.registered_at).toLocaleDateString()}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
