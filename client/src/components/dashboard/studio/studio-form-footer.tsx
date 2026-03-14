'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudioFormFooterProps {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  onPrev: () => void;
  onNext?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  nextLabel?: string;
  prevLabel?: string;
  isSubmitStep: boolean;
}

export function StudioFormFooter({
  currentStep,
  totalSteps,
  canGoBack,
  onPrev,
  onNext,
  isLoading,
  submitLabel = 'Cập nhật',
  nextLabel = 'Tiếp theo',
  prevLabel = 'Bản nháp trước',
  isSubmitStep,
}: StudioFormFooterProps) {
  return (
    <div className="h-24 px-10 border-t border-border/10 bg-background flex items-center justify-between shrink-0">
      <Button
        type="button"
        variant="ghost"
        disabled={!canGoBack || isLoading}
        onClick={onPrev}
        className="h-11 px-6 font-bold uppercase tracking-wide text-[10px] gap-3 text-muted-foreground/50 hover:text-foreground hover:bg-transparent transition-all"
      >
        <ChevronLeft className="h-4 w-4" /> {prevLabel}
      </Button>

      <Button
        type={isSubmitStep ? 'submit' : 'button'}
        onClick={!isSubmitStep ? onNext : undefined}
        disabled={isLoading}
        className="h-11 px-8 rounded-[var(--radius)] bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-wide text-[11px] gap-3 shadow-none active:scale-[0.98] transition-all"
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-background" />
        )}
        {!isSubmitStep ? (
          <>
            {nextLabel} <ChevronRight className="h-4 w-4" />
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}





