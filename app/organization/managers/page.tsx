'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_MANAGERS } from '@/lib/mock-data';
import { UserCog, Plus, Search, Mail, Zap, Check, X, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManageManagersPage() {
  const router = useRouter();
  const [managers, setManagers] = useState(MOCK_MANAGERS.map(m => ({ ...m })));
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleStatus = (id: string, name: string) => {
    setManagers(prev => prev.map(m =>
      m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
    ));
    const mgr = managers.find(m => m.id === id);
    showToast(`${name} ${mgr?.status === 'active' ? 'deactivated' : 'activated'}`);
  };

  const removeManager = (id: string, name: string) => {
    setManagers(prev => prev.filter(m => m.id !== id));
    showToast(`${name} removed from your team`, 'error');
  };

  const filtered = managers.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Event Managers"
      subtitle="Manage your team of event managers"
      actions={
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => router.push('/organization/managers/add')}>
          Add Manager
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

      <Card>
        {/* Header + Search */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <CardTitle>All Managers ({filtered.length})</CardTitle>
            <CardSubtitle>Create and manage event managers for your organization</CardSubtitle>
          </div>
          <div style={{ position: 'relative', minWidth: 220 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>
              <Search size={14} />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search managers..."
              className="input-glass"
              style={{ paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, width: '100%' }}
            />
          </div>
        </div>

        {/* Manager cards grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#475569' }}>
            <UserCog size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No managers found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((mgr, i) => (
              <motion.div
                key={mgr.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 20,
                  padding: '20px 24px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${mgr.status === 'active' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
                  opacity: mgr.status === 'inactive' ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  flexWrap: 'wrap',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 18, fontWeight: 800, flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                }}>
                  {mgr.name[0]}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{mgr.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={12} color="#475569" />
                    <span style={{ fontSize: 13, color: '#64748b' }}>{mgr.email}</span>
                  </div>
                </div>

                {/* Events badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 10,
                  background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)',
                }}>
                  <Zap size={13} color="#818cf8" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc' }}>{mgr.hackathonsManaged} events</span>
                </div>

                {/* Status */}
                <Badge variant={mgr.status === 'active' ? 'active' : 'ended'} dot={mgr.status === 'active'}>
                  {mgr.status}
                </Badge>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => toggleStatus(mgr.id, mgr.name)}
                    title={mgr.status === 'active' ? 'Deactivate' : 'Activate'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
                      fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                      background: mgr.status === 'active' ? 'rgba(251,191,36,0.08)' : 'rgba(16,185,129,0.08)',
                      border: mgr.status === 'active' ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(16,185,129,0.2)',
                      color: mgr.status === 'active' ? '#fbbf24' : '#34d399',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {mgr.status === 'active' ? <><X size={12} /> Deactivate</> : <><Check size={12} /> Activate</>}
                  </button>
                  <button
                    onClick={() => removeManager(mgr.id, mgr.name)}
                    title="Remove manager"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
                      fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                      background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)',
                      color: '#f87171', transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)'; }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
