'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { getDashboardForRole } from '@/lib/auth';
import {
  Zap, ArrowRight, Trophy, Users, Building2, BarChart3,
  Star, Globe, Shield, Sparkles, CheckCircle, ChevronDown
} from 'lucide-react';

/* ─── Data ────────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: <Zap size={20} />, color: '#818cf8', bg: 'rgba(99,102,241,0.12)', title: 'Instant Hackathon Setup', desc: 'Launch a complete hackathon in minutes with automated registration, submission, and judging workflows.' },
  { icon: <Users size={20} />, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', title: 'Smart Team Management', desc: 'Automated team formation, invitation system with real-time participant tracking across all events.' },
  { icon: <Trophy size={20} />, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', title: 'Live Leaderboards', desc: 'Real-time leaderboards with dynamic scoring, filtering, and animated rank changes.' },
  { icon: <BarChart3 size={20} />, color: '#34d399', bg: 'rgba(16,185,129,0.12)', title: 'Deep Analytics', desc: 'Rich dashboards with participant insights, engagement metrics, and performance analytics.' },
  { icon: <Shield size={20} />, color: '#c084fc', bg: 'rgba(168,85,247,0.12)', title: 'Role-Based Control', desc: 'Hierarchical RBAC with Admin, Organization, Event Manager, and Student roles — fully isolated.' },
  { icon: <Globe size={20} />, color: '#22d3ee', bg: 'rgba(6,182,212,0.12)', title: 'Multi-College Platform', desc: 'Run events across multiple institutions with college-specific branding and namespaces.' },
];

const STATS = [
  { value: '50+', label: 'Colleges' },
  { value: '10K+', label: 'Students' },
  { value: '200+', label: 'Hackathons Run' },
  { value: '₹1Cr+', label: 'Prize Pool' },
];

const TESTIMONIALS = [
  { name: 'Dr. Ananya Krishnan', role: 'Dean, IIT Bombay', text: 'HackForge transformed how we run hackathons. What used to take weeks now happens in minutes.', stars: 5 },
  { name: 'Rahul Sharma', role: 'Event Manager, BITS Pilani', text: 'The analytics dashboard alone is worth it. We finally have real data on participant engagement.', stars: 5 },
  { name: 'Priya Patel', role: 'Student, IIT Delhi', text: 'Finding and registering for hackathons has never been easier. The team creation flow is seamless.', stars: 5 },
];

const COLLEGES = ['IIT Bombay', 'IIT Delhi', 'BITS Pilani', 'VIT Vellore', 'NIT Trichy'];

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) router.push(getDashboardForRole(role));
  }, [user, role, router]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    background: scrolled ? 'rgba(8,12,20,0.92)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(99,102,241,0.12)' : '1px solid transparent',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Background glows ──────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div className="blob" style={{ width: 700, height: 700, background: 'rgba(99,102,241,0.07)', top: -200, right: -200, filter: 'blur(140px)' }} />
        <div className="blob" style={{ width: 500, height: 500, background: 'rgba(59,130,246,0.06)', top: '40%', left: -200, filter: 'blur(120px)' }} />
        <div className="blob" style={{ width: 400, height: 400, background: 'rgba(168,85,247,0.05)', bottom: 0, right: '20%', filter: 'blur(100px)' }} />
        <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.06 }} />
      </div>

      {/* ── Navbar ───────────────────────────────────────── */}
      <nav style={navStyle}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99,102,241,0.4)', flexShrink: 0 }}>
              <Zap size={17} color="white" />
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>HackForge</span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <div className="hidden md:flex" style={{ gap: 32 }}>
              {[['#features', 'Features'], ['#stats', 'Platform'], ['#testimonials', 'Reviews']].map(([href, label]) => (
                <a key={label} href={href} style={{ fontSize: 14, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                >{label}</a>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => router.push('/signin')}
                style={{ padding: '7px 18px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
              >Sign In</button>
              <button
                id="nav-get-started"
                onClick={() => router.push('/signup')}
                className="btn-neon"
                style={{ padding: '7px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
              >Get Started <ArrowRight size={14} /></button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: 140, paddingBottom: 100, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 32 }}
          >
            <Sparkles size={13} color="#818cf8" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.02em' }}>Premium Hackathon Infrastructure for India</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 28, color: '#f1f5f9' }}
          >
            Run World-Class<br />
            <span className="gradient-text">Hackathons</span><br />
            at Scale
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            style={{ fontSize: 18, lineHeight: 1.7, color: '#94a3b8', maxWidth: 620, margin: '0 auto 44px' }}
          >
            The complete hackathon management platform for colleges, organizations, and students.
            From registration to certificates — everything in one elegant system.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button
              id="hero-cta-signup"
              onClick={() => router.push('/signup')}
              className="btn-neon"
              style={{ padding: '14px 32px', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
            >Start for Free <ArrowRight size={18} /></button>
            <button
              id="hero-cta-signin"
              onClick={() => router.push('/signin')}
              style={{ padding: '14px 32px', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
            >Sign In</button>
          </motion.div>

          {/* College tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <span style={{ fontSize: 12, color: '#475569', marginRight: 4 }}>Trusted by</span>
            {COLLEGES.map(c => (
              <span key={c} style={{ fontSize: 12, color: '#64748b', fontWeight: 500, padding: '4px 12px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>{c}</span>
            ))}
          </motion.div>
        </div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.45, type: 'spring', damping: 28 }}
          style={{ maxWidth: 1000, margin: '80px auto 0', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 0 120px rgba(99,102,241,0.12), 0 60px 100px rgba(0,0,0,0.5)' }}
        >
          {/* Mac chrome */}
          <div style={{ background: 'rgba(13,18,32,0.96)', padding: '12px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,95,87,0.6)' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,189,46,0.6)' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(40,200,64,0.6)' }} />
            </div>
            <div style={{ flex: 1, height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
              <span style={{ fontSize: 11, color: '#475569' }}>hackforge.io/dashboard</span>
            </div>
          </div>
          {/* App preview */}
          <div style={{ background: 'var(--bg-primary)', display: 'flex', height: 280 }}>
            {/* Sidebar */}
            <div style={{ width: 180, borderRight: '1px solid rgba(99,102,241,0.08)', padding: '16px 12px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(99,102,241,0.12)', marginBottom: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: 4, background: '#6366f1', flexShrink: 0 }} />
                <div style={{ height: 8, width: 60, borderRadius: 4, background: 'rgba(148,163,184,0.5)' }} />
              </div>
              <div style={{ fontSize: 9, color: '#475569', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px', marginBottom: 4 }}>MANAGEMENT</div>
              {['Colleges', 'Organizations', 'Analytics'].map((item, i) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, marginBottom: 2 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: '#334155', flexShrink: 0 }} />
                  <div style={{ height: 7, borderRadius: 4, background: '#334155', width: [48, 72, 56][i] }} />
                </div>
              ))}
            </div>
            {/* Main content */}
            <div style={{ flex: 1, padding: '20px 24px', overflow: 'hidden' }}>
              <div style={{ height: 18, width: 180, borderRadius: 6, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { val: '4', label: 'Active', color: '#6366f1' },
                  { val: '3,847', label: 'Students', color: '#3b82f6' },
                  { val: '1,243', label: 'Submissions', color: '#10b981' },
                  { val: '₹32L', label: 'Prize Pool', color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[0, 1].map(col => (
                  <div key={col} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ height: 8, width: '55%', borderRadius: 4, background: '#334155', marginBottom: 14 }} />
                    {[85, 60, 40].map((w, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ height: 6, borderRadius: 3, background: `rgba(99,102,241,${0.7 - i * 0.2})`, width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section id="stats" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', borderTop: '1px solid rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, textAlign: 'center' }}>
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="gradient-text" style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#818cf8' }}>Platform Features</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.75rem)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Everything you need to run<br />world-class hackathons
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              Built by hackers, for hackers. Every feature designed to remove friction and amplify creativity.
            </p>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass glass-hover"
                style={{ borderRadius: 18, padding: '28px 28px 26px' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, border: `1px solid ${f.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: f.color }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section id="testimonials" style={{ position: 'relative', zIndex: 1, padding: '100px 24px', background: 'rgba(99,102,241,0.025)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399' }}>Testimonials</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.75rem)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Loved by students and organizers
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass"
                style={{ borderRadius: 18, padding: '28px', display: 'flex', flexDirection: 'column', gap: 0 }}
              >
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {Array(t.stars).fill(null).map((_, si) => (
                    <Star key={si} size={14} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, flex: 1, marginBottom: 20 }}>"{t.text}"</p>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ borderRadius: 28, padding: '72px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(59,130,246,0.09) 100%)', border: '1px solid rgba(99,102,241,0.22)' }}
          >
            <div className="blob" style={{ width: 300, height: 300, background: 'rgba(99,102,241,0.2)', top: -80, right: -60, filter: 'blur(70px)' }} />
            <div className="blob" style={{ width: 200, height: 200, background: 'rgba(59,130,246,0.15)', bottom: -60, left: -40, filter: 'blur(60px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: 14, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Ready to launch your<br />first hackathon?
              </h2>
              <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 40, lineHeight: 1.6 }}>
                Join thousands of students and organizers on HackForge today.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  id="cta-signup"
                  onClick={() => router.push('/signup')}
                  className="btn-neon"
                  style={{ padding: '13px 32px', borderRadius: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
                >Create Free Account <ArrowRight size={17} /></button>
                <button
                  id="cta-signin"
                  onClick={() => router.push('/signin')}
                  style={{ padding: '13px 28px', borderRadius: 13, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#f1f5f9', transition: 'all 0.2s ease' }}
                >Sign In</button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(99,102,241,0.08)', padding: '36px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={13} color="white" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>HackForge</span>
        </div>
        <p style={{ fontSize: 12, color: '#475569' }}>© 2025 HackForge. Premium Hackathon Management Platform.</p>
      </footer>
    </div>
  );
}
