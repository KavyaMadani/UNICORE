'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, Tag } from '@/components/ui/Badge';
import { MOCK_HACKATHONS, MOCK_SAVED_HACKATHONS } from '@/lib/mock-data';
import { Bookmark, BookmarkX, Zap, Users, Trophy, Calendar, ArrowRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function SavedHackathonsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<string[]>(MOCK_SAVED_HACKATHONS);
  const [search, setSearch] = useState('');
  const savedHackathons = MOCK_HACKATHONS.filter(h =>
    saved.includes(h.id) &&
    (!search || h.title.toLowerCase().includes(search.toLowerCase()))
  );

  const removeSaved = (id: string) => setSaved(prev => prev.filter(s => s !== id));

  return (
    <DashboardLayout title="Saved Hackathons" subtitle="Hackathons you have bookmarked for later">
      {savedHackathons.length === 0 && !search ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Bookmark size={56} style={{ margin: '0 auto 24px', color: '#334155' }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#475569', marginBottom: 10 }}>No saved hackathons</h3>
          <p style={{ fontSize: 14, color: '#334155', marginBottom: 28 }}>Bookmark hackathons while browsing to save them here.</p>
          <Button onClick={() => router.push('/student/hackathons')}>Browse Hackathons</Button>
        </div>
      ) : (
        <>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 360, marginBottom: 32 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>
              <Search size={15} />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search saved hackathons..."
              className="input-glass"
              style={{ paddingLeft: 40, paddingRight: 16, paddingTop: 11, paddingBottom: 11, width: '100%' }}
            />
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Saved', value: saved.length, color: '#818cf8' },
              { label: 'Active', value: MOCK_HACKATHONS.filter(h => saved.includes(h.id) && h.status === 'active').length, color: '#34d399' },
              { label: 'Upcoming', value: MOCK_HACKATHONS.filter(h => saved.includes(h.id) && h.status === 'upcoming').length, color: '#60a5fa' },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            <AnimatePresence>
              {savedHackathons.map((hack, i) => (
                <motion.div
                  key={hack.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.07 }}
                  layout
                >
                  <div style={{
                    padding: '24px 26px', borderRadius: 20, height: '100%',
                    background: 'rgba(255,255,255,0.025)',
                    border: hack.status === 'active' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', flexDirection: 'column',
                    transition: 'all 0.2s ease',
                  }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.1))',
                        border: '1px solid rgba(99,102,241,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Zap size={19} color="#818cf8" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Badge variant={hack.status as 'active' | 'upcoming' | 'ended'} dot={hack.status === 'active'}>{hack.status}</Badge>
                        <button
                          onClick={() => removeSaved(hack.id)}
                          title="Remove bookmark"
                          style={{
                            padding: 7, borderRadius: 9,
                            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)',
                            color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          }}
                        >
                          <BookmarkX size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, lineHeight: 1.3 }}>{hack.title}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>{hack.college}</p>
                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{hack.subtitle}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                      {hack.tags.slice(0, 3).map(tag => <Tag key={tag}>{tag}</Tag>)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, fontSize: 12, color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={12} /> {hack.participantCount}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fbbf24', fontWeight: 600 }}><Trophy size={12} /> {hack.prizePool}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={12} /> {formatDate(hack.startDate)}</div>
                    </div>

                    <button
                      onClick={() => router.push(`/student/hackathons/${hack.id}`)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '12px 16px', borderRadius: 12,
                        background: hack.status === 'active'
                          ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(59,130,246,0.2))'
                          : 'rgba(99,102,241,0.1)',
                        border: hack.status === 'active' ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(99,102,241,0.15)',
                        color: '#a5b4fc', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {hack.status === 'upcoming' ? 'Register Now' : hack.status === 'active' ? 'View Hackathon' : 'View Results'}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {savedHackathons.length === 0 && search && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
              <Search size={36} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: 15, fontWeight: 500 }}>No results for "{search}"</p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
