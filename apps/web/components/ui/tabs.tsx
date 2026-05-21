'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

const Tabs: React.FC<TabsProps> = ({ defaultValue, value, onValueChange, children, className }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const resolvedValue = value ?? internalValue;

  return (
    <TabsContext.Provider
      value={{ value: resolvedValue, onValueChange: onValueChange ?? setInternalValue }}
    >
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-lg bg-dock-bg p-1 text-dock-muted',
      className
    )}
    {...props}
  />
);

const TabsTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }> = ({
  className,
  value,
  ...props
}) => {
  const { value: selectedValue, onValueChange } = useTabs();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        isSelected ? 'bg-dock-surface text-white shadow' : 'hover:text-white',
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    />
  );
};

const TabsContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({
  className,
  value,
  ...props
}) => {
  const { value: selectedValue } = useTabs();
  if (selectedValue !== value) return null;

  return <div className={cn('mt-4', className)} {...props} />;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
