'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface StudioTextareaProps extends React.ComponentProps<'textarea'> {}

export function StudioTextarea({
  className,
  ...props
}: StudioTextareaProps) {
  return (
    <Textarea
      className={cn(
        'min-h-[100px] rounded-[var(--radius)] border-border bg-background text-foreground placeholder:text-muted-foreground/40',
        'focus-visible:border-foreground/40 focus-visible:ring-1 focus-visible:ring-foreground/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}





