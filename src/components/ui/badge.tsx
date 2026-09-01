import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'accent' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-wide uppercase',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3.5 py-1.5 font-medium',
  };

  const variantClasses = {
    default: 'bg-brand-500 text-white border-transparent',
    secondary: 'bg-editorial-surfaceAlt text-editorial-text border-editorial-border',
    outline: 'bg-transparent text-editorial-text border-editorial-borderStrong border',
    accent: 'bg-amber-100 text-amber-900 border-amber-300 border',
    subtle: 'bg-editorial-card text-editorial-muted border-editorial-border border shadow-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border transition-colors select-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
