'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { Users, UserCog, GraduationCap, Search, CheckCircle, XCircle, Loader2, Mail, Shield } from 'lucide-react';

interface UserRow { id: string; name: string | null; email: string | null; role: string; college: string | null; created_at: string | null; }

const ROLE_OPTIONS = ['student', 'manager', 'organization'];
const ROLE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  student:      { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',   border: 'rgba(96,165,250,0.2)' },
  manager:      { color: '#818cf8', bg: 'rgba(129,140,248,0.08)',  border: 'rgba(129,140,248,0.2)' },
  organization: { color: '#34d399', bg: 'rgba(52,211,153,0.08)',   border: 'rgba(52,211,153,0.2)' },
  admin:        { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.2)' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) setUsers(data as UserRow[]);
      setLoading(false);
    })();
  }, []);

  const changeRole = async (userId: string, name: string | null, newRole: string) => {
    setUpdating(userId);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast(`${name ?? 'User'} promoted to ${newRole}!`, 'success');
    } else {
      showToast('Failed: ' + error.message, 'error');
    }
    setUpdating(null);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.college?.toLowerCase().includes(q);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const counts: Record<string, number> = {};
  users.forEach(u => { counts[u.role] = (counts[u.role] ?? 0) + 1; });

  return (
    <DashboardLayout title="User Management" subtitle="View and manage all platform user roles">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '11px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(8px)', background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.type === 'success' ? '#34d399' : '#f87171', fontSize: 13, fontWeight: 600 }}>
            {toast.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { role: 'all', label: 'Total Users', icon: <Users size={18} />, color: '#94a3b8' },
          { role: 'student', label: 'Students', icon: <GraduationCap size={18} />, color: '#60a5fa' },
          { role: 'manager', label: 'Managers', icon: <UserCog size={18} />, color: '#818cf8' },
          { role: 'organization', label: 'Organizations', icon: <Shield size={18} />, color: '#34d399' },
        ].map((r, i) => (
          <motion.div key={r.role} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div onClick={() => setFilterRole(r.role)} style={{ padding: '18px 20px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.15s ease', background: filterRole === r.role ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.025)', border: `1px solid ${filterRole === r.role ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, color: r.color }}>
                {r.icon}<span style={{ fontSize: 12, fontWeight: 700 }}>{r.label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9' }}>{loading ? '—' : (r.role === 'all' ? users.length : counts[r.role] ?? 0)}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24, maxWidth: 400 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><Search size={13} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or college…" className="input-glass" style={{ paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, width: '100%' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading users…
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['User', 'Email', 'College', 'Current Role', 'Change Role', 'Joined'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => {
                const rs = ROLE_STYLES[user.role] ?? ROLE_STYLES.student;
                return (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${rs.bg}`, border: `1px solid ${rs.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: rs.color }}>
                          {(user.name ?? user.email ?? 'U')[0].toUpperCase()}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{user.name ?? user.email?.split('@')[0] ?? 'Unknown'}</p>
                      </div>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Mail size={11} color="#64748b" />
                        <span style={{ fontSize: 12, color: '#64748b' }}>{user.email ?? '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      {user.college ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <GraduationCap size={11} color="#64748b" />
                          <span style={{ fontSize: 12, color: '#64748b' }}>{user.college}</span>
                        </div>
                      ) : <span style={{ fontSize: 12, color: '#334155' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: rs.bg, border: `1px solid ${rs.border}`, color: rs.color, textTransform: 'capitalize' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      {updating === user.id ? (
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: '#64748b' }} />
                      ) : (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {ROLE_OPTIONS.filter(r => r !== user.role).map(role => {
                            const s = ROLE_STYLES[role] ?? ROLE_STYLES.student;
                            return (
                              <button key={role} onClick={() => changeRole(user.id, user.name, role)} style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', background: s.bg, border: `1px solid ${s.border}`, color: s.color, transition: 'all 0.15s ease' }}>
                                {role === 'manager' ? '→ Manager' : role === 'organization' ? '→ Org' : '→ Student'}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ fontSize: 11, color: '#475569' }}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
              <Users size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ fontSize: 14 }}>No users found</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
