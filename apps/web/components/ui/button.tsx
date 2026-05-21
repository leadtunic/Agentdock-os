import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-dock-border disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-white text-dock-bg shadow hover:bg-neutral-200': variant === 'default',
            'bg-dock-surface text-white shadow-sm hover:bg-dock-border': variant === 'secondary',
            'bg-red-600 text-white shadow-sm hover:bg-red-700': variant === 'destructive',
            'border border-dock-border bg-transparent text-white hover:bg-dock-surface': variant === 'outline',
            'hover:bg-dock-surface text-white': variant === 'ghost',
            'text-white underline-offset-4 hover:underline': variant === 'link',
            'h-9 px-4 py-2': size === 'default',
            'h-8 rounded-md px-3 text-xs': size === 'sm',
            'h-10 rounded-md px-8': size === 'lg',
            'h-9 w-9': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
