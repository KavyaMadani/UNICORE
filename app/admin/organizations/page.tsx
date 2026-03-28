'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Building2, Users, Zap, Plus, Check, X, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrgRow { id: string; name: string; college: string; email?: string; contact_phone?: string; status: string; created_at?: string; }

export default function ManageOrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
      if (!error && data) setOrgs(data as OrgRow[]);
      setLoading(false);
    })();
  }, []);

  const toggleStatus = async (id: string, name: string, current: string) => {
    const next = current === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('organizations').update({ status: next }).eq('id', id);
    if (!error) {
      setOrgs(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
      showToast(`${name} ${next === 'active' ? 'activated' : 'suspended'}`, next === 'active' ? 'success' : 'error');
    } else {
      showToast('Failed to update organization', 'error');
    }
  };

  const filtered = orgs.filter(o =>
    !search ||
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.college?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Organizations', value: loading ? '—' : orgs.length, icon: <Building2 size={20} color="#818cf8" />, change: 'On platform', dir: 'neutral' as const },
    { label: 'Active', value: loading ? '—' : orgs.filter(o => o.status === 'active').length, icon: <Check size={20} color="#34d399" />, change: 'Currently active', dir: 'up' as const },
    { label: 'Inactive', value: loading ? '—' : orgs.filter(o => o.status !== 'active').length, icon: <X size={20} color="#f87171" />, change: 'Suspended/Inactive', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout
      title="Manage Organizers"
      subtitle="Add and manage college organizers"
      actions={
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => router.push('/admin/organizations/add')}>
          Add Organizer
        </Button>
      }
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '11px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.type === 'success' ? '#34d399' : '#f87171', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)' }}>
            {toast.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24, maxWidth: 380 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organizations…" className="input-glass" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, width: '100%' }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading organizations…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Building2 size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{search ? 'No results found' : 'No organizations yet'}</p>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Add your first organization to get started.</p>
          <Button leftIcon={<Plus size={14} />} onClick={() => router.push('/admin/organizations/add')}>Add Organization</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((org, i) => (
            <motion.div key={org.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div style={{ padding: '22px 26px', borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={22} color="#60a5fa" />
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>{org.name}</h3>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: org.status === 'active' ? '#10b981' : '#475569', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: org.status === 'active' ? '#34d399' : '#475569', fontWeight: 600 }}>{org.status}</span>
                    </div>
                    {org.college && <p style={{ fontSize: 13, color: '#64748b' }}>{org.college}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => toggleStatus(org.id, org.name, org.status)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, background: org.status === 'active' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border: org.status === 'active' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)', color: org.status === 'active' ? '#f87171' : '#34d399', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                      {org.status === 'active' ? <><X size={12} /> Suspend</> : <><Check size={12} /> Activate</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
