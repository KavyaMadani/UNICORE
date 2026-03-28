'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { Building2, ArrowLeft, CheckCircle, Save, User, Mail, Globe, School } from 'lucide-react';

interface AddManagerForm {
  name: string;
  email: string;
  college: string;
  phone?: string;
  designation?: string;
  note?: string;
}

export default function AddManagerPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddManagerForm>();

  const onSubmit = async (data: AddManagerForm) => {
    await new Promise(r => setTimeout(r, 1000));
    console.log('Adding manager:', data);
    setSuccess(true);
    setTimeout(() => router.push('/organization/managers'), 2000);
  };

  if (success) {
    return (
      <DashboardLayout title="Add Manager" subtitle="Invite a new event manager">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
              background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle size={36} color="#34d399" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Manager Added!</h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>Invitation sent. Redirecting you back…</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Add Manager"
      subtitle="Invite a new event manager to your organization"
      actions={
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/organization/managers')}>
          Back
        </Button>
      }
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 680, margin: '0 auto' }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Personal details */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} color="#818cf8" />
                </div>
                <div>
                  <CardTitle>Manager Details</CardTitle>
                  <CardSubtitle>Basic information about the event manager</CardSubtitle>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Input id="mgr-name" label="Full Name *" placeholder="e.g. Rahul Kumar"
                  error={errors.name?.message}
                  {...register('name', { required: 'Full name is required' })} />
                <Input id="mgr-email" label="Email Address *" type="email" placeholder="e.g. rahul@college.ac.in"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Enter a valid email' }
                  })} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Input id="mgr-phone" label="Phone (optional)" type="tel" placeholder="+91 98765 43210"
                    {...register('phone')} />
                  <Input id="mgr-designation" label="Designation (optional)" placeholder="e.g. Hackathon Coordinator"
                    {...register('designation')} />
                </div>
              </div>
            </Card>

            {/* College info */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <School size={18} color="#60a5fa" />
                </div>
                <div>
                  <CardTitle>College & Role</CardTitle>
                  <CardSubtitle>Where does this manager operate from?</CardSubtitle>
                </div>
              </div>
              <Input id="mgr-college" label="College / Institution *" placeholder="e.g. IIT Bombay"
                error={errors.college?.message}
                {...register('college', { required: 'College is required' })} />
            </Card>

            {/* Optional note */}
            <Card>
              <div style={{ marginBottom: 20 }}>
                <CardTitle>Additional Notes</CardTitle>
                <CardSubtitle>Any extra context for this invitation (optional)</CardSubtitle>
              </div>
              <Textarea id="mgr-note" label="Note" rows={3}
                placeholder="e.g. Main POC for IIT Bombay events…"
                {...register('note')} />
            </Card>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={14} />} size="lg">
                Send Invitation
              </Button>
              <Button variant="secondary" type="button" size="lg" onClick={() => router.push('/organization/managers')}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}
