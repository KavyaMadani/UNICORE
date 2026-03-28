'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getAllColleges } from '@/lib/college';
import { Building2, Plus, MapPin, Globe, Users, Check, X, Edit3, Trash2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

const ALL_COLLEGES = getAllColleges();

export default function ManageCollegesPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState(ALL_COLLEGES);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemove = (slug: string, name: string) => {
    setColleges(prev => prev.filter(c => c.slug !== slug));
    showToast(`"${name}" removed successfully`);
  };

  const handleEdit = (slug: string) => {
    setEditingId(editingId === slug ? null : slug);
    showToast(`Editing mode ${editingId === slug ? 'disabled' : 'enabled'} for this college`, 'success');
  };

  const filtered = colleges.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Colleges', value: colleges.length, icon: <Building2 size={20} className="text-indigo-400" /> },
    { label: 'States Covered', value: new Set(colleges.map(c => c.state)).size, icon: <MapPin size={20} className="text-blue-400" /> },
    { label: 'Active Organizations', value: '8', icon: <Users size={20} className="text-emerald-400" /> },
    { label: 'Students Enrolled', value: '3.8K+', icon: <Building2 size={20} className="text-amber-400" /> },
  ];

  return (
    <DashboardLayout
      title="Colleges"
      subtitle="Manage all registered institutions"
      actions={
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => router.push('/admin/colleges/add')}>
          Add College
        </Button>
      }
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 999,
              padding: '12px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
              background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: toast.type === 'success' ? '#34d399' : '#f87171',
              fontSize: 13, fontWeight: 500, backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            {toast.type === 'success' ? <Check size={15} /> : <X size={15} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} />
          </motion.div>
        ))}
      </div>

      <Card>
        {/* Header + Search */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <CardTitle>All Colleges</CardTitle>
            <CardSubtitle>Domain-based auto-detection is active for these institutions</CardSubtitle>
          </div>
          <div style={{ position: 'relative', minWidth: 240 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>
              <Search size={14} />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search colleges..."
              className="input-glass"
              style={{ paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, width: '100%' }}
            />
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map((college, i) => (
            <motion.div
              key={college.slug}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              style={{
                padding: '20px 22px',
                borderRadius: 16,
                background: editingId === college.slug ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.025)',
                border: editingId === college.slug ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 13,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(99,102,241,0.15)',
                }}>
                  <Building2 size={19} color="#818cf8" />
                </div>
                <Badge variant="active" dot>active</Badge>
              </div>

              {/* Info */}
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 6, lineHeight: 1.3 }}>{college.name}</h3>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{college.city}, {college.state}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', marginBottom: 18 }}>
                <Globe size={11} />
                <span style={{ fontFamily: 'monospace' }}>{college.domain}</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleEdit(college.slug)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    background: editingId === college.slug ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                    border: editingId === college.slug ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)',
                    color: editingId === college.slug ? '#a5b4fc' : '#94a3b8',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {editingId === college.slug ? <Check size={13} /> : <Edit3 size={13} />}
                  {editingId === college.slug ? 'Done' : 'Edit'}
                </button>
                <button
                  onClick={() => handleRemove(college.slug, college.name)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    background: 'rgba(239,68,68,0.07)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    color: '#f87171',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)'; }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#475569' }}>
            <Building2 size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: 15, fontWeight: 500 }}>No colleges found</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Try a different search term</p>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
