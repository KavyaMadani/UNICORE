'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getMyCertificates, type Certificate } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { Award, Trophy, Calendar, Star, Loader2, Copy, CheckCircle } from 'lucide-react';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const certs = await getMyCertificates(session.user.id);
        setCertificates(certs);
      }
      setLoading(false);
    })();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const wins = certificates.filter(c => c.achievement?.toLowerCase().includes('1st') || c.achievement?.toLowerCase().includes('winner'));
  const podium = certificates.filter(c => c.achievement?.toLowerCase().includes('2nd') || c.achievement?.toLowerCase().includes('3rd'));

  const stats = [
    { label: 'Total Certificates', value: certificates.length, icon: <Award size={20} color="#fbbf24" />, change: 'All time', dir: 'neutral' as const },
    { label: 'Wins', value: wins.length, icon: <Trophy size={20} color="#34d399" />, change: '1st place finishes', dir: 'up' as const },
    { label: 'Podium Finishes', value: podium.length, icon: <Star size={20} color="#818cf8" />, change: '2nd & 3rd place', dir: 'neutral' as const },
    { label: 'Events', value: certificates.length, icon: <Calendar size={20} color="#60a5fa" />, change: 'Participated', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout title="My Certificates" subtitle="Your hackathon achievements and recognition">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div style={{ padding: '22px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading certificates…
        </div>
      ) : certificates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Award size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No certificates yet</p>
          <p style={{ fontSize: 14, color: '#64748b' }}>Participate in hackathons and complete events to earn certificates here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {certificates.map((cert, i) => {
            const isWin = cert.achievement?.toLowerCase().includes('1st') || cert.achievement?.toLowerCase().includes('winner');
            return (
              <motion.div key={cert.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}>
                <div style={{
                  padding: '28px 30px', borderRadius: 22,
                  background: isWin ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.03)',
                  border: isWin ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: isWin ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={24} color={isWin ? '#fbbf24' : '#94a3b8'} />
                    </div>
                    {isWin && <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>🏆 Winner</span>}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, lineHeight: 1.3 }}>{cert.hackathon_title}</p>
                  <p style={{ fontSize: 13, color: '#818cf8', fontWeight: 600, marginBottom: 4 }}>{cert.achievement}</p>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>{cert.student_name}</p>
                  <p style={{ fontSize: 11, color: '#475569', marginBottom: 12 }}>
                    Issued: {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : '—'}
                  </p>
                  {cert.verification_code && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b', flex: 1 }}>{cert.verification_code}</span>
                      <button onClick={() => copyCode(cert.verification_code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === cert.verification_code ? '#34d399' : '#475569', padding: 2 }}>
                        {copied === cert.verification_code ? <CheckCircle size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
