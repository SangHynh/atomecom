'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-[var(--radius)] border border-primary transition-all focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 accent-primary",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
