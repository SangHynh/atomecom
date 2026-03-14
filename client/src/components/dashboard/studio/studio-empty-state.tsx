'use client';

import React from 'react';
import { LucideIcon, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudioEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'table' | 'grid';
}

export function StudioEmptyState({
  icon: Icon = SearchX,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'table',
}: StudioEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="h-20 w-20 bg-muted/5 rounded-[var(--radius)] flex items-center justify-center border border-border/10 mb-8 group-hover:scale-110 transition-transform">
        <Icon className="h-8 w-8 text-muted-foreground/15 group-hover:text-primary/30 transition-colors" />
      </div>
      <h3 className="font-bold text-2xl text-foreground mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wide font-bold max-w-xs leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAction}
          className="mt-8 text-[9px] font-bold uppercase tracking-wide text-muted-foreground/40 hover:text-primary hover:bg-transparent transition-all"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}





