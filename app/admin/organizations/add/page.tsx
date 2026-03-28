'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, School, User, Mail, Lock, Phone, AlertCircle, Loader2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface College { id: string; name: string; city?: string; state?: string; }
interface OrganizerForm { name: string; email: string; password: string; phone: string; college_id: string; }

export default function AddOrganizerPage() {
  const router = useRouter();
  const [success, setSuccess] = useState<{ name: string; email: string; password: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState<'email' | 'pass' | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<OrganizerForm>();
  const selectedCollegeId = watch('college_id');
  const selectedCollege = colleges.find(c => c.id === selectedCollegeId);

  useEffect(() => {
    supabase.from('colleges').select('id, name, city, state').order('name').then(({ data }) => {
      setColleges((data ?? []) as College[]);
      setLoadingColleges(false);
    });
  }, []);

  const copyToClipboard = (text: string, type: 'email' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const onSubmit = async (data: OrganizerForm) => {
    setSubmitError(null);
    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'organization',
        college: selectedCollege?.name ?? '',
        college_id: data.college_id || null,
        created_by_role: 'admin',
      }),
    });
    const json = await res.json();
    if (!res.ok) { setSubmitError(json.error ?? 'Failed to create organizer'); return; }
    setSuccess({ name: data.name, email: data.email, password: data.password });
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <DashboardLayout title="Add Organizer" subtitle="">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: 480, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={36} color="#34d399" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Organizer Created!</h2>
              <p style={{ fontSize: 14, color: '#64748b' }}>Share these credentials with <strong style={{ color: '#94a3b8' }}>{success.name}</strong></p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '24px 28px', marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Login Credentials</p>
              {[
                { label: 'Email', value: success.email, type: 'email' as const },
                { label: 'Password', value: success.password, type: 'pass' as const },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>{row.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>{row.value}</p>
                  </div>
                  <button onClick={() => copyToClipboard(row.value, row.type)} style={{ padding: '7px 10px', borderRadius: 8, background: copied === row.type ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied === row.type ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', color: copied === row.type ? '#34d399' : '#64748b', transition: 'all 0.15s' }}>
                    {copied === row.type ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: '#fde68a' }}>⚠ Save these credentials now. The password cannot be retrieved later.</p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button onClick={() => router.push('/admin/organizations')} size="lg" style={{ flex: 1 }}>Back to Organizers</Button>
              <Button variant="secondary" onClick={() => { setSuccess(null); }} size="lg">Add Another</Button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  /* ── Form ── */
  return (
    <DashboardLayout
      title="Add Organizer"
      subtitle="Create login credentials for a new college organizer"
      actions={<Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/admin/organizations')}>Back</Button>}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 680, margin: '0 auto' }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {submitError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={16} color="#f87171" />
              <p style={{ fontSize: 13, color: '#f87171' }}>{submitError}</p>
            </div>
          )}

          {/* College picker */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <School size={20} color="#60a5fa" />
              </div>
              <div><CardTitle>Select College *</CardTitle><CardSubtitle>Which institution is this organizer from?</CardSubtitle></div>
            </div>

            {loadingColleges ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13 }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading colleges…
              </div>
            ) : colleges.length === 0 ? (
              <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <p style={{ fontSize: 13, color: '#fde68a' }}>⚠ No colleges yet. <a href="/admin/colleges/add" style={{ color: '#fbbf24', textDecoration: 'underline' }}>Add a college first</a>.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
                  {colleges.map(c => {
                    const sel = selectedCollegeId === c.id;
                    return (
                      <label key={c.id} htmlFor={`col-${c.id}`} style={{ cursor: 'pointer' }}>
                        <input type="radio" id={`col-${c.id}`} value={c.id} style={{ display: 'none' }} {...register('college_id', { required: 'Please select a college' })} />
                        <div style={{ padding: '12px 14px', borderRadius: 13, border: `1.5px solid ${sel ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.07)'}`, background: sel ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', transition: 'all 0.15s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sel ? '#818cf8' : '#334155', flexShrink: 0 }} />
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: sel ? '#c7d2fe' : '#cbd5e1' }}>{c.name}</p>
                              {c.city && <p style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{c.city}{c.state ? `, ${c.state}` : ''}</p>}
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.college_id && <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{errors.college_id.message}</p>}
              </>
            )}
          </Card>

          {/* Organizer details */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={20} color="#818cf8" />
              </div>
              <div><CardTitle>Organizer Details</CardTitle><CardSubtitle>These credentials will be given to the organizer to log in</CardSubtitle></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Input id="name" label="Full Name *" placeholder="e.g. Dr. Ravi Kumar" error={errors.name?.message} {...register('name', { required: 'Full name is required' })} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Email */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><Mail size={14} /></span>
                    <input id="email" type="email" placeholder="organizer@college.edu" className="input-glass" style={{ paddingLeft: 38 }}
                      {...register('email', { required: 'Email is required', pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Invalid email' } })} />
                  </div>
                  {errors.email && <p style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><Phone size={14} /></span>
                    <input id="phone" type="tel" placeholder="+91 98765 43210" className="input-glass" style={{ paddingLeft: 38 }}
                      {...register('phone', { required: 'Phone number is required' })} />
                  </div>
                  {errors.phone && <p style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>{errors.phone?.message}</p>}
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Login Password *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}><Lock size={14} /></span>
                  <input id="password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" className="input-glass" style={{ paddingLeft: 38, paddingRight: 44 }}
                    {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })} />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>{errors.password.message}</p>}
                <p style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>This password will be given to the organizer. They can change it after first login.</p>
              </div>
            </div>
          </Card>

          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p style={{ fontSize: 13, color: '#a5b4fc' }}>
              ✓ The organizer account will be <strong>created immediately</strong> and can log in right away. They will have access to create Event Manager accounts for their college.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" isLoading={isSubmitting} size="lg">Create Organizer Account</Button>
            <Button type="button" variant="secondary" size="lg" onClick={() => router.push('/admin/organizations')}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}
