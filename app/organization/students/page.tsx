'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getStudents, type Profile } from '@/lib/db';
import { GraduationCap, Mail, Loader2, Users } from 'lucide-react';

export default function OrgStudentsPage() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getStudents().then(data => { setStudents(data); setLoading(false); });
  }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.college?.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout title="Students" subtitle="Registered students on the platform">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginBottom: 36, maxWidth: 400 }}>
        {[
          { label: 'Total Students', value: students.length, color: '#818cf8' },
          { label: 'Showing', value: filtered.length, color: '#34d399' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div style={{ padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginBottom: 6 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students by name, email, or college…" className="input-glass" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, width: '100%', maxWidth: 400 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading students…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Users size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{search ? 'No students match your search' : 'No students yet'}</p>
          <p style={{ fontSize: 13, color: '#64748b' }}>Students appear here after they sign up.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Student', 'Email', 'College', 'Joined'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#818cf8' }}>
                        {(s.name ?? s.email ?? 'S')[0].toUpperCase()}
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{s.name ?? s.email?.split('@')[0] ?? 'Unknown'}</p>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={12} color="#64748b" />
                      <span style={{ fontSize: 13, color: '#64748b' }}>{s.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {s.college ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <GraduationCap size={12} color="#64748b" />
                        <span style={{ fontSize: 13, color: '#64748b' }}>{s.college}</span>
                      </div>
                    ) : <span style={{ fontSize: 13, color: '#334155' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, color: '#475569' }}>{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
