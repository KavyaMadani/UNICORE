'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { getHackathonById, updateHackathon, type Hackathon } from '@/lib/db';
import {
  ArrowLeft, Zap, Save, CheckCircle, Calendar, Info, Tag, Eye, Loader2,
  Upload, FileCode2, FileText, Globe, Film, Package, Presentation,
} from 'lucide-react';

interface EditForm {
  title: string; subtitle: string; description: string;
  college: string; organizer: string; tags: string; status: string;
  prize_pool: string; min_team_size: string; max_team_size: string;
  registration_deadline: string; start_date: string; end_date: string;
  rules: string; first_prize: string; second_prize: string; third_prize: string;
}

const SUBMISSION_TYPES = [
  { id: 'github',  label: 'GitHub Repo',    icon: <FileCode2 size={15} />,    desc: 'Public GitHub link' },
  { id: 'pdf',     label: 'PDF Document',   icon: <FileText size={15} />,     desc: 'PDF report / doc' },
  { id: 'ppt',     label: 'PPT / Slides',   icon: <Presentation size={15} />, desc: 'PowerPoint deck' },
  { id: 'website', label: 'Website URL',    icon: <Globe size={15} />,        desc: 'Live demo link' },
  { id: 'video',   label: 'Video Demo',     icon: <Film size={15} />,         desc: 'MP4 / video file' },
  { id: 'zip',     label: 'ZIP Archive',    icon: <Package size={15} />,      desc: 'Compressed code' },
];

