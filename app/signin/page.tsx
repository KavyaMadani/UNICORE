'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmail, getDashboardForRole } from '@/lib/auth';
import { Zap, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError('Please fill in all fields.');
      return;
    }
    setAuthError(null);
    setLoading(true);
    try {
      let result = await signInWithEmail(email.trim(), password);


      const { user, error } = result;
      if (error || !user) {
        setAuthError(error ?? 'Sign in failed. Check your credentials.');
        return;
      }
      document.cookie = `hackforge_session_flag=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      document.cookie = `hackforge_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      router.push(getDashboardForRole(user.role));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob" style={{ width: 500, height: 500, background: 'rgba(99,102,241,0.08)', top: -100, right: -100 }} />
        <div className="blob" style={{ width: 300, height: 300, background: 'rgba(59,130,246,0.08)', bottom: '20%', left: -100 }} />
        <div className="grid-pattern absolute inset-0" style={{ opacity: 0.08 }} />
      </div>

      <div className="relative z-10 w-full" style={{ maxWidth: 420 }}>
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style={{ color: '#64748b' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
        >
          ← Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass rounded-2xl"
          style={{ padding: '2rem' }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center" style={{ marginBottom: '1.75rem' }}>
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                marginBottom: '1rem',
                boxShadow: '0 0 30px rgba(99,102,241,0.35)',
              }}
            >
              <Zap size={24} color="white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>Welcome back</h1>
            <p className="text-sm" style={{ color: '#64748b', marginTop: 4 }}>Sign in to your HackForge account</p>
          </div>

          {/* Error */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 rounded-xl"
              style={{
                padding: '10px 14px',
                marginBottom: '1.25rem',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <AlertCircle size={15} color="#f87171" style={{ marginTop: 1, flexShrink: 0 }} />
              <p className="text-sm" style={{ color: '#f87171' }}>{authError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Email field */}
            <div>
              <label
                htmlFor="signin-email"
                className="block text-sm font-medium"
                style={{ color: '#cbd5e1', marginBottom: 6 }}
              >
                Email address
              </label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-glass"
                style={{ paddingLeft: '1rem' }}
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="signin-password"
                className="block text-sm font-medium"
                style={{ color: '#cbd5e1', marginBottom: 6 }}
              >
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-glass"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-0 flex items-center justify-center transition-colors"
                  style={{ width: '2.75rem', height: '100%', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="signin-submit"
              type="submit"
              disabled={loading}
              className="btn-neon w-full rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{ padding: '0.75rem 1rem', marginTop: '0.25rem', fontSize: '0.9375rem' }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      animation: 'spin 0.7s linear infinite',
                      display: 'inline-block',
                    }}
                  />
                  Signing in…
                </>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: '#64748b', marginTop: '1.5rem' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium transition-colors"
              style={{ color: '#818cf8' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
              onMouseLeave={e => (e.currentTarget.style.color = '#818cf8')}
            >
              Create one
            </Link>
          </p>


        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
