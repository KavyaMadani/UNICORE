'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Building2, Plus, MapPin, Globe, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface College { id: string; name: string; slug: string; city: string; state: string; domain: string; website?: string; created_at?: string; }

export default function ManageCollegesPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('colleges').select('*').order('name');
      if (!error && data) setColleges(data as College[]);
      setLoading(false);
    })();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase.from('colleges').delete().eq('id', id);
    if (!error) {
      setColleges(prev => prev.filter(c => c.id !== id));
      showToast(`"${name}" removed`);
    } else {
      showToast('Failed to remove: ' + error.message, 'error');
    }
  };

  const filtered = colleges.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Colleges', value: loading ? '—' : colleges.length, icon: <Building2 size={20} color="#818cf8" />, change: 'On platform', dir: 'neutral' as const },
    {
      label: 'States Covered',
      value: loading ? '—' : new Set(colleges.map(c => c.state).filter(Boolean)).size,
      icon: <MapPin size={20} color="#60a5fa" />, change: 'Across India', dir: 'neutral' as const
    },
    {
      label: 'With Websites',
      value: loading ? '—' : colleges.filter(c => c.website).length,
      icon: <Globe size={20} color="#34d399" />, change: 'Have website', dir: 'neutral' as const
    },
  ];

  return (
    <DashboardLayout
      title="Manage Colleges"
      subtitle="Add and manage institutions on the platform"
      actions={
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => router.push('/admin/colleges/add')}>
          Add College
        </Button>
      }
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '11px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(8px)', background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.type === 'success' ? '#34d399' : '#f87171', fontSize: 13, fontWeight: 600 }}>
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
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><Search size={13} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or city…" className="input-glass" style={{ paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, width: '100%' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading colleges…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Building2 size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{search ? 'No colleges match your search' : 'No colleges yet'}</p>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Add institutions to help students identify themselves.</p>
          {!search && <Button leftIcon={<Plus size={14} />} onClick={() => router.push('/admin/colleges/add')}>Add College</Button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          {filtered.map((college, i) => (
            <motion.div key={college.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
              <div style={{ padding: '22px 24px', borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} color="#818cf8" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{college.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} color="#64748b" />
                      <span style={{ fontSize: 12, color: '#64748b' }}>{college.city}{college.state ? `, ${college.state}` : ''}</span>
                    </div>
                  </div>
                </div>
                {college.domain && <p style={{ fontSize: 11, color: '#475569', marginBottom: 12 }}>@{college.domain}</p>}
                {college.website && (
                  <a href={college.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#60a5fa', textDecoration: 'none', marginBottom: 12 }}>
                    <Globe size={10} /> {college.website.replace('https://', '')}
                  </a>
                )}
                <button onClick={() => handleDelete(college.id, college.name)} style={{ fontSize: 12, color: '#f87171', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