export default function EditHackathonPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hack, setHack] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditForm>();

  useEffect(() => {
    getHackathonById(id as string).then(data => {
      setHack(data);
      if (data) {
        const prizes = Array.isArray(data.prizes) ? data.prizes : [];
        const rules = Array.isArray(data.rules) ? data.rules : [];
        setSelectedTypes(Array.isArray(data.submission_types) ? data.submission_types : []);
        reset({
          title: data.title ?? '', subtitle: data.subtitle ?? '',
          description: data.description ?? '', college: data.college ?? '',
          organizer: data.organizer ?? '', tags: (data.tags ?? []).join(', '),
          status: data.status ?? 'upcoming', prize_pool: data.prize_pool ?? '',
          min_team_size: String(data.min_team_size ?? 2), max_team_size: String(data.max_team_size ?? 4),
          registration_deadline: data.registration_deadline?.slice(0, 16) ?? '',
          start_date: data.start_date?.slice(0, 16) ?? '',
          end_date: data.end_date?.slice(0, 16) ?? '',
          rules: rules.join('\n'), first_prize: prizes[0]?.amount ?? '',
          second_prize: prizes[1]?.amount ?? '', third_prize: prizes[2]?.amount ?? '',
        });
      }
      setLoading(false);
    });
  }, [id, reset]);

  const toggleType = (tid: string) =>
    setSelectedTypes(prev => prev.includes(tid) ? prev.filter(t => t !== tid) : [...prev, tid]);

  const onSubmit = async (data: EditForm) => {
    setSaveError(null);
    const tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    const rules = data.rules.split('\n').map(r => r.trim()).filter(Boolean);
    const prizes = [
      { rank: '1st Place', amount: data.first_prize || '—', description: 'Winner prize' },
      { rank: '2nd Place', amount: data.second_prize || '—', description: 'Runner up' },
      { rank: '3rd Place', amount: data.third_prize || '—', description: '2nd runner up' },
    ];
    const { error } = await updateHackathon(id as string, {
      title: data.title, subtitle: data.subtitle, description: data.description,
      college: data.college, organizer: data.organizer, tags, rules, prizes,
      status: data.status as Hackathon['status'],
      prize_pool: data.prize_pool || data.first_prize || 'TBD',
      min_team_size: parseInt(data.min_team_size, 10),
      max_team_size: parseInt(data.max_team_size, 10),
      submission_types: selectedTypes,
      registration_deadline: data.registration_deadline ? new Date(data.registration_deadline).toISOString() : undefined,
      start_date: data.start_date ? new Date(data.start_date).toISOString() : undefined,
      end_date: data.end_date ? new Date(data.end_date).toISOString() : undefined,
    });
    if (error) { setSaveError(error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return (
    <DashboardLayout title="Loading…" subtitle="">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#64748b' }}>
        <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> Loading hackathon…
      </div>
    </DashboardLayout>
  );

  if (!hack) return (
    <DashboardLayout title="Not Found" subtitle="">
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Zap size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
        <p style={{ fontSize: 16, color: '#64748b', marginBottom: 24 }}>Hackathon not found or you don&apos;t have access.</p>
        <Button leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/manager/hackathons')}>Back</Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      title={`Edit: ${hack.title}`}
      subtitle="Changes are saved to the database and visible to all users"
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />} onClick={() => router.push(`/manager/hackathons/${hack.id}`)}>View</Button>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/manager/hackathons')}>Back</Button>
        </div>
      }
    >
      {/* Success toast */}
      {saved && (
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <CheckCircle size={15} /> Saved! Students will see the updated version.
        </motion.div>
      )}
      {saveError && (
        <div style={{ marginBottom: 20, padding: '12px 18px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13 }}>
          ⚠️ {saveError}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 860, margin: '0 auto' }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Basic Info */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Info size={18} color="#818cf8" /></div>
                <div><CardTitle>Basic Information</CardTitle><CardSubtitle>Title, description, and tags</CardSubtitle></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                  <Input id="e-title" label="Hackathon Title *" error={errors.title?.message} {...register('title', { required: 'Required' })} />
                  <Select id="e-status" label="Status" options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'active', label: 'Active' }, { value: 'ended', label: 'Ended' }, { value: 'draft', label: 'Draft' }]} {...register('status')} />
                </div>
                <Input id="e-subtitle" label="Tagline *" error={errors.subtitle?.message} {...register('subtitle', { required: 'Required' })} />
                <Textarea id="e-desc" label="Full Description *" rows={5} error={errors.description?.message} {...register('description', { required: 'Required' })} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Input id="e-college" label="Host College *" error={errors.college?.message} {...register('college', { required: 'Required' })} />
                  <Input id="e-organizer" label="Organizer Name" {...register('organizer')} />
                </div>
                <Input id="e-tags" label="Tags (comma-separated)" placeholder="AI, ML, Climate" {...register('tags')} />
              </div>
            </Card>

            {/* Schedule */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={18} color="#34d399" /></div>
                <div><CardTitle>Schedule</CardTitle><CardSubtitle>Key dates — students see these in the hackathon detail</CardSubtitle></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Input id="e-reg" label="Registration Deadline" type="datetime-local" {...register('registration_deadline')} />
                <Input id="e-start" label="Start Date & Time" type="datetime-local" {...register('start_date')} />
                <Input id="e-end" label="End Date & Time" type="datetime-local" {...register('end_date')} />
              </div>
            </Card>

            {/* Teams & Prizes */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(251,191,36,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={18} color="#fbbf24" /></div>
                <div><CardTitle>Teams &amp; Prizes</CardTitle><CardSubtitle>Team size and reward structure</CardSubtitle></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 16 }}>
                <Input id="e-min" label="Min Team" type="number" {...register('min_team_size')} />
                <Input id="e-max" label="Max Team" type="number" {...register('max_team_size')} />
                <Input id="e-p1" label="🥇 1st Prize" {...register('first_prize')} />
                <Input id="e-p2" label="🥈 2nd Prize" {...register('second_prize')} />
                <Input id="e-p3" label="🥉 3rd Prize" {...register('third_prize')} />
              </div>
            </Card>

            {/* Submission Types */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Upload size={18} color="#818cf8" /></div>
                <div><CardTitle>Accepted Submission Types</CardTitle><CardSubtitle>What participants must submit — shown during the event</CardSubtitle></div>
              </div>
              <p style={{ fontSize: 12, color: '#475569', marginBottom: 18 }}>Select all that apply. Students will only see these fields in their submission form.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {SUBMISSION_TYPES.map(type => {
                  const sel = selectedTypes.includes(type.id);
                  return (
                    <button key={type.id} type="button" onClick={() => toggleType(type.id)}
                      style={{ padding: '14px 16px', borderRadius: 14, border: `1.5px solid ${sel ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, background: sel ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ color: sel ? '#818cf8' : '#64748b', transition: 'color 0.15s' }}>{type.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: sel ? '#c7d2fe' : '#94a3b8' }}>{type.label}</span>
                        {sel && <CheckCircle size={12} color="#818cf8" style={{ marginLeft: 'auto' }} />}
                      </div>
                      <p style={{ fontSize: 11, color: '#475569' }}>{type.desc}</p>
                    </button>
                  );
                })}
              </div>
              {selectedTypes.length > 0 && (
                <div style={{ marginTop: 12, padding: '9px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p style={{ fontSize: 12, color: '#34d399' }}>✓ Selected: {selectedTypes.map(id => SUBMISSION_TYPES.find(t => t.id === id)?.label).filter(Boolean).join(', ')}</p>
                </div>
              )}
            </Card>

            {/* Rules */}
            <Card>
              <div style={{ marginBottom: 20 }}><CardTitle>Rules</CardTitle><CardSubtitle>One rule per line — displayed to students</CardSubtitle></div>
              <Textarea id="e-rules" label="Rules" rows={5} placeholder={'Rule 1\nRule 2\nRule 3'} {...register('rules')} />
            </Card>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 12, paddingBottom: 8 }}>
              <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={14} />} size="lg">Save Changes</Button>
              <Button variant="secondary" type="button" size="lg" onClick={() => router.push('/manager/hackathons')}>Discard</Button>
            </div>
          </div>
        </form>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
