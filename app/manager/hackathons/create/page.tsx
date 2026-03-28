'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { createHackathon } from '@/lib/db';
import {
  ArrowLeft, ArrowRight, CheckCircle, Zap, Users, Calendar, Trophy,
  FileText, Shield, Upload, CreditCard, Plus, X, FileCode2,
  File, Presentation, Globe, AlertCircle
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Basic Info',       icon: <FileText size={13} /> },
  { id: 2, label: 'Team Rules',       icon: <Users size={13} /> },
  { id: 3, label: 'Schedule',         icon: <Calendar size={13} /> },
  { id: 4, label: 'Prizes',           icon: <Trophy size={13} /> },
  { id: 5, label: 'Submissions',      icon: <Upload size={13} /> },
  { id: 6, label: 'Rules',            icon: <Shield size={13} /> },
  { id: 7, label: 'Reg. Form',        icon: <File size={13} /> },
  { id: 8, label: 'Payment',          icon: <CreditCard size={13} /> },
  { id: 9, label: 'Review & Publish', icon: <Zap size={13} /> },
];

const SUBMISSION_TYPES = [
  { id: 'github',  label: 'GitHub Repository', icon: <FileCode2 size={16} />,   desc: 'Link to GitHub repo' },
  { id: 'pdf',     label: 'PDF Document',       icon: <FileText size={16} />,    desc: 'Upload a PDF file' },
  { id: 'ppt',     label: 'PPT / Slides',       icon: <Presentation size={16} />,desc: 'PowerPoint presentation' },
  { id: 'website', label: 'Website / Demo URL', icon: <Globe size={16} />,       desc: 'Live project URL' },
  { id: 'video',   label: 'Video Demo',          icon: <Upload size={16} />,      desc: 'Demo video link' },
  { id: 'zip',     label: 'ZIP Archive',         icon: <File size={16} />,        desc: 'Compressed project files' },
];

