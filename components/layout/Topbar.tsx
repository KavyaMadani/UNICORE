'use client';
import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header
      className="flex-shrink-0 border-b flex items-center justify-between px-6 lg:px-8"
      style={{
        height: 64,
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(9,13,25,0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: Title */}
      <div className="min-w-0 flex-1 mr-4">
        {title && (
          <h1 className="text-lg font-bold text-white truncate leading-tight">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right: Actions + Notifications */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        <button
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* User avatar (compact) */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-300 leading-tight truncate max-w-[120px]">{user.name}</p>
              <p className="text-[10px] text-slate-600 capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
