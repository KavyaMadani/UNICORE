'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { MOCK_ANNOUNCEMENTS, MOCK_HACKATHONS } from '@/lib/mock-data';
import { Megaphone, Plus, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface AnnouncementForm {
  hackathonId: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  info: <Info size={14} className="text-blue-400" />,
  warning: <AlertTriangle size={14} className="text-amber-400" />,
  success: <CheckCircle size={14} className="text-emerald-400" />,
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<AnnouncementForm>({
    defaultValues: { type: 'info' }
  });

  const onSubmit = async (data: AnnouncementForm) => {
    await new Promise(r => setTimeout(r, 800));
    const newAnn = {
      id: `ann_${Date.now()}`,
      hackathonId: data.hackathonId,
      title: data.title,
      content: data.content,
      type: data.type as 'info' | 'warning' | 'success',
      createdAt: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    reset();
    setShowForm(false);
  };

  return (
    <DashboardLayout
      title="Announcements"
      subtitle="Communicate with your participants"
      actions={
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowForm(!showForm)}>
          New Announcement
        </Button>
      }
    >
      {/* New announcement form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card>
            <CardTitle className="mb-5">New Announcement</CardTitle>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <Select id="ann-hackathon" label="Hackathon"
                  options={MOCK_HACKATHONS.map(h => ({ value: h.id, label: h.title }))}
                  {...register('hackathonId')} />
                <Select id="ann-type" label="Type"
                  options={[
                    { value: 'info', label: '📢 Info' },
                    { value: 'warning', label: '⚠️ Warning' },
                    { value: 'success', label: '✅ Success' },
                  ]}
                  {...register('type')} />
              </div>
              <Input id="ann-title" label="Title" placeholder="Announcement title..." {...register('title', { required: true })} />
              <Textarea id="ann-content" label="Message" placeholder="Write your announcement here..." rows={4} {...register('content', { required: true })} />
              <div className="flex gap-3">
                <Button type="submit" isLoading={isSubmitting}>Publish</Button>
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Announcements list */}
      <div className="space-y-4">
        {announcements.map((ann, i) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 rounded-xl"
            style={{
              background: ann.type === 'warning' ? 'rgba(251,191,36,0.04)' : ann.type === 'success' ? 'rgba(16,185,129,0.04)' : 'rgba(99,102,241,0.04)',
              border: `1px solid ${ann.type === 'warning' ? 'rgba(251,191,36,0.15)' : ann.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)'}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{TYPE_ICONS[ann.type]}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-200">{ann.title}</h3>
                  <Badge variant={ann.type === 'warning' ? 'draft' : ann.type === 'success' ? 'active' : 'upcoming'} className="text-[10px]">
                    {ann.type}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">{ann.content}</p>
                <p className="text-[10px] text-slate-600">{new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
