'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightElement, id, type, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className="absolute left-0 flex items-center justify-center pointer-events-none"
              style={{ width: '2.75rem', height: '100%', color: '#64748b' }}
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              'input-glass',
              leftIcon && 'has-left-icon',
              rightElement && 'has-right-icon',
              error && 'input-error',
              className
            )}
            {...props}
          />
          {rightElement && (
            <span
              className="absolute right-0 flex items-center justify-center"
              style={{ width: '2.75rem', height: '100%' }}
            >
              {rightElement}
            </span>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs" style={{ color: '#f87171' }}>{error}</p>}
        {hint && !error && <p className="mt-1 text-xs" style={{ color: '#475569' }}>{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ─── Textarea ───────────────────────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id ?? `textarea-${Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'input-glass resize-none',
            error && 'input-error',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs" style={{ color: '#f87171' }}>{error}</p>}
        {hint && !error && <p className="mt-1 text-xs" style={{ color: '#475569' }}>{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

/* ─── Select ─────────────────────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id ?? `select-${Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'input-glass appearance-none cursor-pointer',
            error && 'input-error',
            className
          )}
          style={{ backgroundColor: 'rgba(9,13,25,0.8)' }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ backgroundColor: '#0d1220', color: '#f1f5f9' }}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs" style={{ color: '#f87171' }}>{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