export default function CreateHackathonPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 5 — Submission types
  const [selectedSubmissionTypes, setSelectedSubmissionTypes] = useState<string[]>([]);

  // Step 6 — Rules
  const [rules, setRules] = useState<string[]>([]);
  const [ruleInput, setRuleInput] = useState('');

  // Step 7 — Custom form
  const [hasCustomForm, setHasCustomForm] = useState<boolean | null>(null);
  const [customFormUrl, setCustomFormUrl] = useState('');

  // Step 8 — Payment
  const [hasFees, setHasFees] = useState<boolean | null>(null);
  const [feesAmount, setFeesAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, getValues, trigger, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { title: '', subtitle: '', description: '', college: '', tags: '', minTeamSize: '2', maxTeamSize: '4', allowSolo: 'yes', registrationDeadline: '', startDate: '', endDate: '', firstPrize: '', secondPrize: '', thirdPrize: '', prizeDescription: '' }
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setManagerId(session?.user?.id ?? null);
    });
  }, []);

  const toggleSubmissionType = (id: string) => {
    setSelectedSubmissionTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const addRule = () => {
    const r = ruleInput.trim();
    if (r) { setRules(prev => [...prev, r]); setRuleInput(''); }
  };

  const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const goNext = async () => {
    if (step === 1) {
      const ok = await trigger(['title', 'subtitle', 'description', 'college']);
      if (!ok) return;
    }
    if (step === 2) { const ok = await trigger(['minTeamSize', 'maxTeamSize']); if (!ok) return; }
    if (step === 3) { const ok = await trigger(['registrationDeadline', 'startDate', 'endDate']); if (!ok) return; }
    if (step === 5 && selectedSubmissionTypes.length === 0) {
      setSubmitError('Please select at least one submission type.');
      return;
    }
    setSubmitError(null);
    setStep(s => s + 1);
  };

  const goPrev = () => { setSubmitError(null); setStep(s => s - 1); };

  const onFinalSubmit = async () => {
    setSubmitError(null);
    if (!managerId) { setSubmitError('Not authenticated. Please sign in again.'); return; }

    let paymentQrUrl: string | null = null;
    if (hasFees && qrFile) {
      setUploadingQr(true);
      const ext = qrFile.name.split('.').pop();
      const path = `qr/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('hackathon-assets').upload(path, qrFile, { upsert: true });
      setUploadingQr(false);
      if (upErr) {
        // Non-fatal: continue without QR
        console.error('QR upload failed:', upErr.message);
      } else {
        const { data: urlData } = supabase.storage.from('hackathon-assets').getPublicUrl(path);
        paymentQrUrl = urlData.publicUrl;
      }
    }

    const formValues = getValues();
    const tags = formValues.tags?.split(',').map((t: string) => t.trim()).filter(Boolean) ?? [];
    const prizes = [
      { rank: '1st Place', amount: formValues.firstPrize || '—', description: formValues.prizeDescription || 'Winner prize' },
      { rank: '2nd Place', amount: formValues.secondPrize || '—', description: 'Runner up' },
      { rank: '3rd Place', amount: formValues.thirdPrize || '—', description: '2nd runner up' },
    ];

    const { error } = await createHackathon({
      title: formValues.title,
      subtitle: formValues.subtitle,
      description: formValues.description,
      college: formValues.college,
      status: 'upcoming',
      prize_pool: formValues.firstPrize || 'TBD',
      min_team_size: parseInt(formValues.minTeamSize) || 2,
      max_team_size: parseInt(formValues.maxTeamSize) || 4,
      allow_solo: formValues.allowSolo === 'yes',
      tags,
      prizes,
      rules,
      start_date: formValues.startDate ? new Date(formValues.startDate).toISOString() : undefined,
      end_date: formValues.endDate ? new Date(formValues.endDate).toISOString() : undefined,
      registration_deadline: formValues.registrationDeadline ? new Date(formValues.registrationDeadline).toISOString() : undefined,
      timeline: [
        { label: 'Registration Opens', date: new Date().toLocaleDateString(), done: true },
        { label: 'Registration Closes', date: formValues.registrationDeadline || 'TBD', done: false },
        { label: 'Hackathon Starts', date: formValues.startDate || 'TBD', done: false },
        { label: 'Hackathon Ends', date: formValues.endDate || 'TBD', done: false },
      ],
      submission_types: selectedSubmissionTypes,
      has_custom_form: hasCustomForm === true,
      custom_form_url: hasCustomForm ? customFormUrl || null : null,
      has_fees: hasFees === true,
      fees_amount: hasFees ? feesAmount || null : null,
      upi_id: hasFees ? upiId || null : null,
      payment_qr_url: paymentQrUrl,
      is_featured: false,
      manager_id: managerId,
    });

    if (error) { setSubmitError(error); return; }
    setSubmitted(true);
    setTimeout(() => router.push('/manager/hackathons'), 2500);
  };

  if (submitted) {
    return (
      <DashboardLayout title="Hackathon Created!">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
            style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={40} color="#34d399" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Hackathon Published!</h2>
            <p style={{ fontSize: 15, color: '#64748b' }}>Your hackathon is now live and visible to students.<br />Redirecting…</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const stepStyle = (s: number): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
    fontSize: 12, fontWeight: 600, transition: 'all 0.2s ease',
    background: step === s ? 'rgba(99,102,241,0.18)' : step > s ? 'rgba(16,185,129,0.1)' : 'transparent',
    color: step === s ? '#a5b4fc' : step > s ? '#34d399' : '#475569',
    border: step === s ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
  });

  const formValues = watch();

  return (
    <DashboardLayout title="Create Hackathon" subtitle="Publish a new event — students will see it immediately"
      actions={<Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/manager/hackathons')}>Back</Button>}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        {STEPS.map(s => (
          <div key={s.id} style={stepStyle(s.id)}>
            {step > s.id ? <CheckCircle size={11} /> : s.icon}
            {s.label}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
          <Card style={{ maxWidth: 740 }}>

            {/* ── Step 1: Basic Info ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardTitle>Basic Information</CardTitle>
                <Input id="h-title" label="Hackathon Title *" placeholder="e.g. CodeStorm 2025" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
                <Input id="h-subtitle" label="Tagline / Subtitle *" placeholder="e.g. Build the Future with AI" error={errors.subtitle?.message} {...register('subtitle', { required: 'Tagline is required' })} />
                <Input id="h-college" label="Host College *" placeholder="e.g. IIT Bombay" error={errors.college?.message} {...register('college', { required: 'College is required' })} />
                <div>
                  <label htmlFor="h-desc" style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Full Description *</label>
                  <textarea id="h-desc" rows={5} placeholder="Describe the hackathon, themes, and what participants can expect..." className="input-glass" style={{ resize: 'vertical', width: '100%' }} {...register('description', { required: 'Description is required' })} />
                  {errors.description && <p style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>{errors.description.message}</p>}
                </div>
                <Input id="h-tags" label="Tags (comma-separated)" placeholder="AI, ML, Climate, Web3, HealthTech" {...register('tags')} />
              </div>
            )}

            {/* ── Step 2: Team Rules ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardTitle>Team Rules</CardTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Input id="h-min" label="Minimum Team Size *" type="number" min="1" error={errors.minTeamSize?.message} {...register('minTeamSize', { required: true, min: 1 })} />
                  <Input id="h-max" label="Maximum Team Size *" type="number" min="1" error={errors.maxTeamSize?.message} {...register('maxTeamSize', { required: true, min: 1 })} />
                </div>
                <div>
                  <label htmlFor="h-solo" style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Allow Solo Participants?</label>
                  <select id="h-solo" className="input-glass" style={{ width: '100%' }} {...register('allowSolo')}>
                    <option value="yes">Yes — Solo allowed</option>
                    <option value="no">No — Teams only</option>
                  </select>
                </div>
              </div>
            )}

            {/* ── Step 3: Schedule ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardTitle>Schedule</CardTitle>
                <Input id="h-reg" label="Registration Deadline *" type="datetime-local" error={errors.registrationDeadline?.message} {...register('registrationDeadline', { required: 'Required' })} />
                <Input id="h-start" label="Start Date & Time *" type="datetime-local" error={errors.startDate?.message} {...register('startDate', { required: 'Required' })} />
                <Input id="h-end" label="End Date & Time *" type="datetime-local" error={errors.endDate?.message} {...register('endDate', { required: 'Required' })} />
              </div>
            )}

            {/* ── Step 4: Prizes ── */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardTitle>Prize Pool</CardTitle>
                <Input id="h-p1" label="🥇 1st Place Prize" placeholder="e.g. ₹2,00,000" {...register('firstPrize')} />
                <Input id="h-p2" label="🥈 2nd Place Prize" placeholder="e.g. ₹1,00,000" {...register('secondPrize')} />
                <Input id="h-p3" label="🥉 3rd Place Prize" placeholder="e.g. ₹50,000" {...register('thirdPrize')} />
                <div>
                  <label htmlFor="h-pdesc" style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Prize Description (optional)</label>
                  <textarea id="h-pdesc" rows={3} placeholder="e.g. Top teams also get internship opportunities…" className="input-glass" style={{ resize: 'vertical', width: '100%' }} {...register('prizeDescription')} />
                </div>
              </div>
            )}

            {/* ── Step 5: Submission Types ── */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardTitle>Accepted Submission Types</CardTitle>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: -8 }}>Select what participants can submit. These options will be shown to students during submission.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {SUBMISSION_TYPES.map(type => {
                    const selected = selectedSubmissionTypes.includes(type.id);
                    return (
                      <button key={type.id} type="button" onClick={() => toggleSubmissionType(type.id)}
                        style={{ padding: '16px 18px', borderRadius: 14, border: `1.5px solid ${selected ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, background: selected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ color: selected ? '#818cf8' : '#64748b', transition: 'color 0.15s' }}>{type.icon}</div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: selected ? '#c7d2fe' : '#cbd5e1' }}>{type.label}</p>
                            <p style={{ fontSize: 11, color: '#64748b' }}>{type.desc}</p>
                          </div>
                          {selected && <CheckCircle size={14} color="#818cf8" style={{ marginLeft: 'auto' }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedSubmissionTypes.length > 0 && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <p style={{ fontSize: 12, color: '#34d399' }}>✓ Selected: {selectedSubmissionTypes.map(id => SUBMISSION_TYPES.find(t => t.id === id)?.label).join(', ')}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 6: Rules ── */}
            {step === 6 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardTitle>Hackathon Rules</CardTitle>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: -8 }}>Add rules that participants must follow. These will appear on the hackathon detail page.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={ruleInput}
                    onChange={e => setRuleInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRule(); } }}
                    placeholder="e.g. Teams must use at least one open-source library"
                    className="input-glass"
                    style={{ flex: 1 }}
                  />
                  <Button type="button" onClick={addRule} leftIcon={<Plus size={14} />}>Add</Button>
                </div>
                {rules.length === 0 ? (
                  <div style={{ padding: '24px', borderRadius: 14, border: '1px dashed rgba(255,255,255,0.08)', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#475569' }}>No rules added yet. You can add them or skip this step.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {rules.map((rule, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#818cf8', flexShrink: 0 }}>{i + 1}</span>
                        <p style={{ fontSize: 13, color: '#cbd5e1', flex: 1 }}>{rule}</p>
                        <button onClick={() => setRules(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}><X size={14} /></button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 7: Registration Form ── */}
            {step === 7 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardTitle>Custom Registration Form</CardTitle>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: -8 }}>Do participants need to fill a custom form before registering?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[{ val: false, label: 'No — Standard registration only', emoji: '✅' }, { val: true, label: 'Yes — Require custom form', emoji: '📝' }].map(opt => (
                    <button key={String(opt.val)} type="button" onClick={() => setHasCustomForm(opt.val)}
                      style={{ padding: '20px', borderRadius: 14, border: `1.5px solid ${hasCustomForm === opt.val ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, background: hasCustomForm === opt.val ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                      <p style={{ fontSize: 22, marginBottom: 8 }}>{opt.emoji}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: hasCustomForm === opt.val ? '#c7d2fe' : '#94a3b8' }}>{opt.label}</p>
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {hasCustomForm === true && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <Input id="form-url" label="Google Form / Form URL" placeholder="https://forms.google.com/..." value={customFormUrl} onChange={e => setCustomFormUrl(e.target.value)} />
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>Students will be redirected to this form before completing registration.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {hasCustomForm === null && (
                  <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    <p style={{ fontSize: 13, color: '#fde68a' }}>Please select an option above, or click Next to skip.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 8: Payment / Fees ── */}
            {step === 8 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardTitle>Registration Fees</CardTitle>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: -8 }}>Is there a registration fee for this hackathon?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[{ val: false, label: 'No — Free to participate', emoji: '🎉' }, { val: true, label: 'Yes — Paid registration', emoji: '💳' }].map(opt => (
                    <button key={String(opt.val)} type="button" onClick={() => setHasFees(opt.val)}
                      style={{ padding: '20px', borderRadius: 14, border: `1.5px solid ${hasFees === opt.val ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, background: hasFees === opt.val ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                      <p style={{ fontSize: 22, marginBottom: 8 }}>{opt.emoji}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: hasFees === opt.val ? '#c7d2fe' : '#94a3b8' }}>{opt.label}</p>
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {hasFees === true && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <Input id="fees-amt" label="Registration Fee Amount *" placeholder="e.g. ₹150 per team" value={feesAmount} onChange={e => setFeesAmount(e.target.value)} />
                      <Input id="upi-id" label="UPI ID *" placeholder="e.g. college@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>QR Code Image (optional)</label>
                        <input ref={qrInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleQrChange} />
                        {qrPreview ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <img src={qrPreview} alt="QR" style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'white', padding: 8 }} />
                            <div>
                              <p style={{ fontSize: 13, color: '#34d399', marginBottom: 8 }}>✓ QR code selected</p>
                              <Button type="button" variant="secondary" size="sm" onClick={() => { setQrFile(null); setQrPreview(null); }}>Remove</Button>
                            </div>
                          </div>
                        ) : (
                          <button type="button" onClick={() => qrInputRef.current?.click()}
                            style={{ width: '100%', padding: '28px', borderRadius: 14, border: '2px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', color: '#64748b', transition: 'all 0.2s' }}>
                            <Upload size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                            <p style={{ fontSize: 13 }}>Click to upload QR code image</p>
                            <p style={{ fontSize: 11, marginTop: 4 }}>PNG, JPG accepted</p>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {hasFees === null && (
                  <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    <p style={{ fontSize: 13, color: '#fde68a' }}>Please select if registration is free or paid.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 9: Review & Publish ── */}
            {step === 9 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <CardTitle>Review & Publish</CardTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {[
                    { label: 'Title', value: formValues.title },
                    { label: 'College', value: formValues.college },
                    { label: 'Tagline', value: formValues.subtitle },
                    { label: 'Tags', value: formValues.tags },
                    { label: 'Team Size', value: `${formValues.minTeamSize}–${formValues.maxTeamSize} (Solo: ${formValues.allowSolo === 'yes' ? 'Allowed' : 'No'})` },
                    { label: 'Reg. Deadline', value: formValues.registrationDeadline },
                    { label: 'Start Date', value: formValues.startDate },
                    { label: 'End Date', value: formValues.endDate },
                    { label: '1st Prize', value: formValues.firstPrize || '—' },
                    { label: 'Submission Types', value: selectedSubmissionTypes.join(', ') || 'None selected' },
                    { label: 'Rules', value: rules.length > 0 ? `${rules.length} rule(s) added` : 'No rules' },
                    { label: 'Custom Form', value: hasCustomForm ? (customFormUrl || 'Required (no URL given)') : 'No' },
                    { label: 'Fees', value: hasFees ? `${feesAmount} — UPI: ${upiId}` : 'Free' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', gap: 16, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: 12, color: '#64748b', minWidth: 140 }}>{row.label}</span>
                      <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500, flex: 1 }}>{row.value || '—'}</span>
                    </div>
                  ))}
                </div>
                {submitError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={16} color="#f87171" />
                    <p style={{ fontSize: 13, color: '#f87171' }}>{submitError}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <Button variant="secondary" onClick={goPrev} disabled={step === 1} leftIcon={<ArrowLeft size={14} />}>Back</Button>
              {submitError && step < 9 && (
                <p style={{ fontSize: 12, color: '#f87171' }}>{submitError}</p>
              )}
              {step < 9
                ? <Button onClick={goNext} rightIcon={<ArrowRight size={14} />}>
                    {(step === 7 && hasCustomForm === null) || (step === 8 && hasFees === null) ? 'Skip' : 'Next'}
                  </Button>
                : <Button onClick={onFinalSubmit} isLoading={isSubmitting || uploadingQr} leftIcon={<Zap size={14} />}>Publish Hackathon</Button>
              }
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
