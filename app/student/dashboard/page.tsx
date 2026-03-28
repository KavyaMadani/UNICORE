'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, Tag } from '@/components/ui/Badge';
import { MOCK_HACKATHONS, MOCK_CERTIFICATES, MOCK_TEAMS } from '@/lib/mock-data';
import { useAuth } from '@/context/AuthProvider';
import { Zap, Award, Users, FileText, ArrowRight, Trophy, Clock, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getTimeRemaining, formatDate } from '@/lib/utils';

function CountdownTimer({ endDate }: { endDate: string }) {
  const [time, setTime] = useState(getTimeRemaining(endDate));
  useEffect(() => {
    const iv = setInterval(() => setTime(getTimeRemaining(endDate)), 1000);
    return () => clearInterval(iv);
  }, [endDate]);
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[{ label: 'D', value: time.days }, { label: 'H', value: time.hours }, { label: 'M', value: time.minutes }, { label: 'S', value: time.seconds }].map(unit => (
        <div key={unit.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44, padding: '8px 10px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{String(unit.value).padStart(2, '0')}</div>
          <div style={{ fontSize: 9, color: '#64748b', marginTop: 3, letterSpacing: '0.06em', fontWeight: 600 }}>{unit.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const activeHackathon = MOCK_HACKATHONS.find(h => h.status === 'active');
  const upcomingHackathons = MOCK_HACKATHONS.filter(h => h.status === 'upcoming');

  const statItems = [
    { label: 'Hackathons Joined', value: 3, icon: <Zap size={20} className="text-indigo-400" />, change: '2 active', dir: 'up' as const },
    { label: 'Certificates Earned', value: MOCK_CERTIFICATES.length, icon: <Award size={20} className="text-amber-400" />, change: 'All time', dir: 'neutral' as const },
    { label: 'Projects Submitted', value: 2, icon: <FileText size={20} className="text-blue-400" />, change: '1 under review', dir: 'neutral' as const },
    { label: 'Teams Formed', value: 1, icon: <Users size={20} className="text-emerald-400" />, change: '4 members', dir: 'neutral' as const },
  ];

  const firstName = user?.name?.split(' ')[0] ?? 'Student';

  return (
    <DashboardLayout title={`Welcome back, ${firstName}! 👋`} subtitle="Your hackathon journey at a glance">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
        {statItems.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Active hackathon banner */}
          {activeHackathon && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ borderRadius: 20, padding: '28px 30px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(59,130,246,0.12) 100%)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <div className="blob" style={{ width: 200, height: 200, background: 'rgba(99,102,241,0.25)', top: -60, right: -40, filter: 'blur(60px)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Badge variant="active" dot>LIVE NOW</Badge>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{activeHackathon.college}</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 6 }}>{activeHackathon.title}</h2>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.5, marginBottom: 20 }}>{activeHackathon.subtitle}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Time Remaining</p>
                    <CountdownTimer endDate={activeHackathon.endDate} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Prize Pool</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>{activeHackathon.prizePool}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Participants</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#a5b4fc' }}>{activeHackathon.participantCount.toLocaleString()}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <Button size="sm" onClick={() => router.push(`/student/hackathons/${activeHackathon.id}`)}>
                    View Hackathon <ArrowRight size={14} />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => router.push('/student/submissions')}>
                    <FileText size={14} /> Submit Project
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Discover Hackathons */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <CardTitle>Discover Hackathons</CardTitle>
                <CardSubtitle>Upcoming events you can join</CardSubtitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/student/hackathons')} rightIcon={<ArrowRight size={14} />}>
                Browse all
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingHackathons.map((hack, i) => (
                <motion.div
                  key={hack.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  onClick={() => router.push(`/student/hackathons/${hack.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.045)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={18} color="#818cf8" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{hack.title}</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>{hack.college} · Starts {formatDate(hack.startDate)}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>{hack.prizePool}</span>
                    <Badge variant="upcoming">upcoming</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* My Team */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <CardTitle>My Team</CardTitle>
              <Button variant="ghost" size="xs" onClick={() => router.push('/student/registrations')}>View</Button>
            </div>
            {MOCK_TEAMS.slice(0, 1).map((team) => (
              <div key={team.id}>
                <div style={{ padding: '16px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{team.name}</h3>
                    <span style={{ fontSize: 12, color: '#64748b', background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.07)' }}>
                      {team.members.length}/{team.maxSize} members
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {team.members.map((m) => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>
                          {m.name[0]}
                        </div>
                      </div>
                    ))}
                    {Array(team.maxSize - team.members.length).fill(null).map((_, si) => (
                      <div key={si} style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px dashed rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: 14 }}>+</div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', padding: '8px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    Invite code: <span style={{ fontFamily: 'monospace', color: '#818cf8', fontWeight: 700 }}>{team.inviteCode}</span>
                  </div>
                </div>
              </div>
            ))}
          </Card>

          {/* Certificates */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <CardTitle>Certificates</CardTitle>
              <Button variant="ghost" size="xs" onClick={() => router.push('/student/certificates')}>View all</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOCK_CERTIFICATES.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.14)' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(251,191,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award size={17} color="#fbbf24" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{cert.hackathonTitle}</p>
                    <p style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>{cert.achievement}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
