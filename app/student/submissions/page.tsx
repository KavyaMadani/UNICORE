'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { MOCK_SUBMISSIONS, MOCK_HACKATHONS } from '@/lib/mock-data';
import { FileText, Send, ExternalLink, CheckCircle, Plus, Link2, Eye, X, Star, Code } from 'lucide-react';

interface SubmissionForm {
  projectTitle: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
}

export default function StudentSubmissionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS.slice(0, 1));
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SubmissionForm>();

  const onSubmit = async (data: SubmissionForm) => {
    await new Promise(r => setTimeout(r, 1000));
    const newSub = {
      id: `sub_new_${Date.now()}`,
      hackathonId: 'hack_002',
      hackathonTitle: 'CodeStorm 2025',
      teamName: 'NeuralNinjas',
      projectTitle: data.projectTitle,
      description: data.description,
      githubUrl: data.githubUrl,
      demoUrl: data.demoUrl,
      status: 'submitted' as const,
      submittedAt: new Date().toISOString(),
    };
    setSubmissions(prev => [newSub, ...prev]);
    setSubmitted(true);
    setShowForm(false);
    reset();
  };

  const stats = [
    { label: 'Total Submitted', value: submissions.length, icon: <FileText size={20} color="#818cf8" />, change: 'All time', dir: 'neutral' as const },
    { label: 'Under Review', value: submissions.filter(s => s.status === 'submitted').length, icon: <Eye size={20} color="#60a5fa" />, change: 'Awaiting judge', dir: 'neutral' as const },
    { label: 'Reviewed', value: submissions.filter(s => s.status === 'reviewed').length, icon: <CheckCircle size={20} color="#34d399" />, change: 'Completed', dir: 'up' as const },
    { label: 'Avg Score', value: submissions.some(s => s.score !== undefined) ? `${Math.round(submissions.filter(s => s.score !== undefined).reduce((a, s) => a + (s.score ?? 0), 0) / submissions.filter(s => s.score !== undefined).length)}/100` : '—', icon: <Star size={20} color="#fbbf24" />, change: 'Best score', dir: 'neutral' as const },
  ];

  return (
    <DashboardLayout
      title="My Submissions"
      subtitle="Projects you have submitted to hackathons"
      actions={
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowForm(!showForm)}>
          New Submission
        </Button>
      }
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 44 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} change={s.change} changeDirection={s.dir} />
          </motion.div>
        ))}
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginBottom: 24, padding: '16px 20px', borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <CheckCircle size={20} color="#34d399" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#34d399', marginBottom: 2 }}>Submission received! 🎉</p>
              <p style={{ fontSize: 12, color: '#64748b' }}>The judges will review your project and provide feedback soon.</p>
            </div>
            <button onClick={() => setSubmitted(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Submission Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ marginBottom: 36 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                  <CardTitle>Submit Your Project</CardTitle>
                  <CardSubtitle>Fill in the details about your hackathon project</CardSubtitle>
                </div>
                <button onClick={() => { setShowForm(false); reset(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 8, borderRadius: 8 }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
                <Input id="sub-title" label="Project Title *"
                  placeholder="e.g. ClimateWatch – Real-time Climate Dashboard"
                  error={errors.projectTitle?.message}
                  {...register('projectTitle', { required: 'Project title is required' })} />
                <Textarea id="sub-desc" label="Project Description *" rows={5}
                  placeholder="Describe what you built, the problem it solves, the tech stack used, and any challenges overcome..."
                  error={errors.description?.message}
                  {...register('description', { required: 'Description is required', minLength: { value: 30, message: 'Min 30 characters' } })} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Input id="sub-github" label="GitHub Repository *"
                    placeholder="https://github.com/yourteam/project"
                    leftIcon={<Link2 size={14} />}
                    error={errors.githubUrl?.message}
                    {...register('githubUrl', { required: 'GitHub URL is required', pattern: { value: /^https?:\/\/.+/, message: 'Must be a valid URL' } })} />
                  <Input id="sub-demo" label="Live Demo URL (optional)"
                    placeholder="https://yourproject.vercel.app"
                    leftIcon={<Eye size={14} />}
                    {...register('demoUrl')} />
                </div>
                <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                  <Button type="submit" isLoading={isSubmitting} leftIcon={<Send size={14} />}>Submit Project</Button>
                  <Button variant="secondary" type="button" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submission cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {submissions.map((sub, i) => (
          <motion.div key={sub.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div style={{
              padding: '36px 40px', borderRadius: 24,
              background: sub.status === 'reviewed' ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.025)',
              border: sub.status === 'reviewed' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.07)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.1))',
                    border: '1px solid rgba(99,102,241,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Code size={22} color="#818cf8" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.2 }}>{sub.projectTitle}</h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                      {sub.hackathonTitle} · Team: <span style={{ color: '#818cf8', fontWeight: 600 }}>{sub.teamName}</span>
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {sub.score !== undefined && (
                    <div style={{
                      textAlign: 'center', padding: '10px 18px', borderRadius: 14,
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#34d399', lineHeight: 1 }}>{sub.score}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>/ 100</div>
                    </div>
                  )}
                  <Badge variant={sub.status === 'reviewed' ? 'active' : sub.status === 'submitted' ? 'upcoming' : 'draft'}>
                    {sub.status}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.9, marginBottom: sub.feedback ? 24 : 32 }}>
                {sub.description}
              </p>

              {/* Judge Feedback */}
              {sub.feedback && (
                <div style={{
                  padding: '14px 18px', borderRadius: 12, marginBottom: 20,
                  background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Judge Feedback</p>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{sub.feedback}</p>
                </div>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#475569' }}>
                  Submitted: {new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10,
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)',
                    color: '#818cf8', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                  }}>
                    <Link2 size={12} /> View Code <ExternalLink size={10} />
                  </button>
                </a>
                {sub.demoUrl && (
                  <a href={sub.demoUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10,
                      background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)',
                      color: '#60a5fa', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    }}>
                      <Eye size={12} /> Live Demo <ExternalLink size={10} />
                    </button>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {submissions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
            <FileText size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#475569', marginBottom: 8 }}>No submissions yet</h3>
            <p style={{ fontSize: 14, color: '#334155', marginBottom: 24 }}>Register for a hackathon and submit your project to see it here.</p>
            <Button onClick={() => setShowForm(true)}>+ New Submission</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
