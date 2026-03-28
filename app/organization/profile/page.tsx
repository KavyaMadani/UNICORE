'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthProvider';
import { Building2, CheckCircle, Save } from 'lucide-react';

interface ProfileForm {
  orgName: string;
  email: string;
  website?: string;
  contactName: string;
  description: string;
}

export default function OrgProfilePage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileForm>({
    defaultValues: {
      orgName: 'IIT Bombay Tech Society',
      email: user?.email ?? '',
      contactName: user?.name ?? '',
      description: 'The premier technology society of IIT Bombay, organizing world-class hackathons and innovation events.',
    }
  });

  const onSubmit = async () => {
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout title="Organization Profile" subtitle="Manage your organization settings">
      <div className="max-w-2xl">
        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-sm text-emerald-400">Profile updated successfully!</span>
          </motion.div>
        )}

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Building2 size={18} className="text-blue-400" />
            </div>
            <div>
              <CardTitle>Organization Details</CardTitle>
              <CardSubtitle>This information is shown to students and event participants</CardSubtitle>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input id="org-name" label="Organization Name" {...register('orgName', { required: true })} />
            <Input id="org-email" label="Contact Email" type="email" {...register('email', { required: true })} />
            <Input id="org-contact" label="Contact Person" {...register('contactName', { required: true })} />
            <Input id="org-website" label="Website (optional)" placeholder="https://yourorg.com" {...register('website')} />
            <Textarea id="org-desc" label="Description" rows={4}
              placeholder="Write about your organization..."
              {...register('description')} />
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
              Save Changes
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
