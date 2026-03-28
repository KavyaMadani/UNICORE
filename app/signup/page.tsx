'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';
import { signUpStudent } from '@/lib/auth';
import { getDomainFromEmail } from '@/lib/college-detect';
import { Zap, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, School } from 'lucide-react';
import Link from 'next/link';

const PERKS = [
  'Browse & register for hackathons',
  'Create and manage teams',
  'Submit projects & get scored',
  'Earn digital certificates',
];

export default function SignUpPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [detectedCollege, setDetectedCollege] = useState('');
  const [detectingCollege, setDetectingCollege] = useState(false);

  useEffect(() => {
    if (user) router.push('/student/dashboard');
  }, [user, router]);

  // Live college detection as user types email
  const detectCollege = useCallback(async (emailVal: string) => {
    const domain = getDomainFromEmail(emailVal);
    if (!domain || !domain.includes('.')) { setDetectedCollege(''); return; }
    setDetectingCollege(true);
    try {
      const { detectCollegeFromEmail } = await import('@/lib/college-detect');
      const result = await detectCollegeFromEmail(emailVal);
      setDetectedCollege(result.college ?? '');
    } catch { setDetectedCollege(''); }
    setDetectingCollege(false);
  }, []);

  // Debounce email changes
  useEffect(() => {
    if (!email.includes('@')) { setDetectedCollege(''); return; }
    const t = setTimeout(() => detectCollege(email), 600);
    return () => clearTimeout(t);
  }, [email, detectCollege]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!name.trim() || !email.trim() || !password) { setServerError('All fields are required.'); return; }
    if (password.length < 6) { setServerError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setServerError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const { user: newUser, error } = await signUpStudent(email.trim(), password, name.trim());
      if (error) { setServerError(error); return; }
      if (newUser) {
        document.cookie = `hackforge_session_flag=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        setSuccess(true);
        setTimeout(() => router.push('/student/dashboard'), 1800);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(9,13,25,0.8)', border: '1px solid rgba(99,102,241,0.15)',
    color: '#f1f5f9', fontSize: '0.875rem', lineHeight: 1.5, borderRadius: '0.75rem',
    padding: '0.6875rem 1rem', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };


  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob" style={{ width: 500, height: 500, background: 'rgba(99,102,241,0.08)', top: -80, right: -80 }} />
        <div className="blob" style={{ width: 300, height: 300, background: 'rgba(59,130,246,0.07)', bottom: '10%', left: -80 }} />
        <div className="grid-pattern absolute inset-0" style={{ opacity: 0.07 }} />
      </div>

      <div className="relative z-10 w-full" style={{ maxWidth: 860 }}>
        <div className="grid gap-8" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>

          {/* Left — branding */}
          <div className="hidden md:flex flex-col justify-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-10" style={{ color: '#64748b' }}>
              ← Back to home
            </Link>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
                <Zap size={20} color="white" />
              </div>
              <span className="text-xl font-bold" style={{ color: '#f1f5f9' }}>HackForge</span>
            </div>
            <h2 className="text-3xl font-bold mb-3 leading-tight" style={{ color: '#f1f5f9' }}>
              Join the community<br />of builders
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: '#64748b' }}>
              HackForge connects ambitious students with world-class hackathons. Sign up and start your journey today.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {PERKS.map((perk, i) => (
                <motion.div
                  key={perk}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 24, height: 24, background: 'rgba(99,102,241,0.15)' }}>
                    <CheckCircle size={13} color="#818cf8" />
                  </div>
                  <span className="text-sm" style={{ color: '#94a3b8' }}>{perk}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass rounded-2xl" style={{ padding: '2rem' }}>

              {/* Mobile logo */}
              <div className="md:hidden flex items-center gap-2.5 mb-6">
                <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}>
                  <Zap size={16} color="white" />
                </div>
                <span className="font-bold" style={{ color: '#f1f5f9' }}>HackForge</span>
              </div>

              <h1 className="text-xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Create your account</h1>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>Student account — free forever</p>

              {success && (
                <div className="flex items-center gap-2.5 rounded-xl mb-4" style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                  <CheckCircle size={15} color="#34d399" />
                  <p className="text-sm" style={{ color: '#34d399' }}>Account created! Redirecting…</p>
                </div>
              )}

              {serverError && (
                <div className="flex items-start gap-2.5 rounded-xl mb-4" style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle size={15} color="#f87171" style={{ marginTop: 1, flexShrink: 0 }} />
                  <p className="text-sm" style={{ color: '#f87171' }}>{serverError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Full name</label>
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Arjun Sharma"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Email address</label>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@charusat.edu.in"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                  {/* Live college detection */}
                  {detectingCollege && (
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>🔍 Detecting your college…</p>
                  )}
                  {!detectingCollege && detectedCollege && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7, padding: '6px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <School size={13} color="#818cf8" />
                      <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 600 }}>Detected: {detectedCollege}</span>
                      <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>✓ You&apos;ll be registered as a student of this college</span>
                    </motion.div>
                  )}
                </div>


                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Password</label>
                  <div className="relative flex items-center">
                    <input
                      id="signup-password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      style={{ ...inputStyle, paddingRight: '2.75rem' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.15)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-0 flex items-center justify-center"
                      style={{ width: '2.75rem', height: '100%', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Confirm password</label>
                  <input
                    id="signup-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <button
                  id="signup-submit"
                  type="submit"
                  disabled={loading || success}
                  className="btn-neon w-full rounded-xl font-semibold flex items-center justify-center gap-2"
                  style={{ padding: '0.75rem 1rem', marginTop: '0.5rem', fontSize: '0.9375rem' }}
                >
                  {loading ? (
                    <>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Creating account…
                    </>
                  ) : (
                    <>Create Account <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <p className="text-xs text-center" style={{ color: '#475569', marginTop: '1rem' }}>
                By signing up you agree to our Terms of Service and Privacy Policy.
              </p>

              <div className="text-center" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm" style={{ color: '#64748b' }}>
                  Already have an account?{' '}
                  <Link href="/signin" className="font-medium" style={{ color: '#818cf8' }}>
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
