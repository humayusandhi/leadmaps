import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-mono font-medium text-slate-300 tracking-wider uppercase"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full bg-[#111318] border border-white/[0.1] rounded-xl px-4 py-3 text-white',
              'placeholder:text-slate-500 font-sans text-sm outline-none transition-all',
              'focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/40',
              className
            )
          )}
          {...props}
        />
        {error && (
          <p className="text-xs font-sans text-rose-400 font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs font-sans text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
