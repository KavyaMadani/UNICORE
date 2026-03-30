'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { getHackathonById, isRegistered, type Hackathon } from '@/lib/db';
import {
  createSubmission, updateSubmission, hasSubmitted, uploadSubmissionFile,
  TYPE_META, formatFileSize, type FullSubmission, type SubmissionData, type SubmissionType
} from '@/lib/submissions';
import { getUserTeam } from '@/lib/teams';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, CheckCircle, AlertCircle, Loader2, Upload, FileText,
  Globe, GitBranch, Presentation, Film, Package, X, ExternalLink,
  Edit3, Save, Info, Clock, Zap
} from 'lucide-react';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  github:  <GitBranch size={16} />,
  pdf:     <FileText size={16} />,
  ppt:     <Presentation size={16} />,
  website: <Globe size={16} />,
  video:   <Film size={16} />,
  zip:     <Package size={16} />,
};

function UploadZone({
  type, value, onChange, maxSizeMB = 50, disabled
}: {
  type: SubmissionType;
  value: string;
  onChange: (url: string, file?: File) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const meta = TYPE_META[type];

  const handleFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }
    setLocalFile(file);
    onChange('pending', file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (!meta.isFile) {
    return (
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
          {TYPE_ICONS[type]}
        </span>
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={type === 'github' ? 'https://github.com/username/repo' : 'https://your-demo.com'}
          disabled={disabled}
          className="input-glass"
          style={{ paddingLeft: 42, opacity: disabled ? 0.5 : 1 }}
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{
        padding: localFile || value ? '18px 22px' : '32px',
        borderRadius: 16, border: `2px dashed ${dragging ? 'rgba(99,102,241,0.6)' : localFile || value ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.12)'}`,
        background: dragging ? 'rgba(99,102,241,0.05)' : localFile || value ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.01)',
        cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'center', transition: 'all 0.2s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={meta.accept}
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        disabled={disabled}
      />
      {localFile ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckCircle size={20} color="#34d399" />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>{localFile.name}</p>
            <p style={{ fontSize: 11, color: '#475569' }}>{formatFileSize(localFile.size)}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); setLocalFile(null); onChange(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
            <X size={14} />
          </button>
        </div>
      ) : value && value !== 'pending' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle size={18} color="#34d399" />
          <span style={{ fontSize: 13, color: '#34d399', fontWeight: 600, flex: 1, textAlign: 'left' }}>File uploaded</span>
          <span style={{ fontSize: 11, color: '#475569' }}>Click to replace</span>
        </div>
      ) : (
        <>
          <Upload size={28} color="#475569" style={{ margin: '0 auto 10px', display: 'block' }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>Drop {meta.label} here</p>
          <p style={{ fontSize: 11, color: '#475569' }}>or click to browse · Max {maxSizeMB}MB</p>
          <p style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>Accepted: {meta.accept || 'URL'}</p>
        </>
      )}
    </div>
  );
}

export default function SubmitPage() {
  const params = useParams();
  const router = useRouter();
  const hackathonId = params?.id as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ id: string; name: string } | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [existing, setExisting] = useState<FullSubmission | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submissionData, setSubmissionData] = useState<SubmissionData>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Window check: is hackathon active and submission period open?
  const now = new Date();
  const isActive = hackathon?.status === 'active';
  const hasStarted = hackathon?.start_date ? new Date(hackathon.start_date) <= now : true;
  const hasEnded = hackathon?.end_date ? new Date(hackathon.end_date) < now : false;
  const canSubmit = isActive && hasStarted && !hasEnded;

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/signin'); return; }
      const uid = session.user.id;
      setUserId(uid);

      const { data: prof } = await supabase.from('profiles').select('id, name').eq('id', uid).single();
      if (prof) setProfile({ id: prof.id, name: prof.name ?? '' });

      const [h, registered, team, sub] = await Promise.all([
        getHackathonById(hackathonId),
        isRegistered(uid, hackathonId),
        getUserTeam(hackathonId, uid),
        hasSubmitted(uid, hackathonId),
      ]);

      if (!h) { setLoading(false); return; }
      setHackathon(h);

      if (!registered) { router.replace(`/student/hackathons/${hackathonId}`); return; }

      if (team) setTeamName(team.name);

      if (sub) {
        setExisting(sub);
        setProjectTitle(sub.project_title ?? '');
        setDescription(sub.description ?? '');
        setSubmissionData(sub.submission_data ?? {});
      }

      setLoading(false);
    })();
  }, [hackathonId, router]);

  const updateField = (type: string, value: string, file?: File) => {
    setSubmissionData(prev => ({ ...prev, [type]: value }));
    if (file) setPendingFiles(prev => ({ ...prev, [type]: file }));
    else setPendingFiles(prev => { const n = { ...prev }; delete n[type]; return n; });
  };

  const handleSubmit = async () => {
    if (!hackathon || !userId) return;
    if (!projectTitle.trim()) { setError('Please enter your project title.'); return; }

    const types = (hackathon.submission_types ?? []) as SubmissionType[];
    const hasAtLeastOne = types.some(t => submissionData[t] && submissionData[t] !== 'pending');
    const hasPending = types.some(t => submissionData[t] === 'pending');
    if (!hasAtLeastOne && !hasPending) {
      setError(`Please provide at least one submission (${types.map(t => TYPE_META[t]?.label ?? t).join(', ')}).`);
      return;
    }

    setSubmitting(true);
    setError(null);

    // Upload pending files
    const finalData = { ...submissionData };
    for (const [type, file] of Object.entries(pendingFiles)) {
      const { url, error: uploadErr } = await uploadSubmissionFile(userId, hackathonId, file, type);
      if (uploadErr) { setError('Upload failed: ' + uploadErr); setSubmitting(false); return; }
      finalData[type] = url;
    }

    if (isEditing && existing) {
      const { error: updErr } = await updateSubmission(existing.id, {
        project_title: projectTitle.trim(),
        description: description.trim() || undefined,
        submission_data: finalData,
      });
      setSubmitting(false);
      if (updErr) { setError(updErr); return; }
    } else {
      const { error: createErr } = await createSubmission({
        hackathon_id: hackathon.id,
        hackathon_title: hackathon.title,
        user_id: userId,
        team_name: teamName ?? undefined,
        project_title: projectTitle.trim(),
        description: description.trim() || undefined,
        submission_data: finalData,
      });
      setSubmitting(false);
      if (createErr) { setError(createErr); return; }
    }

    setDone(true);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <DashboardLayout title="Submit Project">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, flexDirection: 'column' }}>
          <Loader2 size={32} color="#818cf8" style={{ animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 13, color: '#64748b' }}>Loading hackathon…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!hackathon) {
    return (
      <DashboardLayout title="Submit Project">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ color: '#64748b', marginBottom: 16 }}>Hackathon not found.</p>
          <Button onClick={() => router.push('/student/hackathons')}>Browse Hackathons</Button>
        </div>
      </DashboardLayout>
    );
  }

  /* ── Success screen ── */
  if (done) {
    return (
      <DashboardLayout title={isEditing ? 'Submission Updated!' : 'Submitted!'}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={40} color="#34d399" />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 10 }}>
            {isEditing ? 'Submission Updated! ✨' : 'Project Submitted! 🚀'}
          </h2>
          <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 28 }}>
            <strong style={{ color: '#e2e8f0' }}>{projectTitle}</strong> has been {isEditing ? 'updated' : 'submitted'} for <strong style={{ color: '#e2e8f0' }}>{hackathon.title}</strong>.
            {!isEditing && ' You can edit it until the event ends.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button onClick={() => router.push('/student/submissions')}>View My Submissions</Button>
            <Button variant="secondary" onClick={() => router.push(`/student/hackathons/${hackathonId}`)}>Back to Hackathon</Button>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  const types = (hackathon.submission_types ?? []) as SubmissionType[];
  const showForm = !existing || isEditing;

  return (
    <DashboardLayout
      title={isEditing ? 'Edit Submission' : existing ? 'Your Submission' : 'Submit Project'}
      subtitle={hackathon.title}
      actions={
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}
          onClick={() => router.push(`/student/hackathons/${hackathonId}`)}>
          Back
        </Button>
      }
    >
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Time window banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          {!isActive ? (
            <div style={{ padding: '14px 20px', borderRadius: 14, background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={14} color="#64748b" />
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Submissions are only open when the hackathon is <strong>active</strong>.
                {hackathon.status === 'upcoming' && ' This hackathon hasn\'t started yet.'}
                {hackathon.status === 'ended' && ' This hackathon has ended.'}
              </p>
            </div>
          ) : hasEnded ? (
            <div style={{ padding: '14px 20px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={14} color="#f87171" />
              <p style={{ fontSize: 13, color: '#f87171' }}>Submission deadline has passed. No more edits allowed.</p>
            </div>
          ) : (
            <div style={{ padding: '14px 20px', borderRadius: 14, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={14} color="#34d399" />
                <p style={{ fontSize: 13, color: '#34d399', fontWeight: 600 }}>
                  Submissions open
                  {hackathon.end_date && ` · Closes ${new Date(hackathon.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </p>
              </div>
              {existing && !isEditing && (
                <span style={{ fontSize: 11, color: '#64748b' }}>You can update your submission until the event ends.</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Submission types info */}
        {types.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {types.map(type => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <span style={{ color: '#818cf8', fontSize: 14 }}>{TYPE_META[type]?.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc' }}>{TYPE_META[type]?.label ?? type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Existing submission view (non-edit) */}
        {existing && !isEditing && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '28px 32px', borderRadius: 22, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <CheckCircle size={18} color="#34d399" />
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9' }}>{existing.project_title}</h2>
                </div>
                {existing.team_name && (
                  <p style={{ fontSize: 12, color: '#64748b' }}>Team: <span style={{ color: '#818cf8', fontWeight: 600 }}>{existing.team_name}</span></p>
                )}
                <p style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                  Submitted: {new Date(existing.submitted_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {existing.score != null && (
                  <span style={{ padding: '5px 14px', borderRadius: 99, fontSize: 13, fontWeight: 700, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                    ⭐ {existing.score}/10
                  </span>
                )}
                <span style={{ padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                  background: existing.status === 'approved' ? 'rgba(16,185,129,0.1)' : existing.status === 'disqualified' ? 'rgba(239,68,68,0.1)' : 'rgba(96,165,250,0.1)',
                  color: existing.status === 'approved' ? '#34d399' : existing.status === 'disqualified' ? '#f87171' : '#60a5fa'
                }}>
                  {existing.status === 'submitted' ? '📋 Submitted' : existing.status === 'reviewed' ? '🔍 Under Review' : existing.status === 'approved' ? '✅ Approved' : '❌ Disqualified'}
                </span>
              </div>
            </div>

            {existing.description && (
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>{existing.description}</p>
            )}

            {/* Submission links */}
            {existing.submission_data && Object.keys(existing.submission_data).length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {Object.entries(existing.submission_data).filter(([, v]) => v).map(([type, url]) => (
                  <a key={type} href={url as string} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    <span>{TYPE_META[type as SubmissionType]?.icon}</span>
                    {TYPE_META[type as SubmissionType]?.label ?? type}
                    <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            )}

            {/* Feedback */}
            {existing.feedback && (
              <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>📝 Feedback from Reviewer</p>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{existing.feedback}</p>
              </div>
            )}

            {canSubmit && existing.status !== 'approved' && (
              <Button onClick={() => setIsEditing(true)} leftIcon={<Edit3 size={14} />} variant="secondary">
                Edit Submission
              </Button>
            )}
          </motion.div>
        )}

        {/* Submission Form */}
        {(showForm && canSubmit) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '32px 36px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Project Info */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Project Title *
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                placeholder="What did you build?"
                className="input-glass"
                maxLength={120}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Project Description <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', fontSize: 10 }}>(optional but recommended)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your project, tech stack, what problem it solves…"
                rows={4}
                className="input-glass"
                style={{ resize: 'vertical' }}
                maxLength={1000}
              />
              <p style={{ fontSize: 11, color: '#334155', marginTop: 4, textAlign: 'right' }}>{description.length}/1000</p>
            </div>

            {/* Dynamic submission fields */}
            {types.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Deliverables</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>
                {types.map(type => (
                  <div key={type}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ color: '#818cf8' }}>{TYPE_ICONS[type]}</span>
                      {TYPE_META[type]?.label ?? type}
                      {!TYPE_META[type]?.isFile && (
                        <span style={{ marginLeft: 4, fontSize: 10, color: '#475569', fontWeight: 400 }}>URL</span>
                      )}
                    </label>
                    <UploadZone
                      type={type}
                      value={submissionData[type] ?? ''}
                      onChange={(url, file) => updateField(type, url, file)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Team info */}
            {teamName && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <p style={{ fontSize: 12, color: '#a5b4fc' }}>
                  <strong>👥 Submitting as team:</strong> {teamName}
                </p>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 18px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Note */}
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={13} color="#fbbf24" />
                <p style={{ fontSize: 12, color: '#fbbf24' }}>
                  {isEditing ? 'Editing will replace your current submission.' : 'You can edit your submission until the hackathon ends.'}
                  {' '}Files are stored securely and only visible to the event manager.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              {isEditing && (
                <Button variant="secondary" onClick={() => { setIsEditing(false); setProjectTitle(existing?.project_title ?? ''); setDescription(existing?.description ?? ''); setSubmissionData(existing?.submission_data ?? {}); }}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSubmit} isLoading={submitting} leftIcon={isEditing ? <Save size={14} /> : <Upload size={14} />}
                style={{ flex: 1 }}>
                {submitting ? 'Uploading files…' : isEditing ? 'Update Submission' : 'Submit Project'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Can't submit state */}
        {!canSubmit && !existing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '60px 0' }}>
            <Clock size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              {!isActive ? 'Hackathon is not active yet' : hasEnded ? 'Submission window closed' : 'Not yet open'}
            </p>
            <p style={{ fontSize: 13, color: '#334155' }}>
              {hackathon.start_date && `Starts: ${new Date(hackathon.start_date).toLocaleDateString()}`}
              {hackathon.end_date && ` · Closes: ${new Date(hackathon.end_date).toLocaleDateString()}`}
            </p>
          </motion.div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
