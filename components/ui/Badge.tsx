'use client';
import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'active' | 'upcoming' | 'ended' | 'draft' | 'info' | 'warning' | 'success' | 'error';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({ variant = 'default', size = 'sm', dot, className, children, ...props }: BadgeProps) {
  const variantClass = variant !== 'default'
    ? getStatusColor(variant)
    : 'bg-slate-500/15 text-slate-400 border border-slate-500/20';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' && 'text-xs px-2.5 py-0.5',
        size === 'md' && 'text-sm px-3 py-1',
        variantClass,
        className
      )}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
}

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {}
export function Tag({ className, children, ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg text-xs px-2.5 py-1 font-medium',
        'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name = '?', src, size = 'md', className }: AvatarProps) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  const sizeClass = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover ring-2 ring-indigo-500/30', sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold',
        'bg-gradient-to-br from-indigo-500 to-blue-500 text-white',
        'ring-2 ring-indigo-500/30',
        sizeClass,
        className
      )}
    >
      {initials}
    </div>
  );
}

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function Progress({ value, max = 100, label, showValue, className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showValue && <span className="text-xs font-medium text-slate-300">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}
export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn('skeleton', className)} {...props} />;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && (
        <div className="mb-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
