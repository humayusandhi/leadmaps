import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  withTrailingIcon?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      withTrailingIcon = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-300 active:scale-[0.98] active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none rounded-full cursor-pointer select-none';

    const variants = {
      primary:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]',
      secondary:
        'bg-[#181B22] hover:bg-white/[0.08] text-slate-100 border border-white/[0.1] shadow-inner-bezel',
      outline:
        'bg-transparent hover:bg-white/[0.04] text-slate-200 border border-white/[0.15]',
      ghost:
        'bg-transparent hover:bg-white/[0.05] text-slate-400 hover:text-slate-100',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5',
      md: 'text-sm px-5 py-2.5',
      lg: 'text-base px-6 py-3.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span>{children}</span>
        {withTrailingIcon && (
          <span className="ml-2.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/15 text-current shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
