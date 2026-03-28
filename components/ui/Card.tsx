'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  gradient?: boolean;
  glow?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ className, hover, gradient, glow, padding = 'lg', children, ...props }: CardProps) {
  const paddingMap = { sm: 'p-4', md: 'p-5', lg: 'p-7' };
  return (
    <div
      className={cn(
        'rounded-2xl glass',
        paddingMap[padding],
        hover && 'glass-hover cursor-pointer',
        gradient && 'bg-gradient-to-br from-indigo-500/5 to-blue-500/5',
        glow && 'pulse-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-6', className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('text-[17px] font-bold text-slate-100 leading-tight tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function CardSubtitle({ className, children, ...props }: CardSubtitleProps) {
  return (
    <p className={cn('text-sm text-slate-500 mt-1.5 leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeDirection?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ label, value, icon, change, changeDirection = 'neutral', className }: StatCardProps) {
  const changeColors = {
    up: { text: '#34d399', bg: 'rgba(16,185,129,0.1)', prefix: '↑ ' },
    down: { text: '#f87171', bg: 'rgba(239,68,68,0.1)', prefix: '↓ ' },
    neutral: { text: '#94a3b8', bg: 'rgba(148,163,184,0.08)', prefix: '' },
  };
  const cc = changeColors[changeDirection];

  return (
    <div
      className={cn('glass rounded-2xl', className)}
      style={{ padding: '24px 22px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ padding: 11, borderRadius: 14, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)' }}>
          {icon}
        </div>
        {change && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, color: cc.text, background: cc.bg }}>
            {cc.prefix}{change}
          </span>
        )}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
    </div>
  );
}
