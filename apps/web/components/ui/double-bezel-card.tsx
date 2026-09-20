import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DoubleBezelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  outerClassName?: string;
  innerClassName?: string;
  as?: React.ElementType;
}

export function DoubleBezelCard({
  className,
  outerClassName,
  innerClassName,
  children,
  ...props
}: DoubleBezelCardProps) {
  return (
    <div
      className={cn(
        'relative bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.08] transition-all duration-300 hover:border-white/[0.15]',
        outerClassName,
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative bg-[#111318] p-5 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
