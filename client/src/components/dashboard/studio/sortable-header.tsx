'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableHeaderProps {
  label: string;
  field?: string;
  currentField?: string;
  currentOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  className?: string;
}

export function SortableHeader({
  label,
  field,
  currentField,
  currentOrder,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = field && currentField === field;
  const canSort = !!field && !!onSort;

  return (
    <div
      onClick={() => canSort && onSort(field)}
      className={cn(
        'flex items-center gap-2 px-4 py-4 text-[10px] font-bold uppercase tracking-wider transition-all select-none group',
        canSort ? 'cursor-pointer' : 'cursor-default',
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground/50 hover:text-foreground/80',
        className,
      )}
    >
      {label}
      {canSort && (
        <div className="flex items-center shrink-0">
          {isActive ? (
            currentOrder === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-primary animate-in fade-in slide-in-from-bottom-1" />
            ) : (
              <ArrowDown className="h-3 w-3 text-primary animate-in fade-in slide-in-from-top-1" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
          )}
        </div>
      )}
    </div>
  );
}
