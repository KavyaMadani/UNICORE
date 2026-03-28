'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Zap, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob w-80 h-80 bg-indigo-600/15 top-1/4 left-1/4" style={{ filter: 'blur(100px)' }} />
        <div className="grid-pattern absolute inset-0 opacity-15" />
      </div>

      <div className="relative z-10 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 20 }}
          className="text-[160px] font-black leading-none gradient-text mb-4">
          404
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl font-bold text-slate-200 mb-3">Page not found</h1>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            The page you&#39;re looking for doesn&#39;t exist or you don&#39;t have permission to access it.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push('/')} leftIcon={<Home size={16} />}>
              Go Home
            </Button>
            <Button variant="secondary" onClick={() => router.back()} leftIcon={<ArrowLeft size={16} />}>
              Go Back
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mt-12 text-slate-600">
          <Zap size={14} />
          <span className="text-sm">HackForge Platform</span>
        </motion.div>
      </div>
    </div>
  );
}
