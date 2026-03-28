'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { UserCog, Plus, Mail, Lock, User, Phone, CheckCircle, AlertCircle, Eye, EyeOff, Copy, Check, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Manager { id: string; name: string | null; email: string | null; college: string | null; created_at: string | null; }
interface ManagerForm { name: string; email: string; password: string; phone: string; }

export default function OrgManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newCreds, setNewCreds] = useState<{ name: string; email: string; password: string } | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState<'email' | 'pass' | null>(null);
  const [orgCollege, setOrgCollege] = useState<string>('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ManagerForm>();

  useEffect(() => {
    (async () => {
      // Get current organizer's college
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: profile } = await supabase.from('profiles').select('college').eq('id', session.user.id).single();
        if (profile?.college) setOrgCollege(profile.college);
      }

      // Get all managers (you could filter by college if needed)
      const { data } = await supabase.from('profiles').select('id, name, email, college, created_at').eq('role', 'manager').order('created_at', { ascending: false });
      setManagers((data ?? []) as Manager[]);
      setLoading(false);
    })();
  }, []);

  const copyToClipboard = (text: string, type: 'email' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const onSubmit = async (data: ManagerForm) => {
    setSubmitError(null);
    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'manager',
        college: orgCollege,
        created_by_role: 'organization',
      }),
    });
    const json = await res.json();
    if (!res.ok) { setSubmitError(json.error ?? 'Failed to create manager'); return; }

    // Add to local list
    setManagers(prev => [{ id: json.user.id, name: data.name, email: data.email, college: orgCollege, created_at: new Date().toISOString() }, ...prev]);
    setNewCreds({ name: data.name, email: data.email, password: data.password });
    reset();
    setShowForm(false);
  };

  return (
    <DashboardLayout
      title="Event Managers"
      subtitle="Create and manage event managers for your college"
      actions={
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => { setShowForm(true); setNewCreds(null); setSubmitError(null); }}>
          Add Event Manager
        </Button>
      }
    >
      {/* New credentials banner */}
      <AnimatePresence>
        {newCreds && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginBottom: 24, padding: '20px 24px', borderRadius: 18, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <CheckCircle size={16} color="#34d399" />
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>Manager account created for {newCreds.name}</p>
                </div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[{ label: 'Email', value: newCreds.email, type: 'email' as const }, { label: 'Password', value: newCreds.password, type: 'pass' as const }].map(row => (
                    <div key={row.label}>
                      <p style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>{row.label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>{row.value}</p>
                        <button onClick={() => copyToClipboard(row.value, row.type)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === row.type ? '#34d399' : '#64748b' }}>
                          {copied === row.type ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#475569', marginTop: 10 }}>⚠ Save these credentials now — the password cannot be retrieved later.</p>
              </div>
              <button onClick={() => setNewCreds(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}><X size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Manager Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              style={{ width: '100%', maxWidth: 540, background: 'rgb(15,15,25)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '32px 36px' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCog size={18} color="#818cf8" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Create Event Manager</h2>
                    <p style={{ fontSize: 12, color: '#64748b' }}>For {orgCollege || 'your college'}</p>
                  </div>
                </div>
                <button onClick={() => { setShowForm(false); setSubmitError(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
              </div>

              {submitError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20 }}>
                  <AlertCircle size={14} color="#f87171" />
                  <p style={{ fontSize: 13, color: '#f87171' }}>{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input id="mgr-name" label="Full Name *" placeholder="e.g. Priya Sharma" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Email *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><Mail size={13} /></span>
                      <input type="email" placeholder="manager@college.edu" className="input-glass" style={{ paddingLeft: 34 }}
                        {...register('email', { required: 'Email is required', pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Invalid email' } })} />
                    </div>
                    {errors.email && <p style={{ fontSize: 11, color: '#f87171', marginTop: 3 }}>{errors.email.message}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Phone *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><Phone size={13} /></span>
                      <input type="tel" placeholder="+91 98765 43210" className="input-glass" style={{ paddingLeft: 34 }}
                        {...register('phone', { required: 'Phone is required' })} />
                    </div>
                    {errors.phone && <p style={{ fontSize: 11, color: '#f87171', marginTop: 3 }}>{errors.phone?.message}</p>}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><Lock size={13} /></span>
                    <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" className="input-glass" style={{ paddingLeft: 34, paddingRight: 42 }}
                      {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })} />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}>
                      {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  {errors.password && <p style={{ fontSize: 11, color: '#f87171', marginTop: 3 }}>{errors.password.message}</p>}
                </div>

                <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                  <Button type="submit" isLoading={isSubmitting} style={{ flex: 1 }}>Create Manager Account</Button>
                  <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setSubmitError(null); }}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Managers', value: loading ? '—' : managers.length, color: '#818cf8' },
          { label: 'For Your College', value: loading ? '—' : managers.filter(m => m.college === orgCollege).length, color: '#34d399' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div style={{ padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Managers list */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, gap: 12, color: '#64748b' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading managers…
        </div>
      ) : managers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '72px 0' }}>
          <UserCog size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No event managers yet</p>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Create manager accounts so they can run hackathons for your college.</p>
          <Button leftIcon={<Plus size={14} />} onClick={() => setShowForm(true)}>Add First Manager</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {managers.map((mgr, i) => (
            <motion.div key={mgr.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15, fontWeight: 800, color: '#818cf8' }}>
                  {(mgr.name ?? mgr.email ?? 'M')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 3 }}>{mgr.name ?? 'Unnamed'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={11} color="#64748b" />
                    <span style={{ fontSize: 12, color: '#64748b' }}>{mgr.email ?? '—'}</span>
                  </div>
                </div>
                <div>
                  <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', color: '#818cf8' }}>
                    Manager
                  </span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 11, color: '#475569' }}>{mgr.created_at ? new Date(mgr.created_at).toLocaleDateString() : '—'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
