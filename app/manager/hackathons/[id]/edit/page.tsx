'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { MOCK_HACKATHONS } from '@/lib/mock-data';
import {
  ArrowLeft, Zap, Save, CheckCircle, Users, Trophy, Calendar,
  Info, Tag, FileText, Eye,
} from 'lucide-react';

interface EditForm {
  title: string;
  subtitle: string;
  description: string;
  college: string;
  organizer: string;
  tags: string;
  status: string;
  prizePool: string;
  minTeamSize: string;
  maxTeamSize: string;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  rules: string;
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
}

export default function EditHackathonPage() {
  const { id } = useParams();
  const router = useRouter();
  const hack = MOCK_HACKATHONS.find(h => h.id === id);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EditForm>({
    defaultValues: hack ? {
      title: hack.title,
      subtitle: hack.subtitle,
      description: hack.description,
      college: hack.college,
      organizer: hack.organizer,
      tags: hack.tags.join(', '),
      status: hack.status,
      prizePool: hack.prizePool,
      minTeamSize: String(hack.minTeamSize),
      maxTeamSize: String(hack.maxTeamSize),
      registrationDeadline: hack.registrationDeadline.slice(0, 16),
      startDate: hack.startDate.slice(0, 16),
      endDate: hack.endDate.slice(0, 16),
      rules: hack.rules.join('\n'),
      firstPrize: hack.prizes[0]?.amount ?? '',
      secondPrize: hack.prizes[1]?.amount ?? '',
      thirdPrize: hack.prizes[2]?.amount ?? '',
    } : {}
  });

  if (!hack) {
    return (
      <DashboardLayout title="Hackathon Not Found" subtitle="">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Zap size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 24 }}>Hackathon not found.</p>
          <Button leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/manager/hackathons')}>Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const onSubmit = async (data: EditForm) => {
    await new Promise(r => setTimeout(r, 900));
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <DashboardLayout
      title={`Edit: ${hack.title}`}
      subtitle="Update hackathon details and settings"
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />} onClick={() => router.push(`/manager/hackathons/${hack.id}`)}>
            View
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/manager/hackathons')}>
            Back
          </Button>
        </div>
      }
    >
      {/* Success toast */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', top: 20, right: 20, zIndex: 999,
            padding: '12px 20px', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
            color: '#34d399', fontSize: 13, fontWeight: 600,
            backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <CheckCircle size={15} /> Changes saved successfully!
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 860, margin: '0 auto' }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Basic Info */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Info size={18} color="#818cf8" />
                </div>
                <div>
                  <CardTitle>Basic Information</CardTitle>
                  <CardSubtitle>Main details about the hackathon</CardSubtitle>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                  <Input id="edit-title" label="Hackathon Title *"
                    error={errors.title?.message}
                    {...register('title', { required: 'Title is required' })} />
                  <Select id="edit-status" label="Status"
                    options={[
                      { value: 'upcoming', label: 'Upcoming' },
                      { value: 'active', label: 'Active' },
                      { value: 'ended', label: 'Ended' },
                      { value: 'draft', label: 'Draft' },
                    ]}
                    {...register('status')} />
                </div>
                <Input id="edit-subtitle" label="Tagline / Subtitle *"
                  error={errors.subtitle?.message}
                  {...register('subtitle', { required: 'Subtitle is required' })} />
                <Textarea id="edit-desc" label="Full Description *" rows={5}
                  error={errors.description?.message}
                  {...register('description', { required: 'Description is required' })} />
              </div>
            </Card>

            {/* College & Organizer */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Info size={18} color="#60a5fa" />
                </div>
                <div>
                  <CardTitle>College & Organizer</CardTitle>
                  <CardSubtitle>Host institution details</CardSubtitle>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input id="edit-college" label="Host College *"
                  error={errors.college?.message}
                  {...register('college', { required: 'College is required' })} />
                <Input id="edit-organizer" label="Organizer Name *"
                  error={errors.organizer?.message}
                  {...register('organizer', { required: 'Organizer is required' })} />
              </div>
            </Card>

            {/* Schedule */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} color="#34d399" />
                </div>
                <div>
                  <CardTitle>Schedule & Timeline</CardTitle>
                  <CardSubtitle>Key dates for the hackathon</CardSubtitle>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Input id="edit-reg" label="Registration Deadline *" type="datetime-local"
                  error={errors.registrationDeadline?.message}
                  {...register('registrationDeadline', { required: 'Required' })} />
                <Input id="edit-start" label="Hackathon Start *" type="datetime-local"
                  error={errors.startDate?.message}
                  {...register('startDate', { required: 'Required' })} />
                <Input id="edit-end" label="Hackathon End *" type="datetime-local"
                  error={errors.endDate?.message}
                  {...register('endDate', { required: 'Required' })} />
              </div>
            </Card>

            {/* Teams & Prize */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(251,191,36,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={18} color="#fbbf24" />
                </div>
                <div>
                  <CardTitle>Teams & Prizes</CardTitle>
                  <CardSubtitle>Team configuration and reward structure</CardSubtitle>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 16 }}>
                <Input id="edit-min" label="Min Team" type="number" {...register('minTeamSize')} />
                <Input id="edit-max" label="Max Team" type="number" {...register('maxTeamSize')} />
                <Input id="edit-prize1" label="🥇 1st Prize" placeholder="₹2,00,000" {...register('firstPrize')} />
                <Input id="edit-prize2" label="🥈 2nd Prize" placeholder="₹1,00,000" {...register('secondPrize')} />
                <Input id="edit-prize3" label="🥉 3rd Prize" placeholder="₹50,000" {...register('thirdPrize')} />
              </div>
            </Card>

            {/* Tags & Rules */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(99,102,241,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tag size={18} color="#818cf8" />
                </div>
                <div>
                  <CardTitle>Tags & Rules</CardTitle>
                  <CardSubtitle>Help participants discover and understand the event</CardSubtitle>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Input id="edit-tags" label="Tags (comma-separated)" placeholder="AI, ML, Climate, Web3"
                  {...register('tags')} />
                <Textarea id="edit-rules" label="Rules (one per line)" rows={5}
                  {...register('rules')} />
              </div>
            </Card>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 12, paddingBottom: 8 }}>
              <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={14} />} size="lg">
                Save Changes
              </Button>
              <Button variant="secondary" type="button" size="lg" onClick={() => router.push('/manager/hackathons')}>
                Discard
              </Button>
            </div>

          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}
