'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { Building2, ArrowLeft, CheckCircle, School, Mail, Globe, Users, Save } from 'lucide-react';

interface OrgForm {
  name: string;
  email: string;
  college: string;
  website?: string;
  contactPerson: string;
  contactPhone?: string;
  description?: string;
}

export default function AddOrganizationPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OrgForm>();

  const onSubmit = async (data: OrgForm) => {
    await new Promise(r => setTimeout(r, 1000));
    console.log('New org:', data);
    setSuccess(true);
    setTimeout(() => router.push('/admin/organizations'), 2200);
  };

  if (success) {
    return (
      <DashboardLayout title="Add Organization" subtitle="Register a new organization">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
              background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle size={36} color="#34d399" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Organization Added!</h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>Redirecting back to organizations list…</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Add Organization"
      subtitle="Register a new organization on the platform"
      actions={
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push('/admin/organizations')}>
          Back
        </Button>
      }
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 720, margin: '0 auto' }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Organization Info */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} color="#818cf8" />
                </div>
                <div>
                  <CardTitle>Organization Details</CardTitle>
                  <CardSubtitle>Basic information about the organization</CardSubtitle>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Input
                  id="org-name"
                  label="Organization Name *"
                  placeholder="e.g. IIT Bombay Tech Society"
                  error={errors.name?.message}
                  {...register('name', { required: 'Organization name is required' })}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Input
                    id="org-email"
                    label="Official Email *"
                    type="email"
                    placeholder="e.g. tech@iitb.ac.in"
                    error={errors.email?.message}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Enter a valid email' }
                    })}
                  />
                  <Input
                    id="org-website"
                    label="Website (optional)"
                    placeholder="https://techclub.iitb.ac.in"
                    {...register('website')}
                  />
                </div>
              </div>
            </Card>

            {/* College info */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <School size={20} color="#60a5fa" />
                </div>
                <div>
                  <CardTitle>College / Institution</CardTitle>
                  <CardSubtitle>Which institution does this organization belong to?</CardSubtitle>
                </div>
              </div>
              <Input
                id="org-college"
                label="College / University *"
                placeholder="e.g. IIT Bombay"
                error={errors.college?.message}
                {...register('college', { required: 'College name is required' })}
              />
            </Card>

            {/* Contact */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color="#34d399" />
                </div>
                <div>
                  <CardTitle>Contact Person</CardTitle>
                  <CardSubtitle>Primary point of contact for this organization</CardSubtitle>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input
                  id="org-contact"
                  label="Contact Person Name *"
                  placeholder="e.g. Dr. Ravi Kumar"
                  error={errors.contactPerson?.message}
                  {...register('contactPerson', { required: 'Contact person name is required' })}
                />
                <Input
                  id="org-phone"
                  label="Phone (optional)"
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...register('contactPhone')}
                />
              </div>
            </Card>

            {/* Description */}
            <Card>
              <div style={{ marginBottom: 20 }}>
                <CardTitle>Description (optional)</CardTitle>
                <CardSubtitle>A brief overview of this organization shown to students</CardSubtitle>
              </div>
              <Textarea
                id="org-description"
                label="Description"
                rows={4}
                placeholder="e.g. The premier technology society of IIT Bombay, organizing world-class hackathons and innovation events…"
                {...register('description')}
              />
            </Card>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, paddingBottom: 8 }}>
              <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={14} />} size="lg">
                Register Organization
              </Button>
              <Button variant="secondary" type="button" size="lg" onClick={() => router.push('/admin/organizations')}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}
