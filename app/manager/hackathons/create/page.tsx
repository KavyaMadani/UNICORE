'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { ArrowLeft, ArrowRight, CheckCircle, Zap, Info, Users, Trophy, Clock } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Basic Info', icon: <Info size={14} /> },
  { id: 2, label: 'Team Rules', icon: <Users size={14} /> },
  { id: 3, label: 'Schedule', icon: <Clock size={14} /> },
  { id: 4, label: 'Prizes', icon: <Trophy size={14} /> },
  { id: 5, label: 'Review', icon: <CheckCircle size={14} /> },
];

interface HackathonFormData {
  title: string;
  subtitle: string;
  description: string;
  tags: string;
  minTeamSize: string;
  maxTeamSize: string;
  allowSolo: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
  prizeDescription: string;
}

export default function CreateHackathonPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<HackathonFormData>({
    defaultValues: {
      minTeamSize: '2',
      maxTeamSize: '4',
      allowSolo: 'no',
    }
  });

  const formValues = watch();

  const goNext = () => setStep(s => Math.min(s + 1, 5));
  const goPrev = () => setStep(s => Math.max(s - 1, 1));

  const onFinalSubmit = async () => {
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setTimeout(() => router.push('/manager/hackathons'), 2500);
  };

  if (submitted) {
    return (
      <DashboardLayout title="Create Hackathon">
        <div className="flex flex-col items-center justify-center py-24">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">Hackathon Created!</h2>
            <p className="text-slate-500 text-center mb-4">
              <span className="text-indigo-400 font-semibold">{formValues.title || 'Your Hackathon'}</span> has been created and saved as draft.
            </p>
            <p className="text-xs text-slate-600 text-center">Redirecting to your hackathons...</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Create Hackathon" subtitle="Step-by-step hackathon creation">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/manager/hackathons')} className="mb-6">
          Back to Hackathons
        </Button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`step-dot ${step === s.id ? 'active' : step > s.id ? 'completed' : 'inactive'}`}>
                  {step > s.id ? <CheckCircle size={14} /> : s.icon}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === s.id ? 'text-slate-200' : step > s.id ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px min-w-[20px]" style={{ background: step > s.id ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <Info size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle>Basic Information</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">Tell participants about your hackathon</p>
                    </div>
                  </div>
                  <Input id="hack-title" label="Hackathon Title *" placeholder="e.g. HackForge 2025" error={errors.title?.message}
                    {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } })} />
                  <Input id="hack-subtitle" label="Tagline" placeholder="Build the Future with AI"
                    {...register('subtitle')} />
                  <Textarea id="hack-desc" label="Description *" placeholder="Describe what your hackathon is about, its theme, and what participants will build..."
                    rows={5} error={errors.description?.message}
                    {...register('description', { required: 'Description is required', minLength: { value: 50, message: 'Please write a more detailed description (min 50 chars)' } })} />
                  <Input id="hack-tags" label="Tags (comma separated)" placeholder="AI, ML, Web3, Climate"
                    hint="Up to 6 tags help students discover your event"
                    {...register('tags')} />
                </div>
              )}

              {/* Step 2: Team Rules */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Users size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>Team Configuration</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">How teams will be formed</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select id="hack-min-team" label="Minimum Team Size"
                      options={[1,2,3,4].map(n => ({ value: String(n), label: `${n} member${n > 1 ? 's' : ''}` }))}
                      {...register('minTeamSize')} />
                    <Select id="hack-max-team" label="Maximum Team Size"
                      options={[2,3,4,5,6].map(n => ({ value: String(n), label: `${n} members` }))}
                      {...register('maxTeamSize')} />
                  </div>
                  <Select id="hack-solo" label="Allow Solo Participation"
                    options={[{ value: 'no', label: 'No — team required' }, { value: 'yes', label: 'Yes — allow solo' }]}
                    {...register('allowSolo')} />

                  <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <p className="text-xs font-semibold text-indigo-400 mb-2">Team Validation Rules (Auto-generated)</p>
                    <ul className="space-y-1.5">
                      {[
                        `Teams must have ${formValues.minTeamSize ?? 2}–${formValues.maxTeamSize ?? 4} members`,
                        'Each member must have a verified account',
                        'A student can only register once per hackathon',
                        formValues.allowSolo === 'yes' ? 'Solo participation is allowed' : 'Minimum team size applies strictly',
                      ].map((rule, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                          <CheckCircle size={11} className="text-emerald-400 flex-shrink-0" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <Clock size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle>Schedule & Timeline</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">Define important dates</p>
                    </div>
                  </div>
                  <Input id="hack-reg-deadline" label="Registration Deadline *" type="datetime-local" error={errors.registrationDeadline?.message}
                    {...register('registrationDeadline', { required: 'Required' })} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="hack-start" label="Hackathon Start *" type="datetime-local" error={errors.startDate?.message}
                      {...register('startDate', { required: 'Required' })} />
                    <Input id="hack-end" label="Hackathon End *" type="datetime-local" error={errors.endDate?.message}
                      {...register('endDate', { required: 'Required' })} />
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)' }}>
                    <p className="text-xs font-semibold text-cyan-400 mb-2">Auto-generated Components</p>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {['Countdown timer on hackathon page', 'Status badge (Upcoming → Active → Ended)', 'Email reminders at key milestones', 'Submission window enforcement'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle size={11} className="text-cyan-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 4: Prizes */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Trophy size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <CardTitle>Prizes & Rewards</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">Motivate participants with great prizes</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input id="hack-prize-1" label="🥇 1st Prize" placeholder="₹2,00,000" {...register('firstPrize')} />
                    <Input id="hack-prize-2" label="🥈 2nd Prize" placeholder="₹1,00,000" {...register('secondPrize')} />
                    <Input id="hack-prize-3" label="🥉 3rd Prize" placeholder="₹50,000" {...register('thirdPrize')} />
                  </div>
                  <Textarea id="hack-prize-desc" label="Additional Rewards" placeholder="Internship opportunities, mentorship sessions, exclusive SwagKit, etc."
                    rows={3} {...register('prizeDescription')} />
                </div>
              )}

              {/* Step 5: Review */}
              {step === 5 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle>Review & Publish</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">Confirm your hackathon details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Title', value: formValues.title || '—' },
                      { label: 'Tagline', value: formValues.subtitle || '—' },
                      { label: 'Tags', value: formValues.tags || '—' },
                      { label: 'Team Size', value: `${formValues.minTeamSize ?? 2}–${formValues.maxTeamSize ?? 4} members` },
                      { label: 'Solo Allowed', value: formValues.allowSolo === 'yes' ? 'Yes' : 'No' },
                      { label: 'Start Date', value: formValues.startDate ?? '—' },
                      { label: 'End Date', value: formValues.endDate ?? '—' },
                      { label: '1st Prize', value: formValues.firstPrize || '—' },
                      { label: '2nd Prize', value: formValues.secondPrize || '—' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-xs text-slate-500">{row.label}</span>
                        <span className="text-sm font-medium text-slate-300 max-w-[60%] text-right truncate">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <p className="text-xs text-slate-400">
                      The hackathon will be saved as <strong className="text-slate-300">Draft</strong>. You can publish it from the Manage Hackathons page when ready.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={goPrev} disabled={step === 1}>
                  Previous
                </Button>
                {step < 5 ? (
                  <Button size="sm" onClick={goNext} rightIcon={<ArrowRight size={14} />}>
                    Continue
                  </Button>
                ) : (
                  <Button size="sm" onClick={onFinalSubmit} isLoading={isSubmitting}>
                    <Zap size={14} /> Create Hackathon
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
