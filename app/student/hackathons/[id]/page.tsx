'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, Tag, Progress } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { MOCK_HACKATHONS, MOCK_LEADERBOARD, MOCK_ANNOUNCEMENTS } from '@/lib/mock-data';
import {
  Zap, Users, Trophy, Calendar, ArrowLeft, CheckCircle,
  X, User, UserPlus, Clock, Shield, Megaphone, BarChart3
} from 'lucide-react';
import { formatDate, getTimeRemaining, generateInviteCode } from '@/lib/utils';

function CountdownTimer({ endDate }: { endDate: string }) {
  const [time, setTime] = useState(getTimeRemaining(endDate));
  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeRemaining(endDate)), 1000);
    return () => clearInterval(interval);
  }, [endDate]);
  return (
    <div className="flex gap-3">
      {[
        { label: 'Days', value: time.days },
        { label: 'Hours', value: time.hours },
        { label: 'Mins', value: time.minutes },
        { label: 'Secs', value: time.seconds },
      ].map((unit) => (
        <div key={unit.label} className="countdown-box">
          <div className="text-2xl font-black text-white leading-none">{String(unit.value).padStart(2, '0')}</div>
          <div className="text-[10px] text-slate-600 mt-1">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}

type TabType = 'overview' | 'register' | 'leaderboard' | 'announcements';

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hackathon = MOCK_HACKATHONS.find(h => h.id === params.id) ?? MOCK_HACKATHONS[0];
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [inviteCode] = useState(generateInviteCode());

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Zap size={14} /> },
    { id: 'register', label: 'Register', icon: <UserPlus size={14} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={14} /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={14} /> },
  ];

  return (
    <DashboardLayout title={hackathon.title} subtitle={hackathon.college}>
      <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/student/hackathons')} className="mb-6">
        Back to Browse
      </Button>

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-8 mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(59,130,246,0.15) 50%, rgba(6,182,212,0.1) 100%)',
          border: '1px solid rgba(99,102,241,0.3)',
        }}
      >
        <div className="blob w-64 h-64 bg-indigo-500/20 -top-20 -right-20" style={{ filter: 'blur(60px)' }} />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant={hackathon.status} dot={hackathon.status === 'active'} size="md">{hackathon.status.toUpperCase()}</Badge>
            {hackathon.isFeatured && <Badge variant="upcoming" size="md">⭐ Featured</Badge>}
            {hackathon.tags.slice(0, 3).map(tag => <Tag key={tag}>{tag}</Tag>)}
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{hackathon.title}</h1>
          <p className="text-lg text-indigo-300 mb-4">{hackathon.subtitle}</p>

          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2"><Users size={15} /> {hackathon.participantCount} participants</div>
            <div className="flex items-center gap-2"><Trophy size={15} className="text-amber-400" /> {hackathon.prizePool}</div>
            <div className="flex items-center gap-2"><Calendar size={15} /> {formatDate(hackathon.startDate)}</div>
            <div className="flex items-center gap-2"><Shield size={15} /> {hackathon.minTeamSize}–{hackathon.maxTeamSize} per team</div>
          </div>

          {hackathon.status === 'active' && (
            <div className="mt-6">
              <p className="text-xs text-slate-500 mb-2">Time Remaining</p>
              <CountdownTimer endDate={hackathon.endDate} />
            </div>
          )}

          {hackathon.status === 'upcoming' && (
            <div className="mt-6">
              <p className="text-xs text-slate-500 mb-2">Starts In</p>
              <CountdownTimer endDate={hackathon.startDate} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <Card>
                  <CardTitle className="mb-4">About this Hackathon</CardTitle>
                  <p className="text-sm text-slate-400 leading-relaxed">{hackathon.description}</p>
                </Card>

                <Card>
                  <CardTitle className="mb-4">Rules & Guidelines</CardTitle>
                  <ul className="space-y-3">
                    {hackathon.rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                        <CheckCircle size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card>
                  <CardTitle className="mb-4">Timeline</CardTitle>
                  <div className="space-y-4">
                    {hackathon.timeline.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                          {item.done
                            ? <CheckCircle size={14} className="text-emerald-400" />
                            : <span className="text-slate-600 text-xs font-bold">{i + 1}</span>
                          }
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${item.done ? 'text-slate-400' : 'text-slate-200'}`}>{item.label}</p>
                          <p className="text-xs text-slate-600">{item.date}</p>
                        </div>
                        {item.done && <span className="text-xs text-emerald-400">Done</span>}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Prizes */}
              <div>
                <Card>
                  <CardTitle className="mb-4">🏆 Prize Pool</CardTitle>
                  <div className="text-2xl font-black gradient-text mb-4">{hackathon.prizePool}</div>
                  <div className="space-y-3">
                    {hackathon.prizes.map((prize, i) => (
                      <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-300">{prize.rank}</span>
                          <span className="text-sm font-bold text-emerald-400">{prize.amount}</span>
                        </div>
                        <p className="text-xs text-slate-500">{prize.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="mt-4">
                  <CardTitle className="mb-4">Participation Stats</CardTitle>
                  <div className="space-y-3">
                    <Progress value={hackathon.participantCount} max={1000} label="Participants" showValue />
                    <Progress value={hackathon.teamCount} max={300} label="Teams" showValue />
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Register tab */}
          {activeTab === 'register' && (
            <div className="max-w-lg">
              {isRegistered ? (
                <Card className="text-center py-8">
                  <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-100 mb-2">You&apos;re Registered!</h2>
                  <p className="text-sm text-slate-400 mb-6">Team: <span className="text-indigo-400 font-semibold">{teamName || 'NeuralNinjas'}</span></p>
                  <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <p className="text-xs text-slate-400 mb-1">Your Team Invite Code</p>
                    <p className="font-mono text-lg font-bold text-indigo-400">{inviteCode}</p>
                    <p className="text-[11px] text-slate-600 mt-1">Share this with your teammates</p>
                  </div>
                  <Button variant="secondary" onClick={() => setIsRegistered(false)}>Manage Team</Button>
                </Card>
              ) : (
                <Card>
                  <CardTitle className="mb-5">Register for {hackathon.title}</CardTitle>
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                      <p className="text-xs font-semibold text-indigo-400 mb-2">Team Requirements</p>
                      <ul className="space-y-1.5 text-xs text-slate-400">
                        <li className="flex items-center gap-2"><CheckCircle size={11} className="text-emerald-400" />Min {hackathon.minTeamSize}, max {hackathon.maxTeamSize} members</li>
                        <li className="flex items-center gap-2"><CheckCircle size={11} className="text-emerald-400" />Each member must have a verified account</li>
                        <li className="flex items-center gap-2"><CheckCircle size={11} className="text-emerald-400" />Only one registration per student</li>
                      </ul>
                    </div>

                    <Input
                      id="team-name-input"
                      label="Team Name"
                      placeholder="e.g. NeuralNinjas"
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                    />

                    <div className="flex gap-3">
                      <Button className="flex-1" onClick={() => { setIsRegistered(true); }}>
                        Create Team & Register
                      </Button>
                      <Button variant="secondary" className="flex-1">
                        Join Existing Team
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Leaderboard tab */}
          {activeTab === 'leaderboard' && (
            <Card>
              <CardTitle className="mb-5">Live Leaderboard</CardTitle>
              {hackathon.status !== 'ended' && (
                <div className="p-3 rounded-xl mb-5 text-xs text-amber-400" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  Leaderboard results will be final after hackathon ends. Current rankings are preliminary.
                </div>
              )}
              <div className="space-y-3">
                {MOCK_LEADERBOARD.map((entry, i) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{
                      background: i === 0 ? 'rgba(251,191,36,0.06)' : i === 1 ? 'rgba(148,163,184,0.06)' : i === 2 ? 'rgba(180,83,9,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${i === 0 ? 'rgba(251,191,36,0.2)' : i === 1 ? 'rgba(148,163,184,0.15)' : i === 2 ? 'rgba(180,83,9,0.15)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0"
                      style={{ background: i === 0 ? 'rgba(251,191,36,0.2)' : i === 1 ? 'rgba(148,163,184,0.2)' : i === 2 ? 'rgba(180,83,9,0.2)' : 'rgba(255,255,255,0.05)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-200">{entry.teamName}</p>
                      <p className="text-xs text-slate-500 truncate">{entry.projectTitle} · {entry.college}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-indigo-400">{entry.score}</div>
                      <div className="text-[10px] text-slate-600">points</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Announcements tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              {MOCK_ANNOUNCEMENTS.filter(a => a.hackathonId === hackathon.id).map((ann, i) => (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-xl"
                  style={{
                    background: ann.type === 'warning' ? 'rgba(251,191,36,0.05)' : ann.type === 'success' ? 'rgba(16,185,129,0.05)' : 'rgba(99,102,241,0.05)',
                    border: `1px solid ${ann.type === 'warning' ? 'rgba(251,191,36,0.2)' : ann.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'}`,
                  }}
                >
                  <p className="text-sm font-bold text-slate-200 mb-2">{ann.title}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{ann.content}</p>
                  <p className="text-xs text-slate-600 mt-3">{new Date(ann.createdAt).toLocaleDateString()}</p>
                </motion.div>
              ))}
              {MOCK_ANNOUNCEMENTS.filter(a => a.hackathonId === hackathon.id).length === 0 && (
                <Card className="text-center py-10">
                  <Megaphone size={32} className="mx-auto mb-3 text-slate-700" />
                  <p className="text-sm text-slate-500">No announcements for this hackathon yet.</p>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
