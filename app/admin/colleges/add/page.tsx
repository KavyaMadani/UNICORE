'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, ArrowLeft, CheckCircle } from 'lucide-react';

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
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CollegeForm>();

  const name = watch('name');
  React.useEffect(() => {
    if (name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [name, setValue]);

  const onSubmit = async (data: CollegeForm) => {
    await new Promise(r => setTimeout(r, 800));
    setSuccess(true);
    setTimeout(() => router.push('/admin/colleges'), 2000);
  };

  if (success) {
    return (
      <DashboardLayout title="Add College">
        <div className="flex flex-col items-center justify-center py-24">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4"
          >
            <CheckCircle size={32} className="text-emerald-400" />
          </motion.div>
          <h2 className="text-xl font-semibold text-slate-200 mb-2">College Added Successfully!</h2>
          <p className="text-slate-500 text-sm">Redirecting to colleges page...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Add College" subtitle="Register a new institution on the platform">
      <div className="max-w-2xl">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/admin/colleges')} className="mb-6">
          Back to Colleges
        </Button>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Building2 size={18} className="text-indigo-400" />
            </div>
            <div>
              <CardTitle>College Information</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">All fields are required unless marked optional</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="college-name"
                label="College Name"
                placeholder="IIT Bombay"
                error={errors.name?.message}
                {...register('name', { required: 'College name is required' })}
              />
              <Input
                id="college-slug"
                label="URL Slug"
                placeholder="iitb"
                error={errors.slug?.message}
                hint="Auto-generated from name"
                {...register('slug', { required: 'Slug is required' })}
              />
            </div>

            <Input
              id="college-domain"
              label="Email Domain"
              placeholder="iitb.ac.in"
              hint="Students with this email domain will be auto-detected"
              error={errors.domain?.message}
              {...register('domain', {
                required: 'Email domain is required',
                pattern: { value: /^[a-z0-9.-]+\.[a-z]{2,}$/, message: 'Invalid domain format' }
              })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="college-city"
                label="City"
                placeholder="Mumbai"
                error={errors.city?.message}
                {...register('city', { required: 'City is required' })}
              />
              <Input
                id="college-state"
                label="State"
                placeholder="Maharashtra"
                error={errors.state?.message}
                {...register('state', { required: 'State is required' })}
              />
            </div>

            <Input
              id="college-website"
              label="Website (optional)"
              placeholder="https://www.iitb.ac.in"
              {...register('website')}
            />

            <div className="flex gap-3 pt-2">
              <Button id="add-college-submit" type="submit" isLoading={isSubmitting}>
                Add College
              </Button>
              <Button variant="secondary" type="button" onClick={() => router.push('/admin/colleges')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
