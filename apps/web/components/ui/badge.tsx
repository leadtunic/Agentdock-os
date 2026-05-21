import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'border-transparent bg-white text-dock-bg': variant === 'default',
          'border-transparent bg-dock-border text-white': variant === 'secondary',
          'border-transparent bg-red-600 text-white': variant === 'destructive',
          'border-dock-border text-white': variant === 'outline',
          'border-transparent bg-green-600 text-white': variant === 'success',
          'border-transparent bg-yellow-600 text-dock-bg': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
