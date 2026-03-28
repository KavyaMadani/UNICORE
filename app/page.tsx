'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { getDashboardForRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  Zap, ArrowRight, Trophy, Users, Building2, BarChart3,
  Globe, Shield, Sparkles, Calendar, School, ChevronRight
} from 'lucide-react';

/* ─── Features (static — platform capabilities) ─────────────── */
const FEATURES = [
  { icon: <Zap size={20} />, color: '#818cf8', bg: 'rgba(99,102,241,0.12)', title: 'Instant Hackathon Setup', desc: 'Launch a complete hackathon in minutes with automated registration, submission, and judging workflows.' },
  { icon: <Users size={20} />, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', title: 'Smart Team Management', desc: 'Team creation with leader-invite system, join requests, and real-time participant tracking.' },
  { icon: <Trophy size={20} />, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', title: 'Prizes & Leaderboards', desc: 'Configure prize pools with structured tiers. Post-event leaderboards with rank tracking.' },
  { icon: <BarChart3 size={20} />, color: '#34d399', bg: 'rgba(16,185,129,0.12)', title: 'Deep Analytics', desc: 'Rich dashboards with participant insights, registration trends, and performance metrics.' },
  { icon: <Shield size={20} />, color: '#c084fc', bg: 'rgba(168,85,247,0.12)', title: 'Role-Based Access', desc: 'Secure hierarchical RBAC — Admin, Organization, Event Manager, and Student — fully isolated.' },
  { icon: <Globe size={20} />, color: '#22d3ee', bg: 'rgba(6,182,212,0.12)', title: 'Multi-College Platform', desc: 'Run events across multiple institutions detected automatically via college email domains.' },
];

/* ─── Types ──────────────────────────────────────────────────── */
interface LiveHackathon {
  id: string;
  title: string;
  subtitle: string;
  college: string;
  status: string;
  registration_deadline: string;
  max_team_size: number;
  allow_solo: boolean;
  is_featured: boolean;
}
interface LiveCollege {
  id: string;
  name: string;
  domain: string | null;
}

/* ─── Component ──────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Real data from DB
  const [hackathons, setHackathons] = useState<LiveHackathon[]>([]);
  const [colleges, setColleges] = useState<LiveCollege[]>([]);
  const [counts, setCounts] = useState({ hackathons: 0, colleges: 0, students: 0 });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) router.push(getDashboardForRole(role));
  }, [user, role, router]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    (async () => {
      // Fetch real hackathons (upcoming + active, max 6)
      const { data: hacks } = await supabase
        .from('hackathons')
        .select('id, title, subtitle, college, status, registration_deadline, max_team_size, allow_solo, is_featured')
        .in('status', ['upcoming', 'active'])
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      // Fetch registered colleges (max 12)
      const { data: cols } = await supabase
        .from('colleges')
        .select('id, name, domain')
        .order('name', { ascending: true })
        .limit(12);

      // Counts
      const [{ count: hackCount }, { count: colCount }, { count: stuCount }] = await Promise.all([
        supabase.from('hackathons').select('*', { count: 'exact', head: true }),
        supabase.from('colleges').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      ]);

      setHackathons((hacks ?? []) as LiveHackathon[]);
      setColleges((cols ?? []) as LiveCollege[]);
      setCounts({
        hackathons: hackCount ?? 0,
        colleges: colCount ?? 0,
        students: stuCount ?? 0,
      });
      setLoadingData(false);
    })();
  }, []);

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    background: scrolled ? 'rgba(8,12,20,0.92)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(99,102,241,0.12)' : '1px solid transparent',
    transition: 'all 0.3s ease',
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    upcoming: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    active:   { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
    ended:    { bg: 'rgba(100,116,139,0.1)',  color: '#64748b' },
  };

  const daysLeft = (deadline: string) => {
    const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (d < 0) return null;
    if (d === 0) return 'Closes today';
    return `${d}d left`;
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Background glows ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div className="blob" style={{ width: 700, height: 700, background: 'rgba(99,102,241,0.07)', top: -200, right: -200, filter: 'blur(140px)' }} />
        <div className="blob" style={{ width: 500, height: 500, background: 'rgba(59,130,246,0.06)', top: '40%', left: -200, filter: 'blur(120px)' }} />
        <div className="blob" style={{ width: 400, height: 400, background: 'rgba(168,85,247,0.05)', bottom: 0, right: '20%', filter: 'blur(100px)' }} />
        <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.06 }} />
      </div>

      {/* ── Navbar ── */}
      <nav style={navStyle}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              <Zap size={17} color="white" />
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>HackForge</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <div className="hidden md:flex" style={{ gap: 32 }}>
              {[['#features', 'Features'], ['#hackathons', 'Hackathons'], ['#colleges', 'Colleges']].map(([href, label]) => (
                <a key={label} href={href} style={{ fontSize: 14, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                >{label}</a>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => router.push('/signin')}
                style={{ padding: '7px 18px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
              >Sign In</button>
              <button id="nav-get-started" onClick={() => router.push('/signup')} className="btn-neon"
                style={{ padding: '7px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                Get Started <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 32 }}>
            <Sparkles size={13} color="#818cf8" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.02em' }}>Premium Hackathon Infrastructure for India</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 28, color: '#f1f5f9' }}>
            Run World-Class<br />
            <span className="gradient-text">Hackathons</span><br />
            at Scale
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
            style={{ fontSize: 18, lineHeight: 1.7, color: '#94a3b8', maxWidth: 600, margin: '0 auto 44px' }}>
            The complete hackathon management platform — from registration to certificates.
            Role-based access for Admins, Organizers, Event Managers, and Students.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button id="hero-cta-signup" onClick={() => router.push('/signup')} className="btn-neon"
              style={{ padding: '14px 32px', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
              Start for Free <ArrowRight size={18} />
            </button>
            <button id="hero-cta-signin" onClick={() => router.push('/signin')}
              style={{ padding: '14px 32px', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}>
              Sign In
            </button>
          </motion.div>

          {/* ── Founders credit ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginTop: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <div style={{ height: 1, width: 36, background: 'linear-gradient(to right, transparent, rgba(251,113,133,0.35))' }} />
            <span style={{
              fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
              background: 'linear-gradient(90deg, #f472b6 0%, #fb923c 38%, #facc15 65%, #f472b6 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent', color: 'transparent',
              animation: 'founderGrad 6s ease-in-out infinite',
            }}>
              Made &amp; Founded by Madani Kavya &amp; Hardik Parmar
            </span>
            <div style={{ height: 1, width: 36, background: 'linear-gradient(to left, transparent, rgba(251,146,60,0.35))' }} />
          </motion.div>

        </div>
      </section>


      <section id="stats" style={{ position: 'relative', zIndex: 1, padding: '60px 24px', borderTop: '1px solid rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { value: counts.colleges,   label: 'Registered Colleges', icon: <Building2 size={18} color="#818cf8" /> },
            { value: counts.hackathons, label: 'Total Hackathons',    icon: <Trophy size={18} color="#fbbf24" /> },
            { value: counts.students,   label: 'Student Registrations', icon: <Users size={18} color="#34d399" /> },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>{stat.icon}</div>
              <div className="gradient-text" style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>
                {loadingData ? '—' : stat.value.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── LIVE HACKATHONS ── */}
      <section id="hackathons" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 18 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399' }}>Live on Platform</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.75rem)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 12 }}>
              Active &amp; Upcoming Hackathons
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
              Real hackathons listed on HackForge — register and start hacking.
            </p>
          </div>

          {loadingData ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ height: 180, borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.8s ease-in-out infinite' }} />
              ))}
            </div>
          ) : hackathons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Trophy size={40} style={{ margin: '0 auto 14px', opacity: 0.2 }} />
              <p style={{ fontSize: 15, color: '#475569', fontWeight: 600, marginBottom: 6 }}>No hackathons yet</p>
              <p style={{ fontSize: 13, color: '#475569' }}>Sign in as an Event Manager to create the first one!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
              {hackathons.map((h, i) => {
                const sc = statusColors[h.status] ?? statusColors.upcoming;
                const days = h.registration_deadline ? daysLeft(h.registration_deadline) : null;
                return (
                  <motion.div key={h.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                    <div
                      onClick={() => router.push('/signin')}
                      style={{ padding: '24px 26px', borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: `1px solid ${h.is_featured ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', transition: 'all 0.2s ease', height: '100%', display: 'flex', flexDirection: 'column' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(99,102,241,0.3)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.04)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = `1px solid ${h.is_featured ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.07)'}`; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h.status}</span>
                        {h.is_featured && <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>⭐ Featured</span>}
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{h.title}</h3>
                      {h.subtitle && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.5 }}>{h.subtitle}</p>}
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {h.college && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#64748b' }}>
                            <School size={12} color="#64748b" /> {h.college}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#64748b' }}>
                            <Users size={12} /> {h.allow_solo ? 'Solo & Team' : `Teams up to ${h.max_team_size}`}
                          </div>
                          {days && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: 'rgba(251,191,36,0.08)', color: '#fbbf24' }}>
                              <Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />{days}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {hackathons.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <button onClick={() => router.push('/signin')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                Sign in to see all &amp; register <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', background: 'rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 18 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#818cf8' }}>Platform Features</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.75rem)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 14 }}>
              Everything to run world-class hackathons
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Built for colleges and organizers who take hackathons seriously.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="glass glass-hover" style={{ borderRadius: 18, padding: '28px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, border: `1px solid ${f.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: f.color }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTERED COLLEGES ── */}
      <section id="colleges" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 18 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>Partner Colleges</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 12 }}>
              Colleges on HackForge
            </h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              {colleges.length > 0 ? `${colleges.length} institution${colleges.length !== 1 ? 's' : ''} registered` : 'No colleges added yet — Admin can add them from the Admin panel.'}
            </p>
          </div>

          {loadingData ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ height: 34, width: 140, borderRadius: 99, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.8s ease-in-out infinite' }} />
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Building2 size={36} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontSize: 14, color: '#475569' }}>No colleges registered yet.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {colleges.map((c, i) => (
                <motion.span key={c.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, padding: '8px 18px', borderRadius: 99, border: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.04)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <School size={12} color="#818cf8" />
                  {c.name}
                  {c.domain && <span style={{ fontSize: 10, color: '#475569' }}>@{c.domain}</span>}
                </motion.span>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ borderRadius: 28, padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(59,130,246,0.09) 100%)', border: '1px solid rgba(99,102,241,0.22)' }}>
            <div className="blob" style={{ width: 300, height: 300, background: 'rgba(99,102,241,0.2)', top: -80, right: -60, filter: 'blur(70px)' }} />
            <div className="blob" style={{ width: 200, height: 200, background: 'rgba(59,130,246,0.15)', bottom: -60, left: -40, filter: 'blur(60px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: 14, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Ready to launch your<br />first hackathon?
              </h2>
              <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 36, lineHeight: 1.6 }}>
                Students sign up free. Organizers get full management tools. Get started in seconds.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button id="cta-signup" onClick={() => router.push('/signup')} className="btn-neon"
                  style={{ padding: '13px 32px', borderRadius: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Create Student Account <ArrowRight size={17} />
                </button>
                <button id="cta-signin" onClick={() => router.push('/signin')}
                  style={{ padding: '13px 28px', borderRadius: 13, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#f1f5f9', transition: 'all 0.2s ease' }}>
                  Sign In
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(99,102,241,0.08)', padding: '36px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={13} color="white" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>HackForge</span>
        </div>
        <p style={{ fontSize: 12, color: '#475569' }}>© 2025 HackForge. Premium Hackathon Management Platform.</p>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes founderGrad {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

    </div>
  );
}
