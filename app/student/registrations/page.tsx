'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getMyRegistrations, type Registration, type Hackathon } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';
import { Zap, Calendar, School, Users, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function StudentRegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const regs = await getMyRegistrations(session.user.id);
        setRegistrations(regs);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <DashboardLayout title="My Registrations" subtitle="Hackathons you have registered for">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 36 }}>
        {[
          { label: 'Total Registered', value: registrations.length, color: '#818cf8' },
          { label: 'Active', value: registrations.filter(r => (r.hackathons as Hackathon)?.status === 'active').length, color: '#34d399' },
          { label: 'Upcoming', value: registrations.filter(r => (r.hackathons as Hackathon)?.status === 'upcoming').length, color: '#60a5fa' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div style={{ padding: '22px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 6 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading registrations…
        </div>
      ) : registrations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Zap size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No registrations yet</p>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Browse hackathons and register for events that interest you.</p>
          <button onClick={() => router.push('/student/hackathons')} style={{ padding: '10px 24px', borderRadius: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
            Browse Hackathons
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {registrations.map((reg, i) => {
            const hack = reg.hackathons as Hackathon | undefined;
            if (!hack) return null;
            return (
              <motion.div key={reg.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={22} color="#818cf8" />
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{hack.title}</h3>
                        <Badge variant={hack.status} dot={hack.status === 'active'}>{hack.status}</Badge>
                      </div>
                      {hack.subtitle && <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{hack.subtitle}</p>}
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
                        {hack.college && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <School size={13} color="#818cf8" />
                            <span style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 500 }}>{hack.college}</span>
                          </div>
                        )}
                        {hack.participant_count !== undefined && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={13} color="#60a5fa" />
                            <span style={{ fontSize: 13, color: '#94a3b8' }}>{hack.participant_count} participants</span>
                          </div>
                        )}
                        {hack.start_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={13} color="#34d399" />
                            <span style={{ fontSize: 13, color: '#94a3b8' }}>{formatDate(hack.start_date)}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#475569' }}>Registered: {new Date(reg.registered_at).toLocaleDateString()}</span>
                        {reg.team_name && <span style={{ fontSize: 12, color: '#818cf8', padding: '3px 10px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>Team: {reg.team_name}</span>}
                      </div>
                    </div>
                    <ArrowRight size={18} color="#475569" style={{ flexShrink: 0, marginTop: 16 }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
