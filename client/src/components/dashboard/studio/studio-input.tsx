'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface StudioInputProps extends React.ComponentProps<'input'> {
  mono?: boolean;
}

export function StudioInput({
  className,
  mono = false,
  ...props
}: StudioInputProps) {
  return (
    <Input
      className={cn(
        'h-10 rounded-[var(--radius)] border-border bg-background text-foreground placeholder:text-muted-foreground/40',
        'focus-visible:border-foreground/40 focus-visible:ring-1 focus-visible:ring-foreground/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        mono ? 'font-mono' : 'font-sans',
        className,
      )}
      {...props}
    />
  );
}





