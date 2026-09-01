import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'pinterest';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = 'primary', size = 'md', fullWidth = false, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs font-medium rounded-md gap-1.5',
      md: 'px-5 py-2.5 text-sm font-semibold rounded-lg gap-2',
      lg: 'px-7 py-3 text-base font-semibold rounded-lg gap-2.5',
    };

    const variantClasses = {
      primary:
        'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow active:scale-[0.99] border border-transparent',
      secondary:
        'bg-editorial-surfaceAlt hover:bg-editorial-border text-editorial-text border border-editorial-border',
      outline:
        'bg-transparent hover:bg-editorial-surfaceAlt text-editorial-text border border-editorial-borderStrong',
      ghost:
        'bg-transparent hover:bg-editorial-surfaceAlt text-editorial-text border-transparent',
      pinterest:
        'bg-[#E60023] hover:bg-[#ad081b] text-white shadow-sm hover:shadow active:scale-[0.99]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
