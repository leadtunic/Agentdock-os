import * as React from 'react';
import clsx from 'clsx';

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        'rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800',
        props.className
      )}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={clsx('rounded-3xl border border-neutral-800 bg-neutral-950 p-6', className)} />;
}
