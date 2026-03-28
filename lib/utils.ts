/**
 * Shared utility functions
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
    if (diff > 0) return days === 0 ? 'Today' : `In ${days} day${days > 1 ? 's' : ''}`;
    return days === 0 ? 'Today' : `${days} day${days > 1 ? 's' : ''} ago`;
  } catch {
    return dateStr;
  }
}

export function getTimeRemaining(endDateStr: string): { days: number; hours: number; minutes: number; seconds: number } {
  try {
    const end = new Date(endDateStr).getTime();
    const now = Date.now();
    const remaining = Math.max(0, end - now);
    return {
      days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
      hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((remaining % (1000 * 60)) / 1000),
    };
  } catch {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
}

export function truncate(str: string, maxLength: number): string {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [4, 4, 4].map(() =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  );
  return segments.join('-');
}

export function getInitials(name: string): string {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'badge-active';
    case 'upcoming': return 'badge-upcoming';
    case 'ended': return 'badge-ended';
    case 'draft': return 'badge-draft';
    default: return 'badge-ended';
  }
}
