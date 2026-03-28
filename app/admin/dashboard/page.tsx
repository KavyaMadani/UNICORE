'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Building2, Users, Zap, Trophy, ArrowRight, GraduationCap, TrendingUp, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminStats { totalHackathons: number; totalStudents: number; totalOrganizations: number; activeHackathons: number; }
interface HackathonRow { id: string; title: string; college: string; status: string; created_at: string; }
interface OrgRow { id: string; name: string; college: string; status: string; }

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({ totalHackathons: 0, totalStudents: 0, totalOrganizations: 0, activeHackathons: 0 });
  const [hackathons, setHackathons] = useState<HackathonRow[]>([]);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [hackRes, studentRes, orgRes] = await Promise.all([
          supabase.from('hackathons').select('id, title, college, status, created_at').order('created_at', { ascending: false }).limit(6),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('organizations').select('id, name, college, status').limit(5),
        ]);
        const allHacks = (hackRes.data ?? []) as HackathonRow[];
        const allOrgs = (orgRes.data ?? []) as OrgRow[];
        setHackathons(allHacks);
        setOrgs(allOrgs);
        setStats({
          totalHackathons: allHacks.length,
          totalStudents: studentRes.count ?? 0,
          totalOrganizations: allOrgs.length,
          activeHackathons: allHacks.filter(h => h.status === 'active').length,
        });
      } catch (err) {
        console.error('Admin dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statItems = [
    { label: 'Total Hackathons', value: stats.totalHackathons, icon: <Zap size={20} className="text-indigo-400" />, change: `${stats.activeHackathons} active`, dir: 'up' as const },
    { label: 'Total Students', value: stats.totalStudents, icon: <GraduationCap size={20} className="text-blue-400" />, change: 'Registered', dir: 'neutral' as const },
    { label: 'Organizations', value: stats.totalOrganizations, icon: <Building2 size={20} className="text-emerald-400" />, change: 'On platform', dir: 'neutral' as const },
    { label: 'Active Events', value: stats.activeHackathons, icon: <Trophy size={20} className="text-amber-400" />, change: 'Live now', dir: stats.activeHackathons > 0 ? 'up' as const : 'neutral' as const },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Platform overview and management">

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {statItems.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={loading ? '—' : s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Recent Hackathons */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <CardTitle>Recent Hackathons</CardTitle>
              <CardSubtitle>All events across the platform</CardSubtitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/analytics')} rightIcon={<ArrowRight size={14} />}>
              View all
            </Button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 14 }} />)}
            </div>
          ) : hackathons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 0', color: '#475569' }}>
              <Zap size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>No hackathons yet</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Create one from the Manager dashboard.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hackathons.map((hack, i) => (
                <motion.div
                  key={hack.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={17} color="#818cf8" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hack.title}</p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{hack.college}</p>
                  </div>
                  <Badge variant={hack.status as 'active' | 'upcoming' | 'ended' | 'draft'}>{hack.status}</Badge>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Organizations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <CardTitle>Organizations</CardTitle>
              <Button variant="ghost" size="xs" onClick={() => router.push('/admin/organizations')} rightIcon={<ArrowRight size={12} />}>All</Button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />)}
              </div>
            ) : orgs.length === 0 ? (
              <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', padding: '32px 0' }}>No organizations yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orgs.map((org) => (
                  <div key={org.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.025)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={15} color="#60a5fa" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.name}</p>
                      <p style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{org.college}</p>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: org.status === 'active' ? '#10b981' : '#475569', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/admin/organizations')}>
                <Building2 size={14} /> Manage Organizations
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card padding="md">
            <CardTitle style={{ marginBottom: 16 }}>Quick Actions</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Manage Users', icon: <Users size={14} />, href: '/admin/users' },
                { label: 'Add College', icon: <Plus size={14} />, href: '/admin/colleges' },
                { label: 'Add Organization', icon: <Building2 size={14} />, href: '/admin/organizations' },
                { label: 'View Analytics', icon: <TrendingUp size={14} />, href: '/admin/analytics' },
              ].map(a => (
                <button key={a.label} onClick={() => router.push(a.href)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease', fontFamily: 'inherit' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#a5b4fc'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                >
                  <span style={{ color: '#6366f1' }}>{a.icon}</span> {a.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
