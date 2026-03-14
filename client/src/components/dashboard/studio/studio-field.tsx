'use client';

import * as React from 'react';

interface StudioFieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function StudioField({
  label,
  hint,
  required = false,
  children,
}: StudioFieldProps) {
  return (
    <div className="flex flex-col gap-2 font-sans">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
          {label}
        </span>
        {required ? (
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/70">
            Required
          </span>
        ) : null}
      </div>
      <div className="w-full">{children}</div>
      {hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}



