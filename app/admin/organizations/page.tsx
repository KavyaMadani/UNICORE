'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_ORGANIZATIONS } from '@/lib/mock-data';
import { Building2, Users, Zap, Plus, Search, Check, X, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManageOrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState(MOCK_ORGANIZATIONS.map(o => ({ ...o })));
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleStatus = (id: string, name: string, currentStatus: string) => {
    const next = currentStatus === 'active' ? 'inactive' : 'active';
    setOrgs(prev => prev.map(o => o.id === id ? { ...o, status: next as 'active' | 'inactive' } : o));
    showToast(`${name} ${next === 'active' ? 'activated' : 'suspended'}`, next === 'active' ? 'success' : 'error');
  };

  const filtered = orgs.filter(o =>
    !search ||
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.college.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Organizations', value: orgs.length, icon: <Building2 size={20} color="#818cf8" />, change: 'On platform', dir: 'neutral' as const },
    { label: 'Active', value: orgs.filter(o => o.status === 'active').length, icon: <Check size={20} color="#34d399" />, change: 'Currently active', dir: 'up' as const },
    { label: 'Total Managers', value: orgs.reduce((s, o) => s + o.managersCount, 0), icon: <Users size={20} color="#60a5fa" />, change: 'Across all orgs', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout
      title="Organizations"
      subtitle="Manage all registered organizations"
      actions={
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => router.push('/admin/organizations/add')}>
          Add Organization
        </Button>
      }
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 999,
              padding: '12px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
              background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: toast.type === 'success' ? '#34d399' : '#f87171',
              fontSize: 13, fontWeight: 500, backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      <Card>
        {/* Header + Search */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <CardTitle>All Organizations</CardTitle>
            <CardSubtitle>Click to manage or view details</CardSubtitle>
          </div>
          <div style={{ position: 'relative', minWidth: 240 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>
              <Search size={14} />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search organizations..."
              className="input-glass"
              style={{ paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, width: '100%' }}
            />
          </div>
        </div>

        {/* Org cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((org, i) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px',
                borderRadius: 16, flexWrap: 'wrap',
                background: org.status === 'active' ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.01)',
                border: org.status === 'active' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.04)',
                opacity: org.status === 'active' ? 1 : 0.65,
                transition: 'all 0.2s ease',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.1))',
                border: '1px solid rgba(99,102,241,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Building2 size={20} color="#818cf8" />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{org.name}</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{org.college}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>·</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{org.email}</span>
                </div>
              </div>

              {/* Stats badges */}
              <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 10,
                  background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.14)',
                }}>
                  <Users size={13} color="#818cf8" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc' }}>{org.managersCount} mgrs</span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 10,
                  background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.14)',
                }}>
                  <Zap size={13} color="#34d399" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#6ee7b7' }}>{org.hackathonsCount} events</span>
                </div>
              </div>

              {/* Status */}
              <Badge variant={org.status === 'active' ? 'active' : 'ended'} dot={org.status === 'active'}>
                {org.status}
              </Badge>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => showToast(`Viewing ${org.name}...`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
                    fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                    color: '#94a3b8', transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                >
                  <Shield size={12} /> View
                </button>
                <button
                  onClick={() => toggleStatus(org.id, org.name, org.status)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
                    fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    background: org.status === 'active' ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)',
                    border: org.status === 'active' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)',
                    color: org.status === 'active' ? '#f87171' : '#34d399',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {org.status === 'active' ? <><X size={12} /> Suspend</> : <><Check size={12} /> Activate</>}
                </button>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '56px 0', color: '#475569' }}>
              <Building2 size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>No organizations found</p>
            </div>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
