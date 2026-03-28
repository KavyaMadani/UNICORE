'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import {
  getManagerHackathons, getAnnouncements, createAnnouncement,
  type Hackathon, type Announcement,
} from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { Megaphone, Plus, Info, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface AnnouncementForm {
  hackathon_id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  info:    <Info size={14} className="text-blue-400" />,
  warning: <AlertTriangle size={14} className="text-amber-400" />,
  success: <CheckCircle size={14} className="text-emerald-400" />,
};
const TYPE_COLORS = {
  info:    { bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.2)', title: '#a5b4fc' },
  warning: { bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)', title: '#fde68a' },
  success: { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.2)', title: '#6ee7b7' },
};

export default function AnnouncementsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AnnouncementForm>({ defaultValues: { type: 'info' } });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (uid) {
        const hacks = await getManagerHackathons(uid);
        setHackathons(hacks);
        const anns = await getAnnouncements();
        const hackIds = new Set(hacks.map(h => h.id));
        setAnnouncements(anns.filter(a => hackIds.has(a.hackathon_id)));
      }
      setLoading(false);
    })();
  }, []);

  const onSubmit = async (data: AnnouncementForm) => {
    setCreating(true);
    const { error } = await createAnnouncement(data);
    if (!error) {
      const updated = await getAnnouncements(data.hackathon_id);
      setAnnouncements(prev => [...updated.filter(a => !prev.find(p => p.id === a.id)), ...prev]);
      setToast('Announcement published!');
      setTimeout(() => setToast(null), 3000);
      reset();
      setShowForm(false);
    }
    setCreating(false);
  };

  return (
    <DashboardLayout
      title="Announcements"
      subtitle="Send important updates to participants"
      actions={
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : 'New Announcement'}
        </Button>
      }
    >
      {toast && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '11px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)' }}>
          <CheckCircle size={14} /> {toast}
        </motion.div>
      )}

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ marginBottom: 28 }}>
            <Card>
              <CardTitle style={{ marginBottom: 6 }}>New Announcement</CardTitle>
              <CardSubtitle style={{ marginBottom: 22 }}>Visible to all registered participants</CardSubtitle>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Select id="ann-hack" label="Hackathon *" error={errors.hackathon_id?.message}
                  options={hackathons.map(h => ({ value: h.id, label: h.title }))}
                  {...register('hackathon_id', { required: 'Select a hackathon' })} />
                <Select id="ann-type" label="Type" options={[{ value: 'info', label: 'ℹ️ Info' }, { value: 'warning', label: '⚠️ Warning' }, { value: 'success', label: '✅ Success' }]}
                  {...register('type')} />
                <Input id="ann-title" label="Title *" placeholder="Announcement title" error={errors.title?.message} {...register('title', { required: 'Required' })} />
                <Textarea id="ann-content" label="Message" rows={4} placeholder="Details for participants…" {...register('content')} />
                <Button type="submit" isLoading={creating} leftIcon={<Megaphone size={14} />}>Publish Announcement</Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, gap: 12, color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading announcements…
        </div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Megaphone size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No announcements yet</p>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Send your first update to participants.</p>
          <Button leftIcon={<Plus size={14} />} onClick={() => setShowForm(true)}>Create Announcement</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {announcements.map((ann, i) => {
            const col = TYPE_COLORS[ann.type] ?? TYPE_COLORS.info;
            return (
              <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <div style={{ padding: '20px 24px', borderRadius: 18, background: col.bg, border: `1px solid ${col.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    {TYPE_ICONS[ann.type]}
                    <p style={{ fontSize: 15, fontWeight: 700, color: col.title }}>{ann.title}</p>
                  </div>
                  {ann.content && <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{ann.content}</p>}
                  <p style={{ fontSize: 11, color: '#475569', marginTop: 10 }}>
                    {new Date(ann.created_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
