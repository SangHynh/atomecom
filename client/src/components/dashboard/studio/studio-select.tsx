'use client';

import * as React from 'react';
import { Select } from '@/components/ui/select';
import { StudioField } from '@/components/dashboard/studio/studio-field';

interface StudioSelectProps extends React.ComponentProps<typeof Select> {
  label?: string;
  hint?: string;
  children?: React.ReactNode;
}

export function StudioSelect({
  label,
  hint,
  children,
  ...props
}: StudioSelectProps) {
  const content = <Select {...props}>{children}</Select>;

  if (label) {
    return (
      <StudioField label={label} hint={hint}>
        {content}
      </StudioField>
    );
  }

  if (hint) {
    return (
      <div className="flex flex-col gap-2 font-sans">
        {content}
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
    );
  }

  return content;
}



