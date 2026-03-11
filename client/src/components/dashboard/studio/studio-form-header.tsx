'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  icon?: React.ElementType;
}

interface StudioFormHeaderProps {
  steps: Step[];
  currentStep: number;
  version?: string;
  label?: string;
}

export function StudioFormHeader({
  steps,
  currentStep,
  version = 'v1.0',
  label = 'Studio Archive',
}: StudioFormHeaderProps) {
  return (
    <div className="px-10 py-6 border-b border-border/10 bg-muted/5 sticky top-0 z-20 shrink-0">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex gap-12">
          {steps.map((step, idx) => {
            const isActive = currentStep === idx;
            return (
              <div key={step.id} className="flex flex-col gap-2 relative">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-[9px] font-bold font-mono transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground/30',
                    )}
                  >
                    0{idx + 1}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider transition-all',
                      isActive ? 'text-foreground' : 'text-muted-foreground/40',
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute -bottom-6 left-0 right-0 h-[2px] bg-primary" />
                )}
              </div>
            );
          })}
        </div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/20 hidden sm:block">
          {label} · {version}
        </div>
      </div>
    </div>
  );
}
