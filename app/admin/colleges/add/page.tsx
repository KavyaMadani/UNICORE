'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CollegeForm {
  name: string;
  domain: string;
  city: string;
  state: string;
  website?: string;
  slug: string;
}

export default function AddCollegePage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CollegeForm>();

  const name = watch('name');
  React.useEffect(() => {
    if (name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [name, setValue]);

  const onSubmit = async (data: CollegeForm) => {
    setSubmitError(null);
    const { error } = await supabase.from('colleges').insert([{
      name: data.name,
      slug: data.slug,
      domain: data.domain,
      city: data.city,
      state: data.state,
      website: data.website || null,
    }]);
    if (error) { setSubmitError(error.message); return; }
    setSuccess(true);
    setTimeout(() => router.push('/admin/colleges'), 2000);
  };

  if (success) {
    return (
      <DashboardLayout title="Add College" subtitle="">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '96px 0' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <CheckCircle size={32} style={{ color: '#34d399' }} />
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>College Added!</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>Redirecting back to colleges list…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Add College"
      subtitle="Register a new college or institution"
      actions={<Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/admin/colleges')}>Back</Button>}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 560 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="#818cf8" />
            </div>
            <CardTitle>College Details</CardTitle>
          </div>

          {submitError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20 }}>
              <AlertCircle size={14} color="#f87171" />
              <p style={{ fontSize: 13, color: '#f87171' }}>{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input id="college-name" label="College Name *" placeholder="e.g. Indian Institute of Technology Bombay" error={errors.name?.message} {...register('name', { required: 'College name is required' })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input id="college-city" label="City *" placeholder="e.g. Mumbai" error={errors.city?.message} {...register('city', { required: 'City is required' })} />
              <Input id="college-state" label="State *" placeholder="e.g. Maharashtra" error={errors.state?.message} {...register('state', { required: 'State is required' })} />
            </div>
            <Input id="college-domain" label="Email Domain *" placeholder="e.g. iitb.ac.in" error={errors.domain?.message} {...register('domain', { required: 'Email domain is required' })} />
            <Input id="college-website" label="Website (optional)" placeholder="https://www.iitb.ac.in" {...register('website')} />
            <Input id="college-slug" label="Slug (auto-generated)" placeholder="iit-bombay" {...register('slug', { required: true })} />
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <Button type="submit" isLoading={isSubmitting}>Add College</Button>
              <Button type="button" variant="secondary" onClick={() => router.push('/admin/colleges')}>Cancel</Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
