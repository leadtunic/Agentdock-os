'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

function useSelect() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
}

const Select: React.FC<SelectProps & { className?: string }> = ({ value, defaultValue, onValueChange, children, className }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? value ?? '');
  const [open, setOpen] = React.useState(false);
  const resolvedValue = value ?? internalValue;
  const resolvedOnChange = onValueChange ?? setInternalValue;

  return (
    <SelectContext.Provider value={{ value: resolvedValue, onValueChange: resolvedOnChange, open, setOpen }}>
      <div className={cn('relative inline-block', className)}>{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect();
    return (
      <button
        ref={ref}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-dock-border bg-transparent px-3 py-2 text-sm text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-dock-border disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <svg className="ml-2 h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const { value } = useSelect();
  return <span>{value || placeholder}</span>;
};

const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children }) => {
  const { open } = useSelect();
  if (!open) return null;

  return (
    <div
      className={cn(
        'absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-dock-border bg-dock-surface shadow-md',
        className
      )}
    >
      {children}
    </div>
  );
};

const SelectItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }> = ({
  className,
  value,
  children,
  ...props
}) => {
  const { value: selectedValue, onValueChange, setOpen } = useSelect();
  const isSelected = selectedValue === value;

  return (
    <button
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-sm outline-none hover:bg-dock-border',
        isSelected && 'bg-dock-border',
        className
      )}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
