'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'left' | 'right' | 'bottom';
}

export function Tooltip({
  content,
  children,
  className,
  side = 'top',
}: TooltipProps) {
  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2 origin-left',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-border/40',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-border/40',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-border/40',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-border/40',
  };

  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div
        className={cn(
          'absolute scale-0 transition-all duration-200 group-hover:scale-100 ease-out z-[100]',
          sideClasses[side],
          className,
        )}
      >
        <div className="bg-popover text-popover-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl border border-border/40 backdrop-blur-md whitespace-nowrap">
          {content}
          <div
            className={cn(
              'absolute border-8 border-transparent',
              arrowClasses[side],
            )}
          />
        </div>
      </div>
    </div>
  );
}
